import Image from "next/image";

const painPoints = [
  ["不知道\n自己适合什么", "选专业，选工作\n总在纠结迷茫", "🥺"],
  ["工作越久\n越没动力", "每天都在消耗\n看不到未来", "🔋"],
  ["想转行\n却不敢开始", "担心不适合，没经验\n怕从头再来", "😰"],
  ["优势看不清\n方向很模糊", "擅长什么？能做什么？\n一直没答案", "☁️"],
  ["内耗严重\n信心不足", "反复否定自己\n觉得自己不行", "💔"]
];

export function PainPointsSection() {
  return (
    <section id="测评介绍" className="mx-auto max-w-6xl px-4 py-11 md:px-8">
      <h2 className="xhs-section-title text-center text-2xl md:text-3xl">
        戳中你的那些职业焦虑 ♡
      </h2>
      <div className="relative mt-7">
        <Image
          src="/images/anxiety-stickers.png"
          alt="职业焦虑贴纸"
          width={1600}
          height={960}
          className="pointer-events-none absolute -top-14 left-1/2 hidden w-[520px] -translate-x-1/2 opacity-20 md:block"
        />
        <div className="relative grid gap-3 md:grid-cols-5">
        {painPoints.map(([title, desc, emoji]) => (
          <article
            key={title}
            className="rounded-[1.15rem] border border-rose-50 bg-rose-50/70 p-5 text-center shadow-[0_12px_35px_rgba(255,75,106,0.08)]"
          >
            <h3 className="whitespace-pre-line text-base font-black leading-6">{title}</h3>
            <div className="mx-auto my-4 grid h-14 w-14 place-items-center rounded-2xl bg-white text-3xl shadow-sm">
              {emoji}
            </div>
            <p className="whitespace-pre-line text-xs font-semibold leading-5 text-neutral-600">{desc}</p>
          </article>
        ))}
        </div>
      </div>
    </section>
  );
}
