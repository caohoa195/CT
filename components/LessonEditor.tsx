import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  Clock, 
  BookOpen, 
  Target, 
  CheckSquare, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  Copy
} from 'lucide-react';
import { CourseLesson } from '../types';
import { TEACHING_METHOD_OPTIONS } from '../services/sampleData';

interface LessonEditorProps {
  lessons: CourseLesson[];
  onChange: (lessons: CourseLesson[]) => void;
  onOpenOllamaAssistant?: (lesson: CourseLesson) => void;
  onOpenOllamaTab?: () => void;
}

const LessonEditor: React.FC<LessonEditorProps> = ({ 
  lessons, 
  onChange,
  onOpenOllamaAssistant,
  onOpenOllamaTab,
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(lessons[0]?.id ?? null);
  const [editForm, setEditForm] = useState<CourseLesson | null>(null);

  const startEdit = (lesson: CourseLesson) => {
    setEditingId(lesson.id);
    setEditForm({ ...lesson });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const saveEdit = () => {
    if (!editForm) return;
    const updated = lessons.map(l => l.id === editForm.id ? editForm : l);
    onChange(updated);
    setEditingId(null);
    setEditForm(null);
  };

  const deleteLesson = (id: number) => {
    if (confirm('Bạn có chắc muốn xóa bài học này khỏi kế hoạch?')) {
      const updated = lessons.filter(l => l.id !== id);
      onChange(updated);
    }
  };

  const duplicateLesson = (lesson: CourseLesson) => {
    const newLesson: CourseLesson = {
      ...lesson,
      id: Date.now(),
      stt: `${lessons.length + 1}`,
      content: `${lesson.content} (Bản sao)`,
    };
    onChange([...lessons, newLesson]);
  };

  const addNewLesson = () => {
    const nextStt = lessons.length + 1;
    const newLesson: CourseLesson = {
      id: Date.now(),
      stt: `${nextStt}`,
      content: `Bài ${nextStt}: Tên bài học mới`,
      topics: [
        '1. Nội dung trọng tâm thứ nhất',
        '2. Nội dung trọng tâm thứ hai',
        '3. Hướng dẫn thực hành và bài tập'
      ],
      cdr: 'G1.1\nG1.2',
      assessment: 'A1.1 (Vấn đáp / Thảo luận)',
      totalPeriods: 4,
      classPeriods: 4,
      theoryPeriods: 2,
      discussionPeriods: 1,
      practiceGroupPeriods: 0,
      practiceIndividualPeriods: 0,
      exercisePeriods: 1,
      guidedStudyPeriods: 0,
      selfStudyPeriods: 2,
      materials: 'Giáo trình bài giảng môn học',
      methods: ['Thuyết trình', 'Đàm thoại', 'Thảo luận nhóm']
    };
    onChange([...lessons, newLesson]);
    setEditingId(newLesson.id);
    setEditForm(newLesson);
    setExpandedId(newLesson.id);
  };

  const toggleMethod = (methodLabel: string) => {
    if (!editForm) return;
    const current = editForm.methods || [];
    const exists = current.includes(methodLabel);
    const updatedMethods = exists 
      ? current.filter(m => m !== methodLabel)
      : [...current, methodLabel];
    setEditForm({ ...editForm, methods: updatedMethods });
  };

  const handleTopicsTextChange = (text: string) => {
    if (!editForm) return;
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    setEditForm({ ...editForm, topics: lines });
  };

  // Quick auto-calculate total periods
  const handlePeriodsChange = (field: keyof CourseLesson, value: number) => {
    if (!editForm) return;
    const updated = { ...editForm, [field]: value };
    const classHours = (updated.theoryPeriods || 0) + (updated.discussionPeriods || 0) + (updated.exercisePeriods || 0);
    updated.classPeriods = classHours;
    updated.totalPeriods = classHours;
    setEditForm(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Danh sách bài học & Hoạt động sư phạm ({lessons.length} bài)
          </h3>
          <p className="text-xs text-slate-500">
            Xem trước, chỉnh sửa số tiết (LT/TL/BT/Tự học), phương pháp dạy học, CĐR và bài kiểm tra.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenOllamaTab && (
            <button
              type="button"
              onClick={onOpenOllamaTab}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              title="Chuyển đến bảng điều khiển Ollama AI để tạo hoặc tối ưu hàng loạt"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Tối ưu bằng Ollama
            </button>
          )}

          <button
            type="button"
            onClick={addNewLesson}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Thêm bài học mới
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {lessons.map((lesson, idx) => {
          const isEditing = editingId === lesson.id;
          const isExpanded = expandedId === lesson.id;

          if (isEditing && editForm) {
            return (
              <div
                key={lesson.id}
                className="p-5 border-2 border-blue-500 rounded-xl bg-blue-50/20 shadow-md space-y-4"
              >
                <div className="flex items-center justify-between border-b border-blue-200 pb-3">
                  <span className="font-bold text-blue-900 text-sm flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-blue-600" />
                    Chỉnh sửa: Bài #{idx + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    {onOpenOllamaAssistant && (
                      <button
                        type="button"
                        onClick={() => onOpenOllamaAssistant(editForm)}
                        className="px-2.5 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 text-xs font-bold rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                        title="Mở trợ lý Ollama để gợi ý phương pháp và tiểu mục cho bài này"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        Gợi ý với Ollama
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={saveEdit}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md flex items-center gap-1"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Lưu thay đổi
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-medium rounded-md flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      Hủy
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tên bài học / Tiêu đề
                    </label>
                    <input
                      type="text"
                      value={editForm.content}
                      onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Số thứ tự (STT)
                    </label>
                    <input
                      type="text"
                      value={editForm.stt}
                      onChange={(e) => setEditForm({ ...editForm, stt: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-center"
                    />
                  </div>
                </div>

                {/* Periods Allocation */}
                <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                  <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    Phân bổ thời lượng (tiết):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    <div>
                      <span className="text-[11px] text-slate-600 font-medium block mb-1">Lý thuyết (LT)</span>
                      <input
                        type="number"
                        min="0"
                        value={editForm.theoryPeriods}
                        onChange={(e) => handlePeriodsChange('theoryPeriods', parseInt(e.target.value, 10) || 0)}
                        className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded font-semibold text-center"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-600 font-medium block mb-1">Thảo luận (TL)</span>
                      <input
                        type="number"
                        min="0"
                        value={editForm.discussionPeriods}
                        onChange={(e) => handlePeriodsChange('discussionPeriods', parseInt(e.target.value, 10) || 0)}
                        className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded font-semibold text-center"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-600 font-medium block mb-1">Bài tập / TH (BT)</span>
                      <input
                        type="number"
                        min="0"
                        value={editForm.exercisePeriods}
                        onChange={(e) => handlePeriodsChange('exercisePeriods', parseInt(e.target.value, 10) || 0)}
                        className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded font-semibold text-center"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-600 font-medium block mb-1">Tự học có HD</span>
                      <input
                        type="number"
                        min="0"
                        value={editForm.guidedStudyPeriods}
                        onChange={(e) => setEditForm({ ...editForm, guidedStudyPeriods: parseInt(e.target.value, 10) || 0 })}
                        className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded font-semibold text-center"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-600 font-medium block mb-1">Tự học (ở nhà)</span>
                      <input
                        type="number"
                        min="0"
                        value={editForm.selfStudyPeriods}
                        onChange={(e) => setEditForm({ ...editForm, selfStudyPeriods: parseInt(e.target.value, 10) || 0 })}
                        className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded font-semibold text-center"
                      />
                    </div>
                  </div>
                  <div className="mt-2 text-right">
                    <span className="text-xs text-slate-600">
                      Tổng số tiết trên lớp: <strong className="text-blue-700">{editForm.totalPeriods} tiết</strong>
                    </span>
                  </div>
                </div>

                {/* Detailed Topics */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nội dung chi tiết các mục (Mỗi dòng là 1 mục/tiểu mục):
                  </label>
                  <textarea
                    rows={4}
                    value={editForm.topics.join('\n')}
                    onChange={(e) => handleTopicsTextChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white font-mono"
                    placeholder="1. Khái niệm cơ bản&#10;2. Quy trình thực hiện&#10;3. Bài tập ứng dụng"
                  />
                </div>

                {/* Teaching Methods Selection */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Phương pháp dạy học áp dụng cho bài này:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {TEACHING_METHOD_OPTIONS.map((opt) => {
                      const isChecked = (editForm.methods || []).includes(opt.label);
                      return (
                        <label
                          key={opt.id}
                          className={`flex items-center gap-1.5 p-2 rounded border text-xs cursor-pointer select-none transition-colors ${
                            isChecked 
                              ? 'bg-blue-100/70 border-blue-400 font-semibold text-blue-900' 
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleMethod(opt.label)}
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                          <span>{opt.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* CDR & Assessment */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-blue-600" />
                      Chuẩn đầu ra (CĐR / CLO)
                    </label>
                    <input
                      type="text"
                      value={editForm.cdr}
                      onChange={(e) => setEditForm({ ...editForm, cdr: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                      placeholder="G1.1, G1.2 hoặc CLO1, CLO2"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                      Bài kiểm tra, đánh giá (KT, ĐG)
                    </label>
                    <input
                      type="text"
                      value={editForm.assessment}
                      onChange={(e) => setEditForm({ ...editForm, assessment: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                      placeholder="A1.1 (Vấn đáp), A1.2 (Bài tập)..."
                    />
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div
              key={lesson.id}
              className="border border-slate-200 rounded-xl bg-white hover:border-slate-300 transition-all shadow-2xs overflow-hidden"
            >
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                    {lesson.stt || idx + 1}
                  </span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 text-sm">
                      {lesson.content}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                      <span className="bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded">
                        Tổng: {lesson.totalPeriods} tiết
                      </span>
                      <span>(LT: {lesson.theoryPeriods || 0} | TL: {lesson.discussionPeriods || 0} | BT: {lesson.exercisePeriods || 0} | Tự học: {lesson.selfStudyPeriods || 0})</span>
                      {lesson.cdr && (
                        <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-mono text-[11px]">
                          CĐR: {lesson.cdr.replace(/\n/g, ', ')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  {onOpenOllamaAssistant && (
                    <button
                      type="button"
                      onClick={() => onOpenOllamaAssistant(lesson)}
                      className="p-1.5 px-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs flex items-center gap-1 font-bold transition-colors cursor-pointer"
                      title="Gợi ý phương pháp và hoạt động sư phạm bằng AI Ollama"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="hidden md:inline">AI Gợi ý</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : lesson.id)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg text-xs flex items-center gap-1"
                    title="Xem chi tiết"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => startEdit(lesson)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-xs flex items-center gap-1 font-medium"
                    title="Chỉnh sửa bài"
                  >
                    <Edit3 className="w-4 h-4" />
                    Sửa
                  </button>
                  <button
                    type="button"
                    onClick={() => duplicateLesson(lesson)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg text-xs"
                    title="Nhân bản bài này"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteLesson(lesson.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg text-xs"
                    title="Xóa bài này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 pt-1 bg-slate-50/50 border-t border-slate-100 text-xs space-y-2">
                  <div>
                    <span className="font-semibold text-slate-700">Các mục nội dung ({lesson.topics.length}):</span>
                    <ul className="mt-1 list-disc list-inside space-y-0.5 text-slate-600">
                      {lesson.topics.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-1 text-slate-600">
                    <div>
                      <span className="font-semibold text-slate-700">Phương pháp: </span>
                      <span>{(lesson.methods || ['Thuyết trình', 'Đàm thoại']).join(', ')}</span>
                    </div>
                    {lesson.assessment && (
                      <div>
                        <span className="font-semibold text-slate-700">Đánh giá: </span>
                        <span>{lesson.assessment}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LessonEditor;
