import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Loader2, 
  Check, 
  Brain, 
  Lightbulb, 
  BookOpen, 
  Target, 
  CheckSquare, 
  ChevronRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { CourseLesson, CourseInfo, OllamaSettings } from '../types';
import { 
  OLLAMA_SUPPORTED_MODELS, 
  aiSuggestLessonEnhancements 
} from '../services/ollamaService';

interface OllamaLessonAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: CourseLesson | null;
  courseInfo: CourseInfo;
  ollamaSettings: OllamaSettings;
  onApply: (updatedLesson: CourseLesson) => void;
  onOpenSetupGuide: () => void;
}

const OllamaLessonAssistantModal: React.FC<OllamaLessonAssistantModalProps> = ({
  isOpen,
  onClose,
  lesson,
  courseInfo,
  ollamaSettings,
  onApply,
  onOpenSetupGuide,
}) => {
  const [selectedModel, setSelectedModel] = useState<string>(ollamaSettings.model);
  const [isLoading, setIsLoading] = useState(false);
  const [streamText, setStreamText] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Suggested values state
  const [suggestedMethods, setSuggestedMethods] = useState<string[]>([]);
  const [lecturerActivities, setLecturerActivities] = useState<string[]>([]);
  const [studentActivities, setStudentActivities] = useState<string[]>([]);
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);
  const [suggestedCdr, setSuggestedCdr] = useState('');
  const [suggestedAssessment, setSuggestedAssessment] = useState('');
  const [advice, setAdvice] = useState('');
  const [hasGenerated, setHasGenerated] = useState(false);

  if (!isOpen || !lesson) return null;

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setStreamText('');

    try {
      const activeSettings: OllamaSettings = {
        ...ollamaSettings,
        model: selectedModel,
      };

      const result = await aiSuggestLessonEnhancements({
        settings: activeSettings,
        lesson,
        courseInfo,
        onToken: (_token, accumulated) => {
          setStreamText(accumulated);
        },
      });

      setSuggestedMethods(result.methods || []);
      setLecturerActivities(result.lecturerActivities || []);
      setStudentActivities(result.studentActivities || []);
      setSuggestedTopics(result.suggestedTopics || lesson.topics);
      setSuggestedCdr(result.suggestedCdr || lesson.cdr);
      setSuggestedAssessment(result.suggestedAssessment || lesson.assessment);
      setAdvice(result.pedagogicalAdvice || '');
      setHasGenerated(true);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Không thể tạo gợi ý từ mô hình Ollama. Vui lòng kiểm tra kết nối.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMethod = (method: string) => {
    setSuggestedMethods(prev => 
      prev.includes(method) ? prev.filter(m => m !== method) : [...prev, method]
    );
  };

  const handleApplyToLesson = () => {
    const updated: CourseLesson = {
      ...lesson,
      topics: suggestedTopics.length > 0 ? suggestedTopics : lesson.topics,
      cdr: suggestedCdr || lesson.cdr,
      assessment: suggestedAssessment || lesson.assessment,
      methods: suggestedMethods.length > 0 ? suggestedMethods : lesson.methods,
    };
    onApply(updated);
    onClose();
  };

  const currentModelDef = OLLAMA_SUPPORTED_MODELS.find(m => m.tag === selectedModel) || {
    name: selectedModel,
    tag: selectedModel,
    parameterSize: 'Tùy chỉnh',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-hidden flex flex-col border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/70 to-blue-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-xs">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">
                  AI Trợ lý Ollama: Gợi ý Sư phạm cho Bài học
                </h3>
                <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
                  100% Cục bộ Offline
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Đang biên soạn: <span className="text-slate-800 font-semibold">{lesson.content}</span>
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Model Selection Bar */}
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Chọn Model Ollama thực thi:
              </label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {OLLAMA_SUPPORTED_MODELS.map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedModel(m.tag)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                      selectedModel === m.tag
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4" />
                  Đang phân tích sư phạm...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  {hasGenerated ? 'Tạo gợi ý mới' : 'Gợi ý Phương pháp & Hoạt động'}
                </>
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>Không thể kết nối đến Ollama hoặc mô hình chưa được tải:</span>
              </div>
              <p className="pl-6">{error}</p>
              <div className="pl-6 pt-1">
                <button
                  type="button"
                  onClick={onOpenSetupGuide}
                  className="text-indigo-600 font-bold hover:underline"
                >
                  Xem hướng dẫn khởi động Ollama & câu lệnh pull model →
                </button>
              </div>
            </div>
          )}

          {/* Streaming display while generating */}
          {isLoading && (
            <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-800">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                <span>Ollama ({currentModelDef.name}) đang suy luận sư phạm...</span>
              </div>
              {streamText && (
                <div className="p-3 bg-white/80 rounded-lg text-xs font-mono text-slate-700 max-h-36 overflow-y-auto whitespace-pre-wrap border border-indigo-100">
                  {streamText}
                </div>
              )}
            </div>
          )}

          {/* Generated Results Preview */}
          {hasGenerated && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Pedagogical Advice Callout */}
              {advice && (
                <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Định hướng sư phạm: </span>
                    <span>{advice}</span>
                  </div>
                </div>
              )}

              {/* 1. Methods Picker */}
              <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Phương pháp dạy học đề xuất (bấm để chọn/bỏ chọn):
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Đã chọn {suggestedMethods.length} phương pháp
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {suggestedMethods.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleToggleMethod(m)}
                      className="px-3 py-1.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg font-medium text-xs flex items-center gap-1.5 hover:bg-emerald-100 transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Lecturer & Student Activities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/70 space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-blue-600" />
                    Hoạt động của Giảng viên (Đề xuất)
                  </h4>
                  <ul className="text-xs text-slate-600 space-y-1.5 pl-4 list-disc">
                    {lecturerActivities.map((act, i) => (
                      <li key={i}>{act}</li>
                    ))}
                  </ul>
                </div>

                <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/70 space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                    Hoạt động của Sinh viên (Đề xuất)
                  </h4>
                  <ul className="text-xs text-slate-600 space-y-1.5 pl-4 list-disc">
                    {studentActivities.map((act, i) => (
                      <li key={i}>{act}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 3. Topics & Learning Outcomes / Assessment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-2">
                  <label className="text-xs font-bold text-slate-800">
                    Tiểu mục nội dung bài giảng chi tiết (Topics):
                  </label>
                  <textarea
                    rows={4}
                    value={suggestedTopics.join('\n')}
                    onChange={(e) => setSuggestedTopics(e.target.value.split('\n').filter(t => t.trim().length > 0))}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    placeholder="Mỗi dòng 1 tiểu mục..."
                  />
                </div>

                <div className="space-y-3">
                  <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <Target className="w-3 h-3 text-indigo-600" />
                      Chuẩn đầu ra (CĐR / CLO):
                    </label>
                    <input
                      type="text"
                      value={suggestedCdr}
                      onChange={(e) => setSuggestedCdr(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none font-medium"
                      placeholder="VD: G1.1; G1.2"
                    />
                  </div>

                  <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <CheckSquare className="w-3 h-3 text-emerald-600" />
                      Hình thức Đánh giá:
                    </label>
                    <input
                      type="text"
                      value={suggestedAssessment}
                      onChange={(e) => setSuggestedAssessment(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none font-medium"
                      placeholder="VD: A1.1 (Vấn đáp / Thảo luận)"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {!hasGenerated && !isLoading && !error && (
            <div className="text-center py-8 text-slate-400 space-y-3 border-2 border-dashed border-slate-200 rounded-2xl">
              <Brain className="w-10 h-10 mx-auto text-indigo-400 stroke-[1.5]" />
              <div className="max-w-md mx-auto">
                <p className="text-xs font-bold text-slate-700">
                  Tận dụng trí tuệ nhân tạo Ollama cục bộ để nâng cao chất lượng bài giảng
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Mô hình sẽ phân tích tiêu đề và nội dung bài học để đề xuất các phương pháp sư phạm tích cực, hoạt động cụ thể và định dạng chuẩn đầu ra chuẩn xác.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onOpenSetupGuide}
            className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1"
          >
            Lệnh cài đặt model Ollama
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleApplyToLesson}
              disabled={!hasGenerated}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Áp dụng vào bài học
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OllamaLessonAssistantModal;
