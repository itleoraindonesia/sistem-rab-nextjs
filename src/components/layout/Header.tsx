"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Map segment paths to readable names
const BREADCRUMB_MAP: Record<string, string> = {
  "produk-rab": "Dokumen RAB",
  "dokumen": "Administrasi",
  "crm": "Marketing (CRM)",
  "supply-chain": "Supply Chain",
  "master": "Master Data",
  "meeting": "Meeting",
  "baru": "Buat Baru",
  "edit": "Edit",
  "panel-lantai-dinding": "Panel Lantai & Dinding",
  "pagar-beton": "Pagar Beton",
  "dashboard": "Dashboard",
  "surat-keluar": "Surat Keluar",
  "memo": "Memo",
  "mom": "MoM",
  "review": "Review",
  "approval": "Approval",
  "clients": "Clients",
  "input": "Input",
  "panel": "Data Panel",
  "ongkir": "Data Ongkir",
  "pr": "Purchase Request",
  "po": "Purchase Order",
  "list-material": "List Material"
};

export default function Header() {
  const pathname = usePathname();

  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: { name: string; path: string }[] = [];

    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Ignore dynamic ID segments (alphanumeric with length > 10 usually IDs)
      // or straightforward numbers
      const isId = segment.length > 20 || !isNaN(Number(segment)); 
      
      const name = BREADCRUMB_MAP[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

      if (!isId) {
        breadcrumbs.push({ name, path: currentPath });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 sticky top-0 bg-background z-10 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 shadow-sm">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              
              return (
                <div key={crumb.path} className="flex items-center">
                  {index > 0 && <BreadcrumbSeparator className="mx-2" />}
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{crumb.name}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={crumb.path}>
                        {crumb.name}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </div>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}
