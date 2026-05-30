/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { X, Sparkles, TrendingUp, Award, Crown, Check, Trophy } from 'lucide-react';

interface RanksModalProps {
  currentLevel: number;
  currentXp: number;
  currentLang: 'en' | 'id';
  onClose: () => void;
}

const ICON_MAP = {
  Sparkles,
  TrendingUp,
  Award,
  Trophy,
  Crown
};

const RANKS_DATA = [
  {
    id: 'beginner',
    titleKey: 'rankBeginner',
    levels: '1',
    minXp: 0,
    color: 'from-slate-400 to-slate-500 text-slate-500 fill-slate-500 ring-slate-100 bg-slate-50',
    iconName: 'Sparkles',
    descEn: 'The starting step of your speech journey. Focus on basic speech patterns and pronunciation rules.',
    descId: 'Langkah awal perjalanan wicara Anda. Fokus pada pola bahasa dasar dan aturan pelafalan sederhana.'
  },
  {
    id: 'novice',
    titleKey: 'rankNovice',
    levels: '2 - 4',
    minXp: 100,
    color: 'from-blue-500 to-indigo-600 text-blue-500 fill-blue-500 ring-blue-100 bg-blue-50',
    iconName: 'TrendingUp',
    descEn: 'Build stable breathing and speech pacing. Transition from simple utterances to structured complete phrases.',
    descId: 'Mulai membangun stabilitas napas dan tempo berbicara. Beralih dari ucapan sederhana ke frasa terstruktur.'
  },
  {
    id: 'practitioner',
    titleKey: 'rankPractitioner',
    levels: '5 - 9',
    minXp: 1600,
    color: 'from-emerald-500 to-teal-600 text-emerald-600 fill-emerald-600 ring-emerald-100 bg-emerald-50',
    iconName: 'Award',
    descEn: 'Fluent and confident speaker. Expresses complex thoughts with dynamic control over pronunciation, pacing, and tone.',
    descId: 'Pembicara yang lancar dan percaya diri. Mengekspresikan pemikiran kompleks dengan kontrol dinamis atas pelafalan, tempo, dan nada.'
  },
  {
    id: 'orator',
    titleKey: 'rankMasterOrator',
    levels: '10 - 14',
    minXp: 8100,
    color: 'from-purple-500 to-indigo-700 text-purple-600 fill-purple-600 ring-purple-100 bg-purple-50',
    iconName: 'Trophy',
    descEn: 'Master of flow, rhythm, and cadence. Able to deliver long paragraphs with high vocal clarity and pacing.',
    descId: 'Ahli aliran kalimat, ritme, dan pembawaan kata. Mampu mengucapkan kalimat panjang dengan kejelasan vokal murni.'
  },
  {
    id: 'legend',
    titleKey: 'rankLegend',
    levels: '15+',
    minXp: 19600,
    color: 'from-amber-500 to-rose-600 text-amber-600 fill-amber-600 ring-amber-100 bg-amber-50',
    iconName: 'Crown',
    descEn: 'The pinnacle of vocal articulation control. Legendary orator recognized globally for perfect delivery.',
    descId: 'Puncak kendali artikulasi vokal tertinggi. Orator legendaris yang diakui secara global dengan pembawaan sempurna.'
  }
];

const MODAL_TRANSLATIONS = {
  en: {
    title: "Vocal Rank Progression",
    subtitle: "Embark on a structured journey to vocal mastery. Track your milestones from a beginner speaker up to an articulate legend.",
    levelBracket: "Level Bracket",
    requiredXp: "Required XP",
    activeRankBadge: "Current Rank",
    closeBtn: "Got it, back to training",
    rankBeginner: "Beginner",
    rankNovice: "Novice",
    rankPractitioner: "Practitioner",
    rankMasterOrator: "Master Orator",
    rankLegend: "Articulate Legend"
  },
  id: {
    title: "Tingkatan Vokal & Rapor",
    subtitle: "Mulai langkah terstruktur Anda menuju kefasihan berbicara. Pantau pencapaian Anda dari pembicara pemula hingga legenda artikulasi.",
    levelBracket: "Rentang Level",
    requiredXp: "XP Minimum",
    activeRankBadge: "Pangkat Aktif",
    closeBtn: "Kembali berlatih",
    rankBeginner: "Pemula",
    rankNovice: "Novis",
    rankPractitioner: "Praktisi",
    rankMasterOrator: "Orator Ulung",
    rankLegend: "Legenda Artikulasi"
  }
};

export default function RanksModal({ currentLevel, currentXp, currentLang, onClose }: RanksModalProps) {
  const t = MODAL_TRANSLATIONS[currentLang] || MODAL_TRANSLATIONS.en;

  // Resolve user's active rank ID
  let activeRankId = 'beginner';
  if (currentLevel >= 15) activeRankId = 'legend';
  else if (currentLevel >= 10) activeRankId = 'orator';
  else if (currentLevel >= 5) activeRankId = 'practitioner';
  else if (currentLevel >= 2) activeRankId = 'novice';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.95, y: 15, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 10, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="bg-white rounded-[2rem] max-w-2xl w-full shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]"
      >
        {/* Header Block */}
        <div className="p-6 md:p-8 bg-gradient-to-b from-gray-50/50 to-white border-b border-gray-100 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="space-y-1.5 pr-8">
            <h3 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
              {t.title}
            </h3>
            <p className="text-gray-500 text-xs md:text-sm leading-relaxed font-medium">
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* List Content */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-4">
          {RANKS_DATA.map((rank) => {
            const isActive = activeRankId === rank.id;
            const SelectedIcon = ICON_MAP[rank.iconName as keyof typeof ICON_MAP] || Sparkles;
            const rankTitle = t[rank.titleKey as keyof typeof t] || rank.id;
            const description = currentLang === 'id' ? rank.descId : rank.descEn;

            return (
              <div
                key={rank.id}
                className={`flex flex-col md:flex-row items-start md:items-center justify-between p-5 rounded-2xl border transition-all gap-4 relative ${
                  isActive
                    ? `bg-indigo-50/45 border-indigo-200/80 ring-4 ring-indigo-50`
                    : 'bg-[#FDFDFF] border-gray-200/60 hover:bg-white/80'
                }`}
              >
                {isActive && (
                  <div className="absolute -top-2.5 left-6 z-10">
                    <span className="text-[9px] font-black tracking-widest text-white bg-indigo-600 border border-indigo-500 px-3 py-1 rounded-full uppercase shadow-md shadow-indigo-100">
                      {t.activeRankBadge}
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ring-4 ${rank.color}`}>
                    <SelectedIcon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-lg text-gray-900 leading-none">
                        {rankTitle}
                      </h4>
                    </div>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-md">
                      {description}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-row md:flex-col items-start md:items-end justify-between w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 gap-4 shrink-0">
                  <div className="text-left md:text-right">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">
                      {t.levelBracket}
                    </p>
                    <p className="text-sm font-extrabold text-gray-800 tracking-tight mt-1">
                      Lvl {rank.levels}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">
                      {t.requiredXp}
                    </p>
                    <p className="text-sm font-black text-indigo-600 bg-indigo-50 border border-indigo-100/40 px-2.5 py-1 rounded-full inline-block tracking-tight mt-1">
                      {rank.minXp.toLocaleString()} XP
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer close button */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-900 hover:bg-black text-white text-sm font-bold rounded-xl transition-all shadow-md active:scale-98 cursor-pointer text-center"
          >
            {t.closeBtn}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
