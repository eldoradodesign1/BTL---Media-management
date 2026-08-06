import React, { useState, useEffect, useRef } from 'react';

interface NumberWheelInputProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  className?: string;
  readOnly?: boolean;
}

export const NumberWheelInput: React.FC<NumberWheelInputProps> = ({
  value,
  onChange,
  min = 0,
  max = 1000000,
  prefix = '$',
  className = '',
  readOnly = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState<string>(value.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTempValue(value.toString());
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleWheel = (e: React.WheelEvent) => {
    if (readOnly) return;
    e.preventDefault();

    let delta = e.deltaY < 0 ? 1 : -1;

    if (e.shiftKey) {
      delta *= 10;
    } else if (e.altKey) {
      delta *= 0.1;
    }

    const newRaw = Math.round((value + delta) * 100) / 100;
    const clamped = Math.max(min, Math.min(max, newRaw));
    onChange(clamped);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveValue();
    } else if (e.key === 'Escape') {
      setTempValue(value.toString());
      setIsEditing(false);
    }
  };

  const saveValue = () => {
    const parsed = parseFloat(tempValue);
    if (!isNaN(parsed)) {
      const clamped = Math.max(min, Math.min(max, parsed));
      onChange(clamped);
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="inline-flex items-center gap-1">
        {prefix && <span className="text-xs text-slate-400 font-medium">{prefix}</span>}
        <input
          ref={inputRef}
          type="number"
          step="any"
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={saveValue}
          onKeyDown={handleKeyDown}
          onWheel={handleWheel}
          className="w-24 px-2 py-1 text-sm bg-black/30 backdrop-blur-md border border-cyan-500/50 rounded text-white font-mono outline-none focus:ring-2 focus:ring-cyan-400/50"
        />
      </div>
    );
  }

  return (
    <div
      onDoubleClick={() => !readOnly && setIsEditing(true)}
      onWheel={handleWheel}
      title={readOnly ? undefined : "Double-clic pour éditer | Molette: ±1 | Shift+Molette: ±10 | Alt+Molette: ±0.1"}
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-all font-mono text-sm cursor-pointer hover:bg-white/10 group ${className}`}
    >
      <span className="font-semibold text-emerald-400 group-hover:text-emerald-300">
        {prefix}
        {value.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
      </span>
      {!readOnly && (
        <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity ml-1 select-none">
          ✎
        </span>
      )}
    </div>
  );
};
