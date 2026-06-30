import StoryCard from "./StoryCard.jsx";
import { MOODS } from "../../utils/constants.js";

export default function StoriesRow() {
  return (
    <section className="stories">
      {MOODS.map((mood, index) => (
        <StoryCard key={mood.id} emoji={mood.emoji} title={mood.label} active={index === 0} />
      ))}
    </section>
  );
}
