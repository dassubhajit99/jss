import { useState } from "react";
import { api } from "../../lib/api.js";
import { Button, Card } from "../ui/index.jsx";

const SUBJECTS = ["General Enquiry", "Membership Enquiry", "Event & Programme"];

const inputCls =
  "w-full rounded-xl border-cream-200 bg-white text-ink shadow-sm focus:border-maroon focus:ring-maroon";

export function EnquiryForm({ type = "general", title = "Send us a message", compact = false }) {
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    payload.type = type;
    try {
      await api("/enquiries", { method: "POST", body: JSON.stringify(payload) });
      setStatus("success");
      e.target.reset();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message);
    }
  }

  if (status === "success") {
    return (
      <Card className="p-8 text-center">
        <h3 className="font-display text-2xl font-bold text-maroon">Thank you!</h3>
        <p className="mt-2 text-ink-700">
          Your message has been received. We will get back to you soon.
        </p>
        <Button className="mt-5" onClick={() => setStatus("idle")}>
          Send another
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 md:p-8">
      <h3 className="font-display text-2xl font-bold text-ink">{title}</h3>
      <form className="mt-5 grid gap-4" onSubmit={onSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" name="name" required />
          <Field label="Email" name="email" type="email" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone" name="phone" />
          <Field label="City" name="city" />
        </div>
        {!compact && (
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="State" name="state" />
            <Field label="PIN / Zip" name="zip" />
            <Field label="Country" name="country" />
          </div>
        )}
        <label className="block">
          <span className="text-sm font-medium text-ink-700">Subject</span>
          <select name="subject" className={`mt-1 ${inputCls}`} defaultValue={SUBJECTS[0]}>
            {SUBJECTS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink-700">
            Message <span className="text-maroon">*</span>
          </span>
          <textarea name="message" rows={5} required className={`mt-1 ${inputCls}`} />
        </label>

        {status === "error" && (
          <p className="text-sm text-maroon">{errorMsg || "Something went wrong. Please try again."}</p>
        )}

        <div>
          <Button as="button" type="submit" disabled={status === "submitting"} className="disabled:opacity-60">
            {status === "submitting" ? "Sending…" : "Submit"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function Field({ label, name, type = "text", required }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink-700">
        {label} {required && <span className="text-maroon">*</span>}
      </span>
      <input type={type} name={name} required={required} className={`mt-1 ${inputCls}`} />
    </label>
  );
}
