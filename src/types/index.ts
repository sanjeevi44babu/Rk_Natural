// User roles in the healthcare system
export type UserRole = 'admin' | 'supervisor' | 'doctor' | 'physiotherapist' | 'patient' | 'therapist' | 'frontdesk';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  dateOfBirth?: string;
  specialization?: string;
  address?: string;
  gender?: 'male' | 'female' | 'other';
  createdAt: string;
  isActive: boolean;
  isApproved: boolean;
}

export interface Patient {
  id: string;
  fullName: string;
  email?: string;
  phone: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  avatar?: string;
  address?: string;
  medicalHistory?: string;
  diagnosis?: string;
  bloodType?: string;
  weight?: number;
  height?: number;
  bloodPressure?: string;
  temperature?: number;
  assignedDoctorId?: string;
  assignedDoctorName?: string;
  assignedPhysiotherapistId?: string;
  assignedPhysiotherapistName?: string;
  supervisorId?: string;
  roomId?: string;
  roomNumber?: string;
  blockName?: string;
  bedNumber?: string;
  admissionDate?: string;
  dischargeDate?: string;
  status: 'admitted' | 'discharged' | 'outpatient';
  notes?: string;
  prescription?: string;
  treatmentPlan?: string;
  followUpDate?: string;
  heartRate?: number;
  oxygenSaturation?: number;
  respiratoryRate?: number;
  bloodSugar?: number;
  problem?: string;
  inTime?: string;
  outTime?: string;
  createdAt: string;
  isActive: boolean;
}

export interface Room {
  id: string;
  roomNumber: string;
  blockId: string;
  blockName: string;
  floor: number;
  beds: Bed[];
  roomType: 'general' | 'private' | 'icu' | 'emergency';
  isActive: boolean;
}

export interface Block {
  id: string;
  name: string;
  floors: number;
  description?: string;
}

export interface Bed {
  id: string;
  bedNumber: string;
  roomId: string;
  patientId?: string;
  patientName?: string;
  isOccupied: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  doctorId?: string;
  doctorName?: string;
  physiotherapistId?: string;
  physiotherapistName?: string;
  date: string;
  time: string;
  duration: number;
  status: 'upcoming' | 'completed' | 'cancelled' | 'in-progress';
  notes?: string;
  type: 'consultation' | 'therapy' | 'follow-up' | 'checkup' | 'discharge';
  roomNumber?: string;
  createdAt: string;
}

export interface HealthRecord {
  id: string;
  patientId: string;
  doctorId?: string;
  doctorName?: string;
  physiotherapistId?: string;
  physiotherapistName?: string;
  date: string;
  bloodPressure?: string;
  temperature?: number;
  weight?: number;
  heartRate?: number;
  notes?: string;
  diagnosis?: string;
  prescription?: string;
  treatment?: string;
  problem?: string;
  createdAt: string;
}

export interface Schedule {
  id: string;
  userId: string;
  date: string;
  availableSlots: TimeSlot[];
}

export interface TimeSlot {
  time: string;
  isBooked: boolean;
  appointmentId?: string;
}

// Auth types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  dateOfBirth: string;
  role: UserRole;
  isApproved?: boolean;
  isActive?: boolean;
  specialization?: string;
}

// Dashboard stats
export interface DashboardStats {
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  upcomingAppointments: number;
  completedAppointments: number;
  availableRooms: number;
  availableBeds: number;
}

// Navigation
export interface NavItem {
  label: string;
  path: string;
  icon: string;
}
