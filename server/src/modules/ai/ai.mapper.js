export function toMoodAnalysisResponse(analysis) {
  return {
    mood: analysis.mood,
    confidence: analysis.confidence,
    intensity: analysis.intensity,
    intention: analysis.intention,
    keywords: analysis.keywords,
    riskLevel: analysis.riskLevel,
    recommendation: analysis.recommendation,
  };
}

export function toSupportMessageResponse(result) {
  return {
    message: result.message,
    tone: result.tone,
    safetyNote: result.safetyNote,
  };
}
