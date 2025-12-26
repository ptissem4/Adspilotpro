
import React from 'react';

export const MockupCockpit = () => (
  <div className="relative w-full max-w-xs mx-auto aspect-[4/3] bg-white/40 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl overflow-hidden p-6 flex flex-col gap-4 animate-fade-in">
    <div className="flex items-center gap-2 mb-2">
      <div className="w-2 h-2 rounded-full bg-red-400"></div>
      <div className="w-2 h-2 rounded-full bg-amber-400"></div>
      <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
    </div>
    <div className="space-y-4">
      <div className="h-4 w-2/3 bg-slate-200/50 rounded-full"></div>
      <div className="space-y-2">
        <div className="h-10 w-full bg-white/80 rounded-xl border border-slate-100 flex items-center px-4 justify-between">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Budget</span>
          <span className="text-xs font-black text-indigo-600">1 500 €</span>
        </div>
        <div className="h-10 w-full bg-white/80 rounded-xl border border-slate-100 flex items-center px-4 justify-between">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">LTV</span>
          <span className="text-xs font-black text-indigo-600">463 €</span>
        </div>
      </div>
      <div className="mt-4 h-12 w-full bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
  </div>
);

export const MockupAnalysis = () => (
  <div className="relative w-full max-w-xs mx-auto aspect-[4/3] bg-white/40 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl overflow-hidden p-6 flex flex-col animate-fade-in delay-100">
    <div className="flex justify-between items-center mb-6">
      <div className="h-3 w-20 bg-slate-900/10 rounded-full"></div>
      <div className="h-5 w-12 bg-emerald-100 text-emerald-600 text-[8px] font-black flex items-center justify-center rounded-full uppercase tracking-widest">Delta</div>
    </div>
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">ROAS</span>
          <span className="text-[10px] font-black text-slate-900">1.8 &rarr; 3.0</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full w-[60%] bg-indigo-500 rounded-full relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 animate-shimmer"></div>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Ventes</span>
          <span className="text-[10px] font-black text-emerald-600">+42%</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full w-[85%] bg-emerald-500 rounded-full relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 animate-shimmer"></div>
          </div>
        </div>
      </div>
      <div className="bg-white/60 border border-slate-100 p-4 rounded-2xl text-center">
         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Profit Latent</p>
         <p className="text-xl font-black text-slate-900">+1 240 €</p>
      </div>
    </div>
  </div>
);

export const MockupVerdict = () => (
  <div className="relative w-full max-w-xs mx-auto aspect-[4/3] bg-slate-900 rounded-3xl shadow-2xl overflow-hidden p-6 flex flex-col justify-between animate-fade-in delay-200">
    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
    <div className="relative z-10 flex items-start justify-between">
      <div className="space-y-2">
        <div className="h-2 w-16 bg-indigo-400 rounded-full"></div>
        <h4 className="text-white font-black uppercase text-xs italic tracking-tighter">Audit Chirurgical</h4>
      </div>
      <div className="w-10 h-12 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/10 shadow-xl">
        <span className="text-xl text-white">📄</span>
      </div>
    </div>
    
    <div className="relative z-10 text-center space-y-2">
      <p className="text-emerald-400 font-black text-[10px] uppercase tracking-[0.2em]">Économie Mensuelle</p>
      <div className="text-4xl font-black text-white tracking-tighter tabular-nums">
        2 850 €
      </div>
    </div>

    <div className="relative z-10 h-10 w-full bg-emerald-500 rounded-xl flex items-center justify-center text-[10px] font-black text-white uppercase tracking-widest shadow-lg shadow-emerald-500/20">
      Récupérer le Profit &rarr;
    </div>
  </div>
);
