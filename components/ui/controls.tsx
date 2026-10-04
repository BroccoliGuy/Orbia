"use client";

export function Switch({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 py-1.5 text-left text-[13px] text-foreground"
    >
      <span>{label}</span>
      <span
        className={`relative h-[20px] w-[36px] shrink-0 rounded-full transition-colors ${checked ? "bg-accent" : "bg-white/15"}`}
      >
        <span
          className={`absolute top-[2px] h-4 w-4 rounded-full bg-white transition-all ${checked ? "left-[18px]" : "left-[2px]"}`}
        />
      </span>
    </button>
  );
}

export function RadioRow({
  checked,
  label,
  onSelect,
}: {
  checked: boolean;
  label: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onSelect}
      className="flex w-full items-center gap-2.5 py-1.5 text-left text-[13px]"
    >
      <span
        className={`grid h-4 w-4 place-items-center rounded-full border ${checked ? "border-accent" : "border-white/30"}`}
      >
        {checked ? <span className="h-2 w-2 rounded-full bg-accent" /> : null}
      </span>
      {label}
    </button>
  );
}
