/** A constrained set of public styling seams owned by a component contract. */
export type SlotClassNames<Slot extends string> = Partial<Record<Slot, string>>;

/** Join optional class values without exposing a class-composition dependency. */
export function classes(...values: Array<string | false | null | undefined>) {
  const value = values.filter(Boolean).join(' ');
  return value || undefined;
}
