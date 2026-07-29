import type { ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";

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

const REVEAL_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const REVEAL_VIEWPORT = { once: true, amount: 0.15 } as const;
const REVEAL_VARIANTS: Variants = {
  hidden: ({ y }: RevealAnimation) => ({ opacity: 0, y }),
  visible: ({ delay }: RevealAnimation) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay,
      duration: 0.6,
      ease: REVEAL_EASE,
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
      viewport={REVEAL_VIEWPORT}
      whileInView="visible"
    >
      {children}
    </MotionElement>
  );
}
