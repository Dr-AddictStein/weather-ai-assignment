import { weatherEmoji } from '@/utils/weatherHelpers';

interface Props {
  icon?: string;
  conditionCode?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  sm: 'h-6 w-6',
  md: 'h-10 w-10',
  lg: 'h-14 w-14',
  xl: 'h-20 w-20',
};

const emojiSizes = {
  sm: 'text-xl',
  md: 'text-3xl',
  lg: 'text-5xl',
  xl: 'text-6xl',
};

export function WeatherIcon({ icon, conditionCode, size = 'md', className = '' }: Props) {
  if (icon?.startsWith('http')) {
    return (
      <img
        src={icon}
        alt=""
        className={`${sizes[size]} object-contain ${className}`}
        loading="lazy"
      />
    );
  }
  return (
    <span className={`${emojiSizes[size]} leading-none ${className}`} role="img" aria-hidden>
      {weatherEmoji(conditionCode)}
    </span>
  );
}
