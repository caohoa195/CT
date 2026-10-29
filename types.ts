export interface CourseLesson {
  id: number;
  stt: string;
  content: string;
  topics: string[]; // Detailed topics/bullet points extracted from content column
  cdr: string; // Chuẩn đầu ra (CĐR / CLO)
  assessment: string; // Bài KT, ĐG (A1.1, A2.1...)
  totalPeriods: number; // Tổng số tiết
  classPeriods: number; // Số tiết trên lớp
  theoryPeriods: number; // LT (Lý thuyết)
  discussionPeriods: number; // TL (Thảo luận)
  practiceGroupPeriods: number; // TH N (Thực hành nhóm)
  practiceIndividualPeriods: number; // TH Đ (Thực hành cá nhân)
  exercisePeriods: number; // BT (Bài tập / Thảo luận bài tập)
  guidedStudyPeriods: number; // Học có HD
  selfStudyPeriods: number; // Tự học
  materials: string; // Học liệu / Tài liệu tham khảo
  methods?: string[]; // Phương pháp dạy học áp dụng (Thuyết trình, Đàm thoại, Thảo luận...)
}

export interface CourseInfo {
  universityName: string;
  facultyName: string;
  courseName: string;
  courseCode: string;
  credits: number;
  theoryCredits: number;
  practiceCredits: number;
  instructorName: string;
  semester: string;
  academicYear: string;
}

export type TemplateType = 'muc_f' | 'weekly' | 'matrix';

export interface TemplateDefinition {
  id: TemplateType;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  recommendedFor: string;
}

export interface ProcessingStatus {
  step: 'idle' | 'parsing' | 'generating' | 'completed' | 'error';
  message: string;
}

export interface SampleCoursePreset {
  id: string;
  name: string;
  code: string;
  credits: number;
  department: string;
  description: string;
  lessons: CourseLesson[];
}

// Data structures for Universal / Any Template Import
export interface RawTableData {
  id: string;
  name: string;
  headers: string[];
  rows: string[][];
  source: 'docx' | 'excel' | 'paste';
}

export interface ColumnMapping {
  sttCol: number; // -1 if not mapped
  contentCol: number;
  cdrCol: number;
  totalPeriodsCol: number;
  theoryCol: number;
  discussionCol: number;
  exerciseCol: number;
  guidedStudyCol: number;
  selfStudyCol: number;
  materialsCol: number;
}

// Ollama Local AI Types
export interface OllamaModelInfo {
  id: string;
  name: string;
  tag: string;
  aliases?: string[];
  parameterSize: string;
  quantization?: string;
  hardwareReq: string;
  recommendedFor: string;
  category: 'heavyweight' | 'balanced' | 'fast' | 'edge';
}

export interface OllamaSettings {
  endpoint: string; // e.g. http://localhost:11434 or /api/ollama
  model: string;
  temperature: number;
  topP: number;
  numCtx: number;
  useProxy: boolean;
}

export interface OllamaConnectionStatus {
  isConnected: boolean;
  isChecking: boolean;
  error?: string;
  latencyMs?: number;
  availableModels: string[];
  ollamaVersion?: string;
  lastChecked?: string;
}

export interface OllamaGenerationProgress {
  isGenerating: boolean;
  taskName: string;
  progressText: string;
  streamContent: string;
}