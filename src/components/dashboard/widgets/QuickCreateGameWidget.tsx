"use client";

import React from "react";
import { User, SportType } from "@/lib/types/models";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getSportIcon } from "../SmartDashboard";

interface QuickCreateGameWidgetProps {
  currentUser: User;
  onOpenCreateGameModal: () => void;
}

export default function QuickCreateGameWidget({
  currentUser,
  onOpenCreateGameModal,
}: QuickCreateGameWidgetProps) {
  const preferredSport = currentUser.sportPreferences?.[0]?.sport || SportType.TENNIS;
  
  // Define a subtle glow effect using Tailwind classes. This can be enhanced with custom CSS if needed.
  // For a border glow, we can use ring utilities with animation.
  // For a background glow, a radial gradient or animated shadow.
  // Here, we'll use a combination of shadow and a subtle ring animation for the card.
  const glowEffectClasses = "ring-2 ring-offset-2 ring-offset-neutral-100 dark:ring-offset-neutral-900 ring-primary-500/70 dark:ring-primary-400/70 animate-pulse-border-glow";
  // Note: animate-pulse-border-glow would be a custom animation defined in globals.css for a subtle pulse.
  // For now, let's use a static ring and a stronger hover shadow for emphasis.
  // Or, a simpler approach: a distinct background gradient for the card itself.

  return (
    <Card 
      variant="elevated" 
      className={`
        rounded-xl shadow-xl border border-primary-500/30 dark:border-primary-400/40 
        hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 group
        bg-gradient-to-br from-primary-50 via-white to-primary-100 
        dark:from-primary-700/20 dark:via-neutral-800 dark:to-primary-800/30
        relative overflow-hidden
      `} // Highlighted background and stronger shadow
      // Add a pseudo-element for a more complex glow if needed via globals.css
    >
      {/* Optional: Subtle animated glow effect using pseudo-element (would require custom CSS) */}
      {/* <div className="absolute inset-0 rounded-xl ring-2 ring-primary-500/50 dark:ring-primary-400/50 opacity-75 animate-pulse group-hover:opacity-100 transition-opacity duration-300 z-0"></div> */}
      
      <div className="relative z-10"> {/* Content must be above pseudo-elements if used */}
        <CardHeader className="bg-transparent border-b border-primary-500/20 dark:border-primary-400/30 p-5">
          <CardTitle className="flex items-center text-lg font-semibold text-primary-700 dark:text-primary-200">
            {/* Lightning bolt or rocket for "Quick" */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-2.5 text-primary-500 dark:text-primary-300">
              <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clipRule="evenodd" />
            </svg>
            Quick Create Game
          </CardTitle>
          <CardDescription className="ml-[34px] mt-1 text-primary-600/80 dark:text-primary-300/80 text-sm">
            Start a new game in seconds!
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <div className="bg-gradient-to-br from-white to-neutral-100 dark:from-neutral-700/50 dark:to-neutral-800/70 p-5 rounded-lg border border-neutral-200 dark:border-neutral-600/70 shadow-inner">
            <div className="flex items-center justify-center mb-5">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-600/40 dark:to-primary-700/50 flex items-center justify-center shadow-md ring-2 ring-white/50 dark:ring-black/20">
                <span className="text-4xl text-primary-600 dark:text-primary-200 group-hover:scale-110 transition-transform duration-200">
                  {getSportIcon(preferredSport)}
                </span>
              </div>
            </div>
            
            <Button
              variant="primary" // This should ideally be a green-ish color or sport-themed
              className="w-full py-3 text-md font-semibold shadow-lg hover:shadow-xl 
                         transform transition-all duration-200 ease-out
                         hover:scale-105 active:scale-100 
                         group-hover:animate-pulse-once" // Playful hover: pulse once on card hover
              onClick={onOpenCreateGameModal}
              sportType={preferredSport.toLowerCase() as any} // This will color the button based on sport
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5 mr-2"
              >
                <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
              </svg>
              Create New Game
            </Button>
            
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-3.5 text-center">
              Your preferred sport ({preferredSport}) will be pre-selected.
            </p>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
