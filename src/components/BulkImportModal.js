import { useRef, useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import Modal from './Modal';

// Helper to escape commas and quotes in CSV fields
function formatCsvCell(val) {
  const str = String(val ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Helper to convert header/row array to CSV string
function toCsv(rowArray) {
  return `${rowArray.map(formatCsvCell).join(',')}\n`;
}

// Helper to trigger a browser download of a dynamically generated file
function downloadFile(filename, content, mime = 'text/csv') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Delay URL revocation to give browser time to start the download
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 200);
}

// Robust CSV parser supporting quotes and embedded commas
function parseCsv(text) {
  let c = '', r = [];
  let q = false;
  let row = [''];
  for (let i = 0; i < text.length; i++) {
    c = text[i];
    let next = text[i + 1];
    if (c === '"') {
      if (q && next === '"') {
        row[row.length - 1] += '"';
        i++;
      } else {
        q = !q;
      }
    } else if (c === ',' && !q) {
      row.push('');
    } else if ((c === '\r' || c === '\n') && !q) {
      if (c === '\r' && next === '\n') {
        i++;
      }
      r.push(row);
      row = [''];
    } else {
      row[row.length - 1] += c;
    }
  }
  if (row.length > 1 || row[0] !== '') {
    r.push(row);
  }

  if (r.length === 0) return { headers: [], rows: [] };
  const headers = r[0].map((h) => h.trim());
  const rows = r.slice(1).map((line) => {
    return headers.reduce((acc, header, index) => {
      acc[header] = (line[index] || '').trim();
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
  customSampleData = null,
}) {
  const fileInputRef = useRef(null);

  // States
  const [step, setStep] = useState(0);
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState({ headers: [], rows: [] });
  const [columnMapping, setColumnMapping] = useState({});
  const [importProgress, setImportProgress] = useState(0);

  // Computed states for validation
  const [mappedRows, setMappedRows] = useState([]);
  const [validRows, setValidRows] = useState([]);
  const [invalidRows, setInvalidRows] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  // Steps declaration
  const steps = [
    { label: 'Download', desc: 'Sample template' },
    { label: 'Upload', desc: 'CSV or Excel' },
    { label: 'Map Columns', desc: 'Match fields' },
    { label: 'Preview', desc: 'Verify data' },
    { label: 'Import', desc: 'Process import' },
    { label: 'Summary', desc: 'View report' },
  ];

  // Reset modal state
  const reset = () => {
    setFile(null);
    setParsedData({ headers: [], rows: [] });
    setColumnMapping({});
    setImportProgress(0);
    setMappedRows([]);
    setValidRows([]);
    setInvalidRows([]);
    setStep(0);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // Triggers when a file is dropped or selected
  const handleFile = (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);

    const isExcel =
      selectedFile.name.toLowerCase().endsWith('.xlsx') ||
      selectedFile.name.toLowerCase().endsWith('.xls');

    const reader = new FileReader();

    if (isExcel) {
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

          if (sheetData.length === 0) {
            alert('The Excel file is empty.');
            reset();
            return;
          }

          // Headers are the first row, filter out empty headers
          const headers = sheetData[0].map((h) => String(h || '').trim()).filter(Boolean);
          const rows = sheetData.slice(1).map((row) => {
            return headers.reduce((acc, header, idx) => {
              acc[header] = String(row[idx] || '').trim();
              return acc;
            }, {});
          });

          setParsedData({ headers, rows });
          setStep(2); // Go to Map Columns
        } catch (error) {
          console.error('Error parsing Excel file:', error);
          alert('Failed to parse Excel file. Please ensure it is a valid format.');
          reset();
        }
      };
      reader.readAsArrayBuffer(selectedFile);
    } else if (selectedFile.name.toLowerCase().endsWith('.csv')) {
      reader.onload = (event) => {
        try {
          const text = String(event.target.result || '');
          const { headers, rows } = parseCsv(text);

          if (headers.length === 0) {
            alert('The CSV file is empty.');
            reset();
            return;
          }

          setParsedData({ headers, rows });
          setStep(2); // Go to Map Columns
        } catch (error) {
          console.error('Error parsing CSV file:', error);
          alert('Failed to parse CSV file. Please check its contents.');
          reset();
        }
      };
      reader.readAsText(selectedFile);
    } else {
      alert('Unsupported file format. Please upload a .csv or .xlsx file.');
      reset();
    }
  };

  // Perform auto-mapping when parsedData changes
  useEffect(() => {
    if (parsedData.headers.length > 0) {
      const autoMap = {};
      sampleHeaders.forEach((target) => {
        const normalizedTarget = target.toLowerCase().replace(/[^a-z0-9]/g, '');

        // Match based on exact match or inclusion
        const match = parsedData.headers.find((header) => {
          const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '');
          return (
            normalizedHeader === normalizedTarget ||
            normalizedHeader.includes(normalizedTarget) ||
            normalizedTarget.includes(normalizedHeader)
          );
        });

        autoMap[target] = match || '';
      });
      setColumnMapping(autoMap);
    }
  }, [parsedData, sampleHeaders]);

  // Run validation and mapping when columnMapping or parsedData changes
  useEffect(() => {
    if (parsedData.rows.length > 0) {
      const mapped = parsedData.rows.map((row) => {
        const mappedRow = {};
        sampleHeaders.forEach((target) => {
          const fileHeader = columnMapping[target];
          mappedRow[target] = fileHeader ? row[fileHeader] : '';
        });
        return mappedRow;
      });

      const validated = mapped.map((row, idx) => {
        const missingFields = requiredFields.filter((field) => !row[field]);
        return {
          row,
          index: idx + 1,
          isValid: missingFields.length === 0,
          missingFields,
        };
      });

      const valids = validated.filter((r) => r.isValid).map((r) => r.row);
      const invalids = validated.filter((r) => !r.isValid);

      setMappedRows(mapped);
      setValidRows(valids);
      setInvalidRows(invalids);
    }
  }, [columnMapping, parsedData, sampleHeaders, requiredFields]);

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const dropped = e.dataTransfer.files?.[0];
    handleFile(dropped);
  };

  const handleDownloadSample = (type = 'csv') => {
    if (customSampleData && entityLabel === 'company') {
      const link = document.createElement('a');
      link.href = type === 'xlsx'
        ? '/Sample File - Companies - Sheet1 (1).xlsx'
        : '/Sample File - Companies - Sheet1 (1).csv';
      link.download = type === 'xlsx'
        ? 'Sample File - Companies - Sheet1 (1).xlsx'
        : 'Sample File - Companies - Sheet1 (1).csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    const dataToExport = [sampleHeaders.reduce((acc, curr) => { acc[curr] = `Example ${curr}`; return acc; }, {})];
    const headers = Object.keys(dataToExport[0]);

    if (type === 'xlsx') {
      try {
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sample');
        
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${entityLabelPlural}-sample.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 200);
      } catch (error) {
        console.error('Error generating Excel sample:', error);
        alert('Failed to generate Excel template. Downloading CSV instead.');
        handleDownloadSample('csv');
      }
    } else {
      const csvContent =
        toCsv(headers) +
        dataToExport
          .map((row) => toCsv(headers.map((h) => row[h] || '')))
          .join('');
      downloadFile(`${entityLabelPlural}-sample.csv`, csvContent);
    }
  };

  const startImport = () => {
    setStep(4); // Import Progress step
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setImportProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setStep(5); // Final Summary step
      }
    }, 150);
  };

  const handleFinishImport = () => {
    // Trigger onImport with mapped valid rows, which closes modal on the parent page
    onImport(validRows);
    handleClose();
  };

  const downloadErrorReport = () => {
    if (invalidRows.length === 0) return;
    const errorHeaders = ['Row Number', ...sampleHeaders, 'Reason/Missing Fields'];
    const csvContent =
      toCsv(errorHeaders) +
      invalidRows
        .map((inv) => {
          const cells = [
            inv.index,
            ...sampleHeaders.map((h) => inv.row[h] || ''),
            `Missing required: ${inv.missingFields.join('; ')}`,
          ];
          return toCsv(cells);
        })
        .join('');
    downloadFile(`${entityLabelPlural}-import-errors.csv`, csvContent);
  };

  // Render navigation buttons for each step
  const renderNavButtons = () => {
    if (step === 4) return null; // No nav buttons during active importing

    if (step === 5) {
      return (
        <div className="flex justify-end gap-3 mt-6">
          {invalidRows.length > 0 && (
            <button
              type="button"
              className="rounded-xl border border-rose-300 bg-rose-50 px-5 py-3 text-base font-semibold text-rose-700 hover:bg-rose-100 transition"
              onClick={downloadErrorReport}
            >
              Download Error Report
            </button>
          )}
          <button
            type="button"
            className="rounded-xl bg-emerald-700 px-6 py-3 text-base font-semibold text-white hover:bg-emerald-800 transition shadow-lg shadow-emerald-700/20"
            onClick={handleFinishImport}
          >
            Finish & Import {validRows.length} {validRows.length === 1 ? entityLabel : entityLabelPlural}
          </button>
        </div>
      );
    }

    const isNextDisabled =
      (step === 1 && !file) ||
      (step === 2 && requiredFields.some((field) => !columnMapping[field])) ||
      (step === 3 && validRows.length === 0);

    return (
      <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-100">
        <div>
          {step > 0 && (
            <button
              type="button"
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50 transition"
              onClick={() => setStep(step - 1)}
            >
              Back
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50 transition"
            onClick={handleClose}
          >
            Cancel
          </button>
          {step === 0 && (
            <button
              type="button"
              className="rounded-xl bg-emerald-700 px-6 py-3 text-base font-semibold text-white hover:bg-emerald-800 transition"
              onClick={() => setStep(1)}
            >
              Continue to Upload
            </button>
          )}
          {step === 1 && (
            <button
              type="button"
              disabled={isNextDisabled}
              className="rounded-xl bg-emerald-700 px-6 py-3 text-base font-semibold text-white hover:bg-emerald-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setStep(2)}
            >
              Next: Map Columns
            </button>
          )}
          {step === 2 && (
            <button
              type="button"
              disabled={isNextDisabled}
              className="rounded-xl bg-emerald-700 px-6 py-3 text-base font-semibold text-white hover:bg-emerald-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setStep(3)}
            >
              Next: Preview
            </button>
          )}
          {step === 3 && (
            <button
              type="button"
              disabled={isNextDisabled}
              className="rounded-xl bg-emerald-700 px-6 py-3 text-base font-semibold text-white hover:bg-emerald-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-700/20"
              onClick={startImport}
            >
              Start Import ({validRows.length} rows)
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <Modal
      open={open}
      title={`Bulk Import ${entityLabelPlural}`}
      onClose={handleClose}
      maxWidth="max-w-4xl"
      actions={renderNavButtons()}
    >
      <div className="space-y-6">
        {/* Step Progress Indicator */}
        <div className="hidden md:block">
          <div className="flex justify-between items-center">
            {steps.map((s, idx) => {
              const isActive = step === idx;
              const isCompleted = step > idx;
              return (
                <div key={idx} className="flex-1 relative flex flex-col items-center">
                  {/* Step Connector Line */}
                  {idx > 0 && (
                    <div
                      className={`absolute top-4 left-[-50%] right-[50%] h-[2px] transition-all duration-300 ${
                        isCompleted ? 'bg-emerald-600' : 'bg-slate-200'
                      }`}
                    />
                  )}
                  {/* Circle Indicator */}
                  <div
                    className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                      isActive
                        ? 'bg-emerald-700 text-white ring-4 ring-emerald-100 scale-110 shadow-md shadow-emerald-700/20'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {isCompleted ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-4 w-4">
                        <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      idx
                    )}
                  </div>
                  <span
                    className={`mt-2 text-xs font-semibold tracking-wide transition-all ${
                      isActive ? 'text-emerald-800 font-bold' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                    }`}
                  >
                    {s.label}
                  </span>
                  <span className="text-[10px] text-slate-400 hidden lg:block">{s.desc}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Small Screen Progress Title */}
        <div className="md:hidden flex justify-between items-center px-1 bg-slate-50 py-2 rounded-lg">
          <span className="text-xs font-semibold text-slate-500">Step {step} of 5</span>
          <span className="text-sm font-bold text-slate-800">{steps[step].label}</span>
        </div>

        <div className="border-t border-slate-100 my-4" />

        {/* STEP 0: Download Template */}
        {step === 0 && (
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center text-center space-y-3 max-w-lg mx-auto">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800">Download Template File</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Before uploading your spreadsheet, download our pre-formatted sample template. It includes all the columns that match the {entityLabelPlural} database.
              </p>
              <div className="mt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => handleDownloadSample('csv')}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-5 py-3 text-sm font-semibold hover:bg-slate-800 transition shadow-lg shadow-slate-900/10 active:scale-95"
                >
                  Download CSV Template
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadSample('xlsx')}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 text-white px-5 py-3 text-sm font-semibold hover:bg-emerald-800 transition shadow-lg shadow-emerald-700/10 active:scale-95"
                >
                  Download Excel (.xlsx) Template
                </button>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 max-w-xl mx-auto border border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Expected Columns</h4>
              <div className="flex flex-wrap gap-2">
                {sampleHeaders.map((header) => {
                  const isReq = requiredFields.includes(header);
                  return (
                    <span
                      key={header}
                      className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium border ${
                        isReq
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      {header}
                      {isReq && <span className="ml-1 text-amber-600 font-bold">*</span>}
                    </span>
                  );
                })}
              </div>
              <p className="mt-4 text-xs text-slate-400">
                <span className="text-amber-600 font-bold">*</span> Indicates a required column mapping to complete imports.
              </p>
            </div>
          </div>
        )}

        {/* STEP 1: Upload File */}
        {step === 1 && (
          <div className="space-y-6 py-4">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`group relative cursor-pointer rounded-2xl border-2 border-dashed px-6 py-12 text-center transition duration-200 ${
                dragActive
                  ? 'border-emerald-500 bg-emerald-50/50'
                  : 'border-slate-300 bg-slate-50 hover:bg-slate-100/50 hover:border-slate-400'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200/50 text-slate-600 group-hover:scale-110 transition duration-300">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                {!file ? (
                  <>
                    <p className="text-sm font-semibold text-slate-700">Drag & drop your file here, or click to browse</p>
                    <p className="text-xs text-slate-400">Supports .csv, .xlsx, and .xls spreadsheets</p>
                  </>
                ) : (
                  <div className="flex items-center justify-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-emerald-600">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <span className="text-sm font-semibold text-slate-800">{file.name}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        reset();
                        setStep(1); // remain on upload step
                      }}
                      className="rounded-full bg-slate-100 hover:bg-slate-200 p-1 text-slate-500 transition"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Map Columns */}
        {step === 2 && (
          <div className="space-y-4 py-2">
            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Map File Columns to CRM Fields</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Confirm matching fields. Missing columns can be skipped or matched manually.
                </p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                  {parsedData.rows.length} rows loaded
                </span>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto border border-slate-200 rounded-2xl">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="px-5 py-3.5 text-left">CRM Field</th>
                    <th scope="col" className="px-5 py-3.5 text-left">Excel/CSV Column</th>
                    <th scope="col" className="px-5 py-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-sm">
                  {sampleHeaders.map((target) => {
                    const isReq = requiredFields.includes(target);
                    const currentMapping = columnMapping[target];
                    const isMapped = !!currentMapping;

                    return (
                      <tr key={target} className={`hover:bg-slate-50/50 transition ${isReq && !isMapped ? 'bg-rose-50/20' : ''}`}>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-slate-700">{target}</span>
                            {isReq && <span className="text-rose-500 font-bold">*</span>}
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <select
                            value={currentMapping}
                            onChange={(e) =>
                              setColumnMapping((prev) => ({ ...prev, [target]: e.target.value }))
                            }
                            className={`block w-full max-w-xs rounded-xl border-slate-300 text-sm focus:border-emerald-500 focus:ring-emerald-500 ${
                              isReq && !isMapped ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500' : ''
                            }`}
                          >
                            <option value="">Don&apos;t Map (Skip)</option>
                            {parsedData.headers.map((h) => (
                              <option key={h} value={h}>
                                {h}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-center">
                          {isMapped ? (
                            <span className="inline-flex items-center rounded-full bg-emerald-100 p-1 text-emerald-800">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-4.5 w-4.5">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </span>
                          ) : isReq ? (
                            <span className="inline-flex items-center rounded-full bg-rose-100 p-1 text-rose-800" title="Required mapping missing">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-4.5 w-4.5">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                              </svg>
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-slate-100 p-1 text-slate-400" title="Optional field (will skip)">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4.5 w-4.5">
                                <polyline points="4 17 10 11 4 5" />
                                <line x1="12" y1="19" x2="20" y2="19" />
                              </svg>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {requiredFields.some((field) => !columnMapping[field]) && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 flex items-center gap-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 shrink-0 text-rose-600">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>Please map all required fields marked with an asterisk (<span className="text-rose-600 font-bold">*</span>) to proceed.</span>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Preview Data */}
        {step === 3 && (
          <div className="space-y-4 py-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm">
              <div className="flex gap-4">
                <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {validRows.length} ready to import
                </span>
                {invalidRows.length > 0 && (
                  <span className="flex items-center gap-1.5 font-semibold text-rose-700">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    {invalidRows.length} skipped with errors
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">Showing first 10 records</p>
            </div>

            <div className="max-h-80 overflow-auto border border-slate-200 rounded-2xl">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th scope="col" className="px-4 py-3">Status</th>
                    {sampleHeaders.map((header) => (
                      <th key={header} scope="col" className="px-4 py-3">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {mappedRows.slice(0, 10).map((row, index) => {
                    const validation = invalidRows.find((inv) => inv.index === index + 1);
                    const isInvalid = !!validation;

                    return (
                      <tr key={index} className={`hover:bg-slate-50/50 transition ${isInvalid ? 'bg-rose-50/10' : ''}`}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {isInvalid ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 border border-rose-100">
                              Error
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-100">
                              Valid
                            </span>
                          )}
                        </td>
                        {sampleHeaders.map((header) => {
                          const isReq = requiredFields.includes(header);
                          const value = row[header];
                          const isEmpty = !value;

                          return (
                            <td
                              key={header}
                              className={`px-4 py-3 text-slate-700 ${
                                isReq && isEmpty ? 'bg-rose-50/50 text-rose-500' : ''
                              }`}
                            >
                              {isEmpty ? (
                                isReq ? (
                                  <span className="font-semibold italic text-rose-400">Missing *</span>
                                ) : (
                                  <span className="text-slate-300">-</span>
                                )
                              ) : (
                                value
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {invalidRows.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 flex items-center gap-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 shrink-0 text-amber-600">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="12" x2="12" y2="16" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span>
                  {invalidRows.length} rows have missing values for required fields. These rows will be skipped during import. You can download an error report on the final screen.
                </span>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Import Progress */}
        {step === 4 && (
          <div className="space-y-6 py-12 flex flex-col items-center text-center max-w-lg mx-auto">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-10 w-10 animate-spin">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1" className="opacity-25" />
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-800">Importing {validRows.length} records...</h3>
              <p className="text-sm text-slate-500">Creating records in the database. Please do not close the window.</p>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full transition-all duration-150 rounded-full"
                style={{ width: `${importProgress}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-slate-700">{importProgress}%</span>
          </div>
        )}

        {/* STEP 5: Summary & Error Report */}
        {step === 5 && (
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center text-center space-y-3 max-w-md mx-auto">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-8 w-8">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800">Import Complete</h3>
              <p className="text-sm text-slate-500">
                Successfully processed all rows from the uploaded file.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-center">
                <span className="block text-2xl font-bold text-slate-800">{validRows.length}</span>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mt-1">Imported</span>
              </div>
              <div className={`rounded-2xl p-5 text-center border ${
                invalidRows.length > 0 ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100'
              }`}>
                <span className={`block text-2xl font-bold ${invalidRows.length > 0 ? 'text-rose-700' : 'text-slate-800'}`}>
                  {invalidRows.length}
                </span>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mt-1">Skipped (Errors)</span>
              </div>
            </div>

            {invalidRows.length > 0 && (
              <div className="max-w-xl mx-auto rounded-2xl border border-rose-200 bg-rose-50/50 p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-rose-600 shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-rose-900">Skipped Rows Summary</h4>
                    <p className="text-xs text-rose-700">
                      Some rows could not be imported because they were missing values for required fields.
                    </p>
                  </div>
                </div>

                <div className="max-h-40 overflow-auto rounded-xl border border-rose-100 bg-white">
                  <table className="min-w-full text-left text-xs divide-y divide-rose-100">
                    <thead className="bg-rose-50 text-rose-800 uppercase font-semibold">
                      <tr>
                        <th className="px-3 py-2">Row</th>
                        <th className="px-3 py-2">Missing Required Fields</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-50 text-slate-700">
                      {invalidRows.map((inv) => (
                        <tr key={inv.index}>
                          <td className="px-3 py-2 font-semibold text-rose-800">#{inv.index}</td>
                          <td className="px-3 py-2 text-rose-600">{inv.missingFields.join(', ')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
