import { ContentPage } from "../components/ContentPage.jsx";

// Thin wrappers around the shared ContentPage renderer (fetch Page by slug).
export const AboutPage = () => <ContentPage slug="about" />;
export const ProfilePage = () => <ContentPage slug="profile" />;
export const SportsPage = () => <ContentPage slug="sports" />;
export const SocialPage = () => <ContentPage slug="social" />;
export const HealthPage = () => <ContentPage slug="health" />;
export const LibraryPage = () => <ContentPage slug="library" />;
export const FuturePlanPage = () => <ContentPage slug="future-plan" />;
export const PressPage = () => <ContentPage slug="press" />;
