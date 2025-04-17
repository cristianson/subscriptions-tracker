import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, isToday, isTomorrow, format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2
  }).format(amount);
}

export function formatNextPaymentDate(date: Date | string): string {
  const paymentDate = typeof date === "string" ? new Date(date) : date;
  
  if (isToday(paymentDate)) return "Today";
  if (isTomorrow(paymentDate)) return "Tomorrow";
  
  return formatDistanceToNow(paymentDate, { addSuffix: true });
}

export function formatDateFull(date: Date | string): string {
  const paymentDate = typeof date === "string" ? new Date(date) : date;
  return format(paymentDate, "MMM dd, yyyy");
}

export function getRelativeTimeClass(date: Date | string): string {
  const paymentDate = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  const diffTime = paymentDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 0) return "text-danger font-medium";
  if (diffDays <= 3) return "text-warning font-medium";
  return "text-gray-500";
}

export function getDueDateLabel(date: Date | string): string {
  const paymentDate = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  const diffTime = paymentDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 0) return "Due today";
  if (diffDays === 1) return "Due tomorrow";
  if (diffDays <= 7) return `Due in ${diffDays} days`;
  return `Due in ${Math.floor(diffDays / 7)} weeks`;
}

export function getCategoryColor(category: string): string {
  const categoryColors: { [key: string]: string } = {
    "Entertainment": "#3B82F6", // blue
    "Productivity": "#10B981", // green
    "Utilities": "#F59E0B", // yellow/amber
    "Other": "#6B7280", // gray
  };
  
  return categoryColors[category] || "#6B7280";
}
