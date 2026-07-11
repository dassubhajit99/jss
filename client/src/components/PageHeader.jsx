import { Container } from "./ui/index.jsx";

export function PageHeader({ title, subtitle, image }) {
  return (
    <div className="relative overflow-hidden bg-maroon text-cream">
      {image && (
        <img
          src={image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-25"
          loading="eager"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-maroon-900/70 to-maroon/60" />
      <Container className="relative py-14 md:py-20">
        <h1 className="text-3xl font-bold md:text-5xl">{title}</h1>
        {subtitle && <p className="mt-3 max-w-2xl text-cream/90 md:text-lg">{subtitle}</p>}
        <div className="mt-5 h-1 w-20 bg-gold" />
      </Container>
    </div>
  );
}
