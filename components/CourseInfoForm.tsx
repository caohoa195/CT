import React, { useState } from 'react';
import { ChevronDown, ChevronUp, GraduationCap, Building2, User, Hash } from 'lucide-react';
import { CourseInfo } from '../types';

interface CourseInfoFormProps {
  courseInfo: CourseInfo;
  onChange: (info: CourseInfo) => void;
}

const CourseInfoForm: React.FC<CourseInfoFormProps> = ({ courseInfo, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (field: keyof CourseInfo, value: string | number) => {
    onChange({
      ...courseInfo,
      [field]: value,
    });
  };

  return (
    <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-xs">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3.5 bg-slate-50/80 hover:bg-slate-100/80 flex items-center justify-between text-left transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-blue-100 text-blue-700">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-slate-800 text-sm">
              Thông tin Học phần & Đơn vị đào tạo (Tiêu đề văn bản Word)
            </span>
            <p className="text-xs text-slate-500">
              {courseInfo.courseName ? `${courseInfo.courseName} (${courseInfo.courseCode || 'Chưa có mã'}) - ${courseInfo.facultyName || 'Khoa'}` : 'Nhấn để tùy chỉnh tên trường, tên môn, giảng viên'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <span>{isOpen ? 'Thu gọn' : 'Chỉnh sửa'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-5 border-t border-slate-200 bg-white space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                Tên Trường / Học viện
              </label>
              <input
                type="text"
                value={courseInfo.universityName}
                onChange={(e) => handleChange('universityName', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden"
                placeholder="TRƯỜNG ĐẠI HỌC / HỌC VIỆN..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Khoa / Bộ môn
              </label>
              <input
                type="text"
                value={courseInfo.facultyName}
                onChange={(e) => handleChange('facultyName', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden"
                placeholder="KHOA CÔNG NGHỆ THÔNG TIN..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên Học phần (Môn học)
              </label>
              <input
                type="text"
                value={courseInfo.courseName}
                onChange={(e) => handleChange('courseName', e.target.value)}
                className="w-full px-3 py-2 text-sm font-medium border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden"
                placeholder="Ví dụ: Tin học đại cương"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                Mã Học phần
              </label>
              <input
                type="text"
                value={courseInfo.courseCode}
                onChange={(e) => handleChange('courseCode', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden"
                placeholder="TIN101"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số tín chỉ
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={courseInfo.credits || 3}
                onChange={(e) => handleChange('credits', parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Giảng viên phụ trách
              </label>
              <input
                type="text"
                value={courseInfo.instructorName}
                onChange={(e) => handleChange('instructorName', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden"
                placeholder="TS. Nguyễn Văn A"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Học kỳ
              </label>
              <input
                type="text"
                value={courseInfo.semester}
                onChange={(e) => handleChange('semester', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden"
                placeholder="Học kỳ I"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Năm học
              </label>
              <input
                type="text"
                value={courseInfo.academicYear}
                onChange={(e) => handleChange('academicYear', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden"
                placeholder="2025 - 2026"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseInfoForm;
