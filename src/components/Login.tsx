import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useStore } from "../store";
import { Emblem } from "./Logo";

type Role = "shopper" | "artisan";
type Step = "phone" | "otp" | "done";

function OtpBoxes({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  useEffect(() => { refs.current[0]?.focus(); }, []);
  return (
    <div className="flex gap-2 sm:gap-3" onPaste={(e) => { const d = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6); if (d) { e.preventDefault(); onChange(d); refs.current[Math.min(d.length, 5)]?.focus(); } }}>
      {Array.from({ length: 6 }, (_, i) => (
        <input
          key={i}
          id={`otp-${i}`}
          ref={(el) => { refs.current[i] = el; }}
          inputMode="numeric"
          maxLength={1}
          aria-label={`Digit ${i + 1}`}
          value={value[i] ?? ""}
          onChange={(e) => {
            const d = e.target.value.replace(/\D/g, "").slice(-1);
            const next = (value.slice(0, i) + d + value.slice(i + 1)).slice(0, 6);
            onChange(next);
            if (d && i < 5) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => { if (e.key === "Backspace" && !value[i] && i > 0) refs.current[i - 1]?.focus(); }}
          className="h-14 w-11 rounded-xl border border-white/15 bg-white/5 text-center font-display text-2xl text-ivory outline-none focus:border-zari sm:w-12"
        />
      ))}
    </div>
  );
}

export default function Login() {
  const { setUser, go, say } = useStore();
  const [role, setRole] = useState<Role>("shopper");
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    if (step !== "otp" || timer <= 0) return;
    const t = setTimeout(() => setTimer((x) => x - 1), 1000);
    return () => clearTimeout(t);
  }, [step, timer]);

  const sendOtp = (e: FormEvent) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(phone)) { setError("Enter a 10-digit Indian mobile number starting with 6, 7, 8 or 9."); return; }
    if (!name.trim()) { setError("Tell us your name so makers know who they are packing for."); return; }
    setError(""); setOtp(""); setTimer(30); setStep("otp");
  };
  const verify = (e: FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) { setError("Enter all 6 digits of the code."); return; }
    setError(""); setStep("done");
    const first = name.trim().split(" ")[0];
    setUser(first);
    say(`Welcome, ${first}`);
  };

  return (
    <section className="relative min-h-[100svh] overflow-hidden pt-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_25%_40%,rgba(255,182,39,.16),transparent_70%),linear-gradient(180deg,#0E0720,#24104A_60%,#5E0F2C)]" />
      <div className="relative mx-auto grid min-h-[calc(100svh-64px)] max-w-[1320px] items-center gap-12 px-4 py-12 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)]">
        <div className="hidden lg:block">
          <motion.div initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} transition={{ duration: 1.1 }}>
            <Emblem className="h-[340px] w-[282px] drop-shadow-[0_30px_80px_rgba(255,182,39,.3)]" animated />
          </motion.div>
          <h1 className="mt-10 max-w-[11em] font-display text-[clamp(44px,5vw,76px)] leading-[0.95]">Namaste. The bazaar <span className="zari-text">remembers you.</span></h1>
          <p className="mt-5 max-w-[30em] text-lg text-ivory/70">Your bag, saved pieces and orders, and the makers you follow across all 75 districts.</p>
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full rounded-[28px] border border-white/10 bg-dusk/80 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-9">
          <div className="lg:hidden"><Emblem className="mb-6 h-24 w-20" animated /></div>
          <h2 className="font-display text-4xl">{step === "done" ? "You're in" : "Log in or sign up"}</h2>
          <p className="mt-2 text-ivory/65">{step === "done" ? "Your bag and wishlist are saved to your account." : "One login for buyers and makers. We'll text you a code."}</p>

          {step !== "done" && (
            <div className="mt-7 grid grid-cols-2 rounded-full border border-white/10 bg-night/50 p-1" role="tablist" aria-label="Account type">
              {(["shopper", "artisan"] as Role[]).map((r) => (
                <button key={r} role="tab" aria-selected={role === r} onClick={() => setRole(r)} className="relative h-10 rounded-full text-sm font-semibold">
                  {role === r && <motion.span layoutId="role" className="absolute inset-0 rounded-full bg-zari" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                  <span className={`relative ${role === r ? "text-night" : "text-ivory/75"}`}>{r === "shopper" ? "I'm buying" : "I'm a maker"}</span>
                </button>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === "phone" && (
              <motion.form key="phone" onSubmit={sendOtp} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="mt-7 grid gap-4" noValidate>
                <label className="grid gap-1.5 text-sm text-ivory/75" htmlFor="login-name">
                  {role === "artisan" ? "Your name or your unit's name" : "Your name"}
                  <input id="login-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder={role === "artisan" ? "e.g. Madanpura Weavers Collective" : "e.g. Ananya Singh"} className="h-12 rounded-xl border border-white/15 bg-white/5 px-4 text-[16px] text-ivory outline-none placeholder:text-ivory/35 focus:border-zari" />
                </label>
                <label className="grid gap-1.5 text-sm text-ivory/75" htmlFor="login-phone">
                  Mobile number
                  <span className="flex h-12 items-center rounded-xl border border-white/15 bg-white/5 focus-within:border-zari">
                    <span className="border-r border-white/10 px-4 font-mono text-ivory/70">+91</span>
                    <input id="login-phone" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} inputMode="numeric" autoComplete="tel-national" placeholder="98765 43210" className="h-full min-w-0 flex-1 bg-transparent px-4 text-[16px] tracking-wider text-ivory outline-none placeholder:text-ivory/35" />
                  </span>
                </label>
                {error && <p className="text-sm text-sindoor" role="alert">{error}</p>}
                <motion.button whileTap={{ scale: 0.97 }} type="submit" className="mt-2 h-12 rounded-full bg-zari font-semibold text-night">Send code</motion.button>
                <p className="text-center text-xs text-ivory/45">By continuing you agree to the bazaar's terms. This prototype doesn't send real messages.</p>
              </motion.form>
            )}
            {step === "otp" && (
              <motion.form key="otp" onSubmit={verify} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="mt-7 grid gap-5" noValidate>
                <p className="text-sm text-ivory/75">Enter the 6-digit code sent to <b className="text-ivory">+91 {phone.slice(0, 5)} {phone.slice(5)}</b>. <button type="button" onClick={() => setStep("phone")} className="text-zari underline-offset-4 hover:underline">Change number</button></p>
                <OtpBoxes value={otp} onChange={setOtp} />
                {error && <p className="text-sm text-sindoor" role="alert">{error}</p>}
                <motion.button whileTap={{ scale: 0.97 }} type="submit" className="h-12 rounded-full bg-zari font-semibold text-night">Verify and continue</motion.button>
                <p className="text-sm text-ivory/55">
                  {timer > 0 ? <>Resend code in <span className="tabular-nums">0:{String(timer).padStart(2, "0")}</span></> : <button type="button" onClick={() => { setTimer(30); say("A new code is on its way"); }} className="text-zari hover:underline">Resend code</button>}
                </p>
                <p className="text-xs text-ivory/40">Prototype: any 6 digits will work.</p>
              </motion.form>
            )}
            {step === "done" && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-7 grid gap-3">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 14 }} className="grid h-16 w-16 place-items-center rounded-full bg-zari text-night">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="m5 12 5 5 9-10" /></svg>
                </motion.div>
                <p className="text-lg">Signed in as <b>{name.trim()}</b>{role === "artisan" ? ", maker account" : ""}.</p>
                <button onClick={() => go("home")} className="mt-3 h-12 rounded-full bg-zari font-semibold text-night">{role === "artisan" ? "Go to the bazaar" : "Continue shopping"}</button>
                <button onClick={() => { setUser(null); setStep("phone"); }} className="h-12 rounded-full border border-white/15 font-semibold hover:border-zari">Log out</button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
