import { useFetch } from "../hooks/useFetch.js";
import { Seo } from "../lib/seo.jsx";
import { PageHeader } from "../components/PageHeader.jsx";
import { Container, Section, Card, Spinner, ErrorState, EmptyState } from "../components/ui/index.jsx";

export default function CommitteePage() {
  const { data: members, loading, error } = useFetch("/committee");

  return (
    <>
      <Seo title="Governing Body" description="The governing body and executive committee of Jatiya Shakti Sangha." />
      <PageHeader title="Governing Body" subtitle="The people who lead and serve the club." />
      <Section>
        <Container>
          {loading && <Spinner />}
          {error && <ErrorState error={error} />}
          {members && members.length === 0 && <EmptyState />}
          {members && members.length > 0 && (
            <>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {members
                  .filter((m) => !m.isExecutive)
                  .map((m) => (
                    <Card key={m._id} className="p-5">
                      <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">{m.role}</p>
                      <p className="mt-1 font-display text-xl font-semibold text-ink">{m.name}</p>
                    </Card>
                  ))}
              </div>

              <h2 className="mt-12 font-display text-2xl font-bold text-maroon">Executive Committee</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {members
                  .filter((m) => m.isExecutive)
                  .map((m) => (
                    <div key={m._id} className="rounded-xl border border-cream-200 bg-white px-4 py-3 text-ink">
                      {m.name}
                    </div>
                  ))}
              </div>
            </>
          )}
        </Container>
      </Section>
    </>
  );
}
