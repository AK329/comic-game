import plan from "../../assets/opportunity/journey-plan.webp"
import clue from "../../assets/opportunity/meridiani-clue.webp"
import "./opportunity-journey.css"

const imageUrl = (image) => (typeof image === "string" ? image : image.src)
export const opportunityJourneyTitle = {
  en: "Opportunity: the journey",
  bn: "অপরচুনিটি: অভিযানের পথ",
}

export default function OpportunityJourneyPage({ side, language, onScanMars }) {
  const left = side === "left"
  const description =
    language === "bn"
      ? left
        ? "প্রতিটি বড় অভিযান শুরু হয় একটি পরিকল্পনা দিয়ে। ১. গন্তব্য খোঁজা, ২. রোভার তৈরি, ৩. উৎক্ষেপণ, ৪. অবতরণ, ৫. অনুসন্ধান, ৬. নীরব হয়ে যাওয়া। মঙ্গলের জলরঙের প্রান্তরে আলোকিত বিন্দু দিয়ে ছয়টি ধাপ যুক্ত।"
        : "বিজ্ঞানীরা মেরিডিয়ানি প্ল্যানাম নামে একটি স্থানে আকর্ষণীয় সূত্র পেয়েছিলেন। মঙ্গলের চারদিকে ঘোরা একটি উপগ্রহ হেমাটাইট খনিজ সমৃদ্ধ অঞ্চলকে আলো দিয়ে দেখাচ্ছে।"
      : left
        ? "Every great adventure begins with a plan. 1. Find a destination. 2. Build the rover. 3. Launch. 4. Land. 5. Explore. 6. Go silent. A glowing dotted trail connects the six illustrated steps across a watercolor Martian landscape."
        : "Scientists found an interesting clue in a place called Meridiani Planum. An orbiting spacecraft highlights the Meridiani Planum region and the mineral hematite on Mars."
  return (
    <section
      className={`opportunity-journey-page opportunity-journey-${side}`}
      aria-label={
        opportunityJourneyTitle[language] || opportunityJourneyTitle.en
      }
    >
      <img
        src={imageUrl(left ? plan : clue)}
        alt={description}
        draggable={false}
      />
      {!left && (
        <button className="opportunity-scan-mars" onClick={onScanMars}>
          {language === "bn" ? "মঙ্গল স্ক্যান করো" : "SCAN MARS"}
        </button>
      )}
    </section>
  )
}
