/* Planet Leads Academy — course reviews (parity item A8, site half).
 *
 * Renders into <div data-reviews="<slug>"> on each course page, backed
 * by the student backend:
 *   GET  /api/courses/<slug>/reviews        (public: real reviews only)
 *   GET  /api/courses/<slug>/reviews/mine   (Bearer)
 *   POST /api/courses/<slug>/reviews        (Bearer) {rating, text}
 *   POST /api/courses/<slug>/reviews/edit   (Bearer) {rating, text}
 *   POST /api/courses/<slug>/reviews/delete (Bearer)
 *
 * The honesty rules are the backend's, surfaced plainly here: a review
 * can be written only by a signed-in student with a VERIFIED enrollment
 * in the course — the server rejects everyone else and this page shows
 * its reason word for word. A course with no reviews shows the honest
 * empty state; no rating is ever displayed without real reviews behind
 * it. Review text is inserted as text, never as HTML.
 *
 * Created with Planet Leads 🚀
 */
'use strict';

var PLA_REVIEWS_API = 'https://planet-leads-academy-backend.onrender.com';

function plaReviewsToken() {
  try { return localStorage.getItem('pla_server_token'); } catch (e) { return null; }
}

function plaReviewsEl(tag, className, text) {
  var el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

async function plaReviewsFetch(path, options) {
  var res = await fetch(PLA_REVIEWS_API + path, options || {});
  var data = {};
  try { data = await res.json(); } catch (e) {}
  return { ok: res.ok, status: res.status, data: data };
}

function plaReviewsAuthHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + plaReviewsToken()
  };
}

function plaReviewsRenderList(mount, data) {
  mount.innerHTML = '';
  if (!data || typeof data.count !== 'number') {
    mount.appendChild(plaReviewsEl('p', null,
      'Reviews could not be loaded from the student system right now.'));
    return;
  }
  if (data.count === 0) {
    mount.appendChild(plaReviewsEl('p', 'reviews-summary',
      'No reviews yet — reviews come only from enrolled students.'));
    mount.appendChild(plaReviewsEl('p', 'qa-note',
      'When a student with a verified enrollment in this course writes ' +
      'a review, it will appear here with the course\u2019s real average.'));
    return;
  }
  var avg = typeof data.average === 'number'
    ? String(Math.round(data.average * 100) / 100) : '—';
  mount.appendChild(plaReviewsEl('p', 'reviews-summary',
    'Average rating: ' + avg + ' out of 5, from ' + data.count +
    ' verified student review' + (data.count === 1 ? '' : 's') + '.'));
  (data.reviews || []).forEach(function (review) {
    var box = plaReviewsEl('div', 'review');
    var when = '';
    if (review.created_at) {
      var d = new Date(review.created_at);
      if (!isNaN(d)) when = ' · ' + d.toLocaleDateString();
    }
    box.appendChild(plaReviewsEl('p', 'review-meta',
      'Rated ' + review.rating + ' out of 5 — ' +
      (review.student_name || 'Enrolled student') + when));
    if (review.text) box.appendChild(plaReviewsEl('p', null, review.text));
    mount.appendChild(box);
  });
}

function plaReviewsBuildForm(mount, slug, existing) {
  var wrap = plaReviewsEl('div', 'qa-form');
  var heading = plaReviewsEl('p', null, existing
    ? 'Your review of this course:'
    : 'Write a review of this course:');
  wrap.appendChild(heading);

  var form = document.createElement('form');
  var ratingLabel = plaReviewsEl('label', null, 'Your rating ');
  var select = document.createElement('select');
  select.setAttribute('aria-label', 'Your rating, 1 to 5');
  for (var i = 1; i <= 5; i++) {
    var opt = document.createElement('option');
    opt.value = String(i);
    opt.textContent = i + ' out of 5';
    select.appendChild(opt);
  }
  if (existing) select.value = String(existing.rating);
  ratingLabel.appendChild(select);
  form.appendChild(ratingLabel);

  var textLabel = plaReviewsEl('label', null, 'Your review ');
  var textarea = document.createElement('textarea');
  textarea.maxLength = 2000;
  textarea.setAttribute('aria-label', 'Your review text');
  if (existing) textarea.value = existing.text || '';
  textLabel.appendChild(textarea);
  form.appendChild(textLabel);

  var submit = plaReviewsEl('button', null, existing ? 'Save changes' : 'Post review');
  submit.type = 'submit';
  form.appendChild(submit);
  if (existing) {
    var del = plaReviewsEl('button', null, 'Delete my review');
    del.type = 'button';
    del.addEventListener('click', async function () {
      var r = await plaReviewsFetch('/api/courses/' + slug + '/reviews/delete', {
        method: 'POST', headers: plaReviewsAuthHeaders(), body: '{}'
      });
      status.textContent = r.ok
        ? 'Your review was deleted.'
        : (r.data.error || 'The student system did not accept that.');
      if (r.ok) plaReviewsInit(mount, slug);
    });
    form.appendChild(document.createTextNode(' '));
    form.appendChild(del);
  }
  var status = plaReviewsEl('p', 'qa-status');
  status.setAttribute('role', 'status');
  form.appendChild(status);

  form.addEventListener('submit', async function (ev) {
    ev.preventDefault();
    var path = '/api/courses/' + slug + '/reviews' + (existing ? '/edit' : '');
    var r = await plaReviewsFetch(path, {
      method: 'POST',
      headers: plaReviewsAuthHeaders(),
      body: JSON.stringify({
        rating: parseInt(select.value, 10),
        text: textarea.value
      })
    });
    if (r.ok) {
      status.textContent = r.data.message || 'Review saved.';
      plaReviewsInit(mount, slug);
    } else {
      /* The backend's reason, word for word — e.g. reviews being open
       * only to verified enrollments, or one review per student. */
      status.textContent = r.data.error ||
        'The student system did not accept that review.';
    }
  });

  wrap.appendChild(form);
  return wrap;
}

async function plaReviewsInit(mount, slug) {
  var listBox = mount.querySelector('[data-reviews-list]') || mount;
  try {
    var r = await plaReviewsFetch('/api/courses/' + slug + '/reviews');
    plaReviewsRenderList(listBox, r.ok ? r.data : null);
  } catch (e) {
    plaReviewsRenderList(listBox, null);
  }

  var formBox = mount.querySelector('[data-review-form]');
  if (!formBox) return;
  formBox.innerHTML = '';
  if (!plaReviewsToken()) {
    var note = plaReviewsEl('p', 'qa-note');
    note.appendChild(document.createTextNode(
      'Enrolled in this course? '));
    var link = plaReviewsEl('a', null, 'Sign in');
    link.href = '../login.html';
    note.appendChild(link);
    note.appendChild(document.createTextNode(
      ' to write a review — reviews are open only to students with a ' +
      'verified enrollment in the course.'));
    formBox.appendChild(note);
    return;
  }
  try {
    var mine = await plaReviewsFetch('/api/courses/' + slug + '/reviews/mine', {
      headers: { Authorization: 'Bearer ' + plaReviewsToken() }
    });
    if (mine.ok) {
      formBox.appendChild(
        plaReviewsBuildForm(mount, slug, mine.data.review || null));
    } else {
      formBox.appendChild(plaReviewsEl('p', 'qa-note',
        mine.data.error || 'Sign in again to write a review.'));
    }
  } catch (e) {
    formBox.appendChild(plaReviewsEl('p', 'qa-note',
      'The student system could not be reached to load the review form.'));
  }
}

document.querySelectorAll('[data-reviews]').forEach(function (mount) {
  var slug = mount.getAttribute('data-reviews');
  mount.innerHTML = '';
  var listBox = plaReviewsEl('div');
  listBox.setAttribute('data-reviews-list', '');
  var formBox = plaReviewsEl('div');
  formBox.setAttribute('data-review-form', '');
  mount.appendChild(listBox);
  mount.appendChild(formBox);
  plaReviewsInit(mount, slug);
});
