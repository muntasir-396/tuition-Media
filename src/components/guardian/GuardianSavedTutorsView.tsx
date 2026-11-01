import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useBookmarks } from '../../hooks/useBookmarks';
import {
  Bookmark,
  GraduationCap,
  Star,
  MapPin,
  Trash2,
  Users2,
  Scale,
  Sparkles,
  CheckCircle2,
  X
} from 'lucide-react';

export const GuardianSavedTutorsView: React.FC = () => {
  const { setActiveTab, setSelectedTutor } = useApp();
  const { toggleBookmark } = useBookmarks();
  const [savedTutors, setSavedTutors] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [comparisonTutorIds, setComparisonTutorIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);

  const fetchSavedTutors = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bookmarks?type=tutor');
      if (res.ok) {
        const data = await res.json();
        setSavedTutors(data.items || []);
      }
    } catch (e) {
      console.error('Failed to load saved tutors', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedTutors();
  }, []);

  const handleRemove = async (tutor: any) => {
    const id = tutor.id || tutor.tutorCode || tutor.userId;
    await toggleBookmark('tutor', id);
    setSavedTutors(prev => prev.filter(t => (t.id || t.tutorCode || t.userId) !== id));
    setComparisonTutorIds(prev => prev.filter(cid => cid !== id));
  };

  const toggleCompare = (tutorId: string) => {
    if (comparisonTutorIds.includes(tutorId)) {
      setComparisonTutorIds(prev => prev.filter(id => id !== tutorId));
    } else {
      if (comparisonTutorIds.length >= 3) {
        alert('You can compare a maximum of 3 tutors simultaneously.');
        return;
      }
      setComparisonTutorIds(prev => [...prev, tutorId]);
    }
  };

  const tutorsToCompare = savedTutors.filter(t => 
    comparisonTutorIds.includes(t.id || t.tutorCode || t.userId)
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Bookmark className="w-6 h-6 text-[#84CC16] fill-[#84CC16]" />
            <span>Saved Tutors</span>
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Shortlist and compare prospective tutors for your children. All records stored in your account.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {comparisonTutorIds.length >= 2 && (
            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer animate-pulse"
            >
              <Scale className="w-4 h-4" />
              <span>Compare Selected ({comparisonTutorIds.length}/3)</span>
            </button>
          )}

          <span className="text-xs font-black px-3.5 py-1.5 rounded-full bg-lime-50 text-[#65A30D] border border-lime-200">
            {savedTutors.length} Saved Tutor{savedTutors.length === 1 ? '' : 's'}
          </span>
          <button
            onClick={() => setActiveTab('tutors')}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Find Tutors
          </button>
        </div>
      </div>

      {/* Saved Tutors Grid */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 font-bold text-xs">
          Loading saved tutors...
        </div>
      ) : savedTutors.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Users2 className="w-6 h-6 stroke-[1.5]" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 text-base">No saved tutors yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Browse verified tutors from BUET, DU, Medical, and save profiles you'd like to shortlist or compare.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('tutors')}
            className="px-6 py-2.5 rounded-xl bg-[#84CC16] hover:bg-[#74b816] text-white font-bold text-xs shadow-xs cursor-pointer transition-colors"
          >
            Explore Tutor Directory
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {savedTutors.map((tutor) => {
            const tutorId = tutor.id || tutor.tutorCode || tutor.userId;
            const isSelectedForCompare = comparisonTutorIds.includes(tutorId);

            return (
              <div
                key={tutorId}
                className={`bg-white rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between space-y-4 ${
                  isSelectedForCompare ? 'border-purple-400 ring-2 ring-purple-100' : 'border-slate-200 hover:border-[#84CC16]'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={tutor.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(tutor.name || 'Tutor')}`}
                      alt={tutor.name}
                      className="w-14 h-14 rounded-2xl object-cover bg-slate-50 border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-bold text-slate-900 text-base truncate">{tutor.name}</h3>
                        {tutor.verified && (
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-lime-100 text-lime-800 border border-lime-200">
                            VERIFIED
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 font-medium truncate flex items-center gap-1 mt-0.5">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{tutor.university}</span>
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mt-1">
                        <span className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{tutor.rating || '4.9'}</span>
                        </span>
                        <span>•</span>
                        <span>{tutor.experienceYears || 2}+ yrs exp</span>
                      </div>
                    </div>
                  </div>

                  {tutor.shortBio && (
                    <p className="text-xs text-slate-600 line-clamp-2 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      "{tutor.shortBio}"
                    </p>
                  )}

                  {/* Highlights */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {Array.isArray(tutor.preferredAreas) ? tutor.preferredAreas.slice(0, 3).join(', ') : 'Dhaka'}
                      </span>
                    </div>
                    <div className="text-[11px] font-bold text-[#65A30D]">
                      Expected Salary: {tutor.expectedSalary || 'Negotiable'}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => toggleCompare(tutorId)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isSelectedForCompare
                          ? 'bg-purple-50 border-purple-300 text-purple-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>{isSelectedForCompare ? 'Selected' : 'Compare'}</span>
                    </button>

                    <button
                      onClick={() => handleRemove(tutor)}
                      className="p-1.5 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedTutor(tutor);
                      setActiveTab('tutor-profile');
                    }}
                    className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    View Public Profile
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Comparison Modal */}
      {isCompareModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Scale className="w-6 h-6 text-purple-600" />
                <h3 className="font-black text-slate-900 text-xl">Side-by-Side Tutor Comparison</h3>
              </div>
              <button
                onClick={() => setIsCompareModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-${tutorsToCompare.length} gap-4`}>
              {tutorsToCompare.map((t) => (
                <div key={t.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
                  <div className="text-center space-y-2">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-16 h-16 rounded-2xl mx-auto object-cover bg-white border border-slate-200"
                    />
                    <h4 className="font-bold text-slate-900 text-sm">{t.name}</h4>
                    <p className="text-xs text-slate-500">{t.university} • {t.department}</p>
                    <span className="text-xs font-black text-[#65A30D] block">{t.expectedSalary}</span>
                  </div>

                  <div className="space-y-2 text-xs border-t border-slate-200/60 pt-3">
                    <div>
                      <span className="text-slate-400 block font-semibold">Rating</span>
                      <strong className="text-slate-800">⭐ {t.rating || '4.9'} ({t.reviewsCount || 0} reviews)</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">Experience</span>
                      <strong className="text-slate-800">{t.experienceYears || 2} Years</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">Mediums</span>
                      <strong className="text-slate-800">{Array.isArray(t.mediums) ? t.mediums.join(', ') : 'Bangla, English'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">Preferred Areas</span>
                      <strong className="text-slate-800">{Array.isArray(t.preferredAreas) ? t.preferredAreas.slice(0, 3).join(', ') : 'Dhaka'}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
