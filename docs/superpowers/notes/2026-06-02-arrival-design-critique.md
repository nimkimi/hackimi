# Arrival Animation — Senior Designer Critique & Elevation

A design review of the v1 arrival (NH monogram draw → fly to nav → name reveal → lime pop) and a concrete plan to make it more memorable, written as if I were the design director on this project.

## What v1 gets right
- **Cohesive idea:** the monogram *becomes* the logo — cause/effect, not a gratuitous loader. Keep this.
- **On-brand restraint:** one accent, near-black, no clutter.
- **Technically clean:** once-per-session, reduced-motion-safe, no CLS. Don't regress this.

## Where v1 falls short (the honest part)
1. **The monogram draw-on is the expected move.** "Stroke a logo on with `stroke-dashoffset`" is the single most common loader trope of the last five years. It's competent but it doesn't *surprise*. For a developer-with-designer-taste, the entrance should signal "this person makes things," not "this person used the default reveal."
2. **The beats are sequential, not narrative.** Draw → fly → reveal → pop reads as four separate events. Premium arrivals have a **through-line** — one element or idea that carries you from first frame to last, so it feels like one gesture, not a checklist.
3. **The motion lacks character.** The flight to the nav is essentially a straight tween. No anticipation, no arc, no settle/overshoot — so it informs but doesn't *delight*.
4. **The accent is underused as a storyteller.** The lime appears only at the end as a small pop. Colour can do more work: it can be the protagonist.
5. **The exit is a fade.** The overlay dissolving is the least interesting way to hand off to the page.

## The elevation — concept: "The Spark"
Give the whole sequence ONE protagonist: a single acid-lime **spark** that is the through-line from first frame to the resting state.

1. **Anticipation (0–0.3s):** black screen, a single lime spark blinks into the center and pulses once. (Tiny, magnetic, "something's about to happen.")
2. **Construction, not drawing (0.3–1.1s):** the spark *travels* and the NH **builds itself in its wake** — strokes extend/snap into place as the spark traces them (the spark is the pen tip, a short lime trail behind it). The drawn line **settles from lime → ink** as it "sets," like ink drying. This reads as *building*, which is the whole brand: a developer who designs.
3. **Anticipation + launch (1.1–1.3s):** the finished mark dips slightly (anticipation), then launches toward the nav along a gentle **arc** (not a straight line), the spark detaching from it.
4. **Curtain reveal (1.3–1.9s):** the monogram docks into the nav with a subtle **overshoot/settle**, and as it lifts it **uncovers the hero name** — the overlay clip-wipes away with a **lime leading edge** (the accent is the wipe). Cause/effect: the mark *places* the page.
5. **Payoff (1.8–2.1s):** the detached spark flies into the headline and **becomes the period** in "Nima Hakimi." — the through-line lands as the one bit of accent on the page. Settle.

Why it's better: one protagonist (the spark) ties every beat together; "construction" beats "drawing"; arc + overshoot add character; the lime tells the story instead of just punctuating it; the exit is a designed wipe, not a fade. Still ~2s, still tasteful, still near-black + one accent, still reduced-motion-safe.

## Beyond the arrival — motion system notes (whole site)
- **Easing identity:** commit to one signature curve (`expo.out` / cubic-bezier(0.16,1,0.3,1)) for entrances and one snappier curve for hovers — consistency reads as intentional.
- **The spark as a recurring motif:** let the lime "spark/dot" reappear as the cursor accent, the link-underline origin, the period in section headings — a small recurring character that makes the site feel authored.
- **Scroll choreography:** Selected Work rows should reveal with a masked slide + the lime underline drawing on hover (not fade-up). Case-study images: clip-path wipe with a lime edge (echo the arrival exit).
- **Micro-delight, not micro-noise:** magnetic CTA with a real elastic settle; copy-email → "copied" tick; one playful Playground toy. Each earns its place.
- **Reduced-motion is a designed state, not an off-switch:** the spark/monogram simply appears already-docked, the name is already set, the period is already lime. It should still look composed with zero motion.

## Recommendation
Build "The Spark" as v2, keep v1, compare side by side. If the construction/spark idea is too much, the cheapest single upgrade to v1 is: add the **lime spark as the pen-tip drawing the monogram** + an **arc with overshoot** on the flight + a **lime-edged wipe** exit. That alone moves it from "competent" to "authored."
