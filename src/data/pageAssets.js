// Images each book page shows, indexed by zero-based flip-book page. The flip
// book decodes upcoming spreads from this list before their pages are mounted.
import marsColor from "../assets/map/marsColor.webp"
import moonColor from "../assets/map/moonColor.webp"
import rocket from "../assets/mission/rocket.webp"
import planet from "../assets/mission/planet.webp"
import roverPhoto from "../assets/mission/rover-photo.webp"
import bluePlanet from "../assets/cover/blue-planet.webp"
import memoryOne from "../assets/apollo/rover-memory-1.webp"
import memoryTwo from "../assets/apollo/rover-memory-2.webp"
import memoryThree from "../assets/apollo/rover-memory-3.webp"
import memoryFour from "../assets/apollo/rover-memory-4.webp"
import puzzlePip from "../assets/puzzle/pip-point.webp"
import radio from "../assets/puzzle/radio.webp"
import rocks from "../assets/cargo/rocks.webp"
import film from "../assets/cargo/film.webp"
import flag from "../assets/cargo/flag.webp"
import hammer from "../assets/cargo/hammer.webp"
import backpack from "../assets/cargo/backpack.webp"
import cargoRover from "../assets/cargo/rover.webp"
import capsule from "../assets/cargo/capsule.webp"
import surface from "../assets/cargo/surface.webp"
import cargoPip from "../assets/cargo/pip.webp"
import storyPink from "../assets/storyPuzzle/pink.webp"
import storyCyan from "../assets/storyPuzzle/cyan.webp"
import storyYellow from "../assets/storyPuzzle/yellow.webp"
import storyPip from "../assets/storyPuzzle/pip.webp"
import memoryPip from "../assets/memory/pip-tablet.webp"
import landscape from "../assets/opportunity/landscape.webp"
import opportunityRover from "../assets/opportunity/rover.webp"
import opportunityPaper from "../assets/opportunity/paper.webp"
import journeyPlan from "../assets/opportunity/journey-plan.webp"
import meridianiClue from "../assets/opportunity/meridiani-clue.webp"
import docOneLeft from "../assets/opportunity/document/1-left.webp"
import docOneRight from "../assets/opportunity/document/1-right.webp"
import docTwoLeft from "../assets/opportunity/document/2-left.webp"
import docTwoRight from "../assets/opportunity/document/2-right.webp"
import docThreeLeft from "../assets/opportunity/document/3-left.webp"
import docThreeRight from "../assets/opportunity/document/3-right.webp"
import docFourLeft from "../assets/opportunity/document/4-left.webp"
import docFourRight from "../assets/opportunity/document/4-right.webp"
import docFiveLeft from "../assets/opportunity/document/5-left.webp"
import docFiveRight from "../assets/opportunity/document/5-right.webp"
import docSixLeft from "../assets/opportunity/document/6-left.webp"
import docSixRight from "../assets/opportunity/document/6-right.webp"

const url = (asset) => (typeof asset === "string" ? asset : asset?.src)
const page = (...assets) => assets.map(url).filter(Boolean)
const opportunity = page(
  landscape,
  opportunityRover,
  opportunityPaper,
  journeyPlan,
  meridianiClue,
)

const pageAssets = [
  page(marsColor),
  page(moonColor),
  page(rocket, planet, bluePlanet, memoryOne, memoryTwo, memoryThree, memoryFour),
  page(puzzlePip, radio, rocket, planet),
  page(rocks, film, flag, hammer, backpack, cargoRover, capsule, cargoPip),
  page(surface, rocket, planet),
  page(storyPink, storyCyan, storyYellow, storyPip),
  page(rocket, planet, roverPhoto),
  page(memoryPip, roverPhoto, rocket, planet),
  page(roverPhoto, rocket, planet),
  opportunity,
  opportunity,
  page(docOneLeft),
  page(docOneRight),
  page(docTwoLeft),
  page(docTwoRight),
  page(docThreeLeft),
  page(docThreeRight),
  page(docFourLeft),
  page(docFourRight),
  page(docFiveLeft),
  page(docFiveRight),
  page(docSixLeft),
  page(docSixRight),
]

export default pageAssets
