import { TuitionJob, TutorProfile, ServiceCategory, CityMetric } from '../types';

export const CITY_METRICS: CityMetric[] = [
  { name: 'DHAKA', tutorCount: 131861 },
  { name: 'CHITTAGONG', tutorCount: 13938 },
  { name: 'SYLHET', tutorCount: 2504 },
  { name: 'KHULNA', tutorCount: 1845 },
  { name: 'GAZIPUR', tutorCount: 4210 },
  { name: 'CUMILLA', tutorCount: 1690 },
  { name: 'RAJSHAHI', tutorCount: 3120 },
  { name: 'BARISHAL', tutorCount: 1140 },
  { name: 'RANGPUR', tutorCount: 980 },
  { name: 'MYMENSINGH', tutorCount: 1450 },
];

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'bangla',
    name: 'Bangla Medium',
    iconName: 'BookOpen',
    tutorCount: '85,400+ Tutors',
    description: 'Class 1 to Class 12 NCTB curriculum tutoring',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  },
  {
    id: 'english-medium',
    name: 'English Medium',
    iconName: 'Globe',
    tutorCount: '42,100+ Tutors',
    description: 'Edexcel & Cambridge curriculum (O/A Level)',
    color: 'bg-blue-50 text-blue-600 border-blue-200',
  },
  {
    id: 'english-version',
    name: 'English Version',
    iconName: 'Languages',
    tutorCount: '38,900+ Tutors',
    description: 'NCTB curriculum taught in English medium',
    color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  },
  {
    id: 'a-levels',
    name: 'A Level / O Level',
    iconName: 'GraduationCap',
    tutorCount: '19,500+ Tutors',
    description: 'Specialized subject mentors for AS & A2 exams',
    color: 'bg-purple-50 text-purple-600 border-purple-200',
  },
  {
    id: 'madrasah',
    name: 'Madrasah Medium',
    iconName: 'BookMarked',
    tutorCount: '12,300+ Tutors',
    description: 'Dakhil, Alim & Quranic Tajweed education',
    color: 'bg-teal-50 text-teal-600 border-teal-200',
  },
  {
    id: 'admission',
    name: 'Admission Test',
    iconName: 'Award',
    tutorCount: '24,800+ Tutors',
    description: 'BUET, DU, Medical & Public University Prep',
    color: 'bg-amber-50 text-amber-600 border-amber-200',
  },
];

export const MOCK_JOBS: TuitionJob[] = [];
export const MOCK_TUTORS: TutorProfile[] = [];
