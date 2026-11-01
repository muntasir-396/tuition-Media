import { TuitionJob, TutorProfile, ServiceCategory, CityMetric } from '../types';

export const CITY_METRICS: CityMetric[] = [
  { name: 'DHAKA', tutorCount: 25 },
  { name: 'CHITTAGONG', tutorCount: 12 },
  { name: 'SYLHET', tutorCount: 8 },
  { name: 'KHULNA', tutorCount: 6 },
  { name: 'GAZIPUR', tutorCount: 7 },
  { name: 'CUMILLA', tutorCount: 4 },
  { name: 'RAJSHAHI', tutorCount: 5 },
  { name: 'BARISHAL', tutorCount: 3 },
  { name: 'RANGPUR', tutorCount: 2 },
  { name: 'MYMENSINGH', tutorCount: 3 },
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

export const BD_AREAS = [
  // Dhaka Division - Dhaka District
  { id: 'dhk-mirpur', division: 'Dhaka', district: 'Dhaka', thana: 'Mirpur', nameEn: 'Mirpur', nameBn: 'মিরপুর', slug: 'mirpur' },
  { id: 'dhk-dhanmondi', division: 'Dhaka', district: 'Dhaka', thana: 'Dhanmondi', nameEn: 'Dhanmondi', nameBn: 'ধানমন্ডি', slug: 'dhanmondi' },
  { id: 'dhk-uttara', division: 'Dhaka', district: 'Dhaka', thana: 'Uttara', nameEn: 'Uttara', nameBn: 'উত্তরা', slug: 'uttara' },
  { id: 'dhk-gulshan', division: 'Dhaka', district: 'Dhaka', thana: 'Gulshan', nameEn: 'Gulshan', nameBn: 'গুলশান', slug: 'gulshan' },
  { id: 'dhk-banani', division: 'Dhaka', district: 'Dhaka', thana: 'Banani', nameEn: 'Banani', nameBn: 'বনানী', slug: 'banani' },
  { id: 'dhk-mohammadpur', division: 'Dhaka', district: 'Dhaka', thana: 'Mohammadpur', nameEn: 'Mohammadpur', nameBn: 'মোহাম্মদপুর', slug: 'mohammadpur' },
  { id: 'dhk-badda', division: 'Dhaka', district: 'Dhaka', thana: 'Badda', nameEn: 'Badda', nameBn: 'বাড্ডা', slug: 'badda' },
  { id: 'dhk-bashundhara', division: 'Dhaka', district: 'Dhaka', thana: 'Vatara', nameEn: 'Bashundhara R/A', nameBn: 'বসুন্ধরা আ/এ', slug: 'bashundhara-ra' },
  { id: 'dhk-khilgaon', division: 'Dhaka', district: 'Dhaka', thana: 'Khilgaon', nameEn: 'Khilgaon', nameBn: 'খিলগাঁও', slug: 'khilgaon' },
  { id: 'dhk-malibagh', division: 'Dhaka', district: 'Dhaka', thana: 'Rampura', nameEn: 'Malibagh', nameBn: 'মালিবাগ', slug: 'malibagh' },
  { id: 'dhk-farmgate', division: 'Dhaka', district: 'Dhaka', thana: 'Tejgaon', nameEn: 'Farmgate', nameBn: 'ফার্মগেট', slug: 'farmgate' },
  { id: 'dhk-old-dhaka', division: 'Dhaka', district: 'Dhaka', thana: 'Lalbagh', nameEn: 'Old Dhaka / Lalbagh', nameBn: 'পুরান ঢাকা / লালবাগ', slug: 'old-dhaka' },
  { id: 'dhk-shantinagar', division: 'Dhaka', district: 'Dhaka', thana: 'Paltan', nameEn: 'Shantinagar / Kakrail', nameBn: 'শান্তিনগর / কাকরাইল', slug: 'shantinagar' },
  // Chittagong
  { id: 'ctg-gec', division: 'Chittagong', district: 'Chittagong', thana: 'Khulshi', nameEn: 'GEC Circle', nameBn: 'জিইসি মোড়', slug: 'gec-circle' },
  { id: 'ctg-agrabad', division: 'Chittagong', district: 'Chittagong', thana: 'Double Mooring', nameEn: 'Agrabad', nameBn: 'আগ্রাবাদ', slug: 'agrabad' },
  { id: 'ctg-nasirabad', division: 'Chittagong', district: 'Chittagong', thana: 'Panchlaish', nameEn: 'Nasirabad', nameBn: 'নাসিরাবাদ', slug: 'nasirabad' },
  { id: 'ctg-halishahar', division: 'Chittagong', district: 'Chittagong', thana: 'Halishahar', nameEn: 'Halishahar', nameBn: 'হালিশহর', slug: 'halishahar' },
  // Sylhet
  { id: 'syl-zindabazar', division: 'Sylhet', district: 'Sylhet', thana: 'Kotwali', nameEn: 'Zindabazar', nameBn: 'জিন্দাবাজার', slug: 'zindabazar' },
  { id: 'syl-amberkhana', division: 'Sylhet', district: 'Sylhet', thana: 'Airport', nameEn: 'Amberkhana', nameBn: 'আম্বরখানা', slug: 'amberkhana' },
  // Rajshahi
  { id: 'raj-motihar', division: 'Rajshahi', district: 'Rajshahi', thana: 'Motihar', nameEn: 'Motihar / RU Area', nameBn: 'মতিহার', slug: 'motihar' },
];
