import React, { createContext, useContext, useState, useEffect } from 'react';

type FontSize = 'small' | 'normal' | 'large';

interface FontSizeContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
}

const FontSizeContext = createContext<FontSizeContextType>({
  fontSize: 'normal',
  setFontSize: () => {},
});

export const useFontSize = () => useContext(FontSizeContext);

export const FontSizeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontSize, setFontSize] = useState<FontSize>('normal');

  useEffect(() => {
    // localStorage에서 저장된 설정 불러오기
    const saved = localStorage.getItem('fontSize') as FontSize;
    if (saved) {
      setFontSize(saved);
      applyFontSize(saved);
    }
  }, []);

  const applyFontSize = (size: FontSize) => {
    const root = document.documentElement;
    switch (size) {
      case 'small':
        root.style.fontSize = '14px';
        break;
      case 'normal':
        root.style.fontSize = '16px';
        break;
      case 'large':
        root.style.fontSize = '20px';
        break;
    }
  };

  const handleSetFontSize = (size: FontSize) => {
    setFontSize(size);
    applyFontSize(size);
    localStorage.setItem('fontSize', size);
  };

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize: handleSetFontSize }}>
      {children}
    </FontSizeContext.Provider>
  );
};

// 글자 크기 조절 컴포넌트
export const FontSizeControl: React.FC = () => {
  const { fontSize, setFontSize } = useFontSize();

  return (
    <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm">
      <span className="text-sm text-gray-600">글자 크기:</span>
      <button
        onClick={() => setFontSize('small')}
        className={`px-3 py-1 rounded ${
          fontSize === 'small' ? 'bg-purple-700 text-white' : 'bg-gray-100'
        }`}
      >
        작게
      </button>
      <button
        onClick={() => setFontSize('normal')}
        className={`px-3 py-1 rounded ${
          fontSize === 'normal' ? 'bg-purple-700 text-white' : 'bg-gray-100'
        }`}
      >
        보통
      </button>
      <button
        onClick={() => setFontSize('large')}
        className={`px-3 py-1 rounded ${
          fontSize === 'large' ? 'bg-purple-700 text-white' : 'bg-gray-100'
        }`}
      >
        크게
      </button>
    </div>
  );
};
