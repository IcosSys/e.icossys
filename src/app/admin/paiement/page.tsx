"use client";

import { useState } from "react";
import { useAdmin } from "@/context/AdminContext";
import type { StripeMode } from "@/types/admin";

export default function PaiementPage() {
  const {
    stripeStatus, loading, editingKey, setEditingKey,
    keyInput, setKeyInput, saving,
    keyError, setKeyError, keySuccess, setKeySuccess,
    handleSaveKey, handleDisconnect, handleSwitchMode, detectedMode,
    webhookConfigured, webhookHint, setWebhookHint,
  } = useAdmin();

  // Local webhook state (not shared across pages)
  const [webhookInput, setWebhookInput] = useState("");
  const [webhookSaving, setWebhookSaving] = useState(false);
  const [webhookSuccess, setWebhookSuccess] = useState(false);
  const [webhookError, setWebhookError] = useState("");
  const [switching, setSwitching] = useState(false);

  const isTest = stripeStatus?.mode === "test";
  const canSwitch = stripeStatus?.testKey && stripeStatus?.liveKey;

  const handleSaveWebhook = async () => {
    const trimmed = webhookInput.trim();
    if (!trimmed) return;
    setWebhookSaving(true);
    setWebhookError("");
    setWebhookSuccess(false);
    try {
      const res = await fetch("/api/webhook/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setWebhookError(data.error || "Erreur");
      } else {
        setWebhookHint(data.hint);
        setWebhookInput("");
        setWebhookSuccess(true);
        setTimeout(() => setWebhookSuccess(false), 3000);
      }
    } catch {
      setWebhookError("Erreur réseau.");
    } finally {
      setWebhookSaving(false);
    }
  };

  const onSwitchMode = async (newMode: StripeMode) => {
    if (newMode === stripeStatus?.mode) return;
    setSwitching(true);
    await handleSwitchMode(newMode);
    setSwitching(false);
  };

  return (
    <>
      {/* STRIPE CONFIG */}
      <section>
        <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-2.5 px-1">Configuration Stripe</h2>
        <div className="bg-white rounded-2xl border border-gray-200/60 p-4 sm:p-5">
          <div className="flex items-start sm:items-center justify-between gap-3 mb-4 flex-col sm:flex-row">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stripeStatus?.connected ? "bg-emerald-100" : "bg-gray-100"}`}>
                {loading ? <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" /> : <svg className={`w-5 h-5 ${stripeStatus?.connected ? "text-emerald-600" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 text-sm">Connexion Stripe</span>
                  {loading ? null : stripeStatus?.connected ? (
                    <>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${isTest ? "bg-indigo-100 text-indigo-700" : "bg-emerald-100 text-emerald-700"}`}>{isTest ? "Test" : "Live"}</span>
                      <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />Connecté
                      </span>
                    </>
                  ) : <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-700">Non connecté</span>}
                </div>
                {stripeStatus?.connected && <p className="text-[10px] text-gray-400 mt-0.5 font-mono">sk_...{stripeStatus.lastFour}</p>}
              </div>
            </div>
            {stripeStatus?.connected && <button onClick={handleDisconnect} className="text-[11px] text-red-500 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">Déconnecter</button>}
          </div>
          {stripeStatus?.connected && !editingKey && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 mb-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-2.5 h-2.5 rounded-full ${isTest ? "bg-indigo-500" : "bg-emerald-500"}`} />
                <span className="text-sm text-gray-700 font-medium">Mode {isTest ? "Test" : "Production"}</span>
              </div>
              <button onClick={() => setEditingKey(true)} className="text-[11px] font-semibold text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">Changer</button>
            </div>
          )}
          {(editingKey || !stripeStatus?.connected) && (
            <form onSubmit={handleSaveKey} className="space-y-2">
              <input type="password" value={keyInput} onChange={e => { setKeyInput(e.target.value); setKeyError(""); setKeySuccess(false); }}
                placeholder="sk_test_... ou sk_live_..." autoFocus
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 min-h-[44px] bg-gray-50/50" />
              {detectedMode && <p className="text-[11px] font-semibold">{detectedMode === "test" ? <span className="text-indigo-600">Mode détecté : Test</span> : <span className="text-emerald-600">Mode détecté : Production</span>}</p>}
              {keyError && <p className="text-[11px] text-red-600 font-medium">{keyError}</p>}
              {keySuccess && <p className="text-[11px] text-emerald-600 font-medium">Clé validée et enregistrée.</p>}
              <div className="flex gap-2">
                <button type="submit" disabled={saving || !keyInput.trim()} className="px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 disabled:opacity-40 min-h-[44px]">{saving ? "Validation..." : "Enregistrer"}</button>
                {stripeStatus?.connected && <button type="button" onClick={() => { setEditingKey(false); setKeyInput(""); setKeyError(""); }} className="px-4 py-2.5 text-sm text-gray-500 font-medium">Annuler</button>}
              </div>
            </form>
          )}
          {stripeStatus?.connected && canSwitch && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold ${!isTest ? "text-gray-400" : "text-indigo-700"}`}>Test</span>
                  <button onClick={() => onSwitchMode(isTest ? "live" : "test")} disabled={switching}
                    className="relative w-11 h-6 rounded-full transition-colors focus:outline-none disabled:opacity-40"
                    style={{ backgroundColor: isTest ? "#6366f1" : "#10b981" }}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${!isTest ? "translate-x-5" : ""}`} />
                  </button>
                  <span className={`text-xs font-bold ${isTest ? "text-gray-400" : "text-emerald-700"}`}>Live</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* WEBHOOK CONFIG */}
      {stripeStatus?.connected && (
        <section>
          <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-2.5 px-1">Webhook Stripe</h2>
          <div className="bg-white rounded-2xl border border-gray-200/60 p-4 sm:p-5">
            <div className="flex items-start sm:items-center justify-between gap-3 mb-4 flex-col sm:flex-row">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${webhookConfigured ? "bg-emerald-100" : "bg-gray-100"}`}>
                  <svg className={`w-5 h-5 ${webhookConfigured ? "text-emerald-600" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 text-sm">Notifications temps réel</span>
                    {webhookConfigured ? (
                      <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />Configuré
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-700">Non configuré</span>
                    )}
                  </div>
                  {webhookConfigured && webhookHint && <p className="text-[10px] text-gray-400 mt-0.5 font-mono">whsec_...{webhookHint.replace("...", "")}</p>}
                </div>
              </div>
            </div>

            {!webhookConfigured && !webhookInput && (
              <form onSubmit={e => { e.preventDefault(); handleSaveWebhook(); }} className="space-y-2">
                <input type="password" value={webhookInput} onChange={e => { setWebhookInput(e.target.value); setWebhookError(""); setWebhookSuccess(false); }}
                  placeholder="whsec_..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 min-h-[44px] bg-gray-50/50" />
                {webhookError && <p className="text-[11px] text-red-600 font-medium">{webhookError}</p>}
                {webhookSuccess && <p className="text-[11px] text-emerald-600 font-medium">Secret webhook enregistré.</p>}
                <button type="submit" disabled={webhookSaving || !webhookInput.trim()}
                  className="px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 disabled:opacity-40 min-h-[44px]">
                  {webhookSaving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </form>
            )}

            {webhookConfigured && !webhookInput && (
              <button onClick={() => { setWebhookInput(" "); setWebhookSuccess(false); setWebhookError(""); }}
                className="text-[11px] font-semibold text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                Modifier le secret
              </button>
            )}

            {webhookInput && (
              <form onSubmit={e => { e.preventDefault(); handleSaveWebhook(); }} className="space-y-2">
                <input type="password" value={webhookInput === " " ? "" : webhookInput} onChange={e => { setWebhookInput(e.target.value); setWebhookError(""); setWebhookSuccess(false); }}
                  placeholder="whsec_..." autoFocus
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 min-h-[44px] bg-gray-50/50" />
                {webhookError && <p className="text-[11px] text-red-600 font-medium">{webhookError}</p>}
                {webhookSuccess && <p className="text-[11px] text-emerald-600 font-medium">Secret webhook mis à jour.</p>}
                <div className="flex gap-2">
                  <button type="submit" disabled={webhookSaving || !webhookInput.trim()}
                    className="px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 disabled:opacity-40 min-h-[44px]">
                    {webhookSaving ? "Enregistrement..." : "Enregistrer"}
                  </button>
                  <button type="button" onClick={() => { setWebhookInput(""); setWebhookError(""); setWebhookSuccess(false); }}
                    className="px-4 py-2.5 text-sm text-gray-500 font-medium">Annuler</button>
                </div>
              </form>
            )}

            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Pour activer les notifications en temps réel, configurez un webhook dans votre <span className="font-medium text-gray-600">Dashboard Stripe</span> :<br />
                <span className="font-mono text-[10px] text-gray-500 mt-1 inline-block">URL : {typeof window !== "undefined" ? `${window.location.origin}/api/webhook/stripe` : "..."}</span><br />
                <span className="font-mono text-[10px] text-gray-500">Événement : <span className="text-gray-700 font-semibold">checkout.session.completed</span></span>
              </p>
            </div>
          </div>
        </section>
      )}
    </>
  );
}