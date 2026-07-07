import StoryCard from "./StoryCard.jsx";
import { MOODS } from "../../utils/constants.js";

export default function StoriesRow() {
  return (
    <section className="mood-checkin">
      <div className="mood-checkin__copy">
        <span>Check-in discret</span>
        <strong>Comment est ton énergie ?</strong>
      </div>
      <div className="stories stories-v3">
        {MOODS.slice(0, 4).map((mood, index) => (
          <StoryCard key={mood.id} emoji={mood.emoji} title={mood.label} active={index === 0} />
        ))}
      </div>
    </section>
  );
}
