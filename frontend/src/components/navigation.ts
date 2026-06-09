import {
  BarChart3,
  FileText,
  Home,
  Map,
  SearchCheck,
  Settings,
  UploadCloud,
} from "lucide-react";

export const navigationItems = [
  { label: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { label: "Upload", href: "/upload", icon: UploadCloud },
  { label: "Results", href: "/results", icon: SearchCheck },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "Map", href: "/map", icon: Map },
  { label: "Settings", href: "/settings", icon: Settings },
];

export const homeNavItem = { label: "Home", href: "/", icon: Home };
