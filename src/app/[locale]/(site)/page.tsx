import { Hero } from "@/components/sections/home/Hero";
import { HomePageSections } from "@/components/sections/home/HomePageSections";

export default function HomePage() {
  return (
    <>
      <div className="relative bg-surface-bg">
        <Hero />
      </div>
      <HomePageSections />
    </>
  );
}
