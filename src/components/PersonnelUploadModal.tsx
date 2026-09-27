import React, { useState, useRef } from 'react';
import { PersonnelMember, PersonnelCategory } from '../types';
import { 
  Upload, 
  Download, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  RefreshCw, 
  Layers, 
  FileSpreadsheet
} from 'lucide-react';

interface PersonnelUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (newMembers: PersonnelMember[], mode: 'replace' | 'append') => void;
}

export const PersonnelUploadModal: React.FC<PersonnelUploadModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [parsedMembers, setParsedMembers] = useState<PersonnelMember[]>([]);
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Download Sample CSV template
  const handleDownloadTemplate = () => {
    const csvContent = [
      'Name,Position,Category,DepartmentOrGrade,Email,ContactNumber',
      '"Dr. Salvacion B. Alcantara, EdD","Public Schools District Supervisor (PSDS)","district","DepEd Sorsogon • Donsol West II District","salvacion.alcantara@deped.gov.ph","+63 (056) 311-2001"',
      '"Dr. Maria Teresa G. Ramos, PhD","Principal I / School Head","administration","Office of the School Head","vinisitahangdrive@gmail.com","+63 917 829 4500"',
      '"Glenda M. Escober","Administrative Officer II","admin_officer","Office of the Administrative Officer • School Operations","glenda.escober@deped.gov.ph","+63 918 732 9904"',
      '"Corazon L. Hernandez, MT-II","Master Teacher II • Elem Head","elementary","Elementary Department (K to 6)","corazon.hernandez@deped.gov.ph","+63 919 452 1102"',
      '"Danilo V. Espares, MT-I","Master Teacher I • JHS Head","secondary","Junior High School (Grades 7 to 10)","danilo.espares@deped.gov.ph","+63 920 883 4510"',
      '"Janice P. Mortega","Teacher I","elementary","Kindergarten • Early Childhood","janice.mortega@deped.gov.ph","+63 912 301 4411"',
      '"Mark Anthony G. Perez","Teacher III","secondary","Grade 7 Adviser • English","markanthony.perez@deped.gov.ph","+63 917 662 1098"',
      '"Jeffrey K. Serrano","Administrative Aide VI","non_teaching","School Registrar & LIS","jeffrey.serrano@deped.gov.ph","+63 916 443 8901"'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'vinisitahan_faculty_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Simple CSV Line Parser handling quotes
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const handleProcessFile = (file: File) => {
    setError(null);
    setFileName(file.name);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) {
          throw new Error('File content is empty.');
        }

        if (file.name.endsWith('.json')) {
          const jsonData = JSON.parse(text);
          if (!Array.isArray(jsonData)) {
            throw new Error('JSON must be an array of personnel records.');
          }
          const members: PersonnelMember[] = jsonData.map((item, idx) => ({
            id: item.id || `personnel-imported-${Date.now()}-${idx}`,
            name: item.name || 'Unnamed Personnel',
            position: item.position || 'Teacher',
            category: (item.category as PersonnelCategory) || 'elementary',
            departmentOrGrade: item.departmentOrGrade || 'Vinisitahan IS',
            reportsToId: item.reportsToId || null,
            email: item.email || undefined,
            contactNumber: item.contactNumber || undefined,
            order: item.order || idx + 1,
          }));
          setParsedMembers(members);
        } else {
          // CSV Parser
          const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
          if (lines.length < 2) {
            throw new Error('CSV must contain a header row and at least one data row.');
          }

          const members: PersonnelMember[] = [];
          for (let i = 1; i < lines.length; i++) {
            const columns = parseCSVLine(lines[i]);
            if (columns.length < 2) continue;

            const name = columns[0] || '';
            const position = columns[1] || 'Faculty';
            let category: PersonnelCategory = 'elementary';
            const catRaw = (columns[2] || '').toLowerCase();
            if (catRaw.includes('district_admin') || (catRaw.includes('district') && (catRaw.includes('admin') || catRaw.includes('ao')))) {
              category = 'district_admin_officer';
            } else if (catRaw.includes('district') || catRaw.includes('psds')) {
              category = 'district';
            } else if (catRaw.includes('admin_officer') || catRaw.includes('administrative officer') || catRaw.includes('ao ii') || catRaw.includes('ao iv')) {
              category = 'admin_officer';
            } else if (catRaw.includes('admin') || catRaw.includes('principal') || catRaw.includes('head')) {
              category = 'administration';
            } else if (catRaw.includes('sec') || catRaw.includes('jhs') || catRaw.includes('high')) {
              category = 'secondary';
            } else if (catRaw.includes('non') || catRaw.includes('staff') || catRaw.includes('support')) {
              category = 'non_teaching';
            }

            const departmentOrGrade = columns[3] || 'Vinisitahan Integrated School';
            const email = columns[4] || undefined;
            const contactNumber = columns[5] || undefined;

            if (name.trim()) {
              members.push({
                id: `personnel-csv-${Date.now()}-${i}`,
                name: name.replace(/^"+|"+$/g, '').trim(),
                position: position.replace(/^"+|"+$/g, '').trim(),
                category,
                departmentOrGrade: departmentOrGrade.replace(/^"+|"+$/g, '').trim(),
                email: email ? email.replace(/^"+|"+$/g, '').trim() : undefined,
                contactNumber: contactNumber ? contactNumber.replace(/^"+|"+$/g, '').trim() : undefined,
                order: i,
              });
            }
          }

          if (members.length === 0) {
            throw new Error('No valid personnel records found in this file.');
          }

          setParsedMembers(members);
        }
      } catch (err: unknown) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Failed to parse file.');
        setParsedMembers([]);
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setError('Failed to read file from disk.');
      setIsProcessing(false);
    };

    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (parsedMembers.length === 0) return;
    onImport(parsedMembers, importMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Upload & Import Personnel Data</h3>
              <p className="text-xs text-slate-500">
                Bulk upload faculty & non-teaching staff via CSV or JSON spreadsheet
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Template Download Guide */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs">
            <div className="space-y-0.5">
              <strong className="text-blue-900 block font-bold">Need a formatted CSV spreadsheet template?</strong>
              <span className="text-blue-700">
                Download a pre-filled template with proper DepEd categories and headers.
              </span>
            </div>
            <button
              type="button"
              id="btn-download-csv-template"
              onClick={handleDownloadTemplate}
              className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold inline-flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Template</span>
            </button>
          </div>

          {/* Upload Area */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv,.json,text/csv,application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleProcessFile(file);
              }}
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/60 hover:bg-emerald-50/20 rounded-xl p-6 text-center cursor-pointer transition-all"
            >
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
                {isProcessing ? (
                  <RefreshCw className="w-6 h-6 animate-spin text-emerald-700" />
                ) : (
                  <Upload className="w-6 h-6" />
                )}
              </div>
              <p className="text-sm font-bold text-slate-800">
                {fileName ? `Selected: ${fileName}` : 'Click to select CSV or JSON file'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Supports Excel exported .csv files with faculty names, ranks, and categories
              </p>
            </div>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Preview Parsed Content */}
          {parsedMembers.length > 0 && (
            <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Successfully parsed {parsedMembers.length} personnel records
                </span>
                <span className="text-slate-500 font-mono">
                  {parsedMembers.filter((m) => m.category === 'elementary').length} Elem •{' '}
                  {parsedMembers.filter((m) => m.category === 'secondary').length} Sec •{' '}
                  {parsedMembers.filter((m) => m.category === 'non_teaching').length} Support
                </span>
              </div>

              {/* Sample list preview */}
              <div className="max-h-36 overflow-y-auto rounded-lg border border-slate-200 bg-white divide-y divide-slate-100 text-xs">
                {parsedMembers.slice(0, 5).map((m, idx) => (
                  <div key={idx} className="p-2 flex items-center justify-between">
                    <div>
                      <strong className="text-slate-800 block">{m.name}</strong>
                      <span className="text-[11px] text-slate-500">{m.position} • {m.departmentOrGrade}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold uppercase">
                      {m.category}
                    </span>
                  </div>
                ))}
                {parsedMembers.length > 5 && (
                  <div className="p-2 text-center text-slate-400 text-[11px] italic">
                    + {parsedMembers.length - 5} more records ready for import...
                  </div>
                )}
              </div>

              {/* Import Mode Selection */}
              <div className="pt-2 border-t border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Import Method:</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setImportMode('replace')}
                    className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                      importMode === 'replace'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold ring-1 ring-blue-600'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold">Replace Current List</div>
                    <div className="text-[10px] text-slate-500 font-normal">
                      Overwrites existing faculty and staff directory with new list.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImportMode('append')}
                    className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                      importMode === 'append'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold ring-1 ring-blue-600'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold">Append to List</div>
                    <div className="text-[10px] text-slate-500 font-normal">
                      Adds these records without removing existing staff.
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            id="btn-confirm-import-personnel"
            disabled={parsedMembers.length === 0}
            onClick={handleConfirmImport}
            className={`px-5 py-2 text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 ${
              parsedMembers.length > 0
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Confirm & Import {parsedMembers.length > 0 ? `(${parsedMembers.length} Members)` : ''}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
