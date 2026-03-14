"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  InformationCircleIcon,
  Alert02Icon,
  MultiplicationSignCircleIcon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <HugeiconsIcon
            icon={CheckmarkCircle02Icon}
            strokeWidth={2}
            className="size-4 text-lime-600 dark:text-lime-400"
          />
        ),
        info: (
          <HugeiconsIcon
            icon={InformationCircleIcon}
            strokeWidth={2}
            className="size-4 text-yellow-600 dark:text-yellow-400"
          />
        ),
        warning: (
          <HugeiconsIcon
            icon={Alert02Icon}
            strokeWidth={2}
            className="size-4 text-amber-600 dark:text-amber-400"
          />
        ),
        error: (
          <HugeiconsIcon
            icon={MultiplicationSignCircleIcon}
            strokeWidth={2}
            className="size-4 text-red-600 dark:text-red-400"
          />
        ),
        loading: (
          <HugeiconsIcon
            icon={Loading03Icon}
            strokeWidth={2}
            className="size-4 animate-spin"
          />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "group toast font-sans bg-background text-foreground border-olive-300 !shadow-none rounded-t-md transition-all duration-300 relative overflow-hidden before:absolute before:bottom-0 before:left-0 before:h-1 before:bg-[var(--toast-timer,theme(colors.olive.400))] before:opacity-50 before:animate-[toast-progress_4s_linear_forwards] hover:before:[animation-play-state:paused]",
          description: "font-sans !text-current/80",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-sans",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground font-sans",
          success:
            "!bg-lime-200/90 !text-lime-900 !border-lime-600 dark:!bg-lime-950/30 dark:!text-lime-200 dark:!border-lime-800/50 [--toast-timer:theme(colors.lime.600)]",
          error:
            "!bg-red-200/90 !text-red-900 !border-red-600 dark:!bg-red-950/30 dark:!text-red-200 dark:!border-red-800/50 [--toast-timer:theme(colors.red.600)]",
          warning:
            "!bg-amber-200/90 !text-amber-900 !border-amber-600 dark:!bg-amber-950/30 dark:!text-amber-200 dark:!border-amber-800/50 [--toast-timer:theme(colors.amber.600)]",
          info: "!bg-orange-200/90 !text-orange-900 !border-orange-600 dark:!bg-orange-950/30 dark:!text-orange-200 dark:!border-orange-800/50 [--toast-timer:theme(colors.orange.600)]",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
