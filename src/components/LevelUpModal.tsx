/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Sparkles, Trophy, ChevronRight, Star, ArrowUpRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LevelUpModalProps {
  oldLevel: number;
  newLevel: number;
  rank: string;
  currentLang: 'en' | 'id';
  onClose: () => void;
}

const TRANSLATIONS = {
  en: {
    congrats: "CONGRATULATIONS!",
    levelUp: "Level Up!",
    reachedLevel: "You have advanced your vocal proficiency standing!",
    levelLabel: "Level",
    rankPromoted: "Vocal Standing:",
    nextMilestone: "Next Milestone Goal",
    reachLvl: "Reach Level",
    toUnlock: "to achieve",
    closeBtn: "Awesome, back to training!"
  },
  id: {
    congrats: "SELAMAT ATAS PRESTASI ANDA!",
    levelUp: "Tingkat Baru!",
    reachedLevel: "Tingkat kecakapan vokal Anda telah berhasil meningkat!",
    levelLabel: "Tingkat",
    rankPromoted: "Pangkat Kompetensi:",
    nextMilestone: "Milestone Berikutnya",
    reachLvl: "Capai Tingkat",
    toUnlock: "untuk meraih",
    closeBtn: "Luar biasa, kembali berlatih!"
  }
};

export default function LevelUpModal({ oldLevel, newLevel, rank, currentLang, onClose }: LevelUpModalProps) {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  // Trigger confetti burst on load
  useEffect(() => {
    // Center big burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { x: 0.5, y: 0.4 }
    });

    // Staggered sides
    const leftCannon = setTimeout(() => {
      confetti({
        particleCount: 40,
        angle: 60,
        spread: 55,
        origin: { x: 0.1, y: 0.6 }
      });
    }, 150);

    const rightCannon = setTimeout(() => {
      confetti({
        particleCount: 40,
        angle: 120,
        spread: 55,
        origin: { x: 0.9, y: 0.6 }
      });
    }, 300);

    return () => {
      clearTimeout(leftCannon);
      clearTimeout(rightCannon);
    };
  }, []);

  // Compute next milestone info
  const getNextMilestone = () => {
    if (newLevel < 2) {
      return { level: 2, rankName: currentLang === 'id' ? 'Novis' : 'Novice' };
    } else if (newLevel < 5) {
      return { level: 5, rankName: currentLang === 'id' ? 'Praktisi' : 'Practitioner' };
    } else if (newLevel < 10) {
      return { level: 10, rankName: currentLang === 'id' ? 'Orator Ulung' : 'Master Orator' };
    } else if (newLevel < 15) {
      return { level: 15, rankName: currentLang === 'id' ? 'Legenda Artikulasi' : 'Articulate Legend' };
    }
    return null;
  };

  const nextMilestone = getNextMilestone();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xl"
    >
      <motion.div
        initial={{ scale: 0.85, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: -20, opacity: 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="bg-white rounded-[3rem] p-8 max-w-sm w-full shadow-2xl relative border border-white overflow-hidden text-center flex flex-col justify-center items-center"
      >
        {/* Holographic header strip */}
        <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r from-yellow-400 via-amber-500 to-indigo-600" />

        {/* Ambient Glows */}
        <div className="absolute top-[-20%] right-[-20%] w-48 h-48 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Floating elements inside modal */}
        <div className="relative py-2">
          {/* Badge indicator */}
          <span className="text-[10px] font-black tracking-[0.25em] text-amber-600 bg-amber-50 px-4 py-2 rounded-full inline-block mb-3 border border-amber-200/30">
            {t.congrats}
          </span>

          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-none mb-1">
            {t.levelUp}
          </h2>
          <p className="text-xs text-slate-500 font-semibold max-w-[280px] leading-relaxed mx-auto">
            {t.reachedLevel}
          </p>
        </div>

        {/* Animated Level numbers */}
        <div className="flex items-center justify-center gap-6 my-8 py-3 relative">
          <div className="relative">
            <div className="absolute inset-0 bg-slate-100 rounded-2xl blur-lg opacity-40" />
            <div className="relative w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.levelLabel}</span>
              <span className="text-2xl font-bold text-slate-500 leading-none mt-0.5">{oldLevel}</span>
            </div>
          </div>

          <motion.div 
            animate={{ x: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm"
          >
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
          </motion.div>

          <div className="relative">
            <div className="absolute inset-x-0 -bottom-1 h-3/4 bg-yellow-400/25 rounded-2xl blur-xl" />
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="relative w-18 h-18 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-white flex flex-col items-center justify-center shadow-lg shadow-amber-400/20 ring-4 ring-yellow-100"
            >
              <span className="text-[9px] font-black uppercase tracking-wider text-white/90">{t.levelLabel}</span>
              <span className="text-3xl font-black leading-none mt-0.5">{newLevel}</span>
              <span className="absolute -top-2.5 -right-2.5 bg-indigo-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow border border-white inline-flex items-center gap-0.5">
                <Star className="w-2.5 h-2.5 fill-white text-white" /> UP
              </span>
            </motion.div>
          </div>
        </div>

        {/* Current Standing Label */}
        <div className="w-full bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6 flex flex-col items-center">
          <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase mb-1">
            {t.rankPromoted}
          </span>
          <div className="flex items-center gap-2.5">
            {newLevel >= 15 ? (
              <Trophy className="w-5 h-5 text-amber-500 fill-amber-100" />
            ) : newLevel >= 10 ? (
              <Trophy className="w-5 h-5 text-purple-500" />
            ) : newLevel >= 5 ? (
              <Award className="w-5 h-5 text-emerald-500" />
            ) : newLevel >= 2 ? (
              <Award className="w-5 h-5 text-blue-500" />
            ) : (
              <Sparkles className="w-5 h-5 text-slate-400" />
            )}
            <span className="text-base font-extrabold text-slate-800 tracking-tight">
              {rank}
            </span>
          </div>
        </div>

        {/* Next goal indicator */}
        {nextMilestone && (
          <div className="mb-8 flex items-center justify-center gap-1.5 text-xs text-slate-500 font-semibold bg-indigo-50/50 py-2.5 px-4 rounded-xl border border-indigo-100/50">
            <ArrowUpRight className="w-4 h-4 text-indigo-500" />
            <span>
              {t.nextMilestone}: <strong className="text-indigo-600 font-black">{t.reachLvl} {nextMilestone.level}</strong> {t.toUnlock} <strong className="text-slate-700 font-bold">{nextMilestone.rankName}</strong>
            </span>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-4 bg-slate-900 hover:bg-black text-white text-sm font-bold rounded-2xl transition-all shadow-xl active:scale-98 cursor-pointer relative overflow-hidden group"
        >
          <span className="relative z-10 font-bold">{t.closeBtn}</span>
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </button>
      </motion.div>
    </motion.div>
  );
}
