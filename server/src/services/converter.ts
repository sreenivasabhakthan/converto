import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import { PDFDocument } from 'pdf-lib';

export type ImageFormat = 'jpeg' | 'png' | 'webp' | 'tiff';

// gif and bmp are valid *input* formats for sharp but NOT supported as output
export const IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff'];
export const IMAGE_OUTPUT_FORMATS = ['jpg', 'png', 'webp', 'tiff'];
export const DOC_FORMATS = ['pdf', 'docx', 'doc', 'txt', 'rtf', 'html'];
export const DATA_FORMATS = ['json', 'xml', 'csv', 'yaml', 'yml'];

function getFormatCategory(ext: string): 'image' | 'document' | 'data' | 'unknown' {
  const e = ext.toLowerCase().replace('.', '');
  if (IMAGE_FORMATS.includes(e)) return 'image';
  if (DOC_FORMATS.includes(e)) return 'document';
  if (DATA_FORMATS.includes(e)) return 'data';
  return 'unknown';
}

// ─── Image Conversion ─────────────────────────────────────────────────────────
async function convertImage(
  inputPath: string,
  outputPath: string,
  outputFormat: string
): Promise<void> {
  // sharp uses 'jpeg' internally, but we accept 'jpg' from the API
  const fmt = outputFormat === 'jpg' ? 'jpeg' : outputFormat;
  await sharp(inputPath)
    .toFormat(fmt as Parameters<ReturnType<typeof sharp>['toFormat']>[0])
    .toFile(outputPath);
}

// ─── DOCX → TXT / HTML ───────────────────────────────────────────────────────
async function convertDocxToText(inputPath: string, outputPath: string): Promise<void> {
  const result = await mammoth.extractRawText({ path: inputPath });
  fs.writeFileSync(outputPath, result.value, 'utf-8');
}

async function convertDocxToHtml(inputPath: string, outputPath: string): Promise<void> {
  const result = await mammoth.convertToHtml({ path: inputPath });
  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Converted Document</title>
<style>body{font-family:sans-serif;max-width:800px;margin:40px auto;line-height:1.6;}</style>
</head>
<body>${result.value}</body>
</html>`;
  fs.writeFileSync(outputPath, html, 'utf-8');
}

// ─── TXT → HTML ───────────────────────────────────────────────────────────────
async function convertTxtToHtml(inputPath: string, outputPath: string): Promise<void> {
  const text = fs.readFileSync(inputPath, 'utf-8');
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Converted Document</title>
<style>body{font-family:monospace;white-space:pre-wrap;max-width:800px;margin:40px auto;}</style>
</head>
<body>${escaped}</body>
</html>`;
  fs.writeFileSync(outputPath, html, 'utf-8');
}

// ─── PDF → TXT (using pdf-lib to read raw text streams) ──────────────────────
async function convertPdfToText(inputPath: string, outputPath: string): Promise<void> {
  const pdfBytes = fs.readFileSync(inputPath);
  // pdf-lib doesn't have a text-extraction API, so we extract readable ASCII
  // from the raw PDF byte stream — good enough for text-heavy PDFs.
  const raw = pdfBytes.toString('latin1');
  const chunks: string[] = [];
  // Match BT ... ET blocks which contain text drawing commands
  const btEtRegex = /BT([\s\S]*?)ET/g;
  let match: RegExpExecArray | null;
  while ((match = btEtRegex.exec(raw)) !== null) {
    const block = match[1];
    // Extract strings from Tj / TJ operators
    const tjRegex = /\(([^)]*)\)\s*Tj|\[((?:[^[\]]*|\[[^\]]*\])*)\]\s*TJ/g;
    let tj: RegExpExecArray | null;
    while ((tj = tjRegex.exec(block)) !== null) {
      if (tj[1] !== undefined) {
        chunks.push(tj[1]);
      } else if (tj[2] !== undefined) {
        // TJ array: extract parenthesized substrings
        const inner = tj[2].match(/\(([^)]*)\)/g);
        if (inner) chunks.push(inner.map((s) => s.slice(1, -1)).join(''));
      }
    }
    chunks.push('\n');
  }

  let text = chunks
    .join('')
    // Decode common PDF escape sequences
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\')
    // Strip non-printable characters
    .replace(/[^\x09\x0A\x0D\x20-\x7E\u00A0-\uFFFF]/g, '')
    .trim();

  if (!text) {
    text = '[This PDF does not contain extractable text. It may be a scanned image-based PDF.]';
  }

  fs.writeFileSync(outputPath, text, 'utf-8');
}

// ─── JSON ↔ CSV ↔ XML ────────────────────────────────────────────────────────
function jsonToCsv(data: unknown[]): string {
  if (!Array.isArray(data) || data.length === 0) return '';
  const headers = Object.keys(data[0] as Record<string, unknown>);
  const rows = data.map((row) =>
    headers.map((h) => JSON.stringify((row as Record<string, unknown>)[h] ?? '')).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

function csvToJson(csv: string): unknown[] {
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',').map((h) => h.replace(/^"|"$/g, '').trim());
  return lines.slice(1).map((line) => {
    const vals = line.split(',').map((v) => v.replace(/^"|"$/g, '').trim());
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => (obj[h] = vals[i] ?? ''));
    return obj;
  });
}

function jsonToXml(data: unknown, rootTag = 'root', indent = 0): string {
  const pad = '  '.repeat(indent);
  if (Array.isArray(data)) {
    return data.map((item) => `${pad}<item>\n${jsonToXml(item, 'item', indent + 1)}${pad}</item>`).join('\n');
  }
  if (typeof data === 'object' && data !== null) {
    const entries = Object.entries(data as Record<string, unknown>);
    return entries
      .map(([k, v]) => `${pad}  <${k}>${typeof v === 'object' ? `\n${jsonToXml(v, k, indent + 2)}${pad}  ` : v}</${k}>`)
      .join('\n') + '\n';
  }
  return String(data);
}

function objectToYaml(obj: unknown, indent = 0): string {
  const pad = '  '.repeat(indent);
  if (Array.isArray(obj)) {
    return obj
      .map((item) => `${pad}- ${typeof item === 'object' ? '\n' + objectToYaml(item, indent + 1) : item}`)
      .join('\n');
  }
  if (typeof obj === 'object' && obj !== null) {
    return Object.entries(obj as Record<string, unknown>)
      .map(([k, v]) => {
        if (typeof v === 'object' && v !== null) {
          return `${pad}${k}:\n${objectToYaml(v, indent + 1)}`;
        }
        return `${pad}${k}: ${v}`;
      })
      .join('\n');
  }
  return String(obj);
}

async function convertData(
  inputPath: string,
  outputPath: string,
  inputExt: string,
  outputExt: string
): Promise<void> {
  const content = fs.readFileSync(inputPath, 'utf-8');
  let output = '';

  if (inputExt === 'json' && outputExt === 'csv') {
    const data = JSON.parse(content);
    output = jsonToCsv(Array.isArray(data) ? data : [data]);
  } else if (inputExt === 'csv' && outputExt === 'json') {
    output = JSON.stringify(csvToJson(content), null, 2);
  } else if (inputExt === 'json' && outputExt === 'xml') {
    const data = JSON.parse(content);
    output = `<?xml version="1.0" encoding="UTF-8"?>\n<root>\n${jsonToXml(data)}</root>`;
  } else if (inputExt === 'xml' && outputExt === 'json') {
    output = JSON.stringify({ xml: content }, null, 2);
  } else if (inputExt === 'json' && outputExt === 'yaml') {
    const data = JSON.parse(content);
    output = objectToYaml(data);
  } else if (['yaml', 'yml'].includes(inputExt) && outputExt === 'json') {
    const lines = content.split('\n').filter((l) => l.includes(':'));
    const obj: Record<string, string> = {};
    lines.forEach((line) => {
      const [k, ...rest] = line.split(':');
      obj[k.trim()] = rest.join(':').trim();
    });
    output = JSON.stringify(obj, null, 2);
  } else {
    output = content;
  }

  fs.writeFileSync(outputPath, output, 'utf-8');
}

// ─── Images → PDF (using pdf-lib + sharp) ────────────────────────────────────
async function imageToPdf(inputPath: string, outputPath: string): Promise<void> {
  const pdfDoc = await PDFDocument.create();
  const imageBytes = fs.readFileSync(inputPath);
  const ext = path.extname(inputPath).toLowerCase();

  let pdfImage;
  if (ext === '.jpg' || ext === '.jpeg') {
    pdfImage = await pdfDoc.embedJpg(imageBytes);
  } else {
    // Convert to PNG first via sharp (handles webp, tiff, gif, bmp, etc.)
    const pngBuffer = await sharp(inputPath).png().toBuffer();
    pdfImage = await pdfDoc.embedPng(pngBuffer);
  }

  const page = pdfDoc.addPage([pdfImage.width, pdfImage.height]);
  page.drawImage(pdfImage, { x: 0, y: 0, width: pdfImage.width, height: pdfImage.height });
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);
}

// ─── Main Converter ───────────────────────────────────────────────────────────
export async function convertFile(
  inputPath: string,
  outputPath: string,
  inputExt: string,
  outputExt: string
): Promise<void> {
  const inCat = getFormatCategory(inputExt);
  const outCat = getFormatCategory(outputExt);

  // Image → Image
  if (inCat === 'image' && outCat === 'image') {
    await convertImage(inputPath, outputPath, outputExt);
    return;
  }

  // Image → PDF
  if (inCat === 'image' && outputExt === 'pdf') {
    await imageToPdf(inputPath, outputPath);
    return;
  }

  // PDF → TXT (must be before the generic TXT copy fallback)
  if (inputExt === 'pdf' && outputExt === 'txt') {
    await convertPdfToText(inputPath, outputPath);
    return;
  }

  // DOCX → TXT
  if (inputExt === 'docx' && outputExt === 'txt') {
    await convertDocxToText(inputPath, outputPath);
    return;
  }

  // DOCX → HTML
  if (inputExt === 'docx' && outputExt === 'html') {
    await convertDocxToHtml(inputPath, outputPath);
    return;
  }

  // TXT → HTML
  if (inputExt === 'txt' && outputExt === 'html') {
    await convertTxtToHtml(inputPath, outputPath);
    return;
  }

  // Data formats
  if (inCat === 'data' && outCat === 'data') {
    await convertData(inputPath, outputPath, inputExt, outputExt);
    return;
  }

  // Generic TXT / CSV copy fallback
  if ((inputExt === 'txt' || outputExt === 'txt') ||
      (inputExt === 'csv' || outputExt === 'csv')) {
    fs.copyFileSync(inputPath, outputPath);
    return;
  }

  throw new Error(
    `Conversion from .${inputExt} to .${outputExt} is not supported in this version.`
  );
}

// ─── Format Compatibility Map ─────────────────────────────────────────────────
export function getCompatibleFormats(inputExt: string): string[] {
  const e = inputExt.toLowerCase().replace('.', '');
  const cat = getFormatCategory(e);

  if (cat === 'image') {
    // Only include sharp-supported output formats; exclude same format
    return IMAGE_OUTPUT_FORMATS.concat(['pdf']).filter((f) => f !== e);
  }
  // docx only: binary .doc is not reliably supported by mammoth
  if (e === 'docx') return ['txt', 'html'];
  if (e === 'txt') return ['html'];
  if (e === 'json') return ['csv', 'xml', 'yaml'];
  if (e === 'csv') return ['json'];
  if (e === 'xml') return ['json'];
  if (e === 'yaml' || e === 'yml') return ['json'];
  if (e === 'pdf') return ['txt'];
  return [];
}
