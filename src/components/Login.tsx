import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ACCOUNT_KEY, loadAccount, useStore, type Account } from "../store";
import { Emblem } from "./Logo";
import { useLang } from "../i18n";

// Hindi for the messages the login server sends back.
const SERVER_HI: Record<string, string> = {
  "Tell us your name.": "अपना नाम बताइए।",
  "We just sent a code. Please wait a few seconds before asking for another.": "हमने अभी कोड भेजा है। नया कोड माँगने से पहले कुछ सेकंड रुकें।",
  "Too many codes requested. Please try again in a few minutes.": "बहुत ज़्यादा कोड माँगे गए हैं। कुछ मिनट बाद फिर कोशिश करें।",
  "Enter the full code.": "पूरा कोड लिखें।",
  "Too many wrong codes. Ask for a new code.": "बहुत बार ग़लत कोड डाला गया। नया कोड मँगाएँ।",
  "That code didn't match or has expired. Check it or ask for a new code.": "कोड मेल नहीं खाया या उसकी समय-सीमा ख़त्म हो गई। जाँचें या नया कोड मँगाएँ।",
  "We couldn't find an account with this email. Sign up instead, it takes a minute.": "इस ईमेल से कोई खाता नहीं मिला। साइन अप करें, बस एक मिनट लगेगा।",
  "You already have an account with this email. Log in instead.": "इस ईमेल से आपका खाता पहले से है। लॉग इन करें।",
  "We couldn't create a code right now. Please try again in a minute.": "अभी कोड नहीं बन पाया। एक मिनट बाद फिर कोशिश करें।",
  "We couldn't email your code right now. Please try again in a minute.": "अभी आपका कोड ईमेल नहीं हो पाया। एक मिनट बाद फिर कोशिश करें।",
  "Please log in again.": "कृपया फिर से लॉग इन करें।",
  "We couldn't check your number right now. Please try again in a minute.": "अभी आपका नंबर जाँचा नहीं जा सका। एक मिनट बाद फिर कोशिश करें।",
  "We couldn't find an account with this number. Sign up instead, it takes a minute.": "इस नंबर से कोई खाता नहीं मिला। साइन अप करें, बस एक मिनट लगेगा।",
  "You already have an account with this number. Log in instead.": "इस नंबर से आपका खाता पहले से है। लॉग इन करें।",
  "We couldn't send the SMS right now. Please try again, or use your email.": "अभी SMS नहीं भेजा जा सका। फिर कोशिश करें, या ईमेल से लॉग इन करें।",
  "Something went wrong. Please try again.": "कुछ गड़बड़ हुई। कृपया फिर से कोशिश करें।",
  "We couldn't reach the server. Check your connection and try again.": "सर्वर तक नहीं पहुँच पाए। अपना इंटरनेट जाँचें और फिर कोशिश करें।",
};

type Role = "shopper" | "artisan";
type Mode = "signup" | "login";
type Method = "email" | "phone";
type Step = "form" | "code" | "done";

function OtpBoxes({ value, onChange, length }: { value: string; onChange: (v: string) => void; length: number }) {
  const { t } = useLang();
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  useEffect(() => { refs.current[0]?.focus(); }, []);
  return (
    <div className="flex gap-2 sm:gap-3" onPaste={(e) => { const d = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length); if (d) { e.preventDefault(); onChange(d); refs.current[Math.min(d.length, length - 1)]?.focus(); } }}>
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          id={`otp-${i}`}
          ref={(el) => { refs.current[i] = el; }}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          aria-label={t(`Digit ${i + 1}`, `अंक ${i + 1}`)}
          value={value[i] ?? ""}
          onChange={(e) => {
            const d = e.target.value.replace(/\D/g, "").slice(-1);
            const next = (value.slice(0, i) + d + value.slice(i + 1)).slice(0, length);
            onChange(next);
            if (d && i < length - 1) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => { if (e.key === "Backspace" && !value[i] && i > 0) refs.current[i - 1]?.focus(); }}
          className={`h-14 ${length > 6 ? "w-9 sm:w-10" : "w-11 sm:w-12"} rounded-xl border border-white/15 bg-white/5 text-center font-display text-2xl text-ivory outline-none focus:border-zari`}
        />
      ))}
    </div>
  );
}

async function callAuth(body: Record<string, string>) {
  try {
    const r = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await r.json().catch(() => ({}));
    return r.ok ? { data } : { error: (data as { error?: string }).error || "Something went wrong. Please try again.", code: (data as { code?: string }).code };
  } catch {
    return { error: "We couldn't reach the server. Check your connection and try again." };
  }
}

function Segmented<T extends string>({ value, options, onChange, id, label }: { value: T; options: [T, string][]; onChange: (v: T) => void; id: string; label: string }) {
  return (
    <div className="grid rounded-full border border-white/10 bg-night/50 p-1" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }} role="tablist" aria-label={label}>
      {options.map(([v, text]) => (
        <button key={v} type="button" role="tab" aria-selected={value === v} onClick={() => onChange(v)} className="relative h-10 rounded-full text-sm font-semibold">
          {value === v && <motion.span layoutId={id} className="absolute inset-0 rounded-full bg-zari" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
          <span className={`relative ${value === v ? "text-night" : "text-ivory/75"}`}>{text}</span>
        </button>
      ))}
    </div>
  );
}

const field = "h-12 rounded-xl border border-white/15 bg-white/5 px-4 text-[16px] text-ivory outline-none placeholder:text-ivory/35 focus:border-zari";

export default function Login() {
  const { setUser, go, say } = useStore();
  const { t, lang } = useLang();
  const tr = (msg: string) => (lang === "hi" ? SERVER_HI[msg] ?? msg : msg);
  const [account, setAccount] = useState<Account | null>(loadAccount);
  const [mode, setMode] = useState<Mode>("signup");
  const [method, setMethod] = useState<Method>("email");
  const [phoneOn, setPhoneOn] = useState(false);
  const [role, setRole] = useState<Role>("shopper");
  const [step, setStep] = useState<Step>(account ? "done" : "form");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [digits, setDigits] = useState(6);
  const [ref, setRef] = useState("");
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [timer, setTimer] = useState(30);

  // Mobile sign-in shows only once SMS is set up on the server.
  useEffect(() => {
    fetch("/api/auth").then((r) => r.json()).then((d) => setPhoneOn(!!d.phone)).catch(() => {});
  }, []);

  useEffect(() => {
    if (step !== "code" || timer <= 0) return;
    const t = setTimeout(() => setTimer((x) => x - 1), 1000);
    return () => clearTimeout(t);
  }, [step, timer]);

  const target: Record<string, string> = method === "phone" ? { phone } : { email: email.trim() };
  const shownTarget = method === "phone" ? `+91 ${phone.slice(0, 5)} ${phone.slice(5)}` : email.trim();
  const switchMode = (m: Mode) => { setMode(m); setError(""); setNote(""); };

  const requestCode = async () => {
    setBusy(true);
    const res = await callAuth({ action: "send", intent: mode, ...target, name: name.trim(), role });
    setBusy(false);
    if (res.error) {
      if (res.code === "no_account") { setMode("signup"); setError(""); setNote(tr(res.error)); return false; }
      if (res.code === "exists") { setMode("login"); setError(""); setNote(tr(res.error)); return false; }
      setError(tr(res.error)); return false;
    }
    setDigits(Number((res.data as { digits?: number }).digits) || 6);
    setRef(String((res.data as { ref?: string }).ref ?? ""));
    setError(""); setNote(""); setCode(""); setTimer(30);
    return true;
  };
  const sendCode = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (mode === "signup" && !name.trim()) { setError(t("Tell us your name so makers know who they are packing for.", "अपना नाम बताइए, ताकि कारीगर जानें कि वे किसके लिए पैक कर रहे हैं।")); return; }
    if (method === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError(t("Enter a valid email address.", "सही ईमेल पता लिखें।")); return; }
    if (method === "phone" && !/^[6-9]\d{9}$/.test(phone)) { setError(t("Enter a 10-digit Indian mobile number starting with 6, 7, 8 or 9.", "6, 7, 8 या 9 से शुरू होने वाला 10 अंकों का मोबाइल नंबर लिखें।")); return; }
    if (await requestCode()) setStep("code");
  };
  const resend = async () => { if (await requestCode()) say(t("A new code is on its way", "नया कोड भेज दिया गया है")); };
  const verify = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (code.length < digits) { setError(t(`Enter all ${digits} digits of the code.`, `कोड के सभी ${digits} अंक लिखें।`)); return; }
    setBusy(true);
    const res = await callAuth({ action: "verify", ...target, code, ref, name: mode === "signup" ? name.trim() : "", role });
    setBusy(false);
    if (res.error) { setError(tr(res.error)); return; }
    const d = res.data as { user: Omit<Account, "session">; session: Account["session"] | null };
    const acc: Account = { ...d.user, session: d.session ?? undefined };
    try { localStorage.setItem(ACCOUNT_KEY, JSON.stringify(acc)); } catch { /* storage unavailable */ }
    setAccount(acc); setError(""); setStep("done");
    const first = acc.name.split(" ")[0];
    setUser(first);
    say(mode === "signup" ? t(`Welcome to the bazaar, ${first}`, `बाज़ार में आपका स्वागत है, ${first}`) : t(`Welcome back, ${first}`, `फिर से स्वागत है, ${first}`));
  };
  const logOut = () => { setUser(null); setAccount(null); setCode(""); setMode("login"); setStep("form"); say(t("You're logged out", "आप लॉग आउट हो गए")); };

  const heading = step === "done" ? t("You're in", "आप लॉग इन हैं") : mode === "signup" ? t("Create your account", "अपना खाता बनाएँ") : t("Welcome back", "फिर से स्वागत है");
  const sub = step === "done" ? t("You stay signed in on this device.", "इस डिवाइस पर आप लॉग इन रहेंगे।")
    : mode === "signup"
      ? t(`New here? Sign up in a minute. We'll ${method === "phone" ? "text" : "email"} you a code, no password needed.`, `नए हैं? एक मिनट में साइन अप करें। हम आपको ${method === "phone" ? "SMS" : "ईमेल"} से एक कोड भेजेंगे, पासवर्ड की ज़रूरत नहीं।`)
      : t(`Log in with the ${method === "phone" ? "mobile number" : "email"} you signed up with. We'll send you a code.`, `जिस ${method === "phone" ? "मोबाइल नंबर" : "ईमेल"} से साइन अप किया था, उससे लॉग इन करें। हम आपको एक कोड भेजेंगे।`);

  return (
    <section className="relative min-h-[100svh] overflow-hidden pt-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_25%_40%,rgba(255,182,39,.16),transparent_70%),linear-gradient(180deg,#0E0720,#24104A_60%,#5E0F2C)]" />
      <div className="relative mx-auto grid min-h-[calc(100svh-64px)] max-w-[1320px] items-center gap-12 px-4 py-12 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)]">
        <div className="hidden lg:block">
          <motion.div initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} transition={{ duration: 1.1 }}>
            <Emblem className="h-[340px] w-[282px] drop-shadow-[0_30px_80px_rgba(255,182,39,.3)]" animated />
          </motion.div>
          <h1 className="mt-10 max-w-[11em] font-display text-[clamp(44px,5vw,76px)] leading-[0.95]">{lang === "hi" ? <>नमस्ते। बाज़ार आपको <span className="zari-text">याद रखता है।</span></> : <>Namaste. The bazaar <span className="zari-text">remembers you.</span></>}</h1>
          <p className="mt-5 max-w-[30em] text-lg text-ivory/70">{t("Your bag, saved pieces and orders, and the makers you follow across all 75 districts.", "आपका बैग, सहेजी हुई चीज़ें और ऑर्डर, और सभी 75 ज़िलों के वे कारीगर जिन्हें आप फ़ॉलो करते हैं।")}</p>
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full rounded-[28px] border border-white/10 bg-dusk/80 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-9">
          <div className="lg:hidden"><Emblem className="mb-6 h-24 w-20" animated /></div>

          {step === "form" && (
            <div className="mb-7 flex border-b border-white/10" role="tablist" aria-label={t("Sign up or log in", "साइन अप या लॉग इन")}>
              {([["signup", t("Sign up", "साइन अप")], ["login", t("Log in", "लॉग इन")]] as [Mode, string][]).map(([m, text]) => (
                <button key={m} role="tab" aria-selected={mode === m} onClick={() => switchMode(m)} className={`relative flex-1 pb-3 text-base font-semibold transition ${mode === m ? "text-zari" : "text-ivory/55 hover:text-ivory"}`}>
                  {text}
                  {mode === m && <motion.span layoutId="mode-line" className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-zari" />}
                </button>
              ))}
            </div>
          )}

          <h2 className="font-display text-4xl">{heading}</h2>
          <p className="mt-2 text-ivory/65">{sub}</p>

          <AnimatePresence mode="wait">
            {step === "form" && (
              <motion.form key={`form-${mode}`} onSubmit={sendCode} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="mt-7 grid gap-4" noValidate>
                {mode === "signup" && (
                  <>
                    <Segmented id="role" label={t("Account type", "खाते का प्रकार")} value={role} onChange={setRole} options={[["shopper", t("I'm buying", "मैं ख़रीदार हूँ")], ["artisan", t("I'm a maker", "मैं कारीगर हूँ")]]} />
                    <label className="grid gap-1.5 text-sm text-ivory/75" htmlFor="login-name">
                      {role === "artisan" ? t("Your name or your unit's name", "आपका या आपकी इकाई का नाम") : t("Your name", "आपका नाम")}
                      <input id="login-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder={role === "artisan" ? t("e.g. Madanpura Weavers Collective", "जैसे मदनपुरा बुनकर समूह") : t("e.g. Ananya Singh", "जैसे अनन्या सिंह")} className={field} />
                    </label>
                  </>
                )}
                {phoneOn && <Segmented id="method" label={t("Sign in with", "किससे लॉग इन करें")} value={method} onChange={(m) => { setMethod(m); setError(""); }} options={[["email", t("Email", "ईमेल")], ["phone", t("Mobile number", "मोबाइल नंबर")]]} />}
                {method === "email" ? (
                  <label className="grid gap-1.5 text-sm text-ivory/75" htmlFor="login-email">
                    {t("Email address", "ईमेल पता")}
                    <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} inputMode="email" autoComplete="email" placeholder="you@example.com" className={field} />
                  </label>
                ) : (
                  <label className="grid gap-1.5 text-sm text-ivory/75" htmlFor="login-phone">
                    {t("Mobile number", "मोबाइल नंबर")}
                    <span className="flex h-12 items-center rounded-xl border border-white/15 bg-white/5 focus-within:border-zari">
                      <span className="border-r border-white/10 px-4 font-mono text-ivory/70">+91</span>
                      <input id="login-phone" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} inputMode="numeric" autoComplete="tel-national" placeholder="98765 43210" className="h-full min-w-0 flex-1 bg-transparent px-4 text-[16px] tracking-wider text-ivory outline-none placeholder:text-ivory/35" />
                    </span>
                  </label>
                )}
                {note && <p className="rounded-xl border border-zari/30 bg-zari/10 px-4 py-3 text-sm text-ivory/85" role="status">{note}</p>}
                {error && <p className="text-sm text-sindoor" role="alert">{error}</p>}
                <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={busy} className="mt-2 h-12 rounded-full bg-zari font-semibold text-night disabled:opacity-60">
                  {busy ? t("Sending code…", "कोड भेज रहे हैं…") : mode === "signup" ? t("Create account", "खाता बनाएँ") : method === "phone" ? t("Text me a code", "SMS से कोड भेजें") : t("Email me a code", "ईमेल से कोड भेजें")}
                </motion.button>
                <p className="text-center text-sm text-ivory/60">
                  {mode === "signup" ? t("Already have an account? ", "पहले से खाता है? ") : t("New to the bazaar? ", "बाज़ार में नए हैं? ")}
                  <button type="button" onClick={() => switchMode(mode === "signup" ? "login" : "signup")} className="font-semibold text-zari hover:underline">{mode === "signup" ? t("Log in", "लॉग इन") : t("Sign up", "साइन अप")}</button>
                </p>
                {mode === "signup" && (() => {
                  const terms = <button type="button" onClick={() => go("terms")} className="underline underline-offset-2 hover:text-zari">{t("terms", "शर्तों")}</button>;
                  const privacy = <button type="button" onClick={() => go("privacy")} className="underline underline-offset-2 hover:text-zari">{t("privacy policy", "गोपनीयता नीति")}</button>;
                  return <p className="text-center text-xs text-ivory/45">{lang === "hi" ? <>साइन अप करके आप हमारी {terms} और {privacy} से सहमत होते हैं।</> : <>By signing up you agree to our {terms} and {privacy}.</>}</p>;
                })()}
              </motion.form>
            )}
            {step === "code" && (
              <motion.form key="code" onSubmit={verify} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="mt-7 grid gap-5" noValidate>
                <p className="text-sm text-ivory/75">{lang === "hi"
                  ? <><b className="whitespace-nowrap text-ivory">{shownTarget}</b> पर {method === "phone" ? "SMS" : "ईमेल"} से भेजा गया {digits} अंकों का कोड लिखें।</>
                  : <>Enter the {digits}-digit code we {method === "phone" ? "texted" : "emailed"} to <b className="whitespace-nowrap text-ivory">{shownTarget}</b>.</>}{" "}
                  <button type="button" onClick={() => { setError(""); setStep("form"); }} className="text-zari underline-offset-4 hover:underline">{t("Change", "बदलें")}</button></p>
                <OtpBoxes value={code} onChange={setCode} length={digits} />
                {error && <p className="text-sm text-sindoor" role="alert">{error}</p>}
                <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={busy} className="h-12 rounded-full bg-zari font-semibold text-night disabled:opacity-60">{busy ? t("Checking…", "जाँच रहे हैं…") : mode === "signup" ? t("Verify and create account", "पुष्टि करें और खाता बनाएँ") : t("Verify and log in", "पुष्टि करें और लॉग इन करें")}</motion.button>
                <p className="text-sm text-ivory/55">
                  {timer > 0 ? (lang === "hi"
                    ? <><span className="tabular-nums">0:{String(timer).padStart(2, "0")}</span> में कोड दोबारा भेज सकेंगे</>
                    : <>Resend code in <span className="tabular-nums">0:{String(timer).padStart(2, "0")}</span></>) : <button type="button" disabled={busy} onClick={resend} className="text-zari hover:underline">{t("Resend code", "कोड दोबारा भेजें")}</button>}
                </p>
                {method === "email" && <p className="text-xs text-ivory/45">{t("Can't find it? Check your spam or promotions folder.", "कोड नहीं मिला? स्पैम या प्रमोशन फ़ोल्डर देखें।")}</p>}
              </motion.form>
            )}
            {step === "done" && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-7 grid gap-3">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 14 }} className="grid h-16 w-16 place-items-center rounded-full bg-zari text-night">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="m5 12 5 5 9-10" /></svg>
                </motion.div>
                <p className="text-lg">{lang === "hi" ? <><b>{account?.name}</b> के रूप में लॉग इन{account?.role === "artisan" ? ", कारीगर खाता" : ""}।</> : <>Signed in as <b>{account?.name}</b>{account?.role === "artisan" ? ", maker account" : ""}.</>}</p>
                <p className="-mt-2 text-sm text-ivory/55 [overflow-wrap:anywhere]">{account?.email || account?.phone}</p>
                {account?.admin && <button onClick={() => go("admin")} className="mt-3 h-12 rounded-full border border-zari/60 bg-zari/10 font-semibold text-zari hover:bg-zari/20">{t("Open admin dashboard", "एडमिन डैशबोर्ड खोलें")}</button>}
                <button onClick={() => go("home")} className="mt-3 h-12 rounded-full bg-zari font-semibold text-night">{account?.role === "artisan" ? t("Go to the bazaar", "बाज़ार पर जाएँ") : t("Continue shopping", "ख़रीदारी जारी रखें")}</button>
                <button onClick={logOut} className="h-12 rounded-full border border-white/15 font-semibold hover:border-zari">{t("Log out", "लॉग आउट")}</button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
