export interface FocusSound {
  id: string;
  name: string;
  category: "Nature" | "Cozy";
  src: string;
  sourceUrl?: string;
}

export const FOCUS_SOUNDS: FocusSound[] = [
  {
    id: "rain",
    name: "Rain",
    category: "Nature",
    src: "/sounds/rain.mp3",
  },
  {
    id: "long-rain",
    name: "Long Rain",
    category: "Nature",
    src: "/sounds/Long%20rain.mp3",
  },
  {
    id: "gentle-rain",
    name: "Gentle Rain",
    category: "Nature",
    src: "/sounds/gentle%20rain.mp3",
  },
  {
    id: "forest",
    name: "Forest Ambiance",
    category: "Nature",
    src: "/sounds/Forest%20ambiance.mp3",
  },
  {
    id: "forest-2",
    name: "Forest Ambiance 2",
    category: "Nature",
    src: "/sounds/Forest%20Ambiance%202.mp3",
  },
  {
    id: "forest-wind",
    name: "Forest & Wind",
    category: "Nature",
    src: "/sounds/forest%20and%20wind.mp3",
  },
  {
    id: "forest-birds",
    name: "Forest + Birds",
    category: "Nature",
    src: "/sounds/Soothing%20forest%20and%20birds%20ambiance.mp3",
  },
  {
    id: "ocean-soothing",
    name: "Soothing Ocean",
    category: "Nature",
    src: "/sounds/Soothing%20Ocean%20waves.mp3",
  },
  {
    id: "ocean-gentle",
    name: "Gentle Ocean Waves",
    category: "Nature",
    src: "/sounds/Gentle%20Ocean%20Waves.mp3",
  },
  {
    id: "water",
    name: "Water Flowing",
    category: "Nature",
    src: "/sounds/Water%20Flowing%20Sound.mp3",
  },
  {
    id: "fireplace",
    name: "Fireplace",
    category: "Cozy",
    src: "/sounds/Fire%20sound.mp3",
  },
];
