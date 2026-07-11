import { ContentPage } from "../components/ContentPage.jsx";
import { Card, Button } from "../components/ui/index.jsx";

export default function MembersPage() {
  return (
    <ContentPage
      slug="members"
      extra={
        <Card className="flex flex-col items-start gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-display text-xl font-semibold text-ink">Membership Form</h3>
            <p className="mt-1 text-sm text-ink-700">
              Download, fill in, and submit the form at the club house.
            </p>
          </div>
          <Button href="/membership-form.pdf" target="_blank" rel="noopener" variant="cta">
            Download form (PDF)
          </Button>
        </Card>
      }
    />
  );
}
