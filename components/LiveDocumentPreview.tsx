import React from 'react';
import { CourseLesson, CourseInfo, TemplateType } from '../types';
import { Eye, Printer } from 'lucide-react';

interface LiveDocumentPreviewProps {
  lessons: CourseLesson[];
  courseInfo: CourseInfo;
  template: TemplateType;
}

const LiveDocumentPreview: React.FC<LiveDocumentPreviewProps> = ({
  lessons,
  courseInfo,
  template,
}) => {
  if (lessons.length === 0) {
    return (
      <div className="p-8 text-center bg-white border border-dashed border-slate-300 rounded-xl text-slate-500">
        Chưa có dữ liệu bài học để hiển thị bản xem trước. Hãy tải file lên hoặc chọn một mẫu học phần có sẵn ở trên.
      </div>
    );
  }

  const formatTwoDigits = (num: number) => (num < 10 ? `0${num}` : `${num}`);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1.5 font-medium text-slate-700">
          <Eye className="w-4 h-4 text-blue-600" />
          Bản xem trước trực quan (Trực quan hóa tài liệu Word xuất ra):
        </span>
        <span className="italic">
          Font Times New Roman chuẩn thể thức văn bản hành chính Việt Nam
        </span>
      </div>

      {/* Simulated A4 Word Document Paper */}
      <div className="bg-white border border-slate-300 rounded-xl p-6 sm:p-10 shadow-lg overflow-x-auto font-serif text-slate-900">
        {/* Document Header */}
        <div className="mb-6 space-y-1">
          <div className="flex justify-between items-start text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800">
            <div>
              <div>{courseInfo.universityName || 'TRƯỜNG ĐẠI HỌC / HỌC VIỆN'}</div>
              <div className="font-semibold text-slate-700">{courseInfo.facultyName || 'KHOA CÔNG NGHỆ THÔNG TIN'}</div>
            </div>
            <div className="text-right">
              <div>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
              <div className="text-xs font-semibold normal-case underline decoration-1 underline-offset-2">Độc lập - Tự do - Hạnh phúc</div>
            </div>
          </div>

          <div className="text-center pt-4">
            <h2 className="text-base sm:text-lg font-bold uppercase text-slate-900">
              {template === 'weekly'
                ? 'KẾ HOẠCH GIẢNG DẠY THEO TUẦN / BUỔI HỌC'
                : template === 'matrix'
                ? 'BẢNG MA TRẬN PHƯƠNG PHÁP DẠY HỌC VÀ CHUẨN ĐẦU RA (CĐR/CLO)'
                : 'F. KẾ HOẠCH VÀ PHƯƠNG PHÁP DẠY HỌC'}
            </h2>
            <div className="text-xs sm:text-sm font-semibold mt-1">
              Học phần: {courseInfo.courseName} (Mã HP: {courseInfo.courseCode} - {courseInfo.credits} tín chỉ)
            </div>
            {courseInfo.instructorName && (
              <div className="text-xs italic text-slate-600">
                Giảng viên: {courseInfo.instructorName} | {courseInfo.semester} - Năm học {courseInfo.academicYear}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TEMPLATE 1: MẪU CHUẨN MỤC F                                              */}
        {/* ========================================================================= */}
        {template === 'muc_f' && (
          <table className="w-full border-collapse border border-black text-xs">
            <thead>
              <tr className="bg-slate-100 font-bold text-center">
                <th rowSpan={2} className="border border-black p-2 w-[14%] align-middle">
                  Bài<br />(số tiết)
                </th>
                <th rowSpan={2} className="border border-black p-2 w-[28%] align-middle">
                  Nội dung
                </th>
                <th rowSpan={2} className="border border-black p-2 w-[10%] align-middle">
                  CĐR
                </th>
                <th colSpan={2} className="border border-black p-2 align-middle">
                  Hoạt động dạy và học
                </th>
                <th rowSpan={2} className="border border-black p-2 w-[12%] align-middle">
                  Bài<br />KT, ĐG
                </th>
              </tr>
              <tr className="bg-slate-100 font-bold text-center">
                <th className="border border-black p-2 w-[18%] align-middle">Giảng viên</th>
                <th className="border border-black p-2 w-[18%] align-middle">Học viên</th>
              </tr>
            </thead>
            <tbody>
              {lessons.map((lesson) => {
                // Determine active sections for this lesson
                const activeSections: {
                  title: string;
                  topics: string[];
                  blocks: { teacher: string[]; student: string[] }[];
                }[] = [];

                let secCounter = 1;
                const getRoman = (n: number) => ['I', 'II', 'III', 'IV', 'V'][n - 1] || `${n}`;

                if (lesson.theoryPeriods > 0) {
                  activeSections.push({
                    title: `${getRoman(secCounter++)}. LÝ THUYẾT: ${formatTwoDigits(lesson.theoryPeriods)} tiết`,
                    topics: lesson.topics,
                    blocks: [
                      {
                        teacher: ['1. Hình thức', 'Tổ chức dạy học lý thuyết theo đội hình cả lớp'],
                        student: ['Ghi nội dung tương ứng với hoạt động của giáo viên'],
                      },
                      {
                        teacher: [
                          '2. Phương pháp',
                          ...((lesson.methods && lesson.methods.length > 0)
                            ? lesson.methods.map(m => `- ${m}`)
                            : ['- Thuyết trình các khái niệm cơ bản', '- Đàm thoại gợi mở']),
                          '+ Đưa ra câu hỏi thảo luận',
                          '+ Giải đáp câu hỏi dựa trên câu trả lời của HV',
                        ],
                        student: [
                          '- Lắng nghe, tích cực ghi chép',
                          '- Trao đổi, trả lời câu hỏi của GV',
                        ],
                      },
                      {
                        teacher: [
                          '3. Định hướng tự học',
                          '- Xem lại các nội dung lý thuyết của bài học',
                          '- Giải các bài tập trong đề cương',
                        ],
                        student: [
                          '- Sử dụng giáo trình, bài giảng điện tử',
                          '- Làm các bài tập theo yêu cầu',
                        ],
                      },
                    ],
                  });
                }

                if (lesson.discussionPeriods > 0) {
                  activeSections.push({
                    title: `${getRoman(secCounter++)}. THẢO LUẬN: ${formatTwoDigits(lesson.discussionPeriods)} tiết`,
                    topics: lesson.topics.slice(0, 3),
                    blocks: [
                      {
                        teacher: ['1. Hình thức', 'Duy trì theo khối lớp, phân chia nhóm'],
                        student: ['Ghi nội dung tương ứng hoạt động của GV'],
                      },
                      {
                        teacher: [
                          '2. Phương pháp',
                          '- Yêu cầu HV nghiên cứu nội dung thảo luận',
                          '- Định hướng thảo luận nhóm',
                          '- Kết luận và chuẩn hóa kiến thức',
                        ],
                        student: [
                          '- Tiếp nhận yêu cầu của GV',
                          '- Trao đổi, thảo luận nhóm',
                          '- Ghi chép kết luận của GV',
                        ],
                      },
                    ],
                  });
                }

                const exerciseHours = lesson.exercisePeriods || (lesson.practiceGroupPeriods + lesson.practiceIndividualPeriods);
                if (exerciseHours > 0) {
                  activeSections.push({
                    title: `${getRoman(secCounter++)}. BÀI TẬP / THỰC HÀNH: ${formatTwoDigits(exerciseHours)} tiết`,
                    topics: lesson.topics.slice(0, 3),
                    blocks: [
                      {
                        teacher: ['1. Hình thức', 'Cả lớp (làm bài cá nhân hoặc theo nhóm)'],
                        student: ['Theo điều hành của giáo viên'],
                      },
                      {
                        teacher: [
                          '2. Phương pháp',
                          '- Hướng dẫn giải chi tiết bài tập / thao tác mẫu',
                          '- Theo dõi HV làm bài, giải đáp thắc mắc',
                        ],
                        student: [
                          '- Chủ động áp dụng lý thuyết để giải quyết bài tập',
                          '- Đề nghị GV làm rõ những nội dung chưa hiểu',
                        ],
                      },
                    ],
                  });
                }

                if (lesson.guidedStudyPeriods > 0) {
                  activeSections.push({
                    title: `${getRoman(secCounter++)}. TỰ HỌC CÓ HD: ${formatTwoDigits(lesson.guidedStudyPeriods)} tiết`,
                    topics: lesson.topics.slice(0, 2),
                    blocks: [
                      {
                        teacher: ['1. Hình thức', 'Duy trì theo khối lớp hoặc tổ học phụ'],
                        student: ['Thực hiện theo yêu cầu của GV'],
                      },
                      {
                        teacher: ['2. Phương pháp', '- Duy trì nề nếp, bồi dưỡng, giải đáp thắc mắc'],
                        student: ['- Chấp hành nề nếp, tự giác nghiên cứu'],
                      },
                    ],
                  });
                }

                if (lesson.selfStudyPeriods > 0) {
                  activeSections.push({
                    title: `${getRoman(secCounter++)}. TỰ HỌC: ${formatTwoDigits(lesson.selfStudyPeriods)} tiết`,
                    topics: lesson.topics.slice(0, 2),
                    blocks: [
                      {
                        teacher: ['1. Hình thức', 'Tổ chức tự học theo lớp đơn hoặc tự nghiên cứu'],
                        student: ['Thực hiện theo yêu cầu của GV'],
                      },
                      {
                        teacher: ['2. Phương pháp', '- Cán bộ đơn vị kết hợp tổ học phụ triển khai nội dung'],
                        student: ['- Tự học các nội dung được phân công, thảo luận'],
                      },
                    ],
                  });
                }

                if (activeSections.length === 0) {
                  activeSections.push({
                    title: `LÝ THUYẾT: ${formatTwoDigits(lesson.totalPeriods)} tiết`,
                    topics: lesson.topics,
                    blocks: [
                      {
                        teacher: ['1. Hình thức', 'Tập trung toàn lớp'],
                        student: ['Lắng nghe, ghi chép'],
                      },
                      {
                        teacher: ['2. Phương pháp', '- Thuyết trình, đàm thoại gợi mở'],
                        student: ['- Trả lời câu hỏi của GV'],
                      },
                    ],
                  });
                }

                const totalRowsForLesson = activeSections.reduce((acc, sec) => acc + sec.blocks.length, 0);

                let isFirstLessonRow = true;

                return activeSections.flatMap((section) => {
                  const sectionRowsCount = section.blocks.length;

                  return section.blocks.map((block, blockIdx) => {
                    const isFirstRowOfSection = blockIdx === 0;
                    const showLessonSpans = isFirstLessonRow;
                    if (isFirstLessonRow) isFirstLessonRow = false;

                    return (
                      <tr key={`${lesson.id}-${section.title}-${blockIdx}`} className="hover:bg-slate-50/50">
                        {/* Col 1: Lesson Name (Merged) */}
                        {showLessonSpans && (
                          <td
                            rowSpan={totalRowsForLesson}
                            className="border border-black p-2.5 text-center font-bold align-middle bg-slate-50/30"
                          >
                            <div>{lesson.content}</div>
                            <div className="font-normal text-[11px] text-slate-600 mt-1">
                              ({formatTwoDigits(lesson.totalPeriods)} tiết)
                            </div>
                          </td>
                        )}

                        {/* Col 2: Content (Merged per section) */}
                        {isFirstRowOfSection && (
                          <td
                            rowSpan={sectionRowsCount}
                            className="border border-black p-2.5 align-top"
                          >
                            <div className="font-bold text-slate-900 mb-1">{section.title}</div>
                            <ul className="list-none space-y-0.5 text-[11px] text-slate-700">
                              {section.topics.map((t, ti) => (
                                <li key={ti} className={/^\d+\./.test(t) ? 'font-semibold' : ''}>
                                  {t}
                                </li>
                              ))}
                            </ul>
                          </td>
                        )}

                        {/* Col 3: CĐR (Merged) */}
                        {showLessonSpans && (
                          <td
                            rowSpan={totalRowsForLesson}
                            className="border border-black p-2 text-center align-middle font-semibold"
                          >
                            {(lesson.cdr || '-').split('\n').map((c, ci) => (
                              <div key={ci}>{c}</div>
                            ))}
                          </td>
                        )}

                        {/* Col 4: GV Activity */}
                        <td className="border border-black p-2 align-top text-[11px]">
                          {block.teacher.map((line, li) => (
                            <div key={li} className={/^\d+\./.test(line) ? 'font-bold mt-0.5 text-slate-900' : 'text-slate-700'}>
                              {line}
                            </div>
                          ))}
                        </td>

                        {/* Col 5: HV Activity */}
                        <td className="border border-black p-2 align-top text-[11px]">
                          {block.student.map((line, li) => (
                            <div key={li} className={/^\d+\./.test(line) ? 'font-bold mt-0.5 text-slate-900' : 'text-slate-700'}>
                              {line}
                            </div>
                          ))}
                        </td>

                        {/* Col 6: Assessment (Merged) */}
                        {showLessonSpans && (
                          <td
                            rowSpan={totalRowsForLesson}
                            className="border border-black p-2 text-center align-middle text-[11px] font-medium"
                          >
                            {(lesson.assessment || '-').split('\n').map((a, ai) => (
                              <div key={ai}>{a}</div>
                            ))}
                          </td>
                        )}
                      </tr>
                    );
                  });
                });
              })}
            </tbody>
          </table>
        )}

        {/* ========================================================================= */}
        {/* TEMPLATE 2: MẪU KẾ HOẠCH THEO TUẦN / BUỔI HỌC                            */}
        {/* ========================================================================= */}
        {template === 'weekly' && (
          <table className="w-full border-collapse border border-black text-xs">
            <thead>
              <tr className="bg-slate-100 font-bold text-center">
                <th className="border border-black p-2 w-[10%] align-middle">Tuần / Buổi</th>
                <th className="border border-black p-2 w-[28%] align-middle">Tên bài & Nội dung giảng dạy chi tiết</th>
                <th className="border border-black p-2 w-[12%] align-middle">Thời lượng<br />(Số tiết)</th>
                <th className="border border-black p-2 w-[10%] align-middle">CĐR bài học (CLO)</th>
                <th className="border border-black p-2 w-[26%] align-middle">Phương pháp & Hoạt động sư phạm (GV - SV)</th>
                <th className="border border-black p-2 w-[14%] align-middle">Đánh giá & Học liệu</th>
              </tr>
            </thead>
            <tbody>
              {lessons.map((lesson, idx) => (
                <tr key={lesson.id} className="hover:bg-slate-50/50">
                  <td className="border border-black p-2.5 text-center font-bold align-middle bg-slate-50/30">
                    Tuần {idx + 1}<br />
                    <span className="font-normal text-[11px] text-slate-600">(Buổi {idx + 1})</span>
                  </td>
                  <td className="border border-black p-2.5 align-top">
                    <div className="font-bold text-slate-900 mb-1">{lesson.content}</div>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-700">
                      {lesson.topics.map((t, ti) => (
                        <li key={ti}>{t}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="border border-black p-2 text-center align-middle">
                    <div className="font-bold text-slate-900">{lesson.totalPeriods} tiết</div>
                    <div className="text-[10px] text-slate-600 mt-1">
                      LT: {lesson.theoryPeriods} | TL: {lesson.discussionPeriods}<br />
                      BT: {lesson.exercisePeriods} | Tự học: {lesson.selfStudyPeriods}
                    </div>
                  </td>
                  <td className="border border-black p-2 text-center align-middle font-semibold">
                    {(lesson.cdr || '-').split('\n').map((c, ci) => (
                      <div key={ci}>{c}</div>
                    ))}
                  </td>
                  <td className="border border-black p-2.5 align-top text-[11px] space-y-2">
                    <div>
                      <strong className="text-slate-900 block mb-0.5">1. Hoạt động Giảng viên:</strong>
                      <div className="text-slate-700 pl-1">
                        - Phương pháp: {(lesson.methods || ['Thuyết trình', 'Đàm thoại']).join(', ')}<br />
                        - Thuyết trình lý thuyết trọng tâm, đặt câu hỏi gợi mở.<br />
                        - Tổ chức thảo luận / hướng dẫn giải bài tập.
                      </div>
                    </div>
                    <div>
                      <strong className="text-slate-900 block mb-0.5">2. Hoạt động Sinh viên:</strong>
                      <div className="text-slate-700 pl-1">
                        - Đọc trước giáo trình, tài liệu bài học.<br />
                        - Nghe giảng, tương tác, làm bài tập nhóm/cá nhân.<br />
                        - Tự học {lesson.selfStudyPeriods || 0} tiết tại nhà.
                      </div>
                    </div>
                  </td>
                  <td className="border border-black p-2 align-top text-[11px]">
                    <div className="font-bold text-slate-900">Đánh giá:</div>
                    <div className="text-slate-700 mb-1.5">{lesson.assessment || 'A1.1 (Chuyên cần)'}</div>
                    <div className="font-bold text-slate-900">Học liệu:</div>
                    <div className="text-slate-600 text-[10px]">{lesson.materials || 'Giáo trình & Slide'}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* ========================================================================= */}
        {/* TEMPLATE 3: MA TRẬN PHƯƠNG PHÁP VÀ CĐR                                    */}
        {/* ========================================================================= */}
        {template === 'matrix' && (
          <table className="w-full border-collapse border border-black text-xs">
            <thead>
              <tr className="bg-slate-100 font-bold text-center">
                <th className="border border-black p-2 w-[6%] align-middle">STT</th>
                <th className="border border-black p-2 w-[26%] align-middle">Bài học / Nội dung giảng dạy</th>
                <th className="border border-black p-2 w-[12%] align-middle">Chuẩn đầu ra<br />(CĐR / CLO)</th>
                <th className="border border-black p-2 w-[24%] align-middle">Phương pháp giảng dạy chủ đạo (GV)</th>
                <th className="border border-black p-2 w-[20%] align-middle">Hoạt động học tập của Sinh viên</th>
                <th className="border border-black p-2 w-[12%] align-middle">Hình thức & Đánh giá</th>
              </tr>
            </thead>
            <tbody>
              {lessons.map((lesson, idx) => (
                <tr key={lesson.id} className="hover:bg-slate-50/50">
                  <td className="border border-black p-2 text-center align-middle font-bold">
                    {idx + 1}
                  </td>
                  <td className="border border-black p-2.5 align-top">
                    <div className="font-bold text-slate-900">{lesson.content}</div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      Tổng số: {lesson.totalPeriods} tiết (LT: {lesson.theoryPeriods}, TL: {lesson.discussionPeriods}, BT: {lesson.exercisePeriods})
                    </div>
                  </td>
                  <td className="border border-black p-2 text-center align-middle font-bold text-blue-900">
                    {(lesson.cdr || '-').split('\n').map((c, ci) => (
                      <div key={ci}>{c}</div>
                    ))}
                  </td>
                  <td className="border border-black p-2.5 align-top text-[11px]">
                    <div className="font-bold text-slate-900 mb-1">
                      {(lesson.methods || ['Thuyết trình tích cực', 'Đàm thoại', 'Thảo luận']).join(', ')}
                    </div>
                    <div className="text-slate-700 space-y-0.5">
                      <div>- Thuyết trình lý thuyết trọng yếu.</div>
                      <div>- Tổ chức thảo luận nhóm và bài tập tình huống.</div>
                      <div>- Hướng dẫn tự học và khai thác học liệu số.</div>
                    </div>
                  </td>
                  <td className="border border-black p-2.5 align-top text-[11px] text-slate-700 space-y-0.5">
                    <div>- Đọc trước tài liệu môn học.</div>
                    <div>- Nghe giảng, ghi chép, tích cực trả lời.</div>
                    <div>- Thảo luận nhóm, hoàn thành bài tập.</div>
                    <div>- Ôn tập và tự nghiên cứu chuyên sâu.</div>
                  </td>
                  <td className="border border-black p-2 text-center align-middle text-[11px]">
                    <div className="font-semibold text-slate-900">
                      {lesson.assessment || 'A1.1 (Đánh giá thường xuyên)'}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      Chuyên cần & Vấn đáp
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Footer Signature Block */}
        <div className="mt-8 pt-4 flex justify-between items-start text-xs sm:text-sm text-center">
          <div>
            <div className="font-bold uppercase text-slate-800">TRƯỞNG BỘ MÔN / KHOA</div>
            <div className="text-slate-500 italic mt-1">(Ký và ghi rõ họ tên)</div>
          </div>
          <div>
            <div className="italic text-slate-600 mb-1">
              ......, ngày ..... tháng ..... năm 202...
            </div>
            <div className="font-bold uppercase text-slate-800">GIẢNG VIÊN BIÊN SOẠN</div>
            <div className="text-slate-500 italic mt-1">(Ký và ghi rõ họ tên)</div>
            {courseInfo.instructorName && (
              <div className="font-bold text-slate-900 mt-12">{courseInfo.instructorName}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveDocumentPreview;
