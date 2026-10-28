import { useState } from 'react';
import type { EventRegistrationForm, FormSubmission } from '@/admin/db/types';
import { formRepository } from '@/admin/db/repositories/formRepository';

interface EventRegistrationFormCardProps {
  form: EventRegistrationForm;
  isPreview?: boolean;
  onSuccess?: (submission: FormSubmission) => void;
}

export function EventRegistrationFormCard({
  form,
  isPreview = false,
  onSuccess,
}: EventRegistrationFormCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [donation, setDonation] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<FormSubmission | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form field inputs state
  const [formData, setFormData] = useState<Record<string, string>>({
    name: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    age: '',
    address: '',
    city: '',
    pincode: '',
    state: '',
    churchName: '',
    churchRole: '',
    howHeard: '',
    attendedBefore: '',
  });

  const totalTicketAmount = form.baseAmount * quantity;
  const totalAmount = totalTicketAmount + (Number(donation) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validate required fields
    const enabledFields = (form.fields || []).filter((f) => f.enabled);
    for (const field of enabledFields) {
      if (field.required && !formData[field.name]?.trim()) {
        setErrorMsg(`Please fill in the required field: ${field.label}`);
        return;
      }
    }

    if (isPreview) {
      // In preview mode inside admin panel, simulate success
      const mockSubmission: FormSubmission = {
        id: `preview-sub-${Date.now()}`,
        formId: form.id,
        eventId: form.eventId,
        eventTitle: form.eventTitle,
        name: formData.name || 'Sample Delegate',
        lastName: formData.lastName || '',
        email: formData.email || 'delegate@example.com',
        phone: formData.phone || '9876543210',
        gender: formData.gender,
        age: formData.age,
        address: formData.address,
        city: formData.city,
        pincode: formData.pincode,
        state: formData.state,
        churchName: formData.churchName,
        churchRole: formData.churchRole,
        howHeard: formData.howHeard,
        attendedBefore: formData.attendedBefore,
        quantity,
        unitAmount: form.baseAmount,
        ticketTotal: totalTicketAmount,
        donationAmount: Number(donation) || 0,
        totalAmount,
        currency: form.currency || 'INR',
        paymentStatus: 'paid',
        paymentMethod: 'UPI',
        transactionId: `PREVIEW-TXN-${Date.now().toString(36).toUpperCase()}`,
        createdAt: new Date().toISOString(),
      };
      setSubmittedData(mockSubmission);
      onSuccess?.(mockSubmission);
      return;
    }

    // Live mode: persist in repository
    try {
      setIsSubmitting(true);
      const submission = formRepository.createSubmission({
        formId: form.id,
        eventId: form.eventId,
        eventTitle: form.eventTitle,
        name: formData.name,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        age: formData.age,
        address: formData.address,
        city: formData.city,
        pincode: formData.pincode,
        state: formData.state,
        churchName: formData.churchName,
        churchRole: formData.churchRole,
        howHeard: formData.howHeard,
        attendedBefore: formData.attendedBefore,
        quantity,
        unitAmount: form.baseAmount,
        ticketTotal: totalTicketAmount,
        donationAmount: Number(donation) || 0,
        totalAmount,
        currency: form.currency || 'INR',
        paymentStatus: 'paid',
        paymentMethod: 'UPI / NetBanking',
        transactionId: `EIC-PAY-${Date.now().toString(36).toUpperCase()}`,
      });

      setSubmittedData(submission);
      onSuccess?.(submission);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while submitting your registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If successfully registered, show receipt / confirmation card
  if (submittedData) {
    return (
      <div className="w-full max-w-[480px] mx-auto bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden text-slate-800 animate-in zoom-in-95 duration-200">
        <div className="bg-[#182541] text-white p-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 mb-3">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold font-serif">Registration Confirmed!</h3>
          <p className="text-xs text-white/70 mt-1">
            {isPreview ? '(Preview Mode - Form works as expected)' : 'Thank you for registering! We look forward to seeing you.'}
          </p>
        </div>

        <div className="p-6 space-y-4 text-xs sm:text-sm">
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3.5 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Reference Code:</span>
              <span className="font-mono font-bold text-slate-900">{submittedData.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Attendee:</span>
              <span className="font-semibold text-slate-900">
                {submittedData.name} {submittedData.lastName || ''}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Event:</span>
              <span className="font-semibold text-slate-900 text-right truncate max-w-[200px]">
                {submittedData.eventTitle}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Total Delegates:</span>
              <span className="font-bold text-slate-900">{submittedData.quantity}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200/80 pt-2 text-sm font-bold">
              <span className="text-slate-700">Total Amount:</span>
              <span className="text-emerald-700 font-mono">
                {form.currencySymbol} {submittedData.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setSubmittedData(null);
                setQuantity(1);
                setDonation(0);
              }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
            >
              ← Register Another Delegate
            </button>
          </div>
        </div>
      </div>
    );
  }

  const enabledFields = (form.fields || []).filter((f) => f.enabled);

  return (
    <div className="w-full max-w-[480px] mx-auto bg-white rounded-lg shadow-xl border border-slate-200/80 overflow-hidden text-slate-800 transition-all font-sans">
      {/* Form Header */}
      <div className="p-6 sm:p-7 pb-4">
        <h2 className="text-[#182541] font-bold text-xl sm:text-2xl tracking-tight">
          {form.title || 'Payment Details'}
        </h2>
        {/* Underline bar matching user screenshot */}
        <div className="h-1 w-9 bg-[#182541] rounded-full mt-2 mb-4" />

        {form.subtitle && (
          <p className="text-xs text-slate-500 leading-relaxed mb-4">
            {form.subtitle}
          </p>
        )}

        {errorMsg && (
          <div className="mb-4 rounded-md bg-rose-50 border border-rose-200 p-2.5 text-xs font-medium text-rose-700">
            {errorMsg}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* 1. Amount Row with Counter */}
          <div className="grid grid-cols-1 sm:grid-cols-12 sm:items-center gap-1 sm:gap-3">
            <label className="sm:col-span-4 text-xs sm:text-sm font-medium text-slate-700">
              Amount <span className="text-rose-500 font-bold">*</span>
            </label>
            <div className="sm:col-span-8">
              <div className="flex items-center justify-between border border-blue-200/80 bg-white rounded-md px-3 py-1.5 shadow-2xs">
                <span className="font-bold text-slate-900 text-sm">
                  {form.currencySymbol} {totalTicketAmount.toFixed(2)}
                </span>
                {form.allowQuantity && (
                  <div className="flex items-center border border-slate-200 rounded text-xs bg-white select-none">
                    <button
                      type="button"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-2 py-0.5 text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="px-2.5 py-0.5 font-semibold text-slate-800 border-x border-slate-200 min-w-6 text-center">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      disabled={quantity >= (form.maxQuantity || 10)}
                      onClick={() => setQuantity((q) => Math.min(form.maxQuantity || 10, q + 1))}
                      className="px-2 py-0.5 text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 2. Optional Donation Row */}
          {form.allowDonation && (
            <div className="grid grid-cols-1 sm:grid-cols-12 sm:items-center gap-1 sm:gap-3">
              <label className="sm:col-span-4 text-xs sm:text-sm font-medium text-slate-700">
                Donation
              </label>
              <div className="sm:col-span-8 relative flex items-center">
                <span className="absolute left-3 text-sm font-medium text-slate-400 pointer-events-none">
                  {form.currencySymbol}
                </span>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={donation || ''}
                  onChange={(e) => setDonation(e.target.value ? Math.max(0, Number(e.target.value)) : 0)}
                  placeholder={form.donationPlaceholder || 'Enter Amount'}
                  className="w-full pl-7 pr-3 py-1.5 text-sm rounded-md border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs transition"
                />
              </div>
            </div>
          )}

          {/* 3. Attendee Input Fields */}
          {enabledFields.map((field) => (
            <div key={field.id} className="grid grid-cols-1 sm:grid-cols-12 sm:items-center gap-1 sm:gap-3">
              <label className="sm:col-span-4 text-xs sm:text-sm font-medium text-slate-700">
                {field.label} {field.required && <span className="text-rose-500 font-bold">*</span>}
              </label>
              <div className="sm:col-span-8">
                {/* Phone Split Input */}
                {field.name === 'phone' ? (
                  <div className="flex rounded-md border border-slate-200 overflow-hidden shadow-2xs focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                    <div className="bg-slate-50 border-r border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 flex items-center shrink-0">
                      IN +91
                    </div>
                    <input
                      type="tel"
                      required={field.required}
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder={field.placeholder || ''}
                      className="flex-1 px-3 py-1.5 text-sm text-slate-800 bg-white placeholder-slate-400 focus:outline-none"
                    />
                  </div>
                ) : field.type === 'select' ? (
                  /* Select Dropdown */
                  <select
                    required={field.required}
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm rounded-md border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs cursor-pointer"
                  >
                    <option value="">--Select--</option>
                    {field.options?.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'textarea' ? (
                  /* Textarea (Address) */
                  <textarea
                    rows={2}
                    required={field.required}
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    placeholder={field.placeholder || ''}
                    className="w-full px-3 py-1.5 text-sm rounded-md border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs resize-y"
                  />
                ) : (
                  /* Standard text / number / email inputs */
                  <input
                    type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : 'text'}
                    required={field.required}
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    placeholder={field.placeholder || ''}
                    className="w-full px-3 py-1.5 text-sm rounded-md border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs"
                  />
                )}
              </div>
            </div>
          ))}

          {/* Form Checkout Footer Bar */}
          <div className="border-t border-slate-200 -mx-6 sm:-mx-7 -mb-6 sm:-mb-7 mt-6 px-6 sm:px-7 py-3 bg-slate-50 flex items-center justify-between gap-3">
            {/* Payment Logos */}
            <div className="flex items-center gap-2">
              {form.showPaymentLogos && <PaymentBadges />}
            </div>

            {/* Pay Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#0D1117] hover:bg-[#182541] active:scale-95 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-md transition shadow-md cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Processing...</span>
              ) : (
                <span>Pay {form.currencySymbol} {totalAmount.toFixed(2)}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Crisp SVG badges for UPI, VISA, MasterCard, RuPay matching checkout footer
 */
function PaymentBadges() {
  return (
    <div className="flex items-center gap-1.5 select-none" title="Supported Payment Methods">
      {/* UPI */}
      <div className="flex items-center font-black italic tracking-tighter text-[11px] text-[#282C3F] bg-white border border-slate-200 rounded px-1.5 py-0.5 shadow-2xs">
        <span className="text-emerald-600">U</span>
        <span className="text-amber-500">P</span>
        <span className="text-blue-600">I</span>
      </div>

      {/* VISA */}
      <div className="flex items-center font-black italic text-[11px] text-[#1A1F71] bg-white border border-slate-200 rounded px-1.5 py-0.5 shadow-2xs">
        VISA
      </div>

      {/* MasterCard */}
      <div className="flex items-center bg-white border border-slate-200 rounded px-1.5 py-0.5 shadow-2xs">
        <div className="flex -space-x-1">
          <div className="h-3 w-3 rounded-full bg-[#EB001B]" />
          <div className="h-3 w-3 rounded-full bg-[#F79E1B] opacity-80" />
        </div>
      </div>

      {/* RuPay */}
      <div className="flex items-center font-bold text-[10px] text-[#2E3192] bg-white border border-slate-200 rounded px-1.5 py-0.5 shadow-2xs">
        <span>RuPay</span>
        <span className="text-[#00AEEF] text-[8px] ml-0.5">▶</span>
      </div>
    </div>
  );
}
