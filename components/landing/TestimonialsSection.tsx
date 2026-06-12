const comments = [
  "本来只是随便测测，看到能量消耗点那段真的有被说中。",
  "报告不是那种玄学夸夸，里面的职业方向和 90 天计划很具体。",
  "我终于明白为什么自己在上一份工作那么累，不是我不行，是环境不适配。"
];

export function TestimonialsSection() {
  return (
    <section id="用户评价" className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-9">
      <h2 className="xhs-section-title text-center text-2xl md:text-3xl">
        他们说：测完真的豁然开朗！ ✨
      </h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {comments.map((comment, index) => (
          <article key={comment} className="rounded-[1.35rem] border border-rose-50 bg-white p-5 shadow-[0_12px_35px_rgba(255,75,106,0.08)]">
            <p className="text-sm leading-7 text-neutral-700">“{comment}”</p>
            <div className="mt-4 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-lilac font-black text-rosepop">
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-black">小红书用户</p>
                <p className="text-xs text-neutral-500">已完成完整报告</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
