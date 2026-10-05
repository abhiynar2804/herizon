import { prisma } from "@/lib/prisma";

const priorityRank = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
} as const;

type RulePriority = keyof typeof priorityRank;

export type SymptomRuleResult = {
  ruleId: string | null;
  title: string;
  recommendation: string;
  priority: RulePriority;
  isEmergency: boolean;
};

export async function evaluateSymptomRules(
  symptomIds: string[],
  cyclePhase?: string | null,
): Promise<SymptomRuleResult> {
  const uniqueSymptomIds = [...new Set(symptomIds)];

  const rules = await prisma.symptomRule.findMany({
    where: {
      isActive: true,
    },
    include: {
      conditions: {
        select: {
          symptomId: true,
        },
      },
    },
  });

  const matchingRules = rules.filter((rule) => {
    const requiredSymptoms = rule.conditions.map(
      (condition) => condition.symptomId,
    );

    return requiredSymptoms.length > 0 && requiredSymptoms.every((symptomId) =>
      uniqueSymptomIds.includes(symptomId),
    );
  });

  if (matchingRules.length > 0) {
    matchingRules.sort((a, b) => {
      // Emergency rules always come first.
      if (a.isEmergency !== b.isEmergency) {
        return a.isEmergency ? -1 : 1;
      }

      // Then compare rule priority.
      const priorityDifference =
        priorityRank[b.priority] - priorityRank[a.priority];

      if (priorityDifference !== 0) {
        return priorityDifference;
      }

      // If priority is equal, prefer the rule requiring more symptoms.
      return b.conditions.length - a.conditions.length;
    });

    const bestRule = matchingRules[0];

    return {
      ruleId: bestRule.id,
      title: bestRule.title,
      recommendation: bestRule.recommendation,
      priority: bestRule.priority,
      isEmergency: bestRule.isEmergency,
    };
  }

  // Fallback: Dynamically build tailored advice for the selected symptoms
  const selectedSymptoms = await prisma.symptom.findMany({
    where: {
      id: { in: uniqueSymptomIds },
    },
  });

  if (selectedSymptoms.length === 0) {
    return {
      ruleId: null,
      title: "No Symptoms Selected",
      recommendation: "Please select at least one symptom to evaluate.",
      priority: "LOW",
      isEmergency: false,
    };
  }

  // Calculate highest severity among selected symptoms
  let highestPriority: RulePriority = "LOW";
  let isEmergency = false;

  for (const s of selectedSymptoms) {
    if (s.severity === "CRITICAL") {
      highestPriority = "CRITICAL";
      isEmergency = true;
    } else if (s.severity === "HIGH" && priorityRank[highestPriority] < 3) {
      highestPriority = "HIGH";
    } else if (s.severity === "MODERATE" && priorityRank[highestPriority] < 2) {
      highestPriority = "MEDIUM";
    }
  }

  const phasePrefix = cyclePhase && cyclePhase !== "UNKNOWN"
    ? `[${cyclePhase.charAt(0).toUpperCase() + cyclePhase.slice(1).toLowerCase()} Phase] `
    : "";

  const title = selectedSymptoms.length === 1
    ? `${phasePrefix}Clinical Care Guidance: ${selectedSymptoms[0].name}`
    : `${phasePrefix}Personalized Care Guidance for ${selectedSymptoms.length} Symptoms`;

  const symptomAdviceList = selectedSymptoms.map((s) => {
    const guidance = s.recommendation?.trim()
      ? s.recommendation.trim()
      : "Rest well, maintain hydration, and observe symptom changes.";
    return `• ${s.name}: ${guidance}`;
  }).join("\n");

  const recommendation = selectedSymptoms.length === 1
    ? (selectedSymptoms[0].recommendation?.trim()
        ? `Care & Treatment Guidance:\n${selectedSymptoms[0].recommendation.trim()}\n\nNote: If symptoms persist, intensify, or interfere with daily activities, please consult your physician.`
        : `Guidance for ${selectedSymptoms[0].name}: Rest well, stay hydrated, monitor symptom intensity, and consult a healthcare professional if symptoms persist.`)
    : `Tailored Care & Actionable Guidance for your logged symptoms:\n${symptomAdviceList}\n\nEnsure adequate rest, gentle hydration, and balanced nutrition. If severe discomfort develops or symptoms persist, please consult a healthcare professional.`;

  return {
    ruleId: null,
    title,
    recommendation,
    priority: highestPriority,
    isEmergency,
  };
}