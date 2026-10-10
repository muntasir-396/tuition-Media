import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const RequestTutorView: React.FC = () => {
  const { setActiveTab } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successId, setSuccessId] = useState('');
  const [language, setLanguage] = useState<'EN' | 'BN'>('EN');

  const [formData, setFormData] = useState({
    guardianName: '',
    guardianEmail: '',
    location: '',
    course: '',
    subjects: '',
    tutorGender: 'Any',
    daysPerWeek: '3 days',
    time: '',
    method: 'Home Tutoring',
    salary: '',
    studentsCount: '1',
    notes: '',
    guardianPhone: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.guardianPhone.trim()) newErrors.guardianPhone = 'Contact number is compulsory';
    
    // basic bd phone validation
    const phoneRegex = /^(?:\+88|88)?(01[3-9]\d{8})$/;
    if (formData.guardianPhone && !phoneRegex.test(formData.guardianPhone.replace(/\s+/g, ''))) {
      newErrors.guardianPhone = 'Invalid Bangladesh phone number (e.g. 01712345678)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    
    
    try {
      const response = await fetch('/api/public/tutor-requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccessId(data.request?.jobCode || data.request?.id || data.requirementId || 'TR-SUCCESS');
        setIsSuccess(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert(data.error || 'Failed to submit requirement. Please try again.');
      }
    } catch (error: any) {
      console.error('Error submitting form:', error);
      alert('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }


  };

  const handleReset = () => {
    setIsSuccess(false);
    setSuccessId('');
    setFormData({
      guardianName: '',
      location: '',
      course: '',
      subjects: '',
      tutorGender: 'Any',
      daysPerWeek: '3 days',
      time: '',
      method: 'Home Tutoring',
      salary: '',
      studentsCount: '1',
      notes: '',
      guardianPhone: ''
    });
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-[#84CC16]/20 text-[#84CC16] rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Requirement Submitted Successfully</h2>
          <p className="text-slate-600">
            Thank you. Your tutor requirement has been received. Our team will review your request and contact you shortly.
          </p>
          
          <div className="bg-slate-50 p-6 rounded-xl text-left border border-slate-100 max-w-md mx-auto space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Requirement ID:</span>
              <span className="font-bold text-slate-900">{successId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Contact Number:</span>
              <span className="font-bold text-slate-900">{formData.guardianPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Submitted Date:</span>
              <span className="font-bold text-slate-900">{new Date().toLocaleDateString('en-GB')}</span>
            </div>
          </div>
          
          <div className="pt-6">
            <button 
              onClick={handleReset}
              className="px-6 py-3 bg-[#84CC16] text-white font-bold rounded-xl hover:bg-[#65A30D] transition-colors"
            >
              Submit Another Requirement
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 mb-16">
      
      {/* Language Switcher */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex items-center bg-white border border-slate-200 rounded-full p-1 shadow-sm">
          <button 
            onClick={() => setLanguage('BN')}
            className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${language === 'BN' ? 'bg-[#84CC16] text-white' : 'text-slate-500 hover:text-slate-700'}`}
          >
            BN
          </button>
          <button 
            onClick={() => setLanguage('EN')}
            className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${language === 'EN' ? 'bg-[#84CC16] text-white' : 'text-slate-500 hover:text-slate-700'}`}
          >
            EN
          </button>
        </div>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
          Fill Up Your <span className="text-[#84CC16]">Tutor</span> Requirements
        </h1>
        <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto leading-relaxed">
          Hire the best qualified & interactive tutors, who are committed to make your children's learning fun, comprehensive and easier.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          
          
          {/* Name */}
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 block">Your Name</label>
            <input 
              type="text" 
              name="guardianName"
              placeholder="Full Name" 
              value={formData.guardianName}
              onChange={handleChange}
              className={`w-full p-3 rounded-xl border ${errors.guardianName ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#84CC16]'} text-sm font-medium focus:outline-hidden transition-colors bg-slate-50/50 focus:bg-white`} 
            />
            {errors.guardianName && <p className="text-red-500 text-xs mt-1 font-medium">{errors.guardianName}</p>}
          </div>
          
          {/* Contact Number (Compulsory) */}

          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Contact Number <span className="text-red-500">*</span></span>
              <span className="text-[10px] text-red-500 font-semibold">(Compulsory)</span>
            </label>
            <input 
              type="text" 
              name="guardianPhone"
              placeholder="01XXXXXXXXX" 
              value={formData.guardianPhone}
              onChange={handleChange}
              className={`w-full p-3 rounded-xl border ${errors.guardianPhone ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#84CC16]'} text-sm font-medium focus:outline-hidden transition-colors bg-slate-50/50 focus:bg-white`} 
            />
            {errors.guardianPhone && <p className="text-red-500 text-xs mt-1 font-medium">{errors.guardianPhone}</p>}
          </div>

          {/* Location */}
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 block">Your Location</label>
            <input 
              type="text" 
              name="location"
              placeholder="House/Road/Area, City" 
              value={formData.location}
              onChange={handleChange}
              className={`w-full p-3 rounded-xl border ${errors.location ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#84CC16]'} text-sm font-medium focus:outline-hidden transition-colors bg-slate-50/50 focus:bg-white`} 
            />
            {errors.location && <p className="text-red-500 text-xs mt-1 font-medium">{errors.location}</p>}
          </div>

          {/* Class/Course */}
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 block">Class / Course</label>
            <input 
              type="text" 
              name="course"
              placeholder="Example: Class 9 / SSC / HSC / O Level" 
              value={formData.course}
              onChange={handleChange}
              className={`w-full p-3 rounded-xl border ${errors.course ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#84CC16]'} text-sm font-medium focus:outline-hidden transition-colors bg-slate-50/50 focus:bg-white`} 
            />
            {errors.course && <p className="text-red-500 text-xs mt-1 font-medium">{errors.course}</p>}
          </div>

          {/* Subject */}
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 block">Subject</label>
            <input 
              type="text" 
              name="subjects"
              placeholder="Physics, Chemistry, Higher Math" 
              value={formData.subjects}
              onChange={handleChange}
              className={`w-full p-3 rounded-xl border ${errors.subjects ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#84CC16]'} text-sm font-medium focus:outline-hidden transition-colors bg-slate-50/50 focus:bg-white`} 
            />
            {errors.subjects && <p className="text-red-500 text-xs mt-1 font-medium">{errors.subjects}</p>}
          </div>

          {/* Gender & Days */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">Preferable Tutor Gender</label>
              <select 
                name="tutorGender"
                value={formData.tutorGender}
                onChange={handleChange}
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-[#84CC16] text-sm font-medium focus:outline-hidden transition-colors bg-slate-50/50 focus:bg-white appearance-none"
              >
                <option value="Any">Any</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">Days Per Week</label>
              <select 
                name="daysPerWeek"
                value={formData.daysPerWeek}
                onChange={handleChange}
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-[#84CC16] text-sm font-medium focus:outline-hidden transition-colors bg-slate-50/50 focus:bg-white appearance-none"
              >
                <option value="1 day">1 day</option>
                <option value="2 days">2 days</option>
                <option value="3 days">3 days</option>
                <option value="4 days">4 days</option>
                <option value="5 days">5 days</option>
                <option value="6 days">6 days</option>
                <option value="7 days">7 days</option>
              </select>
            </div>
          </div>

          {/* Salary & Students */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">Expected Monthly Salary</label>
              <input 
                type="text" 
                name="salary"
                placeholder="Example: 8000 BDT" 
                value={formData.salary}
                onChange={handleChange}
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-[#84CC16] text-sm font-medium focus:outline-hidden transition-colors bg-slate-50/50 focus:bg-white" 
              />
            </div>
            
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">Number of Students</label>
              <input 
                type="number" 
                name="studentsCount"
                min="1"
                max="10"
                value={formData.studentsCount}
                onChange={handleChange}
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-[#84CC16] text-sm font-medium focus:outline-hidden transition-colors bg-slate-50/50 focus:bg-white" 
              />
            </div>
          </div>

          {/* Additional Requirements */}
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 block">Additional Requirements</label>
            <textarea 
              name="notes"
              rows={3}
              placeholder="Tell us anything else you want in your tutor (university preference, background, start date)..." 
              value={formData.notes}
              onChange={handleChange}
              className="w-full p-3 rounded-xl border border-slate-200 focus:border-[#84CC16] text-sm font-medium focus:outline-hidden transition-colors bg-slate-50/50 focus:bg-white resize-y" 
            />
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#84CC16] text-white font-bold rounded-xl hover:bg-[#65A30D] transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Requirement'
              )}
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
};
