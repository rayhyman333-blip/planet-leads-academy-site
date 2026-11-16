# Planet Leads Academy — Chat Box Spec (Option 2, owner-chosen)

## Status — READ FIRST
- **Guided mode is BUILT locally in this task. It is NOT deployed and NOT live.**
  The live site (Deploy 8, planetleads-academy.netlify.app) still has the old
  Talk to Cynthia guide page with no chat box. Do NOT claim a live chat box
  until the deploy steps in §6 pass on a fresh live check.
- **Live mode is NOT built in this task.** It needs the Item 1 server deploy
  (Netlify Functions + Supabase, built locally, NOT live yet) plus the chat
  endpoint in §4. No AI provider, API key, or paid chat service is invented
  here, and none is required for guided mode.

## 1. What the box is
- Cynthia OS, Starter Cynthia — tutor, guide, help desk, and instructor for
  all 25 Planet Leads Academy courses.
- Plain English. AI instructor, not a human teacher. No human credentials,
  degrees, or accreditation claimed. No diagnosis or prescribing.
  No refund, price, or technical decision alone — those escalate to the
  owner (see §5).

## 2. Guided mode (works on the static site NOW, no backend)
- Files: `chat-widget.js`, `chat-widget.css`, `knowledge.json` in the school
  site root. The widget fetches `knowledge.json` on page load; if the fetch
  fails it falls back to core facts only (prices, support, refund) so the box
  never invents an answer from nothing.
- Placement in this task (deliberately limited, no nav edit on all pages):
  `cynthia.html`, `index.html`, `my-courses.html` only. Each gets the same
  `<link rel="stylesheet" href="chat-widget.css">` + `<section data-pla-chat>`
  + `<script src="chat-widget.js"></script>` snippet.
  **Full rollout note:** to add the box to every course/lesson page, copy the
  same snippet with `../chat-widget.css`, `../chat-widget.js`, and
  `../knowledge.json` paths (subfolder pages need the `../` prefix), then
  re-run the link test and deploy. Do NOT claim full rollout until that
  deploy is verified.
- How it answers: keyword matching in `plaAnswer(question, kb)` against
  `knowledge.json` only — course name + intent (price, duration, lessons),
  plus general intents (enrollment, refund terms, bundles, certificate,
  progress/login, instructor, support, catalog list, greeting). No text
  generation, no outside lookup, no invented course, price, duration, or
  policy.
- Fallback (exact wording in code): "I don't know that from the school
  catalog, so I will not guess. For school help, administration, and
  questions, email support at planetleads1@gmail.com, or ask in Muse chat.
  If it is about a refund, price, or technical fix, the owner reviews it."
- Suggestion buttons (same on all three pages): "How much is Python?",
  "How long is Spanish?", "What is the refund policy?", "How do I enroll?",
  "What is the support email?"

## 3. Verified knowledge in knowledge.json (2026-11-03)
- 25 courses, each: name, category, price, duration_hours, gumroad code,
  slug, 8 lessons. Prices: $49.99 (Languages + Faith) / $59.99 (Business,
  Programming, Music). Durations: Business/Faith 6h, Music/Languages 8h,
  Programming 10h — estimates, at own pace, no deadline, not guarantees.
- Refund: 14 days from purchase, full refund, same rule everywhere
  (Gumroad, Shopify Shopper, Shopify Boutique Dainty), owner review.
- Support: planetleads1@gmail.com for all school help, administration, and
  questions. Owner: Ramel Hyman, rayhyman333@gmail.com for owner/price matters.
- Enrollment: Catalog → course page → Gumroad link → pay in full upfront,
  no pay-later/installments/subscription → study at own pace → My Courses
  in-browser (v2) until server login is live.
- Bundles (picks only): Professional 3 courses $129.99 (singly $169.97,
  saving $39.98); Enterprise 10 courses $299.99 (singly $569.90, saving
  $269.91). No bundle checkout link is claimed until a real bundle product
  is created and verified.
- Certificate: printable at 8/8, browser-recorded until server live.
  Not accredited. Not a degree or diploma.
- Progress now: My Courses v2, browser only. Server login (Item 1) NOT live.

## 4. Live mode — endpoint contract (TO BE BUILT in the server deploy step)
The guided box must NOT change its UI when live mode arrives. The widget
gains one branch only: if `window.PLA_LIVE_CHAT === true` (set by the deploy),
it POSTs instead of answering locally. Everything else (escalation, privacy,
fallback wording) stays the same.

- Endpoint: `POST /.netlify/functions/api/chat` (same Netlify Functions
  project as the Item 1 student system, `netlify/functions/api.js`).
- Request (JSON): `{ "student_session_token": "<server session, 24h, HTTPS-only>",
  "question": "<plain text, max 1000 chars>", "page": "<cynthia|home|my-courses|course slug>" }`
  No password, no card number, no payment data in any request. A request
  containing a card-like number or a password must be rejected with the
  generic "Do not type a password or card number" message and must NOT be
  stored or audited with that value.
- Response (JSON): `{ "answer": "<plain English, from verified catalog or a clearly labelled escalation>",
  "source": "catalog|escalation|fallback", "escalate": true|false,
  "escalation_to": "planetleads1@gmail.com|null" }`
- Server rules for live mode:
  1. Student session required (same session system as Item 1 login).
     Anonymous questions get guided-mode answers only, never a live AI answer.
  2. Every live chat turn is audited (student id, page, question category,
     source, escalate flag) — question text is audited ONLY if it contains
     no password/card-like value; otherwise audit the category only.
  3. Escalation: any refund decision, price change, discount, technical fix,
     medical, or degree/accreditation request returns `escalate: true` and
     the support email, and creates an owner-review item. The box never
     approves a refund, changes a price, diagnoses, prescribes, or claims
     a degree.
  4. Rate limit: same lockout approach as Item 1 login (5 failed/bad
     requests in 15 minutes = 15-minute pause for that session).
  5. No AI provider is named here. The server deploy step must name the
     provider (if any) explicitly, with its free/paid status and owner
     approval for that exact provider, BEFORE live mode is claimed. If no
     provider is approved, live mode stays OFF and guided mode stays the
     live box — that is still a real on-site chat box, honestly labelled.
- Live-mode label (must appear in the box when live): "Live mode: answers
  from the school catalog with owner escalation. History is server-audited
  as described in the Student System page."

## 5. Escalation rules (both modes, identical)
- Refund decision → owner review, support planetleads1@gmail.com, terms
  stated but decision NOT made by the box.
- Price change / discount → owner review.
- Technical fix → owner review, admin manual override wins.
- Medical (diagnosis/prescribing) → refusal + qualified professional
  signpost, no advice.
- Degree/accreditation → denial: not accredited, no degrees, completion
  certificate only.
- Unknown / not in catalog → fallback, no guessing, support email + Muse chat.

## 6. Privacy
- Guided mode: sends nothing anywhere. No server storage. Browser history
  ONLY if the student ticks "Keep chat history in this browser only"
  (localStorage key `pla_chat_history`, last 50 turns, unticked by default).
- Live mode: see §4 audit rules. No card data, no passwords, no payment
  data in chat, requests, or audit logs.
- Support: planetleads1@gmail.com. Owner: rayhyman333@gmail.com.

## 7. Deploy steps: guided → live (in order, do not skip)
1. Deploy the guided box as part of the next school deploy (this task's
   files + cynthia/index/my-courses updates), excluding `*.md` and
   `lessons-full/*` from the deploy zip if the deploy tool includes them
   (they are build notes, not site pages). Fresh-fetch cynthia.html and
   confirm the box, guided-mode label, and 5 suggestion buttons are present.
2. Test guided mode live (same 5 questions as the local test report).
3. Item 1 server deploy (Supabase free + Netlify Functions + env vars +
   owner email choice + deployed test enrollment). Card-stop: if any step
   asks for a card/paid plan/trial converting to paid, STOP that step.
4. Implement `POST /api/chat` per §4, with the provider (if any) explicitly
   approved by the owner first. If no provider is approved, STOP at guided
   mode and label it as such — do not claim live AI.
5. Flip `window.PLA_LIVE_CHAT = true` ONLY after a deployed live-chat test
   passes: 5 catalog questions answered, 3 escalation questions escalated,
   no password/card value stored, audit entries present, owner-review item
   created for an escalation test.
6. Update cynthia.html wording from "Guided mode" to "Live mode" ONLY after
   step 5 passes, then deploy that wording and fresh-fetch it.

## 8. What is NOT live yet (do not claim)
- No chat box on the live site yet (guided box is local only in this task).
- No live AI chat, no server chat endpoint, no server chat history.
- No chat box on course/lesson pages yet (cynthia/Home/My Courses only).
- No bundle checkout link, no server student login (Item 1, local only).
