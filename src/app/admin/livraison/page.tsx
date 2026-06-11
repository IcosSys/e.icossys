"use client";

import { useState } from "react";
import { useAdmin } from "@/context/AdminContext";
import { CARRIER_PRESETS, getCountriesForCarrier, getCarrierPreset } from "@/lib/carriers";
import { slugify } from "@/lib/admin-utils";

export default function LivraisonPage() {
  const { stripeStatus, shippingOpts, setShippingOpts, shippingLoaded } = useAdmin();
  const [shippingSaving, setShippingSaving] = useState(false);

  const activeShipCount = shippingOpts.filter(o => o.active).length;

  const updateShipping = (idx: number, patch: Partial<typeof shippingOpts[number]>) => {
    setShippingOpts(prev => prev.map((o, i) => i === idx ? { ...o, ...patch } : o));
  };

  const addShipping = () => {
    const usedIds = new Set(shippingOpts.map(o => o.carrierId).filter(Boolean));
    const available = CARRIER_PRESETS.find(c => !usedIds.has(c.id));
    if (available) {
      setShippingOpts(prev => [...prev, {
        id: available.id, name: available.name, carrierId: available.id,
        price: 500, currency: "eur", active: true, minDays: 2, maxDays: 5,
      }]);
    } else {
      setShippingOpts(prev => [...prev, {
        id: `custom-${Date.now()}`, name: "Personnalisé", price: 500,
        currency: "eur", active: true, minDays: 2, maxDays: 5,
      }]);
    }
  };

  const handleCarrierSelect = (idx: number, carrierId: string) => {
    const preset = getCarrierPreset(carrierId);
    if (preset) {
      setShippingOpts(prev => prev.map((o, i) => i === idx ? {
        ...o, id: preset.id, name: preset.name, carrierId: preset.id, minDays: 3, maxDays: 7,
      } : o));
    } else {
      setShippingOpts(prev => prev.map((o, i) => i === idx ? {
        ...o, id: `custom-${Date.now()}`, name: "Personnalisé", carrierId: undefined,
      } : o));
    }
  };

  const removeShipping = (idx: number) => {
    if (shippingOpts.length <= 1) { alert("Au moins un mode de livraison est requis."); return; }
    setShippingOpts(prev => prev.filter((_, i) => i !== idx));
  };

  const saveShipping = async () => {
    setShippingSaving(true);
    try {
      const res = await fetch("/api/shipping/config", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ options: shippingOpts }),
      });
      if (!res.ok) { alert((await res.json()).error || "Erreur"); return; }
      await fetch("/api/shipping/config").then(r => r.json()).then(d => {
        setShippingOpts(d.options || []);
      });
    } catch { alert("Erreur de connexion."); }
    finally { setShippingSaving(false); }
  };

  if (!stripeStatus?.connected) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-2.5 px-1">
        <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">Modes de livraison</h2>
        {shippingLoaded && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">{activeShipCount} actif{activeShipCount > 1 ? "s" : ""}</span>
        )}
      </div>
      <div className="bg-white rounded-2xl border border-gray-200/60 p-4 sm:p-5">
        <p className="text-[11px] text-gray-400 mb-4">Activez ou désactivez les modes de livraison proposés au checkout. Modifiez les prix et délais.</p>
        <div className="space-y-3">
          {shippingOpts.map((opt, idx) => (
            <div key={opt.id} className={`rounded-xl border p-4 transition-colors ${opt.active ? "border-gray-200 bg-white" : "border-gray-100 bg-gray-50/50 opacity-60"}`}>
              <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                <div className="flex items-center gap-3 sm:flex-col sm:items-start">
                  <button onClick={() => updateShipping(idx, { active: !opt.active })}
                    className="relative w-10 h-[22px] rounded-full transition-colors flex-shrink-0 focus:outline-none"
                    style={{ backgroundColor: opt.active ? "#7c3aed" : "#d1d5db" }}>
                    <span className={`absolute top-[3px] left-[3px] w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${opt.active ? "translate-x-[18px]" : ""}`} />
                  </button>
                  <button onClick={() => removeShipping(idx)}
                    className="sm:mt-1 w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0 ml-auto sm:ml-0 min-h-[44px] sm:min-h-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                  </button>
                </div>
                <div className="flex-1 min-w-0 space-y-3">
                  {/* Carrier selector */}
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Transporteur</label>
                    <select
                      value={opt.carrierId || "custom"}
                      onChange={e => handleCarrierSelect(idx, e.target.value)}
                      className="w-full text-sm font-semibold text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 min-h-[44px] cursor-pointer"
                    >
                      <option value="custom">— Personnalisé — saisie libre</option>
                      {CARRIER_PRESETS.map(c => (
                        <option key={c.id} value={c.id}>{c.name} — {c.description}</option>
                      ))}
                    </select>
                    {opt.carrierId && (
                      <p className="text-[10px] text-gray-400 mt-1">{getCountriesForCarrier(opt.carrierId).length} pays couverts par défaut</p>
                    )}
                  </div>
                  {/* Name */}
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Intitulé</label>
                    <input type="text" value={opt.name} onChange={e => updateShipping(idx, { name: e.target.value, id: slugify(e.target.value) || opt.id })}
                      className="w-full text-sm font-semibold text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 min-h-[44px]" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Prix (EUR)</label>
                      <input type="number" step="0.01" min="0" value={(opt.price / 100).toFixed(2)} onChange={e => updateShipping(idx, { price: Math.round(parseFloat(e.target.value) * 100) || 0 })}
                        className="w-full text-sm font-semibold text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 min-h-[44px]" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Délai (jours ouvrés)</label>
                      <div className="flex items-center gap-2">
                        <input type="number" min="1" max="30" value={opt.minDays} onChange={e => updateShipping(idx, { minDays: parseInt(e.target.value) || 1 })}
                          className="flex-1 w-full text-sm font-semibold text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 min-h-[44px]" />
                        <span className="text-xs text-gray-400 font-medium">à</span>
                        <input type="number" min={opt.minDays} max="60" value={opt.maxDays} onChange={e => updateShipping(idx, { maxDays: Math.max(parseInt(e.target.value) || 1, opt.minDays) })}
                          className="flex-1 w-full text-sm font-semibold text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 min-h-[44px]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <button onClick={addShipping} className="text-[11px] font-semibold text-violet-600 hover:text-violet-700 px-3 py-1.5 rounded-lg hover:bg-violet-50 transition-colors">
            + Ajouter un mode
          </button>
          <button onClick={saveShipping} disabled={shippingSaving}
            className="px-5 py-2 bg-violet-600 text-white text-xs font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-40 transition-colors min-h-[38px]">
            {shippingSaving ? "Sauvegarde..." : "Sauvegarder"}
          </button>
        </div>
      </div>
    </section>
  );
}