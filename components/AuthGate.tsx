
import React, { useState } from 'react';
import { AuthService } from '../services/storage';
import { configDiagnostic } from '../services/supabase';
import { UserProfile } from '../types';

interface AuthGateProps {
  onAuthenticated: (user: UserProfile) => void;
  onCancel: () => void;
  defaultView?: 'signup' | 'login';
}

export const AuthGate: React.FC<AuthGateProps> = ({ onAuthenticated, onCancel, defaultView = 'signup' }) => {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'signup' | 'login'>(defaultView);
  const [error, setError] = useState<string | null>(null);

  // Le SaaS est considéré comme configuré si une URL et une Clé minimale sont présentes
  const isConfigMissing = !configDiagnostic.hasUrl || !configDiagnostic.hasKey;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password || (view === 'signup' && !firstName)) {
        setError("Veuillez remplir tous les champs.");
        return;
    }
    
    setLoading(true);
    try {
      let user: UserProfile;
      if (view === 'signup') {
          user = await AuthService.register(cleanEmail, password, firstName);
      } else {
          user = await AuthService.login(cleanEmail, password);
      }
      onAuthenticated(user);
    } catch (err: any) {
      console.error("Auth Error:", err);
      // Traduction des erreurs courantes de Supabase
      let msg = err.message;
      if (msg === 'Failed to fetch') msg = "Erreur de connexion : Impossible de joindre le serveur Supabase. Vérifiez l'URL dans services/supabase.ts";
      if (msg.includes('Invalid login credentials')) msg = "Email ou mot de passe incorrect.";
      if (msg.includes('User already registered')) msg = "Cet email est déjà utilisé.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="max-w-md w-full bg-white rounded-[2rem] border border-slate-100 shadow-2xl overflow-hidden relative">
        <button onClick={onCancel} className="absolute top-5 right-5 text-slate-300 hover:text-slate-900 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        <div className="p-8 md:p-10">
          <div className="text-center mb-8">
            <div className={`w-12 h-12 ${isConfigMissing ? 'bg-amber-50' : 'bg-indigo-50'} rounded-xl flex items-center justify-center text-xl mx-auto mb-4`}>
              {isConfigMissing ? '🛠️' : '🔒'}
            </div>
            <h2 className="text-2xl font-semibold tracking-tighter text-slate-900 mb-2">
              {isConfigMissing ? 'Configuration SaaS' : (view === 'signup' ? 'Créer un Compte' : 'Connexion Client')}
            </h2>
            <p className="text-slate-500 text-xs font-medium italic">
              {isConfigMissing 
                ? "Vérifiez vos clés API dans 'services/supabase.ts'." 
                : (view === 'signup' ? "Accédez à vos audits et votre cockpit stratégique." : "Retrouvez vos rapports personnalisés.")}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest p-4 rounded-xl border border-red-100 mb-6 animate-fade-in leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {view === 'signup' && (
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Prénom</label>
                <input
                  type="text" required
                  className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium focus:ring-2 ring-indigo-500 outline-none transition-all"
                  placeholder="Votre prénom"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={loading}
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email</label>
              <input
                type="email" required
                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium focus:ring-2 ring-indigo-500 outline-none transition-all"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Mot de passe</label>
              <input
                type="password" required
                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium focus:ring-2 ring-indigo-500 outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] py-4 rounded-xl shadow-lg hover:bg-indigo-600 transition-all disabled:opacity-70 mt-4 active:scale-95"
            >
              {loading ? "Chargement..." : (view === 'signup' ? 'Créer mon compte' : 'Connexion')}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-slate-50 space-y-4">
            <button onClick={() => { setView(view === 'signup' ? 'login' : 'signup'); setError(null); }} className="text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:underline block mx-auto">
              {view === 'signup' ? "Déjà membre ? Se connecter" : "Nouveau ? Créer un compte"}
            </button>
          </div>

          {isConfigMissing && (
            <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
               <p className="text-[9px] text-amber-800 font-bold uppercase text-center">Note : Les clés ne semblent pas détectées. Vérifiez le fichier services/supabase.ts</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
