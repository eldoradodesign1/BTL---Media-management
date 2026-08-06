import React from 'react';
import { useApp } from '../../context/AppContext';
import { Keyboard, X, Mouse, Command } from 'lucide-react';
import { DEFAULT_SHORTCUT_ACTIONS } from '../../types';

export const ShortcutsModal: React.FC = () => {
  const { isShortcutsModalOpen, setIsShortcutsModalOpen, getUserShortcutKeys, currentUser } = useApp();

  if (!isShortcutsModalOpen) return null;

  const dynamicShortcuts = DEFAULT_SHORTCUT_ACTIONS.map((action) => ({
    key: getUserShortcutKeys(action.actionId),
    desc: `${action.label} — ${action.description}`,
  }));

  const standardInteractions = [
    { key: 'Double-Clic', desc: 'Éditer directement une cellule de tableau ou un montant' },
    { key: 'Entrée', desc: 'Valider l\'édition de la cellule en cours' },
    { key: 'Échap', desc: 'Fermer les modals ou annuler l\'édition en cours' },
  ];

  const mouseShortcuts = [
    { key: 'Molette de souris sur un chiffre', desc: 'Incrémenter / Décrémenter de +1 / -1' },
    { key: 'Shift + Molette de souris', desc: 'Ajuster les montants par pas de 10' },
    { key: 'Alt + Molette de souris', desc: 'Ajuster les montants avec précision de 0.1' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-xl bg-slate-900/90 border border-white/20 rounded-2xl shadow-2xl p-6 text-slate-100 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setIsShortcutsModalOpen(false)}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Keyboard className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Raccourcis Clavier & Interactions</h2>
            <p className="text-xs text-slate-400">
              Raccourcis personnalisés pour <strong className="text-cyan-300">{currentUser?.name}</strong>
            </p>
          </div>
        </div>

        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-3">
              <Command className="w-4 h-4" />
              <span>Vos Raccourcis Clavier Activés</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {dynamicShortcuts.map((sc, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/5 hover:border-white/10">
                  <span className="text-xs text-slate-300 font-medium">{sc.desc}</span>
                  <kbd className="px-2 py-1 bg-black/40 border border-white/20 rounded text-xs font-mono text-cyan-300 font-bold shadow-inner shrink-0">
                    {sc.key}
                  </kbd>
                </div>
              ))}
              {standardInteractions.map((sc, i) => (
                <div key={`std-${i}`} className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/5 hover:border-white/10">
                  <span className="text-xs text-slate-300">{sc.desc}</span>
                  <kbd className="px-2 py-1 bg-black/40 border border-white/20 rounded text-xs font-mono text-slate-300 font-semibold shadow-inner shrink-0">
                    {sc.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-3">
              <Mouse className="w-4 h-4" />
              <span>Molette de Souris & Saisie Numérique</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {mouseShortcuts.map((sc, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/5 hover:border-white/10">
                  <span className="text-xs text-slate-300">{sc.desc}</span>
                  <kbd className="px-2 py-1 bg-black/40 border border-white/20 rounded text-xs font-mono text-emerald-300 font-semibold shadow-inner shrink-0">
                    {sc.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <button
            onClick={() => setIsShortcutsModalOpen(false)}
            className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/20"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
