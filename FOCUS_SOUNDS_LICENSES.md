# Focus Mode Sounds License Registry

The following files are documented for inclusion in Focus Mode.

> [!WARNING]
> **DEV PLACEHOLDER STATUS**
> Currently, all sounds in `public/sounds/` are placeholder MP3s used solely for architecture testing. They MUST be manually replaced with the true source files prior to a production release.

## Final Asset References

| Sound Name | Source URL | Intended Local Filename | License / Source | Status |
|---|---|---|---|---|
| Rain | https://pixabay.com/sound-effects/nature-copyright-free-rain-sounds-for-download-482886/ | `rain.mp3` | Pixabay Content License | **Needs Replacement (Currently DEV PLACEHOLDER)** |
| Forest | https://pixabay.com/sound-effects/nature-forest-ambience-296528/ | `forest.mp3` | Pixabay Content License | **Needs Replacement (Currently DEV PLACEHOLDER)** |
| Ocean | https://pixabay.com/sound-effects/nature-ocean-waves-376898/ | `ocean.mp3` | Pixabay Content License | **Needs Replacement (Currently DEV PLACEHOLDER)** |
| Water | https://pixabay.com/sound-effects/nature-water-flowing-sound-327661/ | `water.mp3` | Pixabay Content License | **Needs Replacement (Currently DEV PLACEHOLDER)** |
| Fireplace | https://pixabay.com/sound-effects/nature-crackling-fireplace-290850/ | `fireplace.mp3` | Pixabay Content License | **Needs Replacement (Currently DEV PLACEHOLDER)** |
| Forest + Birds | https://pixabay.com/sound-effects/film-special-effects-soothing-forest-ambience-birds-356294/ | `forest-birds.mp3` | Pixabay Content License | **Needs Replacement (Currently DEV PLACEHOLDER)** |

## Instructions for Replacement
1. Visit the Source URL for each sound.
2. Download the MP3.
3. Trim, compress, or normalize if necessary (e.g., using Audacity or `ffmpeg`).
4. Replace the corresponding `placeholder-[name].mp3` in `public/sounds/` with the final file named exactly as listed in the "Intended Local Filename" column, and then update `src/lib/sounds.ts` to remove the `placeholder-` prefix.
