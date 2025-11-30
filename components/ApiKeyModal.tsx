import React from 'react';

interface ApiKeyModalProps {
  onSelectKey: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSelectKey }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center border border-gray-100">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11.536 11l-3.96 4.96a2 2 0 01-2.744.57l-1.465-1.465a2 2 0 01-.57-2.744L11 9.536A6 6 0 1015 7z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Access Required</h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          To generate high-quality architecture diagrams using <strong>Gemini 3 Pro Image Preview</strong>, you need to connect your Google Cloud project.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={onSelectKey}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Connect Google Cloud Project
          </button>
          
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block text-sm text-gray-500 hover:text-indigo-600 hover:underline mt-4"
          >
            Learn about billing & API keys
          </a>
        </div>
      </div>
    </div>
  );
};