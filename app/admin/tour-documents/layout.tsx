import { ReactNode } from 'react';
import ModernAdminLayout from '@/components/ModernAdminLayout';

interface LayoutProps {
  children: ReactNode;
}

export default function TourDocumentsLayout({ children }: LayoutProps) {
  return (
    <ModernAdminLayout>
      {children}
    </ModernAdminLayout>
  );
}
