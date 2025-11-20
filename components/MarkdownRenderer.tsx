import React from 'react';

interface MarkdownRendererProps {
  content: string;
  highlightTerms: string[]; // Terms to auto-highlight
  onTermClick: (term: string) => void;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, highlightTerms, onTermClick }) => {
  // A very basic formatter to handle paragraphs, bolding, and code blocks safely.
  // In a real app, we would use react-markdown with a custom plugin.
  // Here we implement a simple parser to satisfy the "no npm install" constraint while providing functionality.

  const renderTextWithHighlights = (text: string) => {
    if (!highlightTerms.length) return text;

    // Create a regex that matches any of the terms (case insensitive)
    // Escape regex characters in terms
    const escapedTerms = highlightTerms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`\\b(${escapedTerms.join('|')})\\b`, 'gi');

    const parts = text.split(regex);
    
    return parts.map((part, i) => {
      const isMatch = highlightTerms.some(term => term.toLowerCase() === part.toLowerCase());
      if (isMatch) {
        return (
          <span 
            key={i} 
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering other text selection
              onTermClick(part);
            }}
            className="highlight-concept text-indigo-700 font-medium px-0.5 rounded relative group"
            title="Click to define"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const lines = content.split('\n');
  
  return (
    <div className="space-y-4 text-gray-800 leading-relaxed">
      {lines.map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={index} className="h-2" />; // Spacer

        // Headers
        if (trimmed.startsWith('### ')) {
          return <h3 key={index} className="text-lg font-bold text-gray-900 mt-4">{renderTextWithHighlights(trimmed.replace('### ', ''))}</h3>;
        }
        if (trimmed.startsWith('## ')) {
          return <h2 key={index} className="text-xl font-bold text-gray-900 mt-5">{renderTextWithHighlights(trimmed.replace('## ', ''))}</h2>;
        }
        
        // Bullet points
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
           return (
             <div key={index} className="flex items-start ml-4">
               <span className="mr-2 text-indigo-500">•</span>
               <span>{renderTextWithHighlights(trimmed.substring(2))}</span>
             </div>
           );
        }

        // Code blocks (simplified)
        if (trimmed.startsWith('```')) {
          return null; // Skip opening/closing fence for simplicity in this basic parser
        }

        return <p key={index}>{renderTextWithHighlights(trimmed)}</p>;
      })}
    </div>
  );
};

export default MarkdownRenderer;