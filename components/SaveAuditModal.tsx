
import React, { useState } from 'react';

interface SaveAuditModalProps {
  onSave: (name: string) => void;
  onCancel: () => void;
  initialName?: string;
  loading?: boolean;
  isGuest?: boolean;
}

export const SaveAuditModal: React.FC<SaveAuditModalProps> = ({ onSave, onCancel, initialName = '', loading = false, isGuest = false }) => {
  const [name, setName] = useState(initialName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && !loading) {
      onSave(name);
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
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-xl mx-auto mb-4">📂</div>
            <h2 className="text-2xl font-semibold tracking-tighter text-slate-900 mb-2">
              Enregistrer l'Audit
            </h2>
            <p className="text-slate-500 text-xs font-medium italic">
              Donnez un nom à ce diagnostic pour le retrouver dans votre espace membre.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nom du Projet</label>
              <input
                type="text" required
                className="block w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium focus:ring-2 ring-indigo-500 outline-none transition-all"
                placeholder="ex: Campagne Printemps 2026"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                disabled={loading}
              />
              {isGuest && (
                <p className="mt-3 text-[10px] font-medium text-indigo-600 italic leading-relaxed">
                  Créez votre compte gratuit en 30 secondes pour sauvegarder cet audit et accéder à vos recommandations personnalisées.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white font-bold text-xs uppercase tracking-widest py-4 rounded-xl shadow-lg hover:bg-indigo-600 transition-all mt-2 flex items-center justify-center gap-3 disabled:opacity-70 active:scale-95"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>TRAITEMENT...</span>
                </>
              ) : (
                <>
                  <span>ENREGISTRER DANS MON ESPACE</span>
                  <span className="text-lg leading-none">&rarr;</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
