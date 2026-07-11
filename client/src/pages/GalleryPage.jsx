import { useSearchParams } from "react-router-dom";
import { useFetch } from "../hooks/useFetch.js";
import { Seo } from "../lib/seo.jsx";
import { PageHeader } from "../components/PageHeader.jsx";
import { Container, Section, Spinner, ErrorState, EmptyState } from "../components/ui/index.jsx";
import { AlbumCard } from "../components/gallery/AlbumCard.jsx";

const TABS = [
  { key: "durgapuja", label: "Durga Puja" },
  { key: "activities", label: "Activities" },
];

export default function GalleryPage() {
  const [params, setParams] = useSearchParams();
  const category = params.get("category") || "durgapuja";
  const { data: albums, loading, error } = useFetch(`/gallery?category=${category}`);

  return (
    <>
      <Seo title="Photo Gallery" description="Photos from Durga Puja, sports, cultural programmes and social work." />
      <PageHeader title="Photo Gallery" subtitle="Moments from our festivals, programmes and community work." />
      <Section>
        <Container>
          <div className="mb-8 inline-flex rounded-xl border border-cream-200 bg-white p-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setParams({ category: t.key })}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  category === t.key ? "bg-maroon text-white" : "text-ink-700 hover:text-maroon"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {loading && <Spinner />}
          {error && <ErrorState error={error} />}
          {albums && albums.length === 0 && <EmptyState title="No albums yet" />}
          {albums && albums.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {albums.map((a) => (
                <AlbumCard key={a.slug} album={a} />
              ))}
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
