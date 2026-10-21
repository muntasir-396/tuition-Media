import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  User,
  GraduationCap,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  MapPin,
  BookOpen,
  Briefcase,
  Award,
} from 'lucide-react';

const TOP_UNIVERSITIES = ['BUET', 'Dhaka University', 'DMC', 'NSU', 'BRAC University', 'CUET', 'RUET', 'IBA'];

export const AuthView: React.FC = () => {
  const { setUserRole, setIsLoggedIn, setActiveTab, currentUser, setCurrentUser, setSelectedTutor, refreshMyTutorProfile } = useApp();

  const [activeRole, setActiveRole] = useState<UserRole>('tutor');
  const [isSignUpMode, setIsSignUpMode] = useState<boolean>(false);
  
  const [phoneOrEmail, setPhoneOrEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  
  // Tutor sign-up specific fields
  const [fullName, setFullName] = useState<string>('');
  const [university, setUniversity] = useState<string>('BUET');
  const [department, setDepartment] = useState<string>('Computer Science & Engineering');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [district, setDistrict] = useState<string>('Dhaka');
  const [area, setArea] = useState<string>('Mirpur');
  const [experience, setExperience] = useState<string>('2');
  
  const [submittedMessage, setSubmittedMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const endpoint = isSignUpMode ? '/api/auth/register' : '/api/auth/login';
    const payload = isSignUpMode 
      ? { 
          role: activeRole, 
          fullName, 
          phoneOrEmail, 
          password, 
          university: activeRole === 'tutor' ? university : undefined,
          department: activeRole === 'tutor' ? department : undefined,
          gender: activeRole === 'tutor' ? gender : undefined,
          district: activeRole === 'tutor' ? district : undefined,
          area: activeRole === 'tutor' ? area : undefined,
          tutoringExperience: activeRole === 'tutor' ? parseInt(experience) || 1 : undefined,
        }
      : { role: activeRole, phoneOrEmail, password };
      
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        setUserRole(activeRole);
        setIsLoggedIn(true);
        
        if (data.user) {
          setCurrentUser(data.user);
        } else {
          const meRes = await fetch('/api/auth/me');
          const meData = await meRes.json();
          if (meData?.user) setCurrentUser(meData.user);
        }

        if (data.tutor) {
          setSelectedTutor(data.tutor);
        }

        setSubmittedMessage(
          isSignUpMode
            ? `Account successfully created as ${activeRole.toUpperCase()}!`
            : `Signed in successfully as ${activeRole.toUpperCase()}!`
        );

        if (activeRole === 'tutor') {
          await refreshMyTutorProfile();
        }
    
        setTimeout(() => {
          setActiveTab(activeRole === 'tutor' ? 'profile' : 'guardian-dashboard');
        }, 800);
      } else {
        alert(data.error || 'Authentication failed');
      }
    } catch (e) {
      console.error("Auth error", e);
      alert('Network error during authentication');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-6 sm:py-10 space-y-6 pb-20">
      {/* Container Card */}
      <div className="bg-white rounded-3xl border border-slate-300 p-6 sm:p-8 shadow-xl space-y-6">
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#84CC16] text-white flex items-center justify-center mx-auto shadow-sm">
            <GraduationCap className="w-7 h-7 stroke-[2.2]" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            {isSignUpMode ? 'Create Tutor / Parent Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs font-semibold text-slate-500">
            {isSignUpMode
              ? 'Join Tuition Terminal - Bangladesh’s premier tutor matching network'
              : 'Sign in to access your tuition applications, jobs & profile'}
          </p>
        </div>

        {/* Role Switcher Tabs */}
        <div className="p-1 bg-slate-100 rounded-2xl grid grid-cols-2 text-xs font-extrabold text-slate-700">
          <button
            type="button"
            onClick={() => setActiveRole('parent')}
            className={`py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeRole === 'parent'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4 text-blue-500" />
            <span>Guardian / Parent</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveRole('tutor')}
            className={`py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeRole === 'tutor'
                ? 'bg-[#84CC16] text-slate-950 shadow-sm font-black'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Tutor (Teacher)</span>
          </button>
        </div>

        {/* Feature highlight badge */}
        {isSignUpMode && activeRole === 'tutor' && (
          <div className="p-3 bg-lime-50/70 border border-lime-200 rounded-2xl flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-xs text-lime-700">
              <Sparkles className="w-5 h-5 text-[#84CC16]" />
            </div>
            <div className="text-[11px] text-slate-700">
              <span className="font-extrabold text-slate-900 block">Tuition Terminal Tutor Membership</span>
              <span>Get instant unique Tutor Code, verified badge, and apply for verified tuitions across Bangladesh.</span>
            </div>
          </div>
        )}

        {submittedMessage ? (
          <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2 text-emerald-800">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <p className="font-bold text-base">{submittedMessage}</p>
            <p className="text-xs text-emerald-600">Redirecting to your profile dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Conditional fields based on SignUp & Role */}
            {isSignUpMode && (
              <div className="space-y-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-[#84CC16] focus:bg-white transition-colors"
                      placeholder={activeRole === 'tutor' ? 'e.g. Muntasir Mamun' : 'e.g. Abdur Rahman'}
                    />
                  </div>
                </div>

                {/* Additional Tutor Fields */}
                {activeRole === 'tutor' && (
                  <>
                    {/* Gender & Experience */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                          Gender
                        </label>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value as 'Male' | 'Female')}
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-[#84CC16] focus:bg-white transition-colors"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                          Tutoring Experience
                        </label>
                        <select
                          value={experience}
                          onChange={(e) => setExperience(e.target.value)}
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-[#84CC16] focus:bg-white transition-colors"
                        >
                          <option value="0">Beginner / Fresher (&lt; 1 yr)</option>
                          <option value="1">1 Year</option>
                          <option value="2">2 Years</option>
                          <option value="3">3 Years</option>
                          <option value="5">5+ Years</option>
                        </select>
                      </div>
                    </div>

                    {/* University with suggestion chips */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                          University / Institution <span className="text-red-500">*</span>
                        </label>
                      </div>
                      <div className="relative">
                        <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={university}
                          onChange={(e) => setUniversity(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-[#84CC16] focus:bg-white transition-colors"
                          placeholder="e.g. BUET, Dhaka University, NSU"
                        />
                      </div>
                      {/* Suggestion Chips */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {TOP_UNIVERSITIES.map((uni) => (
                          <button
                            key={uni}
                            type="button"
                            onClick={() => setUniversity(uni)}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                              university === uni
                                ? 'bg-slate-900 text-white'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            {uni}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Department */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                        Department / Major
                      </label>
                      <div className="relative">
                        <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-[#84CC16] focus:bg-white transition-colors"
                          placeholder="e.g. Computer Science & Engineering, EEE, Physics"
                        />
                      </div>
                    </div>

                    {/* District & Preferred Area */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                          District / City
                        </label>
                        <select
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-[#84CC16] focus:bg-white transition-colors"
                        >
                          <option value="Dhaka">Dhaka</option>
                          <option value="Chittagong">Chittagong</option>
                          <option value="Sylhet">Sylhet</option>
                          <option value="Rajshahi">Rajshahi</option>
                          <option value="Khulna">Khulna</option>
                          <option value="Gazipur">Gazipur</option>
                          <option value="Cumilla">Cumilla</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                          Preferred Tutoring Area
                        </label>
                        <div className="relative">
                          <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={area}
                            onChange={(e) => setArea(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-[#84CC16] focus:bg-white transition-colors"
                            placeholder="e.g. Mirpur, Dhanmondi, Uttara"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Contact or Email Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Phone Number or Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={phoneOrEmail}
                  onChange={(e) => setPhoneOrEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-[#84CC16] focus:bg-white transition-colors"
                  placeholder={activeRole === 'tutor' ? '01712... or name@example.com' : '01712...'}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block flex items-center justify-between">
                <span>Password <span className="text-red-500">*</span></span>
                {!isSignUpMode && (
                  <a href="#" className="text-blue-500 hover:underline capitalize text-[10px]">Forgot?</a>
                )}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-[#84CC16] focus:bg-white transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <span>
                {isLoading ? 'Processing...' : isSignUpMode ? (activeRole === 'tutor' ? 'Register as Tutor (Free)' : 'Create Parent Account') : 'Sign In to Account'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

      {/* Switch Mode */}
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-600">
          {isSignUpMode ? 'Already have an account?' : "Don't have a tutor or guardian account?"}
        </p>
        <button
          onClick={() => {
            setIsSignUpMode(!isSignUpMode);
            setSubmittedMessage('');
          }}
          className="mt-1 text-sm font-bold text-[#84CC16] hover:text-[#65A30D] transition-colors cursor-pointer inline-block border-b-2 border-transparent hover:border-[#84CC16]"
        >
          {isSignUpMode ? 'Sign in instead' : 'Create a free account now'}
        </button>
      </div>
    </div>
  );
};
