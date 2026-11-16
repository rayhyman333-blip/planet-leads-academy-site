/* Cynthia verified-answer lookup v2 — JS port of verified-lookup-v2/router.py.
   NOT a neural model. NOT taught. NOT live AI.
   Deterministic lookup only: question -> BM25 + Dice overlap against the
   33 verified facts in verified-store.json -> either the canonical answer
   returned VERBATIM (labelled "verified answer"), a clarification question,
   or an abstention. It never generates, paraphrases, or invents an answer.
   Thresholds frozen on training questions only, never on held-out:
   MIN_SCORE 5.5, MIN_MARGIN 0.10, OVERLAP_WEIGHT 5.0.
   Held-out v2 results (Python router, 99 paraphrases): 78 exact, 79
   fact-match, 11 abstentions, 4 clarifications, 6 wrong routings, 0 inventions.
   This JS port must score identically to the Python router; test it with
   test-verified-lookup.js before any deploy. */
(function () {
  'use strict';

  var MIN_SCORE = 5.5;
  var MIN_MARGIN = 0.10;
  var OVERLAP_WEIGHT = 5.0;

  var STOPWORDS = {};
  ('a an the is are was were do does did what who how when where why which ' +
   'can could would should will shall for to of on in at by with from and or ' +
   'it its her his my your i me she he be been am as if so than then this that ' +
   'there here have has had').split(' ').forEach(function (w) { STOPWORDS[w] = true; });

  var ABSTENTION_TEXT = "I don't have a verified answer for that one yet, so I won't guess. " +
    'Could you say it a different way, or ask about Cynthia, Planet Leads ' +
    'Academy courses, bundles, refunds, or how Cynthia works for a business?';

  var CLARIFICATION_TEXT = "That could mean a few different Academy topics, and I won't guess " +
    'which one you meant. Did you want the full school summary, courses ' +
    'and lessons, bundles, or the instructor? Tell me which one, and ' +
    "I'll give you the verified answer for that topic.";

  function stem(word) {
    if (word.length > 4 && word.slice(-3) === 'ies') return word.slice(0, -3) + 'y';
    if (word.length > 4 && (word.slice(-4) === 'ches' || word.slice(-4) === 'shes' ||
        word.slice(-4) === 'sses' || word.slice(-3) === 'xes' || word.slice(-3) === 'zes')) {
      return word.slice(0, -2);
    }
    if (word.length > 3 && word.slice(-1) === 's' && word.slice(-2) !== 'ss') return word.slice(0, -1);
    return word;
  }

  function tokenize(text) {
    var raw = String(text || '').toLowerCase().match(/[a-z0-9]+/g) || [];
    var out = [];
    raw.forEach(function (t) {
      var s = stem(t);
      if (s && !STOPWORDS[s]) out.push(s);
    });
    return out;
  }

  function Router(entries) {
    this.entries = entries;
    this.docs = [];
    var self = this;
    entries.forEach(function (e) {
      var q = tokenize(e.question);
      var kw = (e.keywords || []).map(stem);
      var a = tokenize(e.canonical_answer);
      self.docs.push(q.concat(q, q).concat(kw, kw).concat(a));
    });
    this.routingTokens = entries.map(function (e) {
      var s = {};
      tokenize(e.question).forEach(function (t) { s[t] = true; });
      return s;
    });
    var n = this.docs.length;
    var df = {};
    this.docs.forEach(function (doc) {
      var seen = {};
      doc.forEach(function (term) {
        if (!seen[term]) { seen[term] = true; df[term] = (df[term] || 0) + 1; }
      });
    });
    this.idf = {};
    Object.keys(df).forEach(function (term) {
      this.idf[term] = Math.max(0, Math.log((n - df[term] + 0.5) / (df[term] + 0.5) + 1.0));
    }, this);
    var total = 0;
    this.docs.forEach(function (d) { total += d.length; });
    this.avgLen = total / Math.max(1, n);
    this.k1 = 1.2;
    this.b = 0.75;
  }

  Router.prototype.scores = function (question) {
    var qterms = tokenize(question);
    var qset = {};
    qterms.forEach(function (t) { qset[t] = true; });
    var self = this;
    var out = this.entries.map(function (entry, idx) {
      var doc = self.docs[idx];
      if (!qterms.length) return { score: 0, entry: entry };
      var counts = {};
      doc.forEach(function (t) { counts[t] = (counts[t] || 0) + 1; });
      var bm25 = 0;
      var dl = doc.length;
      Object.keys(qset).forEach(function (term) {
        if (!(term in self.idf)) return;
        var tf = counts[term] || 0;
        if (!tf) return;
        var denom = tf + self.k1 * (1 - self.b + self.b * dl / self.avgLen);
        bm25 += self.idf[term] * (tf * (self.k1 + 1) / denom);
      });
      var qTokens = self.routingTokens[idx];
      var inter = 0;
      Object.keys(qset).forEach(function (t) { if (qTokens[t]) inter++; });
      var qLen = Object.keys(qset).length;
      var rLen = Object.keys(qTokens).length;
      var overlap = (qLen && rLen) ? (2 * inter / (qLen + rLen)) : 0;
      return { score: bm25 + OVERLAP_WEIGHT * overlap, entry: entry };
    });
    out.sort(function (a, b) { return b.score - a.score; });
    return out;
  };

  Router.prototype.answer = function (question) {
    var ranked = this.scores(question);
    if (!ranked.length) {
      return { source: 'unknown', answer: null, top_id: null, top_score: 0, second_score: 0, margin: 0 };
    }
    var topScore = ranked[0].score;
    var topEntry = ranked[0].entry;
    var secondScore = 0;
    var secondEntry = null;
    for (var i = 1; i < ranked.length; i++) {
      if (ranked[i].entry.canonical_answer !== topEntry.canonical_answer) {
        secondScore = ranked[i].score;
        secondEntry = ranked[i].entry;
        break;
      }
    }
    var margin = topScore > 0 ? (topScore - secondScore) / topScore : 0;
    var ACADEMY_IDS = { 'fact-14': true, 'fact-15': true, 'fact-20': true, 'fact-21': true, 'fact-25': true, 'fact-33': true };
    if (topScore >= MIN_SCORE && margin < MIN_MARGIN && secondEntry &&
        ACADEMY_IDS[topEntry.id] && ACADEMY_IDS[secondEntry.id]) {
      return { source: 'clarification', answer: null, top_id: topEntry.id,
        top_score: Math.round(topScore * 1000) / 1000,
        second_score: Math.round(secondScore * 1000) / 1000,
        margin: Math.round(margin * 1000) / 1000 };
    }
    if (topScore >= MIN_SCORE && margin >= MIN_MARGIN) {
      return { source: 'verified_lookup', answer: topEntry.canonical_answer, top_id: topEntry.id,
        top_score: Math.round(topScore * 1000) / 1000,
        second_score: Math.round(secondScore * 1000) / 1000,
        margin: Math.round(margin * 1000) / 1000 };
    }
    return { source: 'unknown', answer: null, top_id: topEntry.id,
      top_score: Math.round(topScore * 1000) / 1000,
      second_score: Math.round(secondScore * 1000) / 1000,
      margin: Math.round(margin * 1000) / 1000 };
  };

  var api = {
    Router: Router,
    MIN_SCORE: MIN_SCORE,
    MIN_MARGIN: MIN_MARGIN,
    ABSTENTION_TEXT: ABSTENTION_TEXT,
    CLARIFICATION_TEXT: CLARIFICATION_TEXT,
    tokenize: tokenize
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') window.CynthiaLookup = api;
})();
