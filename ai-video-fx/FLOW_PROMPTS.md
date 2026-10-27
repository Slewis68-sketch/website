# Google Flow / Veo 3.1 Lite prompt pack (silent)

Make the base clips in Flow (labs.google/flow) with your Google credits, download them, attach them to the Claude session (or run locally):

```
ffmpeg -i a.mp4 -i b.mp4 -filter_complex "[0:v][1:v]concat=n=2:v=1[v]" -map "[v]" base.mp4
node ai-video-fx/render.mjs base.mp4 out all --showreel
```

Settings for every clip: **Veo 3.1 Lite** (or Fast), **audio off**, **9:16**, **8 seconds**.

## Step 1: the still (Flow image / Nano Banana)

Upload the stand-in photo (`assets/stand-in.jpg`) as the reference, then:

> The same woman as the reference photo: short black pixie haircut, deep brown eyes, black wool coat with a high collar over a black top. She is seated on a stool in the middle of a warm, modern room, framed from the stomach up, centered, body facing the camera, looking straight into the lens with a calm, assured, friendly expression, hands relaxed at waist height. Background slightly out of focus: vertical light-wood slat wall, warm glowing bulb lights, a green potted plant on the left, a small side table. Soft warm key light, natural skin texture, photorealistic, vertical 9:16 phone-camera framing, headroom above her head.

## Step 2: two clips (Frames to Video, start frame = the still)

**Clip A: "counting"**

> Static vertical phone shot. The woman sits on a stool in the middle of a warm modern room, framed from the stomach up. She talks directly to the camera like she is explaining something simple to a friend: lips moving naturally, calm assured expression, she raises one hand to chest height and counts on her fingers, then opens her palm toward the camera. Subtle natural head movement, slight lean forward. Warm bulb lights glowing in the background, light-wood slat wall, plant on the left. Camera does not move. Photorealistic, natural skin, no text, no subtitles.

**Clip B: "three steps"**

> Static vertical phone shot. The woman sits on a stool in the middle of a warm modern room, framed from the stomach up. She continues talking to the camera with confident energy: lips moving naturally, she gestures with both hands as if laying out three steps in the air in front of her, nods once, then finishes with a small warm smile and a relaxed open-palm gesture. Subtle natural head movement. Warm bulb lights glowing in the background, light-wood slat wall, plant on the left. Camera does not move. Photorealistic, natural skin, no text, no subtitles.

## More episodes: swap only the action line

- **Orbit / "Claude can read it"**: "...she holds up a phone, then gestures at imaginary documents floating around her."
- **Spotlight / "the #1 mistake"**: "...she leans in, lowers her voice, raises one finger as a warning."
- **Checklist**: "...she ticks items off in the air with one finger, one by one."

## Notes

- The clips are silent; the renderer's on-screen captions carry the lesson. Put the hook on screen in the first second.
- Flow adds a SynthID watermark. Label posts as AI-generated (Meta requires it for realistic people made with AI).
