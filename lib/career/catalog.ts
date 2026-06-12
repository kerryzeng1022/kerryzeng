export type CareerFamilyDefinition = {
  id: string;
  name: string;
  description: string;
  roles: string[];
  interestTags: string[];
  capabilityTags: string[];
  workStyleTargets: Record<string, number>;
  coreTasks: string[];
  entryPath: string;
  validationActions: string[];
  adjacentFamilies: string[];
  requirements?: string[];
  regulatedRoles?: string[];
  requiresShifts?: boolean;
  requiresRiskTolerance?: boolean;
};

export type CareerRoleDefinition = Omit<CareerFamilyDefinition, "roles" | "regulatedRoles"> & {
  roleId: string;
  roleTitle: string;
  regulated: boolean;
};

const families: CareerFamilyDefinition[] = [
  {
    id: "healthcare_clinical",
    name: "医疗健康与临床照护",
    description: "以健康、诊断、照护和严谨记录为核心的专业服务。",
    roles: ["临床医生", "注册护士", "药师", "牙医", "物理治疗师", "医学影像技师", "医学检验技师", "助产士", "临床营养师", "公共卫生医师"],
    interestTags: ["health", "care", "science"],
    capabilityTags: ["care", "analysis"],
    workStyleTargets: { thinking_granularity: 82, moral_threshold: 88, information_processing: 78, boundary_clarity: 55, pressure_rhythm: 68 },
    coreTasks: ["依据证据判断健康问题", "与患者及团队沟通", "执行严谨记录与安全流程"],
    entryPath: "先核验所在地教育、实习和执业要求，再通过课程旁听、从业者访谈或医疗服务志愿经历验证。",
    validationActions: ["访谈两位不同岗位的医疗从业者", "完成一门基础健康科学课程", "记录自己对照护、记录和高责任场景的真实反应"],
    adjacentFamilies: ["social_service", "data_research", "sports_wellness"],
    requirements: ["相关专业教育或训练", "所在地要求的执业资格", "持续学习与严格合规"],
    regulatedRoles: ["临床医生", "注册护士", "药师", "牙医", "物理治疗师", "医学影像技师", "医学检验技师", "助产士", "公共卫生医师"],
    requiresShifts: true
  },
  {
    id: "legal_compliance",
    name: "法律、合规与争议解决",
    description: "围绕规则、证据、论证和风险边界形成专业判断。",
    roles: ["律师", "法官助理", "检察事务助理", "企业法务", "合规经理", "合同管理专员", "知识产权顾问", "劳动关系顾问", "调解员", "法律研究员"],
    interestTags: ["law", "public_service"],
    capabilityTags: ["argument", "analysis"],
    workStyleTargets: { thinking_granularity: 84, information_processing: 84, drive_logic: 82, moral_threshold: 86, social_energy: 58 },
    coreTasks: ["研究规则与事实", "形成可辩护的观点", "管理合同、合规或争议风险"],
    entryPath: "先用案例分析和法律检索验证兴趣，再核验学历、考试与当地执业要求。",
    validationActions: ["完成一份真实案例分析", "访谈律师与企业法务各一位", "体验法律检索或合规审查任务"],
    adjacentFamilies: ["finance_risk", "government_public_admin", "data_research"],
    requirements: ["部分岗位要求法律教育背景", "律师等岗位需所在地执业资格"],
    regulatedRoles: ["律师"]
  },
  {
    id: "public_safety",
    name: "公共安全与应急响应",
    description: "在公共责任、现场判断和高压情境中保护秩序与安全。",
    roles: ["警察", "消防员", "应急管理专员", "安全调查员", "刑事技术人员", "交通安全专员", "灾害救援协调员", "企业安保主管", "公共安全分析员", "安全培训师"],
    interestTags: ["safety", "public_service"],
    capabilityTags: ["crisis", "analysis"],
    workStyleTargets: { pressure_rhythm: 82, power_execution: 72, moral_threshold: 88, social_energy: 62, boundary_clarity: 45 },
    coreTasks: ["快速评估风险", "按照程序处置现场问题", "承担公共沟通和团队协作"],
    entryPath: "先核验所在地招录、体能、背景和资格要求，再通过应急课程、志愿服务或安全岗位访谈验证。",
    validationActions: ["参加基础急救或应急课程", "访谈公共安全从业者", "测试自己对轮班、现场压力和程序纪律的接受度"],
    adjacentFamilies: ["government_public_admin", "healthcare_clinical", "operations_project"],
    requirements: ["所在地招录与背景要求", "部分岗位需要体能测试或专业资格", "可接受轮班与公共责任"],
    regulatedRoles: ["警察", "消防员", "刑事技术人员"],
    requiresShifts: true,
    requiresRiskTolerance: true
  },
  {
    id: "sales_business",
    name: "销售、商务与客户增长",
    description: "通过理解需求、建立信任和推进决策创造商业结果。",
    roles: ["大客户销售", "商务拓展经理", "解决方案顾问", "客户成功经理", "渠道经理", "销售运营", "房地产顾问", "招聘顾问", "保险顾问", "零售销售主管"],
    interestTags: ["business", "service"],
    capabilityTags: ["persuasion", "argument"],
    workStyleTargets: { social_energy: 84, feedback_cycle: 82, income_drive: 78, recognition_source: 72, pressure_rhythm: 68 },
    coreTasks: ["发现客户需求", "推动沟通与谈判", "对收入和客户结果负责"],
    entryPath: "从一次真实销售、合作或客户访谈任务开始，复盘转化和信任建立过程。",
    validationActions: ["完成十次客户需求访谈", "尝试销售一个真实产品或服务", "复盘拒绝、跟进和成交过程中的能量变化"],
    adjacentFamilies: ["entrepreneurship_management", "hospitality_service", "operations_project"]
  },
  {
    id: "technology_engineering",
    name: "技术、软件与工程研发",
    description: "通过技术知识、系统设计和持续迭代解决复杂问题。",
    roles: ["软件工程师", "前端工程师", "后端工程师", "移动端工程师", "云平台工程师", "网络工程师", "嵌入式工程师", "测试开发工程师", "信息安全工程师", "解决方案架构师"],
    interestTags: ["tech", "science"],
    capabilityTags: ["technical", "analysis"],
    workStyleTargets: { thinking_granularity: 82, growth_mode: 78, information_processing: 76, social_energy: 32, feedback_cycle: 58 },
    coreTasks: ["拆解技术问题", "构建并测试系统", "持续学习和维护可靠性"],
    entryPath: "选择一个可运行的小项目持续迭代，用作品和代码评审验证真实能力。",
    validationActions: ["完成一个可运行项目", "参与一次代码或方案评审", "访谈两位不同技术岗位从业者"],
    adjacentFamilies: ["data_research", "skilled_manufacturing", "operations_project"]
  },
  {
    id: "data_research",
    name: "数据、科研与专业研究",
    description: "从信息、实验和证据中发现规律并形成可靠结论。",
    roles: ["数据分析师", "数据科学家", "行业研究员", "用户研究员", "政策研究员", "实验室研究助理", "生物信息分析师", "市场研究员", "统计分析师", "战略咨询顾问"],
    interestTags: ["science", "finance", "tech"],
    capabilityTags: ["analysis", "technical"],
    workStyleTargets: { information_processing: 88, thinking_granularity: 86, drive_logic: 86, social_energy: 36, feedback_cycle: 38 },
    coreTasks: ["提出可验证问题", "整理分析数据与证据", "写出结构清晰的研究结论"],
    entryPath: "围绕一个真实问题完成研究报告、数据分析或实验复盘，并接受专业反馈。",
    validationActions: ["完成一份有数据来源的研究报告", "复现一个公开分析案例", "请从业者评审结论与方法"],
    adjacentFamilies: ["technology_engineering", "finance_risk", "legal_compliance"]
  },
  {
    id: "finance_risk",
    name: "金融、财务与风险管理",
    description: "管理数字、资金、规则和不确定性，保护组织的长期稳定。",
    roles: ["财务分析师", "会计", "审计师", "风险管理专员", "投资研究员", "信贷分析师", "税务顾问", "精算分析师", "反欺诈分析师", "资金管理专员"],
    interestTags: ["finance", "law"],
    capabilityTags: ["analysis", "argument"],
    workStyleTargets: { drive_logic: 88, thinking_granularity: 84, moral_threshold: 84, information_processing: 80, feedback_cycle: 42 },
    coreTasks: ["核对和解释财务信息", "识别风险与异常", "依据规则提出决策建议"],
    entryPath: "从财务报表分析、风险案例或资格课程开始，验证对数字和规则工作的耐心。",
    validationActions: ["完成一份公司财务分析", "体验审计或风控案例", "访谈财务与风险岗位从业者"],
    adjacentFamilies: ["legal_compliance", "data_research", "government_public_admin"],
    requirements: ["部分岗位偏好相关学历或专业资格"]
  },
  {
    id: "education_training",
    name: "教育、培训与学习发展",
    description: "把知识转化为他人能够理解、练习和成长的过程。",
    roles: ["中小学教师", "大学教学助理", "职业培训师", "课程研发", "学习设计师", "企业培训经理", "教育产品经理", "升学顾问", "特殊教育支持", "在线教育讲师"],
    interestTags: ["education", "care"],
    capabilityTags: ["teaching", "care"],
    workStyleTargets: { social_energy: 68, recognition_logic: 72, growth_mode: 74, feedback_cycle: 62, moral_threshold: 72 },
    coreTasks: ["解释知识并设计练习", "观察学习者反馈", "持续调整教学方法"],
    entryPath: "制作一节可交付课程并真实授课，再核验目标教育岗位所需资格。",
    validationActions: ["讲授一次 30 分钟课程", "制作一份学习活动设计", "收集并复盘学习者反馈"],
    adjacentFamilies: ["social_service", "creative_media", "operations_project"],
    requirements: ["部分学校岗位需教师资格或相关教育背景"],
    regulatedRoles: ["中小学教师"]
  },
  {
    id: "social_service",
    name: "社会服务、心理支持与社区工作",
    description: "通过倾听、资源连接和持续陪伴改善个人或社区处境。",
    roles: ["社会工作者", "社区服务专员", "心理服务助理", "就业服务顾问", "公益项目专员", "养老服务协调员", "儿童发展支持员", "残障服务协调员", "危机热线支持员", "志愿者运营"],
    interestTags: ["care", "public_service"],
    capabilityTags: ["care", "teaching"],
    workStyleTargets: { recognition_logic: 84, social_energy: 66, moral_threshold: 86, income_drive: 36, boundary_clarity: 68 },
    coreTasks: ["理解服务对象需要", "连接资源并跟进", "在清晰边界内提供支持"],
    entryPath: "通过志愿服务、公益项目或助理岗位验证长期面对复杂处境的意愿。",
    validationActions: ["参与一次持续性志愿服务", "访谈社会服务从业者", "复盘自己在帮助他人时的边界和能量"],
    adjacentFamilies: ["healthcare_clinical", "education_training", "government_public_admin"]
  },
  {
    id: "creative_media",
    name: "创意、内容与媒体传播",
    description: "通过文字、视觉、影像和体验设计影响受众。",
    roles: ["内容策划", "品牌策略师", "文案策划", "平面设计师", "交互设计师", "视频编导", "摄影师", "记者", "编辑", "游戏策划"],
    interestTags: ["creative", "business"],
    capabilityTags: ["creative", "persuasion"],
    workStyleTargets: { recognition_source: 82, feedback_cycle: 76, information_processing: 56, boundary_clarity: 62, growth_mode: 68 },
    coreTasks: ["理解受众并提出创意", "制作可传播的作品", "根据反馈持续优化表达"],
    entryPath: "围绕明确主题制作三件作品，用真实受众反馈而不是自我感觉评估。",
    validationActions: ["完成三件同主题作品", "获取真实受众反馈", "访谈不同创意岗位从业者"],
    adjacentFamilies: ["sales_business", "education_training", "technology_engineering"]
  },
  {
    id: "operations_project",
    name: "产品、项目与运营推进",
    description: "把目标拆成任务、资源、节奏和可交付结果。",
    roles: ["产品经理", "项目经理", "运营经理", "交付经理", "PMO 专员", "流程优化专员", "活动运营", "用户运营", "业务运营", "产品运营"],
    interestTags: ["operations", "business"],
    capabilityTags: ["analysis", "persuasion"],
    workStyleTargets: { power_execution: 78, pressure_rhythm: 72, social_energy: 66, boundary_clarity: 62, thinking_granularity: 60 },
    coreTasks: ["拆解目标与责任", "协调资源并跟进进度", "处理变化并复盘交付"],
    entryPath: "从一个跨角色的小项目开始，用里程碑、风险台账和结果复盘验证。",
    validationActions: ["独立推进一个有明确交付的小项目", "记录协调成本和权限缺口", "访谈产品、项目和运营岗位从业者"],
    adjacentFamilies: ["sales_business", "entrepreneurship_management", "supply_chain_logistics"]
  },
  {
    id: "hr_organization",
    name: "人力资源与组织发展",
    description: "围绕人才、组织机制和员工成长改善团队表现。",
    roles: ["招聘专员", "HRBP", "组织发展顾问", "薪酬绩效专员", "员工关系专员", "人才发展经理", "培训发展经理", "雇主品牌专员", "人力数据分析师", "人力资源运营"],
    interestTags: ["business", "care"],
    capabilityTags: ["persuasion", "teaching"],
    workStyleTargets: { social_energy: 74, recognition_logic: 78, information_processing: 62, moral_threshold: 72, boundary_clarity: 60 },
    coreTasks: ["理解人才和组织问题", "设计并推进人才机制", "处理多方沟通与敏感信息"],
    entryPath: "从招聘、访谈、培训或组织诊断小项目切入，积累可复盘案例。",
    validationActions: ["完成一次结构化访谈", "设计一个小型培训或人才项目", "访谈不同人力岗位从业者"],
    adjacentFamilies: ["education_training", "social_service", "operations_project"]
  },
  {
    id: "skilled_manufacturing",
    name: "制造、维修与技能工艺",
    description: "通过设备、材料、工艺和现场经验完成可靠交付。",
    roles: ["机械技术员", "电气技术员", "设备维修工程师", "数控技术员", "质量工程师", "生产工艺工程师", "汽车维修技师", "焊接技师", "工业自动化技术员", "现场服务工程师"],
    interestTags: ["tech", "operations"],
    capabilityTags: ["technical", "analysis"],
    workStyleTargets: { thinking_granularity: 80, feedback_cycle: 72, environment_dependence: 72, social_energy: 38, drive_logic: 68 },
    coreTasks: ["诊断设备或工艺问题", "动手调整并测试", "按照标准保证质量和安全"],
    entryPath: "通过实训、维修项目或技术员跟岗验证动手兴趣和现场适应度。",
    validationActions: ["完成一次设备拆装或维修实训", "访谈现场技术人员", "记录自己对标准、重复和现场问题的耐心"],
    adjacentFamilies: ["technology_engineering", "construction_architecture", "supply_chain_logistics"],
    requirements: ["部分岗位需要技能证书或安全培训"]
  },
  {
    id: "construction_architecture",
    name: "建筑、空间与工程建设",
    description: "把空间、结构、规范和施工协作转化为可使用的环境。",
    roles: ["建筑设计师", "室内设计师", "土木工程师", "结构工程师", "施工项目工程师", "造价工程师", "城市规划助理", "测量工程师", "物业工程经理", "建筑信息模型工程师"],
    interestTags: ["tech", "creative"],
    capabilityTags: ["technical", "creative"],
    workStyleTargets: { thinking_granularity: 78, environment_dependence: 78, information_processing: 74, pressure_rhythm: 64, social_energy: 52 },
    coreTasks: ["理解空间与技术约束", "协调设计和施工信息", "保证规范、成本和交付质量"],
    entryPath: "通过空间改造、制图或工程案例验证，再核验专业教育和资格要求。",
    validationActions: ["完成一个小型空间或工程方案", "参访施工或设计现场", "访谈设计与工程岗位从业者"],
    adjacentFamilies: ["skilled_manufacturing", "operations_project", "creative_media"],
    requirements: ["部分岗位需要相关专业背景或注册资格"],
    regulatedRoles: ["建筑设计师", "结构工程师", "造价工程师"]
  },
  {
    id: "supply_chain_logistics",
    name: "供应链、采购与物流",
    description: "在成本、库存、交期和现场变化之间保证稳定流动。",
    roles: ["供应链计划员", "采购专员", "物流运营经理", "仓储主管", "运输调度员", "库存分析师", "国际贸易专员", "供应商管理专员", "需求计划师", "海关事务专员"],
    interestTags: ["operations", "business"],
    capabilityTags: ["analysis", "persuasion"],
    workStyleTargets: { pressure_rhythm: 72, thinking_granularity: 72, drive_logic: 76, environment_dependence: 66, feedback_cycle: 68 },
    coreTasks: ["平衡成本与交付", "协调供应商和现场资源", "处理异常并优化流程"],
    entryPath: "从库存、采购或物流流程分析开始，验证对实时问题和数字管理的兴趣。",
    validationActions: ["分析一个真实供应链流程", "访谈采购和物流从业者", "模拟处理一次交期或库存异常"],
    adjacentFamilies: ["operations_project", "sales_business", "skilled_manufacturing"]
  },
  {
    id: "hospitality_service",
    name: "服务、零售与体验运营",
    description: "在高频互动和现场执行中创造稳定、可感知的客户体验。",
    roles: ["酒店运营经理", "餐饮运营经理", "门店经理", "客户体验专员", "会展服务经理", "旅游顾问", "航空服务人员", "高端零售顾问", "客服运营主管", "社区商业运营"],
    interestTags: ["service", "business"],
    capabilityTags: ["persuasion", "care"],
    workStyleTargets: { social_energy: 82, feedback_cycle: 84, pressure_rhythm: 72, environment_dependence: 68, boundary_clarity: 42 },
    coreTasks: ["现场理解客户需要", "处理服务问题", "维持团队与流程稳定"],
    entryPath: "通过兼职、活动或门店体验验证自己对高频服务和现场节奏的接受度。",
    validationActions: ["完成一次真实服务班次", "记录高峰期的能量和判断", "访谈一线与管理岗位从业者"],
    adjacentFamilies: ["sales_business", "operations_project", "supply_chain_logistics"],
    requiresShifts: true
  },
  {
    id: "government_public_admin",
    name: "公共管理与政策执行",
    description: "在规则、公共利益和多方协作中推动政策与服务落地。",
    roles: ["公务员", "政策执行专员", "公共事务专员", "行政管理专员", "城市治理专员", "公共项目协调员", "国际事务助理", "基层治理专员", "政务服务专员", "公共数据专员"],
    interestTags: ["public_service", "law"],
    capabilityTags: ["argument", "analysis"],
    workStyleTargets: { moral_threshold: 84, information_processing: 74, boundary_clarity: 68, power_execution: 62, feedback_cycle: 38 },
    coreTasks: ["理解并执行公共规则", "协调不同利益相关方", "形成可追踪的公共服务结果"],
    entryPath: "先访谈具体部门岗位并体验公共服务项目，再核验所在地招录要求。",
    validationActions: ["参与一次公共或社区项目", "访谈公共管理从业者", "研究一个具体政策的执行链路"],
    adjacentFamilies: ["legal_compliance", "social_service", "public_safety"],
    requirements: ["部分岗位需所在地统一招录或背景审核"],
    regulatedRoles: ["公务员"]
  },
  {
    id: "environment_agriculture",
    name: "环境、农业与可持续发展",
    description: "围绕自然系统、资源使用和长期可持续性解决现实问题。",
    roles: ["环境工程师", "可持续发展顾问", "农业技术员", "生态研究助理", "食品安全专员", "水资源管理专员", "碳管理专员", "园林技术员", "环境监测员", "自然教育专员"],
    interestTags: ["environment", "science"],
    capabilityTags: ["analysis", "technical"],
    workStyleTargets: { moral_threshold: 78, information_processing: 76, environment_dependence: 62, feedback_cycle: 34, social_energy: 42 },
    coreTasks: ["调查自然或资源问题", "依据数据提出改进方案", "平衡长期价值与现实执行"],
    entryPath: "从环境调查、可持续案例或自然教育志愿项目开始验证。",
    validationActions: ["完成一个本地环境问题调查", "参与一次自然或农业项目", "访谈技术与政策岗位从业者"],
    adjacentFamilies: ["data_research", "government_public_admin", "skilled_manufacturing"]
  },
  {
    id: "entrepreneurship_management",
    name: "创业、新业务与综合管理",
    description: "在不确定中整合资源、承担结果并寻找新的增长机会。",
    roles: ["创业者", "新业务负责人", "总经理助理", "经营分析经理", "区域经理", "业务平台主管", "战略运营经理", "加盟运营经理", "商业模式顾问", "企业发展经理"],
    interestTags: ["business", "operations"],
    capabilityTags: ["persuasion", "analysis"],
    workStyleTargets: { income_drive: 86, power_execution: 88, pressure_rhythm: 82, growth_mode: 82, boundary_clarity: 34 },
    coreTasks: ["判断机会和风险", "整合资源推进结果", "在不确定中快速学习和调整"],
    entryPath: "先用小规模真实业务验证，而不是直接承担不可逆的资金和职业风险。",
    validationActions: ["用最小方案验证一个真实需求", "负责一次有收入或成本结果的项目", "复盘自己面对不确定和责任时的状态"],
    adjacentFamilies: ["sales_business", "operations_project", "finance_risk"]
  },
  {
    id: "sports_wellness",
    name: "运动、健康促进与生活方式",
    description: "通过训练、健康教育和持续陪伴改善个人状态。",
    roles: ["健身教练", "运动康复助理", "体能教练", "体育赛事运营", "健康管理师", "瑜伽教练", "户外活动领队", "运动数据分析师", "青少年体育教练", "企业健康项目专员"],
    interestTags: ["health", "service"],
    capabilityTags: ["teaching", "care"],
    workStyleTargets: { social_energy: 72, feedback_cycle: 84, environment_dependence: 58, recognition_logic: 68, growth_mode: 68 },
    coreTasks: ["评估并支持健康目标", "示范和纠正训练行为", "通过反馈维持长期改变"],
    entryPath: "先带领一次真实训练或健康促进活动，再核验目标岗位资格。",
    validationActions: ["设计并带领一次训练活动", "访谈运动与健康从业者", "记录自己对重复指导和客户反馈的耐心"],
    adjacentFamilies: ["healthcare_clinical", "education_training", "hospitality_service"],
    requirements: ["部分岗位需要教练、急救或健康相关资格"]
  }
];

function slug(value: string) {
  return Buffer.from(value).toString("base64url").slice(0, 12).toLowerCase();
}

export const careerFamilies = families;

export const careerCatalog: CareerRoleDefinition[] = families.flatMap((family) =>
  family.roles.map((roleTitle, index) => {
    const { roles, regulatedRoles, ...shared } = family;
    return {
      ...shared,
      roleId: `${family.id}_${String(index + 1).padStart(2, "0")}_${slug(roleTitle)}`,
      roleTitle,
      regulated: Boolean(regulatedRoles?.includes(roleTitle))
    };
  })
);

export function getCareerFamily(id: string) {
  return careerFamilies.find((family) => family.id === id);
}
