"use client";

import { ProgressBar } from "@/components/questionnaire/ProgressBar";
import {
  QUESTIONNAIRE_SAMPLE_SIZE,
  getResponseScale,
  selectQuestionSet
} from "@/lib/questionnaire";
import {
  careerCalibrationQuestions,
  careerCalibrationScale
} from "@/lib/career/calibration";
import type { AnswerMap, BasicInfo, Question } from "@/lib/types";
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const defaultBasicInfo: BasicInfo = {
  nickname: "",
  ageRange: "",
  status: "",
  occupation: "",
  professionalBackground: "",
  yearsExperience: "",
  credentials: "",
  city: "",
  education: "",
  biggestConfusion: "",
  incomeGoal: ""
};

const fields: Array<{
  key: keyof BasicInfo;
  label: string;
  placeholder: string;
  options?: string[];
}> = [
  { key: "nickname", label: "昵称", placeholder: "比如：小林" },
  { key: "ageRange", label: "年龄段", placeholder: "请选择", options: ["18-22", "23-27", "28-35", "36-45", "45+"] },
  { key: "status", label: "当前状态", placeholder: "请选择", options: ["学生", "在职", "待业/休息中", "准备转行", "自由职业"] },
  { key: "occupation", label: "当前职业或专业", placeholder: "比如：运营 / 计算机 / 财务" },
  { key: "professionalBackground", label: "专业或培训背景（选填）", placeholder: "比如：法律本科 / 护理培训 / 自学编程" },
  { key: "yearsExperience", label: "相关工作年限（选填）", placeholder: "比如：2 年" },
  { key: "credentials", label: "已有证书或资格（选填）", placeholder: "比如：教师资格证 / 法律职业资格" },
  { key: "city", label: "城市", placeholder: "比如：上海" },
  { key: "education", label: "学历", placeholder: "请选择", options: ["高中/中专", "大专", "本科", "硕士", "博士及以上"] },
  { key: "biggestConfusion", label: "当前最大职业困惑", placeholder: "比如：想转行但不知道适合什么" },
  { key: "incomeGoal", label: "收入目标或转型目标", placeholder: "比如：一年内月薪 2w / 转产品经理" }
];

export function QuestionnaireForm() {
  const router = useRouter();
  const [basicInfo, setBasicInfo] = useState<BasicInfo>(defaultBasicInfo);
  const [stage, setStage] = useState<"basic" | "dimensions" | "calibration">("basic");
  const [current, setCurrent] = useState(0);
  const [calibrationCurrent, setCalibrationCurrent] = useState(0);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [calibrationAnswers, setCalibrationAnswers] = useState<AnswerMap>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const question = selectedQuestions[current];
  const calibrationQuestion = careerCalibrationQuestions[calibrationCurrent];
  const totalQuestions = selectedQuestions.length || QUESTIONNAIRE_SAMPLE_SIZE;
  const combinedTotal = totalQuestions + careerCalibrationQuestions.length;
  const progress = useMemo(() => {
    if (stage === "basic") return 4;
    if (stage === "calibration") {
      return ((totalQuestions + calibrationCurrent + 1) / combinedTotal) * 100;
    }
    return ((current + 1) / combinedTotal) * 100;
  }, [calibrationCurrent, combinedTotal, current, stage, totalQuestions]);

  function updateInfo(key: keyof BasicInfo, value: string) {
    setBasicInfo((info) => ({ ...info, [key]: value }));
  }

  async function submit() {
    const missingIndex = selectedQuestions.findIndex((item) => !answers[item.id]);
    if (missingIndex >= 0) {
      setCurrent(missingIndex);
      setError("还有题目没有选择，请先补完这一题。");
      return;
    }
    const missingCalibrationIndex = careerCalibrationQuestions.findIndex(
      (item) => !calibrationAnswers[item.id]
    );
    if (missingCalibrationIndex >= 0) {
      setStage("calibration");
      setCalibrationCurrent(missingCalibrationIndex);
      setError("职业校准还有题目没有选择，请先补完这一题。");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          basicInfo,
          answers,
          calibrationAnswers,
          selectedQuestionIds: selectedQuestions.map((item) => item.id)
        })
      });
      if (!response.ok) throw new Error("提交失败");
      const payload = (await response.json()) as { id: string };
      router.push(`/reports/${payload.id}`);
    } catch {
      setError("报告生成失败，请稍后再试。");
      setSubmitting(false);
    }
  }

  async function recordQuestionnaireStart() {
    const storageKey = "jobseek_questionnaire_start_counted";
    if (window.localStorage.getItem(storageKey)) return;

    try {
      const response = await fetch("/api/stats", {
        method: "POST",
        cache: "no-store"
      });
      if (response.ok) {
        window.localStorage.setItem(storageKey, "1");
      }
    } catch {
      // Counting should never block the questionnaire.
    }
  }

  function startQuestionnaire() {
    setSelectedQuestions(selectQuestionSet());
    setAnswers({});
    setCalibrationAnswers({});
    setCurrent(0);
    setCalibrationCurrent(0);
    setStage("dimensions");
    setError("");
    void recordQuestionnaireStart();
  }

  function chooseAnswer(value: number) {
    if (!question) return;
    setAnswers((currentAnswers) => ({ ...currentAnswers, [question.id]: value }));
    setError("");
    if (current < selectedQuestions.length - 1) {
      setCurrent((index) => index + 1);
    }
  }

  function chooseCalibrationAnswer(value: number) {
    if (!calibrationQuestion) return;
    setCalibrationAnswers((currentAnswers) => ({
      ...currentAnswers,
      [calibrationQuestion.id]: value
    }));
    setError("");
    if (calibrationCurrent < careerCalibrationQuestions.length - 1) {
      setCalibrationCurrent((index) => index + 1);
    }
  }

  function next() {
    if (stage === "basic") {
      startQuestionnaire();
      return;
    }
    if (stage === "calibration") {
      if (!calibrationQuestion || !calibrationAnswers[calibrationQuestion.id]) {
        setError("请先选择一个选项。");
        return;
      }
      if (calibrationCurrent < careerCalibrationQuestions.length - 1) {
        setCalibrationCurrent((value) => value + 1);
      } else {
        void submit();
      }
      return;
    }
    if (!question) return;
    if (!answers[question.id]) {
      setError("请先选择一个选项。");
      return;
    }
    setError("");
    if (current < selectedQuestions.length - 1) {
      setCurrent((value) => value + 1);
    } else {
      setStage("calibration");
      setCalibrationCurrent(0);
    }
  }

  function previous() {
    setError("");
    if (stage === "calibration") {
      if (calibrationCurrent > 0) {
        setCalibrationCurrent((value) => value - 1);
      } else {
        setStage("dimensions");
        setCurrent(Math.max(0, selectedQuestions.length - 1));
      }
      return;
    }
    if (stage === "dimensions" && current > 0) {
      setCurrent((value) => value - 1);
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffaf7_0%,#fff4f6_100%)] px-4 pb-40 pt-5">
      <div className="mx-auto max-w-3xl">
        <a href="/" className="inline-flex items-center gap-2 text-sm font-bold text-neutral-600">
          <ArrowLeft size={16} />
          返回首页
        </a>
        <section className="xhs-shell mt-4 rounded-[1.75rem] p-5 md:p-8">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-rosepop via-coral to-butter text-white shadow-sticker">
              <Sparkles size={20} />
            </span>
            <div>
              <p className="text-sm font-black text-rosepop">职业天赋问卷</p>
              <h1 className="text-2xl font-black">先了解你，再分析方向</h1>
            </div>
          </div>

          <div className="mt-6">
            <ProgressBar value={progress} />
            <p className="mt-2 text-xs font-bold text-neutral-500">
              {stage === "basic"
                ? "基础信息"
                : stage === "calibration"
                  ? `职业校准 第 ${calibrationCurrent + 1} / ${careerCalibrationQuestions.length} 题`
                  : `职业偏好 第 ${current + 1} / ${totalQuestions} 题`}
            </p>
          </div>

          {stage === "basic" ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {fields.map((field) => (
                <label key={field.key} className="block">
                  <span className="text-sm font-black">{field.label}</span>
                  {field.options ? (
                    <select
                      className="mt-2 w-full rounded-2xl border border-rose-100 bg-white px-4 py-3 outline-none focus:border-rosepop"
                      value={basicInfo[field.key]}
                      onChange={(event) => updateInfo(field.key, event.target.value)}
                    >
                      <option value="">{field.placeholder}</option>
                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className="mt-2 w-full rounded-2xl border border-rose-100 bg-white px-4 py-3 outline-none focus:border-rosepop"
                      placeholder={field.placeholder}
                      value={basicInfo[field.key]}
                      onChange={(event) => updateInfo(field.key, event.target.value)}
                    />
                  )}
                </label>
              ))}
            </div>
          ) : stage === "dimensions" && question ? (
            <div className="mt-5 md:mt-8">
              <div className="mb-3 inline-flex rounded-full bg-butter px-3 py-1.5 text-xs font-black md:mb-4 md:px-4 md:py-2">
                当前维度：{question.dimensionName}
              </div>
              <h2 className="text-xl font-black leading-7 md:text-2xl md:leading-9">{question.text}</h2>
              <div className="mt-4 grid gap-2.5 md:mt-7 md:gap-3">
                {getResponseScale(question).map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => chooseAnswer(item.value)}
                    className={`flex items-center justify-between rounded-3xl border px-4 py-3.5 text-left font-black transition md:px-5 md:py-4 ${
                      answers[question.id] === item.value
                        ? "border-rosepop bg-rosepop text-white shadow-sticker"
                        : "border-rose-100 bg-white text-ink shadow-sm"
                    }`}
                  >
                    <span>{item.label}</span>
                    {question.responseMode === "choiceAB" ? null : <span>{item.value}</span>}
                  </button>
                ))}
              </div>
            </div>
          ) : stage === "calibration" && calibrationQuestion ? (
            <div className="mt-5 md:mt-8">
              <div className="mb-3 inline-flex rounded-full bg-sky-100 px-3 py-1.5 text-xs font-black text-sky-800 md:mb-4 md:px-4 md:py-2">
                职业校准：兴趣、能力证据与进入条件
              </div>
              <h2 className="text-xl font-black leading-7 md:text-2xl md:leading-9">
                {calibrationQuestion.text}
              </h2>
              <p className="mt-2 text-sm leading-6 text-neutral-500">
                请按真实经历和可接受程度回答，不需要选择“看起来更优秀”的选项。
              </p>
              <div className="mt-4 grid gap-2.5 md:mt-7 md:gap-3">
                {careerCalibrationScale.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => chooseCalibrationAnswer(item.value)}
                    className={`flex items-center justify-between rounded-3xl border px-4 py-3.5 text-left font-black transition md:px-5 md:py-4 ${
                      calibrationAnswers[calibrationQuestion.id] === item.value
                        ? "border-sky-500 bg-sky-500 text-white shadow-sticker"
                        : "border-sky-100 bg-white text-ink shadow-sm"
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-8 rounded-3xl bg-rose-50 p-5 text-sm font-bold text-rosepop">
              正在准备你的随机题目...
            </div>
          )}

          {error ? <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{error}</p> : null}
        </section>
      </div>

      <div className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-rose-100 bg-white/92 px-4 pt-2 backdrop-blur md:pt-3">
        <div className="mx-auto flex max-w-3xl gap-3">
          {(stage === "calibration" || (stage === "dimensions" && current > 0)) ? (
            <button
              type="button"
              onClick={previous}
              className="rounded-full bg-rose-50 px-5 py-3.5 font-black md:py-4"
            >
              上一题
            </button>
          ) : null}
          <button
            type="button"
            disabled={submitting}
            onClick={next}
            className="xhs-cta flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-3.5 font-black text-white disabled:opacity-70 md:py-4"
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                报告正在生成
              </>
            ) : stage === "calibration" && calibrationCurrent === careerCalibrationQuestions.length - 1 ? (
              "提交并生成报告"
            ) : (
              <>
                {stage === "basic"
                  ? "开始答题"
                  : stage === "dimensions" && current === selectedQuestions.length - 1
                    ? "进入职业校准"
                    : "下一题"}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
