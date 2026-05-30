/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, Play, CheckCircle2, Lock, Volume2, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VoiceRecorderProps {
  onAnalysisComplete: (result: any) => void;
  exerciseText: string;
  difficulty: string;
  currentLang?: 'en' | 'id';
}

const TRANSLATIONS = {
  en: {
    micActive: "Mic Active",
    micBlocked: "Mic Blocked",
    micPending: "Mic Pending",
    micStatusTitle: "Microphone Sync Status",
    micStatusGranted: "Permission granted! Feel free to record your speech response clearly.",
    micStatusDenied: "System blocked. Read the visual assistance rules below to unbind microphone permissions.",
    micStatusPending: "Microphone querying or pending confirmation. Confirm access settings when prompted.",
    articulationCheck: "Articulation Check",
    tapToRecord: "Tap microphone to record",
    aiIsEvaluating: "AI Speech Coach is evaluating...",
    evaluatingDetails: "Analyzing clarity, rhythm & vocal intonation",
    recordingTapToStop: "Recording... Tap to stop",
    yourRecording: "Your Recording",
    playingPreview: "Playing audio preview",
    readyPlayback: "Ready for playback",
    pause: "Pause",
    listen: "Listen",
    unblockMicTitle: "How to unblock Microphone:",
    unblockStep1: "Click the Lock icon 🔒 in your browser's address bar (next to the website URL).",
    unblockStep2: "Locate the Microphone entry in the settings dropdown menu.",
    unblockStep3: "Toggle the switch to \"Allow\" / \"On\".",
    unblockStep4: "Once updated, click Refresh or press F5 to enable voice recognition!"
  },
  id: {
    micActive: "Mik Aktif",
    micBlocked: "Mik Diblokir",
    micPending: "Mik Tertunda",
    micStatusTitle: "Status Mikrofon",
    micStatusGranted: "Izin diberikan! Silakan rekam suara Anda dengan jelas.",
    micStatusDenied: "Akses diblokir. Baca petunjuk di bawah untuk mengaktifkan izin mikrofon.",
    micStatusPending: "Menunggu konfirmasi izin mikrofon. Konfirmasikan jika diminta.",
    articulationCheck: "Uji Artikulasi",
    tapToRecord: "Ketuk mikrofon untuk mulai merekam",
    aiIsEvaluating: "Pelatih Wicara AI sedang mengevaluasi...",
    evaluatingDetails: "Menganalisis kejelasan, ritme, & intonasi suara",
    recordingTapToStop: "Merekam... Ketuk untuk berhenti",
    yourRecording: "Rekaman Anda",
    playingPreview: "Memutar pratinjau suara",
    readyPlayback: "Siap diputar",
    pause: "Jeda",
    listen: "Dengar",
    unblockMicTitle: "Cara mengaktifkan kembali Mikrofon:",
    unblockStep1: "Klik ikon Gembok 🔒 di bagian kiri bilah alamat browser Anda (sebelah URL).",
    unblockStep2: "Cari opsi Mikrofon di menu pengaturan dropdown.",
    unblockStep3: "Ubah tombol pilihan ke \"Izinkan\" / \"Allow\" atau aktifkan.",
    unblockStep4: "Setelah diatur, Muat Ulang (Refresh) halaman atau tekan F5!"
  }
};

export default function VoiceRecorder({ onAnalysisComplete, exerciseText, difficulty, currentLang = 'en' }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const recordedAudioUrlRef = useRef<string | null>(null);
  const audioPlaybackRef = useRef<HTMLAudioElement | null>(null);

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const setRecordedUrlSafe = (url: string | null) => {
    if (recordedAudioUrlRef.current) {
      URL.revokeObjectURL(recordedAudioUrlRef.current);
    }
    recordedAudioUrlRef.current = url;
    setRecordedAudioUrl(url);
  };

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dimensionsRef = useRef({ width: 300, height: 64 });

  // Handle Canvas Resizing with Retina support (DPR)
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        dimensionsRef.current = { width, height };
        
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.resetTransform();
          ctx.scale(dpr, dpr);
        }
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // Continuous draw loop for real-time waveform visualization
  useEffect(() => {
    let time = 0;
    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        animationFrameIdRef.current = requestAnimationFrame(draw);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animationFrameIdRef.current = requestAnimationFrame(draw);
        return;
      }

      const { width, height } = dimensionsRef.current;
      ctx.clearRect(0, 0, width, height);

      const analyser = analyserRef.current;
      const bufferLength = analyser ? analyser.frequencyBinCount : 128;
      const dataArray = new Uint8Array(bufferLength);

      if (isRecording && analyser) {
        analyser.getByteTimeDomainData(dataArray);
      }

      time += 1;

      const renderWave = (phaseOffset: number, strokeStyle: string, lineWidth: number, ampMultiplier: number) => {
        ctx.beginPath();
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = strokeStyle;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        const sliceWidth = width / (bufferLength - 1);
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
          const t = i / (bufferLength - 1);
          // Sine capsule envelope to taper off nicely at the left and right canvas boundary
          const envelope = Math.sin(t * Math.PI);
          
          let yOffset = 0;
          if (isRecording && analyser) {
            const sampleIdx = Math.floor((i + phaseOffset * 6) % bufferLength);
            const val = (dataArray[sampleIdx] - 128) / 128.0;
            yOffset = val * envelope * ampMultiplier * (height * 0.45);
          } else {
            // Smooth living breathing standby wave
            yOffset = Math.sin(t * Math.PI * 3 + time * 0.04 + phaseOffset) * envelope * 3.5 * ampMultiplier;
          }
          
          const y = (height / 2) + yOffset;
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }
        ctx.stroke();
      };

      if (isRecording) {
        // High-energy vibrant recording wave styling
        renderWave(3.14, 'rgba(99, 102, 241, 0.12)', 7, 1.4);
        renderWave(1.57, 'rgba(79, 70, 229, 0.45)', 3.5, 0.95);
        renderWave(0.0, 'rgba(79, 70, 229, 1)', 2, 0.65);
      } else {
        // Elegant standby waves in soft indigos
        renderWave(2.5, 'rgba(224, 231, 255, 0.4)', 4, 1.0);
        renderWave(1.2, 'rgba(199, 210, 254, 0.6)', 2.5, 0.7);
        renderWave(0.0, 'rgba(165, 180, 252, 0.8)', 1.5, 0.45);
      }

      animationFrameIdRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [isRecording]);

  // Query microphone Permission on mount
  useEffect(() => {
    if (!navigator.permissions || !navigator.permissions.query) {
      setPermissionState('unknown');
      return;
    }

    let permissionStatus: PermissionStatus | null = null;
    
    const handlePermissionChange = () => {
      if (permissionStatus) {
        setPermissionState(permissionStatus.state as any);
      }
    };

    navigator.permissions.query({ name: 'microphone' as PermissionName })
      .then((status) => {
        permissionStatus = status;
        setPermissionState(status.state as any);
        status.addEventListener('change', handlePermissionChange);
      })
      .catch((err) => {
        console.warn('Could not query microphone permission:', err);
        setPermissionState('unknown');
      });

    return () => {
      if (permissionStatus) {
        permissionStatus.removeEventListener('change', handlePermissionChange);
      }
    };
  }, []);

  // Timer for tracking active recording length (MM:SS)
  useEffect(() => {
    let intervalId: any = null;
    if (isRecording) {
      setRecordingDuration(0);
      intervalId = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle clean-up when unmounting VoiceRecorder
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(e => console.error('Error closing AudioContext', e));
      }
      if (recordedAudioUrlRef.current) {
        URL.revokeObjectURL(recordedAudioUrlRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setRecordedUrlSafe(null);
      setIsAudioPlaying(false);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissionState('granted');
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // Web Audio API setup for real-time visualization
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContextClass();
        audioContextRef.current = audioCtx;
        
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 512;
        source.connect(analyser);
        analyserRef.current = analyser;
      } catch (audioErr) {
        console.error('Failed to initialize AudioContext for visualization', audioErr);
      }

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setRecordedUrlSafe(url);
        await analyzeAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
    } catch (err: any) {
      console.error('Error accessing microphone:', err);
      setError(currentLang === 'id' ? 'Akses mikrofon ditolak atau tidak tersedia.' : 'Microphone access denied or not available.');
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        setPermissionState('denied');
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }

    // Clean up Web Audio nodes
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(e => console.error('Error closing AudioContext', e));
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  };

  const analyzeAudio = async (blob: Blob) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      // Convert blob to base64 using a Promise so we can await it properly
      const base64Audio = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          if (reader.result) {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
          } else {
            reject(new Error("Failed to read audio blob"));
          }
        };
        reader.onerror = () => reject(reader.error || new Error("Reader error"));
      });
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audio: base64Audio,
          exerciseText,
          difficulty
        }),
      });

      if (!response.ok) {
        let errMessage = currentLang === 'id' ? 'Gagal mengevaluasi rekaman' : 'Failed to analyze';
        try {
          const errData = await response.json();
          if (errData && errData.error) {
            errMessage = errData.error;
          }
        } catch (e) {}
        throw new Error(errMessage);
      }
      
      const data = await response.json();
      onAnalysisComplete(data);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err?.message || (currentLang === 'id' ? 'Gagal menganalisis suara. Silakan coba lagi.' : 'Failed to analyze audio. Please try again.'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center gap-6 p-8 bg-white/50 backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl overflow-hidden">
      {/* Microphone Permission Indicator */}
      <div className="absolute top-4 right-4 z-20">
        <div className="relative group cursor-pointer">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-100/90 hover:bg-slate-200/90 transition-all border border-slate-200/60 shadow-sm">
            {permissionState === 'granted' ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-700">{t.micActive}</span>
              </>
            ) : permissionState === 'denied' ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-rose-700">{t.micBlocked}</span>
              </>
            ) : (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                </span>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-700">{t.micPending}</span>
              </>
            )}
          </div>

          {/* Hover Tooltip Box */}
          <div className="absolute top-full mt-2 right-0 w-64 bg-slate-900 border border-slate-700 text-white p-3.5 rounded-2xl text-[11px] shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all scale-95 group-hover:scale-100 duration-200 font-normal leading-relaxed z-30 text-left">
            <p className="font-extrabold text-[12px] text-yellow-400 mb-1">{t.micStatusTitle}</p>
            {permissionState === 'granted' && (
              <p className="text-gray-200">{t.micStatusGranted}</p>
            )}
            {permissionState === 'denied' && (
              <p className="text-gray-200">{t.micStatusDenied}</p>
            )}
            {permissionState !== 'granted' && permissionState !== 'denied' && (
              <p className="text-gray-200">{t.micStatusPending}</p>
            )}
          </div>
        </div>
      </div>

      <div className="text-center space-y-2">
        <h3 className="text-lg font-medium text-gray-700">{t.articulationCheck}</h3>
        <p className="text-sm text-gray-500 italic max-w-sm">"{exerciseText}"</p>
      </div>

      {/* Real-time Dynamic Waveform visualizer */}
      <div 
        ref={containerRef} 
        className="w-full max-w-sm h-16 bg-slate-50/50 border border-slate-100/80 rounded-2xl flex items-center justify-center p-2.5 overflow-hidden shadow-inner"
      >
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          {isRecording && (
            <>
              {/* Outer soft breathing glow */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ 
                  scale: [1, 1.35, 1], 
                  opacity: [0.25, 0.55, 0.25]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 2,
                  ease: "easeInOut" 
                }}
                className="absolute -inset-6 bg-red-500/20 rounded-full blur-md pointer-events-none"
              />
              {/* Inner intensive focal glow ring */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ 
                  scale: [1, 1.15, 1], 
                  opacity: [0.4, 0.8, 0.4],
                  boxShadow: [
                    "0 0 12px 2px rgba(239, 68, 68, 0.3)",
                    "0 0 24px 6px rgba(239, 68, 68, 0.65)",
                    "0 0 12px 2px rgba(239, 68, 68, 0.3)"
                  ]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 2,
                  ease: "easeInOut",
                  delay: 0.2 
                }}
                className="absolute -inset-2 rounded-full pointer-events-none border border-red-500/30"
              />
            </>
          )}
          {isAnalyzing && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
              className="absolute -inset-4 bg-indigo-500/30 rounded-full blur-md"
            />
          )}
        </AnimatePresence>

        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isAnalyzing}
          className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg ${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isAnalyzing ? (
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          ) : isRecording ? (
            <Square className="w-8 h-8 fill-current" />
          ) : (
            <Mic className="w-8 h-8" />
          )}
        </button>
      </div>

      <div className="text-sm font-medium">
        {isAnalyzing ? (
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-indigo-600 font-bold flex items-center gap-2 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" /> {t.aiIsEvaluating}
            </span>
            <span className="text-xs text-gray-400 font-normal">{t.evaluatingDetails}</span>
          </div>
        ) : isRecording ? (
          <div className="flex flex-col items-center gap-2">
            <span className="text-red-500 animate-pulse font-bold flex items-center gap-2 justify-center">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" /> {t.recordingTapToStop}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100/80 text-red-700 text-xs font-mono font-bold tracking-wider shadow-sm border border-red-200/50">
              {formatTime(recordingDuration)}
            </span>
          </div>
        ) : (
          <span className="text-gray-400">{t.tapToRecord}</span>
        )}
      </div>

      {/* Audio Playback Controls */}
      {recordedAudioUrl && !isRecording && !isAnalyzing && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm flex items-center justify-between p-4 bg-indigo-50/50 hover:bg-indigo-50/80 border border-indigo-100/60 rounded-2xl transition-all shadow-sm group"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl transition-colors ${isAudioPlaying ? 'bg-indigo-600 text-white animate-pulse' : 'bg-indigo-600/10 text-indigo-600 group-hover:bg-indigo-600/15'}`}>
              <Volume2 className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-indigo-950 uppercase tracking-wider">{t.yourRecording}</p>
              <p className="text-[10px] text-indigo-600 font-medium select-none anim">
                {isAudioPlaying ? t.playingPreview : t.readyPlayback}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (audioPlaybackRef.current) {
                if (isAudioPlaying) {
                  audioPlaybackRef.current.pause();
                } else {
                  audioPlaybackRef.current.play().catch(err => {
                    console.error("Playback failed", err);
                  });
                }
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md group-hover:shadow-lg active:scale-95"
          >
            {isAudioPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current text-white" />
                <span>{t.pause}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current text-white" />
                <span>{t.listen}</span>
              </>
            )}
          </button>

          <audio 
            ref={audioPlaybackRef} 
            src={recordedAudioUrl} 
            onPlay={() => setIsAudioPlaying(true)}
            onPause={() => setIsAudioPlaying(false)}
            onEnded={() => setIsAudioPlaying(false)}
            className="hidden"
          />
        </motion.div>
      )}

      {error && <p className="text-xs text-red-500 bg-red-50 border border-red-100 px-4 py-2 rounded-2xl max-w-xs text-center">{error}</p>}

      {permissionState === 'denied' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-100 rounded-2xl p-4.5 space-y-2.5 text-left text-xs text-rose-950 shadow-sm"
        >
          <div className="flex items-center gap-2 font-black text-rose-800 uppercase tracking-widest text-[10px]">
            <Lock className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>{t.unblockMicTitle}</span>
          </div>
          <ol className="list-decimal pl-4.5 space-y-1.5 text-rose-700 leading-relaxed font-sans font-medium">
            <li>{t.unblockStep1}</li>
            <li>{t.unblockStep2}</li>
            <li>{t.unblockStep3}</li>
            <li>{t.unblockStep4}</li>
          </ol>
        </motion.div>
      )}
    </div>
  );
}
