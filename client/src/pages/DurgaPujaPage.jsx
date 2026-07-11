import { useFetch } from "../hooks/useFetch.js";
import { Seo } from "../lib/seo.jsx";
import { PageHeader } from "../components/PageHeader.jsx";
import { Container, Section, Card, Badge, Spinner, ErrorState, EmptyState } from "../components/ui/index.jsx";

export default function DurgaPujaPage() {
  const { data: years, loading, error } = useFetch("/durga-puja");

  return (
    <>
      <Seo
        title="Durga Puja"
        description="Jatiya Shakti Sangha's celebrated themed Durga Puja — year by year, with themes and awards."
        image="/assets/puja09.jpg"
      />
      <PageHeader
        title="Durga Puja"
        subtitle="Since our Silver Jubilee in 2007, our themed Durga Puja has been witnessed by 8–9 lakh people from Siliguri and across North Bengal."
        image="/assets/puja09.jpg"
      />
      <Section>
        <Container>
          {loading && <Spinner />}
          {error && <ErrorState error={error} />}
          {years && years.length === 0 && <EmptyState />}
          <div className="space-y-8">
            {years?.map((y) => (
              <Card key={y.year} className="overflow-hidden">
                <div className="grid gap-0 md:grid-cols-3">
                  {y.coverImage && (
                    <div className="aspect-video overflow-hidden bg-cream-200 md:aspect-auto">
                      <img src={y.coverImage} alt={`Durga Puja ${y.year}`} loading="lazy" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div className={`p-6 ${y.coverImage ? "md:col-span-2" : "md:col-span-3"}`}>
                    <div className="flex items-center gap-3">
                      <span className="font-display text-3xl font-bold text-maroon">{y.year}</span>
                      {y.theme && <Badge>{y.theme}</Badge>}
                    </div>
                    {y.description && <p className="mt-3 text-ink-700">{y.description}</p>}
                    {y.awards?.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold uppercase tracking-wide text-gold-600">Achievements</h4>
                        <ul className="mt-2 grid gap-1.5 text-sm text-ink-700 sm:grid-cols-2">
                          {y.awards.map((a, i) => (
                            <li key={i} className="flex gap-2">
                              <span className="text-gold">★</span>
                              <span>{a}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
