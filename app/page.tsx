"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import MappingModal from "./components/MappingModal";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mappingResult, setMappingResult] = useState<any>(null);
  const [sampleData, setSampleData] = useState<any[]>([]);
  const [headerCount, setHeaderCount] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!file) {
      alert("Please select a file");
      return;
    }

    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      let headers: string[] = [];
      let jsonData: any[] = [];

      if (fileExtension === 'csv') {
        // Parse CSV
        const text = await file.text();
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length === 0) {
          alert("File is empty");
          return;
        }

        // Parse header
        headers = lines[0].split(',').map(h => h.trim());
        
        // Parse rows
        jsonData = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim());
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          return row;
        });
      } else if (fileExtension === 'xlsx') {
        // Parse Excel
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Extract headers from Excel
        if (jsonData.length > 0) {
          headers = Object.keys(jsonData[0]);
        } else {
          // If no data rows, try to get headers from the worksheet range
          const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
          headers = [];
          for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
            const cell = worksheet[cellAddress];
            if (cell) {
              headers.push(cell.v);
            }
          }
        }
      } else {
        alert("Unsupported file format. Please upload a CSV or Excel file.");
        return;
      }

      // Store sample data and open modal with loading state
      setSampleData(jsonData);
      setHeaderCount(headers.length);
      setIsModalOpen(true);
      setIsProcessing(true);
      setMappingResult(null);

      // Call Gemini API to process headers
      console.log("Sending headers to Gemini API:", headers);
      const response = await fetch('/api/process-headers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ headers }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process headers');
      }

      const geminiResult = await response.json();
      console.log("Gemini API Response:", geminiResult);

      // Update modal with results
      setMappingResult(geminiResult);
      setIsProcessing(false);
      
    } catch (error: any) {
      console.error("Error processing file:", error);
      setIsProcessing(false);
      setIsModalOpen(false);
      alert(`Error: ${error.message || "Failed to process file"}`);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setMappingResult(null);
    setIsProcessing(false);
  };

  const handleNext = () => {
    // TODO: Implement next step (Map Fields)
    alert("Next step: Map Fields - Coming soon!");
  };

  return (
    <>
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-6 rounded-xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-neutral-900">Smart Contacts Importer</h1>
            <p className="text-sm text-neutral-500">Upload a CSV or Excel file to get started</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="w-full cursor-pointer rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-4 py-3 text-sm text-neutral-600 transition hover:border-neutral-400"
            />
            <button 
              type="submit"
              className="w-full rounded-lg border border-neutral-900 px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-900 hover:text-white"
            >
              Import Contacts
            </button>
          </form>
        </div>
      </div>

      <MappingModal
        isOpen={isModalOpen}
        isLoading={isProcessing}
        headerCount={headerCount}
        mappingResult={mappingResult}
        sampleData={sampleData}
        onClose={handleModalClose}
        onNext={handleNext}
      />
    </>
  );
}
