import { useRef, useState } from 'react';
import Modal from './Modal';

function toCsv(headers) {
  return `${headers.join(',')}\n`;
}

function downloadFile(filename, content, mime = 'text/csv') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = lines[0].split(',').map((header) => header.trim());
  const rows = lines.slice(1).map((line) => {
    const cells = line.split(',');
    return headers.reduce((acc, header, index) => {
      acc[header] = (cells[index] || '').trim();
      return acc;
    }, {});
  });
  return { headers, rows };
}

export default function BulkImportModal({
  open,
  onClose,
  onImport,
  entityLabel = 'record',
  entityLabelPlural = 'records',
  sampleHeaders = [],
  requiredFields = [],
}) {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [parsed, setParsed] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const reset = () => {
    setFile(null);
    setParsed(null);
    setDragActive(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);

    if (selectedFile.name.toLowerCase().endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const { headers, rows } = parseCsv(String(event.target.result || ''));
        const validRows = rows.filter((row) => requiredFields.every((field) => row[field]));
        setParsed({ headers, rows, validCount: validRows.length, invalidCount: rows.length - validRows.length });
      };
      reader.readAsText(selectedFile);
    } else {
      // Excel files: flag as unsupported preview but still allow "import" hook to receive the raw file.
      setParsed({ headers: [], rows: [], validCount: 0, invalidCount: 0, unsupportedPreview: true });
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    const dropped = event.dataTransfer.files?.[0];
    handleFile(dropped);
  };

  const handleDownloadSample = () => {
    downloadFile(`${entityLabelPlural}-sample.csv`, toCsv(sampleHeaders));
  };

  const handleImport = () => {
    if (!parsed || parsed.validCount === 0) return;
    const validRows = parsed.rows.filter((row) => requiredFields.every((field) => row[field]));
    onImport(validRows);
    handleClose();
  };

  return (
    <Modal
      open={open}
      title={`Bulk Import ${entityLabelPlural}`}
      onClose={handleClose}
      actions={
        <>
          <button
            type="button"
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-base font-semibold text-slate-700"
            onClick={handleClose}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!parsed || parsed.validCount === 0}
            className="rounded-xl bg-emerald-700 px-5 py-3 text-base font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            onClick={handleImport}
          >
            Import {parsed?.validCount ? `${parsed.validCount} ` : ''}
            {entityLabelPlural}
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <p className="text-sm text-slate-500">
          Import {entityLabelPlural} via CSV or Excel file. Download the sample file below to see the expected
          column format.
        </p>

        <button
          type="button"
          onClick={handleDownloadSample}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Download Sample File
        </button>

        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
            dragActive ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 bg-slate-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
          {!file ? (
            <>
              <p className="text-sm font-semibold text-slate-700">Drag file here or click to browse</p>
              <p className="mt-1 text-xs text-slate-400">Supports .csv and .xlsx files</p>
            </>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <span className="text-sm font-medium text-slate-700">{file.name}</span>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  reset();
                }}
                className="rounded-full bg-slate-200 px-2 text-xs font-semibold text-slate-600 hover:bg-slate-300"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {parsed && parsed.unsupportedPreview && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
            Preview isn&apos;t available for Excel files yet, but the file will still be sent for import.
          </p>
        )}

        {parsed && !parsed.unsupportedPreview && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <span className="rounded-full bg-emerald-100 px-3 py-1 font-semibold text-emerald-700">
                {parsed.validCount} valid rows
              </span>
              {parsed.invalidCount > 0 && (
                <span className="rounded-full bg-rose-100 px-3 py-1 font-semibold text-rose-700">
                  {parsed.invalidCount} rows with errors
                </span>
              )}
            </div>

            {parsed.rows.length > 0 && (
              <div className="max-h-56 overflow-auto rounded-xl border border-slate-200">
                <table className="min-w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      {parsed.headers.map((header) => (
                        <th key={header} className="px-3 py-2 font-semibold uppercase tracking-wide">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.rows.slice(0, 8).map((row, index) => (
                      <tr key={index} className="border-t border-slate-100">
                        {parsed.headers.map((header) => (
                          <td key={header} className="px-3 py-2 text-slate-700">
                            {row[header] || <span className="text-rose-400">missing</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
