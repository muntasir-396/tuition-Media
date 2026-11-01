import { z } from 'zod';

// Bangladeshi Phone Regex: 01[3-9]\d{8}
export const BD_PHONE_REGEX = /^01[3-9]\d{8}$/;

// Sanitizer: strip phone numbers and URLs from public bio / text
export function sanitizeBioText(text: string): string {
  if (!text) return '';
  // Remove URLs
  let sanitized = text.replace(/(https?:\/\/[^\s]+|www\.[^\s]+|\b\w+\.(com|org|net|edu|bd)\b)/gi, '[link removed]');
  // Remove BD phone numbers (013..., 017..., +8801...)
  sanitized = sanitized.replace(/(\+?8801[3-9]\d{8}|01[3-9]\d{8}|\b01[3-9][\s-]?\d{4}[\s-]?\d{4}\b)/g, '[phone removed]');
  return sanitized.trim();
}

// 1. Personal Section Schema
export const personalSectionSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  photo: z.string().optional().nullable(),
  gender: z.enum(['Male', 'Female', 'Other']).optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional().nullable(),
  religion: z.string().max(50).optional().nullable(),
  maritalStatus: z.enum(['Single', 'Married', 'Divorced', 'Other']).optional().nullable(),
  nationality: z.string().default('Bangladeshi'),
  nidNumber: z.string().max(30).optional().nullable(),
  tagline: z.string().max(80, 'Tagline cannot exceed 80 characters').optional().nullable(),
  shortBio: z.string().max(300, 'Bio cannot exceed 300 characters').optional().nullable(),
});

// 2. Contact Section Schema
export const contactSectionSchema = z.object({
  primaryPhone: z.string().regex(BD_PHONE_REGEX, 'Enter a valid Bangladeshi phone number (e.g. 01712345678)'),
  secondaryPhone: z.string().regex(BD_PHONE_REGEX, 'Enter a valid secondary phone number').optional().nullable().or(z.literal('')),
  whatsappNumber: z.string().regex(BD_PHONE_REGEX, 'Enter a valid WhatsApp phone number').optional().nullable().or(z.literal('')),
  email: z.string().email('Invalid email address').optional().nullable().or(z.literal('')),
  presentAddress: z.string().min(5, 'Present address is required').max(250),
  permanentAddress: z.string().max(250).optional().nullable().or(z.literal('')),
  sameAsPresentAddress: z.boolean().default(false),
});

// 3. Education Entry Schema
export const educationEntrySchema = z.object({
  id: z.string().uuid().optional(),
  level: z.enum(['SSC', 'HSC', 'Diploma', 'Bachelor', 'Master', 'O-Level', 'A-Level', 'Other']),
  degreeName: z.string().min(2, 'Degree/Exam name is required').max(120),
  groupMajor: z.string().max(100).optional().nullable(),
  institute: z.string().min(2, 'Institute name is required').max(150),
  boardUniversity: z.string().max(120).optional().nullable(),
  passingYear: z.string().regex(/^\d{4}$/, 'Must be a valid 4-digit year').optional().nullable().or(z.literal('')),
  resultType: z.enum(['GPA', 'CGPA', 'Division', 'Appeared', 'Other']).optional().nullable(),
  resultValue: z.string().max(20).optional().nullable(),
  currentlyStudying: z.boolean().default(false),
  expectedGraduation: z.string().max(20).optional().nullable(),
  studentId: z.string().max(50).optional().nullable(),
  department: z.string().max(100).optional().nullable(),
  academicYear: z.string().max(50).optional().nullable(),
  certificateUrl: z.string().url().optional().nullable().or(z.literal('')),
});

// 4. Tutoring Preferences Schema
export const preferencesSectionSchema = z.object({
  mediums: z.array(z.string()).min(1, 'Select at least one tutoring medium'),
  classes: z.array(z.string()).min(1, 'Select at least one class group'),
  subjects: z.union([z.array(z.string()), z.record(z.any())]).optional(),
  tuitionTypes: z.array(z.string()).min(1, 'Select at least one tuition mode (Home, Online, Batch)'),
  studentGenderPref: z.enum(['Male', 'Female', 'Any']).default('Any'),
  maxStudents: z.number().int().min(1).max(20).default(1),
  expectedSalaryMin: z.number().int().min(500).max(100000),
  expectedSalaryMax: z.number().int().min(500).max(100000),
  salaryNegotiable: z.boolean().default(true),
  preferredDaysPerWeek: z.string().max(50).optional().nullable(),
  preferredDuration: z.string().max(50).optional().nullable(),
  languageSkills: z.array(z.string()).optional(),
}).refine((data) => data.expectedSalaryMax >= data.expectedSalaryMin, {
  message: 'Maximum salary must be greater than or equal to minimum salary',
  path: ['expectedSalaryMax'],
});

// 5. Areas & Availability Schema
export const areasSectionSchema = z.object({
  preferredAreas: z.array(z.string()).max(15, 'You can choose up to 15 preferred areas'),
  maxTravelDistanceKm: z.number().int().min(1).max(50).default(5),
  willingToRelocate: z.boolean().default(false),
});

export const availabilitySectionSchema = z.object({
  slots: z.array(z.object({
    dayOfWeek: z.enum(['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
    slot: z.enum(['morning', 'afternoon', 'evening', 'night']),
    isAvailable: z.boolean().default(true),
  })),
  availableFrom: z.string().optional().nullable(),
  isOpenForTuition: z.boolean().default(true),
});

// 6. Experience Entry Schema
export const experienceEntrySchema = z.object({
  id: z.string().uuid().optional(),
  subject: z.string().min(2, 'Subject is required').max(100),
  courseClass: z.string().min(1, 'Class/Course is required').max(100),
  duration: z.string().max(80).optional().nullable(),
  role: z.string().max(100).optional().nullable(),
  referenceName: z.string().max(100).optional().nullable(),
  referencePhone: z.string().regex(BD_PHONE_REGEX, 'Enter a valid reference phone number').optional().nullable().or(z.literal('')),
  description: z.string().max(500).optional().nullable(),
  achievements: z.string().max(500).optional().nullable(),
  introVideoUrl: z.string().url('Must be a valid video link').optional().nullable().or(z.literal('')),
});

// 7. Payment Info Schema (Commission & Refund)
export const paymentInfoSectionSchema = z.object({
  method: z.enum(['bKash', 'Nagad', 'Rocket', 'Bank']),
  mobileWalletNumber: z.string().regex(BD_PHONE_REGEX, 'Enter a valid mobile wallet number').optional().nullable().or(z.literal('')),
  bankName: z.string().max(100).optional().nullable(),
  bankAccountHolder: z.string().max(100).optional().nullable(),
  bankAccountNumber: z.string().max(50).optional().nullable(),
  bankBranch: z.string().max(100).optional().nullable(),
  routingNumber: z.string().max(30).optional().nullable(),
});

// 8. Emergency Contact Schema (Private & Admin-only)
export const emergencyContactSectionSchema = z.object({
  fatherName: z.string().max(100).optional().nullable(),
  fatherPhone: z.string().regex(BD_PHONE_REGEX, 'Enter a valid Bangladeshi phone number').optional().nullable().or(z.literal('')),
  motherName: z.string().max(100).optional().nullable(),
  motherPhone: z.string().regex(BD_PHONE_REGEX, 'Enter a valid Bangladeshi phone number').optional().nullable().or(z.literal('')),
  emergencyContactName: z.string().min(2, 'Emergency contact name is required').max(100),
  emergencyContactRelation: z.string().min(2, 'Relationship is required').max(50),
  emergencyContactPhone: z.string().regex(BD_PHONE_REGEX, 'Enter a valid Bangladeshi emergency contact phone number'),
});

// 9. Account & Privacy Schema
export const privacySectionSchema = z.object({
  profileVisibility: z.enum(['public', 'applied_guardians_only']).default('public'),
  hideLastName: z.boolean().default(false),
});

// 10. Bookmark Schema
export const bookmarkInputSchema = z.object({
  targetType: z.enum(['tuition', 'tutor']),
  targetId: z.string().min(1, 'Target ID is required'),
  personalNote: z.string().max(250).optional().nullable(),
  remindMe: z.boolean().default(false),
});
