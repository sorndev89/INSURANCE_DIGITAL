import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export type ReportFormat = 'csv' | 'xlsx' | 'pdf';

export type ReportExportMeta = {
  type: string;
  title: string;
  from: string;
  to: string;
};

type ScalarRow = { label: string; value: unknown };
type Table = { name: string; rows: Array<Record<string, unknown>> };

const LABELS: Record<string, string> = {
  id: 'ລະຫັດ',
  range: 'ໄລຍະ',
  previous: 'ໄລຍະກ່ອນ',
  from: 'ຈາກວັນທີ',
  to: 'ຮອດວັນທີ',
  kpis: 'KPI',
  revenue: 'ຍອດຂາຍ',
  revenueTrend: 'ການເຕີບໂຕຍອດຂາຍ (%)',
  collected: 'ຮັບເງິນແລ້ວ',
  outstanding: 'ໜີ້ຄ້າງ',
  activePolicies: 'ປະກັນໄພມີຜົນ',
  activePoliciesTrend: 'ການເຕີບໂຕປະກັນໄພ (%)',
  claimsRatio: 'ອັດຕາເຄມ (%)',
  pendingApprovals: 'ລໍຖ້າອະນຸມັດ',
  policyCount: 'ຈຳນວນສັນຍາ',
  claimCount: 'ຈຳນວນເຄມ',
  newCustomers: 'ລູກຄ້າໃໝ່',
  expiring30: 'ໝົດອາຍຸ 30 ວັນ',
  monthlySales: 'ຍອດຂາຍລາຍເດືອນ',
  productMix: 'ສັດສ່ວນຜະລິດຕະພັນ',
  month: 'ເດືອນ',
  label: 'ລາຍການ',
  key: 'ລະຫັດ',
  name: 'ຊື່',
  value: 'ມູນຄ່າ',
  amount: 'ຈຳນວນເງິນ',
  count: 'ຈຳນວນ',
  percentage: 'ເປີເຊັນ (%)',
  tone: 'ສີ',
  totals: 'ລວມ',
  totalPremium: 'ເບ້ຍປະກັນລວມ',
  netPremium: 'ເບ້ຍສຸດທິ',
  vatAmount: 'VAT',
  registrationFee: 'ຄ່າທະບຽນ',
  monthly: 'ລາຍເດືອນ',
  byProduct: 'ຕາມຜະລິດຕະພັນ',
  byCompany: 'ຕາມບໍລິສັດ',
  byAgent: 'ຕາມຕົວແທນ',
  byStatus: 'ຕາມສະຖານະ',
  byType: 'ຕາມປະເພດ',
  total: 'ລວມ',
  active: 'ມີຜົນ',
  expired: 'ໝົດອາຍຸ',
  cancelled: 'ຍົກເລີກ',
  pending: 'ລໍຖ້າ',
  premium: 'ເບ້ຍປະກັນ',
  issuedInPeriod: 'ອອກໃນໄລຍະ',
  portfolioByStatus: 'ສະຖານະສັນຍາ',
  expiringList: 'ປະກັນໄພໃກ້ໝົດອາຍຸ',
  activePremium: 'ເບ້ຍປະກັນທີ່ມີຜົນ',
  policyNumber: 'ເລກປະກັນໄພ',
  customerName: 'ລູກຄ້າ',
  customerPhone: 'ເບີໂທ',
  productName: 'ຜະລິດຕະພັນ',
  endDate: 'ວັນໝົດອາຍຸ',
  totalValue: 'ມູນຄ່າລວມ',
  draft: 'ຮ່າງ',
  sent: 'ສົ່ງແລ້ວ',
  accepted: 'ຍອມຮັບ',
  conversionRate: 'ອັດຕາແປງ (%)',
  pipelineValue: 'ມູນຄ່າລໍຖ້າປິດ',
  recent: 'ລ່າສຸດ',
  reference: 'ເລກອ້າງອີງ',
  validUntil: 'ໃຊ້ໄດ້ເຖິງ',
  status: 'ສະຖານະ',
  reviewing: 'ກວດສອບ',
  approved: 'ອະນຸມັດ',
  rejected: 'ປະຕິເສດ',
  approvedAmount: 'ຍອດອະນຸມັດ',
  ratio: 'ອັດຕາ (%)',
  newInPeriod: 'ໃໝ່ໃນໄລຍະ',
  withActivePolicy: 'ມີປະກັນໄພມີຜົນ',
  policiesPerCustomer: 'ປະກັນໄພ/ລູກຄ້າ',
  newByMonth: 'ລູກຄ້າໃໝ່ລາຍເດືອນ',
  topCustomers: 'ລູກຄ້າຍອດສູງ',
  sales: 'ຍອດຂາຍ',
  target: 'ເປົ້າໝາຍ',
  commission: 'ຄອມມິດຊັ່ນ',
  salesTargetAchievement: 'ບັນລຸເປົ້າໝາຍ (%)',
  ranking: 'ຈັດອັນດັບ',
  code: 'ລະຫັດ',
  teamName: 'ທີມ',
  level: 'ລະດັບ',
  policyCountPerAgent: 'ຈຳນວນສັນຍາ',
  achievement: 'ບັນລຸ (%)',
  pendingCommission: 'ຄອມມິດຊັ່ນລໍຖ້າ',
  paidCommission: 'ຄອມມິດຊັ່ນຈ່າຍແລ້ວ',
  members: 'ສະມາຊິກ',
  agentCount: 'ຈຳນວນຕົວແທນ',
  location: 'ສະຖານທີ່',
  headName: 'ຫົວໜ້າທີມ',
  pendingAmount: 'ລໍຖ້າຈ່າຍ',
  paidAmount: 'ຈ່າຍແລ້ວ',
  totalAmount: 'ລວມຄອມມິດຊັ່ນ',
  paid: 'ຈ່າຍແລ້ວ',
  invoices: 'ໃບແຈ້ງໜີ້',
  payments: 'ການຮັບເງິນ',
  collectionRate: 'ອັດຕາເກັບເງິນ (%)',
  aging: 'ອາຍຸໜີ້',
  unpaid: 'ຍັງບໍ່ຈ່າຍ',
  overdue: 'ເກີນກຳນົດ',
  unpaidAmount: 'ຍອດຍັງບໍ່ຈ່າຍ',
  overdueAmount: 'ຍອດເກີນກຳນົດ',
  today: 'ມື້ນີ້',
  byMethod: 'ຕາມຊ່ອງທາງ',
  current: 'ຍັງບໍ່ຮອດກຳນົດ',
  days1to30: '1–30 ວັນ',
  days31to60: '31–60 ວັນ',
  days61to90: '61–90 ວັນ',
  days90plus: 'ເກີນ 90 ວັນ',
  invoiced: 'ອອກໃບແຈ້ງໜີ້',
  overdueList: 'ໃບແຈ້ງໜີ້ຄ້າງ',
  invoiceNumber: 'ເລກໃບແຈ້ງໜີ້',
  dueDate: 'ກຳນົດຊຳລະ',
  amountValue: 'ມູນຄ່າ',
};

const labelOf = (key: string) => LABELS[key] || key;

const HIDDEN_COLUMNS = new Set(['id', 'key', 'tone', 'month']);

const COLUMN_PRIORITY = new Map(
  [
    'name',
    'label',
    'customerName',
    'policyNumber',
    'claimNumber',
    'reference',
    'invoiceNumber',
    'agentName',
    'teamName',
    'code',
    'sales',
    'value',
    'amount',
    'totalPremium',
    'count',
    'policyCount',
    'target',
    'achievement',
    'commission',
    'percentage',
    'status',
    'endDate',
    'dueDate',
    'validUntil',
    'incidentDate',
    'paidAt',
  ].map((key, index) => [key, index]),
);

const columnsOf = (rows: Array<Record<string, unknown>>) => {
  const columns = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row).forEach((key) => {
        if (!HIDDEN_COLUMNS.has(key)) set.add(key);
      });
      return set;
    }, new Set<string>()),
  );
  return columns.sort(
    (left, right) =>
      (COLUMN_PRIORITY.get(left) ?? Number.MAX_SAFE_INTEGER) -
      (COLUMN_PRIORITY.get(right) ?? Number.MAX_SAFE_INTEGER),
  );
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date);

const walk = (
  value: unknown,
  pathParts: string[],
  acc: { scalars: ScalarRow[]; tables: Table[] },
) => {
  if (Array.isArray(value)) {
    const rows = value
      .map((item) => (isPlainObject(item) ? item : { value: item }))
      .filter((row) => row && typeof row === 'object');
    if (rows.length) {
      acc.tables.push({
        name: pathParts.map(labelOf).join(' · ') || 'Data',
        rows: rows as Array<Record<string, unknown>>,
      });
    }
    return;
  }

  if (isPlainObject(value)) {
    Object.entries(value).forEach(([key, child]) => walk(child, [...pathParts, key], acc));
    return;
  }

  if (pathParts.length) {
    acc.scalars.push({ label: pathParts.map(labelOf).join(' · '), value });
  }
};

const collect = (data: Record<string, unknown>) => {
  const acc: { scalars: ScalarRow[]; tables: Table[] } = { scalars: [], tables: [] };
  walk(data, [], acc);
  return acc;
};

const escapeCsv = (value: unknown) => {
  if (value === null || value === undefined) return '';
  const text = typeof value === 'object' ? JSON.stringify(value) : String(value);
  return `"${text.replace(/"/g, '""')}"`;
};

const rowsToCsv = (rows: Array<Record<string, unknown>>) => {
  if (!rows.length) return '';
  const headers = columnsOf(rows);
  const lines = [headers.map((header) => escapeCsv(labelOf(header))).join(',')];
  rows.forEach((row) => {
    lines.push(headers.map((header) => escapeCsv(row[header])).join(','));
  });
  return lines.join('\n');
};

export const buildCsv = (data: unknown) => {
  if (Array.isArray(data)) return rowsToCsv(data as Array<Record<string, unknown>>);
  if (!isPlainObject(data)) return escapeCsv(data);

  const sections: string[] = [];
  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      const rows = value.filter((row) => row && typeof row === 'object') as Array<
        Record<string, unknown>
      >;
      if (!rows.length) return;
      sections.push('');
      sections.push(escapeCsv(labelOf(key)));
      sections.push(rowsToCsv(rows));
      return;
    }
    if (isPlainObject(value)) {
      Object.entries(value).forEach(([childKey, childValue]) => {
        if (Array.isArray(childValue) || isPlainObject(childValue)) return;
        sections.push([escapeCsv(labelOf(childKey)), escapeCsv(childValue)].join(','));
      });
      return;
    }
    sections.push([escapeCsv(labelOf(key)), escapeCsv(value)].join(','));
  });

  return sections.join('\n');
};

const safeSheetName = (name: string, used: Set<string>) => {
  const base =
    name
      .replace(/[\\/?*[\]:]/g, ' ')
      .trim()
      .slice(0, 31) || 'Data';
  let candidate = base;
  let index = 2;
  while (used.has(candidate.toLowerCase())) {
    const suffix = ` (${index})`;
    candidate = `${base.slice(0, 31 - suffix.length)}${suffix}`;
    index += 1;
  }
  used.add(candidate.toLowerCase());
  return candidate;
};

const cellValue = (value: unknown) => {
  if (value === null || value === undefined) return '';
  if (isPlainObject(value)) return JSON.stringify(value);
  if (Array.isArray(value)) return JSON.stringify(value);
  return value as string | number | boolean | Date;
};

const styleHeader = (sheet: ExcelJS.Worksheet) => {
  const header = sheet.getRow(1);
  header.font = { bold: true, color: { argb: 'FF111827' } };
  header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E7EB' } };
  header.alignment = { vertical: 'middle' };
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
};

const autoWidth = (sheet: ExcelJS.Worksheet) => {
  sheet.columns.forEach((column) => {
    let width = 12;
    column.eachCell?.({ includeEmpty: true }, (cell) => {
      const text = String(cell.value ?? '');
      width = Math.max(width, Math.min(42, text.length + 2));
    });
    column.width = width;
  });
};

export const buildXlsx = async (data: unknown, meta: ReportExportMeta) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Saiyfon Insurance';
  workbook.created = new Date();

  const { scalars, tables } = collect(
    isPlainObject(data) ? data : { data: Array.isArray(data) ? data : String(data) },
  );
  const summary = workbook.addWorksheet('ສະຫຼຸບ');
  summary.columns = [
    { header: 'ລາຍການ', key: 'label', width: 32 },
    { header: 'ມູນຄ່າ', key: 'value', width: 26 },
  ];
  summary.addRow({ label: 'ລາຍງານ', value: meta.title });
  summary.addRow({ label: 'ປະເພດ', value: meta.type });
  summary.addRow({ label: 'ໄລຍະ', value: `${meta.from} – ${meta.to}` });
  summary.addRow({ label: 'ສ້າງເມື່ອ', value: new Date().toISOString() });
  scalars.forEach((row) => summary.addRow({ label: row.label, value: cellValue(row.value) }));
  styleHeader(summary);
  autoWidth(summary);

  const used = new Set(['ສະຫຼຸບ']);
  tables.forEach((table) => {
    const sheet = workbook.addWorksheet(safeSheetName(table.name, used));
    const headers = columnsOf(table.rows).slice(0, 20);
    sheet.columns = headers.map((header) => ({ header: labelOf(header), key: header }));
    table.rows.slice(0, 2000).forEach((row) => {
      sheet.addRow(Object.fromEntries(headers.map((header) => [header, cellValue(row[header])])));
    });
    styleHeader(sheet);
    autoWidth(sheet);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer as ArrayBuffer);
};

const pdfFontPath = () => {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const fontDir = path.resolve(here, '../../assets/fonts');
  const font = path.join(fontDir, 'NotoSansLao-Variable.ttf');
  return { regular: font, bold: font };
};

const pdfValue = (value: unknown) => {
  if (value === null || value === undefined) return '';
  if (isPlainObject(value) || Array.isArray(value)) return JSON.stringify(value);
  return String(value);
};

export const buildPdf = (data: unknown, meta: ReportExportMeta) =>
  new Promise<Buffer>((resolve, reject) => {
    const font = pdfFontPath();
    const hasFont = existsSync(font.regular) && existsSync(font.bold);
    const doc = new PDFDocument({
      size: 'A4',
      margin: 36,
      bufferPages: true,
      info: { Title: meta.title, Author: 'Saiyfon Insurance' },
    });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    if (hasFont) {
      doc.registerFont('Lao', font.regular);
      doc.registerFont('Lao-Bold', font.bold);
    } else {
      console.warn('[report-export] Lao font not found; falling back to Helvetica');
    }
    const regular = hasFont ? 'Lao' : 'Helvetica';
    const bold = hasFont ? 'Lao-Bold' : 'Helvetica-Bold';

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = 36;
    const usable = pageWidth - margin * 2;
    let y = margin;

    const ensureSpace = (height: number) => {
      if (y + height > pageHeight - margin - 18) {
        doc.addPage();
        y = margin;
      }
    };

    const heading = (text: string, size = 12, color = '#111827') => {
      ensureSpace(size + 12);
      doc.font(bold).fontSize(size).fillColor(color).text(text, margin, y, { width: usable });
      y = doc.y + 6;
    };

    const paragraph = (text: string, size = 9, color = '#374151') => {
      ensureSpace(size + 8);
      doc.font(regular).fontSize(size).fillColor(color).text(text, margin, y, { width: usable });
      y = doc.y + 4;
    };

    const table = (rows: Array<Record<string, unknown>>) => {
      if (!rows.length) return;
      const columns = columnsOf(rows).slice(0, 9);
      if (!columns.length) return;
      const rowHeight = 16;
      const colWidth = usable / columns.length;

      const drawHeader = () => {
        ensureSpace(rowHeight);
        doc.rect(margin, y, usable, rowHeight).fill('#E5E7EB');
        doc.fillColor('#111827').font(bold).fontSize(6.5);
        columns.forEach((column, index) => {
          doc.text(labelOf(column), margin + index * colWidth + 3, y + 4, {
            width: colWidth - 6,
            height: rowHeight - 4,
            lineBreak: false,
            ellipsis: true,
          });
        });
        y += rowHeight;
      };

      drawHeader();
      rows.slice(0, 80).forEach((row) => {
        if (y + rowHeight > pageHeight - margin - 18) {
          doc.addPage();
          y = margin;
          drawHeader();
        }
        doc.fillColor('#374151').font(regular).fontSize(6.5);
        columns.forEach((column, index) => {
          doc.text(pdfValue(row[column]), margin + index * colWidth + 3, y + 4, {
            width: colWidth - 6,
            height: rowHeight - 4,
            lineBreak: false,
            ellipsis: true,
          });
        });
        y += rowHeight;
      });
      y += 8;
    };

    doc.font(bold).fontSize(18).fillColor('#047857').text(meta.title, margin, y, {
      width: usable,
    });
    y = doc.y + 4;
    paragraph(`ໄລຍະ: ${meta.from} – ${meta.to}`, 9, '#6B7280');
    paragraph(
      `ສ້າງເມື່ອ: ${new Date().toLocaleString('en-GB', { timeZone: 'Asia/Vientiane' })}`,
      8,
      '#6B7280',
    );
    y += 6;

    const { scalars, tables } = collect(
      isPlainObject(data) ? data : { data: Array.isArray(data) ? data : String(data) },
    );

    if (scalars.length) {
      heading('ສະຫຼຸບ', 12);
      scalars.forEach((row) => {
        ensureSpace(18);
        doc.font(regular).fontSize(8.5).fillColor('#374151');
        doc.text(row.label, margin, y, { width: usable * 0.55 });
        doc
          .font(bold)
          .fillColor('#111827')
          .text(pdfValue(row.value), margin + usable * 0.56, y, {
            width: usable * 0.44,
            align: 'right',
          });
        y += 15;
      });
      y += 8;
    }

    tables.forEach((tableData) => {
      heading(tableData.name, 11, '#047857');
      table(tableData.rows);
    });

    const range = doc.bufferedPageRange();
    for (let index = range.start; index < range.start + range.count; index += 1) {
      doc.switchToPage(index);
      doc.font(regular).fontSize(7).fillColor('#9CA3AF');
      doc.text(`ໜ້າ ${index - range.start + 1} / ${range.count}`, margin, pageHeight - 24, {
        width: usable,
        align: 'right',
      });
    }

    doc.end();
  });
