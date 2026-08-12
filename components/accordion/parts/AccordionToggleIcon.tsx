export function AccordionToggleIcon({ open }: { open: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
      {open ? null : <path d="M8 3v10" strokeLinecap="round" />}
      <path d="M3 8h10" strokeLinecap="round" />
    </svg>
  );
}
