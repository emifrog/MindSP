"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "primary" | "success" | "warning" | "info";
  className?: string;
}

const variants = {
  default: "bg-card text-card-foreground shadow-modern",
  primary: "gradient-primary text-white shadow-modern-lg",
  success: "bg-success text-success-foreground shadow-modern-lg glow-primary",
  warning: "bg-warning text-warning-foreground shadow-modern-lg",
  info: "bg-info text-info-foreground shadow-modern-lg glow-accent",
};

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  variant = "default",
  className,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className={cn("cursor-pointer", className)}
    >
      <Card className={cn("overflow-hidden", variants[variant])}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p
                className={cn(
                  "text-sm font-medium",
                  variant === "default" ? "text-muted-foreground" : "opacity-90"
                )}
              >
                {title}
              </p>
              <p className="text-3xl font-bold tracking-tight">{value}</p>
              {trend && (
                <div className="flex items-center gap-1 text-sm">
                  <span
                    className={cn(
                      "font-medium",
                      trend.isPositive ? "text-green-500" : "text-red-500"
                    )}
                  >
                    {trend.isPositive ? "+" : ""}
                    {trend.value}%
                  </span>
                  <span
                    className={cn(
                      variant === "default"
                        ? "text-muted-foreground"
                        : "opacity-75"
                    )}
                  >
                    vs mois dernier
                  </span>
                </div>
              )}
            </div>
            <div
              className={cn(
                "rounded-full p-3",
                variant === "default"
                  ? "bg-primary/10 text-primary"
                  : "bg-white/20"
              )}
            >
              <Icon className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
