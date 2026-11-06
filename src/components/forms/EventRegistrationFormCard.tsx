import { useState } from 'react';
import type { EventRegistrationForm, FormSubmission } from '@/admin/db/types';
import { formRepository } from '@/admin/db/repositories/formRepository';

interface EventRegistrationFormCardProps {
  form: EventRegistrationForm;
  isPreview?: boolean;
  onSuccess?: (submission: FormSubmission) => void;
}

const COUNTRY_DIAL_CODES = [
  { code: '+91', country: 'IN', label: 'India (+91)' },
  { code: '+1', country: 'US', label: 'USA / Canada (+1)' },
  { code: '+44', country: 'UK', label: 'UK (+44)' },
  { code: '+971', country: 'AE', label: 'UAE (+971)' },
  { code: '+65', country: 'SG', label: 'Singapore (+65)' },
  { code: '+61', country: 'AU', label: 'Australia (+61)' },
  { code: '+977', country: 'NP', label: 'Nepal (+977)' },
  { code: '+94', country: 'LK', label: 'Sri Lanka (+94)' },
  { code: '+880', country: 'BD', label: 'Bangladesh (+880)' },
  { code: '+974', country: 'QA', label: 'Qatar (+974)' },
  { code: '+966', country: 'SA', label: 'Saudi Arabia (+966)' },
  { code: '+965', country: 'KW', label: 'Kuwait (+965)' },
  { code: '+968', country: 'OM', label: 'Oman (+968)' },
  { code: '+60', country: 'MY', label: 'Malaysia (+60)' },
  { code: '+64', country: 'NZ', label: 'New Zealand (+64)' },
];

export function EventRegistrationFormCard({
  form,
  isPreview = false,
  onSuccess,
}: EventRegistrationFormCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [donation, setDonation] = useState<number>(0);
  const [phoneCountryCode, setPhoneCountryCode] = useState('+91');
  const [phoneNumberDigits, setPhoneNumberDigits] = useState('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validate required fields
    const enabledFields = (form.fields || []).filter((f) => f.enabled);

    // Smart resolution helper of primary attendee details whether using standard field keys or custom fields
    const resolveFieldValue = (matchKey: string, matchLabels: string[]): string => {
      if (formData[matchKey]?.trim()) return formData[matchKey].trim();
      for (const f of enabledFields) {
        const l = f.label.toLowerCase().trim();
        if (matchLabels.some((ml) => l === ml || l.startsWith(ml))) {
          const val = formData[f.name];
          if (val && val.trim()) return val.trim();
        }
      }
      return '';
    };
    for (const field of enabledFields) {
      if (field.name === 'phone' || field.type === 'tel') {
        const digits = phoneNumberDigits.trim().replace(/\D/g, '');
        if (field.required && !digits) {
          setErrorMsg(`Please enter a valid 10-digit mobile number for: ${field.label}`);
          return;
        }
        if (digits && digits.length !== 10) {
          setErrorMsg(`Mobile number must be exactly 10 digits (currently ${digits.length} digits entered).`);
          return;
        }
      } else if (field.required && !formData[field.name]?.trim()) {
        setErrorMsg(`Please fill in the required field: ${field.label}`);
        return;
      }
    }

    const fullPhoneNumber = phoneNumberDigits.trim()
      ? `${phoneCountryCode} ${phoneNumberDigits.trim().replace(/\D/g, '')}`
      : formData.phone;

    // Extract custom question responses
    const standardKeys = [
      'name',
      'lastName',
      'email',
      'phone',
      'gender',
      'age',
      'address',
      'city',
      'pincode',
      'state',
      'churchName',
      'churchRole',
      'howHeard',
      'attendedBefore',
    ];

    const customResponses: Record<string, string> = {};
    for (const field of enabledFields) {
      if (formData[field.name] && (!standardKeys.includes(field.name) || field.isCustom)) {
        customResponses[field.label] = formData[field.name];
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
        phone: fullPhoneNumber || '9876543210',
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
        customResponses,
        paymentStatus: 'paid',
        paymentMethod: 'UPI',
        transactionId: `PREVIEW-TXN-${Date.now().toString(36).toUpperCase()}`,
        createdAt: new Date().toISOString(),
      };
      setSubmittedData(mockSubmission);
      onSuccess?.(mockSubmission);
      return;
    }

    // Live mode: If total amount is 0 (Free event), register directly without payment gateway
    if (totalAmount <= 0) {
      try {
        setIsSubmitting(true);
        const resolvedName = resolveFieldValue('name', ['first name', 'delegate name', 'name', 'full name']);
        const resolvedLastName = resolveFieldValue('lastName', ['last name', 'surname', 'family name']);
        const resolvedEmail = resolveFieldValue('email', ['email', 'email address']);
        const resolvedPhone = fullPhoneNumber || resolveFieldValue('phone', ['phone', 'mobile', 'contact', 'whatsapp']);
        const resolvedGender = resolveFieldValue('gender', ['gender', 'sex']);
        const resolvedAge = resolveFieldValue('age', ['age']);
        const resolvedAddress = resolveFieldValue('address', ['address', 'residential address']);
        const resolvedCity = resolveFieldValue('city', ['city']);
        const resolvedState = resolveFieldValue('state', ['state']);
        const resolvedPincode = resolveFieldValue('pincode', ['pincode', 'pin code', 'postal code', 'zip']);
        const resolvedChurchName = resolveFieldValue('churchName', ['church name', 'church']);
        const resolvedChurchRole = resolveFieldValue('churchRole', ['role in the church', 'role in church', 'church role', 'designation']);
        const resolvedHowHeard = resolveFieldValue('howHeard', ['how did you hear', 'how heard']);
        const resolvedAttendedBefore = resolveFieldValue('attendedBefore', ['have you attended', 'attended before', 'attended']);

        const submission = formRepository.createSubmission({
          formId: form.id,
          eventId: form.eventId,
          eventTitle: form.eventTitle,
          name: resolvedName,
          lastName: resolvedLastName,
          email: resolvedEmail,
          phone: resolvedPhone,
          gender: resolvedGender || undefined,
          age: resolvedAge || undefined,
          address: resolvedAddress || undefined,
          city: resolvedCity || undefined,
          pincode: resolvedPincode || undefined,
          state: resolvedState || undefined,
          churchName: resolvedChurchName || undefined,
          churchRole: resolvedChurchRole || undefined,
          howHeard: resolvedHowHeard || undefined,
          attendedBefore: resolvedAttendedBefore || undefined,
          quantity,
          unitAmount: form.baseAmount,
          ticketTotal: totalTicketAmount,
          donationAmount: Number(donation) || 0,
          totalAmount: 0,
          currency: form.currency || 'INR',
          customResponses,
          paymentStatus: 'paid',
          paymentMethod: 'Free Registration',
          transactionId: `FREE-${Date.now().toString(36).toUpperCase()}`,
        });

        setSubmittedData(submission);
        onSuccess?.(submission);
      } catch (err: any) {
        setErrorMsg(err.message || 'An error occurred while submitting your registration.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Live mode: Paid Event via Razorpay Payment Gateway
    try {
      setIsSubmitting(true);

      const resolvedName = resolveFieldValue('name', ['first name', 'delegate name', 'name', 'full name']);
      const resolvedLastName = resolveFieldValue('lastName', ['last name', 'surname', 'family name']);
      const resolvedEmail = resolveFieldValue('email', ['email', 'email address']);
      const resolvedPhone = fullPhoneNumber || resolveFieldValue('phone', ['phone', 'mobile', 'contact', 'whatsapp']);
      const resolvedGender = resolveFieldValue('gender', ['gender', 'sex']);
      const resolvedAge = resolveFieldValue('age', ['age']);
      const resolvedAddress = resolveFieldValue('address', ['address', 'residential address']);
      const resolvedCity = resolveFieldValue('city', ['city']);
      const resolvedState = resolveFieldValue('state', ['state']);
      const resolvedPincode = resolveFieldValue('pincode', ['pincode', 'pin code', 'postal code', 'zip']);
      const resolvedChurchName = resolveFieldValue('churchName', ['church name', 'church']);
      const resolvedChurchRole = resolveFieldValue('churchRole', ['role in the church', 'role in church', 'church role', 'designation']);
      const resolvedHowHeard = resolveFieldValue('howHeard', ['how did you hear', 'how heard']);
      const resolvedAttendedBefore = resolveFieldValue('attendedBefore', ['have you attended', 'attended before', 'attended']);

      // 1. Create Order on Backend
      const amountInPaise = Math.round(totalAmount * 100);
      const orderRes = await fetch('/api/payments/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: form.currency || 'INR',
          receipt: `rcpt_${Date.now()}`,
          notes: {
            formId: form.id,
            eventId: form.eventId,
            eventTitle: form.eventTitle,
            attendeeName: `${resolvedName} ${resolvedLastName}`.trim(),
            attendeeEmail: resolvedEmail,
            attendeePhone: resolvedPhone,
            quantity: String(quantity),
          },
        }),
      });

      if (!orderRes.ok) {
        const errorJson = await orderRes.json().catch(() => ({}));
        throw new Error(errorJson.error || 'Failed to initialize payment gateway.');
      }

      const { orderId, keyId } = await orderRes.json();

      // Ensure Razorpay SDK is loaded
      if (typeof (window as any).Razorpay === 'undefined') {
        throw new Error('Payment gateway SDK is loading. Please try again in a few moments.');
      }

      // 2. Open Razorpay Checkout Modal
      const rzpOptions = {
        key: keyId || 'rzp_live_TwnEreIve56uhr',
        amount: amountInPaise,
        currency: form.currency || 'INR',
        name: 'Equip Indian Churches',
        description: `${form.eventTitle || 'Conference Registration'} (${quantity} ${quantity === 1 ? 'delegate' : 'delegates'})`,
        image: '/favicon.png',
        order_id: orderId,
        prefill: {
          name: `${resolvedName} ${resolvedLastName}`.trim(),
          email: resolvedEmail,
          contact: resolvedPhone.replace(/\s+/g, ''),
        },
        notes: {
          event: form.eventTitle,
          church: resolvedChurchName || '',
        },
        theme: {
          color: '#094899',
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            // 3. Verify Payment Signature
            const verifyRes = await fetch('/api/payments/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(response),
            });

            const verifyData = await verifyRes.json();
            if (!verifyData.verified) {
              throw new Error(verifyData.error || 'Payment signature verification failed.');
            }

            // 4. Save Confirmed Submission
            const submission = formRepository.createSubmission({
              formId: form.id,
              eventId: form.eventId,
              eventTitle: form.eventTitle,
              name: resolvedName,
              lastName: resolvedLastName,
              email: resolvedEmail,
              phone: resolvedPhone,
              gender: resolvedGender || undefined,
              age: resolvedAge || undefined,
              address: resolvedAddress || undefined,
              city: resolvedCity || undefined,
              pincode: resolvedPincode || undefined,
              state: resolvedState || undefined,
              churchName: resolvedChurchName || undefined,
              churchRole: resolvedChurchRole || undefined,
              howHeard: resolvedHowHeard || undefined,
              attendedBefore: resolvedAttendedBefore || undefined,
              quantity,
              unitAmount: form.baseAmount,
              ticketTotal: totalTicketAmount,
              donationAmount: Number(donation) || 0,
              totalAmount,
              currency: form.currency || 'INR',
              customResponses,
              paymentStatus: 'paid',
              paymentMethod: 'Razorpay (Cards/UPI/NetBanking)',
              transactionId: response.razorpay_payment_id,
            });

            setSubmittedData(submission);
            onSuccess?.(submission);
          } catch (verifyErr: any) {
            console.error('Payment verification error:', verifyErr);
            setErrorMsg(verifyErr.message || 'Payment received but confirmation failed. Please contact support.');
          } finally {
            setIsSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsSubmitting(false);
          },
        },
      };

      const rzpInstance = new (window as any).Razorpay(rzpOptions);
      rzpInstance.on('payment.failed', (failedRes: any) => {
        setIsSubmitting(false);
        setErrorMsg(failedRes.error?.description || 'Payment was unsuccessful or cancelled. Please try again.');
      });

      rzpInstance.open();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'An error occurred while connecting to Razorpay.');
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

            {submittedData.customResponses && Object.keys(submittedData.customResponses).length > 0 && (
              <div className="border-t border-slate-200/80 pt-2 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Additional Information
                </span>
                {Object.entries(submittedData.customResponses).map(([q, ans]) => (
                  <div key={q} className="flex justify-between text-xs">
                    <span className="text-slate-500">{q}:</span>
                    <span className="font-medium text-slate-800 text-right max-w-[200px] truncate">{ans}</span>
                  </div>
                ))}
              </div>
            )}
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
    <div className="w-full bg-white rounded-xl shadow-md border border-slate-200/90 overflow-hidden text-slate-800 transition-all font-sans">
      {/* Form Header */}
      <div className="p-6 sm:p-7 pb-4">
        <h2 className="text-[#182541] font-bold text-xl sm:text-2xl tracking-tight">
          {form.title || 'Payment Details'}
        </h2>
        {/* Underline bar matching user screenshot */}
        <div className="h-1.5 w-10 bg-[#0D1117] rounded-sm mt-2.5 mb-5" />

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
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Amount Row with Counter */}
          <div className="grid grid-cols-1 sm:grid-cols-12 sm:items-center gap-1 sm:gap-4">
            <label className="sm:col-span-4 text-xs sm:text-sm font-normal text-slate-600">
              Amount <span className="text-rose-500">*</span>
            </label>
            <div className="sm:col-span-8">
              <div className="flex items-center justify-between border border-blue-200 bg-white rounded px-3 py-2">
                <span className="font-bold text-[#182541] text-sm">
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
                    <span className="px-2.5 py-0.5 font-normal text-slate-700 border-x border-slate-200 min-w-6 text-center">
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
            <div className="grid grid-cols-1 sm:grid-cols-12 sm:items-center gap-1 sm:gap-4">
              <label className="sm:col-span-4 text-xs sm:text-sm font-normal text-slate-600">
                Donation
              </label>
              <div className="sm:col-span-8 relative flex items-center">
                <span className="absolute left-3 text-sm font-normal text-slate-400 pointer-events-none">
                  {form.currencySymbol}
                </span>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={donation || ''}
                  onChange={(e) => setDonation(e.target.value ? Math.max(0, Number(e.target.value)) : 0)}
                  placeholder={form.donationPlaceholder || 'Enter Amount'}
                  className="w-full pl-7 pr-3 py-2 text-sm rounded border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 transition"
                />
              </div>
            </div>
          )}

          {/* 3. Attendee Input Fields */}
          {enabledFields.map((field) => (
            <div key={field.id} className="grid grid-cols-1 sm:grid-cols-12 sm:items-center gap-1 sm:gap-4">
              <label className="sm:col-span-4 text-xs sm:text-sm font-normal text-slate-600">
                {field.label} {field.required && <span className="text-rose-500">*</span>}
              </label>
              <div className="sm:col-span-8">
                {/* Phone Split Input with Country Code Selector */}
                {field.name === 'phone' || field.type === 'tel' ? (
                  <div className="flex rounded border border-slate-200 overflow-hidden bg-white focus-within:border-blue-400">
                    <div className="bg-white border-r border-slate-200 px-3 py-2 text-xs text-slate-700 shrink-0 flex items-center gap-1">
                      <select
                        value={phoneCountryCode}
                        onChange={(e) => setPhoneCountryCode(e.target.value)}
                        className="bg-transparent border-none text-xs font-normal text-slate-700 outline-none cursor-pointer pr-1"
                        title="Select Country Dial Code"
                      >
                        {COUNTRY_DIAL_CODES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.country} {c.code}
                          </option>
                        ))}
                      </select>
                    </div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={10}
                      required={field.required}
                      value={phoneNumberDigits}
                      onChange={(e) => {
                        const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setPhoneNumberDigits(digitsOnly);
                        setFormData({
                          ...formData,
                          [field.name]: `${phoneCountryCode} ${digitsOnly}`.trim(),
                        });
                      }}
                      placeholder={field.placeholder || ''}
                      className="flex-1 px-3 py-2 text-sm text-slate-800 bg-white placeholder-slate-400 focus:outline-none"
                    />
                  </div>
                ) : field.type === 'select' ? (
                  /* Select Dropdown */
                  <div className="relative">
                    <select
                      required={field.required}
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      className="w-full appearance-none px-3 py-2 text-sm rounded border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-blue-400 cursor-pointer pr-8"
                    >
                      <option value="">--Select--</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-600">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                ) : field.type === 'radio' ? (
                  /* Radio Options List */
                  <div className="space-y-1.5 pt-0.5">
                    {field.options?.map((opt) => (
                      <label key={opt} className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 cursor-pointer select-none">
                        <input
                          type="radio"
                          name={field.name}
                          required={field.required}
                          value={opt}
                          checked={formData[field.name] === opt}
                          onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                          className="text-[#094899] focus:ring-[#094899]"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                ) : field.type === 'checkbox' ? (
                  /* Checkboxes */
                  <div className="space-y-1.5 pt-0.5">
                    {field.options && field.options.length > 0 ? (
                      field.options.map((opt) => {
                        const currentVals = formData[field.name] ? formData[field.name].split(', ') : [];
                        const isChecked = currentVals.includes(opt);
                        return (
                          <label key={opt} className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              value={opt}
                              checked={isChecked}
                              onChange={() => {
                                const updated = isChecked ? currentVals.filter((v) => v !== opt) : [...currentVals, opt];
                                setFormData({ ...formData, [field.name]: updated.join(', ') });
                              }}
                              className="rounded border-slate-300 text-[#094899] focus:ring-[#094899]"
                            />
                            <span>{opt}</span>
                          </label>
                        );
                      })
                    ) : (
                      <label className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          required={field.required}
                          checked={formData[field.name] === 'Yes'}
                          onChange={(e) => setFormData({ ...formData, [field.name]: e.target.checked ? 'Yes' : '' })}
                          className="rounded border-slate-300 text-[#094899] focus:ring-[#094899]"
                        />
                        <span>{field.placeholder || 'Yes, I confirm'}</span>
                      </label>
                    )}
                  </div>
                ) : field.type === 'textarea' ? (
                  /* Textarea (Address / Paragraph) */
                  <textarea
                    rows={2}
                    required={field.required}
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    placeholder={field.placeholder || ''}
                    className="w-full px-3 py-2 text-sm rounded border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-blue-400 resize-y"
                  />
                ) : (
                  /* Standard inputs (text, number, email, date, time, url, tel) */
                  <input
                    type={field.type}
                    required={field.required}
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    placeholder={field.placeholder || ''}
                    className="w-full px-3 py-2 text-sm rounded border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-blue-400"
                  />
                )}
                {field.helpText && (
                  <p className="text-[11px] text-slate-400 mt-1">{field.helpText}</p>
                )}
              </div>
            </div>
          ))}

          {/* Form Checkout Footer Bar: Full width, clean white on left with SVG logos, solid black pay button on right */}
          <div className="border-t border-slate-100 -mx-6 sm:-mx-7 -mb-6 sm:-mb-7 mt-7 px-6 sm:px-7 py-3 bg-[#F8FAFC] flex items-center justify-between gap-3">
            {/* Payment Logos */}
            <div className="flex items-center gap-2">
              {form.showPaymentLogos && <PaymentBadges />}
            </div>

            {/* Pay Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#0D1117] hover:bg-[#182541] active:scale-95 text-white font-semibold text-xs sm:text-sm px-6 py-2.5 rounded transition shadow-sm cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
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

      {/* Amex */}
      <div className="flex items-center font-bold text-[9px] text-[#006FCF] bg-[#EBF4FA] border border-[#006FCF]/30 rounded px-1.5 py-0.5 shadow-2xs">
        AMEX
      </div>
    </div>
  );
}
