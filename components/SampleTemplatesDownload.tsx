import React, { useState } from 'react';
import { Download, FileText, CheckCircle2, Loader2, Sparkles, HelpCircle } from 'lucide-react';
import { 
  downloadSampleCourseStructureDocx, 
  exportTeachingPlanByTemplate 
} from '../services/documentService';
import { SAMPLE_PRESETS, DEFAULT_COURSE_INFO } from '../services/sampleData';
import { TemplateType } from '../types';

const SampleTemplatesDownload: React.FC = () => {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownloadInputSample = async () => {
    try {
      setDownloading('input_sample');
      await downloadSampleCourseStructureDocx();
    } catch (e) {
      console.error(e);
      alert('Không thể tạo file mẫu');
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadOutputSample = async (template: TemplateType, key: string) => {
    try {
      setDownloading(key);
      const sampleCourse = SAMPLE_PRESETS[0];
      await exportTeachingPlanByTemplate(template, sampleCourse.lessons, {
        ...DEFAULT_COURSE_INFO,
        courseName: sampleCourse.name,
        courseCode: sampleCourse.code,
      });
    } catch (e) {
      console.error(e);
      alert('Không thể tạo file mẫu');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Kho tệp mẫu Word (.docx) chuẩn quy định
            </h3>
            <p className="text-xs text-slate-500">
              Tải về các tệp Word mẫu để tham khảo cấu trúc bảng hoặc làm phôi điền thông tin đề cương.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: File Word Đầu vào (Cấu trúc học phần) */}
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                  Tệp đầu vào (Dùng để tải lên hệ thống)
                </span>
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">
                Bảng Cấu trúc học phần (Mẫu chuẩn .docx)
              </h4>
              <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                Chứa bảng dữ liệu chuẩn gồm 14 cột (STT, Nội dung, CĐR, Tổng số tiết, Số tiết trên lớp, LT, TL, TH N, TH Đ, BT, Học có HD, Bài KT ĐG, Tự học, Học liệu). Bạn có thể tải về, điền môn của mình và tải lên lại app.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadInputSample}
              disabled={downloading === 'input_sample'}
              className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-70"
            >
              {downloading === 'input_sample' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              Tải file Word Cấu trúc học phần mẫu
            </button>
          </div>

          {/* Card 2: Mẫu 1 Mục F */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded">
                  Tệp kết quả: Mẫu 1
                </span>
                <FileText className="w-4 h-4 text-slate-600" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">
                Mục F: Kế hoạch và phương pháp dạy học (.docx)
              </h4>
              <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                Tệp Word hoàn chỉnh chuẩn Mục F Đề cương chi tiết: tách khối LT, TL, BT, Tự học; phân định rõ Hình thức, Phương pháp, Định hướng tự học của GV và HV.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleDownloadOutputSample('muc_f', 'output_sample_f')}
              disabled={downloading === 'output_sample_f'}
              className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-70"
            >
              {downloading === 'output_sample_f' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              Tải file Word Kế hoạch dạy học (Mẫu 1)
            </button>
          </div>

          {/* Card 3: Mẫu 2 Kế hoạch tuần */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  Tệp kết quả: Mẫu 2
                </span>
                <FileText className="w-4 h-4 text-emerald-600" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">
                Kế hoạch giảng dạy theo Tuần / Buổi học (.docx)
              </h4>
              <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                Lịch trình chi tiết theo từng tuần học: thời lượng LT/TL/BT, CĐR bài học, phương pháp sư phạm, hoạt động người học và đánh giá.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleDownloadOutputSample('weekly', 'output_sample_weekly')}
              disabled={downloading === 'output_sample_weekly'}
              className="w-full py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-70"
            >
              {downloading === 'output_sample_weekly' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              Tải file Word Lịch theo tuần (Mẫu 2)
            </button>
          </div>

          {/* Card 4: Mẫu 3 Ma trận CĐR */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded">
                  Tệp kết quả: Mẫu 3
                </span>
                <FileText className="w-4 h-4 text-indigo-600" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">
                Ma trận Phương pháp dạy học & CĐR CLO (.docx)
              </h4>
              <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                Bảng đối sánh ma trận giữa Chuẩn đầu ra bài học và các phương pháp giảng dạy chủ đạo, kiểm tra đánh giá phục vụ kiểm định chất lượng.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleDownloadOutputSample('matrix', 'output_sample_matrix')}
              disabled={downloading === 'output_sample_matrix'}
              className="w-full py-2 px-3 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-70"
            >
              {downloading === 'output_sample_matrix' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              Tải file Word Ma trận CĐR (Mẫu 3)
            </button>
          </div>
        </div>
      </div>

      {/* Guidance Note */}
      <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 space-y-2">
        <div className="font-bold flex items-center gap-1.5 text-amber-950">
          <HelpCircle className="w-4 h-4 text-amber-600" />
          Hướng dẫn định dạng bảng khi tải file Word lên:
        </div>
        <ul className="list-disc list-inside space-y-1 text-amber-800">
          <li>
            Tệp Word tải lên cần chứa bảng có các cột: <strong>STT</strong>, <strong>Nội dung</strong>, <strong>CĐR</strong>, <strong>Tổng số tiết</strong>, <strong>LT</strong>, <strong>TL</strong>, <strong>BT</strong>, <strong>Tự học</strong>.
          </li>
          <li>
            Mỗi bài học chính bắt đầu bằng STT là số nguyên (1, 2, 3...) hoặc tên có chữ "Bài". Các mục con (1.1, 1.2...) bên dưới sẽ được tự động gom vào bài học đó.
          </li>
          <li>
            Hệ thống tự động phát hiện số tiết và sinh cấu trúc tương ứng (Lý thuyết, Thảo luận, Bài tập, Tự học có hướng dẫn, Tự học) kèm theo hoạt động của Giảng viên và Học viên theo đúng chuẩn sư phạm.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SampleTemplatesDownload;
