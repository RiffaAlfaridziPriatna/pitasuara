/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Medal, User as UserIcon, Award, Zap, Flame, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LeaderboardProps {
  users: any[];
  currentLang?: 'en' | 'id';
}

const TRANSLATIONS = {
  en: {
    hallOfFame: "Global Hall of Fame",
    liveRankings: "Live",
    vocalProfile: "Vocal Profile",
    levelProgress: "Level Progress",
    coachingTip: "Coaching Tip",
    dailyStreak: "Daily speaking streak active",
    totalXp: "Total XP",
    rank: "Rank",
    level: "Level",
    rankBeginner: "Beginner",
    rankNovice: "Novice",
    rankPractitioner: "Practitioner",
    rankMasterOrator: "Master Orator",
    rankLegend: "Articulate Legend",
    tips: {
      0: "Keep articulation steady! Focus on deep breathing before saying each word.",
      1: "Speak slowly and focus on pure vowel clarity. Pace is the key to focus.",
      2: "Master plosive speech releases (P, T, K) clearly for high articulation.",
      3: "Great job! Keep practicing intonation shifts and smooth vocal phrasing."
    } as Record<number, string>
  },
  id: {
    hallOfFame: "Galeri Juara Global",
    liveRankings: "Live",
    vocalProfile: "Profil Vokal",
    levelProgress: "Kemajuan Tingkat",
    coachingTip: "Saran Pelatih",
    dailyStreak: "Latihan harian aktif",
    totalXp: "Total XP",
    rank: "Peringkat",
    level: "Tingkat",
    rankBeginner: "Pemula",
    rankNovice: "Novis",
    rankPractitioner: "Praktisi",
    rankMasterOrator: "Orator Ulung",
    rankLegend: "Legenda Artikulasi",
    tips: {
      0: "Jaga artikulasi tetap stabil! Tarik napas dalam-dalam sebelum mengucapkan setiap kata.",
      1: "Bicaralah perlahan dan fokus pada kejelasan vokal. Ketukan adalah kunci utama fokus.",
      2: "Kuasai pelepasan suara plosif (P, T, K) dengan jelas untuk artikulasi yang lantang.",
      3: "Luar biasa! Terus latih pergeseran intonasi dan frasa wicara yang lancar."
    } as Record<number, string>
  }
};

export default function Leaderboard({ users, currentLang = 'en' }: LeaderboardProps) {
  const sortedUsers = [...users].sort((a, b) => b.xp - a.xp);
  const [hoveredUserId, setHoveredUserId] = useState<string | null>(null);

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const getRankName = (level: number) => {
    if (level >= 15) return t.rankLegend;
    if (level >= 10) return t.rankMasterOrator;
    if (level >= 5) return t.rankPractitioner;
    if (level >= 2) return t.rankNovice;
    return t.rankBeginner;
  };

  const getTooltipTip = (level: number) => {
    if (level <= 1) return t.tips[0];
    if (level <= 2) return t.tips[1];
    if (level <= 4) return t.tips[2];
    return t.tips[3];
  };

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Medal className="w-6 h-6 text-yellow-500 animate-bounce" /> {t.hallOfFame}
        </h3>
        <div className="flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-100/60 px-3 py-1 rounded-full shadow-sm text-[10px] sm:text-xs font-extrabold uppercase tracking-widest select-none">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
          </span>
          <span>{t.liveRankings}</span>
        </div>
      </div>

      <div className="space-y-4">
        {sortedUsers.slice(0, 10).map((user, index) => {
          const currentLevel = user.level || 1;
          const xpPerLevel = 200;
          const currentXpInLevel = user.xp % xpPerLevel;
          const percentage = Math.min(100, Math.floor((currentXpInLevel / xpPerLevel) * 100));

          return (
            <div 
              key={user.uid} 
              onMouseEnter={() => setHoveredUserId(user.uid)}
              onMouseLeave={() => setHoveredUserId(null)}
              onClick={() => setHoveredUserId(hoveredUserId === user.uid ? null : user.uid)}
              className={`relative flex items-center gap-4 p-4 rounded-2xl transition-all cursor-pointer ${
                index < 3 ? 'bg-indigo-50/50 shadow-sm' : 'hover:bg-gray-50'
              }`}
            >
              {/* Tooltip Card */}
              <AnimatePresence>
                {hoveredUserId === user.uid && (
                  <motion.div
                    initial={{ opacity: 0, y: -15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    style={{ originY: 0 }}
                    className="absolute top-full mt-3 left-1/2 -translate-x-1/2 w-80 bg-gray-950/95 backdrop-blur-md text-white p-5 rounded-2xl shadow-2xl border border-white/10 z-50 pointer-events-auto"
                  >
                    <div className="space-y-3.5 text-left">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-amber-400" />
                          <span className="text-xs font-black uppercase text-indigo-400 tracking-wider">
                            {t.vocalProfile}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono">
                          ID: {user.uid ? user.uid.slice(0, 6).toUpperCase() : 'MEM_0'}
                        </span>
                      </div>
                      
                      {/* Name in tooltip */}
                      <div>
                        <p className="font-bold text-sm text-gray-100">{user.displayName}</p>
                        <p className="text-xs text-yellow-400 font-bold flex items-center gap-1.5 mt-0.5">
                          {index === 0 ? <Crown className="w-3.5 h-3.5 text-yellow-400" /> : <Flame className="w-3.5 h-3.5 text-orange-400" />}
                          {t.rank} {index + 1} • {getRankName(currentLevel)}
                        </p>
                      </div>

                      {/* Progress bar to next level */}
                      <div className="space-y-1.5 border-t border-white/5 pt-3">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-gray-300">{t.level} {currentLevel} {t.levelProgress}</span>
                          <span className="text-indigo-300 font-bold">{currentXpInLevel} / {xpPerLevel} XP</span>
                        </div>
                        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.4 }}
                            className="bg-indigo-500 h-full rounded-full"
                          />
                        </div>
                      </div>

                      {/* Bio / Coaching Tip */}
                      <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                        <p className="text-[11px] text-gray-200 leading-relaxed">
                          💡 <span className="font-semibold text-indigo-300">{t.coachingTip}:</span> {getTooltipTip(currentLevel)}
                        </p>
                      </div>

                      <div className="text-[10px] text-center text-gray-400 border-t border-white/5 pt-2 flex items-center justify-center gap-1">
                        <Flame className="w-3 h-3 text-orange-500 inline" /> {t.dailyStreak}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center font-bold text-sm rounded-full ${
                index === 0 ? 'bg-yellow-400 text-yellow-900' :
                index === 1 ? 'bg-gray-300 text-gray-700' :
                index === 2 ? 'bg-orange-300 text-orange-800' :
                'bg-gray-100 text-gray-400'
              }`}>
                {index + 1}
              </div>
              
              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-400">
                    <UserIcon className="w-6 h-6" />
                  </div>
                )}
              </div>

              <div className="flex-grow min-w-0">
                <p className="font-bold text-gray-800 truncate">{user.displayName}</p>
                <p className="text-xs font-medium text-indigo-500 uppercase tracking-tighter truncate">{t.level} {currentLevel} • {getRankName(currentLevel)}</p>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="font-black text-gray-900">{user.xp.toLocaleString()}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.totalXp}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
