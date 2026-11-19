/* Planet Leads Academy — course player (parity item A2).
 *
 * Runs on the lessons index page (lessons/<slug>.html) and on each
 * per-lesson page (lessons/<slug>/lesson-N.html). Provides:
 *   - per-lesson navigation state (completed ticks in the lesson list)
 *   - a Mark complete button wired to the student backend's per-lesson
 *     progress API (POST /api/progress) when the student is signed in,
 *     with the browser store (localStorage) as the always-on record
 *   - resume: the lessons index "Continue" link points at the first
 *     incomplete lesson; the last lesson opened is remembered
 *   - the enrollment gate (below), ready for the Phase 8 flip
 *
 * Progress is kept in localStorage key "pla_player_v1":
 *   { "<course-slug>": { "done": [bool x8], "last": <lesson number> } }
 * When a sign-in token exists (localStorage "pla_server_token", the same
 * key login.html uses), server progress for a VERIFIED enrollment is the
 * record for that course and is merged in on load; the backend accepts
 * progress only on verified enrollments, so an unverified tick stays a
 * browser-only tick and the page says so.
 *
 * Created with Planet Leads 🚀
 */
'use strict';

/* ==== PHASE 8 GATE SWITCH — the single flag for the owner's decision ====
 * Owner decision (2026-11-18): Lesson 1 of every course is the free
 * preview; Lessons 2–8 gate behind enrollment WHEN the student system
 * flips live (Phase 8). Until then, lesson text stays public.
 *
 *   PLA_GATE_OPEN = true   -> every lesson is readable (today's state)
 *   PLA_GATE_OPEN = false  -> Lessons 2–8 require a verified enrollment,
 *                             checked live against GET /api/progress with
 *                             the student's sign-in token; Lesson 1 stays
 *                             open. (Static-site gate: it withholds the
 *                             reading view in the browser; the purchased
 *                             course ZIP remains the paid artifact.)
 * Flipping this one value is the whole switch — no rebuild needed.
 */
var PLA_GATE_OPEN = true;

var PLA_API_BASE = 'https://planet-leads-academy-backend.onrender.com';
var PLA_PLAYER_KEY = 'pla_player_v1';

function plaLoadStore() {
  try {
    return JSON.parse(localStorage.getItem(PLA_PLAYER_KEY) || '{}') || {};
  } catch (e) { return {}; }
}
function plaSaveStore(store) {
  try { localStorage.setItem(PLA_PLAYER_KEY, JSON.stringify(store)); } catch (e) {}
}
function plaToken() {
  try { return localStorage.getItem('pla_server_token'); } catch (e) { return null; }
}
function plaCourseState(store, slug) {
  if (!store[slug] || !Array.isArray(store[slug].done)) {
    store[slug] = { done: [false, false, false, false, false, false, false, false], last: 0 };
  }
  return store[slug];
}

function plaRenderState(root, state) {
  for (var n = 1; n <= 8; n++) {
    var mark = root.querySelector('[data-done-mark="' + n + '"]');
    if (mark) mark.hidden = !state.done[n - 1];
    var link = root.querySelector('[data-lesson-link="' + n + '"]');
    if (link) {
      if (state.done[n - 1]) link.classList.add('is-done');
      else link.classList.remove('is-done');
    }
  }
  var summary = root.querySelector('[data-progress-summary]');
  if (summary) {
    var doneCount = state.done.filter(Boolean).length;
    summary.textContent = doneCount === 0
      ? 'You have not completed any lessons in this course yet.'
      : 'You have completed ' + doneCount + ' of 8 lessons in this course.';
  }
  var cont = root.querySelector('[data-continue-link]');
  if (cont) {
    var next = state.done.indexOf(false) + 1; // first incomplete (1-based)
    if (next === 0) next = 1;
    var slug = root.getAttribute('data-player-course');
    cont.setAttribute('href', slug + '/lesson-' + next + '.html');
    cont.textContent = state.done.filter(Boolean).length === 8
      ? 'All 8 lessons complete — review from Lesson 1 →'
      : (state.done.filter(Boolean).length === 0 && !state.last
        ? 'Start with Lesson 1 →'
        : 'Continue with Lesson ' + next + ' →');
  }
  var btn = root.querySelector('[data-mark-complete]');
  if (btn) {
    var lesson = parseInt(root.getAttribute('data-player-lesson'), 10);
    var isDone = !!state.done[lesson - 1];
    btn.setAttribute('aria-pressed', isDone ? 'true' : 'false');
    btn.textContent = isDone
      ? 'Lesson ' + lesson + ' complete ✓ — tap to undo'
      : 'Mark Lesson ' + lesson + ' complete';
  }
}

async function plaFetchServerProgress(slug) {
  var token = plaToken();
  if (!token) return null;
  try {
    var res = await fetch(PLA_API_BASE + '/api/progress', {
      headers: { Authorization: 'Bearer ' + token }
    });
    if (!res.ok) return null;
    var body = await res.json();
    return (body.progress || {})[slug] || null;
  } catch (e) { return null; }
}

async function plaInitPlayer() {
  var root = document.querySelector('[data-player-course]');
  if (!root) return;
  var slug = root.getAttribute('data-player-course');
  var lessonAttr = root.getAttribute('data-player-lesson');
  var lesson = lessonAttr ? parseInt(lessonAttr, 10) : 0;
  var store = plaLoadStore();
  var state = plaCourseState(store, slug);

  if (lesson >= 1 && lesson <= 8) {
    state.last = lesson;
    plaSaveStore(store);
  }
  plaRenderState(root, state);

  /* Gate check (dormant while PLA_GATE_OPEN is true). Applied before the
   * server sync so a gated lesson never flashes its text. */
  var gated = false;
  if (!PLA_GATE_OPEN && lesson > 1) {
    gated = true;
    var bodyEl = root.querySelector('[data-lesson-body]');
    var notice = root.querySelector('[data-gate-notice]');
    if (bodyEl) bodyEl.hidden = true;
    if (notice) notice.hidden = false;
  }

  /* Server sync: a verified enrollment's server progress is the record. */
  var server = await plaFetchServerProgress(slug);
  var verified = !!(server && server.status === 'verified');
  if (server && server.lessons) {
    for (var i = 1; i <= 8; i++) {
      state.done[i - 1] = !!server.lessons[String(i)];
    }
    plaSaveStore(store);
    plaRenderState(root, state);
  }
  if (gated && verified) {
    var bodyEl2 = root.querySelector('[data-lesson-body]');
    var notice2 = root.querySelector('[data-gate-notice]');
    if (bodyEl2) bodyEl2.hidden = false;
    if (notice2) notice2.hidden = true;
    gated = false;
  }

  /* Mark complete. */
  var btn = root.querySelector('[data-mark-complete]');
  if (btn && lesson >= 1 && lesson <= 8) {
    btn.addEventListener('click', async function () {
      var nowDone = !state.done[lesson - 1];
      state.done[lesson - 1] = nowDone;
      plaSaveStore(store);
      plaRenderState(root, state);
      var note = root.querySelector('[data-progress-note]');
      var token = plaToken();
      if (!token) {
        if (note) note.textContent = nowDone
          ? 'Saved in this browser only. Sign in with a verified enrollment to record progress on your student account.'
          : 'Saved in this browser only.';
        return;
      }
      try {
        var res = await fetch(PLA_API_BASE + '/api/progress', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token
          },
          body: JSON.stringify({ course_slug: slug, lesson: lesson, complete: nowDone })
        });
        var data = await res.json().catch(function () { return {}; });
        if (res.ok) {
          if (note) note.textContent = 'Saved — progress recorded on your student account.';
          if (data.progress && data.progress.lessons) {
            for (var j = 1; j <= 8; j++) {
              state.done[j - 1] = !!data.progress.lessons[String(j)];
            }
            plaSaveStore(store);
            plaRenderState(root, state);
          }
        } else {
          if (note) note.textContent =
            (data.error || 'The student system did not accept that progress.') +
            ' This tick is saved in this browser only.';
        }
      } catch (e) {
        if (note) note.textContent =
          'Saved in this browser only — the student system could not be reached.';
      }
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', plaInitPlayer);
} else {
  plaInitPlayer();
}
