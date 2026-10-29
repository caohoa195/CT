import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Download, 
  Loader2, 
  FileText, 
  Sparkles, 
  Upload, 
  Edit3, 
  FolderDown, 
  CheckCircle, 
  RefreshCw,
  Eye,
  Info,
  FileSpreadsheet,
  FileCode,
  SlidersHorizontal,
  Cpu,
  Zap
} from 'lucide-react';
import saveAs from 'file-saver';
import FileUpload from './components/FileUpload';
import UniversalImporter from './components/UniversalImporter';
import TemplateSelector from './components/TemplateSelector';
import SamplePresetsBar from './components/SamplePresetsBar';
import CourseInfoForm from './components/CourseInfoForm';
import LessonEditor from './components/LessonEditor';
import LiveDocumentPreview from './components/LiveDocumentPreview';
import SampleTemplatesDownload from './components/SampleTemplatesDownload';
import OllamaPanel from './components/OllamaPanel';
import OllamaQuickBar from './components/OllamaQuickBar';
import OllamaSetupGuideModal from './components/OllamaSetupGuideModal';
import OllamaLessonAssistantModal from './components/OllamaLessonAssistantModal';
import { 
  parseCourseStructure, 
  exportTeachingPlanByTemplate 
} from './services/documentService';
import { 
  DEFAULT_COURSE_INFO, 
  SAMPLE_PRESETS, 
  AVAILABLE_TEMPLATES 
} from './services/sampleData';
import { 
  loadOllamaSettings, 
  checkOllamaConnection 
} from './services/ollamaService';
import { 
  CourseLesson, 
  CourseInfo, 
  TemplateType, 
  ProcessingStatus, 
  SampleCoursePreset,
  OllamaSettings,
  OllamaConnectionStatus
} from './types';

type TabType = 'template' | 'universal_import' | 'ollama' | 'upload' | 'editor' | 'samples';

function App() {
  // Initialize with the first provided sample course ("Tin học đại cương")
  const defaultSample = SAMPLE_PRESETS[0];
  const [lessons, setLessons] = useState<CourseLesson[]>(defaultSample.lessons);
  const [courseInfo, setCourseInfo] = useState<CourseInfo>({
    ...DEFAULT_COURSE_INFO,
    courseName: defaultSample.name,
    courseCode: defaultSample.code,
    credits: defaultSample.credits,
    facultyName: defaultSample.department,
  });

  const [activePresetId, setActivePresetId] = useState<string | null>(defaultSample.id);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('muc_f');
  const [activeTab, setActiveTab] = useState<TabType>('template');
  const [previewMode, setPreviewMode] = useState<'paper' | 'table'>('paper');
  const [status, setStatus] = useState<ProcessingStatus>({ step: 'idle', message: '' });

  // Local Ollama AI state
  const [ollamaSettings, setOllamaSettings] = useState<OllamaSettings>(loadOllamaSettings);
  const [ollamaStatus, setOllamaStatus] = useState<OllamaConnectionStatus>({
    isConnected: false,
    isChecking: true,
    availableModels: [],
  });
  const [isSetupGuideOpen, setIsSetupGuideOpen] = useState(false);
  const [assistantLesson, setAssistantLesson] = useState<CourseLesson | null>(null);

  const handleRefreshOllama = async () => {
    setOllamaStatus((prev) => ({ ...prev, isChecking: true }));
    const result = await checkOllamaConnection(ollamaSettings);
    setOllamaStatus(result);
  };

  useEffect(() => {
    handleRefreshOllama();
  }, []);

  // Handle uploading a .docx Course Structure file via standard upload
  const handleFileSelect = async (selectedFile: File) => {
    setStatus({ step: 'parsing', message: 'Đang đọc và phân tích cấu trúc bảng từ tệp Word...' });
    setActivePresetId(null);

    try {
      const parsedLessons = await parseCourseStructure(selectedFile);
      setLessons(parsedLessons);

      if (parsedLessons.length === 0) {
        setStatus({
          step: 'error',
          message: 'Không tìm thấy các dòng bài học hợp lệ. Vui lòng thử dùng tab "Nhập Mẫu Bất Kỳ" để ánh xạ cột.',
        });
      } else {
        const cleanName = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
        setCourseInfo((prev) => ({
          ...prev,
          courseName: cleanName || prev.courseName,
        }));

        setStatus({
          step: 'completed',
          message: `Đã nhập thành công ${parsedLessons.length} bài học từ tệp Word!`,
        });

        setTimeout(() => {
          setStatus({ step: 'idle', message: '' });
        }, 3500);
      }
    } catch (e: any) {
      console.error(e);
      setStatus({
        step: 'error',
        message: e.message || 'Không thể đọc tệp. Hãy thử dùng tab "Nhập Mẫu Bất Kỳ" để chọn bảng và cột tùy ý.',
      });
    }
  };

  // Handle Universal Import (Word/Excel/Paste/JSON)
  const handleUniversalImportComplete = (importedLessons: CourseLesson[], fileName?: string) => {
    setLessons(importedLessons);
    setActivePresetId(null);
    if (fileName && fileName !== 'Dữ liệu bảng dán') {
      const cleanName = fileName.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
      setCourseInfo((prev) => ({
        ...prev,
        courseName: cleanName || prev.courseName,
      }));
    }
    setStatus({
      step: 'completed',
      message: `Đã nhập thành công ${importedLessons.length} bài học từ "${fileName || 'tài liệu'}"!`,
    });
    setActiveTab('template');
    setTimeout(() => {
      setStatus({ step: 'idle', message: '' });
    }, 4000);
  };

  // Export JSON Backup
  const handleExportBackupJson = () => {
    const exportData = {
      courseInfo,
      selectedTemplate,
      lessons,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const filename = `${courseInfo.courseName ? courseInfo.courseName.replace(/\s+/g, '_') : 'Ke_hoach_day_hoc'}_backup.json`;
    saveAs(blob, filename);
  };

  // Handle switching to a provided sample preset course
  const handleSelectPreset = (preset: SampleCoursePreset) => {
    setActivePresetId(preset.id);
    setLessons(preset.lessons);
    setCourseInfo((prev) => ({
      ...prev,
      courseName: preset.name,
      courseCode: preset.code,
      credits: preset.credits,
      facultyName: preset.department,
    }));
    setStatus({
      step: 'completed',
      message: `Đã nạp mẫu: "${preset.name}" (${preset.lessons.length} bài học).`,
    });
    setTimeout(() => {
      setStatus({ step: 'idle', message: '' });
    }, 3000);
  };

  // Handle docx export
  const handleGenerate = async () => {
    if (lessons.length === 0) return;

    setStatus({ step: 'generating', message: 'Đang định dạng và khởi tạo tệp Word (.docx)...' });
    try {
      await exportTeachingPlanByTemplate(selectedTemplate, lessons, courseInfo);
      setStatus({ step: 'completed', message: 'Tạo tài liệu Word thành công! Tệp đang được tải xuống.' });

      setTimeout(() => {
        setStatus({ step: 'idle', message: '' });
      }, 4000);
    } catch (e) {
      console.error(e);
      setStatus({ step: 'error', message: 'Đã có lỗi xảy ra khi tạo tệp Word. Vui lòng thử lại.' });
    }
  };

  // Quick stats calculation
  const totalClassHours = lessons.reduce((acc, l) => acc + (l.totalPeriods || 0), 0);
  const totalTheoryHours = lessons.reduce((acc, l) => acc + (l.theoryPeriods || 0), 0);
  const totalDiscussionHours = lessons.reduce((acc, l) => acc + (l.discussionPeriods || 0), 0);
  const totalExerciseHours = lessons.reduce(
    (acc, l) => acc + (l.exercisePeriods || (l.practiceGroupPeriods + l.practiceIndividualPeriods) || 0),
    0
  );
  const totalSelfStudyHours = lessons.reduce((acc, l) => acc + (l.selfStudyPeriods || 0), 0);

  const currentTemplateDef = AVAILABLE_TEMPLATES.find((t) => t.id === selectedTemplate) || AVAILABLE_TEMPLATES[0];

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 pb-16">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 rounded-xl shadow-md text-white">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">
                  Tạo Kế hoạch & Phương pháp dạy học
                </h1>
                <span className="text-[11px] bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
                  Theo Mẫu Cung Cấp & Import Bất Kỳ
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Xuất file Word (.docx) chuẩn Mục F Đề cương chi tiết, lịch giảng dạy tuần & ma trận CĐR từ mọi nguồn dữ liệu
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap justify-end">
            <OllamaQuickBar
              settings={ollamaSettings}
              onUpdateSettings={setOllamaSettings}
              status={ollamaStatus}
              onOpenOllamaTab={() => setActiveTab('ollama')}
              onOpenSetupGuide={() => setIsSetupGuideOpen(true)}
            />

            <button
              type="button"
              onClick={handleExportBackupJson}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-xs transition-colors"
              title="Sao lưu toàn bộ thông tin môn học và danh sách bài học ra file JSON"
            >
              <FileCode className="w-3.5 h-3.5 text-amber-600" />
              Lưu JSON
            </button>

            <button
              onClick={handleGenerate}
              disabled={status.step === 'generating' || lessons.length === 0}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition-all transform hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100 cursor-pointer"
            >
              {status.step === 'generating' ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4" />
                  Đang tạo Word...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Xuất file Word (.docx)
                </>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <nav className="flex space-x-1 sm:space-x-3 overflow-x-auto no-scrollbar pt-1">
            <button
              type="button"
              onClick={() => setActiveTab('template')}
              className={`py-3 px-3.5 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex items-center gap-2 transition-colors ${
                activeTab === 'template'
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              Tạo theo Mẫu cung cấp
            </button>

            {/* TAB: OLLAMA AI CỤC BỘ */}
            <button
              type="button"
              onClick={() => setActiveTab('ollama')}
              className={`py-3 px-3.5 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex items-center gap-2 transition-colors ${
                activeTab === 'ollama'
                  ? 'border-indigo-600 text-indigo-700 font-bold bg-indigo-50/40'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <div className="relative">
                <Cpu className="w-4 h-4 text-indigo-600" />
                <span
                  className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${
                    ollamaStatus.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
              </div>
              <span>AI Ollama (Cục bộ)</span>
              <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded-full">
                4 Models
              </span>
            </button>

            {/* TAB: NHẬP MẪU BẤT KỲ */}
            <button
              type="button"
              onClick={() => setActiveTab('universal_import')}
              className={`py-3 px-3.5 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex items-center gap-2 transition-colors ${
                activeTab === 'universal_import'
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
              Nhập Mẫu Bất Kỳ (Word/Excel/Dán)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`py-3 px-3.5 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex items-center gap-2 transition-colors ${
                activeTab === 'upload'
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Upload className="w-4 h-4 text-blue-600" />
              Tải file Cấu trúc chuẩn (.docx)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`py-3 px-3.5 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex items-center gap-2 transition-colors ${
                activeTab === 'editor'
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Edit3 className="w-4 h-4 text-slate-600" />
              Biên soạn chi tiết ({lessons.length} bài)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('samples')}
              className={`py-3 px-3.5 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex items-center gap-2 transition-colors ${
                activeTab === 'samples'
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <FolderDown className="w-4 h-4 text-indigo-600" />
              Kho tệp mẫu (.docx)
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Status Notification */}
        {status.message && (
          <div
            className={`p-4 rounded-xl flex items-center justify-between text-sm font-medium shadow-xs transition-all ${
              status.step === 'error'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : status.step === 'completed'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {status.step === 'parsing' || status.step === 'generating' ? (
                <Loader2 className="animate-spin w-4 h-4 shrink-0 text-blue-600" />
              ) : status.step === 'completed' ? (
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : null}
              <span>{status.message}</span>
            </div>
          </div>
        )}

        {/* Tab 1: Tạo theo Mẫu cung cấp */}
        {activeTab === 'template' && (
          <div className="space-y-6">
            {/* Sample Presets Selection */}
            <SamplePresetsBar
              activePresetId={activePresetId}
              onSelectPreset={handleSelectPreset}
            />

            {/* Template Format Selector */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <TemplateSelector
                selectedTemplate={selectedTemplate}
                onSelectTemplate={setSelectedTemplate}
              />
            </div>

            {/* Course Information Header Form */}
            <CourseInfoForm courseInfo={courseInfo} onChange={setCourseInfo} />
          </div>
        )}

        {/* Tab: NHẬP MẪU BẤT KỲ (Universal Importer) */}
        {activeTab === 'universal_import' && (
          <div className="space-y-6">
            <UniversalImporter
              onImportComplete={handleUniversalImportComplete}
            />

            {/* Template Format Selector */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <TemplateSelector
                selectedTemplate={selectedTemplate}
                onSelectTemplate={setSelectedTemplate}
              />
            </div>

            <CourseInfoForm courseInfo={courseInfo} onChange={setCourseInfo} />
          </div>
        )}

        {/* Tab 2: Tải lên file Cấu trúc học phần (.docx) */}
        {activeTab === 'upload' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
              <div className="text-center max-w-xl mx-auto mb-6">
                <h2 className="text-lg font-bold text-slate-900 mb-1">
                  Nhập tự động từ bảng Cấu trúc học phần (.docx)
                </h2>
                <p className="text-xs text-slate-500">
                  Hệ thống tự động quét bảng 14 cột, trích xuất danh sách bài học, số tiết LT, TL, BT, Tự học, CĐR và bài kiểm tra để tạo bảng kế hoạch dạy học.
                </p>
              </div>

              <FileUpload
                onFileSelect={handleFileSelect}
                isProcessing={status.step === 'parsing' || status.step === 'generating'}
              />

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Mẹo:</strong> Nếu tài liệu Word của bạn có cấu trúc bảng khác (5 cột, 6 cột, 8 cột hoặc file Excel), hãy sử dụng tab{' '}
                  <button
                    onClick={() => setActiveTab('universal_import')}
                    className="text-blue-600 underline font-semibold hover:text-blue-800"
                  >
                    "Nhập Mẫu Bất Kỳ"
                  </button>{' '}
                  để hệ thống tự động nhận diện và ánh xạ cột linh hoạt.
                </div>
              </div>
            </div>

            {/* Template Selector for the uploaded file */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <TemplateSelector
                selectedTemplate={selectedTemplate}
                onSelectTemplate={setSelectedTemplate}
              />
            </div>

            <CourseInfoForm courseInfo={courseInfo} onChange={setCourseInfo} />
          </div>
        )}

        {/* Tab: OLLAMA AI CỤC BỘ */}
        {activeTab === 'ollama' && (
          <div className="space-y-6">
            <OllamaPanel
              courseInfo={courseInfo}
              lessons={lessons}
              onUpdateLessons={setLessons}
              onUpdateCourseInfo={setCourseInfo}
              ollamaSettings={ollamaSettings}
              onUpdateSettings={setOllamaSettings}
              connectionStatus={ollamaStatus}
              onRefreshConnection={handleRefreshOllama}
              onOpenSetupGuide={() => setIsSetupGuideOpen(true)}
            />

            {/* Template Format Selector */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <TemplateSelector
                selectedTemplate={selectedTemplate}
                onSelectTemplate={setSelectedTemplate}
              />
            </div>
          </div>
        )}

        {/* Tab 3: Biên soạn & Chỉnh sửa chi tiết */}
        {activeTab === 'editor' && (
          <div className="space-y-6">
            <CourseInfoForm courseInfo={courseInfo} onChange={setCourseInfo} />

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <LessonEditor 
                lessons={lessons} 
                onChange={setLessons}
                onOpenOllamaAssistant={(lesson) => setAssistantLesson(lesson)}
                onOpenOllamaTab={() => setActiveTab('ollama')}
              />
            </div>
          </div>
        )}

        {/* Tab 4: Kho tệp mẫu (.docx) */}
        {activeTab === 'samples' && (
          <div className="space-y-6">
            <SampleTemplatesDownload />
          </div>
        )}

        {/* Statistics & Overview Bar */}
        {lessons.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Tổng kết phân bổ học phần:
                  </span>
                  <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                    {courseInfo.courseName}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                  <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-lg">
                    {lessons.length} bài học
                  </span>
                  <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg">
                    Tổng: {totalClassHours} tiết trên lớp
                  </span>
                  <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg">
                    LT: {totalTheoryHours} tiết
                  </span>
                  <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg">
                    TL: {totalDiscussionHours} tiết
                  </span>
                  <span className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg">
                    BT/TH: {totalExerciseHours} tiết
                  </span>
                  <span className="bg-purple-50 text-purple-700 px-2.5 py-1 rounded-lg">
                    Tự học: {totalSelfStudyHours} tiết
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewMode(previewMode === 'paper' ? 'table' : 'paper')}
                  className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  {previewMode === 'paper' ? 'Xem dạng bảng dữ liệu' : 'Xem dạng trang in Word'}
                </button>

                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={status.step === 'generating'}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all transform hover:scale-[1.02] disabled:opacity-60"
                >
                  {status.step === 'generating' ? (
                    <Loader2 className="animate-spin w-3.5 h-3.5" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  Tải file Word (.docx)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Live Document Preview Section */}
        {lessons.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Bản xem trước ({currentTemplateDef.title})
                </h3>
                <p className="text-xs text-slate-500">
                  {currentTemplateDef.description}
                </p>
              </div>

              {/* Template quick-switch buttons */}
              <div className="hidden sm:flex items-center gap-1 bg-slate-200/70 p-1 rounded-lg text-xs">
                {AVAILABLE_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => setSelectedTemplate(tmpl.id)}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                      selectedTemplate === tmpl.id
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tmpl.id === 'muc_f' ? 'Mẫu 1: Mục F' : tmpl.id === 'weekly' ? 'Mẫu 2: Tuần' : 'Mẫu 3: Ma trận'}
                  </button>
                ))}
              </div>
            </div>

            {previewMode === 'paper' ? (
              <LiveDocumentPreview
                lessons={lessons}
                courseInfo={courseInfo}
                template={selectedTemplate}
              />
            ) : (
              /* Quick Table Summary View */
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-xs">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-bold text-slate-600">Bài học</th>
                        <th className="px-3 py-3 text-center font-bold text-slate-600">Tổng</th>
                        <th className="px-3 py-3 text-center font-bold text-slate-600">LT</th>
                        <th className="px-3 py-3 text-center font-bold text-slate-600">TL</th>
                        <th className="px-3 py-3 text-center font-bold text-slate-600">BT/TH</th>
                        <th className="px-3 py-3 text-center font-bold text-slate-600">Tự học</th>
                        <th className="px-4 py-3 text-left font-bold text-slate-600">Chuẩn đầu ra (CĐR)</th>
                        <th className="px-4 py-3 text-left font-bold text-slate-600">Phương pháp</th>
                        <th className="px-4 py-3 text-left font-bold text-slate-600">Bài KT, ĐG</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {lessons.map((lesson) => (
                        <tr key={lesson.id} className="hover:bg-slate-50/70">
                          <td className="px-4 py-3 font-semibold text-slate-900 max-w-xs">
                            <div>{lesson.content}</div>
                            <div className="text-[11px] text-slate-400 font-normal line-clamp-1">
                              {lesson.topics.length} mục con
                            </div>
                          </td>
                          <td className="px-3 py-3 text-center font-bold text-blue-700">{lesson.totalPeriods}</td>
                          <td className="px-3 py-3 text-center text-slate-600">{lesson.theoryPeriods}</td>
                          <td className="px-3 py-3 text-center text-slate-600">{lesson.discussionPeriods}</td>
                          <td className="px-3 py-3 text-center text-slate-600">{lesson.exercisePeriods}</td>
                          <td className="px-3 py-3 text-center text-slate-600">{lesson.selfStudyPeriods}</td>
                          <td className="px-4 py-3 text-slate-700 font-mono text-[11px]">{lesson.cdr || '-'}</td>
                          <td className="px-4 py-3 text-slate-600">
                            {(lesson.methods || ['Thuyết trình', 'Đàm thoại']).join(', ')}
                          </td>
                          <td className="px-4 py-3 text-slate-700">{lesson.assessment || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Ollama Setup Guide Modal */}
      <OllamaSetupGuideModal
        isOpen={isSetupGuideOpen}
        onClose={() => setIsSetupGuideOpen(false)}
        activeModelTag={ollamaSettings.model}
      />

      {/* Ollama Single Lesson Pedagogical Assistant Modal */}
      <OllamaLessonAssistantModal
        isOpen={Boolean(assistantLesson)}
        onClose={() => setAssistantLesson(null)}
        lesson={assistantLesson}
        courseInfo={courseInfo}
        ollamaSettings={ollamaSettings}
        onApply={(updatedLesson) => {
          setLessons((prev) => prev.map((l) => (l.id === updatedLesson.id ? updatedLesson : l)));
        }}
        onOpenSetupGuide={() => {
          setAssistantLesson(null);
          setIsSetupGuideOpen(true);
        }}
      />
    </div>
  );
}

export default App;