import { ReactNode } from 'react';
import ModernAdminLayout from '@/components/admin/ModernAdminLayout';

interface LayoutProps {
  children: ReactNode;
}

export default function DocumentLinksLayout({ children }: LayoutProps) {
  return (
    <ModernAdminLayout>
      {children}
    </ModernAdminLayout>
  );
}
