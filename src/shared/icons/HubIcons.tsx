import React from 'react';
import * as Lucide from 'lucide-react-native';

const iconMap: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  Upload: Lucide.Upload,
  Eye: Lucide.Eye,
  ClipboardCheck: Lucide.ClipboardCheck,
  CheckSquare: Lucide.CheckSquare,
  FileCheck: Lucide.FileCheck,
  AlertTriangle: Lucide.AlertTriangle,
  Users: Lucide.Users,
  Store: Lucide.Store,
  FileSpreadsheet: Lucide.FileSpreadsheet,
  BarChart3: Lucide.BarChart3,
  FileText: Lucide.FileText,
  Home: Lucide.Home,
  LogOut: Lucide.LogOut,
};

export function getHubIcon(name: string) {
  return iconMap[name] ?? Lucide.Circle;
}
