import React, { useState, useEffect, useMemo, useRef } from 'react';
import { HLIPillar, HLIFile } from '../types';
import { fetchHLIFileDownloadUrl } from '../services/firestoreService';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import {
  X,
  Lock,
  Unlock,
  FileText,
  CheckCircle2,
  AlertCircle,
  Download,
  FileCheck,
  FileSpreadsheet,
  File,
  AlertTriangle,
  Loader2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Copy,
  Check,
  ExternalLink,
  Search,
  Table,
  Layers,
  Maximize2,
} from 'lucide-react';

interface ViewHLIFileModalProps {
  isOpen: boolean;
  file: HLIFile | null;
  pillar?: HLIPillar | null;
  isAdmin: boolean;
  onClose: () => void;
  onDownload?: (file: HLIFile) => void;
  onShowToast?: (msg: string) => void;
}

type DocumentViewMode = 'loading' | 'docx' | 'spreadsheet' | 'pdf' | 'text' | 'image' | 'error' | 'other';

interface SheetData {
  name: string;
  rows: any[][];
  rowCount: number;
  colCount: number;
}

export const ViewHLIFileModal: React.FC<ViewHLIFileModalProps> = ({
  isOpen,
  file,
  pillar,
  isAdmin,
  onClose,
  onDownload,
  onShowToast,
}) => {
  if (!isOpen || !file) return null;

  const [rawContent, setRawContent] = useState<string>('');
  const [viewMode, setViewMode] = useState<DocumentViewMode>('loading');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // DOCX state
  const [docxHtml, setDocxHtml] = useState<string>('');

  // Spreadsheet state
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [activeSheetIndex, setActiveSheetIndex] = useState<number>(0);
  const [sheetSearchQuery, setSheetSearchQuery] = useState<string>('');

  // PDF state
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string>('');

  // Text state
  const [textContent, setTextContent] = useState<string>('');
  const [textSearchQuery, setTextSearchQuery] = useState<string>('');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('sm');

  // Image state
  const [imageZoom, setImageZoom] = useState<number>(1);
  const [imageRotation, setImageRotation] = useState<number>(0);

  // General state
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [fullScreen, setFullScreen] = useState<boolean>(false);

  // Clean up blob URL on unmount or file change
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [pdfBlobUrl]);

  // Load and parse document
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setErrorMessage(null);
    setViewMode('loading');
    setDocxHtml('');
    setSheets([]);
    setActiveSheetIndex(0);
    setSheetSearchQuery('');
    setTextContent('');
    setTextSearchQuery('');
    setImageZoom(1);
    setImageRotation(0);

    const loadAndParse = async () => {
      try {
        const url = await fetchHLIFileDownloadUrl(file);
        if (!isMounted) return;

        if (!url || url.trim().length === 0) {
          throw new Error('Document content could not be located in Cloud storage.');
        }

        setRawContent(url);
        await parseDocument(url, file);
      } catch (err: any) {
        console.error('Error fetching/parsing document:', err);
        if (isMounted) {
          setErrorMessage(err?.message || 'Failed to parse and render document content.');
          setViewMode('error');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadAndParse();

    return () => {
      isMounted = false;
    };
  }, [file]);

  // Parse document content by analyzing MIME, extension, and content bytes
  const parseDocument = async (content: string, currentFile: HLIFile) => {
    const filename = (currentFile.name || '').toLowerCase();
    const declaredType = (currentFile.fileType || '').toLowerCase();

    // 1. Image Check
    if (
      content.startsWith('data:image/') ||
      declaredType === 'image' ||
      /\.(png|jpe?g|webp|gif|svg|bmp)($|\?)/i.test(filename)
    ) {
      setViewMode('image');
      return;
    }

    // 2. Sample or Explicit Text Check
    // If the data URI is explicitly plain text, or if filename ends in .txt/.md/.log/.json
    const isExplicitTextDataUrl =
      content.startsWith('data:text/plain') ||
      content.startsWith('data:text/markdown') ||
      content.startsWith('data:text/json') ||
      content.startsWith('data:application/json');

    const isTextExtension = /\.(txt|md|text|log|json|xml|rtf)($|\?)/i.test(filename);

    if (isExplicitTextDataUrl || (isTextExtension && !content.includes('wordprocessingml') && !content.includes('spreadsheetml'))) {
      const decoded = decodeText(content);
      setTextContent(decoded);
      setViewMode('text');
      return;
    }

    // 3. Word Document (.docx / .doc)
    const isDocx =
      filename.endsWith('.docx') ||
      filename.endsWith('.doc') ||
      declaredType === 'docx' ||
      declaredType === 'doc' ||
      content.includes('wordprocessingml') ||
      content.includes('application/msword');

    if (isDocx) {
      try {
        const arrayBuffer = base64ToArrayBuffer(content);
        const result = await mammoth.convertToHtml({ arrayBuffer });
        if (result.value && result.value.trim().length > 0) {
          setDocxHtml(result.value);
          setViewMode('docx');
          return;
        } else {
          // Fallback to raw text extraction with mammoth
          const rawTextResult = await mammoth.extractRawText({ arrayBuffer });
          if (rawTextResult.value && rawTextResult.value.trim().length > 0) {
            setTextContent(rawTextResult.value);
            setViewMode('text');
            return;
          }
        }
      } catch (docxErr) {
        console.warn('Mammoth docx parse notice, attempting text decode fallback:', docxErr);
      }
    }

    // 4. Spreadsheets (.xlsx / .xls / .csv / .tsv)
    const isSpreadsheet =
      filename.endsWith('.xlsx') ||
      filename.endsWith('.xls') ||
      filename.endsWith('.csv') ||
      filename.endsWith('.tsv') ||
      declaredType === 'xlsx' ||
      declaredType === 'xls' ||
      declaredType === 'csv' ||
      content.includes('spreadsheetml') ||
      content.includes('text/csv');

    if (isSpreadsheet) {
      try {
        let workbook: XLSX.WorkBook;
        if (content.startsWith('data:text/csv') || filename.endsWith('.csv')) {
          const csvText = decodeText(content);
          workbook = XLSX.read(csvText, { type: 'string' });
        } else {
          const arrayBuffer = base64ToArrayBuffer(content);
          workbook = XLSX.read(arrayBuffer, { type: 'array' });
        }

        if (workbook && workbook.SheetNames && workbook.SheetNames.length > 0) {
          const parsedSheets: SheetData[] = workbook.SheetNames.map((sheetName) => {
            const worksheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][];
            const colCount = rows.reduce((max, r) => Math.max(max, Array.isArray(r) ? r.length : 0), 0);
            return {
              name: sheetName,
              rows,
              rowCount: rows.length,
              colCount,
            };
          });

          setSheets(parsedSheets);
          setViewMode('spreadsheet');
          return;
        }
      } catch (sheetErr) {
        console.warn('XLSX parse notice, trying text fallback:', sheetErr);
      }
    }

    // 5. PDF Check
    const isPdf =
      filename.endsWith('.pdf') ||
      declaredType === 'pdf' ||
      content.startsWith('data:application/pdf');

    if (isPdf) {
      // Check if it's actually plain text (like seeded sample files that have .txt data)
      if (content.startsWith('data:text/')) {
        const decoded = decodeText(content);
        setTextContent(decoded);
        setViewMode('text');
        return;
      }

      try {
        const blob = base64ToBlob(content, 'application/pdf');
        const blobUrl = URL.createObjectURL(blob);
        setPdfBlobUrl(blobUrl);
        setViewMode('pdf');
        return;
      } catch (pdfErr) {
        console.warn('PDF blob generation notice:', pdfErr);
      }
    }

    // 6. Generic Text Fallback: Try decoding as UTF-8 text
    const textAttempt = decodeText(content);
    // Check if it looks like human-readable text
    if (textAttempt && textAttempt.trim().length > 0 && isPrintableText(textAttempt)) {
      setTextContent(textAttempt);
      setViewMode('text');
      return;
    }

    // 7. If everything else fails, display document summary with download option
    setViewMode('other');
  };

  // Convert base64 data URI to ArrayBuffer
  const base64ToArrayBuffer = (dataUrlOrBase64: string): ArrayBuffer => {
    let base64 = dataUrlOrBase64;
    if (dataUrlOrBase64.includes(',')) {
      base64 = dataUrlOrBase64.split(',')[1];
    }
    const binary = atob(base64.trim());
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  };

  // Convert base64 data URI to Blob
  const base64ToBlob = (dataUrlOrBase64: string, mimeType: string): Blob => {
    let base64 = dataUrlOrBase64;
    if (dataUrlOrBase64.includes(',')) {
      base64 = dataUrlOrBase64.split(',')[1];
    }
    const binary = atob(base64.trim());
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type: mimeType });
  };

  // Safely decode text from data URI or Base64 with UTF-8 support
  const decodeText = (content: string): string => {
    try {
      if (content.startsWith('data:')) {
        const commaIdx = content.indexOf(',');
        if (commaIdx !== -1) {
          const meta = content.substring(0, commaIdx);
          const raw = content.substring(commaIdx + 1);

          if (meta.includes(';base64')) {
            const binary = atob(raw);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
              bytes[i] = binary.charCodeAt(i);
            }
            return new TextDecoder('utf-8').decode(bytes);
          } else {
            return decodeURIComponent(raw);
          }
        }
      }
      return content;
    } catch (e) {
      try {
        const raw = content.includes(',') ? content.split(',')[1] : content;
        return atob(raw);
      } catch {
        return content;
      }
    }
  };

  // Heuristic to check if string contains printable text vs binary gibberish
  const isPrintableText = (str: string): boolean => {
    const sample = str.slice(0, 1000);
    let printableCount = 0;
    for (let i = 0; i < sample.length; i++) {
      const code = sample.charCodeAt(i);
      if (
        code === 9 ||
        code === 10 ||
        code === 13 ||
        (code >= 32 && code <= 126) ||
        code >= 160
      ) {
        printableCount++;
      }
    }
    return sample.length > 0 && printableCount / sample.length > 0.85;
  };

  const handleCopyText = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    onShowToast?.('Document excerpt copied to clipboard.');
  };

  const getFileIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'pdf':
        return <FileCheck className="w-5 h-5 text-red-500" />;
      case 'xlsx':
      case 'xls':
      case 'csv':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
      case 'docx':
      case 'doc':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'image':
        return <File className="w-5 h-5 text-purple-500" />;
      default:
        return <FileText className="w-5 h-5 text-teal-500" />;
    }
  };

  const getTextFontSizeClass = () => {
    switch (fontSize) {
      case 'base':
        return 'text-sm leading-relaxed';
      case 'lg':
        return 'text-base leading-relaxed';
      default:
        return 'text-xs leading-relaxed';
    }
  };

  // Filter spreadsheet rows based on search
  const currentSheet = sheets[activeSheetIndex] || null;
  const filteredRows = useMemo(() => {
    if (!currentSheet || !currentSheet.rows) return [];
    if (!sheetSearchQuery.trim()) return currentSheet.rows;
    const q = sheetSearchQuery.toLowerCase();
    return currentSheet.rows.filter((row, idx) => {
      if (idx === 0) return true; // Always keep table header
      return row.some((cell) => String(cell || '').toLowerCase().includes(q));
    });
  }, [currentSheet, sheetSearchQuery]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className={`relative w-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all ${
          fullScreen
            ? 'h-[98vh] max-w-[98vw]'
            : 'max-w-5xl h-[92vh]'
        }`}
      >
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-[#0f2454] to-emerald-950 p-4 sm:p-5 text-white flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 bg-white/10 rounded-xl border border-white/20 text-emerald-300 shrink-0">
              {getFileIcon(file.fileType)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  {pillar ? pillar.name : 'HLI Document'}
                </span>
                {file.isRestricted ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>Restricted • View-Only</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                    <Unlock className="w-3 h-3" />
                    <span>Public Document</span>
                  </span>
                )}
                <span className="text-[10px] font-semibold text-slate-300 bg-white/10 px-2 py-0.5 rounded-full">
                  Format: {(file.fileType || 'Doc').toUpperCase()}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-md sm:max-w-2xl mt-0.5">
                {file.title}
              </h3>
              <p className="text-[11px] font-mono text-emerald-200/80 truncate">
                {file.name} • {file.fileSize || 'Standard Document'} • Uploaded: {file.uploadedAt}
              </p>
            </div>
          </div>

          {/* Action Header Tools */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Toggle Fullscreen Modal */}
            <button
              type="button"
              onClick={() => setFullScreen(!fullScreen)}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title={fullScreen ? 'Standard size' : 'Expand full screen'}
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Download Button */}
            {file.isRestricted && !isAdmin ? (
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-slate-300 border border-white/20 text-xs font-semibold cursor-not-allowed"
                title="Download restricted by school administrator: Document can be inspected and viewed online"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Download Restricted</span>
                <span className="sm:hidden">Locked</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onDownload?.(file)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer ${
                  file.isRestricted
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
                title={file.isRestricted ? 'Admin Download (Restricted Record)' : 'Download this document'}
              >
                <Download className="w-3.5 h-3.5" />
                <span>{file.isRestricted ? 'Admin Download' : 'Download File'}</span>
              </button>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title="Close document viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Restricted Notice Banner */}
        {file.isRestricted && (
          <div className="p-2.5 sm:p-3 bg-amber-50 border-b border-amber-200 flex items-start gap-2.5 text-xs text-amber-950 shrink-0">
            <div className="p-1 bg-amber-100 rounded-lg text-amber-700 shrink-0 mt-0.5">
              <Lock className="w-4 h-4" />
            </div>
            <div className="flex-1 space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-amber-900">Protected School Record — Online Inspection View</span>
                <span className="text-[10px] px-2 py-0.5 bg-amber-200/80 rounded-full font-bold text-amber-900">
                  Downloading Restricted
                </span>
              </div>
              <p className="text-[11px] text-amber-850 leading-relaxed">
                {file.restrictionReason ||
                  'This official school record has been restricted for download by the administrator. Authorized visitors may inspect and read this document online for transparency and compliance, but exporting/downloading the file is restricted.'}
              </p>
            </div>
          </div>
        )}

        {/* Toolbar for Text & DOCX */}
        {(viewMode === 'text' || viewMode === 'docx') && !isLoading && (
          <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
            <div className="flex items-center gap-3">
              {/* Text Size Controls */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-500">Text Size:</span>
                <div className="inline-flex rounded-md shadow-2xs border border-slate-300 bg-white overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setFontSize('sm')}
                    className={`px-2.5 py-1 text-[11px] font-bold cursor-pointer transition-colors ${
                      fontSize === 'sm' ? 'bg-[#0f2454] text-white' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                    title="Small text"
                  >
                    A-
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontSize('base')}
                    className={`px-2.5 py-1 text-[11px] font-bold cursor-pointer transition-colors ${
                      fontSize === 'base' ? 'bg-[#0f2454] text-white' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                    title="Normal text"
                  >
                    A
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontSize('lg')}
                    className={`px-2.5 py-1 text-[11px] font-bold cursor-pointer transition-colors ${
                      fontSize === 'lg' ? 'bg-[#0f2454] text-white' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                    title="Large text"
                  >
                    A+
                  </button>
                </div>
              </div>

              {/* Text Search Box */}
              {viewMode === 'text' && (
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={textSearchQuery}
                    onChange={(e) => setTextSearchQuery(e.target.value)}
                    placeholder="Search in document..."
                    className="pl-8 pr-2.5 py-1 rounded-md border border-slate-300 bg-white text-[11px] text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-600 w-36 sm:w-48"
                  />
                  {textSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setTextSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ×
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopyText(viewMode === 'text' ? textContent : docxHtml.replace(/<[^>]*>?/gm, ''))}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-[11px] font-semibold transition-colors cursor-pointer"
                title="Copy text excerpt"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Toolbar for Spreadsheets */}
        {viewMode === 'spreadsheet' && !isLoading && (
          <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
            {/* Sheet Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-xl scrollbar-none">
              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mr-1 shrink-0">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                Sheets:
              </span>
              {sheets.map((s, idx) => (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => setActiveSheetIndex(idx)}
                  className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                    activeSheetIndex === idx
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
                  }`}
                >
                  <Table className="w-3 h-3" />
                  <span>{s.name}</span>
                  <span className="text-[10px] opacity-75">({s.rowCount} rows)</span>
                </button>
              ))}
            </div>

            {/* Sheet Search */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={sheetSearchQuery}
                  onChange={(e) => setSheetSearchQuery(e.target.value)}
                  placeholder="Filter spreadsheet cells..."
                  className="pl-8 pr-2.5 py-1 rounded-md border border-slate-300 bg-white text-[11px] text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-600 w-44 sm:w-56"
                />
                {sheetSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setSheetSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Toolbar for Images */}
        {viewMode === 'image' && !isLoading && (
          <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between gap-3 text-xs shrink-0">
            <span className="text-[11px] font-semibold text-slate-500">Image Viewer</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setImageZoom((prev) => Math.max(0.4, prev - 0.2))}
                className="p-1.5 rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-bold text-slate-700 min-w-10 text-center">
                {Math.round(imageZoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setImageZoom((prev) => Math.min(3, prev + 0.2))}
                className="p-1.5 rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setImageZoom(1)}
                className="px-2 py-1 rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-[11px] font-semibold"
                title="Reset Zoom"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setImageRotation((prev) => (prev + 90) % 360)}
                className="p-1.5 rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                title="Rotate 90 degrees"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Toolbar for PDF */}
        {viewMode === 'pdf' && !isLoading && (
          <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between gap-3 text-xs shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-600">
                Official PDF Document Reader
              </span>
            </div>
            {pdfBlobUrl && (
              <a
                href={pdfBlobUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-[11px] font-semibold transition-colors cursor-pointer"
                title="Open PDF in full browser window"
              >
                <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                <span>Open in Full Window</span>
              </a>
            )}
          </div>
        )}

        {/* Modal Main Content Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-50 flex flex-col">
          {isLoading ? (
            <div className="py-24 text-center space-y-3 my-auto">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-700">Loading document content...</p>
              <p className="text-[11px] text-slate-500">Retrieving encrypted school records from Cloud storage</p>
            </div>
          ) : viewMode === 'error' ? (
            <div className="my-auto max-w-lg mx-auto py-12 px-6 text-center space-y-3 bg-red-50 rounded-2xl border border-red-200">
              <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
              <p className="text-sm font-bold text-red-900">Unable to display document</p>
              <p className="text-xs text-red-700">{errorMessage || 'An error occurred while reading the document.'}</p>
              <p className="text-[11px] text-slate-500 pt-2">
                You can try downloading the file directly if access permissions permit.
              </p>
            </div>
          ) : viewMode === 'docx' ? (
            /* DOCX / Microsoft Word View */
            <div className="max-w-4xl mx-auto w-full bg-white rounded-xl shadow-xs border border-slate-300 p-6 sm:p-10 space-y-6">
              {/* Official Header */}
              <div className="text-center space-y-1 pb-4 border-b-2 border-emerald-900/20">
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                  Republic of the Philippines • Department of Education • Region V (Bicol)
                </p>
                <h4 className="text-sm sm:text-base font-extrabold text-[#0f2454]">
                  VINISITAHAN INTEGRATED SCHOOL
                </h4>
                <p className="text-[11px] font-semibold text-slate-600">
                  School ID: 502996 • Donsol West II District, Schools Division Office of Sorsogon
                </p>
                <div className="inline-block px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold mt-1">
                  Healthy Learning Institutions (HLI) Document Repository
                </div>
              </div>

              {/* Title & Metadata */}
              <div className="space-y-1">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">{file.title}</h2>
                {file.description && (
                  <p className="text-xs text-slate-600 italic">{file.description}</p>
                )}
                <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                  <span>Record Date: {file.uploadedAt}</span>
                  <span>•</span>
                  <span>Classification: {file.isRestricted ? 'Restricted / View-Only' : 'Public Record'}</span>
                </div>
              </div>

              {/* Converted Word HTML Content */}
              <div
                className={`prose prose-slate max-w-none border-t border-slate-100 pt-4 text-slate-800 ${getTextFontSizeClass()} [&_h1]:text-lg [&_h1]:font-bold [&_h1]:text-[#0f2454] [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-slate-800 [&_h3]:text-sm [&_h3]:font-bold [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_table]:w-full [&_table]:border-collapse [&_table]:border [&_table]:border-slate-300 [&_th]:border [&_th]:border-slate-300 [&_th]:p-2 [&_th]:bg-slate-100 [&_td]:border [&_td]:border-slate-300 [&_td]:p-2`}
                dangerouslySetInnerHTML={{ __html: docxHtml }}
              />

              {/* Official Document Footer Stamp */}
              <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] text-slate-500">
                <div>
                  <span className="font-semibold block text-slate-700">Vinisitahan Integrated School Archive</span>
                  <span>Barangay Vinisitahan, Donsol, Sorsogon</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold block text-emerald-800">Verified Institutional Record</span>
                  <span>DEPED-DOH HLI FRAMEWORK</span>
                </div>
              </div>
            </div>
          ) : viewMode === 'spreadsheet' ? (
            /* Spreadsheet / Excel View */
            <div className="w-full flex-1 flex flex-col bg-white rounded-xl shadow-xs border border-slate-300 overflow-hidden">
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Table className="w-4 h-4 text-emerald-600" />
                  <span>
                    Viewing: <strong className="text-emerald-800">{currentSheet?.name}</strong>
                  </span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    ({filteredRows.length} displayed rows &bull; {currentSheet?.colCount || 0} columns)
                  </span>
                </span>
                {sheetSearchQuery && (
                  <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Filtered by: &quot;{sheetSearchQuery}&quot;
                  </span>
                )}
              </div>

              <div className="flex-1 overflow-auto max-h-[65vh]">
                {filteredRows.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 text-xs">
                    No spreadsheet rows match your search query.
                  </div>
                ) : (
                  <table className="w-full border-collapse text-left text-xs font-sans">
                    <thead className="sticky top-0 bg-slate-100 shadow-2xs z-10">
                      <tr>
                        <th className="p-2 border border-slate-300 text-[10px] font-mono text-slate-400 bg-slate-200 w-10 text-center">
                          #
                        </th>
                        {Array.from({ length: currentSheet?.colCount || (filteredRows[0]?.length || 0) }).map((_, cIdx) => (
                          <th
                            key={cIdx}
                            className="p-2.5 border border-slate-300 font-bold text-slate-800 bg-slate-100 whitespace-nowrap"
                          >
                            {filteredRows[0]?.[cIdx] !== undefined && filteredRows[0]?.[cIdx] !== ''
                              ? String(filteredRows[0][cIdx])
                              : `Col ${cIdx + 1}`}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRows.slice(1).map((row, rIdx) => (
                        <tr
                          key={rIdx}
                          className={rIdx % 2 === 0 ? 'bg-white hover:bg-emerald-50/50' : 'bg-slate-50/60 hover:bg-emerald-50/50'}
                        >
                          <td className="p-2 border border-slate-200 text-[10px] font-mono text-slate-400 text-center bg-slate-50/80">
                            {rIdx + 1}
                          </td>
                          {Array.from({ length: currentSheet?.colCount || 0 }).map((_, cIdx) => (
                            <td
                              key={cIdx}
                              className="p-2.5 border border-slate-200 text-slate-700 whitespace-pre-wrap max-w-xs break-words"
                            >
                              {row[cIdx] !== undefined && row[cIdx] !== null ? String(row[cIdx]) : ''}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ) : viewMode === 'pdf' ? (
            /* PDF Document Viewer */
            <div className="w-full flex-1 flex flex-col bg-white rounded-xl shadow-xs border border-slate-300 overflow-hidden min-h-[600px]">
              {pdfBlobUrl ? (
                <object
                  data={pdfBlobUrl}
                  type="application/pdf"
                  className="w-full flex-1 min-h-[600px] border-0"
                >
                  <iframe
                    src={pdfBlobUrl}
                    title={file.title}
                    className="w-full flex-1 min-h-[600px] border-0"
                  >
                    <div className="p-8 text-center space-y-3">
                      <p className="text-xs font-bold text-slate-700">PDF preview is available in full window:</p>
                      <a
                        href={pdfBlobUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Open PDF in Full Screen Window</span>
                      </a>
                    </div>
                  </iframe>
                </object>
              ) : (
                <div className="p-8 text-center text-xs text-slate-500">Preparing PDF viewer...</div>
              )}
            </div>
          ) : viewMode === 'image' ? (
            /* Image Preview */
            <div className="flex-1 flex flex-col items-center justify-center p-4 bg-slate-900/5 rounded-2xl border border-slate-200 overflow-auto">
              <img
                src={rawContent}
                alt={file.title}
                style={{
                  transform: `scale(${imageZoom}) rotate(${imageRotation}deg)`,
                  transition: 'transform 0.15s ease-out',
                }}
                className="max-h-[65vh] max-w-full object-contain rounded-xl shadow-md border border-slate-200"
              />
              <p className="text-xs text-slate-500 mt-4 font-medium">
                {file.title} ({file.fileSize})
              </p>
            </div>
          ) : viewMode === 'text' ? (
            /* Plain Text / Formatted Paper View */
            <div className="max-w-3xl mx-auto w-full bg-white rounded-xl shadow-xs border border-slate-300 p-6 sm:p-10 space-y-6">
              {/* Official DepEd Header */}
              <div className="text-center space-y-1 pb-4 border-b-2 border-emerald-900/20">
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                  Republic of the Philippines • Department of Education • Region V (Bicol)
                </p>
                <h4 className="text-sm sm:text-base font-extrabold text-[#0f2454]">
                  VINISITAHAN INTEGRATED SCHOOL
                </h4>
                <p className="text-[11px] font-semibold text-slate-600">
                  School ID: 502996 • Donsol West II District, Schools Division Office of Sorsogon
                </p>
                <div className="inline-block px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold mt-1">
                  Healthy Learning Institutions (HLI) Document Repository
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-1">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">{file.title}</h2>
                {file.description && (
                  <p className="text-xs text-slate-600 italic">{file.description}</p>
                )}
                <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                  <span>Record Date: {file.uploadedAt}</span>
                  <span>•</span>
                  <span>Classification: {file.isRestricted ? 'Restricted / View-Only' : 'Public Record'}</span>
                </div>
              </div>

              {/* Text Body */}
              <div className="pt-2 border-t border-slate-100">
                <pre
                  className={`font-sans whitespace-pre-wrap text-slate-800 ${getTextFontSizeClass()}`}
                >
                  {textContent}
                </pre>
              </div>

              {/* Footer Stamp */}
              <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] text-slate-500">
                <div>
                  <span className="font-semibold block text-slate-700">Vinisitahan Integrated School Archive</span>
                  <span>Barangay Vinisitahan, Donsol, Sorsogon</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold block text-emerald-800">Verified Institutional Record</span>
                  <span>DEPED-DOH HLI FRAMEWORK</span>
                </div>
              </div>
            </div>
          ) : (
            /* Other / Document Summary Profile Fallback */
            <div className="max-w-2xl mx-auto my-auto w-full bg-white rounded-2xl shadow-xs border border-slate-200 p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-700">
                  {getFileIcon(file.fileType)}
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">{file.title}</h4>
                  <p className="text-xs font-mono text-slate-500">{file.name}</p>
                </div>
              </div>

              {/* Metadata Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div>
                  <span className="text-slate-500 block font-semibold">Pillar Category:</span>
                  <span className="font-bold text-slate-800">{pillar ? pillar.title : 'General HLI Document'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold">File Format & Size:</span>
                  <span className="font-bold text-slate-800">{file.fileType.toUpperCase()} ({file.fileSize})</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold">Upload Date:</span>
                  <span className="font-bold text-slate-800">{file.uploadedAt}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold">Access Status:</span>
                  <span className="font-bold text-amber-700">
                    {file.isRestricted ? 'Restricted (View-Only)' : 'Public Download Allowed'}
                  </span>
                </div>
              </div>

              {/* Description */}
              {file.description && (
                <div className="space-y-1.5">
                  <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Institutional Record Description
                  </h5>
                  <p className="text-xs text-slate-700 leading-relaxed bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100">
                    {file.description}
                  </p>
                </div>
              )}

              {/* Restriction Message */}
              {file.isRestricted && (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-1 text-xs text-amber-900">
                  <p className="font-bold flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-amber-700" />
                    Administrative Download Restriction Notice
                  </p>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    {file.restrictionReason ||
                      'This record is protected by administrative policy. You are permitted to view the document record online, but direct file download is restricted.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            {file.isRestricted ? (
              <span className="flex items-center gap-1 text-amber-800 font-semibold">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                View-Only Clearance: Document is fully inspectable online. Downloading is restricted.
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-800 font-semibold">
                <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                Public School Document: Free online inspection and download.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
            {(!file.isRestricted || isAdmin) && (
              <button
                type="button"
                onClick={() => onDownload?.(file)}
                className="px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{file.isRestricted ? 'Admin Download' : 'Download Document'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
