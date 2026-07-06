"use client";

type SectionVariant = "default" | "success" | "warning" | "danger";

interface SectionBlockProps {
  title: string;
  content?: string;
  items?: string[];
  variant?: SectionVariant;
}

const variantClasses: Record<SectionVariant, { border: string; dot: string; title: string }> = {
  default: {
    border: "border-l-4 border-indigo-500",
    dot: "bg-indigo-500",
    title: "text-indigo-600 dark:text-indigo-400",
  },
  success: {
    border: "border-l-4 border-emerald-500",
    dot: "bg-emerald-500",
    title: "text-emerald-600 dark:text-emerald-400",
  },
  warning: {
    border: "border-l-4 border-amber-500",
    dot: "bg-amber-500",
    title: "text-amber-600 dark:text-amber-400",
  },
  danger: {
    border: "border-l-4 border-red-500",
    dot: "bg-red-500",
    title: "text-red-600 dark:text-red-400",
  },
};

export function SectionBlock({ title, content, items, variant = "default" }: SectionBlockProps): JSX.Element {
  const styles = variantClasses[variant];

  return (
    <div className={`rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 dark:border-gray-800/60 dark:bg-gray-900/10 hover:shadow-md ${styles.border}`}>
      <h3 className={`text-sm font-semibold tracking-wide uppercase ${styles.title}`}>
        {title}
      </h3>

      <div className="mt-4 min-w-0">
        {content ? (
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            {content}
          </p>
        ) : null}

        {items && items.length > 0 ? (
          <ul className="space-y-3">
            {items.map((item, index) => (
              <li
                key={`${item}-${index}`}
                className="flex items-start gap-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300"
              >
                {/* Custom dot icon indicator */}
                <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${styles.dot}`} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
