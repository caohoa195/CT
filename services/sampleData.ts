import { CourseLesson, CourseInfo, SampleCoursePreset, TemplateDefinition } from '../types';

export const DEFAULT_COURSE_INFO: CourseInfo = {
  universityName: 'TRƯỜNG ĐẠI HỌC / HỌC VIỆN',
  facultyName: 'KHOA CÔNG NGHỆ THÔNG TIN',
  courseName: 'Tin học đại cương',
  courseCode: 'TIN101',
  credits: 3,
  theoryCredits: 2,
  practiceCredits: 1,
  instructorName: 'TS. Nguyễn Văn A',
  semester: 'Học kỳ I',
  academicYear: '2025 - 2026',
};

export const AVAILABLE_TEMPLATES: TemplateDefinition[] = [
  {
    id: 'muc_f',
    title: 'Mẫu 1: Chuẩn Mục F - Đề cương chi tiết học phần',
    subtitle: 'Bảng Kế hoạch và phương pháp dạy học (Quy chuẩn Học viện & ĐH)',
    description: 'Bao gồm 5 cột chính: Bài (số tiết) | Nội dung chi tiết (phân tách rõ Lý thuyết, Thảo luận, Bài tập, Tự học có HD, Tự học) | CĐR | Hoạt động dạy và học (cột con Giảng viên - Học viên) | Bài KT, ĐG. Tự động chia dòng ngang phân biệt rõ Hình thức, Phương pháp, Định hướng tự học.',
    badge: 'Mẫu phổ biến nhất',
    recommendedFor: 'Phù hợp đề cương chi tiết môn học, hồ sơ kiểm định chất lượng giáo dục',
  },
  {
    id: 'weekly',
    title: 'Mẫu 2: Kế hoạch giảng dạy theo Tuần / Buổi học',
    subtitle: 'Lịch trình chi tiết theo từng tuần học hoặc buổi lên lớp',
    description: 'Bao gồm: Tuần/Buổi | Số tiết (LT/TL/BT/TH) | Nội dung bài giảng | Chuẩn đầu ra bài học | Phương pháp & Hoạt động sư phạm | Nhiệm vụ người học & Đánh giá.',
    badge: 'Lịch trình giảng dạy',
    recommendedFor: 'Phù hợp giáo án tiến trình, sổ tay giảng viên, kế hoạch tuần học',
  },
  {
    id: 'matrix',
    title: 'Mẫu 3: Ma trận Phương pháp dạy học & CĐR (CLO)',
    subtitle: 'Bảng đối sánh Chuẩn đầu ra và Phương pháp dạy - học',
    description: 'Bao gồm: STT & Tên bài | Chuẩn đầu ra (CLO / CĐR) | Phương pháp giảng dạy chủ đạo | Hoạt động học tập của sinh viên | Phương pháp & Hình thức kiểm tra đánh giá tương ứng.',
    badge: 'Kiểm định & Đổi mới',
    recommendedFor: 'Phù hợp báo cáo đổi mới phương pháp giảng dạy, đối sánh ma trận CĐR',
  },
];

export const TEACHING_METHOD_OPTIONS = [
  { id: 'thuyet_trinh', label: 'Thuyết trình gợi mở', desc: 'Trình bày lý thuyết kết hợp câu hỏi tương tác' },
  { id: 'dam_thoai', label: 'Đàm thoại / Vấn đáp', desc: 'Đặt câu hỏi khơi gợi tư duy và giải đáp thắc mắc' },
  { id: 'thao_luan_nhom', label: 'Thảo luận nhóm', desc: 'Chia nhóm xử lý chuyên đề hoặc bài tập' },
  { id: 'neu_van_de', label: 'Dạy học giải quyết vấn đề', desc: 'Đưa ra tình huống thực tế để người học tìm giải pháp' },
  { id: 'thuc_hanh', label: 'Hướng dẫn bài tập / Thực hành', desc: 'Làm mẫu thao tác và giám sát thực hành' },
  { id: 'nghien_cuu_tinh_huong', label: 'Nghiên cứu tình huống (Case study)', desc: 'Phân tích các ca điển hình trong thực tế' },
  { id: 'du_an', label: 'Dạy học theo dự án (Project-based)', desc: 'Giao bài tập lớn theo nhóm có báo cáo' },
  { id: 'tu_hoc_hd', label: 'Hướng dẫn tự học & E-learning', desc: 'Giao tài liệu, câu hỏi nghiên cứu trên hệ thống số' },
];

export const SAMPLE_PRESETS: SampleCoursePreset[] = [
  {
    id: 'tin_hoc_dai_cuong',
    name: 'Tin học đại cương (Mẫu chuẩn CNTT)',
    code: 'TIN101',
    credits: 3,
    department: 'Khoa Công nghệ thông tin',
    description: 'Học phần 3 tín chỉ (30 tiết trên lớp: 16 LT, 6 TL, 8 BT; 30 tiết tự học). Đầy đủ nội dung, CĐR và bài kiểm tra A1, A2.',
    lessons: [
      {
        id: 1,
        stt: '1',
        content: 'Bài 1: Tổng quan về máy tính và hệ điều hành',
        topics: [
          '1. Khái niệm cơ bản về thông tin và tin học',
          '2. Kiến trúc phần cứng và sơ đồ khối máy tính',
          '3. Hệ điều hành máy tính: chức năng, phân loại và cách quản lý tập tin',
          '4. Các thao tác cơ bản trên môi trường Windows / Linux'
        ],
        cdr: 'G1.1\nG1.2',
        assessment: 'A1.1 (Chuyên cần & Vấn đáp)',
        totalPeriods: 6,
        classPeriods: 4,
        theoryPeriods: 2,
        discussionPeriods: 1,
        practiceGroupPeriods: 0,
        practiceIndividualPeriods: 0,
        exercisePeriods: 1,
        guidedStudyPeriods: 0,
        selfStudyPeriods: 2,
        materials: 'Giáo trình Tin học đại cương - Chương 1; Slide bài giảng Bài 1',
        methods: ['Thuyết trình', 'Đàm thoại', 'Thực hành thao tác']
      },
      {
        id: 2,
        stt: '2',
        content: 'Bài 2: Mạng máy tính và An toàn an ninh thông tin',
        topics: [
          '1. Khái niệm mạng máy tính, phân loại LAN, WAN, Internet',
          '2. Các dịch vụ cơ bản trên Internet: WWW, E-mail, Cloud Storage',
          '3. Nguy cơ mất an toàn thông tin và các hình thức tấn công mạng',
          '4. Biện pháp phòng chống mã độc, bảo vệ mật khẩu và dữ liệu cá nhân'
        ],
        cdr: 'G1.2\nG2.1',
        assessment: 'A1.1 (Thảo luận nhóm)',
        totalPeriods: 6,
        classPeriods: 4,
        theoryPeriods: 2,
        discussionPeriods: 1,
        practiceGroupPeriods: 0,
        practiceIndividualPeriods: 0,
        exercisePeriods: 1,
        guidedStudyPeriods: 0,
        selfStudyPeriods: 2,
        materials: 'Giáo trình Tin học đại cương - Chương 2; Tài liệu tham khảo An toàn mạng',
        methods: ['Thuyết trình', 'Đàm thoại', 'Thảo luận nhóm']
      },
      {
        id: 3,
        stt: '3',
        content: 'Bài 3: Soạn thảo văn bản nâng cao với Microsoft Word',
        topics: [
          '1. Định dạng văn bản hành chính theo Nghị định 30/2020/NĐ-CP',
          '2. Quản lý Style, tạo mục lục tự động, đánh số trang và Header/Footer',
          '3. Chèn và định dạng Bảng biểu (Table), Hình ảnh, Công thức toán học',
          '4. Trộn thư (Mail Merge) và kiểm tra lỗi chính tả văn bản'
        ],
        cdr: 'G2.1\nG2.2',
        assessment: 'A1.2 (Bài tập thực hành số 1)',
        totalPeriods: 8,
        classPeriods: 4,
        theoryPeriods: 2,
        discussionPeriods: 0,
        practiceGroupPeriods: 0,
        practiceIndividualPeriods: 0,
        exercisePeriods: 2,
        guidedStudyPeriods: 0,
        selfStudyPeriods: 4,
        materials: 'Giáo trình Tin học - Chương 3; Bộ bài tập thực hành Word',
        methods: ['Thuyết trình', 'Thực hành làm mẫu', 'Hướng dẫn giải bài tập']
      },
      {
        id: 4,
        stt: '4',
        content: 'Bài 4: Xử lý dữ liệu bảng tính với Microsoft Excel',
        topics: [
          '1. Cấu trúc bảng tính, kiểu dữ liệu và địa chỉ ô (tương đối, tuyệt đối, hỗn hợp)',
          '2. Các hàm tính toán cơ bản: SUM, AVERAGE, COUNT, COUNTIF, IF lồng nhau',
          '3. Các hàm tìm kiếm và trích xuất: VLOOKUP, HLOOKUP, INDEX, MATCH',
          '4. Sắp xếp, lọc dữ liệu (Filter), tổng hợp dữ liệu Pivot Table và vẽ đồ thị'
        ],
        cdr: 'G2.2\nG3.1',
        assessment: 'A2.1 (Kiểm tra giữa kỳ - Thực hành Excel)',
        totalPeriods: 10,
        classPeriods: 6,
        theoryPeriods: 3,
        discussionPeriods: 1,
        practiceGroupPeriods: 0,
        practiceIndividualPeriods: 0,
        exercisePeriods: 2,
        guidedStudyPeriods: 0,
        selfStudyPeriods: 4,
        materials: 'Giáo trình Tin học - Chương 4; File dữ liệu thực hành Excel',
        methods: ['Thuyết trình', 'Dạy học nêu vấn đề', 'Thực hành cá nhân']
      },
      {
        id: 5,
        stt: '5',
        content: 'Bài 5: Thiết kế bài trình chiếu chuyên nghiệp với PowerPoint',
        topics: [
          '1. Nguyên tắc bố cục thiết kế slide thuyết trình hiệu quả',
          '2. Sử dụng Slide Master, phối màu chuyên nghiệp và Typography',
          '3. Hiệu ứng chuyển slide (Transitions) và hiệu ứng xuất hiện (Animations)',
          '4. Nhúng video, âm thanh và xuất bản báo cáo đa phương tiện'
        ],
        cdr: 'G3.1\nG3.2',
        assessment: 'A1.1 (Báo cáo chuyên đề slide)',
        totalPeriods: 6,
        classPeriods: 4,
        theoryPeriods: 2,
        discussionPeriods: 1,
        practiceGroupPeriods: 0,
        practiceIndividualPeriods: 0,
        exercisePeriods: 1,
        guidedStudyPeriods: 0,
        selfStudyPeriods: 2,
        materials: 'Slide bài giảng Bài 5; Bộ template PowerPoint chuẩn',
        methods: ['Thuyết trình', 'Đàm thoại', 'Thảo luận nhóm']
      },
      {
        id: 6,
        stt: '6',
        content: 'Bài 6: Thuật toán cơ bản và Nhập môn tư duy lập trình',
        topics: [
          '1. Khái niệm thuật toán và các phương pháp biểu diễn thuật toán (Sơ đồ khối)',
          '2. Ba cấu trúc điều khiển cơ bản: Tuần tự, Rẽ nhánh (if/else), Lặp (while/for)',
          '3. Thực hành thiết kế thuật toán cho các bài toán tính toán đại số',
          '4. Ôn tập, tổng kết học phần và hướng dẫn thi kết thúc môn'
        ],
        cdr: 'G1.1\nG3.2',
        assessment: 'A3.1 (Thi kết thúc học phần)',
        totalPeriods: 9,
        classPeriods: 6,
        theoryPeriods: 3,
        discussionPeriods: 1,
        practiceGroupPeriods: 0,
        practiceIndividualPeriods: 0,
        exercisePeriods: 2,
        guidedStudyPeriods: 0,
        selfStudyPeriods: 3,
        materials: 'Giáo trình Tin học - Chương 5; Ngân hàng câu hỏi ôn tập',
        methods: ['Thuyết trình', 'Đàm thoại gợi mở', 'Thực hành giải bài tập']
      }
    ]
  },
  {
    id: 'co_so_du_lieu',
    name: 'Cơ sở dữ liệu (Mẫu kỹ thuật chuyên sâu)',
    code: 'CSDL201',
    credits: 3,
    department: 'Bộ môn Hệ thống thông tin',
    description: 'Học phần 3 tín chỉ chuyên ngành: Mô hình quan hệ, Chuẩn hóa dữ liệu, Ngôn ngữ SQL, CĐR chuyên môn cao.',
    lessons: [
      {
        id: 1,
        stt: '1',
        content: 'Bài 1: Tổng quan về hệ cơ sở dữ liệu và Mô hình E-R',
        topics: [
          '1. Khái niệm CSDL, hệ quản trị CSDL (DBMS) và các mức trừu tượng dữ liệu',
          '2. Mô hình thực thể - mối kết hợp (Entity - Relationship Model)',
          '3. Thực thể, thuộc tính, mối quan hệ và các ràng buộc bản số',
          '4. Bài tập xây dựng lược đồ E-R cho bài toán quản lý thực tế'
        ],
        cdr: 'CLO1.1\nCLO1.2',
        assessment: 'A1.1 (Thảo luận & Bài tập)',
        totalPeriods: 8,
        classPeriods: 4,
        theoryPeriods: 2,
        discussionPeriods: 1,
        practiceGroupPeriods: 0,
        practiceIndividualPeriods: 0,
        exercisePeriods: 1,
        guidedStudyPeriods: 0,
        selfStudyPeriods: 4,
        materials: 'Giáo trình Cơ sở dữ liệu - Chương 1 & 2',
        methods: ['Thuyết trình', 'Đàm thoại', 'Thảo luận nhóm']
      },
      {
        id: 2,
        stt: '2',
        content: 'Bài 2: Mô hình dữ liệu quan hệ và Đại số quan hệ',
        topics: [
          '1. Định nghĩa quan hệ, bộ, thuộc tính và miền giá trị',
          '2. Các phép toán tập hợp: Hợp, Giao, Hiệu, Tích đề-các',
          '3. Các phép toán chuyên biệt: Chọn (Select), Chiếu (Project), Kết nối (Join), Chia (Divide)',
          '4. Biểu diễn câu truy vấn bằng biểu thức đại số quan hệ'
        ],
        cdr: 'CLO1.2\nCLO2.1',
        assessment: 'A1.2 (Bài tập tuần)',
        totalPeriods: 8,
        classPeriods: 4,
        theoryPeriods: 2,
        discussionPeriods: 1,
        practiceGroupPeriods: 0,
        practiceIndividualPeriods: 0,
        exercisePeriods: 1,
        guidedStudyPeriods: 0,
        selfStudyPeriods: 4,
        materials: 'Giáo trình Cơ sở dữ liệu - Chương 3',
        methods: ['Thuyết trình', 'Dạy học nêu vấn đề', 'Thực hành giải bài toán']
      },
      {
        id: 3,
        stt: '3',
        content: 'Bài 3: Ngôn ngữ định nghĩa (DDL) và thao tác dữ liệu (DML) SQL',
        topics: [
          '1. Tạo bảng (CREATE TABLE), khóa chính (PRIMARY KEY), khóa ngoại (FOREIGN KEY)',
          '2. Các lệnh cập nhật: INSERT, UPDATE, DELETE và toàn vẹn tham chiếu',
          '3. Lệnh SELECT cơ bản, mệnh đề WHERE, ORDER BY, GROUP BY, HAVING',
          '4. Truy vấn kết nối nhiều bảng (INNER JOIN, LEFT/RIGHT JOIN)'
        ],
        cdr: 'CLO2.1\nCLO2.2',
        assessment: 'A2.1 (Kiểm tra giữa kỳ trên máy tính)',
        totalPeriods: 12,
        classPeriods: 6,
        theoryPeriods: 3,
        discussionPeriods: 1,
        practiceGroupPeriods: 0,
        practiceIndividualPeriods: 0,
        exercisePeriods: 2,
        guidedStudyPeriods: 0,
        selfStudyPeriods: 6,
        materials: 'Tài liệu hướng dẫn SQL Server / MySQL; Script CSDL mẫu',
        methods: ['Thuyết trình', 'Thực hành mẫu máy chiếu', 'Bài tập phòng máy']
      },
      {
        id: 4,
        stt: '4',
        content: 'Bài 4: Phụ thuộc hàm và Chuẩn hóa cơ sở dữ liệu',
        topics: [
          '1. Khái niệm phụ thuộc hàm, bao đóng của tập thuộc tính, khóa của lược đồ',
          '2. Dạng chuẩn 1 (1NF), Dạng chuẩn 2 (2NF), Dạng chuẩn 3 (3NF) và BCNF',
          '3. Thuật toán phân rã bảo toàn thông tin và bảo toàn phụ thuộc hàm',
          '4. Thực hành chuẩn hóa lược đồ quan hệ'
        ],
        cdr: 'CLO2.2\nCLO3.1',
        assessment: 'A1.3 (Bài tập lớn nhóm)',
        totalPeriods: 10,
        classPeriods: 6,
        theoryPeriods: 3,
        discussionPeriods: 1,
        practiceGroupPeriods: 0,
        practiceIndividualPeriods: 0,
        exercisePeriods: 2,
        guidedStudyPeriods: 0,
        selfStudyPeriods: 4,
        materials: 'Giáo trình Cơ sở dữ liệu - Chương 5',
        methods: ['Thuyết trình', 'Đàm thoại gợi mở', 'Thảo luận chuyên đề']
      },
      {
        id: 5,
        stt: '5',
        content: 'Bài 5: An toàn, Phục hồi và Quản lý giao dịch trong CSDL',
        topics: [
          '1. Khái niệm giao dịch (Transaction) và tính chất ACID',
          '2. Vấn đề tranh chấp dữ liệu và các mức cô lập (Isolation levels)',
          '3. Cơ chế sao lưu (Backup) và phục hồi (Recovery) dữ liệu',
          '4. Phân quyền người dùng (GRANT, REVOKE) và an ninh CSDL'
        ],
        cdr: 'CLO3.1\nCLO3.2',
        assessment: 'A3.1 (Thi kết thúc học phần)',
        totalPeriods: 7,
        classPeriods: 4,
        theoryPeriods: 2,
        discussionPeriods: 1,
        practiceGroupPeriods: 0,
        practiceIndividualPeriods: 0,
        exercisePeriods: 1,
        guidedStudyPeriods: 0,
        selfStudyPeriods: 3,
        materials: 'Giáo trình CSDL - Chương 6; Slide ôn tập tổng hợp',
        methods: ['Thuyết trình', 'Nêu vấn đề tình huống', 'Giải đáp thắc mắc']
      }
    ]
  },
  {
    id: 'ky_nang_mem',
    name: 'Kỹ năng giao tiếp và làm việc nhóm (Mẫu KH Xã hội & Kỹ năng)',
    code: 'KNM102',
    credits: 2,
    department: 'Bộ môn Khoa học xã hội & Kỹ năng',
    description: 'Học phần 2 tín chỉ: Tập trung thảo luận nhóm, đóng vai, thuyết trình tình huống và phương pháp tương tác cao.',
    lessons: [
      {
        id: 1,
        stt: '1',
        content: 'Bài 1: Kỹ năng giao tiếp ứng xử trong môi trường học tập và công tác',
        topics: [
          '1. Khái niệm và mô hình quá trình giao tiếp',
          '2. Giao tiếp ngôn ngữ và phi ngôn ngữ (Ánh mắt, nụ cười, cử chỉ, khoảng cách)',
          '3. Rào cản trong giao tiếp và nguyên tắc vượt qua rào cản',
          '4. Nghệ thuật lắng nghe tích cực và phản hồi hiệu quả'
        ],
        cdr: 'G1.1\nG1.2',
        assessment: 'A1.1 (Đánh giá thái độ & Đóng vai)',
        totalPeriods: 6,
        classPeriods: 4,
        theoryPeriods: 1,
        discussionPeriods: 2,
        practiceGroupPeriods: 0,
        practiceIndividualPeriods: 0,
        exercisePeriods: 1,
        guidedStudyPeriods: 0,
        selfStudyPeriods: 2,
        materials: 'Giáo trình Kỹ năng giao tiếp - Bài 1; Video tình huống giao tiếp',
        methods: ['Thuyết trình gợi mở', 'Đóng vai tình huống', 'Thảo luận nhóm']
      },
      {
        id: 2,
        stt: '2',
        content: 'Bài 2: Kỹ năng thuyết trình và nói trước công chúng',
        topics: [
          '1. Các bước chuẩn bị bài thuyết trình: Xác định mục tiêu, đối tượng, thời lượng',
          '2. Kỹ thuật mở đầu ấn tượng và kết thúc đọng lại',
          '3. Kỹ năng kiểm soát giọng nói, ngôn ngữ cơ thể và khắc phục tâm lý hồi hộp',
          '4. Kỹ thuật xử lý câu hỏi khó từ khán giả'
        ],
        cdr: 'G2.1\nG2.2',
        assessment: 'A1.2 (Thực hành thuyết trình cá nhân)',
        totalPeriods: 8,
        classPeriods: 4,
        theoryPeriods: 1,
        discussionPeriods: 2,
        practiceGroupPeriods: 0,
        practiceIndividualPeriods: 0,
        exercisePeriods: 1,
        guidedStudyPeriods: 0,
        selfStudyPeriods: 4,
        materials: 'Sách Nghệ thuật nói trước công chúng; Phiếu tiêu chí đánh giá',
        methods: ['Thuyết trình', 'Thực hành nói tại lớp', 'Góp ý chéo']
      },
      {
        id: 3,
        stt: '3',
        content: 'Bài 3: Kỹ năng làm việc nhóm và Quản lý xung đột',
        topics: [
          '1. Các giai đoạn phát triển nhóm (Hình thành, Sóng gió, Chuẩn hóa, Hoạt động)',
          '2. Vai trò của các thành viên trong nhóm (Mô hình Belbin)',
          '3. Nguyên nhân gây xung đột và 5 phong cách giải quyết xung đột (Thomas-Kilmann)',
          '4. Thực hành làm việc nhóm giải quyết tình huống giả định'
        ],
        cdr: 'G2.2\nG3.1',
        assessment: 'A2.1 (Báo cáo dự án nhóm giữa kỳ)',
        totalPeriods: 8,
        classPeriods: 4,
        theoryPeriods: 1,
        discussionPeriods: 2,
        practiceGroupPeriods: 0,
        practiceIndividualPeriods: 0,
        exercisePeriods: 1,
        guidedStudyPeriods: 0,
        selfStudyPeriods: 4,
        materials: 'Tài liệu Kỹ năng làm việc nhóm; Phiếu phân công nhiệm vụ',
        methods: ['Dạy học giải quyết vấn đề', 'Thảo luận nhóm', 'Đóng vai']
      },
      {
        id: 4,
        stt: '4',
        content: 'Bài 4: Kỹ năng quản lý thời gian và giải quyết vấn đề sáng tạo',
        topics: [
          '1. Ma trận quản lý thời gian Eisenhower (Khẩn cấp vs Quan trọng)',
          '2. Phương pháp Pomodoro và lập kế hoạch công việc ngày/tuần',
          '3. Quy trình 6 bước giải quyết vấn đề hiệu quả',
          '4. Các công cụ tư duy sáng tạo: Sơ đồ tư duy (Mindmap), Brainstorming, 6 chiếc mũ tư duy'
        ],
        cdr: 'G3.1\nG3.2',
        assessment: 'A3.1 (Đánh giá hồ sơ kế hoạch cá nhân & Vấn đáp)',
        totalPeriods: 8,
        classPeriods: 4,
        theoryPeriods: 1,
        discussionPeriods: 2,
        practiceGroupPeriods: 0,
        practiceIndividualPeriods: 0,
        exercisePeriods: 1,
        guidedStudyPeriods: 0,
        selfStudyPeriods: 4,
        materials: 'Giáo trình Kỹ năng mềm; Bộ công cụ Mindmap',
        methods: ['Thuyết trình gợi mở', 'Thảo luận nhóm', 'Lập kế hoạch cá nhân']
      }
    ]
  }
];
