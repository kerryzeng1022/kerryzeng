import type { CareerReport } from "@/lib/types";

export function Timeline90Days({ plan }: { plan: CareerReport["ninetyDayActionPlan"] }) {
  const months = [
    ["第 1 个月", plan.month1],
    ["第 2 个月", plan.month2],
    ["第 3 个月", plan.month3]
  ];

  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-soft md:p-7">
      <h2 className="text-2xl font-black">90 天行动计划</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {months.map(([title, content], index) => (
          <div key={title} className="rounded-3xl bg-rose-50 p-5">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-rosepop font-black text-white">
              {index + 1}
            </span>
            <h3 className="mt-4 font-black">{title}</h3>
            <p className="mt-3 text-sm leading-7 text-neutral-700">{content}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-3xl bg-butter/70 p-5">
        <h3 className="font-black">每周固定动作</h3>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {plan.weeklyActions.map((action, index) => (
            <div key={action} className="rounded-3xl bg-white px-4 py-3">
              <p className="text-sm font-black">{action}</p>
              {plan.weeklyDetails?.[index] ? (
                <p className="mt-1 text-xs leading-5 text-neutral-600">{plan.weeklyDetails[index]}</p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
