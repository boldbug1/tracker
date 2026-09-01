import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../context/AppContext";
import { getStrength, validatePassword, requirements } from "../lib/passwordStrength";

export default function Auth() {
  const location = useLocation();
  const isSignup = location.pathname === "/signup";
  const navigate = useNavigate();
  const { login, signup, signInWithOAuth, verifyOtp, resendOtp, user, loading: authLoading } = useApp();

  useEffect(() => {
    if (!authLoading && user) navigate("/dashboard", { replace: true });
  }, [user, authLoading, navigate]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);

  // OTP state
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [cooldown, setCooldown] = useState(30);
  const [resending, setResending] = useState(false);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!needsVerification) return;
    setCooldown(30);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, [needsVerification]);

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setOtpError("");
    const { error: err } = await resendOtp(email);
    setResending(false);
    if (err) {
      setOtpError(err);
      return;
    }
    setCooldown(30);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 8) {
      setOtpError("Enter 8-digit code");
      return;
    }
    setOtpLoading(true);
    setOtpError("");
    const { error: err } = await verifyOtp(email, otp);
    setOtpLoading(false);
    if (err) {
      setOtpError(err);
      return;
    }
    navigate("/dashboard");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isSignup) {
      const pwErr = validatePassword(password);
      if (pwErr) {
        setError(pwErr);
        return;
      }
    }

    setLoading(true);

    if (isSignup) {
      const res = await signup(email, password, name);
      if (res.error) {
        setError(res.error);
        setLoading(false);
        return;
      }
      if (res.needsVerification) {
        setNeedsVerification(true);
        setLoading(false);
        return;
      }
    } else {
      const res = await login(email, password);
      if (res.error) {
        setError(res.error);
        setLoading(false);
        return;
      }
    }

    navigate("/dashboard");
  };

  if (needsVerification) {
    return (
      <div
        className="min-h-full flex flex-col items-center justify-center px-6 py-12 relative"
        style={{ background: "var(--background)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(240,237,232,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(240,237,232,0.025) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 340, damping: 28 }}
          className="relative z-10 w-full max-w-sm rounded-2xl p-8 text-center"
          style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: "rgba(240,237,232,0.06)", border: "1px solid var(--card-border)" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="font-display text-2xl mb-2" style={{ color: "var(--foreground)" }}>Verify your email</h2>
          <p className="text-sm leading-relaxed mb-2" style={{ color: "var(--muted)" }}>
            We sent an 8-digit code to <strong style={{ color: "var(--foreground)" }}>{email}</strong>.
          </p>
          <p className="text-xs mb-6" style={{ color: "var(--muted)" }}>
            Enter it below or click the link in the email.
          </p>

          <form onSubmit={handleVerify} className="flex flex-col gap-3">
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 8))}
              placeholder="12345678"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={8}
              className="w-full px-4 py-3 rounded-xl text-center text-lg tracking-[0.3em] outline-none transition-all duration-150"
              style={{ background: "rgba(240,237,232,0.05)", border: "1px solid var(--card-border)", color: "var(--foreground)", letterSpacing: "0.3em" }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(240,237,232,0.25)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--card-border)")}
            />
            <AnimatePresence>
              {otpError && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  className="text-xs px-3 py-2 rounded-lg"
                  style={{ background: "rgba(255,80,80,0.08)", color: "rgba(255,100,100,0.9)", border: "1px solid rgba(255,80,80,0.15)" }}
                >
                  {otpError}
                </motion.div>
              )}
            </AnimatePresence>
            <motion.button
              whileHover={{ scale: otpLoading ? 1 : 1.02 }} whileTap={{ scale: otpLoading ? 1 : 0.98 }}
              type="submit"
              disabled={otpLoading}
              className="w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2"
              style={{ background: "var(--foreground)", color: "#0c0c0c", opacity: otpLoading ? 0.7 : 1 }}
            >
              {otpLoading && <span className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />}
              {otpLoading ? "Verifying…" : "Verify code"}
            </motion.button>
          </form>

          <div className="mt-4 flex flex-col gap-2">
            <button
              onClick={handleResend}
              disabled={cooldown > 0 || resending}
              className="text-sm py-2 rounded-xl transition-all"
              style={{
                background: cooldown > 0 ? "transparent" : "rgba(240,237,232,0.06)",
                color: cooldown > 0 ? "var(--muted)" : "var(--foreground)",
                border: "1px solid var(--card-border)",
                opacity: cooldown > 0 || resending ? 0.6 : 1,
                cursor: cooldown > 0 || resending ? "not-allowed" : "pointer",
              }}
            >
              {resending ? "Sending…" : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
            </button>
            <button
              onClick={() => setNeedsVerification(false)}
              className="text-sm hover:opacity-80 transition-opacity"
              style={{ color: "var(--muted)", textDecoration: "underline", background: "none", border: "none", cursor: "pointer" }}
            >
              Back to sign in
            </button>
          </div>
          <p className="text-xs mt-4" style={{ color: "rgba(240,237,232,0.25)" }}>
            Didn’t get it? Check spam or resend after cooldown.
          </p>
        </motion.div>
      </div>
    );
  }

  const strength = getStrength(password);

  return (
    <div
      className="min-h-full flex flex-col items-center justify-center px-6 py-12 relative"
      style={{ background: "var(--background)" }}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(240,237,232,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(240,237,232,0.025) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32, ease: "easeOut" }}
        >
          <Link to="/" className="flex items-center justify-center gap-3 mb-10" style={{ textDecoration: "none" }}>
            <motion.div
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
              className="w-14 h-14 rounded-lg flex items-center justify-center overflow-hidden"
            >
              <img src="/DailysLogo.png" alt="Dailys" className="w-full h-full object-cover scale-[2.4]" />
            </motion.div>
            <span className="font-display text-4xl" style={{ color: "var(--foreground)", paddingTop: "6px" }}>Dailys</span>
          </Link>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 340, damping: 28, delay: 0.08 }}
          className="rounded-2xl p-8"
          style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, duration: 0.24 }}
            className="font-display text-2xl mb-1"
            style={{ color: "var(--foreground)" }}
          >
            {isSignup ? "Create account" : "Welcome back"}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.22, duration: 0.24 }}
            className="text-sm mb-7"
            style={{ color: "var(--muted)" }}
          >
            {isSignup ? "Start your focused workflow today." : "Sign in to continue to Dailys."}
          </motion.p>

          {/* OAuth */}
          <motion.button
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28, duration: 0.22 }}
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            type="button"
            onClick={async () => {
              setError("");
              const { error: oauthError } = await signInWithOAuth("google");
              if (oauthError) setError(oauthError);
            }}
            className="w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2.5 transition-all duration-150"
            style={{ background: "var(--foreground)", color: "#0c0c0c", border: "1px solid var(--foreground)" }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 24.5v8.3H34.1c-.4 2.1-2.1 3.9-4.4 4.9l7.1 5.5c4.1-3.8 6.5-9.4 6.5-16 0-1.5-.1-2.9-.4-4.3H24z" />
              <path fill="#4285F4" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.1-5.5c-2 1.3-4.5 2.1-8.8 2.1-6.7 0-12.4-4.5-14.4-10.6L2.2 33.5C4.2 42.1 13.5 48 24 48z" />
              <path fill="#FBBC05" d="M9.6 28.2A14.9 14.9 0 019 24c0-1.5.2-3 .6-4.2L2.2 14.5A23 23 0 000 24c0 3.7.9 7.2 2.2 10.2l7.4-6z" />
              <path fill="#34A853" d="M24 14c3.6 0 6.8 1.2 9.3 3.2l6.9-6.9C36.2 6.1 30.6 4 24 4 13.5 4 4.2 9.9 2.2 14.5l7.4 5.7C11.6 14.1 17.3 14 24 14z" />
            </svg>
            Continue with Google
          </motion.button>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px" style={{ background: "var(--card-border)" }} />
            <span className="font-mono-data text-xs" style={{ color: "var(--muted)" }}>or</span>
            <div className="flex-1 h-px" style={{ background: "var(--card-border)" }} />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <AnimatePresence initial={false}>
              {isSignup && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22 }}
                  style={{ overflow: "hidden" }}
                >
                  <label className="font-mono-data text-xs tracking-widest uppercase block mb-1.5" style={{ color: "var(--muted)" }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Smith"
                    required={isSignup}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-150"
                    style={{ background: "rgba(240,237,232,0.05)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(240,237,232,0.25)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--card-border)")}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="font-mono-data text-xs tracking-widest uppercase block mb-1.5" style={{ color: "var(--muted)" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-150"
                style={{ background: "rgba(240,237,232,0.05)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(240,237,232,0.25)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--card-border)")}
              />
            </div>

            <div>
              <label className="font-mono-data text-xs tracking-widest uppercase block mb-1.5" style={{ color: "var(--muted)" }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="w-full px-4 py-3 pr-10 rounded-xl text-sm outline-none transition-all duration-150"
                  style={{ background: "rgba(240,237,232,0.05)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(240,237,232,0.25)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--card-border)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                  style={{ color: "var(--muted)", background: "none", border: "none", cursor: "pointer" }}
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>

              {isSignup && password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1.5">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-colors duration-200"
                        style={{ background: i < strength.score ? strength.color : "rgba(240,237,232,0.08)" }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono-data text-xs" style={{ color: strength.color }}>{strength.label}</span>
                    <span className="font-mono-data text-xs" style={{ color: "var(--muted)" }}>{password.length}/8 min</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {requirements.map((r) => {
                      const ok = r.test(password);
                      return (
                        <span
                          key={r.label}
                          className="font-mono-data text-xs px-2 py-0.5 rounded-full transition-colors"
                          style={{
                            background: ok ? "rgba(111,207,138,0.12)" : "rgba(240,237,232,0.06)",
                            color: ok ? "var(--green)" : "var(--muted)",
                            border: `1px solid ${ok ? "rgba(111,207,138,0.25)" : "var(--card-border)"}`,
                          }}
                        >
                          {ok ? "✓ " : ""}{r.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {!isSignup && (
              <div className="flex justify-end -mt-1">
                <a href="#" className="text-xs hover:opacity-80 transition-opacity" style={{ color: "var(--muted)", textDecoration: "none" }}>
                  Forgot password?
                </a>
              </div>
            )}

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  className="text-xs px-3 py-2 rounded-lg"
                  style={{ background: "rgba(255,80,80,0.08)", color: "rgba(255,100,100,0.9)", border: "1px solid rgba(255,80,80,0.15)" }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38, duration: 0.22 }}
              whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}
              type="submit"
              disabled={loading}
              className="mt-1 w-full py-3 rounded-xl font-medium text-sm transition-all duration-150 flex items-center justify-center gap-2"
              style={{
                background: loading ? "rgba(240,237,232,0.15)" : "var(--foreground)",
                color: loading ? "var(--muted)" : "#0c0c0c",
              }}
            >
              {loading && (
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="10 24" />
                </svg>
              )}
              {loading ? "Please wait…" : isSignup ? "Create account" : "Sign in"}
            </motion.button>
          </form>

          <p className="text-sm text-center mt-6" style={{ color: "var(--muted)" }}>
            {isSignup ? "Already have an account?" : "New to Dailys?"}{" "}
            <Link
              to={isSignup ? "/login" : "/signup"}
              className="hover:opacity-80 transition-opacity"
              style={{ color: "var(--foreground)", textDecoration: "none", fontWeight: 500 }}
            >
              {isSignup ? "Sign in" : "Create account"}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
