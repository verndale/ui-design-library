/** Visual endpoints for the discrete option scale. */
export function SliderScale({ firstLabel, lastLabel }: { firstLabel?: string; lastLabel?: string }) {
  return (
    <div aria-hidden className="flex justify-between text-sm text-text-secondary">
      <span>{firstLabel}</span>
      {lastLabel ? <span>{lastLabel}</span> : null}
    </div>
  );
}
