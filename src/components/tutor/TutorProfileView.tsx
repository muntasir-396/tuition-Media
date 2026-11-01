import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { BD_AREAS } from '../../data/mockData';
import {
  User,
  Phone,
  GraduationCap,
  Sliders,
  MapPin,
  Briefcase,
  FileText,
  CreditCard,
  ShieldAlert,
  Star,
  Lock,
  Edit3,
  Check,
  X,
  AlertCircle,
  Eye,
  Download,
  Share2,
  Plus,
  Trash2,
  Calendar,
  Clock,
  CheckCircle2,
  UploadCloud,
  ChevronRight,
  ShieldCheck,
  Video,
  AlertTriangle
} from 'lucide-react';

export const TutorProfileView: React.FC = () => {
  const { currentUser, userRole, setActiveTab } = useApp();
  const [profile, setProfile] = useState<any>(null);
  const [completion, setCompletion] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeSection, setActiveSection] = useState<string>('personal');
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showMissingModal, setShowMissingModal] = useState<boolean>(false);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // New Education Modal state
  const [isAddEduOpen, setIsAddEduOpen] = useState<boolean>(false);
  const [newEdu, setNewEdu] = useState<any>({
    level: 'Bachelor',
    degreeName: '',
    groupMajor: '',
    institute: '',
    boardUniversity: '',
    passingYear: '',
    resultType: 'CGPA',
    resultValue: '',
    currentlyStudying: false,
    department: ''
  });

  // New Experience Modal state
  const [isAddExpOpen, setIsAddExpOpen] = useState<boolean>(false);
  const [newExp, setNewExp] = useState<any>({
    subject: '',
    courseClass: '',
    duration: '6 months',
    role: 'Home Tutor',
    description: '',
    achievements: ''
  });

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tutor/me/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        setCompletion(data.completion);
      }
    } catch (e) {
      console.error('Failed to load tutor profile', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleStartEdit = (section: string) => {
    setEditingSection(section);
    setFormData({ ...profile });
    setHasUnsavedChanges(false);
  };

  const handleCancelEdit = () => {
    if (hasUnsavedChanges && !confirm('You have unsaved changes. Discard them?')) {
      return;
    }
    setEditingSection(null);
    setHasUnsavedChanges(false);
  };

  const handleSaveSection = async (section: string) => {
    setIsSaving(true);
    try {
      let payload = {};
      if (section === 'personal') {
        payload = {
          fullName: formData.fullName || profile.fullName,
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth || formData.dob,
          bloodGroup: formData.bloodGroup,
          religion: formData.religion,
          maritalStatus: formData.maritalStatus || 'Single',
          nationality: formData.nationality || 'Bangladeshi',
          nidNumber: formData.nidNumber,
          tagline: formData.tagline,
          shortBio: formData.shortBio
        };
      } else if (section === 'contact') {
        payload = {
          primaryPhone: formData.primaryPhone || formData.phone || profile.phone,
          secondaryPhone: formData.secondaryPhone || null,
          whatsappNumber: formData.whatsappNumber || null,
          email: formData.email,
          presentAddress: formData.presentAddress,
          permanentAddress: formData.permanentAddress,
          sameAsPresentAddress: formData.sameAsPresentAddress || false
        };
      } else if (section === 'preferences') {
        payload = {
          mediums: formData.mediums || ['Bangla Medium'],
          classes: formData.classes || ['Class 9-10 (SSC)'],
          tuitionTypes: formData.tutoringMethod || ['Home Tutoring'],
          studentGenderPref: formData.studentGenderPref || 'Any',
          expectedSalaryMin: parseInt(formData.expectedSalaryMin || 4000),
          expectedSalaryMax: parseInt(formData.expectedSalaryMax || 8000),
          salaryNegotiable: formData.salaryNegotiable ?? true,
          preferredDaysPerWeek: formData.preferredDaysPerWeek || '3 days/week'
        };
      } else if (section === 'areas') {
        payload = {
          preferredAreas: formData.preferredAreas || ['Mirpur'],
          maxTravelDistanceKm: parseInt(formData.maxTravelDistanceKm || 5),
          willingToRelocate: formData.willingToRelocate || false
        };
      } else if (section === 'availability') {
        payload = {
          slots: formData.availableSlots || [
            { dayOfWeek: 'Saturday', slot: 'evening', isAvailable: true },
            { dayOfWeek: 'Monday', slot: 'evening', isAvailable: true },
            { dayOfWeek: 'Wednesday', slot: 'evening', isAvailable: true }
          ],
          isOpenForTuition: formData.isOpenForTuition ?? true
        };
      } else if (section === 'payment') {
        payload = {
          method: formData.paymentMethod || 'bKash',
          mobileWalletNumber: formData.mobileWalletNumber || '',
          bankName: formData.bankName || '',
          bankAccountHolder: formData.bankAccountHolder || '',
          bankAccountNumber: formData.bankAccountNumber || '',
          bankBranch: formData.bankBranch || ''
        };
      } else if (section === 'emergency') {
        payload = {
          fatherName: formData.fatherName || '',
          fatherPhone: formData.fatherPhone || '',
          motherName: formData.motherName || '',
          motherPhone: formData.motherPhone || '',
          emergencyContactName: formData.emergencyContactName || 'Guardian',
          emergencyContactRelation: formData.emergencyContactRelation || 'Parent',
          emergencyContactPhone: formData.emergencyContactPhone || '01700000000'
        };
      } else if (section === 'privacy') {
        payload = {
          profileVisibility: formData.profileVisibility || 'public',
          hideLastName: formData.hideLastName || false
        };
      }

      const res = await fetch(`/api/tutor/me/profile/${section}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        setProfile(resData.profile);
        setCompletion(resData.completion);
        setEditingSection(null);
        setHasUnsavedChanges(false);
        triggerToast(`Saved ${section} details successfully!`);
      } else {
        alert(resData.error || 'Failed to update section');
      }
    } catch (e: any) {
      alert('Error updating section: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddEducation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/tutor/me/education', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEdu)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAddEduOpen(false);
        fetchProfile();
        triggerToast('Education record added!');
      } else {
        alert(data.error || 'Failed to add education');
      }
    } catch (e) {
      alert('Network error adding education');
    }
  };

  const handleDeleteEducation = async (id: string) => {
    if (!confirm('Are you sure you want to remove this education record?')) return;
    try {
      const res = await fetch(`/api/tutor/me/education/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProfile();
        triggerToast('Education record removed');
      }
    } catch (e) {
      alert('Failed to delete education record');
    }
  };

  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/tutor/me/experience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExp)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAddExpOpen(false);
        fetchProfile();
        triggerToast('Experience record added!');
      } else {
        alert(data.error || 'Failed to add experience');
      }
    } catch (e) {
      alert('Network error adding experience');
    }
  };

  const handleDeleteExperience = async (id: string) => {
    if (!confirm('Are you sure you want to remove this experience entry?')) return;
    try {
      const res = await fetch(`/api/tutor/me/experience/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProfile();
        triggerToast('Experience record removed');
      }
    } catch (e) {
      alert('Failed to delete experience');
    }
  };

  const handleDownloadCV = () => {
    triggerToast('Generating official TutorLink CV PDF...');
    setTimeout(() => {
      window.print();
    }, 800);
  };

  const handleShareProfile = () => {
    const url = `${window.location.origin}/?tab=tutors&id=${profile?.tutorCode || profile?.id}`;
    navigator.clipboard.writeText(url);
    triggerToast('Public profile link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-12 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-[#84CC16] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold text-slate-500">Loading your complete tutor profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
        <h3 className="font-bold text-slate-800">Tutor Profile Not Found</h3>
        <p className="text-xs text-slate-500">Please log in with a Tutor account to manage your profile.</p>
        <button
          onClick={() => setActiveTab('jobs')}
          className="px-5 py-2.5 rounded-xl bg-[#84CC16] text-white font-bold text-xs"
        >
          Return to Jobs
        </button>
      </div>
    );
  }

  const score = completion?.score || profile.profileCompletion || 65;
  const canApply = score >= 80;

  const sections = [
    { id: 'personal', name: 'Personal', icon: User, complete: completion?.sections?.personal?.completed },
    { id: 'contact', name: 'Contact & Address', icon: Phone, complete: completion?.sections?.contact?.completed },
    { id: 'education', name: 'Education', icon: GraduationCap, complete: completion?.sections?.education?.completed },
    { id: 'preferences', name: 'Preferences', icon: Sliders, complete: completion?.sections?.preferences?.completed },
    { id: 'areas', name: 'Areas & Slots', icon: MapPin, complete: completion?.sections?.areas?.completed },
    { id: 'experience', name: 'Experience', icon: Briefcase, complete: completion?.sections?.experience?.completed },
    { id: 'documents', name: 'Documents', icon: FileText, complete: completion?.sections?.documents?.completed },
    { id: 'payment', name: 'Payment & Payout', icon: CreditCard, complete: true },
    { id: 'emergency', name: 'Emergency Contact', icon: ShieldAlert, complete: completion?.sections?.emergency?.completed },
    { id: 'reviews', name: 'Reviews', icon: Star, complete: true },
    { id: 'privacy', name: 'Account & Privacy', icon: Lock, complete: true }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-800 animate-slide-up">
          <CheckCircle2 className="w-5 h-5 text-[#84CC16] shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* TOP SUMMARY CARD */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Avatar and Primary Identity */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative group shrink-0">
              <img
                src={profile.profilePhotoUrl || profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.fullName || profile.name || 'Tutor')}`}
                alt={profile.fullName}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover bg-slate-100 border-2 border-slate-200 shadow-sm"
              />
              <button
                onClick={() => handleStartEdit('personal')}
                className="absolute inset-0 bg-slate-900/60 rounded-3xl text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[10px] font-bold transition-opacity cursor-pointer"
              >
                <Edit3 className="w-4 h-4 mb-0.5" />
                <span>Change</span>
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  {profile.fullName || profile.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-lime-100 text-lime-800 text-[11px] font-black border border-lime-200">
                  {profile.tutorCode || 'TT-1001'}
                </span>
                {profile.verificationStatus === 'verified' ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black flex items-center gap-1 border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> VERIFIED
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold border border-amber-200">
                    Pending Verification
                  </span>
                )}
              </div>

              <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{profile.university} {profile.department ? `• ${profile.department}` : ''}</span>
              </p>

              <div className="flex items-center gap-3 text-xs text-slate-500 font-medium pt-1">
                <span className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{profile.rating || '5.0'} ({profile.reviewsCount || 0} reviews)</span>
                </span>
                <span>•</span>
                <span>{profile.tutoringExperience || 2}+ years tutoring</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap self-start lg:self-center">
            <button
              onClick={() => setShowPreviewModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span>Preview as Guardian</span>
            </button>

            <button
              onClick={handleDownloadCV}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Download CV</span>
            </button>

            <button
              onClick={handleShareProfile}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs transition-colors cursor-pointer"
              title="Share profile link"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Profile Completion Progress Bar */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-800">Profile Completion:</span>
              <strong className={`font-black ${score >= 80 ? 'text-[#65A30D]' : 'text-amber-600'}`}>
                {score}%
              </strong>
              {score < 80 && (
                <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline">
                  (80% required to apply for jobs)
                </span>
              )}
            </div>

            <button
              onClick={() => setShowMissingModal(true)}
              className="text-xs font-bold text-[#84CC16] hover:underline cursor-pointer"
            >
              What's missing?
            </button>
          </div>

          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                score >= 80 ? 'bg-[#84CC16]' : score >= 50 ? 'bg-amber-400' : 'bg-red-400'
              }`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT: STICKY NAV + SECTION VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sticky Section Navigation (Desktop) / Horizontal Tabs (Mobile) */}
        <div className="lg:col-span-4 bg-white p-3 sm:p-4 rounded-3xl border border-slate-200 shadow-xs lg:sticky lg:top-24">
          <div className="flex lg:flex-col overflow-x-auto gap-1 no-scrollbar">
            {sections.map((sec, idx) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => {
                    if (editingSection && hasUnsavedChanges && !confirm('Discard unsaved changes?')) {
                      return;
                    }
                    setActiveSection(sec.id);
                    setEditingSection(null);
                    setHasUnsavedChanges(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#84CC16]' : 'text-slate-400'}`} />
                    <span>{idx + 1}. {sec.name}</span>
                  </div>

                  {sec.complete && (
                    <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ml-2 ${isActive ? 'text-[#84CC16]' : 'text-emerald-500'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Section Content Panel */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          {/* Section Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-black text-slate-900 capitalize">
                {activeSection.replace('-', ' ')} Information
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {activeSection === 'contact' || activeSection === 'emergency'
                  ? '🔒 Private: Stored securely and masked from public view.'
                  : 'Update your details to increase your profile strength and attract guardians.'}
              </p>
            </div>

            {editingSection !== activeSection && activeSection !== 'reviews' && (
              <button
                onClick={() => handleStartEdit(activeSection)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            )}
          </div>

          {/* 1. PERSONAL SECTION */}
          {activeSection === 'personal' && (
            editingSection === 'personal' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={formData.fullName || ''}
                      onChange={(e) => {
                        setFormData({ ...formData, fullName: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden focus:border-[#84CC16]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                    <select
                      value={formData.gender || 'Male'}
                      onChange={(e) => {
                        setFormData({ ...formData, gender: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden focus:border-[#84CC16]"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.dateOfBirth || formData.dob || ''}
                      onChange={(e) => {
                        setFormData({ ...formData, dateOfBirth: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden focus:border-[#84CC16]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Blood Group</label>
                    <select
                      value={formData.bloodGroup || 'B+'}
                      onChange={(e) => {
                        setFormData({ ...formData, bloodGroup: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden focus:border-[#84CC16]"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tagline (Max 80 chars)</label>
                  <input
                    type="text"
                    maxLength={80}
                    value={formData.tagline || ''}
                    placeholder="e.g. BUET CSE | Dedicated Mathematics & Physics Mentor"
                    onChange={(e) => {
                      setFormData({ ...formData, tagline: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden focus:border-[#84CC16]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Short Bio (Max 300 chars - no phones/links)</label>
                  <textarea
                    rows={3}
                    maxLength={300}
                    value={formData.shortBio || ''}
                    placeholder="Describe your tutoring philosophy and methodology..."
                    onChange={(e) => {
                      setFormData({ ...formData, shortBio: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden focus:border-[#84CC16]"
                  />
                </div>

                {/* Save & Cancel */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleCancelEdit}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={isSaving}
                    onClick={() => handleSaveSection('personal')}
                    className="px-6 py-2.5 rounded-xl bg-[#84CC16] hover:bg-[#74b816] text-white font-black text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    {isSaving ? 'Saving...' : 'Save Personal Details'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block font-semibold">Full Name</span>
                  <strong className="text-slate-900 font-bold">{profile.fullName || profile.name}</strong>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block font-semibold">Gender</span>
                  <strong className="text-slate-900 font-bold">{profile.gender || 'Not specified'}</strong>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block font-semibold">Date of Birth</span>
                  <strong className="text-slate-900 font-bold">{profile.dateOfBirth || profile.dob || 'Not specified'}</strong>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block font-semibold">Blood Group</span>
                  <strong className="text-slate-900 font-bold">{profile.bloodGroup || 'Not specified'}</strong>
                </div>
                {profile.tagline && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 sm:col-span-2">
                    <span className="text-slate-400 block font-semibold">Tagline</span>
                    <strong className="text-slate-900 font-bold">{profile.tagline}</strong>
                  </div>
                )}
                {profile.shortBio && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 sm:col-span-2">
                    <span className="text-slate-400 block font-semibold">Bio</span>
                    <p className="text-slate-700 font-medium leading-relaxed mt-0.5">{profile.shortBio}</p>
                  </div>
                )}
              </div>
            )
          )}

          {/* 2. CONTACT SECTION */}
          {activeSection === 'contact' && (
            editingSection === 'contact' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Primary Phone Number *</label>
                    <input
                      type="text"
                      value={formData.primaryPhone || formData.phone || ''}
                      onChange={(e) => {
                        setFormData({ ...formData, primaryPhone: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden focus:border-[#84CC16]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Number (Optional)</label>
                    <input
                      type="text"
                      value={formData.whatsappNumber || ''}
                      placeholder="e.g. 01712345678"
                      onChange={(e) => {
                        setFormData({ ...formData, whatsappNumber: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden focus:border-[#84CC16]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden focus:border-[#84CC16]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Secondary Phone (Optional)</label>
                    <input
                      type="text"
                      value={formData.secondaryPhone || ''}
                      onChange={(e) => {
                        setFormData({ ...formData, secondaryPhone: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden focus:border-[#84CC16]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Present Address *</label>
                  <textarea
                    rows={2}
                    value={formData.presentAddress || ''}
                    placeholder="House, Road, Area, Dhaka"
                    onChange={(e) => {
                      setFormData({ ...formData, presentAddress: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden focus:border-[#84CC16]"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleCancelEdit}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={isSaving}
                    onClick={() => handleSaveSection('contact')}
                    className="px-6 py-2.5 rounded-xl bg-[#84CC16] hover:bg-[#74b816] text-white font-black text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    {isSaving ? 'Saving...' : 'Save Contact Details'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block font-semibold">Primary Phone</span>
                  <strong className="text-slate-900 font-bold">{profile.primaryPhone || profile.phone}</strong>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block font-semibold">Email</span>
                  <strong className="text-slate-900 font-bold">{profile.email || 'Not provided'}</strong>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 sm:col-span-2">
                  <span className="text-slate-400 block font-semibold">Present Address</span>
                  <strong className="text-slate-900 font-bold">{profile.presentAddress || 'Not set'}</strong>
                </div>
              </div>
            )
          )}

          {/* 3. EDUCATION SECTION */}
          {activeSection === 'education' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500">Degree & Exam Records</span>
                <button
                  onClick={() => setIsAddEduOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#84CC16] hover:bg-[#74b816] text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Degree</span>
                </button>
              </div>

              {(!profile.education || profile.education.length === 0) ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                  <GraduationCap className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-500 font-semibold">No formal education entries yet.</p>
                  <button
                    onClick={() => setIsAddEduOpen(true)}
                    className="text-xs font-bold text-[#84CC16] hover:underline"
                  >
                    + Add your college / university degree
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {profile.education.map((edu: any) => (
                    <div key={edu.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900">{edu.degreeName || edu.degree}</span>
                          <span className="px-2 py-0.5 rounded bg-lime-100 text-lime-800 text-[10px] font-bold">
                            {edu.level}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-semibold mt-0.5">{edu.institute}</p>
                        <p className="text-[11px] text-slate-400 font-medium">
                          Passing Year: {edu.passingYear || 'Current'} • Result: {edu.resultValue || edu.result || 'CGPA 3.8'}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDeleteEducation(edu.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                        title="Delete entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. PREFERENCES SECTION */}
          {activeSection === 'preferences' && (
            editingSection === 'preferences' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Mediums</label>
                  <div className="flex flex-wrap gap-2">
                    {['Bangla Medium', 'English Medium', 'English Version', 'Madrasah', 'A/O Levels'].map(m => {
                      const selected = (formData.mediums || []).includes(m);
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => {
                            const cur = formData.mediums || [];
                            const updated = selected ? cur.filter((x: string) => x !== m) : [...cur, m];
                            setFormData({ ...formData, mediums: updated });
                            setHasUnsavedChanges(true);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                            selected ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          {m}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Min Expected Salary (BDT)</label>
                    <input
                      type="number"
                      value={formData.expectedSalaryMin || 4000}
                      onChange={(e) => {
                        setFormData({ ...formData, expectedSalaryMin: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Max Expected Salary (BDT)</label>
                    <input
                      type="number"
                      value={formData.expectedSalaryMax || 8000}
                      onChange={(e) => {
                        setFormData({ ...formData, expectedSalaryMax: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button onClick={handleCancelEdit} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50">
                    Cancel
                  </button>
                  <button
                    disabled={isSaving}
                    onClick={() => handleSaveSection('preferences')}
                    className="px-6 py-2.5 rounded-xl bg-[#84CC16] hover:bg-[#74b816] text-white font-black text-xs shadow-xs"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block font-semibold">Mediums</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {(profile.mediums || ['Bangla Medium']).map((m: string) => (
                      <span key={m} className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 font-bold text-xs">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block font-semibold">Expected Salary Range</span>
                  <strong className="text-slate-900 font-bold text-sm block mt-0.5">
                    {profile.expectedSalary || '৳5000 - ৳8000 BDT'}
                  </strong>
                </div>
              </div>
            )
          )}

          {/* 5. AREAS & AVAILABILITY */}
          {activeSection === 'areas' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <span className="text-slate-400 block font-semibold">Preferred Tutoring Areas (Max 15)</span>
                <div className="flex flex-wrap gap-2">
                  {(profile.preferredAreas || ['Mirpur', 'Dhanmondi', 'Uttara']).map((a: string) => (
                    <span key={a} className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{a}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <span className="text-slate-400 block font-semibold">Weekly Availability</span>
                <p className="text-slate-700 font-bold">
                  {profile.availableDays ? profile.availableDays.join(', ') : '3 days/week (Evening slot)'}
                </p>
              </div>
            </div>
          )}

          {/* 6. EXPERIENCE */}
          {activeSection === 'experience' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500">Past Tuitions & Teaching Track Record</span>
                <button
                  onClick={() => setIsAddExpOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#84CC16] hover:bg-[#74b816] text-white font-bold text-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Experience</span>
                </button>
              </div>

              {(!profile.pastTuitions || profile.pastTuitions.length === 0) ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                  <Briefcase className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-500 font-semibold">No past tuition records added yet.</p>
                  <button onClick={() => setIsAddExpOpen(true)} className="text-xs font-bold text-[#84CC16] hover:underline">
                    + Add a previous tuition job
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {profile.pastTuitions.map((exp: any) => (
                    <div key={exp.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{exp.subject} ({exp.courseClass})</h4>
                        <p className="text-xs text-slate-500">{exp.role} • {exp.duration}</p>
                        {exp.description && <p className="text-xs text-slate-600 mt-1 italic">"{exp.description}"</p>}
                      </div>
                      <button onClick={() => handleDeleteExperience(exp.id)} className="p-1.5 text-slate-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 7. DOCUMENTS SECTION */}
          {activeSection === 'documents' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Document Verification Rules
                </span>
                <p className="leading-relaxed">
                  Upload clear photos of your National ID (front & back) or University Student ID. Files are encrypted and only accessible by authorized TutorLink administrators.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <strong className="text-slate-900 font-bold">NID Card (Front & Back)</strong>
                    <span className="px-2 py-0.5 rounded bg-lime-100 text-lime-800 text-[10px] font-bold">
                      {profile.nidStatus || 'Pending'}
                    </span>
                  </div>
                  <div className="p-6 border-2 border-dashed border-slate-200 rounded-xl text-center space-y-2">
                    <UploadCloud className="w-6 h-6 text-slate-400 mx-auto" />
                    <span className="block text-slate-500 font-semibold text-[11px]">Drop JPG/PNG/PDF here (Max 5MB)</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <strong className="text-slate-900 font-bold">University Student ID</strong>
                    <span className="px-2 py-0.5 rounded bg-lime-100 text-lime-800 text-[10px] font-bold">
                      Verified
                    </span>
                  </div>
                  <div className="p-6 border-2 border-dashed border-slate-200 rounded-xl text-center space-y-2">
                    <UploadCloud className="w-6 h-6 text-slate-400 mx-auto" />
                    <span className="block text-slate-500 font-semibold text-[11px]">Upload ID Card photo</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 8. PAYMENT INFO */}
          {activeSection === 'payment' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <span className="text-slate-400 block font-semibold">Mobile Financial Service</span>
                <strong className="text-slate-900 font-bold text-sm block">
                  bKash / Nagad: {profile.primaryPhone ? `${profile.primaryPhone.substring(0, 3)}****${profile.primaryPhone.substring(7)}` : '0171****89'}
                </strong>
                <p className="text-[11px] text-slate-400">Account numbers are masked and encrypted at rest for security.</p>
              </div>
            </div>
          )}

          {/* 9. EMERGENCY CONTACT */}
          {activeSection === 'emergency' && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block font-semibold">Father's Name</span>
                <strong className="text-slate-900 font-bold">{profile.guardianInfo?.fatherName || 'Md. Abdur Rahman'}</strong>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block font-semibold">Emergency Phone</span>
                <strong className="text-slate-900 font-bold">{profile.guardianInfo?.emergencyContact || '01711****33'}</strong>
              </div>
            </div>
          )}

          {/* 10. REVIEWS */}
          {activeSection === 'reviews' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-2xl font-black text-slate-900">{profile.rating || '5.0'}</span>
                  <div className="flex text-amber-400 text-sm mt-0.5">★★★★★</div>
                  <span className="text-slate-400 block font-medium mt-1">Based on {profile.reviewsCount || 48} guardian ratings</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="font-bold text-slate-900">Mr. Kabir (Dhanmondi)</strong>
                  <span className="text-slate-400">2 weeks ago</span>
                </div>
                <p className="text-slate-600">
                  "Outstanding teacher. Prepared my son very thoroughly for Class 10 Higher Math exams."
                </p>
              </div>
            </div>
          )}

          {/* 11. PRIVACY */}
          {activeSection === 'privacy' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <strong className="text-slate-900 font-bold block">Profile Visibility</strong>
                  <span className="text-slate-500">Public (Visible in Tutor Directory)</span>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-[11px]">
                  Active
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Missing Items Checklist Modal */}
      {showMissingModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-lg">Profile Checklist</h3>
              <button onClick={() => setShowMissingModal(false)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Complete these items to reach <strong>80%+ completion</strong> and become eligible to apply for live tuition jobs.
            </p>

            <div className="space-y-2 max-h-72 overflow-y-auto pt-1">
              {Object.entries(completion?.sections || {}).map(([key, sec]: [string, any]) => (
                <div key={key} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-slate-800 capitalize block">{key}</strong>
                    {sec.missing && sec.missing.length > 0 && (
                      <span className="text-[11px] text-amber-600 font-medium">
                        Missing: {sec.missing.join(', ')}
                      </span>
                    )}
                  </div>
                  <span className={`font-bold ${sec.completed ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {sec.score}/{sec.max} pts
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowMissingModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
            >
              Close Checklist
            </button>
          </div>
        </div>
      )}

      {/* Preview as Guardian Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#84CC16]" />
                <h3 className="font-black text-slate-900 text-lg">Guardian View Preview</h3>
              </div>
              <button onClick={() => setShowPreviewModal(false)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-lime-50 rounded-xl border border-lime-200 text-[11px] text-slate-700 font-semibold">
              🔒 This is exactly how parents and guardians see your profile. Your phone number, email, NID, and private documents are protected.
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-4">
                <img
                  src={profile.profilePhotoUrl || profile.avatar}
                  alt={profile.fullName}
                  className="w-16 h-16 rounded-2xl object-cover bg-slate-100"
                />
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{profile.fullName || profile.name}</h4>
                  <p className="text-slate-600 font-medium">{profile.university} • {profile.department}</p>
                  <span className="text-amber-500 font-bold mt-0.5 block">⭐ {profile.rating || '5.0'} Verified Tutor</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-slate-400 block font-semibold">Expected Salary</span>
                <strong className="text-slate-800 text-sm font-bold">{profile.expectedSalary || '৳5000 - ৳8000 BDT'}</strong>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-slate-400 block font-semibold">Preferred Areas</span>
                <strong className="text-slate-800 font-bold">{Array.isArray(profile.preferredAreas) ? profile.preferredAreas.join(', ') : 'Mirpur, Dhanmondi'}</strong>
              </div>
            </div>

            <button
              onClick={() => setShowPreviewModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
            >
              Done Previewing
            </button>
          </div>
        </div>
      )}

      {/* Add Education Modal */}
      {isAddEduOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <form onSubmit={handleAddEducation} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Add Education Entry</h3>
              <button type="button" onClick={() => setIsAddEduOpen(false)} className="p-1 rounded-full text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Level *</label>
                <select
                  value={newEdu.level}
                  onChange={(e) => setNewEdu({ ...newEdu, level: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                >
                  <option value="Bachelor">Bachelor / Honors</option>
                  <option value="HSC">HSC / A-Level</option>
                  <option value="SSC">SSC / O-Level</option>
                  <option value="Master">Master</option>
                  <option value="Diploma">Diploma</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Degree / Exam Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B.Sc in CSE or HSC"
                  value={newEdu.degreeName}
                  onChange={(e) => setNewEdu({ ...newEdu, degreeName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                >
                </input>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Institute / College / University *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BUET or Notre Dame College"
                  value={newEdu.institute}
                  onChange={(e) => setNewEdu({ ...newEdu, institute: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Passing Year</label>
                  <input
                    type="text"
                    placeholder="2024"
                    value={newEdu.passingYear}
                    onChange={(e) => setNewEdu({ ...newEdu, passingYear: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Result / CGPA</label>
                  <input
                    type="text"
                    placeholder="e.g. 3.85 / GPA 5.0"
                    value={newEdu.resultValue}
                    onChange={(e) => setNewEdu({ ...newEdu, resultValue: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddEduOpen(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-[#84CC16] hover:bg-[#74b816] text-white font-bold text-xs"
              >
                Save Degree
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Experience Modal */}
      {isAddExpOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <form onSubmit={handleAddExperience} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Add Tutoring Experience</h3>
              <button type="button" onClick={() => setIsAddExpOpen(false)} className="p-1 rounded-full text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Higher Math & Physics"
                  value={newExp.subject}
                  onChange={(e) => setNewExp({ ...newExp, subject: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Class / Curriculum *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Class 10 (SSC Bangla Medium)"
                  value={newExp.courseClass}
                  onChange={(e) => setNewExp({ ...newExp, courseClass: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Duration</label>
                <input
                  type="text"
                  placeholder="e.g. 1 Year (Jan 2025 - Dec 2025)"
                  value={newExp.duration}
                  onChange={(e) => setNewExp({ ...newExp, duration: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description & Achievements</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Boosted student test scores from B to A+ in board examinations."
                  value={newExp.description}
                  onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddExpOpen(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-[#84CC16] hover:bg-[#74b816] text-white font-bold text-xs"
              >
                Save Experience
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
