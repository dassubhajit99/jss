import { useParams, Link } from "react-router-dom";
import { useFetch } from "../hooks/useFetch.js";
import { Seo } from "../lib/seo.jsx";
import { PageHeader } from "../components/PageHeader.jsx";
import { Container, Section, Spinner, ErrorState } from "../components/ui/index.jsx";
import { ImageGrid } from "../components/gallery/ImageGrid.jsx";

export default function AlbumPage() {
  const { slug } = useParams();
  const { data: album, loading, error } = useFetch(`/gallery/${slug}`);

  return (
    <>
      <Seo title={album?.title || "Gallery"} />
      <PageHeader title={album?.title || "Album"} subtitle={album?.year ? `${album.year}` : ""} />
      <Section>
        <Container>
          <Link to={`/gallery?category=${album?.category || "durgapuja"}`} className="mb-6 inline-block text-sm text-maroon hover:underline">
            ← Back to gallery
          </Link>
          {loading && <Spinner />}
          {error && <ErrorState error={error} />}
          {album && <ImageGrid images={album.images || []} />}
        </Container>
      </Section>
    </>
  );
}
