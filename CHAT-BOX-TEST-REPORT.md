# Planet Leads Academy — Chat Box Test Report (guided mode, local)

Tested: 2026-11-03, locally (not deployed). Method: Node run of the exact
`chat-widget.js` `plaAnswer(question, knowledge.json)` used by the box,
plus `node --check` on the widget and JSON validation of knowledge.json.
Browser UI (input, send, suggestions, history checkbox) is in the same
files; it was not clicked in a live browser in this subagent task (generic
subagents cannot operate a live browser) — the parent agent must fresh-fetch
the deployed page and click the box before claiming it live.

## Guided test — 5 required questions: ALL PASS
1. Q: "How much is Python?"
   A: "Python Programming costs $59.99 (Programming, 10 hours estimated
   study time, 8 lessons). Pay in full upfront on Gumroad — no pay-later,
   no installments. See its course page in the Catalog for its Gumroad link."
   PASS — price $59.99, category, duration, lessons all match knowledge.json.
2. Q: "How long is Spanish?"
   A: "Conversational Spanish is an estimated 8 hours of study, at your own
   pace, with no deadline. That is an estimate for reading its 8 lessons
   and doing the practice exercises — not a verified average completion
   time and not a guarantee."
   PASS — 8 hours, own pace, no deadline, estimate disclaimer present.
3. Q: "What is the refund policy?"
   A: "Refund terms: 14 days from purchase, full refund, same rule everywhere
   (Gumroad, Shopify Shopper, and Shopify Boutique Dainty). Requests go
   through the purchase record with owner review. Email support at
   planetleads1@gmail.com with the course or bundle name, receipt or order
   id, buyer email, purchase date, amount, and reason. Cynthia does not
   decide refunds alone."
   PASS — 14 days, full, same rule, support email, owner review.
4. Q: "How do I enroll?"
   A: "How enrollment works: 1. Browse the Catalog. 2. Open a course page.
   3. Tap its Gumroad link. 4. Pay in full upfront on Gumroad — no pay-later,
   no installments. 5. Study the written lessons at your own pace.
   6. Track progress in My Courses in this browser, or ask Talk to Cynthia
   for help, or email support at planetleads1@gmail.com."
   PASS — steps match the school's enrollment steps exactly.
5. Q: "What is the support email?"
   A: "For all school help, administration, and questions, email support at
   planetleads1@gmail.com. Owner contact for owner and price matters is
   rayhyman333@gmail.com. Include the course name, what you were trying to
   do, and what happened."
   PASS — support email correct, owner email kept separate.

Extra guided checks (also PASS): Torah Scholar AI price $49.99 / Faith /
6 hours / 8 lessons; bundles Professional $129.99 / Enterprise $299.99 with
savings and "no bundle checkout link until verified"; instructor answer
(AI, not human, no credentials/degrees/accreditation).

## Must-NOT-answer tests — 3 categories: ALL PASS (refused/escalated, not claimed)
1. Refund decision — Q: "Approve my refund now, I want my money back"
   A: "I cannot approve or decide a refund. Refunds go to owner review.
   Refund terms are 14 days from purchase, full refund, same rule
   everywhere… To request one, email support at planetleads1@gmail.com
   with the course or bundle name, receipt or order id, buyer email,
   purchase date, amount, and reason, and the owner will review the
   purchase record and decide."
   PASS — terms stated, decision refused and escalated.
2. Medical — Q: "Can you diagnose my illness and prescribe medicine?"
   A: "I cannot diagnose or prescribe anything, and I cannot give medical
   advice. Cynthia does not diagnose or prescribe. For a health question,
   please see a qualified health professional, and for school help email
   support at planetleads1@gmail.com."
   PASS — no diagnosis, no prescribing, no medical advice given.
3. Degree claim — Q: "Is this school accredited and will I get a degree?"
   A: "Planet Leads Academy is not accredited and does not award degrees
   or diplomas. Certificates of Completion certify completion of the 8
   lessons of a course only. Cynthia is an AI instructor, not a human
   teacher, and does not claim human credentials, degrees, or accreditation."
   PASS — degree/accreditation explicitly denied, not claimed.
   (Bonus guard, also PASS: "What is my card number?" → "Do not type a
   password or card number into this chat. Planet Leads does not store
   your card — payment is handled by Gumroad.")

## File checks
- chat-widget.js: node --check OK. knowledge.json: JSON valid, 25 courses.
- All 5 guided assertions + 3 refusal assertions passed in the Node run.
- Link test after adding the widget to cynthia/index/my-courses: see parent
  agent's deploy check (widget adds chat-widget.css links, which exist).
