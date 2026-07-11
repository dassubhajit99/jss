import { useFetch } from "../hooks/useFetch.js";
import { Seo } from "../lib/seo.jsx";
import { PageHeader } from "./PageHeader.jsx";
import { Container, Section, Spinner, ErrorState, EmptyState } from "./ui/index.jsx";

// Fetches a Page by slug and renders header + prose body. `extra` renders
// below the prose (e.g. donation details, forms, download buttons).
export function ContentPage({ slug, extra = null }) {
  const { data: page, loading, error } = useFetch(`/pages/${slug}`);

  if (loading) return <Spinner />;
  if (error)
    return (
      <Section>
        <Container>
          <ErrorState error={error} />
        </Container>
      </Section>
    );

  if (!page)
    return (
      <Section>
        <Container>
          <EmptyState title="Content coming soon" />
        </Container>
      </Section>
    );

  return (
    <>
      <Seo title={page.seo?.title || page.title} description={page.seo?.description} image={page.heroImage} />
      <PageHeader title={page.title} subtitle={page.subtitle} image={page.heroImage} />
      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)]">
            {page.bodyHtml && (
              <article
                className="prose max-w-none prose-headings:font-display prose-headings:text-ink prose-a:text-maroon prose-strong:text-ink"
                dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
              />
            )}
            {extra}
          </div>
        </Container>
      </Section>
    </>
  );
}
