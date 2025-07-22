'use client';

import { useState, useCallback } from 'react';
import Tesseract from 'tesseract.js';

export default function ImageUploader() {
  const [texts, setTexts] = useState([]); // Array of extracted texts
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);

  const handleFiles = async (newFiles) => {
    const currentCount = texts.length;
    const filesToProcess = Array.from(newFiles).slice(0, 3 - currentCount);

    if (currentCount >= 3) {
      setError('Limit of 3 images reached.');
      return;
    }

    if (filesToProcess.length === 0) return;

    setError('');
    setLoading(true);

    const processedTexts = await Promise.all(
      filesToProcess.map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = async () => {
            try {
              const result = await Tesseract.recognize(reader.result, 'eng');
              resolve(result.data.text);
            } catch (err) {
              resolve('[Error processing image]');
            }
          };
          reader.readAsDataURL(file);
        });
      })
    );

    setTexts((prev) => [...prev, ...processedTexts]);
    setLoading(false);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [texts]);

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const onDragLeave = useCallback(() => {
    setDragging(false);
  }, []);

  const onFileChange = (e) => {
    handleFiles(e.target.files);
  };

  const handleShow = () => {
    console.log('🧾 Transcriptions:', texts);
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`border-2 border-dashed rounded-md p-6 text-center transition-all ${
          dragging ? 'bg-blue-50 border-blue-500' : 'border-gray-300'
        }`}
      >
        <p className="mb-2 font-semibold">Drag & Drop screenshots or click below</p>
        <p className="text-sm text-gray-500 mb-2">Limit: 3 images max</p>
        <input
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="block mx-auto"
        />
      </div>

      {error && <p className="text-red-500 mt-4">{error}</p>}
      {loading && <p className="mt-4">🔄 Processing image...</p>}

      {!loading && texts.length > 0 && (
        <div className="mt-4 space-y-2">
          {texts.map((_, idx) => (
            <div key={idx}>
              ✅ <strong>Image {idx + 1}</strong> uploaded
            </div>
          ))}
        </div>
      )}

      <button
        disabled={texts.length === 0}
        onClick={handleShow}
        className={`mt-6 px-4 py-2 rounded bg-blue-600 text-white font-medium transition ${
          texts.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
        }`}
      >
        Show
      </button>
    </div>
  );
}
