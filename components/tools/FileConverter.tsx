"use client";

import { useRef, useState } from "react";
import {
  compressPdf,
  excelToPdf,
  imagesToPdf,
  mergePdfs,
  pdfToDocx,
  pdfToImages,
  pngToJpg,
  pptToPdf,
  splitPdf,
  wordToPdf,
  type ConvertedFile,
} from "@/lib/file-convert";

type FileToolId =
  | "pdf-to-word"
  | "word-to-pdf"
  | "pdf-to-jpg"
  | "jpg-to-pdf"
  | "excel-to-pdf"
  | "ppt-to-pdf"
  | "compress-pdf"
  | "merge-pdf"
  | "pdf-to-png"
  | "png-to-pdf"
  | "split-pdf"
  | "png-to-jpg";

type ToolConfig = {
  accept: string;
  multiple: boolean;
  minFiles: number;
  maxMb: number;
  dropIcon: string;
  dropTitle: string;
  button: string;
  resultIcon: string;
  downloadLabel: string;
  convert: (files: File[]) => Promise<ConvertedFile>;
};

const configs: Record<FileToolId, ToolConfig> = {
  "pdf-to-word": {
    accept: ".pdf,application/pdf",
    multiple: false,
    minFiles: 1,
    maxMb: 25,
    dropIcon: "PDF",
    dropTitle: "Drop your PDF here",
    button: "Convert to Word",
    resultIcon: "DOC",
    downloadLabel: "Download .docx",
    convert: (files) => pdfToDocx(files[0]),
  },
  "word-to-pdf": {
    accept: ".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    multiple: false,
    minFiles: 1,
    maxMb: 25,
    dropIcon: "DOC",
    dropTitle: "Drop your Word file here",
    button: "Convert to PDF",
    resultIcon: "PDF",
    downloadLabel: "Download PDF",
    convert: (files) => wordToPdf(files[0]),
  },
  "pdf-to-jpg": {
    accept: ".pdf,application/pdf",
    multiple: false,
    minFiles: 1,
    maxMb: 25,
    dropIcon: "PDF",
    dropTitle: "Drop your PDF here",
    button: "Convert to JPG",
    resultIcon: "JPG",
    downloadLabel: "Download JPG",
    convert: (files) => pdfToImages(files[0], "jpg"),
  },
  "jpg-to-pdf": {
    accept: ".jpg,.jpeg,.png,image/jpeg,image/png",
    multiple: true,
    minFiles: 1,
    maxMb: 25,
    dropIcon: "IMG",
    dropTitle: "Drop your images here",
    button: "Convert to PDF",
    resultIcon: "PDF",
    downloadLabel: "Download PDF",
    convert: (files) => imagesToPdf(files, `${files[0].name.replace(/\.[^/.]+$/, "")}.pdf`),
  },
  "excel-to-pdf": {
    accept: ".xls,.xlsx,.csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv",
    multiple: false,
    minFiles: 1,
    maxMb: 25,
    dropIcon: "XLS",
    dropTitle: "Drop your spreadsheet here",
    button: "Convert to PDF",
    resultIcon: "PDF",
    downloadLabel: "Download PDF",
    convert: (files) => excelToPdf(files[0]),
  },
  "ppt-to-pdf": {
    accept: ".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation",
    multiple: false,
    minFiles: 1,
    maxMb: 50,
    dropIcon: "PPT",
    dropTitle: "Drop your slide deck here",
    button: "Convert to PDF",
    resultIcon: "PDF",
    downloadLabel: "Download PDF",
    convert: (files) => pptToPdf(files[0]),
  },
  "compress-pdf": {
    accept: ".pdf,application/pdf",
    multiple: false,
    minFiles: 1,
    maxMb: 100,
    dropIcon: "PDF",
    dropTitle: "Drop your PDF here",
    button: "Compress File",
    resultIcon: "PDF",
    downloadLabel: "Download Compressed PDF",
    convert: (files) => compressPdf(files[0]),
  },
  "merge-pdf": {
    accept: ".pdf,application/pdf",
    multiple: true,
    minFiles: 2,
    maxMb: 25,
    dropIcon: "PDF",
    dropTitle: "Drop your PDF files here",
    button: "Merge Files",
    resultIcon: "PDF",
    downloadLabel: "Download Merged PDF",
    convert: (files) => mergePdfs(files),
  },
  "pdf-to-png": {
    accept: ".pdf,application/pdf",
    multiple: false,
    minFiles: 1,
    maxMb: 25,
    dropIcon: "PDF",
    dropTitle: "Drop your PDF here",
    button: "Convert to PNG",
    resultIcon: "PNG",
    downloadLabel: "Download PNG",
    convert: (files) => pdfToImages(files[0], "png"),
  },
  "png-to-pdf": {
    accept: ".png,image/png",
    multiple: true,
    minFiles: 1,
    maxMb: 25,
    dropIcon: "PNG",
    dropTitle: "Drop your PNG images here",
    button: "Convert to PDF",
    resultIcon: "PDF",
    downloadLabel: "Download PDF",
    convert: (files) => imagesToPdf(files, `${files[0].name.replace(/\.[^/.]+$/, "")}.pdf`),
  },
  "split-pdf": {
    accept: ".pdf,application/pdf",
    multiple: false,
    minFiles: 1,
    maxMb: 25,
    dropIcon: "PDF",
    dropTitle: "Drop your PDF here",
    button: "Split File",
    resultIcon: "PDF",
    downloadLabel: "Download Split PDF",
    convert: (files) => splitPdf(files[0]),
  },
  "png-to-jpg": {
    accept: ".png,image/png",
    multiple: true,
    minFiles: 1,
    maxMb: 25,
    dropIcon: "PNG",
    dropTitle: "Drop your PNG images here",
    button: "Convert to JPG",
    resultIcon: "JPG",
    downloadLabel: "Download JPG",
    convert: (files) => pngToJpg(files),
  },
};

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileConverter({ id }: { id: FileToolId }) {
  const config = configs[id];
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ConvertedFile | null>(null);

  const maxBytes = config.maxMb * 1024 * 1024;
  const ready = files.length >= config.minFiles && !busy;
  const showDrop = files.length === 0 || (config.multiple && !result && !busy);

  function addFiles(list: FileList | File[]) {
    const incoming = Array.from(list);
    const accepted = incoming.filter((file) => file.size <= maxBytes);
    if (!accepted.length) {
      setError(`Max file size is ${config.maxMb}MB.`);
      return;
    }
    setError("");
    setResult(null);
    setProgress(null);
    setFiles((current) =>
      config.multiple ? [...current, ...accepted].slice(0, 20) : accepted.slice(0, 1),
    );
  }

  function reset() {
    setFiles([]);
    setResult(null);
    setProgress(null);
    setError("");
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function startConvert() {
    if (!ready) return;
    setBusy(true);
    setError("");
    setResult(null);
    setProgress(8);
    const tick = window.setInterval(() => {
      setProgress((value) => (value == null || value >= 90 ? value : value + 6));
    }, 220);
    try {
      const output = await config.convert(files);
      setProgress(100);
      setResult(output);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Conversion failed.");
    } finally {
      window.clearInterval(tick);
      setBusy(false);
      setProgress((value) => (value === 100 ? 100 : null));
    }
  }

  function download() {
    if (!result) return;
    const href = URL.createObjectURL(result.blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = result.name;
    link.click();
    URL.revokeObjectURL(href);
  }

  return (
    <div>
      {showDrop ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            if (event.dataTransfer.files.length) addFiles(event.dataTransfer.files);
          }}
          className={`w-full cursor-pointer rounded-[8px] border-2 border-dashed px-5 py-[50px] text-center transition-colors duration-150 ${
            dragging
              ? "border-steel bg-[rgba(111,169,216,0.06)]"
              : "border-line"
          }`}
        >
          <div className="border-steel text-steel mx-auto mb-[18px] flex size-[52px] items-center justify-center rounded-[8px] border-[1.5px] font-mono text-[20px]">
            {config.dropIcon}
          </div>
          <div className="font-display mb-[6px] text-[16px] font-semibold">
            {config.dropTitle}
          </div>
          <div className="text-text-dim text-[13px]">
            or <span className="text-steel underline">browse from your device</span>
            {" — "}
            max {config.maxMb}MB{config.multiple ? " each" : ""}
          </div>
        </button>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept={config.accept}
        multiple={config.multiple}
        className="hidden"
        onChange={(event) => {
          if (event.target.files?.length) addFiles(event.target.files);
        }}
      />

      {files.map((file, index) => (
        <div
          key={`${file.name}-${index}`}
          className="border-line bg-surface-2 mt-5 flex items-center gap-[14px] rounded-[6px] border px-4 py-[14px]"
        >
          <div className="text-steel flex size-[34px] shrink-0 items-center justify-center rounded-[5px] bg-[rgba(111,169,216,0.12)] font-mono text-[11px]">
            {config.dropIcon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-display truncate text-[14px] font-semibold">
              {file.name}
            </div>
            <div className="text-text-dim mt-0.5 text-[12px]">{formatSize(file.size)}</div>
          </div>
          <button
            type="button"
            className="text-text-dim hover:text-[#E17B6B] cursor-pointer px-2 py-1 font-mono text-[16px]"
            onClick={() => {
              setFiles((current) => current.filter((_, i) => i !== index));
              setResult(null);
              setProgress(null);
            }}
            aria-label="Remove file"
          >
            ✕
          </button>
        </div>
      ))}

      {progress != null && !result ? (
        <>
          <div className="bg-surface-2 mt-[18px] h-1.5 overflow-hidden rounded-[3px]">
            <div
              className="bg-steel h-full transition-[width] duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-text-dim mt-2 font-mono text-[12px]">
            Converting… {Math.min(100, Math.floor(progress))}%
          </div>
        </>
      ) : null}

      <button
        type="button"
        disabled={!ready && !result}
        onClick={result ? reset : startConvert}
        className={`font-display mt-6 w-full rounded-[5px] py-[14px] text-[15px] font-bold ${
          ready || result
            ? "bg-steel text-bg cursor-pointer"
            : "bg-surface-2 text-text-dim cursor-not-allowed"
        }`}
      >
        {busy ? "Converting…" : result ? "Convert another file" : config.button}
      </button>

      {error ? (
        <div className="mt-4 text-[13px] text-[#E17B6B]">{error}</div>
      ) : null}

      {result ? (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-[14px] rounded-[6px] border border-[rgba(123,198,126,0.3)] bg-[rgba(123,198,126,0.07)] px-[18px] py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-[34px] items-center justify-center rounded-[5px] bg-[rgba(123,198,126,0.15)] font-mono text-[11px] text-[#7BC67E]">
              {config.resultIcon}
            </div>
            <div>
              <div className="font-display text-[14px] font-semibold">{result.name}</div>
              <div className="text-text-dim mt-0.5 text-[12px]">Ready to download</div>
            </div>
          </div>
          <button
            type="button"
            onClick={download}
            className="cursor-pointer rounded-[4px] bg-[#7BC67E] px-4 py-[9px] font-mono text-[12.5px] text-[#14171C]"
          >
            {result.name.endsWith(".zip") ? "Download ZIP" : config.downloadLabel}
          </button>
        </div>
      ) : null}

      <div className="text-text-dim mt-5 flex items-center gap-2 text-[12px]">
        <span className="size-1.5 shrink-0 rounded-full bg-[#7BC67E]" />
        Files are processed in your browser and never uploaded to a server.
      </div>
    </div>
  );
}
