"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Footer() {
  const t = useTranslations();

  return (
    <footer className="border-t border-gray-100 bg-gray-50/50 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gray-900 flex items-center justify-center">
            <span className="text-white text-[8px] font-bold">eI</span>
          </div>
          <span className="text-xs text-gray-400">e.IcosSys</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
          <Link href="/conditions" className="text-[11px] text-gray-300 hover:text-gray-500 transition-colors">{t("footer.conditions")}</Link>
          <Link href="/retours" className="text-[11px] text-gray-300 hover:text-gray-500 transition-colors">{t("footer.returns")}</Link>
          <Link href="/mentions-legales" className="text-[11px] text-gray-300 hover:text-gray-500 transition-colors">{t("footer.legalNotices")}</Link>
          <span className="text-[11px] text-gray-200">·</span>
          <p className="text-[11px] text-gray-300">{t("footer.securePayment")}</p>
        </div>
      </div>
    </footer>
  );
}