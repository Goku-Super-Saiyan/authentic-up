import { motion, useMotionValue, useSpring } from "framer-motion";
import type { ReactNode } from "react";

// A button that leans toward the pointer.
export default function Magnetic({ children, className = "", onClick, type = "button" }: { children: ReactNode; className?: string; onClick?: () => void; type?: "button" | "submit" }) {
  const x = useMotionValue(0), y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 15 }), sy = useSpring(y, { stiffness: 220, damping: 15 });
  return (
    <motion.button
      type={type}
      onClick={onClick}
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * 0.3);
        y.set((e.clientY - r.top - r.height / 2) * 0.4);
      }}
      onPointerLeave={() => { x.set(0); y.set(0); }}
      whileTap={{ scale: 0.96 }}
      className={className}
    >
      {children}
    </motion.button>
  );
}
