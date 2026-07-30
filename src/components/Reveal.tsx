import type { ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { STANDARD_EASE, VIEWPORT_ONCE } from "./motion";

type RevealElement = "div" | "section" | "article" | "li";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: RevealElement;
};

type RevealAnimation = {
  delay: number;
  y: number;
};

const REVEAL_VARIANTS: Variants = {
  hidden: ({ y }: RevealAnimation) => ({ opacity: 0, y }),
  visible: ({ delay }: RevealAnimation) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay,
      duration: 0.6,
      ease: STANDARD_EASE,
    },
  }),
};
const REVEAL_ELEMENTS = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  li: motion.li,
} as const;

export default function Reveal({
  children,
  className,
  delay = 0,
  y = 20,
  as = "div",
}: RevealProps) {
  const shouldReduceMotion = useReducedMotion();
  const MotionElement = REVEAL_ELEMENTS[as];

  return (
    <MotionElement
      className={className}
      custom={{ delay, y }}
      initial={shouldReduceMotion ? false : "hidden"}
      variants={REVEAL_VARIANTS}
      viewport={VIEWPORT_ONCE}
      whileInView="visible"
    >
      {children}
    </MotionElement>
  );
}
