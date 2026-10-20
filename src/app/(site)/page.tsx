import { Hero } from "@/components/home/hero";
import { StatsBar } from "@/components/home/stats-bar";
import { Intro } from "@/components/home/intro";
import { Marquee } from "@/components/home/marquee";
import { Institutions } from "@/components/home/institutions";
import { GalleryTeaser } from "@/components/home/gallery-teaser";
import { MissionVision } from "@/components/mission-vision";
import { getContent } from "@/content";
import { siteView } from "@/content/view";

export default async function HomePage() {
  const { site, home, institutions } = await getContent();

  return (
    <>
      <Hero hero={home.hero} shortName={site.shortName} />
      <StatsBar stats={home.stats} />
      <Intro text={home.about.text} site={siteView(site)} />
      <MissionVision
        items={[
          { key: "mission", title: "Mission", paragraphs: [home.missionVision.mission] },
          { key: "vision", title: "Vision", paragraphs: [home.missionVision.vision] },
        ]}
      />
      <Marquee names={institutions.map((i) => i.name)} />
      <Institutions institutions={institutions} />
      <GalleryTeaser photos={home.campusLife} />
    </>
  );
}
