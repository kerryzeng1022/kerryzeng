import Link from "next/link";

export function StickyMobileCTA() {
  return (
    <div className="safe-bottom fixed inset-x-0 bottom-0 z-50 border-t border-rose-100 bg-white/90 px-4 pt-3 backdrop-blur md:hidden">
      <Link
        href="/questionnaire"
        className="xhs-cta block rounded-full px-5 py-4 text-center font-black text-white"
      >
        开始测一测 →
      </Link>
    </div>
  );
}
