"use client";

import { motion } from "framer-motion";
import { 
  Globe, FileText, Search, Cpu, Award, 
  CheckCircle2, AlertTriangle, TrendingUp, Zap, 
  Settings, Compass, HelpCircle, LucideIcon 
} from "lucide-react";

type SectionVariant = "default" | "success" | "warning" | "danger";

interface SectionBlockProps {
  title: string;
  content?: string;
  items?: string[];
  variant?: SectionVariant;
}

const variantClasses: Record<SectionVariant, { border: string; dot: string; title: string }> = {
  default: {
    border: "border-l-4 border-indigo-500/80 hover:border-indigo-400",
    dot: "bg-indigo-500",
    title: "text-indigo-400",
  },
  success: {
    border: "border-l-4 border-emerald-500/80 hover:border-emerald-400",
    dot: "bg-emerald-500",
    title: "text-emerald-400",
  },
  warning: {
    border: "border-l-4 border-amber-500/80 hover:border-amber-400",
    dot: "bg-amber-500",
    title: "text-amber-400",
  },
  danger: {
    border: "border-l-4 border-red-500/80 hover:border-red-400",
    dot: "bg-red-500",
    title: "text-red-400",
  },
};

function getIconForTitle(title: string): LucideIcon {
  const t = title.toLowerCase();
  if (t.includes("domain")) return Globe;
  if (t.includes("summary")) return FileText;
  if (t.includes("problem")) return Search;
  if (t.includes("methodology")) return Cpu;
  if (t.includes("contributions")) return Award;
  if (t.includes("strengths")) return CheckCircle2;
  if (t.includes("weaknesses")) return AlertTriangle;
  if (t.includes("gaps")) return TrendingUp;
  if (t.includes("novelty")) return Zap;
  if (t.includes("improvements")) return Settings;
  if (t.includes("future")) return Compass;
  if (t.includes("questions") || t.includes("viva")) return HelpCircle;
  return FileText;
}

export function SectionBlock({ title, content, items, variant = "default" }: SectionBlockProps): JSX.Element {
  const styles = variantClasses[variant];
  const Icon = getIconForTitle(title);

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.005 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`rounded-2xl border border-white/10 bg-slate-900/20 p-6 shadow-xl backdrop-blur-xl transition-all duration-300 dark:bg-slate-900/10 hover:shadow-indigo-500/5 hover:border-white/15 ${styles.border}`}
    >
      <div className="flex items-center gap-3">
        <div className={`flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 border border-white/5 ${styles.title}`}>
          <Icon className="h-4 w-4" />
        </div>
        <h3 className={`text-sm font-bold tracking-wide uppercase ${styles.title}`}>
          {title}
        </h3>
      </div>

      <div className="mt-4 min-w-0">
        {content ? (
          <p className="text-sm leading-relaxed text-slate-300">
            {content}
          </p>
        ) : null}

        {items && items.length > 0 ? (
          <ul className="space-y-3">
            {items.map((item, index) => (
              <li
                key={`${item}-${index}`}
                className="flex items-start gap-3 text-sm leading-relaxed text-slate-350"
              >
                {/* Custom dot icon indicator */}
                <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${styles.dot}`} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </motion.div>
  );
}
