import { Seo } from "../lib/seo.jsx";
import { useSettings } from "../lib/SettingsContext.jsx";
import { HeroSlider } from "../components/home/HeroSlider.jsx";
import { IntroBlurb, HighlightCards, StatsStrip, CtaBanner } from "../components/home/sections.jsx";

export default function Home() {
  const s = useSettings();
  return (
    <>
      <Seo
        title=""
        description="Jatiya Shakti Sangha O Pathagar — a community and cultural club in Champasari, Siliguri, serving since 1983."
        image="/assets/puja09.jpg"
      />
      <HeroSlider slides={s.hero?.slides || []} />
      <IntroBlurb />
      <StatsStrip stats={s.stats || []} />
      <HighlightCards />
      <CtaBanner />
    </>
  );
}
