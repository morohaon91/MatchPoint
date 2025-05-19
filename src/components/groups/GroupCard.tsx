'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Group } from '@/lib/types/models';

interface GroupCardProps {
  group: Group;
  isAdmin?: boolean;
  isOrganizer?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

/**
 * GroupCard component displays a group's information in a card format
 */
export default function GroupCard({
  group,
  isAdmin = false,
  isOrganizer = false,
  onEdit,
  onDelete
}: GroupCardProps) {
  const canManage = isAdmin || isOrganizer;
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-40 bg-gray-200">
        {group.photoURL ? (
          <Image
            src={group.photoURL}
            alt={group.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-blue-100">
            <span className="text-4xl font-bold text-blue-500">
              {group.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{group.name}</h3>
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
            {group.sport}
          </span>
        </div>
        
        {group.description && (
          <p className="text-gray-600 text-sm mt-2 line-clamp-2">{group.description}</p>
        )}
        
        <div className="mt-4 flex items-center text-sm text-gray-500">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 mr-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
            />
          </svg>
          <span>{group.memberCount || 0} members</span>
          
          {group.location && (
            <>
              <span className="mx-2">•</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 mr-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
                />
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
                />
              </svg>
              <span>{group.location}</span>
            </>
          )}
        </div>
        
        <div className="mt-4 flex justify-between">
          <Link 
            href={`/app/groups/${group.id}`}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            View Details
          </Link>
          
          {canManage && (
            <div className="flex space-x-2">
              {onEdit && (
                <button 
                  onClick={onEdit}
                  className="text-gray-600 hover:text-gray-800"
                  aria-label="Edit group"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
                    />
                  </svg>
                </button>
              )}
              
              {isAdmin && onDelete && (
                <button 
                  onClick={onDelete}
                  className="text-red-600 hover:text-red-800"
                  aria-label="Delete group"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                    />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
