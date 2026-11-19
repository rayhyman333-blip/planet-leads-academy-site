/* Planet Leads Academy — announcements renderer.
   Reads announcements.json (the one data file the Academy edits to
   publish) and fills:
     - [data-announcements-list]  (announcements.html: every announcement)
     - [data-course-announcements="SLUG"]  (course pages: that course's
       announcements plus school-wide ones, marked as such)
   Static and read-only: nothing is sent anywhere, and there is no
   email or push delivery behind this page — announcements live on the
   site only. If the data file cannot be loaded, the page's own
   fallback text stays in place. */
(function () {
  'use strict';

  function basePath() {
    var s = document.currentScript;
    if (s && s.src) return s.src.replace(/announcements\.js.*$/, '');
    return '';
  }

  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function render(items, courseSlug) {
    return items.map(function (a) {
      var scope = a.course ? 'Course announcement' : 'School-wide announcement';
      return '<article class="announcement"><h3>' + esc(a.title) + '</h3>' +
        '<p class="ann-meta">' + esc(a.date) + ' · ' + scope + '</p>' +
        '<p>' + esc(a.body) + '</p></article>';
    }).join('');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var listBox = document.querySelector('[data-announcements-list]');
    var courseBox = document.querySelector('[data-course-announcements]');
    if (!listBox && !courseBox) return;
    fetch(basePath() + 'announcements.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var all = (data && data.announcements) || [];
        if (listBox) {
          listBox.innerHTML = all.length
            ? render(all, null)
            : '<p>No announcements yet.</p>';
        }
        if (courseBox) {
          var slug = courseBox.getAttribute('data-course-announcements');
          var mine = all.filter(function (a) { return !a.course || a.course === slug; });
          if (mine.length) courseBox.innerHTML = render(mine, slug);
        }
      })
      .catch(function () { /* fallback text in the page stays */ });
  });
})();
