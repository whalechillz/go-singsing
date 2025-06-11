import React from 'react';
import '@/styles/gradient-text/rainbow-text.css';

interface RainbowTextProps {
  text: string;
  variant?: 'rainbow' | 'gemini' | 'apple' | 'pastel' | 'neon' | 'animated' | 'hover';
  className?: string;
}

const RainbowText: React.FC<RainbowTextProps> = ({ text, variant = 'gemini', className = '' }) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'rainbow':
        return 'rainbow-text';
      case 'gemini':
        return 'gemini-gradient';
      case 'apple':
        return 'apple-gradient';
      case 'pastel':
        return 'pastel-rainbow';
      case 'neon':
        return 'neon-rainbow';
      case 'animated':
        return 'rainbow-text-animated';
      case 'hover':
        return 'rainbow-text-hover';
      default:
        return 'gemini-gradient';
    }
  };

  return (
    <span className={`${getVariantClass()} ${className}`}>
      {text}
    </span>
  );
};

export default RainbowText;

// 사용 예시:
// <RainbowText text="그리데이션" variant="gemini" />
// <RainbowText text="효로모션" variant="apple" />
// <RainbowText text="애니메이션" variant="animated" />
// <RainbowText text="비주얼 충실" variant="neon" />
