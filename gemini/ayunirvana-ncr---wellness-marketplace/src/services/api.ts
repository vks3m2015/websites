import { db } from '../server/db';
import {
  User,
  ProfessionalProfile,
  Booking,
  Review,
  ContentReport,
  AuditLog,
  Notification,
  TimeSlot,
  ProfessionalService,
} from '../types';

// Active simulated session (defaults to customer Pooja Malhotra for demo testing, with 1-click role switcher)
let currentSessionUser: User = db.getUserById('usr-cust-1')!;

export const api = {
  // --- AUTH & SESSION ---
  getCurrentUser(): User {
    return currentSessionUser;
  },

  setCurrentUser(user: User): void {
    currentSessionUser = user;
    localStorage.setItem('ayunirvana_user_id', user.id);
  },

  switchUserRole(role: 'CUSTOMER' | 'PROFESSIONAL' | 'ADMIN'): User {
    if (role === 'ADMIN') {
      currentSessionUser = db.getUserById('usr-admin-1')!;
    } else if (role === 'PROFESSIONAL') {
      // Find Dr. Rajeshwar's user
      currentSessionUser = db.getUserById('usr-pro-1') || {
        id: 'usr-pro-1',
        email: 'dr.rajeshwar@ayunirvana.in',
        phone: '+91 98100 24111',
        fullName: 'Dr. Rajeshwar Sharma, BAMS',
        role: 'PROFESSIONAL',
        avatarUrl: '/src/assets/images/therapist_ayurveda_expert_1790407820535.jpg',
        createdAt: '2026-01-10T00:00:00Z',
        isSuspended: false,
      };
    } else {
      currentSessionUser = db.getUserById('usr-cust-1')!;
    }
    return currentSessionUser;
  },

  registerCustomer(data: { fullName: string; email: string; phone: string }): User {
    const user = db.createUser({
      ...data,
      role: 'CUSTOMER',
    });
    currentSessionUser = user;
    return user;
  },

  registerProfessional(
    accountData: { fullName: string; email: string; phone: string },
    profileData: {
      title: string;
      gender: 'MALE' | 'FEMALE' | 'OTHER';
      yearsExperience: number;
      bio: string;
      languages: string[];
      qualifications: string[];
      primaryArea: string;
      serviceAreas: string[];
      coordinates: { latitude: number; longitude: number };
      serviceRadiusKm: number;
      avatarUrl?: string;
    },
    services: Omit<ProfessionalService, 'id' | 'professionalId'>[]
  ): { user: User; profile: ProfessionalProfile } {
    const user = db.createUser({
      ...accountData,
      role: 'PROFESSIONAL',
      avatarUrl: profileData.avatarUrl || '/src/assets/images/therapist_ayurveda_expert_1790407820535.jpg',
    });

    const profile = db.createProfessionalProfile(
      {
        userId: user.id,
        fullName: accountData.fullName,
        title: profileData.title,
        gender: profileData.gender,
        yearsExperience: profileData.yearsExperience,
        bio: profileData.bio,
        languages: profileData.languages,
        qualifications: profileData.qualifications,
        primaryArea: profileData.primaryArea,
        serviceAreas: profileData.serviceAreas,
        coordinates: profileData.coordinates,
        serviceRadiusKm: profileData.serviceRadiusKm,
        callingEnabled: true,
        verificationStatus: 'UNDER_REVIEW', // Needs admin approval per policy
        verificationNotes: 'Submitted for verification by practitioner.',
        avatarUrl: profileData.avatarUrl || '/src/assets/images/therapist_ayurveda_expert_1790407820535.jpg',
        portfolioImages: [
          profileData.avatarUrl || '/src/assets/images/therapist_ayurveda_expert_1790407820535.jpg',
          '/src/assets/images/hero_wellness_sanctuary_1790407805847.jpg',
        ],
      },
      services
    );

    currentSessionUser = user;
    return { user, profile };
  },

  // --- PROFESSIONALS & SEARCH ---
  searchProfessionals(filters: {
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
    return db.searchProfessionals(filters);
  },

  getProfessionalById(id: string): ProfessionalProfile | undefined {
    return db.getProfessionalById(id);
  },

  getProfessionalByUserId(userId: string): ProfessionalProfile | undefined {
    return db.getProfessionalByUserId(userId);
  },

  getAvailableSlots(professionalId: string, date: string): TimeSlot[] {
    return db.getAvailableSlotsForDate(professionalId, date);
  },

  // --- BOOKINGS ---
  createBooking(params: {
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
    return db.createBookingAtomic(params);
  },

  getCustomerBookings(customerId: string): Booking[] {
    return db.getBookingsByCustomer(customerId);
  },

  getProfessionalBookings(professionalId: string): Booking[] {
    return db.getBookingsByProfessional(professionalId);
  },

  cancelBooking(bookingId: string, actorUserId: string, reason: string): Booking {
    return db.cancelBooking(bookingId, actorUserId, reason);
  },

  rescheduleBooking(
    bookingId: string,
    actorUserId: string,
    newDate: string,
    newStartTime: string,
    newEndTime: string
  ): Booking {
    return db.rescheduleBooking(bookingId, actorUserId, newDate, newStartTime, newEndTime);
  },

  updateBookingStatus(
    bookingId: string,
    status: Booking['status'],
    actorUserId: string
  ): Booking {
    return db.updateBookingStatus(bookingId, status, actorUserId);
  },

  // --- REVIEWS ---
  getReviewsForProfessional(professionalId: string): Review[] {
    return db.getReviewsByProfessional(professionalId);
  },

  submitReview(params: {
    bookingId: string;
    customerId: string;
    rating: number;
    comment: string;
  }): Review {
    return db.createReview(params);
  },

  // --- FAVORITES ---
  toggleFavorite(customerId: string, professionalId: string): boolean {
    return db.toggleFavorite(customerId, professionalId);
  },

  getCustomerFavorites(customerId: string): ProfessionalProfile[] {
    return db.getCustomerFavorites(customerId);
  },

  // --- NOTIFICATIONS ---
  getUserNotifications(userId: string): Notification[] {
    return db.getNotificationsForUser(userId);
  },

  markNotificationRead(notificationId: string): void {
    db.markNotificationAsRead(notificationId);
  },

  // --- CONTENT REPORTING ---
  submitReport(params: {
    reporterUserId: string;
    reportedEntityId: string;
    reportedEntityType: 'PROFESSIONAL' | 'CUSTOMER' | 'REVIEW' | 'IMAGE';
    reason: string;
    description: string;
  }): ContentReport {
    return db.createReport(params);
  },

  // --- PROFESSIONAL EARNINGS & SCHEDULE ---
  getProfessionalEarnings(professionalId: string) {
    return db.getProfessionalEarnings(professionalId);
  },

  getProfessionalSchedule(professionalId: string) {
    return db.getSchedule(professionalId);
  },

  updateProfessionalSchedule(professionalId: string, schedule: any) {
    return db.updateSchedule(professionalId, schedule);
  },

  // --- ADMIN CAPABILITIES ---
  getAdminMetrics() {
    return db.getPlatformMetrics();
  },

  getAllUsers(): User[] {
    return db.getAllUsers();
  },

  toggleUserSuspension(userId: string, isSuspended: boolean, adminUserId: string): User {
    return db.updateUserSuspension(userId, isSuspended, adminUserId);
  },

  getAllProfessionalsAdmin(): ProfessionalProfile[] {
    return db.getAllProfessionals();
  },

  updateProfessionalVerification(
    proId: string,
    status: ProfessionalProfile['verificationStatus'],
    notes: string,
    adminUserId: string
  ): ProfessionalProfile {
    return db.updateProfessionalVerification(proId, status, notes, adminUserId);
  },

  getAllBookingsAdmin(): Booking[] {
    return db.getAllBookings();
  },

  getAllReviewsAdmin(): Review[] {
    return db.getAllReviewsForAdmin();
  },

  moderateReview(reviewId: string, isApproved: boolean, adminUserId: string): Review {
    return db.moderateReview(reviewId, isApproved, adminUserId);
  },

  getAllReportsAdmin(): ContentReport[] {
    return db.getAllReports();
  },

  resolveReport(reportId: string, status: ContentReport['status'], notes: string, adminUserId: string): ContentReport {
    return db.resolveReport(reportId, status, notes, adminUserId);
  },

  getAuditLogs(): AuditLog[] {
    return db.getAuditLogs();
  },
};
