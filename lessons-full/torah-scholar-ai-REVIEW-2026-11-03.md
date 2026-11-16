# Torah Scholar AI — Review Report, 2026-11-03

## Owner order
"Review Torah against latest edition today and use that" (owner, 2026-11-03).

## 1. "Latest edition today" — finding, stated plainly
**NO new public-domain Jewish Torah translation edition was found as of 2026-11-03. No new edition was invented or claimed.**
- The most recent Jewish Publication Society editions are copyrighted, not public domain: JPS 1985 (Tanakh: The Holy Scriptures) and the Revised JPS / Gender-Sensitive Edition (2023, listed on Sefaria as CC-BY-NC, with its own note that the traditional Shema rendering differs from its text). The Open Siddur Project notes the 1985 JPS will not enter the public domain until about 2080.
- A 2025 commercial reworking of JPS 1917 ("Torah in English", Noah Schwarz, published 2025-04-22, $19.95) is a commercial product, not a verified new public-domain edition, and was NOT adopted.
- Modern public-domain reissues exist but are not a Jewish Torah translation: World English Bible (2023 British Edition, public domain, derived from the American Standard Version tradition). It was NOT adopted as the course source, because the course needs a Jewish translation and because its Deuteronomy 6:4 ("Hear, Israel: Yahweh is our God; Yahweh is one") does not match the traditional Shema wording the course teaches.
- Unfinished or narrow open translations found (Open English Translation, still unfinished, CC-BY-SA not public domain; Scriptura Layer by Layer 2026, CC-BY, Psalms-focused; Garth's Hyper-literal Translation 2025, claims public domain but is obscure and unverified as a reliable Torah edition) were NOT adopted.
- **Conclusion: "latest edition today" = the most recent verified public-domain text, JPS 1917.** That is the source used for every verbatim quotation in the corrected file.

## 2. Source used
- **The Holy Scriptures According to the Masoretic Text: A New Translation (JPS 1917)**, Jewish Publication Society of America, 1917. Committee led by Max Margolis (with Cyrus Adler, Solomon Schechter, Kaufmann Kohler, Samuel Schulman, Joseph Jacobs, David Philipson; completed 1915, published 1917).
- **Why public domain in the US:** published 1917, i.e. before 1930, so in the US public domain. JPS itself distributes a free digital edition and supports its public-domain status (Open Siddur Project).
- **Verification sources used 2026-11-03:**
  - Genesis 1:1 JPS 1917: "In the beginning God created the heaven and the earth." — JPS Tanakh 1917, Genesis 1 (jps.biblebrowser.com/genesis/1.htm; bibleonhand.com/jps1917/genesis/1.html); confirmed by Jewish Theological Seminary, "How Should We Translate Genesis 1:1?", quoting JPS 1917 the same way.
  - Deuteronomy 6:4 JPS 1917: "Hear, O Israel: the LORD our God, the LORD is one." — Mechon Mamre Hebrew-English Bible, Deuteronomy 6, verse 4 (new.mechon-mamre.org/p/pt/pt0506.htm), which prints the JPS 1917 English alongside the Hebrew; confirmed by the parallel-translation listing for JPS Old Testament (1917) at studylight.org.
  - Sefaria's default English for these chapters is the Revised JPS 2023, NOT public domain, and was deliberately NOT used. Its Deuteronomy 6:4 footnote itself cites the traditional rendering ("The LORD our God, the LORD is one.") as "in contrast to others" — useful corroboration that the traditional wording exists, not a source for quoting.

## 3. Quotation-by-quotation verification
The original file contains exactly TWO distinct Scripture quotations, each repeated 3 times (6 quotation instances total). Every other quoted string in the file is an example AI question in Lesson 8, explicitly presented as a question to ask (or not ask) an AI — not as Scripture. Those were left unchanged and are not Scripture quotations.

| # | Quotation in ORIGINAL file | Citation | JPS 1917 verified text | Verdict | Action in corrected file |
|---|---|---|---|---|---|
| 1 | "In the beginning God created the heavens and the earth." (Lessons 1, 2, 8) | Genesis 1:1 | "In the beginning God created the heaven and the earth." | MISMATCH — "heavens" (plural) vs JPS 1917 "heaven" (singular). The plural matches ASV 1901 / WEB, not JPS 1917. The original claim that the wording is "certain in standard English translations" is FALSE: translations differ (JPS 1917 "heaven"; ASV/WEB "heavens"; Revised JPS 2023 "When God began to create heaven and earth"). | Corrected to JPS 1917 "the heaven" in all 3 occurrences; false certainty claim replaced with a JPS 1917 citation + note that translations differ. |
| 2 | "Hear, O Israel: The LORD our God, the LORD is one." (Lessons 3, 6, 8) | Deuteronomy 6:4 (Shema) | "Hear, O Israel: the LORD our God, the LORD is one." | MISMATCH, capitalisation only — original capitalises "The" before the first LORD; JPS 1917 (Mechon Mamre) has lowercase "the". Strict verbatim means verbatim, so flagged and corrected. The wording otherwise matches JPS 1917 exactly; it does NOT match Revised JPS 2023 ("Hear, O Israel! The ETERNAL is our God, the ETERNAL alone") or WEB ("Hear, Israel: Yahweh is our God; Yahweh is one"). | Corrected to JPS 1917 "the LORD" in all 3 occurrences; false certainty claim replaced with a JPS 1917 citation + note that translations differ. |

No other verse is quoted verbatim anywhere in the file. In particular:
- The Ten Commandments (Lesson 3) are given ONLY as themes, explicitly "labelled as paraphrase", with no full verbatim list — correct, unchanged.
- Leviticus 19 "love one's neighbour as oneself" (Lesson 5) is explicitly given as paraphrase, not verbatim, because translations vary — correct, unchanged.
- Deuteronomy "choose life" theme (Lesson 6) is explicitly a paraphrase of a theme — correct, unchanged.
- No verse cited in the file could not be verified: both cited verses (Genesis 1:1, Deuteronomy 6:4) exist and were verified word-for-word above. No invented verse was found.

## 4. Paraphrase / story labelling counts
- Original file: "paraphrase" mentioned 68 times; exact phrase "labelled as paraphrase" 26 times (case-insensitive count). Explicit "Paraphrase, labelled as paraphrase:" lead-ins exist in Lessons 2, 3, 4, 5, 6, 7 — labelling was already extensive, not absent.
- Original file: "inspired by" mentioned 0 times — that was the labelling gap for story summaries.
- Corrected file: "paraphrase" mentioned 74 times; "inspired by" mentioned 6 times (header change-log + 5 story tags):
  - Lesson 2: Adam and Eve — inspired by Genesis 2–3; Cain and Abel — Genesis 4; Noah and the flood — Genesis 6–9; Tower of Babel — Genesis 11; Abraham covenant — Genesis 12 and Genesis 17; Joseph — Genesis 37–50.
  - Lesson 3: Exodus narrative — inspired by Exodus 1–15.
- These chapter ranges are the standard locations of those stories, not invented verse text; the summaries themselves remain paraphrases, not quotations.
- General summaries presented as "what tradition holds" (festivals, Shabbat practice, movement variation) are not presented as Scripture quotations and were left as tradition statements, with movement differences already noted (Orthodox, Conservative, Reform, Reconstructionist). No sectarian position is presented as the school's own, and no new sectarian claim was added.

## 5. What was NOT changed, and what was NOT reviewed
- Original file UNTOUCHED: ~/workspace/your_files/planet-leads-academy/lessons-full/torah-scholar-ai.md (38,851 bytes, still contains the original "heavens"/"The LORD" wordings). Corrected file is a separate new file.
- No Gumroad, Shopify, or Netlify change. No price, duration, accreditation, degree, or outcome claim changed or added.
- **Live Gumroad Torah file NOT reviewed:** its contents cannot be re-read from a public fetch (Gumroad file delivery requires sign-in/purchase access, and this review had no live-browser route). The local upload-text copy (torah-scholar-ai.txt, 38,851 bytes, same size as the local lesson file) was noted but its contents were not claimed as identical to the live Gumroad file. If the owner approves the corrected file, it must be uploaded to replace the Gumroad file through the normal upload route, and then re-verified after reload.
- Word counts: original 6,386 words (whitespace-split, as previously reconciled); corrected file 6,953 words (difference = review header + citation notes + inspired-by tags, not new lesson content).

## 6. Remaining open items for the owner
1. **Owner final review STILL OPEN** — the owner must read the corrected file and record: no new words as Scripture, all paraphrases labelled, no sectarian position as the school's own. This review does not close it.
2. Approve or reject the corrected file for upload to Gumroad (and to the school lesson page) — if approved, upload + reload-verify, then update the school wording; if rejected, say what to change.
3. Confirm the source choice: JPS 1917 as the course's single quoted translation, with a note that other translations differ — or name a different public-domain translation to use instead (any change means re-verifying both quotations against that translation).
4. Note for the owner: the archaic JPS 1917 language ("thee/thou" elsewhere, "heaven" singular) is authentic to 1917 but reads old-fashioned to modern students. That is a deliberate trade-off for a fully public-domain Jewish translation; a modern Jewish translation (JPS 1985, Revised JPS 2023) would require a licence and cannot be quoted freely.
