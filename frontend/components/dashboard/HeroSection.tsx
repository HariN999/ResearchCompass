import * as React from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "../ui/Button";

export interface HeroSectionProps {
  onPrimaryClick: () => void;
  onSecondaryClick: () => void;
}

export function HeroSection({ onPrimaryClick, onSecondaryClick }: HeroSectionProps): JSX.Element {
  return (
    <div className="text-left space-y-6 max-w-3xl py-4 select-none">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-caption font-semibold text-primary">
        <Sparkles className="h-3 w-3 animate-pulse text-primary" />
        AI Research Intelligence Platform
      </span>

      <h1 className="text-heading-xl md:text-[40px] font-extrabold tracking-tight leading-tight text-text-primary">
        Critique Academic Literature & <br />
        <span className="bg-gradient-to-r from-primary via-indigo-500 to-indigo-600 bg-clip-text text-transparent">
          Accelerate Discovery
        </span>
      </h1>

      <p className="text-body text-text-secondary leading-relaxed max-w-2xl">
        ResearchCompass runs your manuscripts and papers through a structured, multi-document critique pipeline. 
        Extract methodology matrices, synthesize literature reviews, detect unaddressed technical gaps, and generate code-level baseline improvements instantly.
      </p>

      <div className="flex flex-wrap gap-4 pt-2">
        <Button onClick={onPrimaryClick} className="shadow-dropdown flex items-center gap-2">
          Upload Research Papers <ArrowRight className="h-4 w-4" />
        </Button>
        <Button onClick={onSecondaryClick} variant="outline">
          Open Library
        </Button>
      </div>
    </div>
  );
}
