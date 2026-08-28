import { useEffect } from 'react';
import { CircleCheck as CheckCircle2, X } from 'lucide-react';

interface ToastProps {
  message: string;
  submessage?: string;
  show: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, submessage, show, onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [show, duration, onClose]);

  if (!show) return null;

  return (
    <div className="fixed left-1/2 top-24 z-[60] -translate-x-1/2 animate-toast-in">
      <div className="glass-card flex items-center gap-3 rounded-xl px-5 py-4 shadow-2xl ring-1 ring-violet-600/20" style={{ borderColor: 'rgba(124, 58, 237, 0.2)' }}>
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-violet-100">
          <CheckCircle2 className="h-5 w-5 text-violet-700" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">{message}</p>
          {submessage && <p className="text-xs text-slate-500">{submessage}</p>}
        </div>
        <button onClick={onClose} className="ml-2 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
