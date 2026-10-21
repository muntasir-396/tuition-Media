export type PageTab = 'home' | 'jobs' | 'tutors' | 'login' | 'menu' | 'job-details' | 'profile' | 'payment' | 'sms' | 'premium' | 'verify' | 'support' | 'admin-login' | 'admin-dashboard' | 'admin-tutors' | 'admin-guardians' | 'admin-tuitions' | 'admin-tuition-details' | 'admin-demos' | 'admin-payments' | 'admin-timeline' | 'admin-users' | 'request-tutor' | 'guardian-dashboard' | 'admin-pending-requests';

export type UserRole = 'parent' | 'tutor' | 'admin' | 'super-admin';

export type AdminPermission = 
  | 'view_users' | 'edit_users' | 'suspend_users' | 'delete_users'
  | 'verify_tutors' | 'suspend_tutors' | 'delete_tutors'
  | 'view_guardians' | 'edit_guardians' | 'suspend_guardians'
  | 'manage_tuitions' | 'manage_payments' | 'view_reports' | 'manage_settings'
  | 'PENDING_REQUESTS_VIEW' | 'PENDING_REQUESTS_EDIT' | 'PENDING_REQUESTS_APPROVE' | 'PENDING_REQUESTS_REJECT' | 'PENDING_REQUESTS_ARCHIVE';

export interface AdminUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'super-admin' | 'admin';
  status: 'Active' | 'Suspended';
  lastLogin: string;
  permissions: AdminPermission[];
  avatar?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar: string;
  completionRate: number;
  isVerified: boolean;
  university?: string;
  rating?: number;
  totalReviews?: number;
}

export interface TuitionJob {
  id: string;
  title: string;
  postedAt: string;
  date: string;
  city: string;
  area: string;
  location: string;
  fullAddress: string;
  country: string;
  category: 'Bangla Medium' | 'English Medium' | 'English Version' | 'A/O Levels' | 'Madrasah' | 'Admission Test';
  course: string; // e.g., "Class 6", "Class 9", "O Level", "Nursery", "Class 11"
  subjects: string[];
  daysPerWeek: string; // e.g. "3 days", "5 days"
  salary: number; // e.g. 9000, 4000
  tutorGender: 'Male' | 'Female' | 'Any';
  studentGender: 'Male' | 'Female' | 'Mix';
  studentsCount: string; // e.g. "One", "Two"
  time: string; // e.g. "6:30 PM", "5:00 PM"
  duration: string; // e.g. "1.5 Hour", "2 Hours"
  method: 'Home Tutoring' | 'Online Tutoring' | 'Batch Tutoring';
  expectedStartDate: string;
  notes: string;
  views: number;
  applications: number;
  isBookmarked?: boolean;
}

export interface TutorProfile {
  id: string;
  tutorCode?: string;
  name: string;
  avatar: string;
  rating: number;
  reviewsCount: number;
  verified: boolean;
  exclusive: boolean;
  university: string;
  department: string;
  studentId?: string;
  academicYear?: string;
  location: string;
  city: string;
  district?: string;
  area?: string;
  gender: 'Male' | 'Female' | string;
  experienceYears: number;
  tutoringExperience?: number;
  expectedSalary: string;
  expectedSalaryMin?: number;
  expectedSalaryMax?: number;
  subjects: string[];
  mediums: string[];
  classes?: string[];
  completion: number;
  status: 'active' | 'blocked' | 'suspended';
  phone: string;
  email: string;
  dob: string;
  bloodGroup: string;
  religion: string;
  nidStatus: 'Verified (NID Provided)' | 'Pending Verification' | string;
  presentAddress: string;
  permanentAddress: string;
  guardianInfo: {
    fatherName: string;
    fatherPhone: string;
    motherName: string;
    motherPhone: string;
    emergencyContact: string;
  };
  tutoringInfo: {
    experienceYears: number;
    methods: string[];
    timeSlots: string;
    preferredAreas: string[];
    availableDays?: string[];
  };
  educationHistory: Array<{
    degree: string;
    institute: string;
    boardOrGroup: string;
    passingYear: string;
    result: string;
  }>;
}

export interface ServiceCategory {
  id: string;
  name: string;
  iconName: string;
  tutorCount: string;
  description: string;
  color: string;
}

export interface CityMetric {
  name: string;
  tutorCount: number;
}

export interface TeacherApplicationAlert {
  id: string;
  jobId: string;
  jobTitle: string;
  tutorId: string;
  tutorName: string;
  tutorUniversity: string;
  tutorDepartment?: string;
  expectedSalary?: number | null;
  timestamp: string;
  isRead: boolean;
}
