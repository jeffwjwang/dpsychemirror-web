"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { TabBar } from "@/components/layout/TabBar";

export function MobileShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideTabs = pathname?.startsWith("/entry/");

  return (
    <div className="pm-app">
      <div className="pm-screen">{children}</div>
      {!hideTabs && <TabBar />}
    </div>
  );
}

