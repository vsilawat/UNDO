/** Remove common private details before classification, storage, or logging. */
export function scrub(message: string): string {
  return message
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[email]")
    .replace(/(?<!\w)(?:\+?1[\s.()-]*)?(?:\(?\d{3}\)?[\s.()-]*)\d{3}[\s.-]*\d{4}(?!\w)/g, "[phone]")
    .replace(/(?<!\d)(?:\d[ -]?){12,19}(?!\d)/g, "[number]")
    .replace(/\b\d{6,}\b/g, "[number]");
}
