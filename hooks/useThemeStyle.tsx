import '../global.css'
import { useTheme } from '@/context/ThemeContext';

export const useThemeStyle = () => {
  const { isDarkMode } = useTheme();

  return {
    isDarkMode,
    textColor: isDarkMode ? 'text-[#E8DEF8]' : 'text-[#3E2723]',
    mutedTextColor: isDarkMode ? 'text-[#CAC4D0]' : 'text-[#625B71]',
    bgColor: isDarkMode ? 'bg-[#1C1B1F]' : 'bg-[#FFF8F1]',
    sectionBg: isDarkMode ? 'bg-[#2B2930]' : 'bg-[#FFFDF9]',
    elevatedBg: isDarkMode ? 'bg-[#352F3F]' : 'bg-[#FFE9D6]',
    accentBg: isDarkMode ? 'bg-[#4A4458]' : 'bg-[#FFDDB8]',
    accent: isDarkMode ? '#FFB59D' : '#8A4D24',
    secondaryAccent: isDarkMode ? '#D0BCFF' : '#7D5260',
    borderColor: isDarkMode ? '#4A4458' : '#E8D5C4',
    gradient: isDarkMode
      ? ['#1C1B1F', '#2B2930', '#3A3444']
      : ['#FFF8F1', '#FFEDD8', '#FFE5CC'],
  };
};
