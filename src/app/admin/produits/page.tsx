"use client";

import { useState, useEffect, useCallback } from "react";
import { PackageIcon, XIcon } from "@/components/admin/Icons";
import type { AdminProduct } from "@/types/admin";

export default function ProduitsPage() {
  const [adminProducts, setAdminProducts] = useState<AdminProduct[]>([]);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [productFormName, setProductFormName] = useState("");
  const [productFormPrice, setProductFormPrice] = useState("");
  const [productFormDesc, setProductFormDesc] = useState("");
  const [productFormMainImg, setProductFormMainImg] = useState("");
  const [productFormImgs, setProductFormImgs] = useState<string[]>([""]);
  const [productSaving, setProductSaving] = useState(false);
  const [productError, setProductError] = useState("");

  const fetchAdminProducts = useCallback(() => {
    fetch("/api/products?admin=all").then(r => r.json()).then(d => {
      setAdminProducts(d.products || d.allProducts || []);
      setProductsLoaded(true);
    }).catch(() => { setProductsLoaded(true); });
  }, []);

  useEffect(() => { fetchAdminProducts(); }, [fetchAdminProducts]);

  const openProductForm = (product?: AdminProduct) => {
    setProductError("");
    if (product) {
      setEditingProduct(product);
      setProductFormName(product.name);
      setProductFormPrice(String(product.price / 100));
      setProductFormDesc(product.description);
      setProductFormMainImg(product.mainImage);
      setProductFormImgs(product.images.length > 0 ? product.images : [""]);
    } else {
      setEditingProduct(null);
      setProductFormName("");
      setProductFormPrice("");
      setProductFormDesc("");
      setProductFormMainImg("");
      setProductFormImgs([""]);
    }
    setShowProductForm(true);
  };

  const handleSaveProduct = async () => {
    if (!productFormName.trim()) { setProductError("Le nom est requis."); return; }
    const priceCents = Math.round(parseFloat(productFormPrice) * 100);
    if (!priceCents || priceCents <= 0) { setProductError("Le prix doit être supérieur à 0."); return; }

    setProductSaving(true);
    setProductError("");
    try {
      const payload = {
        name: productFormName.trim(),
        price: priceCents,
        description: productFormDesc.trim(),
        mainImage: productFormMainImg.trim(),
        images: productFormImgs.map(u => u.trim()).filter(Boolean),
      };

      let res: Response;
      if (editingProduct) {
        res = await fetch(`/api/products/${editingProduct.id}`, {
          method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/products", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (res.ok) {
        setAdminProducts(data.products || adminProducts);
        setShowProductForm(false);
        fetchAdminProducts();
      } else {
        setProductError(data.error || "Erreur");
      }
    } catch { setProductError("Erreur de connexion."); }
    finally { setProductSaving(false); }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Supprimer ce produit ?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        const data = await res.json();
        setAdminProducts(data.products || []);
      } else alert((await res.json()).error || "Erreur");
    } catch { alert("Erreur de connexion."); }
  };

  const handleToggleProduct = async (product: AdminProduct) => {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !product.active }),
      });
      if (res.ok) {
        const data = await res.json();
        setAdminProducts(data.products || []);
      }
    } catch {}
  };

  const addImageField = () => setProductFormImgs(prev => [...prev, ""]);
  const removeImageField = (idx: number) => setProductFormImgs(prev => prev.filter((_, i) => i !== idx));
  const updateImageField = (idx: number, val: string) => setProductFormImgs(prev => prev.map((v, i) => i === idx ? val : v));

  const activeProductCount = adminProducts.filter(p => p.active).length;

  return (
    <section>
      <div className="flex items-center justify-between mb-2.5 px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">Produits</h2>
          {productsLoaded && adminProducts.length > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{activeProductCount} actif{activeProductCount > 1 ? "s" : ""}</span>
          )}
        </div>
        <button
          onClick={() => openProductForm()}
          className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Ajouter
        </button>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200/60 p-4 sm:p-5">
        {!productsLoaded ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-14 h-14 rounded-xl bg-gray-100" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-100 rounded-lg w-1/3" />
                  <div className="h-3 bg-gray-100 rounded-lg w-1/5" />
                </div>
              </div>
            ))}
          </div>
        ) : adminProducts.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
              <PackageIcon className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-sm text-gray-500 mb-1">Aucun produit</p>
            <p className="text-[11px] text-gray-400 mb-4">Ajoutez votre premier produit pour commencer à vendre.</p>
            <button onClick={() => openProductForm()} className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
              + Ajouter un produit
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {adminProducts.map(p => (
              <div key={p.id} className={`rounded-xl border p-3 sm:p-4 transition-colors ${p.active ? "border-gray-200 bg-white" : "border-gray-100 bg-gray-50/50 opacity-60"}`}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                      {p.mainImage ? (
                        <img src={p.mainImage} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <PackageIcon className="w-5 h-5 text-gray-200" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900 truncate">{p.name}</span>
                        {!p.active && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-200 text-gray-500 uppercase">Inactif</span>}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-sm font-bold text-gray-900">{new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(p.price / 100)}</span>
                        {p.images.length > 0 && <span className="text-[10px] text-gray-400">{p.images.length + 1} photo{p.images.length > 0 ? "s" : ""}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 sm:ml-0">
                    <button onClick={() => handleToggleProduct(p)}
                      className="relative w-10 h-[22px] rounded-full transition-colors flex-shrink-0 focus:outline-none"
                      style={{ backgroundColor: p.active ? "#2563eb" : "#d1d5db" }}>
                      <span className={`absolute top-[3px] left-[3px] w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${p.active ? "translate-x-[18px]" : ""}`} />
                    </button>
                    <button onClick={() => openProductForm(p)}
                      className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-blue-600 hover:bg-blue-50 transition-colors min-h-[44px] sm:min-h-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                    </button>
                    <button onClick={() => handleDeleteProduct(p.id)}
                      className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors min-h-[44px] sm:min-h-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Product Form Modal */}
        {showProductForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowProductForm(false)}>
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
            <div
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto animate-slide-up"
              onClick={e => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-gray-100 px-5 py-4 flex items-center justify-between z-10">
                <h3 className="text-sm font-bold text-gray-900">{editingProduct ? "Modifier le produit" : "Nouveau produit"}</h3>
                <button onClick={() => setShowProductForm(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                  <XIcon />
                </button>
              </div>
              <div className="p-5 space-y-4">
                {productError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-xs text-red-600 font-medium">{productError}</div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nom du produit *</label>
                  <input
                    type="text" value={productFormName} onChange={e => { setProductFormName(e.target.value); setProductError(""); }}
                    placeholder="Ex: T-shirt Premium"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-gray-50/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Prix (EUR) *</label>
                  <input
                    type="number" step="0.01" min="0.01" value={productFormPrice} onChange={e => { setProductFormPrice(e.target.value); setProductError(""); }}
                    placeholder="29.99"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-gray-50/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
                  <textarea
                    value={productFormDesc} onChange={e => setProductFormDesc(e.target.value)}
                    placeholder="Description détaillée du produit..."
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-gray-50/50 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Image principale (URL)</label>
                  <input
                    type="url" value={productFormMainImg} onChange={e => setProductFormMainImg(e.target.value)}
                    placeholder="https://exemple.com/image.jpg"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-gray-50/50"
                  />
                  {productFormMainImg && (
                    <div className="mt-2 w-20 h-20 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden">
                      <img src={productFormMainImg} alt="Aperçu" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Images supplémentaires</label>
                    <button onClick={addImageField} className="text-[10px] font-semibold text-blue-600 hover:text-blue-700">+ Ajouter</button>
                  </div>
                  <div className="space-y-2">
                    {productFormImgs.map((img, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="url" value={img} onChange={e => updateImageField(idx, e.target.value)}
                          placeholder="https://exemple.com/photo.jpg"
                          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-gray-50/50"
                        />
                        {productFormImgs.length > 1 && (
                          <button onClick={() => removeImageField(idx)} className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0">
                            <XIcon className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 px-5 py-4 flex items-center justify-end gap-2">
                <button onClick={() => setShowProductForm(false)} className="px-4 py-2.5 text-sm text-gray-500 font-medium hover:text-gray-900 transition-colors">
                  Annuler
                </button>
                <button onClick={handleSaveProduct} disabled={productSaving}
                  className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors min-h-[44px] flex items-center gap-2">
                  {productSaving ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sauvegarde...</>
                  ) : (
                    editingProduct ? "Mettre à jour" : "Créer le produit"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}