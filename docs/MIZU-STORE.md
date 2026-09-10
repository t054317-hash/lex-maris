# Mizu Coffee Atelier — storefront prototype

`prototype/mizu-store.html` is a complete, self-contained e-commerce front end
for the Mizu mug / flask brand: catalogue, configurator, cart, checkout,
accounts, reviews and support content in one file. Open it in a browser — there
is no build step and no runtime CDN dependency.

It is **unrelated to the LEX MARIS platform** that occupies the rest of this
repository; it shares only the `prototype/` convention of shipping a reviewable
experience as a single HTML document.

## What is real and what is simulated

The product line is Mizu's actual coffee range — Tumbler 10 / 16 / 20, the
ceramic-lined Tumbler 16, the 14 oz Coffee Mug and a 17 oz coffee flask — and
the specifications quoted for the ceramic-lined T16 (16 oz / 450 ml, 155 mm
tall, 87 mm base, 264 g) come from the brand's own product data. The brand site
was unreachable from the build environment, so it was sourced through search
results rather than scraped.

Everything transactional is local and clearly labelled as a demo in the UI:

| Area | Behaviour |
| --- | --- |
| Prices | Representative USD figures, converted at indicative rates for EUR, GBP and KWD |
| Reviews | Eight written fixtures with a fixed 4.8 / 2,417 summary and rating distribution |
| Accounts | Any valid email plus an 8-character password signs in; state lives in `localStorage` |
| Checkout | Validates, waits, and returns an order number. No card fields, no network calls |
| Promo codes | `MIZU10` (10% off), `WARMTH20` (20% off from $80), `SHIPFREE` (free shipping) |

Cart contents, chosen currency and the signed-in name persist in
`localStorage` under `mizu.store.v1`; private-browsing failures are caught and
the page simply forgets.

## The parts worth knowing about first

**Products are drawn, not photographed.** `vesselSVG()` renders each tumbler,
mug or flask as an SVG whose cylinder gradient is derived from the finish hex by
HSL maths, which is why a swatch click repaints the product instantly — in the
grid, in the configurator, in the cart line and in the search suggestions —
without a single image asset. Adding a colourway means adding one entry to
`FINISHES`.

**One data source feeds every surface.** `CATALOGUE` drives the grid, the type
filter, the header search, the configurator, cart maths and the checkout
summary. Adding a product needs no other edit.

**Thermal retention shares a single scale.** Hot and cold hours are both drawn
against a fixed 0–36 hour track, so the two readings are directly comparable
instead of each filling its own bar.

**Tailwind is compiled in, in three blocks.** `<style id="tw-base">` (preflight),
then the page's component CSS, then `<style id="tw-utilities">`. See
`prototype/mizu-store.tailwind.js` for the rebuild command and why the order
matters.

## Accessibility and motion

Overlays are `role="dialog"` with `aria-modal`, trap Tab, close on Escape and
restore focus to whatever opened them. Focus is visible everywhere in gold. The
carousel is operable from the arrow keys, filters and swatches expose
`aria-pressed`, and toasts announce through an `aria-live` region.

Under `prefers-reduced-motion: reduce` the steam, marquee, parallax tilt,
carousel autoplay, reveals and smooth scrolling all stand down; nothing on the
page depends on animation to be usable. The parallax also stays off for coarse
pointers.

The page commits to one bright visual world — porcelain and warm linen lit by
sky and sage, gold reserved for primary actions — and paints every colour
explicitly, including the body background, so it holds up on a dark host ground
rather than borrowing one.
