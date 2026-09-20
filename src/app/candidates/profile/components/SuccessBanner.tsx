/**
 * SuccessBanner Component
 * 
 * Displays success messages with dismiss functionality.
 */

import React from 'react';

interface SuccessBannerProps {
  message: string;
  onDismiss: () => void;
}

export function SuccessBanner({ message, onDismiss }: SuccessBannerProps) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start justify-between">
      <div className="flex items-start">
        <svg className="h-5 w-5 text-green-400 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <p className="text-sm text-green-800">{message}</p>
      </div>
      <button
        onClick={onDismiss}
        className="text-green-400 hover:text-green-600 focus:outline-none"
        aria-label="Dismiss success message"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}
