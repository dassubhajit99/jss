import { Helmet } from "react-helmet-async";

const SITE = "Siliguri Jatiya Shakti Sangha";

export function Seo({ title, description, image }) {
  const fullTitle = title ? `${title} · ${SITE}` : SITE;
  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      {image && <meta property="og:image" content={image} />}
      <meta property="og:type" content="website" />
    </Helmet>
  );
}
