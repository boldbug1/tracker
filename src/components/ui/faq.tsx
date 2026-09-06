import { cn } from "@/lib/utils";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion";

export interface FAQItem {
  answer: string;
  question: string;
}

interface FAQProps {
  className?: string;
  description?: string;
  items?: FAQItem[];
  title?: string;
}

const defaultItems: FAQItem[] = [
  {
    question: "What exactly is Dailys?",
    answer:
      "Dailys is a privacy-first productivity and habit tracking dashboard designed to help you stay focused and build better habits, entirely in your browser.",
  },
  {
    question: "Is Dailys really 100% free?",
    answer:
      "Yes, Dailys is 100% free with no hidden tiers. We believe in providing powerful productivity tools for everyone.",
  },
  {
    question: "Where is my data stored?",
    answer:
      "Your data is stored locally in your browser using IndexedDB. We don't store your personal tasks or habits on our servers.",
  },
  {
    question: "Can other people see my workspace?",
    answer:
      "No. Since your data is stored entirely on your local device, no one else can see your workspace unless they have physical access to your computer.",
  },
  {
    question: "Can I customize my Dailys setup?",
    answer:
      "Absolutely! Dailys offers various themes, layout customizations, and a highly configurable Focus Mode to match your workflow perfectly.",
  },
  {
    question: "Does Dailys work on mobile?",
    answer:
      "Dailys is optimized for desktop and tablet experiences, though it can be accessed on mobile browsers for quick check-ins.",
  },
  {
    question: "Do I need to install anything?",
    answer:
      "No installation is required. Dailys runs entirely within your web browser as a web application.",
  },
  {
    question: "What's the catch?",
    answer:
      "There isn't one hidden behind a paywall. Dailys is built to give you the full productivity experience without subscriptions, feature locks, or upgrade prompts.",
  },
];

export default function FAQ({
  title = "Frequently Asked Questions",
  description = "Everything you need to know about Dailys.",
  items = defaultItems,
  className,
}: FAQProps) {
  return (
    <section className={cn("w-full px-4 py-24", className)}>
      <div className="mx-auto max-w-2xl">
        {(title || description) && (
          <div className="mb-12 text-center">
            {title && (
              <h2 className="mb-3 font-pixel text-3xl tracking-tight md:text-4xl text-white">
                {title}
              </h2>
            )}
            {description && (
              <p className="mx-auto max-w-xl text-[#888] font-pixel text-lg">
                {description}
              </p>
            )}
          </div>
        )}

        <Accordion type="single" collapsible className="w-full">
          {items.map((item, idx) => (
            <AccordionItem key={item.question} value={`faq-${idx}`}>
              <AccordionTrigger className="text-left font-pixel text-base sm:text-lg">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm sm:text-base leading-relaxed text-[#999] font-pixel">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
