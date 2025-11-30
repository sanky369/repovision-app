import React from 'react';
import { AppStatus } from '../types';

interface StepIndicatorProps {
  status: AppStatus;
}

const steps = [
  { id: AppStatus.FETCHING_REPO, label: "Scanning Repo" },
  { id: AppStatus.ANALYZING_ARCH, label: "Analyzing Architecture" },
  { id: AppStatus.GENERATING_IMAGE, label: "Sketching Diagram" },
];

export const StepIndicator: React.FC<StepIndicatorProps> = ({ status }) => {
  if (status === AppStatus.IDLE || status === AppStatus.COMPLETED || status === AppStatus.ERROR) return null;

  const currentIndex = steps.findIndex(s => s.id === status);

  return (
    <div className="w-full max-w-xl mx-auto my-8">
      <div className="flex justify-between items-center relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10 rounded"></div>
        {steps.map((step, idx) => {
          const isActive = idx === currentIndex;
          const isCompleted = idx < currentIndex;
          
          return (
            <div key={step.id} className="flex flex-col items-center gap-2 bg-gray-50 px-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300 ${
                isActive ? 'bg-indigo-600 text-white shadow-lg scale-110' : 
                isCompleted ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500'
              }`}>
                {isCompleted ? '✓' : idx + 1}
              </div>
              <span className={`text-xs font-medium ${isActive ? 'text-indigo-600' : 'text-gray-500'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="text-center mt-6">
         <span className="inline-block animate-pulse text-indigo-600 font-hand text-lg">
           Processing...
         </span>
      </div>
    </div>
  );
};