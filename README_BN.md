# Birthday Wish — Final Fixed (GitHub Pages / Netlify Ready)

এই build-টি mobile-first করে bug-fix করা হয়েছে এবং reference video-র শুরুটা ফিরিয়ে আনা হয়েছে: **bow/arrow → pull & release / tap → heart hit → crack + burst → birthday story**।

## Main features

- Uploaded background song: `assets/birthday-song.mp3`
- Song duration প্রায় **3:16 (196 sec)**; 29টি birthday moment পুরো timeline জুড়ে চলে
- Reference-style bow + arrow intro
- Desktop mouse, touch screen এবং Android Chrome-এ **pull/release** কাজ করে
- Drag করতে অসুবিধা হলে bow-তে **একবার tap করলেও arrow shoot হবে**
- Heart hit + crack + two-side split/burst + particles
- Smooth scene transitions এবং responsive typography
- Birthday person's name সব relevant scene-এ ব্যবহার হয়
- Optional birthday photo; photo না থাকলে animated fallback artwork
- Multiple photo treatments, heart tree, wishes, candle, letter, personal note, final confetti
- Background music on/off button
- Password-protected creator panel
- Facebook + WhatsApp contact links
- `Development by TAwhid Ahmed`

## Creator password

Password: **945100**

একই hosted domain + একই browser profile-এ password একবার সঠিক দিলে unlock state `localStorage`-এ save থাকে। তাই পরেরবার একই browser-এ Customize খুললে সাধারণত password আবার দিতে হবে না। Browser data clear, private/incognito mode, অন্য browser, অথবা অন্য domain হলে আবার password লাগবে।

> এটি static website, তাই password client-side convenience lock; server-side security নয়।

## Customize

1. Website open করুন
2. **Customize** চাপুন
3. প্রথমবার `945100` দিন
4. Birthday person's name দিন
5. Your name / signature দিন
6. Personal note লিখুন
7. Optional photo select করুন
8. **Preview full story** চাপলে bow/arrow intro থেকে preview শুরু হবে
9. **Create share link** চাপুন
10. Copy/Share করে recipient-কে পাঠান

Photo browser-এর ভিতরে resize/compress হয়ে URL-এর hash fragment-এ যায়। তাই GitHub Pages/Netlify-এর মতো static hosting-এও exact personalized link অন্য ফোনে খুললে name/note/photo দেখা যায়। খুব বড় image (20 MB-এর বেশি) reject করা হয় যাতে mobile browser crash না করে।

## Android/mobile fixes included

- `100dvh`/safe-area layout
- No horizontal page overflow on tested small/mobile sizes
- Touch-friendly bow target
- Pointer + tap fallback
- Android browser keyboard-friendly 16px form inputs
- Modal vertical scrolling
- Mobile photo layouts
- Small-screen text overflow protection
- Long word sizing fix (e.g. COURAGE)
- Audio autoplay policy handled through the first user gesture
- If audio is delayed/blocked, the animation has a fallback clock instead of freezing
- If audio starts late, timing is re-synced instead of jumping backward
- Visibility/resume handling for mobile tab/app switching
- Older-browser fallback for arrow animation and dialog opening

## GitHub Pages deployment

1. নতুন GitHub repository তৈরি করুন
2. এই folder-এর **ভেতরের সব file** repository root-এ upload/push করুন
3. Repository → **Settings → Pages**
4. Source: **Deploy from a branch**
5. Branch: `main`, folder: `/ (root)`
6. Save করুন
7. GitHub Pages URL live হলে সেটা খুলে Customize করুন
8. তারপর **Create share link** ব্যবহার করুন

`.nojekyll` file included আছে, তাই GitHub Pages static assets সরাসরি serve করবে।

## Netlify deployment

সবচেয়ে সহজভাবে Netlify-তে এই folder drag-and-drop deploy করতে পারবেন। `netlify.toml` included আছে এবং কোনো build command দরকার নেই। Deploy URL open করে Customize → Create share link করুন।

## Required files

এগুলো একসাথে রাখতে হবে:

- `index.html`
- `styles.css`
- `app.js`
- `favicon.svg`
- `assets/birthday-song.mp3`
- `netlify.toml`
- `.nojekyll`

## Hosting watermark / logo

এই project নিজে **কোনো third-party hosting watermark, Netlify logo বা GitHub logo যোগ করে না**। GitHub Pages এবং normal Netlify static deploy সাধারণভাবে webpage-এর মধ্যে forced visible watermark inject করে না। তাই এই দুই host-এ extra watermark hide করার code প্রয়োজন নেই এবং page clean থাকবে।

যদি অন্য কোনো free host তার নিজস্ব mandatory branding browser/page-এর বাইরে inject করে, website code দিয়ে সেটি reliably remove করা যায় না এবং provider-এর rules-ও প্রযোজ্য হতে পারে। এই build-এ কোনো extra host badge markup রাখা হয়নি।

## Contact already configured

- Facebook: `https://www.facebook.com/tawhid.ahmed.gfx`
- WhatsApp: `01343175562`
- WhatsApp button opens `+8801343175562` with **Assalamu Alaikum** prefilled

## QA performed

Representative automated browser QA করা হয়েছে Android-style touch viewport, small 360×640 phone viewport, 390×844 mobile viewport এবং landscape/desktop layouts-এ। Intro tap, pull/release, 29 story scenes, tree generation, cake interaction, password flow এবং preview flow test করা হয়েছে; JavaScript runtime exception পাওয়া যায়নি।
