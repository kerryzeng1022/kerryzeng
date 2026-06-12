import type { CareerReport, ReportContext } from "@/lib/types";
import { getDimensionTendency, sortByTendencyStrength } from "@/lib/report/dimensionAxis";

const MIN_READABLE_CHINESE_CHARS = 5000;
const MIN_COMBINATION_CHINESE_CHARS = 2000;

const dimensionAngles = [
  "动力来源",
  "协作方式",
  "反馈偏好",
  "压力反应",
  "环境筛选",
  "成长路径",
  "决策依据",
  "风险边界",
  "行动节奏",
  "能力迁移"
];

const actionVerbs = [
  "记录",
  "访谈",
  "试做",
  "复盘",
  "比较",
  "拆解",
  "验证",
  "筛选",
  "校准",
  "取舍"
];

type DimensionProfile = {
  focus: string;
  strengths: string[];
  risks: string[];
  suggestions: string[];
};

type DimensionToneProfile = {
  plainName: string;
  environment: string;
  loss: string;
  high: string;
  medium: string;
  low: string;
  suitableWork: string[];
  unsuitableWork: string[];
  validation: string;
};

type TrackToneProfile = {
  plainWhy: string;
  firstStepAction: string;
  validationSteps: string[];
  riskCorrectionSteps: string[];
};

const dimensionProfiles: Record<string, DimensionProfile> = {
  income_drive: {
    focus: "收入结构和风险回报",
    strengths: ["能较早识别收入是否值得投入", "更容易用现实回报校准职业选择", "适合把薪酬结构拆成底薪、浮动和成长空间"],
    risks: ["可能高估短期涨薪带来的长期满足感", "容易忽略高收入岗位背后的时间占用和责任压力", "在高回报诱惑下可能暂时压低边界和价值感"],
    suggestions: ["面试时问清固定薪资、绩效口径和涨薪周期", "把收入目标拆成保底线、理想线和可牺牲条件", "用税后收入、通勤、加班和成长机会做综合比较"]
  },
  growth_mode: {
    focus: "学习方式和成长速度",
    strengths: ["能通过持续学习打开新机会", "适合在有方法、有反馈的环境里快速迭代", "容易把新知识沉淀成可迁移能力"],
    risks: ["可能把频繁学习误当成真实进步", "如果岗位长期没有新挑战，容易感到停滞", "在目标不清时容易囤课、囤资料而延迟行动"],
    suggestions: ["为目标岗位列出 3 项必须补齐的能力", "用一个 30 天作品验证学习是否能转化成交付", "优先选择有导师、复盘或项目挑战的团队"]
  },
  recognition_source: {
    focus: "认可来源和价值感",
    strengths: ["能敏锐捕捉外部评价和职业形象", "适合在成果可见、影响可被看见的岗位中发力", "容易为有意义的结果投入额外精力"],
    risks: ["可能被头衔、平台或他人评价牵着走", "当贡献不可见时，容易低估自己的真实价值", "容易把短期掌声误当成长期职业适配"],
    suggestions: ["区分你要的是头衔光环、作品影响还是收入回报", "求职时看岗位是否有可展示成果和署名空间", "定期记录自己的实际贡献，减少只靠外界反馈判断"]
  },
  social_energy: {
    focus: "互动密度和能量恢复",
    strengths: ["能判断自己适合高互动还是深度专注", "更容易找到让沟通成本可控的协作方式", "适合把会议、客户和独立产出的比例提前谈清楚"],
    risks: ["高频社交可能迅速消耗注意力", "过度回避沟通也可能错失资源和信息", "如果恢复时间不足，容易把人际疲惫误判成讨厌工作"],
    suggestions: ["面试时询问会议频率、客户接触和跨部门协作比例", "为自己设定高互动后的恢复时间", "优先验证岗位是一对多沟通还是深度独立产出"]
  },
  boundary_clarity: {
    focus: "工作生活边界",
    strengths: ["能清楚识别工作对私人时间的侵入", "适合建立稳定节奏和可持续交付方式", "更容易通过规则保护长期状态"],
    risks: ["边界不清的岗位会造成持续精神占用", "过度刚性也可能影响关键阶段的协作弹性", "隐形待命、临时改需求会比任务本身更消耗"],
    suggestions: ["入职前确认加班、值班、群消息和休假响应规则", "把不可长期牺牲的时间边界写清楚", "区分阶段性冲刺和常态化随叫随到"]
  },
  recognition_logic: {
    focus: "关系氛围和结果判断",
    strengths: ["能感知团队氛围对产出的影响", "适合在关系协作和结果交付之间做平衡", "容易发现组织文化是否支持自己长期发挥"],
    risks: ["纯 KPI 或高冲突环境可能带来明显内耗", "过度在意关系会影响必要的判断和表达", "容易把组织氛围问题背成个人沟通失败"],
    suggestions: ["面试时观察上级反馈方式和团队冲突处理方式", "把事实问题和关系感受分开复盘", "选择既重视结果也保留基本尊重的团队"]
  },
  pressure_rhythm: {
    focus: "任务节奏和压力波峰",
    strengths: ["能识别自己适合匀速推进还是阶段冲刺", "适合把复杂项目拆成节奏明确的里程碑", "能通过节奏管理提升稳定产出"],
    risks: ["长期突发或长期无反馈都会影响状态", "节奏不匹配时容易把压力误判成能力问题", "多线并行且优先级频繁变化时容易被打散"],
    suggestions: ["询问岗位是否常态化救火、赶 deadline 或多线并行", "用周计划记录自己在不同压力下的表现", "优先选择压力峰谷与你恢复方式匹配的岗位"]
  },
  power_execution: {
    focus: "授权程度和责任边界",
    strengths: ["能在模糊任务中争取主动权", "适合承担需要推进和拍板的工作", "容易把不确定问题拆成可执行步骤"],
    risks: ["授权不足会让你感到束手束脚", "责任过大但资源不足时容易承担过度风险", "权责不对等时容易替团队背下不该背的结果"],
    suggestions: ["确认岗位的决策权、资源权和汇报链路", "评估自己是适合一号位、二号位还是项目负责人", "把可拍板事项和需要上级确认的事项列清楚"]
  },
  thinking_granularity: {
    focus: "细节深度和战略视角",
    strengths: ["能发现普通人忽略的细节问题", "适合做需要严谨审查和结构拆解的任务", "容易把复杂事项整理成清晰框架"],
    risks: ["可能在低价值细节上投入过多精力", "过度追求完整会拖慢交付节奏", "如果团队只要快速结论，你的深挖可能不被理解"],
    suggestions: ["为任务设定必须精细和可以放过的边界", "面试时确认岗位更看重零差错还是快速试错", "用重要性和可逆性决定细节投入程度"]
  },
  information_processing: {
    focus: "理论输入和实践试错",
    strengths: ["能判断自己需要先研究还是边做边学", "适合建立有效的信息搜集和验证路径", "容易从复杂资料中提取行动线索"],
    risks: ["过度调研会延迟行动", "过快试错也可能造成重复踩坑", "信息来源混杂时容易被观点带偏而不是被事实校准"],
    suggestions: ["给新任务设置调研上限和试错节点", "优先用一手访谈补足资料盲区", "把信息来源分成事实、观点和假设三类"]
  },
  drive_logic: {
    focus: "数据理性和直觉判断",
    strengths: ["能在理性证据和现场感受之间做判断", "适合需要分析、说服和决策的场景", "容易发现数字之外的人和情境变量"],
    risks: ["只信数据可能忽略人的真实动机", "只靠直觉也可能放大经验偏差", "证据不足时容易在分析和感觉之间来回摇摆"],
    suggestions: ["重大选择同时列出数据证据和直觉理由", "用小实验验证直觉，而不是直接押注", "面试时观察团队是数据驱动还是经验拍板"]
  },
  feedback_cycle: {
    focus: "即时反馈和长期沉淀",
    strengths: ["能识别反馈速度对动力的影响", "适合把长期目标拆成短周期成果", "容易通过阶段性反馈保持行动感"],
    risks: ["反馈太慢会带来自我怀疑", "过度追求即时结果会错过长期积累", "成果不可见时容易低估自己正在形成的复利"],
    suggestions: ["给长期目标设置每周可见成果", "选择有明确复盘节奏的团队", "把成果反馈分成日反馈、月反馈和长期回报"]
  },
  environment_dependence: {
    focus: "空间秩序和自由度",
    strengths: ["能识别办公空间对效率的影响", "适合提前筛选固定、远程或流动办公方式", "容易通过环境布置稳定工作状态"],
    risks: ["空间混乱或规则频繁变化会放大焦虑", "过度依赖理想环境可能降低适应弹性", "频繁出差、换位或临时办公会打断进入状态的速度"],
    suggestions: ["确认是否固定工位、远程比例和出差频率", "为自己建立最低可接受工作环境标准", "用一周试验记录不同空间下的效率差异"]
  },
  moral_threshold: {
    focus: "利益目标和价值底线",
    strengths: ["能提前识别不愿交换的职业底线", "适合规则清晰、信任成本低的组织", "容易在复杂利益中保留长期信誉"],
    risks: ["灰色地带过多会造成持续心理消耗", "过度理想化也可能忽略现实商业约束", "当目标与底线冲突时，容易陷入反复自我说服"],
    suggestions: ["入职前了解行业合规风险和公司口碑", "写下自己不能接受的三类行为", "遇到模糊要求时保留书面确认和退出方案"]
  }
};

const dimensionToneProfiles: Record<string, DimensionToneProfile> = {
  income_drive: {
    plainName: "收入目标",
    environment: "钱、成长和付出能算清楚的地方",
    loss: "别只被短期涨薪带着跑，先算清时间、压力和长期回报",
    high: "你对收入回报很敏感，适合去结果和回报挂钩更清楚的地方。",
    medium: "你不是只看钱，也不是完全不看钱，关键是别让收入、成长和生活节奏互相打架。",
    low: "你不太适合长期靠高压高回报硬撑，更需要先看稳定性和生活质量。",
    suitableWork: ["薪酬结构透明、目标清楚的岗位", "能用结果换回报的业务型工作", "收入增长路径讲得明白的团队"],
    unsuitableWork: ["只画大饼、不讲兑现规则的岗位", "短期钱多但长期透支很重的工作", "收入不稳定还要求长期待命的环境"],
    validation: "面试时直接问：底薪、绩效、涨薪周期、加班强度分别怎么算。问不清，就先别被高薪标题冲昏头。"
  },
  growth_mode: {
    plainName: "成长方式",
    environment: "有人带、有反馈、有新任务可以练手的地方",
    loss: "别把囤课、看资料当成长，最后没有作品也没有结果",
    high: "你需要持续升级，长期重复打杂会让你很快失去劲头。",
    medium: "你能学新东西，也能做稳定任务，但最好给自己设一个清晰成长台阶。",
    low: "你更适合先把一套稳定方法做熟，不必硬把自己丢进天天变化的环境。",
    suitableWork: ["有导师或复盘机制的团队", "能接触新项目、新工具、新业务的岗位", "允许你边做边升级能力的工作"],
    unsuitableWork: ["长期只做重复执行的岗位", "没人反馈、只让你自己摸索的环境", "培训很多但不给真实项目的团队"],
    validation: "用 30 天做一个小作品：能不能从学习变成可展示结果，比报多少课更能说明问题。"
  },
  recognition_source: {
    plainName: "认可来源",
    environment: "成果能被看见、贡献能说清楚的地方",
    loss: "别为了头衔、平台光环或别人的评价，忽略自己真实做了什么",
    high: "你需要看见自己的价值被承认，适合成果可见度高的岗位。",
    medium: "外部认可会影响你，但不是唯一动力；你需要把掌声和真实能力分开看。",
    low: "你不一定需要天天被夸，更适合安静把事情做扎实。",
    suitableWork: ["作品、成果、数据能被展示的岗位", "贡献边界清楚的项目制工作", "有公开复盘和认可机制的团队"],
    unsuitableWork: ["幕后付出很多但贡献说不清的岗位", "只看关系不看结果的环境", "头衔好听但实际成长很弱的工作"],
    validation: "复盘最近三个让你有成就感的时刻：到底是被夸开心，还是你真的做成了一件事。"
  },
  social_energy: {
    plainName: "社交消耗",
    environment: "沟通有必要、会议不过量、能留出独立做事时间的地方",
    loss: "少在没用的人情应酬和低效会议上浪费精力",
    high: "你能从沟通和连接里拿到能量，适合高互动场景。",
    medium: "你能社交，也需要独处恢复；关键是别让会议和应酬挤掉真正产出。",
    low: "你更适合少一点无效社交，多一点安静做事的工作节奏。",
    suitableWork: ["沟通目标明确的协作岗位", "客户或团队互动有边界的工作", "独立产出和必要沟通比例平衡的环境"],
    unsuitableWork: ["天天开会、天天临时拉群的岗位", "靠应酬和关系推进的工作", "需要长时间高频见人的环境"],
    validation: "问清一周大概多少会议、多少客户沟通、多少独立产出时间。你累的往往不是人，而是没必要的沟通。"
  },
  boundary_clarity: {
    plainName: "边界清晰",
    environment: "上班下班、谁负责什么、什么算交付都说清楚的地方",
    loss: "别长期忍受隐形待命、临时背锅和下班后无限响应",
    high: "你需要边界清楚，规则透明时更能稳定发挥。",
    medium: "你能配合冲刺，但不能让临时性变成常态。",
    low: "你对边界要求没那么强，但也要防止长期被无序消耗。",
    suitableWork: ["职责清晰、流程稳定的团队", "汇报关系和交付标准明确的岗位", "尊重休息和工作边界的组织"],
    unsuitableWork: ["随叫随到、需求天天变的团队", "没人拍板但人人提要求的环境", "边界不清还要求你一直兜底的岗位"],
    validation: "入职前问清：下班后消息怎么处理、需求变更谁拍板、出了问题谁负责。"
  },
  recognition_logic: {
    plainName: "认同逻辑",
    environment: "既讲结果，也讲基本尊重和协作氛围的地方",
    loss: "别把团队氛围问题全背到自己身上",
    high: "你很受团队氛围影响，适合既重结果也讲人味的环境。",
    medium: "你能适应不同团队，但长期高冲突会慢慢消耗你。",
    low: "你更能把事和人分开看，但也别忽略协作氛围的长期影响。",
    suitableWork: ["反馈方式直接但尊重人的团队", "目标明确、冲突能被处理的组织", "协作规则清楚的项目组"],
    unsuitableWork: ["长期内耗、拉踩和甩锅的团队", "只讲 KPI 不讲基本尊重的环境", "靠揣摩领导情绪工作的岗位"],
    validation: "面试时观察对方怎么讲离职原因、失败项目和跨部门冲突，这比福利介绍更真实。"
  },
  pressure_rhythm: {
    plainName: "压力节奏",
    environment: "压力有节奏、忙完能复盘、不是天天救火的地方",
    loss: "别长期待在优先级乱跳、天天临时救急的工作里",
    high: "你能扛冲刺，但需要知道为什么冲、冲完怎么算结束。",
    medium: "你能适应忙闲变化，但最好有清晰计划和恢复时间。",
    low: "你更适合稳定推进，不适合长期高压救火。",
    suitableWork: ["里程碑清楚的项目型岗位", "阶段性冲刺后能复盘的团队", "优先级相对稳定的工作"],
    unsuitableWork: ["长期多线并行且天天改方向的岗位", "所有事都很急但没人排序的团队", "用加班掩盖管理混乱的环境"],
    validation: "直接问：最近一个月最忙的时候在忙什么？优先级谁定？冲刺结束后有没有复盘和补偿。"
  },
  power_execution: {
    plainName: "权责执行",
    environment: "权责分明、有人拍板、资源和责任匹配的地方",
    loss: "别接那种责任全给你、权限不给你、资源也不给你的活",
    high: "你适合做能推进、能拍板、能把事情往前拽的角色。",
    medium: "你能执行也能推进，但要先弄清自己到底能决定什么。",
    low: "你不一定想站到最前面拍板，更适合边界清楚的执行或支持角色。",
    suitableWork: ["项目负责人、运营推进、交付管理类岗位", "有明确授权的团队", "资源、责任和决策权匹配的项目"],
    unsuitableWork: ["只让你背结果但不给权限的岗位", "人人都能插手、没人最终拍板的团队", "责任边界模糊的管理环境"],
    validation: "问清三个问题：我能决定什么？需要谁审批？出了问题谁一起负责？"
  },
  thinking_granularity: {
    plainName: "思维颗粒度",
    environment: "允许你把问题拆细、把逻辑讲清楚的地方",
    loss: "别在只要快不要准的环境里反复被催到崩",
    high: "你适合处理复杂、细节多、需要严谨判断的事情。",
    medium: "你能在细节和大方向之间切换，但要知道什么时候该停。",
    low: "你更适合抓重点和推进结果，不必逼自己钻每个细节。",
    suitableWork: ["分析、研究、风控、产品逻辑类工作", "需要拆解复杂问题的岗位", "重视方法和结构的团队"],
    unsuitableWork: ["只追速度、不允许复盘的岗位", "信息混乱但又要求零失误的环境", "细节价值很低却消耗巨大的工作"],
    validation: "拿一个真实任务试试：你是越拆越清楚，还是越拆越累。如果越拆越清楚，这就是适配信号。"
  },
  information_processing: {
    plainName: "信息处理",
    environment: "信息来源清楚、允许调研也要求落地的地方",
    loss: "别陷在资料堆里迟迟不行动，也别没搞清楚就乱试",
    high: "你适合先把信息吃透，再形成判断和方法。",
    medium: "你能研究也能试错，关键是给调研设截止时间。",
    low: "你更适合边做边学，别让过多信息拖慢行动。",
    suitableWork: ["研究分析、产品调研、咨询支持类岗位", "需要整理复杂资料的工作", "重视事实和验证的团队"],
    unsuitableWork: ["信息极乱却要求马上拍板的岗位", "只看感觉不看事实的环境", "调研没有边界、永远不落地的项目"],
    validation: "给自己设一个 48 小时信息上限：到点必须输出判断、假设和下一步动作。"
  },
  drive_logic: {
    plainName: "驱动逻辑",
    environment: "讲证据、讲现场感，也允许你说清判断依据的地方",
    loss: "别在全靠拍脑袋或只看冷冰冰数据的环境里来回内耗",
    high: "你适合在证据和直觉之间做判断，能看到数字背后的人和场景。",
    medium: "你会在理性和感觉之间摇摆，需要用小实验帮自己定下来。",
    low: "你更适合规则清楚、判断标准稳定的环境。",
    suitableWork: ["商业分析、策略、产品、运营判断类岗位", "需要说服和决策的工作", "既看数据也看用户反馈的团队"],
    unsuitableWork: ["只靠领导感觉拍板的环境", "只看数据不看实际人的团队", "证据不足还要求你马上站队的岗位"],
    validation: "做重大选择时，把数据证据和直觉理由分两栏写出来，再用一个小动作验证。"
  },
  feedback_cycle: {
    plainName: "反馈周期",
    environment: "做完事情能看到反馈、长期目标也能拆成小成果的地方",
    loss: "别长期做那种没人反馈、成果看不见的活",
    high: "你需要比较快看到反馈，适合结果能阶段性显现的工作。",
    medium: "你能做长期事，但最好给自己安排短周期成果。",
    low: "你不一定依赖即时反馈，但也要防止长期没反馈带来自我怀疑。",
    suitableWork: ["运营、产品、销售、内容等反馈较快的岗位", "有复盘机制的团队", "能看到阶段成果的项目"],
    unsuitableWork: ["长期闭门造车、成果很晚才看见的岗位", "没人评价也没人复盘的环境", "反馈标准含糊的工作"],
    validation: "给目标拆周成果：这一周到底交付什么、谁来看、看完怎么反馈。"
  },
  environment_dependence: {
    plainName: "环境依赖",
    environment: "平台、工具、空间变化时也能迁移能力的地方",
    loss: "别过度依赖现有平台和舒适环境，免得换地方就立不住",
    high: "你很受环境影响，需要主动打造稳定工作条件。",
    medium: "环境会影响你，但不是决定你；最好提前准备迁移方案。",
    low: "你面对环境变化时通常更能调整，可以尝试更灵活的工作形态。",
    suitableWork: ["办公规则清楚、工具稳定的团队", "允许你建立个人工作系统的岗位", "远程/固定办公边界明确的工作"],
    unsuitableWork: ["频繁换地点、频繁换规则的岗位", "工具和流程长期混乱的团队", "全靠平台资源、个人能力沉淀很少的环境"],
    validation: "换一个地点或工具工作一周，看看效率掉多少；掉很多，就要补可迁移的方法。"
  },
  moral_threshold: {
    plainName: "做人底线",
    environment: "规则透明、少灰色操作、不会逼你违背原则的地方",
    loss: "守住做人底线，别为了短期利益轻易放宽原则",
    high: "你对底线很敏感，适合规则清楚、信任成本低的环境。",
    medium: "你能理解现实复杂，但底线最好提前写清楚。",
    low: "你对灰色地带的容忍度更高，但也要防止长期损害信誉。",
    suitableWork: ["合规、风控、财务、规范经营的团队", "规则清楚、书面流程完整的岗位", "长期信誉比短期利益更重要的行业"],
    unsuitableWork: ["灰色操作多、话术诱导多的岗位", "靠擦边和短期套利赚钱的环境", "经常逼你替别人背锅的团队"],
    validation: "提前写下三件不能做的事。遇到模糊要求时，要求书面确认，不要只靠口头承诺。"
  }
};

const trackToneProfiles: Record<string, TrackToneProfile> = {
  增长产品与商业分析: {
    plainWhy: "这个方向适合把问题拆开、看数据、找增长机会的人。不是只会做表，而是能把用户、收入和产品动作连起来。",
    firstStepAction: "选一个你熟悉的产品，做一页增长诊断：用户从哪里来、卡在哪里、哪个动作最值得试。",
    validationSteps: ["访谈 3 个目标岗位从业者，问清每天到底在分析什么", "用公开数据做一个小看板或增长复盘", "把结论讲给一个非专业朋友听，看他能不能听懂"],
    riskCorrectionSteps: ["别只沉迷数据工具，必须能讲业务含义", "别只看增长结果，也要看团队是否有试错资源", "如果高频协调很消耗，优先选偏分析或策略岗位"]
  },
  内容策略与品牌策划: {
    plainWhy: "这个方向适合把观点、用户情绪和传播节奏串起来的人。关键不是会写，而是能持续做出有判断的内容。",
    firstStepAction: "围绕一个垂直主题做 7 天选题测试，记录标题、阅读、收藏和转化反馈。",
    validationSteps: ["拆 3 个同类账号或品牌案例", "写一份栏目策划和 5 条样稿", "找真实用户反馈：他们记住了什么、愿不愿转发"],
    riskCorrectionSteps: ["别只追热点，先确认自己能不能长期产出", "别把点赞当全部结果，也要看转化和沉淀", "如果过度依赖外部认可，要建立自己的复盘标准"]
  },
  "B2B 销售与客户成功": {
    plainWhy: "这个方向适合能和人打交道、愿意理解客户问题、也能盯结果的人。",
    firstStepAction: "找一个真实产品，练习 5 次需求挖掘：客户痛点、预算、决策人、下一步动作。",
    validationSteps: ["旁听或模拟一次销售沟通", "整理一份客户问题清单", "复盘一次从需求到成交/续费的路径"],
    riskCorrectionSteps: ["别只看提成，要看销售周期和客户压力", "确认是否需要大量应酬", "如果人际消耗高，优先考虑客户成功或解决方案支持"]
  },
  研究分析与咨询: {
    plainWhy: "这个方向适合喜欢把复杂问题讲清楚、能从信息里提炼判断的人。",
    firstStepAction: "选一个行业问题，做 5 页研究小报告：结论、证据、风险、建议。",
    validationSteps: ["访谈 2 位行业从业者验证判断", "把资料分成事实、观点和假设", "用一页纸讲清楚你的建议"],
    riskCorrectionSteps: ["别陷在资料里不下结论", "确认团队是否允许深度研究而不是只要快", "注意咨询节奏可能会有高压交付"]
  },
  项目管理与组织推进: {
    plainWhy: "这个方向适合把混乱事情理顺、推动多人按节奏交付的人。",
    firstStepAction: "拿一个真实小项目做推进表：目标、负责人、截止时间、风险、下次检查点。",
    validationSteps: ["主持一次小型项目复盘", "练习把模糊需求拆成任务清单", "观察自己在催进度和协调人时是有劲还是被耗干"],
    riskCorrectionSteps: ["别接权责不清的项目", "确认你有多少拍板权", "如果长期替别人背锅，要及时调整岗位边界"]
  },
  专业技术深耕: {
    plainWhy: "这个方向适合愿意靠硬技能、作品和长期积累吃饭的人。",
    firstStepAction: "选一个目标技能做 30 天作品，不求大，但必须能展示。",
    validationSteps: ["拆解目标岗位 JD 的硬技能要求", "完成一个可公开展示的小项目", "请从业者指出作品的短板"],
    riskCorrectionSteps: ["别只学不做作品", "确认技术路线是否有市场需求", "避免长期闭门造车导致反馈太慢"]
  },
  人力组织发展: {
    plainWhy: "这个方向适合理解人、组织和规则，也愿意处理团队协作问题的人。",
    firstStepAction: "做一份团队问题诊断：招聘、绩效、沟通、培训哪个环节最卡。",
    validationSteps: ["访谈 2 位 HR 或团队负责人", "模拟设计一次新人培训或绩效反馈方案", "观察自己处理冲突时是否消耗过大"],
    riskCorrectionSteps: ["别只喜欢跟人聊天，要能处理规则和数据", "确认组织是否真的重视人力工作", "高冲突团队会明显放大消耗"]
  },
  创业与新业务探索: {
    plainWhy: "这个方向适合能承受不确定、愿意自己找资源和试错的人。",
    firstStepAction: "用一周验证一个小需求：谁愿意买、为什么买、多少钱会买。",
    validationSteps: ["做 10 个潜在用户访谈", "做一个最小可行样品或服务", "记录获客成本、转化和交付压力"],
    riskCorrectionSteps: ["别只被自由感吸引，要算现金流", "确认自己能不能承受不确定收入", "底线和合规问题要提前设红线"]
  },
  财务风控与合规: {
    plainWhy: "这个方向适合重视规则、细节和风险边界的人。",
    firstStepAction: "找一个真实案例，拆出风险点、证据链和处理建议。",
    validationSteps: ["学习一个基础财务/合规流程", "做一页风险排查表", "访谈从业者确认日常是否符合你的耐心和细致度"],
    riskCorrectionSteps: ["别只看稳定，要看重复度是否过高", "确认组织是否真的尊重规则", "灰色操作多的公司要直接排除"]
  },
  空间运营与线下管理: {
    plainWhy: "这个方向适合把现场、人、流程和服务体验管起来的人。",
    firstStepAction: "观察一个线下门店或空间，记录动线、人员安排、问题点和改进建议。",
    validationSteps: ["实地观察 2 个不同空间", "做一份现场问题清单", "试着设计一套排班或服务流程"],
    riskCorrectionSteps: ["确认是否频繁出差或临时救火", "别低估现场管理的人际消耗", "空间混乱会明显影响状态的人要谨慎"]
  },
  自由职业与远程服务: {
    plainWhy: "这个方向适合能自我管理、能把能力包装成服务并持续交付的人。",
    firstStepAction: "列一个可售卖服务包：服务对象、交付物、价格、周期、案例。",
    validationSteps: ["找 3 个潜在客户验证需求", "做一次低价试单或模拟交付", "记录获客、沟通、修改和收款压力"],
    riskCorrectionSteps: ["别只看自由，要看获客和现金流", "确认自己能不能没有外部监督也稳定推进", "过度依赖单一平台会有风险"]
  },
  教育培训与知识产品: {
    plainWhy: "这个方向适合把经验讲清楚、把方法做成课程或陪跑服务的人。",
    firstStepAction: "把你最熟的一项能力拆成 3 节小课，找 3 个人试讲。",
    validationSteps: ["整理一个学习路径", "做一次小范围分享", "收集听众最想继续问的问题"],
    riskCorrectionSteps: ["别只讲自己爽，要看别人是否真的学会", "确认交付后反馈周期是否适合你", "别过度依赖个人热情，要形成可复用材料"]
  }
};

function cloneReport(report: CareerReport): CareerReport {
  return JSON.parse(JSON.stringify(report)) as CareerReport;
}

function normalizeForCompare(value: string) {
  return value.replace(/\s+/g, "").replace(/[，。！？、；：,.!?;:]/g, "");
}

function splitSentences(text: string) {
  return text.match(/[^。！？!?；;]+[。！？!?；;]?/g) ?? [text];
}

function cleanText(text: string) {
  const normalized = text
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/low区间/g, "左侧倾向")
    .replace(/medium区间/g, "中间倾向")
    .replace(/high区间/g, "右侧倾向")
    .trim();
  if (!normalized) return "";

  const seenParagraphs = new Set<string>();
  const paragraphs = normalized
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => {
      const seenSentences = new Set<string>();
      return splitSentences(paragraph)
        .map((sentence) => sentence.trim())
        .filter(Boolean)
        .filter((sentence) => {
          const key = normalizeForCompare(sentence);
          if (key.length < 10) return true;
          if (seenSentences.has(key)) return false;
          seenSentences.add(key);
          return true;
        })
        .join("");
    })
    .filter(Boolean)
    .filter((paragraph) => {
      const key = normalizeForCompare(paragraph);
      if (key.length < 28) return true;
      if (seenParagraphs.has(key)) return false;
      seenParagraphs.add(key);
      return true;
    });

  return paragraphs.join("\n\n");
}

function mapStringFields<T>(value: T, mapper: (text: string) => string): T {
  if (typeof value === "string") return mapper(value) as T;
  if (Array.isArray(value)) return value.map((item) => mapStringFields(item, mapper)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, mapStringFields(entry, mapper)])
    ) as T;
  }
  return value;
}

function reportText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.map(reportText).join("\n");
  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).map(reportText).join("\n");
  }
  return "";
}

function countChineseCharsInReport(report: CareerReport) {
  return (reportText(report).match(/[\u4e00-\u9fff]/g) ?? []).length;
}

function countChineseCharsText(text: string) {
  return (text.match(/[\u4e00-\u9fff]/g) ?? []).length;
}

function uniqueAppend(base: string, addition: string) {
  const cleanedBase = cleanText(base);
  const cleanedAddition = cleanText(addition);
  if (!cleanedAddition) return cleanedBase;
  if (normalizeForCompare(cleanedBase).includes(normalizeForCompare(cleanedAddition))) {
    return cleanedBase;
  }
  return cleanText(`${cleanedBase}\n\n${cleanedAddition}`);
}

function scoreLabel(score: number) {
  if (score >= 70) return "高位";
  if (score >= 40) return "平衡";
  return "低位";
}

function buildDimensionExpansion(
  dimension: CareerReport["dimensionAnalyses"][number],
  index: number,
  context?: ReportContext
) {
  const profile = getDimensionProfile(dimension.dimension);
  const tendency = getDimensionTendency(dimension);
  const angle = profile?.focus ?? dimensionAngles[index % dimensionAngles.length];
  const verb = actionVerbs[index % actionVerbs.length];
  const profileHint = context?.basicInfo.biggestConfusion
    ? `你提到的困惑是「${context.basicInfo.biggestConfusion}」，所以这项倾向最好用真实任务验证，不要只靠自我感觉判断。`
    : "这项倾向最好用真实任务验证，不要只靠自我感觉判断。";

  return {
    insight: `从「${angle}」看，${dimension.dimensionName}更像一条左右坐标。你现在更靠近「${tendency.sideLabel}」，这会直接影响你筛岗位时该问什么。它不是好坏判断，而是在提醒你：什么样的工作方式会更顺，什么样的工作方式会让你额外费劲。${profileHint}`,
    manifestation: `建议你用一个小实验验证${dimension.dimensionName}：选择最近一周最典型的一项工作，${verb}它的任务目标、沟通对象、反馈速度和你完成后的能量变化。如果连续两到三次都指向「${tendency.sideLabel}」，这个线索就值得进入求职筛选表。`,
    action: profile?.suggestions[0] ?? `把${dimension.dimensionName}翻译成面试问题：团队如何设定目标？成果多久被看见？遇到分歧时谁拍板？工作边界如何确认？这些答案比岗位名称更能判断适配度。`
  };
}

function buildOverviewExpansion(report: CareerReport, context?: ReportContext) {
  const topTrack = report.recommendedCareerTracks[0]?.trackName ?? "当前最匹配方向";
  const topDimensions = sortByTendencyStrength(report.dimensionAnalyses)
    .slice(0, 3)
    .map((item) => `${item.dimensionName}偏向${getDimensionTendency(item).sideLabel}`)
    .join("、");
  const centeredDimensions = [...report.dimensionAnalyses]
    .sort((a, b) => getDimensionTendency(a).strength - getDimensionTendency(b).strength)
    .slice(0, 3)
    .map((item) => item.dimensionName)
    .join("、");

  return `阅读这份报告时，建议先看三条主线：你最明显的倾向是${topDimensions || "若干关键维度"}，这些会影响你选环境、选岗位和选团队；相对居中的项目是${centeredDimensions || "若干维度"}，说明这些地方弹性更大；当前更值得验证的方向是「${topTrack}」。${
    context?.basicInfo.incomeGoal
      ? `你写下的目标是「${context.basicInfo.incomeGoal}」，因此后续选择不只看兴趣，也要同时比较收入结构、成长速度和生活边界。`
      : "后续选择不只看兴趣，也要同时比较收入结构、成长速度和生活边界。"
  }`;
}

function buildFinalExpansion(report: CareerReport) {
  const trackNames = report.recommendedCareerTracks
    .slice(0, 3)
    .map((track) => track.trackName)
    .join("、");
  return `最后的判断标准可以更简单：不要急着给自己贴职业标签，先拿${trackNames || "候选方向"}做低成本验证。每个方向至少看四件事：你是否愿意主动学习，完成后是否有成就感，过程中是否持续透支，以及这个方向能否支持你现实中的收入和生活目标。四项同时成立，才值得继续投入。`;
}

export function getDimensionProfile(dimension: string): DimensionProfile | undefined {
  return dimensionProfiles[dimension];
}

function getToneProfile(dimension: string): DimensionToneProfile {
  return (
    dimensionToneProfiles[dimension] ?? {
      plainName: dimension,
      environment: "规则清楚、反馈真实的地方",
      loss: "别长期待在让你反复内耗的环境里",
      high: "这是你比较能发挥的一项。",
      medium: "这项更像可调节开关，关键看具体环境。",
      low: "这项需要省着用，不适合长期硬扛。",
      suitableWork: ["目标清楚、反馈及时的岗位", "协作边界明确的团队"],
      unsuitableWork: ["长期混乱、反馈含糊的环境", "只靠意志力硬撑的岗位"],
      validation: "用一次真实任务测试：做完之后你是更有劲，还是明显被耗空。"
    }
  );
}

function bandTone(score: number, profile: DimensionToneProfile) {
  if (score >= 70) return profile.high;
  if (score >= 40) return profile.medium;
  return profile.low;
}

function topAnalyses(report: CareerReport) {
  return sortByTendencyStrength(report.dimensionAnalyses).slice(0, 3);
}

function lowAnalyses(report: CareerReport) {
  return sortByTendencyStrength(report.dimensionAnalyses).slice(0, 3);
}

function buildPlainLanguageProfile(report: CareerReport) {
  const top = topAnalyses(report).map((item) => getToneProfile(item.dimension));
  const low = lowAnalyses(report).map((item) => getToneProfile(item.dimension));
  const track = report.recommendedCareerTracks[0];
  const roles = track?.suitableRoles.slice(0, 3).join("、");
  const chooseEnvironment = [
    roles ? `具体职业：${roles}` : `候选赛道：${track?.trackName ?? "先选 2-3 个方向验证"}`,
    `团队条件：${top.slice(0, 2).map((item) => item.environment).join("；")}`,
    "面试时问清谁拍板、资源怎么给、交付标准怎么算"
  ];
  const manageLosses = [
    low[0]?.loss ?? "别接长期让你硬扛的工作",
    low[1]?.loss ?? "别只看岗位名字，要看真实日常",
    track?.riskCorrectionSteps?.[0] ?? "别让责任、权限和资源长期不匹配"
  ];
  const oneLine = roles
    ? `先把「${roles}」这类岗位放进候选池。重点看团队是否给你清楚的目标、拍板人和资源；如果只给责任不给权限，就先别急着押注。`
    : `先选 2-3 个具体岗位做验证。重点看目标、拍板人、资源和日常消耗，而不是只看岗位名称。`;

  return {
    chooseEnvironment,
    manageLosses,
    oneLine
  };
}

function buildDimensionHumanFields(
  dimension: CareerReport["dimensionAnalyses"][number]
) {
  const tone = getToneProfile(dimension.dimension);
  const tendency = getDimensionTendency(dimension);
  const tendencyText =
    tendency.side === "center"
      ? `目前更接近中间位置，说明这项弹性比较大`
      : `当前位置 ${tendency.position}/100，更靠近「${tendency.sideLabel}」`;
  const lossSituation = toLossSituation(tone.loss);
  return {
    userConclusion: `${tendencyText}。${bandTone(dimension.score, tone)}`,
    plainExplanation: `你在${tone.environment}时通常更容易进入状态；如果长期${lossSituation}，消耗感往往不是来自任务难，而是来自每天都要用额外精力和环境对抗。`,
    suitableWork: tone.suitableWork,
    unsuitableWork: tone.unsuitableWork,
    nextValidation: tone.validation
  };
}

function toLossSituation(loss: string) {
  return loss
    .replace(/^别接那种/, "")
    .replace(/^别长期/, "长期")
    .replace(/^别/, "")
    .replace(/^少在/, "在")
    .replace(/^守住[^，]+，别/, "")
    .replace(/^不要/, "")
    .replace(/，免得.*$/, "")
    .trim();
}

function buildCombinationFields(
  item: CareerReport["coreStrengthCombinations"][number],
  index: number,
  report: CareerReport
) {
  const top = topAnalyses(report);
  const related = item.relatedDimensions.length
    ? item.relatedDimensions
    : top.slice(index, index + 3).map((dimension) => dimension.dimension);
  const relatedAnalyses = related
    .map((dimension) => report.dimensionAnalyses.find((analysis) => analysis.dimension === dimension))
    .filter(Boolean) as CareerReport["dimensionAnalyses"];
  const activeAnalyses = relatedAnalyses.length ? relatedAnalyses : top.slice(0, 3);
  const topText = activeAnalyses.map((dimension) => `${dimension.dimensionName}偏向${getDimensionTendency(dimension).sideLabel}`).join("、");
  const track = report.recommendedCareerTracks[index]?.trackName ?? report.recommendedCareerTracks[0]?.trackName ?? "首推方向";
  const roles = report.recommendedCareerTracks[index]?.suitableRoles?.length
    ? report.recommendedCareerTracks[index].suitableRoles
    : report.recommendedCareerTracks[0]?.suitableRoles ?? [];
  const roleText = roles.slice(0, 3).join("、") || track;
  const primaryTone = getToneProfile(activeAnalyses[0]?.dimension ?? top[0]?.dimension ?? "");
  const secondaryTone = getToneProfile(activeAnalyses[1]?.dimension ?? top[1]?.dimension ?? "");
  const thirdTone = getToneProfile(activeAnalyses[2]?.dimension ?? top[2]?.dimension ?? "");

  return {
    plainSummary: `这组组合可以先这样理解：${topText || "几个明显倾向"}叠在一起，说明你不是单纯追求某个职业名称，而是需要一种更清楚、更能落地的工作方式。你适合先把事情拆成目标、资源、责任、反馈和风险，再判断自己要不要继续投入。`,
    whyItMatters: `它重要的地方在于，职业选择常常不是“我喜欢什么”这么简单，而是“我在什么条件下能持续把事情做成”。当${primaryTone.plainName}、${secondaryTone.plainName}和${thirdTone.plainName}一起出现时，你会更在意真实日常：谁来拍板、任务是否能拆清、沟通是不是必要、结果有没有反馈、收入和成长是否说得通。如果这些条件对上，你会比较容易进入稳定推进状态；如果条件反着来，短期也许能靠责任感撑住，长期会明显损耗行动力。`,
    personalityAnalysis: `从个人性格和做事习惯看，你更像“先把局面看清，再把事情往前推”的类型。你不太适合一直待在口号很多、边界很糊、靠临时情绪推进的环境里；你更需要看见明确目标、明确负责人和可复盘结果。你可能不是最喜欢无规则自由的人，而是更适合在规则透明的空间里把复杂事情拆细、协调资源、持续推进。这样的性格优势在项目推进、业务分析、运营管理、交付管理、组织协作类岗位里会更容易被看见。`,
    careerFitAnalysis: `放到具体职业上，建议先看「${roleText}」。这类工作通常不是单点技能，而是综合能力：一边理解业务目标，一边拆任务、盯节点、沟通相关人、判断风险。如果你的日常任务能同时满足“目标清楚、协作对象清楚、反馈节奏清楚”，你会更容易把个人偏好转成成果；如果岗位只是名义上叫${track}，实际天天救火、替别人背锅、没有资源也没有拍板权，那就不是真正适配。`,
    roleFitDetails: [
      `${roles[0] ?? track}：重点看你是否愿意持续拆目标、排优先级、追进度，并在信息不完整时做阶段判断。`,
      `${roles[1] ?? "相邻岗位"}：重点看你是否能把沟通变成流程和规则，而不是陷入没完没了的人情协调。`,
      `${roles[2] ?? "延展方向"}：重点看你是否能把一次项目经验沉淀成方法、作品或可复用模板。`
    ],
    workStyleFit: `适合你的工作方式不是完全轻松，而是“忙得有理由”。你可以接受阶段性压力，也可以处理复杂协作，但前提是大家知道为什么做、谁负责、结果怎么算。最怕的是每天都有临时沟通和临时改需求，最后没人承认问题来自流程，只让执行的人兜底。`,
    growthPotential: `这组组合的成长空间在于：你可以从执行者慢慢长成推进者，再长成能设计机制的人。早期先练任务拆解和复盘，中期练跨部门沟通和风险识别，后期练资源判断和业务取舍。只要方向选对，你的优势不会只停留在“把活做完”，而是会慢慢变成“把一件复杂的事带到结果”。`,
    mismatchWarning: `需要警惕的不是你做不了，而是环境不给你发挥条件。比如责任压到你身上，但决策权在别人手里；客户天天改口，但团队没有变更机制；领导只要结果，却不帮你协调资源。这类环境会让你怀疑自己，其实真正的问题是权责、流程和反馈长期不匹配。`,
    validationPlan: `30 天验证可以这样做：第 1 周访谈 2-3 位「${roleText}」相关从业者，专门问他们最常见的任务、最烦的协作、谁最终拍板。第 2 周选一个真实小项目，写出目标、负责人、截止时间、风险和交付标准。第 3 周模拟推进一次，记录你在沟通、拆解、复盘时是越来越清楚，还是越来越耗。第 4 周做一次决策复盘：如果你对任务越拆越有劲、对结果越追越清楚，这个方向可以继续；如果你主要被人情协调、权责不清和临时变更拖垮，就换到边界更清楚的组织或相邻岗位。`,
    validationTask: `先拿「${track}」做 30 天验证，不要只问适不适合，重点记录：你是否愿意主动拆任务、是否能接受协作密度、是否能从复盘里获得成就感，以及这个方向能否支撑现实收入目标。`
  };
}

function buildRiskFields(zone: CareerReport["careerRiskZones"][number], index: number, report: CareerReport) {
  const low = lowAnalyses(report)[index] ?? lowAnalyses(report)[0];
  const tone = getToneProfile(low?.dimension ?? "");
  const track = report.recommendedCareerTracks[index]?.trackName ?? report.recommendedCareerTracks[0]?.trackName ?? "候选方向";
  const reasonTemplates = [
    `${tone.plainName}这类风险通常不是一下子爆发，而是藏在每天的小事里：任务说不清、沟通绕来绕去、做完没人复盘。放到「${track}」里，如果你长期靠额外解释和额外协调才能推进，状态会慢慢被磨掉。`,
    `这个消耗点最麻烦的地方，是它很容易被包装成“你再扛一扛”。在「${track}」相关岗位里，如果规则、边界或反馈长期不清，你可能会把组织问题背成个人问题，越做越谨慎。`,
    `如果「${track}」的真实日常刚好压中${tone.plainName}，你未必马上觉得不适合，但会在几周后发现自己启动变慢、复盘变少、对下一步越来越犹豫。这个信号要尽早识别。`
  ];
  const scenarioSets = [
    [
      `${tone.unsuitableWork[0] ?? "岗位日常和你的偏好反着来"}：每天都要临时解释、临时协调，真正产出的时间反而被挤掉。`,
      `${tone.unsuitableWork[1] ?? "团队规则长期不清"}：问题发生时没人复盘流程，只要求你把结果补上。`,
      `${tone.unsuitableWork[2] ?? "反馈和边界长期模糊"}：表面机会很多，实际是不断用注意力替混乱买单。`
    ],
    [
      `${tone.unsuitableWork[0] ?? "岗位日常和你的偏好反着来"}：职责写得好听，但关键资源和决策权都不在你手里。`,
      `${tone.unsuitableWork[1] ?? "团队规则长期不清"}：沟通对象很多，评价标准却经常变，最后很难判断自己做得好不好。`,
      `${tone.unsuitableWork[2] ?? "反馈和边界长期模糊"}：你需要不断猜测领导、客户或团队到底想要什么。`
    ],
    [
      `${tone.unsuitableWork[0] ?? "岗位日常和你的偏好反着来"}：工作看起来有成长，但每天消耗在低效会议、反复改口或灰色边界上。`,
      `${tone.unsuitableWork[1] ?? "团队规则长期不清"}：出了问题才追责，过程里却没有人愿意提前定义标准。`,
      `${tone.unsuitableWork[2] ?? "反馈和边界长期模糊"}：短期靠责任心能撑，长期会影响你对职业方向的判断。`
    ]
  ];
  const problemSets = [
    [
      `你可能会越来越不想主动开始，因为每次开始都意味着一堆额外沟通。`,
      `你会把环境造成的混乱误以为是自己能力不够，信心被慢慢磨低。`,
      `如果收入或成长没有明显补偿，这个方向很容易从机会变成负担。`
    ],
    [
      `你会变得更保守，明明能推进，也会先担心后面是不是要背锅。`,
      `你可能为了减少冲突而少表达真实判断，久了会影响专业成长。`,
      `团队越模糊，你越需要靠意志力维持表现，长期并不划算。`
    ],
    [
      `你会发现自己不是讨厌工作，而是讨厌那套低效的推进方式。`,
      `行动速度会变慢，因为每个决定前都要先判断会不会踩雷。`,
      `如果连续几周都靠忍耐完成任务，就要及时换验证对象或组织类型。`
    ]
  ];
  return {
    reason: reasonTemplates[index % reasonTemplates.length],
    concreteScenarios: scenarioSets[index % scenarioSets.length],
    likelyProblems: problemSets[index % problemSets.length],
    avoidSuggestion: `不要只听岗位介绍，至少用一次访谈或小项目确认${tone.plainName}相关要求是不是常态。`,
    uniqueAvoidAction: `${tone.validation} 同时追问最近一次失败项目：问题怎么暴露、谁来复盘、最后谁承担责任。`
  };
}

function buildTrackFields(track: CareerReport["recommendedCareerTracks"][number], index: number) {
  const profile = trackToneProfiles[track.trackName];
  if (profile) {
    return {
      ...profile,
      plainWhy: buildTrackPlainWhy(track, profile, index)
    };
  }
  return {
    plainWhy: buildTrackPlainWhy(
      track,
      {
        plainWhy: `${track.trackName}值得验证，但先别只看名字，要看每天具体做什么、跟谁协作、怎么衡量结果。`,
        firstStepAction: `先找 3 个${track.trackName}相关岗位，拆出共同任务和能力要求。`,
        validationSteps: [],
        riskCorrectionSteps: []
      },
      index
    ),
    firstStepAction: `先找 3 个${track.trackName}相关岗位，拆出共同任务和能力要求。`,
    validationSteps: [
      "访谈 2-3 位真实从业者，问每天最耗精力的事是什么",
      "做一个 7 天小项目，模拟岗位里的核心任务",
      "复盘收入、成长、消耗和反馈四件事"
    ],
    riskCorrectionSteps: [
      "别只看岗位名称，要看真实任务",
      "如果消耗过高，保留能力模块，换组织形态或岗位层级",
      `把它作为第 ${index + 1} 个候选方向，而不是唯一答案`
    ]
  };
}

function buildTrackPlainWhy(
  track: CareerReport["recommendedCareerTracks"][number],
  profile: TrackToneProfile,
  index: number
) {
  const roles = track.suitableRoles.slice(0, 3);
  const roleText = roles.join("、") || track.trackName;
  const roleA = roles[0] ?? track.trackName;
  const roleB = roles[1] ?? "相邻岗位";
  const roleC = roles[2] ?? "延展岗位";
  const examples = [
    `具体到日常，${roleA}通常要把目标拆成任务、负责人、截止时间和风险点；${roleB}更看重把沟通变成流程、表单、复盘和规则；${roleC}则要在客户、团队或交付对象之间守住边界，保证事情按节奏落地。`,
    `如果这个方向真的适配，你不会只觉得名字好听，而是在处理模糊需求、协调资源、复盘结果时越来越清楚；如果不适配，你会发现自己每天都在临时沟通、替别人兜底、反复解释，却很少形成可以展示的成果。`,
    `验证时可以拿一个真实项目做对照：目标是否清楚，谁能拍板，资源从哪里来，出了问题谁负责，做完有没有复盘。如果这些条件说不清，即使推荐指数高，也要先降低优先级。`
  ];
  const profileSignal = profile.plainWhy
    .replace(/^这个方向适合/, "这个赛道可以验证你是否")
    .replace(/^这个方向/, "这个赛道")
    .replace(/的人。$/, "。");
  const lead = `${track.trackName}可以先作为第 ${index + 1} 个重点候选方向来看。${profileSignal}`;
  const roleSentence = `你可以先看「${roleText}」，但不要把它们当成固定答案，而要拆到每天具体做什么。`;
  return `${lead}\n\n${roleSentence}${examples[index % examples.length]}\n\n${examples[(index + 1) % examples.length]}`;
}

function buildNotRecommendedFields(
  item: CareerReport["notRecommendedEnvironments"][number],
  index: number,
  report: CareerReport
) {
  const low = lowAnalyses(report)[index] ?? lowAnalyses(report)[0];
  const tone = getToneProfile(low?.dimension ?? "");
  const track = report.recommendedCareerTracks[index]?.trackName ?? report.recommendedCareerTracks[0]?.trackName ?? "候选方向";
  return {
    environment: `不建议优先选：${tone.unsuitableWork[0] ?? `${tone.plainName}长期反向的岗位`}`,
    reason: `${tone.plainName}相关条件如果长期和你反着来，你可能不是做不了，而是每天都在额外消耗注意力、耐心和判断力。放到「${track}」这类方向里，真正要避开的不是挑战本身，而是那些目标说不清、责任边界不清、反馈没人给、出了问题只让执行者兜底的岗位。`,
    howToIdentify: `别只听岗位介绍，重点追问真实日程、汇报对象、加班频率、评价标准，以及${tone.plainName}相关要求到底有多重。可以直接问：最近一次任务变更是谁拍板？做错后怎么复盘？前任离开的原因是什么？这些问题比“团队氛围好不好”更能看出真实情况。`,
    avoidRoles: tone.unsuitableWork,
    likelyProblems: [
      `你可能不是做不了，而是每天都要用意志力顶着做，越做越不敢轻松判断。`,
      `长期下来容易怀疑自己，其实问题可能是环境长期踩中你的消耗点。`,
      `如果团队还把这种消耗包装成“成长”“抗压”“主人翁精神”，你会更难及时抽身。`
    ],
    howToCheck: [
      "问真实工作日程：一天里会议、执行、汇报各占多少",
      "问离职原因：前任为什么走，团队最常见冲突是什么",
      `拿${tone.plainName}做筛选题：${tone.validation}`,
      "要求对方举一个最近项目例子：目标怎么定、资源怎么给、结果怎么评价"
    ]
  };
}

function buildNinetyDayPlan(report: CareerReport) {
  const topTrack = report.recommendedCareerTracks[0]?.trackName ?? "最匹配方向";
  const top = topAnalyses(report);
  const low = lowAnalyses(report);
  const topNames = top.map((item) => item.dimensionName).join("、");
  const lowLosses = low.map((item) => getToneProfile(item.dimension).loss).slice(0, 2).join("；");
  return {
    month1: `第 1 个月别急着跳槽，先把「${topTrack}」拆清楚：找 3 位从业者聊真实日常，记录他们每天做什么、谁拍板、结果怎么算、最累的点是什么。月底只做一个判断：这个方向是真适合，还是只是名字好听。`,
    month2: `第 2 个月做一个低成本项目，专门验证你的${topNames || "明显倾向"}。目标不是做大，而是做完整：有任务、有交付、有反馈。做完以后看自己是越做越有劲，还是靠硬撑完成。`,
    month3: `第 3 个月做路径选择：如果项目反馈好，就把${topTrack}作为主线继续投简历或补作品；如果反馈一般，就保留其中有用能力，换岗位层级、组织类型或相邻赛道；如果明显消耗，就及时止损。特别注意：${lowLosses}。`,
    weeklyActions: [
      `每周访谈 1 位${topTrack}相关从业者`,
      "每周更新一次岗位筛选表：任务、权责、收入、消耗",
      "每周沉淀 1 个可展示成果或复盘截图",
      "每周记录 1 次高能量任务和 1 次明显消耗任务"
    ],
    weeklyDetails: [
      "访谈不要只问前景，要问最烦、最累、最容易踩坑的日常。",
      "岗位筛选表至少写清：谁负责、谁拍板、怎么评价、加班是否常态。",
      "成果可以很小，但必须能给别人看，比如分析页、方案、流程图、复盘文档。",
      "能量记录要写具体场景，不要只写开心或累。"
    ]
  };
}

function buildFinalAdvice(report: CareerReport, context?: ReportContext) {
  const track = report.recommendedCareerTracks[0];
  const topItems = topAnalyses(report);
  const top = topItems
    .map((item) => `${item.dimensionName}更靠近「${getDimensionTendency(item).sideLabel}」`)
    .join("、");
  const centered = [...report.dimensionAnalyses]
    .sort((a, b) => getDimensionTendency(a).strength - getDimensionTendency(b).strength)
    .slice(0, 3)
    .map((item) => `${item.dimensionName}接近「${getDimensionTendency(item).sideLabel}」`)
    .join("、");
  const roles = track?.suitableRoles.slice(0, 3).join("、") || track?.trackName || "首推方向";
  const trackNames = report.recommendedCareerTracks
    .slice(0, 3)
    .map((item) => item.trackName)
    .join("、");
  const risks = report.careerRiskZones
    .slice(0, 3)
    .map((item) => item.title.replace(/相关消耗区$/, ""))
    .join("、");
  const riskQuestions = report.careerRiskZones
    .slice(0, 2)
    .map((item) => item.uniqueAvoidAction || item.avoidSuggestion)
    .filter(Boolean)
    .join("；");
  const userContext = [
    context?.basicInfo.status ? `你当前的职业状态是「${context.basicInfo.status}」。` : "",
    context?.basicInfo.occupation ? `你填写的当前职业/方向是「${context.basicInfo.occupation}」。` : "",
    context?.basicInfo.biggestConfusion ? `你写下的核心困惑是「${context.basicInfo.biggestConfusion}」。` : "",
    context?.basicInfo.incomeGoal ? `你也提到现实目标是「${context.basicInfo.incomeGoal}」。` : ""
  ].filter(Boolean).join("");

  return `先把结论收小一点：
前面所有内容可以先压缩成一句可执行的话：你要优先找「${roles}」这类能把目标、责任、拍板人和交付标准说清楚的工作场景。这个判断来自你的明显倾向：${top || "几个关键维度已经明显偏向一侧"}。${centered ? `同时，${centered}，说明你不是完全不能适应变化，只是不能长期待在规则混乱、沟通低效、责任和资源错位的环境里。` : ""}${userContext}

怎么筛岗位：
以后看岗位时，先不要问“这个职业听起来好不好”，先问 8 个更实际的问题。第一，这个岗位每天最常做的 3 件事是什么。第二，遇到分歧时谁最终拍板。第三，任务目标、负责人、截止时间和交付标准是不是提前说清。第四，加班、群消息、临时需求是不是常态。第五，做完事情有没有复盘和反馈。第六，收入结构是稳定底薪、绩效浮动、项目奖金还是不确定提成。第七，出了问题是团队一起修流程，还是让执行者一个人兜底。第八，这个岗位能不能沉淀作品、流程、案例或方法，而不是只消耗体力和情绪。能答清楚 6 个以上，再进入下一轮；答不清，就先别被标题和平台光环带走。

怎么做验证：
接下来不用立刻做大决定，先做一个 30 天验证。第 1 周，把「${trackNames || "推荐赛道"}」里最想看的 2 个方向各找 3 条招聘 JD，圈出共同任务，不看福利话术，只看日常动作。第 2 周，访谈 2-3 位从业者，问题要问细：一天多少会议，多少独立产出，谁给反馈，最烦的协作是什么，最常见的背锅点是什么。第 3 周，做一个小作品或模拟项目，比如项目推进表、流程优化方案、复盘模板、风险清单、客户沟通脚本。第 4 周，拿结果做复盘：你是越拆越清楚，还是越做越烦；你是愿意继续优化，还是只想赶紧结束。

怎么判断去留：
建议你用四个信号判断方向要不要继续。第一个是启动信号：看到这类任务时，你是否愿意主动开始，而不是靠逼自己。第二个是清晰信号：做的过程中，你能不能把混乱信息拆成步骤。第三个是能量信号：和人协作以后，你是有推进感，还是只剩消耗感。第四个是现实信号：收入、成长、生活边界能不能同时接受。如果四项里有三项成立，可以继续加码；如果只成立一项，先别急着押注；如果连续两周都靠忍耐完成，说明这个方向或组织形态需要调整。

怎么避免踩坑：
你最需要防的不是“选错一个职业名称”，而是选到一个日常条件长期反着来的环境。${risks ? `当前最要留意的消耗点是${risks}。` : ""}这些问题通常不会写在 JD 里，所以要靠提问和试做识别。面试时可以追问最近一个项目怎么失败、谁复盘、资源怎么补、前任为什么离开；试岗或兼职时要记录需求变更频率、会议密度、反馈速度和下班后响应要求。${riskQuestions ? `也可以直接用这两条做筛选：${riskQuestions}。` : ""}如果对方一直讲愿景，却说不清任务、权限、资源和评价方式，就先降级处理。

最后给你一个更实际的动作：
建一个“职业方向决策表”，列 5 列：岗位名称、真实日常、能量变化、收入结构、风险信号。每访谈一个人、看一个 JD、做一次小项目，就更新一次。一个方向连续出现 3 次正向证据，再考虑投入课程、作品集或投递；一个方向连续出现 2 次明显消耗，就不要硬撑。你真正要找的不是完美工作，而是一个让你能稳定产出、持续成长、少被无效消耗拖住的工作系统。`;
}

function buildConversationalOverview(report: CareerReport, context?: ReportContext) {
  const strongest = topAnalyses(report);
  const topQuestions = strongest
    .map((item) => {
      const tone = getToneProfile(item.dimension);
      return `${tone.plainName}：${tone.validation}`;
    })
    .join("\n");
  const track = report.recommendedCareerTracks[0];
  const roles = track?.suitableRoles.slice(0, 3).join("、") || track?.trackName || "当前最值得验证的方向";
  const target = context?.basicInfo.incomeGoal ? `你写下的收入或现实目标是「${context.basicInfo.incomeGoal}」。` : "";
  const confusion = context?.basicInfo.biggestConfusion ? `你现在最困惑的是「${context.basicInfo.biggestConfusion}」。` : "";
  const topText = strongest
    .map((item) => `${item.dimensionName}靠近「${getDimensionTendency(item).sideLabel}」`)
    .join("、");
  const centeredText = [...report.dimensionAnalyses]
    .sort((a, b) => getDimensionTendency(a).strength - getDimensionTendency(b).strength)
    .slice(0, 3)
    .map((item) => `${item.dimensionName}弹性较大`)
    .join("、");
  const trackSummary = report.recommendedCareerTracks
    .slice(0, 3)
    .map((item) => `${item.trackName}（${item.suitableRoles.slice(0, 3).join("、")}）`)
    .join("；");

  return `这份报告建议你先当成一张岗位筛选表来看。14 个维度不是为了给你贴标签，而是把职业选择里最容易被忽略的条件拆开：钱和回报怎么算、成长是不是有台阶、认可从哪里来、沟通会不会过量、边界是不是清楚、谁能拍板、反馈来得快不快、规则和底线能不能守住。真正影响你长期状态的，往往不是岗位名称，而是这些条件每天怎么落到任务里。

从这份问卷看，最需要优先验证的是：${topText || "几个明显倾向"}。这些倾向越明显，越说明它们会强烈影响你的工作体感：条件对上时，你会更容易稳定投入；条件反着来时，你可能不是做不了，而是每天都要额外消耗精力。相对可以灵活调整的是：${centeredText || "部分居中的维度"}，这些项目不用过度放大，可以等到具体岗位场景里再细看。

${confusion}${target} 接下来建议先看「${roles}」这类具体职业，扩展候选可以包括：${trackSummary || "报告里的推荐赛道"}。不要只看招聘标题，要拆日常：每天做什么、跟谁协作、谁能拍板、出了问题谁兜底、做完多久有反馈。如果一个岗位能把目标、资源、责任、节奏和反馈说清楚，它就更值得进入下一轮验证；如果一个岗位只给你漂亮 title，却说不清真实日常，就先降低优先级。

可以直接拿下面这些问题去问从业者或面试官：
${topQuestions}

读后面的赛道、组合和风险区时，也建议你带着同一套问题看：这个方向能不能让你的明显倾向变成产出？它会不会长期踩中你的消耗点？它能不能支撑你现实中的收入、成长和生活边界？当这三个答案都比较清楚时，职业选择就不再只是凭感觉下注，而是变成一组可以验证的方向假设。`;
}

function combinationText(item: CareerReport["coreStrengthCombinations"][number]) {
  return [
    item.analysis,
    item.riskReminder,
    item.plainSummary,
    item.whyItMatters,
    item.validationTask,
    item.personalityAnalysis,
    item.careerFitAnalysis,
    item.roleFitDetails?.join(""),
    item.workStyleFit,
    item.growthPotential,
    item.mismatchWarning,
    item.validationPlan,
    item.suitableScenarios.join("")
  ].join("\n");
}

function combinationChineseChars(report: CareerReport) {
  return report.coreStrengthCombinations.reduce(
    (sum, item) => sum + countChineseCharsText(combinationText(item)),
    0
  );
}

function isCombinationShallow(item: CareerReport["coreStrengthCombinations"][number]) {
  return (
    countChineseCharsText(combinationText(item)) < 520 ||
    !item.personalityAnalysis ||
    !item.careerFitAnalysis ||
    !item.workStyleFit ||
    !item.growthPotential ||
    !item.mismatchWarning ||
    !item.validationPlan ||
    !item.roleFitDetails?.length
  );
}

function buildCombinationSupplement(
  item: CareerReport["coreStrengthCombinations"][number],
  index: number,
  pass: number,
  report: CareerReport
) {
  const track = report.recommendedCareerTracks[index] ?? report.recommendedCareerTracks[0];
  const roles = track?.suitableRoles?.slice(0, 3) ?? [];
  const roleA = roles[0] ?? track?.trackName ?? "候选岗位";
  const roleB = roles[1] ?? "相邻岗位";
  const roleC = roles[2] ?? "延展岗位";
  const relatedAnalyses = item.relatedDimensions
    .map((dimension) => report.dimensionAnalyses.find((analysis) => analysis.dimension === dimension))
    .filter(Boolean) as CareerReport["dimensionAnalyses"];
  const anchors = (relatedAnalyses.length ? relatedAnalyses : topAnalyses(report).slice(index, index + 3))
    .slice(0, 3)
    .map((dimension) => {
      const tendency = getDimensionTendency(dimension);
      const tone = getToneProfile(dimension.dimension);
      return {
        name: dimension.dimensionName,
        side: tendency.sideLabel,
        environment: tone.environment,
        loss: tone.loss,
        validation: tone.validation
      };
    });
  const primary = anchors[0];
  const secondary = anchors[1];
  const third = anchors[2];

  const careerAngles = [
    `如果把「${item.title}」放进具体职业里看，第一层不是问“我喜不喜欢${track?.trackName ?? "这个方向"}”，而是看岗位日常有没有给你发挥条件。${roleA}更适合用来验证目标拆解和节点推进：你要看自己面对模糊需求时，是愿意把它拆成任务、负责人、截止时间和风险点，还是很快被反复协调拖垮。${roleB}更适合验证流程感和协作边界：如果你能把混乱沟通整理成规则、模板和检查点，这说明组合优势能转成可交付成果。${roleC}则可以验证你是否能把一次项目经验沉淀成方法，而不是只靠临场反应硬撑。`,
    `从岗位类型看，你更适合“有目标、有资源、有复盘”的组织，而不是只靠个人责任感兜底的岗位。${primary ? `${primary.name}靠近「${primary.side}」说明你很在意${primary.environment}；` : ""}${secondary ? `${secondary.name}靠近「${secondary.side}」会影响你跟人协作和判断边界的方式；` : ""}${third ? `${third.name}靠近「${third.side}」会决定你在压力和反馈里能不能持续。` : ""}所以同样是${roleA}，成熟团队里的项目推进可能很适合你，但权责不清、流程混乱、每天临时救火的岗位就会明显打折。`,
    `职业适配不要停在职位名称上，而要拆到一天怎么过。适配你的${roleA}，通常会有清楚目标、明确拍板人、阶段复盘和能被看见的交付；不适配的${roleA}，常常是开会很多、需求天天变、资源不给足、最后让你兜底。适配你的${roleB}，会把沟通变成流程和规则；不适配的${roleB}，会让你陷入低效人情协调。适配你的${roleC}，会让你沉淀作品或方法；不适配的${roleC}，只会让你不断救急却没有成长证据。`
  ];
  const validationAngles = [
    `30 天验证可以分成四步：第 1 周访谈 2 位${roleA}或${roleB}从业者，重点问“每天最常见的任务是什么、谁最后拍板、出了问题怎么复盘”；第 2 周拿一个小项目写推进表，把目标、负责人、截止时间、风险和反馈方式列出来；第 3 周真实推进或模拟推进一次，记录自己是在拆清问题，还是被沟通和变更耗掉；第 4 周做取舍，如果你对任务越拆越清楚、对复盘越做越有判断，就继续加码，否则换组织类型或相邻岗位。`,
    `验证这组组合时，建议记录四类证据。第一是启动感：看到任务时你是否愿意主动开始。第二是清晰感：推进过程中你能否把混乱信息拆成可执行步骤。第三是协作感：跟人沟通后你是更有掌控感，还是被人情和边界拖住。第四是复盘感：做完以后你是否愿意继续优化。四类证据有三类成立，说明方向值得继续；如果主要靠平台光环、短期收入或外部评价撑着，就先不要重仓。`,
    `也可以用一次“反向验证”。找一个看起来相似但条件不理想的岗位 JD，专门检查它有没有这些雷点：目标频繁变、拍板人不清、沟通对象过多、反馈慢、收入结构含糊、加班边界不明。再拿一个条件更清楚的岗位对照比较。你要看的不是哪个名字更好听，而是哪一个更符合${anchors.map((anchor) => `${anchor.name}靠近「${anchor.side}」`).join("、")}这些问卷信号。`
  ];
  return {
    careerFitAnalysis: careerAngles[pass % careerAngles.length],
    validationPlan: validationAngles[pass % validationAngles.length]
  };
}

function fillCombinationDepth(report: CareerReport): CareerReport {
  let next = cloneReport(report);
  const totalTooShort = combinationChineseChars(next) < MIN_COMBINATION_CHINESE_CHARS;
  next.coreStrengthCombinations = next.coreStrengthCombinations.map((item, index) => {
    if (!totalTooShort && !isCombinationShallow(item)) return item;
    const fallback = buildCombinationFields(item, index, next);
    return {
      ...item,
      plainSummary: item.plainSummary && countChineseCharsText(item.plainSummary) > 60 ? item.plainSummary : fallback.plainSummary,
      whyItMatters: item.whyItMatters && countChineseCharsText(item.whyItMatters) > 100 ? item.whyItMatters : fallback.whyItMatters,
      validationTask: item.validationTask && countChineseCharsText(item.validationTask) > 80 ? item.validationTask : fallback.validationTask,
      personalityAnalysis:
        item.personalityAnalysis && countChineseCharsText(item.personalityAnalysis) > 100
          ? item.personalityAnalysis
          : fallback.personalityAnalysis,
      careerFitAnalysis:
        item.careerFitAnalysis && countChineseCharsText(item.careerFitAnalysis) > 100
          ? item.careerFitAnalysis
          : fallback.careerFitAnalysis,
      roleFitDetails: item.roleFitDetails?.length ? item.roleFitDetails : fallback.roleFitDetails,
      workStyleFit:
        item.workStyleFit && countChineseCharsText(item.workStyleFit) > 80 ? item.workStyleFit : fallback.workStyleFit,
      growthPotential:
        item.growthPotential && countChineseCharsText(item.growthPotential) > 80
          ? item.growthPotential
          : fallback.growthPotential,
      mismatchWarning:
        item.mismatchWarning && countChineseCharsText(item.mismatchWarning) > 80
          ? item.mismatchWarning
          : fallback.mismatchWarning,
      validationPlan:
        item.validationPlan && countChineseCharsText(item.validationPlan) > 120
          ? item.validationPlan
          : fallback.validationPlan
    };
  });

  if (combinationChineseChars(next) >= MIN_COMBINATION_CHINESE_CHARS) return next;

  let pass = 0;
  while (combinationChineseChars(next) < MIN_COMBINATION_CHINESE_CHARS && pass < 4) {
    next.coreStrengthCombinations = next.coreStrengthCombinations.map((item, index) => {
      const supplement = buildCombinationSupplement(item, index, pass, next);
      return {
        ...item,
        validationPlan: uniqueAppend(item.validationPlan ?? "", supplement.validationPlan),
        careerFitAnalysis: uniqueAppend(item.careerFitAnalysis ?? "", supplement.careerFitAnalysis)
      };
    });
    pass += 1;
  }

  return next;
}

function ensureConversationalFields(report: CareerReport, context?: ReportContext): CareerReport {
  let next = cloneReport(report);
  const shouldRefreshPlainProfile =
    !next.plainLanguageProfile?.oneLine ||
    next.plainLanguageProfile.oneLine.includes("的地方的地方") ||
    next.plainLanguageProfile.oneLine.includes("更适合在能发挥") ||
    next.plainLanguageProfile.oneLine.includes("好好发展") ||
    normalizeForCompare(next.plainLanguageProfile.oneLine).length > 120 ||
    next.plainLanguageProfile.oneLine.includes("一句话") ||
    next.plainLanguageProfile.oneLine.includes("大白话");

  const plainLanguageProfile = !shouldRefreshPlainProfile
    ? next.plainLanguageProfile
    : buildPlainLanguageProfile(next);
  next.plainLanguageProfile = plainLanguageProfile;
  next.oneSentenceProfile = plainLanguageProfile?.oneLine || next.oneSentenceProfile;

  if (
    hasMechanicalTone(next.overallSummary) ||
    next.overallSummary.includes("这份报告不是在说") ||
    next.overallSummary.includes("最明显的几项是") ||
    next.overallSummary.includes("高分") ||
    next.overallSummary.includes("低分") ||
    next.overallSummary.includes("优势维度") ||
    countChineseCharsText(next.overallSummary) < 650
  ) {
    next.overallSummary = buildConversationalOverview(next, context);
  }

  next.dimensionAnalyses = next.dimensionAnalyses.map((dimension) => {
    const fields = buildDimensionHumanFields(dimension);
    const shouldRefreshDimensionText =
      !dimension.userConclusion ||
      !dimension.plainExplanation ||
      dimension.plainExplanation.includes("遇到接那种") ||
      dimension.userConclusion.includes("大白话") ||
      dimension.userConclusion.includes("原始分") ||
      dimension.userConclusion.includes("明显度") ||
      dimension.baseConclusion.includes("明显度") ||
      hasMechanicalTone(dimension.userConclusion) ||
      hasMechanicalTone(dimension.plainExplanation ?? "");
    return {
      ...dimension,
      userConclusion: shouldRefreshDimensionText ? fields.userConclusion : dimension.userConclusion,
      plainExplanation: shouldRefreshDimensionText ? fields.plainExplanation : dimension.plainExplanation,
      suitableWork: dimension.suitableWork?.length ? dimension.suitableWork : fields.suitableWork,
      unsuitableWork: dimension.unsuitableWork?.length ? dimension.unsuitableWork : fields.unsuitableWork,
      nextValidation: dimension.nextValidation || fields.nextValidation
    };
  });

  next.coreStrengthCombinations = next.coreStrengthCombinations.map((item, index) => {
    const text = [
      item.analysis,
      item.riskReminder,
      item.plainSummary,
      item.whyItMatters,
      item.validationTask,
      item.personalityAnalysis,
      item.careerFitAnalysis,
      item.workStyleFit,
      item.growthPotential,
      item.mismatchWarning,
      item.validationPlan
    ].join("");
    const shouldRefresh =
      !item.plainSummary ||
      !item.whyItMatters ||
      !item.validationTask ||
      isCombinationShallow(item) ||
      hasMechanicalTone(text) ||
      hasRepeatedSentence(text) ||
      text.includes("补充职业适配") ||
      text.includes("补充验证") ||
      text.includes("组合优势") ||
      text.includes("更强");
    return {
      ...item,
      ...(shouldRefresh ? buildCombinationFields(item, index, next) : {})
    };
  });
  next = fillCombinationDepth(next);

  next.careerRiskZones = next.careerRiskZones.map((zone, index) => {
    const text = [
      zone.reason,
      zone.avoidSuggestion,
      zone.concreteScenarios?.join(""),
      zone.likelyProblems?.join(""),
      zone.uniqueAvoidAction
    ].join("");
    const shouldRefresh =
      !zone.concreteScenarios?.length ||
      !zone.likelyProblems?.length ||
      !zone.uniqueAvoidAction ||
      hasMechanicalTone(text) ||
      text.includes("岗位天天靠临时沟通") ||
      text.includes("当岗位长期要求") ||
      text.includes("一旦被岗位日常反复踩中");
    return {
      ...zone,
      ...(shouldRefresh ? buildRiskFields(zone, index, next) : {})
    };
  });

  next.recommendedCareerTracks = next.recommendedCareerTracks.map((track, index) => {
    const fields = buildTrackFields(track, index);
    const text = [
      track.whySuitable,
      track.first90DaysValidation,
      track.riskAndCorrection,
      track.plainWhy,
      track.firstStepAction,
      track.validationSteps?.join(""),
      track.riskCorrectionSteps?.join("")
    ].join("");
    const shouldRefresh =
      !track.plainWhy ||
      !track.firstStepAction ||
      !track.validationSteps?.length ||
      !track.riskCorrectionSteps?.length ||
      countChineseCharsText(track.plainWhy ?? track.whySuitable) < 180 ||
      (track.plainWhy ?? "").startsWith("这个方向适合") ||
      text.includes("这个方向适合") ||
      hasMechanicalTone(text) ||
      hasRepeatedSentence(text);
    return {
      ...track,
      ...(shouldRefresh
        ? {
            ...fields,
            whySuitable: fields.plainWhy,
            first90DaysValidation: fields.validationSteps.join("；"),
            riskAndCorrection: fields.riskCorrectionSteps.join("；")
          }
        : {})
    };
  });

  next.notRecommendedEnvironments = next.notRecommendedEnvironments.map((item, index) => {
    const text = [
      item.reason,
      item.environment,
      item.howToIdentify,
      item.avoidRoles?.join(""),
      item.likelyProblems?.join(""),
      item.howToCheck?.join("")
    ].join("");
    const shouldRefresh =
      !item.avoidRoles?.length ||
      !item.likelyProblems?.length ||
      !item.howToCheck?.length ||
      hasMechanicalTone(text);
    return {
      ...item,
      ...(shouldRefresh ? buildNotRecommendedFields(item, index, next) : {})
    };
  });

  if (!next.ninetyDayActionPlan.weeklyDetails?.length || hasMechanicalTone(next.ninetyDayActionPlan.month3)) {
    next.ninetyDayActionPlan = buildNinetyDayPlan(next);
  }

  if (
    hasMechanicalTone(next.finalAdvice) ||
    hasRepeatedSentence(next.finalAdvice) ||
    next.finalAdvice.includes("整份报告最重要的意思是") ||
    next.finalAdvice.includes("这份报告最重要的依据不是某一个分数") ||
    next.finalAdvice.includes("适合往哪里走：") ||
    next.finalAdvice.includes("为什么这样判断：") ||
    countChineseCharsText(next.finalAdvice) < 1500
  ) {
    next.finalAdvice = buildFinalAdvice(next, context);
  }

  return next;
}

function hasMechanicalTone(text: string) {
  const phrases = [
    "得分为",
    "目前处在",
    "不是一个孤立分数",
    "建议放到真实任务里看",
    "更适合在能发挥",
    "需要主动管理",
    "大白话",
    "一句话",
    "优势指数",
    "明显度",
    "原始分",
    "翻译成人话",
    "能力高低",
    "高分",
    "低分",
    "高分维度",
    "低分维度",
    "组合优势",
    "high区间",
    "medium区间",
    "low区间",
    "这个维度需要被理解为",
    "当岗位长期放大",
    "当岗位长期要求",
    "一旦被岗位日常反复踩中"
  ];
  return phrases.some((phrase) => text.includes(phrase));
}

function hasRepeatedSentence(text: string) {
  const seen = new Set<string>();
  for (const sentence of splitSentences(text)) {
    const key = normalizeForCompare(sentence);
    if (key.length < 18) continue;
    if (seen.has(key)) return true;
    seen.add(key);
  }
  return false;
}

function countMechanicalTone(report: CareerReport) {
  return (reportText(report).match(/得分为|目前处在|不是一个孤立分数|建议放到真实任务里看|更适合在能发挥|需要主动管理|大白话|一句话|优势指数|原始分|翻译成人话|能力高低|高分|低分|组合优势|当岗位长期要求|当岗位长期放大|一旦被岗位日常反复踩中/g) ?? []).length;
}

function countDuplicateMeaning(items: string[]) {
  const seen = new Set<string>();
  let repeated = 0;
  for (const item of items) {
    const key = normalizeForCompare(item).slice(0, 70);
    if (key.length < 24) continue;
    if (seen.has(key)) repeated += 1;
    seen.add(key);
  }
  return repeated;
}

export function reportNeedsAiRepair(report: CareerReport) {
  const trackValidationTexts = report.recommendedCareerTracks.map((track) =>
    normalizeForCompare(track.first90DaysValidation + (track.validationSteps ?? []).join(""))
  );
  const uniqueTrackValidation = new Set(trackValidationTexts.filter(Boolean));
  const riskTexts = report.careerRiskZones.map((zone) =>
    normalizeForCompare(zone.avoidSuggestion + (zone.uniqueAvoidAction ?? ""))
  );
  const uniqueRisks = new Set(riskTexts.filter(Boolean));
  const repeatedRiskScenarios = countDuplicateMeaning(
    report.careerRiskZones.flatMap((zone) => [
      zone.reason,
      zone.avoidSuggestion,
      ...(zone.concreteScenarios ?? []),
      ...(zone.likelyProblems ?? [])
    ])
  );
  const repeatedEnvironmentItems = countDuplicateMeaning(
    report.notRecommendedEnvironments.flatMap((item) => [
      item.reason,
      item.howToIdentify,
      ...(item.avoidRoles ?? []),
      ...(item.likelyProblems ?? []),
      ...(item.howToCheck ?? [])
    ])
  );
  return (
    countRepeatedParagraphs(report) > 0 ||
    countMechanicalTone(report) > 3 ||
    reportText(report).includes("补充职业适配") ||
    reportText(report).includes("补充验证") ||
    combinationChineseChars(report) < MIN_COMBINATION_CHINESE_CHARS ||
    countChineseCharsText(report.finalAdvice) < 1500 ||
    countChineseCharsText(report.overallSummary) < 650 ||
    uniqueTrackValidation.size < Math.min(3, trackValidationTexts.length) ||
    uniqueRisks.size < Math.min(3, riskTexts.length) ||
    repeatedRiskScenarios > 1 ||
    repeatedEnvironmentItems > 1
  );
}

function isGenericListItem(item: string) {
  const genericPhrases = [
    "能识别",
    "愿意在合适条件下",
    "可以把偏好",
    "长期处在反向环境",
    "容易把环境不适配",
    "用真实项目验证",
    "面试时主动询问团队节奏",
    "把短期收入与长期成长"
  ];
  return genericPhrases.some((phrase) => item.includes(phrase));
}

function mergeProfileList(existing: string[], preferred: string[], limit = 4) {
  const usefulExisting = existing.filter((item) => item && !isGenericListItem(item));
  return Array.from(new Set([...preferred, ...usefulExisting])).slice(0, limit);
}

function enhanceDimensionSignals(
  dimension: CareerReport["dimensionAnalyses"][number]
): CareerReport["dimensionAnalyses"][number] {
  const profile = getDimensionProfile(dimension.dimension);
  if (!profile) return dimension;
  return {
    ...dimension,
    strengths: mergeProfileList(dimension.strengths, profile.strengths, 4),
    risks: mergeProfileList(dimension.risks, profile.risks, 4),
    suggestions: mergeProfileList(dimension.suggestions, profile.suggestions, 5)
  };
}

export function cleanReportTextFields(report: CareerReport): CareerReport {
  return mapStringFields(cloneReport(report), cleanText);
}

export function countRepeatedParagraphs(report: CareerReport) {
  let repeated = 0;
  const texts = reportText(report)
    .split(/\n+/)
    .map((item) => item.trim())
    .filter((item) => normalizeForCompare(item).length > 28);
  const seen = new Set<string>();
  for (const text of texts) {
    const key = normalizeForCompare(text);
    if (seen.has(key)) repeated += 1;
    seen.add(key);
  }
  return repeated;
}

export function ensureReadableLength(
  report: CareerReport,
  context?: ReportContext,
  minChineseChars = MIN_READABLE_CHINESE_CHARS
): CareerReport {
  let next = ensureConversationalFields(cleanReportTextFields(report), context);
  next.dimensionAnalyses = next.dimensionAnalyses.map((dimension, index) => {
    const expansion = buildDimensionExpansion(dimension, index, context);
    const genericWorkplace =
      dimension.workplaceManifestation.includes("这个维度会体现在你如何接任务") ||
      dimension.workplaceManifestation.includes("通常会体现在你如何接任务") ||
      dimension.workplaceManifestation.includes("如何接任务、如何安排优先级") ||
      normalizeForCompare(dimension.workplaceManifestation).length < 80;
    const genericInsight =
      dimension.personalizedInsight.includes("这个结果不代表能力高低") ||
      normalizeForCompare(dimension.personalizedInsight).length < 100;

    return enhanceDimensionSignals({
      ...dimension,
      personalizedInsight: genericInsight
        ? expansion.insight
        : dimension.personalizedInsight,
      workplaceManifestation: genericWorkplace
        ? uniqueAppend("", expansion.manifestation)
        : dimension.workplaceManifestation,
      suggestions: Array.from(new Set([...dimension.suggestions, expansion.action])).slice(0, 5)
    });
  });

  let pass = 0;

  while (countChineseCharsInReport(next) < minChineseChars && pass < 4) {
    next.overallSummary = uniqueAppend(
      next.overallSummary,
      buildOverviewExpansion(next, context)
    );

    next.dimensionAnalyses = next.dimensionAnalyses.map((dimension, index) => {
      const expansion = buildDimensionExpansion(dimension, index + pass * 3, context);
      return enhanceDimensionSignals({
        ...dimension,
        personalizedInsight: uniqueAppend(dimension.personalizedInsight, expansion.insight),
        workplaceManifestation: uniqueAppend(
          dimension.workplaceManifestation,
          expansion.manifestation
        ),
        suggestions: Array.from(new Set([...dimension.suggestions, expansion.action])).slice(0, 5)
      });
    });

    next.recommendedCareerTracks = next.recommendedCareerTracks.map((track, index) => ({
      ...track,
      whySuitable: uniqueAppend(
        track.whySuitable,
        `验证「${track.trackName}」时，不要只看它听起来是否体面，而要看你是否能在真实任务中持续产出。第 ${index + 1} 个候选方向建议用一个小作品、一次信息访谈和一次复盘表来判断。`
      ),
      first90DaysValidation: uniqueAppend(
        track.first90DaysValidation,
        `第一个月确认任务样貌，第二个月完成可展示成果，第三个月比较收入、成长、消耗和机会成本，再决定是否加码。`
      )
    }));

    next.finalAdvice = uniqueAppend(next.finalAdvice, buildFinalExpansion(next));
    pass += 1;
    next = ensureConversationalFields(cleanReportTextFields(next), context);
  }

  return ensureConversationalFields(next, context);
}
