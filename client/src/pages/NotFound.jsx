import { Seo } from "../lib/seo.jsx";
import { Container, Section, Button } from "../components/ui/index.jsx";

export default function NotFound() {
  return (
    <>
      <Seo title="Page not found" />
      <Section>
        <Container className="text-center">
          <p className="font-display text-6xl font-bold text-maroon">404</p>
          <h1 className="mt-4 text-2xl font-bold text-ink">Page not found</h1>
          <p className="mt-2 text-ink-700">The page you are looking for doesn’t exist or has moved.</p>
          <Button to="/" className="mt-6">Back to home</Button>
        </Container>
      </Section>
    </>
  );
}
