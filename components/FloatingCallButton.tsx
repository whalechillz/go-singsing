import React from 'react';
import { Phone } from 'lucide-react';

const FloatingCallButton: React.FC = () => {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <a
        href="tel:010-3332-9020"
        className="flex items-center gap-2 bg-purple-700 text-white px-6 py-4 rounded-full shadow-lg hover:bg-purple-800 transition-all hover:scale-105"
      >
        <Phone className="w-6 h-6" />
        <span className="font-bold text-lg">전화 문의</span>
      </a>
    </div>
  );
};

export default FloatingCallButton;
