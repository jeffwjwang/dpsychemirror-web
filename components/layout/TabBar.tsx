"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = {
  href: string;
  label: string;
  icon: string;
  key: string;
};

const TABS: Tab[] = [
  { key: "home", href: "/", label: "总览", icon: "⌂" },
  { key: "daily", href: "/daily", label: "琐事", icon: "☀︎" },
  { key: "knowledge", href: "/knowledge", label: "知识", icon: "◈" },
  { key: "inspiration", href: "/inspiration", label: "灵感", icon: "✦" },
  { key: "chat", href: "/chat", label: "社交", icon: "◎" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function TabBar() {
  const pathname = usePathname() || "/";

  return (
    <nav className="pm-tabbar" aria-label="底部导航">
      {TABS.map((t) => {
        const active = isActive(pathname, t.href);
        return (
          <Link
            key={t.key}
            href={t.href}
            className="pm-tab"
            aria-current={active ? "page" : undefined}
            data-active={active ? "true" : "false"}
          >
            <span className="pm-tab-ico" aria-hidden="true">
              {t.icon}
            </span>
            <span className="pm-tab-label">{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

