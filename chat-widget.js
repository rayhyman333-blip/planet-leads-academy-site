/* Planet Leads Academy — Cynthia chat widget, VERIFIED-ANSWER MODE.
   No backend, no AI generation, no server storage in this mode.
   Verified-answer lookup (verified-lookup.js + verified-store.json, 33
   verified facts) runs FIRST, after safety escalations, and returns its
   canonical answer VERBATIM, labelled "Verified answer". Unknowns fall
   back to the guided catalog answers from knowledge.json (the verified
   school catalog).
   If a question is not in that catalog, the box says so and points to
   support at planetleads1@gmail.com or Muse chat, and escalates
   refunds, prices and technical decisions to the owner.
   Never type a password or card number into this box. Guided mode
   sends nothing anywhere; history is kept in this browser ONLY if the
   student ticks the history box, and is labelled as such. */
(function () {
  'use strict';

  function norm(s) { return String(s || '').toLowerCase(); }

  function findCourse(q, kb) {
    var text = norm(q);
    var best = null;
    (kb.courses || []).forEach(function (c) {
      var name = norm(c.name);
      var short = name.replace('conversational ', '').replace(' programming', '');
      if (text.indexOf(name) !== -1 || text.indexOf(short) !== -1 || text.indexOf(c.slug.replace(/-/g, ' ')) !== -1) {
        if (!best || name.length > norm(best.name).length) best = c;
      }
    });
    return best;
  }

  function plaAnswer(question, kb, lookupAnswer) {
    var q = norm(question);
    var course = findCourse(q, kb);
    var support = kb.support_email || 'planetleads1@gmail.com';
    var owner = kb.owner_email || 'rayhyman333@gmail.com';

    // MUST-NOT-ANSWER / ESCALATE FIRST — before any helpful catalog answer.
    if (/\b(diagnos|prescrib|medicine|medication|illness|symptom|treat my|therapy for my|cure)\b/.test(q)) {
      return 'I cannot diagnose or prescribe anything, and I cannot give medical advice. Cynthia does not diagnose or prescribe. For a health question, please see a qualified health professional, and for school help email support at ' + support + '.';
    }
    if (/(approve my refund|give me a refund|refund me now|decide my refund|i want my money back)/.test(q)) {
      return 'I cannot approve or decide a refund. Refunds go to owner review. Refund terms are 14 days from purchase, full refund, same rule everywhere (Gumroad, Shopify Shopper, and Shopify Boutique Dainty). To request one, email support at ' + support + ' with the course or bundle name, receipt or order id, buyer email, purchase date, amount, and reason, and the owner will review the purchase record and decide.';
    }
    if (/(change the price|lower the price|discount|cheaper|negotiate)/.test(q)) {
      return 'I cannot change a price or offer a discount. Single courses are $49.99 or $59.99, Professional bundle $129.99, Enterprise bundle $299.99. For a price question, email support at ' + support + ' and the owner will review it.';
    }
    if (/(accredited|accreditation|degree|diploma|university credit)/.test(q)) {
      return 'Planet Leads Academy is not accredited and does not award degrees or diplomas. Certificates of Completion certify completion of the 8 lessons of a course only. Cynthia is an AI instructor, not a human teacher, and does not claim human credentials, degrees, or accreditation.';
    }
    if (/(password|card number|credit card|debit card|bank details)/.test(q) && /(what is|tell me|give me|show me|my password|my card)/.test(q)) {
      return 'Do not type a password or card number into this chat. Planet Leads does not store your card — payment is handled by Gumroad. For account help, email support at ' + support + '.';
    }

    // COURSE-SPECIFIC ANSWERS FIRST — a named course's exact price /
    // duration beats the general lookup answer (e.g. "How much is
    // Python?" must give $59.99, not the general singles range).
    if (course) {
      if (/(price|cost|how much)/.test(q)) {
        return course.name + ' costs ' + course.price + ' (' + course.category + ', ' + course.duration_hours + ' hours estimated study time, 8 lessons). Pay in full upfront on Gumroad — no pay-later, no installments. See its course page in the Catalog for its Gumroad link.';
      }
      if (/(how long|duration|hours|how many hours)/.test(q)) {
        return course.name + ' is an estimated ' + course.duration_hours + ' hours of study, at your own pace, with no deadline. That is an estimate for reading its 8 lessons and doing the practice exercises — not a verified average completion time and not a guarantee.';
      }
      if (/(lesson|what is in|what do i learn|outline|syllabus)/.test(q)) {
        return course.name + ' has 8 written lessons (' + course.category + ', ' + course.price + ', about ' + course.duration_hours + ' hours estimated). Each lesson has a practice exercise. Full lesson text is in the school lesson pages and in its Gumroad file. Cynthia teaches it in plain English, lesson by lesson.';
      }
      return course.name + ' — ' + course.category + ', ' + course.price + ', estimated ' + course.duration_hours + ' hours, 8 written lessons, at your own pace. Open its course page in the Catalog for its Gumroad link. Cynthia is its instructor: Starter Cynthia, AI instructor, not a human teacher.';
    }

    // VERIFIED-ANSWER LOOKUP FIRST (after safety escalations above).
    // lookupAnswer is the v2 router; if it matches, its canonical answer
    // is returned verbatim, labelled. Clarification asks which Academy
    // topic was meant. Unknown falls through to the guided catalog below.
    if (typeof lookupAnswer === 'function') {
      var looked = lookupAnswer(question);
      if (looked && looked.source === 'verified_lookup' && looked.answer) {
        return 'Verified answer: ' + looked.answer;
      }
      if (looked && looked.source === 'clarification') {
        return 'Verified answer — clarification: ' + (looked.text || 'That could mean a few different Academy topics, and I won\'t guess which one you meant. Did you want the full school summary, courses and lessons, bundles, or the instructor? Tell me which one, and I\'ll give you the verified answer for that topic.');
      }
    }

    // Catalog answers (course-specific answers already handled above).
    if (/(price|cost|how much)/.test(q)) return 'Single courses are $49.99 or $59.99. Professional bundle (3 courses) is $129.99 and Enterprise bundle (10 courses) is $299.99. Ask me about a named course for its exact price, or open the Catalog.';
    if (/(how long|duration)/.test(q)) return 'Estimated study time, at your own pace with no deadline: Business and Faith courses 6 hours each, Music and Language courses 8 hours each, Programming courses 10 hours each. Each course has 8 lessons. These are estimates, not verified average completion times and not guarantees.';
    if (/(refund)/.test(q)) return 'Refund terms: 14 days from purchase, full refund, same rule everywhere (Gumroad, Shopify Shopper, and Shopify Boutique Dainty). Requests go through the purchase record with owner review. Email support at ' + support + ' with the course or bundle name, receipt or order id, buyer email, purchase date, amount, and reason. Cynthia does not decide refunds alone.';
    if (/(enrol|enroll|buy|sign up|how do i start|get started)/.test(q)) return 'How enrollment works: 1. Browse the Catalog. 2. Open a course page. 3. Tap its Gumroad link. 4. Pay in full upfront on Gumroad — no pay-later, no installments. 5. Study the written lessons at your own pace. 6. Track progress in My Courses in this browser, or ask Talk to Cynthia for help, or email support at ' + support + '.';
    if (/(bundle)/.test(q)) return 'Professional bundle — 3 courses for $129.99: Leadership Mastery, Python Programming, Conversational Spanish (singly $169.97, saving $39.98). Enterprise bundle — 10 courses for $299.99: the 9 full courses plus Digital Marketing (singly $569.90, saving $269.91). Bundle picks are recorded, but no bundle checkout link is shown until a real bundle product is created and verified.';
    if (/(certificate)/.test(q)) return 'At 8 of 8 lessons you can generate a printable Certificate of Completion with your name, course, and date, as recorded in this browser (Student System v2) until the server system is live. It is not accredited and is not a degree or diploma.';
    if (/(progress|my courses|login|server)/.test(q)) return 'My Courses (Student System v2) works in this browser only: add a course you bought, tick off its 8 lessons, and generate a certificate at 8 of 8. Server login with cross-device progress is built locally (Item 1) and is NOT live yet. For login help, email support at ' + support + '.';
    if (/(who teaches|instructor|who is cynthia|about cynthia)/.test(q)) return 'Cynthia is the instructor for all 25 Planet Leads Academy courses: Cynthia OS, Starter Cynthia, by Planet Leads, created by Ramel Hyman. She is an AI instructor, not a human teacher, and does not claim human credentials, degrees, or accreditation. She tutors, guides, and helps in plain English. Refunds, prices, and technical fixes go to owner review.';
    if (/(support|contact|email|help|question)/.test(q)) return 'For all school help, administration, and questions, email support at ' + support + '. Owner contact for owner and price matters is ' + owner + '. Include the course name, what you were trying to do, and what happened.';
    if (/(course list|catalog|what courses|all courses|list)/.test(q)) return 'Planet Leads Academy has 35 courses: Business & Professional (8), Programming (5), Music (5), Languages (12), Faith & Spirituality (5). Each has 8 written lessons. Open the Catalog page for the full list with prices and Gumroad links.';
    if (/(hi|hello|hey|good morning|good afternoon)/.test(q)) return 'Hello! I am Cynthia, Starter Cynthia, your tutor, guide, and instructor here. Ask me about a course price, duration, enrollment, refunds, bundles, certificates, or support — in plain English. I answer from the verified school catalog only in this guided mode.';
    return 'I don\'t know that from the school catalog, so I will not guess. For school help, administration, and questions, email support at ' + support + ', or ask in Muse chat. If it is about a refund, price, or technical fix, the owner reviews it.';
  }

  // Browser UI only. In Node (tests) plaAnswer is exported instead.
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
      var boxes = document.querySelectorAll('[data-pla-chat]');
      if (!boxes.length) return;
      Promise.all([
        fetch('knowledge.json').then(function (r) { return r.json(); }).catch(function () { return null; }),
        fetch('verified-store.json').then(function (r) { return r.json(); }).catch(function () { return null; })
      ]).then(function (parts) { init(parts[0], parts[1]); }).catch(function () { init(null, null); });
      function init(kb, store) {
        var lookupAnswer = null;
        if (store && store.entries && typeof window !== 'undefined' && window.CynthiaLookup) {
          try {
            var router = new window.CynthiaLookup.Router(store.entries);
            lookupAnswer = function (q) {
              var res = router.answer(q);
              if (res.source === 'clarification') res.text = window.CynthiaLookup.CLARIFICATION_TEXT;
              return res;
            };
          } catch (e) { lookupAnswer = null; }
        }
        var fallback = { support_email: 'planetleads1@gmail.com', owner_email: 'rayhyman333@gmail.com', courses: [] };
        kb = kb || fallback;
        boxes.forEach(function (box) {
          var log = box.querySelector('.pla-chat-log');
          var input = box.querySelector('.pla-chat-input');
          var send = box.querySelector('.pla-chat-send');
          var keep = box.querySelector('.pla-chat-keep');
          function addMsg(who, text) {
            var div = document.createElement('div');
            div.className = 'pla-chat-msg' + (who === 'You' ? ' pla-chat-msg-user' : '');
            var b = document.createElement('b'); b.textContent = who;
            var p = document.createElement('p'); p.textContent = text;
            div.appendChild(b); div.appendChild(p); log.appendChild(div);
            log.scrollTop = log.scrollHeight;
            if (keep && keep.checked) {
              try {
                var h = JSON.parse(localStorage.getItem('pla_chat_history') || '[]');
                h.push([who, text]); localStorage.setItem('pla_chat_history', JSON.stringify(h.slice(-50)));
              } catch (e) { /* history is optional; never block chat */ }
            }
          }
          function ask(text) {
            if (!text) return;
            addMsg('You', text);
            addMsg('Cynthia', plaAnswer(text, kb, lookupAnswer));
            input.value = '';
          }
          send.addEventListener('click', function () { ask(input.value.trim()); });
          input.addEventListener('keydown', function (e) { if (e.key === 'Enter') ask(input.value.trim()); });
          box.querySelectorAll('.pla-chat-suggest button').forEach(function (btn) {
            btn.addEventListener('click', function () { ask(btn.textContent); });
          });
          addMsg('Cynthia', 'Hello! I am Cynthia, Starter Cynthia. Verified-answer mode: I answer verified facts verbatim and label them \'Verified answer\', and answer catalog questions from the verified school catalog — prices, durations, enrollment, refunds, bundles, certificates, and support. No live AI yet, and I send nothing anywhere in this mode.');
        });
      }
    });
  }

  if (typeof module !== 'undefined' && module.exports) { module.exports = { plaAnswer: plaAnswer }; }
  if (typeof window !== 'undefined') { window.plaAnswer = plaAnswer; }
})();
