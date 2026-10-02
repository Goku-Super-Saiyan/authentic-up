import { MotionConfig, motion, useScroll, useSpring } from "framer-motion";
import Lenis from "lenis";
import { lazy, Suspense, useEffect } from "react";
import { smooth, StoreProvider, useStore } from "./store";
import { LangProvider } from "./i18n";
import Login from "./components/Login";
import Enquire from "./components/Enquire";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import CraftJourney from "./components/CraftJourney";
import Bazaar from "./components/Bazaar";
import CraftMap from "./components/CraftMap";
import LoomStory from "./components/LoomStory";
import Sell from "./components/Sell";
import Footer from "./components/Footer";
import BagDrawer from "./components/BagDrawer";
import QuickView from "./components/QuickView";
import Toast from "./components/Toast";
import ContactDock from "./components/ContactDock";
import Policy, { isPolicy } from "./components/Policy";

// The admin dashboard loads only when someone opens #admin, so shoppers never download it.
const Admin = lazy(() => import("./admin/Admin"));

function ScrollThread() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  return <motion.div style={{ scaleX }} className="fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-gradient-to-r from-saffron via-zari to-sindoor" />;
}

// Buttery wheel scrolling; native touch scrolling is left alone.
function useSmoothScroll() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true });
    smooth.lenis = lenis;
    let raf = 0;
    const tick = (t: number) => { lenis.raf(t); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); smooth.lenis = null; };
  }, []);
}

function Pages() {
  const { page } = useStore();
  useEffect(() => {
    if (smooth.lenis) smooth.lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }, [page]);
  if (page === "login") return <main><Login /></main>;
  if (page === "enquire") return <main><Enquire /></main>;
  if (isPolicy(page)) return <main><Policy which={page} /></main>;
  return (
    <main>
      <Hero />
      <Marquee />
      <CraftJourney />
      <Bazaar />
      <CraftMap />
      <LoomStory />
      <Sell />
    </main>
  );
}

function Shell() {
  const { page } = useStore();
  if (page === "admin") return <Suspense fallback={<div className="min-h-[100svh] bg-[#0B0519]" />}><Admin /></Suspense>;
  return (
        <div className="grain">
          <ScrollThread />
          <Nav />
          <Pages />
          <Footer />
          <BagDrawer />
          <QuickView />
          <Toast />
          <ContactDock />
        </div>
  );
}

export default function App() {
  useSmoothScroll();
  return (
    <MotionConfig reducedMotion="user">
      <LangProvider>
        <StoreProvider>
          <Shell />
        </StoreProvider>
      </LangProvider>
    </MotionConfig>
  );
}
