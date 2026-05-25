import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavItem({
  icon,
  label,
  href,
  badge = 0,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  badge?: number;
}) {
  const pathname = usePathname();
  const active =
    pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={`flex w-full items-center justify-between rounded-xl px-4 py-2.5 transition-all duration-200 ${
        active
          ? "bg-indigo-600 text-white shadow-md"
          : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-xs font-bold tracking-tight">{label}</span>
      </div>
      {badge > 0 && (
        <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[9px] font-black">
          {badge}
        </span>
      )}
    </Link>
  );
}
