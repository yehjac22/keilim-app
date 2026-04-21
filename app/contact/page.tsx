const FORM_ACTION = "https://formsubmit.co/yehudahyjacobs@gmail.com";

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string }>;
}) {
  const parsedSearchParams = await searchParams;
  const submitted = parsedSearchParams.submitted === "true";

  return (
    <section className="mx-auto w-full max-w-2xl py-4 sm:py-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Contact Us</h1>
        <p className="mt-2 text-slate-600">
          Have a question, suggestion, or want to contribute?
          <br />
          We would love to hear from you.
        </p>

        {submitted ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Your message was sent successfully.
          </div>
        ) : null}

        <form action={FORM_ACTION} method="POST" className="mt-5 space-y-4">
          <input type="hidden" name="_subject" value="New Contact Form Submission - Niggun Sheet" />
          <input type="hidden" name="_captcha" value="true" />
          <input type="hidden" name="_next" value="/contact?submitted=true" />

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Name</label>
            <input
              type="text"
              name="name"
              required
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-300 transition focus:ring"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Email</label>
            <input
              type="email"
              name="email"
              required
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-300 transition focus:ring"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Subject</label>
            <select
              name="subject"
              required
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-300 transition focus:ring"
              defaultValue=""
            >
              <option value="" disabled>
                Select a subject...
              </option>
              <option value="suggestion">Song Suggestion</option>
              <option value="correction">Correction/Typo</option>
              <option value="feedback">General Feedback</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Message</label>
            <textarea
              name="message"
              required
              className="min-h-32 w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-300 transition focus:ring"
              placeholder="Tell us what's on your mind..."
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
}