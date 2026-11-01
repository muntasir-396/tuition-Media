/**
 * Tutor Profile Completion Score Calculator and Public Whitelist Serializer
 */

export interface ProfileCompletionResult {
  score: number;
  sections: {
    personal: { score: number; max: number; completed: boolean; missing: string[] };
    contact: { score: number; max: number; completed: boolean; missing: string[] };
    education: { score: number; max: number; completed: boolean; missing: string[] };
    preferences: { score: number; max: number; completed: boolean; missing: string[] };
    areas: { score: number; max: number; completed: boolean; missing: string[] };
    experience: { score: number; max: number; completed: boolean; missing: string[] };
    documents: { score: number; max: number; completed: boolean; missing: string[] };
    emergency: { score: number; max: number; completed: boolean; missing: string[] };
  };
  canApplyToTuitions: boolean;
}

export function computeProfileCompletion(tutor: any, relations?: {
  education?: any[];
  preferences?: any;
  areas?: any[];
  availability?: any[];
  experience?: any[];
  documents?: any[];
  emergency?: any;
}): ProfileCompletionResult {
  let score = 0;

  // 1. Personal (15 points)
  const personalMissing: string[] = [];
  let personalScore = 0;
  if (tutor.fullName) personalScore += 3; else personalMissing.push('Full Name');
  if (tutor.gender) personalScore += 2; else personalMissing.push('Gender');
  if (tutor.dateOfBirth) personalScore += 2; else personalMissing.push('Date of Birth');
  if (tutor.profilePhotoUrl || tutor.avatar || tutor.photo) personalScore += 4; else personalMissing.push('Profile Photo');
  if (tutor.bloodGroup) personalScore += 2; else personalMissing.push('Blood Group');
  if (tutor.shortBio || tutor.tagline) personalScore += 2; else personalMissing.push('Bio / Tagline');
  score += personalScore;

  // 2. Contact & Address (10 points)
  const contactMissing: string[] = [];
  let contactScore = 0;
  if (tutor.primaryPhone || tutor.phone) contactScore += 5; else contactMissing.push('Primary Phone Number');
  if (tutor.presentAddress) contactScore += 5; else contactMissing.push('Present Address');
  score += contactScore;

  // 3. Education (20 points)
  const eduMissing: string[] = [];
  let eduScore = 0;
  const hasEdu = (relations?.education && relations.education.length > 0) || 
                 (tutor.educationHistory && Array.isArray(tutor.educationHistory) && tutor.educationHistory.length > 0) ||
                 (tutor.university && tutor.department);
  if (hasEdu) {
    eduScore = 20;
  } else {
    eduMissing.push('At least one Degree / Educational Record');
  }
  score += eduScore;

  // 4. Preferences (15 points)
  const prefMissing: string[] = [];
  let prefScore = 0;
  const pref = relations?.preferences || tutor;
  const hasMediums = (pref.mediums && Array.isArray(pref.mediums) && pref.mediums.length > 0);
  const hasClasses = (pref.classes && Array.isArray(pref.classes) && pref.classes.length > 0);
  const hasSalary = (pref.expectedSalaryMin || pref.expectedSalary || tutor.expectedSalaryMin || tutor.expectedSalary);
  if (hasMediums) prefScore += 5; else prefMissing.push('Tutoring Mediums');
  if (hasClasses) prefScore += 5; else prefMissing.push('Target Classes');
  if (hasSalary) prefScore += 5; else prefMissing.push('Expected Salary');
  score += prefScore;

  // 5. Areas & Availability (10 points)
  const areaMissing: string[] = [];
  let areaScore = 0;
  const hasAreas = (relations?.areas && relations.areas.length > 0) || 
                   (tutor.preferredAreas && Array.isArray(tutor.preferredAreas) && tutor.preferredAreas.length > 0);
  if (hasAreas) areaScore += 5; else areaMissing.push('Preferred Tutoring Areas');
  const hasAvail = (relations?.availability && relations.availability.length > 0) || tutor.availableDays;
  if (hasAvail) areaScore += 5; else areaMissing.push('Weekly Available Slots');
  score += areaScore;

  // 6. Experience (5 points)
  const expMissing: string[] = [];
  let expScore = 0;
  const hasExp = (relations?.experience && relations.experience.length > 0) || (tutor.tutoringExperience > 0 || tutor.experienceYears > 0);
  if (hasExp) expScore = 5; else expMissing.push('Tutoring Experience / Past Tuitions');
  score += expScore;

  // 7. Documents (20 points)
  const docMissing: string[] = [];
  let docScore = 0;
  const hasDocs = (relations?.documents && relations.documents.length > 0) || tutor.nidDocumentUrl || tutor.nidStatus === 'verified';
  if (hasDocs) docScore = 20; else docMissing.push('Verification Document (NID or Student ID)');
  score += docScore;

  // 8. Emergency Contact (5 points)
  const emMissing: string[] = [];
  let emScore = 0;
  const em = relations?.emergency || tutor.guardianInfo;
  if (em && (em.emergencyContactPhone || em.fatherPhone || em.motherPhone || em.phone)) {
    emScore = 5;
  } else {
    emMissing.push('Emergency Contact Person & Phone');
  }
  score += emScore;

  const finalScore = Math.min(100, Math.max(0, score));

  return {
    score: finalScore,
    sections: {
      personal: { score: personalScore, max: 15, completed: personalScore >= 12, missing: personalMissing },
      contact: { score: contactScore, max: 10, completed: contactScore === 10, missing: contactMissing },
      education: { score: eduScore, max: 20, completed: eduScore === 20, missing: eduMissing },
      preferences: { score: prefScore, max: 15, completed: prefScore === 15, missing: prefMissing },
      areas: { score: areaScore, max: 10, completed: areaScore === 10, missing: areaMissing },
      experience: { score: expScore, max: 5, completed: expScore === 5, missing: expMissing },
      documents: { score: docScore, max: 20, completed: docScore === 20, missing: docMissing },
      emergency: { score: emScore, max: 5, completed: emScore === 5, missing: emMissing },
    },
    canApplyToTuitions: finalScore >= 80,
  };
}

/**
 * Public Whitelist Serializer
 * Strips all sensitive information before sending tutor data to public / guardian viewers.
 */
export function serializeTutorForPublic(tutor: any) {
  if (!tutor) return null;

  // Mask name if hideLastName is true
  let displayName = tutor.fullName || tutor.name || 'Verified Tutor';
  if (tutor.hideLastName) {
    const parts = displayName.split(' ');
    if (parts.length > 1) {
      displayName = `${parts[0]} ${parts[parts.length - 1][0]}.`;
    }
  }

  // Format education summary
  let eduSummary = tutor.educationHistory || [];
  if (Array.isArray(eduSummary)) {
    eduSummary = eduSummary.map((e: any) => ({
      level: e.level || e.degree,
      degree: e.degreeName || e.degree,
      institute: e.institute,
      passingYear: e.passingYear,
      result: e.resultValue || e.result,
    }));
  }

  return {
    id: tutor.id,
    userId: tutor.userId,
    tutorCode: tutor.tutorCode,
    name: displayName,
    fullName: displayName,
    avatar: tutor.profilePhotoUrl || tutor.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName)}`,
    gender: tutor.gender,
    university: tutor.university || 'University Student',
    department: tutor.department || 'General',
    academicYear: tutor.academicYear || '',
    tagline: tutor.tagline || '',
    shortBio: tutor.shortBio || tutor.bio || '',
    verified: tutor.verificationStatus === 'verified' || tutor.verified === true,
    exclusive: tutor.exclusive || false,
    rating: tutor.rating || '4.9',
    reviewsCount: tutor.reviewsCount || 0,
    experienceYears: tutor.tutoringExperience || tutor.experienceYears || 1,
    expectedSalary: tutor.expectedSalary || (tutor.expectedSalaryMin ? `৳${tutor.expectedSalaryMin} - ৳${tutor.expectedSalaryMax || tutor.expectedSalaryMin + 3000}` : 'Negotiable'),
    expectedSalaryMin: tutor.expectedSalaryMin,
    expectedSalaryMax: tutor.expectedSalaryMax,
    mediums: tutor.mediums || ['Bangla Medium', 'English Version'],
    classes: tutor.classes || ['Class 9-10 (SSC)', 'Class 11-12 (HSC)'],
    subjects: tutor.subjects || ['Mathematics', 'Physics'],
    preferredAreas: tutor.preferredAreas || ['Mirpur', 'Dhanmondi', 'Uttara'],
    tutoringMethod: tutor.tutoringMethod || ['Home Tutoring', 'Online Tutoring'],
    availableDays: tutor.availableDays || ['3 days/week', '4 days/week'],
    educationSummary: eduSummary,
    profileCompletion: tutor.profileCompletion || tutor.completion || 85,
    status: tutor.status || 'active',
  };
}
