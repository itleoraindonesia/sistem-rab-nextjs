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

export default function Header() {
  const pathname = usePathname();

  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'Dashboard', path: '/' }];

    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;

      // Skip the first segment if it's the main protected route
      if (index === 0 && segment === 'rab') {
        breadcrumbs.push({ name: 'Dokumen RAB', path: currentPath });
      } else if (segment === 'baru') {
        breadcrumbs.push({ name: 'Buat Baru', path: currentPath });
      } else if (segment === 'edit') {
        breadcrumbs.push({ name: 'Edit', path: currentPath });
      } else if (segment === 'master') {
        breadcrumbs.push({ name: 'Master Data', path: currentPath });
      } else if (!isNaN(Number(segment))) {
        // ID parameter - don't add to breadcrumbs
        return;
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.path} className="flex items-center">
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {index === breadcrumbs.length - 1 ? (
                  <BreadcrumbPage>{crumb.name}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={crumb.path}>
                    {crumb.name}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}
