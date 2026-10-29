import React from 'react';
import { BookOpen, Check, Layers, Sparkles } from 'lucide-react';
import { SampleCoursePreset } from '../types';
import { SAMPLE_PRESETS } from '../services/sampleData';

interface SamplePresetsBarProps {
  activePresetId: string | null;
  onSelectPreset: (preset: SampleCoursePreset) => void;
}

const SamplePresetsBar: React.FC<SamplePresetsBarProps> = ({
  activePresetId,
  onSelectPreset,
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 border border-blue-200/80 rounded-2xl p-5 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-600 text-white rounded-lg shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-slate-900 text-sm sm:text-base">
            Dữ liệu mẫu học phần cung cấp sẵn (1-Click nạp mẫu):
          </h3>
        </div>
        <span className="text-xs text-blue-700 bg-white/80 px-2.5 py-1 rounded-full border border-blue-200 font-medium">
          Chọn môn học mẫu để trải nghiệm & xuất Word ngay
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {SAMPLE_PRESETS.map((preset) => {
          const isActive = activePresetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset)}
              className={`text-left p-3.5 rounded-xl transition-all border ${
                isActive
                  ? 'bg-white border-blue-500 shadow-sm ring-2 ring-blue-500/20'
                  : 'bg-white/80 border-slate-200 hover:bg-white hover:border-blue-300'
              }`}
            >
              <div className="flex items-start justify-between gap-1 mb-1.5">
                <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  {preset.name}
                </span>
                {isActive && (
                  <span className="shrink-0 p-0.5 bg-blue-600 text-white rounded-full">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </div>
              <p className="text-[12px] text-slate-500 line-clamp-2 mb-2 leading-relaxed">
                {preset.description}
              </p>
              <div className="flex items-center gap-2 text-[11px] font-medium text-slate-600">
                <span className="bg-slate-100 px-2 py-0.5 rounded">
                  {preset.code}
                </span>
                <span className="bg-blue-100/70 text-blue-700 px-2 py-0.5 rounded">
                  {preset.credits} tín chỉ
                </span>
                <span className="text-slate-400">
                  {preset.lessons.length} bài học
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SamplePresetsBar;
