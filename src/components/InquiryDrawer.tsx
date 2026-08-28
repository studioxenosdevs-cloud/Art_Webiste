import { useEffect, useState } from 'react';
import { X, ShoppingBag, Send, User, Phone, MapPin, Frame, Loader as Loader2, Mail, Sparkles, Ruler } from 'lucide-react';
import type { Artwork, Order, CanvasSize } from '@/types';
import { CANVAS_SIZES } from '@/types';

interface InquiryDrawerProps {
  artwork: Artwork | null;
  onClose: () => void;
  onSubmit: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => void;
}

interface FormState {
  customerName: string;
  email: string;
  phone: string;
  shippingAddress: string;
  customFraming: boolean;
  canvasSize: string;
  notes: string;
}

const EMPTY_FORM: FormState = {
  customerName: '',
  email: '',
  phone: '',
  shippingAddress: '',
  customFraming: false,
  canvasSize: '',
  notes: '',
};

function formatPKR(amount: number): string {
  return amount.toLocaleString('en-PK') + ' PKR';
}

export default function InquiryDrawer({ artwork, onClose, onSubmit }: InquiryDrawerProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [dispatching, setDispatching] = useState(false);

  const isCommission = artwork?.id === 'commission';

  useEffect(() => {
    if (artwork) {
      setForm({ ...EMPTY_FORM, canvasSize: isCommission ? '' : artwork.dimensions });
      setErrors({});
      setDispatching(false);
    }
  }, [artwork, isCommission]);

  useEffect(() => {
    if (artwork) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [artwork]);

  if (!artwork) return null;

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.customerName.trim()) e.customerName = 'Please enter your name';
    if (!form.phone.trim()) e.phone = 'Please enter your WhatsApp/phone number';
    if (!form.shippingAddress.trim()) e.shippingAddress = 'Please enter your delivery address';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setDispatching(true);
    setTimeout(() => {
      const sizeNote = form.canvasSize ? (isCommission ? `Preferred size: ${form.canvasSize}` : `Size: ${form.canvasSize}`) : '';
      const combinedNotes = [sizeNote, form.notes].filter(Boolean).join(' · ');
      onSubmit({
        artworkId: artwork.id,
        artworkTitle: artwork.title,
        customerName: form.customerName,
        email: form.email.trim() || undefined,
        phone: form.phone,
        shippingAddress: form.shippingAddress,
        customFraming: form.customFraming,
        notes: combinedNotes || undefined,
      });
      setDispatching(false);
      onClose();
    }, 1200);
  };

  const update = (key: keyof FormState, value: string | boolean) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  return (
    <>
      <div className="drawer-overlay fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      <div className="drawer-panel fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2">
            {isCommission ? <Sparkles className="h-5 w-5 text-violet-600" /> : <ShoppingBag className="h-5 w-5 text-violet-600" />}
            <h3 className="font-display text-lg font-semibold text-slate-900">{isCommission ? 'Commission Request' : 'Purchase Inquiry'}</h3>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-violet-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50/50 px-5 py-3">
          {!isCommission && <img src={artwork.imageUrl} alt={artwork.title} className="h-14 w-14 flex-shrink-0 rounded-lg object-cover ring-1 ring-slate-200" />}
          {isCommission && (
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-100 to-violet-200/50 ring-1 ring-violet-600/20">
              <Sparkles className="h-6 w-6 text-violet-700" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-sm font-semibold text-slate-900">{artwork.title}</p>
            <p className="text-xs text-slate-400">{isCommission ? 'Custom artwork tailored to your vision' : `${artwork.medium} · ${artwork.dimensions}`}</p>
          </div>
          {!isCommission && <span className="font-display text-sm font-semibold text-violet-700">{formatPKR(artwork.pricePKR)}</span>}
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin">
          <p className="mb-4 text-xs text-slate-400">
            {isCommission ? 'Share your vision and contact details. Zelbrush will reach out to discuss your custom piece.' : 'Fill in your details to reserve this piece. An instant email notification will be dispatched to Zelbrush.'}
          </p>

          <div className="space-y-4">
            <Field label="Customer Name" icon={<User className="h-4 w-4" />} error={errors.customerName}>
              <input type="text" value={form.customerName} onChange={(e) => update('customerName', e.target.value)} placeholder="e.g. Ayesha Khan" className="form-input" />
            </Field>

            <Field label="Email (optional)" icon={<Mail className="h-4 w-4" />}>
              <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="your.email@example.com" className="form-input" />
            </Field>

            <Field label="WhatsApp / Phone Number" icon={<Phone className="h-4 w-4" />} error={errors.phone}>
              <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+92 300 1234567" className="form-input" />
            </Field>

            <Field label="Canvas Size" icon={<Ruler className="h-4 w-4" />}>
              <select value={form.canvasSize} onChange={(e) => update('canvasSize', e.target.value)} className="form-input">
                <option value="" className="bg-white">Select a size...</option>
                {CANVAS_SIZES.map((size: CanvasSize) => (
                  <option key={size} value={size} className="bg-white">{size}</option>
                ))}
              </select>
            </Field>

            <Field label="Delivery Address" icon={<MapPin className="h-4 w-4" />} error={errors.shippingAddress}>
              <textarea value={form.shippingAddress} onChange={(e) => update('shippingAddress', e.target.value)} placeholder="House #, Street, Area, City, Pakistan" rows={2} className="form-input resize-none" />
            </Field>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition-colors hover:border-violet-600/30">
              <input type="checkbox" checked={form.customFraming} onChange={(e) => update('customFraming', e.target.checked)} className="custom-checkbox" />
              <div className="flex items-center gap-2">
                <Frame className="h-4 w-4 text-violet-600/70" />
                <div>
                  <p className="text-sm font-medium text-slate-700">Custom Framing Request</p>
                  <p className="text-xs text-slate-400">Request a custom frame for this piece</p>
                </div>
              </div>
            </label>

            <Field label={isCommission ? 'Commission Details' : 'Additional Notes (optional)'}>
              <textarea
                value={form.notes}
                onChange={(e) => update('notes', e.target.value)}
                placeholder={isCommission ? 'Describe your vision — subject, style, colors, Quranic verses, etc.' : 'Any special requests or framing preferences...'}
                rows={isCommission ? 4 : 2}
                className="form-input resize-none"
              />
            </Field>
          </div>
        </form>

        <div className="border-t border-slate-200 px-5 py-4">
          <button
            onClick={handleSubmit}
            disabled={dispatching}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 py-3.5 text-sm font-semibold text-white transition-all hover:shadow-[0_0_30px_-5px_rgba(124,58,237,0.5)] disabled:opacity-70"
          >
            {dispatching ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Dispatching notification...</>
            ) : (
              <><Send className="h-4 w-4" /> {isCommission ? 'Submit Commission Request' : 'Submit Inquiry'}</>
            )}
          </button>
        </div>
      </div>
    </>
  );
}

function Field({ label, icon, error, children }: { label: string; icon?: React.ReactNode; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
        {icon && <span className="text-slate-400">{icon}</span>}
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </div>
  );
}
