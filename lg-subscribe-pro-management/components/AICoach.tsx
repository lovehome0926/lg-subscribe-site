
import React, { useState } from 'react';
import { Sparkles, Send, Copy, Zap, Info, ExternalLink, Globe } from 'lucide-react';
import { Translation, LanguageCode, GroundingSource } from '../types';
import { getAICoachResponse } from '../services/geminiService';

interface AICoachProps {
  translations: Translation;
  language: LanguageCode;
}

export const AICoach: React.FC<AICoachProps> = ({ translations, language }) => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState<string>('');
  const [sources, setSources] = useState<GroundingSource[] | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const handleConsult = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResponse('');
    setSources(undefined);
    
    const result = await getAICoachResponse(input, language);
    setResponse(result.text);
    setSources(result.sources);
    setLoading(false);
  };

  const copyToClipboard = () => {
    if (response) {
      navigator.clipboard.writeText(response);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-[#A50034] to-[#E60045] p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <h2 className="text-2xl font-black mb-1 flex items-center gap-2"><Zap size={24} /> {translations.aiCoach}</h2>
        <p className="text-[11px] font-bold opacity-80 uppercase leading-relaxed">{translations.aiInstruction}</p>
        <Sparkles className="absolute -right-4 -bottom-4 opacity-10 w-32 h-32 rotate-12" />
      </div>

      <div className="bg-white rounded-3xl p-5 shadow-xl border border-gray-50">
        <textarea 
          className="w-full bg-gray-50 rounded-2xl p-4 text-sm font-bold border-0 outline-none min-h-[140px] resize-none ring-1 ring-gray-100 focus:ring-2 focus:ring-[#A50034] transition-all"
          placeholder={translations.aiPlaceholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button 
          onClick={handleConsult}
          disabled={loading || !input}
          className={`w-full mt-4 py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-sm shadow-lg transition-all ${loading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#A50034] text-white active:scale-95'}`}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              {translations.thinking}
            </div>
          ) : (
            <><Send size={18} /> {translations.expertBtn}</>
          )}
        </button>
      </div>

      {response && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-red-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Info size={16} className="text-[#A50034]" />
              <span className="font-black text-xs text-gray-400 uppercase tracking-widest">AI Mentor Insight</span>
            </div>
            <button 
              onClick={copyToClipboard}
              className="text-[10px] font-black text-[#A50034] uppercase tracking-widest bg-red-50 px-3 py-1.5 rounded-full flex items-center gap-1 active:bg-red-100"
            >
              <Copy size={12} /> {translations.copy}
            </button>
          </div>
          
          <div className="text-gray-700 text-[13px] font-medium leading-relaxed whitespace-pre-wrap p-4 bg-gray-50 rounded-2xl border border-gray-100 italic">
            {response}
          </div>

          {sources && sources.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <Globe size={14} className="text-[#A50034]" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{translations.sources}</span>
              </div>
              <div className="flex flex-col gap-2">
                {sources.map((source, idx) => (
                  <a 
                    key={idx} 
                    href={source.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-gray-50 hover:bg-red-50 rounded-xl transition-all group border border-transparent hover:border-red-100"
                  >
                    <span className="text-[11px] font-bold text-gray-600 truncate mr-4 group-hover:text-[#A50034]">{source.title}</span>
                    <ExternalLink size={12} className="text-gray-300 group-hover:text-[#A50034] shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
