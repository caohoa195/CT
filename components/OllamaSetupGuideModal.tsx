import React, { useState } from 'react';
import { Terminal, Copy, Check, X, ShieldAlert, Cpu, Sparkles, ExternalLink } from 'lucide-react';
import { OLLAMA_SUPPORTED_MODELS } from '../services/ollamaService';

interface OllamaSetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeModelTag?: string;
}

const OllamaSetupGuideModal: React.FC<OllamaSetupGuideModalProps> = ({
  isOpen,
  onClose,
  activeModelTag = 'qwen2.5-coder:7b',
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-xs">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Hướng dẫn chạy Ollama Cục bộ & Kéo Model
              </h3>
              <p className="text-xs text-slate-500">
                Chạy 100% offline trên máy cá nhân, bảo mật dữ liệu tuyệt đối và không tốn phí API
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          {/* Step 1: Install Ollama */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">1</span>
              <span>Cài đặt Ollama (nếu máy bạn chưa có)</span>
            </div>
            <p className="text-xs text-slate-600 pl-8">
              Tải và cài đặt miễn phí tại trang chính thức{' '}
              <a
                href="https://ollama.com/download"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 font-medium hover:underline inline-flex items-center gap-1"
              >
                ollama.com/download <ExternalLink className="w-3 h-3" />
              </a>{' '}
              (hỗ trợ Windows, macOS và Linux).
            </p>
          </div>

          {/* Step 2: Enable CORS */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">2</span>
              <span>Cấu hình cho phép Trình duyệt kết nối (CORS)</span>
            </div>
            <p className="text-xs text-slate-600 pl-8">
              Để trình duyệt web có thể gửi yêu cầu trực tiếp tới Ollama ở cổng 11434, hãy bật biến môi trường <code className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-700 font-mono text-[11px]">OLLAMA_ORIGINS="*"</code>:
            </p>
            <div className="pl-8 space-y-2">
              {/* Windows CMD / Powershell */}
              <div className="p-3 bg-slate-900 rounded-xl text-slate-100 font-mono text-xs flex items-center justify-between">
                <div>
                  <span className="text-slate-400 select-none"># Windows (PowerShell):</span>
                  <div className="text-emerald-400 mt-1">$env:OLLAMA_ORIGINS="*"; ollama serve</div>
                </div>
                <button
                  onClick={() => copyToClipboard('$env:OLLAMA_ORIGINS="*"; ollama serve', 'cors_ps')}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors ml-2 shrink-0"
                  title="Sao chép"
                >
                  {copiedKey === 'cors_ps' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Mac / Linux */}
              <div className="p-3 bg-slate-900 rounded-xl text-slate-100 font-mono text-xs flex items-center justify-between">
                <div>
                  <span className="text-slate-400 select-none"># macOS / Linux (Terminal):</span>
                  <div className="text-emerald-400 mt-1">OLLAMA_ORIGINS="*" ollama serve</div>
                </div>
                <button
                  onClick={() => copyToClipboard('OLLAMA_ORIGINS="*" ollama serve', 'cors_bash')}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors ml-2 shrink-0"
                  title="Sao chép"
                >
                  {copiedKey === 'cors_bash' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Mẹo:</strong> Ứng dụng này đã tích hợp sẵn <em>Vite Proxy (/api/ollama)</em>. Nếu bạn dùng trên máy tính phát triển cục bộ, ứng dụng sẽ tự động chuyển tiếp mà không cần cấu hình CORS!
                </span>
              </div>
            </div>
          </div>

          {/* Step 3: Pull Requested Models */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">3</span>
              <span>Lệnh tải 4 mô hình cục bộ vào Ollama</span>
            </div>
            <p className="text-xs text-slate-600 pl-8">
              Mở Terminal / Command Prompt và chạy lệnh tương ứng với mô hình bạn muốn dùng:
            </p>

            <div className="pl-8 space-y-2.5">
              {OLLAMA_SUPPORTED_MODELS.map((m) => {
                const cmd = `ollama run ${m.tag}`;
                const isCurrent = activeModelTag === m.tag;
                return (
                  <div
                    key={m.id}
                    className={`p-3 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-indigo-50/50 border-indigo-300 shadow-xs'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{m.name}</span>
                        <span className="text-[10px] bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded-full">
                          {m.parameterSize}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] bg-indigo-600 text-white font-bold px-2 py-0.5 rounded-full">
                            Đang chọn
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500">{m.hardwareReq}</span>
                    </div>

                    <div className="flex items-center justify-between bg-slate-900 text-slate-100 font-mono text-xs px-3 py-2 rounded-lg">
                      <span className="text-emerald-400">{cmd}</span>
                      <button
                        onClick={() => copyToClipboard(cmd, m.id)}
                        className="p-1 text-slate-300 hover:text-white transition-colors"
                        title="Sao chép lệnh"
                      >
                        {copiedKey === m.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-1.5">{m.recommendedFor}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Đã hiểu, đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
};

export default OllamaSetupGuideModal;
