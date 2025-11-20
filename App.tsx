import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message, Sender, DefinitionData, SelectionCoords } from './types';
import { searchTopic, defineTerm } from './services/geminiService';
import DefinitionPanel from './components/DefinitionPanel';
import MarkdownRenderer from './components/MarkdownRenderer';

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Definition State
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [definitionLoading, setDefinitionLoading] = useState(false);
  const [currentDefinition, setCurrentDefinition] = useState<DefinitionData | null>(null);

  // Text Selection State
  const [selectionCoords, setSelectionCoords] = useState<SelectionCoords | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: Sender.USER,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsSearching(true);
    setSelectionCoords(null); // Clear any popping buttons

    try {
      const { text, suggestedTerms } = await searchTopic(userMsg.text);
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: text,
        sender: Sender.AI,
        timestamp: Date.now(),
        suggestedTerms: suggestedTerms
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: Date.now().toString(),
        text: "Sorry, I encountered an error connecting to the knowledge base.",
        sender: Sender.AI,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle defining a specific term (clicked chip or selection)
  const handleDefine = async (term: string, sourceContext: string) => {
    setSelectionCoords(null); // Hide popup
    setIsPanelOpen(true);
    setDefinitionLoading(true);
    
    try {
      const result = await defineTerm(term, sourceContext);
      setCurrentDefinition({
        term,
        definition: result.definition,
        relatedTopics: result.related,
        context: sourceContext
      });
    } catch (error) {
      console.error(error);
    } finally {
      setDefinitionLoading(false);
    }
  };

  // Handle "Deep Dive" into a related topic
  const handleExploreRelated = (topic: string) => {
    setInput(topic);
    setIsPanelOpen(false);
    // Optional: Automatically submit. For now, let user confirm.
    // handleSend() would need input ref or state update effect.
  };

  // Listen for text selections within the chat area
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      
      // Basic validation
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
        setSelectionCoords(null);
        return;
      }

      const text = selection.toString().trim();
      if (text.length < 2 || text.length > 50) {
         // Ignore empty or too long selections (likely not a specific term)
         return;
      }

      // Get coordinates for the popup button
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      // Only show if inside chat container
      if (chatContainerRef.current && chatContainerRef.current.contains(range.commonAncestorContainer)) {
        setSelectionCoords({
          x: rect.left + (rect.width / 2),
          y: rect.top - 10, // Position slightly above
          text: text
        });
      } else {
        setSelectionCoords(null);
      }
    };

    document.addEventListener('selectionchange', handleSelection);
    return () => document.removeEventListener('selectionchange', handleSelection);
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex h-screen bg-slate-50 relative overflow-hidden">
      
      {/* Main Chat Area */}
      <main className={`flex-1 flex flex-col transition-all duration-300 ${isPanelOpen ? 'mr-0 sm:mr-96' : 'mr-0'}`}>
        
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-800">DeepDive AI</h1>
          </div>
          <div className="text-xs text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full hidden sm:block">
            Interactive Knowledge Engine
          </div>
        </header>

        {/* Messages */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 relative"
        >
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 opacity-70">
              <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-slate-600">Start your learning journey</h2>
              <p className="max-w-md mt-2">Ask about complex topics. I'll identify technical terms for you. Click highlighted words or select any text to get an instant definition.</p>
            </div>
          )}

          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.sender === Sender.USER ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[90%] sm:max-w-[80%] rounded-2xl p-5 shadow-sm ${
                msg.sender === Sender.USER 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white text-slate-800 border border-slate-100'
              }`}>
                
                {msg.sender === Sender.USER ? (
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                ) : (
                  <div className="relative">
                     <MarkdownRenderer 
                       content={msg.text} 
                       highlightTerms={msg.suggestedTerms || []}
                       onTermClick={(term) => handleDefine(term, msg.text)}
                     />
                     
                     {/* Suggested Terms Footer (Visual Indicator) */}
                     {msg.suggestedTerms && msg.suggestedTerms.length > 0 && (
                       <div className="mt-6 pt-4 border-t border-slate-100">
                         <p className="text-xs font-semibold text-slate-400 uppercase mb-2 tracking-wider">Key Concepts</p>
                         <div className="flex flex-wrap gap-2">
                           {msg.suggestedTerms.map(term => (
                             <button
                               key={term}
                               onClick={() => handleDefine(term, msg.text)}
                               className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-full hover:bg-indigo-100 transition-colors border border-indigo-100"
                             >
                               {term}
                             </button>
                           ))}
                         </div>
                       </div>
                     )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isSearching && (
             <div className="flex justify-start">
               <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2">
                 <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                 <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                 <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
               </div>
             </div>
          )}
        </div>

        {/* Floating "Explain" Button for Selection */}
        {selectionCoords && (
          <button
            style={{
              position: 'fixed',
              left: selectionCoords.x,
              top: selectionCoords.y,
              transform: 'translate(-50%, -100%)'
            }}
            className="bg-slate-900 text-white text-xs font-medium py-1.5 px-3 rounded-lg shadow-lg flex items-center gap-2 z-50 hover:bg-slate-800 hover:scale-105 transition-all"
            onMouseDown={(e) => {
              e.preventDefault(); // Prevent losing selection before click registers
              // Find context from the message history (simplified approximation: use the last AI message or just generic)
              // For better accuracy, we would find which message the text belongs to, but for this demo, 
              // we pass the selected text as its own context if specific message mapping is complex.
              handleDefine(selectionCoords.text, "User selected text context."); 
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-indigo-400">
              <path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 10.28a.75.75 0 000-1.06l-3-3a.75.75 0 10-1.06 1.06l1.72 1.72H8.25a.75.75 0 000 1.5h5.69l-1.72 1.72a.75.75 0 101.06 1.06l3-3z" />
            </svg>
            Explain "{selectionCoords.text.length > 15 ? selectionCoords.text.substring(0, 12) + '...' : selectionCoords.text}"
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
          </button>
        )}

        {/* Input Area */}
        <div className="bg-white p-4 border-t border-slate-200">
          <div className="max-w-4xl mx-auto relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about anything (e.g., 'Explain Quantum Computing')..."
              className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-700 shadow-sm placeholder-slate-400 transition-all"
              disabled={isSearching}
            />
            <button
              onClick={handleSend}
              disabled={isSearching || !input.trim()}
              className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
        </div>
      </main>

      {/* Sidebar */}
      <DefinitionPanel 
        isOpen={isPanelOpen} 
        isLoading={definitionLoading} 
        data={currentDefinition}
        onClose={() => setIsPanelOpen(false)}
        onExploreRelated={handleExploreRelated}
      />

      {/* Overlay on mobile when sidebar is open */}
      {isPanelOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 sm:hidden"
          onClick={() => setIsPanelOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default App;