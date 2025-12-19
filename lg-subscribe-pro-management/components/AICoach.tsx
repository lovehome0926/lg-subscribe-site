
import React, { useState } from 'react';
import { Sparkles, Send, Copy, Zap, Info } from 'lucide-react';
import { Translation, LanguageCode } from '../types';
import { getAICoachResponse } from '../services/geminiService';

interface AICoachProps {
  translations: Translation;
  language: LanguageCode;
}

export const AICoach: React.FC<AICoachProps> = ({ translations, language }) => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConsult = async () => {
    if (!input.trim()) return;
    setLoading(true);
    const result = await getAICoachResponse(input, language);
    setResponse(result);
    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(response);
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
        </div>
      )}
    </div>
  );
};
