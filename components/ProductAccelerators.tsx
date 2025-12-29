
import React, { useState } from 'react';
import { AuthService } from '../services/storage';

interface ProductCardProps {
  id: string;
  title: string;
  price: string;
  description: string;
  isRecommended: boolean;
  icon: string;
  buttonText: string;
  sioLink: string;
  urgentText?: string;
  purchased?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  title, price, description, isRecommended, icon, buttonText, sioLink, urgentText, purchased 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative p-6 rounded-[2rem] bg-white border transition-all duration-500 flex flex-col h-full ${
        isRecommended 
          ? 'border-indigo-400 shadow-xl ring-1 ring-indigo-500/10 z-10 scale-[1.01]' 
          : 'border-slate-100 shadow-sm hover:shadow-lg'
      }`}
    >
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] shadow-lg whitespace-nowrap">
          RECOMMANDÉ
        </div>
      )}
      
      <div className="mb-4 flex justify-between items-start">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all duration-300 ${purchased ? 'bg-emerald-50' : 'bg-slate-50'}`}>
          <span className="relative">
            {purchased ? '✅' : icon}
            {!purchased && (
              <span className={`absolute -right-1.5 -bottom-1.5 text-xs transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-60'}`}>
                {isHovered ? '🔓' : '🔒'}
              </span>
            )}
          </span>
        </div>
        <div className={`${purchased ? 'bg-emerald-500' : 'bg-slate-900'} text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest`}>
          {purchased ? 'ACQUIS' : 'EXPERT'}
        </div>
      </div>

      <h4 className="text-lg font-bold text-slate-900 mb-2 uppercase tracking-tighter leading-tight">{title}</h4>
      
      {urgentText && !purchased && <p className="text-red-500 text-[8px] font-black uppercase tracking-widest mb-1">⚠️ {urgentText}</p>}

      <p className="text-slate-500 text-[11px] font-medium mb-6 flex-1 italic leading-relaxed">{description}</p>

      <div className="mt-auto space-y-3">
        <div className="flex items-end gap-1.5">
          <span className={`text-2xl font-black ${purchased ? 'text-emerald-500' : 'text-slate-900'}`}>{purchased ? 'Débloqué' : price}</span>
          {!purchased && <span className="text-slate-400 text-[8px] font-bold uppercase mb-1">TTC</span>}
        </div>
        <button 
          onClick={() => !purchased && window.open(sioLink, '_blank')}
          className={`block w-full py-3.5 rounded-xl text-center font-bold text-[10px] uppercase tracking-widest transition-all ${
            purchased 
              ? 'bg-emerald-500 text-white' 
              : (isRecommended ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-900 text-white hover:bg-slate-800')
          }`}
        >
          {purchased ? 'Consulter le Guide' : buttonText}
        </button>
      </div>
    </div>
  );
};

interface ProductAcceleratorsProps {
  emqScore: number;
  ltv: number;
  currentRoas: number;
  targetRoas: number;
  tresorerieLatenteMonthly: number;
}

export const ProductAccelerators: React.FC<ProductAcceleratorsProps> = ({ emqScore, ltv, currentRoas, targetRoas, tresorerieLatenteMonthly }) => {
  const currentUser = AuthService.getCurrentUser();
  const formatCurrency = (val: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

  const hasPurchased = (productId: string) => currentUser?.purchasedProducts?.includes(productId);

  let recommendedId = '';
  if (emqScore < 6 && !hasPurchased('SOS Signal')) recommendedId = 'signal';
  else if (currentRoas < targetRoas && !hasPurchased('Scale & Sniper')) recommendedId = 'scaling';
  else if (tresorerieLatenteMonthly > 1000 && !hasPurchased('LTV Maximal')) recommendedId = 'ltv';

  return (
    <div className="mt-12 space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ProductCard 
          id="SOS Signal"
          icon="📡" title="SOS Signal" price="47€" 
          urgentText={emqScore < 6 ? "Signal Critique" : undefined} 
          description="Réparez votre tracking et restaurez la vision de Meta. Indispensable pour stabiliser votre CPA." 
          buttonText="Récupérer données" 
          sioLink="https://ton-tunnel-sio.com/sos-signal" 
          isRecommended={recommendedId === 'signal'} 
          purchased={hasPurchased('SOS Signal')}
        />
        <ProductCard 
          id="LTV Maximal"
          icon="💎" title="LTV Maximal" price="67€" 
          description={`Vous avez ${formatCurrency(tresorerieLatenteMonthly)} de profit dormant dans votre base client.`} 
          buttonText="Débloquer profit" 
          sioLink="https://ton-tunnel-sio.com/ltv-maximal" 
          isRecommended={recommendedId === 'ltv'} 
          purchased={hasPurchased('LTV Maximal')}
        />
        <ProductCard 
          id="Scale & Sniper"
          icon="🎯" title="Scale & Sniper" price="97€" 
          description="Passez de 1k à 10k/jour sans exploser votre CPA grâce à la structure Broad." 
          buttonText="Lancer scaling" 
          sioLink="https://ton-tunnel-sio.com/scale-sniper" 
          isRecommended={recommendedId === 'scaling'} 
          purchased={hasPurchased('Scale & Sniper')}
        />
      </div>
    </div>
  );
};
