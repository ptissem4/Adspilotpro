
import React, { useState } from 'react';
import { AuthService } from '../services/storage';

interface BoutiqueProps {
  onNotification?: (msg: string, type?: 'success' | 'error') => void;
}

const FAQ_ITEMS = [
  {
    question: "C'est quoi Andromeda ?",
    answer: "C'est le nom de code de l'IA prédictive de Meta (Advantage+). Elle ne choisit plus vos clients par intérêts, mais par le signal de conversion envoyé par votre site. Plus ce signal est propre, plus l'IA est puissante."
  },
  {
    question: "Pourquoi mon Pixel est-il \"aveugle\" ?",
    answer: "Depuis iOS14, le Pixel classique perd jusqu'à 70% des données. Sans l'API de Conversion (CAPI) server-side, l'IA Andromeda n'a plus assez d'informations pour optimiser vos ventes et identifier vos meilleurs prospects."
  },
  {
    question: "Le guide SOS Signal suffit-il pour corriger le tracking ?",
    answer: "Oui, il vous donne la méthode pas à pas pour restaurer un signal propre (EMQ > 8/10) via GTM server-side, permettant à l'IA de retrouver sa vision et sa rentabilité immédiate."
  }
];

export const Boutique: React.FC<BoutiqueProps> = ({ onNotification }) => {
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [email, setEmail] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const currentUser = AuthService.getCurrentUser();

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onNotification) onNotification("Vous avez été ajouté à la liste d'attente ! 🚀");
    setShowWaitlist(false);
    setEmail('');
  };

  const hasPurchased = (productId: string) => {
    return currentUser?.purchasedProducts?.includes(productId);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-20 animate-fade-in space-y-24 pb-40">
      {/* HEADER */}
      <div className="text-center space-y-6">
        <div className="inline-block px-5 py-2 bg-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-4 text-white shadow-lg">
          L'Arsenal de l'Expert
        </div>
        <h2 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase italic leading-[0.9]">
          Domptez l'IA <br/>
          <span className="text-indigo-600">de Meta.</span>
        </h2>
        <p className="text-slate-500 font-medium italic text-lg max-w-2xl mx-auto">
          Les outils et l'accompagnement d'Alexia pour transformer vos metrics en profit réel.
        </p>
        
        {!currentUser && (
          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl max-w-xl mx-auto mt-8 flex items-center gap-4 text-left">
             <span className="text-2xl">🎁</span>
             <p className="text-xs text-indigo-900 font-medium leading-relaxed italic">
               <strong>Note :</strong> Après votre achat, votre accès sera activé instantanément sur votre cockpit AdsPilot Pro grâce à notre synchronisation en temps réel.
             </p>
          </div>
        )}
      </div>

      {/* SECTION A: GUIDES TECHNIQUES */}
      <section className="space-y-12">
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-200"></div>
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em]">Section A : Guides Techniques</h3>
          <div className="h-px flex-1 bg-slate-200"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <GuideCard 
            icon="📡"
            title="SOS Signal"
            price="47€"
            description="Réparez votre tracking et restaurez la vision de Meta. Indispensable si votre score EMQ est inférieur à 8."
            link="https://ton-tunnel-sio.com/sos-signal"
            purchased={hasPurchased('SOS Signal')}
          />
          <GuideCard 
            icon="💎"
            title="LTV Maximal"
            price="67€"
            description="Le protocole complet pour transformer un acheteur unique en client fidèle. Débloquez votre profit dormant."
            link="https://ton-tunnel-sio.com/ltv-maximal"
            isFeatured
            purchased={hasPurchased('LTV Maximal')}
          />
          <GuideCard 
            icon="🎯"
            title="Scale & Sniper"
            price="97€"
            description="La structure de campagne Broad pour passer de 1k à 10k/jour sans exploser votre CPA."
            link="https://ton-tunnel-sio.com/scale-sniper"
            purchased={hasPurchased('Scale & Sniper')}
          />
        </div>
      </section>

      {/* SECTION B: FORMATION (COMING SOON) */}
      <section className="space-y-12">
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-200"></div>
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em]">Section B : Formation</h3>
          <div className="h-px flex-1 bg-slate-200"></div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative group p-1 bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-800 rounded-[3.5rem] shadow-2xl overflow-hidden">
             <div className="bg-white/90 backdrop-blur-xl rounded-[3.4rem] p-12 md:p-20 text-center relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                <div className="relative z-10 space-y-8">
                   <span className="inline-block px-4 py-1.5 bg-slate-900 text-white rounded-full text-[9px] font-black uppercase tracking-widest mb-4">Lancement Prochain</span>
                   <h4 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase text-slate-900">Masterclass Meta <span className="text-indigo-600">Andromeda</span></h4>
                   <p className="text-slate-500 text-lg font-medium italic max-w-xl mx-auto leading-relaxed">
                     Devenez un architecte de la data et du scaling. 12 modules pour maîtriser l'algorithme qui génère des millions.
                   </p>
                   <button 
                     onClick={() => setShowWaitlist(true)}
                     className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
                   >
                     S'inscrire à la liste d'attente &rarr;
                   </button>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* SECTION C: FAQ DYNAMIQUE */}
      <section className="space-y-12 max-w-3xl mx-auto pt-12">
        <div className="text-center space-y-4 mb-10">
          <h3 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter">Questions Fréquentes</h3>
          <div className="w-12 h-1 bg-indigo-600 mx-auto"></div>
        </div>
        
        <div className="space-y-4">
          {FAQ_ITEMS.map((item, index) => (
            <div key={index} className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
              <button 
                onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                className="w-full flex items-center justify-between px-6 py-5 text-left transition-colors hover:bg-slate-50"
              >
                <span className="text-sm font-black uppercase tracking-tight text-slate-900">{item.question}</span>
                <span className={`text-indigo-600 transition-transform duration-300 font-black ${openFaqIndex === index ? 'rotate-45' : ''}`}>+</span>
              </button>
              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${openFaqIndex === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-6 pb-6 text-xs text-slate-500 italic font-medium leading-relaxed">
                  {item.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MODAL WAITLIST */}
      {showWaitlist && (
        <div className="fixed inset-0 z-[1000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
           <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 md:p-12 text-center space-y-8 relative shadow-2xl">
              <button onClick={() => setShowWaitlist(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 text-2xl">✕</button>
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-4xl mx-auto shadow-inner">🚀</div>
              <div className="space-y-2">
                <h4 className="text-2xl font-black uppercase tracking-tighter">Accès Prioritaire</h4>
                <p className="text-slate-500 text-xs font-medium italic">Soyez le premier informé du lancement et bénéficiez du tarif Early Bird.</p>
              </div>
              <form onSubmit={handleWaitlistSubmit} className="space-y-4">
                 <input 
                   type="email" required 
                   className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-sm font-medium outline-none focus:ring-2 ring-indigo-500"
                   placeholder="votre@email.com"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                 />
                 <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl">
                   Valider mon inscription &rarr;
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

const GuideCard = ({ icon, title, price, description, link, isFeatured = false, purchased = false }: { icon: string, title: string, price: string, description: string, link: string, isFeatured?: boolean, purchased?: boolean }) => (
  <div className={`bg-white rounded-[2.5rem] p-8 border transition-all duration-500 flex flex-col hover:shadow-2xl hover:-translate-y-2 ${isFeatured ? 'border-indigo-400 shadow-xl ring-4 ring-indigo-500/5' : 'border-slate-100 shadow-sm'}`}>
    <div className="flex justify-between items-start mb-6">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner border ${purchased ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>{purchased ? '✅' : icon}</div>
      <div className={`${purchased ? 'bg-emerald-500' : 'bg-slate-900'} text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest`}>{purchased ? 'ACQUIS' : 'E-BOOK'}</div>
    </div>
    <h4 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tighter">{title}</h4>
    <p className="text-slate-500 text-xs font-medium mb-8 flex-1 italic leading-relaxed">"{description}"</p>
    <div className="pt-6 border-t border-slate-50 flex items-end justify-between">
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{purchased ? 'Statut' : 'Prix Fixe'}</p>
        <p className={`text-2xl font-black ${purchased ? 'text-emerald-500' : 'text-slate-900'}`}>{purchased ? 'Débloqué' : price}</p>
      </div>
      <button 
        onClick={() => !purchased && window.open(link, '_blank')}
        className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
          purchased 
            ? 'bg-emerald-500 text-white cursor-default' 
            : (isFeatured ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-slate-900' : 'bg-slate-900 text-white hover:bg-indigo-600')
        }`}
      >
        {purchased ? 'Accéder au Guide' : 'Accès Immédiat'}
      </button>
    </div>
  </div>
);
