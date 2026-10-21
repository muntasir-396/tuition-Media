import React, { useState } from 'react';
import { TutorProfile } from '../types';
import {
  X,
  User,
  GraduationCap,
  BookOpen,
  Users,
  Plus,
  Trash2,
  CheckCircle2,
  MapPin,
  DollarSign,
  Clock,
  Briefcase,
  AlertCircle,
  Save,
} from 'lucide-react';

interface EditTutorProfileModalProps {
  tutor: TutorProfile;
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: (updatedTutor: TutorProfile) => void;
}

const POPULAR_MEDIUMS = [
  'Bangla Medium',
  'English Version',
  'English Medium',
  'A/O Levels',
  'Madrasah',
  'Admission Test',
];

const POPULAR_CLASSES = [
  'Class 1-5',
  'Class 6-8',
  'Class 9-10 (SSC)',
  'Class 11-12 (HSC)',
  'O Level',
  'A Level',
  'Admission Test',
];

const POPULAR_SUBJECTS = [
  'General Math',
  'Higher Math',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'Bangla',
  'ICT',
  'Accounting',
  'Economics',
  'Finance',
  'General Science',
];

const POPULAR_AREAS = [
  'Mirpur',
  'Dhanmondi',
  'Uttara',
  'Mohammadpur',
  'Banani',
  'Gulshan',
  'Badda',
  'Bashundhara R/A',
  'Khilgaon',
  'Malibagh',
  'Farmgate',
  'Chittagong GEC',
  'Agrabad',
];

export const EditTutorProfileModal: React.FC<EditTutorProfileModalProps> = ({
  tutor,
  isOpen,
  onClose,
  onSaveSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'personal' | 'education' | 'preferences' | 'guardian'>('personal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    name: tutor.name || '',
    gender: tutor.gender || 'Male',
    dob: tutor.dob || '2001-01-01',
    bloodGroup: tutor.bloodGroup || 'B+',
    religion: tutor.religion || 'Islam',
    phone: tutor.phone || '',
    email: tutor.email || '',
    university: tutor.university || '',
    department: tutor.department || '',
    studentId: tutor.studentId || '',
    academicYear: tutor.academicYear || '',
    city: tutor.city || tutor.district || 'Dhaka',
    district: tutor.district || tutor.city || 'Dhaka',
    area: tutor.area || tutor.location || 'Mirpur',
    presentAddress: tutor.presentAddress || '',
    permanentAddress: tutor.permanentAddress || '',
    experienceYears: tutor.experienceYears ?? 2,
    expectedSalaryMin: tutor.expectedSalaryMin || 5000,
    expectedSalaryMax: tutor.expectedSalaryMax || 8000,
    availableDays: tutor.tutoringInfo?.availableDays || ['3 days/week'],
    availableTime: tutor.tutoringInfo?.timeSlots || '5:00 PM - 9:00 PM',
    methods: tutor.tutoringInfo?.methods || ['Home Tutoring'],
    mediums: tutor.mediums || ['Bangla Medium', 'English Version'],
    classes: tutor.classes || ['Class 9-10 (SSC)', 'Class 11-12 (HSC)'],
    subjects: tutor.subjects || ['Physics', 'Higher Math'],
    preferredAreas: tutor.tutoringInfo?.preferredAreas || ['Mirpur', 'Dhanmondi'],
    guardianInfo: {
      fatherName: tutor.guardianInfo?.fatherName || '',
      fatherPhone: tutor.guardianInfo?.fatherPhone || '',
      motherName: tutor.guardianInfo?.motherName || '',
      motherPhone: tutor.guardianInfo?.motherPhone || '',
      emergencyContact: tutor.guardianInfo?.emergencyContact || '',
    },
    educationHistory: tutor.educationHistory && tutor.educationHistory.length > 0 ? tutor.educationHistory : [
      { degree: 'B.Sc / Honours (Graduation)', institute: tutor.university || 'Dhaka University', boardOrGroup: tutor.department || 'Science', passingYear: '2025', result: 'CGPA 3.80' },
      { degree: 'HSC', institute: 'Notre Dame College', boardOrGroup: 'Science', passingYear: '2020', result: 'GPA 5.00' },
      { degree: 'SSC', institute: 'Government High School', boardOrGroup: 'Science', passingYear: '2018', result: 'GPA 5.00' }
    ]
  });

  const [newSubject, setNewSubject] = useState('');
  const [newArea, setNewArea] = useState('');

  if (!isOpen) return null;

  // Toggle helper
  const toggleArrayItem = (field: 'mediums' | 'classes' | 'subjects' | 'methods' | 'preferredAreas', item: string) => {
    setFormData(prev => {
      const arr = prev[field] as string[];
      if (arr.includes(item)) {
        return { ...prev, [field]: arr.filter(i => i !== item) };
      } else {
        return { ...prev, [field]: [...arr, item] };
      }
    });
  };

  // Education Helpers
  const addEducationDegree = () => {
    setFormData(prev => ({
      ...prev,
      educationHistory: [
        ...prev.educationHistory,
        { degree: 'Degree Name', institute: 'College / Institute', boardOrGroup: 'Science / Department', passingYear: '2024', result: 'GPA / CGPA' }
      ]
    }));
  };

  const removeEducationDegree = (index: number) => {
    setFormData(prev => ({
      ...prev,
      educationHistory: prev.educationHistory.filter((_, idx) => idx !== index)
    }));
  };

  const updateEducationDegree = (index: number, field: string, val: string) => {
    setFormData(prev => {
      const copy = [...prev.educationHistory];
      copy[index] = { ...copy[index], [field]: val };
      return { ...prev, educationHistory: copy };
    });
  };

  // Add custom subject or area
  const handleAddCustomSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubject.trim() && !formData.subjects.includes(newSubject.trim())) {
      setFormData(prev => ({ ...prev, subjects: [...prev.subjects, newSubject.trim()] }));
      setNewSubject('');
    }
  };

  const handleAddCustomArea = (e: React.FormEvent) => {
    e.preventDefault();
    if (newArea.trim() && !formData.preferredAreas.includes(newArea.trim())) {
      setFormData(prev => ({ ...prev, preferredAreas: [...prev.preferredAreas, newArea.trim()] }));
      setNewArea('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        id: tutor.id,
        tutorCode: tutor.tutorCode,
        name: formData.name,
        fullName: formData.name,
        gender: formData.gender,
        dob: formData.dob,
        bloodGroup: formData.bloodGroup,
        religion: formData.religion,
        phone: formData.phone,
        email: formData.email,
        university: formData.university,
        department: formData.department,
        studentId: formData.studentId,
        academicYear: formData.academicYear,
        city: formData.district,
        district: formData.district,
        area: formData.area,
        presentAddress: formData.presentAddress,
        permanentAddress: formData.permanentAddress,
        expectedSalaryMin: Number(formData.expectedSalaryMin),
        expectedSalaryMax: Number(formData.expectedSalaryMax),
        expectedSalary: `${formData.expectedSalaryMin} - ${formData.expectedSalaryMax} BDT`,
        experienceYears: Number(formData.experienceYears),
        tutoringExperience: Number(formData.experienceYears),
        mediums: formData.mediums,
        classes: formData.classes,
        subjects: formData.subjects,
        tutoringMethod: formData.methods,
        tutoringInfo: {
          experienceYears: Number(formData.experienceYears),
          methods: formData.methods,
          timeSlots: formData.availableTime,
          preferredAreas: formData.preferredAreas,
          availableDays: formData.availableDays,
        },
        guardianInfo: formData.guardianInfo,
        educationHistory: formData.educationHistory,
      };

      const res = await fetch('/api/tutor/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update tutor profile');
      }

      onSaveSuccess(data.tutor || payload);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Something went wrong updating profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#84CC16] text-slate-950 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Edit Tutor Profile</h3>
              <p className="text-xs text-slate-400">
                Tuition Terminal Profile Setup • ID: <strong className="text-lime-400">{tutor.tutorCode || tutor.id}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 border-b border-slate-200 bg-slate-50 flex flex-wrap gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('personal')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'personal'
                ? 'bg-white text-slate-900 border-t-2 border-t-[#84CC16] shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5 text-[#84CC16]" /> 1. Personal & Address
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('education')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'education'
                ? 'bg-white text-slate-900 border-t-2 border-t-[#84CC16] shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-[#84CC16]" /> 2. Education Qualifications
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preferences')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'preferences'
                ? 'bg-white text-slate-900 border-t-2 border-t-[#84CC16] shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#84CC16]" /> 3. Tuition Preferences
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('guardian')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'guardian'
                ? 'bg-white text-slate-900 border-t-2 border-t-[#84CC16] shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#84CC16]" /> 4. Emergency Contacts
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: PERSONAL & ADDRESS */}
          {activeTab === 'personal' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:border-[#84CC16] focus:outline-none"
                    placeholder="e.g. Muntasir Mamun"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-semibold bg-white focus:border-[#84CC16] focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={e => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:border-[#84CC16] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-semibold bg-white focus:border-[#84CC16] focus:outline-none"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Religion</label>
                  <input
                    type="text"
                    value={formData.religion}
                    onChange={e => setFormData({ ...formData, religion: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:border-[#84CC16] focus:outline-none"
                    placeholder="e.g. Islam, Hinduism"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number (Login & Match)</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:border-[#84CC16] focus:outline-none"
                    placeholder="017XXXXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:border-[#84CC16] focus:outline-none"
                    placeholder="tutor@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City / District *</label>
                  <input
                    type="text"
                    required
                    value={formData.district}
                    onChange={e => setFormData({ ...formData, district: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:border-[#84CC16] focus:outline-none"
                    placeholder="e.g. Dhaka, Chittagong"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#84CC16]" /> Detailed Residential Addresses
                </h4>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Present Address (Where you currently live)</label>
                  <textarea
                    rows={2}
                    value={formData.presentAddress}
                    onChange={e => setFormData({ ...formData, presentAddress: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:border-[#84CC16] focus:outline-none"
                    placeholder="e.g. House #14, Road #5, Mirpur DOHS, Dhaka"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Permanent Address</label>
                  <textarea
                    rows={2}
                    value={formData.permanentAddress}
                    onChange={e => setFormData({ ...formData, permanentAddress: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:border-[#84CC16] focus:outline-none"
                    placeholder="e.g. Sonargaon, Narayanganj"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EDUCATIONAL QUALIFICATIONS */}
          {activeTab === 'education' && (
            <div className="space-y-5">
              <div className="p-3 bg-lime-50 border border-lime-200 rounded-xl text-xs text-lime-900">
                <strong>Educational Credentials:</strong> Tuition Terminal verifies your highest degree (Honours / Bachelor) and board examination certificates.
              </div>

              {/* Current Institute / University */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Current University / College *</label>
                  <input
                    type="text"
                    required
                    value={formData.university}
                    onChange={e => setFormData({ ...formData, university: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-sm font-semibold focus:border-[#84CC16] focus:outline-none"
                    placeholder="e.g. BUET, DU, NSU, BRAC"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department / Discipline *</label>
                  <input
                    type="text"
                    required
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-sm font-semibold focus:border-[#84CC16] focus:outline-none"
                    placeholder="e.g. Computer Science, Physics, BBA"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Student ID (Optional)</label>
                  <input
                    type="text"
                    value={formData.studentId}
                    onChange={e => setFormData({ ...formData, studentId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-sm font-semibold focus:border-[#84CC16] focus:outline-none"
                    placeholder="e.g. 1905001"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Academic Year / Year of Study</label>
                  <input
                    type="text"
                    value={formData.academicYear}
                    onChange={e => setFormData({ ...formData, academicYear: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-sm font-semibold focus:border-[#84CC16] focus:outline-none"
                    placeholder="e.g. 3rd Year / Completed"
                  />
                </div>
              </div>

              {/* Degrees list */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Degree Certifications (SSC, HSC, Bachelor, etc.)
                  </h4>
                  <button
                    type="button"
                    onClick={addEducationDegree}
                    className="px-3 py-1.5 rounded-lg bg-[#84CC16] hover:bg-[#65A30D] text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" /> Add Degree
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.educationHistory.map((edu, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 relative">
                      <button
                        type="button"
                        onClick={() => removeEducationDegree(idx)}
                        className="absolute top-3 right-3 p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                        title="Remove Degree"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Degree Title</label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={e => updateEducationDegree(idx, 'degree', e.target.value)}
                            className="w-full p-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                            placeholder="e.g. SSC, HSC, Honours / B.Sc"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Institute / University / College</label>
                          <input
                            type="text"
                            value={edu.institute}
                            onChange={e => updateEducationDegree(idx, 'institute', e.target.value)}
                            className="w-full p-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                            placeholder="e.g. Notre Dame College"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Board / Group / Discipline</label>
                          <input
                            type="text"
                            value={edu.boardOrGroup}
                            onChange={e => updateEducationDegree(idx, 'boardOrGroup', e.target.value)}
                            className="w-full p-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                            placeholder="e.g. Science (Dhaka Board)"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">Passing Year</label>
                            <input
                              type="text"
                              value={edu.passingYear}
                              onChange={e => updateEducationDegree(idx, 'passingYear', e.target.value)}
                              className="w-full p-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                              placeholder="2020"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">Result (GPA/CGPA)</label>
                            <input
                              type="text"
                              value={edu.result}
                              onChange={e => updateEducationDegree(idx, 'result', e.target.value)}
                              className="w-full p-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-emerald-700 font-bold"
                              placeholder="GPA 5.00"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TUITION PREFERENCES */}
          {activeTab === 'preferences' && (
            <div className="space-y-5">
              {/* Tutoring Experience & Salary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Experience (Years) *</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={formData.experienceYears}
                    onChange={e => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-sm font-semibold focus:border-[#84CC16] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Min Expected Salary (BDT)</label>
                  <input
                    type="number"
                    step="500"
                    value={formData.expectedSalaryMin}
                    onChange={e => setFormData({ ...formData, expectedSalaryMin: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-sm font-semibold focus:border-[#84CC16] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Max Expected Salary (BDT)</label>
                  <input
                    type="number"
                    step="500"
                    value={formData.expectedSalaryMax}
                    onChange={e => setFormData({ ...formData, expectedSalaryMax: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-sm font-semibold focus:border-[#84CC16] focus:outline-none"
                  />
                </div>
              </div>

              {/* Mediums */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Preferred Mediums / Curriculums</label>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_MEDIUMS.map(med => (
                    <button
                      key={med}
                      type="button"
                      onClick={() => toggleArrayItem('mediums', med)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        formData.mediums.includes(med)
                          ? 'bg-[#84CC16] text-slate-950 shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {formData.mediums.includes(med) ? '✓ ' : '+ '}{med}
                    </button>
                  ))}
                </div>
              </div>

              {/* Classes */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Preferred Classes to Teach</label>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_CLASSES.map(cls => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => toggleArrayItem('classes', cls)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        formData.classes.includes(cls)
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {formData.classes.includes(cls) ? '✓ ' : '+ '}{cls}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subjects */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Preferred Subjects</label>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_SUBJECTS.map(sub => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => toggleArrayItem('subjects', sub)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                        formData.subjects.includes(sub)
                          ? 'bg-lime-50 border-lime-300 text-lime-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {formData.subjects.includes(sub) ? '✓ ' : '+ '}{sub}
                    </button>
                  ))}
                </div>

                {/* Add Custom Subject */}
                <div className="flex gap-2 pt-1 max-w-sm">
                  <input
                    type="text"
                    value={newSubject}
                    onChange={e => setNewSubject(e.target.value)}
                    placeholder="Other subject (e.g. French, Coding)"
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSubject}
                    className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Preferred Areas */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Preferred Tutoring Locations / Areas</label>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_AREAS.map(area => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => toggleArrayItem('preferredAreas', area)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                        formData.preferredAreas.includes(area)
                          ? 'bg-lime-50 border-lime-300 text-lime-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      📍 {area}
                    </button>
                  ))}
                </div>

                {/* Add Custom Area */}
                <div className="flex gap-2 pt-1 max-w-sm">
                  <input
                    type="text"
                    value={newArea}
                    onChange={e => setNewArea(e.target.value)}
                    placeholder="Add area (e.g. Rampura, Khilgaon)"
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomArea}
                    className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GUARDIAN & EMERGENCY */}
          {activeTab === 'guardian' && (
            <div className="space-y-4">
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900">
                <strong>Emergency Verification:</strong> Tuition Terminal requires parent / emergency contact for safety validation and high-tier tuition matchmaking.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Father's Name</label>
                  <input
                    type="text"
                    value={formData.guardianInfo.fatherName}
                    onChange={e => setFormData({
                      ...formData,
                      guardianInfo: { ...formData.guardianInfo, fatherName: e.target.value }
                    })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:border-[#84CC16] focus:outline-none"
                    placeholder="e.g. Md. Abdur Rahman"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Father's Mobile Number</label>
                  <input
                    type="tel"
                    value={formData.guardianInfo.fatherPhone}
                    onChange={e => setFormData({
                      ...formData,
                      guardianInfo: { ...formData.guardianInfo, fatherPhone: e.target.value }
                    })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:border-[#84CC16] focus:outline-none"
                    placeholder="017XXXXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mother's Name</label>
                  <input
                    type="text"
                    value={formData.guardianInfo.motherName}
                    onChange={e => setFormData({
                      ...formData,
                      guardianInfo: { ...formData.guardianInfo, motherName: e.target.value }
                    })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:border-[#84CC16] focus:outline-none"
                    placeholder="e.g. Fatema Begum"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mother's Mobile Number</label>
                  <input
                    type="tel"
                    value={formData.guardianInfo.motherPhone}
                    onChange={e => setFormData({
                      ...formData,
                      guardianInfo: { ...formData.guardianInfo, motherPhone: e.target.value }
                    })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:border-[#84CC16] focus:outline-none"
                    placeholder="017XXXXXXXX"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Contact Number *</label>
                  <input
                    type="tel"
                    value={formData.guardianInfo.emergencyContact}
                    onChange={e => setFormData({
                      ...formData,
                      guardianInfo: { ...formData.guardianInfo, emergencyContact: e.target.value }
                    })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:border-[#84CC16] focus:outline-none"
                    placeholder="017XXXXXXXX"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer Save Button */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-md flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-[#84CC16]" />
              <span>{isSubmitting ? 'Saving...' : 'Save & Update Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
