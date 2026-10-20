export type UserRole = 'CUSTOMER' | 'PROFESSIONAL' | 'ADMIN';

export type VerificationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'REJECTED'
  | 'SUSPENDED';

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'CANCELLED_BY_CUSTOMER'
  | 'CANCELLED_BY_PROFESSIONAL'
  | 'COMPLETED'
  | 'NO_SHOW';

export type PaymentStatus =
  | 'INITIATED'
  | 'PENDING'
  | 'SUCCESS'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export interface User {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  isSuspended: boolean;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  imageUrl?: string;
}

export interface ProfessionalService {
  id: string;
  professionalId: string;
  categoryId: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number; // In INR (₹)
  isHomeService: boolean;
  isCenterService: boolean;
}

export interface DaySchedule {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  dayName: string;
  isOpen: boolean;
  timeSlots: { start: string; end: string }[]; // e.g. ["09:00", "13:00"], ["14:00", "18:00"]
}

export interface AvailabilitySchedule {
  professionalId: string;
  weeklySchedule: DaySchedule[];
  blockedDates: string[]; // YYYY-MM-DD
  slotDurationMinutes: number; // default 60
}

export interface ProfessionalProfile {
  id: string;
  userId: string;
  fullName: string;
  title: string; // e.g. "Senior Ayurvedic Vaidya (BAMS)"
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  yearsExperience: number;
  bio: string;
  languages: string[];
  avatarUrl: string;
  portfolioImages: string[];
  qualifications: string[]; // e.g. ["BAMS - Delhi University", "Certified Panchakarma Specialist"]
  rating: number; // 1.0 - 5.0
  reviewCount: number;
  verificationStatus: VerificationStatus;
  verificationDocumentUrl?: string;
  verificationNotes?: string;
  primaryArea: string; // e.g., "South Delhi - Hauz Khas"
  serviceAreas: string[]; // Delhi NCR areas served
  coordinates: Coordinates;
  serviceRadiusKm: number; // e.g. 15 km
  callingEnabled: boolean;
  maskedPhone?: string;
  startingPrice: number;
  createdAt: string;
  services?: ProfessionalService[];
}

export interface CustomerProfile {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  email: string;
  avatarUrl?: string;
  preferredArea: string;
  coordinates: Coordinates;
  savedFavorites: string[]; // professional IDs
  createdAt: string;
}

export interface TimeSlot {
  startTime: string; // "10:00"
  endTime: string;   // "11:00"
  date: string;      // "YYYY-MM-DD"
  isAvailable: boolean;
  bookedBookingId?: string;
}

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  professionalId: string;
  professionalName: string;
  professionalAvatar?: string;
  professionalArea: string;
  serviceId: string;
  serviceName: string;
  serviceDuration: number;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  price: number; // INR
  platformFee: number;
  taxAmount: number;
  totalAmount: number;
  status: BookingStatus;
  cancellationReason?: string;
  cancelledAt?: string;
  cancelledBy?: 'CUSTOMER' | 'PROFESSIONAL' | 'ADMIN';
  notes?: string;
  address?: string;
  serviceMode: 'HOME_VISIT' | 'PROFESSIONAL_STUDIO';
  paymentId?: string;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentTransaction {
  id: string;
  bookingId: string;
  customerId: string;
  professionalId: string;
  amount: number;
  currency: 'INR';
  gateway: 'RAZORPAY_SIMULATED' | 'UPI_DIRECT';
  transactionReference: string;
  idempotencyKey: string;
  status: PaymentStatus;
  createdAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  professionalId: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
  isModerated: boolean;
  isApproved: boolean;
}

export interface ContentReport {
  id: string;
  reporterUserId: string;
  reportedEntityId: string;
  reportedEntityType: 'PROFESSIONAL' | 'CUSTOMER' | 'REVIEW' | 'IMAGE';
  reason: string;
  description: string;
  status: 'PENDING' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
  resolutionNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface AuditLog {
  id: string;
  actorUserId: string;
  actorRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'BOOKING' | 'PAYMENT' | 'VERIFICATION' | 'SYSTEM';
  isRead: boolean;
  actionLink?: string;
  createdAt: string;
}

export interface DelhiNCRArea {
  id: string;
  name: string;
  zone: 'South Delhi' | 'Central Delhi' | 'North Delhi' | 'West Delhi' | 'East Delhi' | 'Gurugram' | 'Noida' | 'Greater Noida' | 'Faridabad' | 'Ghaziabad';
  coordinates: Coordinates;
}
