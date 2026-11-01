import { pgTable, text, serial, timestamp, integer, boolean, jsonb } from 'drizzle-orm/pg-core';

export const tutors = pgTable('tutors', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  avatar: text('avatar'),
  rating: text('rating'),
  reviewsCount: integer('reviews_count'),
  verified: boolean('verified').default(false),
  exclusive: boolean('exclusive').default(false),
  university: text('university'),
  department: text('department'),
  location: text('location'),
  city: text('city'),
  gender: text('gender'),
  experienceYears: integer('experience_years'),
  expectedSalary: text('expected_salary'),
  subjects: jsonb('subjects'),
  mediums: jsonb('mediums'),
  completion: integer('completion'),
  phone: text('phone'),
  email: text('email'),
  dob: text('dob'),
  bloodGroup: text('blood_group'),
  religion: text('religion'),
  nidStatus: text('nid_status'),
  presentAddress: text('present_address'),
  permanentAddress: text('permanent_address'),
  guardianInfo: jsonb('guardian_info'),
  tutoringInfo: jsonb('tutoring_info'),
  educationHistory: jsonb('education_history'),
  status: text('status').default('active'),
});

export const tuitions = pgTable('tuitions', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  postedAt: timestamp('posted_at').defaultNow(),
  date: text('date'),
  startDate: text('start_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  city: text('city'),
  area: text('area'),
  location: text('location'),
  fullAddress: text('full_address'),
  country: text('country'),
  category: text('category'),
  course: text('course'),
  curriculum: text('curriculum'),
  subjects: jsonb('subjects'),
  daysPerWeek: text('days_per_week'),
  salary: integer('salary'),
  tutorGender: text('tutor_gender'),
  studentGender: text('student_gender'),
  studentsCount: text('students_count'),
  time: text('time'),
  duration: text('duration'),
  method: text('method'),
  expectedStartDate: text('expected_start_date'),
  notes: text('notes'),
  views: integer('views').default(0),
  applications: integer('applications').default(0),
  status: text('status').default('OPEN'),
  urgent: boolean('urgent').default(false),
  featured: boolean('featured').default(false),
  premium: boolean('premium').default(false),
  applicationDeadline: text('application_deadline'),
  maxApplications: integer('max_applications'),
  visibility: text('visibility').default('Visible'),
  verificationStatus: text('verification_status').default('Verified'),
  guardianName: text('guardian_name'),
  guardianPhone: text('guardian_phone'),
  guardianAltPhone: text('guardian_alt_phone'),
  adminNotes: text('admin_notes'),
  guardianRelation: text('guardian_relation'),
  latitude: text('latitude'),
  longitude: text('longitude'),
  assignedTutorId: text('assigned_tutor_id'),
  confirmedStartDate: text('confirmed_start_date'),
  cancelReason: text('cancel_reason'),
  cancelledBy: text('cancelled_by'),
  cancelledAt: timestamp('cancelled_at'),
  shortlistedTutorIds: jsonb('shortlisted_tutor_ids'),
});

export const areas = pgTable('areas', {
  id: text('id').primaryKey(),
  division: text('division').notNull(),
  district: text('district').notNull(),
  thana: text('thana').notNull(),
  nameEn: text('name_en').notNull(),
  nameBn: text('name_bn'),
  slug: text('slug').notNull().unique(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const demos = pgTable('demos', {
  id: text('id').primaryKey(),
  tuitionId: text('tuition_id').notNull(),
  tutorId: text('tutor_id').notNull(),
  guardian: text('guardian'),
  date: text('date'),
  startDate: text('start_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  status: text('status').default('Scheduled'),
  result: text('result'),
  guardianDecision: text('guardian_decision'),
  guardianRating: integer('guardian_rating'),
  guardianFeedback: text('guardian_feedback'),
});

export const payments = pgTable('payments', {
  id: text('id').primaryKey(),
  tuitionId: text('tuition_id'),
  tutorId: text('tutor_id'),
  amount: integer('amount'),
  method: text('method'),
  status: text('status'),
  date: text('date'),
  startDate: text('start_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  type: text('type'),
});

export const systemLogs = pgTable('system_logs', {
  id: serial('id').primaryKey(),
  action: text('action').notNull(),
  details: text('details'),
  timestamp: timestamp('timestamp').defaultNow(),
});

export const guardians = pgTable('guardians', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone'),
  email: text('email'),
  location: text('location'),
  status: text('status').default('Active'),
  totalTuitions: integer('total_tuitions').default(0),
  activeTuitions: integer('active_tuitions').default(0),
});

// =========================================================
// NEW PRODUCTION SCHEMA (SUPABASE / POSTGRESQL)
// =========================================================

import { uuid, foreignKey, index, uniqueIndex } from 'drizzle-orm/pg-core';

export const profiles = pgTable('profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  authUserId: uuid('auth_user_id').unique(), // references auth.users(id)
  fullName: text('full_name'),
  email: text('email'),
  phone: text('phone'),
  avatarUrl: text('avatar_url'),
  accountStatus: text('account_status').default('active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const tutorProfiles = pgTable('tutor_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }),
  tutorCode: text('tutor_code').unique(),
  fullName: text('full_name'),
  tagline: text('tagline'),
  shortBio: text('short_bio'),
  dateOfBirth: text('date_of_birth'),
  gender: text('gender'),
  bloodGroup: text('blood_group'),
  religion: text('religion'),
  maritalStatus: text('marital_status'),
  nationality: text('nationality').default('Bangladeshi'),
  nidNumber: text('nid_number'),
  primaryPhone: text('primary_phone'),
  primaryPhoneVerified: boolean('primary_phone_verified').default(false),
  secondaryPhone: text('secondary_phone'),
  whatsappNumber: text('whatsapp_number'),
  university: text('university'),
  department: text('department'),
  studentId: text('student_id'),
  academicYear: text('academic_year'),
  presentAddress: text('present_address'),
  permanentAddress: text('permanent_address'),
  sameAsPresentAddress: boolean('same_as_present_address').default(false),
  district: text('district'),
  area: text('area'),
  tutoringExperience: integer('tutoring_experience'),
  expectedSalaryMin: integer('expected_salary_min'),
  expectedSalaryMax: integer('expected_salary_max'),
  tutoringMethod: jsonb('tutoring_method'),
  availableDays: jsonb('available_days'),
  availableTime: text('available_time'),
  mediums: jsonb('mediums'),
  subjects: jsonb('subjects'),
  classes: jsonb('classes'),
  profileCompletion: integer('profile_completion').default(0),
  verificationStatus: text('verification_status').default('pending'),
  verificationDate: timestamp('verification_date'),
  nidStatus: text('nid_status'),
  guardianInfo: jsonb('guardian_info'),
  educationHistory: jsonb('education_history'),
  preferredAreas: jsonb('preferred_areas'),
  status: text('status').default('active'),
  profileVisibility: text('profile_visibility').default('public'),
  hideLastName: boolean('hide_last_name').default(false),
  nidDocumentUrl: text('nid_document_url'),
  cvUrl: text('cv_url'),
  profilePhotoUrl: text('profile_photo_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('tutor_user_id_idx').on(table.userId),
  index('tutor_ver_status_idx').on(table.verificationStatus)
]);

export const guardianProfiles = pgTable('guardian_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }),
  guardianCode: text('guardian_code').unique(),
  fullName: text('full_name'),
  phone: text('phone'),
  alternativePhone: text('alternative_phone'),
  email: text('email'),
  relationshipToStudent: text('relationship_to_student'),
  address: text('address'),
  district: text('district'),
  area: text('area'),
  verificationStatus: text('verification_status').default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const adminProfiles = pgTable('admin_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }),
  adminCode: text('admin_code').unique(),
  fullName: text('full_name'),
  email: text('email'),
  adminRole: text('admin_role'),
  status: text('status').default('active'),
  createdBy: uuid('created_by'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const tuitionRequests = pgTable('tuition_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  jobCode: text('job_code').unique(),
  guardianId: uuid('guardian_id').references(() => guardianProfiles.id, { onDelete: 'set null' }),
  title: text('title'),
  curriculum: text('curriculum'),
  courseClass: text('course_class'),
  subjects: jsonb('subjects'),
  studentCount: integer('student_count'),
  studentGender: text('student_gender'),
  preferredTutorGender: text('preferred_tutor_gender'),
  daysPerWeek: text('days_per_week'),
  preferredDays: jsonb('preferred_days'),
  preferredTime: text('preferred_time'),
  duration: text('duration'),
  method: text('method'),
  salaryMin: integer('salary_min'),
  salaryMax: integer('salary_max'),
  country: text('country'),
  division: text('division'),
  district: text('district'),
  area: text('area'),
  fullAddress: text('full_address'),
  googleMapLocation: text('google_map_location'),
  latitude: text('latitude'),
  longitude: text('longitude'),
  parentSpecialInstructions: text('parent_special_instructions'),
  expectedStartDate: timestamp('expected_start_date'),
  status: text('status').default('draft'),
  visibility: text('visibility').default('public'),
  publishedAt: timestamp('published_at'),
  closedAt: timestamp('closed_at'),
  cancelledAt: timestamp('cancelled_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('tuition_status_idx').on(table.status),
  index('tuition_guardian_id_idx').on(table.guardianId),
  index('tuition_job_code_idx').on(table.jobCode),
  index('tuition_created_at_idx').on(table.createdAt),
  index('tuition_area_idx').on(table.area),
  index('tuition_district_idx').on(table.district)
]);

export const tuitionStatusHistory = pgTable('tuition_status_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  tuitionId: uuid('tuition_id').references(() => tuitionRequests.id, { onDelete: 'cascade' }),
  oldStatus: text('old_status'),
  newStatus: text('new_status'),
  changedBy: uuid('changed_by'),
  changedByRole: text('changed_by_role'),
  reason: text('reason'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const tutorApplications = pgTable('tutor_applications', {
  id: uuid('id').defaultRandom().primaryKey(),
  tuitionId: uuid('tuition_id').references(() => tuitionRequests.id, { onDelete: 'cascade' }),
  tutorId: uuid('tutor_id').references(() => tutorProfiles.id, { onDelete: 'cascade' }),
  applicationMessage: text('application_message'),
  expectedSalary: integer('expected_salary'),
  status: text('status').default('submitted'),
  appliedAt: timestamp('applied_at').defaultNow(),
  reviewedAt: timestamp('reviewed_at'),
  reviewedBy: uuid('reviewed_by'),
  adminNotes: text('admin_notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  uniqueIndex('unique_tuition_tutor_idx').on(table.tuitionId, table.tutorId),
  index('app_tuition_id_idx').on(table.tuitionId),
  index('app_tutor_id_idx').on(table.tutorId),
  index('app_status_idx').on(table.status)
]);

export const demoClasses = pgTable('demo_classes', {
  id: uuid('id').defaultRandom().primaryKey(),
  tuitionId: uuid('tuition_id').references(() => tuitionRequests.id, { onDelete: 'cascade' }),
  applicationId: uuid('application_id').references(() => tutorApplications.id, { onDelete: 'cascade' }),
  tutorId: uuid('tutor_id').references(() => tutorProfiles.id, { onDelete: 'cascade' }),
  guardianId: uuid('guardian_id').references(() => guardianProfiles.id, { onDelete: 'cascade' }),
  scheduledDate: timestamp('scheduled_date'),
  startTime: text('start_time'),
  endTime: text('end_time'),
  mode: text('mode'),
  location: text('location'),
  meetingLink: text('meeting_link'),
  status: text('status').default('proposed'),
  guardianRating: integer('guardian_rating'),
  guardianFeedback: text('guardian_feedback'),
  adminNotes: text('admin_notes'),
  createdBy: uuid('created_by'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('demo_tuition_id_idx').on(table.tuitionId),
  index('demo_tutor_id_idx').on(table.tutorId),
  index('demo_status_idx').on(table.status)
]);

export const tuitionAssignments = pgTable('tuition_assignments', {
  id: uuid('id').defaultRandom().primaryKey(),
  tuitionId: uuid('tuition_id').references(() => tuitionRequests.id, { onDelete: 'cascade' }),
  tutorId: uuid('tutor_id').references(() => tutorProfiles.id, { onDelete: 'cascade' }),
  guardianId: uuid('guardian_id').references(() => guardianProfiles.id, { onDelete: 'cascade' }),
  applicationId: uuid('application_id').references(() => tutorApplications.id, { onDelete: 'set null' }),
  demoId: uuid('demo_id').references(() => demoClasses.id, { onDelete: 'set null' }),
  assignedBy: uuid('assigned_by'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  monthlySalary: integer('monthly_salary'),
  status: text('status').default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  recipientUserId: uuid('recipient_user_id').references(() => profiles.id, { onDelete: 'cascade' }),
  type: text('type'),
  title: text('title'),
  message: text('message'),
  entityType: text('entity_type'),
  entityId: text('entity_id'),
  isRead: boolean('is_read').default(false),
  readAt: timestamp('read_at'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('notif_recipient_idx').on(table.recipientUserId),
  index('notif_read_idx').on(table.isRead)
]);

export const paymentRecords = pgTable('payment_records', {
  id: uuid('id').defaultRandom().primaryKey(),
  tuitionId: uuid('tuition_id').references(() => tuitionRequests.id, { onDelete: 'set null' }),
  guardianId: uuid('guardian_id').references(() => guardianProfiles.id, { onDelete: 'set null' }),
  tutorId: uuid('tutor_id').references(() => tutorProfiles.id, { onDelete: 'set null' }),
  paymentType: text('payment_type'),
  amount: integer('amount'),
  currency: text('currency').default('BDT'),
  transactionId: text('transaction_id'),
  paymentMethod: text('payment_method'),
  status: text('status').default('pending'),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('payment_tuition_idx').on(table.tuitionId),
  index('payment_status_idx').on(table.status)
]);

export const reviews = pgTable('reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  tuitionId: uuid('tuition_id').references(() => tuitionRequests.id, { onDelete: 'cascade' }),
  reviewerUserId: uuid('reviewer_user_id').references(() => profiles.id, { onDelete: 'cascade' }),
  revieweeUserId: uuid('reviewee_user_id').references(() => profiles.id, { onDelete: 'cascade' }),
  rating: integer('rating'),
  comment: text('comment'),
  status: text('status').default('published'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const verificationRequests = pgTable('verification_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }),
  verificationType: text('verification_type'),
  documentUrl: text('document_url'),
  status: text('status').default('pending'),
  submittedAt: timestamp('submitted_at').defaultNow(),
  reviewedAt: timestamp('reviewed_at'),
  reviewedBy: uuid('reviewed_by'),
  rejectionReason: text('rejection_reason'),
});

export const savedTutors = pgTable('saved_tutors', {
  id: uuid('id').defaultRandom().primaryKey(),
  guardianId: uuid('guardian_id').references(() => guardianProfiles.id, { onDelete: 'cascade' }),
  tutorId: uuid('tutor_id').references(() => tutorProfiles.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  uniqueIndex('unique_saved_tutor_idx').on(table.guardianId, table.tutorId)
]);

export const savedTuitions = pgTable('saved_tuitions', {
  id: uuid('id').defaultRandom().primaryKey(),
  tutorId: uuid('tutor_id').references(() => tutorProfiles.id, { onDelete: 'cascade' }),
  tuitionId: uuid('tuition_id').references(() => tuitionRequests.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  uniqueIndex('unique_saved_tuition_idx').on(table.tutorId, table.tuitionId)
]);

export const conversations = pgTable('conversations', {
  id: uuid('id').defaultRandom().primaryKey(),
  tuitionId: uuid('tuition_id').references(() => tuitionRequests.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const conversationParticipants = pgTable('conversation_participants', {
  conversationId: uuid('conversation_id').references(() => conversations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }),
}, (table) => [
  uniqueIndex('unique_participant_idx').on(table.conversationId, table.userId)
]);

export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  conversationId: uuid('conversation_id').references(() => conversations.id, { onDelete: 'cascade' }),
  senderId: uuid('sender_id').references(() => profiles.id, { onDelete: 'cascade' }),
  message: text('message'),
  attachmentUrl: text('attachment_url'),
  createdAt: timestamp('created_at').defaultNow(),
  readAt: timestamp('read_at'),
});

export const adminAuditLogs = pgTable('admin_audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  adminId: uuid('admin_id').references(() => adminProfiles.id, { onDelete: 'set null' }),
  action: text('action'),
  entityType: text('entity_type'),
  entityId: uuid('entity_id'),
  oldData: jsonb('old_data'),
  newData: jsonb('new_data'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const reports = pgTable('reports', {
  id: uuid('id').defaultRandom().primaryKey(),
  reporterId: uuid('reporter_id').references(() => profiles.id, { onDelete: 'cascade' }),
  entityType: text('entity_type'),
  entityId: uuid('entity_id'),
  reason: text('reason'),
  description: text('description'),
  status: text('status').default('open'),
  assignedAdmin: uuid('assigned_admin').references(() => adminProfiles.id, { onDelete: 'set null' }),
  resolution: text('resolution'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// =========================================================
// TUTOR PROFILE NORMALIZED MODULE TABLES
// =========================================================

export const tutorEducation = pgTable('tutor_education', {
  id: uuid('id').defaultRandom().primaryKey(),
  tutorId: uuid('tutor_id').references(() => tutorProfiles.id, { onDelete: 'cascade' }).notNull(),
  level: text('level').notNull(), // SSC, HSC, Diploma, Bachelor, Master, Other
  degreeName: text('degree_name').notNull(),
  groupMajor: text('group_major'),
  institute: text('institute').notNull(),
  boardUniversity: text('board_university'),
  passingYear: text('passing_year'),
  resultType: text('result_type'), // GPA, CGPA, Division
  resultValue: text('result_value'),
  currentlyStudying: boolean('currently_studying').default(false),
  expectedGraduation: text('expected_graduation'),
  studentId: text('student_id'),
  department: text('department'),
  academicYear: text('academic_year'),
  certificateUrl: text('certificate_url'),
  displayOrder: integer('display_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('tutor_edu_tutor_id_idx').on(table.tutorId)
]);

export const tutorExperience = pgTable('tutor_experience', {
  id: uuid('id').defaultRandom().primaryKey(),
  tutorId: uuid('tutor_id').references(() => tutorProfiles.id, { onDelete: 'cascade' }).notNull(),
  subject: text('subject').notNull(),
  courseClass: text('course_class').notNull(),
  duration: text('duration'),
  role: text('role'),
  referenceName: text('reference_name'), // private
  referencePhone: text('reference_phone'), // private
  description: text('description'),
  achievements: text('achievements'),
  introVideoUrl: text('intro_video_url'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('tutor_exp_tutor_id_idx').on(table.tutorId)
]);

export const tutorCertifications = pgTable('tutor_certifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  tutorId: uuid('tutor_id').references(() => tutorProfiles.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  issuer: text('issuer').notNull(),
  year: text('year'),
  certificateUrl: text('certificate_url'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('tutor_cert_tutor_id_idx').on(table.tutorId)
]);

export const tutorPreferences = pgTable('tutor_preferences', {
  id: uuid('id').defaultRandom().primaryKey(),
  tutorId: uuid('tutor_id').references(() => tutorProfiles.id, { onDelete: 'cascade' }).notNull().unique(),
  mediums: jsonb('mediums'), // ['Bangla Medium', 'English Medium', ...]
  classes: jsonb('classes'), // ['Class 9-10 (SSC)', ...]
  subjects: jsonb('subjects'), // by class group
  tuitionTypes: jsonb('tuition_types'), // ['Home Tutoring', 'Online Tutoring', 'Batch Tutoring']
  studentGenderPref: text('student_gender_pref').default('Any'), // 'Male', 'Female', 'Any'
  maxStudents: integer('max_students').default(1),
  expectedSalaryMin: integer('expected_salary_min'),
  expectedSalaryMax: integer('expected_salary_max'),
  salaryNegotiable: boolean('salary_negotiable').default(true),
  preferredDaysPerWeek: text('preferred_days_per_week'),
  preferredDuration: text('preferred_duration'),
  languageSkills: jsonb('language_skills'), // ['Bangla', 'English']
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const tutorAreas = pgTable('tutor_areas', {
  id: uuid('id').defaultRandom().primaryKey(),
  tutorId: uuid('tutor_id').references(() => tutorProfiles.id, { onDelete: 'cascade' }).notNull(),
  areaId: text('area_id').references(() => areas.id, { onDelete: 'cascade' }).notNull(),
  maxTravelDistanceKm: integer('max_travel_distance_km').default(5),
  willingToRelocate: boolean('willing_to_relocate').default(false),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  uniqueIndex('unique_tutor_area_idx').on(table.tutorId, table.areaId),
  index('tutor_areas_tutor_id_idx').on(table.tutorId)
]);

export const tutorAvailability = pgTable('tutor_availability', {
  id: uuid('id').defaultRandom().primaryKey(),
  tutorId: uuid('tutor_id').references(() => tutorProfiles.id, { onDelete: 'cascade' }).notNull(),
  dayOfWeek: text('day_of_week').notNull(), // Saturday, Sunday, Monday, Tuesday, Wednesday, Thursday, Friday
  slot: text('slot').notNull(), // morning, afternoon, evening, night
  isAvailable: boolean('is_available').default(true),
  availableFrom: timestamp('available_from'),
  isOpenForTuition: boolean('is_open_for_tuition').default(true),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  uniqueIndex('unique_tutor_slot_idx').on(table.tutorId, table.dayOfWeek, table.slot),
  index('tutor_avail_tutor_id_idx').on(table.tutorId)
]);

export const tutorDocuments = pgTable('tutor_documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  tutorId: uuid('tutor_id').references(() => tutorProfiles.id, { onDelete: 'cascade' }).notNull(),
  documentType: text('document_type').notNull(), // NID_FRONT, NID_BACK, STUDENT_ID, TRANSCRIPT, PHOTO, CERTIFICATE
  storageKey: text('storage_key'),
  fileUrl: text('file_url'),
  fileSize: integer('file_size'),
  mimeType: text('mime_type'),
  status: text('status').default('pending'), // not_uploaded, pending, approved, rejected
  rejectionReason: text('rejection_reason'),
  reviewedBy: uuid('reviewed_by'),
  reviewedAt: timestamp('reviewed_at'),
  uploadedAt: timestamp('uploaded_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('tutor_doc_tutor_id_idx').on(table.tutorId),
  index('tutor_doc_type_idx').on(table.documentType)
]);

export const tutorPaymentInfo = pgTable('tutor_payment_info', {
  id: uuid('id').defaultRandom().primaryKey(),
  tutorId: uuid('tutor_id').references(() => tutorProfiles.id, { onDelete: 'cascade' }).notNull().unique(),
  method: text('method').notNull().default('bKash'), // bKash, Nagad, Rocket, Bank
  mobileWalletNumber: text('mobile_wallet_number'), // encrypted
  bankName: text('bank_name'),
  bankAccountHolder: text('bank_account_holder'),
  bankAccountNumber: text('bank_account_number'), // encrypted
  bankBranch: text('bank_branch'),
  routingNumber: text('routing_number'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const tutorEmergencyContacts = pgTable('tutor_emergency_contacts', {
  id: uuid('id').defaultRandom().primaryKey(),
  tutorId: uuid('tutor_id').references(() => tutorProfiles.id, { onDelete: 'cascade' }).notNull().unique(),
  fatherName: text('father_name'),
  fatherPhone: text('father_phone'),
  motherName: text('mother_name'),
  motherPhone: text('mother_phone'),
  emergencyContactName: text('emergency_contact_name'),
  emergencyContactRelation: text('emergency_contact_relation'),
  emergencyContactPhone: text('emergency_contact_phone'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// =========================================================
// UNIFIED BOOKMARKS TABLE
// =========================================================

export const bookmarks = pgTable('bookmarks', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }).notNull(),
  targetType: text('target_type').notNull(), // 'tuition' | 'tutor'
  targetId: text('target_id').notNull(),
  personalNote: text('personal_note'),
  remindMe: boolean('remind_me').default(false),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  uniqueIndex('unique_user_target_idx').on(table.userId, table.targetType, table.targetId),
  index('bookmarks_user_created_idx').on(table.userId, table.createdAt)
]);

export const profileAuditLogs = pgTable('profile_audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }).notNull(),
  changedBy: uuid('changed_by'),
  section: text('section').notNull(),
  field: text('field'),
  oldValue: text('old_value'),
  newValue: text('new_value'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('profile_audit_user_idx').on(table.userId),
  index('profile_audit_created_idx').on(table.createdAt)
]);

export const subjects = pgTable('subjects', {
  id: serial('id').primaryKey(),
  nameEn: text('name_en').notNull(),
  nameBn: text('name_bn'),
  category: text('category'), // General, Science, Commerce, Arts, Language
  isApproved: boolean('is_approved').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});
