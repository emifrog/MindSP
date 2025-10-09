"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  description: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export function HeroSection({
  title,
  subtitle,
  description,
  primaryAction,
  secondaryAction,
}: HeroSectionProps) {
  return (
    <div className="relative overflow-hidden">
      {/* Gradient Mesh Background */}
      <div className="gradient-mesh absolute inset-0 opacity-50" />

      {/* Content */}
      <div className="relative">
        <div className="glass rounded-2xl p-12 md:p-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            {subtitle && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mb-4"
              >
                <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                  {subtitle}
                </span>
              </motion.div>
            )}

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-gradient mb-6 text-4xl font-bold md:text-5xl lg:text-6xl"
            >
              {title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl"
            >
              {description}
            </motion.p>

            {(primaryAction || secondaryAction) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-col gap-4 sm:flex-row"
              >
                {primaryAction && (
                  <Button
                    size="lg"
                    onClick={primaryAction.onClick}
                    className="glow-primary group"
                  >
                    {primaryAction.label}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                )}
                {secondaryAction && (
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={secondaryAction.onClick}
                    className="hover:glow-accent"
                  >
                    {secondaryAction.label}
                  </Button>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
