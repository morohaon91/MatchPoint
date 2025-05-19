"use client";

import React from "react";
import { User } from "@/lib/types/models";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
// Assuming a PlusCircle icon or similar might be available or can be added
// import { PlusCircleIcon } from '@heroicons/react/24/outline';

interface QuickCreateGameWidgetProps {
  currentUser: User;
  onOpenCreateGameModal: () => void;
}

export default function QuickCreateGameWidget({
  currentUser,
  onOpenCreateGameModal,
}: QuickCreateGameWidgetProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Create Game</CardTitle>
        <CardDescription>Start a new game in seconds.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="primary"
          className="w-full"
          onClick={onOpenCreateGameModal}
          sportType={
            (currentUser.sportPreferences?.[0]?.sport.toLowerCase() as any) ||
            "default"
          }
        >
          {/* <PlusCircleIcon className="h-5 w-5 mr-2" /> */}
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
        <p className="text-xs text-neutral-500 mt-2 text-center">
          Your preferred sport (
          {currentUser.sportPreferences?.[0]?.sport || "Any Sport"}) can be
          pre-selected.
        </p>
      </CardContent>
    </Card>
  );
}
