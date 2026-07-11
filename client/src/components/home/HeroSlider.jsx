import { useEffect, useState } from "react";
import { Button, Container } from "../ui/index.jsx";

export function HeroSlider({ slides = [] }) {
  const [i, setI] = useState(0);
  const count = slides.length;

  useEffect(() => {
    if (count <= 1) return;
    const t = setInterval(() => setI((n) => (n + 1) % count), 6000);
    return () => clearInterval(t);
  }, [count]);

  if (!count) return null;

  return (
    <section className="relative h-[70vh] min-h-[420px] w-full overflow-hidden bg-maroon-900">
      {slides.map((s, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ${idx === i ? "opacity-100" : "opacity-0"}`}
          aria-hidden={idx !== i}
        >
          <img src={s.image} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-maroon-900/90 via-maroon-900/40 to-maroon-900/20" />
        </div>
      ))}

      <Container className="relative flex h-full flex-col justify-end pb-16 md:justify-center md:pb-0">
        <div className="max-w-2xl text-cream">
          <h1 className="text-4xl font-bold leading-tight drop-shadow md:text-6xl">
            {slides[i].headline}
          </h1>
          {slides[i].subtext && (
            <p className="mt-4 max-w-xl text-lg text-cream/90 drop-shadow">{slides[i].subtext}</p>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            {slides[i].ctaHref && (
              <Button to={slides[i].ctaHref} variant="cta">
                {slides[i].ctaLabel || "Learn more"}
              </Button>
            )}
          </div>
        </div>
      </Container>

      {count > 1 && (
        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2.5 rounded-full transition-all ${idx === i ? "w-6 bg-gold" : "w-2.5 bg-cream/50"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
