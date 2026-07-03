import { AppError } from "../../../core/errors/AppError.js";
import { AI_MESSAGES } from "./ai.constants.js";
import {
  toMoodAnalysisResponse,
  toSupportMessageResponse,
} from "./ai.mapper.js";

const moodRules = [
  {
    mood: "ANXIOUS",
    keywords: ["angoisse", "anxieux", "anxiété", "peur", "panique", "stress"],
    recommendation: "Respire lentement, éloigne-toi quelques minutes de la source de stress et parle à une personne de confiance.",
  },
  {
    mood: "SAD",
    keywords: ["triste", "seul", "pleure", "vide", "déprimé", "mal"],
    recommendation: "Accueille ce que tu ressens sans te juger et cherche un soutien humain si la tristesse persiste.",
  },
  {
    mood: "ANGRY",
    keywords: ["énervé", "colère", "furieux", "rage", "injustice"],
    recommendation: "Prends une pause avant de répondre et essaie de nommer précisément ce qui t'a blessé.",
  },
  {
    mood: "EXHAUSTED",
    keywords: ["fatigué", "épuisé", "vidé", "crevé", "burnout"],
    recommendation: "Réduis la charge immédiate, hydrate-toi et planifie un vrai temps de repos.",
  },
  {
    mood: "MOTIVATED",
    keywords: ["motivé", "avance", "objectif", "réussir", "projet"],
    recommendation: "Garde ton rythme et découpe ton objectif en petites étapes réalisables.",
  },
  {
    mood: "HAPPY",
    keywords: ["heureux", "content", "joie", "fier", "bien"],
    recommendation: "Profite de ce moment positif et note ce qui t'a aidé à te sentir ainsi.",
  },
];

const crisisKeywords = [
  "suicide",
  "me tuer",
  "mourir",
  "mettre fin",
  "plus vivre",
  "automutilation",
];

function normalize(content) {
  return content.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function detectRiskLevel(normalizedContent) {
  const hasCrisisKeyword = crisisKeywords.some((keyword) =>
    normalizedContent.includes(normalize(keyword))
  );

  return hasCrisisKeyword ? "HIGH" : "LOW";
}

function detectMood(content) {
  const normalizedContent = normalize(content);

  const scoredRules = moodRules.map((rule) => {
    const matchedKeywords = rule.keywords.filter((keyword) =>
      normalizedContent.includes(normalize(keyword))
    );

    return {
      ...rule,
      matchedKeywords,
      score: matchedKeywords.length,
    };
  });

  const bestMatch = scoredRules.sort((a, b) => b.score - a.score)[0];

  if (!bestMatch || bestMatch.score === 0) {
    return {
      mood: "CALM",
      confidence: 0.45,
      intensity: "LOW",
      keywords: [],
      recommendation: "Continue à exprimer ce que tu ressens. Mettre des mots sur une émotion aide déjà à mieux la comprendre.",
    };
  }

  return {
    mood: bestMatch.mood,
    confidence: Math.min(0.95, 0.55 + bestMatch.score * 0.15),
    intensity: bestMatch.score >= 2 ? "MEDIUM" : "LOW",
    keywords: bestMatch.matchedKeywords,
    recommendation: bestMatch.recommendation,
  };
}

function inferIntention(mood, riskLevel) {
  if (riskLevel === "HIGH") return "RECEIVE_ADVICE";

  if (["SAD", "ANXIOUS", "EXHAUSTED", "ANGRY"].includes(mood)) {
    return "BE_LISTENED";
  }

  return "FIND_SIMILAR_PEOPLE";
}

export async function analyzeMoodService(userId, payload) {
  if (!userId) {
    throw new AppError("Utilisateur non authentifié.", 401);
  }

  if (!payload.content) {
    throw new AppError(AI_MESSAGES.CONTENT_REQUIRED, 422);
  }

  const normalizedContent = normalize(payload.content);
  const riskLevel = detectRiskLevel(normalizedContent);
  const moodAnalysis = detectMood(payload.content);

  const analysis = {
    ...moodAnalysis,
    riskLevel,
    intention: inferIntention(moodAnalysis.mood, riskLevel),
    recommendation:
      riskLevel === "HIGH"
        ? "Ce message peut indiquer une situation de danger. Contacte immédiatement une personne de confiance ou un service d'urgence local."
        : moodAnalysis.recommendation,
  };

  return toMoodAnalysisResponse(analysis);
}

export async function generateSupportMessageService(userId, payload) {
  if (!userId) {
    throw new AppError("Utilisateur non authentifié.", 401);
  }

  const mood = payload.mood || detectMood(payload.content).mood;
  const riskLevel = detectRiskLevel(normalize(payload.content));

  if (riskLevel === "HIGH") {
    return toSupportMessageResponse({
      message:
        "Je suis vraiment désolé que tu traverses cela. Tu ne devrais pas rester seul avec ce ressenti. Contacte immédiatement une personne de confiance ou un service d'urgence local.",
      tone: "URGENT_SUPPORT",
      safetyNote: "Ce message ne remplace pas l'aide d'un professionnel ou d'un service d'urgence.",
    });
  }

  const messagesByMood = {
    ANXIOUS:
      "Je comprends que tu puisses te sentir submergé. Tu peux avancer pas à pas, en commençant par une petite action simple maintenant.",
    SAD:
      "Ce que tu ressens compte. Tu as le droit d'être fatigué émotionnellement, et tu n'as pas à porter cela seul.",
    ANGRY:
      "Ta colère peut signaler que quelque chose t'a touché profondément. Prends un moment pour respirer avant de réagir.",
    EXHAUSTED:
      "Tu as déjà beaucoup donné. Autorise-toi à ralentir un peu et à reprendre de l'énergie sans culpabiliser.",
    MOTIVATED:
      "C'est encourageant de te voir avancer. Continue à construire étape par étape, sans te mettre une pression excessive.",
    HAPPY:
      "C'est positif. Garde en tête ce qui t'a aidé à te sentir comme ça, cela pourra te soutenir plus tard.",
    CALM:
      "C'est bien de prendre le temps d'exprimer ce que tu ressens. Continue à t'écouter avec honnêteté.",
  };

  return toSupportMessageResponse({
    message: messagesByMood[mood] || messagesByMood.CALM,
    tone: "SUPPORTIVE",
    safetyNote: "Ce message est un soutien émotionnel général et ne remplace pas un accompagnement professionnel.",
  });
}
