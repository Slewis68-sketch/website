# Google Flow / Veo 3.1 prompt pack

Make the base clip in Flow (labs.google/flow), download it, then run:

```
node ai-video-fx/render.mjs base.mp4 out all --showreel
```

## Step 1 — the still (Flow "Ingredients"/image, or Nano Banana)

Upload your headshot as the reference, then:

> Same man as the reference photo — bald, black rectangular glasses, short salt-and-pepper goatee, black open jacket over black t-shirt. He is seated on a stool in the middle of a warm, modern room, framed from the stomach up, centered, facing camera. Background: vertical wooden slat wall, soft warm bulb lights, a green potted plant left, shallow depth of field. Natural skin texture, 9:16 vertical, photorealistic, phone-camera look.

## Step 2 — two 8-second talking clips (Frames to Video, start frame = the still, 9:16, audio ON)

**Clip A**

> The man speaks directly to camera in a calm, confident, warm American voice, natural hand gestures at chest height, slight head movement, camera static. He says: "Most people use AI like a search engine, and get boring answers. Here's the fix: tell it who to act as." No music, no subtitles, room tone only.

**Clip B**

> Same man, same setting, continues speaking to camera with an open-palm gesture, slight smile at the end. He says: "Tell it exactly what you want. Then give it the rules. Do that, and Claude becomes your assistant." No music, no subtitles, room tone only.

Join them: `ffmpeg -i a.mp4 -i b.mp4 -filter_complex "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1" base.mp4`

## Notes

- Veo generates the voice. It won't be your voice. For your real voice, film the lines yourself on a phone (same framing) and use that as `base.mp4`.
- Label the posts as AI-generated (Meta requires it for a realistic person made with AI).
