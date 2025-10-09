"use client";

import { motion } from "framer-motion";
import { slideInLeft, slideInRight } from "@/lib/animations/variants";

interface SlideInProps {
  children: React.ReactNode;
  direction?: "left" | "right";
  delay?: number;
  className?: string;
}

export function SlideIn({
  children,
  direction = "left",
  delay = 0,
  className,
}: SlideInProps) {
  const variants = direction === "left" ? slideInLeft : slideInRight;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={variants}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
