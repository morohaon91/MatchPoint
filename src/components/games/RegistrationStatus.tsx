'use client';

import React, { useState, useEffect } from 'react';
import { ParticipantStatus } from '@/lib/types/models';

interface RegistrationStatusProps {
  gameId: string;
  userId: string;
  status: ParticipantStatus | null;
  priorityScore?: number;
  estimatedPosition?: number;
  totalWaitlisted?: number;
  chanceOfPromotion?: 'high' | 'medium' | 'low';
  maxParticipants?: number;
  currentParticipants?: number;
}

/**
 * RegistrationStatus component displays a user's registration status for a game
 */
export default function RegistrationStatus({
  gameId,
  userId,
  status,
  priorityScore = 0,
  estimatedPosition = 0,
  totalWaitlisted = 0,
  chanceOfPromotion = 'low',
  maxParticipants = 0,
  currentParticipants = 0
}: RegistrationStatusProps) {
  // Determine if the game is full
  const isFull = maxParticipants > 0 && currentParticipants >= maxParticipants;
  
  // Get status color and text
  const getStatusInfo = () => {
    switch (status) {
      case ParticipantStatus.CONFIRMED:
        return {
          color: 'bg-green-100 text-green-800',
          text: 'Confirmed',
          description: 'You are confirmed for this game.'
        };
      case ParticipantStatus.WAITLIST:
        return {
          color: 'bg-yellow-100 text-yellow-800',
          text: 'Waitlisted',
          description: `You are on the waitlist for this game. ${
            estimatedPosition > 0 
              ? `Position: ${estimatedPosition} of ${totalWaitlisted}`
              : ''
          }`
        };
      case ParticipantStatus.DECLINED:
        return {
          color: 'bg-gray-100 text-gray-800',
          text: 'Declined',
          description: 'You have declined this game.'
        };
      default:
        return {
          color: 'bg-blue-100 text-blue-800',
          text: 'Not Registered',
          description: isFull 
            ? 'This game is full. You can join the waitlist.'
            : 'You are not registered for this game.'
        };
    }
  };
  
  const statusInfo = getStatusInfo();
  
  // Get promotion chance color and text
  const getPromotionInfo = () => {
    switch (chanceOfPromotion) {
      case 'high':
        return {
          color: 'text-green-600',
          text: 'High chance of promotion'
        };
      case 'medium':
        return {
          color: 'text-yellow-600',
          text: 'Medium chance of promotion'
        };
      case 'low':
        return {
          color: 'text-red-600',
          text: 'Low chance of promotion'
        };
      default:
        return {
          color: 'text-gray-600',
          text: 'Unknown chance of promotion'
        };
    }
  };
  
  const promotionInfo = getPromotionInfo();
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Registration Status</h3>
          <p className="text-sm text-gray-500 mt-1">
            {statusInfo.description}
          </p>
        </div>
        
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
          {statusInfo.text}
        </span>
      </div>
      
      {status === ParticipantStatus.WAITLIST && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Priority Score</span>
            <span className="text-sm font-medium text-gray-900">{priorityScore}/100</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${priorityScore}%` }}
            ></div>
          </div>
          
          <p className={`mt-2 text-sm ${promotionInfo.color}`}>
            {promotionInfo.text}
          </p>
          
          <div className="mt-4 text-sm text-gray-600">
            <p>Your position on the waitlist is determined by your priority score, which is calculated based on your attendance history and other factors.</p>
          </div>
        </div>
      )}
      
      {maxParticipants > 0 && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Participants</span>
            <span className="text-sm font-medium text-gray-900">{currentParticipants}/{maxParticipants}</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${
                currentParticipants >= maxParticipants 
                  ? 'bg-red-600' 
                  : currentParticipants >= maxParticipants * 0.8 
                    ? 'bg-yellow-600' 
                    : 'bg-green-600'
              }`} 
              style={{ width: `${Math.min(100, (currentParticipants / maxParticipants) * 100)}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}
