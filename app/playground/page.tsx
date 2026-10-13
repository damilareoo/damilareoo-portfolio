import type { Metadata } from "next";
import { DFloor } from "@/components/dfooter";
import { ShotsWall } from "@/components/shots-wall";
import { WayBack } from "@/components/way-back";
import { dossier } from "@/data/dossier";

export const metadata: Metadata = {
 title: "Playground",
 description: "Design playground and interface studies by Damilare Osofisan — Glint, Vienna, Mederva and more.",
};

export default function ShotsPage() {
 return (
 <main className="bg-bg text-ink">
 <WayBack />
 <div id="top" className="mx-auto w-full max-w-[1240px] scroll-mt-20 px-5 pb-10">
 <h1 className="sr-only">Playground</h1>
 <ShotsWall shots={dossier.shots} />
 </div>

 <div className="mx-auto w-full max-w-[600px] scroll-mt-20 px-5 pb-10">
 <DFloor />
 </div>
 </main>
 );
}
