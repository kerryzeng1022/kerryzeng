import { dimensions } from "@/lib/questionnaire";
import { BadgeDollarSign, Brain, Clock3, Compass, HeartHandshake, MessagesSquare, ShieldCheck, Sparkles } from "lucide-react";

const icons = [BadgeDollarSign, Brain, Sparkles, MessagesSquare, ShieldCheck, HeartHandshake, Clock3, Compass];
const colors = ["bg-rose-100", "bg-orange-100", "bg-purple-100", "bg-blue-100", "bg-green-100", "bg-yellow-100"];

export function DimensionsSection() {
  return (
    <section id="报告示例" className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <h2 className="xhs-section-title text-center text-2xl md:text-3xl">
        14 大维度，全面挖掘你的职业天赋
      </h2>
      <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-7 md:gap-4">
        {dimensions.map((dimension, index) => {
          const Icon = icons[index % icons.length];
          return (
            <div
              key={dimension.id}
              className={`rounded-2xl ${colors[index % colors.length]} p-4 text-center shadow-sm md:p-4`}
            >
              <Icon className="mx-auto mb-2 text-rosepop" size={22} />
              <p className="text-sm font-black leading-5 md:text-sm md:leading-4">{dimension.name}</p>
            </div>
          );
        })}
      </div>
      <div className="mx-auto mt-5 w-fit rounded-full bg-rose-50 px-7 py-3 text-sm font-black text-neutral-700 md:hidden">
        查看全部 14 个维度 ↓
      </div>
    </section>
  );
}
