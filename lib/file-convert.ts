import {
  PDFArray,
  PDFDict,
  PDFDocument,
  PDFFont,
  PDFName,
  PDFPage,
  PDFRawStream,
  PDFStream,
  PDFString,
  StandardFonts,
  decodePDFRawStream,
  rgb,
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
          intent?: string;
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

function waitForImages(root: HTMLElement, timeoutMs?: number) {
  const pending = Promise.all(
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
  if (timeoutMs == null) return pending;
  return Promise.race([
    pending,
    new Promise<void>((resolve) => {
      window.setTimeout(resolve, timeoutMs);
    }),
  ]);
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
  const skipWordPrep = extra.skipWordPrep === true;
  const imageTimeout = typeof extra.imageTimeout === "number" ? extra.imageTimeout : undefined;
  const rest = { ...extra };
  delete rest.skipWordPrep;
  delete rest.imageTimeout;
  await waitForImages(element, imageTimeout);
  const options = {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: false,
    ...rest,
    ...(imageTimeout != null ? { imageTimeout } : {}),
    ignoreElements: ignoreUnsafePaint,
    onclone(_doc: Document, clone: HTMLElement) {
      if (!skipWordPrep) prepareWordPrint(clone ?? _doc.body);
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
    const fit = Math.min(pageW / image.width, pageH / image.height);
    const boost = kind === "jpg" ? (11 + 3) / 11 : 1;
    const w = image.width * fit * boost;
    const h = image.height * fit * boost;
    const page = pdf.addPage([Math.max(pageW, w), Math.max(pageH, h)]);
    const pw = page.getWidth();
    const ph = page.getHeight();
    page.drawImage(image, {
      x: (pw - w) / 2,
      y: (ph - h) / 2,
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

function pdfPageImageScale(widthPt: number, heightPt: number, minScale = 7.5) {
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  const wanted = Math.max(minScale, (96 / 72) * dpr * 3);
  const cap = 8192 / Math.max(widthPt, heightPt, 1);
  return Math.max(1, Math.min(wanted, cap));
}

function stampJpegDpi(bytes: Uint8Array, dpi: number): Uint8Array {
  if (bytes.length < 20 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return bytes;
  const unit = Math.max(1, Math.min(65535, Math.round(dpi)));
  let i = 2;
  while (i + 18 < bytes.length && bytes[i] === 0xff) {
    const marker = bytes[i + 1];
    if (marker === 0xda || marker === 0xd9) break;
    const length = (bytes[i + 2] << 8) | bytes[i + 3];
    if (marker === 0xe0 && bytes[i + 4] === 0x4a && bytes[i + 5] === 0x46 && bytes[i + 6] === 0x49 && bytes[i + 7] === 0x46) {
      const out = new Uint8Array(bytes);
      out[i + 11] = 1;
      out[i + 12] = (unit >> 8) & 0xff;
      out[i + 13] = unit & 0xff;
      out[i + 14] = (unit >> 8) & 0xff;
      out[i + 15] = unit & 0xff;
      return out;
    }
    i += 2 + length;
  }
  return bytes;
}

function pngCrc32(bytes: Uint8Array) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    crc ^= bytes[i];
    for (let bit = 0; bit < 8; bit += 1) {
      const take = crc & 1;
      crc = crc >>> 1;
      if (take) crc ^= 0xedb88320;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function stampPngDpi(bytes: Uint8Array, dpi: number): Uint8Array {
  if (bytes.length < 33) return bytes;
  const sig = [137, 80, 78, 71, 13, 10, 26, 10];
  if (sig.some((value, i) => bytes[i] !== value)) return bytes;
  const ppm = Math.max(1, Math.round(dpi * 39.37007874));
  const phys = new Uint8Array(21);
  const view = new DataView(phys.buffer);
  view.setUint32(0, 9);
  phys[4] = 112;
  phys[5] = 72;
  phys[6] = 89;
  phys[7] = 115;
  view.setUint32(8, ppm);
  view.setUint32(12, ppm);
  phys[16] = 1;
  view.setUint32(17, pngCrc32(phys.subarray(4, 17)));
  const out = new Uint8Array(bytes.length + phys.length);
  out.set(bytes.subarray(0, 33), 0);
  out.set(phys, 33);
  out.set(bytes.subarray(33), 33 + phys.length);
  return out;
}

async function renderPdfPages(
  file: File,
  mime: "image/jpeg" | "image/png",
  options: { scale?: number; quality?: number; preserveSize?: boolean; minScale?: number; imageDpi?: number } = {},
) {
  const pdfjs = await loadPdfjs();
  const data = new Uint8Array(await file.arrayBuffer());
  const doc = await pdfjs.getDocument({
    data,
    cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/",
    cMapPacked: true,
    standardFontDataUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/standard_fonts/",
  }).promise;
  const blobs: Blob[] = [];
  const quality = options.quality ?? 0.92;
  for (let i = 1; i <= doc.numPages; i += 1) {
    const page = await doc.getPage(i);
    const base = page.getViewport({ scale: 1 });
    const scale = options.preserveSize
      ? pdfPageImageScale(base.width, base.height, options.minScale)
      : (options.scale ?? 2);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.floor(viewport.width));
    canvas.height = Math.max(1, Math.floor(viewport.height));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not render this PDF page.");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({
      canvasContext: ctx,
      viewport,
      intent: options.preserveSize ? "print" : "display",
    }).promise;
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime, quality));
    if (!blob) throw new Error("Could not export this PDF page.");
    if (!options.preserveSize) {
      blobs.push(blob);
      continue;
    }
    const raw = new Uint8Array(await blob.arrayBuffer());
    const dpi = options.imageDpi ?? 72;
    const stamped = mime === "image/jpeg" ? stampJpegDpi(raw, dpi) : stampPngDpi(raw, dpi);
    blobs.push(new Blob([stamped], { type: mime }));
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
  const blobs = await renderPdfPages(file, mime, {
    preserveSize: true,
    minScale: format === "jpg" ? 7.5 * ((11 + 3) / 11) : 3.5,
    imageDpi: 72,
    quality: format === "jpg" ? 0.98 : 0.92,
  });
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
  link?: string;
  breakBefore?: boolean;
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
  leadPt?: number;
  runs: PdfRun[];
};

type PdfPic = {
  x: number;
  y: number;
  w: number;
  h: number;
  bytes: Uint8Array;
  link?: string;
};

type PdfLink = {
  x: number;
  y: number;
  w: number;
  h: number;
  url: string;
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

function wordHalfPt(size: number) {
  if (!Number.isFinite(size) || size <= 0) return 22;
  return Math.max(2, Math.min(200, Math.round(size * 2)));
}

function defaultLeadPt(size: number) {
  return Math.max(size, size * 1.4);
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
  if (/liberation\s*sans|dejavu\s*sans|helvetica|arial/.test(n)) return "Arial";
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
      text: normalizePdfGlyphs(fontName, text).replace(/[\u00a0\u2000-\u200b\u202f\ufeff]/g, " "),
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

function pdfNumeric(obj: unknown): number {
  if (obj && typeof (obj as { asNumber?: () => number }).asNumber === "function") {
    return (obj as { asNumber: () => number }).asNumber();
  }
  const n = Number(String(obj ?? ""));
  return Number.isFinite(n) ? n : NaN;
}

function pdfTextOf(obj: unknown): string {
  if (!obj) return "";
  if (typeof (obj as PDFString).decodeText === "function") {
    try {
      return (obj as PDFString).decodeText();
    } catch {
      /* fall through */
    }
  }
  const raw = String(obj);
  const wrapped = raw.match(/^\((.*)\)$/s);
  if (wrapped) return wrapped[1].replace(/\\([()\\nrt])/g, "$1");
  return raw.replace(/^\//, "");
}

function extractPdfPageLinks(libPage: PDFPage, pageHeight: number): PdfLink[] {
  const links: PdfLink[] = [];
  try {
    libPage.node.normalize();
    const annots = libPage.node.Annots();
    if (!annots || typeof annots.size !== "function") return links;
    for (let i = 0; i < annots.size(); i += 1) {
      const annot = libPage.doc.context.lookup(annots.get(i));
      if (!(annot instanceof PDFDict)) continue;
      const subtype = String(annot.lookup(PDFName.of("Subtype")) ?? "");
      if (!/Link/i.test(subtype)) continue;
      const rect = annot.lookup(PDFName.of("Rect"));
      if (!(rect instanceof PDFArray) || rect.size() < 4) continue;
      const x1 = pdfNumeric(rect.lookup(0));
      const y1 = pdfNumeric(rect.lookup(1));
      const x2 = pdfNumeric(rect.lookup(2));
      const y2 = pdfNumeric(rect.lookup(3));
      if (![x1, y1, x2, y2].every((n) => Number.isFinite(n))) continue;
      const action = annot.lookup(PDFName.of("A"));
      const url = action instanceof PDFDict ? pdfTextOf(action.lookup(PDFName.of("URI"))).trim() : "";
      if (!url) continue;
      const left = Math.min(x1, x2);
      const bottom = Math.min(y1, y2);
      const right = Math.max(x1, x2);
      const top = Math.max(y1, y2);
      links.push({
        x: left,
        y: pageHeight - top,
        w: Math.max(1, right - left),
        h: Math.max(1, top - bottom),
        url,
      });
    }
  } catch {
    /* ignore malformed annotations */
  }
  return links;
}

function applyLinksToLines(lines: PdfLine[], links: PdfLink[]) {
  if (!links.length) return;
  for (const line of lines) {
    for (const run of line.runs) {
      const box = { x: run.x, y: run.y, w: Math.max(run.w, 1), h: Math.max(run.size, line.h * 0.6, 4) };
      const hit = links.find((link) => boxesOverlap(box, link, 1.5));
      if (hit) run.link = hit.url;
    }
  }
}

function applyLinksToPics(pictures: PdfPic[], links: PdfLink[]) {
  if (!links.length) return;
  for (const pic of pictures) {
    const hit = links.find((link) => boxesOverlap(pic, link, 4));
    if (hit) pic.link = hit.url;
  }
}

function attachLineLeading(lines: PdfLine[]): PdfLine[] {
  const sorted = [...lines].sort((a, b) => a.y - b.y || a.x - b.x);
  return sorted.map((line, index) => {
    const next = sorted[index + 1];
    let lead = defaultLeadPt(line.size);
    if (next && Math.abs(next.size - line.size) <= 2.6) {
      const gap = next.y - line.y;
      if (gap > line.size * 0.72 && gap < line.size * 2.8) lead = gap;
    }
    return { ...line, leadPt: lead, h: Math.max(line.h, lead) };
  });
}

function addPdfUriLink(page: PDFPage, x: number, y: number, w: number, h: number, url: string) {
  if (!url || w < 2 || h < 2) return;
  try {
    const annot = page.doc.context.register(
      page.doc.context.obj({
        Type: "Annot",
        Subtype: "Link",
        Rect: [x, y, x + w, y + h],
        Border: [0, 0, 0],
        A: { Type: "Action", S: "URI", URI: PDFString.of(url) },
      }),
    );
    page.node.addAnnot(annot);
  } catch {
    /* some PDF viewers reject malformed URI annots */
  }
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
    if (isChartGroup(group) && existing.some((pic) => boxesOverlap(pic, box, 36))) continue;
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

type PdfTable = { top: number; bottom: number; lines: PdfLine[]; colXs: number[]; rows: PdfLine[][]; rightEdge?: number };

function isBulletText(text: string) {
  return /^[\u2022\u00b7\uf0b7•]/.test(text.trim());
}

function looksLikeRealTable(table: PdfTable, pageWidth: number) {
  const rows = table.rows.filter((row) => row.some((line) => lineText(line).trim()));
  if (rows.length < 3 || table.colXs.length < 3) return false;
  const bulletRows = rows.filter((row) => row.some((line) => isBulletText(lineText(line)))).length;
  if (bulletRows >= Math.max(2, rows.length * 0.35)) return false;

  const rightEdge = Math.max(table.rightEdge ?? 0, table.colXs[table.colXs.length - 1] + 72, pageWidth * 0.88);
  const rowCells = rows.map((row) => {
    const cells = table.colXs.map(() => "");
    for (const line of row) {
      for (const run of line.runs) {
        if (!run.text.replace(/\s+/g, "").length) continue;
        const index = tableColIndex(run.x, run.w, table.colXs, rightEdge);
        cells[index] += `${cells[index] ? " " : ""}${run.text.trim()}`;
      }
    }
    return cells.map((text) => text.replace(/\s+/g, " ").trim());
  });

  const aligned = rowCells.filter((cells) => cells.filter(Boolean).length >= 2).length;
  if (aligned < 3) return false;

  const colShort = table.colXs.map((_, index) =>
    rowCells.filter((cells) => {
      const text = cells[index];
      return !!text && (text.length <= 18 || /^\d+[.)]?$/.test(text));
    }).length,
  );
  if (colShort.filter((count) => count >= Math.min(3, rows.length - 1)).length < 1) return false;

  const proseCells = rowCells.flat().filter((text) => text.length > 72).length;
  if (proseCells > rows.length) return false;
  return true;
}

function isCenteredBox(
  box: { x: number; w: number },
  pageWidth: number,
  marginL: number,
  marginR: number,
) {
  const contentL = marginL;
  const contentR = pageWidth - marginR;
  const contentW = Math.max(1, contentR - contentL);
  const leftGap = box.x - contentL;
  const rightGap = contentR - (box.x + box.w);
  if (box.w >= contentW * 0.92) return false;
  if (leftGap < 8) return false;
  return Math.abs(leftGap - rightGap) <= Math.max(16, contentW * 0.2);
}

function detectTextTable(lines: PdfLine[], pageWidth: number): PdfTable | null {
  const anchors = lines.filter((line) => {
    const text = lineText(line).trim();
    if (!text || line.size >= 16 || isBulletText(text)) return false;
    if (line.w > pageWidth * 0.42) return false;
    if (text.length > 42) return false;
    return true;
  });
  if (anchors.length < 8) return null;
  const rawXs = clusterNumbers(
    anchors.map((line) => line.x),
    16,
  );
  const colXs = rawXs.filter((x) => anchors.filter((line) => Math.abs(line.x - x) <= 16).length >= 2);
  if (colXs.length < 3) return null;

  const sorted = [...lines]
    .filter((line) => lineText(line).trim() && line.size < 16 && !isBulletText(lineText(line)))
    .sort((a, b) => a.y - b.y || a.x - b.x);
  const rows: PdfLine[][] = [];
  for (const line of sorted) {
    const row = rows[rows.length - 1];
    if (row && Math.abs(line.y - row[0].y) <= Math.max(5.5, line.size * 0.55)) row.push(line);
    else rows.push([line]);
  }

  const rightEdge = Math.max(colXs[colXs.length - 1] + 72, pageWidth * 0.88);
  const filledCols = (row: PdfLine[]) => {
    const hits = new Set<number>();
    for (const line of row) {
      for (const run of line.runs) {
        if (!run.text.trim()) continue;
        hits.add(tableColIndex(run.x, run.w, colXs, rightEdge));
      }
    }
    return hits.size;
  };

  let best: { start: number; end: number; score: number } | null = null;
  for (let start = 0; start < rows.length; start += 1) {
    for (let end = start + 2; end < rows.length; end += 1) {
      const slice = rows.slice(start, end + 1);
      if (filledCols(slice[0]) < 2 || filledCols(slice[slice.length - 1]) < 2) continue;
      const good = slice.filter((row) => filledCols(row) >= 2).length;
      if (good < 3 || good / slice.length < 0.75) continue;
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
  if (used.length < 3) return null;
  const consumed = used.flat();
  const contentRight = Math.max(
    colXs[colXs.length - 1] + 48,
    ...consumed.flatMap((line) => [line.x + line.w, ...line.runs.map((run) => run.x + run.w)]),
  );
  const table: PdfTable = {
    top: Math.min(...consumed.map((line) => line.y)),
    bottom: Math.max(...consumed.map((line) => line.y + line.h)),
    lines: consumed,
    colXs,
    rows: used,
    rightEdge: Math.min(pageWidth - 24, Math.max(contentRight, colXs[colXs.length - 1] + 36)),
  };
  return looksLikeRealTable(table, pageWidth) ? table : null;
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
  const rightEdge = colXs[colXs.length - 1];
  const inTable = lines.filter((line) => {
    const hits = line.runs.some((run) => {
      const cx = run.x + Math.max(run.w, 1) / 2;
      const cy = line.y + Math.max(line.h, run.size, 4) / 2;
      return cx >= box.x - 2 && cx <= box.x + box.w + 2 && cy >= box.y - 2 && cy <= box.y + box.h + 2;
    });
    if (hits) return true;
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
  if (used.length < 3 || starts.length < 3) return null;
  const table: PdfTable = {
    top: box.y,
    bottom: box.y + box.h,
    lines: inTable,
    colXs: starts,
    rows,
    rightEdge,
  };
  return looksLikeRealTable(table, pageWidth) ? table : null;
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
  const text = detectTextTable(rest, pageWidth);
  if (text) {
    tables.push(text);
    const taken = new Set(text.lines);
    rest = rest.filter((line) => !taken.has(line));
  }
  return { tables, rest };
}

function tableRightEdge(table: PdfTable, pageWidth: number) {
  const runEnds = table.rows.flat().flatMap((line) => line.runs.map((run) => run.x + run.w));
  const lineEnds = table.rows.flat().map((line) => line.x + line.w);
  const last = table.colXs[table.colXs.length - 1] ?? 0;
  const prev = table.colXs[table.colXs.length - 2] ?? last - 64;
  const guessedLast = last + Math.max(36, last - prev);
  const contentRight = Math.max(guessedLast, ...runEnds, ...lineEnds);
  if (table.rightEdge && table.rightEdge < pageWidth * 0.82) {
    return Math.min(pageWidth - 24, Math.max(contentRight, table.rightEdge));
  }
  return Math.min(pageWidth - 24, Math.max(contentRight, last + 40));
}

function tableColIndex(x: number, w: number, colXs: number[], rightEdge: number) {
  const cx = x + Math.max(w, 1) / 2;
  const edges = [...colXs, Math.max(rightEdge, (colXs[colXs.length - 1] ?? 0) + 72)];
  for (let i = 0; i < colXs.length; i += 1) {
    if (cx >= edges[i] - 1.5 && cx < edges[i + 1] - 0.5) return i;
  }
  let best = 0;
  let dist = Infinity;
  colXs.forEach((left, index) => {
    const d = Math.abs(cx - left);
    if (d < dist) {
      dist = d;
      best = index;
    }
  });
  return best;
}

function splitRunAcrossColumns(
  run: PdfRun,
  colXs: number[],
  rightEdge: number,
): Array<{ col: number; run: PdfRun }> {
  const edges = [...colXs, Math.max(rightEdge, (colXs[colXs.length - 1] ?? 0) + 72)];
  const left = run.x;
  const width = Math.max(run.w, Math.max(1, run.text.length) * run.size * 0.42);
  const right = left + width;
  const hitCols: number[] = [];
  for (let i = 0; i < colXs.length; i += 1) {
    if (right > edges[i] + 4 && left < edges[i + 1] - 4) hitCols.push(i);
  }
  if (hitCols.length <= 1 || !run.text.length) {
    return [
      {
        col: hitCols[0] ?? tableColIndex(run.x, run.w, colXs, rightEdge),
        run,
      },
    ];
  }
  const spaced: Array<{ text: string; start: number }> = [];
  const gapRe = / {2,}/g;
  let last = 0;
  let match: RegExpExecArray | null = gapRe.exec(run.text);
  while (match) {
    if (match.index > last) spaced.push({ text: run.text.slice(last, match.index), start: last });
    last = match.index + match[0].length;
    match = gapRe.exec(run.text);
  }
  if (last < run.text.length) spaced.push({ text: run.text.slice(last), start: last });
  if (spaced.length > 1) {
    const charW = width / run.text.length;
    return spaced.flatMap((chunk) =>
      splitRunAcrossColumns(
        {
          ...run,
          text: chunk.text,
          x: left + chunk.start * charW,
          w: Math.max(charW * chunk.text.length, run.size * 0.6),
        },
        colXs,
        rightEdge,
      ),
    );
  }
  const charW = width / run.text.length;
  const parts: Array<{ col: number; start: number; text: string }> = [];
  for (let i = 0; i < run.text.length; i += 1) {
    const cx = left + (i + 0.5) * charW;
    const col = tableColIndex(cx, 0.2, colXs, rightEdge);
    const last = parts[parts.length - 1];
    if (last && last.col === col) last.text += run.text[i];
    else parts.push({ col, start: i, text: run.text[i] });
  }
  return parts
    .map((part) => ({
      col: part.col,
      run: {
        ...run,
        text: part.text,
        x: left + part.start * charW,
        w: Math.max(charW * part.text.length, run.size * 0.6),
      },
    }))
    .filter((part) => part.run.text.replace(/\s+/g, "").length);
}

function combineCellLines(cell: PdfLine[]): PdfLine[] {
  const sorted = [...cell].sort((a, b) => a.y - b.y || a.x - b.x);
  const out: PdfLine[] = [];
  for (const line of sorted) {
    const prev = out[out.length - 1];
    if (prev && Math.abs(line.y - prev.y) <= Math.max(3.2, line.size * 0.55)) {
      prev.runs.push(...line.runs.map((run) => ({ ...run })));
      const left = Math.min(prev.x, line.x);
      prev.w = Math.max(prev.x + prev.w, line.x + line.w) - left;
      prev.x = left;
      prev.h = Math.max(prev.h, line.h);
    } else out.push(cloneLine(line));
  }
  return out;
}

function tableToXml(table: PdfTable, pageWidth: number) {
  const usable = Math.max(2400, ptTwip(pageWidth) - 360);
  const rightEdge = tableRightEdge(table, pageWidth);
  const rights = table.colXs.map((x, index) => {
    if (index < table.colXs.length - 1) return table.colXs[index + 1];
    return rightEdge;
  });
  const raw = table.colXs.map((x, index) => Math.max(360, ptTwip(rights[index] - x)));
  const sum = raw.reduce((n, w) => n + w, 0) || usable;
  const widths = raw.map((w) => Math.max(360, Math.round((w / sum) * usable)));
  const rowsXml = table.rows
    .filter((row) => row.some((line) => line.runs.some((run) => run.text.replace(/\s+/g, "").length)))
    .map((row) => {
      const cells: PdfLine[][] = table.colXs.map(() => []);
      for (const line of row) {
        const runs = line.runs.length ? line.runs : [];
        for (const run of runs) {
          if (!run?.text.replace(/\s+/g, "").length) continue;
          for (const piece of splitRunAcrossColumns(run, table.colXs, rightEdge)) {
            cells[piece.col].push({
              ...line,
              x: piece.run.x,
              w: Math.max(piece.run.w, piece.run.size),
              runs: [piece.run],
            });
          }
        }
      }
      return `<w:tr>${cells
        .map((cell, index) => {
          const xml = mergeParagraphLines(combineCellLines(cell))
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
              <w:top w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>
              <w:left w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>
              <w:bottom w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>
              <w:right w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>
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
        <w:top w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>
        <w:left w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>
        <w:bottom w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>
        <w:right w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>
        <w:insideH w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>
        <w:insideV w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>
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

function typicalLead(line: PdfLine) {
  return line.leadPt || defaultLeadPt(line.size);
}

function lastVisualLine(line: PdfLine) {
  const y = line.runs.reduce((top, run) => Math.max(top, run.y), line.y);
  const runs = line.runs.filter((run) => Math.abs(run.y - y) <= 1.6);
  const x = runs.length ? Math.min(...runs.map((run) => run.x)) : line.x;
  const right = runs.length ? Math.max(...runs.map((run) => run.x + run.w)) : line.x + line.w;
  return { y, x, w: Math.max(line.size, right - x), size: line.size, leadPt: line.leadPt };
}

function isWrapContinuation(prev: PdfLine, line: PdfLine) {
  const prevText = lineText(prev).trim();
  const nextText = lineText(line).trim();
  if (!prevText || !nextText) return false;
  if (Math.abs(line.size - prev.size) > 1.6) return false;
  if (/^[\u2022\u00b7\uf0b7•◦▪▫■□o○●]/.test(nextText)) return false;
  const tail = lastVisualLine(prev);
  const lead = typicalLead(prev);
  const dy = line.y - tail.y;
  if (dy < lead * 0.62 || dy > lead * 1.22) return false;
  const aligned = Math.abs(line.x - tail.x) <= Math.max(14, prev.size * 1.1);
  const wrapIndent = line.x >= tail.x - 8 && line.x - tail.x <= Math.max(22, prev.size * 2);
  if (!aligned && !wrapIndent) return false;
  if (line.x - tail.x > Math.max(40, prev.size * 3.5) && line.w < tail.w * 0.62) return false;
  const prevShort = tail.w < Math.max(line.w, prev.size * 8) * 0.78;
  if (prevShort && /[.!?]["')\]]?$/.test(prevText) && /^[A-Z“"‘]/.test(nextText) && dy > lead * 1.05) {
    return false;
  }
  return true;
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
    if (!isWrapContinuation(prev, line)) {
      out.push(cloneLine(line));
      continue;
    }
    line.runs.forEach((run, index) => {
      prev.runs.push({
        ...run,
        breakBefore: index === 0,
        text: index === 0 ? run.text.replace(/^\s+/, "") : run.text,
      });
    });
    const left = Math.min(prev.x, line.x);
    prev.w = Math.max(prev.x + prev.w, line.x + line.w) - left;
    prev.x = left;
    prev.h = line.y + line.h - prev.y;
    if (line.leadPt) prev.leadPt = prev.leadPt ? Math.min(prev.leadPt, line.leadPt) : line.leadPt;
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

function exactPara(line: PdfLine, marginL: number, pageWidth: number, gapPt: number, forceCenter = false) {
  const stripped = stripBulletLine(line);
  const used = stripped.line;
  const contentW = Math.max(40, pageWidth - marginL * 2);
  const leftGap = used.x - marginL;
  const rightGap = pageWidth - marginL - (used.x + used.w);
  const heading = used.size >= 15;
  const centered =
    !stripped.bullet &&
    (forceCenter ||
      (Math.abs(leftGap - rightGap) < Math.max(14, contentW * 0.16) && leftGap > 8 && used.w < contentW * 0.92));
  const longBody = !heading && !stripped.bullet && used.runs.reduce((n, run) => n + run.text.length, 0) > 88;
  const before = Math.min(heading ? 240 : 120, Math.max(0, ptTwip(Math.max(0, gapPt - (heading ? 2 : 4)))));
  const indent = centered || stripped.bullet ? 0 : Math.max(0, ptTwip(leftGap));
  const hanging = stripped.bullet
    ? `<w:ind w:left="360" w:hanging="360"/>`
    : !centered && indent > 120
      ? `<w:ind w:left="${Math.min(indent, 2880)}"/>`
      : "";
  const align = centered ? "center" : longBody ? "both" : "left";
  const font = used.runs[0]?.font || "Arial";
  const bulletSize = Math.max(14, Math.round(used.size * 2));
  return `<w:p>
    <w:pPr>
      <w:jc w:val="${align}"/>
      <w:spacing w:before="${before}" w:after="${heading ? 80 : stripped.bullet ? 20 : 60}" w:line="240" w:lineRule="auto"/>
      ${hanging}
    </w:pPr>
    ${stripped.bullet ? `<w:r><w:rPr><w:rFonts w:ascii="${font}" w:hAnsi="${font}" w:cs="${font}"/><w:sz w:val="${bulletSize}"/><w:szCs w:val="${bulletSize}"/></w:rPr><w:t xml:space="preserve">• </w:t></w:r>` : ""}
    ${lineRunsXml(used)}
  </w:p>`;
}

function setParaBefore(xml: string, beforeTwips: number) {
  const pad = Math.min(240, Math.max(0, beforeTwips));
  if (xml.includes("<w:tbl")) {
    return pad > 60 ? `<w:p><w:pPr><w:spacing w:before="${pad}" w:after="60"/></w:pPr></w:p>${xml}` : xml;
  }
  if (/<w:spacing\b/.test(xml)) {
    return xml.replace(/<w:spacing\b[^/]*\/>/, `<w:spacing w:before="${pad}" w:after="60"/>`);
  }
  return xml.replace("<w:pPr>", `<w:pPr><w:spacing w:before="${pad}" w:after="60"/>`);
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
  const rest = mergeParagraphLines(extracted.rest);
  const boxes = [
    ...rest,
    ...extracted.tables.map((table) => ({ x: table.colXs[0] ?? 0, y: table.top, w: pageWidth * 0.8, h: Math.max(12, table.bottom - table.top) })),
    ...pictures.map((item) => item.pic),
    ...charts.map((item) => item.chart),
  ];
  const pageInset = 56.7;
  const marginL = boxes.length
    ? Math.max(50, Math.min(64, Math.min(...boxes.map((box) => box.x))))
    : pageInset;
  const marginR = boxes.length
    ? Math.max(50, Math.min(64, pageWidth - Math.max(...boxes.map((box) => box.x + box.w))))
    : pageInset;
  const marginT = boxes.length
    ? Math.max(50, Math.min(64, Math.min(...boxes.map((box) => box.y))))
    : pageInset;
  const marginB = pageInset;
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
    ...rest.map((line) => ({
      y: line.y,
      h: Math.max(line.h, line.size * 1.2),
      line,
    })),
  ];
  items.sort((a, b) => a.y - b.y);
  let cursor = marginT;
  let prevCentered: { size: number; y: number } | null = null;
  const parts: string[] = [];
  for (const item of items) {
    const gap = item.y - cursor;
    if (item.line) {
      const inherit =
        !!prevCentered &&
        Math.abs(item.line.size - prevCentered.size) < 2 &&
        item.line.y - prevCentered.y < item.line.size * 2.6 &&
        item.line.size >= 15;
      const xml = exactPara(item.line, marginL, pageWidth, gap, inherit);
      parts.push(xml);
      prevCentered = xml.includes('w:val="center"') && item.line.size >= 15 ? { size: item.line.size, y: item.line.y } : null;
    } else if (item.xml) {
      parts.push(setParaBefore(item.xml, Math.max(0, ptTwip(Math.max(0, gap - 2)))));
      prevCentered = null;
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
  return last ? xml : `<w:p><w:r><w:br w:type="page"/></w:r></w:p><w:p><w:pPr>${xml}</w:pPr></w:p>`;
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
    leadPt: (line.leadPt ?? defaultLeadPt(line.size)) * scale,
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
  const half = wordHalfPt(run.size);
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

function isWordChar(ch: string) {
  return /[\p{L}\p{N}'’]/u.test(ch);
}

function needsSpaceBetweenRuns(prev: PdfRun, next: PdfRun) {
  if (!prev.text || !next.text) return false;
  if (/\s$/.test(prev.text) || /^\s/.test(next.text)) return false;
  if (/[-\u2010-\u2015]$/.test(prev.text)) return false;
  const gap = next.x - (prev.x + prev.w);
  const sameLine = Math.abs(next.y - prev.y) <= Math.max(2.2, prev.size * 0.45);
  if (!sameLine) return true;
  const left = prev.text.slice(-1);
  const right = next.text[0];
  if (isWordChar(left) && isWordChar(right)) {
    return gap > Math.max(2.8, Math.min(prev.size, next.size) * 0.26);
  }
  return gap > Math.max(1.8, Math.min(prev.size, next.size) * 0.18);
}

function flowRuns(line: PdfLine): PdfRun[] {
  const ordered = [...line.runs].sort((a, b) => a.y - b.y || a.x - b.x);
  const out: PdfRun[] = [];
  for (const run of ordered) {
    const text = run.text.replace(/[\u00a0\u2000-\u200b\u202f\ufeff]/g, " ").replace(/ {2,}/g, " ");
    if (!text) continue;
    const next = { ...run, text };
    const prev = out[out.length - 1];
    const space = prev && !run.breakBefore && needsSpaceBetweenRuns(prev, next) ? " " : "";
    const sameStyle =
      !!prev &&
      !run.breakBefore &&
      prev.bold === run.bold &&
      prev.italic === run.italic &&
      !!prev.underline === !!run.underline &&
      (prev.font || "Arial") === (run.font || "Arial") &&
      Math.abs(prev.size - run.size) < 0.45 &&
      (prev.link || "") === (run.link || "");
    if (sameStyle && prev) {
      prev.text += space + text;
      prev.w = Math.max(prev.x + prev.w, run.x + run.w) - prev.x;
    } else {
      out.push({ ...run, text: space + text });
    }
  }
  return out;
}

function lineRunsXml(line: PdfLine) {
  const runs = flowRuns(line);
  let xml = "";
  for (const run of runs) xml += docxTextRun(run);
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

function parseWordSections(docXml: string) {
  const body = docXml.match(/<w:body>([\s\S]*)<\/w:body>/)?.[1];
  if (!body) return [] as Array<{ body: string; widthPt: number; heightPt: number }>;
  const sections: Array<{ body: string; widthPt: number; heightPt: number }> = [];
  const re = /<w:sectPr\b[\s\S]*?<\/w:sectPr>/g;
  let last = 0;
  let match: RegExpExecArray | null = re.exec(body);
  while (match) {
    let prefix = body.slice(last, match.index).replace(/<w:p>\s*<w:pPr>\s*$/, "");
    prefix = prefix.replace(/^(?:\s*<w:p>\s*<w:r>\s*<w:br w:type="page"\s*\/>\s*<\/w:r>\s*<\/w:p>)+/, "");
    prefix = prefix.replace(/(?:\s*<w:p>\s*<w:r>\s*<w:br w:type="page"\s*\/>\s*<\/w:r>\s*<\/w:p>)+\s*$/, "");
    const sect = match[0].replace(/<w:type w:val="nextPage"\s*\/>/g, "");
    const widthPt = Number(sect.match(/<w:pgSz[^>]*w:w="(\d+)"/)?.[1] ?? 11906) / 20;
    const heightPt = Number(sect.match(/<w:pgSz[^>]*w:h="(\d+)"/)?.[1] ?? 16838) / 20;
    sections.push({ body: `${prefix}${sect}`, widthPt, heightPt });
    last = match.index + match[0].length;
    const close = body.slice(last).match(/^\s*<\/w:pPr>\s*<\/w:p>/);
    if (close) last += close[0].length;
    match = re.exec(body);
  }
  return sections;
}

function parseBarChartXml(xml: string) {
  const horizontal = /<c:barDir val="bar"/.test(xml);
  const series: Array<{ name: string; color: string; values: number[] }> = [];
  let categories: string[] = [];
  for (const ser of xml.match(/<c:ser\b[\s\S]*?<\/c:ser>/g) ?? []) {
    const name = ser.match(/<c:tx\b[\s\S]*?<c:v>([^<]*)<\/c:v>/)?.[1] || `Series ${series.length + 1}`;
    const color = ser.match(/<a:srgbClr val="([^"]+)"/)?.[1] || "2F6DB3";
    const valBlock = ser.match(/<c:val\b[\s\S]*?<\/c:val>/)?.[0] ?? "";
    const catBlock = ser.match(/<c:cat\b[\s\S]*?<\/c:cat>/)?.[0] ?? "";
    const values = [...valBlock.matchAll(/<c:v>([^<]*)<\/c:v>/g)].map((item) => Number(item[1]) || 0);
    const cats = [...catBlock.matchAll(/<c:v>([^<]*)<\/c:v>/g)].map((item) => item[1]);
    if (cats.length) categories = cats;
    series.push({ name, color, values });
  }
  return { horizontal, categories, series };
}

async function renderBarChartPng(
  chart: { horizontal: boolean; categories: string[]; series: Array<{ name: string; color: string; values: number[] }> },
  widthPt: number,
  heightPt: number,
) {
  const scale = 2;
  const width = Math.max(220, Math.round(widthPt * scale));
  const height = Math.max(140, Math.round(heightPt * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not draw the chart.");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  const cats = chart.categories.length ? chart.categories : ["Category 1"];
  const series = chart.series.length ? chart.series : [{ name: "Series 1", color: "2F6DB3", values: [0] }];
  const maxVal = Math.max(1, ...series.flatMap((item) => item.values));
  const padL = 52;
  const padR = 18;
  const padT = 18;
  const padB = 42;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  ctx.strokeStyle = "#d0d0d0";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i += 1) {
    const y = padT + (plotH * i) / 4;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(padL + plotW, y);
    ctx.stroke();
  }
  ctx.font = `${Math.max(10, Math.round(11 * (scale / 2)))}px Arial`;
  ctx.textAlign = "center";
  if (chart.horizontal) {
    const rowH = plotH / Math.max(1, cats.length);
    const barH = Math.max(4, (rowH * 0.7) / Math.max(1, series.length));
    series.forEach((item, s) => {
      ctx.fillStyle = `#${item.color.replace("#", "")}`;
      cats.forEach((_, c) => {
        const value = item.values[c] ?? 0;
        const w = (value / maxVal) * plotW;
        const y = padT + c * rowH + rowH * 0.15 + s * barH;
        ctx.fillRect(padL, y, Math.max(1, w), Math.max(3, barH - 2));
      });
    });
    ctx.fillStyle = "#333333";
    ctx.textAlign = "right";
    cats.forEach((name, c) => {
      ctx.fillText(name, padL - 6, padT + c * rowH + rowH / 2 + 4, padL - 10);
    });
  } else {
    const groupW = plotW / Math.max(1, cats.length);
    const barW = Math.max(4, (groupW * 0.7) / Math.max(1, series.length));
    series.forEach((item, s) => {
      ctx.fillStyle = `#${item.color.replace("#", "")}`;
      cats.forEach((_, c) => {
        const value = item.values[c] ?? 0;
        const h = (value / maxVal) * plotH;
        const x = padL + c * groupW + groupW * 0.15 + s * barW;
        const y = padT + plotH - h;
        ctx.fillRect(x, y, Math.max(3, barW - 2), Math.max(1, h));
      });
    });
    ctx.fillStyle = "#333333";
    cats.forEach((name, c) => {
      ctx.fillText(name, padL + c * groupW + groupW / 2, height - 14, groupW - 4);
    });
  }
  return canvasToBytes(canvas, "image/png");
}

async function rasterizeWordCharts(zip: JSZip) {
  const docFile = zip.file("word/document.xml");
  const relsFile = zip.file("word/_rels/document.xml.rels");
  if (!docFile || !relsFile) return;
  let docXml = await docFile.async("string");
  let relsXml = await relsFile.async("string");
  const rels = parseRels(relsXml, "word/");
  const drawings = docXml.match(/<w:drawing\b[\s\S]*?<\/w:drawing>/g) ?? [];
  let imageIndex = 1;
  for (const drawing of drawings) {
    const chartId = drawing.match(/<c:chart\b[^>]*r:id="([^"]+)"/)?.[1];
    if (!chartId) continue;
    const target = rels.get(chartId);
    if (!target) continue;
    const chartXmlStr = await zipEntry(zip, target)?.async("string");
    if (!chartXmlStr) continue;
    const cx = Number(drawing.match(/<wp:extent[^>]*cx="(\d+)"/)?.[1] ?? 5486400);
    const cy = Number(drawing.match(/<wp:extent[^>]*cy="(\d+)"/)?.[1] ?? 3200400);
    const widthPt = cx / 12700;
    const heightPt = cy / 12700;
    const png = await renderBarChartPng(parseBarChartXml(chartXmlStr), widthPt, heightPt);
    const file = `chartPreview${imageIndex}.png`;
    const relId = `rIdChartImg${imageIndex}`;
    zip.file(`word/media/${file}`, png);
    relsXml = relsXml.replace(
      "</Relationships>",
      `<Relationship Id="${relId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${file}"/></Relationships>`,
    );
    const picture = docxInlinePicture(
      { x: 0, y: 0, w: widthPt, h: heightPt, bytes: png },
      relId,
      800 + imageIndex,
      widthPt,
    );
    const nextDrawing = picture.match(/<w:drawing\b[\s\S]*?<\/w:drawing>/)?.[0];
    if (nextDrawing) docXml = docXml.replace(drawing, nextDrawing);
    imageIndex += 1;
  }
  zip.file("word/document.xml", docXml);
  zip.file("word/_rels/document.xml.rels", relsXml);
}

async function drawCanvasPage(
  pdf: PDFDocument,
  canvas: HTMLCanvasElement,
  widthPt: number,
  heightPt: number,
) {
  const png = await canvasToBytes(canvas, "image/png");
  const image = await pdf.embedPng(png);
  const page = pdf.addPage([widthPt, heightPt]);
  page.drawImage(image, { x: 0, y: 0, width: widthPt, height: heightPt });
}

function previewOptions() {
  return {
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
  };
}

async function wordSectionsToPdf(
  zip: JSZip,
  docXml: string,
  sections: Array<{ body: string; widthPt: number; heightPt: number }>,
  name: string,
) {
  const pdf = await PDFDocument.create();
  const host = document.createElement("div");
  host.style.cssText = "position:fixed;left:-18000px;top:0;background:#ffffff;z-index:-1;";
  document.body.appendChild(host);
  try {
    const { renderAsync } = await import("docx-preview");
    for (const section of sections) {
      zip.file("word/document.xml", docXml.replace(/<w:body>[\s\S]*<\/w:body>/, `<w:body>${section.body}</w:body>`));
      const buf = await zip.generateAsync({ type: "arraybuffer" });
      host.innerHTML = "";
      await renderAsync(buf, host, host, previewOptions());
      await nextPaint();
      const pageEl =
        host.querySelector<HTMLElement>("section.stxdoc") ||
        host.querySelector<HTMLElement>("section") ||
        host;
      const cssW = section.widthPt * (96 / 72);
      const cssH = section.heightPt * (96 / 72);
      pageEl.style.boxShadow = "none";
      pageEl.style.margin = "0";
      pageEl.style.background = "#ffffff";
      pageEl.style.boxSizing = "border-box";
      pageEl.style.width = `${cssW}px`;
      pageEl.style.minHeight = `${cssH}px`;
      pageEl.style.height = "auto";
      pageEl.style.overflow = "visible";
      prepareWordPrint(pageEl);
      const canvas = await captureElement(pageEl, { windowWidth: Math.ceil(cssW) });
      if (canvas.width < 4 || canvas.height < 4) continue;
      const png = await canvasToBytes(canvas, "image/png");
      const image = await pdf.embedPng(png);
      const page = pdf.addPage([section.widthPt, section.heightPt]);
      const cssToPt = 72 / 96;
      const captureScale = 2;
      let drawW = (canvas.width / captureScale) * cssToPt;
      let drawH = (canvas.height / captureScale) * cssToPt;
      const fit = Math.min(section.widthPt / Math.max(1, drawW), section.heightPt / Math.max(1, drawH), 1);
      drawW *= fit;
      drawH *= fit;
      page.drawImage(image, {
        x: 0,
        y: Math.max(0, section.heightPt - drawH),
        width: drawW,
        height: drawH,
      });
    }
    if (pdf.getPageCount() === 0) throw new Error("empty");
    return { blob: pdfBlob(await pdf.save()), name };
  } finally {
    host.remove();
  }
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
  for (const element of elements) {
    const canvas = await captureElement(element);
    if (canvas.width < 4 || canvas.height < 4) continue;
    const cssW = element.offsetWidth || canvas.width / 2;
    const cssH = element.offsetHeight || canvas.height / 2;
    const pageW = Math.max(72, cssW * 0.75);
    const pageH = Math.max(72, cssH * 0.75);
    if (pageH > pageW * 1.45) {
      await embedCanvasAsPages(pdf, canvas, pageW, pageW * (841.89 / 595.28));
      continue;
    }
    const png = await canvasToBytes(canvas, "image/png");
    const image = await pdf.embedPng(png);
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

type FlowMargins = { t: number; r: number; b: number; l: number };
type FlowBlock =
  | { kind: "para"; line: PdfLine; gap: number; inheritCenter: boolean }
  | { kind: "table"; table: PdfTable; gap: number; center: boolean }
  | { kind: "image"; pic: PdfPic; gap: number; center: boolean };

function layoutExactFlow(
  lines: PdfLine[],
  pictures: PdfPic[],
  draws: PdfDraw[],
  pageWidth: number,
  pageHeight: number,
) {
  const graphicBoxes = pictures.map((pic) => pic);
  const visible = applyUnderlines(
    lines.filter((line) => !lineHitsGraphic(line, graphicBoxes)),
    draws,
  );
  const extracted = extractAllTables(visible, pageWidth, draws);
  const rest = mergeParagraphLines(extracted.rest);
  const boxes = [
    ...rest,
    ...extracted.tables.map((table) => {
      const x = table.colXs[0] ?? 0;
      return {
        x,
        y: table.top,
        w: Math.max(48, tableRightEdge(table, pageWidth) - x),
        h: Math.max(12, table.bottom - table.top),
      };
    }),
    ...pictures,
  ];
  const pageInset = 56.7;
  const marginL = boxes.length ? Math.max(50, Math.min(64, Math.min(...boxes.map((box) => box.x)))) : pageInset;
  const marginR = boxes.length
    ? Math.max(50, Math.min(64, pageWidth - Math.max(...boxes.map((box) => box.x + box.w))))
    : pageInset;
  const marginT = boxes.length ? Math.max(50, Math.min(64, Math.min(...boxes.map((box) => box.y)))) : pageInset;
  const marginB = pageInset;
  const maxPicW = Math.max(40, pageWidth - marginL - marginR);
  const items: Array<{ y: number; h: number; table?: PdfTable; pic?: PdfPic; line?: PdfLine; center?: boolean }> = [
    ...pictures.map((pic) => {
      const width = Math.min(pic.w, maxPicW);
      const height = pic.w > maxPicW ? pic.h * (maxPicW / pic.w) : pic.h;
      return {
        y: pic.y,
        h: height,
        pic: { ...pic, w: width, h: height },
        center: isCenteredBox(pic, pageWidth, marginL, marginR),
      };
    }),
    ...extracted.tables.map((table) => ({
      y: table.top,
      h: Math.max(12, table.bottom - table.top),
      table,
    })),
    ...rest.map((line) => ({
      y: line.y,
      h: Math.max(line.leadPt || 0, line.h, defaultLeadPt(line.size)),
      line,
    })),
  ];
  items.sort((a, b) => a.y - b.y);
  let cursor = marginT;
  let prevCentered: { size: number; y: number } | null = null;
  const blocks: FlowBlock[] = [];
  for (const item of items) {
    const gap = item.y - cursor;
    if (item.line) {
      const inherit: boolean =
        !!prevCentered &&
        Math.abs(item.line.size - prevCentered.size) < 2 &&
        item.line.y - prevCentered.y < item.line.size * 2.6 &&
        item.line.size >= 15;
      const stripped = stripBulletLine(item.line);
      const contentW = Math.max(40, pageWidth - marginL * 2);
      const leftGap = stripped.line.x - marginL;
      const rightGap = pageWidth - marginL - (stripped.line.x + stripped.line.w);
      const centered: boolean =
        inherit ||
        (!stripped.bullet &&
          Math.abs(leftGap - rightGap) < Math.max(14, contentW * 0.16) &&
          leftGap > 8 &&
          stripped.line.w < contentW * 0.92);
      blocks.push({ kind: "para", line: item.line, gap, inheritCenter: inherit });
      prevCentered = centered && item.line.size >= 15 ? { size: item.line.size, y: item.line.y } : null;
    } else if (item.table) {
      const x = item.table.colXs[0] ?? 0;
      const w = Math.max(48, tableRightEdge(item.table, pageWidth) - x);
      blocks.push({
        kind: "table",
        table: item.table,
        gap,
        center: isCenteredBox({ x, w }, pageWidth, marginL, marginR),
      });
      prevCentered = null;
    } else if (item.pic) {
      blocks.push({
        kind: "image",
        pic: item.pic,
        gap,
        center: item.center ?? isCenteredBox(item.pic, pageWidth, marginL, marginR),
      });
      prevCentered = null;
    }
    cursor = item.y + item.h;
  }
  return { blocks, margins: { t: marginT, r: marginR, b: marginB, l: marginL } };
}

function tableCellLines(table: PdfTable, pageWidth: number) {
  const rightEdge = tableRightEdge(table, pageWidth);
  return table.rows
    .filter((row) => row.some((line) => line.runs.some((run) => run.text.replace(/\s+/g, "").length)))
    .map((row) => {
      const cells: PdfLine[][] = table.colXs.map(() => []);
      for (const line of row) {
        for (const run of line.runs) {
          if (!run?.text.replace(/\s+/g, "").length) continue;
          for (const piece of splitRunAcrossColumns(run, table.colXs, rightEdge)) {
            cells[piece.col].push({
              ...line,
              x: piece.run.x,
              w: Math.max(piece.run.w, piece.run.size),
              runs: [piece.run],
            });
          }
        }
      }
      return cells.map((cell) => mergeParagraphLines(combineCellLines(cell)));
    });
}

function tableColWidths(table: PdfTable, pageWidth: number) {
  const maxW = Math.max(2400, ptTwip(pageWidth) - 720);
  const rightEdge = tableRightEdge(table, pageWidth);
  const rights = table.colXs.map((x, index) => {
    if (index < table.colXs.length - 1) return table.colXs[index + 1];
    return rightEdge;
  });
  const raw = table.colXs.map((x, index) => Math.max(360, ptTwip(rights[index] - x)));
  const sum = raw.reduce((n, w) => n + w, 0) || maxW;
  if (sum <= maxW) return raw;
  return raw.map((w) => Math.max(360, Math.round((w / sum) * maxW)));
}

function copyBytes(bytes: Uint8Array) {
  const out = new Uint8Array(bytes.byteLength);
  out.set(bytes);
  return out;
}

async function packFlowDocx(
  pages: Array<{ width: number; height: number; margins: FlowMargins; blocks: FlowBlock[] }>,
) {
  const docx = await import("docx");
  const {
    AlignmentType,
    BorderStyle,
    Document,
    ExternalHyperlink,
    ImageRun,
    LineRuleType,
    Packer,
    Paragraph,
    Table,
    TableCell,
    TableLayoutType,
    TableRow,
    TextRun,
    WidthType,
  } = docx;
  const hair = { style: BorderStyle.SINGLE, size: 4, color: "BFBFBF" };
  const cellBorders = { top: hair, bottom: hair, left: hair, right: hair };

  const textRunFromPdf = (run: PdfRun) =>
    new TextRun({
      text: run.text,
      bold: run.bold,
      italics: run.italic,
      underline: run.underline ? {} : undefined,
      font: run.font || "Arial",
      size: wordHalfPt(run.size),
      color: run.color,
      break: run.breakBefore ? 1 : undefined,
    });

  const paragraphChildren = (line: PdfLine, extra: Array<InstanceType<typeof TextRun>> = []) => {
    const runs = flowRuns(line);
    const children: Array<InstanceType<typeof TextRun> | InstanceType<typeof ExternalHyperlink>> = [...extra];
    if (!runs.length && !extra.length) return [new TextRun({ text: " " })];
    let index = 0;
    while (index < runs.length) {
      const url = runs[index].link;
      if (!url) {
        children.push(textRunFromPdf(runs[index]));
        index += 1;
        continue;
      }
      const group = [];
      while (index < runs.length && runs[index].link === url) {
        group.push(textRunFromPdf(runs[index]));
        index += 1;
      }
      children.push(new ExternalHyperlink({ children: group, link: url }));
    }
    return children.length ? children : [new TextRun({ text: " " })];
  };

  const paraSpacing = (line: PdfLine, gapPt: number, heading: boolean, bullet: boolean) => {
    const lead = line.leadPt || defaultLeadPt(line.size);
    return {
      before: Math.min(heading ? 240 : 120, Math.max(0, ptTwip(Math.max(0, gapPt - (heading ? 2 : 4))))),
      after: heading ? 40 : bullet ? 0 : 0,
      line: Math.max(20, ptTwip(lead)),
      lineRule: LineRuleType.EXACT,
    };
  };

  const paragraphFromLine = (line: PdfLine, marginL: number, pageWidth: number, gapPt: number, forceCenter: boolean) => {
    const stripped = stripBulletLine(line);
    const used = { ...stripped.line, runs: flowRuns(stripped.line), leadPt: line.leadPt || stripped.line.leadPt };
    const contentW = Math.max(40, pageWidth - marginL * 2);
    const leftGap = used.x - marginL;
    const rightGap = pageWidth - marginL - (used.x + used.w);
    const heading = used.size >= 15;
    const centered =
      !stripped.bullet &&
      (forceCenter ||
        (Math.abs(leftGap - rightGap) < Math.max(14, contentW * 0.16) && leftGap > 8 && used.w < contentW * 0.92));
    const longBody = !heading && !stripped.bullet && used.runs.reduce((n, run) => n + run.text.length, 0) > 88;
    const hang = Math.max(240, Math.min(720, ptTwip(Math.max(used.size * 1.35, leftGap || 18))));
    const indent = centered || stripped.bullet ? 0 : Math.max(0, ptTwip(leftGap));
    const bulletSize = wordHalfPt(used.runs[0]?.size || used.size);
    const extra = stripped.bullet
      ? [
          new TextRun({
            text: "• ",
            font: used.runs[0]?.font || "Arial",
            size: bulletSize,
          }),
        ]
      : [];
    return new Paragraph({
      alignment: centered ? AlignmentType.CENTER : longBody ? AlignmentType.JUSTIFIED : AlignmentType.LEFT,
      spacing: paraSpacing(used, gapPt, heading, stripped.bullet),
      indent: stripped.bullet
        ? { left: hang, hanging: hang }
        : !centered && indent > 120
          ? { left: Math.min(indent, 2880) }
          : undefined,
      children: paragraphChildren(used, extra),
    });
  };

  const imageParagraph = (pic: PdfPic, gapPt: number, center: boolean) => {
    const kind = magicKind(pic.bytes) === "jpg" ? "jpg" : "png";
    const image = new ImageRun({
      type: kind,
      data: copyBytes(pic.bytes),
      transformation: {
        width: Math.max(8, Math.round(pic.w * (96 / 72))),
        height: Math.max(8, Math.round(pic.h * (96 / 72))),
      },
    });
    return new Paragraph({
      alignment: center ? AlignmentType.CENTER : AlignmentType.LEFT,
      spacing: { before: Math.max(80, ptTwip(Math.max(0, gapPt))), after: 80 },
      children: pic.link ? [new ExternalHyperlink({ children: [image], link: pic.link })] : [image],
    });
  };

  const tableFromPdf = (table: PdfTable, pageWidth: number, gapPt: number, center: boolean) => {
    const widths = tableColWidths(table, pageWidth);
    const rows = tableCellLines(table, pageWidth).map(
      (row) =>
        new TableRow({
          children: row.map(
            (cell, index) =>
              new TableCell({
                width: { size: widths[index], type: WidthType.DXA },
                borders: cellBorders,
                margins: { top: 40, bottom: 40, left: 60, right: 60, marginUnitType: WidthType.DXA },
                children: cell.length
                  ? cell.map(
                      (line) =>
                        new Paragraph({
                          spacing: {
                            before: 0,
                            after: 0,
                            line: Math.max(20, ptTwip(line.leadPt || defaultLeadPt(line.size))),
                            lineRule: LineRuleType.EXACT,
                          },
                          children: paragraphChildren(line),
                        }),
                    )
                  : [new Paragraph({})],
              }),
          ),
        }),
    );
    const children = [
      ...(gapPt > 3
        ? [
            new Paragraph({
              spacing: { before: Math.min(240, Math.max(0, ptTwip(gapPt))), after: 60 },
            }),
          ]
        : []),
      new Table({
        width: { size: widths.reduce((n, w) => n + w, 0), type: WidthType.DXA },
        columnWidths: widths,
        layout: TableLayoutType.FIXED,
        alignment: center ? AlignmentType.CENTER : AlignmentType.LEFT,
        borders: {
          top: hair,
          bottom: hair,
          left: hair,
          right: hair,
          insideHorizontal: hair,
          insideVertical: hair,
        },
        rows,
      }),
    ];
    return children;
  };

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Arial",
            size: 22,
          },
        },
      },
    },
    sections: pages.map((page) => ({
      properties: {
        page: {
          size: {
            width: ptTwip(page.width),
            height: ptTwip(page.height),
          },
          margin: {
            top: ptTwip(page.margins.t),
            right: ptTwip(page.margins.r),
            bottom: ptTwip(page.margins.b),
            left: ptTwip(page.margins.l),
          },
        },
      },
      children: page.blocks.flatMap((block) => {
        if (block.kind === "para") {
          return [paragraphFromLine(block.line, page.margins.l, page.width, block.gap, block.inheritCenter)];
        }
        if (block.kind === "table") return tableFromPdf(block.table, page.width, block.gap, block.center);
        return [imageParagraph(block.pic, block.gap, block.center)];
      }),
    })),
  });
  return Packer.toBlob(doc);
}

function indexOfOpenTag(xml: string, tag: string, from = 0) {
  let i = from;
  while (i < xml.length) {
    const at = xml.indexOf(`<${tag}`, i);
    if (at < 0) return -1;
    const next = xml.charAt(at + tag.length + 1);
    if (!next || next === " " || next === "\n" || next === "\t" || next === "/" || next === ">") return at;
    i = at + tag.length + 1;
  }
  return -1;
}

function sliceXmlTag(xml: string, tag: string, from = 0) {
  const start = indexOfOpenTag(xml, tag, from);
  if (start < 0) return null;
  const gt = xml.indexOf(">", start);
  if (gt < 0) return null;
  const open = xml.slice(start, gt + 1);
  if (/\/>$/.test(open)) {
    return { start, end: gt + 1, attrs: open, inner: "" };
  }
  const close = `</${tag}>`;
  let depth = 1;
  let i = gt + 1;
  while (i < xml.length && depth > 0) {
    const nextOpen = indexOfOpenTag(xml, tag, i);
    const nextClose = xml.indexOf(close, i);
    if (nextClose < 0) {
      return { start, end: xml.length, attrs: open, inner: xml.slice(gt + 1) };
    }
    if (nextOpen >= 0 && nextOpen < nextClose) {
      depth += 1;
      i = nextOpen + tag.length + 1;
    } else {
      depth -= 1;
      if (depth === 0) {
        return { start, end: nextClose + close.length, attrs: open, inner: xml.slice(gt + 1, nextClose) };
      }
      i = nextClose + close.length;
    }
  }
  return null;
}

function xmlAttr(tag: string, name: string) {
  return tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];
}

function xmlOpenTag(xml: string, tag: string) {
  return sliceXmlTag(xml, tag)?.attrs ?? "";
}

type NativeAlign = "left" | "center" | "right" | "both";
type NativeRun = {
  text: string;
  sizePt: number;
  bold: boolean;
  italic: boolean;
  font: string;
  underline?: boolean;
  link?: string;
};
type NativeImage = { bytes: Uint8Array; widthPt: number; heightPt: number; kind: "png" | "jpg"; link?: string };
type NativePara = {
  kind: "p";
  align: NativeAlign;
  beforePt: number;
  afterPt: number;
  indentPt: number;
  hangingPt: number;
  firstLinePt: number;
  linePt: number;
  lineRule: "auto" | "exact" | "atLeast";
  runs: NativeRun[];
  images: NativeImage[];
  pageBreak: boolean;
};
type NativeTable = { kind: "tbl"; align: NativeAlign; widthsPt: number[]; rows: NativePara[][][] };
type NativeSection = {
  widthPt: number;
  heightPt: number;
  margin: FlowMargins;
  blocks: Array<NativePara | NativeTable>;
};

function wFlagOn(xml: string, tag: string) {
  const match = xml.match(new RegExp(`<${tag}\\b([^>]*)>`));
  if (!match) return false;
  const val = xmlAttr(`<x${match[1]}>`, "w:val");
  return val !== "0" && val !== "false";
}

function parseNativeAlign(xml: string): NativeAlign {
  const jc = xmlAttr(xmlOpenTag(xml, "w:jc"), "w:val") || "left";
  return jc === "center" || jc === "right" || jc === "both" ? jc : "left";
}

function parseHyperlinkRels(xml: string | undefined) {
  const map = new Map<string, string>();
  for (const rel of xml?.match(/<Relationship\b[^>]*>/g) ?? []) {
    const id = rel.match(/\bId="([^"]+)"/)?.[1];
    const target = rel.match(/\bTarget="([^"]+)"/)?.[1];
    const type = rel.match(/\bType="([^"]+)"/)?.[1] ?? "";
    const mode = rel.match(/\bTargetMode="([^"]+)"/)?.[1] ?? "";
    if (!id || !target) continue;
    if (/hyperlink/i.test(type) || mode.toLowerCase() === "external") map.set(id, target);
  }
  return map;
}

function hyperlinkSpans(xml: string, urls: Map<string, string>) {
  const spans: Array<{ start: number; end: number; url: string }> = [];
  let cursor = 0;
  while (cursor < xml.length) {
    const tag = sliceXmlTag(xml, "w:hyperlink", cursor);
    if (!tag) break;
    const id = xmlAttr(tag.attrs, "r:id");
    const url = (id && urls.get(id)) || "";
    if (url) spans.push({ start: tag.start, end: tag.end, url });
    cursor = tag.end;
  }
  for (const match of xml.matchAll(/HYPERLINK\s+"([^"]+)"/gi)) {
    const url = match[1];
    const at = match.index ?? 0;
    if (url) spans.push({ start: Math.max(0, at - 80), end: Math.min(xml.length, at + 400), url });
  }
  return spans;
}

function urlAt(spans: Array<{ start: number; end: number; url: string }>, pos: number) {
  return spans.find((span) => pos >= span.start && pos < span.end)?.url;
}

function parseNativePara(xml: string, images: Map<string, NativeImage>, links: Map<string, string> = new Map()): NativePara {
  const pr = sliceXmlTag(xml, "w:pPr")?.inner ?? "";
  const spacing = xmlOpenTag(pr, "w:spacing");
  const ind = xmlOpenTag(pr, "w:ind");
  const lineRuleRaw = xmlAttr(spacing, "w:lineRule") || "auto";
  const hrefs = hyperlinkSpans(xml, links);
  const runs: NativeRun[] = [];
  let cursor = 0;
  while (cursor < xml.length) {
    const run = sliceXmlTag(xml, "w:r", cursor);
    if (!run) break;
    cursor = run.end;
    const rPr = sliceXmlTag(run.inner, "w:rPr")?.inner ?? "";
    const fontsTag = xmlOpenTag(rPr, "w:rFonts");
    const size =
      Number(xmlAttr(xmlOpenTag(rPr, "w:sz"), "w:val") ?? xmlAttr(xmlOpenTag(rPr, "w:szCs"), "w:val") ?? "22") / 2;
    const font = xmlAttr(fontsTag, "w:ascii") || xmlAttr(fontsTag, "w:hAnsi") || "Arial";
    const uTag = xmlOpenTag(rPr, "w:u");
    const texts = [...run.inner.matchAll(/<w:t\b[^>]*>([\s\S]*?)<\/w:t>/g)].map((item) => unescapeXml(item[1]));
    const text = texts.join("");
    if (text) {
      runs.push({
        text,
        sizePt: Number.isFinite(size) && size > 0 ? size : 11,
        bold: wFlagOn(rPr, "w:b"),
        italic: wFlagOn(rPr, "w:i"),
        font,
        underline: !!uTag && xmlAttr(uTag, "w:val") !== "none",
        link: urlAt(hrefs, run.start),
      });
    }
  }
  const paraImages: NativeImage[] = [];
  for (const drawing of xml.match(/<w:drawing\b[\s\S]*?<\/w:drawing>/g) ?? []) {
    const embed = drawing.match(/r:embed="([^"]+)"/)?.[1];
    if (!embed) continue;
    const image = images.get(embed);
    if (!image) continue;
    const cx = Number(drawing.match(/\bcx="(\d+)"/)?.[1] ?? 0);
    const cy = Number(drawing.match(/\bcy="(\d+)"/)?.[1] ?? 0);
    const at = xml.indexOf(drawing);
    paraImages.push({
      ...image,
      widthPt: cx ? cx / 12700 : image.widthPt || 180,
      heightPt: cy ? cy / 12700 : image.heightPt || 120,
      link: urlAt(hrefs, at) || image.link,
    });
  }
  return {
    kind: "p",
    align: parseNativeAlign(pr),
    beforePt: Number(xmlAttr(spacing, "w:before") ?? "0") / 20,
    afterPt: Number(xmlAttr(spacing, "w:after") ?? "0") / 20,
    indentPt: Number(xmlAttr(ind, "w:left") ?? "0") / 20,
    hangingPt: Number(xmlAttr(ind, "w:hanging") ?? "0") / 20,
    firstLinePt: Number(xmlAttr(ind, "w:firstLine") ?? "0") / 20,
    linePt: Number(xmlAttr(spacing, "w:line") ?? "240"),
    lineRule: lineRuleRaw === "exact" || lineRuleRaw === "atLeast" ? lineRuleRaw : "auto",
    runs,
    images: paraImages,
    pageBreak: /<w:br\b[^>]*w:type="page"/.test(xml),
  };
}

function parseNativeTable(xml: string, images: Map<string, NativeImage>, links: Map<string, string> = new Map()): NativeTable {
  const tblPr = sliceXmlTag(xml, "w:tblPr")?.inner ?? "";
  const grid = [...xml.matchAll(/<w:gridCol\b[^>]*>/g)].map((item) => Number(xmlAttr(item[0], "w:w") ?? "1440") / 20);
  const rows: NativePara[][][] = [];
  let cursor = 0;
  while (cursor < xml.length) {
    const row = sliceXmlTag(xml, "w:tr", cursor);
    if (!row) break;
    cursor = row.end;
    const cells: NativePara[][] = [];
    let cellAt = 0;
    while (cellAt < row.inner.length) {
      const cell = sliceXmlTag(row.inner, "w:tc", cellAt);
      if (!cell) break;
      cellAt = cell.end;
      const paras: NativePara[] = [];
      let pAt = 0;
      while (pAt < cell.inner.length) {
        const p = sliceXmlTag(cell.inner, "w:p", pAt);
        if (!p) break;
        pAt = p.end;
        paras.push(parseNativePara(p.inner, images, links));
      }
      cells.push(paras.length ? paras : [parseNativePara("", images, links)]);
    }
    if (cells.length) rows.push(cells);
  }
  const colCount = Math.max(grid.length, ...rows.map((row) => row.length), 1);
  const widthsPt = Array.from({ length: colCount }, (_, i) => grid[i] || 72);
  return { kind: "tbl", align: parseNativeAlign(tblPr), widthsPt, rows };
}

function parseNativeSections(
  docXml: string,
  images: Map<string, NativeImage>,
  links: Map<string, string> = new Map(),
): NativeSection[] {
  const body = docXml.match(/<w:body>([\s\S]*)<\/w:body>/)?.[1] ?? "";
  const chunks: Array<{ xml: string; sect: string }> = [];
  const re = /<w:sectPr\b[\s\S]*?<\/w:sectPr>/g;
  let last = 0;
  let match: RegExpExecArray | null = re.exec(body);
  while (match) {
    chunks.push({ xml: body.slice(last, match.index), sect: match[0] });
    last = match.index + match[0].length;
    match = re.exec(body);
  }
  if (!chunks.length) chunks.push({ xml: body, sect: "" });
  return chunks.map((chunk) => {
    const widthPt = Number(xmlAttr(chunk.sect.match(/<w:pgSz\b[^/]*\/>/)?.[0] ?? "", "w:w") ?? "11906") / 20;
    const heightPt = Number(xmlAttr(chunk.sect.match(/<w:pgSz\b[^/]*\/>/)?.[0] ?? "", "w:h") ?? "16838") / 20;
    const mar = chunk.sect.match(/<w:pgMar\b[^/]*\/>/)?.[0] ?? "";
    const margin = {
      t: Number(xmlAttr(mar, "w:top") ?? "1134") / 20,
      r: Number(xmlAttr(mar, "w:right") ?? "1134") / 20,
      b: Number(xmlAttr(mar, "w:bottom") ?? "1134") / 20,
      l: Number(xmlAttr(mar, "w:left") ?? "1134") / 20,
    };
    const blocks: Array<NativePara | NativeTable> = [];
    let cursor = 0;
    while (cursor < chunk.xml.length) {
      const tblAt = indexOfOpenTag(chunk.xml, "w:tbl", cursor);
      const pAt = indexOfOpenTag(chunk.xml, "w:p", cursor);
      if (tblAt < 0 && pAt < 0) break;
      if (tblAt >= 0 && (pAt < 0 || tblAt < pAt)) {
        const tbl = sliceXmlTag(chunk.xml, "w:tbl", tblAt);
        if (!tbl) break;
        blocks.push(parseNativeTable(tbl.inner, images, links));
        cursor = tbl.end;
      } else {
        const p = sliceXmlTag(chunk.xml, "w:p", pAt);
        if (!p) break;
        blocks.push(parseNativePara(p.inner, images, links));
        cursor = p.end;
      }
    }
    return { widthPt, heightPt, margin, blocks };
  });
}

function pdfSafeText(value: string) {
  return value
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u2022\u2023\u25cf\u25e6\u2219]/g, "\u00b7")
    .replace(/\u00a0/g, " ")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "");
}

type FontSet = {
  regular: PDFFont;
  bold: PDFFont;
  italic: PDFFont;
  boldItalic: PDFFont;
};
type PdfTypeFonts = { sans: FontSet; serif: FontSet; mono: FontSet };

async function embedPdfTypeFonts(pdf: PDFDocument): Promise<PdfTypeFonts> {
  return {
    sans: {
      regular: await pdf.embedFont(StandardFonts.Helvetica),
      bold: await pdf.embedFont(StandardFonts.HelveticaBold),
      italic: await pdf.embedFont(StandardFonts.HelveticaOblique),
      boldItalic: await pdf.embedFont(StandardFonts.HelveticaBoldOblique),
    },
    serif: {
      regular: await pdf.embedFont(StandardFonts.TimesRoman),
      bold: await pdf.embedFont(StandardFonts.TimesRomanBold),
      italic: await pdf.embedFont(StandardFonts.TimesRomanItalic),
      boldItalic: await pdf.embedFont(StandardFonts.TimesRomanBoldItalic),
    },
    mono: {
      regular: await pdf.embedFont(StandardFonts.Courier),
      bold: await pdf.embedFont(StandardFonts.CourierBold),
      italic: await pdf.embedFont(StandardFonts.CourierOblique),
      boldItalic: await pdf.embedFont(StandardFonts.CourierBoldOblique),
    },
  };
}

function fontSetFor(fonts: PdfTypeFonts, name: string) {
  if (/courier|consolas|mono|menlo|lucida console/i.test(name)) return fonts.mono;
  if (/times|georgia|garamond|cambria|palatino|serif/i.test(name)) return fonts.serif;
  return fonts.sans;
}

function pickFont(fonts: PdfTypeFonts, run: { bold: boolean; italic: boolean; font: string }) {
  const set = fontSetFor(fonts, run.font);
  if (run.bold && run.italic) return set.boldItalic;
  if (run.bold) return set.bold;
  if (run.italic) return set.italic;
  return set.regular;
}

function wrapWidthFactor(fontName: string) {
  if (/courier|consolas|mono/i.test(fontName)) return 1;
  if (/times|georgia|garamond|cambria|serif/i.test(fontName)) return 1;
  if (/calibri|candara|segoe/i.test(fontName)) return 1.1;
  return 1.06;
}

function paraIndents(para: NativePara) {
  const rest = Math.max(0, para.indentPt);
  const first =
    para.hangingPt > 0 ? Math.max(0, para.indentPt - para.hangingPt) : Math.max(0, para.indentPt + para.firstLinePt);
  return { first, rest };
}

function nativeLineHeight(para: NativePara, size: number) {
  const sizePt = Math.max(1, size);
  if (para.lineRule === "exact" && para.linePt > 0) return Math.max(sizePt * 0.85, para.linePt / 20);
  if (para.lineRule === "atLeast" && para.linePt > 0) return Math.max(sizePt * 1.15, para.linePt / 20);
  const mult = para.linePt > 0 ? para.linePt / 240 : 1;
  return sizePt * 1.15 * mult;
}

function alignedX(align: NativeAlign, left: number, width: number, content: number) {
  if (align === "center") return left + Math.max(0, (width - content) / 2);
  if (align === "right") return left + Math.max(0, width - content);
  return left;
}

function measureText(font: PDFFont, text: string, size: number) {
  const safe = pdfSafeText(text);
  try {
    return font.widthOfTextAtSize(safe, size);
  } catch {
    const ascii = safe.replace(/[^\x00-\x7f]/g, "?");
    return font.widthOfTextAtSize(ascii, size);
  }
}

function drawPdfText(page: PDFPage, font: PDFFont, text: string, x: number, y: number, size: number) {
  const safe = pdfSafeText(text);
  try {
    page.drawText(safe, { x, y, size, font, color: rgb(0.12, 0.12, 0.12) });
  } catch {
    page.drawText(safe.replace(/[^\x00-\x7f]/g, "?"), { x, y, size, font, color: rgb(0.12, 0.12, 0.12) });
  }
}

type LaidSpan = {
  text: string;
  sizePt: number;
  bold: boolean;
  italic: boolean;
  font: string;
  underline?: boolean;
  link?: string;
};

function wrapNativeRuns(
  runs: NativeRun[],
  fonts: PdfTypeFonts,
  firstWidth: number,
  restWidth = firstWidth,
) {
  const words: LaidSpan[] = [];
  for (const run of runs) {
    const parts = pdfSafeText(run.text).split(/(\s+)/);
    for (const part of parts) {
      if (!part) continue;
      words.push({
        text: part,
        sizePt: run.sizePt,
        bold: run.bold,
        italic: run.italic,
        font: run.font,
        underline: run.underline,
        link: run.link,
      });
    }
  }
  const lines: LaidSpan[][] = [];
  let current: LaidSpan[] = [];
  let width = 0;
  const limitFor = () => Math.max(24, lines.length ? restWidth : firstWidth);
  const push = () => {
    while (current.length && /^\s+$/.test(current[0].text)) current.shift();
    while (current.length && /^\s+$/.test(current[current.length - 1].text)) current.pop();
    if (current.length) lines.push(current);
    current = [];
    width = 0;
  };
  for (const word of words) {
    const font = pickFont(fonts, word);
    const w = measureText(font, word.text, word.sizePt) * wrapWidthFactor(word.font);
    if (current.length && width + w > limitFor() && !/^\s+$/.test(word.text)) push();
    current.push(word);
    width += w;
  }
  push();
  return lines.length ? lines : [[]];
}

async function wordDocxToPdfNative(zip: JSZip, name: string): Promise<ConvertedFile | null> {
  const docXml = await zipEntry(zip, "word/document.xml")?.async("string");
  if (!docXml) return null;
  const relsXml = await zipEntry(zip, "word/_rels/document.xml.rels")?.async("string");
  const rels = parseRels(relsXml, "word/");
  const hyperlinks = parseHyperlinkRels(relsXml);
  const images = new Map<string, NativeImage>();
  for (const [id, target] of rels) {
    if (!/media\//i.test(target) && !/\.(png|jpe?g|gif|bmp)$/i.test(target)) continue;
    const bytes = await zipEntry(zip, target)?.async("uint8array");
    if (!bytes) continue;
    images.set(id, {
      bytes,
      widthPt: 0,
      heightPt: 0,
      kind: magicKind(bytes) === "jpg" ? "jpg" : "png",
    });
  }
  const withSize = new Map<string, NativeImage>();
  for (const drawing of docXml.match(/<w:drawing\b[\s\S]*?<\/w:drawing>/g) ?? []) {
    const embed = drawing.match(/r:embed="([^"]+)"/)?.[1];
    const cx = Number(drawing.match(/\bcx="(\d+)"/)?.[1] ?? 0);
    const cy = Number(drawing.match(/\bcy="(\d+)"/)?.[1] ?? 0);
    const image = embed ? images.get(embed) : undefined;
    if (!embed || !image) continue;
    withSize.set(embed, {
      ...image,
      widthPt: cx ? cx / 12700 : 180,
      heightPt: cy ? cy / 12700 : 120,
    });
  }
  const sections = parseNativeSections(docXml, withSize.size ? withSize : images, hyperlinks);
  const hasContent = sections.some((section) =>
    section.blocks.some((block) => {
      if (block.kind === "tbl") return block.rows.length > 0;
      return block.runs.some((run) => run.text.trim()) || block.images.length > 0;
    }),
  );
  if (!hasContent) return null;

  const pdf = await PDFDocument.create();
  const fonts = await embedPdfTypeFonts(pdf);
  const pngCache = new Map<string, Awaited<ReturnType<PDFDocument["embedPng"]>>>();
  const jpgCache = new Map<string, Awaited<ReturnType<PDFDocument["embedJpg"]>>>();

  const embedImage = async (image: NativeImage) => {
    const key = `${image.kind}:${image.bytes.byteLength}:${image.bytes[0]}:${image.bytes[20] ?? 0}`;
    if (image.kind === "jpg") {
      const hit = jpgCache.get(key);
      if (hit) return hit;
      const embedded = await pdf.embedJpg(copyBytes(image.bytes));
      jpgCache.set(key, embedded);
      return embedded;
    }
    const hit = pngCache.get(key);
    if (hit) return hit;
    const embedded = await pdf.embedPng(copyBytes(image.bytes));
    pngCache.set(key, embedded);
    return embedded;
  };

  for (const section of sections) {
    const pageW = section.widthPt || 595.28;
    const pageH = section.heightPt || 841.89;
    const margin = section.margin;
    let page = pdf.addPage([pageW, pageH]);
    let cursor = margin.t;
    const contentW = Math.max(40, pageW - margin.l - margin.r);

    const ensure = (need: number) => {
      if (cursor + need <= pageH - margin.b) return;
      page = pdf.addPage([pageW, pageH]);
      cursor = margin.t;
    };

    const drawPara = async (para: NativePara, left: number, width: number) => {
      if (para.pageBreak) {
        const hasContent = para.runs.some((run) => run.text.trim()) || para.images.length > 0;
        if (cursor > margin.t + 1) {
          page = pdf.addPage([pageW, pageH]);
          cursor = margin.t;
        }
        if (!hasContent) {
          cursor += Math.max(0, para.afterPt);
          return;
        }
      }
      cursor += Math.max(0, para.beforePt);
      for (const image of para.images) {
        let w = image.widthPt || width;
        let h = image.heightPt || w * 0.6;
        if (w > width) {
          h *= width / w;
          w = width;
        }
        ensure(h);
        const embedded = await embedImage(image);
        const imgX = alignedX(para.align, left, width, w);
        const imgY = pageH - cursor - h;
        page.drawImage(embedded, {
          x: imgX,
          y: imgY,
          width: w,
          height: h,
        });
        if (image.link) addPdfUriLink(page, imgX, imgY, w, h, image.link);
        cursor += h;
      }
      if (!para.runs.some((run) => run.text.trim())) {
        cursor += Math.max(0, para.afterPt);
        return;
      }
      const indents = paraIndents(para);
      const firstWidth = Math.max(24, width - indents.first);
      const restWidth = Math.max(24, width - indents.rest);
      const lines = wrapNativeRuns(para.runs, fonts, firstWidth, restWidth);
      for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i];
        const size = line[0]?.sizePt || para.runs[0]?.sizePt || 11;
        const lineH = nativeLineHeight(para, size);
        ensure(lineH);
        const y = pageH - cursor - size;
        const widths = line.map((span) => measureText(pickFont(fonts, span), span.text, span.sizePt));
        const textW = widths.reduce((n, w) => n + w, 0);
        const indent = i === 0 ? indents.first : indents.rest;
        const avail = Math.max(24, width - indent);
        let x = alignedX(para.align === "both" ? "left" : para.align, left + indent, avail, textW);
        const extra =
          para.align === "both" && i < lines.length - 1
            ? Math.max(0, avail - textW) /
              Math.max(
                1,
                line.filter((span) => /^\s+$/.test(span.text)).length,
              )
            : 0;
        line.forEach((span, index) => {
          const spanW = widths[index];
          drawPdfText(page, pickFont(fonts, span), span.text, x, y, span.sizePt);
          if (span.underline) {
            page.drawLine({
              start: { x, y: y - 1 },
              end: { x: x + spanW, y: y - 1 },
              thickness: 0.6,
              color: rgb(0.12, 0.12, 0.12),
            });
          }
          if (span.link && !/^\s+$/.test(span.text)) {
            addPdfUriLink(page, x, y - span.sizePt * 0.25, spanW, span.sizePt * 1.1, span.link);
          }
          x += spanW + (/^\s+$/.test(span.text) ? extra : 0);
        });
        cursor += lineH;
      }
      cursor += Math.max(0, para.afterPt);
    };

    const drawTable = async (table: NativeTable) => {
      const sum = table.widthsPt.reduce((n, w) => n + w, 0) || contentW;
      const scale = Math.min(1, contentW / sum);
      const widths = table.widthsPt.map((w) => w * scale);
      const tableW = widths.reduce((n, w) => n + w, 0);
      const originX = alignedX(table.align, margin.l, contentW, tableW);
      const border = rgb(0.75, 0.75, 0.75);
      for (const row of table.rows) {
        const cellHeights = row.map((cell, index) => {
          const inner = Math.max(18, widths[index] - 8);
          return cell.reduce((h, para) => {
            const indents = paraIndents(para);
            const lines = wrapNativeRuns(
              para.runs,
              fonts,
              Math.max(12, inner - indents.first),
              Math.max(12, inner - indents.rest),
            );
            const size = para.runs[0]?.sizePt || 11;
            return h + para.beforePt + para.afterPt + Math.max(1, lines.length) * nativeLineHeight(para, size);
          }, 10);
        });
        const rowH = Math.max(18, ...cellHeights);
        ensure(rowH);
        let x = originX;
        const top = pageH - cursor;
        row.forEach((cell, index) => {
          const w = widths[index] || 48;
          page.drawRectangle({
            x,
            y: top - rowH,
            width: w,
            height: rowH,
            color: rgb(1, 1, 1),
            borderWidth: 0.5,
            borderColor: border,
          });
          x += w;
        });
        const saved = cursor;
        let xPos = originX;
        for (let i = 0; i < row.length; i += 1) {
          cursor = saved + 4;
          for (const para of row[i]) await drawPara(para, xPos + 4, Math.max(12, (widths[i] || 48) - 8));
          xPos += widths[i] || 48;
        }
        cursor = saved + rowH;
      }
    };

    for (const block of section.blocks) {
      if (block.kind === "tbl") await drawTable(block);
      else await drawPara(block, margin.l, contentW);
    }
  }

  if (pdf.getPageCount() === 0) return null;
  return { blob: pdfBlob(await pdf.save()), name };
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
  const pages: Array<{ width: number; height: number; margins: FlowMargins; blocks: FlowBlock[] }> = [];

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
    const extractedLinesUnscaled = attachLineLeading(buildPdfLines(collectPdfRuns(content.items, viewport.height)));
    const pageLinks = libPage ? extractPdfPageLinks(libPage, viewport.height) : [];
    applyLinksToLines(extractedLinesUnscaled, pageLinks);
    const extractedLines = extractedLinesUnscaled.map((line) => scaleLine(line, scale));
    const fromOps = await extractPdfFills(page, viewport.width, viewport.height);
    const fromContent = parsePdfGraphics(contentText, viewport.width, viewport.height);
    const fills = uniqueLayout([...fromOps.fills, ...fromContent.fills]);
    const draws = uniqueLayout([...fromOps.draws, ...fromContent.draws]);
    const rawPictures = (await extractPdfPictures(page, viewport.width, viewport.height, contentText)).filter(
      (pic) => !isFullPageArt(pic, viewport.width, viewport.height),
    );
    const canvas = await renderPdfPageCanvas(page, 2);
    const foundCharts = detectBarCharts(fills, extractedLinesUnscaled, viewport.width, viewport.height);
    const extraPics = await graphicsFromDraws(
      draws,
      fills,
      canvas,
      viewport.width,
      viewport.height,
      rawPictures,
      extractedLinesUnscaled,
    );
    for (const chart of foundCharts) {
      if (!canvas || extraPics.some((pic) => boxesOverlap(pic, chart, 24))) continue;
      const crop = clipPageBox(
        expandToLabels(unionBox([chart], 12), extractedLinesUnscaled),
        viewport.width,
        viewport.height,
      );
      const png = await cropCanvasToPng(canvas, crop.x, crop.y, crop.w, crop.h, 2);
      if (png) extraPics.push({ ...crop, bytes: png });
    }
    const pictures = [...rawPictures, ...extraPics].map((pic) => scaleLayout(pic, scale));
    applyLinksToPics(
      pictures,
      pageLinks.map((link) => scaleLayout(link, scale)),
    );
    const scaledDraws = draws.map((draw) => scaleLayout(draw, scale));

    let lines = extractedLines;
    const extractedText = extractedLines.map((line) => line.runs.map((run) => run.text).join("")).join("\n");
    if (!extractedText.replace(/\s+/g, "").length) {
      const ocrLines = (await ocrPdfLines(page)).map((line) => scaleLine(line, scale));
      if (ocrLines.length) lines = ocrLines;
    }

    const laid = layoutExactFlow(lines, pictures, scaledDraws, pageW, pageH);
    pages.push({ width: pageW, height: pageH, margins: laid.margins, blocks: laid.blocks });
  }

  return {
    blob: await packFlowDocx(pages),
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
  const orig = new Uint8Array(await file.arrayBuffer());
  try {
    const zip = await JSZip.loadAsync(orig);
    await rasterizeWordCharts(zip);
    const native = await wordDocxToPdfNative(zip, `${baseName(file)}.pdf`);
    if (native) return native;
  } catch {
    /* fall through to full-document preview */
  }
  const host = document.createElement("div");
  host.style.cssText =
    "position:fixed;left:-18000px;top:0;background:#ffffff;z-index:-1;";
  document.body.appendChild(host);
  try {
    const { renderAsync } = await import("docx-preview");
    await renderAsync(orig, host, host, previewOptions());
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

type XlFont = { size: number; bold: boolean; name: string; color: string };
type XlFill = { color: string };
type XlBorder = { color: string; width: number; sides: { t: boolean; r: boolean; b: boolean; l: boolean } };
type XlXf = {
  font: XlFont;
  fill: XlFill;
  border: XlBorder;
  numFmtId: number;
  numFmt: string;
  align: string;
  valign: string;
};
type XlCell = { text: string; xf: number; colspan: number; numeric: boolean };

function xlRgb(raw?: string) {
  if (!raw) return "";
  const hex = raw.replace(/^FF/i, "");
  return /^[0-9A-F]{6}$/i.test(hex) ? `#${hex}` : "";
}

function xlColor(tag: string, fallback = "#222222") {
  const rgb = tag.match(/\brgb="([^"]+)"/)?.[1];
  if (rgb) return xlRgb(rgb) || fallback;
  const theme = tag.match(/\btheme="([^"]+)"/)?.[1];
  if (theme === "1" || theme === "0") return "#000000";
  return fallback;
}

function parseXlFonts(xml: string): XlFont[] {
  return [...xml.matchAll(/<font\b[\s\S]*?<\/font>/g)].map((item) => {
    const block = item[0];
    const colorTag = block.match(/<color\b[^>]*>/)?.[0] ?? "";
    return {
      size: Number(block.match(/<sz\b[^>]*val="([^"]+)"/)?.[1] ?? "11"),
      bold: /<b\b/.test(block),
      name: block.match(/<name\b[^>]*val="([^"]+)"/)?.[1] || "Calibri",
      color: xlColor(colorTag),
    };
  });
}

function parseXlFills(xml: string): XlFill[] {
  return [...xml.matchAll(/<fill\b[\s\S]*?<\/fill>/g)].map((item) => {
    const fg = item[0].match(/<fgColor\b[^>]*>/)?.[0] ?? "";
    const solid = /patternType="solid"/.test(item[0]);
    return { color: solid ? xlColor(fg, "") : "" };
  });
}

function parseXlBorders(xml: string): XlBorder[] {
  return [...xml.matchAll(/<border\b[\s\S]*?<\/border>/g)].map((item) => {
    const block = item[0];
    const side = (name: string) => {
      const tag = block.match(new RegExp(`<${name}\\b[^>]*`))?.[0] ?? "";
      const style = tag.match(/\bstyle="([^"]+)"/)?.[1] ?? "";
      const colorTag = block.match(new RegExp(`<${name}\\b[\\s\\S]*?<color\\b[^>]*>`))?.[0] ?? tag;
      return { on: !!style && style !== "none", style, color: xlColor(colorTag, "#d9d9d9") };
    };
    const t = side("top");
    const r = side("right");
    const b = side("bottom");
    const l = side("left");
    const any = [t, r, b, l].find((item) => item.on);
    return {
      color: any?.color || "#d9d9d9",
      width: [t, r, b, l].some((item) => item.style === "medium" || item.style === "thick") ? 2 : 1,
      sides: { t: t.on, r: r.on, b: b.on, l: l.on },
    };
  });
}

function parseXlNumFmts(xml: string) {
  const map = new Map<number, string>([
    [14, "m/d/yyyy"],
    [15, "d-mmm-yy"],
    [16, "d-mmm"],
    [17, "mmm-yy"],
    [22, "m/d/yyyy h:mm"],
  ]);
  for (const tag of xml.match(/<numFmt\b[^>]*>/g) ?? []) {
    const id = Number(tag.match(/\bnumFmtId="([^"]+)"/)?.[1] ?? "0");
    const code = tag.match(/\bformatCode="([^"]+)"/)?.[1] ?? "";
    if (id) map.set(id, code.replace(/&quot;/g, '"'));
  }
  return map;
}

function parseXlXfs(
  xml: string,
  fonts: XlFont[],
  fills: XlFill[],
  borders: XlBorder[],
  numFmts: Map<number, string>,
): XlXf[] {
  const fallback: XlFont = { size: 11, bold: false, name: "Calibri", color: "#222222" };
  const xfsXml = xml.match(/<cellXfs\b[\s\S]*?<\/cellXfs>/)?.[0] ?? "";
  return [...xfsXml.matchAll(/<xf\b[\s\S]*?(?:\/>|<\/xf>)/g)].map((item) => {
    const tag = item[0];
    const fontId = Number(tag.match(/\bfontId="(\d+)"/)?.[1] ?? "0");
    const fillId = Number(tag.match(/\bfillId="(\d+)"/)?.[1] ?? "0");
    const borderId = Number(tag.match(/\bborderId="(\d+)"/)?.[1] ?? "0");
    const numFmtId = Number(tag.match(/\bnumFmtId="(\d+)"/)?.[1] ?? "0");
    const alignTag = tag.match(/<alignment\b[^>]*>/)?.[0] ?? "";
    return {
      font: fonts[fontId] || fallback,
      fill: fills[fillId] || { color: "" },
      border: borders[borderId] || { color: "#d9d9d9", width: 0, sides: { t: false, r: false, b: false, l: false } },
      numFmtId,
      numFmt: numFmts.get(numFmtId) || "",
      align: alignTag.match(/\bhorizontal="([^"]+)"/)?.[1] || "left",
      valign: alignTag.match(/\bvertical="([^"]+)"/)?.[1] || "center",
    };
  });
}

function excelSerialDate(value: number) {
  const utc = Date.UTC(1899, 11, 30) + Math.round(value) * 86400000;
  const d = new Date(utc);
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}/${d.getUTCFullYear()}`;
}

function formatXlValue(raw: string, xf: XlXf | undefined, type: string) {
  if (type === "s" || type === "inlineStr" || type === "str") return raw;
  if (!raw) return "";
  const n = Number(raw);
  if (!Number.isFinite(n)) return raw;
  const fmt = xf?.numFmt || "";
  const builtInDate = !!xf && [14, 15, 16, 17, 22].includes(xf.numFmtId);
  const customDate = /[dy]/i.test(fmt) && !/%/.test(fmt);
  if ((builtInDate || customDate) && n >= 1 && n < 2958466) return excelSerialDate(n);
  if (/%/.test(fmt)) return `${Math.round(n * 1000) / 10}%`;
  if (/,/.test(fmt) && /[#0]/.test(fmt)) return n.toLocaleString("en-US");
  if (Number.isInteger(n)) return String(n);
  return String(n);
}

function excelColPx(width: number) {
  return Math.max(28, Math.round(width * 8.2 + 14));
}

function excelRowPx(ht: number, fontPt: number, empty: boolean) {
  const base = ht * (96 / 72);
  if (empty) return Math.max(12, Math.round(base));
  return Math.max(Math.round(base), Math.round(fontPt * (96 / 72) + 6));
}

function parseXlCols(sheet: string, lastCol: number) {
  const widths = Array.from({ length: Math.max(1, lastCol) }, () => excelColPx(8.83));
  for (const tag of sheet.match(/<col\b[^>]*>/g) ?? []) {
    const min = Number(tag.match(/\bmin="(\d+)"/)?.[1] ?? "1") - 1;
    const max = Number(tag.match(/\bmax="(\d+)"/)?.[1] ?? String(min + 1)) - 1;
    const width = Number(tag.match(/\bwidth="([^"]+)"/)?.[1] ?? "8.83");
    const px = excelColPx(width);
    for (let i = min; i <= max && i < 64; i += 1) {
      while (widths.length <= i) widths.push(excelColPx(8.83));
      widths[i] = px;
    }
  }
  return widths.slice(0, Math.max(1, lastCol));
}

function parseXlCells(rowXml: string, strings: string[], xfs: XlXf[]) {
  const cells: Array<{ col: number; text: string; xf: number; numeric: boolean }> = [];
  const re = /<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(rowXml))) {
    const attrs = match[1] ?? "";
    const inner = match[2] ?? "";
    const ref = attrs.match(/\br="([A-Z]+\d+)"/i)?.[1] ?? "";
    const col = colIndex(ref);
    const xf = Number(attrs.match(/\bs="(\d+)"/)?.[1] ?? "0");
    const type = attrs.match(/\bt="([^"]+)"/)?.[1] ?? "";
    const raw = type === "inlineStr" ? xmlTags(inner, "t").join("") : xmlTags(inner, "v")[0] ?? "";
    const text = type === "s" ? (strings[Number(raw)] ?? "") : formatXlValue(raw, xfs[xf], type);
    const numeric =
      type !== "s" &&
      type !== "inlineStr" &&
      type !== "str" &&
      raw !== "" &&
      Number.isFinite(Number(raw));
    cells.push({ col, text, xf, numeric });
  }
  return cells.sort((a, b) => a.col - b.col);
}

function collapseCenter(cells: XlCell[], xfs: XlXf[]) {
  const out: XlCell[] = [];
  for (let i = 0; i < cells.length; ) {
    const cell = cells[i];
    const align = xfs[cell.xf]?.align || "";
    let span = 1;
    if (align === "centerContinuous" && cell.text) {
      while (i + span < cells.length && !cells[i + span].text) {
        const nextAlign = xfs[cells[i + span].xf]?.align || "";
        if (nextAlign !== "centerContinuous" && cells[i + span].xf !== cell.xf) break;
        span += 1;
      }
    }
    out.push({ ...cell, colspan: span });
    i += span;
  }
  return out;
}

function sheetGrid(sheet: string, strings: string[], xfs: XlXf[]) {
  const used: Array<{
    row: number;
    height: number;
    cells: Array<{ col: number; text: string; xf: number; numeric: boolean }>;
  }> = [];
  let minCol = Infinity;
  let lastCol = 1;
  for (const rowXml of sheet.match(/<row\b[\s\S]*?<\/row>/g) ?? []) {
    const row = Number(rowXml.match(/\br="(\d+)"/)?.[1] ?? String(used.length + 1));
    const ht = Number(rowXml.match(/\bht="([^"]+)"/)?.[1] ?? "15");
    const parsed = parseXlCells(rowXml, strings, xfs);
    for (const cell of parsed) {
      minCol = Math.min(minCol, cell.col);
      lastCol = Math.max(lastCol, cell.col + 1);
    }
    used.push({ row, height: ht, cells: parsed });
  }
  if (!Number.isFinite(minCol)) minCol = 0;
  const minRow = used[0]?.row ?? 1;
  const maxRow = used[used.length - 1]?.row ?? minRow;
  const byRow = new Map(used.map((item) => [item.row, item]));
  const rows: Array<{ height: number; cells: XlCell[] }> = [];
  for (let r = minRow; r <= maxRow; r += 1) {
    const hit = byRow.get(r);
    const cells: XlCell[] = Array.from({ length: lastCol - minCol }, (_, i) => {
      const found = hit?.cells.find((cell) => cell.col === minCol + i);
      return { text: found?.text ?? "", xf: found?.xf ?? 0, colspan: 1, numeric: found?.numeric ?? false };
    });
    rows.push({ height: hit?.height ?? 15, cells: collapseCenter(cells, xfs) });
  }
  return { rows, lastCol, minCol };
}

function xlHAlign(xf: XlXf | undefined, numeric = false) {
  if (!xf) return "left";
  let align =
    xf.align === "center" || xf.align === "centerContinuous" ? "center" : xf.align === "right" ? "right" : "left";
  if (numeric && align === "left") align = "right";
  return align;
}

function xlCellCss(xf: XlXf | undefined, numeric = false) {
  const align = xlHAlign(xf, numeric);
  const b = xf?.border;
  const border =
    b?.width
      ? [
          b.sides.t ? `border-top:${b.width}px solid ${b.color}` : "",
          b.sides.r ? `border-right:${b.width}px solid ${b.color}` : "",
          b.sides.b ? `border-bottom:${b.width}px solid ${b.color}` : "",
          b.sides.l ? `border-left:${b.width}px solid ${b.color}` : "",
        ]
          .filter(Boolean)
          .join(";")
      : "";
  return [
    `font-family:${xf?.font.name || "Calibri"},Calibri,Arial,sans-serif`,
    `font-size:${xf?.font.size || 11}pt`,
    xf?.font.bold ? "font-weight:700" : "font-weight:400",
    `color:${xf?.font.color || "#222222"}`,
    xf?.fill.color ? `background:${xf.fill.color}` : "",
    `text-align:${align}`,
    "vertical-align:top",
    "padding:0 8px",
    "white-space:nowrap",
    "box-sizing:border-box",
    border,
  ]
    .filter(Boolean)
    .join(";");
}

function xlVMid(xf: XlXf | undefined, h: number) {
  const fontPx = (xf?.font.size || 11) * (96 / 72);
  return Math.max(0, Math.round(h / 2 - fontPx * 0.28));
}

function sheetToHtml(rows: Array<{ height: number; cells: XlCell[] }>, widths: number[], xfs: XlXf[]) {
  if (!rows.length) return "<p>(empty sheet)</p>";
  const total = widths.reduce((n, w) => n + w, 0);
  const cols = widths.map((w) => `<col style="width:${w}px">`).join("");
  const body = rows
    .map((row) => {
      const fontPt = Math.max(11, ...row.cells.map((cell) => xfs[cell.xf]?.font.size ?? 11));
      const h = excelRowPx(row.height, fontPt, !row.cells.some((cell) => cell.text));
      const tds = row.cells
        .map((cell) => {
          const xf = xfs[cell.xf];
          const span = cell.colspan > 1 ? ` colspan="${cell.colspan}"` : "";
          const mid = xlVMid(xf, h);
          return `<td valign="top"${span} style="${xlCellCss(xf, cell.numeric)};height:${h}px"><div style="position:relative;top:-${mid}px;line-height:1">${escapeXml(cell.text) || "&nbsp;"}</div></td>`;
        })
        .join("");
      return `<tr style="height:${h}px">${tds}</tr>`;
    })
    .join("");
  return `<table style="border-collapse:collapse;border-spacing:0;table-layout:fixed;width:${total}px;font-family:Calibri,Arial,Helvetica,sans-serif">${cols ? `<colgroup>${cols}</colgroup>` : ""}${body}</table>`;
}

async function spreadsheetToPdf(html: string, name: string, widthPx: number): Promise<ConvertedFile> {
  const host = document.createElement("div");
  host.setAttribute("data-stx-print", "1");
  host.style.cssText = [
    "position:fixed",
    "left:-16000px",
    "top:0",
    `width:${widthPx}px`,
    "background:#ffffff",
    "color:#222222",
    "box-sizing:content-box",
    "padding:20px 24px",
    "font-family:Calibri,Arial,Helvetica,sans-serif",
  ].join(";");
  host.innerHTML = html;
  document.body.appendChild(host);
  const canvas = await captureElement(host, { windowWidth: Math.max(widthPx + 80, 900), scale: 2, skipWordPrep: true });
  const cssW = Math.max(host.offsetWidth, 1);
  const cssH = Math.max(host.scrollHeight, 1);
  document.body.removeChild(host);
  if (canvas.width < 8 || canvas.height < 8) throw new Error("This file looks empty.");
  const pageW = Math.min(1440, Math.max(400, cssW * 0.75));
  const pageH = Math.min(1440, Math.max(400, cssH * 0.75));
  const pdf = await PDFDocument.create();
  const image = await pdf.embedPng(await canvasToBytes(canvas, "image/png"));
  const page = pdf.addPage([pageW, pageH]);
  const scale = Math.min(pageW / canvas.width, pageH / canvas.height);
  const w = canvas.width * scale;
  const h = canvas.height * scale;
  page.drawImage(image, { x: (pageW - w) / 2, y: (pageH - h) / 2, width: w, height: h });
  return { blob: pdfBlob(await pdf.save()), name };
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
  const stylesXml = (await zip.file("xl/styles.xml")?.async("string")) ?? "";
  const fonts = parseXlFonts(stylesXml);
  const fills = parseXlFills(stylesXml);
  const borders = parseXlBorders(stylesXml);
  const numFmts = parseXlNumFmts(stylesXml);
  const xfs = parseXlXfs(stylesXml, fonts, fills, borders, numFmts);
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
  let maxWidth = 720;
  for (const sheet of sheets) {
    const xml = await zipEntry(zip, sheet.path)?.async("string");
    if (!xml) continue;
    const grid = sheetGrid(xml, strings, xfs);
    const widths = parseXlCols(xml, grid.lastCol).slice(grid.minCol);
    maxWidth = Math.max(maxWidth, widths.reduce((n, w) => n + w, 0) + 80);
    const heading = sheets.length > 1 ? `<h2 style="font:700 14pt Calibri,Arial,sans-serif;margin:0 0 10px">${escapeXml(sheet.name)}</h2>` : "";
    parts.push(`<div class="sheet">${heading}${sheetToHtml(grid.rows, widths, xfs)}</div>`);
  }
  if (!parts.length) throw new Error("This spreadsheet could not be read.");
  return spreadsheetToPdf(parts.join(""), `${baseName(file)}.pdf`, Math.min(1800, maxWidth));
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

function pptThemeColors(xml: string) {
  const map: Record<string, string> = {};
  const scheme = xml.match(/<a:clrScheme\b[\s\S]*?<\/a:clrScheme>/)?.[0] ?? xml;
  for (const match of scheme.matchAll(/<a:([a-z0-9]+)>[\s\S]*?val="([A-Fa-f0-9]{6})"/gi)) {
    map[match[1]] = `#${match[2]}`;
  }
  return map;
}

function mixLum(hex: string, xml: string) {
  if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return hex;
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);
  const mod = xml.match(/<a:lumMod\b[^>]*\bval="(\d+)"/);
  const off = xml.match(/<a:lumOff\b[^>]*\bval="(\d+)"/);
  const tint = xml.match(/<a:tint\b[^>]*\bval="(\d+)"/);
  const shade = xml.match(/<a:shade\b[^>]*\bval="(\d+)"/);
  const scale = (n: number, m: number) => n * m;
  if (mod) {
    const m = Number(mod[1]) / 100000;
    r = scale(r, m);
    g = scale(g, m);
    b = scale(b, m);
  }
  if (off) {
    const o = Number(off[1]) / 100000;
    r += (255 - r) * o;
    g += (255 - g) * o;
    b += (255 - b) * o;
  }
  if (tint) {
    const t = Number(tint[1]) / 100000;
    r += (255 - r) * t;
    g += (255 - g) * t;
    b += (255 - b) * t;
  }
  if (shade) {
    const s = Number(shade[1]) / 100000;
    r *= s;
    g *= s;
    b *= s;
  }
  const hex2 = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${hex2(r)}${hex2(g)}${hex2(b)}`;
}

function pptColor(xml: string, theme: Record<string, string>, fallback = "") {
  const srgb = xml.match(/<a:srgbClr\b[^>]*\bval="([A-Fa-f0-9]{6})"/);
  if (srgb) return mixLum(`#${srgb[1]}`, xml);
  const scheme = xml.match(/<a:schemeClr\b[^>]*\bval="([^"]+)"/);
  if (scheme) {
    const block = xml.match(/<a:schemeClr\b[\s\S]*?<\/a:schemeClr>/)?.[0] ?? xml;
    return mixLum(theme[scheme[1]] || fallback, block);
  }
  return fallback;
}

function pptChildBlocks(xml: string) {
  const blocks: Array<{ tag: string; xml: string }> = [];
  const re = /<(p:grpSp|p:sp|p:pic|p:graphicFrame|p:cxnSp)\b/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(xml))) {
    const tag = match[1];
    const start = match.index;
    const open = `<${tag}`;
    const close = `</${tag}>`;
    let depth = 1;
    let index = start + match[0].length;
    let found = false;
    while (depth > 0 && index < xml.length) {
      const nextOpen = xml.indexOf(open, index);
      const nextClose = xml.indexOf(close, index);
      if (nextClose < 0) break;
      const openChar = nextOpen >= 0 ? xml[nextOpen + open.length] : "";
      const realOpen = nextOpen >= 0 && nextOpen < nextClose && (openChar === " " || openChar === ">" || openChar === "/");
      if (realOpen) {
        depth += 1;
        index = nextOpen + open.length;
        continue;
      }
      depth -= 1;
      if (depth === 0) {
        blocks.push({ tag, xml: xml.slice(start, nextClose + close.length) });
        re.lastIndex = nextClose + close.length;
        found = true;
      }
      index = nextClose + close.length;
    }
    if (!found) re.lastIndex = start + match[0].length;
  }
  return blocks;
}

function mapGrpBox(
  parent: { x: number; y: number; w: number; h: number },
  child: { x: number; y: number; w: number; h: number },
  chOff: { x: number; y: number },
  chExt: { w: number; h: number },
) {
  const sx = chExt.w ? parent.w / chExt.w : 1;
  const sy = chExt.h ? parent.h / chExt.h : 1;
  return {
    x: parent.x + (child.x - chOff.x) * sx,
    y: parent.y + (child.y - chOff.y) * sy,
    w: child.w * sx,
    h: child.h * sy,
  };
}

function pptRuns(xml: string, theme: Record<string, string>, fallbackPt: number, fallbackColor: string) {
  const paras = xml.match(/<a:p\b[\s\S]*?<\/a:p>/g) ?? [];
  return paras
    .map((para) => {
      const align = para.match(/<a:pPr\b[^>]*\balgn="(ctr|r|just)"/)?.[1];
      const textAlign = align === "ctr" ? "center" : align === "r" ? "right" : "left";
      const runs = [...(para.match(/<a:r\b[\s\S]*?<\/a:r>/g) ?? []), ...(para.match(/<a:fld\b[\s\S]*?<\/a:fld>/g) ?? [])];
      const inner = (runs.length ? runs : [para])
        .map((run) => {
          const rPr = run.match(/<a:rPr\b[\s\S]*?(?:\/>|<\/a:rPr>)/)?.[0] ?? "";
          const sz = Number(rPr.match(/\bsz="(\d+)"/)?.[1] || 0) / 100 || fallbackPt;
          const color = pptColor(rPr, theme, fallbackColor);
          const bold = /\bb="1"/.test(rPr);
          const italic = /\bi="1"/.test(rPr);
          const text = xmlTags(run, "a:t").join("");
          if (!text) return "";
          return `<span style="font-size:${sz}pt;color:${color};font-weight:${bold ? 700 : 400};font-style:${italic ? "italic" : "normal"}">${escapeXml(text)}</span>`;
        })
        .join("");
      return inner ? `<div style="text-align:${textAlign};line-height:1.25">${inner}</div>` : "";
    })
    .join("");
}

function pptTableHtml(xml: string, theme: Record<string, string>) {
  const rows = xml.match(/<a:tr\b[\s\S]*?<\/a:tr>/g) ?? [];
  const body = rows
    .map((row) => {
      const height = emuPx(row.match(/\bh="(\d+)"/)?.[1]);
      const cells = (row.match(/<a:tc\b[\s\S]*?<\/a:tc>/g) ?? [])
        .map((cell) => {
          const fill = pptColor(cell.match(/<a:solidFill>[\s\S]*?<\/a:solidFill>/)?.[0] ?? "", theme, "");
          return `<td style="border:1px solid #c5c5c5;padding:5px 7px;vertical-align:middle;${fill ? `background:${fill};` : ""}${height ? `height:${height}px;` : ""}">${pptRuns(cell, theme, 12, "#111111")}</td>`;
        })
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");
  return `<table style="width:100%;height:100%;border-collapse:collapse;table-layout:fixed">${body}</table>`;
}

async function pptPicUrl(zip: JSZip, xml: string, rels: Map<string, string>) {
  const rid = xml.match(/r:embed="([^"]+)"/)?.[1];
  const target = rid ? rels.get(rid) : "";
  if (!target || !/\.(png|jpe?g|gif|webp|bmp)$/i.test(target)) return "";
  return zipFileDataUrl(zip, target);
}

async function pptBgLayer(zip: JSZip, xml: string, rels: Map<string, string>, theme: Record<string, string>, slideW: number, slideH: number) {
  const bg = xml.match(/<p:bg\b[\s\S]*?<\/p:bg>/)?.[0] ?? "";
  const color = pptColor(bg, theme, "");
  const url = await pptPicUrl(zip, bg, rels);
  if (url) {
    return `<img src="${url}" style="position:absolute;inset:0;width:${slideW}px;height:${slideH}px;object-fit:cover;display:block"/>`;
  }
  return color ? `<div style="position:absolute;inset:0;background:${color}"></div>` : "";
}

async function pptLayoutMeta(zip: JSZip, rels: Map<string, string>, theme: Record<string, string>, slideW: number, slideH: number) {
  const boxes = new Map<string, { x: number; y: number; w: number; h: number }>();
  const layoutPath = [...rels.values()].find((path) => /slideLayout\d+\.xml$/i.test(path));
  let bg = "";
  if (!layoutPath) return { boxes, bg };
  const xml = await zipEntry(zip, layoutPath)?.async("string");
  if (!xml) return { boxes, bg };
  const layoutRels = parseRels(
    await zipEntry(zip, layoutPath.replace(/[^/]+$/, "_rels/") + `${layoutPath.split("/").pop()}.rels`)?.async("string"),
    layoutPath.replace(/[^/]+$/, ""),
  );
  const masterPath = [...layoutRels.values()].find((path) => /slideMaster\d+\.xml$/i.test(path));
  if (masterPath) {
    const masterXml = await zipEntry(zip, masterPath)?.async("string");
    const masterRels = parseRels(
      await zipEntry(zip, masterPath.replace(/[^/]+$/, "_rels/") + `${masterPath.split("/").pop()}.rels`)?.async("string"),
      masterPath.replace(/[^/]+$/, ""),
    );
    if (masterXml) bg = (await pptBgLayer(zip, masterXml, masterRels, theme, slideW, slideH)) || bg;
  }
  bg = (await pptBgLayer(zip, xml, layoutRels, theme, slideW, slideH)) || bg;
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
  return { boxes, bg };
}

async function pptSlideHtml(zip: JSZip, path: string, slideW: number, slideH: number, theme: Record<string, string>) {
  const xml = await zipEntry(zip, path)?.async("string");
  if (!xml) return "";
  const relDir = path.replace(/[^/]+$/, "_rels/");
  const relName = path.split("/").pop() ?? "";
  const rels = parseRels(await zipEntry(zip, `${relDir}${relName}.rels`)?.async("string"), path.replace(/[^/]+$/, ""));
  const layout = await pptLayoutMeta(zip, rels, theme, slideW, slideH);
  const layers: string[] = [];
  const slideBg = (await pptBgLayer(zip, xml, rels, theme, slideW, slideH)) || layout.bg;

  const addBox = (box: { x: number; y: number; w: number; h: number }, inner: string, extra = "") => {
    if (box.w <= 0 || box.h <= 0 || (!inner && !extra)) return;
    layers.push(
      `<div style="position:absolute;left:${box.x}px;top:${box.y}px;width:${box.w}px;height:${box.h}px;overflow:hidden;${extra}">${inner}</div>`,
    );
  };

  const paintTree = async (
    source: string,
    ox: { x: number; y: number; w: number; h: number } | null,
    chOff: { x: number; y: number },
    chExt: { w: number; h: number },
  ) => {
    const place = (box: { x: number; y: number; w: number; h: number }) =>
      ox ? mapGrpBox(ox, box, chOff, chExt) : box;

    for (const block of pptChildBlocks(source)) {
      if (block.tag === "p:grpSp") {
        const grp = xfrmBox(block.xml);
        const xfrm = block.xml.match(/<p:grpSpPr\b[\s\S]*?<\/p:grpSpPr>/)?.[0] ?? block.xml;
        const chOffTag = xfrm.match(/<a:chOff\b[^>]*>/)?.[0] ?? "";
        const chExtTag = xfrm.match(/<a:chExt\b[^>]*>/)?.[0] ?? "";
        const nextOff = {
          x: emuPx(chOffTag.match(/\bx="(-?\d+)"/)?.[1]),
          y: emuPx(chOffTag.match(/\by="(-?\d+)"/)?.[1]),
        };
        const nextExt = {
          w: emuPx(chExtTag.match(/\bcx="(-?\d+)"/)?.[1]) || grp.w,
          h: emuPx(chExtTag.match(/\bcy="(-?\d+)"/)?.[1]) || grp.h,
        };
        await paintTree(block.xml.replace(/<p:nvGrpSpPr[\s\S]*?<\/p:nvGrpSpPr>/, "").replace(/<p:grpSpPr[\s\S]*?<\/p:grpSpPr>/, ""), place(grp), nextOff, nextExt);
        continue;
      }
      if (block.tag === "p:pic") {
        const url = await pptPicUrl(zip, block.xml, rels);
        if (url) addBox(place(xfrmBox(block.xml)), `<img src="${url}" style="width:100%;height:100%;object-fit:fill;display:block"/>`);
        continue;
      }
      if (block.tag === "p:graphicFrame") {
        const box = place(xfrmBox(block.xml));
        if (block.xml.includes("<a:tbl")) addBox(box, pptTableHtml(block.xml, theme));
        else {
          const url = await pptPicUrl(zip, block.xml, rels);
          if (url) addBox(box, `<img src="${url}" style="width:100%;height:100%;object-fit:contain;display:block"/>`);
        }
        continue;
      }
      const ph = block.xml.match(/<p:ph\b[^>]*>/)?.[0] ?? "";
      const type = ph.match(/\btype="([^"]+)"/)?.[1] ?? "";
      const idx = ph.match(/\bidx="([^"]+)"/)?.[1] ?? "";
      let box = xfrmBox(block.xml);
      if (box.w <= 0 || box.h <= 0) {
        box = layout.boxes.get(`${type}:${idx}`) ?? layout.boxes.get(`type:${type}`) ?? layout.boxes.get(`idx:${idx}`) ?? { x: 48, y: 48, w: slideW - 96, h: 80 };
      }
      box = place(box);
      const fillXml = block.xml.match(/<p:spPr\b[\s\S]*?<\/p:spPr>/)?.[0] ?? "";
      const fill = pptColor(fillXml.match(/<a:solidFill>[\s\S]*?<\/a:solidFill>/)?.[0] ?? fillXml, theme, "");
      const fallbackPt = type === "title" || type === "ctrTitle" ? 32 : type === "subTitle" ? 18 : 16;
      const inner = pptRuns(block.xml, theme, fallbackPt, "#111111");
      if (!inner && !fill) continue;
      addBox(box, inner, fill ? `background:${fill}` : "");
    }
  };

  const tree = xml.match(/<p:spTree\b[\s\S]*<\/p:spTree>/)?.[0] ?? xml;
  await paintTree(tree, null, { x: 0, y: 0 }, { w: slideW, h: slideH });
  return `<div data-stx-slide="1" style="position:relative;width:${slideW}px;height:${slideH}px;background:#ffffff;overflow:hidden;font-family:Calibri,Arial,Helvetica,sans-serif">${slideBg}${layers.join("")}</div>`;
}

function isZipMagic(bytes: Uint8Array) {
  return bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b;
}

function isOleMagic(bytes: Uint8Array) {
  return (
    bytes.length >= 8 &&
    bytes[0] === 0xd0 &&
    bytes[1] === 0xcf &&
    bytes[2] === 0x11 &&
    bytes[3] === 0xe0
  );
}

function u16le(bytes: Uint8Array, offset: number) {
  return bytes[offset] | (bytes[offset + 1] << 8);
}

function u32le(bytes: Uint8Array, offset: number) {
  return (bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24)) >>> 0;
}

function i32le(bytes: Uint8Array, offset: number) {
  const value = u32le(bytes, offset);
  return value > 0x7fffffff ? value - 0x100000000 : value;
}

const CFB_MAX_SECTOR = 0xfffffffa;

function cfbReadChain(fat: number[], start: number) {
  const chain: number[] = [];
  const seen = new Set<number>();
  let sector = start;
  while (sector <= CFB_MAX_SECTOR) {
    if (seen.has(sector) || sector >= fat.length) break;
    seen.add(sector);
    chain.push(sector);
    sector = fat[sector];
    if (sector == null) break;
  }
  return chain;
}

function cfbConcat(bytes: Uint8Array, sectorSize: number, chain: number[]) {
  const out = new Uint8Array(chain.length * sectorSize);
  chain.forEach((sector, index) => {
    const offset = (sector + 1) * sectorSize;
    out.set(bytes.subarray(offset, offset + sectorSize), index * sectorSize);
  });
  return out;
}

function readCfbStreams(bytes: Uint8Array) {
  const streams = new Map<string, Uint8Array>();
  if (!isOleMagic(bytes) || bytes.length < 512) return streams;
  const sectorShift = u16le(bytes, 0x1e);
  const sectorSize = 1 << sectorShift;
  const miniShift = u16le(bytes, 0x20);
  const miniSize = 1 << miniShift;
  const fatCount = u32le(bytes, 0x2c);
  const dirStart = u32le(bytes, 0x30);
  const miniCutoff = u32le(bytes, 0x38);
  const miniFatStart = u32le(bytes, 0x3c);
  const difatStart = u32le(bytes, 0x44);
  const difatCount = u32le(bytes, 0x48);
  const fatSectors: number[] = [];
  for (let i = 0; i < 109; i += 1) {
    const sector = u32le(bytes, 0x4c + i * 4);
    if (sector <= CFB_MAX_SECTOR) fatSectors.push(sector);
  }
  let difat = difatStart;
  for (let n = 0; n < difatCount && difat <= CFB_MAX_SECTOR; n += 1) {
    const offset = (difat + 1) * sectorSize;
    const entries = sectorSize / 4 - 1;
    for (let i = 0; i < entries; i += 1) {
      const sector = u32le(bytes, offset + i * 4);
      if (sector <= CFB_MAX_SECTOR) fatSectors.push(sector);
    }
    difat = u32le(bytes, offset + entries * 4);
  }
  const fat: number[] = [];
  for (const sector of fatSectors.slice(0, fatCount || fatSectors.length)) {
    const offset = (sector + 1) * sectorSize;
    for (let i = 0; i < sectorSize / 4; i += 1) fat.push(u32le(bytes, offset + i * 4));
  }
  const dirBytes = cfbConcat(bytes, sectorSize, cfbReadChain(fat, dirStart));
  const entries: Array<{ name: string; type: number; start: number; size: number }> = [];
  for (let offset = 0; offset + 128 <= dirBytes.length; offset += 128) {
    const type = dirBytes[offset + 0x42];
    if (!type) continue;
    const nameBytes = u16le(dirBytes, offset + 0x40);
    const name = new TextDecoder("utf-16le")
      .decode(dirBytes.subarray(offset, offset + Math.max(0, nameBytes - 2)))
      .replace(/\0+$/g, "")
      .trim();
    entries.push({
      name,
      type,
      start: u32le(dirBytes, offset + 0x74),
      size: u32le(dirBytes, offset + 0x78),
    });
  }
  const root = entries.find((entry) => entry.type === 5);
  const miniFat: number[] = [];
  if (root && miniFatStart <= CFB_MAX_SECTOR) {
    const miniFatBytes = cfbConcat(bytes, sectorSize, cfbReadChain(fat, miniFatStart));
    for (let i = 0; i + 4 <= miniFatBytes.length; i += 4) miniFat.push(u32le(miniFatBytes, i));
  }
  const miniStream = root ? cfbConcat(bytes, sectorSize, cfbReadChain(fat, root.start)) : new Uint8Array();
  for (const entry of entries) {
    if (entry.type !== 2 || !entry.name || entry.size <= 0) continue;
    let data: Uint8Array;
    if (entry.size < miniCutoff && miniFat.length) {
      const chain = cfbReadChain(miniFat, entry.start);
      data = new Uint8Array(entry.size);
      chain.forEach((sector, index) => {
        const offset = sector * miniSize;
        const chunk = miniStream.subarray(offset, offset + miniSize);
        data.set(chunk.subarray(0, Math.min(miniSize, entry.size - index * miniSize)), index * miniSize);
      });
      data = data.subarray(0, entry.size);
    } else {
      data = cfbConcat(bytes, sectorSize, cfbReadChain(fat, entry.start)).subarray(0, entry.size);
    }
    const key = entry.name.toLowerCase().replace(/[\u0000-\u001f]/g, "").trim();
    if (key) streams.set(key, data);
    streams.set(entry.name.toLowerCase(), data);
  }
  return streams;
}

function cfbStream(streams: Map<string, Uint8Array>, ...names: string[]) {
  for (const name of names) {
    const exact = streams.get(name);
    if (exact?.length) return exact;
  }
  for (const [key, data] of streams) {
    const cleaned = key.replace(/[\u0000-\u001f]/g, "").trim();
    if (names.includes(cleaned) && data.length) return data;
  }
}

type PptRec = { type: number; inst: number; children: PptRec[]; data: Uint8Array };

function parsePptRecords(bytes: Uint8Array, start = 0, end = bytes.length) {
  const recs: PptRec[] = [];
  let offset = start;
  while (offset + 8 <= end) {
    const info = u16le(bytes, offset);
    const type = u16le(bytes, offset + 2);
    const size = u32le(bytes, offset + 4);
    const ver = info & 0x0f;
    const dataStart = offset + 8;
    const dataEnd = Math.min(end, dataStart + size);
    if (dataEnd < dataStart) break;
    const data = bytes.subarray(dataStart, dataEnd);
    recs.push({
      type,
      inst: info >> 4,
      data,
      children: ver === 0x0f && size > 8 ? parsePptRecords(bytes, dataStart, dataEnd) : [],
    });
    offset = dataEnd;
  }
  return recs;
}

function walkPpt(recs: PptRec[], visit: (rec: PptRec) => void) {
  for (const rec of recs) {
    visit(rec);
    if (rec.children.length) walkPpt(rec.children, visit);
  }
}

function pptDecodeText(rec: PptRec) {
  if (rec.type === 0x0fa0) return new TextDecoder("utf-16le").decode(rec.data).replace(/\0+$/g, "");
  if (rec.type === 0x0fa8) return new TextDecoder("latin1").decode(rec.data).replace(/\0+$/g, "");
  return "";
}

function pptBlipUrl(data: Uint8Array) {
  const png = data.findIndex((_, i) => data[i] === 0x89 && data[i + 1] === 0x50 && data[i + 2] === 0x4e && data[i + 3] === 0x47);
  if (png >= 0) return `data:image/png;base64,${bytesToBase64(data.subarray(png))}`;
  for (let i = 0; i < data.length - 2; i += 1) {
    if (data[i] === 0xff && data[i + 1] === 0xd8 && data[i + 2] === 0xff) {
      return `data:image/jpeg;base64,${bytesToBase64(data.subarray(i))}`;
    }
  }
  return "";
}

function parsePptBlips(pictures: Uint8Array) {
  const blips: string[] = [];
  let offset = 0;
  while (offset + 8 <= pictures.length) {
    const type = u16le(pictures, offset + 2);
    const size = u32le(pictures, offset + 4);
    const dataStart = offset + 8;
    const dataEnd = Math.min(pictures.length, dataStart + Math.max(0, size));
    if (dataEnd <= offset) break;
    if (type === 0xf007 || (type >= 0xf018 && type <= 0xf117)) {
      blips.push(pptBlipUrl(pictures.subarray(dataStart, dataEnd)));
    }
    offset = dataEnd;
  }
  return blips;
}

function pptColorRef(value: number) {
  const r = value & 255;
  const g = (value >> 8) & 255;
  const b = (value >> 16) & 255;
  const hex = `#${[r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
  return hex === "#000000" && value === 0 ? "" : hex;
}

function hexLum(hex: string) {
  if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return 255;
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255);
}

function parseFopt(rec: PptRec) {
  const props = { pib: 0, fill: "", line: "", filled: false };
  let offset = 0;
  const count = rec.inst || Math.floor(rec.data.length / 6);
  for (let i = 0; i < count && offset + 6 <= rec.data.length; i += 1) {
    const opid = u16le(rec.data, offset);
    const value = u32le(rec.data, offset + 2);
    const id = opid & 0x3fff;
    const bid = (opid >> 14) & 1;
    if (id === 0x104 && bid) props.pib = value;
    if (id === 0x181) props.fill = pptColorRef(value);
    if (id === 0x1c0) props.line = pptColorRef(value);
    if (id === 0x1bf) props.filled = (value & 0x100000) !== 0 || (value & 0x10) !== 0;
    offset += 6;
  }
  return props;
}

function muBox(l: number, t: number, r: number, b: number) {
  return { x: l / 6, y: t / 6, w: Math.max(1, (r - l) / 6), h: Math.max(1, (b - t) / 6) };
}

function pptDocSize(doc: Uint8Array) {
  const atom = parsePptRecords(doc).find((rec) => rec.type === 0x03e8)?.children.find((rec) => rec.type === 0x03e9);
  if (atom && atom.data.length >= 8) {
    return {
      w: Math.max(320, Math.round(u32le(atom.data, 0) / 6)),
      h: Math.max(180, Math.round(u32le(atom.data, 4) / 6)),
    };
  }
  return { w: 960, h: 720 };
}

type PptBox = {
  x: number;
  y: number;
  w: number;
  h: number;
  text: string;
  fontPt: number;
  bold: boolean;
  color: string;
  fill: string;
  image: string;
  html: string;
  border: string;
  fromChild: boolean;
  ole: boolean;
};

async function inflateZlib(bytes: Uint8Array) {
  const run = async (format: "deflate" | "deflate-raw", data: Uint8Array) => {
    const stream = new DecompressionStream(format);
    const writer = stream.writable.getWriter();
    await writer.write(data);
    await writer.close();
    return new Uint8Array(await new Response(stream.readable).arrayBuffer());
  };
  const work = (async () => {
    try {
      return await run("deflate", bytes);
    } catch {
      return await run("deflate-raw", bytes.subarray(bytes[0] === 0x78 ? 2 : 0));
    }
  })();
  return Promise.race([
    work,
    new Promise<Uint8Array>((_, reject) => {
      window.setTimeout(() => reject(new Error("inflate timeout")), 2500);
    }),
  ]);
}

function odcBarHtml(xml: string) {
  const texts = [...xml.matchAll(/<text:p>([^<]*)<\/text:p>/g)].map((match) => unescapeXml(match[1]));
  const values = [...xml.matchAll(/office:value="([^"]+)"/g)].map((match) => Number(match[1])).filter((n) => Number.isFinite(n));
  if (values.length < 3) return "";
  const series = Math.min(6, [...xml.matchAll(/<chart:series\b/g)].length || 3);
  const rows = Math.max(1, Math.round(values.length / series));
  const cats = texts.filter((text) => /^Row\s+\d+/i.test(text)).slice(0, rows);
  const names = texts.filter((text) => /^Column\s+\d+/i.test(text)).slice(0, series);
  const palette = [...xml.matchAll(/draw:fill-color="(#[0-9A-Fa-f]{6})"/g)]
    .map((match) => match[1].toLowerCase())
    .filter((color, index, all) => color !== "#e6e6e6" && color !== "#cccccc" && color !== "#ffffff" && all.indexOf(color) === index)
    .slice(0, series);
  const colors = palette.length >= series ? palette : ["#004586", "#ff420e", "#ffd320", "#579d1c", "#7e0021"];
  const max = Math.max(...values, 1);
  const groups = Array.from({ length: rows }, (_, row) => {
    const bars = Array.from({ length: series }, (_, col) => {
      const value = values[row * series + col] || 0;
      const pct = Math.max(2, (value / max) * 100);
      return `<div style="width:${100 / series}%;height:100%;display:flex;align-items:flex-end;justify-content:center;padding:0 2px;box-sizing:border-box"><div style="width:100%;height:${pct}%;background:${colors[col]}"></div></div>`;
    }).join("");
    return `<div style="flex:1;height:100%;display:flex;flex-direction:column;justify-content:flex-end;padding:0 6px;box-sizing:border-box">
      <div style="flex:1;display:flex;align-items:flex-end;border-bottom:1px solid #b3b3b3">${bars}</div>
      <div style="text-align:center;font-size:11px;color:#444;padding-top:6px">${escapeXml(cats[row] || `Row ${row + 1}`)}</div>
    </div>`;
  }).join("");
  const legend = names
    .map(
      (name, index) =>
        `<span style="display:inline-flex;align-items:center;gap:5px;margin-right:12px;font-size:11px;color:#333"><span style="width:10px;height:10px;background:${colors[index]};display:inline-block"></span>${escapeXml(name)}</span>`,
    )
    .join("");
  return `<div style="width:100%;height:100%;box-sizing:border-box;padding:12px 14px 8px;background:#ffffff;display:flex;flex-direction:column">
    <div style="flex:1 1 auto;min-height:0;display:flex">${groups}</div>
    <div style="flex:0 0 auto;padding:8px 4px 0">${legend}</div>
  </div>`;
}

async function extractOdcCharts(doc: Uint8Array) {
  const charts: string[] = [];
  for (const rec of parsePptRecords(doc)) {
    if (rec.type !== 0x1011 || rec.data.length < 8) continue;
    const start = rec.data.length > 200000 ? -1 : rec.data.findIndex((_, i) => rec.data[i] === 0x78 && (rec.data[i + 1] === 0x9c || rec.data[i + 1] === 0xda));
    if (start < 0) continue;
    try {
      const ole = await inflateZlib(rec.data.subarray(start));
      if (!isOleMagic(ole)) continue;
      const packed = cfbStream(readCfbStreams(ole), "package_stream", "package") ?? new Uint8Array();
      if (!isZipMagic(packed)) continue;
      const zip = await JSZip.loadAsync(packed);
      const xml = (await zip.file("content.xml")?.async("string")) ?? "";
      if (!xml) continue;
      const html = /chart:bar/.test(xml) ? odcBarHtml(xml) : "";
      if (html) charts.push(html);
    } catch {
      /* ignore unreadable embeddings */
    }
  }
  return charts;
}

function layoutPptSlide(boxes: PptBox[], slideW: number, slideH: number, hasBg: boolean) {
  const titles = boxes.filter((box) => box.bold && box.fontPt >= 24 && !box.fromChild);
  const titleBottom = Math.max(hasBg ? slideH * 0.155 : 0, ...titles.map((box) => box.y + box.h));
  for (const box of boxes) {
    if (titles.includes(box) || box.fromChild || box.image || box.html) continue;
    if (!box.text) continue;
    const overlaps = titles.some(
      (title) => box.y < title.y + title.h && box.y + Math.min(box.h, 40) > title.y && box.x < title.x + title.w && box.x + box.w > title.x,
    );
    if (overlaps || box.y < titleBottom - 4) {
      const nextY = titleBottom + 16;
      if (box.y < nextY) {
        box.h = Math.max(48, box.h - (nextY - box.y));
        box.y = nextY;
      }
    }
  }
  const childBoxes = boxes.filter((box) => box.fromChild);
  if (childBoxes.length) {
    let minX = Infinity;
    let minY = Infinity;
    let maxR = 0;
    let maxB = 0;
    for (const box of childBoxes) {
      minX = Math.min(minX, box.x);
      minY = Math.min(minY, box.y);
      maxR = Math.max(maxR, box.x + box.w);
      maxB = Math.max(maxB, box.y + box.h);
    }
    const availX = 40;
    const availY = titleBottom + 18;
    const availW = slideW - 80;
    const availH = slideH - availY - 24;
    const scale = Math.min(availW / Math.max(1, maxR - minX), availH / Math.max(1, maxB - minY), 1);
    for (const box of childBoxes) {
      box.x = availX + (box.x - minX) * scale;
      box.y = availY + (box.y - minY) * scale;
      box.w *= scale;
      box.h *= scale;
      if (box.h < 52) box.fontPt = Math.min(box.fontPt, 11);
    }
  }
  const headerH = Math.max(titleBottom, slideH * 0.18);
  for (const box of boxes) {
    if (box.fill) {
      box.color = hexLum(box.fill) < 150 ? "#ffffff" : "#111111";
      continue;
    }
    box.color = hasBg && box.y + Math.min(box.h, 36) < headerH ? "#ffffff" : "#222222";
  }
}

function pptShapeText(kids: PptRec[]) {
  const texts: string[] = [];
  let header = 4;
  walkPpt(kids, (item) => {
    if (item.type === 0x0f9f && item.data.length >= 4) header = u32le(item.data, 0);
    const raw = pptDecodeText(item)
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && line !== "*" && !/^___PPT\d+$/i.test(line) && !/^click to edit/i.test(line));
    texts.push(...raw);
  });
  const fontPt = header === 0 ? 32 : header === 1 || header === 5 ? 18 : 16;
  return { text: texts.join("\n"), fontPt, bold: header === 0 };
}

function emitPptShape(
  sp: PptRec,
  origin: { x: number; y: number },
  blips: string[],
  boxes: PptBox[],
  slideW: number,
  slideH: number,
) {
  const kids = sp.children.length ? sp.children : parsePptRecords(sp.data);
  let flags = 0;
  let client: { x: number; y: number; w: number; h: number } | null = null;
  let child: { x: number; y: number; w: number; h: number } | null = null;
  let props = { pib: 0, fill: "", line: "", filled: false };
  for (const kid of kids) {
    if (kid.type === 0xf00a && kid.data.length >= 8) flags = u32le(kid.data, 4);
    if (kid.type === 0xf010 && kid.data.length >= 8) {
      client = muBox(u16le(kid.data, 0), u16le(kid.data, 2), u16le(kid.data, 4), u16le(kid.data, 6));
    }
    if (kid.type === 0xf00f && kid.data.length >= 16) {
      child = muBox(i32le(kid.data, 0), i32le(kid.data, 4), i32le(kid.data, 8), i32le(kid.data, 12));
    }
    if (kid.type === 0xf00b) props = parseFopt(kid);
  }
  if (flags & 0x4 || flags & 0x8) return { origin, grouped: false };
  let box = client;
  if (child) {
    box = { x: origin.x + child.x, y: origin.y + child.y, w: child.w, h: child.h };
  }
  if ((flags & 0x1) && box && !child) return { origin: { x: box.x, y: box.y }, grouped: true };
  if (!box || flags & 0x400 || box.w < 2) return { origin, grouped: false };
  const { text, fontPt, bold } = pptShapeText(kids);
  const image = props.pib ? blips[props.pib - 1] || "" : "";
  const ole = (flags & 0x10) !== 0;
  const fill = props.fill || (props.pib && !image && !ole ? "#f3f3f3" : "");
  if (!text && !image && !fill && !props.pib && !ole) return { origin, grouped: false };
  let size = fontPt;
  if (text.split("\n").length > 1 && size > 20) size = 16;
  if (box.h < 52) size = Math.min(size, 12);
  boxes.push({
    x: box.x,
    y: box.y,
    w: box.w,
    h: box.h,
    text,
    fontPt: size,
    bold,
    color: "#111111",
    fill,
    image,
    html: "",
    border: (fill || (props.pib && !ole)) && !bold ? "1px solid #c5c5c5" : "",
    fromChild: !!child,
    ole,
  });
  return { origin, grouped: false };
}

function walkPptDrawing(
  recs: PptRec[],
  origin: { x: number; y: number },
  blips: string[],
  boxes: PptBox[],
  slideW: number,
  slideH: number,
) {
  let group = origin;
  for (const rec of recs) {
    const kids = rec.children.length ? rec.children : rec.type === 0xf003 || rec.type === 0xf004 ? parsePptRecords(rec.data) : [];
    if (rec.type === 0xf003) {
      walkPptDrawing(kids, group, blips, boxes, slideW, slideH);
      continue;
    }
    if (rec.type === 0xf004) {
      const next = emitPptShape(rec, group, blips, boxes, slideW, slideH);
      if (next.grouped) group = next.origin;
      continue;
    }
    if (kids.length) walkPptDrawing(kids, group, blips, boxes, slideW, slideH);
  }
}

function masterBg(master: PptRec, blips: string[]) {
  let image = "";
  let fill = "";
  walkPpt([master], (rec) => {
    if (rec.type !== 0xf00b) return;
    const props = parseFopt(rec);
    if (props.pib && blips[props.pib - 1]) image = blips[props.pib - 1];
    if (props.fill) fill = props.fill;
  });
  return { image, fill };
}

function binaryPptSlides(doc: Uint8Array, blips: string[], slideW: number, slideH: number, charts: string[]) {
  const root = parsePptRecords(doc);
  const masters = root.filter((rec) => rec.type === 0x03f8).map((master) => masterBg(master, blips));
  const designed = masters.find((master) => master.image) ?? masters[masters.length - 1] ?? { image: "", fill: "#ffffff" };
  const slides: Array<{ boxes: PptBox[]; bg: string; bgImage: string }> = [];
  let chartAt = 0;
  for (const rec of root) {
    if (rec.type !== 0x03ee) continue;
    const kids = rec.children.length ? rec.children : parsePptRecords(rec.data);
    const boxes: PptBox[] = [];
    walkPptDrawing(kids, { x: 0, y: 0 }, blips, boxes, slideW, slideH);
    for (const box of boxes) {
      if (!box.ole || !charts[chartAt]) continue;
      if (box.image && /^data:image\/(png|jpe?g)/i.test(box.image)) continue;
      box.html = charts[chartAt];
      box.image = "";
      box.fill = "";
      box.border = "";
      chartAt += 1;
    }
    layoutPptSlide(boxes, slideW, slideH, !!designed.image);
    slides.push({ boxes, bg: designed.fill || "#ffffff", bgImage: designed.image });
  }
  if (!slides.length) {
    walkPpt(root, (rec) => {
      if (rec.type !== 0x03ee) return;
      const boxes: PptBox[] = [];
      walkPptDrawing(rec.children.length ? rec.children : parsePptRecords(rec.data), { x: 0, y: 0 }, blips, boxes, slideW, slideH);
      layoutPptSlide(boxes, slideW, slideH, false);
      slides.push({ boxes, bg: "#ffffff", bgImage: "" });
    });
  }
  return slides.map((slide) => binarySlideHtml(slide, slideW, slideH));
}

function pptRace<T>(promise: Promise<T>, ms: number, fallback: T) {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => {
      window.setTimeout(() => resolve(fallback), ms);
    }),
  ]);
}

async function capturePptSlide(node: HTMLElement) {
  const html2canvas = (await import("html2canvas")).default;
  for (const img of node.querySelectorAll("img")) {
    const src = img.getAttribute("src") || "";
    if (!/^data:image\/(png|jpe?g|gif|webp)/i.test(src)) img.remove();
  }
  await waitForImages(node, 2500);
  const options = {
    scale: 1.25,
    backgroundColor: "#ffffff" as string | null,
    useCORS: true,
    logging: false,
    imageTimeout: 2500,
    windowWidth: Math.max(node.offsetWidth, 320) + 8,
    ignoreElements: (el: Element) =>
      ignoreUnsafePaint(el) || !(el === node || node.contains(el) || el.contains(node)),
    onclone(_doc: Document, clone: HTMLElement) {
      for (const img of clone.querySelectorAll("img")) {
        const src = img.getAttribute("src") || "";
        if (!/^data:image\/(png|jpe?g|gif|webp)/i.test(src) || (img as HTMLImageElement).naturalWidth === 0) {
          img.remove();
        }
      }
    },
  };
  const painted = await pptRace(html2canvas(node, options), 10000, null as HTMLCanvasElement | null);
  if (painted && painted.width > 4 && painted.height > 4) return painted;
  for (const img of node.querySelectorAll("img")) img.remove();
  const fallback = await pptRace(html2canvas(node, { ...options, scale: 1, imageTimeout: 800 }), 8000, null as HTMLCanvasElement | null);
  if (fallback && fallback.width > 4) return fallback;
  const blank = document.createElement("canvas");
  blank.width = Math.max(4, node.offsetWidth || 960);
  blank.height = Math.max(4, node.offsetHeight || 540);
  const ctx = blank.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, blank.width, blank.height);
  }
  return blank;
}

async function pptSlidesToPdf(htmls: string[], name: string): Promise<ConvertedFile> {
  const host = document.createElement("div");
  host.style.cssText = "position:fixed;left:-18000px;top:0;background:#fff;";
  document.body.appendChild(host);
  try {
    const pdf = await PDFDocument.create();
    for (const html of htmls) {
      if (!html) continue;
      host.innerHTML = html;
      const node = host.querySelector<HTMLElement>("[data-stx-slide]");
      if (!node) continue;
      await nextPaint();
      let canvas: HTMLCanvasElement;
      try {
        canvas = await capturePptSlide(node);
      } catch {
        continue;
      }
      if (canvas.width < 4 || canvas.height < 4) continue;
      const pageW = Math.max(200, (node.offsetWidth || canvas.width) * 0.75);
      const pageH = Math.max(150, (node.offsetHeight || canvas.height) * 0.75);
      const jpg = await pptRace(canvasToBytes(canvas, "image/jpeg", 0.82), 8000, new Uint8Array());
      if (!jpg.length) continue;
      const image = await pdf.embedJpg(jpg);
      const page = pdf.addPage([pageW, pageH]);
      page.drawImage(image, { x: 0, y: 0, width: pageW, height: pageH });
      host.innerHTML = "";
    }
    if (pdf.getPageCount() === 0) throw new Error("This slide deck could not be read.");
    return { blob: pdfBlob(await pdf.save()), name };
  } finally {
    host.remove();
  }
}

function binarySlideHtml(
  slide: { boxes: PptBox[]; bg: string; bgImage: string },
  slideW: number,
  slideH: number,
) {
  const bg = slide.bgImage
    ? `<img src="${slide.bgImage}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:fill;display:block"/>`
    : "";
  const layers = slide.boxes
    .map((box) => {
      const lines = box.text
        .split("\n")
        .filter(Boolean)
        .map(
          (line) =>
            `<div style="font-size:${box.fontPt}pt;font-weight:${box.bold ? 700 : 400};color:${box.color};line-height:1.25">${escapeXml(line)}</div>`,
        )
        .join("");
      const img = box.html
        ? box.html
        : box.image
          ? `<img src="${box.image}" style="width:100%;height:100%;object-fit:fill;display:block"/>`
          : "";
      const z = box.bold && box.fontPt >= 24 ? "z-index:3;" : box.image || box.html ? "z-index:2;" : "";
      return `<div style="position:absolute;left:${box.x}px;top:${box.y}px;width:${box.w}px;height:${box.h}px;overflow:hidden;${z}${box.fill ? `background:${box.fill};` : ""}${box.border ? `border:${box.border};box-sizing:border-box;` : ""}">${img}${lines}</div>`;
    })
    .join("");
  return `<div data-stx-slide="1" style="position:relative;width:${slideW}px;height:${slideH}px;background:${slide.bg};overflow:hidden;font-family:Calibri,Arial,Helvetica,sans-serif">${bg}${layers}</div>`;
}

async function pptxZipToPdf(zip: JSZip, name: string): Promise<ConvertedFile> {
  const presentation = await zipEntry(zip, "ppt/presentation.xml")?.async("string");
  const size = presentation?.match(/<p:sldSz\b[^>]*>/)?.[0] ?? "";
  const slideW = Math.max(320, emuPx(size.match(/\bcx="(\d+)"/)?.[1]) || 960);
  const slideH = Math.max(180, emuPx(size.match(/\bcy="(\d+)"/)?.[1]) || 540);
  const themePath =
    Object.keys(zip.files)
      .map((path) => path.replace(/\\/g, "/"))
      .find((path) => /(?:^|\/)ppt\/theme\/theme\d+\.xml$/i.test(path)) ?? "ppt/theme/theme1.xml";
  const theme = pptThemeColors(await zipEntry(zip, themePath)?.async("string") ?? "");
  const rels = parseRels(await zipEntry(zip, "ppt/_rels/presentation.xml.rels")?.async("string"), "ppt/");
  const listed = [...(presentation?.match(/<p:sldId\b[^>]*>/g) ?? [])]
    .map((tag) => {
      const rid = tag.match(/\br:id="([^"]+)"/i)?.[1] ?? tag.match(/\brid="([^"]+)"/i)?.[1] ?? "";
      return rid ? rels.get(rid) : "";
    })
    .filter((path): path is string => !!path);
  const slides = listed.length
    ? listed
    : Object.keys(zip.files)
        .map((path) => path.replace(/\\/g, "/"))
        .filter((path) => /(?:^|\/)ppt\/slides\/slide\d+\.xml$/i.test(path))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (!slides.length) throw new Error("This slide deck could not be read.");
  const html = await Promise.all(slides.map((path) => pptSlideHtml(zip, path, slideW, slideH, theme)));
  return pptSlidesToPdf(html, name);
}

export async function pptToPdf(file: File): Promise<ConvertedFile> {
  const named = /\.pptx?$/i.test(file.name) || /powerpoint|presentation/i.test(file.type);
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  if (!named && !isZipMagic(bytes) && !isOleMagic(bytes)) {
    throw new Error("Use a .ppt or .pptx slide deck.");
  }

  const pdfName = `${baseName(file)}.pdf`;
  if (isZipMagic(bytes)) {
    return pptxZipToPdf(await JSZip.loadAsync(buffer), pdfName);
  }
  if (isOleMagic(bytes)) {
    const streams = readCfbStreams(bytes);
    if (cfbStream(streams, "encryptedpackage")) {
      throw new Error("This slide deck is password-protected.");
    }
    const packed = cfbStream(streams, "package");
    if (packed && isZipMagic(packed)) {
      return pptxZipToPdf(await JSZip.loadAsync(packed), pdfName);
    }
    const document = cfbStream(streams, "powerpoint document", "powerpointdocument");
    if (!document) throw new Error("This slide deck could not be read.");
    const blips = parsePptBlips(cfbStream(streams, "pictures") ?? new Uint8Array());
    const size = pptDocSize(document);
    const charts = await extractOdcCharts(document);
    const html = binaryPptSlides(document, blips, size.w, size.h, charts);
    if (!html.length) throw new Error("This slide deck could not be read.");
    return pptSlidesToPdf(html, pdfName);
  }
  throw new Error("Use a .ppt or .pptx slide deck.");
}
