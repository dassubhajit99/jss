import { ContentPage } from "../components/ContentPage.jsx";
import { EnquiryForm } from "../components/forms/EnquiryForm.jsx";

export default function ContactPage() {
  return <ContentPage slug="contact" extra={<EnquiryForm type="general" title="Enquiry form" />} />;
}
