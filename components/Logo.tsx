
import React from 'react';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({ className = "", iconOnly = false, onClick }) => {
  return (
    <div onClick={onClick} className={`flex items-center gap-3 ${className}`}>
      <div className="relative shrink-0">
        <div className="w-10 h-10 logo-gradient rounded-xl shadow-lg shadow-indigo-500/30 flex items-center justify-center transform rotate-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L3 7V12C3 17.5 7 21 12 22C17 21 21 17.5 21 12V7L12 2Z" fill="white" fillOpacity="0.2"/>
            <path d="M8 15L11 12L13 14L17 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
      </div>
      {!iconOnly && (
        <div className="flex flex-col leading-none">
          <span className="text-xl font-black tracking-tighter text-slate-900 uppercase">ADSPILOT</span>
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em] ml-0.5">PRO</span>
        </div>
      )}
    </div>
  );
};
