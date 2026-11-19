/* Planet Leads Academy — on-site course tutor (parity item A4).
 *
 * The same extractive tutor that runs on the Cynthia MCP server
 * (ask_tutor), ported line-for-line from tutor.py in the
 * cynthia-tutor-build: a question is matched against the shipped corpus
 * (tutor-corpus.json — the 35 courses / 280 lessons of the Academy
 * content shell, rebuilt by tools/build_tutor_corpus.py) and answered
 * with a VERBATIM excerpt from one lesson, cited as
 * (Course name — Lesson N: Lesson title).
 *
 * The truth rule holds by construction: no generation, no paraphrase,
 * no outside knowledge. Every excerpt is an exact substring of the
 * lesson text in the corpus. When no lesson clears the confidence gate,
 * the tutor gives the honest no-answer instead of guessing.
 *
 * Everything runs client-side on this static page — no server calls
 * beyond fetching the corpus file itself.
 *
 * Created with Planet Leads 🚀
 */
'use strict';

var PLA_TUTOR_NO_ANSWER =
  "I don't have verified material on that yet. I can only answer from the " +
  'Planet Leads Academy course lessons I have verified text for - try ' +
  'asking about a topic covered in one of the courses.';

var PLA_TUTOR_MAX_EXCERPT_WORDS = 300;
var PLA_TUTOR_MIN_LESSON_SCORE = 14.0;
var PLA_TUTOR_MIN_MARGIN_RATIO = 1.15;
var PLA_TUTOR_MIN_DISTINCT_TOKENS = 2;

var PLA_TUTOR_STOPWORDS = new Set((
  'a an the is are was were be been being do does did what whats how why ' +
  'when where which who whom can could should would will i me my you your ' +
  'we our it its in on of to for with and or but if then than so as at by ' +
  'from about into doesnt dont isnt arent tell explain please give show ' +
  'learn want need get got make made use using used way ways best much ' +
  'many there their this that these those am im ive id'
).split(' '));

function plaTutorStem(word) {
  if (word.length > 4 && word.endsWith('ies')) return word.slice(0, -3) + 'y';
  if (word.length > 5 && word.endsWith('ing')) return word.slice(0, -3);
  if (word.length > 4 && word.endsWith('ed')) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith('es')) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith('s')) return word.slice(0, -1);
  return word;
}

function plaTutorTokenize(text) {
  var folded = (text || '').toLowerCase().normalize('NFKD')
    .replace(/[^\x00-\x7F]/g, '');
  var raw = folded.match(/[a-z0-9]+/g) || [];
  var tokens = [];
  for (var i = 0; i < raw.length; i++) {
    if (PLA_TUTOR_STOPWORDS.has(raw[i]) || raw[i].length < 2) continue;
    tokens.push(plaTutorStem(raw[i]));
  }
  return tokens;
}

function plaTutorCounter(tokens) {
  var counter = new Map();
  tokens.forEach(function (t) { counter.set(t, (counter.get(t) || 0) + 1); });
  return counter;
}

function plaTutorParagraphs(text) {
  var parts = text.split('\n\n').filter(function (p) { return p.trim(); });
  if (parts.length <= 1) {
    parts = text.split('\n').filter(function (p) { return p.trim(); });
  }
  return parts;
}

function plaTutorWordCount(text) {
  return text.split(/\s+/).filter(Boolean).length;
}

var PLA_TUTOR_SENTENCE_RE = /[^.!?]+[.!?]+["')\]]*\s*|[^.!?]+$/g;

function plaTutorBestExcerpt(text, qTokens) {
  var qSet = new Set(qTokens);
  var bestPara = null, bestScore = -1.0;
  plaTutorParagraphs(text).forEach(function (para) {
    var pTokens = plaTutorTokenize(para);
    if (!pTokens.length) return;
    var hits = pTokens.filter(function (t) { return qSet.has(t); }).length;
    var score = hits / Math.sqrt(pTokens.length);
    if (score > bestScore) { bestPara = para; bestScore = score; }
  });
  if (bestPara === null) bestPara = text;
  if (plaTutorWordCount(bestPara) <= PLA_TUTOR_MAX_EXCERPT_WORDS) {
    return bestPara.trim();
  }
  var sentences = [];
  var m;
  PLA_TUTOR_SENTENCE_RE.lastIndex = 0;
  while ((m = PLA_TUTOR_SENTENCE_RE.exec(bestPara)) !== null) {
    sentences.push([m.index, m.index + m[0].length]);
    if (m[0].length === 0) PLA_TUTOR_SENTENCE_RE.lastIndex++;
  }
  if (!sentences.length) return bestPara.slice(0, 2000).trim();
  var sentScores = sentences.map(function (span) {
    var sTokens = plaTutorTokenize(bestPara.slice(span[0], span[1]));
    return sTokens.filter(function (t) { return qSet.has(t); }).length;
  });
  var peak = 0;
  sentScores.forEach(function (s, i) { if (s > sentScores[peak]) peak = i; });
  var lo = peak, hi = peak;
  var words = plaTutorWordCount(bestPara.slice(sentences[lo][0], sentences[hi][1]));
  while (true) {
    var grew = false;
    if (lo > 0) {
      var candLo = plaTutorWordCount(bestPara.slice(sentences[lo - 1][0], sentences[hi][1]));
      if (candLo <= PLA_TUTOR_MAX_EXCERPT_WORDS) { lo--; words = candLo; grew = true; }
    }
    if (hi < sentences.length - 1) {
      var candHi = plaTutorWordCount(bestPara.slice(sentences[lo][0], sentences[hi + 1][1]));
      if (candHi <= PLA_TUTOR_MAX_EXCERPT_WORDS) { hi++; words = candHi; grew = true; }
    }
    if (!grew) break;
  }
  return bestPara.slice(sentences[lo][0], sentences[hi][1]).trim();
}

function plaTutorBuildIndex(corpus) {
  var courseTokens = [];
  var lessons = [];
  corpus.courses.forEach(function (course, ci) {
    var titleTokens = plaTutorTokenize(course.title);
    var metaText = [
      course.title, course.tagline, course.category, course.syllabus_summary,
      course.syllabus.map(function (s) { return s.heading; }).join(' ')
    ].join(' ');
    var counter = plaTutorCounter(plaTutorTokenize(metaText));
    titleTokens.forEach(function (tok) { counter.set(tok, (counter.get(tok) || 0) + 4); });
    courseTokens.push(counter);
    course.lessons.forEach(function (lesson) {
      lessons.push({
        courseIndex: ci,
        course: course.title,
        siteSlug: course.site_slug,
        number: lesson.number,
        title: lesson.title,
        text: lesson.text,
        titleCounter: plaTutorCounter(plaTutorTokenize(lesson.title)),
        bodyCounter: plaTutorCounter(plaTutorTokenize(lesson.text))
      });
    });
  });
  return { courseTokens: courseTokens, lessons: lessons };
}

function plaTutorNoAnswer() {
  return {
    answered: false, course: null, lesson: null, lesson_title: null,
    excerpt: null, citation: null, message: PLA_TUTOR_NO_ANSWER
  };
}

function plaTutorAnswer(index, question) {
  var qTokens = plaTutorTokenize(question || '');
  if (!qTokens.length) return plaTutorNoAnswer();
  var qCounter = plaTutorCounter(qTokens);
  var qSet = new Set(qTokens);

  var courseScores = index.courseTokens.map(function (counter) {
    var score = 0;
    qSet.forEach(function (t) {
      score += Math.min(qCounter.get(t), 2) * Math.min(counter.get(t) || 0, 6) * 0.5;
    });
    return score;
  });

  var scored = index.lessons.map(function (lesson) {
    var titleHits = 0, bodyHits = 0;
    qSet.forEach(function (t) {
      if (lesson.titleCounter.get(t)) titleHits += Math.min(qCounter.get(t), 2) * 6;
      bodyHits += Math.min(lesson.bodyCounter.get(t) || 0, 8) * 0.5;
    });
    var bonus = 0.0;
    plaTutorParagraphs(lesson.text).forEach(function (para) {
      var pSet = new Set(plaTutorTokenize(para));
      var together = 0;
      qSet.forEach(function (t) { if (pSet.has(t)) together++; });
      if (together >= 3) bonus = Math.max(bonus, (together - 2) * 2.0);
    });
    var courseBoost = courseScores[lesson.courseIndex] * 0.6;
    return { score: titleHits + bodyHits + bonus + courseBoost, lesson: lesson };
  });
  scored.sort(function (a, b) { return b.score - a.score; });
  var best = scored[0].lesson, bestScore = scored[0].score;
  var runnerUp = scored.length > 1 ? scored[1].score : 0.0;

  if (bestScore < PLA_TUTOR_MIN_LESSON_SCORE) return plaTutorNoAnswer();
  if (runnerUp > 0 && bestScore < runnerUp * PLA_TUTOR_MIN_MARGIN_RATIO) {
    return plaTutorNoAnswer();
  }
  var distinct = 0;
  qSet.forEach(function (t) {
    if (best.titleCounter.get(t) || best.bodyCounter.get(t)) distinct++;
  });
  if (qSet.size >= PLA_TUTOR_MIN_DISTINCT_TOKENS &&
      distinct < PLA_TUTOR_MIN_DISTINCT_TOKENS) {
    return plaTutorNoAnswer();
  }

  var excerpt = plaTutorBestExcerpt(best.text, qTokens);
  var displayTitle = best.title.replace(/^Lesson\s+\d+:\s*/, '');
  return {
    answered: true,
    course: best.course,
    site_slug: best.siteSlug,
    lesson: best.number,
    lesson_title: best.title,
    excerpt: excerpt,
    citation: '(' + best.course + ' — Lesson ' + best.number + ': ' + displayTitle + ')',
    score: Math.round(bestScore * 100) / 100
  };
}

/* ---- page wiring (tutor.html) ---- */
var plaTutorIndexPromise = null;
function plaTutorLoadIndex() {
  if (!plaTutorIndexPromise) {
    plaTutorIndexPromise = fetch('tutor-corpus.json')
      .then(function (res) {
        if (!res.ok) throw new Error('corpus fetch failed');
        return res.json();
      })
      .then(function (corpus) { return plaTutorBuildIndex(corpus); });
  }
  return plaTutorIndexPromise;
}

function plaTutorInitPage() {
  var form = document.querySelector('[data-tutor-form]');
  if (!form) return;
  var input = form.querySelector('[data-tutor-input]');
  var status = document.querySelector('[data-tutor-status]');
  var out = document.querySelector('[data-tutor-output]');

  var params = new URLSearchParams(window.location.search);
  var courseHint = params.get('course');
  if (courseHint) {
    var hint = document.querySelector('[data-tutor-hint]');
    if (hint) {
      hint.hidden = false;
      hint.textContent = 'You came from a course page — ask about that ' +
        'course\u2019s lessons, or any topic in the 35 courses.';
    }
  }

  async function ask(question) {
    var q = (question || '').trim();
    if (!q) return;
    status.textContent = 'Searching the course lessons…';
    out.innerHTML = '';
    try {
      var index = await plaTutorLoadIndex();
      var result = plaTutorAnswer(index, q);
      status.textContent = '';
      if (!result.answered) {
        out.innerHTML = '<div class="tutor-answer"><p></p></div>';
        out.querySelector('p').textContent = result.message;
        return;
      }
      var wrap = document.createElement('div');
      wrap.className = 'tutor-answer';
      var quote = document.createElement('blockquote');
      quote.textContent = result.excerpt;
      var cite = document.createElement('p');
      cite.className = 'tutor-citation';
      cite.textContent = result.citation + ' ';
      var link = document.createElement('a');
      link.href = 'lessons/' + result.site_slug + '/lesson-' + result.lesson + '.html';
      link.textContent = 'Read the full lesson →';
      cite.appendChild(link);
      wrap.appendChild(quote);
      wrap.appendChild(cite);
      out.appendChild(wrap);
    } catch (e) {
      status.textContent = 'The tutor could not load the course library. ' +
        'Check your connection and try again.';
    }
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    ask(input.value);
  });
  document.querySelectorAll('[data-tutor-suggest]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      input.value = btn.getAttribute('data-tutor-suggest');
      ask(input.value);
    });
  });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', plaTutorInitPage);
  } else {
    plaTutorInitPage();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    tokenize: plaTutorTokenize,
    buildIndex: plaTutorBuildIndex,
    answer: plaTutorAnswer,
    NO_ANSWER: PLA_TUTOR_NO_ANSWER
  };
}
