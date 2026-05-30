/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User as FirebaseUser,
  signOut
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp,
  addDoc,
  where
} from 'firebase/firestore';
import { auth, db, OperationType, handleFirestoreError } from './lib/firebase.ts';
import VoiceRecorder from './components/VoiceRecorder.tsx';
import ResultOverlay from './components/ResultOverlay.tsx';
import Leaderboard from './components/Leaderboard.tsx';
import ExerciseSelector from './components/ExerciseSelector.tsx';
import RanksModal from './components/RanksModal.tsx';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, User as UserIcon, Zap, Sparkles, TrendingUp, Globe, Award, Trophy, Flame, Crown, LayoutDashboard, History, Calendar, ArrowRight, BookOpen, Mic, ChevronRight, Lock } from 'lucide-react';
import { AppUser, ACHIEVEMENTS_LIST, getEligibleAchievements, EXERCISES_LIST } from './types.ts';

const APP_TRANSLATIONS = {
  en: {
    loading: "PitaSuara",
    speechCoaching: "AI SPEECH COACHING",
    taglineHeadingFirst: "Perfect Your",
    taglineHeadingSecond: "Articulation.",
    subtitle: "Master clear speech with precise AI feedback. Compete globally and track progress.",
    signInBtn: "Sign in with Google",
    badgeLabelLevelUp: "Level Up Your Speech",
    badgeLabelFree: "Free for Everyone",
    navDashboard: "Dashboard",
    navMissions: "Missions",
    standingTitle: "Vocal Standing",
    totalXp: "Total XP",
    xpToNextScale: "XP to next level milestone",
    yourRanking: "Your Ranking",
    achievementsShelf: "Achievements Shelf",
    achievementsUnlockedAtRank: "Achievement Shelf is Locked",
    achievementsUnlockedAtRankDesc: "Keep learning! The exclusive Achievements Shelf unlocks when you reach Practitioner (Level 5+).",
    switchMission: "Switch Mission",
    activeTrainingSession: "Active Training Session",
    category: "Focus",
    difficulty: "Difficulty",
    recentHistory: "Recent Articulation History",
    last5Logs: "Last 5 logs",
    noPracticesTitle: "No speaking practices recorded yet",
    noPracticesSubtitle: "Complete your first session from the missions tab to see metrics here.",
    noActiveMissionTitle: "No Mission Active",
    noActiveMissionSubtitle: "Select from professional speaking drills designed to train articulation clarity, rhythm, and plosive speaking rate.",
    exploreMissions: "Explore missions",
    recentHistLabelClarity: "Clarity",
    recentHistLabelFlow: "Flow",
    levelLabel: "Level",
    activeChallenges: "Speaking Missions Hub",
    dailyCompletions: "completions of active language drills",
    completionsOf: "of",
    missionsMainTitle: "Master Your Articulation & Rhythm",
    missionsMainDesc: "Select any of the speaking exercises below. Clicking a challenge will immediately configure the speech evaluator and active recorder inside your Dashboard.",
    footerText: "PitaSuara • Building Confidence Through Clarity",
    unlocked: "UNLOCKED",
    locked: "Locked",
    coachingTip: "Coaching Tip",
    levelUpTitle: "Level Up",
    rankBeginner: "Beginner",
    rankNovice: "Novice",
    rankPractitioner: "Practitioner",
    rankMasterOrator: "Master Orator",
    rankLegend: "Articulate Legend",
    achievementInfo: {
      "first_steps": { title: "Vocal Explorer", desc: "Complete your very first speech training exercise" },
      "rank_novice": { title: "Vocal Novice", desc: "Begin your journey as a Novice speaker (Level 2+)" },
      "vocal_maestro": { title: "Vocal Maestro", desc: "Complete 3 speech exercises to build strong vocal momentum" },
      "rank_practitioner": { title: "Rising Practitioner", desc: "Reach Level 5+ to achieve the Practitioner rank" },
      "silver_tongue": { title: "Silver Tongue", desc: "Gain 85% or higher in vocal clarity and pronunciation" },
      "golden_tone": { title: "Master of Cadence", desc: "Score 90% or higher in both clarity and rhythm metrics" },
      "seven_day_streak": { title: "7-Day Streak", desc: "Complete 7 exercises to establish solid practice routines" },
      "rank_orator": { title: "Master Orator", desc: "Reach Level 10+ to achieve the Master Orator rank" },
      "vocal_athlete": { title: "Vocal Athlete", desc: "Record 15 speech drill sets to shape expert muscle memory" },
      "rank_legend": { title: "Articulate Legend", desc: "Reach Level 15+ to achieve the ultimate Articulate Legend rank" }
    } as Record<string, { title: string; desc: string }>
  },
  id: {
    loading: "PitaSuara",
    speechCoaching: "PELATIH WICARA AI",
    taglineHeadingFirst: "Sempurnakan",
    taglineHeadingSecond: "Artikulasi Anda.",
    subtitle: "Kuasai ucapan jelas dengan umpan balik AI yang presisi. Bersaing secara global dan pantau kemajuan Anda.",
    signInBtn: "Masuk dengan Google",
    badgeLabelLevelUp: "Tingkatkan Vokal Anda",
    badgeLabelFree: "Gratis untuk Semua",
    navDashboard: "Dasbor",
    navMissions: "Misi",
    standingTitle: "Kompetensi Vokal",
    totalXp: "Total XP",
    xpToNextScale: "XP untuk mencapai tingkat berikutnya",
    yourRanking: "Peringkat Vokal",
    achievementsShelf: "Galeri Pencapaian",
    achievementsUnlockedAtRank: "Galeri Pencapaian Terkunci",
    achievementsUnlockedAtRankDesc: "Terus berlatih! Galeri Pencapaian Eksklusif ini akan terbuka saat Anda mencapai peringkat Praktisi (Level 5+).",
    switchMission: "Ganti Misi",
    activeTrainingSession: "Sesi Latihan Aktif",
    category: "Fokus",
    difficulty: "Tingkat Kesulitan",
    recentHistory: "Riwayat Artikulasi Terakhir",
    last5Logs: "5 riwayat terakhir",
    noPracticesTitle: "Belum ada rekaman latihan wicara",
    noPracticesSubtitle: "Selesaikan sesi pertama Anda dari tab misi untuk melihat metrik pemicu di sini.",
    noActiveMissionTitle: "Tidak Ada Misi Aktif",
    noActiveMissionSubtitle: "Pilih dari latihan wicara profesional yang dirancang untuk melatih kejelasan artikulasi, ritme, dan pelafalan kata.",
    exploreMissions: "Jelajahi misi",
    recentHistLabelClarity: "Kejelasan",
    recentHistLabelFlow: "Aliran",
    levelLabel: "Tingkat",
    activeChallenges: "Pusat Latihan Wicara",
    dailyCompletions: "misi bahasa aktif diselesaikan hari ini",
    completionsOf: "dari",
    missionsMainTitle: "Kuasai Artikulasi & Ritme Bicara Anda",
    missionsMainDesc: "Pilih salah satu dari latihan berbicara di bawah ini. Mengeklik tantangan akan segera mengonfigurasi evaluator ucapan dan perekam aktif di dalam Dasbor Anda.",
    footerText: "PitaSuara • Membangun Kepercayaan Diri Melalui Kejelasan",
    unlocked: "TERBUKA",
    locked: "Terkunci",
    coachingTip: "Saran Pelatih",
    levelUpTitle: "Tingkat Baru",
    rankBeginner: "Pemula",
    rankNovice: "Novis",
    rankPractitioner: "Praktisi",
    rankMasterOrator: "Orator Ulung",
    rankLegend: "Legenda Artikulasi",
    achievementInfo: {
      "first_steps": { title: "Penjelajah Vokal", desc: "Selesaikan latihan wicara pertama Anda untuk memulai" },
      "rank_novice": { title: "Pemula Vokal", desc: "Mulai perjalanan Anda sebagai pembicara Novis (Tingkat 2+)" },
      "vocal_maestro": { title: "Maestro Vokal", desc: "Selesaikan 3 latihan wicara untuk mengasah konsistensi awal" },
      "rank_practitioner": { title: "Praktisi Berbakat", desc: "Mencapai Tingkat 5+ untuk meraih peringkat Praktisi" },
      "silver_tongue": { title: "Lidah Perak", desc: "Raih tingkat kejelasan artikulasi di atas 85% atau lebih" },
      "golden_tone": { title: "Ahli Kadensi", desc: "Raih nilai kejelasan dan ritme di atas 90% secara bersamaan" },
      "seven_day_streak": { title: "Rutinitas 7 Hari", desc: "Selesaikan total 7 latihan untuk melatih konsistensi bicara" },
      "rank_orator": { title: "Orator Ulung", desc: "Mencapai Tingkat 10+ untuk meraih peringkat Orator Ulung" },
      "vocal_athlete": { title: "Atlet Vokal", desc: "Selesaikan 15 sesi rekaman wicara untuk membangun refleks bicara" },
      "rank_legend": { title: "Legenda Artikulasi", desc: "Mencapai Tingkat 15+ untuk meraih peringkat Legenda Artikulasi" }
    } as Record<string, { title: string; desc: string }>
  }
};

export default function App() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<AppUser[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [latestResult, setLatestResult] = useState<any>(null);
  const [userResults, setUserResults] = useState<any[]>([]);
  const [completedExerciseIds, setCompletedExerciseIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'missions'>('dashboard');
  const [showRanksModal, setShowRanksModal] = useState(false);

  // Load language preference from local storage on bootstrap
  const [lang, setLang] = useState<'en' | 'id'>(() => {
    return (localStorage.getItem('pitasuara_lang') as 'en' | 'id') || 'en';
  });

  const t = APP_TRANSLATIONS[lang] || APP_TRANSLATIONS.en;

  // Persist language toggle changes to web storage
  useEffect(() => {
    localStorage.setItem('pitasuara_lang', lang);
  }, [lang]);

  // Clean-up or match selectedExercise on language shift
  useEffect(() => {
    if (selectedExercise && selectedExercise.lang !== lang) {
      setSelectedExercise(null);
    }
  }, [lang, selectedExercise]);

  useEffect(() => {
    let unsubscribeLb: (() => void) | null = null;
    let unsubscribeResults: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      setFirebaseUser(fUser);
      if (fUser) {
        try {
          await syncUserProfile(fUser);
        } catch (error) {
          console.error("Failed to sync user profile in onAuthStateChanged: ", error);
        }

        if (!unsubscribeLb) {
          const lbQuery = query(collection(db, 'users'), orderBy('xp', 'desc'), limit(50));
          unsubscribeLb = onSnapshot(lbQuery, (snapshot) => {
            const users = snapshot.docs.map(doc => doc.data() as AppUser);
            setLeaderboard(users);
          }, (error) => {
            handleFirestoreError(error, OperationType.LIST, 'users');
          });
        }

        if (!unsubscribeResults) {
          const resultsQuery = query(collection(db, 'results'), where('userId', '==', fUser.uid));
          unsubscribeResults = onSnapshot(resultsQuery, (snapshot) => {
            const results = snapshot.docs.map(doc => {
              const data = doc.data();
              const date = data.timestamp?.toDate ? data.timestamp.toDate() : (data.timestamp?.seconds ? new Date(data.timestamp.seconds * 1000) : new Date());
              return { ...data, id: doc.id, date };
            });
            setUserResults(results);
          }, (error) => {
            console.error("Failed to stream user articulation results:", error);
          });
        }
      } else {
        setUser(null);
        setUserResults([]);
        setCompletedExerciseIds([]);
        if (unsubscribeLb) {
          unsubscribeLb();
          unsubscribeLb = null;
        }
        if (unsubscribeResults) {
          unsubscribeResults();
          unsubscribeResults = null;
        }
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (unsubscribeLb) unsubscribeLb();
      if (unsubscribeResults) unsubscribeResults();
    };
  }, []);

  // Compute language-specific completions for active language
  useEffect(() => {
    const updateCompletedIds = () => {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const todaysExercises = userResults
        .filter(res => {
          if (!res.date) return false;
          // Filter matching language
          const matchingEx = EXERCISES_LIST.find(e => e.id === res.exerciseId);
          return res.date >= startOfToday && matchingEx && matchingEx.lang === lang;
        })
        .map(res => res.exerciseId);

      const uniqueIds = Array.from(new Set(todaysExercises));
      setCompletedExerciseIds(uniqueIds);
    };

    updateCompletedIds();

    const interval = setInterval(updateCompletedIds, 20000);
    return () => clearInterval(interval);
  }, [userResults, lang]);

  const syncUserProfile = async (fUser: FirebaseUser) => {
    try {
      const userRef = doc(db, 'users', fUser.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        setUser(userDoc.data() as AppUser);
      } else {
        const newUser: AppUser = {
          uid: fUser.uid,
          displayName: fUser.displayName || 'Vocal Artist',
          photoURL: fUser.photoURL || '',
          email: fUser.email || '',
          xp: 0,
          level: 1,
          rank: lang === 'id' ? t.rankBeginner : 'Beginner'
        };
        await setDoc(userRef, {
          ...newUser,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        setUser(newUser);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${fUser.uid}`);
    }
  };

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const handleSignOut = () => signOut(auth);

  const onAnalysisComplete = async (result: any) => {
    if (!user || !selectedExercise) return;

    const newXP = (user.xp || 0) + result.xpEarned;
    const newLevel = Math.floor(Math.sqrt(newXP / 100)) + 1;
    
    // Auto translate rank logic safely
    let rank = t.rankBeginner;
    if (newLevel >= 15) rank = t.rankLegend;
    else if (newLevel >= 10) rank = t.rankMasterOrator;
    else if (newLevel >= 5) rank = t.rankPractitioner;
    else if (newLevel >= 2) rank = t.rankNovice;

    const oldUnlocked = user.unlockedAchievements || [];
    const eligibleIds = getEligibleAchievements({
      xp: newXP,
      level: newLevel,
      completedCount: userResults.length + 1,
      clarityScore: result.clarityScore || 0,
      intonationScore: result.intonationScore || 0
    });

    const newlyUnlockedIds = eligibleIds.filter(id => !oldUnlocked.includes(id));
    const updatedAchievements = [...oldUnlocked, ...newlyUnlockedIds];

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        xp: newXP,
        level: newLevel,
        rank: rank,
        unlockedAchievements: updatedAchievements,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }

    try {
      await addDoc(collection(db, 'results'), {
        userId: user.uid,
        exerciseId: selectedExercise.id,
        ...result,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'results');
    }

    const newlyUnlockedDefs = ACHIEVEMENTS_LIST.filter(ach => newlyUnlockedIds.includes(ach.id));

    setLatestResult({ 
      ...result,
      newlyUnlockedAchievements: newlyUnlockedDefs
    });
    
    setUser(prev => prev ? { 
      ...prev, 
      xp: newXP, 
      level: newLevel, 
      rank,
      unlockedAchievements: updatedAchievements 
    } : null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FF] flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-indigo-600 font-black text-4xl italic tracking-tighter"
        >
          {t.loading}
        </motion.div>
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <div className="min-h-screen bg-[#F8F9FF] selection:bg-indigo-100 flex flex-col items-center justify-center p-6 overflow-hidden relative font-sans">
        {/* Language selector for visitor screen */}
        <div className="absolute top-6 right-6 z-30 flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-gray-200 shadow-sm">
          <button
            onClick={() => setLang('en')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              lang === 'en'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLang('id')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              lang === 'id'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            ID
          </button>
        </div>

        {/* Particle Field and Background Effects */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-200/30 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-200/20 rounded-full blur-[100px]" />
          
          <div className="absolute inset-0 opacity-40">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: Math.random() * 100 + "%", 
                  y: Math.random() * 100 + "%",
                  scale: Math.random() * 0.5 + 0.5,
                  opacity: Math.random() * 0.3 + 0.2
                }}
                animate={{ 
                  y: [null, "-20%", "120%"],
                  opacity: [0, 0.5, 0]
                }}
                transition={{ 
                  duration: Math.random() * 10 + 10, 
                  repeat: Infinity, 
                  ease: "linear",
                  delay: Math.random() * 10
                }}
                className="absolute w-1 h-1 bg-indigo-400 rounded-full"
              />
            ))}
          </div>
        </div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center space-y-12 max-w-4xl relative z-10"
        >
          {/* Holographic Visualizer Placeholder Section */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] -z-10 opacity-30 pointer-events-none">
             <svg className="w-full h-full" viewBox="0 0 800 600">
                <defs>
                   <radialGradient id="halo" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="transparent" />
                   </radialGradient>
                </defs>
                
                {/* Visualizing "Face" logic with sound waves */}
                <motion.path
                  animate={{ 
                    d: [
                      "M 400,200 Q 450,200 450,300 Q 450,400 400,450 Q 350,400 350,300 Q 350,200 400,200",
                      "M 400,190 Q 470,200 470,300 Q 470,410 400,460 Q 330,410 330,300 Q 330,200 400,190"
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="0.5"
                  strokeDasharray="5,5"
                />
                
                {[...Array(5)].map((_, i) => (
                  <motion.ellipse
                    key={i}
                    cx="400"
                    cy="300"
                    rx={100 + i * 40}
                    ry={150 + i * 20}
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="0.2"
                    initial={{ opacity: 0.1 }}
                    animate={{ opacity: [0.1, 0.3, 0.1], scale: [0.95, 1.05, 0.95] }}
                    transition={{ duration: 4, delay: i * 0.5, repeat: Infinity }}
                  />
                ))}
             </svg>
          </div>

          <div className="flex flex-col items-center gap-6">
            <motion.span 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-indigo-50/80 backdrop-blur-sm text-indigo-600 px-5 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] border border-indigo-100/50 shadow-sm"
            >
              {t.speechCoaching}
            </motion.span>
            
            <div className="relative">
              {/* Pulsating Halo Glow Effect */}
              <motion.div 
                animate={{ 
                  scale: [1, 1.05, 1],
                  opacity: [0.3, 0.6, 0.3],
                  filter: ["blur(40px)", "blur(60px)", "blur(40px)"]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute inset-0 bg-indigo-400/20 rounded-full"
              />
              
              <h1 className="text-7xl md:text-8xl font-black text-gray-900 tracking-tighter mt-4 relative z-10">
                {t.taglineHeadingFirst} <br/> 
                <span className="bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 bg-clip-text text-transparent">
                  {t.taglineHeadingSecond}
                </span>
              </h1>
            </div>

            <p className="text-xl md:text-2xl text-gray-600 max-w-xl mx-auto font-medium leading-relaxed">
              {t.subtitle}
            </p>
          </div>

          <div className="flex flex-col items-center gap-8">
            <button
              onClick={handleSignIn}
              className="group relative flex items-center gap-3 bg-gray-900 border border-white/10 text-white px-6 py-3 rounded-full font-bold text-base hover:bg-black transition-all shadow-xl hover:shadow-indigo-500/10 active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-5 h-5 relative z-10" alt="Google" />
              <span className="relative z-10">{t.signInBtn}</span>
              <motion.div
                animate={{ 
                  opacity: [0.4, 1, 0.4],
                  scale: [1, 1.2, 1],
                  rotate: [0, 45, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="relative z-10"
              >
                <Sparkles className="w-4 h-4 text-indigo-400 filter drop-shadow-[0_0_3px_rgba(129,140,248,0.8)]" />
              </motion.div>
            </button>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-4 text-[11px] sm:text-xs font-semibold text-gray-400/80 uppercase tracking-[0.18em]"
            >
              <span className="flex items-center gap-1.5">
                <span className="text-sm">🏆</span> {t.badgeLabelLevelUp}
              </span>
              <span className="w-1 h-1 bg-gray-300/80 rounded-full" />
              <span className="flex items-center gap-1.5">
                <span className="text-sm">✨</span> {t.badgeLabelFree}
              </span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FF] text-gray-900 font-sans selection:bg-indigo-100">
      {/* Header */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="bg-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center text-white font-black italic text-xl shadow-lg shadow-indigo-200">P</div>
             <h1 className="text-2xl font-black tracking-tighter italic">{t.loading}</h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 sm:gap-4 text-xs font-extrabold uppercase tracking-widest">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all border ${
                  activeTab === 'dashboard'
                    ? 'text-indigo-600 bg-indigo-50 border-indigo-100/60 shadow-sm'
                    : 'text-gray-500 border-transparent hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0 text-indigo-505" />
                <span>{t.navDashboard}</span>
              </button>
              <button
                onClick={() => setActiveTab('missions')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all border ${
                  activeTab === 'missions'
                    ? 'text-indigo-600 bg-indigo-50 border-indigo-100/60 shadow-sm'
                    : 'text-gray-500 border-transparent hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <TrendingUp className="w-4 h-4 shrink-0 text-indigo-500" />
                <span>{t.navMissions}</span>
                {completedExerciseIds.length > 0 && (
                  <span className="ml-1 w-2 h-2 rounded-full bg-emerald-500" />
                )}
              </button>
            </div>

            <div className="h-8 w-px bg-gray-200 hidden md:block" />

            {/* Language Picker */}
            <div className="flex items-center gap-0.5 bg-gray-100 p-1 rounded-2xl border border-gray-200/40">
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-black transition-all ${
                  lang === 'en'
                    ? 'bg-indigo-650 bg-white text-indigo-600 shadow-sm font-black'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
               >
                EN
              </button>
              <button
                onClick={() => setLang('id')}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-black transition-all ${
                  lang === 'id'
                    ? 'bg-indigo-650 bg-white text-indigo-600 shadow-sm font-black'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                ID
              </button>
            </div>

            <div className="h-8 w-px bg-gray-200 hidden md:block" />

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-gray-900">{user?.displayName}</p>
                <div className="flex items-center justify-end gap-1">
                   <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                   <span className="text-[10px] font-bold text-gray-400 uppercase">{t.levelLabel} {user?.level}</span>
                </div>
              </div>
              <div className="relative group">
                <div className="w-10 h-10 rounded-full bg-indigo-100 overflow-hidden border-2 border-white shadow-sm ring-2 ring-indigo-50">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-full h-full p-2 text-indigo-400" />
                  )}
                </div>
                <button 
                  onClick={handleSignOut}
                  className="absolute top-0 right-0 w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' ? (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Left Column: Recording & Vocal Workout */}
              <div className="lg:col-span-8 space-y-8">
                {selectedExercise ? (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-white border border-gray-100 rounded-3xl shadow-sm gap-4">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
                          {t.activeTrainingSession}
                        </span>
                        <h2 className="text-2xl font-black tracking-tight mt-2 text-gray-900">
                          {selectedExercise.title}
                        </h2>
                        <p className="text-xs text-gray-400 font-medium mt-1">
                          {t.category}: {selectedExercise.category} • {t.difficulty}: {selectedExercise.difficulty}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => setActiveTab('missions')}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-xs font-bold text-gray-600 border border-gray-100 tracking-wide transition-all shrink-0 active:scale-95"
                      >
                        <TrendingUp className="w-4 h-4 text-indigo-500" />
                        <span>{t.switchMission}</span>
                      </button>
                    </div>

                    <VoiceRecorder 
                      exerciseText={selectedExercise.text}
                      difficulty={selectedExercise.difficulty}
                      onAnalysisComplete={onAnalysisComplete}
                      currentLang={lang}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-10 md:p-14 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm relative overflow-hidden min-h-[400px]">
                    {/* Background Radial Glow */}
                    <div className="absolute inset-0 bg-radial-gradient from-indigo-500/5 to-transparent blur-2xl pointer-events-none" />
                    
                    <div className="relative z-10 max-w-md mx-auto space-y-6">
                      <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mx-auto shadow-inner border border-indigo-100/50">
                        <Mic className="w-8 h-8 text-indigo-500" />
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-3xl font-black tracking-tight text-gray-900">{t.noActiveMissionTitle}</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">
                          {t.noActiveMissionSubtitle}
                        </p>
                      </div>
                      
                      <div className="pt-2">
                        <button
                          onClick={() => setActiveTab('missions')}
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm tracking-wide shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition-all active:scale-95 group"
                        >
                          <span>{t.exploreMissions}</span>
                          <ArrowRight className="w-4 h-4 text-indigo-200 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>

                      {/* Display minor focus labels */}
                      <div className="grid grid-cols-3 gap-3 pt-6 border-t border-gray-100 max-w-xs mx-auto">
                        <div className="text-center">
                          <p className="text-xs font-black text-gray-800">CLARITY</p>
                          <p className="text-[10px] text-gray-400 font-bold tracking-tight">Vowels</p>
                        </div>
                        <div className="text-center border-x border-gray-100">
                          <p className="text-xs font-black text-gray-800">CADENCE</p>
                          <p className="text-[10px] text-gray-400 font-bold tracking-tight">Tempo</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-black text-gray-800">FLOW</p>
                          <p className="text-[10px] text-gray-400 font-bold tracking-tight">Intonation</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Speaking History Log Section (Clean, Borderless background design) */}
                <div className="bg-white rounded-[2rem] p-6 border border-gray-100/60 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black tracking-tight text-gray-900 flex items-center gap-2">
                      <History className="w-5 h-5 text-indigo-500" /> {t.recentHistory}
                    </h3>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2.5 py-1 rounded-full bg-gray-50 border border-gray-100/60">
                      {t.last5Logs}
                    </span>
                  </div>

                  {userResults.length > 0 ? (
                    <div className="space-y-3">
                      {[...userResults]
                        .sort((a, b) => b.date - a.date)
                        .slice(0, 5)
                        .map((res) => {
                          const matchingExercise = EXERCISES_LIST.find(e => e.id === res.exerciseId);
                          const title = matchingExercise ? matchingExercise.title : 'Articulation Drill';
                          const category = matchingExercise ? matchingExercise.category : 'Speech';
                          const diff = matchingExercise ? matchingExercise.difficulty : 'Beginner';

                          return (
                            <div key={res.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-[#FBFBFF] hover:bg-[#F9F9FF] hover:border-indigo-100/40 transition-all gap-4 border border-transparent">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100/30 flex items-center justify-center shrink-0">
                                  <Mic className="w-5 h-5 text-indigo-500" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-gray-900 leading-none">{title}</p>
                                    <span className="text-[9px] font-black uppercase text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md">{category}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium mt-1">
                                    <Calendar className="w-3.5 h-3.5 text-gray-300" />
                                    <span>
                                      {res.date instanceof Date ? res.date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'Recording'}
                                    </span>
                                    <span>•</span>
                                    <span className="font-semibold text-indigo-600">{diff}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 self-end sm:self-auto">
                                <div className="text-right">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100/50">
                                      {res.clarityScore}% {t.recentHistLabelClarity}
                                    </span>
                                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100/50">
                                      {res.intonationScore}% {t.recentHistLabelFlow}
                                    </span>
                                  </div>
                                  <p className="text-[9px] font-black text-gray-400 mt-1 uppercase tracking-wider">
                                    +{res.xpEarned} XP
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200 p-6 flex flex-col items-center justify-center">
                      <Mic className="w-8 h-8 text-gray-300 mb-2 animate-pulse" />
                      <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">{t.noPracticesTitle}</p>
                      <p className="text-gray-400 text-xs mt-1">{t.noPracticesSubtitle}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: User Standing XP & Global Leaderboard */}
              <div className="lg:col-span-4 space-y-8">
                {user && (
                  <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-200">
                     <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold">{t.standingTitle}</h3>
                        <Award className="w-6 h-6 text-white/50" />
                     </div>

                     <div className="space-y-6">
                       <div>
                          <div className="flex items-end justify-between mb-2">
                             <span className="text-4xl font-black">{user.xp.toLocaleString()}</span>
                             <span className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">{t.totalXp}</span>
                          </div>
                          <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                             <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(user.xp % 100)}%` }}
                              className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]" 
                             />
                          </div>
                          <p className="mt-2 text-[10px] font-bold text-white/60 uppercase tracking-widest">
                             {150 - (user.xp % 150)} {t.xpToNextScale}
                          </p>
                       </div>

                       <button
                          onClick={() => setShowRanksModal(true)}
                          className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl transition-all text-left outline-none group cursor-pointer"
                       >
                          <div className="flex items-center gap-4">
                             <div className="bg-white/10 p-3 rounded-xl group-hover:bg-white/15 transition-all shadow-inner">
                                {user.level >= 15 ? (
                                    <Crown className="w-5 h-5 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]" />
                                 ) : user.level >= 10 ? (
                                    <Trophy className="w-5 h-5 text-purple-300 drop-shadow-[0_0_8px_rgba(196,181,253,0.4)]" />
                                 ) : user.level >= 5 ? (
                                    <Award className="w-5 h-5 text-emerald-300 drop-shadow-[0_0_8px_rgba(110,231,183,0.4)]" />
                                 ) : user.level >= 2 ? (
                                    <TrendingUp className="w-5 h-5 text-blue-300 drop-shadow-[0_0_8px_rgba(147,197,253,0.4)]" />
                                 ) : (
                                    <Sparkles className="w-5 h-5 text-slate-300 drop-shadow-[0_0_8px_rgba(203,213,225,0.4)]" />
                                 )}
                             </div>
                             <div>
                                <p className="text-[10px] sm:text-xs font-bold text-white/50 uppercase tracking-widest leading-none mb-1.5">{t.yourRanking}</p>
                                <p className="text-lg font-black leading-none flex items-center gap-1.5 text-white">{user.rank}</p>
                             </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-white/45 group-hover:text-white transition-all group-hover:translate-x-0.5 shrink-0" />
                       </button>
                        <div className="pt-6 border-t border-white/10 space-y-3">
                          <p className="text-xs font-bold text-white/60 uppercase tracking-widest text-white/95">{t.achievementsShelf}</p>
                          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl w-full">
                            <div className="grid grid-cols-5 gap-3 font-sans">
                              {ACHIEVEMENTS_LIST.map((ach) => {
                                const isUnlocked = (user?.unlockedAchievements || []).includes(ach.id);
                                
                                // Localized Achievement Title & Description
                                const detail = t.achievementInfo[ach.id] || { title: ach.title, desc: ach.description };

                                return (
                                  <div 
                                    key={ach.id}
                                    className={`flex items-center justify-center aspect-square rounded-xl transition-all relative group cursor-pointer border ${
                                      isUnlocked 
                                        ? 'bg-white/20 text-white border-white/20 shadow-lg scale-100 hover:scale-110' 
                                        : 'bg-white/5 text-white/20 border-white/5 cursor-not-allowed'
                                    }`}
                                  >
                                    {ach.iconName === 'Sparkles' && <Sparkles className={`w-5 h-5 transition-colors duration-300 ${isUnlocked ? 'text-amber-200 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'text-white/20'}`} />}
                                    {ach.iconName === 'Trophy' && <Trophy className={`w-5 h-5 transition-colors duration-300 ${isUnlocked ? 'text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.5)]' : 'text-white/20'}`} />}
                                    {ach.iconName === 'Award' && <Award className={`w-5 h-5 transition-colors duration-300 ${isUnlocked ? 'text-indigo-300 drop-shadow-[0_0_8px_rgba(165,180,252,0.5)]' : 'text-white/20'}`} />}
                                    {ach.iconName === 'Flame' && <Flame className={`w-5 h-5 transition-colors duration-300 ${isUnlocked ? 'text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]' : 'text-white/20'}`} />}
                                    {ach.iconName === 'Crown' && <Crown className={`w-5 h-5 transition-colors duration-300 ${isUnlocked ? 'text-rose-300 drop-shadow-[0_0_8px_rgba(244,114,182,0.5)]' : 'text-white/20'}`} />}
                                    {ach.iconName === 'Mic' && <Mic className={`w-5 h-5 transition-colors duration-300 ${isUnlocked ? 'text-emerald-300 drop-shadow-[0_0_8px_rgba(110,231,183,0.5)]' : 'text-white/20'}`} />}
                                    {ach.iconName === 'Zap' && <Zap className={`w-5 h-5 transition-colors duration-300 ${isUnlocked ? 'text-sky-300 drop-shadow-[0_0_8px_rgba(125,211,252,0.5)]' : 'text-white/20'}`} />}
                                    {ach.iconName === 'Calendar' && <Calendar className={`w-5 h-5 transition-colors duration-300 ${isUnlocked ? 'text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.5)]' : 'text-white/20'}`} />}
                                    {ach.iconName === 'BookOpen' && <BookOpen className={`w-5 h-5 transition-colors duration-300 ${isUnlocked ? 'text-violet-300 drop-shadow-[0_0_8px_rgba(196,181,253,0.5)]' : 'text-white/20'}`} />}

                                    <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-52 bg-slate-900 text-white p-3.5 rounded-2xl text-[11px] shadow-2xl border border-slate-700/80 opacity-0 group-hover:opacity-100 pointer-events-none transition-all scale-95 group-hover:scale-100 duration-200 font-normal text-center z-[100]">
                                      <p className="font-extrabold text-[12px] text-yellow-400 mb-1">{detail.title}</p>
                                      <p className="leading-relaxed text-gray-200 mb-2">{detail.desc}</p>
                                      <div className="border-t border-white/10 pt-1.5">
                                        <span className={`font-black text-[9px] uppercase tracking-wider ${isUnlocked ? 'text-emerald-400' : 'text-gray-400'}`}>
                                          {isUnlocked ? `✦ ${t.unlocked} ✦` : t.locked}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                     </div>
                  </div>
                )}

                <Leaderboard users={leaderboard} currentLang={lang} />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="missions"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              {/* Mission Hub Banner */}
              <div className="bg-gradient-to-r from-indigo-950 to-indigo-850 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-xl shadow-indigo-150">
                <div className="absolute top-[-40%] right-[-10%] w-[60%] h-[180%] bg-indigo-500/10 rounded-full blur-[90px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[120%] bg-blue-500/10 rounded-full blur-[90px]" />

                <div className="relative z-10 max-w-3xl space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="bg-white/15 text-white border border-white/10 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase">
                      {t.activeChallenges}
                    </span>
                    <span className="bg-indigo-500/30 text-indigo-200 px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                      {completedExerciseIds.length} {t.completionsOf} 12 {t.dailyCompletions}
                    </span>
                  </div>

                  <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none text-white">
                    {t.missionsMainTitle}
                  </h2>
                  <p className="text-indigo-200/90 text-sm md:text-base leading-relaxed max-w-xl font-medium">
                    {t.missionsMainDesc}
                  </p>
                </div>
              </div>

              {/* Central, Full Width filterable exercises catalog */}
              <ExerciseSelector
                onSelect={(ex) => {
                  setSelectedExercise(ex);
                  setActiveTab('dashboard'); // Switch tab smoothly
                }}
                selectedId={selectedExercise?.id}
                completedIds={completedExerciseIds}
                currentLang={lang}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>


      <AnimatePresence>
        {latestResult && (
          <ResultOverlay 
            result={latestResult} 
            newlyUnlockedAchievements={latestResult.newlyUnlockedAchievements}
            onClose={() => setLatestResult(null)} 
            currentLang={lang}
          />
        )}
        {showRanksModal && user && (
          <RanksModal
            currentLevel={user.level}
            currentXp={user.xp}
            currentLang={lang}
            onClose={() => setShowRanksModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Background Decor */}
      <footer className="mt-8 py-6 border-t border-gray-100/60">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-400">
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-gray-400/70">{t.footerText}</p>
        </div>
      </footer>
    </div>
  );
}

function PlayCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="10 8 16 12 10 16 10 8" />
    </svg>
  );
}
