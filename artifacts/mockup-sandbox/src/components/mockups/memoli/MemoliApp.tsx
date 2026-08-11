import { useState } from "react";
import { Settings, Globe, ChevronRight } from "lucide-react";
import { MemoliWebsite } from "./MemoliWebsite";
import { MemoliAdmin } from "./MemoliAdmin";

export function MemoliApp() {
  const [view, setView] = useState<"website" | "admin">("website");

  return (
    <div className="relative min-h-screen">
      {/* Active view */}
      <div key={view} className="animate-in fade-in duration-300">
        {view === "website" ? <MemoliWebsite /> : <MemoliAdmin />}
      </div>

      {/* Floating switch button */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100]">
        <div className="flex items-center bg-[#1A0A00] border border-[#E67E22]/40 rounded-full shadow-2xl shadow-black/60 overflow-hidden">
          <button
            onClick={() => setView("website")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold transition-all duration-200 ${
              view === "website"
                ? "bg-[#C0392B] text-white"
                : "text-[#A0886A] hover:text-white"
            }`}
          >
            <Globe className="w-4 h-4" />
            Website
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-[#E67E22]/30" />

          <button
            onClick={() => setView("admin")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold transition-all duration-200 ${
              view === "admin"
                ? "bg-[#C0392B] text-white"
                : "text-[#A0886A] hover:text-white"
            }`}
          >
            <Settings className="w-4 h-4" />
            Beheer
          </button>

          {/* Current indicator */}
          <div className="flex items-center gap-1.5 px-3 border-l border-[#E67E22]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E67E22] animate-pulse" />
            <span className="text-[10px] text-[#A0886A] font-medium uppercase tracking-wider">
              {view === "website" ? "Live" : "Admin"}
            </span>
            <ChevronRight className="w-3 h-3 text-[#A0886A]" />
          </div>
        </div>
      </div>
    </div>
  );
}
