import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db } from './src/server/db.ts';
import { runAutomatedTests } from './src/server/tests.ts';
import { paymentGateway, notificationGateway, storageService } from './src/server/integrations.ts';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

async function bootstrap() {
  const app = express();

  // JSON Body parsing
  app.use(express.json());

  // ==========================================
  // REST API ROUTE MODULES
  // ==========================================

  // 1. Health check & Platform Info
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'UP',
      service: 'AyuNirvana Delhi NCR Wellness Engine',
      timestamp: new Date().toISOString(),
      database: 'PostgreSQL 16 + PostGIS (Active)',
    });
  });

  // 2. Professionals & Geospatial Search
  app.get('/api/professionals', (req, res) => {
    const { lat, lng, radiusKm, categoryId, searchQuery, minRating, maxPrice, minExperience } = req.query;

    const list = db.searchProfessionals({
      lat: lat ? Number(lat) : undefined,
      lng: lng ? Number(lng) : undefined,
      radiusKm: radiusKm ? Number(radiusKm) : 25,
      categoryId: categoryId as string,
      searchQuery: searchQuery as string,
      minRating: minRating ? Number(minRating) : 0,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      minExperience: minExperience ? Number(minExperience) : 0,
    });

    res.json({
      success: true,
      count: list.length,
      data: list,
    });
  });

  app.get('/api/professionals/:id', (req, res) => {
    const pro = db.getProfessionalById(req.params.id);
    if (!pro) {
      return res.status(404).json({ error: 'Specialist profile not found' });
    }
    res.json({ success: true, data: pro });
  });

  // 3. Dynamic Availability Slots (Collision-Free)
  app.get('/api/professionals/:id/slots', (req, res) => {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: 'Date query parameter (YYYY-MM-DD) is required' });
    }
    const slots = db.getAvailableSlotsForDate(req.params.id, String(date));
    res.json({ success: true, data: slots });
  });

  // 4. Concurrency-Safe Booking Transaction Endpoint
  app.post('/api/bookings', async (req, res) => {
    try {
      const {
        customerId,
        professionalId,
        serviceId,
        date,
        startTime,
        endTime,
        serviceMode,
        address,
        notes,
        paymentMethod,
        idempotencyKey,
      } = req.body;

      if (!customerId || !professionalId || !serviceId || !date || !startTime || !endTime) {
        return res.status(400).json({ error: 'Missing mandatory booking parameters' });
      }

      // Execute concurrency-safe atomic booking transaction
      const booking = db.createBookingAtomic({
        customerId,
        professionalId,
        serviceId,
        date,
        startTime,
        endTime,
        serviceMode: serviceMode || 'HOME_VISIT',
        address,
        notes,
        paymentMethod: paymentMethod || 'UPI',
        idempotencyKey,
      });

      // Trigger notification dispatch
      await notificationGateway.sendBookingSms(
        booking.customerPhone,
        `Your appointment with ${booking.professionalName} for ${booking.date} at ${booking.startTime} is confirmed.`
      );

      res.status(201).json({ success: true, data: booking });
    } catch (err: any) {
      // 409 Conflict if slot is taken simultaneously
      if (err.message.includes('booked by another customer') || err.message.includes('collision') || err.message.includes('in progress')) {
        return res.status(409).json({ code: 'SLOT_COLLISION', error: err.message });
      }
      res.status(400).json({ error: err.message });
    }
  });

  // 5. Booking Actions: Cancel & Reschedule
  app.post('/api/bookings/:id/cancel', (req, res) => {
    try {
      const { actorUserId, reason } = req.body;
      const updated = db.cancelBooking(req.params.id, actorUserId, reason || 'User requested');
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/bookings/:id/reschedule', (req, res) => {
    try {
      const { actorUserId, newDate, newStartTime, newEndTime } = req.body;
      const updated = db.rescheduleBooking(req.params.id, actorUserId, newDate, newStartTime, newEndTime);
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // 6. User Appointments
  app.get('/api/users/:userId/bookings', (req, res) => {
    const list = db.getBookingsByCustomer(req.params.userId);
    res.json({ success: true, count: list.length, data: list });
  });

  // 7. Verified Reviews
  app.get('/api/professionals/:id/reviews', (req, res) => {
    const reviews = db.getReviewsByProfessional(req.params.id);
    res.json({ success: true, count: reviews.length, data: reviews });
  });

  app.post('/api/reviews', (req, res) => {
    try {
      const { bookingId, customerId, rating, comment } = req.body;
      const review = db.createReview({
        bookingId,
        customerId,
        rating: Number(rating),
        comment,
      });
      res.status(201).json({ success: true, data: review });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // 8. Admin Metrics & Automated Concurrency Tests
  app.get('/api/admin/metrics', (req, res) => {
    const metrics = db.getPlatformMetrics();
    res.json({ success: true, data: metrics });
  });

  app.post('/api/admin/tests/run', (req, res) => {
    const results = runAutomatedTests();
    res.json({ success: true, data: results });
  });

  // ==========================================
  // VITE DEV MIDDLEWARE / STATIC SERVING
  // ==========================================
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AyuNirvana Backend Server] Running on http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('[Backend Boot Error]', err);
  process.exit(1);
});
