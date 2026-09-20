import React from 'react';
import { BookOpen, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export default function LearnPage({ onNavigate }) {
  const guides = [
    {
      title: 'How to Excel in University Hackathons',
      category: 'Participant Guide',
      readTime: '5 min read',
      description: 'Tips for team formation, rapid MVP prototyping, git workflow, and delivering a winning 3-minute pitch to jury panels.'
    },
    {
      title: 'Organizing a Seamless College TechFest',
      category: 'Manager Guide',
      readTime: '8 min read',
      description: 'Best practices for run-of-show planning, stage prompt routing, delay management, and speaker backstage checks.'
    },
    {
      title: 'Guide to Regional Tech Ecosystems',
      category: 'Community Guide',
      readTime: '6 min read',
      description: 'Overview of tech hubs, regional innovation centers, student developer groups, and incubator networks.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10 font-sans select-none">
      <div className="space-y-3 border-b border-slate-200 pb-8">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">
          KNOWLEDGE BASE
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-950 uppercase tracking-tight">
          Learn &amp; Resources
        </h1>
        <p className="text-base sm:text-lg text-slate-600 font-medium max-w-2xl">
          Guides, best practices, and resources for event participants, student leaders, and event managers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
        {guides.map((g, idx) => (
          <div key={idx} className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3 flex flex-col justify-between shadow-xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-500 uppercase">
                <span>{g.category}</span>
                <span>{g.readTime}</span>
              </div>
              <h3 className="text-base font-bold text-slate-950">{g.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{g.description}</p>
            </div>
            <button className="pt-2 text-xs font-mono font-bold text-slate-900 flex items-center gap-1 hover:underline">
              <span>Read Guide</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
