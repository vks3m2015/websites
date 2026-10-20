import {
  User,
  ProfessionalProfile,
  ProfessionalService,
  AvailabilitySchedule,
  Booking,
  Review,
  ContentReport,
  AuditLog,
  Notification,
  TimeSlot,
  Coordinates,
  BookingStatus,
  PaymentStatus,
} from '../types';
import {
  SEED_USERS,
  SEED_PROFESSIONALS,
  SEED_SERVICES,
  SEED_SCHEDULES,
  SEED_BOOKINGS,
  SEED_REVIEWS,
  SEED_REPORTS,
  SEED_AUDIT_LOGS,
  SEED_NOTIFICATIONS,
} from './seed';
import { calculateDistanceKm } from '../data/locations';

// Configurable Business Rules
export const PLATFORM_CONFIG = {
  platformFeePercent: 10, // 10% platform take-rate
  taxGstPercent: 5,        // 5% GST
  minCancellationNoticeHours: 4, // Customer can cancel up to 4 hrs before
  maxAdvanceBookingDays: 30,
  defaultSlotDurationMinutes: 60,
};

class InMemoryDatabase {
  private users: Map<string, User> = new Map();
  private professionals: Map<string, ProfessionalProfile> = new Map();
  private services: Map<string, ProfessionalService> = new Map();
  private schedules: Map<string, AvailabilitySchedule> = new Map();
  private bookings: Map<string, Booking> = new Map();
  private reviews: Map<string, Review> = new Map();
  private customerFavorites: Map<string, Set<string>> = new Map(); // customerId -> Set<proId>
  private reports: Map<string, ContentReport> = new Map();
  private auditLogs: AuditLog[] = [];
  private notifications: Notification[] = [];
  private idempotencyKeys: Map<string, any> = new Map();

  // Concurrency locks for booking slots: Set of "proId:date:startTime"
  private activeLocks: Set<string> = new Set();

  constructor() {
    this.seed();
  }

  private seed() {
    SEED_USERS.forEach((u) => this.users.set(u.id, { ...u }));
    SEED_PROFESSIONALS.forEach((p) => this.professionals.set(p.id, { ...p }));
    SEED_SERVICES.forEach((s) => this.services.set(s.id, { ...s }));
    SEED_SCHEDULES.forEach((sc) => this.schedules.set(sc.professionalId, { ...sc }));
    SEED_BOOKINGS.forEach((b) => this.bookings.set(b.id, { ...b }));
    SEED_REVIEWS.forEach((r) => this.reviews.set(r.id, { ...r }));
    SEED_REPORTS.forEach((rep) => this.reports.set(rep.id, { ...rep }));
    this.auditLogs = [...SEED_AUDIT_LOGS];
    this.notifications = [...SEED_NOTIFICATIONS];

    // Seed sample favorites for customer 1
    this.customerFavorites.set('usr-cust-1', new Set(['pro-rajeshwar', 'pro-ankit-physio']));
  }

  // --- USER & AUTHENTICATION ---
  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  getUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim()
    );
  }

  createUser(userData: Omit<User, 'id' | 'createdAt' | 'isSuspended'>): User {
    const existing = this.getUserByEmail(userData.email);
    if (existing) {
      throw new Error('A user with this email already exists.');
    }
    const id = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const user: User = {
      ...userData,
      id,
      createdAt: new Date().toISOString(),
      isSuspended: false,
    };
    this.users.set(id, user);

    this.logAudit({
      actorUserId: id,
      actorRole: user.role,
      action: 'USER_REGISTERED',
      entityType: 'USER',
      entityId: id,
      details: `User registered with role ${user.role}`,
    });

    return user;
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  updateUserSuspension(userId: string, isSuspended: boolean, adminUserId: string): User {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found.');
    user.isSuspended = isSuspended;
    this.users.set(userId, user);

    this.logAudit({
      actorUserId: adminUserId,
      actorRole: 'ADMIN',
      action: isSuspended ? 'SUSPEND_USER' : 'REACTIVATE_USER',
      entityType: 'USER',
      entityId: userId,
      details: `User ${user.email} suspension set to ${isSuspended}`,
    });

    return user;
  }

  // --- PROFESSIONALS & SEARCH ---
  getProfessionalById(id: string): ProfessionalProfile | undefined {
    const pro = this.professionals.get(id);
    if (!pro) return undefined;
    const services = Array.from(this.services.values()).filter((s) => s.professionalId === id);
    return { ...pro, services };
  }

  getProfessionalByUserId(userId: string): ProfessionalProfile | undefined {
    return Array.from(this.professionals.values()).find((p) => p.userId === userId);
  }

  getAllProfessionals(): ProfessionalProfile[] {
    return Array.from(this.professionals.values()).map((p) => {
      const services = Array.from(this.services.values()).filter((s) => s.professionalId === p.id);
      return { ...p, services };
    });
  }

  /**
   * Location-based Geospatial Search with Filters
   */
  searchProfessionals(params: {
    lat?: number;
    lng?: number;
    radiusKm?: number;
    categoryId?: string;
    searchQuery?: string;
    minRating?: number;
    maxPrice?: number;
    minExperience?: number;
    verificationStatus?: string;
  }): (ProfessionalProfile & { distanceKm?: number })[] {
    const {
      lat,
      lng,
      radiusKm = 25,
      categoryId,
      searchQuery,
      minRating = 0,
      maxPrice,
      minExperience = 0,
      verificationStatus = 'VERIFIED',
    } = params;

    let list = Array.from(this.professionals.values());

    // Filter verification status (Public search only returns VERIFIED by default)
    if (verificationStatus) {
      list = list.filter((p) => p.verificationStatus === verificationStatus);
    }

    // Attach services
    let enriched = list.map((p) => {
      const proServices = Array.from(this.services.values()).filter((s) => s.professionalId === p.id);
      let distanceKm: number | undefined = undefined;

      if (lat !== undefined && lng !== undefined) {
        distanceKm = calculateDistanceKm(lat, lng, p.coordinates.latitude, p.coordinates.longitude);
      }

      return {
        ...p,
        services: proServices,
        distanceKm,
      };
    });

    // Distance filter
    if (lat !== undefined && lng !== undefined && radiusKm > 0) {
      enriched = enriched.filter((p) => (p.distanceKm ?? 0) <= radiusKm);
    }

    // Category filter
    if (categoryId) {
      enriched = enriched.filter((p) =>
        p.services?.some((s) => s.categoryId === categoryId)
      );
    }

    // Text Search query (name, title, bio, areas, service name)
    if (searchQuery && searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      enriched = enriched.filter(
        (p) =>
          p.fullName.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          p.bio.toLowerCase().includes(q) ||
          p.primaryArea.toLowerCase().includes(q) ||
          p.serviceAreas.some((a) => a.toLowerCase().includes(q)) ||
          p.services?.some((s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q))
      );
    }

    // Rating filter
    if (minRating > 0) {
      enriched = enriched.filter((p) => p.rating >= minRating);
    }

    // Experience filter
    if (minExperience > 0) {
      enriched = enriched.filter((p) => p.yearsExperience >= minExperience);
    }

    // Max price filter
    if (maxPrice && maxPrice > 0) {
      enriched = enriched.filter((p) => p.startingPrice <= maxPrice);
    }

    // Sort: if distance available sort by distance, then rating
    enriched.sort((a, b) => {
      if (a.distanceKm !== undefined && b.distanceKm !== undefined) {
        return a.distanceKm - b.distanceKm;
      }
      return b.rating - a.rating;
    });

    return enriched;
  }

  createProfessionalProfile(
    profileData: Omit<ProfessionalProfile, 'id' | 'rating' | 'reviewCount' | 'createdAt' | 'startingPrice'>,
    servicesList: Omit<ProfessionalService, 'id' | 'professionalId'>[]
  ): ProfessionalProfile {
    const id = `pro-${Date.now()}`;
    const startingPrice = servicesList.length > 0
      ? Math.min(...servicesList.map((s) => s.price))
      : 1000;

    const pro: ProfessionalProfile = {
      ...profileData,
      id,
      rating: 5.0,
      reviewCount: 0,
      startingPrice,
      createdAt: new Date().toISOString(),
      services: [],
    };

    this.professionals.set(id, pro);

    // Save services
    servicesList.forEach((s) => {
      const srvId = `srv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const srv: ProfessionalService = {
        ...s,
        id: srvId,
        professionalId: id,
      };
      this.services.set(srvId, srv);
    });

    // Default availability
    const schedule: AvailabilitySchedule = {
      professionalId: id,
      slotDurationMinutes: 60,
      blockedDates: [],
      weeklySchedule: [1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({
        dayOfWeek,
        dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek],
        isOpen: true,
        timeSlots: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }],
      })),
    };
    this.schedules.set(id, schedule);

    this.logAudit({
      actorUserId: profileData.userId,
      actorRole: 'PROFESSIONAL',
      action: 'REGISTER_PROFESSIONAL',
      entityType: 'PROFESSIONAL',
      entityId: id,
      details: `New professional registration submitted by ${profileData.fullName}`,
    });

    return this.getProfessionalById(id)!;
  }

  updateProfessionalVerification(
    proId: string,
    status: ProfessionalProfile['verificationStatus'],
    notes: string,
    adminUserId: string
  ): ProfessionalProfile {
    const pro = this.professionals.get(proId);
    if (!pro) throw new Error('Professional not found.');
    pro.verificationStatus = status;
    pro.verificationNotes = notes;
    this.professionals.set(proId, pro);

    this.logAudit({
      actorUserId: adminUserId,
      actorRole: 'ADMIN',
      action: 'UPDATE_VERIFICATION',
      entityType: 'PROFESSIONAL',
      entityId: proId,
      details: `Verification status changed to ${status}. Notes: ${notes}`,
    });

    // Send notification to professional
    this.createNotification({
      userId: pro.userId,
      title: `Verification Status: ${status}`,
      message: `Your professional profile verification status has been updated to ${status}. ${notes}`,
      type: 'VERIFICATION',
      actionLink: '/pro-dashboard',
    });

    return this.getProfessionalById(proId)!;
  }

  // --- AVAILABILITY & SLOTS ---
  getSchedule(professionalId: string): AvailabilitySchedule | undefined {
    return this.schedules.get(professionalId);
  }

  updateSchedule(professionalId: string, schedule: AvailabilitySchedule): AvailabilitySchedule {
    this.schedules.set(professionalId, schedule);
    return schedule;
  }

  /**
   * Generates dynamic available time slots for a specific date,
   * subtracting existing non-cancelled bookings.
   */
  getAvailableSlotsForDate(professionalId: string, dateStr: string): TimeSlot[] {
    const schedule = this.schedules.get(professionalId);
    if (!schedule) {
      // Return default 9 to 18 slots
      return this.generateDefaultSlots(professionalId, dateStr);
    }

    // Check if date is blocked
    if (schedule.blockedDates.includes(dateStr)) {
      return [];
    }

    const dateObj = new Date(dateStr);
    const dayOfWeek = dateObj.getDay(); // 0-6
    const daySchedule = schedule.weeklySchedule.find((d) => d.dayOfWeek === dayOfWeek);

    if (!daySchedule || !daySchedule.isOpen || daySchedule.timeSlots.length === 0) {
      return [];
    }

    // Fetch active bookings for this professional on this date
    const existingBookings = Array.from(this.bookings.values()).filter(
      (b) =>
        b.professionalId === professionalId &&
        b.date === dateStr &&
        !['CANCELLED_BY_CUSTOMER', 'CANCELLED_BY_PROFESSIONAL', 'REJECTED'].includes(b.status)
    );

    const slots: TimeSlot[] = [];
    const slotDuration = schedule.slotDurationMinutes || 60;

    daySchedule.timeSlots.forEach((range) => {
      let currentHour = parseInt(range.start.split(':')[0], 10);
      let currentMin = parseInt(range.start.split(':')[1] || '0', 10);
      const endHour = parseInt(range.end.split(':')[0], 10);
      const endMin = parseInt(range.end.split(':')[1] || '0', 10);

      while (
        currentHour < endHour ||
        (currentHour === endHour && currentMin + slotDuration <= endMin)
      ) {
        const slotStart = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
        
        let nextMin = currentMin + slotDuration;
        let nextHour = currentHour + Math.floor(nextMin / 60);
        nextMin = nextMin % 60;
        
        const slotEnd = `${String(nextHour).padStart(2, '0')}:${String(nextMin).padStart(2, '0')}`;

        // Check collision with existing active bookings
        const collidingBooking = existingBookings.find((b) => {
          return b.startTime < slotEnd && b.endTime > slotStart;
        });

        slots.push({
          date: dateStr,
          startTime: slotStart,
          endTime: slotEnd,
          isAvailable: !collidingBooking,
          bookedBookingId: collidingBooking?.id,
        });

        currentHour = nextHour;
        currentMin = nextMin;
      }
    });

    return slots;
  }

  private generateDefaultSlots(professionalId: string, dateStr: string): TimeSlot[] {
    const existingBookings = Array.from(this.bookings.values()).filter(
      (b) =>
        b.professionalId === professionalId &&
        b.date === dateStr &&
        !['CANCELLED_BY_CUSTOMER', 'CANCELLED_BY_PROFESSIONAL', 'REJECTED'].includes(b.status)
    );

    const defaultHours = [9, 10, 11, 12, 14, 15, 16, 17, 18];
    return defaultHours.map((h) => {
      const slotStart = `${String(h).padStart(2, '0')}:00`;
      const slotEnd = `${String(h + 1).padStart(2, '0')}:00`;
      const isBooked = existingBookings.some((b) => b.startTime < slotEnd && b.endTime > slotStart);
      return {
        date: dateStr,
        startTime: slotStart,
        endTime: slotEnd,
        isAvailable: !isBooked,
      };
    });
  }

  // --- BOOKINGS & CONCURRENCY-SAFE TRANSACTION ENGINE ---

  /**
   * Concurrency-safe atomic booking creation.
   * Uses lock token to prevent race conditions when two customers attempt to book simultaneously.
   */
  createBookingAtomic(params: {
    customerId: string;
    professionalId: string;
    serviceId: string;
    date: string;
    startTime: string;
    endTime: string;
    serviceMode: 'HOME_VISIT' | 'PROFESSIONAL_STUDIO';
    address?: string;
    notes?: string;
    paymentMethod: string;
    idempotencyKey?: string;
  }): Booking {
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
    } = params;

    // Check idempotency if key provided
    if (idempotencyKey && this.idempotencyKeys.has(idempotencyKey)) {
      return this.idempotencyKeys.get(idempotencyKey);
    }

    // 1. Acquire mutex lock for this professional + slot
    const lockKey = `${professionalId}:${date}:${startTime}`;
    if (this.activeLocks.has(lockKey)) {
      throw new Error('A booking transaction is currently in progress for this time slot. Please try again.');
    }
    this.activeLocks.add(lockKey);

    try {
      // 2. Validate Professional & Service
      const pro = this.professionals.get(professionalId);
      if (!pro) throw new Error('Professional not found.');
      if (pro.verificationStatus !== 'VERIFIED') {
        throw new Error('Professional is currently not verified to accept bookings.');
      }

      const service = this.services.get(serviceId);
      if (!service || service.professionalId !== professionalId) {
        throw new Error('Selected service is not available for this professional.');
      }

      const customer = this.users.get(customerId);
      if (!customer) throw new Error('Customer account not found.');

      // Prevent professional from booking their own service
      if (pro.userId === customerId) {
        throw new Error('Professionals cannot book their own services.');
      }

      // 3. Collision Check: Ensure no other active booking collides
      const existingCollision = Array.from(this.bookings.values()).find(
        (b) =>
          b.professionalId === professionalId &&
          b.date === date &&
          !['CANCELLED_BY_CUSTOMER', 'CANCELLED_BY_PROFESSIONAL', 'REJECTED'].includes(b.status) &&
          b.startTime < endTime &&
          b.endTime > startTime
      );

      if (existingCollision) {
        throw new Error('The selected time slot was just booked by another customer. Please choose another time.');
      }

      // 4. Calculate pricing & taxes
      const basePrice = service.price;
      const platformFee = Math.round((basePrice * PLATFORM_CONFIG.platformFeePercent) / 100);
      const taxAmount = Math.round((basePrice * PLATFORM_CONFIG.taxGstPercent) / 100);
      const totalAmount = basePrice + taxAmount;

      const bookingId = `bk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const paymentTxnId = `pay-${Date.now()}`;

      const booking: Booking = {
        id: bookingId,
        customerId,
        customerName: customer.fullName,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        professionalId,
        professionalName: pro.fullName,
        professionalAvatar: pro.avatarUrl,
        professionalArea: pro.primaryArea,
        serviceId,
        serviceName: service.name,
        serviceDuration: service.durationMinutes,
        date,
        startTime,
        endTime,
        price: basePrice,
        platformFee,
        taxAmount,
        totalAmount,
        status: 'CONFIRMED', // Instant confirmation
        serviceMode,
        address: address || pro.primaryArea,
        notes,
        paymentId: paymentTxnId,
        paymentStatus: 'SUCCESS',
        paymentMethod,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.bookings.set(bookingId, booking);

      // Record idempotency
      if (idempotencyKey) {
        this.idempotencyKeys.set(idempotencyKey, booking);
      }

      // Log audit
      this.logAudit({
        actorUserId: customerId,
        actorRole: 'CUSTOMER',
        action: 'CREATE_BOOKING',
        entityType: 'BOOKING',
        entityId: bookingId,
        details: `Booking created for ${service.name} with ${pro.fullName} on ${date} at ${startTime}`,
      });

      // Send notifications to both Customer and Professional
      this.createNotification({
        userId: customerId,
        title: `Appointment Confirmed!`,
        message: `Your booking for ${service.name} with ${pro.fullName} on ${date} at ${startTime} has been confirmed.`,
        type: 'BOOKING',
        actionLink: '/bookings',
      });

      this.createNotification({
        userId: pro.userId,
        title: `New Appointment: ${customer.fullName}`,
        message: `${customer.fullName} booked ${service.name} for ${date} at ${startTime}.`,
        type: 'BOOKING',
        actionLink: '/pro-dashboard',
      });

      return booking;
    } finally {
      // Release mutex lock
      this.activeLocks.delete(lockKey);
    }
  }

  getBookingById(id: string): Booking | undefined {
    return this.bookings.get(id);
  }

  getBookingsByCustomer(customerId: string): Booking[] {
    return Array.from(this.bookings.values())
      .filter((b) => b.customerId === customerId)
      .sort((a, b) => new Date(b.date + ' ' + b.startTime).getTime() - new Date(a.date + ' ' + a.startTime).getTime());
  }

  getBookingsByProfessional(professionalId: string): Booking[] {
    return Array.from(this.bookings.values())
      .filter((b) => b.professionalId === professionalId)
      .sort((a, b) => new Date(b.date + ' ' + b.startTime).getTime() - new Date(a.date + ' ' + a.startTime).getTime());
  }

  getAllBookings(): Booking[] {
    return Array.from(this.bookings.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  cancelBooking(
    bookingId: string,
    actorUserId: string,
    reason: string
  ): Booking {
    const booking = this.bookings.get(bookingId);
    if (!booking) throw new Error('Booking not found.');

    const user = this.users.get(actorUserId);
    if (!user) throw new Error('User not found.');

    const pro = this.professionals.get(booking.professionalId);

    const isCustomer = booking.customerId === actorUserId;
    const isPro = pro && pro.userId === actorUserId;
    const isAdmin = user.role === 'ADMIN';

    if (!isCustomer && !isPro && !isAdmin) {
      throw new Error('You are not authorized to cancel this booking.');
    }

    if (['COMPLETED', 'CANCELLED_BY_CUSTOMER', 'CANCELLED_BY_PROFESSIONAL', 'REJECTED'].includes(booking.status)) {
      throw new Error(`Cannot cancel a booking that is already ${booking.status}.`);
    }

    // Check cancellation cutoff for customers
    if (isCustomer) {
      const appointmentDateTime = new Date(`${booking.date}T${booking.startTime}:00`);
      const now = new Date();
      const diffHours = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (diffHours < PLATFORM_CONFIG.minCancellationNoticeHours && diffHours > 0) {
        throw new Error(
          `Cancellations must be made at least ${PLATFORM_CONFIG.minCancellationNoticeHours} hours before the appointment time.`
        );
      }
    }

    const newStatus: BookingStatus = isCustomer
      ? 'CANCELLED_BY_CUSTOMER'
      : isPro
      ? 'CANCELLED_BY_PROFESSIONAL'
      : 'CANCELLED_BY_CUSTOMER';

    booking.status = newStatus;
    booking.cancellationReason = reason;
    booking.cancelledAt = new Date().toISOString();
    booking.cancelledBy = isCustomer ? 'CUSTOMER' : isPro ? 'PROFESSIONAL' : 'ADMIN';
    booking.updatedAt = new Date().toISOString();

    this.bookings.set(bookingId, booking);

    this.logAudit({
      actorUserId,
      actorRole: user.role,
      action: 'CANCEL_BOOKING',
      entityType: 'BOOKING',
      entityId: bookingId,
      details: `Booking ${bookingId} cancelled by ${user.role}. Reason: ${reason}`,
    });

    // Notify other party
    const targetUserId = isCustomer ? pro?.userId : booking.customerId;
    if (targetUserId) {
      this.createNotification({
        userId: targetUserId,
        title: 'Appointment Cancelled',
        message: `Appointment for ${booking.serviceName} on ${booking.date} was cancelled. Reason: ${reason}`,
        type: 'BOOKING',
        actionLink: isCustomer ? '/pro-dashboard' : '/bookings',
      });
    }

    return booking;
  }

  rescheduleBooking(
    bookingId: string,
    actorUserId: string,
    newDate: string,
    newStartTime: string,
    newEndTime: string
  ): Booking {
    const booking = this.bookings.get(bookingId);
    if (!booking) throw new Error('Booking not found.');

    const user = this.users.get(actorUserId);
    if (!user) throw new Error('User not found.');

    if (booking.customerId !== actorUserId && user.role !== 'ADMIN') {
      throw new Error('Not authorized to reschedule this appointment.');
    }

    if (booking.status === 'COMPLETED' || booking.status.startsWith('CANCELLED')) {
      throw new Error('Cannot reschedule an inactive or completed appointment.');
    }

    // Check collision for new slot
    const collision = Array.from(this.bookings.values()).find(
      (b) =>
        b.id !== bookingId &&
        b.professionalId === booking.professionalId &&
        b.date === newDate &&
        !['CANCELLED_BY_CUSTOMER', 'CANCELLED_BY_PROFESSIONAL', 'REJECTED'].includes(b.status) &&
        b.startTime < newEndTime &&
        b.endTime > newStartTime
    );

    if (collision) {
      throw new Error('The newly selected time slot is already booked. Please pick another slot.');
    }

    const oldDate = booking.date;
    const oldTime = booking.startTime;

    booking.date = newDate;
    booking.startTime = newStartTime;
    booking.endTime = newEndTime;
    booking.updatedAt = new Date().toISOString();

    this.bookings.set(bookingId, booking);

    this.logAudit({
      actorUserId,
      actorRole: user.role,
      action: 'RESCHEDULE_BOOKING',
      entityType: 'BOOKING',
      entityId: bookingId,
      details: `Rescheduled from ${oldDate} ${oldTime} to ${newDate} ${newStartTime}`,
    });

    const pro = this.professionals.get(booking.professionalId);
    if (pro) {
      this.createNotification({
        userId: pro.userId,
        title: 'Appointment Rescheduled',
        message: `${booking.customerName} rescheduled ${booking.serviceName} to ${newDate} at ${newStartTime}.`,
        type: 'BOOKING',
        actionLink: '/pro-dashboard',
      });
    }

    return booking;
  }

  updateBookingStatus(
    bookingId: string,
    newStatus: BookingStatus,
    actorUserId: string
  ): Booking {
    const booking = this.bookings.get(bookingId);
    if (!booking) throw new Error('Booking not found.');

    booking.status = newStatus;
    booking.updatedAt = new Date().toISOString();
    this.bookings.set(bookingId, booking);

    this.logAudit({
      actorUserId,
      actorRole: 'PROFESSIONAL',
      action: 'UPDATE_BOOKING_STATUS',
      entityType: 'BOOKING',
      entityId: bookingId,
      details: `Status updated to ${newStatus}`,
    });

    this.createNotification({
      userId: booking.customerId,
      title: `Booking Update: ${newStatus}`,
      message: `Your booking with ${booking.professionalName} has been marked as ${newStatus}.`,
      type: 'BOOKING',
      actionLink: '/bookings',
    });

    return booking;
  }

  // --- REVIEWS (COMPLETED BOOKING REQUIRED) ---

  getReviewsByProfessional(professionalId: string): Review[] {
    return Array.from(this.reviews.values())
      .filter((r) => r.professionalId === professionalId && r.isApproved)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  createReview(params: {
    bookingId: string;
    customerId: string;
    rating: number;
    comment: string;
  }): Review {
    const { bookingId, customerId, rating, comment } = params;

    const booking = this.bookings.get(bookingId);
    if (!booking) throw new Error('Booking not found.');

    if (booking.customerId !== customerId) {
      throw new Error('Only the customer who attended the session can submit a review.');
    }

    if (booking.status !== 'COMPLETED') {
      throw new Error('Reviews can only be submitted after the appointment is marked completed.');
    }

    // Check if already reviewed
    const existing = Array.from(this.reviews.values()).find((r) => r.bookingId === bookingId);
    if (existing) {
      throw new Error('A review has already been submitted for this booking.');
    }

    const reviewId = `rev-${Date.now()}`;
    const review: Review = {
      id: reviewId,
      bookingId,
      professionalId: booking.professionalId,
      customerId,
      customerName: booking.customerName,
      rating: Math.max(1, Math.min(5, rating)),
      comment,
      createdAt: new Date().toISOString(),
      isModerated: true,
      isApproved: true,
    };

    this.reviews.set(reviewId, review);

    // Recalculate Professional Rating and Review Count
    const proReviews = Array.from(this.reviews.values()).filter(
      (r) => r.professionalId === booking.professionalId && r.isApproved
    );
    const avgRating =
      proReviews.reduce((acc, curr) => acc + curr.rating, 0) / proReviews.length;

    const pro = this.professionals.get(booking.professionalId);
    if (pro) {
      pro.rating = Math.round(avgRating * 10) / 10;
      pro.reviewCount = proReviews.length;
      this.professionals.set(booking.professionalId, pro);
    }

    this.logAudit({
      actorUserId: customerId,
      actorRole: 'CUSTOMER',
      action: 'SUBMIT_REVIEW',
      entityType: 'REVIEW',
      entityId: reviewId,
      details: `Rating ${rating} stars submitted for pro ${booking.professionalId}`,
    });

    return review;
  }

  getAllReviewsForAdmin(): Review[] {
    return Array.from(this.reviews.values());
  }

  moderateReview(reviewId: string, isApproved: boolean, adminUserId: string): Review {
    const review = this.reviews.get(reviewId);
    if (!review) throw new Error('Review not found.');
    review.isApproved = isApproved;
    review.isModerated = true;
    this.reviews.set(reviewId, review);

    // Recalculate
    const proReviews = Array.from(this.reviews.values()).filter(
      (r) => r.professionalId === review.professionalId && r.isApproved
    );
    const avgRating = proReviews.length > 0
      ? proReviews.reduce((acc, curr) => acc + curr.rating, 0) / proReviews.length
      : 5.0;

    const pro = this.professionals.get(review.professionalId);
    if (pro) {
      pro.rating = Math.round(avgRating * 10) / 10;
      pro.reviewCount = proReviews.length;
      this.professionals.set(review.professionalId, pro);
    }

    return review;
  }

  // --- FAVORITES ---
  toggleFavorite(customerId: string, professionalId: string): boolean {
    let set = this.customerFavorites.get(customerId);
    if (!set) {
      set = new Set();
      this.customerFavorites.set(customerId, set);
    }

    if (set.has(professionalId)) {
      set.delete(professionalId);
      return false; // removed
    } else {
      set.add(professionalId);
      return true; // added
    }
  }

  getCustomerFavorites(customerId: string): ProfessionalProfile[] {
    const set = this.customerFavorites.get(customerId);
    if (!set || set.size === 0) return [];
    return Array.from(set)
      .map((id) => this.getProfessionalById(id))
      .filter((p): p is ProfessionalProfile => p !== undefined);
  }

  // --- REPORTS & MODERATION ---
  createReport(reportData: Omit<ContentReport, 'id' | 'status' | 'createdAt'>): ContentReport {
    const id = `rep-${Date.now()}`;
    const report: ContentReport = {
      ...reportData,
      id,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    this.reports.set(id, report);
    return report;
  }

  getAllReports(): ContentReport[] {
    return Array.from(this.reports.values());
  }

  resolveReport(reportId: string, status: ContentReport['status'], notes: string, adminUserId: string): ContentReport {
    const rep = this.reports.get(reportId);
    if (!rep) throw new Error('Report not found.');
    rep.status = status;
    rep.resolutionNotes = notes;
    rep.resolvedAt = new Date().toISOString();
    this.reports.set(reportId, rep);

    this.logAudit({
      actorUserId: adminUserId,
      actorRole: 'ADMIN',
      action: 'RESOLVE_REPORT',
      entityType: 'REPORT',
      entityId: reportId,
      details: `Report status set to ${status}. Notes: ${notes}`,
    });

    return rep;
  }

  // --- NOTIFICATIONS & AUDIT ---
  createNotification(notif: Omit<Notification, 'id' | 'isRead' | 'createdAt'>): Notification {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const notification: Notification = {
      ...notif,
      id,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    this.notifications.unshift(notification);
    return notification;
  }

  getNotificationsForUser(userId: string): Notification[] {
    return this.notifications.filter((n) => n.userId === userId);
  }

  markNotificationAsRead(id: string): void {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) notif.isRead = true;
  }

  logAudit(log: Omit<AuditLog, 'id' | 'timestamp'>): void {
    const entry: AuditLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(entry);
  }

  getAuditLogs(): AuditLog[] {
    return [...this.auditLogs];
  }

  // --- ADMIN METRICS & ANALYTICS ---
  getPlatformMetrics() {
    const totalUsers = this.users.size;
    const totalPros = this.professionals.size;
    const verifiedPros = Array.from(this.professionals.values()).filter(
      (p) => p.verificationStatus === 'VERIFIED'
    ).length;
    const pendingPros = Array.from(this.professionals.values()).filter(
      (p) => p.verificationStatus === 'UNDER_REVIEW' || p.verificationStatus === 'SUBMITTED'
    ).length;
    const allBookings = Array.from(this.bookings.values());
    const totalBookings = allBookings.length;
    const completedBookings = allBookings.filter((b) => b.status === 'COMPLETED').length;
    const cancelledBookings = allBookings.filter((b) => b.status.startsWith('CANCELLED')).length;
    
    // Revenue calculations
    const grossRevenue = allBookings
      .filter((b) => b.status === 'COMPLETED' || b.status === 'CONFIRMED')
      .reduce((sum, b) => sum + b.price, 0);
    const platformEarnings = allBookings
      .filter((b) => b.status === 'COMPLETED' || b.status === 'CONFIRMED')
      .reduce((sum, b) => sum + b.platformFee, 0);

    return {
      totalUsers,
      totalPros,
      verifiedPros,
      pendingPros,
      totalBookings,
      completedBookings,
      cancelledBookings,
      grossRevenue,
      platformEarnings,
    };
  }

  // Earnings for a specific professional
  getProfessionalEarnings(professionalId: string) {
    const proBookings = this.getBookingsByProfessional(professionalId);
    const completed = proBookings.filter((b) => b.status === 'COMPLETED');
    const confirmedUpcoming = proBookings.filter((b) => b.status === 'CONFIRMED');
    const cancelled = proBookings.filter((b) => b.status.startsWith('CANCELLED'));

    const grossRevenue = completed.reduce((sum, b) => sum + b.price, 0);
    const platformFees = completed.reduce((sum, b) => sum + b.platformFee, 0);
    const netEarnings = grossRevenue - platformFees;

    const upcomingGross = confirmedUpcoming.reduce((sum, b) => sum + b.price, 0);

    return {
      completedCount: completed.length,
      upcomingCount: confirmedUpcoming.length,
      cancelledCount: cancelled.length,
      grossRevenue,
      platformFees,
      netEarnings,
      pendingPayout: upcomingGross,
    };
  }
}

export const db = new InMemoryDatabase();
