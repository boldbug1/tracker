import { useState } from "react";
import { Mail } from "lucide-react";
import { Link } from "react-router";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import ParticleWordmark from "./ui/particle-wordmark";
import { FooterPixelVideo } from "./ui/FooterPixelVideo";

import { useCookieConsent } from "./ui/cookie-consent";

const footerLinks = [
  {
    title: "Features",
    href: "/#features",
  },
  {
    title: "FAQ",
    href: "/faq",
  },
  {
    title: "Help",
    href: "/help",
  },
  {
    title: "Privacy",
    href: "/privacy",
  },
];

const Footer = () => {
  const { openSettings } = useCookieConsent();
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribed(true);
  };

  return (
    <footer className="border-t border-[#222] bg-[#0c0c0d] text-white">
      <div className="relative overflow-hidden">
        <FooterPixelVideo />
        {/* Upper text with Particle Wordmark */}
        <div className="relative flex w-full items-center justify-center pt-16 pb-12">
          <ParticleWordmark
            mode="dark"
            className="relative z-10 w-full max-w-4xl drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]"
            style={{ aspectRatio: "16 / 3" }}
          />
        </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="flex flex-col items-start justify-between gap-x-8 gap-y-10 px-6 py-12 sm:flex-row xl:px-0">
          <div>
            {/* Logo */}
            <div className="h-10 mb-6">
              <img src="/dailyss-logo.png" alt="Dailys" className="h-full w-auto object-contain" />
            </div>

            <ul className="mt-6 flex flex-wrap items-center gap-4">
              {footerLinks.map(({ title, href }) => (
                <li key={title}>
                  <Link
                    className="text-[#888] hover:text-white transition-colors"
                    to={href}
                  >
                    {title}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  onClick={openSettings}
                  className="text-[#888] hover:text-white transition-colors"
                >
                  Cookie Settings
                </button>
              </li>
            </ul>
          </div>

          {/* Subscribe Newsletter */}
          <div className="w-full max-w-xs">
            <h6 className="font-medium text-white">Stay up to date</h6>
            <form onSubmit={handleSubscribe} className="mt-6 flex items-center gap-2">
              <Input 
                name="email"
                placeholder="Enter your email" 
                type="email" 
                required
                disabled={isSubscribed}
                className="bg-[#111] border-[#333] text-white placeholder:text-[#666] disabled:opacity-50" 
              />
              <Button type="submit" disabled={isSubscribed} className="bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubscribed ? "Subscribed" : "Subscribe"}
              </Button>
            </form>
          </div>
        </div>
      </div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <Separator className="bg-[#222]" />
        <div className="flex flex-col-reverse items-center justify-between gap-x-2 gap-y-5 px-6 py-8 sm:flex-row xl:px-0">
          {/* Copyright */}
          <span className="text-[#666] text-sm">
            &copy; {new Date().getFullYear()}{" "}
            <Link to="/" className="hover:text-white transition-colors">
              Dailys
            </Link>
            . All rights reserved.
          </span>

          <div className="flex items-center gap-5 text-[#888]">
            <a href="mailto:dailyssupport@gmail.com" className="hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
              <Mail className="h-5 w-5" />
            </a>
            <a href="https://www.instagram.com/vedd.sh" className="hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
              </svg>
            </a>
            <a href="https://discord.gg/WTs8vsjvM" className="hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </a>
            <a href="https://github.com/vedanthaha" className="hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
                <path d="M9 18c-4.51 2-5-2-7-2"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
