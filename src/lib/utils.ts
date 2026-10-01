import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date) {
  return Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric"
  }).format(date);
}

export function readingTime(content: string) {
  const textOnly = content
    // strip fenced code blocks
    .replace(/```[\s\S]*?```/g, "")
    // strip inline code
    .replace(/`[^`]*`/g, "")
    // strip MDX/JS import & export statements
    .replace(/^\s*(import|export)\s.*$/gm, "")
    // strip JSX/HTML tags
    .replace(/<[^>]+>/g, "")
    // strip markdown link/image URLs, keep visible text
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    // strip remaining markdown symbols
    .replace(/[#>*_~|-]/g, " ");

  const wordCount = textOnly.split(/\s+/).filter(Boolean).length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
  return `${readingTimeMinutes} min read`;
}

export function dateRange(startDate: Date, endDate?: Date | string): string {
  const startMonth = startDate.toLocaleString("default", { month: "short" });
  const startYear = startDate.getFullYear().toString();
  let endMonth = "";
  let endYear = "";

  if (endDate) {
    if (typeof endDate === "string") {
      endMonth = "";
      endYear = endDate === "Current" ? "Present" : endDate;
    } else {
      endMonth = endDate.toLocaleString("default", { month: "short" });
      endYear = endDate.getFullYear().toString();
    }
  }

  return `${startMonth} ${startYear} - ${endMonth ? `${endMonth} ` : ""}${endYear}`;
}
