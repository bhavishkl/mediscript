import React, { useState, useEffect, useRef } from 'react';
import { DischargeData, INITIAL_DATA } from './types';
import { EditorForm } from './components/EditorForm';
import { PreviewDocument } from './components/PreviewDocument';
import { Download, RefreshCw, Eye, Edit3, Save } from 'lucide-react';
import { generateWordDocument } from './utils/wordGenerator';

const App: React.FC = () => {
  const [data, setData] = useState<DischargeData>(INITIAL_DATA);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isGenerating, setIsGenerating] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const STORAGE_KEY = 'dischargeSummaryData_v2';

  // Load from local storage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Basic validation to check if it matches v2 structure (arrays instead of object/string)
        if (Array.isArray(parsed.investigations) && Array.isArray(parsed.treatmentGiven)) {
             setData(parsed);
        } else {
             console.warn("Legacy data detected, starting fresh.");
        }
      } catch (e) {
        console.error("Failed to load saved data", e);
      }
    }
  }, []);

  // Save to local storage whenever data changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }, 1000); // Debounce save
    return () => clearTimeout(timeoutId);
  }, [data]);

  const handleReset = () => {
    if (window.confirm("Are you sure you want to clear all data?")) {
      setData(INITIAL_DATA);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleExportWord = async () => {
    setIsGenerating(true);
    try {
      await generateWordDocument(data);
    } catch (e) {
      console.error("Failed to generate Word document", e);
      alert("Failed to generate Word document");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Navbar */}
      <nav className="bg-teal-700 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <span className="font-bold text-xl tracking-tight">MediScript</span>
              <span className="ml-2 text-teal-200 text-sm hidden sm:inline-block">| Discharge Summary Generator</span>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleReset}
                className="p-2 rounded-md hover:bg-teal-600 transition-colors text-white"
                title="Reset Form"
              >
                <RefreshCw size={20} />
              </button>
              <button 
                onClick={handleExportWord}
                disabled={isGenerating}
                className="flex items-center gap-2 bg-white text-teal-800 px-4 py-2 rounded-md font-medium hover:bg-teal-50 transition-colors disabled:opacity-50"
              >
                <Download size={18} />
                {isGenerating ? 'Generating...' : 'Export Word'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 flex flex-col md:flex-row gap-6">
        
        {/* Mobile Tab Switcher */}
        <div className="md:hidden flex rounded-lg bg-white shadow p-1 mb-4">
          <button 
            onClick={() => setActiveTab('edit')}
            className={`flex-1 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 ${activeTab === 'edit' ? 'bg-teal-100 text-teal-800' : 'text-gray-500'}`}
          >
            <Edit3 size={16} /> Edit Data
          </button>
          <button 
            onClick={() => setActiveTab('preview')}
            className={`flex-1 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 ${activeTab === 'preview' ? 'bg-teal-100 text-teal-800' : 'text-gray-500'}`}
          >
            <Eye size={16} /> Preview
          </button>
        </div>

        {/* Editor Section */}
        <div className={`flex-1 min-w-0 ${activeTab === 'edit' ? 'block' : 'hidden md:block'}`}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Patient Data</h2>
            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded flex items-center gap-1">
              <Save size={12} /> Auto-saving
            </span>
          </div>
          <EditorForm data={data} onChange={setData} />
        </div>

        {/* Preview Section */}
        <div className={`flex-1 min-w-0 ${activeTab === 'preview' ? 'block' : 'hidden md:block'}`}>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-800">Document Preview</h2>
          </div>
          <div className="bg-gray-300 rounded-lg p-4 md:p-8 overflow-auto shadow-inner h-[calc(100vh-180px)] md:sticky md:top-24">
            <div className="transform scale-100 origin-top md:origin-top-left mx-auto">
               <PreviewDocument data={data} ref={previewRef} />
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default App;