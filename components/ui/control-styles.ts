/**
 * Shared look for text-entry controls (Input, Textarea, NativeSelect,
 * SelectTrigger, PasswordInput, OtpInput). docs/DESIGN_SYSTEM.md#inputs
 */
export const controlBase = [
  "w-full rounded-control border border-line-strong bg-surface text-body text-fg",
  "placeholder:text-fg-muted",
  "transition-colors duration-(--duration-fast) ease-standard",
  "hover:border-fg",
  "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-focus focus-visible:border-focus",
  "aria-invalid:border-danger aria-invalid:focus-visible:outline-danger",
  "disabled:cursor-not-allowed disabled:border-line disabled:bg-surface-muted disabled:text-fg-disabled",
  "read-only:bg-surface-muted",
].join(" ");

export const controlHeight = "h-12 px-3";
