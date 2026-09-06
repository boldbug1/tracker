import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router";
import { X } from "lucide-react";
 
export interface NavItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}
 
export interface CircularNavigationProps {
  navItems: NavItem[];
  isOpen: boolean;
  toggleMenu: () => void;
  onNavigate?: () => void;
}
 
export function CircularNavigation({
  navItems,
  isOpen,
  toggleMenu,
  onNavigate,
}: CircularNavigationProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
 
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed h-screen w-full flex items-center justify-center z-[9000] top-0 left-0 pointer-events-none">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[10000] pointer-events-auto"
            onClick={toggleMenu}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative aspect-square w-[420px] max-w-[90vw] rounded-full flex items-center justify-center will-change-transform"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                boxShadow:
                  "inset 2px 2px 4px rgba(255,255,255,0.1), inset -1px -1px 2px rgba(255,255,255,0.05)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={toggleMenu}
                className="absolute aspect-square flex items-center justify-center w-12 h-12 rounded-full bg-white text-black z-10 hover:bg-neutral-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
 
              {navItems.map((item, index) => {
                const Icon = item.icon;
                const angle = (360 / navItems.length) * index - 90; // -90 to start at top
 
                return (
                  <div
                    key={item.name}
                    className="absolute will-change-transform"
                    style={{
                      transform: `rotate(${angle}deg) translate(140px) rotate(${-angle}deg)`,
                    }}
                  >
                    <Link
                      to={item.href}
                      className={`flex flex-col items-center justify-center w-20 h-20 aspect-square rounded-full transition-colors duration-200 no-decoration ${
                        hoveredItem === item.name
                          ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                          : "text-white hover:bg-white/10"
                      }`}
                      onMouseEnter={() => setHoveredItem(item.name)}
                      onMouseLeave={() => setHoveredItem(null)}
                      onClick={(e) => {
                        toggleMenu();
                        if (onNavigate) onNavigate();
                      }}
                    >
                      <Icon className="w-6 h-6 mb-1" />
                      <span
                        className="text-xs font-medium"
                        style={{ textDecoration: "none" }}
                      >
                        {item.name}
                      </span>
                    </Link>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
