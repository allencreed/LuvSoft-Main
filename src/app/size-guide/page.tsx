import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Size Guide — Love Soft Life",
  description: "Measurements and fit guidance for Love Soft Life apparel and essentials.",
};

const apparelRows = [
  { size: "XS", chest: "32–34\"", waist: "24–26\"", hip: "34–36\"" },
  { size: "S", chest: "35–37\"", waist: "27–29\"", hip: "37–39\"" },
  { size: "M", chest: "38–40\"", waist: "30–32\"", hip: "40–42\"" },
  { size: "L", chest: "41–43\"", waist: "33–35\"", hip: "43–45\"" },
  { size: "XL", chest: "44–46\"", waist: "36–38\"", hip: "46–48\"" },
];

const homeRows = [
  { item: "Throw Blanket", dims: "50\" × 70\"", note: "Covers a two-seat sofa with drape" },
  { item: "Bed Throw", dims: "54\" × 72\"", note: "Fits queen beds as a layering piece" },
  { item: "Cushion Cover", dims: "20\" × 20\"", note: "Insert sold separately — order 22\" for fullness" },
  { item: "Robe", dims: "XS–XL", note: "One length; belted waist adapts to frame" },
];

export default function SizeGuidePage() {
  return (
    <div className="mx-auto px-6 py-16 sm:py-20" style={{ maxWidth: 820 }}>
      <p className="eyebrow text-gold-deep">The Fit</p>
      <h1 className="mt-4 text-[40px] leading-[1.06] text-ink sm:text-[52px]">
        Size <span className="italic">guide</span>
      </h1>
      <p className="mt-6 max-w-lg text-[16px] leading-relaxed text-ink-muted-48">
        Our apparel cuts are relaxed by design. If you are between sizes and prefer a
        closer fit, take the smaller size — for a softer drape, the larger.
      </p>

      <h2 className="mt-14 text-[13px] font-semibold uppercase tracking-[0.2em] text-ink">
        Apparel — body measurements (inches)
      </h2>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse text-left">
          <thead>
            <tr className="border-b border-ink/20 text-[11px] uppercase tracking-[0.18em] text-ink-muted-48">
              <th className="py-3 pr-4 font-medium">Size</th>
              <th className="py-3 pr-4 font-medium">Chest</th>
              <th className="py-3 pr-4 font-medium">Waist</th>
              <th className="py-3 font-medium">Hip</th>
            </tr>
          </thead>
          <tbody>
            {apparelRows.map((r) => (
              <tr key={r.size} className="border-b border-hairline text-[15px] text-ink">
                <td className="py-3.5 pr-4 font-medium">{r.size}</td>
                <td className="py-3.5 pr-4">{r.chest}</td>
                <td className="py-3.5 pr-4">{r.waist}</td>
                <td className="py-3.5">{r.hip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-14 text-[13px] font-semibold uppercase tracking-[0.2em] text-ink">
        Home goods
      </h2>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse text-left">
          <thead>
            <tr className="border-b border-ink/20 text-[11px] uppercase tracking-[0.18em] text-ink-muted-48">
              <th className="py-3 pr-4 font-medium">Piece</th>
              <th className="py-3 pr-4 font-medium">Dimensions</th>
              <th className="py-3 font-medium">Notes</th>
            </tr>
          </thead>
          <tbody>
            {homeRows.map((r) => (
              <tr key={r.item} className="border-b border-hairline text-[15px] text-ink">
                <td className="py-3.5 pr-4 font-medium">{r.item}</td>
                <td className="py-3.5 pr-4">{r.dims}</td>
                <td className="py-3.5 text-ink-muted-80">{r.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-12 text-[15px] text-ink-muted-48">
        Still unsure? Write to us at{" "}
        <a href="mailto:support@lovesoftlife.com" className="text-primary hover:underline">
          support@lovesoftlife.com
        </a>{" "}
        — or see our{" "}
        <Link href="/returns" className="text-primary hover:underline">
          exchange policy
        </Link>
        .
      </p>
    </div>
  );
}
