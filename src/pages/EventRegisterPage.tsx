import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formRepository } from '@/admin/db/repositories/formRepository';
import { eventRepository } from '@/admin/db/repositories/eventRepository';
import { adminDb } from '@/admin/db/storage';
import { EventRegistrationFormCard } from '@/components/forms/EventRegistrationFormCard';
import type { EventRegistrationForm, CustomEvent } from '@/admin/db/types';
import { ArrowLeft, Calendar, MapPin, AlertCircle } from 'lucide-react';

export function EventRegisterPage() {
  const { formId, slug } = useParams<{ formId?: string; slug?: string }>();

  const [form, setForm] = useState<EventRegistrationForm | null>(null);
  const [event, setEvent] = useState<CustomEvent | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    let matchedForm: EventRegistrationForm | null = null;
    let matchedEvent: CustomEvent | null = null;

    if (formId) {
      matchedForm = formRepository.getFormById(formId) || formRepository.getFormBySlug(formId);
      if (matchedForm) {
        matchedEvent = eventRepository.getById(matchedForm.eventId);
      }
    } else if (slug) {
      matchedEvent = eventRepository.getBySlug(slug);
      if (matchedEvent) {
        matchedForm = formRepository.getFormByEventId(matchedEvent.id);
      }
    }

    // Fallback: if no specific form matched, pick the first active form
    if (!matchedForm) {
      const allActive = formRepository.getAllForms({ status: 'active' });
      if (allActive.length > 0) {
        matchedForm = allActive[0];
        matchedEvent = eventRepository.getById(matchedForm.eventId);
      }
    }

    setForm(matchedForm);
    setEvent(matchedEvent);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    return adminDb.subscribe(loadData);
  }, [formId, slug]);

  useEffect(() => {
    if (form) {
      document.title = `${form.title} | ${form.eventTitle} - Equip Indian Churches`;
    } else {
      document.title = 'Event Registration | Equip Indian Churches';
    }
  }, [form]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#094899] border-t-transparent mx-auto" />
          <p className="text-xs text-slate-500">Loading registration form...</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-lg">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold font-serif text-slate-900">Registration Form Not Found</h2>
          <p className="text-xs text-slate-500 mt-2 mb-6">
            The registration form you are trying to access is currently unavailable, closed, or has been updated.
          </p>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 rounded-lg bg-[#094899] text-white px-5 py-2.5 text-xs font-semibold hover:bg-[#073877] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Browse All Events</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F6FB] dark:bg-[#070A0F] py-8 sm:py-12 px-4 transition-colors">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to={event ? `/events/${event.slug}` : '/events'}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-white/70 hover:text-[#094899] dark:hover:text-[#F0F6FB] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{event ? `Back to ${event.title}` : 'Back to Events'}</span>
          </Link>

          <span className="text-[11px] font-mono text-slate-400 dark:text-white/40">
            Form: {form.slug}
          </span>
        </div>

        {/* Event Header Banner (if event is linked) */}
        {event && (
          <div className="rounded-2xl bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#094899]/10 text-[#094899] dark:bg-[#F0F6FB]/10 dark:text-[#F0F6FB] px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                Official Conference Registration
              </span>
              <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 dark:text-white">
                {event.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-white/60">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#094899]" />
                  <span>
                    {event.startDate} {event.startTime ? `• ${event.startTime}` : ''}
                  </span>
                </div>
                {(event.customVenueName || event.customVenueAddress) && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>{event.customVenueName || event.customVenueAddress}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <span className="text-xs text-slate-400 dark:text-white/40 block">Registration Fee</span>
              <span className="text-2xl font-bold font-serif text-[#094899] dark:text-[#F0F6FB]">
                {form.currencySymbol} {form.baseAmount.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-white/40 block">per delegate</span>
            </div>
          </div>
        )}

        {/* The Exact Form Card */}
        <div className="flex justify-center pt-2">
          <EventRegistrationFormCard
            form={form}
            isPreview={false}
          />
        </div>
      </div>
    </div>
  );
}
