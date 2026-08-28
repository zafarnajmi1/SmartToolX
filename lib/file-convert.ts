import {
  PDFArray,
  PDFDocument,
  PDFRawStream,
  PDFStream,
  decodePDFRawStream,
} from "pdf-lib";
import JSZip from "jszip";

export type ConvertedFile = { blob: Blob; name: string };

type Pdfjs = {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (opts: {
    data: ArrayBuffer | Uint8Array;
    cMapUrl?: string;
    cMapPacked?: boolean;
    standardFontDataUrl?: string;
  }) => {
    promise: Promise<{
      numPages: number;
      getPage: (n: number) => Promise<{
        getViewport: (opts: { scale: number }) => { width: number; height: number };
        render: (opts: {
          canvasContext: CanvasRenderingContext2D;
          viewport: { width: number; height: number };
        }) => { promise: Promise<void> };
        getOperatorList?: () => Promise<{ fnArray: number[]; argsArray: unknown[][] }>;
        objs?: { get: (id: string, callback?: (obj: unknown) => void) => unknown };
        commonObjs?: { get: (id: string, callback?: (obj: unknown) => void) => unknown };
        getTextContent: (opts?: { normalizeWhitespace?: boolean; disableCombineTextItems?: boolean }) => Promise<{
          items: Array<{
            str?: string;
            width?: number;
            height?: number;
            transform?: number[];
            fontName?: string;
            hasEOL?: boolean;
          }>;
          styles?: Record<string, { fontFamily?: string }>;
        }>;
      }>;
    }>;
  };
};

function baseName(file: File) {
  return file.name.replace(/\.[^/.]+$/, "") || "document";
}

function pdfBlob(bytes: Uint8Array) {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return new Blob([copy], { type: "application/pdf" });
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function unescapeXml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function xmlTags(xml: string, tag: string) {
  return [...xml.matchAll(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, "g"))].map(
    (match) => unescapeXml(match[1]),
  );
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

async function loadPdfjs(): Promise<Pdfjs> {
  const w = window as unknown as { pdfjsLib?: Pdfjs };
  if (w.pdfjsLib) return w.pdfjsLib;
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load the PDF engine."));
    document.head.appendChild(script);
  });
  const pdfjs = (window as unknown as { pdfjsLib: Pdfjs }).pdfjsLib;
  pdfjs.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  return pdfjs;
}

function canvasToBytes(canvas: HTMLCanvasElement, mime: string, quality = 0.92) {
  return new Promise<Uint8Array>((resolve, reject) => {
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          reject(new Error("Could not capture the page."));
          return;
        }
        resolve(new Uint8Array(await blob.arrayBuffer()));
      },
      mime,
      quality,
    );
  });
}

function waitForImages(root: HTMLElement) {
  return Promise.all(
    [...root.querySelectorAll("img")].map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }
          img.onload = () => resolve();
          img.onerror = () => resolve();
        }),
    ),
  );
}

function cssLenToPx(value: string) {
  const n = Number.parseFloat(value);
  if (!Number.isFinite(n) || n <= 0) return 0;
  if (/pt/i.test(value)) return n * (96 / 72);
  if (/in/i.test(value)) return n * 96;
  if (/cm/i.test(value)) return n * (96 / 2.54);
  if (/mm/i.test(value)) return n * (96 / 25.4);
  return n;
}

function nextPaint() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

function isZeroCanvasPaintError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /createPattern|width or height of 0/i.test(message);
}

function ignoreUnsafePaint(el: Element) {
  if (el.tagName === "CANVAS") {
    const canvas = el as HTMLCanvasElement;
    return canvas.width < 1 || canvas.height < 1;
  }
  if (el.tagName.toLowerCase() === "svg") {
    const svg = el as SVGElement;
    const width = Number.parseFloat(svg.getAttribute("width") || "0");
    const height = Number.parseFloat(svg.getAttribute("height") || "0");
    const box = (el as HTMLElement).getBoundingClientRect?.();
    const boxW = box?.width ?? (el as HTMLElement).offsetWidth ?? 0;
    const boxH = box?.height ?? (el as HTMLElement).offsetHeight ?? 0;
    return (width < 1 && boxW < 1) || (height < 1 && boxH < 1);
  }
  return false;
}

function repairPreviewGraphics(root: HTMLElement) {
  for (const svg of [...root.querySelectorAll("svg")]) {
    const styleW = cssLenToPx(svg.style.width);
    const styleH = cssLenToPx(svg.style.height);
    const attrW = Number.parseFloat(svg.getAttribute("width") || "0") || 0;
    const attrH = Number.parseFloat(svg.getAttribute("height") || "0") || 0;
    let width = Math.max(styleW, attrW, svg.clientWidth, 0);
    let height = Math.max(styleH, attrH, svg.clientHeight, 0);
    if (width < 1 || height < 1) {
      try {
        const bb = (svg as SVGSVGElement).getBBox();
        width = Math.max(width, Math.ceil(Math.abs(bb.x) + bb.width));
        height = Math.max(height, Math.ceil(Math.abs(bb.y) + bb.height));
      } catch {
        /* getBBox throws when the svg is not rendered */
      }
    }
    if (width < 1 || height < 1) {
      svg.remove();
      continue;
    }
    const w = Math.max(1, Math.ceil(width));
    const h = Math.max(1, Math.ceil(height));
    svg.setAttribute("width", String(w));
    svg.setAttribute("height", String(h));
    if (!svg.getAttribute("viewBox")) svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.overflow = "visible";
    for (const rect of svg.querySelectorAll("rect")) {
      if (!rect.getAttribute("width")) rect.setAttribute("width", String(w));
      if (!rect.getAttribute("height")) rect.setAttribute("height", String(h));
      const fillcolor = rect.getAttribute("fillcolor");
      if (fillcolor && !rect.getAttribute("fill")) rect.setAttribute("fill", fillcolor);
    }
  }
  for (const canvas of [...root.querySelectorAll("canvas")]) {
    if (canvas.width < 1 || canvas.height < 1) canvas.remove();
  }
}

function restyleHeadingRules(root: HTMLElement) {
  const nodes = [root, ...root.querySelectorAll<HTMLElement>("*")];
  for (const el of nodes) {
    if (el.tagName.toLowerCase() === "svg" || el.tagName === "CANVAS") continue;
    const boxW = el.offsetWidth || el.getBoundingClientRect().width;
    const boxH = el.offsetHeight || el.getBoundingClientRect().height;
    if (boxW < 1 || boxH < 1) continue;
    const computed = el.ownerDocument.defaultView?.getComputedStyle(el);
    if (!computed) continue;
    if (computed.borderBottomStyle === "none" || parseFloat(computed.borderBottomWidth) < 0.4) {
      continue;
    }
    const color = computed.borderBottomColor;
    const line = Math.max(1, Math.ceil(parseFloat(computed.borderBottomWidth) || 1));
    const pad = parseFloat(computed.paddingBottom) || 0;
    el.style.borderBottom = "none";
    el.style.paddingBottom = `${Math.max(pad, 8)}px`;
    el.style.backgroundImage = `linear-gradient(${color}, ${color})`;
    el.style.backgroundRepeat = "no-repeat";
    el.style.backgroundSize = `${Math.max(1, Math.floor(boxW))}px ${line}px`;
    el.style.backgroundPosition = "0 100%";
  }
}

function restyleUnderlines(root: HTMLElement) {
  const nodes = [root, ...root.querySelectorAll<HTMLElement>("*")];
  for (const el of nodes) {
    const computed = el.ownerDocument.defaultView?.getComputedStyle(el);
    const deco = `${el.style.textDecoration} ${el.style.textDecorationLine} ${computed?.textDecorationLine ?? ""} ${computed?.textDecoration ?? ""}`.toLowerCase();
    if (!deco.includes("underline")) continue;
    el.style.setProperty("text-underline-position", "under", "important");
    el.style.setProperty("text-underline-offset", "0.22em", "important");
    el.style.setProperty("text-decoration-skip-ink", "none", "important");
  }
}

function prepareWordPrint(root: HTMLElement) {
  if (!root.querySelector("style[data-stx-underline-fix]")) {
    const style = document.createElement("style");
    style.setAttribute("data-stx-underline-fix", "1");
    style.textContent = `
      * {
        text-underline-position: under !important;
        text-underline-offset: 0.22em !important;
        text-decoration-skip-ink: none !important;
      }
      p, h1, h2, h3, h4 {
        overflow: visible !important;
      }
      table, td, th {
        vertical-align: top;
      }
    `;
    root.prepend(style);
  }
  repairPreviewGraphics(root);
  restyleHeadingRules(root);
  restyleUnderlines(root);
  repairPreviewGraphics(root);
}

async function captureElement(element: HTMLElement, extra: Record<string, unknown> = {}) {
  const html2canvas = (await import("html2canvas")).default;
  repairPreviewGraphics(element);
  await waitForImages(element);
  const options = {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: false,
    ...extra,
    ignoreElements: ignoreUnsafePaint,
    onclone(_doc: Document, clone: HTMLElement) {
      prepareWordPrint(clone ?? _doc.body);
    },
  };
  try {
    return await html2canvas(element, options);
  } catch (error) {
    if (!isZeroCanvasPaintError(error)) throw error;
    return html2canvas(element, {
      ...options,
      ignoreElements: (el: Element) =>
        ignoreUnsafePaint(el) ||
        el.tagName === "CANVAS" ||
        el.tagName.toLowerCase() === "svg",
    });
  }
}

async function embedCanvasAsPages(
  pdf: PDFDocument,
  canvas: HTMLCanvasElement,
  pageW: number,
  pageH: number,
) {
  const slicePx = Math.max(1, Math.round(canvas.width * (pageH / pageW)));
  let offset = 0;
  while (offset < canvas.height) {
    const height = Math.min(slicePx, canvas.height - offset);
    const slice = document.createElement("canvas");
    slice.width = canvas.width;
    slice.height = height;
    const ctx = slice.getContext("2d");
    if (!ctx) throw new Error("Could not build the PDF page.");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, slice.width, slice.height);
    ctx.drawImage(canvas, 0, offset, canvas.width, height, 0, 0, canvas.width, height);
    const png = await canvasToBytes(slice, "image/png");
    const image = await pdf.embedPng(png);
    const page = pdf.addPage([pageW, pageH]);
    const drawH = (height / canvas.width) * pageW;
    page.drawImage(image, { x: 0, y: pageH - drawH, width: pageW, height: drawH });
    offset += height;
  }
}

async function elementsToPdf(
  elements: HTMLElement[],
  name: string,
  fit: "page" | "a4" = "page",
): Promise<ConvertedFile> {
  const pdf = await PDFDocument.create();
  const pageW = fit === "a4" ? 595.28 : 612;
  const pageH = fit === "a4" ? 841.89 : 792;
  for (const element of elements) {
    const canvas = await captureElement(element);
    if (canvas.width < 4 || canvas.height < 4) continue;
    await embedCanvasAsPages(pdf, canvas, pageW, pageH);
  }
  if (pdf.getPageCount() === 0) throw new Error("This file looks empty.");
  return { blob: pdfBlob(await pdf.save()), name };
}

async function htmlToPdf(html: string, name: string, widthPx = 794): Promise<ConvertedFile> {
  const host = document.createElement("div");
  host.setAttribute("data-stx-print", "1");
  host.style.cssText = [
    "position:fixed",
    "left:-14000px",
    "top:0",
    `width:${widthPx}px`,
    "background:#ffffff",
    "color:#111111",
    "box-sizing:border-box",
    "padding:48px 56px",
    "font-family:Calibri,Arial,Helvetica,sans-serif",
    "font-size:14.5px",
    "line-height:1.4",
  ].join(";");
  host.innerHTML = html;
  document.body.appendChild(host);
  const canvas = await captureElement(host, { windowWidth: widthPx });
  document.body.removeChild(host);

  if (canvas.width < 8 || canvas.height < 8) {
    throw new Error("This file looks empty.");
  }

  const pdf = await PDFDocument.create();
  const pageW = 595.28;
  const pageH = 841.89;
  const sliceHeight = Math.max(1, Math.floor(canvas.width * (pageH / pageW)));
  let offset = 0;
  while (offset < canvas.height) {
    const height = Math.min(sliceHeight, canvas.height - offset);
    const slice = document.createElement("canvas");
    slice.width = canvas.width;
    slice.height = height;
    const ctx = slice.getContext("2d");
    if (!ctx) throw new Error("Could not build the PDF page.");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, slice.width, slice.height);
    ctx.drawImage(canvas, 0, offset, canvas.width, height, 0, 0, canvas.width, height);
    const png = await canvasToBytes(slice, "image/png");
    const image = await pdf.embedPng(png);
    const page = pdf.addPage([pageW, pageH]);
    const drawH = (height / canvas.width) * pageW;
    page.drawImage(image, { x: 0, y: pageH - drawH, width: pageW, height: drawH });
    offset += height;
  }

  return { blob: pdfBlob(await pdf.save()), name };
}

function magicKind(bytes: Uint8Array): "png" | "jpg" | "other" {
  if (bytes.length >= 3 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e) {
    return "png";
  }
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xd8) return "jpg";
  return "other";
}

async function fileToImageBytes(file: File) {
  const raw = new Uint8Array(await file.arrayBuffer());
  const kind = magicKind(raw);
  if (kind === "png" || kind === "jpg") return { bytes: raw, kind };
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not read this image.");
  ctx.drawImage(bitmap, 0, 0);
  const bytes = await canvasToBytes(canvas, "image/png");
  return { bytes, kind: "png" as const };
}

export async function imagesToPdf(files: File[], name: string): Promise<ConvertedFile> {
  const pdf = await PDFDocument.create();
  for (const file of files) {
    const { bytes, kind } = await fileToImageBytes(file);
    const image = kind === "png" ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
    const landscape = image.width > image.height;
    const pageW = landscape ? 841.89 : 595.28;
    const pageH = landscape ? 595.28 : 841.89;
    const scale = Math.min(pageW / image.width, pageH / image.height);
    const w = image.width * scale;
    const h = image.height * scale;
    const page = pdf.addPage([pageW, pageH]);
    page.drawImage(image, {
      x: (pageW - w) / 2,
      y: (pageH - h) / 2,
      width: w,
      height: h,
    });
  }
  return { blob: pdfBlob(await pdf.save()), name };
}

export async function mergePdfs(files: File[]): Promise<ConvertedFile> {
  if (files.length < 2) throw new Error("Upload at least two PDF files to merge.");
  const out = await PDFDocument.create();
  for (const file of files) {
    const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
    const pages = await out.copyPages(src, src.getPageIndices());
    pages.forEach((page) => out.addPage(page));
  }
  return {
    blob: pdfBlob(await out.save()),
    name: `${baseName(files[0])}-merged.pdf`,
  };
}

async function renderPdfPages(
  file: File,
  mime: "image/jpeg" | "image/png",
  options: { scale?: number; quality?: number } = {},
) {
  const pdfjs = await loadPdfjs();
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const blobs: Blob[] = [];
  const scale = options.scale ?? 2;
  const quality = options.quality ?? 0.92;
  for (let i = 1; i <= doc.numPages; i += 1) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.floor(viewport.width));
    canvas.height = Math.max(1, Math.floor(viewport.height));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not render this PDF page.");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, mime, quality),
    );
    if (!blob) throw new Error("Could not export this PDF page.");
    blobs.push(blob);
  }
  return blobs;
}

async function rasterizePdfJsPage(
  page: {
    getViewport: (opts: { scale: number }) => { width: number; height: number };
    render: (opts: {
      canvasContext: CanvasRenderingContext2D;
      viewport: { width: number; height: number };
    }) => { promise: Promise<void> };
  },
  scale = 2,
) {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(viewport.width));
  canvas.height = Math.max(1, Math.floor(viewport.height));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not render this PDF page.");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvasToBytes(canvas, "image/png");
}

export async function compressPdf(file: File): Promise<ConvertedFile> {
  const original = new Uint8Array(await file.arrayBuffer());
  const blobs = await renderPdfPages(file, "image/jpeg", { scale: 1.35, quality: 0.62 });
  const pdf = await PDFDocument.create();
  for (const blob of blobs) {
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const image = await pdf.embedJpg(bytes);
    const page = pdf.addPage([image.width, image.height]);
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
  }
  const compressed = await pdf.save({ useObjectStreams: true });
  const bytes = compressed.byteLength < original.byteLength ? compressed : original;
  return {
    blob: pdfBlob(bytes),
    name: `${baseName(file)}-compressed.pdf`,
  };
}

export async function pdfToImages(file: File, format: "jpg" | "png"): Promise<ConvertedFile> {
  const mime = format === "jpg" ? "image/jpeg" : "image/png";
  const blobs = await renderPdfPages(file, mime, { scale: 2, quality: 0.92 });
  if (blobs.length === 1) {
    return { blob: blobs[0], name: `${baseName(file)}.${format}` };
  }
  const zip = new JSZip();
  blobs.forEach((blob, index) => {
    zip.file(`${baseName(file)}-page-${index + 1}.${format}`, blob);
  });
  return {
    blob: await zip.generateAsync({ type: "blob" }),
    name: `${baseName(file)}-pages.zip`,
  };
}

type PdfRun = {
  text: string;
  x: number;
  y: number;
  w: number;
  size: number;
  bold: boolean;
  italic: boolean;
  underline?: boolean;
  font?: string;
  color?: string;
};

type PdfFill = {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
};

type PdfDraw = {
  x: number;
  y: number;
  w: number;
  h: number;
  filled: boolean;
};

type PdfLine = {
  x: number;
  y: number;
  w: number;
  h: number;
  size: number;
  runs: PdfRun[];
};

type PdfPic = {
  x: number;
  y: number;
  w: number;
  h: number;
  bytes: Uint8Array;
};

type PlacedPic = { pic: PdfPic; relId: string; docId: number };

type PdfChart = {
  x: number;
  y: number;
  w: number;
  h: number;
  horizontal: boolean;
  categories: string[];
  series: Array<{ name: string; color: string; values: number[] }>;
};

type PlacedChart = { chart: PdfChart; relId: string; docId: number };

function ptTwip(pt: number) {
  return Math.max(0, Math.round(pt * 20));
}

function ptEmu(pt: number) {
  return Math.max(0, Math.round(pt * 12700));
}

function isBoldFont(name: string) {
  return /bold|black|heavy|semibold|demi/i.test(name);
}

function isItalicFont(name: string) {
  return /italic|oblique/i.test(name);
}

function wordFontName(name: string) {
  const n = name.toLowerCase();
  if (/courier|mono|consolas/.test(n)) return "Courier New";
  if (/times|georgia|cambria|garamond|palatino/.test(n) && !/sans/.test(n)) return "Times New Roman";
  if (/comic/.test(n)) return "Comic Sans MS";
  if (/calibri/.test(n)) return "Calibri";
  return "Arial";
}

function normalizePdfGlyphs(fontName: string, text: string) {
  if (/zapf|dingbat|wingding|symbol/i.test(fontName) && text.trim().length <= 2) {
    return "•";
  }
  return text.replace(/^[\uf0b7\u00b7\u2022]/, "•");
}

function collectPdfRuns(
  items: Array<{
    str?: string;
    width?: number;
    height?: number;
    transform?: number[];
    fontName?: string;
  }>,
  pageHeight: number,
): PdfRun[] {
  const runs: PdfRun[] = [];
  for (const item of items) {
    const text = item.str ?? "";
    if (!text) continue;
    const t = item.transform ?? [1, 0, 0, 1, 0, 0];
    const size = Math.max(5, Math.hypot(t[0], t[1]) || Math.abs(t[3]) || 11);
    const fontName = item.fontName ?? "";
    runs.push({
      text: normalizePdfGlyphs(fontName, text),
      x: t[4],
      y: pageHeight - t[5] - size,
      w: item.width ?? size * text.length * 0.5,
      size,
      bold: isBoldFont(fontName),
      italic: isItalicFont(fontName) || Math.abs(t[2]) > 0.12,
      font: wordFontName(fontName),
    });
  }
  return runs;
}

function buildPdfLines(runs: PdfRun[]): PdfLine[] {
  if (!runs.length) return [];
  const sorted = [...runs].sort((a, b) => a.y - b.y || a.x - b.x);
  const buckets: PdfRun[][] = [];
  for (const run of sorted) {
    const line = buckets[buckets.length - 1];
    const tol = Math.max(2.2, run.size * 0.42);
    if (line && Math.abs(run.y - line[0].y) <= tol) line.push(run);
    else buckets.push([run]);
  }
  const toLine = (ordered: PdfRun[]): PdfLine => {
    const last = ordered[ordered.length - 1];
    const size = Math.max(...ordered.map((run) => run.size));
    return {
      x: ordered[0].x,
      y: Math.min(...ordered.map((run) => run.y)),
      w: Math.max(last.x + last.w - ordered[0].x, size * 2),
      h: size * 1.35,
      size,
      runs: ordered,
    };
  };
  const lines: PdfLine[] = [];
  for (const bucket of buckets) {
    const ordered = [...bucket].sort((a, b) => a.x - b.x);
    let group: PdfRun[] = [ordered[0]];
    for (let i = 1; i < ordered.length; i += 1) {
      const prev = ordered[i - 1];
      const run = ordered[i];
      const gap = run.x - (prev.x + prev.w);
      const splitAt = Math.max(16, Math.min(prev.size, run.size) * 1.45);
      if (gap > splitAt) {
        lines.push(toLine(group));
        group = [run];
      } else group.push(run);
    }
    lines.push(toLine(group));
  }
  return lines;
}

function waitPdfObj(store: { get: (id: string, callback?: (obj: unknown) => void) => unknown }, id: string) {
  return new Promise<unknown>((resolve) => {
    let done = false;
    const finish = (value: unknown) => {
      if (done) return;
      done = true;
      resolve(value);
    };
    const value = store.get(id, finish);
    if (value) finish(value);
    window.setTimeout(() => finish(null), 2500);
  });
}

function mulMat(a: number[], b: number[]) {
  return [
    a[0] * b[0] + a[2] * b[1],
    a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3],
    a[1] * b[2] + a[3] * b[3],
    a[0] * b[4] + a[2] * b[5] + a[4],
    a[1] * b[4] + a[3] * b[5] + a[5],
  ];
}

async function pdfImageToPng(raw: unknown) {
  if (!raw || typeof raw !== "object") return null;
  const img = raw as {
    width?: number;
    height?: number;
    kind?: number;
    data?: Uint8ClampedArray | Uint8Array;
    bitmap?: ImageBitmap;
  };
  if (img.bitmap) {
    const canvas = document.createElement("canvas");
    canvas.width = img.bitmap.width;
    canvas.height = img.bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img.bitmap, 0, 0);
    return canvasToBytes(canvas, "image/png");
  }
  const data = img.data;
  if (data && data.length >= 2 && data[0] === 0xff && data[1] === 0xd8) {
    try {
      const blob = new Blob([new Uint8Array(data)], { type: "image/jpeg" });
      const bitmap = await createImageBitmap(blob);
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.drawImage(bitmap, 0, 0);
      return canvasToBytes(canvas, "image/png");
    } catch {
      return null;
    }
  }
  const width = img.width ?? 0;
  const height = img.height ?? 0;
  if (!width || !height || !data) return null;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const out = ctx.createImageData(width, height);
  const kind = img.kind ?? (data.length >= width * height * 4 ? 3 : 2);
  if (kind === 3) {
    out.data.set(data.length === out.data.length ? data : data.subarray(0, out.data.length));
  } else if (kind === 2) {
    for (let i = 0, j = 0; i < out.data.length && j + 2 < data.length; i += 4, j += 3) {
      out.data[i] = data[j];
      out.data[i + 1] = data[j + 1];
      out.data[i + 2] = data[j + 2];
      out.data[i + 3] = 255;
    }
  } else {
    for (let i = 0, j = 0; i < out.data.length && j < data.length; i += 4, j += 1) {
      out.data[i] = out.data[i + 1] = out.data[i + 2] = data[j];
      out.data[i + 3] = 255;
    }
  }
  ctx.putImageData(out, 0, 0);
  return canvasToBytes(canvas, "image/png");
}

function imageRef(arg: unknown) {
  if (typeof arg === "string" && arg) return arg;
  if (arg && typeof arg === "object" && "name" in arg) {
    const name = (arg as { name?: unknown }).name;
    if (typeof name === "string" && name) return name;
  }
  return null;
}

function ctmImageBox(ctm: number[], pageHeight: number) {
  const pts = [applyCtm(0, 0, ctm), applyCtm(1, 0, ctm), applyCtm(0, 1, ctm), applyCtm(1, 1, ctm)];
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return {
    x: minX,
    y: pageHeight - maxY,
    w: Math.max(1, maxX - minX),
    h: Math.max(1, maxY - minY),
  };
}

async function cropCanvasToPng(
  canvas: HTMLCanvasElement,
  x: number,
  y: number,
  w: number,
  h: number,
  scale: number,
) {
  const sx = Math.max(0, Math.floor(x * scale));
  const sy = Math.max(0, Math.floor(y * scale));
  const sw = Math.max(1, Math.min(canvas.width - sx, Math.ceil(w * scale)));
  const sh = Math.max(1, Math.min(canvas.height - sy, Math.ceil(h * scale)));
  if (sw < 4 || sh < 4) return null;
  const slice = document.createElement("canvas");
  slice.width = sw;
  slice.height = sh;
  const ctx = slice.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);
  return canvasToBytes(slice, "image/png");
}

async function extractPdfPictures(
  page: {
    getViewport: (opts: { scale: number }) => { width: number; height: number };
    render: (opts: {
      canvasContext: CanvasRenderingContext2D;
      viewport: { width: number; height: number };
    }) => { promise: Promise<void> };
    getOperatorList?: () => Promise<{ fnArray: number[]; argsArray: unknown[][] }>;
    objs?: { get: (id: string, callback?: (obj: unknown) => void) => unknown };
    commonObjs?: { get: (id: string, callback?: (obj: unknown) => void) => unknown };
  },
  pageWidth: number,
  pageHeight: number,
  contentText = "",
) {
  const pictures: PdfPic[] = [];
  const seen = new Set<string>();
  const addPic = async (box: { x: number; y: number; w: number; h: number }, bytes: Uint8Array | null) => {
    if (!bytes) return;
    if (box.w < 8 || box.h < 8) return;
    if (isFullPageArt(box, pageWidth, pageHeight)) return;
    const key = `${Math.round(box.x)}:${Math.round(box.y)}:${Math.round(box.w)}:${Math.round(box.h)}`;
    if (seen.has(key)) return;
    seen.add(key);
    pictures.push({ ...box, bytes });
  };

  const canvas = await renderPdfPageCanvas(page, 2);
  const boxes = imageBoxesFromContent(contentText, pageHeight);
  if (canvas) {
    for (const box of boxes) {
      await addPic(box, await cropCanvasToPng(canvas, box.x, box.y, box.w, box.h, 2));
    }
  }

  const opsApi = (window as unknown as { pdfjsLib?: { OPS?: Record<string, number> } }).pdfjsLib?.OPS;
  if (page.getOperatorList && opsApi) {
    try {
      const ops = await page.getOperatorList();
      const stack: number[][] = [];
      let ctm = [1, 0, 0, 1, 0, 0];
      const stores = [page.objs, page.commonObjs].filter(Boolean) as Array<{
        get: (id: string, callback?: (obj: unknown) => void) => unknown;
      }>;
      for (let i = 0; i < ops.fnArray.length; i += 1) {
        const fn = ops.fnArray[i];
        const args = ops.argsArray[i] ?? [];
        if (fn === opsApi.save) stack.push(ctm);
        else if (fn === opsApi.restore) ctm = stack.pop() ?? [1, 0, 0, 1, 0, 0];
        else if (fn === opsApi.transform && args.length >= 6) {
          ctm = mulMat(ctm, args.map(Number));
        } else if (
          fn === opsApi.paintImageXObject ||
          fn === opsApi.paintJpegXObject ||
          fn === opsApi.paintInlineImageXObject
        ) {
          const box = ctmImageBox(ctm, pageHeight);
          let bytes: Uint8Array | null = null;
          const ref = imageRef(args[0]);
          if (ref) {
            for (const store of stores) {
              const obj = await waitPdfObj(store, ref);
              bytes = await pdfImageToPng(obj);
              if (bytes) break;
            }
          }
          if (!bytes && canvas) {
            bytes = await cropCanvasToPng(canvas, box.x, box.y, box.w, box.h, 2);
          }
          await addPic(box, bytes);
        }
      }
    } catch {
      /* content-stream crops above still apply */
    }
  }
  return pictures;
}

function rgbToHex(r: number, g: number, b: number) {
  const byte = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n * 255)))
      .toString(16)
      .padStart(2, "0");
  return `${byte(r)}${byte(g)}${byte(b)}`.toUpperCase();
}

function applyCtm(x: number, y: number, ctm: number[]) {
  return [ctm[0] * x + ctm[2] * y + ctm[4], ctm[1] * x + ctm[3] * y + ctm[5]] as [number, number];
}

function decodePdfStream(stream: PDFStream) {
  try {
    if (stream instanceof PDFRawStream) {
      return decodePDFRawStream(stream).decode();
    }
  } catch {
    /* fall through */
  }
  return stream.getContents();
}

function pdfPageContent(libPage: {
  node: { normalize: () => void; normalizedEntries: () => { Contents?: PDFArray } };
}) {
  libPage.node.normalize();
  const contents = libPage.node.normalizedEntries().Contents;
  if (!contents) return "";
  const parts: string[] = [];
  for (let i = 0; i < contents.size(); i += 1) {
    try {
      const stream = contents.lookup(i, PDFStream);
      if (stream) parts.push(new TextDecoder("latin1").decode(decodePdfStream(stream)));
    } catch {
      continue;
    }
  }
  return parts.join("\n");
}

function imageBoxesFromContent(content: string, pageHeight: number) {
  const boxes: Array<{ x: number; y: number; w: number; h: number }> = [];
  const re =
    /([+-]?\d*\.?\d+)\s+([+-]?\d*\.?\d+)\s+([+-]?\d*\.?\d+)\s+([+-]?\d*\.?\d+)\s+([+-]?\d*\.?\d+)\s+([+-]?\d*\.?\d+)\s+cm\s*\/[A-Za-z0-9._-]+\s+Do/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(content))) {
    boxes.push(
      ctmImageBox(
        [
          Number(match[1]),
          Number(match[2]),
          Number(match[3]),
          Number(match[4]),
          Number(match[5]),
          Number(match[6]),
        ],
        pageHeight,
      ),
    );
  }
  return boxes;
}

function parsePdfGraphics(content: string, pageWidth: number, pageHeight: number) {
  const fills: PdfFill[] = [];
  const draws: PdfDraw[] = [];
  const stripped = content
    .replace(/BT[\s\S]*?ET/g, " ")
    .replace(/\((?:\\.|[^\\)])*\)/g, " ")
    .replace(/<[^>]*>/g, " ");
  const nums: number[] = [];
  let fillColor = "000000";
  let path: Array<[number, number]> = [];
  const tokenRe = /([+-]?(?:\d+\.?\d*|\.\d+))|([A-Za-z*]+)/g;
  const last = (n: number) => nums.slice(Math.max(0, nums.length - n));
  const commit = (filled: boolean) => {
    const draw = pathToDraw(path, pageWidth, pageHeight);
    if (draw) draws.push({ ...draw, filled });
    if (filled) {
      const fill = pathToFill(path, pageWidth, pageHeight, fillColor);
      if (fill) fills.push(fill);
    }
    path = [];
  };
  let match: RegExpExecArray | null;
  while ((match = tokenRe.exec(stripped))) {
    if (match[1] != null) {
      nums.push(Number(match[1]));
      continue;
    }
    const op = match[2];
    if ((op === "rg" || op === "sc") && nums.length >= 3) {
      const [r, g, b] = last(3);
      fillColor = rgbToHex(r, g, b);
    } else if ((op === "g" || op === "G") && nums.length >= 1) {
      const gray = last(1)[0];
      fillColor = rgbToHex(gray, gray, gray);
    } else if (op === "re" && nums.length >= 4) {
      const [x, y, w, h] = last(4);
      path = [
        [x, y],
        [x + w, y],
        [x + w, y + h],
        [x, y + h],
      ];
    } else if (op === "m" && nums.length >= 2) {
      const [x, y] = last(2);
      path = [[x, y]];
    } else if (op === "l" && nums.length >= 2) {
      const [x, y] = last(2);
      path.push([x, y]);
    } else if (op === "c" && nums.length >= 6) {
      const pts = last(6);
      path.push([pts[0], pts[1]], [pts[2], pts[3]], [pts[4], pts[5]]);
    } else if (op === "h" && path.length) {
      path.push(path[0]);
    } else if (op === "f" || op === "f*" || op === "B" || op === "B*" || op === "b" || op === "b*") {
      commit(true);
    } else if (op === "S" || op === "s") {
      commit(false);
    } else if (op === "n") {
      path = [];
    }
    nums.length = 0;
  }
  return { fills, draws };
}

function pathToFill(points: Array<[number, number]>, pageWidth: number, pageHeight: number, color: string) {
  if (points.length < 3) return null;
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const w = maxX - minX;
  const h = maxY - minY;
  if (w < 8 || h < 8) return null;
  const cover = (w * h) / Math.max(1, pageWidth * pageHeight);
  if (cover > 0.96 && !isDarkHex(color)) return null;
  return { x: minX, y: pageHeight - maxY, w, h, color };
}

function pathToDraw(points: Array<[number, number]>, pageWidth: number, pageHeight: number) {
  if (points.length < 2) return null;
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const w = Math.max(0.5, maxX - minX);
  const h = Math.max(0.5, maxY - minY);
  if (Math.max(w, h) < 8) return null;
  const cover = (w * h) / Math.max(1, pageWidth * pageHeight);
  if (cover > 0.5) return null;
  return { x: minX, y: pageHeight - maxY, w, h };
}

function readFillColor(args: unknown[]) {
  const nums = args.map(Number).filter((n) => Number.isFinite(n));
  if (nums.length >= 3) return rgbToHex(nums[0], nums[1], nums[2]);
  if (nums.length === 1) return rgbToHex(nums[0], nums[0], nums[0]);
  return null;
}

function walkConstructPath(
  opsApi: Record<string, number>,
  args: unknown[],
  addPathOp: (fn: number, piece: unknown[]) => void,
) {
  const innerFns = args[0] as ArrayLike<number> | undefined;
  const coords = args[1];
  if (!innerFns || innerFns.length == null) return;
  const nested = Array.isArray(coords) && coords.length > 0 && Array.isArray((coords as unknown[])[0]);
  let j = 0;
  const take = (n: number) => {
    const piece: number[] = [];
    const arr = coords as ArrayLike<number> | undefined;
    for (let k = 0; k < n; k += 1) {
      piece.push(Number(arr?.[j] ?? 0));
      j += 1;
    }
    return piece;
  };
  for (let k = 0; k < innerFns.length; k += 1) {
    const op = Number(innerFns[k]);
    if (nested) {
      addPathOp(op, ((coords as unknown[][])[k] ?? []) as unknown[]);
      continue;
    }
    if (op === opsApi.moveTo || op === opsApi.lineTo) addPathOp(op, take(2));
    else if (op === opsApi.curveTo) addPathOp(op, take(6));
    else if (op === opsApi.curveTo2 || op === opsApi.curveTo3) addPathOp(op, take(4));
    else if (op === opsApi.rectangle) addPathOp(op, take(4));
    else if (op === opsApi.closePath) addPathOp(op, []);
  }
}

async function extractPdfFills(
  page: {
    getOperatorList?: () => Promise<{ fnArray: number[]; argsArray: unknown[][] }>;
  },
  pageWidth: number,
  pageHeight: number,
) {
  const fills: PdfFill[] = [];
  const draws: PdfDraw[] = [];
  const opsApi = (window as unknown as { pdfjsLib?: { OPS?: Record<string, number> } }).pdfjsLib?.OPS;
  if (!page.getOperatorList || !opsApi) return { fills, draws };
  try {
    const ops = await page.getOperatorList();
    const stack: number[][] = [];
    let ctm = [1, 0, 0, 1, 0, 0];
    let fillColor = "000000";
    let path: Array<[number, number]> = [];

    const addPathOp = (fn: number, args: unknown[]) => {
      if (fn === opsApi.constructPath) {
        walkConstructPath(opsApi, args, addPathOp);
        return;
      }
      if (fn === opsApi.moveTo && args.length >= 2) {
        path = [applyCtm(Number(args[0]), Number(args[1]), ctm)];
      } else if (fn === opsApi.lineTo && args.length >= 2) {
        path.push(applyCtm(Number(args[0]), Number(args[1]), ctm));
      } else if (fn === opsApi.curveTo && args.length >= 6) {
        path.push(
          applyCtm(Number(args[0]), Number(args[1]), ctm),
          applyCtm(Number(args[2]), Number(args[3]), ctm),
          applyCtm(Number(args[4]), Number(args[5]), ctm),
        );
      } else if ((fn === opsApi.curveTo2 || fn === opsApi.curveTo3) && args.length >= 4) {
        path.push(
          applyCtm(Number(args[0]), Number(args[1]), ctm),
          applyCtm(Number(args[2]), Number(args[3]), ctm),
        );
      } else if (fn === opsApi.rectangle && args.length >= 4) {
        const x = Number(args[0]);
        const y = Number(args[1]);
        const w = Number(args[2]);
        const h = Number(args[3]);
        path = [
          applyCtm(x, y, ctm),
          applyCtm(x + w, y, ctm),
          applyCtm(x + w, y + h, ctm),
          applyCtm(x, y + h, ctm),
        ];
      } else if (fn === opsApi.closePath && path.length) {
        path.push(path[0]);
      }
    };

    const commit = (filled: boolean) => {
      const draw = pathToDraw(path, pageWidth, pageHeight);
      if (draw) draws.push({ ...draw, filled });
      if (filled) {
        const fill = pathToFill(path, pageWidth, pageHeight, fillColor);
        if (fill) fills.push(fill);
      }
      path = [];
    };

    for (let i = 0; i < ops.fnArray.length; i += 1) {
      const fn = ops.fnArray[i];
      const args = ops.argsArray[i] ?? [];
      if (fn === opsApi.save) stack.push(ctm);
      else if (fn === opsApi.restore) {
        ctm = stack.pop() ?? [1, 0, 0, 1, 0, 0];
        path = [];
      } else if (fn === opsApi.transform && args.length >= 6) {
        ctm = mulMat(ctm, args.map(Number));
      } else if (fn === opsApi.setFillRGBColor || fn === opsApi.setFillColorN || fn === opsApi.setFillColor) {
        const color = readFillColor(args);
        if (color) fillColor = color;
      } else if (fn === opsApi.setFillGray && args.length >= 1) {
        const g = Number(args[0]);
        fillColor = rgbToHex(g, g, g);
      } else if (
        fn === opsApi.moveTo ||
        fn === opsApi.lineTo ||
        fn === opsApi.curveTo ||
        fn === opsApi.curveTo2 ||
        fn === opsApi.curveTo3 ||
        fn === opsApi.rectangle ||
        fn === opsApi.closePath ||
        fn === opsApi.constructPath
      ) {
        addPathOp(fn, args);
      } else if (fn === opsApi.fill || fn === opsApi.eoFill || fn === opsApi.fillStroke || fn === opsApi.eoFillStroke) {
        commit(true);
      } else if (fn === opsApi.closeFillStroke || fn === opsApi.closeEOFillStroke) {
        commit(true);
      } else if (fn === opsApi.stroke || fn === opsApi.closeStroke) {
        commit(false);
      } else if (fn === opsApi.endPath) {
        path = [];
      }
    }
  } catch {
    return { fills, draws };
  }
  return { fills, draws };
}

function isDarkHex(hex: string) {
  const n = Number.parseInt(hex, 16);
  if (!Number.isFinite(n)) return false;
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b < 148;
}

function isFullPageArt(pic: { w: number; h: number }, pageWidth: number, pageHeight: number) {
  const cover = (pic.w * pic.h) / Math.max(1, pageWidth * pageHeight);
  return cover > 0.68 || (pic.w / pageWidth > 0.92 && pic.h / pageHeight > 0.92);
}

function lineText(line: PdfLine) {
  return line.runs.map((run) => run.text).join("");
}

function boxesOverlap(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
  pad = 0,
) {
  return (
    a.x < b.x + b.w + pad &&
    a.x + a.w > b.x - pad &&
    a.y < b.y + b.h + pad &&
    a.y + a.h > b.y - pad
  );
}

function lineHitsGraphic(line: PdfLine, boxes: Array<{ x: number; y: number; w: number; h: number }>) {
  const cx = line.x + Math.max(line.w, 4) / 2;
  const cy = line.y + Math.max(line.h, 4) / 2;
  return boxes.some(
    (box) => cx >= box.x - 2 && cx <= box.x + box.w + 2 && cy >= box.y - 2 && cy <= box.y + box.h + 2,
  );
}

function clusterNumbers(values: number[], tol: number) {
  const sorted = [...values].sort((a, b) => a - b);
  const groups: number[][] = [];
  for (const value of sorted) {
    const group = groups[groups.length - 1];
    if (group && value - group[group.length - 1] <= tol) group.push(value);
    else groups.push([value]);
  }
  return groups.map((group) => group.reduce((sum, n) => sum + n, 0) / group.length);
}

function linesCrossSplit(lines: PdfLine[], split: number, pageWidth: number) {
  const crossing = lines.filter(
    (line) => line.x + 6 < split && line.x + line.w - 6 > split && line.w > pageWidth * 0.32,
  );
  return crossing.length >= 2 || crossing.length / Math.max(1, lines.length) > 0.12;
}

function unionBox(items: Array<{ x: number; y: number; w: number; h: number }>, pad = 0) {
  const x = Math.min(...items.map((item) => item.x)) - pad;
  const y = Math.min(...items.map((item) => item.y)) - pad;
  const r = Math.max(...items.map((item) => item.x + item.w)) + pad;
  const b = Math.max(...items.map((item) => item.y + item.h)) + pad;
  return { x, y, w: r - x, h: b - y };
}

function clipPageBox(
  box: { x: number; y: number; w: number; h: number },
  pageWidth: number,
  pageHeight: number,
) {
  const x = Math.max(0, box.x);
  const y = Math.max(0, box.y);
  return {
    x,
    y,
    w: Math.max(1, Math.min(pageWidth - x, box.w + (box.x - x))),
    h: Math.max(1, Math.min(pageHeight - y, box.h + (box.y - y))),
  };
}

function boxesMostlyOverlap(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
) {
  const x = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
  const y = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
  const inter = x * y;
  return inter > Math.min(a.w * a.h, b.w * b.h) * 0.45;
}

function expandToLabels(box: { x: number; y: number; w: number; h: number }, lines: PdfLine[]) {
  const near = lines.filter((line) => {
    const text = lineText(line).trim();
    if (!text || text.length > 16) return false;
    return boxesOverlap(line, box, 42);
  });
  if (near.length < 3) return box;
  return unionBox([box, ...near], 8);
}

function clusterGraphicGroups(draws: PdfDraw[], pageWidth: number, pageHeight: number) {
  const items = draws.filter((draw) => {
    const cover = (draw.w * draw.h) / Math.max(1, pageWidth * pageHeight);
    return cover < 0.42 && Math.max(draw.w, draw.h) >= 8;
  });
  const parent = items.map((_, i) => i);
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      if (boxesOverlap(items[i], items[j], 52)) parent[find(j)] = find(i);
    }
  }
  const groups = new Map<number, PdfDraw[]>();
  items.forEach((item, i) => {
    const list = groups.get(find(i)) ?? [];
    list.push(item);
    groups.set(find(i), list);
  });
  return [...groups.values()]
    .filter((group) => {
      const filled = group.filter((draw) => draw.filled && draw.w > 8 && draw.h > 8).length;
      return group.length >= 5 || filled >= 3;
    })
    .map((group) => ({ group, box: unionBox(group, 8) }))
    .filter(({ box }) => {
      const cover = (box.w * box.h) / Math.max(1, pageWidth * pageHeight);
      return cover >= 0.012 && cover <= 0.48 && box.w > 28 && box.h > 28;
    });
}

async function graphicsFromDraws(
  draws: PdfDraw[],
  fills: PdfFill[],
  canvas: HTMLCanvasElement | null,
  pageWidth: number,
  pageHeight: number,
  existing: Array<{ x: number; y: number; w: number; h: number }>,
  lines: PdfLine[],
) {
  if (!canvas) return [] as PdfPic[];
  const combined: PdfDraw[] = [
    ...draws,
    ...fills.map((fill) => ({ x: fill.x, y: fill.y, w: fill.w, h: fill.h, filled: true })),
  ];
  const candidates: Array<{ x: number; y: number; w: number; h: number }> = [];
  for (const { group, box } of clusterGraphicGroups(combined, pageWidth, pageHeight)) {
    if (isTableGrid(group)) continue;
    if (isChartGroup(group) && existing.some((pic) => boxesMostlyOverlap(pic, box))) continue;
    candidates.push(expandToLabels(box, lines));
  }

  const pictures: PdfPic[] = [];
  const taken = [...existing];
  for (const raw of candidates) {
    const box = clipPageBox(raw, pageWidth, pageHeight);
    if (isFullPageArt(box, pageWidth, pageHeight)) continue;
    if (taken.some((pic) => boxesMostlyOverlap(pic, box))) continue;
    const bytes = await cropCanvasToPng(canvas, box.x, box.y, box.w, box.h, 2);
    if (!bytes) continue;
    const pic = { ...box, bytes };
    pictures.push(pic);
    taken.push(pic);
  }
  return pictures;
}

function isTableGrid(group: PdfDraw[]) {
  const thinH = group.filter((draw) => draw.h < 3.5 && draw.w > 20);
  const thinV = group.filter((draw) => draw.w < 3.5 && draw.h > 20);
  const filled = group.filter((draw) => draw.filled && draw.w > 10 && draw.h > 10 && draw.w * draw.h > 120);
  if (filled.length >= 2) return false;
  return thinH.length >= 4 && thinV.length >= 6;
}

function isChartGroup(group: PdfDraw[]) {
  const bars = group.filter((draw) => draw.filled && draw.w > 6 && draw.w < 52 && draw.h > 10 && draw.h < 280);
  return bars.length >= 4;
}

function isPaleHex(hex: string) {
  const n = Number.parseInt(hex, 16);
  if (!Number.isFinite(n)) return false;
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b > 232;
}

function uniqueLayout<T extends { x: number; y: number; w: number; h: number; color?: string }>(items: T[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${Math.round(item.x)}:${Math.round(item.y)}:${Math.round(item.w)}:${Math.round(item.h)}:${item.color ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function joinCaptions(lines: PdfLine[], maxGap = 24) {
  const sorted = [...lines].sort((a, b) => a.y - b.y || a.x - b.x);
  const groups: PdfLine[][] = [];
  for (const line of sorted) {
    const group = groups[groups.length - 1];
    const last = group?.[group.length - 1];
    const gap = last ? line.x - (last.x + last.w) : 0;
    if (
      last &&
      Math.abs(line.y - last.y) <= Math.max(5, line.size * 0.55) &&
      gap >= -4 &&
      gap <= Math.max(maxGap, last.size * 2.6)
    ) {
      group.push(line);
    } else groups.push([line]);
  }
  return groups.map((group) => ({
    x: group[0].x,
    y: Math.min(...group.map((line) => line.y)),
    w: group[group.length - 1].x + group[group.length - 1].w - group[0].x,
    h: Math.max(...group.map((line) => Math.max(line.h, line.size))),
    text: group
      .map((line) => lineText(line).trim())
      .join(" ")
      .replace(/\s+/g, " ")
      .trim(),
  })).filter((item) => item.text);
}

function detectBarCharts(fills: PdfFill[], lines: PdfLine[], pageWidth: number, pageHeight: number) {
  const bars = uniqueLayout(fills).filter((fill) => {
    const cover = (fill.w * fill.h) / Math.max(1, pageWidth * pageHeight);
    return (
      fill.w >= 6 &&
      fill.w <= 48 &&
      fill.h >= 10 &&
      fill.h <= pageHeight * 0.42 &&
      cover < 0.06 &&
      !isPaleHex(fill.color)
    );
  });
  if (bars.length < 4) return [] as PdfChart[];

  const parent = bars.map((_, i) => i);
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  for (let i = 0; i < bars.length; i += 1) {
    for (let j = i + 1; j < bars.length; j += 1) {
      if (boxesOverlap(bars[i], bars[j], Math.max(36, bars[i].w * 3))) parent[find(j)] = find(i);
    }
  }
  const groups = new Map<number, PdfFill[]>();
  bars.forEach((bar, i) => {
    const list = groups.get(find(i)) ?? [];
    list.push(bar);
    groups.set(find(i), list);
  });

  const charts: PdfChart[] = [];
  for (const group of groups.values()) {
    if (group.length < 4) continue;
    const widths = group.map((bar) => bar.w);
    const typicalW = median(widths);
    const even = group.filter((bar) => Math.abs(bar.w - typicalW) <= Math.max(3, typicalW * 0.35));
    if (even.length < 4) continue;

    const bottoms = even.map((bar) => bar.y + bar.h);
    const lefts = even.map((bar) => bar.x);
    const baseline = median(bottoms);
    const leftEdge = median(lefts);
    const columnHits = even.filter((bar) => Math.abs(bar.y + bar.h - baseline) <= 7).length;
    const barHits = even.filter((bar) => Math.abs(bar.x - leftEdge) <= 7).length;
    const horizontal = barHits > columnHits && barHits >= even.length * 0.7;
    const used = horizontal
      ? even.filter((bar) => Math.abs(bar.x - leftEdge) <= 7)
      : even.filter((bar) => Math.abs(bar.y + bar.h - baseline) <= 7);
    if (used.length < 4) continue;

    const catTol = Math.max(12, typicalW * 1.35);
    const catKeys = clusterNumbers(
      used.map((bar) => (horizontal ? bar.y : bar.x)),
      catTol,
    ).sort((a, b) => a - b);
    if (catKeys.length < 2) continue;

    const buckets = catKeys.map((key) =>
      used
        .filter((bar) => Math.abs((horizontal ? bar.y : bar.x) - key) <= catTol)
        .sort((a, b) => (horizontal ? a.y - b.y : a.x - b.x)),
    );
    const seriesCount = median(buckets.map((bucket) => bucket.length));
    if (seriesCount < 1 || buckets.some((bucket) => bucket.length !== seriesCount)) continue;

    const plot = unionBox(used, 6);
    const axisNums = joinCaptions(lines)
      .map((item) => ({ ...item, value: Number.parseFloat(item.text.replace(/,/g, "")) }))
      .filter((item) => Number.isFinite(item.value) && boxesOverlap(item, { ...plot, x: plot.x - 48, w: plot.w + 72 }, 28));
    const yAxis = axisNums
      .filter((item) => item.x + item.w < plot.x + 8)
      .sort((a, b) => b.y - a.y);
    const xAxis = axisNums
      .filter((item) => item.y > plot.y + plot.h - 12)
      .sort((a, b) => a.x - b.x);
    const numeric = horizontal ? xAxis : yAxis;
    const low = numeric[0]?.value ?? 0;
    const high = numeric[numeric.length - 1]?.value ?? 0;
    const yMin = Math.min(low, high);
    const yMax = Math.max(low, high, yMin + 1);
    const span = horizontal
      ? Math.max(8, Math.max(...used.map((bar) => bar.x + bar.w)) - leftEdge)
      : Math.max(8, baseline - Math.min(...used.map((bar) => bar.y)));
    const valueOf = (bar: PdfFill) => {
      const raw = horizontal ? bar.w / span : (baseline - bar.y) / span;
      const scaled = yMin + raw * (yMax - yMin);
      return Math.round(scaled * 100) / 100;
    };

    const series: PdfChart["series"] = [];
    for (let s = 0; s < seriesCount; s += 1) {
      const color = buckets.find((bucket) => bucket[s])?.[s]?.color ?? "2F6DB3";
      series.push({
        name: `Series ${s + 1}`,
        color,
        values: buckets.map((bucket) => valueOf(bucket[s])),
      });
    }

    const legend = joinCaptions(
      lines.filter((line) => {
        const text = lineText(line).trim();
        if (!text || /^\d+(\.\d+)?$/.test(text)) return false;
        return line.x >= plot.x + plot.w - 8 && line.y + line.h / 2 >= plot.y - 12 && line.y <= plot.y + plot.h + 24;
      }),
    ).sort((a, b) => a.y - b.y);
    legend.slice(0, series.length).forEach((item, index) => {
      if (item.text) series[index].name = item.text;
    });

    const cats = joinCaptions(
      lines.filter((line) => {
        const text = lineText(line).trim();
        if (!text || /^\d+(\.\d+)?$/.test(text)) return false;
        if (horizontal) return line.x + line.w < plot.x + 12 && line.y >= plot.y - 8 && line.y <= plot.y + plot.h + 8;
        return line.y >= baseline - 6 && line.y <= baseline + 42 && line.x + line.w / 2 >= plot.x - 12 && line.x <= plot.x + plot.w + 12;
      }),
    ).sort((a, b) => (horizontal ? a.y - b.y : a.x - b.x));
    const categories = catKeys.map((_, index) => cats[index]?.text || `Category ${index + 1}`);

    const labels = [...numeric, ...legend, ...cats];
    const box = labels.length ? unionBox([plot, ...labels], 10) : { ...plot, w: plot.w + 72, h: plot.h + 28 };
    charts.push({
      x: box.x,
      y: box.y,
      w: box.w,
      h: box.h,
      horizontal,
      categories,
      series,
    });
  }
  return charts;
}

function colLetter(index: number) {
  let n = index + 1;
  let out = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    out = String.fromCharCode(65 + rem) + out;
    n = Math.floor((n - 1) / 26);
  }
  return out;
}

function chartXml(chart: PdfChart) {
  const sheet = "Sheet1";
  const seriesXml = chart.series
    .map((item, index) => {
      const col = colLetter(index + 1);
      const pts = item.values
        .map((value, i) => `<c:pt idx="${i}"><c:v>${value}</c:v></c:pt>`)
        .join("");
      const cats = chart.categories
        .map((name, i) => `<c:pt idx="${i}"><c:v>${wordSafe(name)}</c:v></c:pt>`)
        .join("");
      return `<c:ser>
        <c:idx val="${index}"/>
        <c:order val="${index}"/>
        <c:tx>
          <c:strRef>
            <c:f>${sheet}!$${col}$1</c:f>
            <c:strCache><c:ptCount val="1"/><c:pt idx="0"><c:v>${wordSafe(item.name)}</c:v></c:pt></c:strCache>
          </c:strRef>
        </c:tx>
        <c:spPr>
          <a:solidFill><a:srgbClr val="${item.color}"/></a:solidFill>
          <a:ln><a:noFill/></a:ln>
        </c:spPr>
        <c:cat>
          <c:strRef>
            <c:f>${sheet}!$A$2:$A$${chart.categories.length + 1}</c:f>
            <c:strCache><c:ptCount val="${chart.categories.length}"/>${cats}</c:strCache>
          </c:strRef>
        </c:cat>
        <c:val>
          <c:numRef>
            <c:f>${sheet}!$${col}$2:$${col}$${chart.categories.length + 1}</c:f>
            <c:numCache>
              <c:formatCode>General</c:formatCode>
              <c:ptCount val="${item.values.length}"/>
              ${pts}
            </c:numCache>
          </c:numRef>
        </c:val>
      </c:ser>`;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<c:chartSpace xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <c:chart>
    <c:autoTitleDeleted val="1"/>
    <c:plotArea>
      <c:layout/>
      <c:barChart>
        <c:barDir val="${chart.horizontal ? "bar" : "col"}"/>
        <c:grouping val="clustered"/>
        <c:varyColors val="0"/>
        ${seriesXml}
        <c:gapWidth val="80"/>
        <c:axId val="1"/>
        <c:axId val="2"/>
      </c:barChart>
      <c:catAx>
        <c:axId val="1"/>
        <c:scaling><c:orientation val="minMax"/></c:scaling>
        <c:delete val="0"/>
        <c:axPos val="${chart.horizontal ? "l" : "b"}"/>
        <c:majorTickMark val="out"/>
        <c:minorTickMark val="none"/>
        <c:tickLblPos val="nextTo"/>
        <c:crossAx val="2"/>
        <c:crosses val="autoZero"/>
        <c:auto val="1"/>
        <c:lblAlgn val="ctr"/>
        <c:lblOffset val="100"/>
      </c:catAx>
      <c:valAx>
        <c:axId val="2"/>
        <c:scaling><c:orientation val="minMax"/></c:scaling>
        <c:delete val="0"/>
        <c:axPos val="${chart.horizontal ? "b" : "l"}"/>
        <c:majorGridlines/>
        <c:majorTickMark val="out"/>
        <c:minorTickMark val="none"/>
        <c:tickLblPos val="nextTo"/>
        <c:crossAx val="1"/>
        <c:crosses val="autoZero"/>
      </c:valAx>
    </c:plotArea>
    <c:legend>
      <c:legendPos val="r"/>
      <c:overlay val="0"/>
    </c:legend>
    <c:plotVisOnly val="1"/>
  </c:chart>
  <c:externalData r:id="rId1"><c:autoUpdate val="0"/></c:externalData>
</c:chartSpace>`;
}

async function chartWorkbook(chart: PdfChart) {
  const zip = new JSZip();
  const rows = [
    `<row r="1">${chart.series.map((item, i) => `<c r="${colLetter(i + 1)}1" t="inlineStr"><is><t>${wordSafe(item.name)}</t></is></c>`).join("")}</row>`,
    ...chart.categories.map((name, r) => {
      const row = r + 2;
      const data = chart.series
        .map((item, i) => `<c r="${colLetter(i + 1)}${row}"><v>${item.values[r] ?? 0}</v></c>`)
        .join("");
      return `<row r="${row}"><c r="A${row}" t="inlineStr"><is><t>${wordSafe(name)}</t></is></c>${data}</row>`;
    }),
  ];
  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`,
  );
  zip.file(
    "_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`,
  );
  zip.file(
    "xl/_rels/workbook.xml.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`,
  );
  zip.file(
    "xl/workbook.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="Sheet1" sheetId="1" r:id="rId1"/></sheets>
</workbook>`,
  );
  zip.file(
    "xl/worksheets/sheet1.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>${rows.join("")}</sheetData>
</worksheet>`,
  );
  return zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
}

function docxInlineChart(chart: PdfChart, relId: string, docId: number, maxWidth = 0) {
  let width = Math.max(160, chart.w);
  let height = Math.max(110, chart.h);
  if (maxWidth > 40 && width > maxWidth) {
    height *= maxWidth / width;
    width = maxWidth;
  }
  const cx = ptEmu(width);
  const cy = ptEmu(height);
  return `<w:p>
    <w:pPr><w:spacing w:before="120" w:after="120"/></w:pPr>
    <w:r>
      <w:drawing>
        <wp:inline distT="0" distB="0" distL="0" distR="0">
          <wp:extent cx="${cx}" cy="${cy}"/>
          <wp:effectExtent l="0" t="0" r="0" b="0"/>
          <wp:docPr id="${docId}" name="Chart ${docId}"/>
          <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
            <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart">
              <c:chart xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:id="${relId}"/>
            </a:graphicData>
          </a:graphic>
        </wp:inline>
      </w:drawing>
    </w:r>
  </w:p>`;
}

type PdfTable = { top: number; bottom: number; lines: PdfLine[]; colXs: number[]; rows: PdfLine[][] };

function detectTextTable(lines: PdfLine[], pageWidth: number): PdfTable | null {
  const maxW = pageWidth * 0.62;
  const candidates = lines.filter((line) => {
    const text = lineText(line).trim();
    return text.length > 0 && line.w <= maxW && line.size < 16;
  });
  if (candidates.length < 6) return null;
  const sorted = [...candidates].sort((a, b) => a.y - b.y || a.x - b.x);
  const rows: PdfLine[][] = [];
  for (const line of sorted) {
    const row = rows[rows.length - 1];
    if (row && Math.abs(line.y - row[0].y) <= Math.max(5.5, line.size * 0.55)) row.push(line);
    else rows.push([line]);
  }

  const rawXs = clusterNumbers(
    candidates.map((line) => line.x),
    16,
  );
  const colXs = rawXs.filter((x) => {
    const count = candidates.filter((line) => Math.abs(line.x - x) <= 16).length;
    if (count >= 2) return true;
    return rows.some((row) => {
      const hits = rawXs.filter((cx) => row.some((line) => Math.abs(line.x - cx) <= 16));
      return hits.length >= 3 && row.some((line) => Math.abs(line.x - x) <= 16);
    });
  });
  if (colXs.length < 2) return null;

  const filledCols = (row: PdfLine[]) => {
    const hits = new Set<number>();
    for (const line of row) {
      const index = colXs.findIndex((x) => Math.abs(line.x - x) <= 16);
      if (index >= 0) hits.add(index);
    }
    return hits.size;
  };

  let best: { start: number; end: number; score: number } | null = null;
  const minGood = colXs.length >= 3 ? 3 : 5;
  const minRatio = colXs.length >= 3 ? 0.68 : 0.82;
  for (let start = 0; start < rows.length; start += 1) {
    for (let end = start + minGood - 1; end < rows.length; end += 1) {
      const slice = rows.slice(start, end + 1);
      if (filledCols(slice[0]) < 2 || filledCols(slice[slice.length - 1]) < 2) continue;
      const good = slice.filter((row) => filledCols(row) >= 2).length;
      if (good < minGood || good / slice.length < minRatio) continue;
      const score = good * 10 + (end - start);
      if (!best || score > best.score) best = { start, end, score };
    }
  }
  if (!best) return null;

  const used: PdfLine[][] = [];
  for (const row of rows.slice(best.start, best.end + 1)) {
    const prev = used[used.length - 1];
    if (prev && filledCols(row) <= 1 && row[0].y - prev[0].y < Math.max(20, row[0].size * 1.8)) {
      prev.push(...row);
      continue;
    }
    used.push([...row]);
  }
  if (used.length < (colXs.length >= 3 ? 3 : 4)) return null;
  const consumed = used.flat();
  return {
    top: Math.min(...consumed.map((line) => line.y)),
    bottom: Math.max(...consumed.map((line) => line.y + line.h)),
    lines: consumed,
    colXs,
    rows: used,
  };
}

function detectStrokeTable(lines: PdfLine[], draws: PdfDraw[], pageWidth: number): PdfTable | null {
  const thinH = draws.filter((draw) => draw.h < 3.5 && draw.w > 24);
  const thinV = draws.filter((draw) => draw.w < 3.5 && draw.h > 14);
  if (thinH.length < 3 || thinV.length < 3) return null;
  const items = [...thinH, ...thinV];
  const parent = items.map((_, i) => i);
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      if (boxesOverlap(items[i], items[j], 16)) parent[find(j)] = find(i);
    }
  }
  const groups = new Map<number, PdfDraw[]>();
  items.forEach((item, i) => {
    const list = groups.get(find(i)) ?? [];
    list.push(item);
    groups.set(find(i), list);
  });
  const group = [...groups.values()].sort((a, b) => b.length - a.length)[0];
  if (!group || group.length < 8) return null;
  const hs = group.filter((draw) => draw.h < 3.5 && draw.w > 24);
  const vs = group.filter((draw) => draw.w < 3.5 && draw.h > 14);
  if (hs.length < 3 || vs.length < 3) return null;
  const box = unionBox(group, 1);
  const colXs = clusterNumbers(
    vs.map((draw) => draw.x),
    5,
  ).sort((a, b) => a - b);
  const rowYs = clusterNumbers(
    hs.map((draw) => draw.y),
    5,
  ).sort((a, b) => a - b);
  if (colXs.length < 3 || rowYs.length < 3) return null;
  const starts = colXs.slice(0, -1);
  const inTable = lines.filter((line) => {
    const cx = line.x + Math.max(line.w, 4) / 2;
    const cy = line.y + Math.max(line.h, 4) / 2;
    return cx >= box.x - 2 && cx <= box.x + box.w + 2 && cy >= box.y - 2 && cy <= box.y + box.h + 2;
  });
  if (inTable.length < 4) return null;
  const rows: PdfLine[][] = [];
  for (let i = 0; i < rowYs.length - 1; i += 1) {
    const top = rowYs[i];
    const bottom = rowYs[i + 1];
    rows.push(inTable.filter((line) => line.y + line.h / 2 > top + 0.8 && line.y + line.h / 2 < bottom - 0.8));
  }
  const used = rows.filter((row) => row.length);
  if (used.length < 2 || starts.length < 2) return null;
  return {
    top: box.y,
    bottom: box.y + box.h,
    lines: inTable,
    colXs: starts,
    rows,
  };
}

function extractAllTables(lines: PdfLine[], pageWidth: number, draws: PdfDraw[] = []) {
  const tables: PdfTable[] = [];
  let rest = [...lines];
  const stroke = detectStrokeTable(rest, draws, pageWidth);
  if (stroke) {
    tables.push(stroke);
    const taken = new Set(stroke.lines);
    rest = rest.filter((line) => !taken.has(line));
  }
  while (rest.length) {
    const table = detectTextTable(rest, pageWidth);
    if (!table) break;
    tables.push(table);
    const taken = new Set(table.lines);
    const next = rest.filter((line) => !taken.has(line));
    if (next.length >= rest.length) break;
    rest = next;
  }
  return { tables, rest };
}

function tableToXml(table: PdfTable, pageWidth: number) {
  const usable = Math.max(2400, ptTwip(pageWidth) - 360);
  const rights = table.colXs.map((x, index) => {
    if (index < table.colXs.length - 1) return table.colXs[index + 1];
    const ends = table.rows.flat().map((line) => line.x + line.w);
    return Math.max(x + 72, ...ends, pageWidth * 0.9);
  });
  const raw = table.colXs.map((x, index) => Math.max(360, ptTwip(rights[index] - x)));
  const sum = raw.reduce((n, w) => n + w, 0) || usable;
  const widths = raw.map((w) => Math.max(360, Math.round((w / sum) * usable)));
  const rowsXml = table.rows
    .map((row) => {
      const cells: PdfLine[][] = table.colXs.map(() => []);
      for (const line of row) {
        let best = 0;
        let dist = Infinity;
        table.colXs.forEach((x, index) => {
          const end = index < table.colXs.length - 1 ? table.colXs[index + 1] : Infinity;
          const cx = line.x + Math.max(line.w, 4) / 2;
          const d = cx >= x - 2 && cx < end ? 0 : Math.abs(line.x - x);
          if (d < dist) {
            dist = d;
            best = index;
          }
        });
        cells[best].push(line);
      }
      return `<w:tr>${cells
        .map((cell, index) => {
          const xml = mergeParagraphLines(cell)
            .map(
              (line) => `<w:p>
            <w:pPr><w:spacing w:before="20" w:after="20" w:line="240" w:lineRule="auto"/></w:pPr>
            ${lineRunsXml(line)}
          </w:p>`,
            )
            .join("") || "<w:p/>";
          return `<w:tc>
          <w:tcPr>
            <w:tcW w:w="${widths[index]}" w:type="dxa"/>
            <w:tcBorders>
              <w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/>
              <w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/>
              <w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/>
              <w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/>
            </w:tcBorders>
            <w:tcMar><w:top w:w="60"/><w:left w:w="80"/><w:bottom w:w="60"/><w:right w:w="80"/></w:tcMar>
          </w:tcPr>
          ${xml}
        </w:tc>`;
        })
        .join("")}</w:tr>`;
    })
    .join("");
  return `<w:tbl>
    <w:tblPr>
      <w:tblW w:w="${widths.reduce((n, w) => n + w, 0)}" w:type="dxa"/>
      <w:tblLayout w:type="fixed"/>
      <w:tblBorders>
        <w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/>
        <w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/>
        <w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/>
        <w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/>
        <w:insideH w:val="single" w:sz="4" w:space="0" w:color="000000"/>
        <w:insideV w:val="single" w:sz="4" w:space="0" w:color="000000"/>
      </w:tblBorders>
    </w:tblPr>
    <w:tblGrid>${widths.map((w) => `<w:gridCol w:w="${w}"/>`).join("")}</w:tblGrid>
    ${rowsXml}
  </w:tbl>`;
}

type PdfColumn = { left: number; right: number; fill?: PdfFill };

function keepColumns(cols: PdfColumn[], lines: PdfLine[], pics: Array<{ x: number; y: number; w: number; h: number }>, bandHeight: number): PdfColumn[] {
  if (cols.length < 2) return cols;
  const minSpan = Math.max(28, bandHeight * 0.32);
  const strong = cols.every((col, index) => {
    const ls = lines.filter((line) => columnIndex(line.x + line.w / 2, cols) === index);
    const ps = pics.filter((pic) => columnIndex(pic.x + pic.w / 2, cols) === index);
    if (!ls.length && !ps.length) return false;
    const ys = [...ls.map((line) => line.y), ...ps.map((pic) => pic.y)];
    const span = Math.max(...ys) - Math.min(...ys);
    return (ls.length >= 3 || ps.length > 0) && span >= minSpan;
  });
  if (strong) return cols;
  return [{ left: Math.min(...cols.map((col) => col.left)), right: Math.max(...cols.map((col) => col.right)) }];
}

function detectColumns(
  lines: PdfLine[],
  fills: PdfFill[],
  pics: Array<{ x: number; y: number; w: number; h: number }>,
  pageWidth: number,
  pageHeight: number,
): PdfColumn[] {
  const attachFill = (cols: PdfColumn[]) => {
    for (const col of cols) {
      col.fill = fills.find(
        (fill) =>
          fill.x + fill.w / 2 >= col.left &&
          fill.x + fill.w / 2 < col.right &&
          fill.h > pageHeight * 0.22 &&
          fill.w > (col.right - col.left) * 0.4,
      );
    }
    return cols;
  };

  const items = [
    ...lines.map((line) => ({ x: line.x, w: line.w })),
    ...pics.map((pic) => ({ x: pic.x, w: pic.w })),
  ];
  const mids = items
    .map((item) => item.x + Math.max(item.w, 4) / 2)
    .filter((x) => x > pageWidth * 0.04 && x < pageWidth * 0.96)
    .sort((a, b) => a - b);
  let split: number | null = null;
  let bestGap = 18;
  for (let i = 1; i < mids.length; i += 1) {
    const gap = mids[i] - mids[i - 1];
    const mid = (mids[i] + mids[i - 1]) / 2;
    if (gap > bestGap && mid > pageWidth * 0.08 && mid < pageWidth * 0.88) {
      bestGap = gap;
      split = mid;
    }
  }
  if (split != null) {
    const leftCount = items.filter((item) => item.x + item.w / 2 < split).length;
    const rightCount = items.filter((item) => item.x + item.w / 2 >= split).length;
    if (leftCount >= 2 && rightCount >= 3 && !linesCrossSplit(lines, split, pageWidth)) {
      return keepColumns(
        attachFill([
          { left: 0, right: split },
          { left: split, right: pageWidth },
        ]),
        lines,
        pics,
        pageHeight,
      );
    }
  }

  const sidebar = fills
    .filter((fill) => fill.h > pageHeight * 0.32 && fill.w > 36 && fill.w < pageWidth * 0.5)
    .sort((a, b) => b.h * b.w - a.h * a.w)[0];
  if (sidebar) {
    const cut = sidebar.x + sidebar.w / 2 < pageWidth / 2 ? sidebar.x + sidebar.w : sidebar.x;
    if (!linesCrossSplit(lines, cut, pageWidth)) {
      return keepColumns(
        attachFill([
          { left: 0, right: cut, fill: sidebar.x < pageWidth / 2 ? sidebar : undefined },
          { left: cut, right: pageWidth, fill: sidebar.x >= pageWidth / 2 ? sidebar : undefined },
        ]),
        lines,
        pics,
        pageHeight,
      );
    }
  }

  const bins = Math.max(48, Math.round(pageWidth));
  const cov = new Array<number>(bins).fill(0);
  const stamp = (x: number, w: number, weight: number) => {
    const start = Math.max(0, Math.floor((x / pageWidth) * bins));
    const end = Math.min(bins, Math.ceil(((x + Math.max(w, 8)) / pageWidth) * bins));
    for (let i = start; i < end; i += 1) cov[i] += weight;
  };
  lines.forEach((line) => stamp(line.x, line.w, 2));
  pics.forEach((pic) => stamp(pic.x, pic.w, 1));
  const peak = Math.max(1, ...cov);
  const threshold = peak * 0.1;
  const minGap = Math.max(5, Math.round((22 / pageWidth) * bins));
  const gaps: Array<{ start: number; end: number }> = [];
  let i = Math.round(bins * 0.08);
  const last = Math.round(bins * 0.92);
  while (i < last) {
    if (cov[i] <= threshold) {
      let j = i;
      while (j < last && cov[j] <= threshold) j += 1;
      if (j - i >= minGap) gaps.push({ start: i, end: j });
      i = j;
    } else i += 1;
  }
  const cuts = gaps
    .sort((a, b) => b.end - b.start - (a.end - a.start))
    .slice(0, 2)
    .map((gap) => ((gap.start + gap.end) / 2 / bins) * pageWidth)
    .filter((cut) => !linesCrossSplit(lines, cut, pageWidth))
    .sort((a, b) => a - b);
  if (!cuts.length) return [{ left: 0, right: pageWidth }];
  const edges = [0, ...cuts, pageWidth];
  const cols: PdfColumn[] = [];
  for (let c = 0; c < edges.length - 1; c += 1) {
    const col: PdfColumn = { left: edges[c], right: edges[c + 1] };
    const hasContent =
      lines.some((line) => line.x + line.w / 2 >= col.left && line.x + line.w / 2 < col.right) ||
      pics.some((pic) => pic.x + pic.w / 2 >= col.left && pic.x + pic.w / 2 < col.right);
    if (hasContent) cols.push(col);
  }
  const resolved = cols.length >= 2 ? cols : [{ left: 0, right: pageWidth }];
  return keepColumns(attachFill(resolved), lines, pics, pageHeight);
}

function columnIndex(x: number, cols: PdfColumn[]) {
  const hit = cols.findIndex((col) => x >= col.left && x < col.right);
  if (hit >= 0) return hit;
  let best = 0;
  let dist = Infinity;
  cols.forEach((col, index) => {
    const mid = (col.left + col.right) / 2;
    const d = Math.abs(x - mid);
    if (d < dist) {
      dist = d;
      best = index;
    }
  });
  return best;
}

function median(values: number[]) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function cloneLine(line: PdfLine): PdfLine {
  return { ...line, runs: line.runs.map((run) => ({ ...run })) };
}

function mergeParagraphLines(lines: PdfLine[]): PdfLine[] {
  const sorted = [...lines].sort((a, b) => a.y - b.y || a.x - b.x);
  const out: PdfLine[] = [];
  for (const line of sorted) {
    const prev = out[out.length - 1];
    if (!prev) {
      out.push(cloneLine(line));
      continue;
    }
    const gap = line.y - (prev.y + prev.h);
    const sameSize = Math.abs(line.size - prev.size) <= 2.4;
    const stacked = gap >= -2.2 && gap <= Math.max(5.4, prev.size * 0.9);
    const aligned = Math.abs(line.x - prev.x) <= 16;
    const firstIndent = line.x > prev.x && line.x - prev.x < Math.max(42, prev.size * 3.2);
    const hanging = prev.x - line.x > 0 && prev.x - line.x <= Math.max(24, prev.size * 2.1);
    const nested = line.x >= prev.x - 24 && line.x + line.w <= prev.x + prev.w + 18;
    const overlap = line.x < prev.x + prev.w - 6 && prev.x < line.x + line.w - 6;
    const prevText = lineText(prev).trim();
    const nextText = lineText(line).trim();
    const newBlock =
      /^[\u2022\u00b7\uf0b7•\-–]/.test(nextText) ||
      (/^[A-Z]/.test(nextText) && nextText.length > 42 && /[.!?]["']?$/.test(prevText) && gap > prev.size * 0.28);
    if (sameSize && stacked && (aligned || firstIndent || hanging || nested || overlap) && !newBlock) {
      const prefix = prev.runs.length && !/\s$/.test(prev.runs[prev.runs.length - 1]?.text ?? "") ? " " : "";
      line.runs.forEach((run, index) => {
        prev.runs.push({
          ...run,
          text: index === 0 ? `${prefix}${run.text}` : run.text,
        });
      });
      const left = Math.min(prev.x, line.x);
      prev.w = Math.max(prev.x + prev.w, line.x + line.w) - left;
      prev.x = left;
      prev.h = line.y + line.h - prev.y;
    } else {
      out.push(cloneLine(line));
    }
  }
  return out;
}

function columnPara(line: PdfLine, col: PdfColumn, pageWidth: number, bodyLeft: number, bodySize: number) {
  const text = line.runs.map((run) => run.text).join("");
  const heading = line.size >= Math.max(bodySize + 3.5, 15);
  const bullet = /^[\u2022\u00b7\uf0b7•]/.test(text.trim());
  const colW = Math.max(1, col.right - col.left);
  const leftGap = line.x - col.left;
  const rightGap = col.right - (line.x + line.w);
  const centered =
    Math.abs(leftGap - rightGap) < Math.max(12, colW * 0.1) &&
    leftGap > colW * 0.1 &&
    line.w < colW * 0.88;
  const righted = rightGap < 16 && leftGap > Math.max(40, colW * 0.2);
  const indent = centered || righted ? 0 : Math.max(0, ptTwip(line.x - bodyLeft));
  const align = centered
    ? "center"
    : righted
      ? "right"
      : bullet
        ? "left"
        : text.replace(/\s+/g, "").length > 90
          ? "both"
          : "left";
  return `<w:p>
    <w:pPr>
      <w:jc w:val="${align}"/>
      <w:spacing w:before="${heading ? 200 : 0}" w:after="${heading ? 140 : 80}" w:line="276" w:lineRule="auto"/>
      ${!centered && !righted && indent > 180 ? `<w:ind w:left="${Math.min(indent, 1440)}"/>` : ""}
    </w:pPr>
    ${lineRunsXml(line)}
  </w:p>`;
}

function inBand(y: number, top: number, bottom: number) {
  return y >= top - 1.5 && y <= bottom + 1.5;
}

function splitContentBands(
  lines: PdfLine[],
  pictures: PlacedPic[],
  pageWidth: number,
  pageHeight: number,
  charts: PlacedChart[] = [],
) {
  const boxes = [
    ...lines.map((line) => ({ top: line.y, bottom: line.y + Math.max(line.h, line.size * 0.9) })),
    ...pictures.map((item) => ({ top: item.pic.y, bottom: item.pic.y + item.pic.h })),
    ...charts.map((item) => ({ top: item.chart.y, bottom: item.chart.y + item.chart.h })),
  ].sort((a, b) => a.top - b.top);
  if (!boxes.length) return [{ top: 0, bottom: pageHeight, lines, pictures, charts }];
  const lh = median(lines.map((line) => line.h || line.size)) || 12;
  const breakGap = Math.max(28, lh * 2.3);
  const ranges: Array<{ top: number; bottom: number }> = [];
  for (const box of boxes) {
    const prev = ranges[ranges.length - 1];
    if (prev && box.top <= prev.bottom + breakGap) {
      prev.top = Math.min(prev.top, box.top);
      prev.bottom = Math.max(prev.bottom, box.bottom);
    } else ranges.push({ top: box.top, bottom: box.bottom });
  }
  const bands = ranges.map((range) => ({
    top: range.top,
    bottom: range.bottom,
    lines: lines.filter((line) => inBand(line.y + line.h / 2, range.top, range.bottom)),
    pictures: pictures.filter((item) => inBand(item.pic.y + item.pic.h / 2, range.top, range.bottom)),
    charts: charts.filter((item) => inBand(item.chart.y + item.chart.h / 2, range.top, range.bottom)),
  }));
  return bands.flatMap((band) => splitBandByColumnChange(band, pageWidth));
}

function splitBandByColumnChange(
  band: { top: number; bottom: number; lines: PdfLine[]; pictures: PlacedPic[]; charts: PlacedChart[] },
  pageWidth: number,
): Array<{ top: number; bottom: number; lines: PdfLine[]; pictures: PlacedPic[]; charts: PlacedChart[] }> {
  const lines = [...band.lines].sort((a, b) => a.y - b.y || a.x - b.x);
  if (lines.length < 6) return [band];
  for (let i = 2; i < lines.length - 2; i += 1) {
    const gap = lines[i].y - (lines[i - 1].y + lines[i - 1].h);
    if (gap < 8) continue;
    const above = lines.slice(0, i);
    const below = lines.slice(i);
    const heightA = Math.max(36, above[above.length - 1].y - above[0].y);
    const heightB = Math.max(36, below[below.length - 1].y - below[0].y);
    const colsA = detectColumns(above, [], [], pageWidth, heightA).length;
    const colsB = detectColumns(below, [], [], pageWidth, heightB).length;
    if (colsA === colsB) continue;
    if (colsA < 2 && colsB < 2) continue;
    const cut = (lines[i - 1].y + lines[i - 1].h + lines[i].y) / 2;
    const picsA = band.pictures.filter((item) => item.pic.y + item.pic.h / 2 < cut);
    const picsB = band.pictures.filter((item) => item.pic.y + item.pic.h / 2 >= cut);
    const chartsA = band.charts.filter((item) => item.chart.y + item.chart.h / 2 < cut);
    const chartsB = band.charts.filter((item) => item.chart.y + item.chart.h / 2 >= cut);
    return [
      ...splitBandByColumnChange(
        {
          top: band.top,
          bottom: cut,
          lines: band.lines.filter((line) => line.y + line.h / 2 < cut),
          pictures: picsA,
          charts: chartsA,
        },
        pageWidth,
      ),
      ...splitBandByColumnChange(
        {
          top: cut,
          bottom: band.bottom,
          lines: band.lines.filter((line) => line.y + line.h / 2 >= cut),
          pictures: picsB,
          charts: chartsB,
        },
        pageWidth,
      ),
    ];
  }
  return [band];
}

function bandIsScattered(lines: PdfLine[], width: number) {
  if (lines.length < 10) return false;
  let overlap = 0;
  for (let i = 0; i < lines.length; i += 1) {
    for (let j = i + 1; j < Math.min(lines.length, i + 8); j += 1) {
      if (boxesOverlap(lines[i], lines[j], -1)) overlap += 1;
    }
  }
  if (overlap >= 8) return true;
  const short = lines.filter((line) => lineText(line).trim().length <= 22 && line.w < width * 0.32);
  if (short.length < 10) return false;
  const xs = clusterNumbers(short.map((line) => line.x), 18);
  const ys = clusterNumbers(short.map((line) => line.y), 16);
  return xs.length >= 3 && ys.length >= 4 && detectTextTable(lines, width) == null;
}

function columnCellXml(
  lines: PdfLine[],
  pictures: PlacedPic[],
  col: PdfColumn,
  dark: boolean,
  pageWidth: number,
  draws: PdfDraw[] = [],
  charts: PlacedChart[] = [],
) {
  const graphicBoxes = [...pictures.map((item) => item.pic), ...charts.map((item) => item.chart)];
  const visible = paintLineColors(
    lines.filter((line) => !lineHitsGraphic(line, graphicBoxes)),
    col.fill ? [col.fill] : [],
  );
  const extracted = extractAllTables(visible, Math.max(80, col.right - col.left), draws);
  const merged = mergeParagraphLines(extracted.rest);
  const bodySize = median(merged.map((line) => line.size)) || 11;
  const bodyXs = merged.filter((line) => line.size <= bodySize + 1.2).map((line) => line.x);
  const bodyLeft = bodyXs.length ? Math.min(...bodyXs) : col.left;
  const items = [
    ...pictures.map((picture) => ({
      y: picture.pic.y,
      xml: docxInlinePicture(picture.pic, picture.relId, picture.docId, pageWidth - 28),
    })),
    ...charts.map((item) => ({
      y: item.chart.y,
      xml: docxInlineChart(item.chart, item.relId, item.docId, pageWidth - 28),
    })),
    ...extracted.tables.map((table) => ({ y: table.top, xml: tableToXml(table, pageWidth) })),
    ...merged.map((line) => ({
      y: line.y,
      xml: columnPara(
        {
          ...line,
          runs: line.runs.map((run) => ({
            ...run,
            color: run.color ?? (dark ? "FFFFFF" : "000000"),
          })),
        },
        col,
        pageWidth,
        bodyLeft,
        bodySize,
      ),
    })),
  ].sort((a, b) => a.y - b.y);
  return items.map((item) => item.xml).join("") || "<w:p/>";
}

function layoutBandXml(
  lines: PdfLine[],
  fills: PdfFill[],
  pictures: PlacedPic[],
  pageWidth: number,
  bandHeight: number,
  startId: number,
  draws: PdfDraw[] = [],
  charts: PlacedChart[] = [],
) {
  if (bandIsScattered(lines, pageWidth)) {
    const anchored = [
      ...pictures.map((picture) => ({
        xml: docxPicture(picture.pic, picture.relId, picture.docId, false),
      })),
      ...charts.map((item) => ({
        xml: docxInlineChart(item.chart, item.relId, item.docId, pageWidth - 28),
      })),
    ];
    return positionedPageXml(lines, fills, anchored, startId);
  }
  const cols = detectColumns(
    lines,
    fills,
    [...pictures.map((item) => item.pic), ...charts.map((item) => item.chart)],
    pageWidth,
    Math.max(48, bandHeight),
  );
  const usable = Math.max(1440, ptTwip(pageWidth) - 288);
  const widths = cols.map((col) =>
    Math.max(720, Math.round(((col.right - col.left) / pageWidth) * usable)),
  );
  const widthSum = widths.reduce((n, w) => n + w, 0) || usable;
  const scaled = widths.map((w) => Math.round((w / widthSum) * usable));
  if (cols.length === 1) {
    const dark = Boolean(cols[0].fill && isDarkHex(cols[0].fill.color));
    return { xml: columnCellXml(lines, pictures, cols[0], dark, pageWidth, draws, charts), nextId: startId };
  }
  const cells = cols.map((col, index) => {
    const dark = Boolean(col.fill && isDarkHex(col.fill.color));
    const colLines = lines.filter((line) => columnIndex(line.x + line.w / 2, cols) === index);
    const colPics = pictures.filter((item) => columnIndex(item.pic.x + item.pic.w / 2, cols) === index);
    const colCharts = charts.filter((item) => columnIndex(item.chart.x + item.chart.w / 2, cols) === index);
    const fill = col.fill?.color
      ? `<w:shd w:val="clear" w:color="auto" w:fill="${col.fill.color}"/>`
      : "";
    return `<w:tc>
      <w:tcPr>
        <w:tcW w:w="${scaled[index]}" w:type="dxa"/>
        ${fill}
        <w:vAlign w:val="top"/>
        <w:tcMar>
          <w:top w:w="80"/><w:left w:w="100"/><w:bottom w:w="80"/><w:right w:w="100"/>
        </w:tcMar>
      </w:tcPr>
      ${columnCellXml(colLines, colPics, col, dark, pageWidth, draws, colCharts)}
    </w:tc>`;
  });
  return {
    xml: `<w:tbl>
    <w:tblPr>
      <w:tblW w:w="${usable}" w:type="dxa"/>
      <w:tblLayout w:type="fixed"/>
      <w:tblBorders>
        <w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/>
        <w:insideH w:val="nil"/><w:insideV w:val="nil"/>
      </w:tblBorders>
    </w:tblPr>
    <w:tblGrid>${scaled.map((w) => `<w:gridCol w:w="${w}"/>`).join("")}</w:tblGrid>
    <w:tr>${cells.join("")}</w:tr>
  </w:tbl>`,
    nextId: startId,
  };
}

function layoutPageXml(
  lines: PdfLine[],
  fills: PdfFill[],
  pictures: PlacedPic[],
  pageWidth: number,
  pageHeight: number,
  startId: number,
  draws: PdfDraw[] = [],
  charts: PlacedChart[] = [],
) {
  const graphicBoxes = [...pictures.map((item) => item.pic), ...charts.map((item) => item.chart)];
  const visible = lines.filter((line) => !lineHitsGraphic(line, graphicBoxes));
  const layoutFills = fills.filter((fill) => !graphicBoxes.some((box) => boxesMostlyOverlap(fill, box)));
  const bands = splitContentBands(visible, pictures, pageWidth, pageHeight, charts);
  let id = startId;
  const parts: Array<{ y: number; xml: string }> = [];
  for (const band of bands) {
    const bandFills = layoutFills.filter((fill) =>
      boxesOverlap(fill, { x: 0, y: band.top, w: pageWidth, h: Math.max(8, band.bottom - band.top) }, 4),
    );
    const laid = layoutBandXml(
      band.lines,
      bandFills,
      band.pictures,
      pageWidth,
      Math.max(24, band.bottom - band.top),
      id,
      draws,
      band.charts,
    );
    id = laid.nextId;
    parts.push({ y: band.top, xml: laid.xml });
  }
  parts.sort((a, b) => a.y - b.y);
  return { xml: parts.map((part) => part.xml).join("") || "<w:p/>", nextId: id };
}

function colorForLine(line: PdfLine, fills: PdfFill[]) {
  const cx = line.x + Math.max(line.w, 4) / 2;
  const cy = line.y + Math.max(line.h, 4) / 2;
  let found: PdfFill | null = null;
  for (const fill of fills) {
    if (cx >= fill.x && cx <= fill.x + fill.w && cy >= fill.y && cy <= fill.y + fill.h) {
      found = fill;
    }
  }
  return found && isDarkHex(found.color) ? "FFFFFF" : "000000";
}

function paintLineColors(lines: PdfLine[], fills: PdfFill[]) {
  return lines.map((line) => {
    const color = colorForLine(line, fills);
    return { ...line, runs: line.runs.map((run) => ({ ...run, color: run.color ?? color })) };
  });
}

function docxFill(fill: PdfFill) {
  const left = Math.max(0, fill.x).toFixed(2);
  const top = Math.max(0, fill.y).toFixed(2);
  const width = Math.max(1, fill.w).toFixed(2);
  const height = Math.max(1, fill.h).toFixed(2);
  return `<w:p>
    <w:r>
      <w:pict>
        <v:rect style="position:absolute;margin-left:${left}pt;margin-top:${top}pt;width:${width}pt;height:${height}pt;z-index:-2" fillcolor="#${fill.color}" stroked="f">
          <w10:wrap type="none"/>
        </v:rect>
      </w:pict>
    </w:r>
  </w:p>`;
}

function positionedLineXml(line: PdfLine, id: number) {
  const cx = ptEmu(Math.max(line.w + 2, line.size * 2.2));
  const cy = ptEmu(Math.max(line.h, line.size * 1.5));
  const ox = ptEmu(Math.max(0, line.x));
  const oy = ptEmu(Math.max(0, line.y));
  const h = Math.max(100, ptTwip(Math.max(line.h, line.size * 1.45)));
  return `<w:p>
    <w:r>
      <mc:AlternateContent>
        <mc:Choice Requires="wps">
          <w:drawing>
            <wp:anchor distT="0" distB="0" distL="0" distR="0" simplePos="0" relativeHeight="${251658240 + id}" behindDoc="0" locked="0" layoutInCell="1" allowOverlap="1">
              <wp:simplePos x="0" y="0"/>
              <wp:positionH relativeFrom="page"><wp:posOffset>${ox}</wp:posOffset></wp:positionH>
              <wp:positionV relativeFrom="page"><wp:posOffset>${oy}</wp:posOffset></wp:positionV>
              <wp:extent cx="${cx}" cy="${cy}"/>
              <wp:effectExtent l="0" t="0" r="0" b="0"/>
              <wp:wrapNone/>
              <wp:docPr id="${id}" name="Text ${id}"/>
              <wp:cNvGraphicFramePr/>
              <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
                <a:graphicData uri="http://schemas.microsoft.com/office/word/2010/wordprocessingShape">
                  <wps:wsp>
                    <wps:cNvSpPr txBox="1"/>
                    <wps:spPr>
                      <a:xfrm>
                        <a:off x="0" y="0"/>
                        <a:ext cx="${cx}" cy="${cy}"/>
                      </a:xfrm>
                      <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
                      <a:noFill/>
                      <a:ln><a:noFill/></a:ln>
                    </wps:spPr>
                    <wps:txbx>
                      <w:txbxContent>
                        <w:p>
                          <w:pPr>
                            <w:spacing w:before="0" w:after="0" w:line="${h}" w:lineRule="exact"/>
                          </w:pPr>
                          ${lineRunsXml(line)}
                        </w:p>
                      </w:txbxContent>
                    </wps:txbx>
                    <wps:bodyPr wrap="square" lIns="0" tIns="0" rIns="0" bIns="0" rtlCol="0" anchor="t"/>
                  </wps:wsp>
                </a:graphicData>
              </a:graphic>
            </wp:anchor>
          </w:drawing>
        </mc:Choice>
        <mc:Fallback>
          <w:t xml:space="preserve">${wordSafe(line.runs.map((run) => run.text).join(" "))}</w:t>
        </mc:Fallback>
      </mc:AlternateContent>
    </w:r>
  </w:p>`;
}

function positionedPageXml(
  lines: PdfLine[],
  fills: PdfFill[],
  pictures: Array<{ xml: string }>,
  startId: number,
) {
  const colored = paintLineColors(lines, fills);
  let id = startId;
  const textXml = colored
    .map((line) => {
      const xml = positionedLineXml(line, id);
      id += 1;
      return xml;
    })
    .join("");
  return { xml: `${fills.map(docxFill).join("")}${pictures.map((pic) => pic.xml).join("")}${textXml}`, nextId: id };
}

function applyUnderlines(lines: PdfLine[], draws: PdfDraw[]) {
  const rules = draws.filter((draw) => draw.h <= 2.4 && draw.w > 14);
  if (!rules.length) return lines;
  for (const line of lines) {
    const baseline = line.y + line.size * 0.95;
    for (const run of line.runs) {
      if (
        rules.some(
          (rule) =>
            Math.abs(rule.y - baseline) <= Math.max(3.2, line.size * 0.28) &&
            run.x + 1 < rule.x + rule.w &&
            run.x + run.w - 1 > rule.x,
        )
      ) {
        run.underline = true;
      }
    }
  }
  return lines;
}

function stripBulletLine(line: PdfLine): { bullet: boolean; line: PdfLine } {
  const raw = lineText(line).trim();
  const match = raw.match(/^([•\u2022\u00b7\uf0b7◦▪▫■□o○●])\s*(.*)$/);
  if (!match) return { bullet: false, line };
  const rest = match[2] ?? "";
  if (!rest) return { bullet: true, line: { ...line, runs: [{ ...line.runs[0], text: rest || " " }] } };
  const first = line.runs.find((run) => /[•\u2022\u00b7\uf0b7]/.test(run.text));
  const nextRuns = line.runs
    .map((run, index) => {
      if (index === 0 && first) {
        return { ...run, text: run.text.replace(/^[•\u2022\u00b7\uf0b7\s]+/, "") };
      }
      return run;
    })
    .filter((run) => run.text.length);
  return {
    bullet: true,
    line: {
      ...line,
      runs: nextRuns.length ? nextRuns : [{ ...line.runs[0], text: rest }],
      x: line.x + Math.min(18, line.size * 1.4),
    },
  };
}

function exactPara(line: PdfLine, marginL: number, pageWidth: number, gapPt: number) {
  const stripped = stripBulletLine(line);
  const used = stripped.line;
  const contentW = Math.max(40, pageWidth - marginL * 2);
  const leftGap = used.x - marginL;
  const rightGap = pageWidth - marginL - (used.x + used.w);
  const centered =
    !stripped.bullet &&
    Math.abs(leftGap - rightGap) < Math.max(10, contentW * 0.08) &&
    leftGap > 12 &&
    used.w < contentW * 0.9;
  const heading = used.size >= 15;
  const before = Math.max(0, ptTwip(Math.max(0, gapPt - (heading ? 1 : 2))));
  const lineTwips = Math.max(160, ptTwip(used.size * 1.28));
  const indent = centered || stripped.bullet ? 0 : Math.max(0, ptTwip(leftGap));
  const hanging = stripped.bullet ? `<w:ind w:left="${Math.max(360, indent + 360)}" w:hanging="360"/>` : indent > 80 ? `<w:ind w:left="${Math.min(indent, 2880)}"/>` : "";
  const align = centered ? "center" : "left";
  return `<w:p>
    <w:pPr>
      <w:jc w:val="${align}"/>
      <w:spacing w:before="${before}" w:after="0" w:line="${lineTwips}" w:lineRule="exact"/>
      ${hanging}
    </w:pPr>
    ${stripped.bullet ? `<w:r><w:rPr><w:sz w:val="${Math.max(14, Math.round(used.size * 2))}"/></w:rPr><w:t xml:space="preserve">• </w:t></w:r>` : ""}
    ${lineRunsXml(used)}
  </w:p>`;
}

function setParaBefore(xml: string, beforeTwips: number) {
  if (/<w:spacing\b/.test(xml)) {
    return xml.replace(/<w:spacing\b[^/]*\/>/, `<w:spacing w:before="${Math.max(0, beforeTwips)}" w:after="80"/>`);
  }
  return xml.replace("<w:pPr>", `<w:pPr><w:spacing w:before="${Math.max(0, beforeTwips)}" w:after="80"/>`);
}

function layoutExactFlowXml(
  lines: PdfLine[],
  pictures: PlacedPic[],
  charts: PlacedChart[],
  draws: PdfDraw[],
  pageWidth: number,
  pageHeight: number,
) {
  const graphicBoxes = [...pictures.map((item) => item.pic), ...charts.map((item) => item.chart)];
  const visible = applyUnderlines(
    lines.filter((line) => !lineHitsGraphic(line, graphicBoxes)),
    draws,
  );
  const extracted = extractAllTables(visible, pageWidth, draws);
  const boxes = [
    ...extracted.rest,
    ...extracted.tables.map((table) => ({ x: table.colXs[0] ?? 0, y: table.top, w: pageWidth * 0.8, h: Math.max(12, table.bottom - table.top) })),
    ...pictures.map((item) => item.pic),
    ...charts.map((item) => item.chart),
  ];
  const marginL = boxes.length
    ? Math.max(28, Math.min(90, Math.min(...boxes.map((box) => box.x))))
    : 56;
  const marginR = boxes.length
    ? Math.max(28, Math.min(90, pageWidth - Math.max(...boxes.map((box) => box.x + box.w))))
    : 56;
  const marginT = boxes.length
    ? Math.max(28, Math.min(90, Math.min(...boxes.map((box) => box.y))))
    : 56;
  const marginB = boxes.length
    ? Math.max(28, Math.min(90, pageHeight - Math.max(...boxes.map((box) => box.y + box.h))))
    : 56;
  const maxPicW = Math.max(40, pageWidth - marginL - marginR);
  const items: Array<{ y: number; h: number; xml?: string; line?: PdfLine }> = [
    ...pictures.map((picture) => ({
      y: picture.pic.y,
      h: picture.pic.h,
      xml: docxInlinePicture(picture.pic, picture.relId, picture.docId, maxPicW),
    })),
    ...charts.map((item) => ({
      y: item.chart.y,
      h: item.chart.h,
      xml: docxInlineChart(item.chart, item.relId, item.docId, maxPicW),
    })),
    ...extracted.tables.map((table) => ({
      y: table.top,
      h: Math.max(12, table.bottom - table.top),
      xml: tableToXml(table, pageWidth),
    })),
    ...extracted.rest.map((line) => ({
      y: line.y,
      h: Math.max(line.h, line.size * 1.2),
      line,
    })),
  ];
  items.sort((a, b) => a.y - b.y);
  let cursor = marginT;
  const parts: string[] = [];
  for (const item of items) {
    const gap = item.y - cursor;
    if (item.line) {
      parts.push(exactPara(item.line, marginL, pageWidth, gap));
    } else if (item.xml) {
      parts.push(setParaBefore(item.xml, Math.max(0, ptTwip(Math.max(0, gap - 2)))));
    }
    cursor = item.y + item.h;
  }
  return {
    xml: parts.join("") || "<w:p/>",
    margins: { t: marginT, r: marginR, b: marginB, l: marginL },
  };
}

function pageSectPr(
  widthPt: number,
  heightPt: number,
  last: boolean,
  margins?: { t: number; r: number; b: number; l: number },
) {
  const t = ptTwip(margins?.t ?? 56);
  const r = ptTwip(margins?.r ?? 56);
  const b = ptTwip(margins?.b ?? 56);
  const l = ptTwip(margins?.l ?? 56);
  const xml = `<w:sectPr>
      ${last ? "" : '<w:type w:val="nextPage"/>'}
      <w:pgSz w:w="${ptTwip(widthPt)}" w:h="${ptTwip(heightPt)}"/>
      <w:pgMar w:top="${t}" w:right="${r}" w:bottom="${b}" w:left="${l}"/>
    </w:sectPr>`;
  return last ? xml : `<w:p><w:pPr>${xml}</w:pPr></w:p>`;
}

function scaleLayout<T extends { x: number; y: number; w: number; h: number }>(item: T, scale: number): T {
  return { ...item, x: item.x * scale, y: item.y * scale, w: item.w * scale, h: item.h * scale };
}

function wordPageScale(width: number, height: number) {
  const max = 1580;
  return Math.min(1, max / Math.max(width, 1), max / Math.max(height, 1));
}

function scaleLine(line: PdfLine, scale: number): PdfLine {
  return {
    x: line.x * scale,
    y: line.y * scale,
    w: line.w * scale,
    h: line.h * scale,
    size: line.size * scale,
    runs: line.runs.map((run) => ({
      ...run,
      x: run.x * scale,
      y: run.y * scale,
      w: run.w * scale,
      size: run.size * scale,
    })),
  };
}

function docxTextRun(run: PdfRun, gap = "") {
  const half = Math.max(14, Math.min(96, Math.round(run.size * 2)));
  const font = run.font || "Arial";
  const gapXml = gap
    ? `<w:r><w:t xml:space="preserve">${escapeXml(gap)}</w:t></w:r>`
    : "";
  return `${gapXml}<w:r>
    <w:rPr>
      <w:rFonts w:ascii="${font}" w:hAnsi="${font}" w:cs="${font}"/>
      <w:sz w:val="${half}"/>
      <w:szCs w:val="${half}"/>
      ${run.bold ? "<w:b/><w:bCs/>" : ""}
      ${run.italic ? "<w:i/><w:iCs/>" : ""}
      ${run.underline ? '<w:u w:val="single"/>' : ""}
      ${run.color ? `<w:color w:val="${run.color}"/>` : ""}
    </w:rPr>
    <w:t xml:space="preserve">${wordSafe(run.text)}</w:t>
  </w:r>`;
}

function lineRunsXml(line: PdfLine) {
  let xml = "";
  let prev: PdfRun | null = null;
  for (const run of line.runs) {
    const gap = prev && run.x - (prev.x + prev.w) > Math.max(1.1, prev.size * 0.22) ? " " : "";
    xml += docxTextRun(run, gap);
    prev = run;
  }
  return xml || `<w:r><w:t xml:space="preserve"> </w:t></w:r>`;
}

function flowingPara(line: PdfLine, originX = 0) {
  const left = Math.max(0, ptTwip(line.x - originX));
  return `<w:p>
    <w:pPr>
      <w:spacing w:after="60" w:line="276" w:lineRule="auto"/>
      ${left > 100 ? `<w:ind w:left="${Math.min(left, 3600)}"/>` : ""}
    </w:pPr>
    ${lineRunsXml(line)}
  </w:p>`;
}

function pageLinesToWordXml(lines: PdfLine[], pageWidth: number) {
  if (!lines.length) return "<w:p/>";
  const mid = pageWidth * 0.44;
  const left = lines.filter((line) => line.x < mid);
  const right = lines.filter((line) => line.x >= mid);
  const twoCol =
    left.length >= 3 &&
    right.length >= 3 &&
    left.length / lines.length >= 0.16 &&
    right.length / lines.length >= 0.16;
  if (!twoCol) return lines.map((line) => flowingPara(line, 0)).join("");
  const leftOrigin = Math.min(...left.map((line) => line.x));
  const rightOrigin = Math.min(...right.map((line) => line.x));
  return `<w:tbl>
    <w:tblPr>
      <w:tblW w:w="5000" w:type="pct"/>
      <w:tblLayout w:type="fixed"/>
      <w:tblBorders>
        <w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/>
        <w:insideH w:val="nil"/><w:insideV w:val="nil"/>
      </w:tblBorders>
    </w:tblPr>
    <w:tblGrid><w:gridCol w:w="3120"/><w:gridCol w:w="6240"/></w:tblGrid>
    <w:tr>
      <w:tc>
        <w:tcPr><w:tcW w:w="3120" w:type="dxa"/><w:vAlign w:val="top"/></w:tcPr>
        ${left.map((line) => flowingPara(line, leftOrigin)).join("")}
      </w:tc>
      <w:tc>
        <w:tcPr><w:tcW w:w="6240" w:type="dxa"/><w:vAlign w:val="top"/></w:tcPr>
        ${right.map((line) => flowingPara(line, rightOrigin)).join("")}
      </w:tc>
    </w:tr>
  </w:tbl>`;
}

function docxPicture(pic: PdfPic, relId: string, docId: number, behind: boolean) {
  const cx = ptEmu(pic.w);
  const cy = ptEmu(pic.h);
  const ox = ptEmu(pic.x);
  const oy = ptEmu(Math.max(0, pic.y));
  return `<w:p>
    <w:r>
      <w:drawing>
        <wp:anchor distT="0" distB="0" distL="0" distR="0" simplePos="0" relativeHeight="${behind ? 1 : 251658240}" behindDoc="${behind ? 1 : 0}" locked="0" layoutInCell="1" allowOverlap="1">
          <wp:simplePos x="0" y="0"/>
          <wp:positionH relativeFrom="page"><wp:posOffset>${ox}</wp:posOffset></wp:positionH>
          <wp:positionV relativeFrom="page"><wp:posOffset>${oy}</wp:posOffset></wp:positionV>
          <wp:extent cx="${cx}" cy="${cy}"/>
          <wp:effectExtent l="0" t="0" r="0" b="0"/>
          <wp:wrapNone/>
          <wp:docPr id="${docId}" name="Picture ${docId}"/>
          <wp:cNvGraphicFramePr/>
          <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
            <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
              <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                <pic:nvPicPr>
                  <pic:cNvPr id="${docId}" name="image${docId}.png"/>
                  <pic:cNvPicPr/>
                </pic:nvPicPr>
                <pic:blipFill>
                  <a:blip r:embed="${relId}"/>
                  <a:stretch><a:fillRect/></a:stretch>
                </pic:blipFill>
                <pic:spPr>
                  <a:xfrm>
                    <a:off x="0" y="0"/>
                    <a:ext cx="${cx}" cy="${cy}"/>
                  </a:xfrm>
                  <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
                </pic:spPr>
              </pic:pic>
            </a:graphicData>
          </a:graphic>
        </wp:anchor>
      </w:drawing>
    </w:r>
  </w:p>`;
}

function docxInlinePicture(pic: PdfPic, relId: string, docId: number, maxWidth = 0) {
  let width = Math.max(12, pic.w);
  let height = Math.max(12, pic.h);
  if (maxWidth > 40 && width > maxWidth) {
    height *= maxWidth / width;
    width = maxWidth;
  }
  const cx = ptEmu(width);
  const cy = ptEmu(height);
  return `<w:p>
    <w:pPr>
      <w:spacing w:before="80" w:after="80"/>
    </w:pPr>
    <w:r>
      <w:drawing>
        <wp:inline distT="0" distB="0" distL="0" distR="0">
          <wp:extent cx="${cx}" cy="${cy}"/>
          <wp:effectExtent l="0" t="0" r="0" b="0"/>
          <wp:docPr id="${docId}" name="Picture ${docId}"/>
          <wp:cNvGraphicFramePr>
            <a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/>
          </wp:cNvGraphicFramePr>
          <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
            <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
              <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                <pic:nvPicPr>
                  <pic:cNvPr id="0" name="image${docId}.png"/>
                  <pic:cNvPicPr>
                    <a:picLocks noChangeAspect="1"/>
                  </pic:cNvPicPr>
                </pic:nvPicPr>
                <pic:blipFill>
                  <a:blip r:embed="${relId}"/>
                  <a:stretch><a:fillRect/></a:stretch>
                </pic:blipFill>
                <pic:spPr>
                  <a:xfrm>
                    <a:off x="0" y="0"/>
                    <a:ext cx="${cx}" cy="${cy}"/>
                  </a:xfrm>
                  <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
                </pic:spPr>
              </pic:pic>
            </a:graphicData>
          </a:graphic>
        </wp:inline>
      </w:drawing>
    </w:r>
  </w:p>`;
}

function wordSafe(value: string) {
  return escapeXml(value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, ""));
}

function isReadableText(value: string) {
  const words = value.match(/[A-Za-z]{2,}/g) ?? [];
  const letters = (value.match(/[A-Za-z]/g) ?? []).length;
  return words.length >= 3 || letters >= 24;
}

function itemStrings(items: Array<{ str?: string; hasEOL?: boolean }>) {
  const lines: string[] = [];
  let current = "";
  for (const item of items) {
    const piece = typeof item.str === "string" ? item.str : "";
    current += piece;
    if (item.hasEOL || piece.endsWith("\n")) {
      const line = current.replace(/\s+/g, " ").trim();
      if (line) lines.push(line);
      current = "";
    }
  }
  const tail = current.replace(/\s+/g, " ").trim();
  if (tail) lines.push(tail);
  return lines;
}

function simpleParagraphs(lines: string[]) {
  return lines
    .map((line) => line.trim())
    .filter(Boolean)
    .map(
      (line) =>
        `<w:p>
          <w:pPr><w:spacing w:after="80" w:line="276" w:lineRule="auto"/></w:pPr>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
              <w:sz w:val="22"/>
              <w:szCs w:val="22"/>
            </w:rPr>
            <w:t xml:space="preserve">${wordSafe(line)}</w:t>
          </w:r>
        </w:p>`,
    )
    .join("");
}

function letterSectPr(last: boolean) {
  const xml = `<w:sectPr>
      ${last ? "" : '<w:type w:val="nextPage"/>'}
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="720" w:right="720" w:bottom="720" w:left="720"/>
    </w:sectPr>`;
  return last ? xml : `<w:p><w:pPr>${xml}</w:pPr></w:p>`;
}

type TessApi = {
  createWorker?: (
    lang: string,
    oem?: number,
    opts?: Record<string, string>,
  ) => Promise<TessWorker>;
  recognize?: (
    image: HTMLCanvasElement,
    lang: string,
  ) => Promise<{ data: { text: string } }>;
};

type TessWorker = {
  recognize: (image: HTMLCanvasElement) => Promise<{
    data: {
      text: string;
      lines?: Array<{
        text?: string;
        bbox: { x0: number; y0: number; x1: number; y1: number };
      }>;
    };
  }>;
};

async function loadScript(src: string) {
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load the text reader."));
    document.head.appendChild(script);
  });
}

async function getOcrWorker(): Promise<TessWorker | null> {
  const w = window as unknown as { Tesseract?: TessApi; __stxOcrWorker?: TessWorker };
  if (w.__stxOcrWorker) return w.__stxOcrWorker;
  const sources = [
    "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js",
    "https://unpkg.com/tesseract.js@5.1.1/dist/tesseract.min.js",
  ];
  if (!w.Tesseract) {
    let loaded = false;
    for (const src of sources) {
      try {
        await loadScript(src);
        loaded = true;
        break;
      } catch {
        continue;
      }
    }
    if (!loaded || !w.Tesseract) return null;
  }
  const api = w.Tesseract;
  const corePaths = [
    "https://cdn.jsdelivr.net/npm/tesseract.js-core@5.1.1/tesseract-core-simd.wasm.js",
    "https://cdn.jsdelivr.net/npm/tesseract.js-core@5.1.1/tesseract-core.wasm.js",
  ];
  if (api.createWorker) {
    for (const corePath of corePaths) {
      try {
        const worker = await api.createWorker("eng", 1, {
          workerPath: "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/worker.min.js",
          corePath,
          langPath: "https://tessdata.projectnaptha.com/4.0.0",
        });
        w.__stxOcrWorker = worker;
        return worker;
      } catch {
        continue;
      }
    }
  }
  if (api.recognize) {
    const fallback: TessWorker = {
      recognize: (image) => api.recognize!(image, "eng"),
    };
    w.__stxOcrWorker = fallback;
    return fallback;
  }
  return null;
}

async function renderPdfPageCanvas(
  page: {
    getViewport: (opts: { scale: number }) => { width: number; height: number };
    render: (opts: {
      canvasContext: CanvasRenderingContext2D;
      viewport: { width: number; height: number };
    }) => { promise: Promise<void> };
  },
  scale: number,
) {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(viewport.width));
  canvas.height = Math.max(1, Math.floor(viewport.height));
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvas;
}

async function ocrPdfLines(page: {
  getViewport: (opts: { scale: number }) => { width: number; height: number };
  render: (opts: {
    canvasContext: CanvasRenderingContext2D;
    viewport: { width: number; height: number };
  }) => { promise: Promise<void> };
}): Promise<PdfLine[]> {
  const worker = await getOcrWorker();
  if (!worker) return [];
  const base = page.getViewport({ scale: 1 });
  const scale = Math.min(2, 1400 / Math.max(1, base.width));
  const canvas = await renderPdfPageCanvas(page, scale);
  if (!canvas) return [];
  const band = Math.min(canvas.height, Math.max(1000, Math.round(canvas.width * 1.29)));
  const overlap = 40;
  const lines: PdfLine[] = [];
  for (let y = 0; y < canvas.height; y += Math.max(1, band - overlap)) {
    const height = Math.min(band, canvas.height - y);
    const slice = document.createElement("canvas");
    slice.width = canvas.width;
    slice.height = height;
    const ctx = slice.getContext("2d");
    if (!ctx) break;
    ctx.drawImage(canvas, 0, y, canvas.width, height, 0, 0, canvas.width, height);
    try {
      const result = await worker.recognize(slice);
      const ocrLines = result.data.lines;
      if (ocrLines?.length) {
        for (const line of ocrLines) {
          const text = (line.text || "").replace(/\s+/g, " ").trim();
          if (!text) continue;
          const boxH = Math.max(8, line.bbox.y1 - line.bbox.y0);
          const boxW = Math.max(12, line.bbox.x1 - line.bbox.x0);
          const size = boxH / scale * 0.78;
          const lx = line.bbox.x0 / scale;
          const ly = (line.bbox.y0 + y) / scale;
          const lw = boxW / scale;
          const lh = boxH / scale;
          lines.push({
            x: lx,
            y: ly,
            w: lw,
            h: lh,
            size,
            runs: [{ text, x: lx, y: ly, w: lw, size, bold: false, italic: false }],
          });
        }
      } else {
        const text = (result.data.text || "").trim();
        if (text) {
          text.split(/\r?\n/).forEach((row, index) => {
            const clean = row.trim();
            if (!clean) return;
            const ly = (y + index * 16) / scale;
            lines.push({
              x: 36,
              y: ly,
              w: base.width - 72,
              h: 14,
              size: 11,
              runs: [{ text: clean, x: 36, y: ly, w: base.width - 72, size: 11, bold: false, italic: false }],
            });
          });
        }
      }
    } catch {
      break;
    }
    if (y + height >= canvas.height) break;
  }
  return lines;
}

function docxSnapshotPage(
  relId: string,
  docId: number,
  pageW: number,
  pageH: number,
  last: boolean,
) {
  const cx = ptEmu(pageW);
  const cy = ptEmu(pageH);
  const sect = `<w:sectPr>
      ${last ? "" : '<w:type w:val="nextPage"/>'}
      <w:pgSz w:w="${ptTwip(pageW)}" w:h="${ptTwip(pageH)}"/>
      <w:pgMar w:top="0" w:right="0" w:bottom="0" w:left="0" w:header="0" w:footer="0" w:gutter="0"/>
    </w:sectPr>`;
  return `<w:p>
    <w:pPr>
      <w:spacing w:before="0" w:after="0" w:line="0" w:lineRule="auto"/>
      <w:ind w:left="0" w:right="0"/>
      ${sect}
    </w:pPr>
    <w:r>
      <w:drawing>
        <wp:anchor distT="0" distB="0" distL="0" distR="0" simplePos="0" relativeHeight="${251658240 + docId}" behindDoc="0" locked="0" layoutInCell="1" allowOverlap="1">
          <wp:simplePos x="0" y="0"/>
          <wp:positionH relativeFrom="page"><wp:posOffset>0</wp:posOffset></wp:positionH>
          <wp:positionV relativeFrom="page"><wp:posOffset>0</wp:posOffset></wp:positionV>
          <wp:extent cx="${cx}" cy="${cy}"/>
          <wp:effectExtent l="0" t="0" r="0" b="0"/>
          <wp:wrapNone/>
          <wp:docPr id="${docId}" name="Page ${docId}" descr="stx-page:${pageW.toFixed(2)}x${pageH.toFixed(2)}"/>
          <wp:cNvGraphicFramePr>
            <a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/>
          </wp:cNvGraphicFramePr>
          <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
            <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
              <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                <pic:nvPicPr>
                  <pic:cNvPr id="${docId}" name="page${docId}.png" descr="stx-page:${pageW.toFixed(2)}x${pageH.toFixed(2)}"/>
                  <pic:cNvPicPr>
                    <a:picLocks noChangeAspect="1"/>
                  </pic:cNvPicPr>
                </pic:nvPicPr>
                <pic:blipFill>
                  <a:blip r:embed="${relId}"/>
                  <a:stretch><a:fillRect/></a:stretch>
                </pic:blipFill>
                <pic:spPr>
                  <a:xfrm>
                    <a:off x="0" y="0"/>
                    <a:ext cx="${cx}" cy="${cy}"/>
                  </a:xfrm>
                  <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
                </pic:spPr>
              </pic:pic>
            </a:graphicData>
          </a:graphic>
        </wp:anchor>
      </w:drawing>
    </w:r>
  </w:p>`;
}

async function wordSnapshotToPdf(file: File): Promise<ConvertedFile | null> {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const docXml = await zipEntry(zip, "word/document.xml")?.async("string");
  if (!docXml || !docXml.includes("stx-page:")) return null;
  const rels = parseRels(await zipEntry(zip, "word/_rels/document.xml.rels")?.async("string"), "word/");
  const pdf = await PDFDocument.create();
  let pages = 0;
  for (const drawing of docXml.match(/<w:drawing\b[\s\S]*?<\/w:drawing>/g) ?? []) {
    const size = drawing.match(/stx-page:([0-9.]+)x([0-9.]+)/);
    const embed = drawing.match(/r:embed="([^"]+)"/);
    if (!size || !embed) continue;
    const target = rels.get(embed[1]);
    if (!target) continue;
    const bytes = await zipEntry(zip, target)?.async("uint8array");
    if (!bytes) continue;
    const kind = magicKind(bytes);
    const image = kind === "jpg" ? await pdf.embedJpg(bytes) : await pdf.embedPng(bytes);
    const pageW = Number(size[1]);
    const pageH = Number(size[2]);
    const page = pdf.addPage([pageW, pageH]);
    page.drawImage(image, { x: 0, y: 0, width: pageW, height: pageH });
    pages += 1;
  }
  if (!pages) return null;
  return { blob: pdfBlob(await pdf.save()), name: `${baseName(file)}.pdf` };
}

async function capturePagesToPdf(elements: HTMLElement[], name: string): Promise<ConvertedFile> {
  const pdf = await PDFDocument.create();
  const scale = 2;
  for (const element of elements) {
    const canvas = await captureElement(element);
    if (canvas.width < 4 || canvas.height < 4) continue;
    const png = await canvasToBytes(canvas, "image/png");
    const image = await pdf.embedPng(png);
    const cssW = element.offsetWidth || canvas.width / scale;
    const cssH = element.offsetHeight || canvas.height / scale;
    const pageW = Math.max(72, cssW * 0.75);
    const pageH = Math.max(72, cssH * 0.75);
    const page = pdf.addPage([pageW, pageH]);
    page.drawImage(image, { x: 0, y: 0, width: pageW, height: pageH });
  }
  if (pdf.getPageCount() === 0) throw new Error("This file looks empty.");
  return { blob: pdfBlob(await pdf.save()), name };
}

function packDocx(
  bodyXml: string,
  media: Array<{ relId: string; file: string; bytes: Uint8Array }> = [],
  charts: Array<{ relId: string; name: string; xml: string; xlsx: Uint8Array }> = [],
) {
  const zip = new JSZip();
  const imageRels = media
    .map(
      (item) =>
        `<Relationship Id="${item.relId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${item.file}"/>`,
    )
    .join("");
  const chartRels = charts
    .map(
      (item) =>
        `<Relationship Id="${item.relId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart" Target="charts/${item.name}.xml"/>`,
    )
    .join("");
  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Default Extension="xlsx" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>
  ${charts.map((item) => `<Override PartName="/word/charts/${item.name}.xml" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/>`).join("")}
</Types>`,
  );
  zip.file(
    "_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`,
  );
  zip.file(
    "word/_rels/document.xml.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/>
  ${imageRels}
  ${chartRels}
</Relationships>`,
  );
  zip.file(
    "word/styles.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:qFormat/>
    <w:rPr>
      <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
      <w:sz w:val="22"/>
      <w:szCs w:val="22"/>
    </w:rPr>
  </w:style>
</w:styles>`,
  );
  zip.file(
    "word/settings.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:displayBackgroundShape/>
  <w:compat>
    <w:compatSetting w:name="compatibilityMode" w:uri="http://schemas.microsoft.com/office/word" w:val="15"/>
  </w:compat>
</w:settings>`,
  );
  zip.file(
    "word/document.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:w10="urn:schemas-microsoft-com:office:word" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup" xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk" xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml" xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape" mc:Ignorable="w14 wp14">
  <w:body>
    ${bodyXml}
  </w:body>
</w:document>`,
  );
  media.forEach((item) => {
    zip.file(`word/media/${item.file}`, item.bytes);
  });
  charts.forEach((item) => {
    zip.file(`word/charts/${item.name}.xml`, item.xml);
    zip.file(
      `word/charts/_rels/${item.name}.xml.rels`,
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/package" Target="../embeddings/${item.name}.xlsx"/>
</Relationships>`,
    );
    zip.file(`word/embeddings/${item.name}.xlsx`, item.xlsx);
  });
  return zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    compression: "DEFLATE",
  });
}

export async function pdfToDocx(file: File): Promise<ConvertedFile> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const data = new Uint8Array(bytes.byteLength);
  data.set(bytes);
  const pdfjs = await loadPdfjs();
  const [doc, libDoc] = await Promise.all([
    pdfjs.getDocument({
      data,
      cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/",
      cMapPacked: true,
      standardFontDataUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/standard_fonts/",
    }).promise,
    PDFDocument.load(bytes, { ignoreEncryption: true }),
  ]);
  const body: string[] = [];
  const media: Array<{ relId: string; file: string; bytes: Uint8Array }> = [];
  let drawingId = 1;
  let imageIndex = 1;

  for (let i = 1; i <= doc.numPages; i += 1) {
    const page = await doc.getPage(i);
    const libPage = libDoc.getPages()[i - 1];
    const viewport = page.getViewport({ scale: 1 });
    const scale = wordPageScale(viewport.width, viewport.height);
    const pageW = viewport.width * scale;
    const pageH = viewport.height * scale;
    const contentText = libPage ? pdfPageContent(libPage) : "";
    const content = await page.getTextContent({
      normalizeWhitespace: true,
      disableCombineTextItems: true,
    });
    const extractedLinesUnscaled = buildPdfLines(collectPdfRuns(content.items, viewport.height));
    const extractedLines = extractedLinesUnscaled.map((line) => scaleLine(line, scale));
    const fromOps = await extractPdfFills(page, viewport.width, viewport.height);
    const fromContent = parsePdfGraphics(contentText, viewport.width, viewport.height);
    const fills = uniqueLayout([...fromOps.fills, ...fromContent.fills]);
    const draws = uniqueLayout([...fromOps.draws, ...fromContent.draws]);
    const rawPictures = (await extractPdfPictures(page, viewport.width, viewport.height, contentText)).filter(
      (pic) => !isFullPageArt(pic, viewport.width, viewport.height),
    );
    const canvas = await renderPdfPageCanvas(page, 2);
    const extraPics = await graphicsFromDraws(
      draws,
      fills,
      canvas,
      viewport.width,
      viewport.height,
      rawPictures,
      extractedLinesUnscaled,
    );
    const pictures = [...rawPictures, ...extraPics].map((pic) => scaleLayout(pic, scale));
    const scaledDraws = draws.map((draw) => scaleLayout(draw, scale));
    const placedPics: PlacedPic[] = [];
    for (const pic of pictures) {
      const relId = `rIdImg${imageIndex}`;
      media.push({ relId, file: `image${imageIndex}.png`, bytes: pic.bytes });
      placedPics.push({ pic, relId, docId: drawingId });
      imageIndex += 1;
      drawingId += 1;
    }

    let lines = extractedLines;
    const extractedText = extractedLines.map((line) => line.runs.map((run) => run.text).join("")).join("\n");
    if (!extractedText.replace(/\s+/g, "").length) {
      const ocrLines = (await ocrPdfLines(page)).map((line) => scaleLine(line, scale));
      if (ocrLines.length) lines = ocrLines;
    }

    const laid = layoutExactFlowXml(lines, placedPics, [], scaledDraws, pageW, pageH);
    body.push(laid.xml || "<w:p/>");
    body.push(pageSectPr(pageW, pageH, i === doc.numPages, laid.margins));
  }

  return {
    blob: await packDocx(body.join("") || "<w:p/>", media),
    name: `${baseName(file)}.docx`,
  };
}

async function wordToPdfWithMammoth(file: File): Promise<ConvertedFile> {
  const mammoth = await import("mammoth");
  const { value } = await mammoth.convertToHtml(
    { arrayBuffer: await file.arrayBuffer() },
    { convertImage: mammoth.images.dataUri },
  );
  const html = `<style>
    p{margin:0 0 8px}
    img{max-width:100%;height:auto}
    table{border-collapse:collapse;width:100%;margin:8px 0}
    td,th{border:1px solid #c8c8c8;padding:6px 8px;vertical-align:top}
    h1{font-size:26px;margin:0 0 12px}
    h2{font-size:20px;margin:16px 0 8px}
    h3{font-size:16px;margin:14px 0 6px}
    ul,ol{margin:0 0 8px 22px}
  </style>${value || "<p></p>"}`;
  return htmlToPdf(html, `${baseName(file)}.pdf`);
}

export async function wordToPdf(file: File): Promise<ConvertedFile> {
  if (!/\.docx$/i.test(file.name)) {
    throw new Error("Use a .docx Word file (not the older .doc format).");
  }
  const snapshot = await wordSnapshotToPdf(file);
  if (snapshot) return snapshot;
  const host = document.createElement("div");
  host.style.cssText =
    "position:fixed;left:-18000px;top:0;background:#ffffff;z-index:-1;";
  document.body.appendChild(host);
  try {
    const { renderAsync } = await import("docx-preview");
    await renderAsync(await file.arrayBuffer(), host, host, {
      className: "stxdoc",
      inWrapper: true,
      breakPages: true,
      ignoreWidth: false,
      ignoreHeight: false,
      ignoreFonts: false,
      ignoreLastRenderedPageBreak: false,
      renderHeaders: true,
      renderFooters: true,
      renderFootnotes: true,
      useBase64URL: true,
    });
    await nextPaint();
    const pages = [...host.querySelectorAll<HTMLElement>("section.stxdoc")];
    if (!pages.length) throw new Error("empty");
    pages.forEach((page) => {
      page.style.boxShadow = "none";
      page.style.margin = "0";
      prepareWordPrint(page);
    });
    return await capturePagesToPdf(pages, `${baseName(file)}.pdf`);
  } catch (error) {
    try {
      return await wordToPdfWithMammoth(file);
    } catch {
      throw error;
    }
  } finally {
    host.remove();
  }
}

function colIndex(ref: string) {
  const letters = ref.match(/^[A-Z]+/i)?.[0] ?? "A";
  let n = 0;
  for (const ch of letters.toUpperCase()) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

async function sheetRows(zip: JSZip, sheetPath: string, strings: string[]) {
  const sheet = await zipEntry(zip, sheetPath)?.async("string");
  if (!sheet) return [];
  const rows: string[][] = [];
  for (const rowXml of sheet.match(/<row\b[\s\S]*?<\/row>/g) ?? []) {
    const cells: string[] = [];
    for (const cell of rowXml.match(/<c\b[\s\S]*?<\/c>/g) ?? []) {
      const ref = cell.match(/\br="([A-Z]+\d+)"/i)?.[1] ?? "";
      const index = colIndex(ref);
      const isShared = /\bt="s"/.test(cell);
      const inline = /\bt="inlineStr"/.test(cell);
      const raw = inline
        ? xmlTags(cell, "t").join("")
        : xmlTags(cell, "v")[0] ?? "";
      const value = isShared ? (strings[Number(raw)] ?? "") : raw;
      while (cells.length < index) cells.push("");
      cells[index] = value;
    }
    rows.push(cells);
  }
  return rows;
}

function tableHtml(rows: string[][]) {
  if (!rows.length) return "<p>(empty sheet)</p>";
  const width = Math.max(...rows.map((row) => row.length), 1);
  const body = rows
    .map((row) => {
      const cells = Array.from({ length: width }, (_, i) => row[i] ?? "");
      return `<tr>${cells.map((cell) => `<td>${escapeXml(cell)}</td>`).join("")}</tr>`;
    })
    .join("");
  return `<table>${body}</table>`;
}

function parseRels(xml: string | undefined, baseDir: string) {
  const map = new Map<string, string>();
  for (const rel of xml?.match(/<Relationship\b[^>]*>/g) ?? []) {
    const id = rel.match(/\bId="([^"]+)"/)?.[1];
    const target = rel.match(/\bTarget="([^"]+)"/)?.[1];
    if (!id || !target) continue;
    const cleaned = target.replace(/\\/g, "/");
    const path = cleaned.startsWith("/")
      ? cleaned.slice(1)
      : cleaned.startsWith("../")
        ? cleaned.replace(/^(?:\.\.\/)+/, (dots) => {
            const depth = dots.length / 3;
            const parts = baseDir.split("/").filter(Boolean);
            return [...parts.slice(0, Math.max(0, parts.length - depth)), ""].join("/");
          })
        : `${baseDir}${cleaned}`;
    map.set(id, path.replace(/\/{2,}/g, "/"));
  }
  return map;
}

export async function excelToPdf(file: File): Promise<ConvertedFile> {
  const style = `<style>
    h2{font-size:16px;margin:0 0 10px}
    table{border-collapse:collapse;width:100%;font-size:12px}
    td,th{border:1px solid #c5c5c5;padding:5px 8px;white-space:pre-wrap}
    .sheet{margin:0 0 28px}
  </style>`;

  if (/\.csv$/i.test(file.name) || file.type.includes("csv")) {
    const text = await file.text();
    const rows = text.split(/\r?\n/).map((line) =>
      line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map((cell) => cell.replace(/^"|"$/g, "")),
    );
    return htmlToPdf(`${style}${tableHtml(rows)}`, `${baseName(file)}.pdf`, 1100);
  }
  if (!/\.xlsx$/i.test(file.name)) {
    throw new Error("Use a .xlsx or .csv spreadsheet.");
  }

  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const shared = await zip.file("xl/sharedStrings.xml")?.async("string");
  const strings =
    shared
      ?.match(/<si>([\s\S]*?)<\/si>/g)
      ?.map((block) => xmlTags(block, "t").join("")) ?? [];
  const workbook = await zip.file("xl/workbook.xml")?.async("string");
  const rels = parseRels(await zip.file("xl/_rels/workbook.xml.rels")?.async("string"), "xl/");
  const listed = [...(workbook?.matchAll(/<sheet\b[^>]*>/g) ?? [])].map((match) => {
    const tag = match[0];
    const name = tag.match(/\bname="([^"]+)"/)?.[1] ?? "Sheet";
    const rid = tag.match(/\br:id="([^"]+)"/)?.[1] ?? "";
    const path = rels.get(rid) ?? "";
    return { name, path };
  }).filter((sheet) => sheet.path);
  const sheets = listed.length
    ? listed
    : Object.keys(zip.files)
        .filter((name) => /^xl\/worksheets\/sheet\d+\.xml$/.test(name))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
        .map((path, index) => ({ name: `Sheet ${index + 1}`, path }));
  if (!sheets.length) throw new Error("This spreadsheet could not be read.");

  const parts: string[] = [];
  for (const sheet of sheets) {
    const rows = await sheetRows(zip, sheet.path, strings);
    parts.push(`<div class="sheet"><h2>${escapeXml(sheet.name)}</h2>${tableHtml(rows)}</div>`);
  }
  return htmlToPdf(`${style}${parts.join("")}`, `${baseName(file)}.pdf`, 1100);
}

function zipEntry(zip: JSZip, path: string) {
  return (
    zip.file(path) ??
    zip.file(Object.keys(zip.files).find((name) => name.toLowerCase() === path.toLowerCase()) ?? "")
  );
}

async function zipFileDataUrl(zip: JSZip, path: string) {
  const file = zipEntry(zip, path);
  if (!file) return "";
  const bytes = new Uint8Array(await file.async("uint8array"));
  const mime = /\.png$/i.test(path)
    ? "image/png"
    : /\.jpe?g$/i.test(path)
      ? "image/jpeg"
      : /\.gif$/i.test(path)
        ? "image/gif"
        : "application/octet-stream";
  return `data:${mime};base64,${bytesToBase64(bytes)}`;
}

function emuPx(value: string | undefined) {
  return Number(value || 0) / 9525;
}

function xfrmBox(xml: string) {
  const block = xml.match(/<a:xfrm\b[\s\S]*?<\/a:xfrm>/)?.[0] ?? "";
  const off = block.match(/<a:off\b[^>]*>/)?.[0] ?? "";
  const ext = block.match(/<a:ext\b[^>]*>/)?.[0] ?? "";
  return {
    x: emuPx(off.match(/\bx="(-?\d+)"/)?.[1]),
    y: emuPx(off.match(/\by="(-?\d+)"/)?.[1]),
    w: emuPx(ext.match(/\bcx="(-?\d+)"/)?.[1]),
    h: emuPx(ext.match(/\bcy="(-?\d+)"/)?.[1]),
  };
}

function srgb(xml: string) {
  const val = xml.match(/<a:srgbClr\b[^>]*\bval="([A-Fa-f0-9]{6})"/)?.[1];
  return val ? `#${val}` : "";
}

async function pptLayoutBoxes(zip: JSZip, rels: Map<string, string>) {
  const layoutPath = [...rels.values()].find((path) => /slideLayout\d+\.xml$/i.test(path));
  const boxes = new Map<string, { x: number; y: number; w: number; h: number }>();
  if (!layoutPath) return boxes;
  const xml = await zipEntry(zip, layoutPath)?.async("string");
  if (!xml) return boxes;
  for (const shape of xml.match(/<p:sp\b[\s\S]*?<\/p:sp>/g) ?? []) {
    const ph = shape.match(/<p:ph\b[^>]*>/)?.[0] ?? "";
    const type = ph.match(/\btype="([^"]+)"/)?.[1] ?? "body";
    const idx = ph.match(/\bidx="([^"]+)"/)?.[1] ?? "0";
    const box = xfrmBox(shape);
    if (box.w <= 0 || box.h <= 0) continue;
    boxes.set(`${type}:${idx}`, box);
    boxes.set(`type:${type}`, box);
    boxes.set(`idx:${idx}`, box);
  }
  return boxes;
}

async function pptSlideHtml(zip: JSZip, path: string, slideW: number, slideH: number) {
  const xml = await zip.file(path)?.async("string");
  if (!xml) return "";
  const rels = parseRels(
    await zip.file(path.replace("ppt/slides/", "ppt/slides/_rels/") + ".rels")?.async("string"),
    "ppt/slides/",
  );
  const layouts = await pptLayoutBoxes(zip, rels);
  const bg = srgb(xml.match(/<p:bg\b[\s\S]*?<\/p:bg>/)?.[0] ?? "") || "#ffffff";
  const layers: string[] = [];

  const addBox = (box: { x: number; y: number; w: number; h: number }, inner: string, extra = "") => {
    if (box.w <= 0 || box.h <= 0) return;
    layers.push(
      `<div style="position:absolute;left:${box.x}px;top:${box.y}px;width:${box.w}px;height:${box.h}px;overflow:hidden;${extra}">${inner}</div>`,
    );
  };

  for (const pic of xml.match(/<p:pic\b[\s\S]*?<\/p:pic>/g) ?? []) {
    const rid = pic.match(/r:embed="([^"]+)"/)?.[1];
    const target = rid ? rels.get(rid) : "";
    if (!target || !/\.(png|jpe?g|gif|webp)$/i.test(target)) continue;
    const url = await zipFileDataUrl(zip, target);
    if (!url) continue;
    addBox(xfrmBox(pic), `<img src="${url}" style="width:100%;height:100%;object-fit:fill;display:block"/>`);
  }

  for (const shape of xml.match(/<p:sp\b[\s\S]*?<\/p:sp>/g) ?? []) {
    const ph = shape.match(/<p:ph\b[^>]*>/)?.[0] ?? "";
    const type = ph.match(/\btype="([^"]+)"/)?.[1] ?? "";
    const idx = ph.match(/\bidx="([^"]+)"/)?.[1] ?? "";
    let box = xfrmBox(shape);
    if (box.w <= 0 || box.h <= 0) {
      box =
        layouts.get(`${type}:${idx}`) ??
        layouts.get(`type:${type}`) ??
        layouts.get(`idx:${idx}`) ??
        { x: 48, y: 48, w: slideW - 96, h: 80 };
    }
    const fillXml = shape.match(/<p:spPr\b[\s\S]*?<\/p:spPr>/)?.[0] ?? "";
    const fill = srgb(fillXml.match(/<a:solidFill>[\s\S]*?<\/a:solidFill>/)?.[0] ?? "");
    const sz = shape.match(/\ba:sz="(\d+)"/)?.[1];
    const color = srgb(shape.match(/<a:rPr\b[\s\S]*?<\/a:rPr>/)?.[0] ?? shape) || "#111111";
    const bold = /<a:rPr\b[^>]*\bb="1"/.test(shape) || /<a:b\/>/.test(shape);
    const align = shape.match(/\balgn="(ctr|r|just)"/)?.[1];
    const textAlign = align === "ctr" ? "center" : align === "r" ? "right" : "left";
    const texts = xmlTags(shape, "a:t");
    const inner = texts
      .map(
        (text) =>
          `<div style="font-size:${sz ? Number(sz) / 100 : 18}pt;color:${color};font-weight:${bold ? 700 : 400};text-align:${textAlign};line-height:1.25">${escapeXml(text)}</div>`,
      )
      .join("");
    if (!inner && !fill) continue;
    addBox(box, inner, fill ? `background:${fill}` : "");
  }

  return `<div data-stx-slide="1" style="position:relative;width:${slideW}px;height:${slideH}px;background:${bg};overflow:hidden">${layers.join("")}</div>`;
}

export async function pptToPdf(file: File): Promise<ConvertedFile> {
  if (!/\.pptx$/i.test(file.name)) {
    throw new Error("Use a .pptx slide deck.");
  }
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const presentation = await zip.file("ppt/presentation.xml")?.async("string");
  const size = presentation?.match(/<p:sldSz\b[^>]*>/)?.[0] ?? "";
  const slideW = Math.max(320, emuPx(size.match(/\bcx="(\d+)"/)?.[1]) || 960);
  const slideH = Math.max(180, emuPx(size.match(/\bcy="(\d+)"/)?.[1]) || 540);
  const slides = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (!slides.length) throw new Error("This slide deck could not be read.");

  const host = document.createElement("div");
  host.style.cssText = "position:fixed;left:-18000px;top:0;background:#fff;";
  host.innerHTML = (await Promise.all(slides.map((path) => pptSlideHtml(zip, path, slideW, slideH)))).join("");
  document.body.appendChild(host);
  try {
    const nodes = [...host.querySelectorAll<HTMLElement>("[data-stx-slide]")];
    return await elementsToPdf(nodes, `${baseName(file)}.pdf`, "page");
  } finally {
    host.remove();
  }
}
