import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  Clipboard, 
  FileCode, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Table as TableIcon,
  ChevronDown,
  Info,
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';
import { RawTableData, ColumnMapping, CourseLesson } from '../types';
import { 
  extractRawTablesFromDocx, 
  extractRawTablesFromExcel, 
  parsePastedTable, 
  autoDetectColumnMapping, 
  convertRawTableToLessons 
} from '../services/documentService';

interface UniversalImporterProps {
  onImportComplete: (lessons: CourseLesson[], fileName?: string) => void;
  onCancel?: () => void;
}

type ImportTab = 'word' | 'excel' | 'paste' | 'json';

const UniversalImporter: React.FC<UniversalImporterProps> = ({
  onImportComplete,
  onCancel,
}) => {
  const [activeTab, setActiveTab] = useState<ImportTab>('word');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Multiple tables extracted from document
  const [rawTables, setRawTables] = useState<RawTableData[]>([]);
  const [selectedTableIdx, setSelectedTableIdx] = useState<number>(0);
  const [mapping, setMapping] = useState<ColumnMapping | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [detectedFileName, setDetectedFileName] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection (Word or Excel)
  const handleFileUpload = async (file: File, type: 'word' | 'excel') => {
    setLoading(true);
    setError(null);
    setRawTables([]);
    setMapping(null);
    setDetectedFileName(file.name);

    try {
      let tables: RawTableData[] = [];
      if (type === 'word') {
        tables = await extractRawTablesFromDocx(file);
      } else {
        tables = await extractRawTablesFromExcel(file);
      }

      setRawTables(tables);
      setSelectedTableIdx(0);
      const autoMap = autoDetectColumnMapping(tables[0].headers);
      setMapping(autoMap);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Không thể xử lý tệp. Vui lòng kiểm tra định dạng bảng.');
    } finally {
      setLoading(false);
    }
  };

  // Handle pasted table
  const handlePasteSubmit = () => {
    if (!pastedText.trim()) {
      setError('Vui lòng dán dữ liệu bảng từ Excel hoặc Word vào ô bên dưới.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const table = parsePastedTable(pastedText);
      setRawTables([table]);
      setSelectedTableIdx(0);
      setDetectedFileName('Dữ liệu bảng dán');
      const autoMap = autoDetectColumnMapping(table.headers);
      setMapping(autoMap);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Không thể nhận diện cấu trúc bảng từ nội dung dán.');
    } finally {
      setLoading(false);
    }
  };

  // Handle JSON backup import
  const handleJsonUpload = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (Array.isArray(data) && data.length > 0 && data[0].content) {
        onImportComplete(data, file.name.replace(/\.json$/i, ''));
      } else if (data.lessons && Array.isArray(data.lessons)) {
        onImportComplete(data.lessons, data.courseInfo?.courseName || file.name);
      } else {
        throw new Error('Cấu trúc file JSON không hợp lệ (cần chứa danh sách bài học).');
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Tệp JSON không hợp lệ.');
    } finally {
      setLoading(false);
    }
  };

  // Handle table switch if document has multiple tables/sheets
  const handleTableSwitch = (idx: number) => {
    setSelectedTableIdx(idx);
    const table = rawTables[idx];
    if (table) {
      const autoMap = autoDetectColumnMapping(table.headers);
      setMapping(autoMap);
    }
  };

  // Update specific column mapping
  const updateMapping = (key: keyof ColumnMapping, value: number) => {
    if (!mapping) return;
    setMapping({
      ...mapping,
      [key]: value,
    });
  };

  // Confirm and convert table to lessons
  const handleFinishImport = () => {
    const table = rawTables[selectedTableIdx];
    if (!table || !mapping) return;

    if (mapping.contentCol < 0) {
      setError('Vui lòng chỉ định cột chứa "Nội dung / Tên bài học".');
      return;
    }

    try {
      const lessons = convertRawTableToLessons(table, mapping);
      if (lessons.length === 0) {
        setError('Không tạo được bài học nào từ cấu hình cột hiện tại. Vui lòng kiểm tra lại ánh xạ cột.');
        return;
      }
      onImportComplete(lessons, detectedFileName);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Lỗi khi chuyển đổi dữ liệu thành kế hoạch dạy học.');
    }
  };

  const activeTable = rawTables[selectedTableIdx];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-slate-900 text-base">
              Nhập từ Mẫu bất kỳ (Universal Importer)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Hỗ trợ nhập mọi định dạng bảng từ Word (.docx), Excel (.xlsx, .csv), dán trực tiếp hoặc file cấu hình JSON.
          </p>
        </div>

        {/* Source format switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setActiveTab('word'); setRawTables([]); setMapping(null); }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'word' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            Word (.docx)
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('excel'); setRawTables([]); setMapping(null); }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'excel' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Excel / CSV
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('paste'); setRawTables([]); setMapping(null); }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'paste' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clipboard className="w-3.5 h-3.5" />
            Dán bảng
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('json'); setRawTables([]); setMapping(null); }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'json' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            JSON
          </button>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: UPLOAD OR PASTE INPUT AREA (When no table is loaded yet) */}
      {rawTables.length === 0 && (
        <div className="space-y-4">
          {/* Tab Word */}
          {activeTab === 'word' && (
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors bg-slate-50/50">
              <input
                type="file"
                id="universal-word-upload"
                className="hidden"
                accept=".docx"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0], 'word');
                  }
                }}
              />
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm mb-1">
                Tải lên tệp Word (.docx) chứa bảng bất kỳ
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
                Hệ thống hỗ trợ mọi mẫu đề cương của mọi trường: Bảng 5 cột, 6 cột, 10 cột, 14 cột... Tự động quét và khớp các cột thông minh.
              </p>
              <label
                htmlFor="universal-word-upload"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-sm transition-colors"
              >
                Chọn tệp Word (.docx)
              </label>
            </div>
          )}

          {/* Tab Excel */}
          {activeTab === 'excel' && (
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-emerald-500 transition-colors bg-slate-50/50">
              <input
                type="file"
                id="universal-excel-upload"
                className="hidden"
                accept=".xlsx, .xls, .csv"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0], 'excel');
                  }
                }}
              />
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm mb-1">
                Tải lên tệp Excel / CSV (.xlsx, .xls, .csv)
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
                Đọc bảng phân bổ số tiết hoặc ma trận giảng dạy từ file Excel. Cho phép chọn sheet nếu có nhiều sheet.
              </p>
              <label
                htmlFor="universal-excel-upload"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-sm transition-colors"
              >
                Chọn tệp Excel / CSV
              </label>
            </div>
          )}

          {/* Tab Paste */}
          {activeTab === 'paste' && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">
                Dán dữ liệu bảng từ Excel, Word, Google Sheets hoặc Web (Copy từ bảng rồi bấm Ctrl+V vào đây):
              </label>
              <textarea
                rows={6}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder={`STT\tNội dung bài học\tLT\tTL\tBT\tTự học\tCĐR\tĐánh giá
1\tBài 1: Tổng quan\t2\t1\t1\t2\tG1.1\tA1.1
2\tBài 2: Kiến trúc hệ thống\t2\t1\t1\t2\tG1.2\tA1.1`}
                className="w-full p-3 text-xs font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden bg-slate-50/50"
              />
              <button
                type="button"
                onClick={handlePasteSubmit}
                disabled={!pastedText.trim()}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
              >
                Phân tích dữ liệu đã dán
              </button>
            </div>
          )}

          {/* Tab JSON */}
          {activeTab === 'json' && (
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-amber-500 transition-colors bg-slate-50/50">
              <input
                type="file"
                id="universal-json-upload"
                className="hidden"
                accept=".json"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleJsonUpload(e.target.files[0]);
                  }
                }}
              />
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileCode className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm mb-1">
                Tải lên file JSON cấu hình kế hoạch
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
                Khôi phục lại phiên làm việc từ file sao lưu JSON đã lưu từ ứng dụng.
              </p>
              <label
                htmlFor="universal-json-upload"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-sm transition-colors"
              >
                Chọn tệp JSON
              </label>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: COLUMN MAPPING & PREVIEW (When table has been extracted) */}
      {rawTables.length > 0 && activeTable && mapping && (
        <div className="space-y-6">
          {/* Multiple tables picker banner if document has >1 table */}
          {rawTables.length > 1 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
              <span className="font-semibold text-blue-900">
                Tìm thấy {rawTables.length} bảng trong tài liệu. Chọn bảng muốn nhập:
              </span>
              <div className="flex items-center gap-1.5">
                {rawTables.map((t, idx) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleTableSwitch(idx)}
                    className={`px-3 py-1 rounded-md font-medium transition-colors ${
                      selectedTableIdx === idx
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Column Mapping Controls */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                  Ánh xạ cột tự động & Tùy chỉnh (Đã tìm thấy {activeTable.headers.length} cột):
                </h4>
              </div>
              <button
                type="button"
                onClick={() => {
                  const autoMap = autoDetectColumnMapping(activeTable.headers);
                  setMapping(autoMap);
                }}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
              >
                <RefreshCw className="w-3 h-3" />
                Nhận diện lại
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
              {/* Cột Nội dung / Tên bài (Bắt buộc) */}
              <div className="p-2.5 bg-white rounded-lg border-2 border-blue-500 shadow-2xs">
                <label className="font-bold text-blue-900 block mb-1 flex items-center justify-between">
                  <span>Nội dung / Tên bài *</span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-normal">Bắt buộc</span>
                </label>
                <select
                  value={mapping.contentCol}
                  onChange={(e) => updateMapping('contentCol', parseInt(e.target.value, 10))}
                  className="w-full p-1.5 border border-slate-300 rounded font-medium text-slate-800 bg-white"
                >
                  <option value={-1}>-- Chưa chọn --</option>
                  {activeTable.headers.map((h, i) => (
                    <option key={i} value={i}>
                      Cột {i + 1}: {h}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cột STT */}
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <label className="font-semibold text-slate-700 block mb-1">
                  Số thứ tự (STT / Tuần)
                </label>
                <select
                  value={mapping.sttCol}
                  onChange={(e) => updateMapping('sttCol', parseInt(e.target.value, 10))}
                  className="w-full p-1.5 border border-slate-300 rounded text-slate-800 bg-white"
                >
                  <option value={-1}>-- Tự động đánh số --</option>
                  {activeTable.headers.map((h, i) => (
                    <option key={i} value={i}>
                      Cột {i + 1}: {h}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cột Lý thuyết (LT) */}
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <label className="font-semibold text-slate-700 block mb-1">
                  Lý thuyết (LT)
                </label>
                <select
                  value={mapping.theoryCol}
                  onChange={(e) => updateMapping('theoryCol', parseInt(e.target.value, 10))}
                  className="w-full p-1.5 border border-slate-300 rounded text-slate-800 bg-white"
                >
                  <option value={-1}>-- Không có --</option>
                  {activeTable.headers.map((h, i) => (
                    <option key={i} value={i}>
                      Cột {i + 1}: {h}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cột Thảo luận (TL) */}
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <label className="font-semibold text-slate-700 block mb-1">
                  Thảo luận (TL)
                </label>
                <select
                  value={mapping.discussionCol}
                  onChange={(e) => updateMapping('discussionCol', parseInt(e.target.value, 10))}
                  className="w-full p-1.5 border border-slate-300 rounded text-slate-800 bg-white"
                >
                  <option value={-1}>-- Không có --</option>
                  {activeTable.headers.map((h, i) => (
                    <option key={i} value={i}>
                      Cột {i + 1}: {h}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cột Bài tập / TH (BT) */}
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <label className="font-semibold text-slate-700 block mb-1">
                  Bài tập / Thực hành (BT)
                </label>
                <select
                  value={mapping.exerciseCol}
                  onChange={(e) => updateMapping('exerciseCol', parseInt(e.target.value, 10))}
                  className="w-full p-1.5 border border-slate-300 rounded text-slate-800 bg-white"
                >
                  <option value={-1}>-- Không có --</option>
                  {activeTable.headers.map((h, i) => (
                    <option key={i} value={i}>
                      Cột {i + 1}: {h}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cột Tự học có HD */}
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <label className="font-semibold text-slate-700 block mb-1">
                  Tự học có HD
                </label>
                <select
                  value={mapping.guidedStudyCol}
                  onChange={(e) => updateMapping('guidedStudyCol', parseInt(e.target.value, 10))}
                  className="w-full p-1.5 border border-slate-300 rounded text-slate-800 bg-white"
                >
                  <option value={-1}>-- Không có --</option>
                  {activeTable.headers.map((h, i) => (
                    <option key={i} value={i}>
                      Cột {i + 1}: {h}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cột Tự học */}
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <label className="font-semibold text-slate-700 block mb-1">
                  Tự học (ở nhà)
                </label>
                <select
                  value={mapping.selfStudyCol}
                  onChange={(e) => updateMapping('selfStudyCol', parseInt(e.target.value, 10))}
                  className="w-full p-1.5 border border-slate-300 rounded text-slate-800 bg-white"
                >
                  <option value={-1}>-- Không có --</option>
                  {activeTable.headers.map((h, i) => (
                    <option key={i} value={i}>
                      Cột {i + 1}: {h}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cột Tổng số tiết */}
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <label className="font-semibold text-slate-700 block mb-1">
                  Tổng số tiết (hoặc tính tự động)
                </label>
                <select
                  value={mapping.totalPeriodsCol}
                  onChange={(e) => updateMapping('totalPeriodsCol', parseInt(e.target.value, 10))}
                  className="w-full p-1.5 border border-slate-300 rounded text-slate-800 bg-white"
                >
                  <option value={-1}>-- Tự tính = LT+TL+BT --</option>
                  {activeTable.headers.map((h, i) => (
                    <option key={i} value={i}>
                      Cột {i + 1}: {h}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cột Chuẩn đầu ra (CĐR) */}
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <label className="font-semibold text-slate-700 block mb-1">
                  Chuẩn đầu ra (CĐR / CLO)
                </label>
                <select
                  value={mapping.cdrCol}
                  onChange={(e) => updateMapping('cdrCol', parseInt(e.target.value, 10))}
                  className="w-full p-1.5 border border-slate-300 rounded text-slate-800 bg-white"
                >
                  <option value={-1}>-- Không có --</option>
                  {activeTable.headers.map((h, i) => (
                    <option key={i} value={i}>
                      Cột {i + 1}: {h}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cột Bài KT, ĐG */}
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <label className="font-semibold text-slate-700 block mb-1">
                  Bài kiểm tra, đánh giá
                </label>
                <select
                  value={mapping.assessmentCol}
                  onChange={(e) => updateMapping('assessmentCol', parseInt(e.target.value, 10))}
                  className="w-full p-1.5 border border-slate-300 rounded text-slate-800 bg-white"
                >
                  <option value={-1}>-- Không có --</option>
                  {activeTable.headers.map((h, i) => (
                    <option key={i} value={i}>
                      Cột {i + 1}: {h}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cột Tài liệu / Học liệu */}
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <label className="font-semibold text-slate-700 block mb-1">
                  Học liệu / Tài liệu
                </label>
                <select
                  value={mapping.materialsCol}
                  onChange={(e) => updateMapping('materialsCol', parseInt(e.target.value, 10))}
                  className="w-full p-1.5 border border-slate-300 rounded text-slate-800 bg-white"
                >
                  <option value={-1}>-- Không có --</option>
                  {activeTable.headers.map((h, i) => (
                    <option key={i} value={i}>
                      Cột {i + 1}: {h}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Raw Table Sample Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <TableIcon className="w-3.5 h-3.5 text-slate-500" />
                Xem trước dữ liệu bảng trích xuất được (Hiển thị tối đa 5 dòng đầu):
              </span>
              <span className="text-[11px] text-slate-500">
                Tổng cộng {activeTable.rows.length} dòng dữ liệu
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-56">
              <table className="min-w-full divide-y divide-slate-200 text-[11px]">
                <thead className="bg-slate-100 sticky top-0">
                  <tr>
                    {activeTable.headers.map((h, idx) => (
                      <th
                        key={idx}
                        className={`px-3 py-2 text-left font-bold border-r border-slate-200 last:border-r-0 whitespace-nowrap ${
                          idx === mapping.contentCol
                            ? 'bg-blue-100 text-blue-900'
                            : 'text-slate-700'
                        }`}
                      >
                        <div className="text-[10px] text-slate-400 font-normal">Cột {idx + 1}</div>
                        <div>{h}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {activeTable.rows.slice(0, 5).map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50/70">
                      {activeTable.headers.map((_, cIdx) => (
                        <td
                          key={cIdx}
                          className={`px-3 py-1.5 border-r border-slate-100 last:border-r-0 max-w-xs truncate ${
                            cIdx === mapping.contentCol ? 'bg-blue-50/30 font-medium text-slate-900' : 'text-slate-600'
                          }`}
                        >
                          {row[cIdx] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Confirm Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setRawTables([]);
                setMapping(null);
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Chọn lại tệp / nguồn khác
            </button>

            <button
              type="button"
              onClick={handleFinishImport}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all transform hover:scale-[1.02]"
            >
              <CheckCircle2 className="w-4 h-4" />
              Áp dụng & Chuyển đổi thành Kế hoạch dạy học
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversalImporter;
