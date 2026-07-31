# Heda — Launch Week Campaign (Mon Jul 27 → Fri Jul 31, 2026)

> **Rule #1: Launch day should feel inevitable, not announced.**
> Every day reveals slightly more than the day before. Monday makes people nod. Friday makes them download. If a post could run on any random week, it doesn't belong in launch week.

The carousels below are authored in the app under **Special Drops → Launch Week** (`src/data/posts/content/special-drops.ts`, days 2–6). Style and export them there (4:5 for feed, 9:16 for stories). This doc holds everything else: stories, captions, image prompts, reels, replies, and checklists.

**Reality checks baked into this plan:**
- App Store only at launch. All CTAs say **"link in bio"** — never "iOS only," never apologize for Android.
- Launch hour is written as **9AM** everywhere. `TODO: confirm the hour` — one find-and-replace in the app file + this doc before Thursday.
- Launch city is Ottawa; the copy stays city-agnostic but stories can lean local.

---

## 1. Strategy — the emotional arc

One story told over five days. Each day has one job:

| Day | Date | Theme | The viewer's feeling | Heda visibility |
|---|---|---|---|---|
| 1 | Mon 27 | The problem | "That's literally me." | Zero. No app, no logo, no UI. |
| 2 | Tue 28 | Why it happens | "Oh. That's why I quit." | One sentence. Name only. |
| 3 | Wed 29 | Why we built it | "These people get it." | Named, still no UI. |
| 4 | Thu 30 | The reveal + tomorrow | "I need this. Tomorrow?!" | Full UI. Launch time announced. |
| 5 | Fri 31 | We're live | "Downloading. Sending to Dave." | Everything, all day. |

**The enemy** (from the content system): training alone / the invisible quit — nobody notices the day you stop.
**The promise:** someone who actually shows up.

Non-negotiables all week: dark, minimal, cinematic. Whitespace over words. Countdown sticker on stories every single day. No "revolutionizing fitness," no "unlock your potential," nothing that smells like AI or a pitch deck.

---

## 2. Global settings

**Posting times (local):**
- Feed carousel: **6:00 PM** Mon–Wed (evening scroll, post-work gym window). **12:00 PM Thursday** — posting the reveal at 6PM would leave it only 15 hours before launch; at noon it owns the whole afternoon and evening. **9:00 AM sharp Friday** (the moment we're live).
- Stories: morning batch ~8AM, evening batch ~7PM daily. Launch day: all day, every 1–2 hours.

**Captions live in the code now.** Each post carries its own `caption` and optional `hashtags` in `src/data/posts/content/special-drops.ts`, and the app's CAPTION PREVIEW plus every exported `caption.txt` read from there. Copy them out of the app rather than retyping from this doc — the code is the source of truth. The per-day captions below are reproduced for review only.

**Hashtags — 5 max, in the caption, never the comments.**
Default set: `#gympartner #accountability #fitfam #ottawagym #heda`

Instagram removed hashtag following in Dec 2024 and cut their ranking weight; discovery now runs on **keywords in the caption**, because the feed behaves more like a search engine than a hashtag index. Five is the working ceiling, and the shape that performs is one audience tag, one or two exact-topic tags, one local, one branded. Broad tags (`#fitness`, `#workout`, `#health`, `#gym`) are deliberately gone — at hundreds of millions of posts they bury a launch-sized account rather than placing it. That also means the words that matter most are in the sentences: *gym partner, accountability, workout partner, streak, leaderboard, consistency, Ottawa* should appear naturally in the caption body.

**What the captions are built to do:**
- **Line one is the whole game.** It's all anyone sees before "…more", and it should extend slide 1 rather than repeat it.
- **End on a question or a tag/send prompt.** Comments of 4+ words count as high-quality engagement, and **DM sends are the single strongest reach signal** — which is why launch day closes on "send this to the one who said Monday" instead of "download now".
- **3–6 short paragraphs.** Hook, then the substance, then the ask.

**CTA ladder:** Mon: none → Tue/Wed: "Join the waitlist" → Thu: "Link in bio" (waitlist last call) → Fri: "Download — link in bio."

**Countdown sticker:** every story day uses IG's countdown sticker set to **Fri Jul 31, 9:00 AM**. Same sticker, reshared, so taps accumulate reminders.

---

## 3. Day 1 — Monday Jul 27 · "The empty spot"

**Job:** make people nod. Zero brand.

### Carousel (in app: day 2, "The empty spot")

1. **Hook** — "Your gym partner said **'be there in 10.'**" / That was three hours ago.
2. **The pattern** — "You said **Monday**." / It's Thursday. The bag is still packed by the door.
3. **The truth** — "The plan was never the problem." / Going alone was. Everything is heavier when nobody's expecting you.
4. **The quiet quit** — "Nobody notices the day you **stop**." / No text. No 'where were you?' Just a membership you keep paying for.
5. **The tease** — "Friday. **31.07.**" / Something's coming for the empty spot next to you. *(no CTA styling — stays mysterious)*

### Caption

> The bag has been packed by the door since Monday. It's Thursday.
>
> You didn't skip because you're lazy. You skipped because nothing happens when you do. No text. No "where were you?". Just a membership you keep paying for.
>
> Be honest — how many times has your gym partner cancelled on you this month?
>
> Friday. 31.07.

`#gympartner #gymmotivation #accountability #ottawagym` — no `#heda` today; the product stays out of it.

### Stories (4 frames, 8AM + 7PM)

1. *(8AM)* Black frame, small white text center: "how many times has your gym partner cancelled this month?" — **poll: 0–2 / I've lost count**. Countdown sticker bottom corner, small.
2. *(8AM)* BTS clip: laptop open (screen angled away — nothing readable), coffee, gym bag on the floor. No caption except "this week." Countdown sticker.
3. *(7PM)* Slide 1 of the carousel reshared with "tap →" and nothing else.
4. *(7PM)* Question sticker on black: "finish the sentence: I skip the gym when ______." (Save the answers — they're Thursday/Friday reply ammo and future content.)

### Image prompts (production-ready)

**Slide 1 — "Waiting"**
> Cinematic photograph, dark commercial gym at night after close. A single athlete in their mid-20s sits on the end of a flat bench in the lower-right third of frame, elbows on knees, phone glowing faintly in one hand, looking at the screen with a flat, tired expression. Beside them: a second, completely empty bench, lit slightly brighter than everything else — the emotional subject of the image. Wardrobe: plain matte-black hoodie and shorts, no visible logos. Environment: rows of dumbbells fading into deep shadow, one overhead metal-halide fixture creating a hard pool of light, faint haze/atmosphere in the beam. Shot on 35mm lens at f/2.0, waist-height camera, slight negative tilt for weight. Color grade: near-black blacks, desaturated cool tones, one restrained violet cast in the falloff (#7C5CFF at low opacity). Top 40% of frame is dark empty air reserved for typography. No text, no logos, no UI in image. Aspect ratio 4:5.

**Slide 4 — "The quiet quit"**
> Cinematic photograph, empty squat rack centered in frame, barbell racked and dusted with chalk, in a dark gym. One cold overhead spotlight isolates the rack; the rest of the gym disappears into black. Nobody in frame — absence is the subject. Faint atmospheric haze in the light beam. Shot on 50mm at f/2.8, chest height, dead-center symmetrical composition. Grade: monochrome-leaning with cold steel blues, deep shadow detail preserved, subtle film grain. Bottom third clean and dark for typography. No logos, no people, no text. Aspect ratio 4:5.

### Motion idea
Slide 1 as a 3s cinemagraph: everything frozen except the phone screen's glow slowly pulsing and dust drifting in the light beam. Use as story frame 3 or the carousel cover if the team exports video covers.

### Reel idea (optional today)
6s, no talking: fixed tripod shot of the empty bench, timestamp burned in corner rolling 6:00PM → 7:30PM in fast-forward, nobody arrives, cut to black on a single line: "Friday." Sound: room tone only. No music.

### Community replies (Day 1 voice: in on the joke, no selling)
- "that's literally me" → "we know. friday."
- "what's happening friday?" → "the empty spot gets an answer."
- "is this an app?" → "it's a fix. friday."
- Tagged friend / "@dave this is you" → like the comment, reply "bring dave friday."

---

## 4. Day 2 — Tuesday Jul 28 · "It was never about discipline"

**Job:** explain the quit. First quiet mention of the name.

### Carousel (in app: day 3, "It was never about discipline")

1. **Hook** — "Nobody quits the gym because it's **too hard**." / The weights were never the problem.
2. **The real reason** — "You quit because nobody **noticed** you came." / Or noticed when you stopped. Silence is the easiest thing to disappear into.
3. **The proof** — "Motivation starts it. **Accountability** finishes it." / Ask anyone consistent. There's always someone they don't want to let down.
4. **Soft intro** — "So we built something for this." / It's called Heda. More on that soon.
5. **CTA** — "Friday, it gets easier to show up." / The waitlist gets in first. **↓ Join the waitlist**

### Caption

> Discipline is the most overrated word in fitness.
>
> The people you know who never miss a session aren't more disciplined than you. They just have someone who notices. A training partner, a rival, a group chat that asks where they were. That's the whole difference.
>
> We've been building something for everyone who doesn't have that yet. It's called Heda.
>
> Tag the person who notices when you don't show up. If nobody came to mind, that's the point.
>
> Friday. Waitlist in bio — they get in first.

Default tag set.

### Stories (5 frames)

1. *(8AM)* Poll on black: "what actually keeps you consistent?" — **a perfect plan / someone waiting for me**. Countdown sticker.
2. *(8AM)* 5s screen-record of the app, **heavily blurred** (gaussian, ~80%), just enough to see cards moving and a purple accent. Caption: "soon."
3. *(7PM)* Carousel slide 2 reshared. Text above: "the real reason, swipe →"
4. *(7PM)* Blurred matching moment — two profile cards sliding together, blurred, one frame of a "Matched" state readable for 0.3s. Caption: "👀"
5. *(7PM)* Countdown sticker full-frame on black: "3 days."

### Image prompt

**Slide 3 — "Split scene"**
> Cinematic diptych in a single frame, dark gym, split vertically down the middle by a structural pillar. LEFT HALF: one athlete alone at a cable machine, cool desaturated blue-grey grade, face down, isolated in shadow, composition weighted small in the frame. RIGHT HALF: two training partners at a bench press — one lifting, one spotting with a hand hovering under the bar, mid-rep, warm tungsten key light, subtle violet rim light (#7C5CFF), body language alive. Same gym, same camera height, two emotional temperatures. Shot on 35mm at f/2.8, symmetrical split composition. Wardrobe: unbranded blacks and greys. Haze in both light pools. Center pillar and top fifth kept dark and clean for typography. No logos, no text. Aspect ratio 4:5.

### Motion idea
The split scene as a slow 4s push-in: left side static, right side has micro-movement (the spot, a nod). The asymmetry of motion *is* the message.

### Reel idea
8s: rapid-fire supercut of cancelled-plans texts appearing over black ("running late," "can't today," "tmrw fr"), each with the iMessage whoosh, accelerating — hard cut to silence and one line: "What if someone actually showed up?" Then: "Friday."

### Community replies
- "so what is heda?" → "a way to find gym people who actually show up. friday."
- "android?" → "App Store first — link in bio friday. Android's coming, drop your email on the waitlist and you'll hear first."
- "another fitness app 🙄" → "we track one thing: whether you showed up. that's the whole app."
- "how much?" → "free to download. friday."

---

## 5. Day 3 — Wednesday Jul 29 · "Why we built Heda"

**Job:** the emotional connect. Founder story, human, first person.

### Carousel (in app: day 4, "Why we built Heda")

1. **Hook** — "We built Heda because our gym partners kept **cancelling**." / This one's personal.
2. **The story** — "'Can't make it today. **Tomorrow for sure.**'" / We heard it so often we could set a watch to it. Then we became the ones saying it.
3. **The wish** — "We didn't want an app. We wanted someone to **show up**." / Someone already at the gym, wondering where we were.
4. **The decision** — "So we stopped waiting and built the thing." / Not a dating app. Not another feed. A way to find people who actually show up.
5. **CTA** — "Two days. **31.07.**" / Built by people who kept getting cancelled on. **↓ Join the waitlist**

### Caption

> "Tomorrow for sure." We heard it so often we could set a watch to it.
>
> Then we became the ones saying it. That's the honest version. We didn't stop going because we ran out of motivation — we stopped because there was nobody on the other end of it. Two people having a bad week with no reason to show up anyway.
>
> We never set out to build an app. We wanted someone already at the gym wondering where we were. Nothing did that, so we made it.
>
> What's the flakiest text you've ever got from a gym partner? We'll go first, ours is up there in slide two.
>
> Two days. 31.07. Waitlist in bio.

`#gympartner #accountability #buildinpublic #ottawagym #heda`

### Stories (5 frames — founder day)

1. *(8AM)* **Founder talking head, 30–45s, unscripted.** One take, phone camera, gym or desk. Beats to hit (not lines to read): the specific cancelled workout that broke you → "I kept starting over" → "I just wanted someone to show up" → "so we built it. Friday." Countdown sticker in a corner.
2. *(8AM)* Question sticker: "ask us anything about Heda — answering tonight." 
3. *(7PM)* 3–4 answer frames from the morning's questions (screenshot question, type answer over b-roll of design files / gym footage). Pin the best question: "is this a dating app?" → "no. and it never will be."
4. *(7PM)* BTS montage: sketches, wireframes, whiteboard, commit history scrolling — 1s each, raw.
5. *(7PM)* Countdown sticker: "2 days."

### Image prompts

**Slide 2 — "Tomorrow for sure"**
> Cinematic still life, top-down 30° angle: a phone lying face-up on a worn wooden bench in a dim gym locker room, screen showing a generic messaging thread (unreadable, blurred just past legibility — no real UI), the glow lighting a set of keys and the corner of a packed gym bag beside it. Single cold overhead source, deep shadows, shallow depth of field. Shot on 50mm macro at f/2.0. Grade: muted, cold, one soft violet reflection on the phone edge. Upper half of frame dark and clean for typography. No readable text, no logos. Aspect ratio 4:5.

**Slide 4 — "The build"**
> Cinematic photograph, 1AM home-office desk: open laptop displaying blurred design wireframes (abstract rectangles, no readable UI), a paper notebook with rough phone-screen sketches, a cold half-finished coffee, and a gym bag slumped against the desk leg in the foreground bokeh. Practical lighting only — laptop glow plus one warm desk lamp, everything else black. Shot on 35mm at f/1.8, eye level with the desk surface. Grade: warm key against cold ambient, gentle film grain. Right third of frame falls to black for typography. No faces, no logos, no readable text. Aspect ratio 4:5.

### Motion idea
Slide 4 scene as a 5s loop: cursor blinking on the laptop, steam gone from the coffee, lamp flickers once. Stillness with a pulse.

### Reel idea
30s founder cut: the talking-head story from stories, but edited over b-roll (empty gym, sketches, screen glow), captions burned in, ends on the wordmark and "31.07." This is the week's shareable — post as a Reel at 7PM.

### Community replies
- "respect for building this" → "thanks — it exists because of everyone who got cancelled on. friday."
- "is this a dating app?" → "no. fitness-first profiles, PRs not selfies. it's for training."
- "which city?" → "starting in Ottawa. everywhere else — waitlist, we're coming."
- "I always train alone anyway" → "so did we. that's kind of the point."

---

## 6. Day 4 — Thursday Jul 30 · "This is Heda" (reveal + tomorrow)

**Job:** show the product, announce the moment. Post at **12PM** so it owns the afternoon.

### Carousel (in app: day 5, "This is Heda")

1. **The reveal** — "This is **Heda**." / Find a gym partner who actually shows up. *(hero mockup)*
2. **Matching** — "Match on **goals**, gym, and schedule." / Not looks. Not follower counts. Whether you'll both be there at 6am. *(matching mockup)*
3. **Accountability** — "Your consistency, **visible**." / Streaks and leaderboards that make skipping feel different. *(leaderboard mockup)*
4. **Tomorrow** — "**Tomorrow.** 31.07." / 9AM. Set an alarm. Tell your gym partner — if they show up, keep them.
5. **CTA** — "The empty spot gets filled tomorrow." / First access goes to the waitlist. **↓ Link in bio**

Mockups: upload real screenshots via EditPanel on slides 1–3 (device frame on, text-top or text-bottom layouts). Optional: toggle the "DAY" cover chip off — this post isn't a countdown label, it's the reveal.

### Caption

> Three days of posting in riddles. Here's the actual thing.
>
> Heda finds you a gym partner who trains where you train, when you train, chasing something close to what you're chasing. Not photos first — your PRs, your training style, your usual time. Then it makes turning up visible: streaks and a leaderboard, so skipping costs you something.
>
> That's the app. It isn't a dating app and it isn't going to become one.
>
> Tomorrow, 9AM. Link in bio.
>
> Who are you sending this to?

`#gympartner #workoutpartner #accountability #ottawagym #heda`

### Stories (6 frames)

1. *(12PM)* 15s clean screen recording: open app → swipe → match → message "6am?" → "locked." Real UI, no blur anymore. Caption: "tomorrow." Countdown sticker.
2. *(12PM)* Carousel slide 1 reshared: "full reveal on the feed →"
3. *(3PM)* Poll over the leaderboard screenshot: "would you skip if your name dropped on this?" — **never / …probably not**
4. *(7PM)* Founder to camera, 15s: "tomorrow morning, 9AM, it's live. waitlist gets the first email. see you there."
5. *(7PM)* Full-frame countdown sticker on black: "under 15 hours."
6. *(9PM)* Last frame of the night: black, small text — "set the alarm. 9AM." Nothing else.

### Image prompt

**Slide 1 — "Hero device"**
> Premium product photograph, a matte-black smartphone floating at a 12° tilt against a near-black studio void, screen displaying a dark-mode fitness app interface (to be composited — render screen as a clean placeholder glow). Lighting: one large soft source camera-left creating a single elegant edge highlight along the phone, plus a violet ambient bloom (#7C5CFF) emanating from the screen and falling off fast into black. Faint reflection plane below, 5% opacity. Shot on 85mm at f/8, tack sharp, centered composition with the phone occupying the lower two-thirds. Top third pure black for typography. Apple-keynote energy: restraint, gravity, one light. No hands, no logos, no readable text on screen. Aspect ratio 4:5.

*(Slides 2–3 use real screenshots in the app's device frame — no generation needed.)*

### Motion idea
Hero device as 4s motion: phone drifts up 20px while the screen glow blooms from black to lit, violet cast spilling onto the void floor. Cut on the glow peak. This is the story-1 opener if the screen recording needs an intro beat.

### Reel idea
12s reveal cut, 9:16: black screen with Monday's empty-bench shot (1s) → Tuesday's split scene (1s) → hard cut to the device hero glowing on (2s) → 6s of real UI screen-flow → end card "Tomorrow. 9AM." Sound: one low sub hit on the glow. Post 6PM Thursday.

### Community replies
- "FINALLY" → "tomorrow. 9AM. bring a friend."
- "what's it cost?" → "free to download."
- "android when" → "App Store first. waitlist = first to know on Android."
- "does my gym matter?" → "you set your gym in your profile — matches are people who actually train where you train."
- "this is just tinder for gyms" → "no photos-first, no small talk. PRs, schedule, gym. if it's a date it's a failed match."

---

## 7. Day 5 — Friday Jul 31 · "Heda is here" (launch day)

**Job:** convert. Everything direct, all day.

### Carousel (in app: day 6, "Heda is here") — posts **9:00 AM sharp**

1. **It's live** — "Heda is **here**." / Live now. For real. Go. *(launch hero mockup)*
2. **What it is** — "A gym partner who **shows up**." / Match with people at your gym, on your schedule, chasing the same thing. *(mockup)*
3. **Why it exists** — "Not a dating app. Not another feed." / The reason you stop training alone.
4. **Download** — "Free. **Today.**" / Download Heda on the App Store — link in bio. *(mockup)*
5. **Bring someone** — "Don't come alone." / Send this to the friend who said Monday. **↓ Link in bio**

### Caption

> Five days ago we posted a picture of an empty bench. Today it gets filled.
>
> Heda is live. Find a gym partner at your gym, on your schedule, who actually turns up — then keep each other honest with streaks and a leaderboard that makes skipping feel like something.
>
> Free on the App Store. Link in bio.
>
> Send this to the one who said Monday. They know who they are.

`#gympartner #accountability #fitfam #ottawagym #heda`

### Stories (all day — the cadence, not fixed frames)

- **9:00AM** — "WE'RE LIVE." over the hero. Link sticker → App Store. (Countdown sticker retires today; link sticker replaces it on every frame.)
- **9:30AM** — Founder to camera, raw, 20s: "it's live. I'm watching the first signups come in right now."
- **Every 1–2h** — real moments as they happen, screenshotted and reposted with one-line reactions: first download, first match, first "6am tomorrow?" message (crop/blur names unless permission), waitlist milestones, App Store position if it moves.
- **Every user repost** → reshare within the hour, all day. Reply-tool every DM.
- **3PM** — Q&A round: question sticker "downloading now — what do you want to know?"
- **8PM** — Founder close: "day one. [number] people found a partner today. tomorrow we all show up." 
- **10PM** — last frame: the Monday empty-bench image again, now with one line — "taken."

### Image prompt

**Slide 1 — "Launch hero"**
> Cinematic photograph, dark gym at golden hour, two athletes mid-fist-bump in the background bokeh (out of focus, anonymous), while in the sharp foreground a hand holds a phone displaying a glowing dark-mode app screen (composite placeholder glow). The phone screen is the brightest object in frame, throwing violet light (#7C5CFF) onto the holder's fingers. Atmosphere: light haze, warm practical lights far behind, cool foreground. Shot on 35mm at f/1.8, vertical energy, phone in the lower-left third. Upper-right quadrant falls to darkness for typography. Wardrobe unbranded. Mood: quiet victory, not confetti. No logos, no readable text. Aspect ratio 4:5.

### Motion idea
The "taken" closer: Monday's empty-bench frame crossfades over 2s into the same framing with a person racking up — same camera, same light. Bookends the week. Shoot both angles in one session (see shot list).

### Reel idea (the launch film — post 12PM)
30–40s, 9:16: the whole arc. Empty bench (Mon) → cancelled texts (Tue) → founder line "we just wanted someone to show up" (Wed) → device glow reveal (Thu) → real UI flow → two people training (the "taken" shot) → end card: wordmark, "Live now. App Store." One track, builds from silence to one warm chord. This is the ad-ready asset for the Meta test campaign's Belonging angle too (see meta-campaign-plan.md, Angle 1).

### Community replies
- "downloaded 🔥" → "welcome in. set your gym first — that's where matches come from."
- "no matches yet?" → "day one — Ottawa's filling up by the hour. streaks + leaderboard are live now, matching gets better every day this week."
- "android??" → "App Store today. Android's next — waitlist in bio and you'll be first to hear."
- "not in Ottawa" → "we're going city by city so every gym actually has people. waitlist = your city's vote."
- Bug reports → "on it — DM us your phone model + what happened. fixing fast today." (Route to the bug channel immediately.)

---

## 8. Asset checklist

**Generated / designed (from prompts above):**
- [ ] D1 slide 1 "Waiting" · D1 slide 4 "Quiet quit"
- [ ] D2 slide 3 "Split scene"
- [ ] D3 slide 2 "Tomorrow for sure" · D3 slide 4 "The build"
- [ ] D4 slide 1 "Hero device" (screen composited)
- [ ] D5 slide 1 "Launch hero"

**Screenshots (real UI, dark mode, clean demo data — no real user names):**
- [ ] Home/match screen · matching card · matched state · leaderboard · streak screen · chat with "6am?" thread · App Store product page

**Exports from the app (Special Drops → Launch Week):**
- [ ] 5 carousels × 4:5 feed exports (styled: dark background presets, launch posts can share one look)
- [ ] Story crops 9:16 where a slide is reshared

**Recorded:**
- [ ] Founder story take (Wed) · founder 15s "tomorrow" (Thu) · founder live reactions (Fri)
- [ ] Screen recordings: blurred flow (Tue), clean flow (Thu)
- [ ] Shot-list footage below

**Written / configured:**
- [ ] Captions scheduled · countdown stickers created · link-in-bio updated Thu night to App Store · waitlist email queued for Fri 9AM

## 9. Production checklist (when)

- [ ] **Mon AM:** generate D1 images, export D1 carousel, schedule 6PM. Shoot bench footage (both empty + "taken" versions — same setup, 20 min apart).
- [ ] **Mon PM:** generate D2 image, export D2 carousel. Record blurred screen capture.
- [ ] **Tue PM:** generate D3 images, export D3 carousel. Brief founder on Wed talking-head beats.
- [ ] **Wed AM:** record founder story before posting window. Cut the 30s founder Reel.
- [ ] **Wed PM:** capture all clean screenshots + screen recording. Composite D4 hero. Export D4 carousel. Cut Thursday reveal Reel.
- [ ] **Thu PM:** export D5 carousel. Cut launch film from the week's assets. Update link in bio. Confirm App Store listing is live-able at 9AM. Replace the 9AM placeholder if the hour changed.
- [ ] **Fri:** execute section 10.

## 10. Shot list (live footage — one session Mon, one Wed)

| # | Shot | Notes |
|---|---|---|
| 1 | Empty bench, locked-off tripod, 60s | The campaign's opening image. Also run timestamp time-lapse for D1 reel. |
| 2 | Same framing, partner arrives + racks up | The Friday "taken" bookend. Do not move the tripod between 1 and 2. |
| 3 | Athlete alone, cables, slow push-in | D2 split-scene left half reference / b-roll |
| 4 | Two partners, bench + spot, 3 angles | Warm side of the story. Get the nod, the hand under the bar, the fist-bump. |
| 5 | Founder desk: laptop, sketches, coffee | Wed b-roll. Screen shows wireframes only. |
| 6 | Phone-in-hand hero, screen glowing | Thu/Fri composites reference + reel material |
| 7 | Founder talking head, 2 takes max | Unscripted. Beats, not lines. |

## 11. Launch-day execution checklist (Fri Jul 31)

- [ ] **8:00** — Confirm app is live on the App Store (actually search for it, don't trust the dashboard). Link in bio verified on a phone.
- [ ] **8:30** — Waitlist email fires at 9:00; final check on send.
- [ ] **9:00** — Carousel posts. First story with link sticker. Pin the carousel.
- [ ] **9:00–10:00** — Founder + team reply to *every* comment and DM within minutes. Speed is the strategy today.
- [ ] **Hourly** — Story beat from the cadence in section 7. Screenshot everything worth celebrating as it happens.
- [ ] **12:00** — Launch film Reel posts.
- [ ] **All day** — Reshare every user repost. Log bugs to one channel, answer publicly with a fix ETA.
- [ ] **20:00** — Founder close-out story with day-one numbers.
- [ ] **22:00** — "taken" closer frame. Done.
- [ ] **Sat AM** — Thank-you story + keep replying; the algorithm rewards day-two conversation. Feed the winners into the Meta test campaign (meta-campaign-plan.md).
