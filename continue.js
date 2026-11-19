/* Planet Leads Academy — "Continue learning" for My Courses (parity A2).
 *
 * Renders resume links into <div id="continueList"> on my-courses.html:
 * for every course the student has started, a link to the first
 * incomplete lesson page. Sources, merged in this order:
 *   1. the course player store (localStorage "pla_player_v1", slug-keyed)
 *   2. the My Courses browser store (localStorage "pla_student_v2",
 *      display-name-keyed — the names are the ones that page offers)
 *   3. the student backend's GET /api/progress, when a sign-in token
 *      exists (server progress is the record for enrolled courses)
 * Read-only: this file never writes progress anywhere.
 *
 * Created with Planet Leads 🚀
 */
'use strict';

var PLA_CONTINUE_API = 'https://planet-leads-academy-backend.onrender.com';

var PLA_SLUG_NAMES = {
  'arabic': 'Arabic',
  'bible-scholar-ai': 'Bible Scholar AI',
  'conversational-dutch': 'Conversational Dutch',
  'conversational-hindi': 'Conversational Hindi',
  'data-analytics': 'Data Analytics',
  'data-science-foundations': 'Data Science Foundations',
  'digital-marketing': 'Digital Marketing',
  'drums-foundations': 'Drums Foundations',
  'entrepreneurship': 'Entrepreneurship',
  'french': 'French',
  'german': 'German',
  'guitar': 'Guitar',
  'hebrew-scholar-ai': 'Hebrew Scholar AI',
  'hindi': 'Conversational Hindi',
  'islamic-scholar-ai': 'Islamic Scholar AI',
  'italian': 'Italian',
  'japanese': 'Japanese',
  'java-programming': 'Java Programming',
  'javascript': 'JavaScript',
  'korean': 'Korean',
  'leadership-mastery': 'Leadership Mastery',
  'mandarin': 'Mandarin',
  'marketing-foundations': 'Marketing Foundations',
  'mobile-development': 'Mobile Development',
  'music-theory': 'Music Theory',
  'piano': 'Piano',
  'portuguese': 'Portuguese',
  'project-management': 'Project Management',
  'public-speaking-mastery': 'Public Speaking Mastery',
  'python': 'Python Programming',
  'quranic-studies-ai': 'Quranic Studies AI',
  'russian': 'Russian',
  'singing-foundations': 'Singing Foundations',
  'spanish': 'Conversational Spanish',
  'torah-scholar-ai': 'Torah Scholar AI',
  'web-development': 'Web Development'
};

/* The display names My Courses itself uses (its pla_student_v2 keys). */
var PLA_NAME_TO_SLUG = {
  'Digital Marketing': 'digital-marketing',
  'Project Management': 'project-management',
  'Data Analytics': 'data-analytics',
  'Leadership Mastery': 'leadership-mastery',
  'Entrepreneurship': 'entrepreneurship',
  'Mobile Development': 'mobile-development',
  'Web Development': 'web-development',
  'JavaScript': 'javascript',
  'Python': 'python',
  'Music Theory': 'music-theory',
  'Guitar': 'guitar',
  'Piano': 'piano',
  'Russian': 'russian',
  'Arabic': 'arabic',
  'Italian': 'italian',
  'German': 'german',
  'Portuguese': 'portuguese',
  'Korean': 'korean',
  'Japanese': 'japanese',
  'Mandarin': 'mandarin',
  'French': 'french',
  'Spanish': 'spanish',
  'Torah Scholar AI': 'torah-scholar-ai',
  'Bible Scholar AI': 'bible-scholar-ai',
  'Islamic Scholar AI': 'islamic-scholar-ai'
};

function plaContinueRender(progress) {
  var box = document.getElementById('continueList');
  if (!box) return;
  var slugs = Object.keys(progress).sort();
  if (!slugs.length) {
    box.innerHTML = '<p>You have not started any lessons yet. Open a ' +
      'course\u2019s lessons and your place will be kept here.</p>';
    return;
  }
  var html = '<ul class="profile-courses">';
  slugs.forEach(function (slug) {
    var done = progress[slug];
    var count = done.filter(Boolean).length;
    var next = done.indexOf(false) + 1;
    var name = PLA_SLUG_NAMES[slug] || slug;
    if (count >= 8) {
      html += '<li><strong>' + name + '</strong> — all 8 lessons complete. ' +
        '<a href="lessons/' + slug + '.html">Review the lessons →</a></li>';
    } else {
      html += '<li><strong>' + name + '</strong> — ' + count + ' of 8 lessons complete. ' +
        '<a href="lessons/' + slug + '/lesson-' + next + '.html">Continue with Lesson ' +
        next + ' →</a></li>';
    }
  });
  html += '</ul>';
  box.innerHTML = html;
}

async function plaContinueInit() {
  var box = document.getElementById('continueList');
  if (!box) return;
  var progress = {}; // slug -> [bool x8]

  try {
    var player = JSON.parse(localStorage.getItem('pla_player_v1') || '{}') || {};
    Object.keys(player).forEach(function (slug) {
      if (player[slug] && Array.isArray(player[slug].done)) {
        progress[slug] = player[slug].done.slice(0, 8);
      }
    });
  } catch (e) {}

  try {
    var student = JSON.parse(localStorage.getItem('pla_student_v2') || '{}') || {};
    var courses = student.courses || {};
    Object.keys(courses).forEach(function (name) {
      var slug = PLA_NAME_TO_SLUG[name];
      if (slug && Array.isArray(courses[name]) && !progress[slug]) {
        progress[slug] = courses[name].slice(0, 8);
      }
    });
  } catch (e) {}

  plaContinueRender(progress);

  var token = null;
  try { token = localStorage.getItem('pla_server_token'); } catch (e) {}
  if (!token) return;
  try {
    var res = await fetch(PLA_CONTINUE_API + '/api/progress', {
      headers: { Authorization: 'Bearer ' + token }
    });
    if (!res.ok) return;
    var body = await res.json();
    var server = body.progress || {};
    Object.keys(server).forEach(function (slug) {
      var entry = server[slug];
      if (!entry || !entry.lessons) return;
      var arr = [];
      for (var i = 1; i <= 8; i++) arr.push(!!entry.lessons[String(i)]);
      progress[slug] = arr; // server is the record for enrolled courses
    });
    plaContinueRender(progress);
  } catch (e) { /* offline: local stores already rendered */ }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', plaContinueInit);
} else {
  plaContinueInit();
}
