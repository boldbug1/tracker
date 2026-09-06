import React, { useState, useRef, useEffect, KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

export interface ThemedSelectOption {
  value: string;
  label: string;
}

export interface ThemedSelectGroup {
  label?: string;
  options: ThemedSelectOption[];
}

export interface ThemedSelectProps {
  value: string;
  onChange: (value: string) => void;
  groups: ThemedSelectGroup[];
  disabled?: boolean;
}

export function ThemedSelect({ value, onChange, groups, disabled }: ThemedSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  // Flatten options for keyboard navigation
  const flatOptions = groups.flatMap(g => g.options);
  const selectedOption = flatOptions.find(o => o.value === value) || flatOptions[0];

  const updateRect = () => {
    if (buttonRef.current) {
      setRect(buttonRef.current.getBoundingClientRect());
    }
  };

  useEffect(() => {
    if (isOpen) {
      updateRect();
      window.addEventListener("scroll", updateRect, true);
      window.addEventListener("resize", updateRect);
      return () => {
        window.removeEventListener("scroll", updateRect, true);
        window.removeEventListener("resize", updateRect);
      };
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      // If click is not inside the button
      if (buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        // We handle clicks inside the portal natively using stopPropagation,
        // so if this event reaches the window and didn't originate from the portal, close it.
        setIsOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setIsOpen(true);
        const idx = flatOptions.findIndex(o => o.value === value);
        setFocusedIndex(idx >= 0 ? idx : 0);
      }
      return;
    }

    if (e.key === "Escape") {
      setIsOpen(false);
      buttonRef.current?.focus();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex(i => (i < flatOptions.length - 1 ? i + 1 : i));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex(i => (i > 0 ? i - 1 : 0));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < flatOptions.length) {
        onChange(flatOptions[focusedIndex].value);
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    } else if (e.key === "Tab") {
      setIsOpen(false);
    }
  };

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  let globalIndex = 0;

  return (
    <>
      <button
        type="button"
        ref={buttonRef}
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            if (!isOpen) {
              const idx = flatOptions.findIndex(o => o.value === value);
              setFocusedIndex(idx >= 0 ? idx : 0);
            }
          }
        }}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="w-full md:w-[220px] flex items-center justify-between gap-3 py-2 pl-4 pr-3 rounded-lg text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] transition-all border active:scale-95 disabled:opacity-50"
        style={{ 
          color: "var(--foreground)", 
          borderColor: isOpen ? "var(--accent)" : "var(--border)", 
          background: "var(--surface-elevated)"
        }}
      >
        <span className="truncate">{selectedOption?.label}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""}`}>
          <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {isOpen && rect && createPortal(
        <div 
          className="fixed z-[9999]"
          style={{ 
            top: rect.bottom + 4, 
            left: rect.left, 
            width: rect.width,
            // Ensure it doesn't go offscreen
            maxHeight: `calc(100vh - ${rect.bottom + 16}px)`,
          }}
          onMouseDown={(e) => e.stopPropagation()} // Prevent click outside from firing
        >
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="w-full max-h-[300px] overflow-y-auto rounded-lg shadow-xl border flex flex-col py-1"
              style={{ 
                background: "var(--surface-elevated)", 
                borderColor: "var(--border)",
              }}
              role="listbox"
            >
              {groups.map((group, groupIdx) => (
                <div key={groupIdx}>
                  {group.label && (
                    <div 
                      className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold opacity-60 mt-1"
                      style={{ color: "var(--foreground)" }}
                    >
                      {group.label}
                    </div>
                  )}
                  {group.options.map((option) => {
                    const currentIndex = globalIndex++;
                    const isSelected = option.value === value;
                    const isFocused = currentIndex === focusedIndex;

                    return (
                      <div
                        key={option.value}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleSelect(option.value)}
                        onMouseEnter={() => setFocusedIndex(currentIndex)}
                        className={`
                          px-3 py-2 mx-1 rounded-md text-sm cursor-pointer flex items-center justify-between transition-colors
                        `}
                        style={{
                          color: isSelected ? "var(--accent)" : "var(--foreground)",
                          background: isFocused 
                            ? "color-mix(in srgb, var(--accent) 15%, transparent)" 
                            : "transparent"
                        }}
                      >
                        <span className="truncate">{option.label}</span>
                        {isSelected && (
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0" style={{ color: "var(--accent)" }}>
                            <path d="M13.3333 4L6 11.3333L2.66666 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                    );
                  })}
                  {groupIdx < groups.length - 1 && (
                    <div className="h-px w-full my-1" style={{ background: "var(--border)" }} />
                  )}
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>,
        document.body
      )}
    </>
  );
}
