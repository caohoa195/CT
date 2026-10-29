import { CourseLesson, CourseInfo, OllamaModelInfo, OllamaSettings, OllamaConnectionStatus } from '../types';

export const OLLAMA_SUPPORTED_MODELS: OllamaModelInfo[] = [
  {
    id: 'qwen3.6-35b-a3b-q4',
    name: 'Qwen3.6 35B-A3B (Q4)',
    tag: 'qwen3.6:35b-a3b-q4',
    aliases: ['qwen3.6:35b-a3b-q4', 'qwen3.6:35b-a3b', 'qwen3.6:35b', 'qwen3.6'],
    parameterSize: '35B (Active ~3B MoE)',
    quantization: 'Q4_K_M',
    hardwareReq: 'RAM 24GB+ hoặc GPU VRAM 12-16GB+',
    recommendedFor: 'Tư duy học thuật chuyên sâu, lập luận sư phạm xuất sắc, chuẩn hóa tiếng Việt cao cấp',
    category: 'heavyweight',
  },
  {
    id: 'gemma4-12b',
    name: 'Gemma 4 12B',
    tag: 'gemma4:12b',
    aliases: ['gemma4:12b', 'gemma4', 'gemma-4:12b'],
    parameterSize: '12B',
    quantization: 'Q4_K_M',
    hardwareReq: 'RAM 16GB+ hoặc GPU VRAM 8-10GB',
    recommendedFor: 'Cân bằng hoàn hảo giữa chất lượng sư phạm, hiểu chuẩn đầu ra CĐR và tốc độ phản hồi',
    category: 'balanced',
  },
  {
    id: 'qwen2.5-coder-7b',
    name: 'qwen2.5-coder:7b',
    tag: 'qwen2.5-coder:7b',
    aliases: ['qwen2.5-coder:7b', 'qwen2.5-coder'],
    parameterSize: '7B',
    quantization: 'Q4_K_M',
    hardwareReq: 'RAM 8-16GB hoặc GPU VRAM 5-6GB',
    recommendedFor: 'Xử lý cấu trúc dữ liệu JSON cực chuẩn, logic bảng biểu chính xác, tốc độ cao trên laptop phổ thông',
    category: 'fast',
  },
  {
    id: 'gemma4-e4b',
    name: 'gemma4:e4b',
    tag: 'gemma4:e4b',
    aliases: ['gemma4:e4b', 'gemma4:4b', 'gemma-4:e4b', 'gemma:4b'],
    parameterSize: '4B (Edge)',
    quantization: 'Q4_0',
    hardwareReq: 'RAM 6-8GB, chạy mượt mà ngay cả trên CPU không có GPU rời',
    recommendedFor: 'Siêu nhẹ, khởi động tức thì, tiết kiệm pin & RAM, thích hợp soạn thảo nhanh',
    category: 'edge',
  },
];

export const DEFAULT_OLLAMA_SETTINGS: OllamaSettings = {
  endpoint: 'http://localhost:11434',
  model: 'qwen2.5-coder:7b',
  temperature: 0.3,
  topP: 0.9,
  numCtx: 4096,
  useProxy: false,
};

const STORAGE_KEY_SETTINGS = 'kh_ollama_settings';

export function loadOllamaSettings(): OllamaSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_OLLAMA_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.error('Error loading Ollama settings', e);
  }
  return DEFAULT_OLLAMA_SETTINGS;
}

export function saveOllamaSettings(settings: OllamaSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving Ollama settings', e);
  }
}

export function isLocalhostEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
}

/**
 * Resolves the effective endpoint URL depending on proxy setting
 */
export function getEffectiveEndpoint(settings: OllamaSettings): string {
  // Only use Vite proxy if explicitly enabled AND running in a local dev environment
  if (settings.useProxy && isLocalhostEnvironment()) {
    return '/api/ollama';
  }
  return (settings.endpoint || 'http://localhost:11434').replace(/\/+$/, '');
}

/**
 * Check connectivity to Ollama server and list available models
 */
export async function checkOllamaConnection(settings: OllamaSettings): Promise<OllamaConnectionStatus> {
  const start = performance.now();
  const ep = getEffectiveEndpoint(settings);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`${ep}/api/tags`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const availableModels: string[] = (data.models || []).map((m: any) => m.name || m.model);
      const latencyMs = Math.round(performance.now() - start);

      // Optionally fetch version
      let version = 'Ollama local';
      try {
        const vRes = await fetch(`${ep}/api/version`);
        if (vRes.ok) {
          const vData = await vRes.json();
          if (vData.version) version = `v${vData.version}`;
        }
      } catch {
        // ignore version check failure
      }

      return {
        isConnected: true,
        isChecking: false,
        latencyMs,
        availableModels,
        ollamaVersion: version,
        lastChecked: new Date().toLocaleTimeString('vi-VN'),
      };
    } else {
      return {
        isConnected: false,
        isChecking: false,
        error: `Máy chủ Ollama phản hồi HTTP ${res.status}`,
        availableModels: [],
        lastChecked: new Date().toLocaleTimeString('vi-VN'),
      };
    }
  } catch (err: any) {
    let errorMsg = 'Chưa kết nối tới Ollama. Hãy mở Terminal chạy "ollama serve"';
    if (err.name === 'AbortError') {
      errorMsg = 'Hết thời gian chờ kết nối (> 3s).';
    } else if (err.message && err.message.includes('Failed to fetch')) {
      errorMsg = 'Không thể kết nối đến Ollama. Hãy kiểm tra biến môi trường OLLAMA_ORIGINS="*" và lệnh "ollama serve".';
    }

    return {
      isConnected: false,
      isChecking: false,
      error: errorMsg,
      availableModels: [],
      lastChecked: new Date().toLocaleTimeString('vi-VN'),
    };
  }
}

/**
 * Generate completion from Ollama with optional streaming callback
 */
export async function callOllamaGenerate({
  settings,
  prompt,
  systemPrompt,
  onToken,
  signal,
}: {
  settings: OllamaSettings;
  prompt: string;
  systemPrompt?: string;
  onToken?: (token: string, accumulated: string) => void;
  signal?: AbortSignal;
}): Promise<string> {
  const ep = getEffectiveEndpoint(settings);
  const stream = Boolean(onToken);

  const payload = {
    model: settings.model,
    prompt: prompt,
    system: systemPrompt || 'Bạn là một chuyên gia sư phạm đại học hàng đầu Việt Nam, am hiểu sâu sắc quy định về Đề cương chi tiết học phần, chuẩn đầu ra (CLO / CĐR), phương pháp dạy học tích cực và đánh giá kết quả học tập.',
    stream,
    options: {
      temperature: settings.temperature ?? 0.3,
      top_p: settings.topP ?? 0.9,
      num_ctx: settings.numCtx ?? 4096,
    },
  };

  const response = await fetch(`${ep}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(
      `Ollama trả về lỗi HTTP ${response.status}: ${errorText || response.statusText}. Kiểm tra xem model "${settings.model}" đã được kéo về (ollama pull ${settings.model}) chưa.`
    );
  }

  if (stream && response.body) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let accumulated = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter((l) => l.trim().length > 0);

      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.response) {
            accumulated += parsed.response;
            onToken?.(parsed.response, accumulated);
          }
        } catch {
          // ignore chunk parse errors
        }
      }
    }
    return accumulated;
  } else {
    const data = await response.json();
    return data.response || '';
  }
}

/**
 * Safely parse JSON from LLM output (handles ```json fences, trailing commas, partial quotes)
 */
export function extractJsonFromResponse<T = any>(rawText: string): T | null {
  if (!rawText) return null;

  // 1. Try markdown code block
  const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
  const match = rawText.match(jsonBlockRegex);
  let content = match ? match[1].trim() : rawText.trim();

  // 2. Try direct JSON parse
  try {
    return JSON.parse(content);
  } catch {
    // Try finding the first '[' or '{' and last ']' or '}'
    const firstBracket = content.indexOf('[');
    const lastBracket = content.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      try {
        return JSON.parse(content.substring(firstBracket, lastBracket + 1));
      } catch {
        // Continue fallback
      }
    }

    const firstBrace = content.indexOf('{');
    const lastBrace = content.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(content.substring(firstBrace, lastBrace + 1));
      } catch {
        // Continue
      }
    }
  }

  return null;
}

/**
 * AI TASK 1: Generate Full Course Lessons from Scratch
 */
export async function aiGenerateFullSyllabus({
  settings,
  courseInfo,
  totalLessons = 10,
  extraRequirements,
  onToken,
  signal,
}: {
  settings: OllamaSettings;
  courseInfo: CourseInfo;
  totalLessons?: number;
  extraRequirements?: string;
  onToken?: (token: string, accumulated: string) => void;
  signal?: AbortSignal;
}): Promise<CourseLesson[]> {
  const prompt = `
Bạn là chuyên gia sư phạm đại học. Hãy thiết kế toàn bộ bảng KẾ HOẠCH VÀ PHƯƠNG PHÁP DẠY HỌC (chuẩn Mục F Đề cương chi tiết học phần) cho môn học sau:

THÔNG TIN MÔN HỌC:
- Tên học phần: "${courseInfo.courseName}"
- Mã học phần: "${courseInfo.courseCode || 'MH01'}"
- Số tín chỉ: ${courseInfo.credits || 3} (Lý thuyết: ${courseInfo.theoryCredits || 2}, Thực hành: ${courseInfo.practiceCredits || 1})
- Đơn vị phụ trách: "${courseInfo.facultyName || 'Khoa Công nghệ thông tin'}"
- Số lượng bài học dự kiến: ${totalLessons} bài
${extraRequirements ? `- Yêu cầu thêm từ giảng viên: "${extraRequirements}"` : ''}

QUY TẮC PHÂN BỔ THỜI LƯỢNG & SƯ PHẠM:
1. Mỗi bài có số tiết cụ thể (tổng số tiết cả môn = tín chỉ * 15 tiết lớp, cộng thêm số tiết tự học tương ứng 1 tín chỉ = 30 tiết tự học).
2. Chuẩn đầu ra (CĐR/CLO) dùng định dạng G1.1, G1.2, G2.1 theo phân loại Bloom (nhớ, hiểu, vận dụng, phân tích).
3. Đánh giá: Dùng mã A1.1 (Chuyên cần/Thảo luận), A1.2 (Bài tập cá nhân/nhóm), A2.1 (Thi/Bảo vệ kết thúc học phần).
4. Phương pháp dạy học: Kết hợp Thuyết trình gợi mở, Thảo luận nhóm, Dạy học giải quyết vấn đề, Hướng dẫn thực hành, Case study.
5. Nội dung bài giảng (topics) chi tiết gồm 3-4 tiểu mục cụ thể rõ ràng.

YÊU CẦU ĐỊNH DẠNG ĐẦU RA:
BẮT BUỘC trả về duy nhất một mảng JSON hợp lệ chứa các bài học, KHÔNG viết thêm lời chào hay giải thích ngoài mã JSON.
Cấu trúc mẫu mỗi phần tử trong mảng:
[
  {
    "stt": "1",
    "content": "Bài 1: Tên bài học rõ ràng",
    "topics": [
      "1. Tiểu mục thứ nhất",
      "2. Tiểu mục thứ hai",
      "3. Tiểu mục thứ ba"
    ],
    "cdr": "G1.1\\nG1.2",
    "assessment": "A1.1 (Vấn đáp / Thảo luận)",
    "totalPeriods": 4,
    "classPeriods": 4,
    "theoryPeriods": 2,
    "discussionPeriods": 1,
    "exercisePeriods": 1,
    "guidedStudyPeriods": 0,
    "selfStudyPeriods": 4,
    "materials": "Giáo trình bài giảng chương 1, slide bài giảng",
    "methods": ["Thuyết trình gợi mở", "Đàm thoại / Vấn đáp", "Thảo luận nhóm"]
  }
]
`;

  const rawOutput = await callOllamaGenerate({
    settings,
    prompt,
    onToken,
    signal,
  });

  const parsed = extractJsonFromResponse<any[]>(rawOutput);
  if (Array.isArray(parsed) && parsed.length > 0) {
    return parsed.map((item, idx) => ({
      id: Date.now() + idx,
      stt: String(item.stt || idx + 1),
      content: item.content || `Bài ${idx + 1}: Nội dung bài giảng`,
      topics: Array.isArray(item.topics) ? item.topics : (item.content ? [item.content] : []),
      cdr: item.cdr || 'G1.1\nG1.2',
      assessment: item.assessment || 'A1.1',
      totalPeriods: Number(item.totalPeriods) || 4,
      classPeriods: Number(item.classPeriods) || Number(item.totalPeriods) || 4,
      theoryPeriods: Number(item.theoryPeriods) || 2,
      discussionPeriods: Number(item.discussionPeriods) || 1,
      practiceGroupPeriods: Number(item.practiceGroupPeriods) || 0,
      practiceIndividualPeriods: Number(item.practiceIndividualPeriods) || 0,
      exercisePeriods: Number(item.exercisePeriods) || 1,
      guidedStudyPeriods: Number(item.guidedStudyPeriods) || 0,
      selfStudyPeriods: Number(item.selfStudyPeriods) || 4,
      materials: item.materials || 'Giáo trình và bài giảng học phần',
      methods: Array.isArray(item.methods) && item.methods.length > 0
        ? item.methods
        : ['Thuyết trình gợi mở', 'Đàm thoại / Vấn đáp', 'Thảo luận nhóm'],
    }));
  }

  // Fallback if parsing failed: build basic structure from text
  throw new Error('Mô hình Ollama không trả về đúng định dạng mảng JSON. Hãy thử lại hoặc chọn mô hình qwen2.5-coder:7b để có định dạng JSON chuẩn nhất.');
}

/**
 * AI TASK 2: Suggest Pedagogical Teaching Methods and Activities for a Specific Lesson
 */
export async function aiSuggestLessonEnhancements({
  settings,
  lesson,
  courseInfo,
  onToken,
  signal,
}: {
  settings: OllamaSettings;
  lesson: CourseLesson;
  courseInfo: CourseInfo;
  onToken?: (token: string, accumulated: string) => void;
  signal?: AbortSignal;
}): Promise<{
  methods: string[];
  lecturerActivities: string[];
  studentActivities: string[];
  suggestedTopics: string[];
  suggestedCdr: string;
  suggestedAssessment: string;
  pedagogicalAdvice: string;
}> {
  const prompt = `
Bạn là chuyên gia phương pháp giảng dạy đại học. Hãy phân tích và đề xuất phương pháp dạy học tích cực, hoạt động sư phạm cho bài học sau:

Môn học: "${courseInfo.courseName}" (${courseInfo.credits} tín chỉ)
Bài học: "${lesson.content}"
Nội dung chi tiết hiện tại: ${lesson.topics?.join('; ') || 'Chưa chi tiết'}
Thời lượng: ${lesson.totalPeriods} tiết (LT: ${lesson.theoryPeriods}, TL: ${lesson.discussionPeriods}, BT: ${lesson.exercisePeriods}, Tự học: ${lesson.selfStudyPeriods})
CĐR hiện tại: "${lesson.cdr || 'G1.1'}"

HÃY ĐỀ XUẤT:
1. Danh sách phương pháp dạy học tích cực phù hợp nhất (3-5 phương pháp).
2. Hoạt động cụ thể của Giảng viên (trên lớp & hướng dẫn).
3. Hoạt động cụ thể của Sinh viên (chuẩn bị, tương tác, thực hành).
4. Làm giàu danh sách tiểu mục bài học (topics chi tiết).
5. Chuẩn đầu ra (CĐR / CLO) tối ưu hóa theo Bloom.
6. Hình thức kiểm tra, đánh giá (A1.1, A1.2...).
7. Lời khuyên sư phạm ngắn gọn (1-2 câu).

YÊU CẦU TRẢ VỀ DUY NHẤT 1 ĐỐI TƯỢNG JSON THEO ĐỊNH DẠNG:
{
  "methods": ["Thuyết trình gợi mở", "Dạy học giải quyết vấn đề", "Thảo luận nhóm"],
  "lecturerActivities": [
    "Trình bày tình huống thực tiễn mở đầu bài học",
    "Điều phối thảo luận và giải đáp thắc mắc chuyên sâu",
    "Giao bài tập tình huống cho các nhóm và đánh giá quá trình"
  ],
  "studentActivities": [
    "Đọc trước tài liệu giáo trình chương tương ứng",
    "Làm việc nhóm giải quyết bài tập tình huống và trình bày kết quả",
    "Tự học và hoàn thành bài trắc nghiệm củng cố trên LMS"
  ],
  "suggestedTopics": [
    "1. Nội dung trọng tâm lý thuyết nền tảng",
    "2. Phân tích các trường hợp ứng dụng thực tế",
    "3. Thảo luận và thực hành kỹ năng"
  ],
  "suggestedCdr": "G1.1\\nG1.2",
  "suggestedAssessment": "A1.1 (Đánh giá quá trình và bài tập nhóm)",
  "pedagogicalAdvice": "Nên dành 20 phút đầu để kích thích tư duy bằng câu hỏi gợi mở, sau đó phân nhóm sinh viên giải quyết bài tập."
}
`;

  const rawOutput = await callOllamaGenerate({
    settings,
    prompt,
    onToken,
    signal,
  });

  const parsed = extractJsonFromResponse<any>(rawOutput);
  if (parsed && typeof parsed === 'object') {
    return {
      methods: Array.isArray(parsed.methods) ? parsed.methods : ['Thuyết trình gợi mở', 'Đàm thoại / Vấn đáp', 'Thảo luận nhóm'],
      lecturerActivities: Array.isArray(parsed.lecturerActivities) ? parsed.lecturerActivities : [],
      studentActivities: Array.isArray(parsed.studentActivities) ? parsed.studentActivities : [],
      suggestedTopics: Array.isArray(parsed.suggestedTopics) ? parsed.suggestedTopics : lesson.topics,
      suggestedCdr: parsed.suggestedCdr || lesson.cdr,
      suggestedAssessment: parsed.suggestedAssessment || lesson.assessment,
      pedagogicalAdvice: parsed.pedagogicalAdvice || 'Áp dụng linh hoạt các phương pháp tương tác để tăng tính chủ động của người học.',
    };
  }

  throw new Error('Không phân tích được phản hồi từ Ollama thành đối tượng cấu trúc.');
}

/**
 * AI TASK 3: Batch Optimize All Lessons in current syllabus
 */
export async function aiBatchOptimizeSyllabus({
  settings,
  lessons,
  courseInfo,
  onToken,
  signal,
}: {
  settings: OllamaSettings;
  lessons: CourseLesson[];
  courseInfo: CourseInfo;
  onToken?: (token: string, accumulated: string) => void;
  signal?: AbortSignal;
}): Promise<CourseLesson[]> {
  const simplifiedLessons = lessons.map(l => ({
    stt: l.stt,
    content: l.content,
    topics: l.topics,
    totalPeriods: l.totalPeriods,
    theoryPeriods: l.theoryPeriods,
    discussionPeriods: l.discussionPeriods,
    exercisePeriods: l.exercisePeriods,
    selfStudyPeriods: l.selfStudyPeriods,
    cdr: l.cdr,
    assessment: l.assessment,
    methods: l.methods,
    materials: l.materials,
  }));

  const prompt = `
Bạn là chuyên gia sư phạm đại học. Dưới đây là danh sách ${lessons.length} bài học của môn "${courseInfo.courseName}".
Hãy rà soát toàn bộ, làm giàu nội dung tiểu mục, tối ưu hóa chuẩn đầu ra (CĐR), chuẩn hóa phân bổ thời lượng và gắn các phương pháp dạy học tích cực phù hợp nhất cho từng bài.

DANH SÁCH BÀI HỌC HIỆN TẠI:
${JSON.stringify(simplifiedLessons, null, 2)}

YÊU CẦU:
Trả về duy nhất mảng JSON gồm đầy đủ ${lessons.length} bài học đã được nâng cấp hoàn thiện, giữ nguyên số lượng và số thứ tự bài:
[
  {
    "stt": "1",
    "content": "Bài 1: Tên bài",
    "topics": ["1.1...", "1.2...", "1.3..."],
    "cdr": "G1.1\\nG1.2",
    "assessment": "A1.1",
    "totalPeriods": 4,
    "classPeriods": 4,
    "theoryPeriods": 2,
    "discussionPeriods": 1,
    "exercisePeriods": 1,
    "guidedStudyPeriods": 0,
    "selfStudyPeriods": 4,
    "materials": "Giáo trình học phần, Slide bài giảng",
    "methods": ["Thuyết trình gợi mở", "Đàm thoại / Vấn đáp", "Thảo luận nhóm"]
  }
]
`;

  const rawOutput = await callOllamaGenerate({
    settings,
    prompt,
    onToken,
    signal,
  });

  const parsed = extractJsonFromResponse<any[]>(rawOutput);
  if (Array.isArray(parsed) && parsed.length > 0) {
    return parsed.map((item, idx) => {
      const orig = lessons[idx] || {};
      return {
        id: orig.id || Date.now() + idx,
        stt: String(item.stt || orig.stt || idx + 1),
        content: item.content || orig.content,
        topics: Array.isArray(item.topics) ? item.topics : orig.topics || [],
        cdr: item.cdr || orig.cdr || 'G1.1\nG1.2',
        assessment: item.assessment || orig.assessment || 'A1.1',
        totalPeriods: Number(item.totalPeriods) || orig.totalPeriods || 4,
        classPeriods: Number(item.classPeriods) || orig.classPeriods || 4,
        theoryPeriods: Number(item.theoryPeriods) ?? orig.theoryPeriods ?? 2,
        discussionPeriods: Number(item.discussionPeriods) ?? orig.discussionPeriods ?? 1,
        practiceGroupPeriods: orig.practiceGroupPeriods || 0,
        practiceIndividualPeriods: orig.practiceIndividualPeriods || 0,
        exercisePeriods: Number(item.exercisePeriods) ?? orig.exercisePeriods ?? 1,
        guidedStudyPeriods: Number(item.guidedStudyPeriods) ?? orig.guidedStudyPeriods ?? 0,
        selfStudyPeriods: Number(item.selfStudyPeriods) ?? orig.selfStudyPeriods ?? 4,
        materials: item.materials || orig.materials || 'Giáo trình bài giảng',
        methods: Array.isArray(item.methods) && item.methods.length > 0 ? item.methods : orig.methods || ['Thuyết trình gợi mở'],
      };
    });
  }

  throw new Error('Không phân tích được danh sách bài học tối ưu từ Ollama.');
}
