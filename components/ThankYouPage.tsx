
import React, { useEffect } from 'react';
import { Logo } from './Logo';
import { AuthService } from '../services/storage';

interface ThankYouPageProps {
  email: string;
  product: string;
  onContinue: () => void;
}

export const ThankYouPage: React.FC<ThankYouPageProps> = ({ email, product, onContinue }) => {
  useEffect(() => {
    if (email && product) {
      AuthService.recordPurchase(email, product);
    }
  }, [email, product]);

  const getProductLabel = (slug: string) => {
    const s = slug.toLowerCase();
    if (s.includes('signal')) return "Guide SOS Signal";
    if (s.includes('scale') || s.includes('sniper')) return "Système Scale & Sniper";
    if (s.includes('ltv')) return "Guide LTV Maximal";
    return slug.replace(/-/g, ' ').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 select-none animate-fade-in">
      <div className="max-w-2xl w-full text-center space-y-12">
        <Logo className="justify-center opacity-40 grayscale hover:grayscale-0 transition-all scale-75" />
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-emerald-200">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
          </div>
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
            Merci pour <br/>
            <span className="text-emerald-500">votre confiance !</span>
          </h1>
          <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.4em]">Propulsé par AdsPilot Pro</p>
        </div>
        <div className="bg-slate-50 border border-slate-100 p-10 rounded-[3rem]">
          <p className="text-xl md:text-2xl text-slate-700 font-medium italic leading-relaxed">
            "Un email vient d'être envoyé à <span className="text-indigo-600 font-black underline decoration-indigo-200">{email}</span> avec votre <span className="text-slate-900 font-black">{getProductLabel(product)}</span>."
          </p>
        </div>
        <button onClick={onContinue} className="bg-slate-900 text-white px-12 py-6 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-600 transition-all">
          Retourner au cockpit AdsPilot Pro
        </button>
      </div>
    </div>
  );
};
