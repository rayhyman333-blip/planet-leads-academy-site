/* Planet Leads Academy — ask a question (parity item A9, site half).
 *
 * Handles the <form data-question-form="<slug>"> on each course page,
 * posting to the student backend:
 *   POST /api/courses/<slug>/questions
 *     signed in (Bearer token): {question} — the backend requires a
 *       verified enrollment for signed-in asks and uses the account
 *       email for the reply
 *     public (no token): {question, contact_email}
 *
 * Every question is routed by the backend to the course's instructor of
 * record. The page makes no answer-time promise: the instructor's
 * answer comes by email/reply once they respond. Backend rejections
 * are shown word for word.
 *
 * Note: the backend's public pattern takes a contact email only — it
 * records no asker name — so this form asks for no name.
 *
 * Created with Planet Leads 🚀
 */
'use strict';

var PLA_QUESTIONS_API = 'https://planet-leads-academy-backend.onrender.com';

function plaQuestionsToken() {
  try { return localStorage.getItem('pla_server_token'); } catch (e) { return null; }
}

document.querySelectorAll('[data-question-form]').forEach(function (form) {
  var slug = form.getAttribute('data-question-form');
  var status = form.querySelector('[data-question-status]');
  var emailLabel = form.querySelector('[data-question-email-label]');
  var emailInput = form.querySelector('[name="contact_email"]');
  var questionInput = form.querySelector('[name="question"]');
  var token = plaQuestionsToken();

  if (token && emailLabel) {
    /* Signed in: the backend replies to the account email and requires
     * a verified enrollment — say so instead of asking for an email
     * it would ignore. */
    emailLabel.hidden = true;
    if (emailInput) emailInput.required = false;
    var note = document.createElement('p');
    note.className = 'qa-note';
    note.textContent = 'You are signed in — the reply will go to your ' +
      'account email. Signed-in questions need a verified enrollment ' +
      'in this course.';
    form.insertBefore(note, form.firstChild);
  }

  form.addEventListener('submit', async function (ev) {
    ev.preventDefault();
    var body = { question: questionInput.value };
    var headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers.Authorization = 'Bearer ' + token;
    } else {
      body.contact_email = emailInput.value;
    }
    status.textContent = 'Sending…';
    try {
      var res = await fetch(
        PLA_QUESTIONS_API + '/api/courses/' + slug + '/questions',
        { method: 'POST', headers: headers, body: JSON.stringify(body) });
      var data = {};
      try { data = await res.json(); } catch (e) {}
      if (res.ok) {
        status.textContent = (data.message || 'Question recorded.') +
          ' The instructor\u2019s answer will come by email once they ' +
          'respond — we don\u2019t promise an answer time.';
        form.reset();
      } else {
        status.textContent = data.error ||
          'The student system did not accept that question.';
      }
    } catch (e) {
      status.textContent =
        'The student system could not be reached — please try again later.';
    }
  });
});
