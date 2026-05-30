/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Trophy, Star, TrendingUp, Award, Sparkles, Flame, Crown, Check, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { AchievementDef } from '../types';

const ICON_MAP = {
  Sparkles,
  Trophy,
  Award,
  Flame,
  Crown
};

const COLOR_MAP = {
  emerald: {
    bg: 'bg-emerald-50 text-emerald-600',
    border: 'border-emerald-200/60',
    glow: 'bg-emerald-400/20',
    text: 'text-emerald-700',
    darkText: 'text-emerald-900',
    ring: 'ring-emerald-100',
    badge: 'from-emerald-400 via-teal-500 to-emerald-600',
    accent: 'emerald',
    badgeBorder: 'border-emerald-300'
  },
  amber: {
    bg: 'bg-amber-50 text-amber-600',
    border: 'border-amber-200/60',
    glow: 'bg-amber-400/20',
    text: 'text-amber-700',
    darkText: 'text-amber-900',
    ring: 'ring-amber-100',
    badge: 'from-amber-400 via-yellow-500 to-amber-600',
    accent: 'amber',
    badgeBorder: 'border-amber-300'
  },
  purple: {
    bg: 'bg-purple-50 text-purple-600',
    border: 'border-purple-200/60',
    glow: 'bg-purple-400/20',
    text: 'text-purple-700',
    darkText: 'text-purple-900',
    ring: 'ring-purple-100',
    badge: 'from-purple-400 via-indigo-500 to-purple-600',
    accent: 'indigo',
    badgeBorder: 'border-purple-300'
  },
  orange: {
    bg: 'bg-orange-50 text-orange-600',
    border: 'border-orange-200/60',
    glow: 'bg-orange-400/20',
    text: 'text-orange-700',
    darkText: 'text-orange-900',
    ring: 'ring-orange-100',
    badge: 'from-orange-400 via-amber-500 to-red-500',
    accent: 'orange',
    badgeBorder: 'border-orange-300'
  },
  rose: {
    bg: 'bg-rose-50 text-rose-600',
    border: 'border-rose-200/60',
    glow: 'bg-rose-400/20',
    text: 'text-rose-700',
    darkText: 'text-rose-900',
    ring: 'ring-rose-100',
    badge: 'from-rose-400 via-pink-500 to-rose-600',
    accent: 'rose',
    badgeBorder: 'border-rose-300'
  }
};

const TRANSLATIONS = {
  en: {
    milestoneCompleted: "Milestone Completed",
    achievementUnlocked: "Achievement Unlocked!",
    showing: "Showing",
    of: "of",
    awards: "awards",
    nextAward: "Next Award",
    collectBadges: "Collect Badges & Continue",
    analysisComplete: "Analysis Complete!",
    stellarProgress: "Stellar progress, speech scholar!",
    clarity: "Clarity",
    intonation: "Flow & Rhythm",
    aiFeedback: "AI Coach Feedback",
    xpEarned: "XP Earned",
    continueProgression: "Continue Progression"
  },
  id: {
    milestoneCompleted: "Pencapaian Terlampaui",
    achievementUnlocked: "Pencapaian Baru Terbuka!",
    showing: "Menampilkan",
    of: "dari",
    awards: "penghargaan",
    nextAward: "Lencana Berikutnya",
    collectBadges: "Ambil Lencana & Lanjutkan",
    analysisComplete: "Sesi Analisis Selesai!",
    stellarProgress: "Sangat baik! Pertahankan momentum Anda.",
    clarity: "Akurasi Kejelasan",
    intonation: "Aliran & Ritme",
    aiFeedback: "Evaluasi Pelatih AI",
    xpEarned: "XP Didapatkan",
    continueProgression: "Lanjutkan Pelatihan"
  }
};

const ACHIEVEMENT_INFO = {
  en: {
    "first_victory": { title: "First Victory", desc: "Successfully spoke your first vocal recording drills." },
    "level_up_five": { title: "Rising Practitioner", desc: "Reach speaker Level 5 milestone with high persistence." },
    "clarity_pro": { title: "Crystalline Tone", desc: "Gain greater than 90% in phoneme clarity metric." },
    "flow_expert": { title: "Melody Maestro", desc: "Gain greater than 90% inside rhythmic intonation cadence." },
    "marathon": { title: "Vocal Athlete", desc: "Log 10 complete exercises under your articulate path." }
  } as Record<string, { title: string; desc: string }>,
  id: {
    "first_victory": { title: "Kemenangan Pertama", desc: "Berhasil menyelesaikan evaluasi rekaman suara pertama Anda." },
    "level_up_five": { title: "Praktisi Berbakat", desc: "Selesaikan pelatihan hingga tingkat Level 5." },
    "clarity_pro": { title: "Artikulasi Murni", desc: "Raih tingkat kejelasan fonem di atas 90%." },
    "flow_expert": { title: "Ahli Intonasi", desc: "Raih nilai kelancaran ritme dan jeda di atas 90%." },
    "marathon": { title: "Atlet Vokal", desc: "Selesaikan total 10 sesi latihan wicara harian." }
  } as Record<string, { title: string; desc: string }>
};

interface ResultOverlayProps {
  result: {
    score: number;
    clarityScore: number;
    intonationScore: number;
    feedback: string;
    xpEarned: number;
  };
  onClose: () => void;
  newlyUnlockedAchievements?: AchievementDef[];
  currentLang?: 'en' | 'id';
}

export default function ResultOverlay({ result, onClose, newlyUnlockedAchievements = [], currentLang = 'en' }: ResultOverlayProps) {
  const [currentAchievementIndex, setCurrentAchievementIndex] = useState(0);
  const [showAchievements, setShowAchievements] = useState(newlyUnlockedAchievements.length > 0);

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const hasMultiple = newlyUnlockedAchievements.length > 1;
  const currentAchievement = newlyUnlockedAchievements[currentAchievementIndex];

  // Helper generator for explosion particles
  const getConfettiParticles = () => {
    return Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50,
      size: Math.random() * 8 + 4,
      color: ['#10B981', '#F59E0B', '#8B5CF6', '#F97316', '#EF4444', '#3B82F6', '#EC4899'][i % 7],
      rotation: Math.random() * 360,
      delay: Math.random() * 0.4
    }));
  };

  const [particles] = useState(getConfettiParticles);

  useEffect(() => {
    if (showAchievements && currentAchievement) {
      // Left side cannon
      confetti({
        particleCount: 55,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.8 }
      });
      // Right side cannon
      confetti({
        particleCount: 55,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.8 }
      });
      
      // Center direct burst with a slight delay
      const timer = setTimeout(() => {
        confetti({
          particleCount: 40,
          spread: 80,
          origin: { x: 0.5, y: 0.55 }
        });
      }, 250);

      return () => clearTimeout(timer);
    }
  }, [currentAchievement, showAchievements]);

  const handleNextAchievement = () => {
    if (currentAchievementIndex + 1 < newlyUnlockedAchievements.length) {
      setCurrentAchievementIndex(prev => prev + 1);
    } else {
      setShowAchievements(false);
    }
  };

  // Get translated achievement info
  const getAchievementDetails = (ach: AchievementDef) => {
    const fallback = { title: ach.title, desc: ach.description };
    const localeDict = ACHIEVEMENT_INFO[currentLang];
    if (!localeDict) return fallback;
    return localeDict[ach.id] || fallback;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
    >
      <AnimatePresence mode="wait">
        {showAchievements && currentAchievement ? (
          <motion.div
            key={`ach-${currentAchievement.id}`}
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: -20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl overflow-hidden relative border border-gray-100"
          >
            {/* Holographic Glowing Orbs */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500" />
            
            {/* Confetti Explosion Layer */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2.5rem]">
              {particles.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 0, rotate: 0 }}
                  animate={{ 
                    x: p.x * 5, 
                    y: p.y * 5, 
                    opacity: [1, 1, 0], 
                    scale: [0, 1.3, 0.4],
                    rotate: p.rotation + 360 
                  }}
                  transition={{ 
                    duration: 2.2, 
                    ease: "easeOut",
                    delay: p.delay
                  }}
                  style={{
                    position: 'absolute',
                    top: '45%',
                    left: '50%',
                    width: p.size,
                    height: p.size,
                    backgroundColor: p.color,
                    borderRadius: p.id % 2 === 0 ? '50%' : '15% ',
                  }}
                />
              ))}
            </div>

            <div className="text-center space-y-6 relative z-10 py-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-500 bg-indigo-50 px-3.5 py-1.5 rounded-full inline-block mb-1">
                  {t.milestoneCompleted}
                </span>
                <h3 className="text-3xl font-black text-gray-900 tracking-tight leading-none">
                  {t.achievementUnlocked}
                </h3>
              </div>

              {/* Pulsating Badge Frame */}
              <div className="relative flex justify-center items-center py-6">
                <motion.div
                  animate={{ 
                    scale: [1, 1.15, 1],
                    opacity: [0.15, 0.4, 0.15]
                  }}
                  transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
                  className={`absolute w-36 h-36 rounded-full blur-xl ${COLOR_MAP[currentAchievement.color].glow}`}
                />
                
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                  className={`absolute w-32 h-32 rounded-full border-2 border-dashed opacity-30 ${COLOR_MAP[currentAchievement.color].text}`}
                />

                <motion.div
                  initial={{ scale: 0.5, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 15, delay: 0.1 }}
                  className={`relative w-24 h-24 rounded-3xl bg-gradient-to-br ${COLOR_MAP[currentAchievement.color].badge} flex items-center justify-center text-white shadow-xl ring-4 ring-white ${COLOR_MAP[currentAchievement.color].badgeBorder}`}
                >
                  {(() => {
                    const SelectedIcon = ICON_MAP[currentAchievement.iconName] || Award;
                    return <SelectedIcon className="w-11 h-11 drop-shadow-md animate-pulse" />;
                  })()}
                </motion.div>
              </div>

              {/* Badge Details */}
              <div className="space-y-2">
                <h4 className={`text-2xl font-black tracking-tight ${COLOR_MAP[currentAchievement.color].text}`}>
                  {getAchievementDetails(currentAchievement).title}
                </h4>
                <p className="text-gray-500 font-medium px-4 text-sm leading-relaxed">
                  {getAchievementDetails(currentAchievement).desc}
                </p>
              </div>

              {/* Steps */}
              <div className="pt-2">
                {hasMultiple && (
                  <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider mb-4">
                    {t.showing} {currentAchievementIndex + 1} {t.of} {newlyUnlockedAchievements.length} {t.awards}
                  </p>
                )}
                
                <button
                  onClick={handleNextAchievement}
                  className="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl active:scale-98 cursor-pointer relative overflow-hidden group"
                >
                  <span className="relative z-10">
                    {currentAchievementIndex + 1 < newlyUnlockedAchievements.length ? t.nextAward : t.collectBadges}
                  </span>
                  <ChevronRight className="w-5 h-5 relative z-10 transition-transform group-hover:translate-x-1" />
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Normal evaluation screen */
          <motion.div
            key="evaluation-results"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl overflow-hidden relative border border-gray-100"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-indigo-500" />
            
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-indigo-50 text-indigo-600 mb-2">
                <Trophy className="w-10 h-10" />
              </div>

              <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">{t.analysisComplete}</h2>
                <p className="text-gray-500 font-bold text-xs uppercase tracking-wider mt-1">{t.stellarProgress}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <StatCard label={t.clarity} value={result.clarityScore} icon={<Star className="w-4 h-4 text-indigo-500" />} color="indigo" />
                <StatCard label={t.intonation} value={result.intonationScore} icon={<TrendingUp className="w-4 h-4 text-blue-500" />} color="blue" />
              </div>

              <div className="bg-gray-50 rounded-[1.75rem] p-6 text-left border border-gray-100">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-500" /> {t.aiFeedback}
                </h4>
                <p className="text-gray-700 text-sm leading-relaxed italic">"{result.feedback}"</p>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 bg-yellow-400/10 text-yellow-750 px-5 py-2.5 rounded-full font-bold text-sm border border-yellow-400/25">
                  <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  <span className="font-extrabold text-yellow-800">+{result.xpEarned} {t.xpEarned}</span>
                </div>

                <button
                  onClick={onClose}
                  className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg text-sm"
                >
                  {t.continueProgression}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StatCard({ label, value, icon, color }: any) {
  const colors: any = {
    indigo: 'bg-indigo-50/70 border border-indigo-100 text-indigo-600',
    blue: 'bg-blue-50/70 border border-blue-100 text-blue-600',
  };

  return (
    <div className={`${colors[color]} p-4 rounded-[1.75rem] flex flex-col items-center justify-center gap-1.5`}>
      <div className="flex items-center gap-1.5 opacity-80">
        {icon}
        <span className="text-[10px] font-black uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-3xl font-black">{Math.round(value)}%</span>
    </div>
  );
}
