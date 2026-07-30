import type { CSSProperties } from "react";
import {
  motion,
  useReducedMotion,
  type TargetAndTransition,
} from "motion/react";

const GRID_STYLE: CSSProperties = {
  backgroundImage:
    "linear-gradient(rgba(43, 150, 139, 0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(43, 150, 139, 0.045) 1px, transparent 1px)",
  backgroundSize: "72px 72px",
  maskImage: "linear-gradient(to bottom, black, transparent 88%)",
  WebkitMaskImage: "linear-gradient(to bottom, black, transparent 88%)",
};

const STATIC_ORB: TargetAndTransition = {
  x: 0,
  y: 0,
  scale: 1,
  transition: { duration: 0 },
};

const ORB_ONE_ANIMATION: TargetAndTransition = {
  x: [0, 42, -18],
  y: [0, -28, 16],
  scale: [1, 1.07, 0.98],
  transition: {
    duration: 22,
    ease: "easeInOut",
    repeat: Infinity,
    repeatType: "mirror",
  },
};

const ORB_TWO_ANIMATION: TargetAndTransition = {
  x: [0, -36, 20],
  y: [0, 34, -12],
  scale: [1, 0.96, 1.06],
  transition: {
    duration: 28,
    ease: "easeInOut",
    repeat: Infinity,
    repeatType: "mirror",
  },
};

const ORB_THREE_ANIMATION: TargetAndTransition = {
  x: [0, 28, -24],
  y: [0, -22, 30],
  scale: [1, 1.05, 0.97],
  transition: {
    duration: 18,
    ease: "easeInOut",
    repeat: Infinity,
    repeatType: "mirror",
  },
};

export default function AmbientBackground() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <div className="absolute inset-x-0 top-0 h-[70rem]" style={GRID_STYLE} />

      <motion.div
        animate={shouldReduceMotion ? STATIC_ORB : ORB_ONE_ANIMATION}
        className="absolute -left-32 top-24 h-[28rem] w-[28rem] max-w-[70vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(36,166,151,0.58),transparent_70%)] opacity-[0.14] blur-3xl"
      />
      <motion.div
        animate={shouldReduceMotion ? STATIC_ORB : ORB_TWO_ANIMATION}
        className="absolute -right-36 top-[28rem] h-[32rem] w-[32rem] max-w-[75vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(201,167,91,0.5),transparent_70%)] opacity-[0.13] blur-3xl"
      />
      <motion.div
        animate={shouldReduceMotion ? STATIC_ORB : ORB_THREE_ANIMATION}
        className="absolute left-[32%] top-[52%] h-[26rem] w-[26rem] max-w-[65vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(50,139,149,0.48),transparent_70%)] opacity-[0.12] blur-3xl"
      />
    </div>
  );
}
