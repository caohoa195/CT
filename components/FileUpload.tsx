import React, { useCallback, useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isProcessing }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateAndSetFile = (file: File) => {
    const isDocx = file.name.toLowerCase().endsWith('.docx') || 
                   file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    if (!isDocx) {
        setError("Vui lòng tải lên tệp định dạng .docx");
        return;
    }
    setError(null);
    setSelectedFileName(file.name);
    onFileSelect(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        validateAndSetFile(e.dataTransfer.files[0]);
    }
  }, [onFileSelect]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        validateAndSetFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto mb-8">
      <div 
        className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl transition-all duration-300 ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white'
        } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".docx"
            onChange={handleChange}
            disabled={isProcessing}
        />
        
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
            {selectedFileName ? <CheckCircle size={32} /> : <Upload size={32} />}
        </div>

        <h3 className="text-lg font-semibold text-slate-700 mb-2">
            {selectedFileName ? 'Đã chọn tệp tin' : 'Tải lên bảng Cấu trúc học phần (.docx)'}
        </h3>
        
        <p className="text-slate-500 text-center mb-6 text-sm">
            {selectedFileName 
                ? selectedFileName 
                : "Kéo thả tệp .docx vào đây, hoặc nhấn để duyệt file từ máy tính"}
        </p>

        {error && (
            <div className="flex items-center text-red-500 text-sm mb-4">
                <AlertCircle size={16} className="mr-2" />
                {error}
            </div>
        )}

        <label 
            htmlFor="file-upload" 
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium cursor-pointer transition-colors shadow-sm"
        >
            {selectedFileName ? 'Đổi tệp khác' : 'Chọn tệp Word'}
        </label>
      </div>
    </div>
  );
};

export default FileUpload;