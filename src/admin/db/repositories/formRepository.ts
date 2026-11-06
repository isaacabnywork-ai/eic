import { adminDb } from '../storage';
import { authRepository } from './authRepository';
import { DEFAULT_REGISTRATION_FIELDS } from '../seed';
import type { EventRegistrationForm, FormSubmission } from '../types';

export interface FormFilterParams {
  search?: string;
  status?: 'all' | 'active' | 'draft' | 'closed';
  eventId?: string;
}

export interface SubmissionFilterParams {
  search?: string;
  formId?: string;
  eventId?: string;
  status?: 'all' | 'paid' | 'pending' | 'failed';
}

export const formRepository = {
  /**
   * Retrieves all forms with optional search and filters
   */
  getAllForms(params: FormFilterParams = {}): EventRegistrationForm[] {
    const state = adminDb.getState();
    let forms = [...(state.forms || [])];

    if (params.status && params.status !== 'all') {
      forms = forms.filter((f) => f.status === params.status);
    }

    if (params.eventId && params.eventId !== 'all') {
      forms = forms.filter((f) => f.eventId === params.eventId);
    }

    if (params.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      forms = forms.filter(
        (f) =>
          f.title.toLowerCase().includes(q) ||
          f.eventTitle.toLowerCase().includes(q) ||
          f.slug.toLowerCase().includes(q),
      );
    }

    // Sort by last updated descending
    return forms.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  getFormById(id: string): EventRegistrationForm | null {
    const state = adminDb.getState();
    return (state.forms || []).find((f) => f.id === id) || null;
  },

  getFormBySlug(slug: string): EventRegistrationForm | null {
    const state = adminDb.getState();
    return (state.forms || []).find((f) => f.slug === slug) || null;
  },

  getFormByEventId(eventId: string): EventRegistrationForm | null {
    const state = adminDb.getState();
    // Return active form for this event if any
    const forms = (state.forms || []).filter((f) => f.eventId === eventId);
    return forms.find((f) => f.status === 'active') || forms[0] || null;
  },

  createForm(data: Partial<EventRegistrationForm> & { title: string; eventId: string }): EventRegistrationForm {
    const state = adminDb.getState();
    const event = state.events.find((e) => e.id === data.eventId);
    const session = authRepository.getCurrentSession();
    const now = new Date().toISOString();

    const slugBase = (data.title || 'event-registration')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const uniqueSlug = `${slugBase}-${Date.now().toString(36).slice(-4)}`;

    const newForm: EventRegistrationForm = {
      id: `form-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: data.title || 'Payment Details',
      subtitle: data.subtitle || (event ? `${event.title} Registration` : 'Conference Registration'),
      eventId: data.eventId,
      eventTitle: event?.title || data.eventTitle || 'Selected Event',
      slug: data.slug || uniqueSlug,
      status: data.status || 'active',
      currency: data.currency || 'INR',
      currencySymbol: data.currencySymbol || '₹',
      baseAmount: typeof data.baseAmount === 'number' ? data.baseAmount : 300,
      allowQuantity: data.allowQuantity !== undefined ? data.allowQuantity : true,
      maxQuantity: data.maxQuantity || 10,
      allowDonation: data.allowDonation !== undefined ? data.allowDonation : true,
      donationPlaceholder: data.donationPlaceholder || 'Enter Amount',
      fields: data.fields && data.fields.length > 0 ? data.fields : [...DEFAULT_REGISTRATION_FIELDS],
      payButtonText: data.payButtonText || 'Pay ₹ {total}',
      showPaymentLogos: data.showPaymentLogos !== undefined ? data.showPaymentLogos : true,
      paymentInstructions: data.paymentInstructions || 'Instant confirmation via UPI, Cards, NetBanking.',
      successMessage: data.successMessage || 'Thank you for registering! Your registration has been confirmed.',
      submissionsCount: 0,
      totalCollected: 0,
      createdAt: now,
      updatedAt: now,
      createdById: session?.user.id || 'system',
    };

    adminDb.update('forms', (prev) => [newForm, ...(prev || [])]);

    adminDb.logAudit({
      userId: session?.user.id || 'system',
      userEmail: session?.user.email || 'system',
      action: 'form.create',
      entity: 'form',
      entityId: newForm.id,
      entityTitle: newForm.title,
      details: { eventId: newForm.eventId, baseAmount: newForm.baseAmount },
    });

    return newForm;
  },

  updateForm(id: string, updates: Partial<EventRegistrationForm>): EventRegistrationForm | null {
    const existing = this.getFormById(id);
    if (!existing) return null;

    const state = adminDb.getState();
    const event = updates.eventId ? state.events.find((e) => e.id === updates.eventId) : null;
    const session = authRepository.getCurrentSession();
    const now = new Date().toISOString();

    const updated: EventRegistrationForm = {
      ...existing,
      ...updates,
      eventTitle: event?.title || updates.eventTitle || existing.eventTitle,
      updatedAt: now,
    };

    adminDb.update('forms', (prev) => (prev || []).map((f) => (f.id === id ? updated : f)));

    adminDb.logAudit({
      userId: session?.user.id || 'system',
      userEmail: session?.user.email || 'system',
      action: 'form.update',
      entity: 'form',
      entityId: id,
      entityTitle: updated.title,
      details: updates,
    });

    return updated;
  },

  deleteForm(id: string): boolean {
    const existing = this.getFormById(id);
    if (!existing) return false;

    adminDb.update('forms', (prev) => (prev || []).filter((f) => f.id !== id));

    const session = authRepository.getCurrentSession();
    adminDb.logAudit({
      userId: session?.user.id || 'system',
      userEmail: session?.user.email || 'system',
      action: 'form.delete',
      entity: 'form',
      entityId: id,
      entityTitle: existing.title,
    });

    return true;
  },

  duplicateForm(id: string): EventRegistrationForm | null {
    const original = this.getFormById(id);
    if (!original) return null;

    const suffix = Date.now().toString(36).slice(-4);
    return this.createForm({
      ...original,
      title: `${original.title} (Copy)`,
      slug: `${original.slug}-copy-${suffix}`,
      status: 'draft',
      submissionsCount: 0,
      totalCollected: 0,
    });
  },

  /**
   * Submissions Management
   */
  getAllSubmissions(params: SubmissionFilterParams = {}): FormSubmission[] {
    const state = adminDb.getState();
    let submissions = [...(state.submissions || [])];

    if (params.formId && params.formId !== 'all') {
      submissions = submissions.filter((s) => s.formId === params.formId);
    }

    if (params.eventId && params.eventId !== 'all') {
      submissions = submissions.filter((s) => s.eventId === params.eventId);
    }

    if (params.status && params.status !== 'all') {
      submissions = submissions.filter((s) => s.paymentStatus === params.status);
    }

    if (params.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      submissions = submissions.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.lastName && s.lastName.toLowerCase().includes(q)) ||
          s.email.toLowerCase().includes(q) ||
          s.phone.includes(q) ||
          (s.churchName && s.churchName.toLowerCase().includes(q)) ||
          s.eventTitle.toLowerCase().includes(q),
      );
    }

    return submissions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getSubmissionById(id: string): FormSubmission | null {
    const state = adminDb.getState();
    return (state.submissions || []).find((s) => s.id === id) || null;
  },

  createSubmission(data: Omit<FormSubmission, 'id' | 'createdAt'>): FormSubmission {
    const now = new Date().toISOString();
    const newSubmission: FormSubmission = {
      ...data,
      id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: now,
    };

    // Save submission
    adminDb.update('submissions', (prev) => [newSubmission, ...(prev || [])]);

    // Increment form stats & record sync
    adminDb.update('forms', (prev) =>
      (prev || []).map((f) => {
        if (f.id === data.formId) {
          return {
            ...f,
            submissionsCount: (f.submissionsCount || 0) + 1,
            totalCollected: (f.totalCollected || 0) + (data.totalAmount || 0),
            excelLastSyncedAt: f.excelWebhookUrl ? now : f.excelLastSyncedAt,
            updatedAt: now,
          };
        }
        return f;
      }),
    );

    // Auto-sync with connected Excel / Google Sheets Webhook if configured
    const targetForm = this.getFormById(data.formId);
    if (targetForm?.excelWebhookUrl && targetForm.excelAutoSync !== false) {
      this.syncSubmissionToExcel(targetForm.excelWebhookUrl, newSubmission, targetForm).catch((err) => {
        console.warn('Excel auto-sync notification error:', err);
      });
    }

    return newSubmission;
  },

  /**
   * Dispatches a submission row to a connected Excel / Google Sheet / Webhook endpoint
   */
  async syncSubmissionToExcel(
    webhookUrl: string,
    submission: FormSubmission,
    form?: EventRegistrationForm | null,
  ): Promise<{ success: boolean; message?: string }> {
    if (!webhookUrl || !webhookUrl.trim().startsWith('http')) {
      return { success: false, message: 'Invalid Webhook URL provided.' };
    }

    try {
      const payload = {
        event: 'form_submission',
        timestamp: submission.createdAt,
        formId: submission.formId,
        formTitle: form?.title || 'Payment Details',
        eventId: submission.eventId,
        eventTitle: submission.eventTitle,
        registrationId: submission.id,

        // Official columns matching your exact sheet headers
        payment_page_id: submission.formId,
        payment_page_title: submission.eventTitle || form?.title || 'Payment Details',
        payment_date: submission.createdAt,
        order_id: submission.id,
        item_name: submission.eventTitle || 'Conference Registration',
        item_amount: submission.unitAmount,
        item_quantity: submission.quantity,
        item_payment_amount: submission.ticketTotal || (submission.unitAmount * submission.quantity),
        total_payment_amount: submission.totalAmount,
        currency: submission.currency || 'INR',
        payment_status: submission.paymentStatus || 'paid',
        payment_id: submission.transactionId || '',
        name: submission.name,
        last_name: submission.lastName || '',
        full_name: `${submission.name} ${submission.lastName || ''}`.trim(),
        email: submission.email,
        phone: submission.phone,
        gender: submission.gender || '',
        age: submission.age || '',
        address: submission.address || '',
        city: submission.city || '',
        pincode: submission.pincode || '',
        state: submission.state || '',
        church_name: submission.churchName || '',
        role_in_the_church: submission.churchRole || '',
        how_did_you_hear_about_the_conference: submission.howHeard || '',
        have_you_attended_an_eic_conference_before: submission.attendedBefore || '',

        // Additional compatibility aliases
        fullName: `${submission.name} ${submission.lastName || ''}`.trim(),
        lastName: submission.lastName || '',
        churchName: submission.churchName || '',
        churchRole: submission.churchRole || '',
        howHeard: submission.howHeard || '',
        attendedBefore: submission.attendedBefore || '',
        quantity: submission.quantity,
        unitAmount: submission.unitAmount,
        ticketTotal: submission.ticketTotal,
        donationAmount: submission.donationAmount || 0,
        totalAmount: submission.totalAmount,
        paymentStatus: submission.paymentStatus,
        paymentMethod: submission.paymentMethod || 'Online',
        transactionId: submission.transactionId || '',
        customResponses: submission.customResponses || {},
      };

      // Proxy through backend endpoint to handle Google Apps Script 302 redirects and avoid CORS issues,
      // with graceful fallback to direct fetch.
      try {
        const proxyRes = await fetch('/api/forms/sync-sheet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            webhookUrl: webhookUrl.trim(),
            payload,
          }),
        });

        if (proxyRes.ok) {
          const proxyData = await proxyRes.json().catch(() => ({}));
          return { success: true, message: proxyData.message || 'Successfully synced with spreadsheet!' };
        }
      } catch (proxyErr) {
        console.warn('Backend proxy sync failed, falling back to direct browser fetch:', proxyErr);
      }

      // Fallback: direct fetch with no-cors
      await fetch(webhookUrl.trim(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/plain, */*',
        },
        mode: 'no-cors',
        body: JSON.stringify(payload),
      });

      return { success: true, message: 'Dispatched to Google Sheet!' };
    } catch (err: any) {
      console.error('Failed to trigger Excel webhook:', err);
      return { success: false, message: err.message || 'Failed to trigger Excel webhook.' };
    }
  },

  updateSubmissionStatus(id: string, paymentStatus: 'paid' | 'pending' | 'failed'): FormSubmission | null {
    const existing = this.getSubmissionById(id);
    if (!existing) return null;

    const updated: FormSubmission = {
      ...existing,
      paymentStatus,
    };

    adminDb.update('submissions', (prev) => (prev || []).map((s) => (s.id === id ? updated : s)));
    return updated;
  },

  deleteSubmission(id: string): boolean {
    const existing = this.getSubmissionById(id);
    if (!existing) return false;

    adminDb.update('submissions', (prev) => (prev || []).filter((s) => s.id !== id));
    return true;
  },

  getStats() {
    const state = adminDb.getState();
    const forms = state.forms || [];
    const submissions = state.submissions || [];

    const totalForms = forms.length;
    const activeForms = forms.filter((f) => f.status === 'active').length;
    const totalSubmissions = submissions.length;
    const totalRevenue = submissions.reduce((sum, s) => sum + (s.totalAmount || 0), 0);

    return {
      totalForms,
      activeForms,
      totalSubmissions,
      totalRevenue,
    };
  },
};
