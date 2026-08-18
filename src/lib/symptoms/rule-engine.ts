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

    return requiredSymptoms.every((symptomId) =>
      uniqueSymptomIds.includes(symptomId),
    );
  });

  if (matchingRules.length === 0) {
    return {
      ruleId: null,
      title: "No specific concern identified",
      recommendation:
        "No matching symptom rule was found. Monitor your symptoms and seek professional medical advice if they persist, worsen, or concern you.",
      priority: "LOW",
      isEmergency: false,
    };
  }

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

    // If priority is equal, prefer the rule
    // requiring more symptoms because it is more specific.
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