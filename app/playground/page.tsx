import type { Metadata } from "next";
import { DFloor } from "@/components/dfooter";
import { ShotsWall } from "@/components/shots-wall";
import { WayBack } from "@/components/way-back";
import { dossier } from "@/data/dossier";

export const metadata: Metadata = {
 title: "Playground",
 description: "Design playground and interface studies by Damilare Osofisan — Glint, Vienna, Mederva and more.",
};

/**
 * The home page's four animated covers, shown here as plates of their own.
 * Each caption reads as a project line ("sylvan — cover."), so the wall's
 * ordering treats a cover as one more study of the project it belongs to
 * rather than as a separate category.
 */
const covers = dossier.workCovers.map((c) => ({
  src: c.img,
  alt: c.alt,
  caption: `${c.title.toLowerCase()} \u2014 cover.`,
  fit: c.fit,
  width: c.width,
  height: c.height,
}));

export default function ShotsPage() {
 return (
 <main className="bg-bg text-ink">
 <WayBack />
 <div id="top" className="mx-auto w-full max-w-[1240px] scroll-mt-20 px-5 pb-10 min-[1800px]:max-w-[1600px] min-[2200px]:max-w-[1800px]">
 <h1 className="sr-only">Playground</h1>
 <ShotsWall shots={[...covers, ...dossier.shots]} />
 </div>

 <div className="mx-auto w-full max-w-[600px] scroll-mt-20 px-5 pb-10">
 <DFloor />
 </div>
 </main>
 );
}
