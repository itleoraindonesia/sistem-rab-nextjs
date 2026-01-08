import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency to Indonesian Rupiah
export function formatRupiah(angka: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
}

// Get status badge class based on status value
export function getStatusBadge(status: string): string {
  switch (status) {
    case "draft":
      return "badge-warning";
    case "sent":
      return "badge-info";
    case "approved":
      return "badge-success";
    case "dinding":
      return "badge-info";
    case "lantai":
      return "badge-success";
    default:
      return "badge-neutral";
  }
}

// Get status label in Indonesian
export function getStatusLabel(status: string): string {
  switch (status) {
    case "draft":
      return "Draft";
    case "sent":
      return "Terkirim";
    case "approved":
      return "Disetujui";
    case "dinding":
      return "Dinding";
    case "lantai":
      return "Lantai";
    default:
      return status;
  }
}

// Translate status to Indonesian (for new badge styling)
export function translateStatus(status: string): string {
  switch (status) {
    case "draft":
      return "Draft";
    case "sent":
      return "Terkirim";
    case "approved":
      return "Disetujui";
    default:
      return status;
  }
}
