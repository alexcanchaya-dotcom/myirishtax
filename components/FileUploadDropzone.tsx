'use client';
import React, { useCallback } from 'react';

type Props = {
  onFiles: (files: FileList) => void;
};

export function FileUploadDropzone({ onFiles }: Props) {
  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (event.dataTransfer.files.length) onFiles(event.dataTransfer.files);
    },
    [onFiles]
  );

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className="flex h-40 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-sm text-gray-600"
    >
      <p className="font-semibold">Drag & drop CSVs</p>
      <p className="text-xs text-gray-500">Degiro, Revolut, Coinbase, Trading212</p>
      <input type="file" accept=".csv" multiple className="hidden" onChange={(e) => e.target.files && onFiles(e.target.files)} />
    </div>
  );
}
