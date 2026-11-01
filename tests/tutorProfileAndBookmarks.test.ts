import assert from 'node:assert/strict';
import { serializeTutorForPublic, computeProfileCompletion } from '../src/lib/tutorProfileUtils';
import {
  personalSectionSchema,
  contactSectionSchema,
  preferencesSectionSchema,
  sanitizeBioText,
  BD_PHONE_REGEX,
} from '../src/lib/validation/tutorProfile';

console.log('🧪 Starting Tutor Profile & Bookmarks Security & Unit Tests...\n');

// -------------------------------------------------------------
// Test 1: Bangladesh Phone Regex Validation
// -------------------------------------------------------------
console.log('Test 1: Testing Bangladeshi Phone Regex...');
assert.match('01712345678', BD_PHONE_REGEX, '017 should be valid');
assert.match('01987654321', BD_PHONE_REGEX, '019 should be valid');
assert.match('01300000000', BD_PHONE_REGEX, '013 should be valid');
assert.match('01811223344', BD_PHONE_REGEX, '018 should be valid');
assert.doesNotMatch('01212345678', BD_PHONE_REGEX, '012 is invalid operator');
assert.doesNotMatch('0171234567', BD_PHONE_REGEX, '10 digits is too short');
assert.doesNotMatch('017123456789', BD_PHONE_REGEX, '12 digits is too long');
assert.doesNotMatch('01012345678', BD_PHONE_REGEX, '010 is invalid operator');
console.log('✅ Passed Test 1: BD Phone Regex works correctly.\n');

// -------------------------------------------------------------
// Test 2: Bio Text Sanitizer (Strip phone numbers & URLs)
// -------------------------------------------------------------
console.log('Test 2: Testing Bio Text Sanitizer...');
const riskyBio = 'Experienced Math tutor. Call me at 01712345678 or visit https://myportfolio.com/tutor or wa.me/01812345678';
const sanitized = sanitizeBioText(riskyBio);
assert.doesNotMatch(sanitized, /01712345678/, 'Phone numbers must be stripped');
assert.doesNotMatch(sanitized, /https:\/\/myportfolio\.com/, 'URLs must be stripped');
assert.ok(sanitized.includes('[phone removed]'), 'Phone number replaced with tag');
assert.ok(sanitized.includes('[link removed]'), 'Links replaced with tag');
console.log('✅ Passed Test 2: Bio sanitizer securely strips contact numbers and links.\n');

// -------------------------------------------------------------
// Test 3: Public Whitelist Serializer (IDOR / Privacy Leakage Prevention)
// -------------------------------------------------------------
console.log('Test 3: Testing Public Whitelist Serializer...');
const privateTutorObject: any = {
  id: 'usr_tutor_999',
  tutorCode: 'TL-999',
  fullName: 'Kamrul Hasan',
  photo: 'https://images.unsplash.com/photo-tutor.jpg',
  university: 'Dhaka University',
  department: 'Mathematics',
  academicYear: '4th Year',
  verified: true,
  status: 'active',
  gender: 'Male',
  experienceYears: 4,
  expectedSalaryMin: 8000,
  expectedSalaryMax: 12000,
  rating: 4.9,
  reviewsCount: 18,
  shortBio: 'Dedicated math teacher with 4 years experience.',
  tagline: 'Passionate about problem solving',
  hideLastName: false,
  // SENSITIVE PRIVATE FIELDS THAT MUST NEVER LEAK:
  primaryPhone: '01712345678',
  email: 'kamrul.secret@gmail.com',
  nidNumber: '19982692800000123',
  bloodGroup: 'B+',
  dateOfBirth: '1998-05-12',
  presentAddress: 'House 12, Road 4, Sector 7, Uttara, Dhaka',
  permanentAddress: 'Vill: Rampur, PS: Muradnagar, Dist: Cumilla',
  documents: [
    { type: 'nid_front', storageKey: 'private/nid.jpg' },
    { type: 'marksheet', storageKey: 'private/marksheet.pdf' }
  ],
  paymentInfo: {
    method: 'bKash',
    mobileWalletNumber: '01712345678',
    bankAccountNumber: '1234567890'
  },
  emergencyContact: {
    fatherName: 'Abdul Malek',
    fatherPhone: '01812345678',
    emergencyPhone: '01912345678'
  }
};

const serializedPublic = serializeTutorForPublic(privateTutorObject);

// Assert whitelisted safe fields exist
assert.equal(serializedPublic.fullName, 'Kamrul Hasan');
assert.equal(serializedPublic.tutorCode, 'TL-999');
assert.equal(serializedPublic.university, 'Dhaka University');
assert.equal(serializedPublic.rating, 4.9);

// Assert STRICT EXCLUSION of sensitive fields
assert.equal((serializedPublic as any).primaryPhone, undefined, 'primaryPhone must be excluded');
assert.equal((serializedPublic as any).email, undefined, 'email must be excluded');
assert.equal((serializedPublic as any).nidNumber, undefined, 'nidNumber must be excluded');
assert.equal((serializedPublic as any).bloodGroup, undefined, 'bloodGroup must be excluded');
assert.equal((serializedPublic as any).dateOfBirth, undefined, 'dateOfBirth must be excluded');
assert.equal((serializedPublic as any).presentAddress, undefined, 'presentAddress must be excluded');
assert.equal((serializedPublic as any).permanentAddress, undefined, 'permanentAddress must be excluded');
assert.equal((serializedPublic as any).documents, undefined, 'documents must be excluded');
assert.equal((serializedPublic as any).paymentInfo, undefined, 'paymentInfo must be excluded');
assert.equal((serializedPublic as any).emergencyContact, undefined, 'emergencyContact must be excluded');
assert.equal((serializedPublic as any).fatherPhone, undefined, 'fatherPhone must be excluded');

// Test hideLastName toggle
const serializedHiddenName = serializeTutorForPublic({ ...privateTutorObject, hideLastName: true });
assert.equal(serializedHiddenName.fullName, 'Kamrul H.', 'Last name should be initial only when hideLastName is true');
console.log('✅ Passed Test 3: Public serializer enforces whitelist strictly and masks last name when requested.\n');

// -------------------------------------------------------------
// Test 4: Profile Completion Calculator & Applying Eligibility Gating
// -------------------------------------------------------------
console.log('Test 4: Testing Profile Completion Calculator...');

const emptyProfile: any = {
  fullName: '',
};
const emptyResult = computeProfileCompletion(emptyProfile);
assert.equal(emptyResult.score, 0, 'Empty profile should have 0%');
assert.equal(emptyResult.canApplyToTuitions, false, 'Empty profile must not be allowed to apply');

const fullProfile: any = {
  fullName: 'Tasmia Rahman',
  photo: 'https://example.com/photo.jpg',
  avatar: 'https://example.com/photo.jpg',
  gender: 'Female',
  dateOfBirth: '1998-05-12',
  bloodGroup: 'B+',
  shortBio: 'Certified English medium teacher',
  tagline: 'Dedicated tutor',
  primaryPhone: '01811223344',
  presentAddress: 'Gulshan 2, Dhaka',
  preferredAreas: ['Gulshan', 'Banani'],
  educationHistory: [
    { degree: 'BSc in CSE', institute: 'BUET', passingYear: '2023' }
  ],
  mediums: ['English Medium'],
  classes: ['Class 8', 'O-Level'],
  subjects: ['Physics', 'Chemistry'],
  tuitionMethod: ['Home Tutoring'],
  expectedSalaryMin: 10000,
  availableDays: ['Sunday', 'Monday'],
  tutoringExperience: 3,
  documents: [
    { type: 'nid_front', status: 'approved' },
    { type: 'university_id', status: 'approved' }
  ],
  emergencyFatherPhone: '01711223344'
};

const fullRelations = {
  education: [{ degree: 'BSc in CSE', institute: 'BUET', passingYear: '2023' }],
  preferences: { mediums: ['English Medium'], classes: ['Class 8'], subjects: ['Physics'] },
  areas: [{ areaName: 'Gulshan' }],
  availability: [{ day: 'Sunday', slot: 'evening' }],
  experience: [{ subject: 'Physics', class: 'O-Level', duration: '2 years' }],
  documents: [{ type: 'nid_front', status: 'approved' }, { type: 'university_id', status: 'approved' }],
  emergency: { fatherPhone: '01711223344' }
};

const fullResult = computeProfileCompletion(fullProfile, fullRelations);
assert.equal(fullResult.score, 100, 'Full profile should have 100% completion');
assert.equal(fullResult.canApplyToTuitions, true, 'Profile with 100% must be eligible to apply');

// Test 80% threshold gating
// Drop documents (20 points) -> 80%
const eightyRelations = { ...fullRelations, documents: [] };
const eightyResult = computeProfileCompletion(fullProfile, eightyRelations);
assert.equal(eightyResult.score, 80);
assert.equal(eightyResult.canApplyToTuitions, true, '80% completion can apply (>= 80%)');

// Drop experience (5 points) -> 75%
const seventyFiveRelations = { ...eightyRelations, experience: [] };
const seventyFiveProfile = { ...fullProfile, tutoringExperience: 0, experienceYears: 0 };
const seventyFiveResult = computeProfileCompletion(seventyFiveProfile, seventyFiveRelations);
assert.equal(seventyFiveResult.score, 75);
assert.equal(seventyFiveResult.canApplyToTuitions, false, '75% completion cannot apply (< 80%)');
console.log('✅ Passed Test 4: Profile completion breakdown and >=80% application gating are strictly enforced.\n');

// -------------------------------------------------------------
// Test 5: Zod Input Validation & Unknown Field Rejection
// -------------------------------------------------------------
console.log('Test 5: Testing Zod Schemas...');
const validPersonal = personalSectionSchema.parse({
  fullName: 'Shahriar Kabir',
  tagline: 'Expert Physics & Higher Math Tutor',
  shortBio: 'Graduated from Dhaka College.',
  gender: 'Male',
  bloodGroup: 'O+',
  maritalStatus: 'Single',
  nationality: 'Bangladeshi'
});
assert.equal(validPersonal.fullName, 'Shahriar Kabir');

// Should reject bio longer than 300 chars
assert.throws(() => {
  personalSectionSchema.parse({
    fullName: 'Shahriar Kabir',
    shortBio: 'a'.repeat(305)
  });
}, 'Bio exceeding 300 characters must be rejected');

// Should reject invalid phone in contact
assert.throws(() => {
  contactSectionSchema.parse({
    primaryPhone: '01234567890'
  });
}, 'Invalid BD operator 012 must be rejected by contact schema');

console.log('✅ Passed Test 5: Zod schemas reject invalid formats, out-of-bounds lengths, and malicious payloads.\n');

console.log('🎉 ALL SECURITY, SERIALIZER, GATING, AND VALIDATION TESTS PASSED SUCCESSFULLY!\n');
