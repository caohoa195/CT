import React from 'react';
import { FileCheck, Calendar, Grid3X3, Sparkles } from 'lucide-react';
import { TemplateType, TemplateDefinition } from '../types';
import { AVAILABLE_TEMPLATES } from '../services/sampleData';

interface TemplateSelectorProps {
  selectedTemplate: TemplateType;
  onSelectTemplate: (template: TemplateType) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  onSelectTemplate,
}) => {
  const getIcon = (id: TemplateType) => {
    switch (id) {
      case 'muc_f':
        return <FileCheck className="w-5 h-5 text-blue-600" />;
      case 'weekly':
        return <Calendar className="w-5 h-5 text-emerald-600" />;
      case 'matrix':
        return <Grid3X3 className="w-5 h-5 text-indigo-600" />;
      default:
        return <Sparkles className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Chọn định dạng mẫu cung cấp ("Kế hoạch và phương pháp dạy học"):
        </label>
        <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
          3 biểu mẫu chuẩn Bộ Giáo dục & Học viện
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {AVAILABLE_TEMPLATES.map((tmpl: TemplateDefinition) => {
          const isSelected = selectedTemplate === tmpl.id;
          return (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => onSelectTemplate(tmpl.id)}
              className={`text-left p-4 rounded-xl border-2 transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/60 shadow-md ring-2 ring-blue-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-white shadow-xs border border-slate-100">
                    {getIcon(tmpl.id)}
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tmpl.badge}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 leading-snug mb-1">
                  {tmpl.title}
                </h4>
                <p className="text-xs text-slate-600 line-clamp-2 mb-2 leading-relaxed">
                  {tmpl.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 mt-2">
                <span className="text-[11px] text-slate-500 italic block">
                  🎯 {tmpl.recommendedFor}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TemplateSelector;
