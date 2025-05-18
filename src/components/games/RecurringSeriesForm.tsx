'use client';

import React, { useState, useEffect } from 'react';
import { RecurringSeries } from '@/lib/types/models';

interface RecurringSeriesFormProps {
  initialData?: Partial<RecurringSeries>;
  onSubmit: (data: Partial<RecurringSeries>) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  groupId: string;
}

/**
 * RecurringSeriesForm component for creating or editing a recurring series
 */
export default function RecurringSeriesForm({
  initialData = {},
  onSubmit,
  onCancel,
  isSubmitting = false,
  groupId
}: RecurringSeriesFormProps) {
  const [formData, setFormData] = useState<Partial<RecurringSeries>>({
    groupId,
    frequency: 'weekly',
    dayOfWeek: new Date().getDay(),
    startDate: new Date().toISOString().split('T')[0],
    ...initialData
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Reset form when initialData changes
  useEffect(() => {
    setFormData({
      groupId,
      frequency: 'weekly',
      dayOfWeek: new Date().getDay(),
      startDate: new Date().toISOString().split('T')[0],
      ...initialData
    });
  }, [initialData, groupId]);
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    // Handle number inputs
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: value === '' ? undefined : Number(value) }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.frequency) {
      newErrors.frequency = 'Frequency is required';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (formData.dayOfWeek === undefined) {
      newErrors.dayOfWeek = 'Day of week is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };
  
  // Get day name from day number (0-6)
  const getDayName = (dayNumber: number): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNumber];
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">
          Frequency *
        </label>
        <select
          id="frequency"
          name="frequency"
          value={formData.frequency || 'weekly'}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
            errors.frequency ? 'border-red-500' : ''
          }`}
        >
          <option value="weekly">Weekly</option>
          <option value="biweekly">Bi-weekly</option>
          <option value="monthly">Monthly</option>
        </select>
        {errors.frequency && (
          <p className="mt-1 text-sm text-red-600">{errors.frequency}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="dayOfWeek" className="block text-sm font-medium text-gray-700">
          Day of Week *
        </label>
        <select
          id="dayOfWeek"
          name="dayOfWeek"
          value={formData.dayOfWeek}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
            errors.dayOfWeek ? 'border-red-500' : ''
          }`}
        >
          {[0, 1, 2, 3, 4, 5, 6].map(day => (
            <option key={day} value={day}>
              {getDayName(day)}
            </option>
          ))}
        </select>
        {errors.dayOfWeek && (
          <p className="mt-1 text-sm text-red-600">{errors.dayOfWeek}</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
            Start Date *
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate ? new Date(formData.startDate).toISOString().split('T')[0] : ''}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.startDate ? 'border-red-500' : ''
            }`}
          />
          {errors.startDate && (
            <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
            End Date (Optional)
          </label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={formData.endDate ? new Date(formData.endDate).toISOString().split('T')[0] : ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="timeOfDay" className="block text-sm font-medium text-gray-700">
          Time of Day *
        </label>
        <input
          type="time"
          id="timeOfDay"
          name="timeOfDay"
          value={formData.timeOfDay ? new Date(formData.timeOfDay).toISOString().split('T')[1].substring(0, 5) : ''}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
            errors.timeOfDay ? 'border-red-500' : ''
          }`}
        />
        {errors.timeOfDay && (
          <p className="mt-1 text-sm text-red-600">{errors.timeOfDay}</p>
        )}
      </div>
      
      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : initialData.id ? 'Update Series' : 'Create Series'}
        </button>
      </div>
    </form>
  );
}
