type SectionVariant = "default" | "success" | "warning" | "danger";

interface SectionBlockProps {
  title: string;
  content?: string;
  items?: string[];
  variant?: SectionVariant;
}

const accentClasses: Record<SectionVariant, string> = {
  default: "border-indigo-500",
  success: "border-emerald-500",
  warning: "border-amber-500",
  danger: "border-red-500",
};

export function SectionBlock({ title, content, items, variant = "default" }: SectionBlockProps): JSX.Element {
  return (
    <section className="border-t border-gray-200 py-7 dark:border-gray-800 md:grid md:grid-cols-[220px_1fr] md:gap-8">
      <div className={`mb-4 border-l-2 pl-3 md:mb-0 ${accentClasses[variant]}`}>
        <h2 className="text-sm font-medium text-gray-900 dark:text-white">{title}</h2>
      </div>

      <div className="min-w-0">
        {content ? <p className="text-sm leading-7 text-gray-500 dark:text-gray-400">{content}</p> : null}

        {items ? (
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item}
                className="border-l border-gray-200 pl-4 text-sm leading-7 text-gray-500 transition-all duration-150 hover:border-indigo-500 hover:text-gray-900 dark:border-gray-800 dark:text-gray-400 dark:hover:border-indigo-500 dark:hover:text-gray-200"
              >
                {item}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
