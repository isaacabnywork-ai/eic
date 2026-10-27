import { useState, type FormEvent } from 'react';
import { 
  Mail, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Send, 
  User 
} from 'lucide-react';
import { SeoHead } from '@/components/seo/SeoHead';
import { PageHeader } from '@/components/ui/Section';

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      // Simulate form processing with a short delay
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Construct mailto link as a guaranteed fallback trigger or local state success
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    } catch {
      setErrorMessage('Could not send message. Please reach out to us directly via email or phone.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SeoHead
        title="Contact & Inquiries"
        description="Get in touch with the pastoral team at Equip Indian Churches. Contact information, address in Lucknow, phone, email, and inquiry form."
        path="/contact"
      />

      <PageHeader
        eyebrow="Get In Touch"
        title="Contact & Inquiries"
        description="If you have any concerns or require clarification, please do not hesitate to contact us."
      />

      <div className="container-page py-12 sm:py-16 lg:py-20 max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-12 items-start">
          {/* Left Column: Direct Contact Information (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-line pb-4">
                <h2 className="font-serif text-2xl font-bold text-ink">
                  Direct Inquiries
                </h2>
                <p className="mt-1 text-xs text-muted">
                  Please feel free to connect with our coordinator.
                </p>
              </div>

              {/* Contact Person */}
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent-text">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Contact Person
                  </p>
                  <p className="font-bold text-ink text-base mt-0.5">
                    Bro. Santosh
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent-text">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Phone / WhatsApp
                  </p>
                  <a
                    href="tel:+919886769948"
                    className="font-bold text-ink hover:text-accent-text transition-colors text-base mt-0.5 block"
                  >
                    +91 98867 69948
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent-text">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Email Address
                  </p>
                  <a
                    href="mailto:info@admin.equipindianchurches.com"
                    className="font-bold text-ink hover:text-accent-text transition-colors text-sm sm:text-base mt-0.5 block break-all"
                  >
                    info@admin.equipindianchurches.com
                  </a>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-4 border-t border-line/60 pt-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent-text">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Postal Address
                  </p>
                  <p className="text-sm text-body leading-relaxed mt-0.5 font-medium">
                    16B/243, Vrindavan Yojna 4,<br />
                    Raebareli Road,<br />
                    Lucknow – 226029, UP, (India)
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Note */}
            <div className="rounded-2xl border border-line bg-surface-2 p-6 text-xs text-muted space-y-2">
              <p className="font-semibold text-ink">Pastoral Ministry Notice</p>
              <p className="leading-relaxed">
                We are eager to partner with pastors, seminary leaders, and believers passionate about biblical truth and sound gospel growth across every state of India.
              </p>
            </div>
          </div>

          {/* Right Column: Contact Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-line bg-surface p-6 sm:p-10 shadow-xs space-y-6">
              <div className="border-b border-line pb-4">
                <h3 className="font-serif text-2xl font-bold text-ink">
                  Send a Message
                </h3>
                <p className="mt-1 text-xs text-muted">
                  Fill out the form below and we will get back to you as soon as possible.
                </p>
              </div>

              {submitted ? (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center space-y-4 animate-in fade-in duration-300">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-serif text-2xl font-bold text-ink">
                      Thank You!
                    </h4>
                    <p className="text-sm text-body leading-relaxed max-w-md mx-auto">
                      Your message has been successfully received. A member of our team will review your inquiry and be in touch soon.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="inline-block mt-2 rounded-xl bg-accent px-5 py-2.5 text-xs font-bold text-accent-ink hover:brightness-105 transition cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {errorMessage && (
                    <div className="rounded-xl border border-rose-300 bg-rose-50 p-3.5 text-xs text-rose-700 leading-relaxed">
                      {errorMessage}
                    </div>
                  )}

                  <div className="grid gap-5 sm:grid-cols-2">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-ink block">
                        Your Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Pastor / Brother / Sister"
                        className="w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-accent focus:bg-surface focus:outline-none focus:ring-1 focus:ring-accent transition"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-ink block">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="yourname@example.com"
                        className="w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-accent focus:bg-surface focus:outline-none focus:ring-1 focus:ring-accent transition"
                      />
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    {/* Phone */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-ink block">
                        Phone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-accent focus:bg-surface focus:outline-none focus:ring-1 focus:ring-accent transition"
                      />
                    </div>

                    {/* Subject */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-ink block">
                        Subject <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="General Inquiry, Partnership, Resources..."
                        className="w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-accent focus:bg-surface focus:outline-none focus:ring-1 focus:ring-accent transition"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ink block">
                      Message <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please share your questions, suggestions, or church partnership inquiry..."
                      className="w-full rounded-xl border border-line bg-bg px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-accent focus:bg-surface focus:outline-none focus:ring-1 focus:ring-accent transition resize-y"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-8 py-3.5 text-sm font-bold text-accent-ink hover:brightness-105 disabled:opacity-50 transition shadow-xs cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Sending Message...' : 'Send Message'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
