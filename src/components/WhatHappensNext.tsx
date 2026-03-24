import { Search, Settings, Rocket } from "lucide-react";

const steps = [
  {
    icon: Search,
    number: 1,
    title: "Review",
    description: "Our team reviews your submission to ensure it meets our quality standards.",
  },
  {
    icon: Settings,
    number: 2,
    title: "Processing",
    description: "If approved, we may make minor edits for clarity and formatting.",
  },
  {
    icon: Rocket,
    number: 3,
    title: "Publish",
    description: "Once approved, your content goes live and reaches our entire community.",
  },
];

export default function WhatHappensNext() {
  return (
    <div className="rounded-xl border border-border bg-accent/40 p-6 mt-6">
      <h3 className="text-lg font-bold text-foreground">What Happens Next?</h3>
      <p className="text-sm text-muted-foreground mt-1 mb-6">
        Here's what to expect after you submit your content.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {steps.map((step) => (
          <div key={step.number} className="flex flex-col items-center text-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <step.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-primary mb-1">Step {step.number}</p>
              <h4 className="text-sm font-bold text-foreground">{step.title}</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
