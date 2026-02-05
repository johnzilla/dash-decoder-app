interface CaptureButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function CaptureButton({ onClick, disabled }: CaptureButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="relative w-16 h-16 rounded-full bg-white border-4 border-primary
                 shadow-lg hover:scale-105 active:scale-95 transition-transform
                 disabled:opacity-50 disabled:cursor-not-allowed
                 focus:outline-none focus:ring-4 focus:ring-primary/50"
      aria-label="Capture photo"
    >
      {/* Inner circle */}
      <span className="absolute inset-2 rounded-full bg-primary" />
    </button>
  );
}
