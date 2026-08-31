import type { LucideIcon } from "lucide-react";
import { Home, Library, Puzzle, Search } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { href: "/", label: "Início", icon: Home },
  { href: "/search", label: "Buscar", icon: Search },
  { href: "/library", label: "Biblioteca", icon: Library },
  { href: "/addons", label: "Extensões", icon: Puzzle },
];