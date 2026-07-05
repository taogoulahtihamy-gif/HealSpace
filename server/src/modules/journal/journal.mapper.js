export function mapJournalEntry(entry) {
  if (!entry) {
    return null;
  }

  return {
    id: entry.id,
    title: entry.title,
    content: entry.content,
    mood: entry.mood,
    intensity: entry.intensity,
    occurredAt: entry.occurredAt,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  };
}

export function mapJournalSummary(summary) {
  const moods = summary.moods.map((item) => ({
    mood: item.mood,
    count: item.count,
    averageIntensity: item.averageIntensity,
    percentage:
      summary.totalEntries > 0
        ? Number(((item.count / summary.totalEntries) * 100).toFixed(2))
        : 0,
  }));

  return {
    totalEntries: summary.totalEntries,
    averageIntensity: summary.averageIntensity,
    dominantMood: summary.dominantMood,
    firstOccurredAt: summary.firstOccurredAt,
    lastOccurredAt: summary.lastOccurredAt,
    moods,
  };
}
