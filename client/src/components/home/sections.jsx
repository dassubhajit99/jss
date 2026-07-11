import { Link } from "react-router-dom";
import { Container, Section, SectionTitle, Card, Button } from "../ui/index.jsx";

const highlights = [
  { title: "Durga Puja", to: "/durga-puja", img: "/assets/puja09.jpg", desc: "Grand themed pandals drawing lakhs of visitors each year." },
  { title: "Sports", to: "/sports", img: "/gallery/cricket1-big.jpg", desc: "Cricket, table tennis and dance for the youth of our area." },
  { title: "Social Work", to: "/social", img: "/assets/plantation.jpg", desc: "Plantation drives and awareness for a greener community." },
  { title: "Health Camps", to: "/health", img: "/gallery/health1-big.jpg", desc: "Free eye testing, blood donation and patient support." },
];

export function HighlightCards() {
  return (
    <Section>
      <Container>
        <SectionTitle eyebrow="What we do" title="Culture, sport & service" subtitle="Four decades of working for the people of Champasari, Siliguri." />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((h) => (
            <Link key={h.to} to={h.to}>
              <Card className="h-full overflow-hidden transition hover:-translate-y-1 hover:shadow-lg">
                <div className="aspect-[4/3] overflow-hidden bg-cream-200">
                  <img src={h.img} alt={h.title} loading="lazy" className="h-full w-full object-cover" />
                </div>
                <div className="p-5">
                  <h3 className="font-display text-xl font-semibold text-maroon">{h.title}</h3>
                  <p className="mt-2 text-sm text-ink-700">{h.desc}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export function StatsStrip({ stats = [] }) {
  if (!stats.length) return null;
  return (
    <section className="bg-maroon text-cream">
      <Container className="grid grid-cols-2 gap-6 py-10 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <div className="font-display text-3xl font-bold text-gold-300 md:text-4xl">{s.value}</div>
            <div className="mt-1 text-sm text-cream/80">{s.label}</div>
          </div>
        ))}
      </Container>
    </section>
  );
}

export function IntroBlurb() {
  return (
    <Section className="bg-cream">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <SectionTitle align="center" eyebrow="Since 1983" title="A club born from community" />
          <p className="mt-6 text-lg leading-relaxed text-ink-700">
            Founded one evening in 1983 by the youth of Champasari, Jatiya Shakti Sangha O Pathagar has grown
            from a small plot on the Champasari Main Road into a double-storied home for culture, sport and
            social service — striving to keep our neighbourhood green, healthy and united.
          </p>
          <div className="mt-6">
            <Button to="/about" variant="outline">Read our story</Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}

export function CtaBanner() {
  return (
    <Section>
      <Container>
        <div className="overflow-hidden rounded-2xl bg-maroon-900 px-6 py-12 text-center text-cream md:px-12">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Be part of our community</h2>
          <p className="mx-auto mt-3 max-w-xl text-cream/85">
            Join Jatiya Shakti Sangha and help us keep Champasari green, healthy and united through culture, sport and service.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button to="/members" variant="cta">Become a member</Button>
            <Button to="/contact" variant="outline" className="border-cream text-cream hover:bg-cream hover:text-maroon">
              Get in touch
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
