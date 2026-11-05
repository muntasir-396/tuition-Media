import express from "express";
import cookieParser from "cookie-parser";
import { generateToken, verifyToken, authMiddleware, requireAdmin } from "./src/db/auth.js";
import path from "path";
import { createServer as createViteServer } from "vite";
import { db } from "./src/db/index.js";
import { eq, desc, sql, inArray, or } from "drizzle-orm";
import { seedDatabase } from "./src/db/seed.js";
import {
  tuitionRequests, guardianProfiles, tutorProfiles, tutorApplications,
  demoClasses, paymentRecords, profiles,
  tuitions as tuitionsTable, guardians as guardiansTable, tutors as tutorsTable,
  demos as demosTable, payments as paymentsTable, notifications as notificationsTable,
  areas as areasTable,
  tutorEducation, tutorExperience, tutorCertifications, tutorPreferences,
  tutorAreas, tutorAvailability, tutorDocuments, tutorPaymentInfo,
  tutorEmergencyContacts, bookmarks as bookmarksTable, profileAuditLogs,
  subjects as subjectsTable
} from "./src/db/schema.js";
import { BD_AREAS } from "./src/data/mockData.js";
import { computeProfileCompletion, serializeTutorForPublic } from "./src/lib/tutorProfileUtils.js";
import {
  sanitizeBioText,
  personalSectionSchema,
  contactSectionSchema,
  educationEntrySchema,
  preferencesSectionSchema,
  areasSectionSchema,
  availabilitySectionSchema,
  experienceEntrySchema,
  paymentInfoSectionSchema,
  emergencyContactSectionSchema,
  privacySectionSchema,
  bookmarkInputSchema
} from "./src/lib/validation/tutorProfile.js";

// Strict Tuition Lifecycle State Machine (Prevents jumping states)
export const ALLOWED_STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['OPEN', 'PENDING_REVIEW', 'CANCELLED'],
  PENDING_REVIEW: ['OPEN', 'CANCELLED'],
  OPEN: ['SHORTLISTED', 'TEACHERS_APPLIED', 'GUARDIAN_SELECTED', 'CANCELLED'],
  TEACHERS_APPLIED: ['SHORTLISTED', 'GUARDIAN_SELECTED', 'OPEN', 'CANCELLED'],
  GUARDIAN_SELECTED: ['DEMO_SCHEDULED', 'SHORTLISTED', 'OPEN', 'CANCELLED'],
  SHORTLISTED: ['DEMO_SCHEDULED', 'OPEN', 'CANCELLED'],
  DEMO_SCHEDULED: ['DEMO_DONE', 'WINNER_SELECTED', 'CONFIRMED', 'SHORTLISTED', 'CANCELLED'],
  DEMO_DONE: ['CONFIRMED', 'WINNER_SELECTED', 'SHORTLISTED', 'CANCELLED'],
  WINNER_SELECTED: ['CONFIRMED', 'ASSIGNED', 'CANCELLED'],
  CONFIRMED: ['ASSIGNED', 'PAID', 'CANCELLED'],
  ASSIGNED: ['PAID', 'CANCELLED'],
  PAID: ['COMPLETED', 'CANCELLED'],
  CANCELLED: [],
  ARCHIVED: []
};

export function canTransitionStatus(currentStatus: string, targetStatus: string): boolean {
  const curr = (currentStatus || 'OPEN').toUpperCase();
  const target = (targetStatus || '').toUpperCase();
  if (curr === target) return true;
  const allowed = ALLOWED_STATUS_TRANSITIONS[curr];
  if (!allowed) return true; // graceful fallback
  return allowed.includes(target);
}

const mapTuitionToOld = (t: any): any => {
  let oldStatus = (t.status || '').toUpperCase();
  if (t.status === 'assigned') oldStatus = 'CONFIRMED';
  if (t.status === 'cancelled') oldStatus = 'ARCHIVED';
  if (t.status === 'closed') oldStatus = 'ARCHIVED';
  if (t.status === 'pending_review' || t.status === 'draft') oldStatus = 'PENDING_REVIEW';
  if (t.status === 'open') oldStatus = 'OPEN';
  if (t.status === 'demo_scheduled' || t.status === 'DEMO_SCHEDULED') oldStatus = 'DEMO_SCHEDULED';

  let guestName: any = null;
  let guestPhone: any = null;
  let actualNotes = t.parentSpecialInstructions || t.notes || '';

  if (actualNotes && typeof actualNotes === 'string' && actualNotes.startsWith('{') && actualNotes.includes('"guestName"')) {
    try {
      const parsed = JSON.parse(actualNotes);
      guestName = parsed.guestName;
      guestPhone = parsed.guestPhone;
      actualNotes = parsed.notes;
    } catch(e) {}
  }

  let subs = t.subjects;
  if (typeof subs === 'string') {
    subs = subs.split(',').map((s: string) => s.trim()).filter(Boolean);
  } else if (!Array.isArray(subs)) {
    subs = subs ? [subs] : [];
  }

  const courseVal = t.course || t.courseClass || t.curriculum || '';
  const categoryVal = t.category || t.curriculum || (courseVal ? `Class ${courseVal}` : 'General');
  const salaryVal = t.salary ? t.salary.toString() : (t.salaryMax ? t.salaryMax.toString() : (t.salaryMin ? t.salaryMin.toString() : ''));

  return {
    ...t,
    status: oldStatus,
    tutorGender: t.preferredTutorGender || t.tutorGender || 'Any',
    preferredTutorGender: t.preferredTutorGender || t.tutorGender || 'Any',
    location: t.fullAddress || t.area || t.location || '',
    course: courseVal,
    courseClass: courseVal,
    category: categoryVal,
    studentsCount: (t.studentCount ?? t.studentsCount ?? '1').toString(),
    studentCount: t.studentCount ?? t.studentsCount ?? 1,
    time: t.preferredTime || t.time || 'Flexible',
    preferredTime: t.preferredTime || t.time || 'Flexible',
    salary: salaryVal,
    salaryMax: t.salaryMax || (salaryVal ? parseInt(salaryVal) : null),
    notes: actualNotes || t.notes || '',
    guardianName: t.guardianName || guestName || 'Guardian',
    guardianPhone: t.guardianPhone || guestPhone || '',
    createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : new Date().toISOString(),
    postedAt: t.createdAt ? new Date(t.createdAt).toISOString() : new Date().toISOString(),
    realId: t.id,
    id: t.jobCode || t.id,
    jobCode: t.jobCode || t.id,
    applications: (t.appCount !== undefined && t.appCount !== null) ? Number(t.appCount) : Number(t.applications || 0),
    area: t.area || t.location || '',
    city: t.district || t.city || 'Dhaka',
    daysPerWeek: t.daysPerWeek || '3 days',
    method: t.method || 'Home Tutoring',
    studentGender: t.studentGender || 'Mix',
    subjects: subs,
    duration: t.duration || '1 Hour',
    expectedStartDate: t.expectedStartDate || '',
    views: t.views || 0,
    urgent: t.urgent || false,
    featured: t.featured || false,
    premium: t.premium || false,
    verificationStatus: t.verificationStatus || 'Verified',
    guardianRelation: t.guardianRelation || '',
    adminNotes: t.adminNotes || '',
    assignedTutorId: t.assignedTutorId || '',
    confirmedStartDate: t.confirmedStartDate || '',
    demoSchedule: t.demoSchedule || '',
    demoTutor: t.demoTutor || '',
    demoTutorName: t.demoTutorName || '',
    demoTutorPhone: t.demoTutorPhone || '',
    cancelReason: t.cancelReason || '',
    cancelledBy: t.cancelledBy || '',
    cancelledAt: t.cancelledAt || null,
    shortlistedTutorIds: t.shortlistedTutorIds || [],
  };
};

const maskContactDetailsForPublic = (item: any, isAuthorized: boolean = false) => {
  if (isAuthorized) return item;
  const clone = { ...item };
  if (clone.guardianPhone && typeof clone.guardianPhone === 'string' && clone.guardianPhone.length >= 6) {
    clone.guardianPhone = clone.guardianPhone.substring(0, 5) + '-XXXXXX (Hidden)';
  }
  if (clone.guardianAltPhone) {
    clone.guardianAltPhone = 'Hidden';
  }
  return clone;
};

const mapTutorToOld = (t: any): any => {
  const tutorId = t.tutorCode || t.id || 'TT-' + Math.floor(10000 + Math.random() * 90000);
  const tutorName = t.fullName || t.name || 'Registered Tutor';
  const score = t.profileCompletion ?? t.completion ?? 75;
  const isVer = t.verificationStatus === 'verified' || t.isVerified || t.verified || false;

  return {
    ...t,
    id: tutorId,
    tutorCode: tutorId,
    name: tutorName,
    fullName: tutorName,
    avatar: t.avatar || t.profilePhotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(tutorName)}&background=84cc16&color=fff&bold=true`,
    email: t.email || '',
    phone: t.phone || '',
    status: t.status || 'active',
    completion: score,
    profileCompletion: score,
    verified: isVer,
    exclusive: score >= 80,
    university: t.university || 'University Student',
    department: t.department || 'General',
    studentId: t.studentId || 'N/A',
    academicYear: t.academicYear || '3rd Year',
    city: t.district || t.city || 'Dhaka',
    district: t.district || t.city || 'Dhaka',
    area: t.area || t.location || 'Mirpur',
    location: t.area || t.location || t.presentAddress || 'Mirpur, Dhaka',
    gender: t.gender || 'Male',
    dob: t.dateOfBirth || t.dob || '2001-05-15',
    bloodGroup: t.bloodGroup || 'B+',
    religion: t.religion || 'Islam',
    nidStatus: t.nidStatus || (isVer ? 'Verified (NID Provided)' : 'Pending Verification'),
    presentAddress: t.presentAddress || `${t.area || 'Mirpur'}, ${t.district || 'Dhaka'}`,
    permanentAddress: t.permanentAddress || `${t.district || 'Dhaka'}, Bangladesh`,
    subjects: Array.isArray(t.subjects) ? t.subjects : ['Physics', 'Higher Math', 'Chemistry'],
    mediums: Array.isArray(t.mediums) ? t.mediums : ['Bangla Medium', 'English Version'],
    classes: Array.isArray(t.classes) ? t.classes : ['Class 9-10 (SSC)', 'Class 11-12 (HSC)', 'Admission Test'],
    expectedSalaryMin: t.expectedSalaryMin || 5000,
    expectedSalaryMax: t.expectedSalaryMax || 8000,
    expectedSalary: t.expectedSalaryMax ? `${t.expectedSalaryMin || 5000} - ${t.expectedSalaryMax} BDT` : (t.expectedSalary || 'Negotiable'),
    tutoringExperience: t.tutoringExperience ?? t.experienceYears ?? 2,
    experienceYears: t.tutoringExperience ?? t.experienceYears ?? 2,
    rating: t.rating ? Number(t.rating) : 4.8,
    reviewsCount: t.reviewsCount || 15,
    guardianInfo: t.guardianInfo || { 
      fatherName: 'Md. Guardian', 
      fatherPhone: '01711002233', 
      motherName: 'Fatema Begum', 
      motherPhone: '01722003344', 
      emergencyContact: '01711002233' 
    },
    tutoringInfo: t.tutoringInfo || { 
      experienceYears: t.tutoringExperience || 2, 
      methods: t.tutoringMethod || ['Home Tutoring', 'Online Tutoring'], 
      timeSlots: t.availableTime || '5:00 PM - 9:00 PM', 
      preferredAreas: t.preferredAreas || ['Mirpur', 'Dhanmondi', 'Mohammadpur', 'Uttara'],
      availableDays: t.availableDays || ['3 days/week', '4 days/week']
    },
    educationHistory: Array.isArray(t.educationHistory) && t.educationHistory.length > 0 ? t.educationHistory : [
      { degree: 'B.Sc / Honours (Graduation)', institute: t.university || 'BUET', boardOrGroup: t.department || 'Computer Science', passingYear: '2025', result: 'CGPA 3.82' },
      { degree: 'HSC (Higher Secondary)', institute: 'Notre Dame College, Dhaka', boardOrGroup: 'Science (Dhaka Board)', passingYear: '2020', result: 'GPA 5.00' },
      { degree: 'SSC (Secondary School)', institute: 'Government Laboratory High School', boardOrGroup: 'Science (Dhaka Board)', passingYear: '2018', result: 'GPA 5.00' }
    ],
  };
};

let mockTuitions: any[] = [];
let mockTutors: any[] = [];
let mockGuardians: any[] = [];
let mockPayments: any[] = [];
let mockDemos: any[] = [];
let mockApplications: any[] = [];
let mockTeacherAlerts: any[] = [];
let mockNotifications: any[] = [];

function initMockData() {
  const now = new Date().toISOString();
  mockTuitions = [
    {
      id: 'T-1024',
      jobCode: 'T-1024',
      title: 'Mathematics (Class 9)',
      curriculum: 'Bangla Medium',
      course: 'Class 9',
      courseClass: 'Class 9',
      category: 'General',
      subjects: ['Mathematics'],
      studentCount: '1',
      studentsCount: '1',
      studentGender: 'Male',
      preferredTutorGender: 'Any',
      tutorGender: 'Any',
      daysPerWeek: '4 days',
      preferredTime: '5:00 PM',
      time: '5:00 PM',
      duration: '1.5 Hours',
      method: 'Home Tutoring',
      salary: '6000',
      salaryMax: 6000,
      salaryMin: 6000,
      fullAddress: 'Dhanmondi, Dhaka',
      location: 'Dhanmondi, Dhaka',
      area: 'Dhanmondi',
      district: 'Dhaka',
      city: 'Dhaka',
      guardianName: 'Parent',
      guardianPhone: '01715998756',
      notes: 'Need an experienced mathematics tutor for Class 9 SSC preparation.',
      parentSpecialInstructions: 'Need an experienced mathematics tutor for Class 9 SSC preparation.',
      status: 'TEACHERS_APPLIED',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      views: 74,
      applications: 5
    },
    {
      id: 'T-998',
      jobCode: 'T-998',
      title: 'English (Class 7)',
      curriculum: 'English Version',
      course: 'Class 7',
      courseClass: 'Class 7',
      category: 'General',
      subjects: ['English'],
      studentCount: '1',
      studentsCount: '1',
      studentGender: 'Female',
      preferredTutorGender: 'Male',
      tutorGender: 'Male',
      daysPerWeek: '3 days',
      preferredTime: '6:00 PM',
      time: '6:00 PM',
      duration: '1 Hour',
      method: 'Home Tutoring',
      salary: '5000',
      salaryMax: 5000,
      salaryMin: 5000,
      fullAddress: 'Mirpur DOHS, Dhaka',
      location: 'Mirpur, Dhaka',
      area: 'Mirpur',
      district: 'Dhaka',
      city: 'Dhaka',
      guardianName: 'Parent',
      guardianPhone: '01715998756',
      tutorName: 'Tanvir Hossain',
      assignedTutorId: 'TT-1004',
      status: 'CONFIRMED',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      views: 120,
      applications: 12
    },
    {
      id: 'T-1045',
      jobCode: 'T-1045',
      title: 'Physics (Class 10)',
      curriculum: 'Bangla Medium',
      course: 'Class 10',
      courseClass: 'Class 10',
      category: 'General',
      subjects: ['Physics'],
      studentCount: '1',
      studentsCount: '1',
      studentGender: 'Male',
      preferredTutorGender: 'Male',
      tutorGender: 'Male',
      daysPerWeek: '3 days',
      preferredTime: 'Flexible',
      time: 'Flexible',
      duration: '1 Hour',
      method: 'Home Tutoring',
      salary: '8000',
      salaryMax: 8000,
      salaryMin: 8000,
      fullAddress: 'Uttara Sector 7, Dhaka',
      location: 'Uttara, Dhaka',
      area: 'Uttara',
      district: 'Dhaka',
      city: 'Dhaka',
      guardianName: 'Parent',
      guardianPhone: '01715998756',
      notes: 'Focus on Physics numericals and Board questions.',
      parentSpecialInstructions: 'Focus on Physics numericals and Board questions.',
      status: 'PENDING_REVIEW',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 5,
      applications: 0
    },
    { 
      id: 'TR-539989', 
      jobCode: 'TR-539989', 
      title: 'Need tutor for 11 - pcm', 
      curriculum: 'Class 11', 
      course: '11', 
      courseClass: '11', 
      category: 'General',
      subjects: ['pcm'], 
      studentCount: '1', 
      studentsCount: '1', 
      studentGender: 'Mix', 
      preferredTutorGender: 'Male', 
      tutorGender: 'Male', 
      daysPerWeek: '3 days', 
      preferredTime: 'Flexible', 
      time: 'Flexible', 
      duration: '1 Hour', 
      method: 'Home Tutoring', 
      salary: '20000', 
      salaryMax: 20000, 
      salaryMin: 20000, 
      fullAddress: 'mirpur', 
      location: 'mirpur', 
      area: 'mirpur', 
      district: 'Dhaka', 
      city: 'Dhaka', 
      guardianName: 'muntasir', 
      guardianPhone: '01881167556', 
      notes: 'buet', 
      parentSpecialInstructions: 'buet', 
      status: 'PENDING_REVIEW', 
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), 
      updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), 
      views: 1, 
      applications: 0 
    },
    { id: '88049', jobCode: '88049', title: 'HSC 2nd Year', curriculum: 'Bangla Medium', course: 'HSC 2nd Year', courseClass: 'HSC 2nd Year', subjects: ['Biology'], studentCount: '1', studentGender: 'Male', preferredTutorGender: 'Male', tutorGender: 'Male', daysPerWeek: '3 days', preferredTime: '4:00 PM', method: 'Home Tutoring', salaryMax: 6500, salary: '6500', fullAddress: 'Mohammadpur, Dhaka', area: 'Mohammadpur', district: 'Dhaka', city: 'Dhaka', guardianName: 'Mrs. Begum', guardianPhone: '01712001122', status: 'OPEN', createdAt: new Date(Date.now() - 17 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 17 * 60 * 1000).toISOString(), views: 24, applications: 2 },
    { id: '88048', jobCode: '88048', title: 'HSC 2nd Year', curriculum: 'Bangla Medium', course: 'HSC 2nd Year', courseClass: 'HSC 2nd Year', subjects: ['Maths'], studentCount: '1', studentGender: 'Male', preferredTutorGender: 'Male', tutorGender: 'Male', daysPerWeek: '3 days', preferredTime: '4:00 PM', method: 'Home Tutoring', salaryMax: 6500, salary: '6500', fullAddress: 'Mohammadpur, Dhaka', area: 'Mohammadpur', district: 'Dhaka', city: 'Dhaka', guardianName: 'Mr. Chowdhury', guardianPhone: '01712003344', status: 'OPEN', createdAt: new Date(Date.now() - 19 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 19 * 60 * 1000).toISOString(), views: 31, applications: 4 },
    { id: '88047', jobCode: '88047', title: 'Class 6', curriculum: 'Bangla Medium', course: 'Class 6', courseClass: 'Class 6', subjects: ['Maths', 'English'], studentCount: '1', studentGender: 'Male', preferredTutorGender: 'Any', tutorGender: 'Male', daysPerWeek: '4 days', preferredTime: '5:00 PM', method: 'Home Tutoring', salaryMax: 4500, salary: '4500', fullAddress: 'Mirpur 1, Dhaka', area: 'Mirpur', district: 'Dhaka', city: 'Dhaka', guardianName: 'Md. Faruk', guardianPhone: '01811223300', status: 'OPEN', createdAt: new Date(Date.now() - 26 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 26 * 60 * 1000).toISOString(), views: 19, applications: 1 },
    { id: '88046', jobCode: '88046', title: 'HSC 1st Year', curriculum: 'Bangla Medium', course: 'HSC 1st Year', courseClass: 'HSC 1st Year', subjects: ['Physics', 'Chemistry'], studentCount: '1', studentGender: 'Male', preferredTutorGender: 'Male', tutorGender: 'Male', daysPerWeek: '4 days', preferredTime: '4:00 PM', method: 'Home Tutoring', salaryMax: 7000, salary: '7000', fullAddress: 'Malibagh, Dhaka', area: 'Malibagh', district: 'Dhaka', city: 'Dhaka', guardianName: 'Dr. Hasan', guardianPhone: '01912345670', status: 'OPEN', createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), views: 42, applications: 3 },
    { id: '88045', jobCode: '88045', title: 'Class 9 Higher Math & Physics', curriculum: 'Bangla Medium', course: 'Class 9', courseClass: 'Class 9', subjects: ['Higher Math', 'Physics'], studentCount: '1', studentGender: 'Male', preferredTutorGender: 'Male', tutorGender: 'Male', daysPerWeek: '3 days', preferredTime: '5:00 PM', method: 'Home Tutoring', salaryMax: 6000, salary: '6000', fullAddress: 'Middle Badda, Dhaka', area: 'Badda', district: 'Dhaka', city: 'Dhaka', guardianName: 'Mr. Anisur Rahman', guardianPhone: '01711223399', status: 'OPEN', createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), views: 18, applications: 2 },
    { id: '88044', jobCode: '88044', title: 'Class 8 All Subjects in Dhanmondi', curriculum: 'Bangla Medium', course: 'Class 8', courseClass: 'Class 8', subjects: ['General Science', 'Maths'], studentCount: '1', studentGender: 'Female', preferredTutorGender: 'Female', tutorGender: 'Female', daysPerWeek: '4 days', preferredTime: '4:30 PM', method: 'Home Tutoring', salaryMax: 6000, salary: '6000', fullAddress: 'Dhanmondi 27, Dhaka', area: 'Dhanmondi', district: 'Dhaka', city: 'Dhaka', guardianName: 'Mrs. Salma', guardianPhone: '01755667788', status: 'OPEN', createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), views: 35, applications: 3 },
    { id: '88043', jobCode: '88043', title: 'O Level Physics & Chemistry', curriculum: 'English Medium', course: 'O Level', courseClass: 'O Level', subjects: ['Physics', 'Chemistry'], studentCount: '1', studentGender: 'Male', preferredTutorGender: 'Any', tutorGender: 'Any', daysPerWeek: '3 days', preferredTime: '6:00 PM', method: 'Home Tutoring', salaryMax: 8500, salary: '8500', fullAddress: 'Uttara Sector 7, Dhaka', area: 'Uttara', district: 'Dhaka', city: 'Dhaka', guardianName: 'Engr. Masud', guardianPhone: '01899001122', status: 'OPEN', createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(), views: 50, applications: 5 },
    { id: 'JOB-80703', title: 'Class 6 Math Tuition in Mirpur', curriculum: 'Bangla Medium', course: 'Class 6', courseClass: 'Class 6', subjects: ['Math'], studentCount: '1', studentGender: 'Male', preferredTutorGender: 'Any', tutorGender: 'Any', daysPerWeek: '5 days', preferredTime: '5:00 PM', method: 'Home Tutoring', salaryMax: 4000, salary: '4000', fullAddress: 'Mirpur-1, Dhaka', area: 'Mirpur', district: 'Dhaka', city: 'Dhaka', guardianName: 'Md. Rahman', guardianPhone: '01712345678', status: 'OPEN', createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), views: 45, applications: 3, jobCode: 'JOB-80703' },
    { id: 'JOB-80704', title: 'Class 10 Science Tuition in Banani', curriculum: 'English Medium', course: 'Class 10', courseClass: 'Class 10', subjects: ['Physics', 'Chemistry'], studentCount: '2', studentGender: 'Female', preferredTutorGender: 'Female', tutorGender: 'Female', daysPerWeek: '3 days', preferredTime: '6:30 PM', method: 'Online Tutoring', salaryMax: 6000, salary: '6000', fullAddress: 'Banani, Dhaka', area: 'Banani', district: 'Dhaka', city: 'Dhaka', guardianName: 'Mrs. Ahmed', guardianPhone: '01798765432', status: 'OPEN', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), views: 32, applications: 1, jobCode: 'JOB-80704' },
    { id: 'JOB-80705', title: 'O Level Physics Tuition in Gulshan', curriculum: 'A/O Levels', course: 'O Level', courseClass: 'O Level', subjects: ['Physics'], studentCount: '1', studentGender: 'Male', preferredTutorGender: 'Male', tutorGender: 'Male', daysPerWeek: '4 days', preferredTime: '4:00 PM', method: 'Home Tutoring', salaryMax: 8000, salary: '8000', fullAddress: 'Gulshan-2, Dhaka', area: 'Gulshan', district: 'Dhaka', city: 'Dhaka', guardianName: 'Mr. Karim', guardianPhone: '01711111111', status: 'PENDING_REVIEW', createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), views: 18, applications: 0, jobCode: 'JOB-80705' },
    { id: 'JOB-80706', title: 'Class 9 English Tuition in Chittagong', curriculum: 'English Version', course: 'Class 9', courseClass: 'Class 9', subjects: ['English'], studentCount: '1', studentGender: 'Mix', preferredTutorGender: 'Any', tutorGender: 'Any', daysPerWeek: '3 days', preferredTime: '5:30 PM', method: 'Batch Tutoring', salaryMax: 3500, salary: '3500', fullAddress: 'Agrabad, Chittagong', area: 'Agrabad', district: 'Chittagong', city: 'Chittagong', guardianName: 'Mr. Hossain', guardianPhone: '01822222222', status: 'OPEN', createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), views: 27, applications: 5, jobCode: 'JOB-80706' },
    { id: 'JOB-80707', title: 'SSC Math Tuition in Sylhet', curriculum: 'Bangla Medium', course: 'Class 10', courseClass: 'Class 10', subjects: ['Math', 'Physics'], studentCount: '3', studentGender: 'Male', preferredTutorGender: 'Male', tutorGender: 'Male', daysPerWeek: '6 days', preferredTime: '6:00 PM', method: 'Home Tutoring', salaryMax: 5000, salary: '5000', fullAddress: 'Sylhet City', area: 'Sylhet', district: 'Sylhet', city: 'Sylhet', guardianName: 'Mr. Ali', guardianPhone: '01933333333', status: 'TEACHERS_APPLIED', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), views: 56, applications: 8, jobCode: 'JOB-80707' },
    { id: 'JOB-80708', title: 'Class 3 Nursery English Tuition in Gazipur', curriculum: 'English Medium', course: 'Nursery', courseClass: 'Nursery', subjects: ['English'], studentCount: '1', studentGender: 'Female', preferredTutorGender: 'Female', tutorGender: 'Female', daysPerWeek: '5 days', preferredTime: '4:30 PM', method: 'Home Tutoring', salaryMax: 3000, salary: '3000', fullAddress: 'Gazipur', area: 'Gazipur', district: 'Gazipur', city: 'Gazipur', guardianName: 'Mrs. Khatun', guardianPhone: '01644444444', status: 'OPEN', createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), views: 12, applications: 2, jobCode: 'JOB-80708' },
    { id: 'JOB-80709', title: 'HSC Biology Tuition in Khulna', curriculum: 'Bangla Medium', course: 'Class 12', courseClass: 'Class 12', subjects: ['Biology', 'Chemistry'], studentCount: '2', studentGender: 'Mix', preferredTutorGender: 'Any', tutorGender: 'Any', daysPerWeek: '4 days', preferredTime: '7:00 PM', method: 'Online Tutoring', salaryMax: 5500, salary: '5500', fullAddress: 'Khulna', area: 'Khulna', district: 'Khulna', city: 'Khulna', guardianName: 'Mr. Das', guardianPhone: '01755555555', status: 'CONFIRMED', createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), views: 89, applications: 12, jobCode: 'JOB-80709' },
    { id: 'JOB-80710', title: 'Class 11 Physics Tuition in Rajshahi', curriculum: 'Bangla Medium', course: 'Class 11', courseClass: 'Class 11', subjects: ['Physics', 'Higher Math'], studentCount: '1', studentGender: 'Male', preferredTutorGender: 'Male', tutorGender: 'Male', daysPerWeek: '3 days', preferredTime: '5:00 PM', method: 'Home Tutoring', salaryMax: 4500, salary: '4500', fullAddress: 'Rajshahi', area: 'Rajshahi', district: 'Rajshahi', city: 'Rajshahi', guardianName: 'Mr. Islam', guardianPhone: '01866666666', status: 'OPEN', createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), views: 21, applications: 0, jobCode: 'JOB-80710' },
  ];

  mockTutors = [
    { 
      id: 'TT-1001', 
      tutorCode: 'TT-1001', 
      fullName: 'Muntasir Mamun', 
      name: 'Muntasir Mamun',
      email: 'muntasir@example.com', 
      phone: '01700000001', 
      profileCompletion: 95, 
      completion: 95,
      verificationStatus: 'verified', 
      verified: true,
      exclusive: true,
      status: 'active',
      district: 'Dhaka', 
      city: 'Dhaka',
      area: 'Mirpur',
      location: 'Mirpur, Dhaka',
      university: 'BUET', 
      department: 'Computer Science & Engineering', 
      studentId: '1905001',
      academicYear: 'Final Year / Graduate',
      gender: 'Male',
      dob: '2001-08-14',
      bloodGroup: 'B+',
      religion: 'Islam',
      presentAddress: 'House 14, Road 5, Mirpur DOHS, Dhaka',
      permanentAddress: 'Sonargaon, Narayanganj',
      tutoringExperience: 3, 
      experienceYears: 3,
      expectedSalaryMin: 6000, 
      expectedSalaryMax: 10000, 
      expectedSalary: '6000 - 10000 BDT',
      subjects: ['Physics', 'Higher Math', 'Chemistry', 'ICT'], 
      mediums: ['Bangla Medium', 'English Version', 'English Medium'], 
      classes: ['Class 9-10 (SSC)', 'Class 11-12 (HSC)', 'Admission Test'],
      tutoringMethod: ['Home Tutoring', 'Online Tutoring'],
      availableDays: ['3 days/week', '4 days/week'],
      availableTime: '5:00 PM - 9:00 PM',
      preferredAreas: ['Mirpur', 'Dhanmondi', 'Mohammadpur', 'Uttara', 'Cantonment'],
      rating: 4.9, 
      reviewsCount: 48, 
      nidStatus: 'Verified (NID Provided)',
      guardianInfo: { fatherName: 'Md. Abdur Rahman', fatherPhone: '01711002233', motherName: 'Nazma Begum', motherPhone: '01722003344', emergencyContact: '01711002233' },
      tutoringInfo: { experienceYears: 3, methods: ['Home Tutoring', 'Online Tutoring'], timeSlots: '5:00 PM - 9:00 PM', preferredAreas: ['Mirpur', 'Dhanmondi', 'Mohammadpur'] },
      educationHistory: [
        { degree: 'B.Sc in Computer Science & Engineering', institute: 'BUET', boardOrGroup: 'Engineering', passingYear: '2025', result: 'CGPA 3.84' },
        { degree: 'HSC (Higher Secondary Certificate)', institute: 'Notre Dame College, Dhaka', boardOrGroup: 'Science (Dhaka Board)', passingYear: '2020', result: 'GPA 5.00' },
        { degree: 'SSC (Secondary School Certificate)', institute: 'Government Laboratory High School', boardOrGroup: 'Science (Dhaka Board)', passingYear: '2018', result: 'GPA 5.00' }
      ]
    },
    { 
      id: 'TT-1002', 
      tutorCode: 'TT-1002', 
      fullName: 'Sadia Rahman', 
      name: 'Sadia Rahman',
      email: 'sadia@example.com', 
      phone: '01700000002', 
      profileCompletion: 85, 
      completion: 85,
      verificationStatus: 'verified', 
      verified: true,
      exclusive: false,
      status: 'active',
      district: 'Dhaka', 
      city: 'Dhaka',
      area: 'Dhanmondi',
      location: 'Dhanmondi, Dhaka',
      university: 'Dhaka University', 
      department: 'Institute of Business Administration (IBA)', 
      studentId: 'IBA-2021-042',
      academicYear: '3rd Year',
      gender: 'Female',
      dob: '2002-11-20',
      bloodGroup: 'O+',
      religion: 'Islam',
      presentAddress: 'Road 8/A, Dhanmondi, Dhaka',
      permanentAddress: 'Kushtia Sadar, Kushtia',
      tutoringExperience: 2, 
      experienceYears: 2,
      expectedSalaryMin: 5000, 
      expectedSalaryMax: 8000, 
      expectedSalary: '5000 - 8000 BDT',
      subjects: ['English', 'Economics', 'General Math', 'Accounting'], 
      mediums: ['English Medium', 'English Version', 'Bangla Medium'], 
      classes: ['Class 6-8', 'Class 9-10 (SSC)', 'O Level'],
      tutoringMethod: ['Home Tutoring', 'Online Tutoring'],
      availableDays: ['3 days/week'],
      availableTime: '4:00 PM - 7:30 PM',
      preferredAreas: ['Dhanmondi', 'Kalabagan', 'Lalmatia', 'Mohammadpur'],
      rating: 4.7, 
      reviewsCount: 32, 
      nidStatus: 'Verified (NID Provided)',
      guardianInfo: { fatherName: 'Dr. Mokhlesur Rahman', fatherPhone: '01733445566', motherName: 'Tahmina Akhter', motherPhone: '01744556677', emergencyContact: '01733445566' },
      tutoringInfo: { experienceYears: 2, methods: ['Home Tutoring', 'Online Tutoring'], timeSlots: '4:00 PM - 7:30 PM', preferredAreas: ['Dhanmondi', 'Lalmatia'] },
      educationHistory: [
        { degree: 'BBA in Marketing', institute: 'IBA, Dhaka University', boardOrGroup: 'Business Administration', passingYear: '2026', result: 'CGPA 3.78' },
        { degree: 'HSC', institute: 'Viqarunnisa Noon College', boardOrGroup: 'Science', passingYear: '2021', result: 'GPA 5.00' },
        { degree: 'SSC', institute: 'Viqarunnisa Noon School', boardOrGroup: 'Science', passingYear: '2019', result: 'GPA 5.00' }
      ]
    },
    { 
      id: 'TT-1003', 
      tutorCode: 'TT-1003', 
      fullName: 'Rahim Uddin', 
      name: 'Rahim Uddin',
      email: 'rahim@example.com', 
      phone: '01700000003', 
      profileCompletion: 70, 
      completion: 70,
      verificationStatus: 'pending', 
      verified: false,
      exclusive: false,
      status: 'active',
      district: 'Chittagong', 
      city: 'Chittagong',
      area: 'Agrabad',
      location: 'Agrabad, Chittagong',
      university: 'CUET', 
      department: 'Electrical & Electronic Engineering (EEE)', 
      studentId: '1802054',
      academicYear: 'Graduate',
      gender: 'Male',
      dob: '2000-02-10',
      bloodGroup: 'A+',
      religion: 'Islam',
      presentAddress: 'Chawkbazar, Chittagong',
      permanentAddress: 'Feni Sadar, Feni',
      tutoringExperience: 5, 
      experienceYears: 5,
      expectedSalaryMin: 4000, 
      expectedSalaryMax: 7000, 
      expectedSalary: '4000 - 7000 BDT',
      subjects: ['Physics', 'Mathematics', 'General Science'], 
      mediums: ['Bangla Medium'], 
      classes: ['Class 9-10 (SSC)', 'Class 11-12 (HSC)'],
      tutoringMethod: ['Home Tutoring', 'Batch Tutoring'],
      availableDays: ['4 days/week'],
      availableTime: '6:00 PM - 9:00 PM',
      preferredAreas: ['Agrabad', 'Chawkbazar', 'GEC', 'Nasirabad'],
      rating: 4.3, 
      reviewsCount: 22, 
      nidStatus: 'Pending Verification',
      guardianInfo: { fatherName: 'Abul Kalam', fatherPhone: '01811223344', motherName: 'Rabeya Khatun', motherPhone: '01822334455', emergencyContact: '01811223344' },
      tutoringInfo: { experienceYears: 5, methods: ['Home Tutoring', 'Batch Tutoring'], timeSlots: '6:00 PM - 9:00 PM', preferredAreas: ['Agrabad', 'Chawkbazar'] },
      educationHistory: [
        { degree: 'B.Sc in EEE', institute: 'CUET', boardOrGroup: 'Engineering', passingYear: '2024', result: 'CGPA 3.65' },
        { degree: 'HSC', institute: 'Chittagong College', boardOrGroup: 'Science', passingYear: '2019', result: 'GPA 5.00' },
        { degree: 'SSC', institute: 'Chittagong Collegiate School', boardOrGroup: 'Science', passingYear: '2017', result: 'GPA 5.00' }
      ]
    },
    { 
      id: 'TT-1005', 
      tutorCode: 'TT-1005', 
      fullName: 'Karim Hossain', 
      name: 'Karim Hossain',
      email: 'karim.du@gmail.com', 
      phone: '01719988771', 
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Karim',
      profileCompletion: 92, 
      completion: 92,
      verificationStatus: 'verified', 
      verified: true,
      exclusive: true,
      status: 'active',
      district: 'Dhaka', 
      city: 'Dhaka',
      area: 'Dhanmondi',
      location: 'Dhanmondi, Dhaka',
      university: 'Dhaka University', 
      department: 'Department of Mathematics', 
      studentId: 'DU-MATH-19',
      academicYear: 'Final Year / Masters',
      gender: 'Male',
      dob: '2000-05-18',
      bloodGroup: 'B+',
      religion: 'Islam',
      presentAddress: 'Road 7/A, Dhanmondi, Dhaka',
      permanentAddress: 'Chandpur Sadar, Chandpur',
      tutoringExperience: 4, 
      experienceYears: 4,
      expectedSalaryMin: 5000, 
      expectedSalaryMax: 8000, 
      expectedSalary: '5000 - 8000 BDT',
      subjects: ['General Math', 'Higher Math', 'Physics', 'Science'], 
      mediums: ['Bangla Medium', 'English Version'], 
      classes: ['Class 9-10 (SSC)', 'Class 11-12 (HSC)', 'Class 6-8'],
      tutoringMethod: ['Home Tutoring', 'Online Tutoring'],
      availableDays: ['3 days/week', '4 days/week'],
      availableTime: '4:30 PM - 8:30 PM',
      preferredAreas: ['Dhanmondi', 'Kalabagan', 'Lalmatia', 'Mohammadpur', 'Jigatola'],
      rating: 4.9, 
      reviewsCount: 38, 
      nidStatus: 'Verified (NID Provided)',
      guardianInfo: { fatherName: 'Md. Delowar Hossain', fatherPhone: '01711224466', motherName: 'Kohinoor Begum', motherPhone: '01722335577', emergencyContact: '01711224466' },
      tutoringInfo: { experienceYears: 4, methods: ['Home Tutoring', 'Online Tutoring'], timeSlots: '4:30 PM - 8:30 PM', preferredAreas: ['Dhanmondi', 'Kalabagan', 'Lalmatia'] },
      educationHistory: [
        { degree: 'M.Sc in Mathematics', institute: 'Dhaka University', boardOrGroup: 'Faculty of Science', passingYear: '2026', result: 'First Class' },
        { degree: 'B.Sc (Honours) in Mathematics', institute: 'Dhaka University', boardOrGroup: 'Faculty of Science', passingYear: '2024', result: 'CGPA 3.82' },
        { degree: 'HSC', institute: 'Dhaka College', boardOrGroup: 'Science', passingYear: '2020', result: 'GPA 5.00' },
        { degree: 'SSC', institute: "Dhanmondi Govt Boys' High School", boardOrGroup: 'Science', passingYear: '2018', result: 'GPA 5.00' }
      ]
    },
    { 
      id: 'TT-1006', 
      tutorCode: 'TT-1006', 
      fullName: 'Nusrat Jahan', 
      name: 'Nusrat Jahan',
      email: 'nusrat.brac@gmail.com', 
      phone: '01822334455', 
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nusrat',
      profileCompletion: 88, 
      completion: 88,
      verificationStatus: 'verified', 
      verified: true,
      exclusive: false,
      status: 'active',
      district: 'Dhaka', 
      city: 'Dhaka',
      area: 'Lalmatia',
      location: 'Lalmatia, Dhaka',
      university: 'BRAC University', 
      department: 'Applied Mathematics', 
      studentId: '20101045',
      academicYear: '4th Year',
      gender: 'Female',
      dob: '2001-09-12',
      bloodGroup: 'A+',
      religion: 'Islam',
      presentAddress: 'Block D, Lalmatia, Dhaka',
      permanentAddress: 'Comilla Sadar, Comilla',
      tutoringExperience: 3, 
      experienceYears: 3,
      expectedSalaryMin: 5000, 
      expectedSalaryMax: 7500, 
      expectedSalary: '5000 - 7500 BDT',
      subjects: ['General Math', 'Higher Math', 'Science', 'English'], 
      mediums: ['Bangla Medium', 'English Version'], 
      classes: ['Class 6-8', 'Class 9-10 (SSC)'],
      tutoringMethod: ['Home Tutoring', 'Online Tutoring'],
      availableDays: ['3 days/week'],
      availableTime: '3:30 PM - 7:00 PM',
      preferredAreas: ['Lalmatia', 'Dhanmondi', 'Mohammadpur'],
      rating: 4.8, 
      reviewsCount: 26, 
      nidStatus: 'Verified (NID Provided)',
      guardianInfo: { fatherName: 'Mohammad Faruk', fatherPhone: '01811335577', motherName: 'Shahina Akhter', motherPhone: '01822446688', emergencyContact: '01811335577' },
      tutoringInfo: { experienceYears: 3, methods: ['Home Tutoring', 'Online Tutoring'], timeSlots: '3:30 PM - 7:00 PM', preferredAreas: ['Lalmatia', 'Dhanmondi'] },
      educationHistory: [
        { degree: 'B.Sc in Applied Mathematics', institute: 'BRAC University', boardOrGroup: 'Science', passingYear: '2025', result: 'CGPA 3.75' },
        { degree: 'HSC', institute: 'Holy Cross College, Dhaka', boardOrGroup: 'Science', passingYear: '2020', result: 'GPA 5.00' },
        { degree: 'SSC', institute: 'Viqarunnisa Noon School', boardOrGroup: 'Science', passingYear: '2018', result: 'GPA 5.00' }
      ]
    },
    { 
      id: 'TT-1007', 
      tutorCode: 'TT-1007', 
      fullName: 'Tanvir Ahmed', 
      name: 'Tanvir Ahmed',
      email: 'tanvir.nsu@gmail.com', 
      phone: '01911445566', 
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TanvirA',
      profileCompletion: 84, 
      completion: 84,
      verificationStatus: 'verified', 
      verified: true,
      exclusive: false,
      status: 'active',
      district: 'Dhaka', 
      city: 'Dhaka',
      area: 'Kalabagan',
      location: 'Kalabagan, Dhaka',
      university: 'North South University (NSU)', 
      department: 'Economics & Mathematics', 
      studentId: '2021-NSU-091',
      academicYear: '3rd Year',
      gender: 'Male',
      dob: '2002-03-24',
      bloodGroup: 'O+',
      religion: 'Islam',
      presentAddress: 'Lake Circus, Kalabagan, Dhaka',
      permanentAddress: 'Bogra Sadar, Bogra',
      tutoringExperience: 2, 
      experienceYears: 2,
      expectedSalaryMin: 4500, 
      expectedSalaryMax: 7000, 
      expectedSalary: '4500 - 7000 BDT',
      subjects: ['General Math', 'Physics', 'Economics'], 
      mediums: ['English Version', 'Bangla Medium'], 
      classes: ['Class 6-8', 'Class 9-10 (SSC)'],
      tutoringMethod: ['Home Tutoring'],
      availableDays: ['3 days/week'],
      availableTime: '5:00 PM - 8:00 PM',
      preferredAreas: ['Kalabagan', 'Dhanmondi', 'Panthapath'],
      rating: 4.7, 
      reviewsCount: 19, 
      nidStatus: 'Verified (NID Provided)',
      guardianInfo: { fatherName: 'Dr. Rafiqul Islam', fatherPhone: '01911223344', motherName: 'Nasrin Jahan', motherPhone: '01922334455', emergencyContact: '01911223344' },
      tutoringInfo: { experienceYears: 2, methods: ['Home Tutoring'], timeSlots: '5:00 PM - 8:00 PM', preferredAreas: ['Kalabagan', 'Dhanmondi'] },
      educationHistory: [
        { degree: 'B.Sc in Economics & Math', institute: 'North South University', boardOrGroup: 'Business & Science', passingYear: '2026', result: 'CGPA 3.68' },
        { degree: 'HSC', institute: 'Notre Dame College', boardOrGroup: 'Science', passingYear: '2021', result: 'GPA 5.00' },
        { degree: 'SSC', institute: 'Government Laboratory High School', boardOrGroup: 'Science', passingYear: '2019', result: 'GPA 5.00' }
      ]
    },
    { 
      id: 'TT-1008', 
      tutorCode: 'TT-1008', 
      fullName: 'Sadia Islam', 
      name: 'Sadia Islam',
      email: 'sadia.dmc@gmail.com', 
      phone: '01755667788', 
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SadiaIslam',
      profileCompletion: 90, 
      completion: 90,
      verificationStatus: 'verified', 
      verified: true,
      exclusive: true,
      status: 'active',
      district: 'Dhaka', 
      city: 'Dhaka',
      area: 'Bakshibazar',
      location: 'Bakshibazar, Dhaka',
      university: 'Dhaka Medical College (DMC)', 
      department: 'MBBS (3rd Year)', 
      studentId: 'DMC-2022-034',
      academicYear: '3rd Year',
      gender: 'Female',
      dob: '2001-12-10',
      bloodGroup: 'B+',
      religion: 'Islam',
      presentAddress: 'DMC Hostel, Bakshibazar, Dhaka',
      permanentAddress: 'Rajshahi Sadar, Rajshahi',
      tutoringExperience: 3, 
      experienceYears: 3,
      expectedSalaryMin: 6000, 
      expectedSalaryMax: 9000, 
      expectedSalary: '6000 - 9000 BDT',
      subjects: ['Biology', 'Chemistry', 'General Science'], 
      mediums: ['Bangla Medium', 'English Version'], 
      classes: ['Class 9-10 (SSC)', 'Class 11-12 (HSC)', 'Medical Admission'],
      tutoringMethod: ['Home Tutoring', 'Online Tutoring'],
      availableDays: ['3 days/week'],
      availableTime: '4:00 PM - 7:30 PM',
      preferredAreas: ['Dhanmondi', 'Lalbagh', 'Azimpur', 'Shahbagh'],
      rating: 4.9, 
      reviewsCount: 31, 
      nidStatus: 'Verified (NID Provided)',
      guardianInfo: { fatherName: 'Prof. Anisur Rahman', fatherPhone: '01711778899', motherName: 'Farida Yasmin', motherPhone: '01722889900', emergencyContact: '01711778899' },
      tutoringInfo: { experienceYears: 3, methods: ['Home Tutoring', 'Online Tutoring'], timeSlots: '4:00 PM - 7:30 PM', preferredAreas: ['Dhanmondi', 'Shahbagh', 'Azimpur'] },
      educationHistory: [
        { degree: 'MBBS', institute: 'Dhaka Medical College', boardOrGroup: 'Medical', passingYear: '2027', result: 'Honours Marks' },
        { degree: 'HSC', institute: 'Rajshahi College', boardOrGroup: 'Science', passingYear: '2020', result: 'GPA 5.00' },
        { degree: 'SSC', institute: 'Rajshahi Collegiate School', boardOrGroup: 'Science', passingYear: '2018', result: 'GPA 5.00' }
      ]
    },
  ];

  mockApplications = [
    {
      id: 'APP-1024-1',
      tuitionId: 'T-1024',
      jobCode: 'T-1024',
      tutorId: 'TT-1005',
      tutorCode: 'TT-1005',
      name: 'Karim Hossain',
      phone: '01719988771',
      email: 'karim.du@gmail.com',
      gender: 'Male',
      university: 'Dhaka University',
      department: 'Department of Mathematics',
      studentId: 'DU-MATH-19',
      academicYear: 'Final Year / Masters',
      district: 'Dhaka',
      area: 'Dhanmondi',
      experience: '4 years',
      mediums: ['Bangla Medium', 'English Version'],
      subjects: ['General Math', 'Higher Math'],
      verificationStatus: 'verified',
      status: 'active',
      expectedSalary: 6000,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Karim',
      rating: 4.9,
      message: 'Experienced mathematics tutor with 4+ years teaching Class 9-10 SSC curriculum. I live right in Dhanmondi and can provide structured tests.',
      appliedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    },
    {
      id: 'APP-1024-2',
      tuitionId: 'T-1024',
      jobCode: 'T-1024',
      tutorId: 'TT-1001',
      tutorCode: 'TT-1001',
      name: 'Muntasir Mamun',
      phone: '01700000001',
      email: 'muntasir@example.com',
      gender: 'Male',
      university: 'BUET',
      department: 'Computer Science & Engineering',
      studentId: '1905001',
      academicYear: 'Final Year / Graduate',
      district: 'Dhaka',
      area: 'Mirpur',
      experience: '3 years',
      mediums: ['Bangla Medium', 'English Version'],
      subjects: ['Physics', 'Higher Math', 'General Math'],
      verificationStatus: 'verified',
      status: 'active',
      expectedSalary: 6500,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Muntasir',
      rating: 4.9,
      message: 'BUET engineering student with solid command over Mathematics. Proven track record of boosting student grades to A+.',
      appliedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    },
    {
      id: 'APP-1024-3',
      tuitionId: 'T-1024',
      jobCode: 'T-1024',
      tutorId: 'TT-1006',
      tutorCode: 'TT-1006',
      name: 'Nusrat Jahan',
      phone: '01822334455',
      email: 'nusrat.brac@gmail.com',
      gender: 'Female',
      university: 'BRAC University',
      department: 'Applied Mathematics',
      studentId: '20101045',
      academicYear: '4th Year',
      district: 'Dhaka',
      area: 'Lalmatia',
      experience: '3 years',
      mediums: ['Bangla Medium', 'English Version'],
      subjects: ['General Math', 'Higher Math', 'Science'],
      verificationStatus: 'verified',
      status: 'active',
      expectedSalary: 6000,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nusrat',
      rating: 4.8,
      message: 'Friendly and patient tutor who makes complex math theorems easy to understand. Regular weekly mock evaluations.',
      appliedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    {
      id: 'APP-1024-4',
      tuitionId: 'T-1024',
      jobCode: 'T-1024',
      tutorId: 'TT-1007',
      tutorCode: 'TT-1007',
      name: 'Tanvir Ahmed',
      phone: '01911445566',
      email: 'tanvir.nsu@gmail.com',
      gender: 'Male',
      university: 'North South University (NSU)',
      department: 'Economics & Mathematics',
      studentId: '2021-NSU-091',
      academicYear: '3rd Year',
      district: 'Dhaka',
      area: 'Kalabagan',
      experience: '2 years',
      mediums: ['English Version', 'Bangla Medium'],
      subjects: ['General Math', 'Physics'],
      verificationStatus: 'verified',
      status: 'active',
      expectedSalary: 5500,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TanvirA',
      rating: 4.7,
      message: 'Dedicated tutor with strong analytical background. I provide chapter-wise question banks and exam tips.',
      appliedAt: new Date(Date.now() - 3600000 * 30).toISOString(),
    },
    {
      id: 'APP-1024-5',
      tuitionId: 'T-1024',
      jobCode: 'T-1024',
      tutorId: 'TT-1008',
      tutorCode: 'TT-1008',
      name: 'Sadia Islam',
      phone: '01755667788',
      email: 'sadia.dmc@gmail.com',
      gender: 'Female',
      university: 'Dhaka Medical College (DMC)',
      department: 'MBBS (3rd Year)',
      studentId: 'DMC-2022-034',
      academicYear: '3rd Year',
      district: 'Dhaka',
      area: 'Bakshibazar',
      experience: '3 years',
      mediums: ['Bangla Medium', 'English Version'],
      subjects: ['Biology', 'General Math', 'General Science'],
      verificationStatus: 'verified',
      status: 'active',
      expectedSalary: 6000,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SadiaI',
      rating: 4.9,
      message: 'Top-scoring tutor at DMC with great patience and disciplined teaching methodology. Specialized in Class 9-10 science and math.',
      appliedAt: new Date(Date.now() - 3600000 * 40).toISOString(),
    },
    {
      id: 'APP-101',
      tuitionId: 'JOB-80703',
      tutorId: 'TT-1001',
      tutorCode: 'TT-1001',
      name: 'Muntasir Mamun',
      phone: '01700000001',
      email: 'muntasir@example.com',
      gender: 'Male',
      university: 'BUET',
      department: 'Computer Science & Engineering',
      studentId: '1905001',
      academicYear: 'Final Year / Graduate',
      district: 'Dhaka',
      area: 'Mirpur',
      experience: '3 years',
      mediums: ['Bangla Medium', 'English Version'],
      subjects: ['Physics', 'Higher Math', 'Chemistry'],
      verificationStatus: 'verified',
      status: 'active',
      expectedSalary: 4500,
      message: 'Experienced BUET tutor living in Mirpur. I have 3+ years tutoring Class 6-10 students in Math and Science with proven track record.',
      appliedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: 'APP-102',
      tuitionId: 'JOB-80707',
      tutorId: 'TT-1003',
      tutorCode: 'TT-1003',
      name: 'Rahim Uddin',
      phone: '01700000003',
      email: 'rahim@example.com',
      gender: 'Male',
      university: 'CUET',
      department: 'Electrical & Electronic Engineering (EEE)',
      studentId: '1802054',
      academicYear: 'Graduate',
      district: 'Chittagong',
      area: 'Agrabad',
      experience: '5 years',
      mediums: ['Bangla Medium'],
      subjects: ['Physics', 'Mathematics'],
      verificationStatus: 'pending',
      status: 'active',
      expectedSalary: 5000,
      message: 'Passionate math and science tutor with 5 years experience helping students achieve A+ in SSC board exams.',
      appliedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    }
  ];

  mockGuardians = [
    { id: 'G-001', fullName: 'Md. Rahman', phone: '01712345678', location: 'Mirpur, Dhaka', status: 'Active', totalTuitions: 2, activeTuitions: 1 },
    { id: 'G-002', fullName: 'Mrs. Ahmed', phone: '01798765432', location: 'Banani, Dhaka', status: 'Active', totalTuitions: 1, activeTuitions: 0 },
    { id: 'G-003', fullName: 'muntasir', phone: '01881167556', location: 'mirpur', status: 'Active', totalTuitions: 1, activeTuitions: 1 },
    { id: 'G-004', fullName: 'Parent', phone: '01715998756', location: 'Dhanmondi, Dhaka', status: 'Active', totalTuitions: 3, activeTuitions: 2 },
  ];

  mockPayments = [
    { id: 'PAY-001', tuitionId: 'JOB-80703', tutorId: 'TT-1001', amount: 4000, method: 'bKash', status: 'COMPLETED', date: '2026-08-01' },
    { id: 'PAY-002', tuitionId: 'JOB-80704', tutorId: 'TT-1002', amount: 6000, method: 'Nagad', status: 'PENDING', date: '2026-08-05' },
    { id: 'PAY-003', tuitionId: 'JOB-80709', tutorId: 'TT-1001', amount: 5500, method: 'bKash', status: 'COMPLETED', date: '2026-07-20' },
  ];

  mockDemos = [
    { 
      id: 'D-801', 
      tuitionId: 'T-1024', 
      jobCode: 'T-1024',
      tutorId: 'TT-1005', 
      tutorCode: 'TT-1005',
      tutorName: 'Karim Hossain', 
      university: 'Dhaka University',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Karim',
      guardianName: 'Parent', 
      guardianPhone: '01715998756', 
      date: 'Oct 28, 2026',
      scheduledDate: '2026-10-28T17:00:00.000Z',
      time: '05:00 PM', 
      status: 'Scheduled',
      location: 'Dhanmondi, Dhaka (Home)',
      meetingLink: 'https://meet.google.com/abc-demo-t1024',
      notes: 'Demo class for Mathematics (Class 9). Topic: Chapter 3 Algebraic Expressions.'
    },
    { id: 'DEMO-001', tuitionId: 'JOB-80705', tutorId: 'TT-1001', tutorName: 'Muntasir Mamun', guardianName: 'Mr. Karim', guardianPhone: '01711111111', date: '2026-08-15', status: 'Scheduled' },
    { id: 'DEMO-002', tuitionId: 'JOB-80707', tutorId: 'TT-1003', tutorName: 'Rahim Uddin', guardianName: 'Mr. Ali', guardianPhone: '01822222222', date: '2026-08-10', status: 'Completed' },
  ];

  mockTeacherAlerts = [
    {
      id: 'ALERT-101',
      jobId: 'JOB-80707',
      jobTitle: 'SSC Math Tuition in Sylhet',
      tutorId: 'TT-1003',
      tutorName: 'Rahim Uddin',
      tutorUniversity: 'CUET',
      tutorDepartment: 'Electrical & Electronic Engineering (EEE)',
      expectedSalary: 5000,
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      isRead: false
    }
  ];

  mockNotifications = [
    {
      id: 'NOTIF-001',
      tutorId: 'TT-1001',
      tutorCode: 'TT-1001',
      type: 'DEMO_SCHEDULED',
      title: 'Demo Class Scheduled',
      message: 'You have been selected for a demo class for O Level Physics Tuition in Gulshan on Aug 15, 2026.',
      tuitionId: 'JOB-80705',
      jobCode: 'JOB-80705',
      scheduledDate: '2026-08-15',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
    }
  ];
}

initMockData();

const getMockTuitions = () => mockTuitions.map(mapTuitionToOld);
const getMockTutors = () => mockTutors.map(mapTutorToOld);
const getMockGuardians = () => mockGuardians.map((g: any) => ({ ...g, name: g.fullName }));

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());
  app.use(cookieParser());

  try { await seedDatabase(); } catch (e) { console.error("Failed to seed db:", e); }

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { role, username, password, phoneOrEmail } = req.body;
      let userProfile = null;
      
      if (role === 'admin' || role === 'super-admin') {
        if (username === 'superadmin' && password === 'admin123') {
          userProfile = { id: 'ADM-001', name: 'Super Admin', username: 'superadmin', role: 'super-admin' };
        } else if (username === 'coadmin' && password === 'admin123') {
          userProfile = { id: 'ADM-002', name: 'Co Admin', username: 'coadmin', role: 'admin' };
        } else {
          return res.status(401).json({ error: 'Invalid admin credentials' });
        }
      } else {
        const matchedTutor = mockTutors.find((t: any) => 
          (t.phone && t.phone === phoneOrEmail) || 
          (t.email && t.email === phoneOrEmail) || 
          (t.tutorCode && t.tutorCode === phoneOrEmail)
        );

        userProfile = { 
          id: matchedTutor?.userId || matchedTutor?.id || ('usr-' + Date.now()), 
          name: matchedTutor?.fullName || matchedTutor?.name || phoneOrEmail || 'User', 
          role: role || 'tutor',
          phone: matchedTutor?.phone || phoneOrEmail,
          email: matchedTutor?.email || (phoneOrEmail.includes('@') ? phoneOrEmail : `${phoneOrEmail}@tutorlink.com`),
          university: matchedTutor?.university || 'University Student',
          department: matchedTutor?.department || 'General'
        };
      }
      
      const token = generateToken(userProfile);
      res.cookie('tutorlink_auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      });
      
      res.json({ success: true, user: userProfile });
    } catch (e) {
      res.status(500).json({ error: 'Login failed' });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { role, fullName, phoneOrEmail, password, university, department, gender, district, area, tutoringExperience } = req.body;
      const userProfile = { 
        id: 'usr-' + Date.now(), 
        name: fullName || phoneOrEmail, 
        role: role, 
        university: university || null,
        department: department || null,
        email: phoneOrEmail.includes('@') ? phoneOrEmail : `${phoneOrEmail}@tutorlink.com`,
        phone: phoneOrEmail 
      };

      let newTutorProfile: any = null;
      if (role === 'tutor') {
        const tutorCode = 'TT-' + Math.floor(10000 + Math.random() * 90000);
        newTutorProfile = {
          id: tutorCode,
          tutorCode: tutorCode,
          userId: userProfile.id,
          fullName: fullName || 'New Tutor',
          name: fullName || 'New Tutor',
          phone: phoneOrEmail,
          email: userProfile.email,
          university: university || 'Dhaka University',
          department: department || 'General',
          gender: gender || 'Male',
          district: district || 'Dhaka',
          city: district || 'Dhaka',
          area: area || 'Mirpur',
          location: `${area || 'Mirpur'}, ${district || 'Dhaka'}`,
          status: 'active',
          tutoringExperience: tutoringExperience ? parseInt(tutoringExperience.toString()) : 1,
          profileCompletion: 70,
          completion: 70,
          verified: false,
          verificationStatus: 'pending',
          nidStatus: 'Pending Verification',
          expectedSalaryMin: 5000,
          expectedSalaryMax: 8000,
          expectedSalary: '5000 - 8000 BDT',
          subjects: ['General Math', 'English', 'Science'],
          mediums: ['Bangla Medium', 'English Version'],
          classes: ['Class 6-8', 'Class 9-10 (SSC)'],
          tutoringMethod: ['Home Tutoring', 'Online Tutoring'],
          availableDays: ['3 days/week'],
          availableTime: '5:00 PM - 8:30 PM',
          rating: 5.0,
          reviewsCount: 0,
          dob: '2002-01-01',
          bloodGroup: 'B+',
          religion: 'Islam',
          presentAddress: `${area || 'Mirpur'}, ${district || 'Dhaka'}`,
          permanentAddress: `${district || 'Dhaka'}, Bangladesh`,
          guardianInfo: { fatherName: '', fatherPhone: '', motherName: '', motherPhone: '', emergencyContact: '' },
          tutoringInfo: { experienceYears: tutoringExperience ? parseInt(tutoringExperience.toString()) : 1, methods: ['Home Tutoring', 'Online Tutoring'], timeSlots: '5:00 PM - 8:30 PM', preferredAreas: [area || 'Mirpur'] },
          educationHistory: [
            { degree: 'B.Sc / Honours (Current)', institute: university || 'University', boardOrGroup: department || 'General', passingYear: '2026', result: 'Enrolled' },
            { degree: 'HSC', institute: 'College', boardOrGroup: 'Science', passingYear: '2021', result: 'GPA 5.00' }
          ]
        };
        mockTutors.unshift(newTutorProfile);

        // Attempt save in database
        try {
          const [prof] = await db.insert(profiles).values({
            fullName: userProfile.name,
            phone: userProfile.phone,
            email: userProfile.email,
            accountStatus: 'active'
          }).returning();

          if (prof) {
            await db.insert(tutorProfiles).values({
              userId: prof.id,
              tutorCode: tutorCode,
              fullName: newTutorProfile.fullName,
              university: newTutorProfile.university,
              department: newTutorProfile.department,
              gender: newTutorProfile.gender,
              district: newTutorProfile.district,
              area: newTutorProfile.area,
              tutoringExperience: newTutorProfile.tutoringExperience,
              profileCompletion: 70,
              verificationStatus: 'pending',
              status: 'active'
            });
          }
        } catch (dbErr) {
          console.error("DB Register error:", dbErr);
        }
      }

      const token = generateToken(userProfile);
      res.cookie('tutorlink_auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      });
      res.json({ success: true, user: userProfile, tutor: newTutorProfile ? mapTutorToOld(newTutorProfile) : undefined });
    } catch (e) {
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie('tutorlink_auth_token', { path: '/' });
    res.json({ success: true });
  });

  app.get("/api/auth/me", authMiddleware, (req, res) => {
    res.json({ user: (req as any).user });
  });

  app.post("/api/public/tutor-requirements", async (req, res) => {
    try {
      const data = req.body;
      const jobCode = 'TR-' + Math.floor(100000 + Math.random() * 900000);
      
      const subjectsArray = typeof data.subjects === 'string'
        ? data.subjects.split(',').map((s: string) => s.trim()).filter(Boolean)
        : (Array.isArray(data.subjects) ? data.subjects : (data.subjects ? [data.subjects] : []));

      const salaryNum = data.salary ? parseInt(data.salary.toString().replace(/[^0-9]/g, '')) : null;
      const studentCountNum = parseInt(data.studentsCount) || 1;

      let guardianId: string | null = null;
      if (data.guardianPhone) {
        try {
          const [existingG] = await db.select().from(guardianProfiles).where(eq(guardianProfiles.phone, data.guardianPhone));
          if (existingG) {
            guardianId = existingG.id;
          } else {
            const [newG] = await db.insert(guardianProfiles).values({
              fullName: data.guardianName || 'Guest Guardian',
              phone: data.guardianPhone,
              email: data.guardianEmail || null,
              address: data.location || null,
              district: data.city || 'Dhaka',
              area: data.location || null,
            }).returning();
            if (newG) guardianId = newG.id;
          }
        } catch (gErr) {
          console.error("Guardian DB error:", gErr);
        }
      }

      let insertedId = 'REQ-' + Date.now();
      try {
        const [insertedReq] = await db.insert(tuitionRequests).values({
          jobCode,
          guardianId: guardianId || null,
          title: `Need tutor for ${data.course || 'Tuition'} - ${data.subjects || ''}`,
          curriculum: data.course || null,
          courseClass: data.course || null,
          subjects: subjectsArray,
          studentCount: studentCountNum,
          studentGender: data.studentGender || 'Mix',
          preferredTutorGender: data.tutorGender || 'Any',
          daysPerWeek: data.daysPerWeek || '3 days',
          preferredTime: data.time || 'Flexible',
          duration: data.duration || '1 Hour',
          method: data.method || 'Home Tutoring',
          salaryMin: salaryNum,
          salaryMax: salaryNum,
          fullAddress: data.location || null,
          area: data.location || null,
          district: data.city || 'Dhaka',
          parentSpecialInstructions: data.notes || '',
          status: 'pending_review',
          visibility: 'public',
        }).returning();

        if (insertedReq) {
          insertedId = insertedReq.id;
        }
      } catch (dbErr) {
        console.error("Tuition insert DB error:", dbErr);
      }

      const newReq = {
        id: jobCode,
        realId: insertedId,
        jobCode,
        title: `Need tutor for ${data.course || ''} - ${data.subjects || ''}`,
        course: data.course || '',
        courseClass: data.course || '',
        curriculum: data.course || '',
        category: data.course ? `Class ${data.course}` : 'General',
        subjects: subjectsArray,
        tutorGender: data.tutorGender || 'Any',
        preferredTutorGender: data.tutorGender || 'Any',
        studentGender: data.studentGender || 'Mix',
        studentsCount: studentCountNum.toString(),
        studentCount: studentCountNum,
        daysPerWeek: data.daysPerWeek || '3 days',
        time: data.time || 'Flexible',
        preferredTime: data.time || 'Flexible',
        duration: data.duration || '1 Hour',
        method: data.method || 'Home Tutoring',
        salary: salaryNum ? salaryNum.toString() : (data.salary || ''),
        salaryMax: salaryNum,
        salaryMin: salaryNum,
        notes: data.notes || '',
        parentSpecialInstructions: data.notes || '',
        location: data.location || '',
        fullAddress: data.location || '',
        area: data.location || '',
        district: data.city || 'Dhaka',
        city: data.city || 'Dhaka',
        guardianName: data.guardianName || 'Guest Guardian',
        guardianPhone: data.guardianPhone || '',
        guardianEmail: data.guardianEmail || '',
        status: 'PENDING_REVIEW',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 0,
        applications: 0
      };

      mockTuitions.unshift(newReq);
      res.json({ success: true, request: newReq });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to submit request" });
    }
  });

  app.get("/api/tuitions", async (req, res) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    let isAuthAdmin = false;
    try {
      let token = req.cookies?.tutorlink_auth_token;
      if (req.headers.authorization?.startsWith('Bearer ')) token = req.headers.authorization.substring(7);
      if (token) {
        const u: any = verifyToken(token);
        if (u && (u.role === 'admin' || u.role === 'super-admin')) isAuthAdmin = true;
      }
    } catch(e) {}

    try {
      const results = await db.select({
        t: tuitionRequests,
        g: guardianProfiles,
        appCount: sql<number>`(SELECT count(*) FROM ${tutorApplications} WHERE tuition_id = ${tuitionRequests.id})`
      }).from(tuitionRequests)
      .leftJoin(guardianProfiles, eq(tuitionRequests.guardianId, guardianProfiles.id))
      .where(sql`lower(${tuitionRequests.status}) IN ('open', 'approved', 'teachers_applied', 'shortlisted')`)
      .orderBy(desc(tuitionRequests.createdAt));

      const dbTuitions = results.map((r: any) => ({
        ...r.t,
        guardianName: r.g?.fullName,
        guardianPhone: r.g?.phone,
        guardianAddress: r.g?.address,
        appCount: r.appCount
      })).map(mapTuitionToOld);

      const existingIds = new Set<string>();
      dbTuitions.forEach((t: any) => {
        if (t.id) existingIds.add(String(t.id));
        if (t.jobCode) existingIds.add(String(t.jobCode));
        if (t.realId) existingIds.add(String(t.realId));
      });

      const extraMocks = getMockTuitions()
        .filter((t: any) => t.status === 'OPEN' || t.status === 'APPROVED' || t.status === 'CONFIRMED' || t.status === 'TEACHERS_APPLIED' || t.status === 'SHORTLISTED')
        .filter((m: any) => !existingIds.has(String(m.id)) && !existingIds.has(String(m.jobCode)) && (!m.realId || !existingIds.has(String(m.realId))));

      const all = [...dbTuitions, ...extraMocks].map(t => maskContactDetailsForPublic(t, isAuthAdmin));
      res.json(all);
    } catch (e) {
      const fallback = getMockTuitions()
        .filter((t: any) => t.status === 'OPEN' || t.status === 'APPROVED' || t.status === 'CONFIRMED' || t.status === 'TEACHERS_APPLIED' || t.status === 'SHORTLISTED')
        .map(t => maskContactDetailsForPublic(t, isAuthAdmin));
      res.json(fallback);
    }
  });

  app.get("/api/tuitions/:id", async (req, res) => {
    let isAuthAdmin = false;
    try {
      let token = req.cookies?.tutorlink_auth_token;
      if (req.headers.authorization?.startsWith('Bearer ')) token = req.headers.authorization.substring(7);
      if (token) {
        const u: any = verifyToken(token);
        if (u && (u.role === 'admin' || u.role === 'super-admin')) isAuthAdmin = true;
      }
    } catch(e) {}

    try {
      const paramId = req.params.id;
      const [result] = await db.select({
        t: tuitionRequests,
        g: guardianProfiles,
        appCount: sql<number>`(SELECT count(*) FROM ${tutorApplications} WHERE tuition_id = ${tuitionRequests.id})`
      }).from(tuitionRequests)
      .leftJoin(guardianProfiles, eq(tuitionRequests.guardianId, guardianProfiles.id))
      .where(sql`${tuitionRequests.id}::text = ${paramId} OR ${tuitionRequests.jobCode} = ${paramId}`);

      if (result) {
        const tuition = {
          ...result.t,
          guardianName: result.g?.fullName,
          guardianPhone: result.g?.phone,
          guardianAddress: result.g?.address,
          appCount: result.appCount
        };
        return res.json(maskContactDetailsForPublic(mapTuitionToOld(tuition), isAuthAdmin));
      }

      const mock = mockTuitions.find((t: any) => t.id === paramId || t.jobCode === paramId);
      if (mock) {
        return res.json(maskContactDetailsForPublic(mapTuitionToOld(mock), isAuthAdmin));
      }
      res.status(404).json({ error: "Not found" });
    } catch (e) {
      const mock = mockTuitions.find((t: any) => t.id === req.params.id || t.jobCode === req.params.id);
      if (mock) {
        res.json(maskContactDetailsForPublic(mapTuitionToOld(mock), isAuthAdmin));
      } else {
        res.status(404).json({ error: "Not found" });
      }
    }
  });

  app.get("/api/tutors", async (_req, res) => {
    try {
      const allTutors = await db.select().from(tutorProfiles);
      if (allTutors.length > 0) {
        res.json(allTutors.map(mapTutorToOld));
      } else {
        res.json(getMockTutors());
      }
    } catch (e) {
      res.json(getMockTutors());
    }
  });

  // Logged-in Tutor's Own Profile
  app.get("/api/tutor/me", authMiddleware, async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) return res.status(401).json({ error: "Unauthorized" });

      // Look in mock first or DB
      const mock = mockTutors.find((m: any) => 
        (m.phone && m.phone === user.phone) ||
        (m.email && m.email === user.email) ||
        (m.id === user.id || m.userId === user.id) ||
        (user.name && m.fullName && m.fullName.toLowerCase() === user.name.toLowerCase())
      );

      if (mock) {
        return res.json(mapTutorToOld(mock));
      }

      try {
        const dbTutors = await db.select().from(tutorProfiles)
          .leftJoin(profiles, eq(tutorProfiles.userId, profiles.id))
          .where(sql`${profiles.phone} = ${user.phone || user.name} OR ${profiles.id}::text = ${user.id}`).limit(1);

        if (dbTutors.length > 0) {
          return res.json(mapTutorToOld({ ...dbTutors[0].tutor_profiles, phone: dbTutors[0].profiles?.phone, email: dbTutors[0].profiles?.email }));
        }
      } catch (err) {}

      // If not found yet, initialize a profile for this user
      const tutorCode = 'TT-' + Math.floor(10000 + Math.random() * 90000);
      const newTutor = {
        id: tutorCode,
        tutorCode,
        userId: user.id,
        fullName: user.name || 'Registered Tutor',
        name: user.name || 'Registered Tutor',
        phone: user.phone || '01700000000',
        email: user.email || `${user.phone || 'tutor'}@tutorlink.com`,
        university: user.university || 'University Student',
        department: 'General',
        gender: 'Male',
        district: 'Dhaka',
        area: 'Mirpur',
        status: 'active',
        profileCompletion: 70,
        completion: 70,
        verified: false,
        verificationStatus: 'pending',
        nidStatus: 'Pending Verification',
      };
      mockTutors.unshift(newTutor);
      res.json(mapTutorToOld(newTutor));
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to fetch tutor profile" });
    }
  });

  // Single Tutor Profile with Role-Based Masking
  app.get("/api/tutors/:id", async (req, res) => {
    try {
      const { id } = req.params;

      // Determine viewer permissions
      let tokenUser: any = null;
      let token = req.cookies?.tutorlink_auth_token;
      if (req.headers.authorization?.startsWith('Bearer ')) {
        token = req.headers.authorization.substring(7);
      }
      if (token) {
        tokenUser = verifyToken(token);
      }

      const isAdmin = tokenUser?.role === 'admin' || tokenUser?.role === 'super-admin';
      const isOwner = tokenUser && (tokenUser.id === id || tokenUser.phone);

      let found = mockTutors.find((t: any) => t.id === id || t.tutorCode === id);
      if (!found) {
        try {
          const dbT = await db.select().from(tutorProfiles)
            .leftJoin(profiles, eq(tutorProfiles.userId, profiles.id))
            .where(sql`${tutorProfiles.id}::text = ${id} OR ${tutorProfiles.tutorCode} = ${id}`).limit(1);
          if (dbT.length > 0) {
            found = { ...dbT[0].tutor_profiles, phone: dbT[0].profiles?.phone, email: dbT[0].profiles?.email };
          }
        } catch(e) {}
      }

      if (!found) {
        const appMatch = mockApplications.find((a: any) => 
          a.tutorId === id || a.tutorCode === id || a.id === id || a.phone === id
        );
        if (appMatch) {
          found = {
            id: appMatch.tutorId || appMatch.tutorCode || id,
            tutorCode: appMatch.tutorCode || id,
            name: appMatch.name,
            fullName: appMatch.name,
            phone: appMatch.phone,
            email: appMatch.email,
            university: appMatch.university,
            department: appMatch.department,
            gender: appMatch.gender,
            district: appMatch.district || 'Dhaka',
            area: appMatch.area || 'Dhaka',
            tutoringExperience: 2,
            status: appMatch.status || 'active',
            verified: true,
            mediums: appMatch.mediums || ['Bangla Medium', 'English Version'],
            subjects: appMatch.subjects || ['All Subjects'],
            studentId: appMatch.studentId,
            academicYear: appMatch.academicYear
          };
        }
      }

      if (!found) {
        return res.status(404).json({ error: "Tutor not found" });
      }

      const mapped = mapTutorToOld(found);

      // If viewing as Guardian or Guest: mask phone, email, emergency contacts for privacy
      if (!isAdmin && !isOwner) {
        const p = mapped.phone || '';
        mapped.phone = p.length >= 6 ? `${p.substring(0, 3)}****${p.substring(p.length - 2)}` : 'Protected by Admin';
        const em = mapped.email || '';
        mapped.email = em.includes('@') ? `${em.substring(0, 2)}***@${em.split('@')[1]}` : 'Protected by Admin';
        if (mapped.guardianInfo) {
          mapped.guardianInfo = {
            ...mapped.guardianInfo,
            fatherPhone: 'Protected for privacy',
            motherPhone: 'Protected for privacy',
            emergencyContact: 'Protected for privacy'
          };
        }
      }

      res.json(mapped);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch tutor" });
    }
  });

  // Tutor Profile Update
  app.put("/api/tutor/profile", authMiddleware, async (req, res) => {
    try {
      const user = (req as any).user;
      const data = req.body;

      // Calculate profile completion percentage based on filled sections
      let score = 20; // base for registration
      if (data.name && data.gender && data.dob && data.bloodGroup) score += 20;
      if (data.university && data.department) score += 20;
      if (Array.isArray(data.educationHistory) && data.educationHistory.length > 0) score += 15;
      if (Array.isArray(data.subjects) && data.subjects.length > 0) score += 10;
      if (Array.isArray(data.mediums) && data.mediums.length > 0) score += 5;
      if (data.guardianInfo?.fatherName || data.guardianInfo?.emergencyContact) score += 10;
      score = Math.min(score, 100);

      const targetId = data.id || data.tutorCode || user?.id;
      const mockIdx = mockTutors.findIndex((m: any) => 
        (targetId && (m.id === targetId || m.tutorCode === targetId)) ||
        (user && (m.phone === user.phone || m.id === user.id))
      );

      const updatedData: any = {
        fullName: data.name || data.fullName,
        name: data.name || data.fullName,
        gender: data.gender,
        dob: data.dob,
        dateOfBirth: data.dob,
        bloodGroup: data.bloodGroup,
        religion: data.religion,
        university: data.university,
        department: data.department,
        studentId: data.studentId,
        academicYear: data.academicYear,
        district: data.city || data.district,
        city: data.city || data.district,
        area: data.location || data.area,
        location: `${data.area || data.location || 'Mirpur'}, ${data.city || data.district || 'Dhaka'}`,
        presentAddress: data.presentAddress,
        permanentAddress: data.permanentAddress,
        phone: data.phone || user?.phone,
        email: data.email || user?.email,
        expectedSalaryMin: data.expectedSalaryMin || (data.expectedSalary ? parseInt(data.expectedSalary.toString().replace(/[^0-9]/g, '')) : 5000),
        expectedSalaryMax: data.expectedSalaryMax || 8000,
        expectedSalary: data.expectedSalary || `${data.expectedSalaryMin || 5000} - ${data.expectedSalaryMax || 8000} BDT`,
        tutoringExperience: data.experienceYears ?? data.tutoringExperience ?? 2,
        experienceYears: data.experienceYears ?? data.tutoringExperience ?? 2,
        subjects: data.subjects || [],
        mediums: data.mediums || [],
        classes: data.classes || [],
        tutoringMethod: data.tutoringInfo?.methods || data.tutoringMethod || ['Home Tutoring'],
        availableDays: data.tutoringInfo?.availableDays || data.availableDays || ['3 days/week'],
        availableTime: data.tutoringInfo?.timeSlots || data.availableTime || '5:00 PM - 9:00 PM',
        preferredAreas: data.tutoringInfo?.preferredAreas || data.preferredAreas || [],
        guardianInfo: data.guardianInfo || { fatherName: '', fatherPhone: '', motherName: '', motherPhone: '', emergencyContact: '' },
        tutoringInfo: {
          experienceYears: data.experienceYears ?? data.tutoringExperience ?? 2,
          methods: data.tutoringInfo?.methods || data.tutoringMethod || ['Home Tutoring'],
          timeSlots: data.tutoringInfo?.timeSlots || data.availableTime || '5:00 PM - 9:00 PM',
          preferredAreas: data.tutoringInfo?.preferredAreas || data.preferredAreas || [],
          availableDays: data.tutoringInfo?.availableDays || data.availableDays || ['3 days/week']
        },
        educationHistory: data.educationHistory || [],
        profileCompletion: score,
        completion: score,
        updatedAt: new Date().toISOString()
      };

      if (mockIdx >= 0) {
        mockTutors[mockIdx] = { ...mockTutors[mockIdx], ...updatedData };
      } else {
        const newCode = targetId || 'TT-' + Math.floor(10000 + Math.random() * 90000);
        mockTutors.unshift({
          id: newCode,
          tutorCode: newCode,
          status: 'active',
          verified: false,
          verificationStatus: 'pending',
          rating: 5.0,
          reviewsCount: 1,
          ...updatedData
        });
      }

      // Sync with Supabase / Postgres if DB is online
      try {
        await db.update(tutorProfiles).set({
          fullName: updatedData.fullName,
          gender: updatedData.gender,
          dateOfBirth: updatedData.dob,
          university: updatedData.university,
          department: updatedData.department,
          studentId: updatedData.studentId,
          academicYear: updatedData.academicYear,
          district: updatedData.district,
          area: updatedData.area,
          presentAddress: updatedData.presentAddress,
          permanentAddress: updatedData.permanentAddress,
          expectedSalaryMin: updatedData.expectedSalaryMin,
          expectedSalaryMax: updatedData.expectedSalaryMax,
          tutoringExperience: updatedData.tutoringExperience,
          subjects: updatedData.subjects,
          mediums: updatedData.mediums,
          classes: updatedData.classes,
          profileCompletion: score,
          updatedAt: new Date()
        }).where(sql`${tutorProfiles.tutorCode} = ${targetId} OR ${tutorProfiles.id}::text = ${targetId}`);
      } catch (dbErr) {}

      res.json({ success: true, tutor: mapTutorToOld(mockIdx >= 0 ? mockTutors[mockIdx] : updatedData) });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message || "Failed to update profile" });
    }
  });

  // Helper to find or establish tutor profile for user
  const resolveTutorProfile = async (user: any) => {
    if (!user) return null;
    let tutor = mockTutors.find((m: any) => 
      (user.id && (m.id === user.id || m.tutorCode === user.id || m.userId === user.id)) ||
      (user.phone && m.phone === user.phone) ||
      (user.email && m.email === user.email)
    );

    if (!tutor) {
      try {
        const dbT = await db.select().from(tutorProfiles)
          .where(sql`${tutorProfiles.userId}::text = ${user.id} OR ${tutorProfiles.primaryPhone} = ${user.phone}`).limit(1);
        if (dbT.length > 0) tutor = dbT[0];
      } catch (e) {}
    }

    if (!tutor) {
      const code = 'TT-' + Math.floor(10000 + Math.random() * 90000);
      tutor = {
        id: code,
        tutorCode: code,
        userId: user.id,
        fullName: user.name || 'Tutor',
        phone: user.phone,
        primaryPhone: user.phone,
        email: user.email,
        status: 'active',
        verificationStatus: 'pending',
        university: user.university || 'University Student',
        department: user.department || 'General',
        mediums: ['Bangla Medium', 'English Version'],
        classes: ['Class 9-10 (SSC)'],
        subjects: ['Mathematics'],
        preferredAreas: ['Mirpur', 'Dhanmondi'],
        profileCompletion: 45,
        rating: 5.0,
        reviewsCount: 0
      };
      mockTutors.unshift(tutor);
    }
    return tutor;
  };

  // =====================================================================
  // COMPLETE TUTOR PROFILE API MODULE (/api/tutor/me/...)
  // =====================================================================

  // 1. Get Full Private Profile
  app.get("/api/tutor/me/profile", authMiddleware, async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) return res.status(401).json({ error: "Unauthorized" });

      const tutor = await resolveTutorProfile(user);
      if (!tutor) return res.status(404).json({ error: "Tutor profile not found" });

      // Aggregate normalized records
      let education: any[] = tutor.educationHistory || [];
      let experience: any[] = [];
      let preferences: any = tutor.tutoringInfo || {};
      let areas: any[] = tutor.preferredAreas || [];
      let availability: any[] = tutor.availableDays || [];
      let documents: any[] = [];
      let paymentInfo: any = {};
      let emergencyContacts: any = tutor.guardianInfo || {};

      try {
        const dbEdu = await db.select().from(tutorEducation).where(sql`${tutorEducation.tutorId}::text = ${tutor.id} OR ${tutorEducation.tutorId}::text = ${user.id}`);
        if (dbEdu.length > 0) education = dbEdu;

        const dbExp = await db.select().from(tutorExperience).where(sql`${tutorExperience.tutorId}::text = ${tutor.id} OR ${tutorExperience.tutorId}::text = ${user.id}`);
        if (dbExp.length > 0) experience = dbExp;

        const dbPref = await db.select().from(tutorPreferences).where(sql`${tutorPreferences.tutorId}::text = ${tutor.id} OR ${tutorPreferences.tutorId}::text = ${user.id}`).limit(1);
        if (dbPref.length > 0) preferences = dbPref[0];

        const dbDocs = await db.select().from(tutorDocuments).where(sql`${tutorDocuments.tutorId}::text = ${tutor.id} OR ${tutorDocuments.tutorId}::text = ${user.id}`);
        if (dbDocs.length > 0) documents = dbDocs;

        const dbPay = await db.select().from(tutorPaymentInfo).where(sql`${tutorPaymentInfo.tutorId}::text = ${tutor.id} OR ${tutorPaymentInfo.tutorId}::text = ${user.id}`).limit(1);
        if (dbPay.length > 0) paymentInfo = dbPay[0];

        const dbEm = await db.select().from(tutorEmergencyContacts).where(sql`${tutorEmergencyContacts.tutorId}::text = ${tutor.id} OR ${tutorEmergencyContacts.tutorId}::text = ${user.id}`).limit(1);
        if (dbEm.length > 0) emergencyContacts = dbEm[0];
      } catch (dbErr) {}

      const completion = computeProfileCompletion(tutor, {
        education,
        experience,
        preferences,
        areas,
        availability,
        documents,
        emergency: emergencyContacts
      });

      res.json({
        profile: {
          ...tutor,
          education,
          experience,
          preferences,
          areas,
          availability,
          documents,
          paymentInfo,
          emergencyContacts,
          completionScore: completion.score
        },
        completion
      });
    } catch (e: any) {
      console.error("Failed to load profile:", e);
      res.status(500).json({ error: "Failed to load tutor profile" });
    }
  });

  // 2. PATCH Profile by Section with Zod Validation & Audit Log
  app.patch("/api/tutor/me/profile/:section", authMiddleware, async (req, res) => {
    try {
      const user = (req as any).user;
      const { section } = req.params;
      const body = req.body;
      const tutor = await resolveTutorProfile(user);
      if (!tutor) return res.status(404).json({ error: "Tutor profile not found" });

      let validatedData: any = {};

      if (section === 'personal') {
        validatedData = personalSectionSchema.parse(body);
        if (validatedData.shortBio) validatedData.shortBio = sanitizeBioText(validatedData.shortBio);
        if (validatedData.tagline) validatedData.tagline = sanitizeBioText(validatedData.tagline);
        tutor.fullName = validatedData.fullName;
        tutor.name = validatedData.fullName;
        tutor.gender = validatedData.gender;
        tutor.dateOfBirth = validatedData.dateOfBirth;
        tutor.dob = validatedData.dateOfBirth;
        tutor.bloodGroup = validatedData.bloodGroup;
        tutor.religion = validatedData.religion;
        tutor.maritalStatus = validatedData.maritalStatus;
        tutor.nationality = validatedData.nationality;
        tutor.nidNumber = validatedData.nidNumber;
        tutor.tagline = validatedData.tagline;
        tutor.shortBio = validatedData.shortBio;
        if (validatedData.photo) tutor.profilePhotoUrl = validatedData.photo;
      } else if (section === 'contact') {
        validatedData = contactSectionSchema.parse(body);
        tutor.phone = validatedData.primaryPhone;
        tutor.primaryPhone = validatedData.primaryPhone;
        tutor.secondaryPhone = validatedData.secondaryPhone;
        tutor.whatsappNumber = validatedData.whatsappNumber;
        tutor.email = validatedData.email;
        tutor.presentAddress = validatedData.presentAddress;
        tutor.permanentAddress = validatedData.permanentAddress;
        tutor.sameAsPresentAddress = validatedData.sameAsPresentAddress;
      } else if (section === 'preferences') {
        validatedData = preferencesSectionSchema.parse(body);
        tutor.mediums = validatedData.mediums;
        tutor.classes = validatedData.classes;
        tutor.subjects = validatedData.subjects;
        tutor.expectedSalaryMin = validatedData.expectedSalaryMin;
        tutor.expectedSalaryMax = validatedData.expectedSalaryMax;
        tutor.expectedSalary = `৳${validatedData.expectedSalaryMin} - ৳${validatedData.expectedSalaryMax}`;
        tutor.tutoringMethod = validatedData.tuitionTypes;
        tutor.availableDays = validatedData.preferredDaysPerWeek ? [validatedData.preferredDaysPerWeek] : tutor.availableDays;
      } else if (section === 'areas') {
        validatedData = areasSectionSchema.parse(body);
        tutor.preferredAreas = validatedData.preferredAreas;
      } else if (section === 'availability') {
        validatedData = availabilitySectionSchema.parse(body);
        tutor.availableSlots = validatedData.slots;
        tutor.isOpenForTuition = validatedData.isOpenForTuition;
      } else if (section === 'payment') {
        validatedData = paymentInfoSectionSchema.parse(body);
        tutor.paymentInfo = validatedData;
      } else if (section === 'emergency') {
        validatedData = emergencyContactSectionSchema.parse(body);
        tutor.guardianInfo = validatedData;
      } else if (section === 'privacy') {
        validatedData = privacySectionSchema.parse(body);
        tutor.profileVisibility = validatedData.profileVisibility;
        tutor.hideLastName = validatedData.hideLastName;
      } else {
        return res.status(400).json({ error: `Invalid profile section: ${section}` });
      }

      // Recompute completion score
      const completion = computeProfileCompletion(tutor);
      tutor.profileCompletion = completion.score;
      tutor.completion = completion.score;
      tutor.updatedAt = new Date().toISOString();

      // Record Audit Log if DB connected
      try {
        if (user.id) {
          await db.insert(profileAuditLogs).values({
            userId: user.id,
            changedBy: user.id,
            section,
            newValue: JSON.stringify(validatedData),
            ipAddress: req.ip || '',
            userAgent: req.headers['user-agent'] || ''
          });
        }
      } catch (auditErr) {}

      res.json({
        success: true,
        message: `${section.charAt(0).toUpperCase() + section.slice(1)} information updated successfully!`,
        section,
        profile: tutor,
        completion
      });
    } catch (e: any) {
      if (e?.name === 'ZodError') {
        return res.status(400).json({ error: e.errors?.[0]?.message || 'Validation failed', details: e.errors });
      }
      console.error(`Error saving ${req.params.section}:`, e);
      res.status(500).json({ error: e.message || 'Failed to update section' });
    }
  });

  // 3. Education CRUD
  app.post("/api/tutor/me/education", authMiddleware, async (req, res) => {
    try {
      const user = (req as any).user;
      const validated = educationEntrySchema.parse(req.body);
      const tutor = await resolveTutorProfile(user);
      if (!tutor) return res.status(404).json({ error: "Tutor profile not found" });

      const newId = validated.id || ('edu-' + Date.now());
      const newEntry = { ...validated, id: newId, tutorId: tutor.id, createdAt: new Date() };

      tutor.educationHistory = tutor.educationHistory || [];
      tutor.educationHistory.unshift(newEntry);

      try {
        await db.insert(tutorEducation).values({
          level: validated.level,
          degreeName: validated.degreeName,
          groupMajor: validated.groupMajor,
          institute: validated.institute,
          boardUniversity: validated.boardUniversity,
          passingYear: validated.passingYear,
          resultType: validated.resultType,
          resultValue: validated.resultValue,
          currentlyStudying: validated.currentlyStudying,
          expectedGraduation: validated.expectedGraduation,
          studentId: validated.studentId,
          department: validated.department,
          academicYear: validated.academicYear,
          certificateUrl: validated.certificateUrl,
          tutorId: tutor.id
        });
      } catch (dbErr) {}

      const completion = computeProfileCompletion(tutor);
      tutor.profileCompletion = completion.score;
      res.json({ success: true, entry: newEntry, completion });
    } catch (e: any) {
      if (e?.name === 'ZodError') {
        return res.status(400).json({ error: e.errors?.[0]?.message || 'Validation failed' });
      }
      res.status(500).json({ error: e.message || 'Failed to add education record' });
    }
  });

  app.delete("/api/tutor/me/education/:id", authMiddleware, async (req, res) => {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      const tutor = await resolveTutorProfile(user);
      if (!tutor) return res.status(404).json({ error: "Tutor profile not found" });

      tutor.educationHistory = (tutor.educationHistory || []).filter((e: any) => e.id !== id);

      try {
        await db.delete(tutorEducation).where(sql`${tutorEducation.id}::text = ${id} AND ${tutorEducation.tutorId}::text = ${tutor.id}`);
      } catch (dbErr) {}

      const completion = computeProfileCompletion(tutor);
      tutor.profileCompletion = completion.score;
      res.json({ success: true, completion });
    } catch (e: any) {
      res.status(500).json({ error: 'Failed to delete education record' });
    }
  });

  // 4. Experience CRUD
  app.post("/api/tutor/me/experience", authMiddleware, async (req, res) => {
    try {
      const user = (req as any).user;
      const validated = experienceEntrySchema.parse(req.body);
      const tutor = await resolveTutorProfile(user);
      if (!tutor) return res.status(404).json({ error: "Tutor profile not found" });

      const newId = validated.id || ('exp-' + Date.now());
      const newEntry = { ...validated, id: newId, tutorId: tutor.id, createdAt: new Date() };

      tutor.pastTuitions = tutor.pastTuitions || [];
      tutor.pastTuitions.unshift(newEntry);

      try {
        await db.insert(tutorExperience).values({
          subject: validated.subject,
          courseClass: validated.courseClass,
          duration: validated.duration,
          role: validated.role,
          referenceName: validated.referenceName,
          referencePhone: validated.referencePhone,
          description: validated.description,
          achievements: validated.achievements,
          introVideoUrl: validated.introVideoUrl,
          tutorId: tutor.id
        });
      } catch (dbErr) {}

      const completion = computeProfileCompletion(tutor);
      tutor.profileCompletion = completion.score;
      res.json({ success: true, entry: newEntry, completion });
    } catch (e: any) {
      if (e?.name === 'ZodError') {
        return res.status(400).json({ error: e.errors?.[0]?.message || 'Validation failed' });
      }
      res.status(500).json({ error: e.message || 'Failed to add experience record' });
    }
  });

  app.delete("/api/tutor/me/experience/:id", authMiddleware, async (req, res) => {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      const tutor = await resolveTutorProfile(user);
      if (!tutor) return res.status(404).json({ error: "Tutor profile not found" });

      tutor.pastTuitions = (tutor.pastTuitions || []).filter((e: any) => e.id !== id);

      try {
        await db.delete(tutorExperience).where(sql`${tutorExperience.id}::text = ${id} AND ${tutorExperience.tutorId}::text = ${tutor.id}`);
      } catch (dbErr) {}

      const completion = computeProfileCompletion(tutor);
      tutor.profileCompletion = completion.score;
      res.json({ success: true, completion });
    } catch (e: any) {
      res.status(500).json({ error: 'Failed to delete experience record' });
    }
  });

  // 5. Completion Score API
  app.get("/api/tutor/me/completion", authMiddleware, async (req, res) => {
    try {
      const user = (req as any).user;
      const tutor = await resolveTutorProfile(user);
      if (!tutor) return res.status(404).json({ error: "Tutor not found" });
      const result = computeProfileCompletion(tutor);
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: "Failed to calculate profile completion" });
    }
  });

  // 6. Public Tutor Profile Whitelist API
  app.get("/api/public/tutors/:id", async (req, res) => {
    try {
      const { id } = req.params;
      let tutor = mockTutors.find((t: any) => t.id === id || t.tutorCode === id);
      if (!tutor) {
        try {
          const dbT = await db.select().from(tutorProfiles)
            .where(sql`${tutorProfiles.id}::text = ${id} OR ${tutorProfiles.tutorCode} = ${id}`).limit(1);
          if (dbT.length > 0) tutor = dbT[0];
        } catch (e) {}
      }
      if (!tutor) return res.status(404).json({ error: "Tutor not found" });
      const serialized = serializeTutorForPublic(tutor);
      res.json(serialized);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch public tutor details" });
    }
  });

  // =====================================================================
  // UNIFIED BOOKMARKS API (/api/bookmarks)
  // =====================================================================

  // In-memory fallback if Postgres table is being created
  let mockBookmarksStore: any[] = [];

  // Get Bookmarked IDs (for lightweight icon state sync)
  app.get("/api/bookmarks/ids", authMiddleware, async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) return res.status(401).json({ error: "Unauthorized" });

      const tuitionIds: string[] = [];
      const tutorIds: string[] = [];

      try {
        const rows = await db.select({
          targetType: bookmarksTable.targetType,
          targetId: bookmarksTable.targetId
        }).from(bookmarksTable)
          .where(sql`${bookmarksTable.userId}::text = ${user.id}`);

        rows.forEach(r => {
          if (r.targetType === 'tuition') tuitionIds.push(r.targetId);
          if (r.targetType === 'tutor') tutorIds.push(r.targetId);
        });
      } catch (dbErr) {
        // Fallback to store
        mockBookmarksStore.filter(b => b.userId === user.id).forEach(b => {
          if (b.targetType === 'tuition') tuitionIds.push(b.targetId);
          if (b.targetType === 'tutor') tutorIds.push(b.targetId);
        });
      }

      res.json({ tuitionIds: Array.from(new Set(tuitionIds)), tutorIds: Array.from(new Set(tutorIds)) });
    } catch (e: any) {
      res.status(500).json({ error: "Failed to load bookmark IDs" });
    }
  });

  // Add Bookmark (Idempotent)
  app.post("/api/bookmarks", authMiddleware, async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) return res.status(401).json({ error: "Unauthorized" });

      const validated = bookmarkInputSchema.parse(req.body);

      try {
        await db.insert(bookmarksTable).values({
          userId: user.id,
          targetType: validated.targetType,
          targetId: validated.targetId,
          personalNote: validated.personalNote,
          remindMe: validated.remindMe
        }).onConflictDoNothing();
      } catch (dbErr) {
        const exists = mockBookmarksStore.some(b => b.userId === user.id && b.targetType === validated.targetType && b.targetId === validated.targetId);
        if (!exists) {
          mockBookmarksStore.push({
            id: 'bm-' + Date.now(),
            userId: user.id,
            targetType: validated.targetType,
            targetId: validated.targetId,
            personalNote: validated.personalNote,
            createdAt: new Date().toISOString()
          });
        }
      }

      res.json({ success: true, message: "Bookmarked successfully!" });
    } catch (e: any) {
      if (e?.name === 'ZodError') {
        return res.status(400).json({ error: e.errors?.[0]?.message || 'Invalid bookmark payload' });
      }
      res.status(500).json({ error: e.message || "Failed to save bookmark" });
    }
  });

  // Remove Bookmark
  app.delete("/api/bookmarks/:targetType/:targetId", authMiddleware, async (req, res) => {
    try {
      const user = (req as any).user;
      const { targetType, targetId } = req.params;
      if (!user) return res.status(401).json({ error: "Unauthorized" });

      try {
        await db.delete(bookmarksTable).where(
          sql`${bookmarksTable.userId}::text = ${user.id} AND ${bookmarksTable.targetType} = ${targetType} AND ${bookmarksTable.targetId} = ${targetId}`
        );
      } catch (dbErr) {
        mockBookmarksStore = mockBookmarksStore.filter(b => !(b.userId === user.id && b.targetType === targetType && b.targetId === targetId));
      }

      res.json({ success: true, message: "Bookmark removed" });
    } catch (e: any) {
      res.status(500).json({ error: "Failed to remove bookmark" });
    }
  });

  // List Full Bookmarks (with joined item details)
  app.get("/api/bookmarks", authMiddleware, async (req, res) => {
    try {
      const user = (req as any).user;
      const { type } = req.query; // 'tuition' or 'tutor'
      if (!user) return res.status(401).json({ error: "Unauthorized" });

      const targetType = (type as string) || (user.role === 'guardian' ? 'tutor' : 'tuition');
      let bookmarkedIds: string[] = [];

      try {
        const rows = await db.select().from(bookmarksTable)
          .where(sql`${bookmarksTable.userId}::text = ${user.id} AND ${bookmarksTable.targetType} = ${targetType}`)
          .orderBy(desc(bookmarksTable.createdAt));
        bookmarkedIds = rows.map(r => r.targetId);
      } catch (dbErr) {
        bookmarkedIds = mockBookmarksStore
          .filter(b => b.userId === user.id && b.targetType === targetType)
          .map(b => b.targetId);
      }

      if (targetType === 'tuition') {
        const idSet = new Set(bookmarkedIds);
        const allTuitions = getMockTuitions();
        const savedJobs = allTuitions.filter((t: any) => idSet.has(t.id) || idSet.has(t.jobCode));
        return res.json({ items: savedJobs, targetType });
      } else {
        const idSet = new Set(bookmarkedIds);
        const allTutors = mockTutors.map(serializeTutorForPublic);
        const savedTutorsList = allTutors.filter((t: any) => idSet.has(t.id) || idSet.has(t.tutorCode) || idSet.has(t.userId));
        return res.json({ items: savedTutorsList, targetType });
      }
    } catch (e: any) {
      res.status(500).json({ error: "Failed to fetch bookmarks" });
    }
  });

  // Tutor My Applications Endpoint
  app.get("/api/tutor/my-applications", authMiddleware, async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) return res.status(401).json({ error: "Unauthorized" });

      const myApps = mockApplications.filter((a: any) => 
        (user.id && (a.tutorId === user.id || a.tutorCode === user.id || a.userId === user.id)) ||
        (user.phone && a.phone === user.phone) ||
        (user.email && a.email === user.email)
      );

      const jobIds = Array.from(new Set(myApps.map((a: any) => a.tuitionId || a.jobCode).filter(Boolean)));
      res.json({ appliedJobIds: jobIds, applications: myApps });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to load tutor applications" });
    }
  });

  app.post("/api/v1/tutor/apply", async (req, res) => {
    try {
      const {
        jobId,
        expectedSalary,
        notes
      } = req.body;

      if (!jobId) {
        return res.status(400).json({ error: "Job ID is required" });
      }

      // 1. MUST BE LOGGED IN: Verify authentication token
      let tokenUser: any = null;
      let token = req.cookies?.tutorlink_auth_token;
      if (req.headers.authorization?.startsWith('Bearer ')) {
        token = req.headers.authorization.substring(7);
      }
      if (token) {
        tokenUser = verifyToken(token);
      }

      if (!tokenUser) {
        return res.status(401).json({ 
          error: "Authentication required. You must sign up and log in as a tutor to apply for tuition jobs." 
        });
      }

      if (tokenUser.role !== 'tutor') {
        return res.status(403).json({
          error: "Only registered tutors with a tutor profile can apply for tuition jobs. You are currently logged in with an administrator/guardian account. Please log in with a Tutor account to apply."
        });
      }

      // 2. Identify and link the tutor's registered profile automatically
      let tutorObj = mockTutors.find((m: any) => 
        (tokenUser.id && (m.id === tokenUser.id || m.tutorCode === tokenUser.id || m.userId === tokenUser.id)) ||
        (tokenUser.phone && m.phone === tokenUser.phone) ||
        (tokenUser.email && m.email === tokenUser.email) ||
        (tokenUser.name && m.fullName && m.fullName.toLowerCase() === tokenUser.name.toLowerCase())
      );

      if (!tutorObj) {
        try {
          const dbTutors = await db.select().from(tutorProfiles)
            .leftJoin(profiles, eq(tutorProfiles.userId, profiles.id))
            .where(sql`${profiles.phone} = ${tokenUser.phone} OR ${profiles.id}::text = ${tokenUser.id} OR ${profiles.email} = ${tokenUser.email}`).limit(1);
          if (dbTutors.length > 0) {
            tutorObj = {
              ...dbTutors[0].tutor_profiles,
              name: dbTutors[0].tutor_profiles.fullName || dbTutors[0].profiles?.fullName || tokenUser.name,
              fullName: dbTutors[0].tutor_profiles.fullName || dbTutors[0].profiles?.fullName || tokenUser.name,
              phone: dbTutors[0].profiles?.phone || tokenUser.phone,
              email: dbTutors[0].profiles?.email || tokenUser.email,
              university: dbTutors[0].tutor_profiles.university || tokenUser.university,
              department: dbTutors[0].tutor_profiles.department || tokenUser.department,
            };
            mockTutors.unshift(tutorObj);
          }
        } catch (dbErr) {}
      }

      if (!tutorObj) {
        const tutorCode = 'TT-' + Math.floor(10000 + Math.random() * 90000);
        tutorObj = {
          id: tutorCode,
          tutorCode: tutorCode,
          userId: tokenUser.id,
          fullName: tokenUser.name || 'Registered Tutor',
          name: tokenUser.name || 'Registered Tutor',
          phone: tokenUser.phone || '01700000000',
          email: tokenUser.email || `${tokenUser.phone || 'tutor'}@tutorlink.com`,
          university: tokenUser.university || 'Dhaka University',
          department: tokenUser.department || 'General',
          gender: tokenUser.gender || 'Any',
          district: tokenUser.district || 'Dhaka',
          area: tokenUser.area || 'Dhaka',
          tutoringExperience: tokenUser.tutoringExperience || 2,
          status: 'active',
          verificationStatus: 'verified',
          profileCompletion: 85
        };
        mockTutors.unshift(tutorObj);
      }

      // 3. CHECK IF TUTOR IS BLOCKED
      if (tutorObj.status === 'blocked' || tutorObj.status === 'suspended') {
        return res.status(403).json({ 
          error: "Your tutor account is suspended or blocked by the administrator. You cannot apply for tuition jobs. Please contact support." 
        });
      }

      // 4. CHECK IF TUTOR ALREADY APPLIED (NO NEED TO SUBMIT AGAIN)
      const existingMock = mockApplications.find((a: any) => 
        (a.tuitionId === jobId || a.jobCode === jobId) &&
        (a.tutorId === tutorObj.id || a.tutorCode === tutorObj.tutorCode || (tutorObj.phone && a.phone === tutorObj.phone))
      );
      if (existingMock) {
        return res.status(400).json({
          error: "You have already applied for this tuition job. Your application is already registered and visible to admin. No need to submit again."
        });
      }

      const applicantName = tutorObj.fullName || tutorObj.name || tokenUser.name;
      const applicantPhone = tutorObj.phone || tokenUser.phone;
      const applicantEmail = tutorObj.email || tokenUser.email;
      const applicantUni = tutorObj.university || tokenUser.university || 'University Graduate';
      const applicantDept = tutorObj.department || tokenUser.department || 'General';

      // 5. Persist to DB if possible (resilient fallback to in-memory)
      const salaryVal = expectedSalary ? parseInt(expectedSalary.toString().replace(/[^0-9]/g, '')) : null;
      let appResult: any = null;
      let tutorId: string = tutorObj.id || tutorObj.tutorCode;

      try {
        let profileId: string;
        const existingProfiles = await db.select().from(profiles).where(eq(profiles.phone, applicantPhone)).limit(1);
        if (existingProfiles.length > 0) {
          profileId = existingProfiles[0].id;
          await db.update(profiles).set({
            fullName: applicantName,
            email: applicantEmail,
            updatedAt: new Date()
          }).where(eq(profiles.id, profileId));
        } else {
          const [newProf] = await db.insert(profiles).values({
            fullName: applicantName,
            phone: applicantPhone,
            email: applicantEmail,
            accountStatus: 'active'
          }).returning();
          profileId = newProf.id;
        }

        const existingTutors = await db.select().from(tutorProfiles).where(eq(tutorProfiles.userId, profileId)).limit(1);
        if (existingTutors.length > 0) {
          if (existingTutors[0].status === 'blocked') {
            return res.status(403).json({ 
              error: "Your tutor account is suspended or blocked by the administrator. You cannot apply for tuition jobs. Please contact support." 
            });
          }
          tutorId = existingTutors[0].id;
        }

        const dbTuitions = await db.select().from(tuitionRequests)
          .where(sql`${tuitionRequests.id}::text = ${jobId} OR ${tuitionRequests.jobCode} = ${jobId}`).limit(1);

        if (dbTuitions.length > 0) {
          const tuitionDbId = dbTuitions[0].id;
          const existingApps = await db.select().from(tutorApplications)
            .where(sql`${tutorApplications.tuitionId} = ${tuitionDbId} AND ${tutorApplications.tutorId} = ${tutorId}`).limit(1);

          if (existingApps.length > 0) {
            [appResult] = await db.update(tutorApplications).set({
              applicationMessage: notes || existingApps[0].applicationMessage,
              expectedSalary: salaryVal || existingApps[0].expectedSalary,
              updatedAt: new Date()
            }).where(eq(tutorApplications.id, existingApps[0].id)).returning();
          } else {
            [appResult] = await db.insert(tutorApplications).values({
              tuitionId: tuitionDbId,
              tutorId: tutorId,
              applicationMessage: notes || 'Experienced tutor interested in this tuition job.',
              expectedSalary: salaryVal,
              status: 'submitted',
              appliedAt: new Date()
            }).returning();
          }
        }
      } catch (dbErr: any) {
        console.warn("DB apply sync note (using in-memory store):", dbErr?.message);
      }

      const mock = mockTuitions.find((m: any) => m.id === jobId || m.jobCode === jobId || m.realId === jobId);

      // 6. Build application with full tutor profile automatically
      const newMockApp = {
        id: 'APP-' + Date.now(),
        tuitionId: jobId,
        jobCode: mock?.jobCode || jobId,
        tutorId: tutorObj.id || tutorObj.tutorCode,
        tutorCode: tutorObj.tutorCode || tutorObj.id,
        name: applicantName,
        phone: applicantPhone,
        email: applicantEmail,
        gender: tutorObj.gender || 'Any',
        university: applicantUni,
        department: applicantDept,
        studentId: tutorObj.studentId || 'N/A',
        academicYear: tutorObj.academicYear || '3rd Year',
        district: tutorObj.district || 'Dhaka',
        area: tutorObj.area || 'Dhaka',
        experience: tutorObj.tutoringExperience ? `${tutorObj.tutoringExperience} years` : '2+ years',
        mediums: tutorObj.mediums || ['Bangla Medium', 'English Version'],
        subjects: tutorObj.subjects || ['All Subjects'],
        verificationStatus: tutorObj.verificationStatus || 'verified',
        status: tutorObj.status || 'active',
        expectedSalary: salaryVal || (mock?.salary ? parseInt(mock.salary) : null),
        message: notes || 'Dedicated tutor ready to help the student excel.',
        appliedAt: new Date().toISOString()
      };
      mockApplications.unshift(newMockApp);

      if (mock) {
        mock.applications = (mock.applications || 0) + 1;
        if (mock.status === 'OPEN') mock.status = 'TEACHERS_APPLIED';
      }

      // 7. Trigger Teacher Application Alert for Admin
      const newAlert = {
        id: 'ALERT-' + Date.now(),
        jobId: jobId,
        jobTitle: mock?.title || 'Tuition Job ' + jobId,
        tutorId: tutorObj.id || tutorObj.tutorCode,
        tutorName: applicantName,
        tutorUniversity: applicantUni,
        tutorDepartment: applicantDept,
        expectedSalary: salaryVal,
        timestamp: new Date().toISOString(),
        isRead: false
      };
      mockTeacherAlerts.unshift(newAlert);

      try {
        await db.update(tuitionRequests).set({
          status: sql`CASE WHEN lower(${tuitionRequests.status}) = 'open' THEN 'TEACHERS_APPLIED' ELSE ${tuitionRequests.status} END`,
          updatedAt: new Date()
        }).where(sql`${tuitionRequests.id}::text = ${jobId} OR ${tuitionRequests.jobCode} = ${jobId}`);
      } catch (dbUpdateErr) {}

      res.json({ 
        success: true, 
        message: "Application submitted successfully! Your profile is now visible to the administrator.",
        application: appResult || newMockApp,
        totalApplications: mock ? mock.applications : 1,
        jobId,
        alert: newAlert
      });
    } catch (e: any) {
      console.error("Apply error:", e);
      res.status(500).json({ error: e.message || "Failed to apply" });
    }
  });

  // Admin Teacher Applications Alerts API
  app.get("/api/admin/teacher-applications/alerts", async (_req, res) => {
    res.json({
      alerts: mockTeacherAlerts,
      unreadCount: mockTeacherAlerts.filter(a => !a.isRead).length
    });
  });

  app.post("/api/admin/teacher-applications/alerts/:id/dismiss", async (req, res) => {
    const { id } = req.params;
    mockTeacherAlerts = mockTeacherAlerts.filter(a => a.id !== id);
    res.json({ success: true, alerts: mockTeacherAlerts });
  });

  app.post("/api/admin/teacher-applications/alerts/clear", async (_req, res) => {
    mockTeacherAlerts = [];
    res.json({ success: true, alerts: [] });
  });

  app.get("/api/admin/tuitions/:id/applications", async (req, res) => {
    try {
      const idParam = req.params.id;
      const mockT = mockTuitions.find((m: any) => m.id === idParam || m.jobCode === idParam || m.realId === idParam);
      const possibleIds = new Set<string>([idParam]);
      if (mockT) {
        if (mockT.id) possibleIds.add(mockT.id);
        if (mockT.jobCode) possibleIds.add(mockT.jobCode);
        if (mockT.realId) possibleIds.add(mockT.realId);
      }

      let formatted: any[] = [];
      try {
        const applications = await db.select({
          app: tutorApplications,
          tutor: tutorProfiles,
          profile: profiles
        })
        .from(tutorApplications)
        .leftJoin(tutorProfiles, eq(tutorApplications.tutorId, tutorProfiles.id))
        .leftJoin(profiles, eq(tutorProfiles.userId, profiles.id))
        .leftJoin(tuitionRequests, eq(tutorApplications.tuitionId, tuitionRequests.id))
        .where(sql`${tutorApplications.tuitionId}::text = ANY(${Array.from(possibleIds)}) OR ${tuitionRequests.jobCode} = ANY(${Array.from(possibleIds)}) OR ${tuitionRequests.id}::text = ANY(${Array.from(possibleIds)})`);
        
        formatted = (applications as any[]).map(a => ({
          id: a.app.id,
          tutorId: a.tutor?.id,
          tutorCode: a.tutor?.tutorCode || `TT-${a.tutor?.id?.substring(0, 4) || '1001'}`,
          name: a.tutor?.fullName || a.profile?.fullName || 'Registered Tutor',
          phone: a.profile?.phone || '017XXXXXXXX',
          email: a.profile?.email || 'tutor@tutorlink.com',
          gender: a.tutor?.gender || 'Any',
          university: a.tutor?.university || 'University Student',
          department: a.tutor?.department || 'Department',
          studentId: a.tutor?.studentId || 'N/A',
          academicYear: a.tutor?.academicYear || '3rd Year',
          district: a.tutor?.district || 'Dhaka',
          area: a.tutor?.area || 'Dhaka',
          experience: a.tutor?.tutoringExperience ? `${a.tutor.tutoringExperience} years` : '2+ years',
          mediums: a.tutor?.mediums || ['Bangla Medium', 'English Version'],
          subjects: a.tutor?.subjects || ['All Subjects'],
          verificationStatus: a.tutor?.verificationStatus || 'verified',
          status: a.tutor?.status || 'active',
          message: a.app.applicationMessage || 'Dedicated tutor ready to help the student excel.',
          expectedSalary: a.app.expectedSalary,
          appliedAt: a.app.appliedAt
        }));
      } catch (dbErr) {
        console.warn("DB applications query fallback:", dbErr);
      }

      // Check mock applications and combine
      const mockMatches = mockApplications.filter((a: any) => 
        possibleIds.has(a.tuitionId) || 
        (a.jobCode && possibleIds.has(a.jobCode))
      );

      // De-duplicate applications by id or tutorId
      const seen = new Set<string>();
      const combined: any[] = [];
      for (const app of [...mockMatches, ...formatted]) {
        const key = app.id || `${app.tutorId || app.name}-${app.tuitionId}`;
        if (!seen.has(key)) {
          seen.add(key);
          combined.push(app);
        }
      }

      res.json(combined);
    } catch (e) {
      console.error(e);
      const mockMatches = mockApplications.filter((a: any) => 
        a.tuitionId === req.params.id || 
        a.jobCode === req.params.id
      );
      res.json(mockMatches);
    }
  });

  // ================= GUARDIAN ROUTES =================
  // 1. Get Guardian's Tuition Requests
  app.get("/api/guardian/my-tuitions", async (req, res) => {
    try {
      let token = req.cookies?.tutorlink_auth_token;
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
      let userPhone = (req.query.phone as string) || '';
      if (token) {
        const decoded: any = verifyToken(token);
        if (decoded && decoded.phone) userPhone = decoded.phone;
      }
      if (!userPhone) userPhone = '01715998756'; // Default guardian phone for preview/demo

      // Fetch tuitions belonging to guardian from database
      let dbTuitions: any[] = [];
      try {
        const rows = await db.select({
          request: tuitionRequests,
          guardian: guardianProfiles
        })
        .from(tuitionRequests)
        .leftJoin(guardianProfiles, eq(tuitionRequests.guardianId, guardianProfiles.id))
        .where(
          sql`${guardianProfiles.phone} = ${userPhone} OR ${guardianProfiles.phone} = '01715998756'`
        );
        dbTuitions = rows.map((r: any) => ({
          id: r.request.id,
          jobCode: r.request.jobCode || r.request.id,
          title: r.request.title || `Tuition for ${r.request.courseClass || 'Student'}`,
          subject: Array.isArray(r.request.subjects) ? r.request.subjects.join(', ') : (r.request.title || 'Tuition'),
          class: r.request.courseClass,
          salary: r.request.salaryMin ? `${r.request.salaryMin} - ${r.request.salaryMax || ''}` : 'Negotiable',
          location: r.request.fullAddress || `${r.request.area || ''}, ${r.request.district || ''}`,
          status: 'PENDING REVIEW',
          createdAt: r.request.createdAt,
          postedAt: r.request.createdAt,
          guardianPhone: r.guardian?.phone,
          applications: 0
        }));
      } catch (dbE) {}

      const primaryTuitions = [
        ...mockTuitions.filter((t: any) => 
          (t.guardianPhone && (t.guardianPhone === userPhone || t.guardianPhone === '01715998756')) ||
          t.id === 'T-1024' || t.id === 'T-998' || t.id === 'T-1045' ||
          (t.jobCode && (t.jobCode.startsWith('TR-') || t.jobCode === 'T-1024'))
        ),
        ...dbTuitions
      ];

      // De-duplicate by id or jobCode
      const seen = new Set<string>();
      const result: any[] = [];
      for (const t of primaryTuitions) {
        const key = t.id || t.jobCode;
        if (!seen.has(key)) {
          seen.add(key);

          // Count applicants
          const appCount = mockApplications.filter((a: any) => 
            a.tuitionId === t.id || a.jobCode === t.id || a.tuitionId === t.jobCode
          ).length;

          // Check demo
          const demoMatch = mockDemos.find((d: any) => 
            d.tuitionId === t.id || d.jobCode === t.id || d.tuitionId === t.jobCode
          );

          result.push({
            ...t,
            applications: Math.max(t.applications || 0, appCount),
            demo: demoMatch || null,
            guardianSelectedTutor: t.guardianSelectedTutorId ? {
              id: t.guardianSelectedTutorId,
              name: t.guardianSelectedTutorName,
              preferredDate: t.guardianPreferredDate,
              notes: t.guardianDemoNotes,
              selectedAt: t.guardianSelectedAt
            } : null
          });
        }
      }

      res.json(result);
    } catch (e) {
      console.error("Guardian tuitions error:", e);
      res.status(500).json({ error: "Failed to fetch guardian tuitions" });
    }
  });

  // 2. Get Applicants for a specific Tuition (Guardian View - mirrors admin view)
  app.get("/api/guardian/tuitions/:id/applicants", async (req, res) => {
    try {
      const idParam = req.params.id;
      const mockT = mockTuitions.find((m: any) => m.id === idParam || m.jobCode === idParam || m.realId === idParam);
      const possibleIds = new Set<string>([idParam]);
      if (mockT) {
        if (mockT.id) possibleIds.add(mockT.id);
        if (mockT.jobCode) possibleIds.add(mockT.jobCode);
        if (mockT.realId) possibleIds.add(mockT.realId);
      }

      // 1. Fetch from Database (same as admin)
      let formatted: any[] = [];
      try {
        const applications = await db.select({
          app: tutorApplications,
          tutor: tutorProfiles,
          profile: profiles
        })
        .from(tutorApplications)
        .leftJoin(tutorProfiles, eq(tutorApplications.tutorId, tutorProfiles.id))
        .leftJoin(profiles, eq(tutorProfiles.userId, profiles.id))
        .leftJoin(tuitionRequests, eq(tutorApplications.tuitionId, tuitionRequests.id))
        .where(sql`${tutorApplications.tuitionId}::text = ANY(${Array.from(possibleIds)}) OR ${tuitionRequests.jobCode} = ANY(${Array.from(possibleIds)}) OR ${tuitionRequests.id}::text = ANY(${Array.from(possibleIds)})`);
        
        formatted = (applications as any[]).map(a => ({
          id: a.app.id,
          tutorId: a.tutor?.id,
          tutorCode: a.tutor?.tutorCode || `TT-${a.tutor?.id?.substring(0, 4) || '1001'}`,
          name: a.tutor?.fullName || a.profile?.fullName || 'Registered Tutor',
          phone: a.profile?.phone || '017XXXXXXXX',
          email: a.profile?.email || 'tutor@tutorlink.com',
          gender: a.tutor?.gender || 'Any',
          university: a.tutor?.university || 'University Student',
          department: a.tutor?.department || 'Department',
          studentId: a.tutor?.studentId || 'N/A',
          academicYear: a.tutor?.academicYear || '3rd Year',
          district: a.tutor?.district || 'Dhaka',
          area: a.tutor?.area || 'Dhaka',
          experience: a.tutor?.tutoringExperience ? `${a.tutor.tutoringExperience} years` : '2+ years',
          mediums: a.tutor?.mediums || ['Bangla Medium', 'English Version'],
          subjects: a.tutor?.subjects || ['All Subjects'],
          verificationStatus: a.tutor?.verificationStatus || 'verified',
          status: a.tutor?.status || 'active',
          message: a.app.applicationMessage || 'Dedicated tutor ready to help the student excel.',
          expectedSalary: a.app.expectedSalary,
          appliedAt: a.app.appliedAt
        }));
      } catch (dbErr) {
        console.warn("DB guardian applications query fallback:", dbErr);
      }

      // 2. Fetch matching mock applications
      const matchingApps = mockApplications.filter((a: any) => 
        possibleIds.has(a.tuitionId) || (a.jobCode && possibleIds.has(a.jobCode))
      );

      // 3. De-duplicate combined list
      const seen = new Set<string>();
      const combined: any[] = [];
      for (const app of [...matchingApps, ...formatted]) {
        const key = app.id || `${app.tutorId || app.name}-${app.tuitionId || idParam}`;
        if (!seen.has(key)) {
          seen.add(key);
          combined.push(app);
        }
      }

      const activeDemo = mockDemos.find((d: any) => 
        possibleIds.has(d.tuitionId) || (d.jobCode && possibleIds.has(d.jobCode))
      );

      const enriched = combined.map((a: any) => {
        const isSelected = (mockT?.guardianSelectedTutorId === (a.tutorId || a.tutorCode || a.id)) || a.status === 'guardian_selected';
        const hasDemo = activeDemo && (activeDemo.tutorId === a.tutorId || activeDemo.tutorCode === a.tutorCode);
        return {
          ...a,
          avatar: a.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(a.name || 'Tutor')}`,
          rating: a.rating || 4.8,
          isSelected,
          demoStatus: hasDemo ? (activeDemo.status || 'Scheduled') : (isSelected ? 'Pending Admin Assignment' : 'none'),
          demoDate: hasDemo ? (activeDemo.date || activeDemo.scheduledDate) : null,
          demoTime: hasDemo ? activeDemo.time : null
        };
      });

      res.json(enriched);
    } catch (e) {
      console.error("Guardian applicants error:", e);
      res.json([]);
    }
  });

  // 3. Guardian Selects a Tutor for Demo Class -> Alert Admin
  app.post("/api/guardian/tuitions/:id/select-tutor", async (req, res) => {
    try {
      let token = req.cookies?.tutorlink_auth_token;
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
      let isAuthGuardianOrAdmin = true; // allow in session
      if (token) {
        try {
          const decoded: any = verifyToken(token);
          if (decoded && (decoded.role === 'guardian' || decoded.role === 'parent' || decoded.role === 'admin' || decoded.role === 'super-admin')) {
            isAuthGuardianOrAdmin = true;
          }
        } catch(e) {}
      }

      const { id } = req.params;
      const { tutorId, preferredDate, notes } = req.body;
      if (!tutorId) {
        return res.status(400).json({ error: "Please select a tutor." });
      }

      // Find tuition
      const mockT = mockTuitions.find((m: any) => m.id === id || m.jobCode === id || m.realId === id);
      if (!mockT) {
        return res.status(404).json({ error: "Tuition request not found." });
      }

      // Find tutor/applicant
      let applicant = mockApplications.find((a: any) => 
        (a.tuitionId === id || a.jobCode === id) && (a.tutorId === tutorId || a.tutorCode === tutorId || a.id === tutorId)
      );
      if (!applicant) {
        applicant = mockApplications.find((a: any) => a.tutorId === tutorId || a.tutorCode === tutorId || a.id === tutorId);
      }
      const tutorObj = mockTutors.find((m: any) => m.id === tutorId || m.tutorCode === tutorId);

      const tutorName = applicant?.name || tutorObj?.fullName || tutorObj?.name || 'Selected Tutor';
      const tutorCode = applicant?.tutorCode || tutorObj?.tutorCode || tutorId;

      // 3. Update tuition state with Shortlist (Cap of 3 max)
      mockT.shortlistedTutorIds = mockT.shortlistedTutorIds || [];
      if (!mockT.shortlistedTutorIds.includes(tutorCode)) {
        if (mockT.shortlistedTutorIds.length >= 3) {
          return res.status(400).json({ 
            error: "You can shortlist a maximum of 3 tutors for this tuition request. Please remove or proceed with existing shortlisted tutors." 
          });
        }
        mockT.shortlistedTutorIds.push(tutorCode);
      }

      mockT.guardianSelectedTutorId = tutorCode;
      mockT.guardianSelectedTutorName = tutorName;
      mockT.guardianPreferredDate = preferredDate || 'Flexible';
      mockT.guardianDemoNotes = notes || '';
      mockT.guardianSelectedAt = new Date().toISOString();
      mockT.status = 'SHORTLISTED';
      mockT.updatedAt = new Date().toISOString();

      // Update applicant state
      if (applicant) {
        applicant.status = 'guardian_selected';
        applicant.selectedAt = new Date().toISOString();
      }

      // Trigger Teacher Alert for Admin
      const alertId = 'ALERT-' + Date.now();
      const newAlert = {
        id: alertId,
        jobId: mockT.id,
        jobCode: mockT.jobCode || mockT.id,
        jobTitle: mockT.title || mockT.subject || `Tuition ${mockT.id}`,
        type: 'GUARDIAN_SELECTED_TUTOR',
        tutorId: tutorCode,
        tutorName: tutorName,
        tutorUniversity: applicant?.university || tutorObj?.university || 'University',
        tutorDepartment: applicant?.department || tutorObj?.department || '',
        guardianName: mockT.guardianName || 'Parent',
        guardianPhone: mockT.guardianPhone || '',
        preferredDate: preferredDate || 'Flexible',
        notes: notes || '',
        message: `Guardian ${mockT.guardianName || 'Parent'} shortlisted tutor ${tutorName} (${tutorCode}) [${mockT.shortlistedTutorIds.length}/3] for Demo Class! Please assign the demo class schedule.`,
        timestamp: new Date().toISOString(),
        isRead: false
      };
      mockTeacherAlerts.unshift(newAlert);

      // Trigger Admin Notification
      mockNotifications.unshift({
        id: 'NOTIF-' + Date.now(),
        type: 'GUARDIAN_SELECTED_TUTOR',
        title: '🎯 Demo Class Requested by Guardian!',
        message: `Guardian shortlisted ${tutorName} (${mockT.shortlistedTutorIds.length}/3) for Demo on ${mockT.title || mockT.id}. Preferred: ${preferredDate || 'Flexible'}.`,
        tuitionId: mockT.id,
        createdAt: new Date().toISOString(),
        isRead: false
      });

      res.json({
        success: true,
        message: `Tutor ${tutorName} shortlisted (${mockT.shortlistedTutorIds.length}/3)! Sent to Admin for demo scheduling.`,
        tuition: mockT,
        shortlistedCount: mockT.shortlistedTutorIds.length
      });
    } catch (e: any) {
      console.error("Select tutor error:", e);
      res.status(500).json({ error: e.message || "Failed to select tutor" });
    }
  });

  // 3b. Guardian Cancels Tuition Request with Mandatory Reason
  app.post("/api/guardian/tuitions/:id/cancel", async (req, res) => {
    try {
      const { id } = req.params;
      const { reason, details } = req.body;
      const mockT = mockTuitions.find((m: any) => m.id === id || m.jobCode === id || m.realId === id);
      if (!mockT) {
        return res.status(404).json({ error: "Tuition request not found." });
      }

      const currStatus = (mockT.status || 'OPEN').toUpperCase();
      if (currStatus === 'CONFIRMED' || currStatus === 'ASSIGNED') {
        return res.status(400).json({ 
          error: "This tuition has already been confirmed/assigned to a tutor. Please contact Admin/Support directly to request cancellation." 
        });
      }

      const effectiveReason = reason || details || 'Cancelled by Guardian';
      mockT.status = 'CANCELLED';
      mockT.cancelReason = effectiveReason;
      mockT.cancelledBy = 'guardian';
      mockT.cancelledAt = new Date().toISOString();
      mockT.updatedAt = new Date().toISOString();

      try {
        await db.update(tuitionRequests).set({
          status: 'cancelled',
          cancelledAt: new Date(),
          updatedAt: new Date()
        }).where(sql`${tuitionRequests.id}::text = ${id} OR ${tuitionRequests.jobCode} = ${id}`);
      } catch (dbErr) {}

      mockNotifications.unshift({
        id: 'NOTIF-' + Date.now(),
        type: 'TUITION_CANCELLED_BY_GUARDIAN',
        title: '⚠️ Tuition Cancelled by Guardian',
        message: `Guardian cancelled tuition ${mockT.title || mockT.id}. Reason: ${effectiveReason}`,
        tuitionId: mockT.id,
        createdAt: new Date().toISOString(),
        isRead: false
      });

      res.json({ success: true, message: "Tuition request cancelled successfully.", tuition: mockT });
    } catch (e: any) {
      console.error("Cancel tuition error:", e);
      res.status(500).json({ error: e.message || "Failed to cancel tuition" });
    }
  });

  // 3c. Guardian Demo Outcome Decision (Hire vs Try Another Shortlist)
  app.post("/api/guardian/demos/:id/decision", async (req, res) => {
    try {
      const { id } = req.params;
      const { decision, rating, feedback, reason, notes } = req.body; // 'HIRE' | 'REPLACE' | 'CANCEL'
      
      let demo = mockDemos.find((d: any) => d.id === id || d.tuitionId === id || d.jobCode === id);
      const tuitionId = demo?.tuitionId || demo?.jobCode || id;
      const mockT = mockTuitions.find((m: any) => m.id === tuitionId || m.jobCode === tuitionId || m.realId === tuitionId);

      if (!demo && mockT?.demo) {
        demo = mockT.demo;
        mockDemos.push(demo);
      }

      if (!demo && !mockT) {
        return res.status(404).json({ error: "Demo class or tuition request record not found." });
      }

      // If demo still null but tuition exists, construct demo object
      if (!demo && mockT) {
        demo = {
          id: 'D-' + Date.now(),
          tuitionId: mockT.id || mockT.jobCode,
          jobCode: mockT.jobCode || mockT.id,
          tutorName: mockT.assignedTutorId || mockT.tutorName || 'Assigned Tutor',
          status: 'Scheduled',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };
        mockDemos.push(demo);
      }

      demo.guardianDecision = decision;
      demo.guardianRating = rating || 5;
      demo.guardianFeedback = feedback || reason || notes || '';
      demo.updatedAt = new Date().toISOString();

      if (decision === 'HIRE') {
        demo.status = 'Winner Selected';
        demo.result = 'Successful';

        if (mockT) {
          mockT.status = 'CONFIRMED';
          mockT.assignedTutorId = demo.tutorId || mockT.assignedTutorId;
          mockT.tutorName = demo.tutorName || mockT.tutorName;
          mockT.hiredTutorName = demo.tutorName || mockT.tutorName;
          mockT.confirmedStartDate = new Date().toISOString().split('T')[0];
          mockT.guardianRequestedReplacement = false;
          mockT.replacementReason = null;
          mockT.updatedAt = new Date().toISOString();

          // Create pending media commission payment record
          const salaryNum = parseInt(mockT.salary?.toString().replace(/[^0-9]/g, '') || '5000') || 5000;
          const commissionAmount = Math.round(salaryNum * 0.5);
          mockPayments.unshift({
            id: 'PAY-' + Date.now(),
            tuitionId: mockT.id,
            tutorId: demo.tutorId || 'TT-1005',
            amount: commissionAmount,
            method: 'bKash / Nagad',
            status: 'Pending',
            type: 'Platform Media Fee (1st Month)',
            date: new Date().toISOString().split('T')[0],
            startDate: mockT.confirmedStartDate
          });

          // Notify admin
          mockTeacherAlerts.unshift({
            id: 'ALERT-' + Date.now(),
            jobId: mockT.id || mockT.jobCode,
            jobTitle: mockT.title || 'Tuition ' + (mockT.jobCode || mockT.id),
            tutorId: demo.tutorId,
            tutorName: demo.tutorName || 'Selected Tutor',
            type: 'GUARDIAN_CONFIRMED_HIRE',
            message: `🎉 Parent confirmed and hired tutor ${demo.tutorName} for "${mockT.title || mockT.id}"! Media Commission of ৳${commissionAmount} is now pending.`,
            timestamp: new Date().toISOString(),
            isRead: false
          });
        }

        // Update database if exists
        try {
          await db.update(tuitionRequests)
            .set({ status: 'CONFIRMED', updatedAt: new Date() })
            .where(sql`${tuitionRequests.id}::text = ${tuitionId} OR ${tuitionRequests.jobCode} = ${tuitionId}`);
        } catch (dbE) {}

        return res.json({ 
          success: true, 
          decision: 'HIRE',
          message: `Congratulations! Tutor ${demo.tutorName} has been officially confirmed and hired. Our coordinator will finalize arrangements.`,
          demo,
          tuition: mockT 
        });
      } else if (decision === 'REPLACE') {
        demo.status = 'Replacement Requested';
        demo.result = 'Unsuccessful';

        const replacementExplanation = feedback || reason || notes || 'Another tutor demo needed';

        if (mockT) {
          mockT.status = 'TEACHERS_APPLIED';
          mockT.guardianRequestedReplacement = true;
          mockT.replacementReason = replacementExplanation;
          mockT.replacementNotes = notes || '';
          mockT.demo = null; // Clear active demo so tuition can have another tutor assigned
          mockT.updatedAt = new Date().toISOString();
        }

        // Notify Admin with rich context
        mockTeacherAlerts.unshift({
          id: 'ALERT-' + Date.now(),
          jobId: mockT?.id || mockT?.jobCode || tuitionId,
          jobTitle: mockT?.title || 'Tuition ' + tuitionId,
          tutorId: demo.tutorId,
          tutorName: demo.tutorName || 'Tutor',
          type: 'GUARDIAN_REQUESTED_REPLACEMENT',
          message: `⚠️ Parent cancelled tutor ${demo.tutorName} for "${mockT?.title || tuitionId}" and requested another tutor demo. Reason: "${replacementExplanation}".`,
          timestamp: new Date().toISOString(),
          isRead: false
        });

        // Update database if exists
        try {
          await db.update(tuitionRequests)
            .set({ status: 'TEACHERS_APPLIED', updatedAt: new Date() })
            .where(sql`${tuitionRequests.id}::text = ${tuitionId} OR ${tuitionRequests.jobCode} = ${tuitionId}`);
        } catch (dbE) {}

        return res.json({ 
          success: true, 
          decision: 'REPLACE',
          message: `Tutor demo cancelled. We have notified our Admin team to arrange another demo class for you. You can also view applicants to select another tutor.`,
          demo,
          tuition: mockT 
        });
      } else {
        demo.status = 'Cancelled';
        if (mockT) {
          mockT.status = 'CANCELLED';
          mockT.cancelReason = feedback || 'Demo cancelled by parent';
          mockT.cancelledBy = 'guardian';
          mockT.demo = null;
        }
        return res.json({ success: true, decision: 'CANCEL', demo, tuition: mockT });
      }
    } catch (e: any) {
      console.error("Demo decision error:", e);
      res.status(500).json({ error: e.message || "Failed to process decision" });
    }
  });

  // 4. Guardian Demos List
  app.get("/api/guardian/demos", async (req, res) => {
    try {
      let userPhone = (req.query.phone as string) || '01715998756';
      
      const guardianTuitions = mockTuitions.filter((t: any) => 
        (t.guardianPhone && (t.guardianPhone === userPhone || t.guardianPhone === '01715998756')) ||
        t.id === 'T-1024' || t.id === 'TR-929960' || (t.jobCode && t.jobCode.startsWith('TR-')) || t.demo
      );

      const tuitionIdSet = new Set(guardianTuitions.map((t: any) => t.id || t.jobCode));

      const combinedDemos: any[] = [];
      const seen = new Set<string>();

      // From mockDemos
      for (const d of mockDemos) {
        if (
          (d.guardianPhone && (d.guardianPhone === userPhone || d.guardianPhone === '01715998756')) ||
          tuitionIdSet.has(d.tuitionId) || tuitionIdSet.has(d.jobCode) ||
          d.id === 'D-801' || d.tuitionId === 'T-1024'
        ) {
          const key = d.id || `${d.tuitionId}-${d.tutorId}`;
          if (!seen.has(key)) {
            seen.add(key);
            combinedDemos.push(d);
          }
        }
      }

      // From mockTuitions attached demos
      for (const t of guardianTuitions) {
        if (t.demo) {
          const key = t.demo.id || `${t.id}-${t.demo.tutorId || t.demo.tutorName}`;
          if (!seen.has(key)) {
            seen.add(key);
            combinedDemos.push({
              ...t.demo,
              tuitionId: t.demo.tuitionId || t.id || t.jobCode,
              jobCode: t.demo.jobCode || t.jobCode || t.id
            });
          }
        }
      }

      res.json(combinedDemos);
    } catch (e) {
      res.json([]);
    }
  });

  // 5. Standard Bangladesh Areas Hierarchy
  app.get("/api/areas", (_req, res) => {
    res.json(BD_AREAS);
  });

  app.use("/api/admin", authMiddleware, requireAdmin);

  app.get("/api/admin/dashboard", async (req, res) => {
    try {
      const allT = await db.select().from(tuitionRequests);
      const allG = await db.select().from(guardianProfiles);
      const allTutors = await db.select().from(tutorProfiles);
      const pendingCount = (allT as any[]).filter((t: any) => t.status === 'pending_review' || t.status === 'PENDING_REVIEW' || t.status === 'draft').length;
      const openCount = (allT as any[]).filter((t: any) => t.status === 'open' || t.status === 'OPEN').length;
      
      const teacherAlertsCount = mockTeacherAlerts.length;
      const unreadAlertsCount = mockTeacherAlerts.filter(a => !a.isRead).length;

      res.json({
        metrics: {
          totalTuitions: Math.max(allT.length, mockTuitions.length),
          activeTuitions: Math.max(openCount, mockTuitions.filter((t: any) => t.status === 'OPEN').length),
          pendingRequests: pendingCount + mockTuitions.filter((t: any) => t.status === 'PENDING_REVIEW').length,
          tutors: Math.max(allTutors.length, mockTutors.length),
          guardians: Math.max(allG.length, mockGuardians.length),
          demosToday: 2,
          confirmedMonth: 5,
          revenue: 15000,
          pendingPayments: 3,
          teacherAlerts: teacherAlertsCount,
          unreadTeacherAlerts: unreadAlertsCount
        },
        logs: []
      });
    } catch(e) {
      res.json({
        metrics: { 
          totalTuitions: mockTuitions.length, 
          activeTuitions: mockTuitions.filter((t: any) => t.status === 'OPEN').length, 
          totalGuardians: mockGuardians.length, 
          revenue: 15000, 
          pendingDemos: 2, 
          pendingVerifications: 0, 
          pendingRequests: mockTuitions.filter((t: any) => t.status === 'PENDING_REVIEW').length, 
          tutors: mockTutors.length, 
          guardians: mockGuardians.length, 
          confirmedMonth: 5, 
          demosToday: 2, 
          pendingPayments: 3,
          teacherAlerts: mockTeacherAlerts.length,
          unreadTeacherAlerts: mockTeacherAlerts.filter(a => !a.isRead).length
        },
        logs: []
      });
    }
  });

  app.get("/api/admin/tuitions", async (_req, res) => {
    try {
      const results = await db.select({
        t: tuitionRequests,
        g: guardianProfiles,
        appCount: sql<number>`(SELECT count(*) FROM ${tutorApplications} WHERE tuition_id = ${tuitionRequests.id})`
      }).from(tuitionRequests)
      .leftJoin(guardianProfiles, eq(tuitionRequests.guardianId, guardianProfiles.id))
      .orderBy(desc(tuitionRequests.createdAt));
      
      const dbTuitions = (results as any[]).map(r => ({
        ...r.t,
        guardianName: r.g?.fullName,
        guardianPhone: r.g?.phone,
        guardianAddress: r.g?.address,
        appCount: r.appCount
      })).map(mapTuitionToOld);

      const dbIds = new Set(dbTuitions.map((t: any) => t.id));
      const extraMocks = getMockTuitions().filter((m: any) => !dbIds.has(m.id) && !dbIds.has(m.jobCode));

      res.json([...dbTuitions, ...extraMocks]);
    } catch (e) {
      res.json(getMockTuitions());
    }
  });

  app.get("/api/v1/admin/workflow", async (_req, res) => {
    try {
      const results = await db.select({
        t: tuitionRequests,
        g: guardianProfiles,
        appCount: sql<number>`(SELECT count(*) FROM ${tutorApplications} WHERE tuition_id = ${tuitionRequests.id})`
      }).from(tuitionRequests)
      .leftJoin(guardianProfiles, eq(tuitionRequests.guardianId, guardianProfiles.id))
      .orderBy(desc(tuitionRequests.createdAt));
      
      const dbTuitions = (results as any[]).map(r => ({
        ...r.t,
        guardianName: r.g?.fullName,
        guardianPhone: r.g?.phone,
        guardianAddress: r.g?.address,
        appCount: r.appCount
      })).map(mapTuitionToOld);

      const dbIds = new Set(dbTuitions.map((t: any) => t.id));
      const extraMocks = getMockTuitions().filter((m: any) => !dbIds.has(m.id) && !dbIds.has(m.jobCode));

      res.json([...dbTuitions, ...extraMocks]);
    } catch (e) {
      res.json(getMockTuitions());
    }
  });

  const handleAdminStatusUpdate = async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const { targetStatus, status, archiveReason, cancelReason } = req.body;
      const effectiveStatus = (targetStatus || status || '').toUpperCase();
      
      const mockIdx = mockTuitions.findIndex((t: any) => t.id === id || t.jobCode === id || t.realId === id);
      if (mockIdx >= 0) {
        mockTuitions[mockIdx].status = effectiveStatus;
        if (archiveReason) mockTuitions[mockIdx].adminNotes = archiveReason;
        if (cancelReason) mockTuitions[mockIdx].adminNotes = cancelReason;
        mockTuitions[mockIdx].updatedAt = new Date().toISOString();
      }
      
      let mappedStatus = 'open';
      if (effectiveStatus === 'OPEN' || effectiveStatus === 'APPROVED') mappedStatus = 'open';
      else if (effectiveStatus === 'CONFIRMED' || effectiveStatus === 'FILLED') mappedStatus = 'assigned';
      else if (effectiveStatus === 'ARCHIVED' || effectiveStatus === 'CLOSED') mappedStatus = 'cancelled';
      else if (effectiveStatus === 'CANCELLED') mappedStatus = 'cancelled';
      else if (effectiveStatus === 'PENDING_REVIEW' || effectiveStatus === 'PENDING') mappedStatus = 'pending_review';
      else mappedStatus = effectiveStatus.toLowerCase();

      const updateData: any = {
        status: mappedStatus,
        updatedAt: new Date()
      };
      if (mappedStatus === 'open') {
        updateData.publishedAt = new Date();
        updateData.visibility = 'public';
      }

      try {
        const updated = await db.update(tuitionRequests)
          .set(updateData)
          .where(sql`${tuitionRequests.id}::text = ${id} OR ${tuitionRequests.jobCode} = ${id}`)
          .returning();

        // If it was a mock item not yet in Supabase, persist it into Supabase now
        if (updated.length === 0 && mockIdx >= 0) {
          const mock = mockTuitions[mockIdx];
          const salaryNum = parseInt(mock.salary?.toString().replace(/[^0-9]/g, '') || '4000') || 4000;
          await db.insert(tuitionRequests).values({
            jobCode: mock.jobCode || mock.id,
            title: mock.title,
            curriculum: mock.curriculum || mock.category || 'General',
            courseClass: mock.course || mock.courseClass || 'General',
            subjects: Array.isArray(mock.subjects) ? mock.subjects : [mock.subjects || 'General'],
            daysPerWeek: mock.daysPerWeek || '3 days',
            preferredTime: mock.preferredTime || mock.time || 'Flexible',
            duration: mock.duration || '1 Hour',
            method: mock.method || 'Home Tutoring',
            salaryMin: salaryNum,
            salaryMax: salaryNum,
            district: mock.district || mock.city || 'Dhaka',
            area: mock.area || mock.location || 'Dhaka',
            fullAddress: mock.fullAddress || mock.location || 'Dhaka',
            parentSpecialInstructions: mock.notes || '',
            studentGender: mock.studentGender || 'Mix',
            preferredTutorGender: mock.preferredTutorGender || mock.tutorGender || 'Any',
            studentCount: parseInt(mock.studentCount?.toString() || '1') || 1,
            status: mappedStatus,
            visibility: 'public',
            publishedAt: mappedStatus === 'open' ? new Date() : null,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      } catch (err) {
        console.error("DB update status error:", err);
      }

      res.json({ success: true, status: effectiveStatus, dbStatus: mappedStatus });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message || "Failed to update status" });
    }
  };

  app.put("/api/admin/tuitions/:id/status", handleAdminStatusUpdate);
  app.patch("/api/admin/tuitions/:id/status", handleAdminStatusUpdate);

  app.post("/api/admin/tuitions", async (req, res) => {
    try {
      const formData = req.body;
      const salaryNum = parseInt(formData.salary?.toString().replace(/[^0-9]/g, '') || '0') || 0;
      const studentCountNum = parseInt(formData.studentsCount?.toString() || '1') || 1;
      const jobCode = 'JOB-' + Math.floor(100000 + Math.random() * 900000);

      let guardianId = null;
      if (formData.guardianPhone) {
        try {
          const existingG = await db.select().from(guardianProfiles).where(eq(guardianProfiles.phone, formData.guardianPhone)).limit(1);
          if (existingG.length > 0) {
            guardianId = existingG[0].id;
          } else {
            const [newG] = await db.insert(guardianProfiles).values({
              fullName: formData.guardianName || 'Guardian',
              phone: formData.guardianPhone,
              address: formData.fullAddress || formData.location || '',
              district: formData.city || formData.district || 'Dhaka',
              area: formData.area || ''
            }).returning();
            guardianId = newG?.id;
          }
        } catch (gErr) {
          console.error("Guardian profile err:", gErr);
        }
      }

      const subjectsArray = Array.isArray(formData.subjects) 
        ? formData.subjects 
        : (typeof formData.subjects === 'string' ? formData.subjects.split(',').map((s: string) => s.trim()).filter(Boolean) : []);

      const initialStatus = (formData.status || 'OPEN').toUpperCase();
      const mappedDbStatus = initialStatus === 'OPEN' ? 'open' : (initialStatus === 'PENDING_REVIEW' ? 'pending_review' : 'open');

      const [inserted] = await db.insert(tuitionRequests).values({
        jobCode,
        guardianId,
        title: formData.title || `Need tutor for ${formData.course || ''} - ${subjectsArray.join(', ')}`,
        curriculum: formData.curriculum || formData.category || 'General',
        courseClass: formData.course || formData.courseClass || '',
        subjects: subjectsArray,
        daysPerWeek: formData.daysPerWeek || '3 days/week',
        preferredTime: formData.time || 'Flexible',
        duration: formData.duration || '1 Hour',
        method: formData.method || 'Home Tutoring',
        salaryMin: salaryNum,
        salaryMax: salaryNum,
        country: formData.country || 'Bangladesh',
        district: formData.city || formData.district || 'Dhaka',
        area: formData.area || formData.location || '',
        fullAddress: formData.fullAddress || formData.location || '',
        parentSpecialInstructions: formData.notes || '',
        studentGender: formData.studentGender || 'Mix',
        preferredTutorGender: formData.tutorGender || 'Any',
        studentCount: studentCountNum,
        status: mappedDbStatus,
        visibility: 'public',
        publishedAt: mappedDbStatus === 'open' ? new Date() : null,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      const mapped = mapTuitionToOld({
        ...inserted,
        guardianName: formData.guardianName || 'Guardian',
        guardianPhone: formData.guardianPhone || '',
        appCount: 0
      });

      mockTuitions.unshift(mapped);
      res.json(mapped);
    } catch (err: any) {
      console.error("Create tuition error:", err);
      res.status(500).json({ error: err.message || "Failed to create tuition" });
    }
  });

  app.put("/api/admin/tutors/:id/edit", async (req, res) => {
    try {
      const { id } = req.params;
      const { name, university, phone, department, district, status } = req.body;
      const mockIdx = mockTutors.findIndex((t: any) => t.id === id || t.tutorCode === id);
      if (mockIdx >= 0) {
        if (name) mockTutors[mockIdx].fullName = name;
        if (university) mockTutors[mockIdx].university = university;
        if (phone) mockTutors[mockIdx].phone = phone;
        if (department) mockTutors[mockIdx].department = department;
        if (district) mockTutors[mockIdx].district = district;
        if (status) mockTutors[mockIdx].status = status;
      }
      res.json({ success: true, tutor: mockIdx >= 0 ? mapTutorToOld(mockTutors[mockIdx]) : null });
    } catch (e) {
      res.json({ success: true });
    }
  });

  // Admin Block / Unblock / Verify Tutor
  app.put("/api/admin/tutors/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, verified, verificationStatus } = req.body;
      
      const mockIdx = mockTutors.findIndex((t: any) => t.id === id || t.tutorCode === id);
      if (mockIdx >= 0) {
        if (status) mockTutors[mockIdx].status = status;
        if (verified !== undefined) {
          mockTutors[mockIdx].verified = verified;
          mockTutors[mockIdx].verificationStatus = verified ? 'verified' : 'pending';
          mockTutors[mockIdx].nidStatus = verified ? 'Verified (NID Provided)' : 'Pending Verification';
        }
        if (verificationStatus) {
          mockTutors[mockIdx].verificationStatus = verificationStatus;
          mockTutors[mockIdx].verified = verificationStatus === 'verified';
        }
      }

      // Also sync mockApplications if present
      mockApplications.forEach((a: any) => {
        if (a.tutorId === id || a.tutorCode === id) {
          if (status) a.status = status;
          if (verified !== undefined) a.verificationStatus = verified ? 'verified' : 'pending';
        }
      });

      try {
        await db.update(tutorProfiles).set({
          status: status || undefined,
          verificationStatus: verified !== undefined ? (verified ? 'verified' : 'pending') : verificationStatus || undefined,
          updatedAt: new Date()
        }).where(sql`${tutorProfiles.id}::text = ${id} OR ${tutorProfiles.tutorCode} = ${id}`);
      } catch (err) {}

      res.json({ 
        success: true, 
        status: status || (mockIdx >= 0 ? mockTutors[mockIdx].status : 'active'),
        verified: mockIdx >= 0 ? mockTutors[mockIdx].verified : true
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to update tutor status" });
    }
  });

  app.put("/api/admin/guardians/:id/edit", async (req, res) => {
    try {
      const { id } = req.params;
      const { name, location, phone } = req.body;
      const mockIdx = mockGuardians.findIndex((g: any) => g.id === id);
      if (mockIdx >= 0) {
        if (name) mockGuardians[mockIdx].fullName = name;
        if (location) mockGuardians[mockIdx].location = location;
        if (phone) mockGuardians[mockIdx].phone = phone;
      }
      res.json({ success: true });
    } catch (e) {
      res.json({ success: true });
    }
  });

  app.put("/api/admin/tuitions/:id/edit", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const mockIdx = mockTuitions.findIndex((t: any) => t.id === id || t.jobCode === id || t.realId === id);
      
      const effectiveStatus = updateData.status ? (updateData.status || '').toUpperCase() : null;
      let mappedStatus: string | undefined = undefined;
      if (effectiveStatus) {
        if (effectiveStatus === 'OPEN' || effectiveStatus === 'APPROVED') mappedStatus = 'open';
        else if (effectiveStatus === 'CONFIRMED' || effectiveStatus === 'FILLED') mappedStatus = 'assigned';
        else if (effectiveStatus === 'ARCHIVED' || effectiveStatus === 'CLOSED') mappedStatus = 'cancelled';
        else if (effectiveStatus === 'CANCELLED') mappedStatus = 'cancelled';
        else if (effectiveStatus === 'PENDING_REVIEW' || effectiveStatus === 'PENDING') mappedStatus = 'pending_review';
        else mappedStatus = effectiveStatus.toLowerCase();
      }

      if (mockIdx >= 0) {
        mockTuitions[mockIdx] = { 
          ...mockTuitions[mockIdx], 
          ...updateData,
          ...(effectiveStatus ? { status: effectiveStatus } : {}),
          updatedAt: new Date().toISOString()
        };
      }

      const dbSet: any = {
        updatedAt: new Date()
      };
      if (updateData.title !== undefined) dbSet.title = updateData.title;
      if (updateData.curriculum !== undefined || updateData.category !== undefined) {
        dbSet.curriculum = updateData.curriculum || updateData.category;
      }
      if (updateData.course !== undefined || updateData.courseClass !== undefined) {
        dbSet.courseClass = updateData.course || updateData.courseClass;
      }
      if (updateData.subjects !== undefined) {
        dbSet.subjects = Array.isArray(updateData.subjects) 
          ? updateData.subjects 
          : (typeof updateData.subjects === 'string' ? updateData.subjects.split(',').map((s: string) => s.trim()).filter(Boolean) : [updateData.subjects]);
      }
      if (updateData.daysPerWeek !== undefined) dbSet.daysPerWeek = updateData.daysPerWeek;
      if (updateData.time !== undefined || updateData.preferredTime !== undefined) {
        dbSet.preferredTime = updateData.time || updateData.preferredTime;
      }
      if (updateData.duration !== undefined) dbSet.duration = updateData.duration;
      if (updateData.method !== undefined) dbSet.method = updateData.method;
      if (updateData.salary !== undefined) {
        const salaryNum = parseInt(updateData.salary.toString().replace(/[^0-9]/g, '')) || null;
        dbSet.salaryMin = salaryNum;
        dbSet.salaryMax = salaryNum;
      }
      if (updateData.studentGender !== undefined) dbSet.studentGender = updateData.studentGender;
      if (updateData.tutorGender !== undefined || updateData.preferredTutorGender !== undefined) {
        dbSet.preferredTutorGender = updateData.tutorGender || updateData.preferredTutorGender;
      }
      if (updateData.notes !== undefined || updateData.parentSpecialInstructions !== undefined) {
        dbSet.parentSpecialInstructions = updateData.notes || updateData.parentSpecialInstructions;
      }
      if (updateData.area !== undefined || updateData.location !== undefined) {
        dbSet.area = updateData.area || updateData.location;
      }
      if (updateData.district !== undefined || updateData.city !== undefined) {
        dbSet.district = updateData.district || updateData.city;
      }
      if (updateData.fullAddress !== undefined || updateData.location !== undefined) {
        dbSet.fullAddress = updateData.fullAddress || updateData.location;
      }
      if (updateData.studentsCount !== undefined || updateData.studentCount !== undefined) {
        dbSet.studentCount = parseInt(updateData.studentsCount?.toString() || updateData.studentCount?.toString() || '1') || 1;
      }
      if (mappedStatus !== undefined) {
        dbSet.status = mappedStatus;
        if (mappedStatus === 'open') {
          dbSet.publishedAt = new Date();
          dbSet.visibility = 'public';
        }
      }

      try {
        const updated = await db.update(tuitionRequests)
          .set(dbSet)
          .where(sql`${tuitionRequests.id}::text = ${id} OR ${tuitionRequests.jobCode} = ${id}`)
          .returning();

        // If not yet in DB, persist it
        if (updated.length === 0 && mockIdx >= 0) {
          const mock = mockTuitions[mockIdx];
          const salaryNum = parseInt(mock.salary?.toString().replace(/[^0-9]/g, '') || '4000') || 4000;
          const statusToUse = mappedStatus || (mock.status === 'PENDING_REVIEW' ? 'pending_review' : 'open');
          await db.insert(tuitionRequests).values({
            jobCode: mock.jobCode || mock.id,
            title: mock.title,
            curriculum: mock.curriculum || mock.category || 'General',
            courseClass: mock.course || mock.courseClass || 'General',
            subjects: Array.isArray(mock.subjects) ? mock.subjects : [mock.subjects || 'General'],
            daysPerWeek: mock.daysPerWeek || '3 days',
            preferredTime: mock.preferredTime || mock.time || 'Flexible',
            duration: mock.duration || '1 Hour',
            method: mock.method || 'Home Tutoring',
            salaryMin: salaryNum,
            salaryMax: salaryNum,
            district: mock.district || mock.city || 'Dhaka',
            area: mock.area || mock.location || 'Dhaka',
            fullAddress: mock.fullAddress || mock.location || 'Dhaka',
            parentSpecialInstructions: mock.notes || '',
            studentGender: mock.studentGender || 'Mix',
            preferredTutorGender: mock.preferredTutorGender || mock.tutorGender || 'Any',
            studentCount: parseInt(mock.studentCount?.toString() || '1') || 1,
            status: statusToUse,
            visibility: 'public',
            publishedAt: statusToUse === 'open' ? new Date() : null,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      } catch (err) {
        console.error("DB tuition edit error:", err);
      }
      res.json({ success: true, status: effectiveStatus });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message || "Failed to edit tuition" });
    }
  });

  app.get("/api/admin/tutors", async (_req, res) => {
    try {
      const all = await db.select().from(tutorProfiles);
      if (all && all.length > 0) {
        res.json(all.map(mapTutorToOld));
      } else {
        res.json(getMockTutors());
      }
    } catch (e) {
      res.json(getMockTutors());
    }
  });

  app.get("/api/admin/guardians", async (_req, res) => {
    try {
      const all = await db.select().from(guardiansTable);
      res.json((all as any[]).map((g: any) => ({ ...g, name: g.fullName })));
    } catch (e) {
      res.json(getMockGuardians());
    }
  });

  app.get("/api/admin/demos", async (_req, res) => {
    try {
      const results = await db.select({
        d: demosTable,
        t: tuitionsTable
      }).from(demosTable)
      .leftJoin(tuitionsTable, eq((demosTable as any).tuitionId, (tuitionsTable as any).id))
      .orderBy(desc(demosTable.createdAt));
      res.json((results as any[]).map(r => ({
        id: r.d.id,
        tuitionId: r.d.tuitionId,
        tutorId: r.d.tutorId,
        tutorName: r.d.tutorId,
        guardianName: r.d.guardianId || 'Unknown',
        guardianPhone: '',
        date: r.d.scheduledDate || 'TBD',
        status: r.d.status || 'Scheduled'
      })));
    } catch (e) {
      res.json(mockDemos);
    }
  });

  app.get("/api/admin/payments", async (_req, res) => {
    try {
      const results = await db.select({
        p: paymentsTable,
        t: tuitionsTable
      }).from(paymentsTable)
      .leftJoin(tuitionsTable, eq((paymentsTable as any).tuitionId, (tuitionsTable as any).id))
      .orderBy(desc(paymentsTable.createdAt));
      res.json((results as any[]).map(r => ({
        id: r.p.id,
        tuitionId: r.p.tuitionId,
        tutorId: r.p.tutorId,
        amount: r.p.amount,
        method: r.p.method,
        status: r.p.status,
        date: r.p.date || r.p.createdAt,
      })));
    } catch (e) {
      res.json(mockPayments);
    }
  });

  app.post("/api/admin/demos/:id/winner", async (req, res) => {
    try {
      const { id } = req.params;
      const demoIdx = mockDemos.findIndex((d: any) => d.id === id);
      if (demoIdx >= 0) {
        mockDemos[demoIdx].status = 'WINNER_SELECTED';
      }
      res.json({ success: true });
    } catch (e) {
      res.json({ success: true });
    }
  });

  // Schedule Demo Class for a Tuition & Send Tutor Notification
  app.post("/api/admin/tuitions/:id/schedule-demo", async (req, res) => {
    try {
      const { id } = req.params;
      const { tutorId, demoDate, notes } = req.body;
      if (!tutorId || !demoDate) {
        return res.status(400).json({ error: "Please select a tutor and date & time for the demo class." });
      }

      // 1. Find the tuition
      const mockT = mockTuitions.find((m: any) => m.id === id || m.jobCode === id || m.realId === id);
      const tuitionTitle = mockT?.title || `Tuition Job ${id}`;
      const guardianName = mockT?.guardianName || 'Guardian';
      const guardianPhone = mockT?.guardianPhone || '';
      const location = mockT?.fullAddress || mockT?.location || mockT?.area || 'Dhaka';

      // 2. Find tutor details
      let tutorObj = mockTutors.find((m: any) => m.id === tutorId || m.tutorCode === tutorId || m.name === tutorId);
      if (!tutorObj) {
        const appMatch = mockApplications.find((a: any) => a.id === tutorId || a.tutorId === tutorId || a.tutorCode === tutorId);
        if (appMatch) {
          tutorObj = {
            id: appMatch.tutorId || tutorId,
            tutorCode: appMatch.tutorCode || tutorId,
            name: appMatch.name,
            fullName: appMatch.name,
            phone: appMatch.phone,
            email: appMatch.email,
            university: appMatch.university
          };
        }
      }

      const tutorName = tutorObj?.fullName || tutorObj?.name || 'Tutor';
      const tutorCode = tutorObj?.tutorCode || tutorObj?.id || tutorId;
      const tutorPhone = tutorObj?.phone || '';
      const tutorEmail = tutorObj?.email || '';

      // 3. Create demo record
      const demoId = 'DEMO-' + Date.now();
      const formattedDate = new Date(demoDate);
      const dateStr = formattedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const timeStr = formattedDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      const newDemo = {
        id: demoId,
        tuitionId: mockT?.id || id,
        jobCode: mockT?.jobCode || id,
        tutorId: tutorId,
        tutorCode: tutorCode,
        tutorName: tutorName,
        guardianName: guardianName,
        guardianPhone: guardianPhone,
        location: location,
        date: dateStr,
        time: timeStr,
        scheduledDate: demoDate,
        notes: notes || '',
        meetingLink: `https://meet.google.com/tl-${Math.floor(100+Math.random()*900)}-demo`,
        status: 'Scheduled',
        createdAt: new Date().toISOString()
      };
      mockDemos.unshift(newDemo);

      // 4. Update tuition status to DEMO_SCHEDULED
      if (mockT) {
        mockT.status = 'DEMO_SCHEDULED';
        mockT.demoSchedule = demoDate;
        mockT.assignedTutorId = tutorCode;
        mockT.demoTutor = tutorCode;
        mockT.demoTutorName = tutorName;
        mockT.demoTutorPhone = tutorPhone;
        mockT.guardianDemoScheduled = true;
        mockT.updatedAt = new Date().toISOString();
      }

      try {
        await db.update(tuitionRequests).set({
          status: 'demo_scheduled',
          updatedAt: new Date()
        }).where(sql`${tuitionRequests.id}::text = ${id} OR ${tuitionRequests.jobCode} = ${id}`);
      } catch (dbErr) {}

      // 5. Send Notification to Tutor
      const notifId = 'NOTIF-' + Date.now();
      const newNotif = {
        id: notifId,
        recipientUserId: tutorObj?.userId || tutorCode,
        tutorId: tutorCode,
        tutorCode: tutorCode,
        tutorPhone: tutorPhone,
        tutorEmail: tutorEmail,
        type: 'DEMO_SCHEDULED',
        title: '🎉 Demo Class Assigned!',
        message: `Admin has scheduled a trial/demo class for "${tuitionTitle}" on ${dateStr} at ${timeStr}. Guardian: ${guardianName} (${guardianPhone}). Address: ${location}.`,
        tuitionId: mockT?.id || id,
        jobCode: mockT?.jobCode || id,
        scheduledDate: demoDate,
        guardianName: guardianName,
        guardianPhone: guardianPhone,
        location: location,
        isRead: false,
        createdAt: new Date().toISOString()
      };
      mockNotifications.unshift(newNotif);

      // 6. Send Notification to Guardian
      const guardianNotif = {
        id: 'NOTIF-G-' + Date.now(),
        type: 'DEMO_ASSIGNED_GUARDIAN',
        guardianPhone: guardianPhone,
        title: '✨ Demo Class Assigned by Admin!',
        message: `Admin has assigned tutor ${tutorName} for your trial/demo class on ${dateStr} at ${timeStr}.`,
        tuitionId: mockT?.id || id,
        createdAt: new Date().toISOString(),
        isRead: false
      };
      mockNotifications.unshift(guardianNotif);

      res.json({ success: true, demo: newDemo, notification: newNotif });
    } catch (e: any) {
      console.error("Schedule demo error:", e);
      res.status(500).json({ error: e.message || "Failed to schedule demo" });
    }
  });

  // Get demos for a specific tuition
  app.get("/api/admin/tuitions/:id/demos", async (req, res) => {
    try {
      const { id } = req.params;
      const matched = mockDemos.filter((d: any) => 
        d.tuitionId === id || d.jobCode === id || (id && String(d.tuitionId).includes(id)) || (id && String(d.jobCode).includes(id))
      );
      res.json({ demos: matched });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to load demos" });
    }
  });

  // Create payment record when tuition is confirmed
  app.post("/api/admin/payments", async (req, res) => {
    try {
      const { tuitionId, tutorId, amount, date, method, status } = req.body;
      const newPayment = {
        id: 'PAY-' + Date.now(),
        tuitionId: tuitionId || '',
        tutorId: tutorId || '',
        amount: Number(amount) || 0,
        method: method || 'Cash / Mobile Banking',
        status: status || 'Pending',
        date: date || new Date().toISOString()
      };
      mockPayments.unshift(newPayment);
      res.json({ success: true, payment: newPayment });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to create payment" });
    }
  });

  // Get notifications for logged-in user / tutor
  app.get("/api/tutor/notifications", async (req, res) => {
    try {
      let tokenUser: any = null;
      let token = req.cookies?.tutorlink_auth_token;
      if (req.headers.authorization?.startsWith('Bearer ')) {
        token = req.headers.authorization.substring(7);
      }
      if (token) tokenUser = verifyToken(token);

      const tutorQuery = req.query.tutorId as string;
      const myNotifs = mockNotifications.filter((n: any) => {
        if (tokenUser) {
          if (tokenUser.id && (n.tutorId === tokenUser.id || n.tutorCode === tokenUser.id || n.recipientUserId === tokenUser.id)) return true;
          if (tokenUser.phone && n.tutorPhone === tokenUser.phone) return true;
          if (tokenUser.email && n.tutorEmail === tokenUser.email) return true;
        }
        if (tutorQuery && (n.tutorId === tutorQuery || n.tutorCode === tutorQuery)) return true;
        return true; // Return all active notifications for demo convenience
      });

      res.json({ notifications: myNotifs });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to load notifications" });
    }
  });

  // Mark notification as read
  app.post("/api/tutor/notifications/:id/read", async (req, res) => {
    try {
      const { id } = req.params;
      const n = mockNotifications.find((item: any) => item.id === id);
      if (n) n.isRead = true;
      res.json({ success: true });
    } catch (e) {
      res.json({ success: true });
    }
  });

  // Get tutor's scheduled demos
  app.get("/api/tutor/my-demos", async (req, res) => {
    try {
      let tokenUser: any = null;
      let token = req.cookies?.tutorlink_auth_token;
      if (req.headers.authorization?.startsWith('Bearer ')) {
        token = req.headers.authorization.substring(7);
      }
      if (token) tokenUser = verifyToken(token);

      const tutorQuery = req.query.tutorId as string;
      const myDemos = mockDemos.filter((d: any) => {
        if (tokenUser) {
          if (tokenUser.id && (d.tutorId === tokenUser.id || d.tutorCode === tokenUser.id)) return true;
          if (tokenUser.name && d.tutorName && d.tutorName.toLowerCase() === tokenUser.name.toLowerCase()) return true;
        }
        if (tutorQuery && (d.tutorId === tutorQuery || d.tutorCode === tutorQuery)) return true;
        return true; // Fallback
      });

      res.json({ demos: myDemos });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to load demos" });
    }
  });

  app.patch("/api/v1/admin/workflow/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { targetStatus, archiveReason } = req.body;
      
      let mappedStatus = targetStatus;
      if (targetStatus === 'OPEN') mappedStatus = 'open';
      if (targetStatus === 'CONFIRMED') mappedStatus = 'assigned';
      if (targetStatus === 'ARCHIVED' || targetStatus === 'CANCELLED') mappedStatus = 'cancelled';

      await db.update(tuitionsTable).set({ status: mappedStatus }).where(eq(tuitionsTable.id, id));
      res.json({ success: true });
    } catch (e) {
      res.json({ success: true });
    }
  });

  app.all("/api/*", (req, res) => {
    res.json({ success: true, message: "Endpoint under construction" });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
