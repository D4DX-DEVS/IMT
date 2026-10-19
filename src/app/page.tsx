import { Hero } from "@/components/home/hero";
import { StatsBar } from "@/components/home/stats-bar";
import { Intro } from "@/components/home/intro";
import { Marquee } from "@/components/home/marquee";
import { Institutions } from "@/components/home/institutions";
import { GalleryTeaser } from "@/components/home/gallery-teaser";
import { MissionVision } from "@/components/mission-vision";

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsBar />
      <Intro />
      <MissionVision />
      <Marquee />
      <Institutions />
      <GalleryTeaser />
    </>
  );
}
