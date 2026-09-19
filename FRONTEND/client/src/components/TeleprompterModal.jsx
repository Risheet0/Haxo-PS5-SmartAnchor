import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Type,
  Clock,
  Volume2,
  ChevronUp,
  ChevronDown,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Eye,
  Sliders,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  HelpCircle,
  Radio
} from 'lucide-react';
import { parseStageScript } from '../utils/formatters';

const THEMES = {
  cleanLight: {
    name: 'Clean Light',
    bg: 'bg-[#F8FAFC]',
    text: 'text-slate-900',
    dimText: 'text-slate-400',
    activeBg: 'bg-white border-l-4 border-indigo-600 pl-4 py-2 rounded-r-xl shadow-md border-y border-r border-slate-200',
    cueBg: 'bg-amber-50 border border-amber-200 text-amber-800'
  },
  oled: {
    name: 'Pure OLED Black',
    bg: 'bg-[#000000]',
    text: 'text-white',
    dimText: 'text-slate-500',
    activeBg: 'bg-[#0F1420]/80 border-l-4 border-indigo-500 pl-4 py-2 rounded-r-xl shadow-lg',
    cueBg: 'bg-[#211604] border border-[#543007] text-[#FBBF24]'
  },
  stageDark: {
    name: 'Stage Obsidian',
    bg: 'bg-[#0A0D14]',
    text: 'text-slate-100',
    dimText: 'text-slate-500',
    activeBg: 'bg-[#101522] border-l-4 border-indigo-500 pl-4 py-2 rounded-r-xl shadow-lg',
    cueBg: 'bg-[#211604] border border-[#543007] text-[#FBBF24]'
  },
  highContrast: {
    name: 'High-Contrast Stage',
    bg: 'bg-[#000000]',
    text: 'text-[#FEF08A]', // Pale yellow on pitch black
    dimText: 'text-stone-600',
    activeBg: 'bg-[#1A1805] border-l-4 border-[#FBBF24] pl-4 py-2 rounded-r-xl',
    cueBg: 'bg-[#382603] border border-[#A16207] text-white'
  }
};

export default function TeleprompterModal({
  isOpen,
  onClose,
  script,
  title = 'Live Stage Teleprompter'
}) {
  const [fontSize, setFontSize] = useState(32); // Large default: 32px
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(2); // 1x to 5x
  const [activeParagraphIndex, setActiveParagraphIndex] = useState(0);
  const [themeKey, setThemeKey] = useState('cleanLight');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const animationRef = useRef(null);
  const paragraphRefs = useRef([]);

  const defaultScript =
    script ||
    `[Stage Cue: Stand center stage, smile warmly, look directly at audience]

"A very warm welcome to TechFest 2026! 

[Stage Cue: Open hand gesture towards delegates]

We are delighted to have you all here today with us for this extraordinary stage flow.

[Stage Cue: Announce keynote speaker with energy]

Please welcome our opening keynote dignitary to the main podium with a rousing round of applause!"`;

  const parsedItems = parseStageScript(defaultScript).filter(
    (item) => item.type !== 'empty'
  );

  const theme = THEMES[themeKey] || THEMES.oled;

  // 1. Auto-scroll frame loop
  useEffect(() => {
    if (isScrolling) {
      const scrollStep = () => {
        if (contentRef.current) {
          contentRef.current.scrollTop += scrollSpeed * 0.75;
        }
        animationRef.current = requestAnimationFrame(scrollStep);
      };
      animationRef.current = requestAnimationFrame(scrollStep);
    } else {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isScrolling, scrollSpeed]);

  // 2. Keyboard shortcuts handling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      // Don't trigger if modifier keys (Ctrl/Cmd) are held
      if (e.metaKey || e.ctrlKey) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          setIsScrolling((prev) => !prev);
          break;
        case 'ArrowUp':
          e.preventDefault();
          handlePrevParagraph();
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleNextParagraph();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setScrollSpeed((prev) => Math.max(1, prev - 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setScrollSpeed((prev) => Math.min(6, prev + 1));
          break;
        case 'BracketLeft':
        case 'Minus':
          e.preventDefault();
          setFontSize((prev) => Math.max(22, prev - 2));
          break;
        case 'BracketRight':
        case 'Equal':
          e.preventDefault();
          setFontSize((prev) => Math.min(56, prev + 2));
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'KeyR':
          e.preventDefault();
          handleResetScroll();
          break;
        case 'KeyT':
          e.preventDefault();
          cycleTheme();
          break;
        case 'Escape':
          if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
          } else {
            onClose();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeParagraphIndex, parsedItems.length]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleResetScroll = () => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setActiveParagraphIndex(0);
    setIsScrolling(false);
  };

  const handleNextParagraph = () => {
    if (activeParagraphIndex < parsedItems.length - 1) {
      const nextIdx = activeParagraphIndex + 1;
      setActiveParagraphIndex(nextIdx);
      scrollToItem(nextIdx);
    }
  };

  const handlePrevParagraph = () => {
    if (activeParagraphIndex > 0) {
      const prevIdx = activeParagraphIndex - 1;
      setActiveParagraphIndex(prevIdx);
      scrollToItem(prevIdx);
    }
  };

  const scrollToItem = (idx) => {
    const el = paragraphRefs.current[idx];
    if (el && contentRef.current) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const cycleTheme = () => {
    const keys = Object.keys(THEMES);
    const currIdx = keys.indexOf(themeKey);
    const nextKey = keys[(currIdx + 1) % keys.length];
    setThemeKey(nextKey);
  };

  const handleToggleVoice = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const vocalLines = defaultScript
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !(l.startsWith('[') && l.endsWith(']')))
      .join(' ')
      .replace(/[*_#"]/g, '');

    if (!vocalLines) return;
    const utterance = new SpeechSynthesisUtterance(vocalLines);
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  if (!isOpen) return null;

  const wordCount = defaultScript.split(/\s+/).filter(Boolean).length;
  const estimatedMin = Math.max(1, Math.ceil(wordCount / 130));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Stage Teleprompter Reader"
      ref={containerRef}
      className={`fixed inset-0 z-50 flex flex-col ${theme.bg} ${theme.text} animate-fade-in select-none font-['Plus_Jakarta_Sans',sans-serif]`}
    >
      {/* ─────────────────────────────────────────────────────────────
          1. MINIMAL CONTROL ROOM TOP BAR
          ───────────────────────────────────────────────────────────── */}
      <header className="h-16 border-b border-white/10 px-4 sm:px-8 flex items-center justify-between bg-black/70 backdrop-blur-md z-20">
        
        {/* Left: Title & Reading Metadata */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-md font-mono">
            TP
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-white tracking-tight leading-none">
              {title}
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-mono">
              <span className="text-indigo-400 font-bold">{wordCount} words</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-300">
                <Clock className="w-3 h-3 text-indigo-400" />
                ~{estimatedMin} min speech
              </span>
              <span>•</span>
              <span className="text-slate-400">
                Section {activeParagraphIndex + 1} of {parsedItems.length}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Play/Pause, Speed, & Paragraph Steppers */}
        <div className="flex items-center gap-2 sm:gap-3 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
          
          {/* Play / Pause Toggle */}
          <button
            onClick={() => setIsScrolling(!isScrolling)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-black transition active:scale-95 shadow-md ${
              isScrolling
                ? 'bg-amber-500 text-black border border-amber-400'
                : 'bg-emerald-600 text-white hover:bg-emerald-500'
            }`}
            title="Toggle auto-scroll [Space]"
          >
            {isScrolling ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span className="uppercase">{isScrolling ? 'Pause' : 'Auto Scroll'}</span>
          </button>

          {/* Reset */}
          <button
            onClick={handleResetScroll}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
            title="Reset scroll to beginning [R]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-white/15 mx-0.5" />

          {/* Paragraph Jump Arrows */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={handlePrevParagraph}
              disabled={activeParagraphIndex === 0}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-25 transition"
              title="Previous Paragraph [Arrow Up]"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextParagraph}
              disabled={activeParagraphIndex === parsedItems.length - 1}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-25 transition"
              title="Next Paragraph [Arrow Down]"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <div className="h-4 w-px bg-white/15 mx-0.5 hidden sm:block" />

          {/* Speed Control */}
          <div className="hidden sm:flex items-center gap-1 text-xs text-slate-300 font-mono">
            <span className="text-[11px] text-slate-400 font-sans font-semibold">Speed:</span>
            <button
              onClick={() => setScrollSpeed(Math.max(1, scrollSpeed - 1))}
              className="px-1.5 py-0.5 rounded hover:bg-white/10 text-slate-300 font-bold"
              title="Slower [Arrow Left]"
            >
              -
            </button>
            <span className="font-bold text-indigo-400 w-5 text-center">{scrollSpeed}x</span>
            <button
              onClick={() => setScrollSpeed(Math.min(6, scrollSpeed + 1))}
              className="px-1.5 py-0.5 rounded hover:bg-white/10 text-slate-300 font-bold"
              title="Faster [Arrow Right]"
            >
              +
            </button>
          </div>
        </div>

        {/* Right: Font Size, Theme, Fullscreen & Close */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* Font Size Steppers */}
          <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg border border-white/10 text-xs">
            <Type className="w-3.5 h-3.5 text-slate-400" />
            <button
              onClick={() => setFontSize(Math.max(22, fontSize - 2))}
              className="px-1.5 py-0.5 rounded hover:bg-white/10 text-slate-300 font-bold font-mono"
              title="Smaller font [-]"
            >
              A-
            </button>
            <span className="font-mono text-indigo-400 text-xs font-bold px-1">{fontSize}px</span>
            <button
              onClick={() => setFontSize(Math.min(56, fontSize + 2))}
              className="px-1.5 py-0.5 rounded hover:bg-white/10 text-slate-300 font-bold font-mono"
              title="Larger font [+]"
            >
              A+
            </button>
          </div>

          {/* Theme Switcher */}
          <button
            onClick={cycleTheme}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition"
            title={`Cycle theme: Current is ${theme.name} [T]`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          </button>

          {/* Audio Rehearsal */}
          <button
            onClick={handleToggleVoice}
            className={`p-2 rounded-lg border text-xs transition ${
              isSpeaking
                ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
            }`}
            title="Speech Synthesis Audio Practice"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>

          {/* Keyboard Shortcuts Help */}
          <button
            onClick={() => setShowShortcutsHelp(!showShortcutsHelp)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition hidden md:block"
            title="Keyboard Shortcuts"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition"
            title="Toggle Fullscreen [F]"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Exit / Close */}
          <button
            onClick={() => {
              if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
              }
              onClose();
            }}
            className="p-2 rounded-lg bg-red-600/80 hover:bg-red-600 text-white border border-red-500/50 transition active:scale-95"
            title="Exit Teleprompter [ESC]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN PROMPTER READING SURFACE
          ───────────────────────────────────────────────────────────── */}
      <main
        ref={contentRef}
        tabIndex={0}
        className="flex-1 overflow-y-auto px-6 sm:px-16 md:px-28 lg:px-44 xl:px-56 py-16 scroll-smooth focus:outline-none"
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: 1.75
        }}
      >
        <div className="max-w-4xl mx-auto space-y-8 pb-32">
          {parsedItems.map((item, idx) => {
            const isActive = activeParagraphIndex === idx;

            if (item.type === 'cue') {
              return (
                <div
                  key={idx}
                  ref={(el) => (paragraphRefs.current[idx] = el)}
                  onClick={() => setActiveParagraphIndex(idx)}
                  className="cursor-pointer transition duration-200"
                >
                  <div
                    className={`px-4 py-2 rounded-xl ${theme.cueBg} font-mono text-sm sm:text-base font-bold uppercase tracking-wider inline-flex items-center gap-2 shadow-md`}
                  >
                    <span>⚡ STAGE CUE:</span>
                    <span className="font-semibold normal-case tracking-normal">{item.content}</span>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={idx}
                ref={(el) => (paragraphRefs.current[idx] = el)}
                onClick={() => setActiveParagraphIndex(idx)}
                className={`cursor-pointer transition duration-300 font-medium ${
                  isActive
                    ? `${theme.activeBg} ${theme.text}`
                    : `${theme.dimText} hover:text-slate-300 opacity-60 hover:opacity-100`
                }`}
              >
                <p className="whitespace-pre-wrap">{item.content}</p>
              </div>
            );
          })}
        </div>
      </main>

      {/* ─────────────────────────────────────────────────────────────
          3. KEYBOARD SHORTCUTS POPUP OVERLAY
          ───────────────────────────────────────────────────────────── */}
      {showShortcutsHelp && (
        <div className={`fixed bottom-14 right-6 z-30 p-4 rounded-2xl border shadow-2xl text-xs space-y-2 w-80 animate-fade-in font-sans ${
          themeKey === 'cleanLight'
            ? 'bg-white border-slate-200 text-slate-800'
            : 'bg-[#101522] border-[#232E47] text-slate-200'
        }`}>
          <div className={`flex items-center justify-between pb-1.5 border-b ${
            themeKey === 'cleanLight' ? 'border-slate-100' : 'border-[#232E47]'
          }`}>
            <span className={`font-bold uppercase text-[10px] tracking-wider font-mono ${
              themeKey === 'cleanLight' ? 'text-slate-900' : 'text-white'
            }`}>
              Keyboard Navigation
            </span>
            <button
              onClick={() => setShowShortcutsHelp(false)}
              className={themeKey === 'cleanLight' ? 'text-slate-400 hover:text-slate-900' : 'text-slate-400 hover:text-white'}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className={`space-y-1.5 font-mono text-[11px] ${
            themeKey === 'cleanLight' ? 'text-slate-600' : 'text-slate-300'
          }`}>
            <div className="flex justify-between">
              <span className={themeKey === 'cleanLight' ? 'text-slate-500' : 'text-slate-400'}>Space:</span>
              <span className="text-indigo-600 font-bold">Play / Pause Auto-Scroll</span>
            </div>
            <div className="flex justify-between">
              <span className={themeKey === 'cleanLight' ? 'text-slate-500' : 'text-slate-400'}>&uarr; / &darr;:</span>
              <span className="text-indigo-600 font-bold">Prev / Next Paragraph</span>
            </div>
            <div className="flex justify-between">
              <span className={themeKey === 'cleanLight' ? 'text-slate-500' : 'text-slate-400'}>&larr; / &rarr;:</span>
              <span className="text-indigo-600 font-bold">Speed Slower / Faster</span>
            </div>
            <div className="flex justify-between">
              <span className={themeKey === 'cleanLight' ? 'text-slate-500' : 'text-slate-400'}>- / +:</span>
              <span className="text-indigo-600 font-bold">Font Size Smaller / Larger</span>
            </div>
            <div className="flex justify-between">
              <span className={themeKey === 'cleanLight' ? 'text-slate-500' : 'text-slate-400'}>F:</span>
              <span className="text-indigo-600 font-bold">Toggle Fullscreen</span>
            </div>
            <div className="flex justify-between">
              <span className={themeKey === 'cleanLight' ? 'text-slate-500' : 'text-slate-400'}>T:</span>
              <span className="text-indigo-600 font-bold">Cycle Theme</span>
            </div>
            <div className="flex justify-between">
              <span className={themeKey === 'cleanLight' ? 'text-slate-500' : 'text-slate-400'}>Esc:</span>
              <span className="text-indigo-600 font-bold">Exit Teleprompter</span>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. BOTTOM STAGE CUE STATUS BAR
          ───────────────────────────────────────────────────────────── */}
      <footer className="h-10 border-t border-white/10 px-6 sm:px-8 flex items-center justify-between text-xs text-slate-400 bg-black/80 backdrop-blur z-20">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-amber-400 font-mono text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            AMBER BADGES = STAGE CUES (DO NOT READ ALOUD)
          </span>
          <span className="hidden md:inline text-slate-500">•</span>
          <span className="hidden md:inline text-slate-400 text-[11px]">
            Active paragraph highlighted for steady stage pacing
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
          <span className="hidden sm:inline">Theme: {theme.name}</span>
          <span>Press ESC or X to Exit</span>
        </div>
      </footer>
    </div>
  );
}
