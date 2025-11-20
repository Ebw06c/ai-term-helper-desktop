import React from 'react';
import { DefinitionData } from '../types';

interface DefinitionPanelProps {
  isOpen: boolean;
  isLoading: boolean;
  data: DefinitionData | null;
  onClose: () => void;
  onExploreRelated: (term: string) => void;
}

const DefinitionPanel: React.FC<DefinitionPanelProps> = ({ 
  isOpen, 
  isLoading, 
  data, 
  onClose,
  onExploreRelated
}) => {
  return (
    <div 
      className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 border-l border-gray-100 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="h-full flex flex-col p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-2 text-indigo-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            <span className="font-semibold text-sm tracking-wider uppercase">DeepDive Knowledge</span>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1">
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          ) : data ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">
                {data.term}
              </h2>
              
              <div className="prose prose-slate prose-sm text-gray-700 mb-6">
                <p className="leading-relaxed">{data.definition}</p>
              </div>

              {data.relatedTopics && data.relatedTopics.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                    Dig Deeper
                  </h3>
                  <div className="flex flex-col gap-2">
                    {data.relatedTopics.map((topic, idx) => (
                      <button
                        key={idx}
                        onClick={() => onExploreRelated(topic)}
                        className="text-left px-4 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium transition-colors flex justify-between items-center group"
                      >
                        {topic}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-gray-400 mt-10">
              <p>Select any text or click a highlighted term to see its definition.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DefinitionPanel;