/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useState } from 'react';
import { ArrowDownTrayIcon, PlusIcon, Square2StackIcon, CommandLineIcon, PlayIcon } from '@heroicons/react/24/outline';
import { Creation } from './CreationHistory';

interface LivePreviewProps {
  creation: Creation | null;
  isLoading: boolean;
  isFocused: boolean;
  onReset: () => void;
}

const LoadingStep = ({ text, active, completed }: { text: string, active: boolean, completed: boolean }) => (
    <div className={`flex items-center space-x-3 transition-all duration-500 ${active || completed ? 'opacity-100 translate-x-0' : 'opacity-30 translate-x-4'}`}>
        <div className={`w-4 h-4 flex items-center justify-center ${completed ? 'text-green-400' : active ? 'text-indigo-400' : 'text-zinc-700'}`}>
            {completed ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            ) : active ? (
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></div>
            ) : (
                <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full"></div>
            )}
        </div>
        <span className={`font-mono text-xs tracking-wide uppercase ${active ? 'text-zinc-200' : completed ? 'text-zinc-400 line-through' : 'text-zinc-600'}`}>{text}</span>
    </div>
);

export const LivePreview: React.FC<LivePreviewProps> = ({ creation, isLoading, isFocused, onReset }) => {
    const [loadingStep, setLoadingStep] = useState(0);
    const [selectedVersionIndex, setSelectedVersionIndex] = useState<number | null>(null); // null means "Show All"
    const [activeVersions, setActiveVersions] = useState<any[]>([]);

    // Pages to preview in the multi-screen view
    const PREVIEW_PAGES = [
        { id: '#page-home', label: 'Home' },
        { id: '#page-features', label: 'Features' },
        { id: '#page-contact', label: 'Contact' }
    ];

    // Loading Simulation
    useEffect(() => {
        if (isLoading) {
            setLoadingStep(0);
            const interval = setInterval(() => {
                setLoadingStep(prev => (prev < 4 ? prev + 1 : prev));
            }, 2000); 
            return () => clearInterval(interval);
        } else {
            setLoadingStep(0);
        }
    }, [isLoading]);

    // Parse versions from creation object
    useEffect(() => {
        if (creation) {
            if (creation.versions && creation.versions.length > 0) {
                setActiveVersions(creation.versions);
                setSelectedVersionIndex(null); // Default to "Show All" view
            } else if (creation.html) {
                // Legacy support for single html
                setActiveVersions([{
                    themeName: "Standard Theme",
                    description: "Original Design",
                    html: creation.html
                }]);
                setSelectedVersionIndex(0);
            }
        } else {
            setActiveVersions([]);
        }
    }, [creation]);

    const handleDownloadHtml = (html: string, suffix: string) => {
        if (!creation) return;
        const blob = new Blob([html], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${creation.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${suffix}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleDownloadPrompt = (html: string, themeName: string) => {
        // Extract content from <script id="design-prompt-data">
        const match = html.match(/<script id="design-prompt-data" type="text\/plain">([\s\S]*?)<\/script>/);
        let promptText = "";
        
        if (match && match[1]) {
            promptText = match[1].trim();
        } else {
            promptText = "Design prompt not found in the generated file.";
        }

        const blob = new Blob([promptText], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `PROMPT_${themeName.replace(/[^a-z0-9]/gi, '_')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
    <div
      className={`
        fixed z-40 flex flex-col
        rounded-lg overflow-hidden border border-zinc-800 bg-[#0E0E10] shadow-2xl
        transition-all duration-700 cubic-bezier(0.2, 0.8, 0.2, 1)
        ${isFocused
          ? 'inset-2 md:inset-4 opacity-100 scale-100'
          : 'top-1/2 left-1/2 w-[90%] h-[60%] -translate-x-1/2 -translate-y-1/2 opacity-0 scale-95 pointer-events-none'
        }
      `}
    >
      {/* Header */}
      <div className="bg-[#121214] px-4 py-3 flex items-center justify-between border-b border-zinc-800 shrink-0 h-14">
        <div className="flex items-center space-x-4">
             {/* Window Controls */}
            <div className="flex space-x-2 group/controls mr-4">
                <button 
                  onClick={onReset}
                  className="w-3 h-3 rounded-full bg-zinc-700 group-hover/controls:bg-red-500 hover:!bg-red-600 transition-colors flex items-center justify-center focus:outline-none"
                />
                <div className="w-3 h-3 rounded-full bg-zinc-700 group-hover/controls:bg-yellow-500 transition-colors"></div>
                <div className="w-3 h-3 rounded-full bg-zinc-700 group-hover/controls:bg-green-500 transition-colors"></div>
           </div>

           {/* Version Tabs */}
           {!isLoading && activeVersions.length > 1 && (
               <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                   <button
                        onClick={() => setSelectedVersionIndex(null)}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${selectedVersionIndex === null ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                   >
                       <Square2StackIcon className="w-4 h-4 inline-block mr-1.5 align-text-bottom" />
                       Compare Themes
                   </button>
                   {activeVersions.map((v, idx) => (
                       <button
                            key={idx}
                            onClick={() => setSelectedVersionIndex(idx)}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center ${selectedVersionIndex === idx ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                       >
                           {v.themeName}
                       </button>
                   ))}
               </div>
           )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center justify-end space-x-3">
             {selectedVersionIndex !== null && activeVersions[selectedVersionIndex] && (
                 <>
                    <button 
                        onClick={() => handleDownloadPrompt(activeVersions[selectedVersionIndex].html, activeVersions[selectedVersionIndex].themeName)}
                        className="flex items-center space-x-2 text-zinc-400 hover:text-white transition-colors"
                        title="Download the prompt to recreate this design"
                    >
                        <CommandLineIcon className="w-4 h-4" />
                        <span className="text-xs font-medium hidden sm:inline">Copy Prompt</span>
                    </button>
                    <button 
                        onClick={() => handleDownloadHtml(activeVersions[selectedVersionIndex].html, activeVersions[selectedVersionIndex].themeName)}
                        className="flex items-center space-x-2 text-zinc-400 hover:text-white transition-colors"
                    >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        <span className="text-xs font-medium hidden sm:inline">Download HTML</span>
                    </button>
                 </>
             )}
             
             <button 
                onClick={onReset}
                className="flex items-center space-x-1 text-xs font-bold bg-white text-black hover:bg-zinc-200 px-3 py-1.5 rounded-md transition-colors"
            >
                <PlusIcon className="w-3 h-3" />
                <span className="hidden sm:inline">New</span>
            </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative w-full flex-1 bg-[#09090b] flex overflow-hidden">
        
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 w-full z-20 bg-[#09090b]">
             <div className="w-full max-w-md space-y-8">
                <div className="flex flex-col items-center">
                    <div className="relative w-16 h-16 mb-6">
                         <div className="absolute inset-0 rounded-full border-4 border-zinc-800"></div>
                         <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                    </div>
                    <h3 className="text-zinc-100 font-mono text-lg tracking-tight">Architecting Design System</h3>
                    <p className="text-zinc-500 text-sm mt-2">Generating 3 distinct professional themes...</p>
                </div>
                 <div className="border border-zinc-800 bg-black/50 rounded-lg p-5 space-y-4 font-mono text-sm shadow-xl">
                     <LoadingStep text="Analyzing user intent" active={loadingStep === 0} completed={loadingStep > 0} />
                     <LoadingStep text="Selecting 3 premium themes" active={loadingStep === 1} completed={loadingStep > 1} />
                     <LoadingStep text="Generating multi-page flows" active={loadingStep === 2} completed={loadingStep > 2} />
                     <LoadingStep text="Finalizing responsive mockups" active={loadingStep === 3} completed={loadingStep > 3} />
                 </div>
             </div>
          </div>
        )}

        {/* Gallery View (Comparison Mode) */}
        {!isLoading && selectedVersionIndex === null && (
            <div className="w-full h-full overflow-y-auto overflow-x-hidden p-8 bg-dot-grid">
                <div className="flex flex-col space-y-12 max-w-7xl mx-auto">
                    {activeVersions.map((version, idx) => (
                        <div key={idx} className="flex flex-col space-y-4">
                            {/* Theme Header */}
                            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                                <div>
                                    <h3 className="text-xl font-bold text-white tracking-tight">{version.themeName}</h3>
                                    <p className="text-zinc-500 text-sm">{version.description}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => handleDownloadPrompt(version.html, version.themeName)}
                                        className="text-xs text-zinc-500 hover:text-indigo-400 flex items-center space-x-1 px-3 py-1.5 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all"
                                    >
                                        <CommandLineIcon className="w-3 h-3" />
                                        <span>Save Prompt</span>
                                    </button>
                                    <button 
                                        onClick={() => setSelectedVersionIndex(idx)}
                                        className="flex items-center space-x-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold transition-all"
                                    >
                                        <PlayIcon className="w-3 h-3" />
                                        <span>Preview Flow</span>
                                    </button>
                                </div>
                            </div>
                            
                            {/* Multi-Screen Row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {PREVIEW_PAGES.map((page, pIdx) => (
                                    <div key={pIdx} className="flex flex-col space-y-2">
                                        <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider pl-1">{page.label}</span>
                                        <div 
                                            className="relative w-full aspect-[9/16] md:aspect-[3/4] lg:aspect-[4/3] bg-white rounded-lg overflow-hidden shadow-lg border border-zinc-700 group cursor-pointer hover:ring-2 ring-indigo-500/50 transition-all"
                                            onClick={() => setSelectedVersionIndex(idx)}
                                        >
                                            {/* Blocker */}
                                            <div className="absolute inset-0 z-10 bg-transparent group-hover:bg-indigo-500/5 transition-colors"></div>
                                            
                                            {/* Scaled Iframe */}
                                            <div 
                                                className="w-[400%] h-[400%] origin-top-left transform scale-[0.25]"
                                                style={{ transform: 'scale(0.25)' }}
                                            >
                                                <iframe
                                                    srcDoc={version.html}
                                                    className="w-full h-full border-none bg-white"
                                                    title={`${version.themeName} - ${page.label}`}
                                                    sandbox="allow-scripts"
                                                    onLoad={(e) => {
                                                        // Force hash navigation when loaded
                                                        const iframe = e.target as HTMLIFrameElement;
                                                        if (iframe.contentWindow) {
                                                            iframe.contentWindow.location.hash = page.id;
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Focused View (Interactive Preview) */}
        {!isLoading && selectedVersionIndex !== null && activeVersions[selectedVersionIndex] && (
            <div className="w-full h-full flex flex-col">
                <div className="flex-1 relative bg-zinc-900/50">
                    <iframe
                        srcDoc={activeVersions[selectedVersionIndex].html}
                        className="w-full h-full border-none bg-white"
                        title="Full Preview"
                        sandbox="allow-scripts allow-forms allow-popups allow-modals allow-same-origin"
                    />
                </div>
            </div>
        )}

      </div>
    </div>
  );
};