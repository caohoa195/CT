import React from 'react';
import { Cpu, Check, AlertCircle, ChevronDown, Terminal, Sparkles } from 'lucide-react';
import { OllamaSettings, OllamaConnectionStatus } from '../types';
import { OLLAMA_SUPPORTED_MODELS, saveOllamaSettings } from '../services/ollamaService';

interface OllamaQuickBarProps {
  settings: OllamaSettings;
  onUpdateSettings: (settings: OllamaSettings) => void;
  status: OllamaConnectionStatus;
  onOpenOllamaTab: () => void;
  onOpenSetupGuide: () => void;
}

export const OllamaQuickBar: React.FC<OllamaQuickBarProps> = ({
  settings,
  onUpdateSettings,
  status,
  onOpenOllamaTab,
  onOpenSetupGuide,
}) => {
  const currentModel = OLLAMA_SUPPORTED_MODELS.find(
    (m) => m.tag === settings.model || m.aliases?.includes(settings.model)
  );

  const handleModelChange = (tag: string) => {
    const updated = { ...settings, model: tag };
    onUpdateSettings(updated);
    saveOllamaSettings(updated);
  };

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {/* Status indicator & Switcher */}
      <div className="flex items-center bg-slate-50 hover:bg-slate-100 border border-slate-200/90 rounded-xl px-2.5 py-1.5 transition-all text-xs">
        <button
          type="button"
          onClick={onOpenOllamaTab}
          className="flex items-center gap-1.5 font-bold text-slate-800 hover:text-indigo-600 transition-colors cursor-pointer mr-1.5"
          title="Mở bảng điều khiển Ollama AI"
        >
          <div className="relative">
            <Cpu className="w-3.5 h-3.5 text-indigo-600" />
            <span
              className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${
                status.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
          </div>
          <span className="hidden md:inline font-bold">Ollama AI:</span>
        </button>

        {/* Quick Model Selector */}
        <select
          value={settings.model}
          onChange={(e) => handleModelChange(e.target.value)}
          className="bg-transparent border-none text-xs font-semibold text-indigo-700 focus:outline-none cursor-pointer py-0.5 pr-1 max-w-[150px] truncate"
          title="Chọn model Ollama chạy cục bộ"
        >
          {OLLAMA_SUPPORTED_MODELS.map((m) => (
            <option key={m.id} value={m.tag}>
              {m.name}
            </option>
          ))}
          {status.availableModels
            .filter((tag) => !OLLAMA_SUPPORTED_MODELS.some((m) => m.tag === tag))
            .map((tag) => (
              <option key={tag} value={tag}>
                {tag} (Cài trên máy)
              </option>
            ))}
        </select>
      </div>

      {/* Guide button if disconnected */}
      {!status.isConnected && (
        <button
          type="button"
          onClick={onOpenSetupGuide}
          className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl transition-colors cursor-pointer"
          title="Xem hướng dẫn chạy Ollama và CORS"
        >
          <Terminal className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default OllamaQuickBar;
