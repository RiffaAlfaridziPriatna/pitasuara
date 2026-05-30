/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PlayCircle, CheckCircle2, Search, Filter, Sparkles, BookOpen } from 'lucide-react';
import { Exercise, EXERCISES_LIST } from '../types.ts';

interface ExerciseSelectorProps {
  onSelect: (ex: any) => void;
  selectedId: string | null;
  completedIds?: string[];
  currentLang?: 'en' | 'id';
}

const TRANSLATIONS = {
  en: {
    searchPlaceholder: "Search missions...",
    allLevels: "All Levels",
    focus: "Focus",
    done: "Done",
    noTemplate: "No speech template matched your filters",
    resetFilter: "Reset filter presets",
    categories: {
      "All": "All Focuses",
      "Sibilants": "Sibilants",
      "Plosives": "Plosives",
      "Rhotic": "Rhotic",
      "Nasals": "Nasals",
      "Woodchucking": "Woodchucking",
      "Vowels": "Vowels",
      "Consonants": "Consonants",
      "Fricatives": "Fricatives",
      "Diphthongs": "Diphthongs",
      "Liquids": "Liquids",
      "Laterals": "Laterals",
      "Oratory": "Oratory"
    } as Record<string, string>,
    difficulties: {
      "All": "All Levels",
      "Beginner": "Beginner",
      "Intermediate": "Intermediate",
      "Advanced": "Advanced",
      "Master": "Master"
    } as Record<string, string>
  },
  id: {
    searchPlaceholder: "Cari misi...",
    allLevels: "Semua Tingkat",
    focus: "Fokus",
    done: "Selesai",
    noTemplate: "Tidak ada latihan yang cocok dengan pencarian Anda",
    resetFilter: "Atur ulang penyaring",
    categories: {
      "All": "Semua Fokus",
      "Sibilants": "Sibilan (S/Z)",
      "Plosives": "Plosif (P/B/T/D/K/G)",
      "Rhotic": "Rotik (R Roll/Trill)",
      "Nasals": "Nasal (M/N/NG/NY)",
      "Woodchucking": "Alternasi (C/K/W)",
      "Vowels": "Vokal (A/I/U/E/O)",
      "Consonants": "Konsonan Sukar (KH/SY/Z)",
      "Fricatives": "Frikatif (F/V/H/S)",
      "Diphthongs": "Diftong (AI/AU/OI)",
      "Liquids": "Likuid (L/R)",
      "Laterals": "Lateral (L)",
      "Oratory": "Oratori (Pidato/Wicara)"
    } as Record<string, string>,
    difficulties: {
      "All": "Semua Tingkat",
      "Beginner": "Pemula",
      "Intermediate": "Menengah",
      "Advanced": "Mahir",
      "Master": "Ahli"
    } as Record<string, string>
  }
};

export default function ExerciseSelector({ onSelect, selectedId, completedIds = [], currentLang = 'en' }: ExerciseSelectorProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  // Filter based on active language profiles first
  const langExercises = EXERCISES_LIST.filter(ex => ex.lang === currentLang);

  // Extract unique categories for filter tabs based on lang exercises
  const rawCategories = Array.from(new Set(langExercises.map((ex) => ex.category)));
  const categories = ['All', ...rawCategories];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Master'];

  // Filter exercises dynamically
  const filteredExercises = langExercises.filter((ex) => {
    const matchesSearch = ex.title.toLowerCase().includes(search.toLowerCase()) || 
                          ex.text.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || ex.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || ex.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <div className="space-y-6">
      {/* Dynamic Search & Filtering panel */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          {/* Search bar */}
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200/80 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 text-sm placeholder:text-gray-400 transition-all font-sans font-medium"
            />
          </div>

          {/* Difficulty Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
            <Filter className="w-4 h-4 text-gray-400 hidden md:block" />
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full md:w-44 px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-200/80 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 text-sm font-bold text-gray-600 transition-all cursor-pointer"
            >
              <option value="All">{t.difficulties['All']}</option>
              {difficulties.filter(d => d !== 'All').map(d => (
                <option key={d} value={d}>{t.difficulties[d] || d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-200">
          <span className="text-xs font-black uppercase tracking-widest text-gray-400 shrink-0 mr-1.5 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-indigo-500" /> {t.focus}:
          </span>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            const categoryLabel = t.categories[cat] || cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                  isActive
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100'
                    : 'bg-gray-50 border-gray-200/60 hover:bg-gray-100 text-gray-600'
                }`}
              >
                {categoryLabel}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of exercises */}
      {filteredExercises.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredExercises.map((ex) => {
            const isCompleted = completedIds.includes(ex.id);
            const isSelected = selectedId === ex.id;
            
            // Get color mappings for difficulties
            const difficultyBadge = 
              ex.difficulty === 'Beginner' ? 'bg-emerald-50 text-emerald-700 border-emerald-100/50' :
              ex.difficulty === 'Intermediate' ? 'bg-blue-50 text-blue-700 border-blue-100/50' :
              ex.difficulty === 'Advanced' ? 'bg-amber-50 text-amber-700 border-amber-100/50' :
              'bg-red-50 text-red-700 border-red-100/50';

            const difficultyLabel = t.difficulties[ex.difficulty] || ex.difficulty;
            const categoryLabel = t.categories[ex.category] || ex.category;

            return (
              <button
                key={ex.id}
                onClick={() => onSelect(ex)}
                className={`group relative flex flex-col p-6 rounded-[2rem] text-left transition-all border-2 h-full ${
                  isSelected 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl scale-[1.03] z-10' 
                    : isCompleted
                      ? 'bg-emerald-50/20 border-emerald-100/65 hover:border-emerald-200 hover:bg-emerald-50 text-gray-900 shadow-sm hover:scale-[1.01]'
                      : 'bg-white border-gray-100/80 hover:border-indigo-100 hover:bg-indigo-50/20 text-gray-900 shadow-sm hover:scale-[1.01]'
                }`}
              >
                <div className="flex items-start justify-between mb-4 w-full gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`text-[9px] font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded-full ${
                      isSelected 
                        ? 'bg-indigo-500 text-white' 
                        : 'bg-indigo-50 text-indigo-700'
                    }`}>
                      {categoryLabel}
                    </span>
                    
                    {isCompleted && (
                      <span className={`text-[9px] font-extrabold flex items-center gap-1 px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-indigo-500/50 text-white' : 'bg-emerald-500 text-white'
                      }`}>
                        <CheckCircle2 className="w-2.5 h-2.5" /> {t.done}
                      </span>
                    )}
                  </div>
                  
                  <div className={`p-1.5 rounded-full transition-all shrink-0 ${
                    isSelected 
                      ? 'bg-indigo-500 text-white border border-indigo-400' 
                      : isCompleted
                        ? 'bg-emerald-100 group-hover:bg-emerald-200 text-emerald-600 border border-emerald-200'
                        : 'bg-indigo-50 group-hover:bg-indigo-100 text-indigo-600 border border-indigo-100'
                  }`}>
                    <PlayCircle className="w-4.5 h-4.5" />
                  </div>
                </div>

                <h4 className="text-lg font-black tracking-tight mb-2 leading-snug line-clamp-1">{ex.title}</h4>
                <p className={`text-xs mb-5 italic font-medium leading-relaxed font-sans line-clamp-2 ${
                  isSelected 
                    ? 'text-indigo-100' 
                    : isCompleted 
                      ? 'text-emerald-800/70' 
                      : 'text-gray-400'
                }`}>
                  "{ex.text}"
                </p>

                <div className="mt-auto pt-4 border-t border-dashed border-gray-100/10 flex items-center justify-between w-full">
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                    isSelected 
                      ? 'bg-indigo-500 text-white border-indigo-400' 
                      : difficultyBadge
                  }`}>
                    {difficultyLabel}
                  </span>
                  <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-lg ${
                    isSelected 
                      ? 'bg-white/20' 
                      : isCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-100 text-gray-500'
                  }`}>
                    +{ex.baseXP} XP
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white/50 rounded-[2.5rem] border-2 border-dashed border-gray-200/70 p-6 flex flex-col items-center justify-center">
          <Search className="w-10 h-10 text-gray-300 mb-3" />
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[11px]">{t.noTemplate}</p>
          <button 
            type="button"
            onClick={() => { setSearch(''); setSelectedCategory('All'); setSelectedDifficulty('All'); }}
            className="mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-800 underline active:scale-95"
          >
            {t.resetFilter}
          </button>
        </div>
      )}
    </div>
  );
}
