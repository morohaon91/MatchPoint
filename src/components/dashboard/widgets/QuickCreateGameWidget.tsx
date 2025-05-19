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
  
  return (
    <Card variant="elevated" className="shadow-lg border border-neutral-100 dark:border-neutral-700 hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="bg-gradient-to-r from-primary-50 to-white dark:from-neutral-800 dark:to-neutral-800 border-b border-neutral-100 dark:border-neutral-700">
        <CardTitle className="flex items-center text-xl text-primary-700 dark:text-primary-300">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-2 text-primary-500">
            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z" clipRule="evenodd" />
          </svg>
          Quick Create Game
        </CardTitle>
        <CardDescription className="ml-8 text-neutral-500 dark:text-neutral-400">
          Start a new game in seconds
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-900 p-5 rounded-xl border border-neutral-100 dark:border-neutral-700 shadow-sm">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <span className="text-2xl">
                {getSportIcon(preferredSport)}
              </span>
            </div>
          </div>
          
          <Button
            variant="primary"
            className="w-full py-6 text-base font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
            onClick={onOpenCreateGameModal}
            sportType={preferredSport.toLowerCase() as any}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-5 w-5 mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            Create New Game
          </Button>
          
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-3 text-center">
            Your preferred sport ({preferredSport}) will be pre-selected
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
