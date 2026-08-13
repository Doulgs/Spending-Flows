import * as XLSX from "@e965/xlsx";

export type ImportedRow = Record<string, string | number | boolean | null>;

const MAX_ROWS = 1000;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const allowedExtensions = new Set(["csv", "xls", "xlsx", "ofx"]);

function sanitizeCell(value: unknown): string | number | boolean | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (value instanceof Date) return value.toISOString();
  return String(value).slice(0, 500);
}

function parseOfx(text: string): ImportedRow[] {
  const blocks = text.match(/<STMTTRN>[\s\S]*?(?:<\/STMTTRN>|(?=<STMTTRN>|<\/BANKTRANLIST>))/gi) ?? [];
  const read = (block: string, tag: string) => block.match(new RegExp(`<${tag}>([^<\\r\\n]+)`, "i"))?.[1]?.trim() ?? null;
  return blocks.slice(0, MAX_ROWS).map((block) => ({
    type: read(block, "TRNTYPE"),
    date: read(block, "DTPOSTED"),
    amount: read(block, "TRNAMT"),
    id: read(block, "FITID"),
    name: read(block, "NAME"),
    memo: read(block, "MEMO"),
  }));
}

export async function parseFinancialFile(file: File) {
  if (file.size <= 0 || file.size > MAX_FILE_SIZE) throw new Error("O arquivo deve ter no máximo 10 MB.");
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!allowedExtensions.has(extension)) throw new Error("Formato não suportado. Use CSV, XLS, XLSX ou OFX.");
  const buffer = Buffer.from(await file.arrayBuffer());

  let rows: ImportedRow[];
  if (extension === "ofx") {
    rows = parseOfx(buffer.toString("utf8"));
  } else {
    const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true, dense: true });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) throw new Error("A planilha não possui abas legíveis.");
    const sheet = workbook.Sheets[sheetName];
    rows = (XLSX.utils.sheet_to_json(sheet, { defval: null, raw: false }) as ImportedRow[])
      .slice(0, MAX_ROWS)
      .map((row) => Object.fromEntries(Object.entries(row).slice(0, 40).map(([key, value]) => [key.slice(0, 120), sanitizeCell(value)])));
  }

  if (!rows.length) throw new Error("Nenhum lançamento foi encontrado no arquivo.");
  return { rows, extension };
}

