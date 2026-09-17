interface GaugeCaptionProps {
  classNames?: {
    label?: string;
    value?: string;
  };
  displayValue: string;
  label: string;
  max: number;
  min: number;
  unit?: string;
}

export function GaugeCaption({ classNames, displayValue, label, max, min, unit }: GaugeCaptionProps) {
  return (
    <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center text-center">
      <span className={['text-3xl font-bold leading-none text-text-primary', classNames?.value].filter(Boolean).join(' ')}>
        {displayValue}
        {unit ? <span className="ml-3xs text-base font-semibold">{unit}</span> : null}
      </span>
      <span className={['mt-3xs text-sm font-semibold text-text-primary', classNames?.label].filter(Boolean).join(' ')}>
        {label}
      </span>
      <span className="sr-only">Scale: {min} to {max}{unit ? ` ${unit}` : ''}.</span>
    </figcaption>
  );
}
