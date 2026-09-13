import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Care Guide — Love Soft Life",
  description: "How to wash, store, and keep the pieces you love — made to be kept, not replaced.",
};

const sections = [
  {
    title: "Wash less, wash cold",
    body: "Natural fibers recover best when they are rested, not scrubbed. Air pieces flat after wear and wash only when needed — always cold, on a gentle cycle, with like colors.",
  },
  {
    title: "Cashmere & wool",
    body: "Hand wash in cool water with a pH-neutral soap, or use a mesh bag on the delicate cycle. Never wring — press water out flat between towels and dry away from direct heat. Remove pills with a cashmere comb, never a razor.",
  },
  {
    title: "Linen",
    body: "Machine wash cool and line dry while damp for that lived-in softness. Wrinkles are part of the material's honesty — if you prefer them pressed, iron on medium while slightly damp.",
  },
  {
    title: "Silk",
    body: "Hand wash cold with a drop of gentle soap, or dry clean. Keep out of direct sun while drying, and press on low heat from the reverse side.",
  },
  {
    title: "Velvet & cushions",
    body: "Vacuum with a soft brush attachment rather than rubbing. Spot clean with a damp cloth and mild soap, blotting — never soaking. Rotate cushions regularly to keep the pile even.",
  },
  {
    title: "Storage",
    body: "Fold knits — hanging stretches them. Keep pieces in breathable cotton, not plastic, with cedar or lavender nearby. Give wool a rest of 24 hours between wears.",
  },
];

export default function CareGuidePage() {
  return (
    <div className="mx-auto px-6 py-16 sm:py-20" style={{ maxWidth: 720 }}>
      <p className="eyebrow text-gold-deep">The Ritual</p>
      <h1 className="mt-4 text-[40px] leading-[1.06] text-ink sm:text-[52px]">
        Care <span className="italic">guide</span>
      </h1>
      <p className="mt-6 max-w-lg text-[16px] leading-relaxed text-ink-muted-48">
        Every piece is made to be kept. A few quiet habits will carry yours
        through years — and let it soften, rather than wear out.
      </p>

      <dl className="mt-12 space-y-10">
        {sections.map((s) => (
          <div key={s.title}>
            <dt className="text-[17px] font-semibold text-ink">{s.title}</dt>
            <dd className="mt-2 text-[16px] leading-relaxed text-ink-muted-80">{s.body}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
