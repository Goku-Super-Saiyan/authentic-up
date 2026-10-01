import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "../store";

export default function Toast() {
  const { toast } = useStore();
  return (
    <div className="pointer-events-none fixed inset-x-0 z-[80] flex justify-center px-4" style={{ bottom: "calc(24px + env(safe-area-inset-bottom, 0px))" }} role="status">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast}
            initial={{ y: 30, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="flex items-center gap-3 rounded-full border border-zari/30 bg-dusk/95 px-5 py-3 text-sm shadow-2xl shadow-black/50 backdrop-blur"
          >
            <span className="h-2 w-2 rounded-full bg-marigold shadow-[0_0_12px_#FFB627]" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
