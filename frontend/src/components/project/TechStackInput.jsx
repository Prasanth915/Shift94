import { useState, useCallback } from 'react';
import { X, Plus } from 'lucide-react';

const SUGGESTIONS = [
  'React', 'Next.js', 'Vue', 'Angular', 'Svelte',
  'Node.js', 'Express', 'Python', 'Django', 'Flask',
  'TypeScript', 'JavaScript', 'Tailwind CSS', 'MongoDB',
  'PostgreSQL', 'Redis', 'Docker', 'AWS', 'Firebase',
  'GraphQL', 'REST API', 'Prisma', 'Supabase',
];

export default function TechStackInput({ value = [], onChange }) {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const addTag = useCallback(
    (tag) => {
      const trimmed = tag.trim();
      if (trimmed && !value.includes(trimmed)) {
        onChange([...value, trimmed]);
      }
      setInput('');
      setShowSuggestions(false);
    },
    [value, onChange]
  );

  const removeTag = useCallback(
    (tag) => {
      onChange(value.filter((t) => t !== tag));
    },
    [value, onChange]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (input.trim()) addTag(input);
      } else if (e.key === 'Backspace' && !input && value.length > 0) {
        removeTag(value[value.length - 1]);
      }
    },
    [input, value, addTag, removeTag]
  );

  const filteredSuggestions = SUGGESTIONS.filter(
    (s) =>
      s.toLowerCase().includes(input.toLowerCase()) && !value.includes(s)
  ).slice(0, 6);

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-zinc-700">
        Tech Stack
      </label>

      {/* Tags + input */}
      <div
        className={`
          flex flex-wrap gap-2 p-3 rounded-xl border border-zinc-200
          bg-white transition-all duration-200
          focus-within:ring-2 focus-within:ring-zinc-900/10 focus-within:border-zinc-900
          min-h-[44px]
        `}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="
              inline-flex items-center gap-1 px-2.5 py-1 rounded-lg
              bg-zinc-100 text-zinc-700 text-xs font-medium
              group hover:bg-zinc-200 transition-colors
            "
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-zinc-400 hover:text-zinc-700 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setShowSuggestions(e.target.value.length > 0);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(input.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={value.length === 0 ? 'Type and press Enter to add...' : 'Add more...'}
          className="flex-1 min-w-[120px] text-sm text-zinc-900 placeholder-zinc-400 outline-none bg-transparent"
        />
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="bg-white border border-zinc-200 rounded-xl shadow-lg p-1 mt-1">
          {filteredSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                addTag(suggestion);
              }}
              className="w-full text-left px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus className="w-3 h-3 text-zinc-400" />
              {suggestion}
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-zinc-500">
        Type a technology and press Enter. {value.length > 0 && `${value.length} selected`}
      </p>
    </div>
  );
}
