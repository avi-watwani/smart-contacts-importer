"use client";

import { useEffect, useState } from "react";

interface MappingResult {
  mappedTo: string;
  confidence: number;
}

interface GeminiResponse {
  mapping: Record<string, MappingResult>;
  unmappedHeaders: string[];
  notes: string;
}

interface MappingModalProps {
  isOpen: boolean;
  isLoading: boolean;
  headerCount: number;
  mappingResult: GeminiResponse | null;
  sampleData: Record<string, any>[];
  onClose: () => void;
  onNext: () => void;
}

export default function MappingModal({
  isOpen,
  isLoading,
  headerCount,
  mappingResult,
  sampleData,
  onClose,
  onNext,
}: MappingModalProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isLoading) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 15;
        });
      }, 300);
      return () => clearInterval(interval);
    } else if (mappingResult) {
      setProgress(100);
    }
  }, [isLoading, mappingResult]);

  if (!isOpen) return null;

  const getFieldLabel = (mappedTo: string): string => {
    const fieldLabels: Record<string, string> = {
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email",
      phone: "Phone",
      agentUid: "Agent UID",
      unmapped: "Unmapped",
    };
    return fieldLabels[mappedTo] || mappedTo;
  };

  const getSampleValues = (headerName: string): string[] => {
    return sampleData
      .slice(0, 3)
      .map((row) => row[headerName])
      .filter((val) => val !== undefined && val !== null && val !== "");
  };

  const stats = mappingResult
    ? {
        total: Object.keys(mappingResult.mapping).length,
        highConfidence: Object.values(mappingResult.mapping).filter(
          (m) => m.confidence >= 0.8
        ).length,
        customFields: Object.values(mappingResult.mapping).filter(
          (m) =>
            !["firstName", "lastName", "email", "phone", "agentUid", "unmapped"].includes(
              m.mappedTo
            )
        ).length,
      }
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-5xl rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-neutral-900">
                Move Entry to Contact Section
              </h2>
              <p className="text-sm text-neutral-500">Step 1 of 4</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-neutral-100"
          >
            <svg
              className="h-5 w-5 text-neutral-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-4 border-b border-neutral-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${isLoading ? 'bg-teal-600' : 'bg-green-600'} text-white`}>
              {isLoading ? "1" : (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div>
              <div className="text-sm font-semibold text-neutral-900">Detect Fields</div>
              <div className="text-xs text-neutral-500">Review data structure</div>
            </div>
          </div>

          <div className="flex items-center gap-3 opacity-50">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-200 text-neutral-600">
              2
            </div>
            <div>
              <div className="text-sm font-semibold text-neutral-900">Map Fields</div>
              <div className="text-xs text-neutral-500">Connect to CRM Fields</div>
            </div>
          </div>

          <div className="flex items-center gap-3 opacity-50">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-200 text-neutral-600">
              3
            </div>
            <div>
              <div className="text-sm font-semibold text-neutral-900">Final Checks</div>
              <div className="text-xs text-neutral-500">For Duplicates or Errors</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto p-6">
          {isLoading ? (
            // Loading State
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-neutral-900">
                  AI Column Detection...
                </h3>
                <p className="text-sm text-neutral-500">
                  Analyzing {headerCount} columns and matching with CRM fields using AI...
                </p>
              </div>

              <div className="flex flex-col items-center justify-center space-y-6 py-12">
                <div className="relative flex h-32 w-32 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg">
                  <div className="absolute inset-0 animate-pulse rounded-3xl bg-gradient-to-br from-blue-400/20 to-indigo-400/20"></div>
                  <svg
                    className="relative h-16 w-16 animate-pulse text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
                    <path opacity="0.5" d="M17 3L18 6L21 7L18 8L17 11L16 8L13 7L16 6L17 3Z" />
                  </svg>
                </div>

                <div className="text-center">
                  <h4 className="text-lg font-semibold text-blue-600">
                    Auto Detecting Field Mapping...
                  </h4>
                  <p className="mt-2 text-sm text-neutral-500">
                    Matching spreadsheet columns to CRM fields using intelligent pattern
                    recognition...
                  </p>
                </div>

                <div className="w-full max-w-md">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ) : mappingResult ? (
            // Results State
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-neutral-900">
                  Column Detection Results
                </h3>
                <p className="text-sm text-neutral-500">
                  Our intelligent mapping has mapped {stats?.total} fields in this entry with
                  the CRM Contact Fields
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl border-2 border-green-200 bg-green-50 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="font-semibold text-green-900">
                      {stats?.total} Fields Detected
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border-2 border-purple-200 bg-purple-50 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold text-purple-900">
                      {stats?.highConfidence} High Confidence
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border-2 border-pink-200 bg-pink-50 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    <span className="font-semibold text-pink-900">
                      {stats?.customFields} Custom Fields
                    </span>
                  </div>
                </div>
              </div>

              {/* Mapping List */}
              <div className="space-y-3">
                {Object.entries(mappingResult.mapping)
                  .filter(([_, mapping]) => mapping.mappedTo !== "unmapped")
                  .map(([headerName, mapping]) => {
                    const samples = getSampleValues(headerName);
                    const confidencePercent = Math.round(mapping.confidence * 100);
                    const confidenceColor =
                      confidencePercent >= 90
                        ? "bg-green-100 text-green-800 border-green-300"
                        : confidencePercent >= 80
                        ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                        : "bg-orange-100 text-orange-800 border-orange-300";

                    return (
                      <div
                        key={headerName}
                        className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`rounded-lg border px-3 py-1 text-sm font-semibold ${confidenceColor}`}>
                            {confidencePercent}%
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-sm font-medium text-neutral-700">
                                {headerName}
                              </span>
                              <svg
                                className="h-5 w-5 text-blue-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                                />
                              </svg>
                              <span className="font-semibold text-blue-600">
                                {getFieldLabel(mapping.mappedTo)}
                              </span>
                            </div>
                            {samples.length > 0 && (
                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                <span className="text-xs text-neutral-500">Sample</span>
                                {samples.map((sample, idx) => (
                                  <span
                                    key={idx}
                                    className="rounded bg-neutral-100 px-2 py-1 text-xs text-neutral-600"
                                  >
                                    {sample}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Notes */}
              {mappingResult.notes && (
                <div className="rounded-lg bg-blue-50 p-4">
                  <div className="flex gap-3">
                    <svg className="h-5 w-5 flex-shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-semibold text-blue-900">AI Notes</h4>
                      <p className="mt-1 text-sm text-blue-700">{mappingResult.notes}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-neutral-200 p-6">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
          >
            Cancel
          </button>
          <div className="flex gap-3">
            <button
              disabled
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-neutral-400"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            <button
              onClick={onNext}
              disabled={isLoading || !mappingResult}
              className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:bg-neutral-300 disabled:cursor-not-allowed"
            >
              Next
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

