import { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

export default function ImageUpload({ value, onChange }) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(
    value instanceof File ? URL.createObjectURL(value) : value || null
  );

  const handleFile = useCallback(
    (file) => {
      if (file && file.type.startsWith('image/')) {
        onChange(file);
        const url = URL.createObjectURL(file);
        setPreview(url);
      }
    },
    [onChange]
  );

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      const file = e.dataTransfer.files?.[0];
      handleFile(file);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      handleFile(file);
    },
    [handleFile]
  );

  const handleRemove = useCallback(() => {
    onChange(null);
    setPreview(null);
  }, [onChange]);

  if (preview) {
    return (
      <div className="relative rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-50 group">
        <img
          src={preview}
          alt="Cover preview"
          className="w-full h-48 md:h-56 object-cover"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center">
          <button
            type="button"
            onClick={handleRemove}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 bg-white rounded-full shadow-lg hover:bg-red-50"
          >
            <X className="w-5 h-5 text-red-600" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`
        relative rounded-2xl border-2 border-dashed p-8
        flex flex-col items-center justify-center
        cursor-pointer transition-all duration-200
        h-48 md:h-56
        ${dragActive
          ? 'border-zinc-900 bg-zinc-50'
          : 'border-zinc-200 bg-zinc-50/50 hover:border-zinc-300 hover:bg-zinc-50'
        }
      `}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors ${
          dragActive ? 'bg-zinc-900 text-white' : 'bg-zinc-200 text-zinc-500'
        }`}
      >
        {dragActive ? (
          <ImageIcon className="w-6 h-6" />
        ) : (
          <Upload className="w-6 h-6" />
        )}
      </div>
      <p className="text-sm font-medium text-zinc-700 mb-1">
        {dragActive ? 'Drop your image here' : 'Drag & drop an image'}
      </p>
      <p className="text-xs text-zinc-500">
        or click to browse • PNG, JPG, WebP up to 5MB
      </p>
    </div>
  );
}
