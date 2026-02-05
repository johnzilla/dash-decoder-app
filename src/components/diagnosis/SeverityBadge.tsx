import { SEVERITY_CONFIG, Severity } from '@/types';

interface SeverityBadgeProps {
  severity: Severity;
  size?: 'sm' | 'md' | 'lg';
}

export function SeverityBadge({ severity, size = 'lg' }: SeverityBadgeProps) {
  const config = SEVERITY_CONFIG[severity];

  const sizeClasses = {
    sm: 'w-12 h-12 text-xs',
    md: 'w-16 h-16 text-sm',
    lg: 'w-24 h-24 text-base',
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Traffic light style circle */}
      <div
        className={`
          ${sizeClasses[size]}
          ${config.bgClass}
          rounded-full flex items-center justify-center
          shadow-lg
        `}
      >
        <span className="text-white font-bold text-center leading-tight px-1">
          {config.label}
        </span>
      </div>

      {/* Description */}
      <p className={`${config.textClass} font-medium text-center`}>
        {config.description}
      </p>
    </div>
  );
}
