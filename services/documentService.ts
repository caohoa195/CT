import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  WidthType,
  TextRun,
  BorderStyle,
  VerticalAlign,
  AlignmentType,
  VerticalMergeType,
} from 'docx';
import saveAs from 'file-saver';
import { CourseLesson, CourseInfo, TemplateType, RawTableData, ColumnMapping } from '../types';
import { SAMPLE_PRESETS } from './sampleData';

// --- PARSING LOGIC & UNIVERSAL IMPORT ---

// Helper to extract lines from a cell, handling mammoth's HTML output
const getCellLines = (cell: Element | undefined): string[] => {
  if (!cell) return [];
  
  // Try to find paragraphs first
  const ps = Array.from(cell.querySelectorAll('p'));
  if (ps.length > 0) {
    return ps.map(p => p.textContent?.trim() || '').filter(s => s);
  }
  
  // Fallback: split by newlines if textContent joins them
  const clone = cell.cloneNode(true) as Element;
  const brs = clone.querySelectorAll('br');
  brs.forEach(br => br.replaceWith('\n'));
  
  return (clone.textContent?.trim() || '').split('\n').map(s => s.trim()).filter(s => s);
};

const getNum = (text: string | undefined | number) => {
  if (typeof text === 'number') return Math.round(text);
  if (!text) return 0;
  const match = text.toString().match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
};

// Normalize text for fuzzy header matching
export const normalizeHeader = (s: string): string => {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .trim();
};

// ============================================================================
// 1. AUTO-DETECT COLUMN MAPPING
// ============================================================================
export const autoDetectColumnMapping = (headers: string[]): ColumnMapping => {
  const mapping: ColumnMapping = {
    sttCol: -1,
    contentCol: -1,
    cdrCol: -1,
    totalPeriodsCol: -1,
    theoryCol: -1,
    discussionCol: -1,
    exerciseCol: -1,
    guidedStudyCol: -1,
    selfStudyCol: -1,
    assessmentCol: -1,
    materialsCol: -1,
  };

  headers.forEach((h, index) => {
    const raw = h.toLowerCase().trim();
    const norm = normalizeHeader(h);

    // STT
    if (mapping.sttCol === -1 && (norm === 'stt' || norm === 'tt' || norm === 'no' || norm.startsWith('so tt') || raw === '#')) {
      mapping.sttCol = index;
    }
    // Content / Tên bài / Nội dung
    else if (
      mapping.contentCol === -1 &&
      (norm.includes('noi dung') ||
        norm.includes('ten bai') ||
        norm.includes('ten chuong') ||
        norm.includes('chuong') ||
        norm.includes('bai hoc') ||
        norm.includes('chu de') ||
        norm === 'bai' ||
        norm === 'topic' ||
        norm === 'content')
    ) {
      mapping.contentCol = index;
    }
    // CĐR / CLO / Chuẩn đầu ra
    else if (
      mapping.cdrCol === -1 &&
      (norm.includes('cdr') || norm.includes('clo') || norm.includes('chuan dau ra') || norm.includes('plo') || norm.includes('muc tieu'))
    ) {
      mapping.cdrCol = index;
    }
    // Total periods
    else if (
      mapping.totalPeriodsCol === -1 &&
      (norm.includes('tong so tiet') ||
        norm.includes('tong tiet') ||
        norm.includes('tong so') ||
        norm === 'tong' ||
        norm === 'total' ||
        norm === 'so tiet' ||
        norm === 'thoi luong')
    ) {
      mapping.totalPeriodsCol = index;
    }
    // Theory (LT)
    else if (
      mapping.theoryCol === -1 &&
      (norm === 'lt' || norm.includes('ly thuyet') || norm === 'theory' || norm === 'tiet lt')
    ) {
      mapping.theoryCol = index;
    }
    // Discussion (TL)
    else if (
      mapping.discussionCol === -1 &&
      (norm === 'tl' || norm.includes('thao luan') || norm === 'seminar' || norm === 'discussion')
    ) {
      mapping.discussionCol = index;
    }
    // Exercise / Practice (BT / TH)
    else if (
      mapping.exerciseCol === -1 &&
      (norm === 'bt' ||
        norm.includes('bai tap') ||
        norm === 'th' ||
        norm.includes('thuc hanh') ||
        norm === 'th n' ||
        norm === 'th d' ||
        norm === 'practice' ||
        norm === 'lab')
    ) {
      mapping.exerciseCol = index;
    }
    // Guided study
    else if (
      mapping.guidedStudyCol === -1 &&
      (norm.includes('co hd') || norm.includes('hoc co hd') || norm.includes('huong dan') || norm === 'hd')
    ) {
      mapping.guidedStudyCol = index;
    }
    // Self study
    else if (
      mapping.selfStudyCol === -1 &&
      (norm.includes('tu hoc') || norm.includes('tu nghien cuu') || norm === 'thoc' || norm === 'self')
    ) {
      mapping.selfStudyCol = index;
    }
    // Assessment (KT, ĐG)
    else if (
      mapping.assessmentCol === -1 &&
      (norm.includes('danh gia') || norm.includes('kiem tra') || norm.includes('kt dg') || norm.includes('bai kt') || norm === 'kt' || norm === 'dg')
    ) {
      mapping.assessmentCol = index;
    }
    // Materials
    else if (
      mapping.materialsCol === -1 &&
      (norm.includes('hoc lieu') || norm.includes('tai lieu') || norm.includes('giao trinh') || norm.includes('materials'))
    ) {
      mapping.materialsCol = index;
    }
  });

  // Fallbacks if not detected
  if (mapping.contentCol === -1) {
    mapping.contentCol = headers.length > 1 ? 1 : 0;
  }
  if (mapping.sttCol === -1 && headers.length > 0 && mapping.contentCol !== 0) {
    mapping.sttCol = 0;
  }

  return mapping;
};

// ============================================================================
// 2. EXTRACT RAW TABLES FROM WORD (.DOCX)
// ============================================================================
export const extractRawTablesFromDocx = async (file: File): Promise<RawTableData[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  const parser = new DOMParser();
  const doc = parser.parseFromString(result.value, 'text/html');

  const tables = Array.from(doc.querySelectorAll('table'));
  if (tables.length === 0) {
    throw new Error('Không tìm thấy bất kỳ bảng dữ liệu nào trong tệp Word này.');
  }

  const rawTables: RawTableData[] = [];

  tables.forEach((table, tableIdx) => {
    const trs = Array.from(table.querySelectorAll('tr'));
    if (trs.length < 2) return;

    // Extract all rows
    const matrix: string[][] = trs.map(tr => {
      const cells = Array.from(tr.querySelectorAll('th, td'));
      return cells.map(c => {
        const lines = getCellLines(c);
        return lines.join('\n').trim();
      });
    });

    if (matrix.length < 2) return;

    // Header is row 0
    const headers = matrix[0].map((h, i) => h.trim() || `Cột ${i + 1}`);
    const rows = matrix.slice(1).filter(r => r.some(c => c && c.trim()));

    // Try finding a title before the table
    let tableName = `Bảng ${tableIdx + 1} (${rows.length} dòng)`;
    const prevElem = table.previousElementSibling;
    if (prevElem && prevElem.textContent && prevElem.textContent.trim().length < 80) {
      tableName = `${prevElem.textContent.trim()} (${rows.length} dòng)`;
    }

    rawTables.push({
      id: `docx-table-${tableIdx}`,
      name: tableName,
      headers,
      rows,
      source: 'docx',
    });
  });

  if (rawTables.length === 0) {
    throw new Error('Các bảng trong tệp Word không chứa đủ dòng dữ liệu.');
  }

  return rawTables;
};

// ============================================================================
// 3. EXTRACT RAW TABLES FROM EXCEL / CSV (.XLSX, .XLS, .CSV)
// ============================================================================
export const extractRawTablesFromExcel = async (file: File): Promise<RawTableData[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const rawTables: RawTableData[] = [];

  workbook.SheetNames.forEach((sheetName, sheetIdx) => {
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) return;

    const rawGrid = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false }) as any[][];
    if (rawGrid.length < 2) return;

    // Find first non-empty header row with at least 2 columns
    let headerRowIdx = 0;
    for (let r = 0; r < Math.min(rawGrid.length, 10); r++) {
      const row = rawGrid[r];
      if (row && row.filter(cell => cell !== undefined && cell !== null && String(cell).trim()).length >= 2) {
        headerRowIdx = r;
        break;
      }
    }

    const headerRow = rawGrid[headerRowIdx] || [];
    const maxCols = Math.max(...rawGrid.map(r => (r ? r.length : 0)));
    const headers: string[] = [];

    for (let c = 0; c < maxCols; c++) {
      const val = headerRow[c];
      headers.push(val !== undefined && val !== null ? String(val).trim() : `Cột ${c + 1}`);
    }

    const rows: string[][] = [];
    for (let r = headerRowIdx + 1; r < rawGrid.length; r++) {
      const row = rawGrid[r] || [];
      const rowArr: string[] = [];
      let hasData = false;
      for (let c = 0; c < maxCols; c++) {
        const val = row[c];
        const strVal = val !== undefined && val !== null ? String(val).trim() : '';
        if (strVal) hasData = true;
        rowArr.push(strVal);
      }
      if (hasData) {
        rows.push(rowArr);
      }
    }

    if (rows.length > 0) {
      rawTables.push({
        id: `excel-sheet-${sheetIdx}`,
        name: `Sheet: ${sheetName} (${rows.length} dòng)`,
        headers,
        rows,
        source: 'excel',
      });
    }
  });

  if (rawTables.length === 0) {
    throw new Error('Không tìm thấy dữ liệu bảng hợp lệ trong tệp Excel này.');
  }

  return rawTables;
};

// ============================================================================
// 4. PARSE PASTED TABLE (FROM EXCEL / WORD / GOOGLE SHEETS / WEB)
// ============================================================================
export const parsePastedTable = (text: string): RawTableData => {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) {
    throw new Error('Dữ liệu dán cần có ít nhất 2 dòng (dòng tiêu đề và các dòng nội dung).');
  }

  // Detect delimiter: tab (\t), pipe (|), semicolon (;), or comma (,)
  const firstLine = lines[0];
  let delimiter = '\t';
  if (firstLine.includes('\t')) {
    delimiter = '\t';
  } else if (firstLine.includes('|')) {
    delimiter = '|';
  } else if (firstLine.includes(';') && !firstLine.includes('\t')) {
    delimiter = ';';
  } else if (firstLine.includes(',') && !firstLine.includes('\t')) {
    delimiter = ',';
  }

  const parseLine = (line: string): string[] => {
    let cells: string[];
    if (delimiter === '|') {
      cells = line.split('|').map(c => c.trim()).filter((_, idx, arr) => !(idx === 0 && line.startsWith('|')) && !(idx === arr.length - 1 && line.endsWith('|')));
    } else {
      cells = line.split(delimiter).map(c => c.trim());
    }
    return cells;
  };

  const rawHeaders = parseLine(lines[0]);
  const headers = rawHeaders.map((h, i) => h || `Cột ${i + 1}`);

  const rows: string[][] = [];
  for (let i = 1; i < lines.length; i++) {
    // Skip markdown separator line like |---|---|
    if (/^[|\-:\s]+$/.test(lines[i])) continue;

    const rowCells = parseLine(lines[i]);
    // Ensure length matches headers
    while (rowCells.length < headers.length) {
      rowCells.push('');
    }
    if (rowCells.some(c => c.length > 0)) {
      rows.push(rowCells);
    }
  }

  if (rows.length === 0) {
    throw new Error('Không trích xuất được dòng dữ liệu nào sau dòng tiêu đề.');
  }

  return {
    id: `pasted-table-${Date.now()}`,
    name: `Bảng dán từ bộ nhớ tạm (${rows.length} dòng)`,
    headers,
    rows,
    source: 'paste',
  };
};

// ============================================================================
// 5. CONVERT RAW TABLE TO LESSONS USING COLUMN MAPPING
// ============================================================================
export const convertRawTableToLessons = (
  table: RawTableData,
  mapping: ColumnMapping
): CourseLesson[] => {
  const lessons: CourseLesson[] = [];
  let currentLesson: CourseLesson | null = null;

  const getCell = (row: string[], colIdx: number): string => {
    if (colIdx < 0 || colIdx >= row.length) return '';
    return (row[colIdx] || '').trim();
  };

  for (let i = 0; i < table.rows.length; i++) {
    const row = table.rows[i];
    const rawContent = getCell(row, mapping.contentCol);
    if (!rawContent) continue;

    const stt = getCell(row, mapping.sttCol);
    const contentLines = rawContent.split('\n').map(l => l.trim()).filter(Boolean);
    const firstLine = contentLines[0] || rawContent;
    const subLines = contentLines.length > 1 ? contentLines.slice(1) : [];

    const cdr = getCell(row, mapping.cdrCol);
    const assessment = getCell(row, mapping.assessmentCol);
    const materials = getCell(row, mapping.materialsCol);

    const theory = getNum(getCell(row, mapping.theoryCol));
    const discussion = getNum(getCell(row, mapping.discussionCol));
    const exercise = getNum(getCell(row, mapping.exerciseCol));
    const guidedStudy = getNum(getCell(row, mapping.guidedStudyCol));
    const selfStudy = getNum(getCell(row, mapping.selfStudyCol));

    let total = getNum(getCell(row, mapping.totalPeriodsCol));
    if (total === 0 && (theory > 0 || discussion > 0 || exercise > 0)) {
      total = theory + discussion + exercise;
    }

    // Determine if this is a NEW lesson start
    const isMainLesson =
      (/^\d+$/.test(stt) && !stt.includes('.')) ||
      firstLine.toLowerCase().startsWith('bài') ||
      firstLine.toLowerCase().startsWith('chương') ||
      firstLine.toLowerCase().startsWith('phần') ||
      (stt && !currentLesson) ||
      (total > 0 && (!currentLesson || currentLesson.content !== firstLine));

    if (isMainLesson) {
      if (currentLesson) {
        lessons.push(currentLesson);
      }

      currentLesson = {
        id: lessons.length + 1,
        stt: stt || `${lessons.length + 1}`,
        content: firstLine,
        topics: subLines,
        cdr: cdr,
        assessment: assessment,
        totalPeriods: total || 4,
        classPeriods: total || 4,
        theoryPeriods: theory,
        discussionPeriods: discussion,
        practiceGroupPeriods: 0,
        practiceIndividualPeriods: 0,
        exercisePeriods: exercise,
        guidedStudyPeriods: guidedStudy,
        selfStudyPeriods: selfStudy,
        materials: materials,
        methods: ['Thuyết trình', 'Đàm thoại', 'Thảo luận']
      };
    } else if (currentLesson) {
      // Sub-topic of current lesson
      const topicToAdd = stt && !firstLine.startsWith(stt) ? `${stt}. ${firstLine}` : firstLine;
      currentLesson.topics.push(topicToAdd, ...subLines);

      if (cdr && !currentLesson.cdr.includes(cdr)) {
        currentLesson.cdr += (currentLesson.cdr ? '\n' : '') + cdr;
      }
      if (assessment && !currentLesson.assessment.includes(assessment)) {
        currentLesson.assessment += (currentLesson.assessment ? '\n' : '') + assessment;
      }
      if (theory > 0) currentLesson.theoryPeriods += theory;
      if (discussion > 0) currentLesson.discussionPeriods += discussion;
      if (exercise > 0) currentLesson.exercisePeriods += exercise;
      if (guidedStudy > 0) currentLesson.guidedStudyPeriods += guidedStudy;
      if (selfStudy > 0) currentLesson.selfStudyPeriods += selfStudy;
      if (total > 0) currentLesson.totalPeriods += total;
    }
  }

  if (currentLesson) {
    lessons.push(currentLesson);
  }

  // Ensure default fallback topics if empty
  lessons.forEach((l) => {
    if (l.topics.length === 0) {
      l.topics = [
        '1. Nội dung lý thuyết và các khái niệm cơ bản',
        '2. Các phương pháp và quy trình thực hiện',
        '3. Hướng dẫn bài tập và vận dụng thực tế'
      ];
    }
    if (l.totalPeriods === 0) {
      l.totalPeriods = (l.theoryPeriods || 0) + (l.discussionPeriods || 0) + (l.exercisePeriods || 0) || 4;
    }
    if (l.theoryPeriods === 0 && l.discussionPeriods === 0 && l.exercisePeriods === 0) {
      l.theoryPeriods = Math.ceil(l.totalPeriods * 0.6);
      l.exercisePeriods = Math.floor(l.totalPeriods * 0.4);
    }
  });

  return lessons;
};

// ============================================================================
// 6. ENHANCED STANDARD PARSER WITH AUTO-FALLBACK
// ============================================================================
export const parseCourseStructure = async (file: File): Promise<CourseLesson[]> => {
  // First try the universal raw extraction
  const rawTables = await extractRawTablesFromDocx(file);
  if (rawTables.length === 0) {
    throw new Error('Không tìm thấy bảng trong tệp Word.');
  }

  // Pick table with "Cấu trúc học phần" or most columns/rows
  let bestTable = rawTables[0];
  for (const t of rawTables) {
    const headerStr = t.headers.join(' ').toLowerCase();
    if (headerStr.includes('cấu trúc') || headerStr.includes('tổng số tiết') || headerStr.includes('nội dung')) {
      bestTable = t;
      break;
    }
    if (t.headers.length > bestTable.headers.length) {
      bestTable = t;
    }
  }

  // Auto-detect columns
  const mapping = autoDetectColumnMapping(bestTable.headers);
  const lessons = convertRawTableToLessons(bestTable, mapping);
  return lessons;
};


// --- DOCX GENERATION STYLES & HELPERS ---

const borderStyle = {
  style: BorderStyle.SINGLE,
  size: 1,
  color: "000000",
};

const borders = {
  top: borderStyle,
  bottom: borderStyle,
  left: borderStyle,
  right: borderStyle,
  insideHorizontal: borderStyle,
  insideVertical: borderStyle,
};

const pText = (text: string, bold = false, alignment: AlignmentType = AlignmentType.LEFT, size = 24) => {
  return new Paragraph({
    alignment: alignment,
    children: [new TextRun({ text, bold, font: "Times New Roman", size })],
    spacing: { after: 50, before: 50 },
  });
};

const formatLines = (lines: string[], size = 24) => {
  return lines.map(line => {
    const isHeader = /^\d+\./.test(line);
    return pText(line, isHeader, AlignmentType.LEFT, size);
  });
};

interface ActivityBlock {
  teacher: string[];
  student: string[];
}

interface SectionData {
  title: string;
  contentParas: Paragraph[];
  blocks: ActivityBlock[];
}

const getRomanNumeral = (num: number): string => {
  const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
  return roman[num - 1] || `${num}`;
};

const formatTwoDigits = (num: number): string => {
  return num < 10 ? `0${num}` : `${num}`;
};

// Create institutional header paragraphs if CourseInfo provided
const createDocumentHeader = (title: string, courseInfo?: CourseInfo): Paragraph[] => {
  const paras: Paragraph[] = [];

  if (courseInfo) {
    paras.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        children: [
          new TextRun({ text: courseInfo.universityName.toUpperCase(), bold: true, font: "Times New Roman", size: 24 }),
        ],
        spacing: { after: 20 },
      }),
      new Paragraph({
        alignment: AlignmentType.LEFT,
        children: [
          new TextRun({ text: courseInfo.facultyName.toUpperCase(), bold: false, font: "Times New Roman", size: 22 }),
        ],
        spacing: { after: 150 },
      })
    );
  }

  paras.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: title,
          bold: true,
          font: "Times New Roman",
          size: 28,
        }),
      ],
      spacing: { before: 100, after: 100 },
    })
  );

  if (courseInfo && courseInfo.courseName) {
    paras.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: `Học phần: `, bold: true, font: "Times New Roman", size: 24 }),
          new TextRun({ text: `${courseInfo.courseName} `, bold: true, font: "Times New Roman", size: 24 }),
          new TextRun({ text: `(Mã HP: ${courseInfo.courseCode || '...'} - Số TC: ${courseInfo.credits || 3})`, font: "Times New Roman", size: 24 }),
        ],
        spacing: { after: 50 },
      })
    );

    if (courseInfo.instructorName || courseInfo.semester) {
      paras.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: `Giảng viên: ${courseInfo.instructorName || '...'} | ${courseInfo.semester} - Năm học ${courseInfo.academicYear}`, italic: true, font: "Times New Roman", size: 22 }),
          ],
          spacing: { after: 200 },
        })
      );
    }
  }

  return paras;
};

// ============================================================================
// TEMPLATE 1: MẪU CHUẨN MỤC F - ĐỀ CƯƠNG CHI TIẾT HỌC PHẦN
// ============================================================================
export const generateTeachingPlan = async (lessons: CourseLesson[], courseInfo?: CourseInfo) => {
  const tableRows: TableRow[] = [];

  lessons.forEach((lesson) => {
    const sections: SectionData[] = [];
    let sectionCounter = 1;

    // Helper: Get all topics preserving hierarchy for Theory section
    const getAllTopics = () => {
      if (lesson.topics.length === 0) return [pText("Nội dung chi tiết theo đề cương môn học")];
      return lesson.topics.map(t => pText(t));
    };

    // Helper: Get strictly numbered list (1., 2., 3.) for activities
    const getNumberedList = (sourceTopics: string[], limit?: number) => {
      let list = sourceTopics;
      if (list.length === 0) return [pText("1. Nội dung theo đề cương")];
      
      if (limit && limit > 0) {
        list = list.slice(0, limit);
      }

      return list.map((t, i) => {
        const cleanText = t.replace(/^(\d+(\.\d+)*\.?|[-+•])\s+/, '').trim();
        return pText(`${i + 1}. ${cleanText || t}`);
      });
    };

    // Methods text customized from lesson if available
    const methodsList = lesson.methods && lesson.methods.length > 0 
      ? lesson.methods.map(m => `- ${m}`).join('\n')
      : "- Thuyết trình các khái niệm cơ bản\n- Đàm thoại gợi mở\n- Nêu vấn đề thảo luận";

    // 1. THEORY (LÝ THUYẾT)
    if (lesson.theoryPeriods > 0) {
      sections.push({
        title: `${getRomanNumeral(sectionCounter++)}. LÝ THUYẾT: ${formatTwoDigits(lesson.theoryPeriods)} tiết`,
        contentParas: getAllTopics(),
        blocks: [
          {
            teacher: [
              "1. Hình thức",
              "Tổ chức dạy học lý thuyết theo đội hình cả lớp"
            ],
            student: [
              "Ghi nội dung tương ứng với hoạt động của giáo viên"
            ]
          },
          {
            teacher: [
              "2. Phương pháp",
              ...methodsList.split('\n'),
              "+ Đưa ra các câu hỏi, tình huống gợi mở",
              "+ Giải đáp câu hỏi dựa trên câu trả lời của học viên"
            ],
            student: [
              "- Lắng nghe, tích cực ghi chép",
              "- Trao đổi, trả lời câu hỏi và thảo luận cùng GV"
            ]
          },
          {
            teacher: [
              "3. Định hướng nội dung tự học",
              "- Xem lại các nội dung lý thuyết của bài học",
              "- Nghiên cứu giáo trình và chuẩn bị câu hỏi thảo luận",
              "- Giải các bài tập trong đề cương"
            ],
            student: [
              "- Sử dụng giáo trình, bài giảng điện tử, vở ghi",
              "- Làm các bài tập theo yêu cầu của GV",
              "- Tìm hiểu thêm học liệu mở"
            ]
          }
        ]
      });
    }

    // 2. DISCUSSION (THẢO LUẬN)
    if (lesson.discussionPeriods > 0) {
      sections.push({
        title: `${getRomanNumeral(sectionCounter++)}. THẢO LUẬN: ${formatTwoDigits(lesson.discussionPeriods)} tiết`,
        contentParas: [pText("Thảo luận các nội dung trọng tâm:"), ...getNumberedList(lesson.topics)],
        blocks: [
          {
            teacher: [
              "1. Hình thức",
              "Duy trì theo khối lớp, phân chia nhóm khi thực hiện các nội dung"
            ],
            student: [
              "Ghi nội dung tương ứng với hoạt động của giáo viên"
            ]
          },
          {
            teacher: [
              "2. Phương pháp",
              "- Yêu cầu HV nghiên cứu nội dung cần thảo luận, những vấn đề trọng tâm.",
              "- Định hướng thảo luận nhóm, giải quyết vấn đề.",
              "- Yêu cầu đại diện nhóm trả lời kết quả.",
              "- Nhận xét, chuẩn hóa kiến thức và kết luận nội dung."
            ],
            student: [
              "- Tiếp nhận yêu cầu của GV.",
              "- Làm việc nhóm, trao đổi, phản biện.",
              "- Đại diện trình bày kết quả thảo luận.",
              "- Ghi chép kết luận của GV."
            ]
          }
        ]
      });
    }

    // 3. EXERCISE / PRACTICE (BÀI TẬP / THỰC HÀNH)
    const exerciseHours = lesson.exercisePeriods || (lesson.practiceGroupPeriods + lesson.practiceIndividualPeriods);
    if (exerciseHours > 0) {
      sections.push({
        title: `${getRomanNumeral(sectionCounter++)}. BÀI TẬP / THỰC HÀNH: ${formatTwoDigits(exerciseHours)} tiết`,
        contentParas: [pText("Thực hành giải bài tập các nội dung:"), ...getNumberedList(lesson.topics, 4)],
        blocks: [
          {
            teacher: [
              "1. Hình thức:",
              "Cả lớp (làm bài cá nhân hoặc chia nhóm thực hành)."
            ],
            student: [
              "Theo sự điều hành của giáo viên."
            ]
          },
          {
            teacher: [
              "2. Phương pháp:",
              "- Hướng dẫn giải: Giáo viên hướng dẫn chi tiết phương pháp xác định, giải quyết bài toán.",
              "- Làm mẫu thao tác/kỹ thuật trên máy hoặc bảng.",
              "- Theo dõi HV làm bài, nhắc lại lý thuyết nếu cần thiết; Trả lời những nội dung HV thắc mắc."
            ],
            student: [
              "- Chủ động áp dụng lý thuyết để giải quyết bài tập / bài thực hành.",
              "- Đề nghị GV làm rõ những nội dung chưa hiểu.",
              "- Hoàn thiện bài nộp theo yêu cầu."
            ]
          }
        ]
      });
    }

    // 4. GUIDED STUDY (TỰ HỌC CÓ HƯỚNG DẪN)
    if (lesson.guidedStudyPeriods > 0) {
      sections.push({
        title: `${getRomanNumeral(sectionCounter++)}. TỰ HỌC CÓ HD: ${formatTwoDigits(lesson.guidedStudyPeriods)} tiết`,
        contentParas: [pText("Nội dung tự học có hướng dẫn:"), ...getNumberedList(lesson.topics, 4)],
        blocks: [
          {
            teacher: [
              "1. Hình thức",
              "Duy trì theo khối lớp, phân chia nhóm khi thực hiện các nội dung"
            ],
            student: [
              "Thực hiện theo yêu cầu của GV."
            ]
          },
          {
            teacher: [
              "2. Phương pháp",
              "- Duy trì nề nếp trong tự học.",
              "- Bồi dưỡng, giúp đỡ học viên trong thực hành giải bài tập.",
              "- Hướng dẫn khai thác tài liệu trên hệ thống LMS/Internet.",
              "- Yêu cầu GV làm rõ những nội dung chưa hiểu và giải đáp các thắc mắc."
            ],
            student: [
              "- Chấp hành nề nếp tự học.",
              "- Tự giác nghiên cứu tài liệu, làm bài tập.",
              "- Yêu cầu GV làm rõ những nội dung chưa hiểu và giải đáp các thắc mắc."
            ]
          }
        ]
      });
    }

    // 5. SELF STUDY (TỰ HỌC)
    if (lesson.selfStudyPeriods > 0) {
      sections.push({
        title: `${getRomanNumeral(sectionCounter++)}. TỰ HỌC: ${formatTwoDigits(lesson.selfStudyPeriods)} tiết`,
        contentParas: [pText("Nội dung tự học tại nhà/phòng tự học:"), ...getNumberedList(lesson.topics, 4)],
        blocks: [
          {
            teacher: [
              "1. Hình thức",
              "Tổ chức tự học theo lớp đơn hoặc lớp ghép (tự nghiên cứu)"
            ],
            student: [
              "Thực hiện theo yêu cầu của GV."
            ]
          },
          {
            teacher: [
              "2. Phương pháp",
              "- Cán bộ quản lý đơn vị kết hợp tổ học phụ triển khai nội dung tự học.",
              "- Giao nhiệm vụ tự học cụ thể, bài đọc bắt buộc.",
              "- Cán bộ phụ trách lớp duy trì tổ học phụ hoạt động, trao đổi, làm rõ hơn các nội dung."
            ],
            student: [
              "- Tự học các nội dung được lớp và tổ học phụ triển khai.",
              "- Thảo luận, ghi chép các nội dung quan trọng theo ý hiểu của bản thân.",
              "- Hoàn thành phiếu học tập cá nhân."
            ]
          }
        ]
      });
    }

    // Fallback if no specific period is defined
    if (sections.length === 0) {
      sections.push({
        title: `LÝ THUYẾT VÀ BÀI TẬP: ${formatTwoDigits(lesson.totalPeriods)} tiết`,
        contentParas: getAllTopics(),
        blocks: [
          {
            teacher: ["1. Hình thức", "Tổ chức tại lớp"],
            student: ["Ghi nội dung theo hoạt động của GV"]
          },
          {
            teacher: ["2. Phương pháp", "- Thuyết trình, đàm thoại, giải quyết vấn đề"],
            student: ["- Lắng nghe, ghi chép và làm bài tập"]
          }
        ]
      });
    }

    // Calculate total rows for this lesson to handle merging of columns 1, 3, 6
    const totalLessonRows = sections.reduce((acc, sec) => acc + Math.max(sec.blocks.length, 1), 0);
    if (totalLessonRows === 0) return;

    let lessonRowIndex = 0;

    sections.forEach((section) => {
      const sectionRowsCount = Math.max(section.blocks.length, 1);
      
      for (let i = 0; i < sectionRowsCount; i++) {
        const block = section.blocks[i] || { teacher: [], student: [] };
        
        const isFirstRowOfLesson = (lessonRowIndex === 0);
        const isFirstRowOfSection = (i === 0);
        
        const cells: TableCell[] = [];

        // Col 1: Lesson Name (Merged vertically)
        if (isFirstRowOfLesson) {
          cells.push(new TableCell({
            children: [pText(`${lesson.content}\n(${formatTwoDigits(lesson.totalPeriods)} tiết)`, true, AlignmentType.CENTER)],
            verticalMerge: VerticalMergeType.RESTART,
            verticalAlign: VerticalAlign.CENTER,
            borders: borders,
            margins: { top: 120, bottom: 120, left: 100, right: 100 },
          }));
        } else {
          cells.push(new TableCell({
            children: [],
            verticalMerge: VerticalMergeType.CONTINUE,
            borders: borders,
          }));
        }

        // Col 2: Content (Merged per section)
        if (isFirstRowOfSection) {
          const contentTitle = pText(section.title, true);
          const contentBody = section.contentParas || [];
          cells.push(new TableCell({
            children: [contentTitle, ...contentBody],
            verticalMerge: VerticalMergeType.RESTART,
            verticalAlign: VerticalAlign.TOP,
            borders: borders,
            margins: { top: 100, bottom: 100, left: 100, right: 100 },
          }));
        } else {
          cells.push(new TableCell({
            children: [],
            verticalMerge: VerticalMergeType.CONTINUE,
            borders: borders,
          }));
        }

        // Col 3: CDR (Merged vertically)
        if (isFirstRowOfLesson) {
          const cdrLines = lesson.cdr ? lesson.cdr.split('\n') : ["-"];
          cells.push(new TableCell({
            children: cdrLines.map(c => pText(c, false, AlignmentType.CENTER)),
            verticalMerge: VerticalMergeType.RESTART,
            verticalAlign: VerticalAlign.CENTER,
            borders: borders,
            margins: { top: 100, bottom: 100, left: 100, right: 100 },
          }));
        } else {
          cells.push(new TableCell({
            children: [],
            verticalMerge: VerticalMergeType.CONTINUE,
            borders: borders,
          }));
        }

        // Col 4: Teacher Activity (Single cell per block row)
        cells.push(new TableCell({
          children: formatLines(block.teacher),
          borders: borders,
          margins: { top: 100, bottom: 100, left: 100, right: 100 },
          verticalAlign: VerticalAlign.TOP,
        }));

        // Col 5: Student Activity (Single cell per block row)
        cells.push(new TableCell({
          children: formatLines(block.student),
          borders: borders,
          margins: { top: 100, bottom: 100, left: 100, right: 100 },
          verticalAlign: VerticalAlign.TOP,
        }));

        // Col 6: Assessment (Merged vertically)
        if (isFirstRowOfLesson) {
          const assLines = lesson.assessment ? lesson.assessment.split('\n') : [""];
          cells.push(new TableCell({
            children: assLines.map(c => pText(c, false, AlignmentType.CENTER)),
            verticalMerge: VerticalMergeType.RESTART,
            verticalAlign: VerticalAlign.CENTER,
            borders: borders,
            margins: { top: 100, bottom: 100, left: 100, right: 100 },
          }));
        } else {
          cells.push(new TableCell({
            children: [],
            verticalMerge: VerticalMergeType.CONTINUE,
            borders: borders,
          }));
        }

        tableRows.push(new TableRow({ children: cells }));
        lessonRowIndex++;
      }
    });
  });

  const headerParas = createDocumentHeader("F. KẾ HOẠCH VÀ PHƯƠNG PHÁP DẠY HỌC", courseInfo);

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          ...headerParas,
          new Table({
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [pText("Bài\n(số tiết)", true, AlignmentType.CENTER)], rowSpan: 2, verticalAlign: VerticalAlign.CENTER, margins: { top: 100, bottom: 100, left: 80, right: 80 } }),
                  new TableCell({ children: [pText("Nội dung", true, AlignmentType.CENTER)], rowSpan: 2, verticalAlign: VerticalAlign.CENTER, margins: { top: 100, bottom: 100, left: 80, right: 80 } }),
                  new TableCell({ children: [pText("CĐR", true, AlignmentType.CENTER)], rowSpan: 2, verticalAlign: VerticalAlign.CENTER, margins: { top: 100, bottom: 100, left: 80, right: 80 } }),
                  new TableCell({ children: [pText("Hoạt động dạy và học", true, AlignmentType.CENTER)], columnSpan: 2, verticalAlign: VerticalAlign.CENTER, margins: { top: 100, bottom: 100, left: 80, right: 80 } }),
                  new TableCell({ children: [pText("Bài\nKT, ĐG", true, AlignmentType.CENTER)], rowSpan: 2, verticalAlign: VerticalAlign.CENTER, margins: { top: 100, bottom: 100, left: 80, right: 80 } }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [pText("Giảng viên", true, AlignmentType.CENTER)], verticalAlign: VerticalAlign.CENTER, margins: { top: 100, bottom: 100, left: 80, right: 80 } }),
                  new TableCell({ children: [pText("Học viên", true, AlignmentType.CENTER)], verticalAlign: VerticalAlign.CENTER, margins: { top: 100, bottom: 100, left: 80, right: 80 } }),
                ]
              }),
              ...tableRows
            ],
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: borders,
          })
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const cleanFilename = courseInfo?.courseName 
    ? `KH_va_phuong_phap_day_hoc_${courseInfo.courseName.replace(/\s+/g, '_')}.docx`
    : `Ke_hoach_va_phuong_phap_day_hoc.docx`;
  saveAs(blob, cleanFilename);
};

// ============================================================================
// TEMPLATE 2: MẪU KẾ HOẠCH DẠY HỌC THEO TUẦN / BUỔI HỌC
// ============================================================================
export const generateWeeklyTeachingPlan = async (lessons: CourseLesson[], courseInfo?: CourseInfo) => {
  const tableRows: TableRow[] = [];

  lessons.forEach((lesson, index) => {
    const weekNum = index + 1;
    const periodsBreakdown = `LT: ${lesson.theoryPeriods || 0} | TL: ${lesson.discussionPeriods || 0} | BT/TH: ${lesson.exercisePeriods || (lesson.practiceGroupPeriods + lesson.practiceIndividualPeriods) || 0} | Tự học: ${lesson.selfStudyPeriods || 0}`;
    
    const methods = lesson.methods && lesson.methods.length > 0
      ? lesson.methods.join(', ')
      : "Thuyết trình, Đàm thoại, Thảo luận nhóm, Hướng dẫn bài tập";

    const contentParagraphs = [
      pText(lesson.content, true),
      ...lesson.topics.map(t => pText(`• ${t}`))
    ];

    const teacherActivities = [
      pText(`- Phương pháp giảng dạy: ${methods}`),
      pText(`- Thuyết trình lý thuyết trọng tâm, đặt câu hỏi gợi mở.`),
      pText(`- Tổ chức thảo luận / hướng dẫn giải bài tập theo nhóm.`),
      pText(`- Nhận xét kết quả học tập và giao nhiệm vụ tuần kế tiếp.`)
    ];

    const studentActivities = [
      pText(`- Đọc trước giáo trình, tài liệu liên quan.`),
      pText(`- Nghe giảng, tích cực tương tác và giải quyết bài tập.`),
      pText(`- Làm việc nhóm và nộp sản phẩm học tập theo quy định.`),
      pText(`- Tự học ${lesson.selfStudyPeriods || 0} tiết tại nhà.`)
    ];

    tableRows.push(
      new TableRow({
        children: [
          // Tuần / Buổi
          new TableCell({
            children: [pText(`Tuần ${weekNum}\n(Buổi ${weekNum})`, true, AlignmentType.CENTER)],
            verticalAlign: VerticalAlign.CENTER,
            borders: borders,
            margins: { top: 100, bottom: 100, left: 80, right: 80 },
          }),
          // Nội dung
          new TableCell({
            children: contentParagraphs,
            verticalAlign: VerticalAlign.TOP,
            borders: borders,
            margins: { top: 100, bottom: 100, left: 100, right: 100 },
          }),
          // Số tiết
          new TableCell({
            children: [
              pText(`${lesson.totalPeriods} tiết`, true, AlignmentType.CENTER),
              pText(periodsBreakdown, false, AlignmentType.CENTER, 20)
            ],
            verticalAlign: VerticalAlign.CENTER,
            borders: borders,
            margins: { top: 100, bottom: 100, left: 80, right: 80 },
          }),
          // CĐR bài học
          new TableCell({
            children: (lesson.cdr ? lesson.cdr.split('\n') : ["-"]).map(c => pText(c, false, AlignmentType.CENTER)),
            verticalAlign: VerticalAlign.CENTER,
            borders: borders,
            margins: { top: 100, bottom: 100, left: 80, right: 80 },
          }),
          // Hoạt động của GV & SV
          new TableCell({
            children: [
              pText("1. Hoạt động của Giảng viên:", true),
              ...teacherActivities,
              pText("2. Hoạt động của Sinh viên:", true),
              ...studentActivities,
            ],
            verticalAlign: VerticalAlign.TOP,
            borders: borders,
            margins: { top: 100, bottom: 100, left: 100, right: 100 },
          }),
          // Đánh giá & Học liệu
          new TableCell({
            children: [
              pText("Đánh giá:", true),
              pText(lesson.assessment || "A1.1 (Chuyên cần & Vấn đáp)"),
              pText("Học liệu:", true),
              pText(lesson.materials || "Giáo trình và Slide môn học", false, AlignmentType.LEFT, 20),
            ],
            verticalAlign: VerticalAlign.TOP,
            borders: borders,
            margins: { top: 100, bottom: 100, left: 80, right: 80 },
          }),
        ]
      })
    );
  });

  const headerParas = createDocumentHeader("KẾ HOẠCH GIẢNG DẠY THEO TUẦN / BUỔI HỌC", courseInfo);

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          ...headerParas,
          new Table({
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [pText("Tuần / Buổi", true, AlignmentType.CENTER)], verticalAlign: VerticalAlign.CENTER, margins: { top: 100, bottom: 100, left: 80, right: 80 } }),
                  new TableCell({ children: [pText("Tên bài & Nội dung giảng dạy chi tiết", true, AlignmentType.CENTER)], verticalAlign: VerticalAlign.CENTER, margins: { top: 100, bottom: 100, left: 80, right: 80 } }),
                  new TableCell({ children: [pText("Thời lượng\n(Số tiết)", true, AlignmentType.CENTER)], verticalAlign: VerticalAlign.CENTER, margins: { top: 100, bottom: 100, left: 80, right: 80 } }),
                  new TableCell({ children: [pText("CĐR bài học\n(CLO)", true, AlignmentType.CENTER)], verticalAlign: VerticalAlign.CENTER, margins: { top: 100, bottom: 100, left: 80, right: 80 } }),
                  new TableCell({ children: [pText("Phương pháp & Hoạt động sư phạm (GV - SV)", true, AlignmentType.CENTER)], verticalAlign: VerticalAlign.CENTER, margins: { top: 100, bottom: 100, left: 80, right: 80 } }),
                  new TableCell({ children: [pText("Đánh giá &\nHọc liệu", true, AlignmentType.CENTER)], verticalAlign: VerticalAlign.CENTER, margins: { top: 100, bottom: 100, left: 80, right: 80 } }),
                ]
              }),
              ...tableRows
            ],
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: borders,
          })
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const cleanFilename = courseInfo?.courseName 
    ? `Ke_hoach_giang_day_theo_tuan_${courseInfo.courseName.replace(/\s+/g, '_')}.docx`
    : `Ke_hoach_giang_day_theo_tuan.docx`;
  saveAs(blob, cleanFilename);
};

// ============================================================================
// TEMPLATE 3: MA TRẬN PHƯƠNG PHÁP DẠY HỌC & CĐR (CLO)
// ============================================================================
export const generateMatrixTeachingPlan = async (lessons: CourseLesson[], courseInfo?: CourseInfo) => {
  const tableRows: TableRow[] = [];

  lessons.forEach((lesson, index) => {
    const methods = lesson.methods && lesson.methods.length > 0
      ? lesson.methods.join(', ')
      : "Thuyết trình tích cực, Đàm thoại, Thảo luận nhóm, Thực hành";

    tableRows.push(
      new TableRow({
        children: [
          // STT
          new TableCell({
            children: [pText(`${index + 1}`, false, AlignmentType.CENTER)],
            verticalAlign: VerticalAlign.CENTER,
            borders: borders,
            margins: { top: 100, bottom: 100, left: 80, right: 80 },
          }),
          // Bài học
          new TableCell({
            children: [
              pText(lesson.content, true),
              pText(`Tổng số: ${lesson.totalPeriods} tiết (LT: ${lesson.theoryPeriods || 0}, TL: ${lesson.discussionPeriods || 0}, BT: ${lesson.exercisePeriods || 0})`, false, AlignmentType.LEFT, 20)
            ],
            verticalAlign: VerticalAlign.TOP,
            borders: borders,
            margins: { top: 100, bottom: 100, left: 100, right: 100 },
          }),
          // Chuẩn đầu ra CĐR
          new TableCell({
            children: (lesson.cdr ? lesson.cdr.split('\n') : ["-"]).map(c => pText(c, true, AlignmentType.CENTER)),
            verticalAlign: VerticalAlign.CENTER,
            borders: borders,
            margins: { top: 100, bottom: 100, left: 80, right: 80 },
          }),
          // Phương pháp giảng dạy
          new TableCell({
            children: [
              pText(methods, true),
              pText("- Giảng viên thuyết trình các nội dung lý thuyết trọng yếu."),
              pText("- Tổ chức thảo luận nhóm, đặt câu hỏi phản biện."),
              pText("- Hướng dẫn sinh viên tự học và thực hành trên LMS.")
            ],
            verticalAlign: VerticalAlign.TOP,
            borders: borders,
            margins: { top: 100, bottom: 100, left: 100, right: 100 },
          }),
          // Hoạt động học tập
          new TableCell({
            children: [
              pText("- Đọc trước tài liệu theo hướng dẫn."),
              pText("- Nghe giảng, ghi chép và tích cực trả lời câu hỏi."),
              pText("- Tham gia làm việc nhóm và thảo luận chuyên đề."),
              pText("- Hoàn thành bài tập và ôn tập chuẩn bị thi.")
            ],
            verticalAlign: VerticalAlign.TOP,
            borders: borders,
            margins: { top: 100, bottom: 100, left: 100, right: 100 },
          }),
          // Hình thức đánh giá
          new TableCell({
            children: [
              pText(lesson.assessment || "A1.1 (Chuyên cần / Đánh giá thường xuyên)", true),
              pText("- Tiêu chí: Mức độ tương tác, chất lượng bài tập, bài kiểm tra.")
            ],
            verticalAlign: VerticalAlign.TOP,
            borders: borders,
            margins: { top: 100, bottom: 100, left: 100, right: 100 },
          }),
        ]
      })
    );
  });

  const headerParas = createDocumentHeader("BẢNG MA TRẬN PHƯƠNG PHÁP DẠY HỌC VÀ CHUẨN ĐẦU RA (CĐR/CLO)", courseInfo);

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          ...headerParas,
          new Table({
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [pText("STT", true, AlignmentType.CENTER)], verticalAlign: VerticalAlign.CENTER, margins: { top: 100, bottom: 100, left: 80, right: 80 } }),
                  new TableCell({ children: [pText("Bài học / Nội dung giảng dạy", true, AlignmentType.CENTER)], verticalAlign: VerticalAlign.CENTER, margins: { top: 100, bottom: 100, left: 80, right: 80 } }),
                  new TableCell({ children: [pText("Chuẩn đầu ra\n(CĐR / CLO)", true, AlignmentType.CENTER)], verticalAlign: VerticalAlign.CENTER, margins: { top: 100, bottom: 100, left: 80, right: 80 } }),
                  new TableCell({ children: [pText("Phương pháp giảng dạy chủ đạo (GV)", true, AlignmentType.CENTER)], verticalAlign: VerticalAlign.CENTER, margins: { top: 100, bottom: 100, left: 80, right: 80 } }),
                  new TableCell({ children: [pText("Hoạt động học tập của Sinh viên", true, AlignmentType.CENTER)], verticalAlign: VerticalAlign.CENTER, margins: { top: 100, bottom: 100, left: 80, right: 80 } }),
                  new TableCell({ children: [pText("Hình thức & Phương pháp đánh giá", true, AlignmentType.CENTER)], verticalAlign: VerticalAlign.CENTER, margins: { top: 100, bottom: 100, left: 80, right: 80 } }),
                ]
              }),
              ...tableRows
            ],
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: borders,
          })
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const cleanFilename = courseInfo?.courseName 
    ? `Ma_tran_phuong_phap_day_hoc_${courseInfo.courseName.replace(/\s+/g, '_')}.docx`
    : `Ma_tran_phuong_phap_day_hoc.docx`;
  saveAs(blob, cleanFilename);
};

// ============================================================================
// HELPER: TẢI FILE MẪU CẤU TRÚC HỌC PHẦN (.DOCX) ĐỂ TEST / ĐIỀN DỮ LIỆU
// ============================================================================
export const downloadSampleCourseStructureDocx = async () => {
  const sample = SAMPLE_PRESETS[0]; // Tin học đại cương

  const dataRows: TableRow[] = [];

  sample.lessons.forEach((l) => {
    const contentParas = [
      pText(l.content, true),
      ...l.topics.map(t => pText(t))
    ];

    dataRows.push(
      new TableRow({
        children: [
          new TableCell({ children: [pText(l.stt, false, AlignmentType.CENTER)], verticalAlign: VerticalAlign.CENTER, borders: borders, margins: { top: 80, bottom: 80, left: 60, right: 60 } }),
          new TableCell({ children: contentParas, verticalAlign: VerticalAlign.TOP, borders: borders, margins: { top: 80, bottom: 80, left: 80, right: 80 } }),
          new TableCell({ children: l.cdr.split('\n').map(c => pText(c, false, AlignmentType.CENTER)), verticalAlign: VerticalAlign.CENTER, borders: borders, margins: { top: 80, bottom: 80, left: 60, right: 60 } }),
          new TableCell({ children: [pText(String(l.totalPeriods), false, AlignmentType.CENTER)], verticalAlign: VerticalAlign.CENTER, borders: borders, margins: { top: 80, bottom: 80, left: 60, right: 60 } }),
          new TableCell({ children: [pText(String(l.classPeriods), false, AlignmentType.CENTER)], verticalAlign: VerticalAlign.CENTER, borders: borders, margins: { top: 80, bottom: 80, left: 60, right: 60 } }),
          new TableCell({ children: [pText(String(l.theoryPeriods), false, AlignmentType.CENTER)], verticalAlign: VerticalAlign.CENTER, borders: borders, margins: { top: 80, bottom: 80, left: 60, right: 60 } }),
          new TableCell({ children: [pText(String(l.discussionPeriods), false, AlignmentType.CENTER)], verticalAlign: VerticalAlign.CENTER, borders: borders, margins: { top: 80, bottom: 80, left: 60, right: 60 } }),
          new TableCell({ children: [pText(String(l.practiceGroupPeriods), false, AlignmentType.CENTER)], verticalAlign: VerticalAlign.CENTER, borders: borders, margins: { top: 80, bottom: 80, left: 60, right: 60 } }),
          new TableCell({ children: [pText(String(l.practiceIndividualPeriods), false, AlignmentType.CENTER)], verticalAlign: VerticalAlign.CENTER, borders: borders, margins: { top: 80, bottom: 80, left: 60, right: 60 } }),
          new TableCell({ children: [pText(String(l.exercisePeriods), false, AlignmentType.CENTER)], verticalAlign: VerticalAlign.CENTER, borders: borders, margins: { top: 80, bottom: 80, left: 60, right: 60 } }),
          new TableCell({ children: [pText(String(l.guidedStudyPeriods), false, AlignmentType.CENTER)], verticalAlign: VerticalAlign.CENTER, borders: borders, margins: { top: 80, bottom: 80, left: 60, right: 60 } }),
          new TableCell({ children: l.assessment.split('\n').map(a => pText(a, false, AlignmentType.CENTER)), verticalAlign: VerticalAlign.CENTER, borders: borders, margins: { top: 80, bottom: 80, left: 60, right: 60 } }),
          new TableCell({ children: [pText(String(l.selfStudyPeriods), false, AlignmentType.CENTER)], verticalAlign: VerticalAlign.CENTER, borders: borders, margins: { top: 80, bottom: 80, left: 60, right: 60 } }),
          new TableCell({ children: [pText(l.materials || "-")], verticalAlign: VerticalAlign.TOP, borders: borders, margins: { top: 80, bottom: 80, left: 60, right: 60 } }),
        ]
      })
    );
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "BẢNG CẤU TRÚC HỌC PHẦN (MẪU CHUẨN)",
                bold: true,
                font: "Times New Roman",
                size: 28,
              }),
            ],
            spacing: { after: 200 },
          }),
          new Table({
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [pText("STT", true, AlignmentType.CENTER)], verticalAlign: VerticalAlign.CENTER }),
                  new TableCell({ children: [pText("Nội dung", true, AlignmentType.CENTER)], verticalAlign: VerticalAlign.CENTER }),
                  new TableCell({ children: [pText("CĐR", true, AlignmentType.CENTER)], verticalAlign: VerticalAlign.CENTER }),
                  new TableCell({ children: [pText("Tổng số tiết", true, AlignmentType.CENTER)], verticalAlign: VerticalAlign.CENTER }),
                  new TableCell({ children: [pText("Số tiết trên lớp", true, AlignmentType.CENTER)], verticalAlign: VerticalAlign.CENTER }),
                  new TableCell({ children: [pText("LT", true, AlignmentType.CENTER)], verticalAlign: VerticalAlign.CENTER }),
                  new TableCell({ children: [pText("TL", true, AlignmentType.CENTER)], verticalAlign: VerticalAlign.CENTER }),
                  new TableCell({ children: [pText("TH N", true, AlignmentType.CENTER)], verticalAlign: VerticalAlign.CENTER }),
                  new TableCell({ children: [pText("TH Đ", true, AlignmentType.CENTER)], verticalAlign: VerticalAlign.CENTER }),
                  new TableCell({ children: [pText("BT", true, AlignmentType.CENTER)], verticalAlign: VerticalAlign.CENTER }),
                  new TableCell({ children: [pText("Học có HD", true, AlignmentType.CENTER)], verticalAlign: VerticalAlign.CENTER }),
                  new TableCell({ children: [pText("Bài KT, ĐG", true, AlignmentType.CENTER)], verticalAlign: VerticalAlign.CENTER }),
                  new TableCell({ children: [pText("Tự học", true, AlignmentType.CENTER)], verticalAlign: VerticalAlign.CENTER }),
                  new TableCell({ children: [pText("Học liệu", true, AlignmentType.CENTER)], verticalAlign: VerticalAlign.CENTER }),
                ]
              }),
              ...dataRows
            ],
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: borders,
          })
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, "Mau_Cau_truc_hoc_phan_chuan.docx");
};

// Dispatcher to generate by template type
export const exportTeachingPlanByTemplate = async (
  template: TemplateType,
  lessons: CourseLesson[],
  courseInfo?: CourseInfo
) => {
  if (template === 'weekly') {
    await generateWeeklyTeachingPlan(lessons, courseInfo);
  } else if (template === 'matrix') {
    await generateMatrixTeachingPlan(lessons, courseInfo);
  } else {
    await generateTeachingPlan(lessons, courseInfo);
  }
};