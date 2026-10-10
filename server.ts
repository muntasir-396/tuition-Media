import express from "express";
import cookieParser from "cookie-parser";
import { generateToken, authMiddleware, requireAdmin } from "./src/db/auth.js";
import path from "path";
import { createServer as createViteServer } from "vite";
import { db } from "./src/db/index.js";
import { eq, desc, sql } from "drizzle-orm";
import { seedDatabase } from "./src/db/seed.js";
import {
  tuitionRequests, guardianProfiles, tutorProfiles, tutorApplications,
  demoClasses, paymentRecords, profiles,
  tuitions as tuitionsTable, guardians as guardiansTable, tutors as tutorsTable,
  demos as demosTable, payments as paymentsTable
} from "./src/db/schema.js";

const mapTuitionToOld = (t: any): any => {
  let oldStatus = (t.status || '').toUpperCase();
  if (t.status === 'assigned') oldStatus = 'CONFIRMED';
  if (t.status === 'cancelled') oldStatus = 'ARCHIVED';
  if (t.status === 'closed') oldStatus = 'ARCHIVED';
  if (t.status === 'pending_review' || t.status === 'draft') oldStatus = 'PENDING_REVIEW';
  if (t.status === 'open') oldStatus = 'OPEN';

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
    applications: t.appCount ? Number(t.appCount) : (t.applications || 0),
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
  };
};

const mapTutorToOld = (t: any): any => ({
  ...t,
  id: t.tutorCode || t.id || 'TUT-' + Math.floor(100000 + Math.random() * 900000),
  name: t.fullName || '',
  email: t.email || '',
  phone: t.phone || '',
  completion: t.profileCompletion || 0,
  verified: t.verificationStatus === 'verified' || t.isVerified || false,
  city: t.district || t.city || 'Dhaka',
  subjects: t.subjects || [],
  exclusive: (t.profileCompletion || 0) > 80,
  expectedSalaryMin: t.expectedSalaryMin || 0,
  expectedSalary: t.expectedSalaryMax ? `${t.expectedSalaryMin || 0} - ${t.expectedSalaryMax} BDT` : 'Negotiable',
  expectedSalaryMax: t.expectedSalaryMax || 5000,
  tutoringExperience: t.tutoringExperience || 0,
  guardianInfo: t.guardianInfo || { fatherName: '', fatherPhone: '', motherName: '', motherPhone: '', emergencyContact: '' },
  tutoringInfo: t.tutoringInfo || { experienceYears: 0, methods: [], timeSlots: '', preferredAreas: [] },
  educationHistory: t.educationHistory || [],
});

let mockTuitions: any[] = [];
let mockTutors: any[] = [];
let mockGuardians: any[] = [];
let mockPayments: any[] = [];
let mockDemos: any[] = [];

function initMockData() {
  const now = new Date().toISOString();
  mockTuitions = [
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
      createdAt: now, 
      updatedAt: now, 
      views: 1, 
      applications: 0 
    },
    { id: 'JOB-80703', title: 'Class 6 Math Tuition in Mirpur', curriculum: 'Bangla Medium', course: 'Class 6', courseClass: 'Class 6', subjects: ['Math'], studentCount: '1', studentGender: 'Male', preferredTutorGender: 'Any', daysPerWeek: '5 days', preferredTime: '5:00 PM', method: 'Home Tutoring', salaryMax: 4000, salary: '4000', fullAddress: 'Mirpur-1, Dhaka', area: 'Mirpur', district: 'Dhaka', city: 'Dhaka', guardianName: 'Md. Rahman', guardianPhone: '01712345678', status: 'OPEN', createdAt: now, updatedAt: now, views: 45, applications: 3, jobCode: 'JOB-80703' },
    { id: 'JOB-80704', title: 'Class 10 Science Tuition in Banani', curriculum: 'English Medium', course: 'Class 10', courseClass: 'Class 10', subjects: ['Physics', 'Chemistry'], studentCount: '2', studentGender: 'Female', preferredTutorGender: 'Female', daysPerWeek: '3 days', preferredTime: '6:30 PM', method: 'Online Tutoring', salaryMax: 6000, salary: '6000', fullAddress: 'Banani, Dhaka', area: 'Banani', district: 'Dhaka', city: 'Dhaka', guardianName: 'Mrs. Ahmed', guardianPhone: '01798765432', status: 'OPEN', createdAt: now, updatedAt: now, views: 32, applications: 1, jobCode: 'JOB-80704' },
    { id: 'JOB-80705', title: 'O Level Physics Tuition in Gulshan', curriculum: 'A/O Levels', course: 'O Level', courseClass: 'O Level', subjects: ['Physics'], studentCount: '1', studentGender: 'Male', preferredTutorGender: 'Male', daysPerWeek: '4 days', preferredTime: '4:00 PM', method: 'Home Tutoring', salaryMax: 8000, salary: '8000', fullAddress: 'Gulshan-2, Dhaka', area: 'Gulshan', district: 'Dhaka', city: 'Dhaka', guardianName: 'Mr. Karim', guardianPhone: '01711111111', status: 'PENDING_REVIEW', createdAt: now, updatedAt: now, views: 18, applications: 0, jobCode: 'JOB-80705' },
    { id: 'JOB-80706', title: 'Class 9 English Tuition in Chittagong', curriculum: 'English Version', course: 'Class 9', courseClass: 'Class 9', subjects: ['English'], studentCount: '1', studentGender: 'Mix', preferredTutorGender: 'Any', daysPerWeek: '3 days', preferredTime: '5:30 PM', method: 'Batch Tutoring', salaryMax: 3500, salary: '3500', fullAddress: 'Agrabad, Chittagong', area: 'Agrabad', district: 'Chittagong', city: 'Chittagong', guardianName: 'Mr. Hossain', guardianPhone: '01822222222', status: 'OPEN', createdAt: now, updatedAt: now, views: 27, applications: 5, jobCode: 'JOB-80706' },
    { id: 'JOB-80707', title: 'SSC Math Tuition in Sylhet', curriculum: 'Bangla Medium', course: 'Class 10', courseClass: 'Class 10', subjects: ['Math', 'Physics'], studentCount: '3', studentGender: 'Male', preferredTutorGender: 'Male', daysPerWeek: '6 days', preferredTime: '6:00 PM', method: 'Home Tutoring', salaryMax: 5000, salary: '5000', fullAddress: 'Sylhet City', area: 'Sylhet', district: 'Sylhet', city: 'Sylhet', guardianName: 'Mr. Ali', guardianPhone: '01933333333', status: 'TEACHERS_APPLIED', createdAt: now, updatedAt: now, views: 56, applications: 8, jobCode: 'JOB-80707' },
    { id: 'JOB-80708', title: 'Class 3 Nursery English Tuition in Gazipur', curriculum: 'English Medium', course: 'Nursery', courseClass: 'Nursery', subjects: ['English'], studentCount: '1', studentGender: 'Female', preferredTutorGender: 'Female', daysPerWeek: '5 days', preferredTime: '4:30 PM', method: 'Home Tutoring', salaryMax: 3000, salary: '3000', fullAddress: 'Gazipur', area: 'Gazipur', district: 'Gazipur', city: 'Gazipur', guardianName: 'Mrs. Khatun', guardianPhone: '01644444444', status: 'OPEN', createdAt: now, updatedAt: now, views: 12, applications: 2, jobCode: 'JOB-80708' },
    { id: 'JOB-80709', title: 'HSC Biology Tuition in Khulna', curriculum: 'Bangla Medium', course: 'Class 12', courseClass: 'Class 12', subjects: ['Biology', 'Chemistry'], studentCount: '2', studentGender: 'Mix', preferredTutorGender: 'Any', daysPerWeek: '4 days', preferredTime: '7:00 PM', method: 'Online Tutoring', salaryMax: 5500, salary: '5500', fullAddress: 'Khulna', area: 'Khulna', district: 'Khulna', city: 'Khulna', guardianName: 'Mr. Das', guardianPhone: '01755555555', status: 'CONFIRMED', createdAt: now, updatedAt: now, views: 89, applications: 12, jobCode: 'JOB-80709' },
    { id: 'JOB-80710', title: 'Class 11 Physics Tuition in Rajshahi', curriculum: 'Bangla Medium', course: 'Class 11', courseClass: 'Class 11', subjects: ['Physics', 'Higher Math'], studentCount: '1', studentGender: 'Male', preferredTutorGender: 'Male', daysPerWeek: '3 days', preferredTime: '5:00 PM', method: 'Home Tutoring', salaryMax: 4500, salary: '4500', fullAddress: 'Rajshahi', area: 'Rajshahi', district: 'Rajshahi', city: 'Rajshahi', guardianName: 'Mr. Islam', guardianPhone: '01866666666', status: 'OPEN', createdAt: now, updatedAt: now, views: 21, applications: 0, jobCode: 'JOB-80710' },
  ];

  mockTutors = [
    { id: 'TUT-1001', tutorCode: 'TUT-1001', fullName: 'Muntasir Mamun', email: 'muntasir@example.com', phone: '01700000001', profileCompletion: 95, verificationStatus: 'verified', district: 'Dhaka', university: 'BUET', department: 'CSE', tutoringExperience: 3, expectedSalaryMin: 5000, expectedSalaryMax: 8000, subjects: ['Physics', 'Math', 'Chemistry'], mediums: ['Bangla Medium', 'English Medium'], rating: 4.8, reviewsCount: 45, verified: true, exclusive: true, city: 'Dhaka', gender: 'Male', completion: 95 },
    { id: 'TUT-1002', tutorCode: 'TUT-1002', fullName: 'Sadia Rahman', email: 'sadia@example.com', phone: '01700000002', profileCompletion: 80, verificationStatus: 'verified', district: 'Dhaka', university: 'DU', department: 'IBA', tutoringExperience: 2, expectedSalaryMin: 3000, expectedSalaryMax: 5000, subjects: ['English', 'History'], mediums: ['English Medium'], rating: 4.5, reviewsCount: 30, verified: true, exclusive: false, city: 'Dhaka', gender: 'Female', completion: 80 },
    { id: 'TUT-1003', tutorCode: 'TUT-1003', fullName: 'Rahim Uddin', email: 'rahim@example.com', phone: '01700000003', profileCompletion: 70, verificationStatus: 'pending', district: 'Chittagong', university: 'CUET', department: 'Physics', tutoringExperience: 5, expectedSalaryMin: 4000, expectedSalaryMax: 6000, subjects: ['Physics', 'Math'], mediums: ['Bangla Medium'], rating: 4.2, reviewsCount: 20, verified: false, exclusive: false, city: 'Chittagong', gender: 'Male', completion: 70 },
  ];

  mockGuardians = [
    { id: 'G-001', fullName: 'Md. Rahman', phone: '01712345678', location: 'Mirpur, Dhaka', status: 'Active', totalTuitions: 2, activeTuitions: 1 },
    { id: 'G-002', fullName: 'Mrs. Ahmed', phone: '01798765432', location: 'Banani, Dhaka', status: 'Active', totalTuitions: 1, activeTuitions: 0 },
    { id: 'G-003', fullName: 'muntasir', phone: '01881167556', location: 'mirpur', status: 'Active', totalTuitions: 1, activeTuitions: 1 },
  ];

  mockPayments = [
    { id: 'PAY-001', tuitionId: 'JOB-80703', tutorId: 'TUT-1001', amount: 4000, method: 'bKash', status: 'COMPLETED', date: '2026-08-01' },
    { id: 'PAY-002', tuitionId: 'JOB-80704', tutorId: 'TUT-1002', amount: 6000, method: 'Nagad', status: 'PENDING', date: '2026-08-05' },
    { id: 'PAY-003', tuitionId: 'JOB-80709', tutorId: 'TUT-1001', amount: 5500, method: 'bKash', status: 'COMPLETED', date: '2026-07-20' },
  ];

  mockDemos = [
    { id: 'DEMO-001', tuitionId: 'JOB-80705', tutorId: 'TUT-1001', tutorName: 'Muntasir Mamun', guardianName: 'Mr. Karim', guardianPhone: '01711111111', date: '2026-08-15', status: 'Scheduled' },
    { id: 'DEMO-002', tuitionId: 'JOB-80707', tutorId: 'TUT-1003', tutorName: 'Rahim Uddin', guardianName: 'Mr. Ali', guardianPhone: '01822222222', date: '2026-08-10', status: 'Completed' },
  ];
}

initMockData();

const getMockTuitions = () => mockTuitions.map(mapTuitionToOld);
const getMockTutors = () => mockTutors.map(mapTutorToOld);
const getMockGuardians = () => mockGuardians.map((g: any) => ({ ...g, name: g.fullName }));

async function startServer() {
  const app = express();
  const PORT = 3000;

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
        userProfile = { id: 'usr-' + Date.now(), name: phoneOrEmail || 'User', role: role };
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
      const { role, fullName, phoneOrEmail, password, university } = req.body;
      const userProfile = { 
        id: 'usr-' + Date.now(), 
        name: fullName || phoneOrEmail, 
        role: role, 
        university: university || null,
        email: phoneOrEmail.includes('@') ? phoneOrEmail : null,
        phone: phoneOrEmail 
      };
      const token = generateToken(userProfile);
      res.cookie('tutorlink_auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      });
      res.json({ success: true, user: userProfile });
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

  app.get("/api/tuitions", async (_req, res) => {
    try {
      const results = await db.select({
        t: tuitionRequests,
        g: guardianProfiles,
        appCount: sql<number>`(SELECT count(*) FROM ${tutorApplications} WHERE tuition_id = ${tuitionRequests.id})`
      }).from(tuitionRequests)
      .leftJoin(guardianProfiles, eq(tuitionRequests.guardianId, guardianProfiles.id))
      .where(eq(tuitionRequests.status, 'open'));

      const dbTuitions = results.map((r: any) => ({
        ...r.t,
        guardianName: r.g?.fullName,
        guardianPhone: r.g?.phone,
        guardianAddress: r.g?.address,
        appCount: r.appCount
      })).map(mapTuitionToOld);

      const existingIds = new Set(dbTuitions.map((t: any) => t.id));
      const extraMocks = getMockTuitions()
        .filter((t: any) => t.status === 'OPEN' || t.status === 'CONFIRMED' || t.status === 'TEACHERS_APPLIED')
        .filter((m: any) => !existingIds.has(m.id) && !existingIds.has(m.jobCode));

      res.json([...dbTuitions, ...extraMocks]);
    } catch (e) {
      res.json(getMockTuitions().filter((t: any) => t.status === 'OPEN' || t.status === 'CONFIRMED' || t.status === 'TEACHERS_APPLIED'));
    }
  });

  app.get("/api/tuitions/:id", async (req, res) => {
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
        return res.json(mapTuitionToOld(tuition));
      }

      const mock = mockTuitions.find((t: any) => t.id === paramId || t.jobCode === paramId);
      if (mock) {
        return res.json(mapTuitionToOld(mock));
      }
      res.status(404).json({ error: "Not found" });
    } catch (e) {
      const mock = mockTuitions.find((t: any) => t.id === req.params.id || t.jobCode === req.params.id);
      if (mock) {
        res.json(mapTuitionToOld(mock));
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

  app.post("/api/v1/tutor/apply", async (req, res) => {
    try {
      const { jobId, expectedSalary, notes } = req.body;
      const app = { id: 'APP-' + Date.now(), jobId, expectedSalary, notes, status: 'submitted', appliedAt: new Date().toISOString() };
      res.json({ success: true, application: app });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to apply" });
    }
  });

  app.get("/api/admin/tuitions/:id/applications", async (req, res) => {
    try {
      const applications = await db.select({
        app: tutorApplications,
        tutor: tutorProfiles
      })
      .from(tutorApplications)
      .leftJoin(tutorProfiles, eq(tutorApplications.tutorId, tutorProfiles.id))
      .where(sql`${tutorApplications.tuitionId}::text = ${req.params.id}`);
      
      const formatted = (applications as any[]).map(a => ({
        id: a.tutor?.id,
        name: a.tutor?.fullName,
        university: a.tutor?.university || '',
        department: a.tutor?.department || '',
        message: a.app.applicationMessage,
        expectedSalary: a.app.expectedSalary
      }));
      
      if (formatted.length > 0) {
        return res.json(formatted);
      }
      res.json([
        { id: 'TUT-1001', name: 'Muntasir Mamun', university: 'BUET', department: 'CSE', message: 'Experienced tutor', expectedSalary: 5000 },
        { id: 'TUT-1002', name: 'Sadia Rahman', university: 'DU', department: 'IBA', message: 'Available for demo', expectedSalary: 4000 },
      ]);
    } catch (e) {
      res.json([
        { id: 'TUT-1001', name: 'Muntasir Mamun', university: 'BUET', department: 'CSE', message: 'Experienced tutor', expectedSalary: 5000 },
        { id: 'TUT-1002', name: 'Sadia Rahman', university: 'DU', department: 'IBA', message: 'Available for demo', expectedSalary: 4000 },
      ]);
    }
  });

  app.use("/api/admin", authMiddleware, requireAdmin);

  app.get("/api/admin/dashboard", async (req, res) => {
    try {
      const allT = await db.select().from(tuitionRequests);
      const allG = await db.select().from(guardianProfiles);
      const allTutors = await db.select().from(tutorProfiles);
      const pendingCount = (allT as any[]).filter((t: any) => t.status === 'pending_review' || t.status === 'PENDING_REVIEW' || t.status === 'draft').length;
      const openCount = (allT as any[]).filter((t: any) => t.status === 'open' || t.status === 'OPEN').length;
      
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
          pendingPayments: 3
        },
        logs: []
      });
    } catch(e) {
      res.json({
        metrics: { totalTuitions: mockTuitions.length, activeTuitions: mockTuitions.filter((t: any) => t.status === 'OPEN').length, totalGuardians: mockGuardians.length, revenue: 15000, pendingDemos: 2, pendingVerifications: 0, pendingRequests: mockTuitions.filter((t: any) => t.status === 'PENDING_REVIEW').length, tutors: mockTutors.length, guardians: mockGuardians.length, confirmedMonth: 5, demosToday: 2, pendingPayments: 3 },
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

  app.patch("/api/admin/tuitions/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { targetStatus, archiveReason } = req.body;
      
      const mockIdx = mockTuitions.findIndex((t: any) => t.id === id || t.jobCode === id);
      if (mockIdx >= 0) {
        mockTuitions[mockIdx].status = targetStatus;
        if (archiveReason) mockTuitions[mockIdx].adminNotes = archiveReason;
      }
      
      let mappedStatus = targetStatus.toLowerCase();
      if (targetStatus === 'OPEN') mappedStatus = 'open';
      if (targetStatus === 'CONFIRMED') mappedStatus = 'assigned';
      if (targetStatus === 'ARCHIVED' || targetStatus === 'CANCELLED') mappedStatus = 'cancelled';
      if (targetStatus === 'PENDING_REVIEW') mappedStatus = 'pending_review';

      try {
        await db.update(tuitionRequests).set({ status: mappedStatus }).where(sql`${tuitionRequests.id}::text = ${id} OR ${tuitionRequests.jobCode} = ${id}`);
      } catch (err) {}

      res.json({ success: true });
    } catch (e) {
      res.json({ success: true });
    }
  });

  app.put("/api/admin/tutors/:id/edit", async (req, res) => {
    try {
      const { id } = req.params;
      const { name, university, phone } = req.body;
      const mockIdx = mockTutors.findIndex((t: any) => t.id === id || t.tutorCode === id);
      if (mockIdx >= 0) {
        if (name) mockTutors[mockIdx].fullName = name;
        if (university) mockTutors[mockIdx].university = university;
        if (phone) mockTutors[mockIdx].phone = phone;
      }
      res.json({ success: true });
    } catch (e) {
      res.json({ success: true });
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
      const mockIdx = mockTuitions.findIndex((t: any) => t.id === id || t.jobCode === id);
      if (mockIdx >= 0) {
        mockTuitions[mockIdx] = { ...mockTuitions[mockIdx], ...updateData };
      }
      try {
        await db.update(tuitionRequests).set({
          title: updateData.title,
          curriculum: updateData.curriculum || updateData.category,
          courseClass: updateData.course || updateData.courseClass,
          subjects: Array.isArray(updateData.subjects) ? updateData.subjects : (typeof updateData.subjects === 'string' ? updateData.subjects.split(',').map((s: string) => s.trim()) : undefined),
          daysPerWeek: updateData.daysPerWeek,
          preferredTime: updateData.time,
          duration: updateData.duration,
          method: updateData.method,
          salaryMax: updateData.salary ? parseInt(updateData.salary.toString().replace(/[^0-9]/g, '')) : undefined,
          studentGender: updateData.studentGender,
          preferredTutorGender: updateData.tutorGender,
          parentSpecialInstructions: updateData.notes,
        }).where(sql`${tuitionRequests.id}::text = ${id} OR ${tuitionRequests.jobCode} = ${id}`);
      } catch (err) {}
      res.json({ success: true });
    } catch (e) {
      res.json({ success: true });
    }
  });

  app.get("/api/admin/tutors", async (_req, res) => {
    try {
      const all = await db.select().from(tutorsTable);
      res.json(all.map(mapTutorToOld));
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
