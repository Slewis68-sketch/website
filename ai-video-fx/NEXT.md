# Hand-off: render the effect videos from the Krea clips

Already generated in Krea (paid, do NOT regenerate):

| File | URL |
|---|---|
| still.jpg (seated stand-in) | https://app-uploads.krea.ai/public/2a676d40-a1e8-416d-a1f8-dd5edfed4354-image.jpeg |
| base-a.mp4 (counting, 8s, silent) | https://app-uploads.krea.ai/public/2770c681-98c2-4aa5-a855-3ff7a16413ac-video.mp4 |
| base-b.mp4 (three steps, 8s, silent) | https://app-uploads.krea.ai/public/f35995bc-86d6-46a9-8b8c-92790e3396c7-video.mp4 |

Steps (no credits needed):
1. Download the three files above into a `clips/` folder (needs `app-uploads.krea.ai` allowed).
2. Check both clips: hands, face consistency, no stray text.
3. `ai-video-fx/batch.sh clips out` renders all 7 effects + showreel (~10 min).
4. Send the videos to the user. Commit MP4s only if they ask.
