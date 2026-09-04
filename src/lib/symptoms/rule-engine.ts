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
    ? `${phasePrefix}Symptom Care: ${selectedSymptoms[0].name}`
    : `${phasePrefix}Personalized Care Plan for ${selectedSymptoms.length} Symptoms`;

  const symptomAdviceList = selectedSymptoms.map((s) => {
    const desc = s.description ? `: ${s.description}` : "";
    return `• ${s.name}${desc}`;
  }).join("\n");

  const recommendation = selectedSymptoms.length === 1
    ? `Guidance for ${selectedSymptoms[0].name}${selectedSymptoms[0].description ? `: ${selectedSymptoms[0].description}` : ". Rest well, stay hydrated, and track how you feel."}`
    : `Tailored insights for your logged symptoms:\n${symptomAdviceList}\n\nEnsure adequate rest, balanced nutrition, and hydration. If symptoms worsen or persist, please consult a healthcare professional.`;

  return {
    ruleId: null,
    title,
    recommendation,
    priority: highestPriority,
    isEmergency,
  };
}