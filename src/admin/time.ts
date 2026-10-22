const relativeFormatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export const formatRelativeTime = (date: Date, now = new Date()) => {
  const seconds = Math.round((date.getTime() - now.getTime()) / 1000);

  if (Math.abs(seconds) < 45) return "just now";

  const minutes = Math.round(seconds / 60);
  if (Math.abs(minutes) < 60) return relativeFormatter.format(minutes, "minute");

  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return relativeFormatter.format(hours, "hour");

  const days = Math.round(hours / 24);
  if (Math.abs(days) < 7) return relativeFormatter.format(days, "day");

  return date.toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" });
};

export const formatDuration = (milliseconds: number) => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes ? `${minutes}m ${String(seconds).padStart(2, "0")}s` : `${seconds}s`;
};
