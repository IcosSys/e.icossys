"use client";

import { useState, useMemo } from "react";
import { useAdmin } from "@/context/AdminContext";
import { ALL_COUNTRIES } from "@/lib/countries";
import { CARRIER_PRESETS, getCountriesForCarrier } from "@/lib/carriers";

export default function PaysPage() {
  const { stripeStatus, shippingLoaded, selectedCountries, setSelectedCountries, countriesLoaded } = useAdmin();
  const [countriesSaving, setCountriesSaving] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

  const filteredCountryList = useMemo(() => {
    const q = countrySearch.toLowerCase().trim();
    if (!q) return ALL_COUNTRIES;
    return ALL_COUNTRIES.filter(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
  }, [countrySearch]);

  if (!stripeStatus?.connected) return null;

  const toggleCountry = (code: string) => {
    setSelectedCountries(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const selectAllCountries = () => {
    const q = countrySearch.toLowerCase().trim();
    const filtered = q ? ALL_COUNTRIES.filter(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)) : ALL_COUNTRIES;
    setSelectedCountries(prev => {
      const set = new Set(prev);
      for (const c of filtered) set.add(c.code);
      return Array.from(set);
    });
  };

  const deselectAllCountries = () => {
    const q = countrySearch.toLowerCase().trim();
    const filtered = q ? ALL_COUNTRIES.filter(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)) : ALL_COUNTRIES;
    const removeSet = new Set(filtered.map(c => c.code));
    setSelectedCountries(prev => prev.filter(c => !removeSet.has(c)));
  };

  const saveCountries = async () => {
    if (selectedCountries.length === 0) { alert("Sélectionnez au moins un pays."); return; }
    setCountriesSaving(true);
    try {
      const res = await fetch("/api/countries", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countries: selectedCountries }),
      });
      if (!res.ok) { alert((await res.json()).error || "Erreur"); return; }
      const d = await (await fetch("/api/countries")).json();
      setSelectedCountries(d.countries || []);
    } catch { alert("Erreur de connexion."); }
    finally { setCountriesSaving(false); }
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-2.5 px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">Pays de livraison</h2>
          {countriesLoaded && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{selectedCountries.length} pays</span>
          )}
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200/60 p-4 sm:p-5">
        <p className="text-[11px] text-gray-400 mb-3">Sélectionnez les pays dans lesquels vous proposez la livraison.</p>
        {/* Carrier quick-select chips */}
        {shippingLoaded && (
          <div className="mb-4">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Sélection rapide par transporteur</p>
            <div className="flex flex-wrap gap-2">
              {CARRIER_PRESETS.map(carrier => {
                const carrierCountries = getCountriesForCarrier(carrier.id);
                const allSelected = carrierCountries.length > 0 && carrierCountries.every(c => selectedCountries.includes(c));
                return (
                  <button
                    key={carrier.id}
                    onClick={() => {
                      if (allSelected) {
                        const removeSet = new Set(carrierCountries);
                        setSelectedCountries(prev => prev.filter(c => !removeSet.has(c)));
                      } else {
                        setSelectedCountries(prev => {
                          const set = new Set(prev);
                          for (const cc of carrierCountries) set.add(cc);
                          return Array.from(set);
                        });
                      }
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all border ${allSelected ? `${carrier.color} text-white border-transparent` : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}
                  >
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${allSelected ? "bg-white/40" : carrier.color}`} />
                    {carrier.name}
                    <span className="text-[10px] font-normal opacity-70">{carrierCountries.length}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {!countriesLoaded ? (
          <div className="space-y-2 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="h-8 bg-gray-100 rounded-lg" />)}
          </div>
        ) : (
          <>
            <div className="relative mb-3">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
              <input
                type="text"
                placeholder="Rechercher un pays..."
                value={countrySearch}
                onChange={e => setCountrySearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
              />
            </div>
            <div className="flex items-center gap-2 mb-3">
              <button onClick={selectAllCountries} className="text-[11px] font-semibold text-violet-600 hover:text-violet-700 px-3 py-1.5 rounded-lg hover:bg-violet-50 transition-colors">
                Tout sélectionner
              </button>
              <span className="text-gray-300">·</span>
              <button onClick={deselectAllCountries} className="text-[11px] font-semibold text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                Tout désélectionner
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 max-h-64 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-200">
              {filteredCountryList.map(country => {
                const checked = selectedCountries.includes(country.code);
                return (
                  <label key={country.code} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm ${checked ? "bg-violet-50 text-violet-900" : "hover:bg-gray-50 text-gray-700"}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCountry(country.code)}
                      className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500/20 accent-violet-600"
                    />
                    <span className="font-medium">{country.name}</span>
                    <span className="text-[10px] text-gray-400 font-mono ml-auto">{country.code}</span>
                  </label>
                );
              })}
              {filteredCountryList.length === 0 && (
                <div className="col-span-full text-center text-xs text-gray-400 py-4">Aucun pays trouvé.</div>
              )}
            </div>
            <div className="flex items-center justify-end mt-4 pt-3 border-t border-gray-100">
              <button onClick={saveCountries} disabled={countriesSaving || selectedCountries.length === 0}
                className="px-5 py-2 bg-violet-600 text-white text-xs font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-40 transition-colors min-h-[38px]">
                {countriesSaving ? "Sauvegarde..." : "Sauvegarder"}
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}