import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Cpu, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Loader2, 
  Layers, 
  Settings2, 
  MessageSquare, 
  Terminal, 
  Sliders, 
  ArrowRight, 
  BookOpen, 
  Check, 
  Copy, 
  ChevronDown, 
  ChevronUp,
  FileCheck,
  Send,
  Zap,
  HardDrive,
  ExternalLink,
  ShieldCheck,
  Flame
} from 'lucide-react';
import { 
  CourseLesson, 
  CourseInfo, 
  OllamaSettings, 
  OllamaConnectionStatus, 
  OllamaModelInfo 
} from '../types';
import { 
  OLLAMA_SUPPORTED_MODELS, 
  checkOllamaConnection, 
  aiGenerateFullSyllabus, 
  aiBatchOptimizeSyllabus,
  callOllamaGenerate,
  saveOllamaSettings
} from '../services/ollamaService';

interface OllamaPanelProps {
  courseInfo: CourseInfo;
  lessons: CourseLesson[];
  onUpdateLessons: (lessons: CourseLesson[]) => void;
  onUpdateCourseInfo: (info: CourseInfo) => void;
  ollamaSettings: OllamaSettings;
  onUpdateSettings: (settings: OllamaSettings) => void;
  connectionStatus: OllamaConnectionStatus;
  onRefreshConnection: () => Promise<void>;
  onOpenSetupGuide: () => void;
}

type OllamaSubTab = 'create_full' | 'batch_optimize' | 'chat_assistant' | 'settings';

export const OllamaPanel: React.FC<OllamaPanelProps> = ({
  courseInfo,
  lessons,
  onUpdateLessons,
  onUpdateCourseInfo,
  ollamaSettings,
  onUpdateSettings,
  connectionStatus,
  onRefreshConnection,
  onOpenSetupGuide,
}) => {
  const [subTab, setSubTab] = useState<OllamaSubTab>('create_full');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');
  const [streamBuffer, setStreamBuffer] = useState('');
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Settings local state
  const [tempEndpoint, setTempEndpoint] = useState(ollamaSettings.endpoint);
  const [tempModel, setTempModel] = useState(ollamaSettings.model);
  const [tempProxy, setTempProxy] = useState(ollamaSettings.useProxy);
  const [customModelInput, setCustomModelInput] = useState('');

  // Workflow A: Create full syllabus
  const [targetLessonCount, setTargetLessonCount] = useState<number>(10);
  const [extraPedagogicalNeeds, setExtraPedagogicalNeeds] = useState(
    'Tập trung phương pháp tích cực: Thảo luận nhóm, Dạy học giải quyết vấn đề và Nghiên cứu tình huống (Case study).'
  );
  const [generatedCandidateLessons, setGeneratedCandidateLessons] = useState<CourseLesson[] | null>(null);

  // Workflow C: Chat Assistant
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: `Xin chào Quý Thầy/Cô! Tôi là Trợ lý Sư phạm AI kết nối qua Ollama cục bộ. Thầy/Cô có thể yêu cầu tôi gợi ý phương pháp dạy học, thiết kế chuẩn đầu ra (CĐR/CLO), ma trận kiểm tra đánh giá hoặc soạn nhanh các tình huống thảo luận cho học phần "${courseInfo.courseName}".`,
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatGenerating, setIsChatGenerating] = useState(false);

  // Sync settings when props change
  useEffect(() => {
    setTempEndpoint(ollamaSettings.endpoint);
    setTempModel(ollamaSettings.model);
    setTempProxy(ollamaSettings.useProxy);
  }, [ollamaSettings]);

  const handleSelectModel = (tag: string) => {
    const updated = { ...ollamaSettings, model: tag };
    onUpdateSettings(updated);
    saveOllamaSettings(updated);
  };

  const handleSaveSettings = () => {
    const finalModel = customModelInput.trim() || tempModel;
    const updated: OllamaSettings = {
      ...ollamaSettings,
      endpoint: tempEndpoint.trim(),
      model: finalModel,
      useProxy: tempProxy,
    };
    onUpdateSettings(updated);
    saveOllamaSettings(updated);
    onRefreshConnection();
    setSuccessNotice('Đã lưu cấu hình kết nối Ollama!');
    setTimeout(() => setSuccessNotice(null), 3000);
  };

  // Action: Generate Full Syllabus
  const handleGenerateFullSyllabus = async () => {
    setIsGenerating(true);
    setErrorNotice(null);
    setSuccessNotice(null);
    setStreamBuffer('');
    setGenerationProgress(`Đang gửi yêu cầu đến ${ollamaSettings.model}...`);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const generated = await aiGenerateFullSyllabus({
        settings: ollamaSettings,
        courseInfo,
        totalLessons: targetLessonCount,
        extraRequirements: extraPedagogicalNeeds,
        onToken: (_token, accumulated) => {
          setStreamBuffer(accumulated);
          setGenerationProgress(`Đang nhận phản hồi từ Ollama (${accumulated.length} ký tự)...`);
        },
        signal: controller.signal,
      });

      setGeneratedCandidateLessons(generated);
      setSuccessNotice(`Đã tạo thành công ${generated.length} bài học có cấu trúc chuẩn! Xem trước bên dưới.`);
    } catch (e: any) {
      if (e.name === 'AbortError') {
        setErrorNotice('Đã hủy quá trình tạo nội dung.');
      } else {
        console.error(e);
        setErrorNotice(e.message || 'Lỗi khi gọi mô hình Ollama. Hãy kiểm tra kết nối.');
      }
    } finally {
      setIsGenerating(false);
      setAbortController(null);
    }
  };

  // Action: Apply generated lessons to app state
  const handleApplyGeneratedLessons = () => {
    if (!generatedCandidateLessons) return;
    onUpdateLessons(generatedCandidateLessons);
    setGeneratedCandidateLessons(null);
    setSuccessNotice(`Đã nạp ${generatedCandidateLessons.length} bài học vào Kế hoạch giảng dạy! Bạn có thể chuyển sang tab Xem trước hoặc Biên soạn.`);
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  // Action: Batch optimize current syllabus
  const handleBatchOptimize = async () => {
    if (lessons.length === 0) {
      setErrorNotice('Chưa có bài học nào để tối ưu. Hãy thêm bài học hoặc nạp mẫu trước.');
      return;
    }

    setIsGenerating(true);
    setErrorNotice(null);
    setSuccessNotice(null);
    setStreamBuffer('');
    setGenerationProgress(`Đang rà soát và nâng cấp ${lessons.length} bài học với ${ollamaSettings.model}...`);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const optimized = await aiBatchOptimizeSyllabus({
        settings: ollamaSettings,
        lessons,
        courseInfo,
        onToken: (_token, accumulated) => {
          setStreamBuffer(accumulated);
        },
        signal: controller.signal,
      });

      onUpdateLessons(optimized);
      setSuccessNotice(`Đã tối ưu hóa và cập nhật thành công toàn bộ ${optimized.length} bài học!`);
    } catch (e: any) {
      if (e.name === 'AbortError') {
        setErrorNotice('Đã hủy quá trình.');
      } else {
        console.error(e);
        setErrorNotice(e.message || 'Lỗi khi tối ưu bài học với Ollama.');
      }
    } finally {
      setIsGenerating(false);
      setAbortController(null);
    }
  };

  // Action: Chat Assistant
  const handleSendChatMessage = async () => {
    if (!inputMessage.trim() || isChatGenerating) return;

    const userText = inputMessage.trim();
    setInputMessage('');
    const newHistory = [...chatMessages, { role: 'user' as const, content: userText }];
    setChatMessages(newHistory);
    setIsChatGenerating(true);

    try {
      const systemPrompt = `Bạn là cố vấn phương pháp giảng dạy đại học chuyên nghiệp tại Việt Nam.
Môn học hiện tại: "${courseInfo.courseName}" (${courseInfo.credits} tín chỉ, Khoa: ${courseInfo.facultyName}).
Số bài học trong đề cương: ${lessons.length} bài.
Hãy đưa ra câu trả lời chi tiết, sư phạm, thiết thực, có ví dụ cụ thể cho giảng viên.`;

      const promptWithHistory = newHistory
        .map((m) => `${m.role === 'user' ? 'Giảng viên' : 'Trợ lý Sư phạm'}: ${m.content}`)
        .join('\n\n') + '\n\nTrợ lý Sư phạm:';

      let replyAccumulated = '';
      setChatMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      await callOllamaGenerate({
        settings: ollamaSettings,
        prompt: promptWithHistory,
        systemPrompt,
        onToken: (_token, accumulated) => {
          replyAccumulated = accumulated;
          setChatMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = { role: 'assistant', content: accumulated };
            return next;
          });
        },
      });
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Lỗi kết nối Ollama: ${err.message}` },
      ]);
    } finally {
      setIsChatGenerating(false);
    }
  };

  const handleCancelGeneration = () => {
    if (abortController) {
      abortController.abort();
    }
  };

  const activeModelMeta = OLLAMA_SUPPORTED_MODELS.find(
    (m) => m.tag === ollamaSettings.model || m.aliases?.includes(ollamaSettings.model)
  );

  return (
    <div className="space-y-6">
      {/* 1. Header Card: Ollama Server Status & Model Badge */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl text-white shadow-md">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-slate-900">
                  Chạy Cục Bộ với Ollama (Local AI)
                </h2>
                {connectionStatus.isConnected ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Đang kết nối ({connectionStatus.latencyMs}ms)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Chưa kết nối Ollama
                  </span>
                )}
                <span className="text-[11px] bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-md border border-indigo-100">
                  100% Offline • Bảo mật
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Mô hình đang chọn:{' '}
                <strong className="text-indigo-700 font-semibold">
                  {activeModelMeta ? activeModelMeta.name : ollamaSettings.model}
                </strong>{' '}
                • Endpoint:{' '}
                <code className="text-slate-600 font-mono text-[11px]">
                  {ollamaSettings.useProxy ? '/api/ollama (Vite Proxy)' : ollamaSettings.endpoint}
                </code>
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 self-end lg:self-auto flex-wrap">
            <button
              type="button"
              onClick={onRefreshConnection}
              disabled={connectionStatus.isChecking}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              title="Kiểm tra lại kết nối tới Ollama"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${connectionStatus.isChecking ? 'animate-spin' : ''}`} />
              Kiểm tra
            </button>

            <button
              type="button"
              onClick={onOpenSetupGuide}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5" />
              Lệnh tải 4 Model
            </button>
          </div>
        </div>

        {/* Warning if disconnected */}
        {!connectionStatus.isConnected && (
          <div className="mt-4 p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
              <span>
                Không tìm thấy máy chủ Ollama chạy ở <code className="font-mono font-bold">http://localhost:11434</code>. Hãy chạy lệnh <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">ollama serve</code> trên máy của bạn.
              </span>
            </div>
            <button
              onClick={onOpenSetupGuide}
              className="text-indigo-700 hover:underline font-bold shrink-0 text-xs"
            >
              Xem hướng dẫn mở cổng CORS →
            </button>
          </div>
        )}
      </div>

      {/* 2. Model Selection Showcase (The 4 Requested Models) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Chọn Mô Hình AI Cục Bộ (4 Model tối ưu hóa cho Đề cương & Kế hoạch):
          </label>
          <span className="text-xs text-slate-500">
            {connectionStatus.availableModels.length > 0
              ? `Đã nhận diện ${connectionStatus.availableModels.length} mô hình trên máy`
              : 'Có thể chọn trước để chạy khi khởi động Ollama'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {OLLAMA_SUPPORTED_MODELS.map((model: OllamaModelInfo) => {
            const isSelected = ollamaSettings.model === model.tag || activeModelMeta?.id === model.id;
            const isInstalled = connectionStatus.availableModels.some(
              (m) => m === model.tag || model.aliases?.some((a) => m.startsWith(a))
            );

            return (
              <div
                key={model.id}
                onClick={() => handleSelectModel(model.tag)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/60 shadow-md ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        model.category === 'heavyweight'
                          ? 'bg-purple-100 text-purple-700'
                          : model.category === 'balanced'
                          ? 'bg-blue-100 text-blue-700'
                          : model.category === 'fast'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {model.parameterSize}
                    </span>

                    {isInstalled ? (
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Đã có sẵn
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">Chưa cài</span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm">{model.name}</h3>
                  <code className="text-[11px] text-indigo-700 font-mono block mt-0.5 font-semibold">
                    {model.tag}
                  </code>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                    {model.recommendedFor}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-medium">{model.hardwareReq.split(',')[0]}</span>
                  {isSelected && (
                    <span className="text-indigo-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Đang dùng
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Dropdown for other models installed on user's Ollama instance */}
        {connectionStatus.availableModels.length > 0 && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-slate-500" />
              Hoặc chọn từ danh sách model đã tải trên máy bạn:
            </span>
            <select
              value={ollamaSettings.model}
              onChange={(e) => handleSelectModel(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {connectionStatus.availableModels.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 3. Sub-tabs Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-2">
          <button
            type="button"
            onClick={() => setSubTab('create_full')}
            className={`py-2.5 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 ${
              subTab === 'create_full'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/30'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-500" />
            1. Tự động Lập Kế hoạch Môn học Mới
          </button>

          <button
            type="button"
            onClick={() => setSubTab('batch_optimize')}
            className={`py-2.5 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 ${
              subTab === 'batch_optimize'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/30'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            2. Nâng cấp Phương pháp & CĐR cho {lessons.length} bài
          </button>

          <button
            type="button"
            onClick={() => setSubTab('chat_assistant')}
            className={`py-2.5 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 ${
              subTab === 'chat_assistant'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/30'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-indigo-600" />
            3. Trợ lý Sư phạm Hội thoại (Co-pilot)
          </button>

          <button
            type="button"
            onClick={() => setSubTab('settings')}
            className={`py-2.5 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 ${
              subTab === 'settings'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/30'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings2 className="w-4 h-4 text-slate-500" />
            Cấu hình Endpoint
          </button>
        </nav>
      </div>

      {/* Notices */}
      {errorNotice && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Lỗi xử lý: </span>
            <span>{errorNotice}</span>
          </div>
        </div>
      )}

      {successNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Thành công: </span>
            <span>{successNotice}</span>
          </div>
        </div>
      )}

      {/* Tab 1: Create Full Syllabus from Scratch */}
      {subTab === 'create_full' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Tạo toàn bộ Bảng Kế hoạch học phần mới bằng AI Ollama
              </h3>
              <p className="text-xs text-slate-500">
                Mô hình sẽ tự động phân bổ số tiết (Lý thuyết, Thảo luận, Bài tập, Tự học), tạo nội dung chi tiết tiểu mục, chuẩn đầu ra (CĐR/CLO) và phương pháp dạy học tích cực.
              </p>
            </div>
            <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-full border border-indigo-100">
              Model: {ollamaSettings.model}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="text-xs font-bold text-slate-700">Tên môn học:</label>
              <input
                type="text"
                value={courseInfo.courseName}
                onChange={(e) => onUpdateCourseInfo({ ...courseInfo, courseName: e.target.value })}
                className="w-full text-xs font-semibold p-2.5 bg-white border border-slate-300 rounded-lg mt-1 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                placeholder="VD: Trí tuệ nhân tạo..."
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">Số tín chỉ:</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={courseInfo.credits}
                  onChange={(e) => onUpdateCourseInfo({ ...courseInfo, credits: Number(e.target.value) || 3 })}
                  className="w-20 text-xs font-semibold p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
                <span className="text-xs text-slate-500">
                  (Dự kiến {courseInfo.credits * 15} tiết lên lớp + {courseInfo.credits * 30} tiết tự học)
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">Số bài học dự kiến tạo:</label>
              <select
                value={targetLessonCount}
                onChange={(e) => setTargetLessonCount(Number(e.target.value))}
                className="w-full text-xs font-semibold p-2.5 bg-white border border-slate-300 rounded-lg mt-1 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              >
                <option value={8}>8 bài học (Học phần ngắn / chuyên đề)</option>
                <option value={10}>10 bài học (Tiêu chuẩn 2-3 tín chỉ)</option>
                <option value={12}>12 bài học</option>
                <option value={15}>15 bài học (Theo 15 tuần học truyền thống)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700">
              Định hướng sư phạm & Yêu cầu bổ sung của Giảng viên:
            </label>
            <textarea
              rows={2}
              value={extraPedagogicalNeeds}
              onChange={(e) => setExtraPedagogicalNeeds(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg mt-1 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              placeholder="VD: Dành cho sinh viên năm 3, tăng cường thực hành dự án nhóm, liên kết với đề thi trắc nghiệm A2..."
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-slate-500">
              {isGenerating && (
                <span className="flex items-center gap-2 text-indigo-700 font-medium">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  {generationProgress}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isGenerating ? (
                <button
                  type="button"
                  onClick={handleCancelGeneration}
                  className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Dừng sinh
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleGenerateFullSyllabus}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer transform hover:scale-[1.01]"
                >
                  <Zap className="w-4 h-4" />
                  Sinh toàn bộ Đề cương ({targetLessonCount} bài)
                </button>
              )}
            </div>
          </div>

          {/* Streaming Text display */}
          {streamBuffer && (
            <div className="mt-4 border border-indigo-100 rounded-xl p-3 bg-slate-900 text-slate-100 font-mono text-xs max-h-48 overflow-y-auto whitespace-pre-wrap">
              <div className="text-slate-400 text-[10px] pb-1 border-b border-slate-800 mb-2">
                Dòng dữ liệu từ Ollama ({ollamaSettings.model}):
              </div>
              {streamBuffer}
            </div>
          )}

          {/* Candidate Result Preview & Apply */}
          {generatedCandidateLessons && (
            <div className="mt-6 border-2 border-emerald-300 rounded-2xl p-5 bg-emerald-50/40 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Kết quả tạo mới: {generatedCandidateLessons.length} bài học
                  </h4>
                  <p className="text-xs text-slate-500">
                    Kiểm tra danh sách bên dưới trước khi áp dụng vào Kế hoạch giảng dạy chính thức.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleApplyGeneratedLessons}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Áp dụng toàn bộ vào Kế hoạch
                </button>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {generatedCandidateLessons.map((l, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-xl border border-emerald-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{l.content}</span>
                      <span className="text-slate-500 font-normal">
                        Tổng: {l.totalPeriods}t (LT: {l.theoryPeriods}, TL: {l.discussionPeriods}, BT: {l.exercisePeriods}, Tự học: {l.selfStudyPeriods})
                      </span>
                    </div>
                    {l.topics && l.topics.length > 0 && (
                      <p className="text-slate-600 text-[11px] pl-2 border-l-2 border-slate-200">
                        {l.topics.join(' • ')}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                      <span><strong>CĐR:</strong> {l.cdr.replace(/\n/g, ', ')}</span>
                      <span><strong>Đánh giá:</strong> {l.assessment}</span>
                      <span><strong>PP:</strong> {l.methods?.join(', ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Batch Optimize Existing Lessons */}
      {subTab === 'batch_optimize' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Rà soát & Nâng cấp Sư phạm cho Toàn bộ {lessons.length} Bài học hiện tại
            </h3>
            <p className="text-xs text-slate-500">
              Mô hình Ollama sẽ tự động phân tích từng bài học hiện có, gợi ý các phương pháp dạy học tích cực (Thảo luận nhóm, Vấn đáp gợi mở, PBL...), làm giàu tiểu mục bài giảng và chuẩn hóa CĐR.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Học phần: <strong>{courseInfo.courseName}</strong> ({courseInfo.credits} tín chỉ)</span>
              <span>Đang có: <strong>{lessons.length} bài học</strong></span>
            </div>

            <div className="text-xs text-slate-600 leading-relaxed">
              Quá trình này giữ nguyên tên và số thứ tự bài học, đồng thời bổ sung các hoạt động sư phạm, phương pháp giảng dạy hiện đại và cân đối giờ tự học.
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-slate-500">
              {isGenerating && (
                <span className="flex items-center gap-2 text-indigo-700 font-medium">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  {generationProgress}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isGenerating ? (
                <button
                  type="button"
                  onClick={handleCancelGeneration}
                  className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Hủy
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleBatchOptimize}
                  disabled={lessons.length === 0}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  Tối ưu hóa ngay {lessons.length} bài học
                </button>
              )}
            </div>
          </div>

          {streamBuffer && (
            <div className="mt-4 border border-indigo-100 rounded-xl p-3 bg-slate-900 text-slate-100 font-mono text-xs max-h-48 overflow-y-auto whitespace-pre-wrap">
              <div className="text-slate-400 text-[10px] pb-1 border-b border-slate-800 mb-2">
                Dữ liệu phản hồi từ {ollamaSettings.model}:
              </div>
              {streamBuffer}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Pedagogical Chat Assistant */}
      {subTab === 'chat_assistant' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                Hỏi đáp Sư phạm với Ollama ({ollamaSettings.model})
              </h3>
              <p className="text-xs text-slate-500">
                Thảo luận ý tưởng sư phạm, cách thiết kế bài tập, rubrics hoặc đổi mới phương pháp giảng dạy.
              </p>
            </div>
          </div>

          {/* Quick Prompt Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 text-xs">
            <span className="text-slate-400 font-medium shrink-0">Gợi ý câu hỏi:</span>
            {[
              'Đề xuất 3 tình huống thảo luận nhóm thực tiễn cho môn học này',
              'Cách phân bổ tỷ lệ điểm đánh giá A1 và A2 hợp lý',
              'Gợi ý hoạt động kiểm tra đầu giờ 5 phút kích thích tư duy',
              'Làm thế nào để áp dụng Blended Learning hiệu quả?',
            ].map((chip, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setInputMessage(chip)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full whitespace-nowrap text-xs transition-colors shrink-0"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Chat History Box */}
          <div className="border border-slate-200 rounded-2xl p-4 min-h-[300px] max-h-[440px] overflow-y-auto space-y-3 bg-slate-50/50">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 text-xs leading-relaxed ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-[10px]">
                    AI
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-2xl max-w-[85%] whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white font-medium shadow-xs'
                      : 'bg-white text-slate-800 border border-slate-200 shadow-2xs'
                  }`}
                >
                  {msg.content || (
                    <span className="flex items-center gap-2 text-slate-400">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Đang soạn câu trả lời...
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input Bar */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isChatGenerating && handleSendChatMessage()}
              placeholder="Nhập câu hỏi hoặc yêu cầu sư phạm cho Ollama..."
              className="flex-1 text-xs p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleSendChatMessage}
              disabled={isChatGenerating || !inputMessage.trim()}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              Gửi
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Ollama Settings */}
      {subTab === 'settings' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Cấu hình Kết nối Máy chủ Ollama</h3>
              <p className="text-xs text-slate-500">
                Tùy chỉnh địa chỉ IP, cổng, cơ chế proxy và tham số nhiệt độ sinh mã
              </p>
            </div>
            <button
              onClick={onOpenSetupGuide}
              className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1"
            >
              <Terminal className="w-3.5 h-3.5" />
              Xem hướng dẫn cài đặt & lệnh CORS
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Địa chỉ Endpoint Ollama:
              </label>
              <input
                type="text"
                value={tempEndpoint}
                onChange={(e) => setTempEndpoint(e.target.value)}
                placeholder="http://localhost:11434"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none font-semibold text-slate-800"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Mặc định: <code className="text-indigo-600">http://localhost:11434</code> (hoặc IP máy chủ LAN nếu chạy từ xa).
              </p>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Mô hình đang chỉ định:
              </label>
              <input
                type="text"
                value={tempModel}
                onChange={(e) => setTempModel(e.target.value)}
                placeholder="qwen2.5-coder:7b"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none font-semibold text-slate-800"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Hoặc nhập bất kỳ tag nào đã cài (vd: <code className="text-indigo-600">qwen3.6:35b-a3b-q4</code>, <code className="text-indigo-600">gemma4:12b</code>, <code className="text-indigo-600">gemma4:e4b</code>).
              </p>
            </div>

            {/* Proxy Vite Toggle */}
            <div className="md:col-span-2 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tempProxy}
                  onChange={(e) => setTempProxy(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <span className="font-bold text-slate-800 text-xs">
                  Sử dụng Vite Proxy trung gian (<code className="text-indigo-700">/api/ollama</code>)
                </span>
              </label>
              <p className="text-[11px] text-slate-500 pl-6">
                Bật tùy chọn này khi chạy trên máy phát triển cục bộ để trình duyệt không bị chặn bởi chính sách CORS của trình duyệt.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleSaveSettings}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              Lưu & Kiểm tra kết nối
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OllamaPanel;
