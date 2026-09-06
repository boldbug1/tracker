import React, { createContext, useContext, useEffect, useState } from "react";
import { X, Settings2 } from "lucide-react";

export interface CookieConsentPreferences {
  essential: boolean; // Always true
  preferences: boolean; // Future-ready
  analytics: boolean; // Future-ready
  marketing: boolean; // Future-ready
  version: number;
}

const CURRENT_CONSENT_VERSION = 1;

const DEFAULT_CONSENT: CookieConsentPreferences = {
  essential: true,
  preferences: false,
  analytics: false,
  marketing: false,
  version: CURRENT_CONSENT_VERSION,
};

interface CookieConsentContextType {
  preferences: CookieConsentPreferences;
  hasConsented: boolean;
  acceptAll: () => void;
  savePreferences: (prefs: Partial<CookieConsentPreferences>) => void;
  openSettings: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error("useCookieConsent must be used within a CookieConsentProvider");
  }
  return context;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  if (match) return decodeURIComponent(match[2]);
  return null;
}

function setCookie(name: string, value: string, days: number = 365) {
  if (typeof document === "undefined") return;
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/;SameSite=Lax`;
}

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferencesState] = useState<CookieConsentPreferences>(DEFAULT_CONSENT);
  const [hasConsented, setHasConsented] = useState<boolean>(true); // Default true to avoid flash, check in effect
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(false);

  useEffect(() => {
    const savedConsentStr = getCookie("dailys_cookie_consent");
    if (savedConsentStr) {
      try {
        const savedConsent = JSON.parse(savedConsentStr) as CookieConsentPreferences;
        if (savedConsent.version === CURRENT_CONSENT_VERSION) {
          setPreferencesState({ ...DEFAULT_CONSENT, ...savedConsent, essential: true });
          setHasConsented(true);
          return;
        }
      } catch (e) {
        // Parse error, treat as no consent
      }
    }
    setHasConsented(false);
    setIsBannerVisible(true);
  }, []);

  const savePreferences = (newPrefs: Partial<CookieConsentPreferences>) => {
    const updated = { ...preferences, ...newPrefs, essential: true, version: CURRENT_CONSENT_VERSION };
    setPreferencesState(updated);
    setCookie("dailys_cookie_consent", JSON.stringify(updated));
    setHasConsented(true);
    setIsBannerVisible(false);
    setIsSettingsOpen(false);
  };

  const acceptAll = () => {
    savePreferences({ preferences: true, analytics: true, marketing: true });
  };

  const rejectOptional = () => {
    savePreferences({ preferences: false, analytics: false, marketing: false });
  };

  return (
    <CookieConsentContext.Provider
      value={{
        preferences,
        hasConsented,
        acceptAll,
        savePreferences,
        openSettings: () => setIsSettingsOpen(true),
      }}
    >
      {children}

      {/* Banner */}
      {isBannerVisible && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-4">
          <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-[#222] bg-[#0c0c0d]/95 p-4 sm:p-6 shadow-2xl backdrop-blur-md">
            <div className="flex-1 space-y-1">
              <h3 className="font-medium text-white">Privacy & Storage</h3>
              <p className="text-sm text-[#888]">
                Dailys uses essential local browser storage to keep you logged in and save your layout preferences. 
                Currently, we do not use any analytics or marketing tracking.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-[#888] hover:text-white transition-colors"
              >
                Manage Preferences
              </button>
              <button
                onClick={rejectOptional}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium border border-[#222] hover:bg-[#111] rounded-lg transition-colors text-white"
              >
                Reject Optional
              </button>
              <button
                onClick={acceptAll}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium bg-white text-black hover:bg-gray-200 rounded-lg transition-colors"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-[#222] bg-[#0c0c0d] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-[#222] px-6 py-4">
              <h2 className="text-lg font-semibold text-white">Privacy Settings</h2>
              <button
                onClick={() => !isBannerVisible && setIsSettingsOpen(false)} // Don't let them close if they haven't consented
                className="rounded-full p-2 text-[#888] hover:bg-[#222] hover:text-white transition-colors"
                disabled={isBannerVisible}
              >
                {!isBannerVisible && <X className="h-5 w-5" />}
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              <p className="text-sm text-[#888]">
                Manage how Dailys stores data in your browser. We respect your privacy and only store what's necessary.
              </p>

              <div className="space-y-4">
                {/* Essential */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="font-medium text-white">Essential Browser Storage</h4>
                    <p className="text-xs text-[#888]">Required for authentication, security, and saving core dashboard layout preferences locally.</p>
                  </div>
                  <div className="text-xs font-medium text-[#6fcf8a] bg-[#6fcf8a]/10 px-2 py-1 rounded">Always Active</div>
                </div>

                {/* Preferences (Future-ready) */}
                <div className="flex items-start justify-between gap-4 opacity-50">
                  <div className="space-y-1">
                    <h4 className="font-medium text-white line-through decoration-[#444]">Optional Preferences</h4>
                    <p className="text-xs text-[#888]">Not currently used.</p>
                  </div>
                  <div className="text-xs font-medium text-[#888] bg-[#222] px-2 py-1 rounded">Inactive</div>
                </div>

                {/* Analytics (Future-ready) */}
                <div className="flex items-start justify-between gap-4 opacity-50">
                  <div className="space-y-1">
                    <h4 className="font-medium text-white line-through decoration-[#444]">Analytics</h4>
                    <p className="text-xs text-[#888]">Not currently used.</p>
                  </div>
                  <div className="text-xs font-medium text-[#888] bg-[#222] px-2 py-1 rounded">Inactive</div>
                </div>

                {/* Marketing (Future-ready) */}
                <div className="flex items-start justify-between gap-4 opacity-50">
                  <div className="space-y-1">
                    <h4 className="font-medium text-white line-through decoration-[#444]">Marketing</h4>
                    <p className="text-xs text-[#888]">Not currently used.</p>
                  </div>
                  <div className="text-xs font-medium text-[#888] bg-[#222] px-2 py-1 rounded">Inactive</div>
                </div>
              </div>
            </div>

            <div className="border-t border-[#222] p-4 flex justify-end">
              <button
                onClick={() => savePreferences(preferences)}
                className="w-full sm:w-auto px-6 py-2 text-sm font-medium bg-white text-black hover:bg-gray-200 rounded-lg transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </CookieConsentContext.Provider>
  );
}
