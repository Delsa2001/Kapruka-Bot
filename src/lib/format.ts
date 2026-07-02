export function formatLkr(amount: number | null | undefined): string {
  if (amount == null) return "Price on request";
  return `Rs. ${amount.toLocaleString("en-LK")}`;
}

export function formatExpiry(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-LK", {
      timeZone: "Asia/Colombo",
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}
