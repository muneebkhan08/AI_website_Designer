
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useCallback, useState, useRef, useEffect } from 'react';
import { PaperClipIcon, SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface InputAreaProps {
  onGenerate: (prompt: string, file?: File) => void;
  isGenerating: boolean;
  disabled?: boolean;
}

const SuggestionChip = ({ text, onClick }: { text: string, onClick: () => void }) => (
    <button 
        onClick={onClick}
        className="px-3 py-1.5 text-xs text-zinc-400 bg-zinc-800/50 hover:bg-zinc-700 hover:text-zinc-200 border border-zinc-700 rounded-full transition-colors text-left"
    >
        {text}
    </button>
);

export const InputArea: React.FC<InputAreaProps> = ({ onGenerate, isGenerating, disabled = false }) => {
  const [prompt, setPrompt] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [prompt]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setAttachedFile(e.target.files[0]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isGenerating) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        setAttachedFile(e.dataTransfer.files[0]);
    }
  }, [disabled, isGenerating]);

  const handleSubmit = () => {
      if (!prompt.trim() && !attachedFile) return;
      onGenerate(prompt, attachedFile || undefined);
      setPrompt("");
      setAttachedFile(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSubmit();
      }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 relative z-20">
      
      <div 
        className={`
            relative flex flex-col
            bg-zinc-900/80 backdrop-blur-xl
            rounded-2xl border transition-all duration-300
            ${isDragging ? 'border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.2)]' : 'border-zinc-700 shadow-2xl'}
            ${isGenerating ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
      >
        
        {/* Attached File Preview */}
        {attachedFile && (
            <div className="mx-4 mt-4 p-2 bg-zinc-800/50 rounded-lg flex items-center justify-between border border-zinc-700/50 group">
                <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="w-8 h-8 bg-zinc-700 rounded flex items-center justify-center shrink-0">
                        {attachedFile.type.includes('image') ? (
                            <img src={URL.createObjectURL(attachedFile)} className="w-full h-full object-cover rounded" alt="preview" />
                        ) : (
                            <PaperClipIcon className="w-4 h-4 text-zinc-400" />
                        )}
                    </div>
                    <span className="text-sm text-zinc-300 truncate">{attachedFile.name}</span>
                </div>
                <button 
                    onClick={() => setAttachedFile(null)}
                    className="p-1 hover:bg-zinc-700 rounded-full text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                    <XMarkIcon className="w-4 h-4" />
                </button>
            </div>
        )}

        {/* Text Input Area */}
        <div className="p-2">
            <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your website idea (e.g. 'A modern landing page for a coffee shop')..."
                className="w-full bg-transparent text-white placeholder-zinc-500 text-lg px-4 py-3 focus:outline-none resize-none min-h-[60px] max-h-[200px]"
                rows={1}
                disabled={isGenerating}
            />
        </div>

        {/* Toolbar */}
        <div className="px-4 pb-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors group flex items-center gap-2"
                    title="Attach sketch or wireframe"
                >
                    <PaperClipIcon className="w-5 h-5" />
                    <span className="text-xs font-medium hidden group-hover:inline transition-all">Add Sketch</span>
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*,application/pdf"
                    className="hidden"
                />
            </div>

            <button
                onClick={handleSubmit}
                disabled={(!prompt.trim() && !attachedFile) || isGenerating}
                className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
                    ${(!prompt.trim() && !attachedFile) 
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20 hover:shadow-indigo-900/40'
                    }
                `}
            >
                {isGenerating ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                    <>
                        <SparklesIcon className="w-4 h-4" />
                        <span>Generate Website</span>
                    </>
                )}
            </button>
        </div>
      </div>

      {/* Drag Overlay */}
      {isDragging && (
          <div className="absolute inset-0 m-4 rounded-xl border-2 border-dashed border-indigo-500 bg-zinc-900/90 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-indigo-400 pointer-events-none">
              <PaperClipIcon className="w-10 h-10 mb-2" />
              <span className="font-medium">Drop sketch to attach</span>
          </div>
      )}

      {/* Suggestions */}
      {!isGenerating && !prompt && !attachedFile && (
        <div className="mt-6 flex flex-wrap justify-center gap-3">
            <SuggestionChip text="SaaS Dashboard & Analytics" onClick={() => setPrompt("Professional SaaS dashboard with sidebar navigation, analytics charts, and data tables.")} />
            <SuggestionChip text="E-Commerce Fashion Store" onClick={() => setPrompt("Modern fashion store with hero video, featured collections, and product grid.")} />
            <SuggestionChip text="Digital Agency Portfolio" onClick={() => setPrompt("Bold digital agency site with large typography, project case studies, and dark mode.")} />
            <SuggestionChip text="Real Estate Listing Platform" onClick={() => setPrompt("Clean real estate platform with property search map, listing cards, and agent profiles.")} />
        </div>
      )}

    </div>
  );
};
