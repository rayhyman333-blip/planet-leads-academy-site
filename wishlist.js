/* Planet Leads Academy — wishlist (favorites), browser-only.
   Saved course slugs live in this browser's localStorage under
   'pla_wishlist'. Nothing is sent anywhere and no account is needed;
   the list does not follow you to another browser or device.
   Used by: catalog.html (a save button on every course entry + a
   "Wishlist only" filter), courses/*.html (a save button on each
   course page), my-courses.html (the saved list with prices and
   course / Gumroad links, read from knowledge.json). */
(function () {
  'use strict';
  var KEY = 'pla_wishlist';

  function load() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(v) ? v : [];
    } catch (e) { return []; }
  }
  function save(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { /* storage optional */ }
  }
  function has(slug) { return load().indexOf(slug) !== -1; }
  function toggle(slug) {
    var list = load();
    var i = list.indexOf(slug);
    if (i === -1) list.push(slug); else list.splice(i, 1);
    save(list);
    renderButtons();
    renderList();
    return list.indexOf(slug) !== -1;
  }

  function makeButton(slug, name) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'wishlist-btn';
    b.setAttribute('data-wishlist-btn', slug);
    b.setAttribute('aria-label', 'Save ' + name + ' to your wishlist');
    b.addEventListener('click', function () { toggle(slug); });
    return b;
  }
  function paint(btn, slug, name) {
    var on = has(slug);
    btn.textContent = on ? '♥ Saved to wishlist' : '♡ Save to wishlist';
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.setAttribute('aria-label', (on ? 'Remove ' : 'Save ') + name + (on ? ' from' : ' to') + ' your wishlist');
  }
  function renderButtons() {
    document.querySelectorAll('[data-wishlist-btn]').forEach(function (btn) {
      paint(btn, btn.getAttribute('data-wishlist-btn'), btn.getAttribute('data-course-name') || 'this course');
    });
  }

  function enhanceCatalog() {
    document.querySelectorAll('.course').forEach(function (div) {
      var link = div.querySelector('a[href^="courses/"]');
      if (!link) return;
      var slug = link.getAttribute('href').replace('courses/', '').replace('.html', '');
      var strong = div.querySelector('strong');
      var name = strong ? strong.textContent : slug;
      var btn = makeButton(slug, name);
      btn.setAttribute('data-course-name', name);
      div.appendChild(document.createElement('br'));
      div.appendChild(btn);
    });
    // "Wishlist only" filter, placed beside the catalog's own filters.
    var sel = document.getElementById('catFilter');
    if (sel && !document.getElementById('wishlistOnly')) {
      var label = document.createElement('label');
      label.className = 'wishlist-only';
      var cb = document.createElement('input');
      cb.type = 'checkbox'; cb.id = 'wishlistOnly';
      label.appendChild(cb);
      label.appendChild(document.createTextNode(' Wishlist only'));
      sel.parentNode.insertBefore(label, sel.nextSibling);
      cb.addEventListener('change', function () {
        var list = load();
        document.querySelectorAll('.course').forEach(function (div) {
          var link = div.querySelector('a[href^="courses/"]');
          if (!link) return;
          var slug = link.getAttribute('href').replace('courses/', '').replace('.html', '');
          if (cb.checked && list.indexOf(slug) === -1) div.style.display = 'none';
          else if (cb.checked) div.style.display = '';
        });
        if (!cb.checked) {
          var s = document.getElementById('courseSearch');
          if (s) s.dispatchEvent(new Event('input'));
        }
      });
    }
  }

  function enhanceCoursePage() {
    var m = location.pathname.match(/courses\/([a-z0-9-]+)\.html/);
    if (!m) return;
    var slug = m[1];
    var h2 = document.querySelector('section h2');
    var name = h2 ? h2.textContent : slug;
    var btn = makeButton(slug, name);
    btn.setAttribute('data-course-name', name);
    var gum = document.querySelector('a.gumroad-button');
    if (gum && gum.parentNode && gum.parentNode.parentNode) {
      var p = document.createElement('p');
      p.appendChild(btn);
      gum.parentNode.parentNode.insertBefore(p, gum.parentNode.nextSibling);
    }
  }

  function renderList() {
    var box = document.querySelector('[data-wishlist-list]');
    if (!box) return;
    var list = load();
    if (!list.length) {
      box.innerHTML = '<p>No saved courses yet. Tap “♡ Save to wishlist” on any course in the <a href="catalog.html">Catalog</a> and it will appear here.</p>';
      return;
    }
    fetch('knowledge.json').then(function (r) { return r.json(); }).then(function (kb) {
      var bySlug = {};
      (kb.courses || []).forEach(function (c) { bySlug[c.slug] = c; });
      var html = '<ul class="wishlist-list">';
      list.forEach(function (slug) {
        var c = bySlug[slug];
        if (!c) return;
        html += '<li><a href="courses/' + c.slug + '.html">' + c.name + '</a> — ' + c.category + ' — ' + c.price +
          ' <a class="gumroad-button" href="https://rayhymn.gumroad.com/l/' + c.gumroad + '">Open on Gumroad</a>' +
          ' <button type="button" class="wishlist-btn" data-wishlist-btn="' + c.slug + '" data-course-name="' + c.name + '"></button></li>';
      });
      html += '</ul>';
      box.innerHTML = html;
      renderButtons();
    }).catch(function () {
      box.innerHTML = '<p>Your saved course slugs: ' + list.join(', ') + ' — open the <a href="catalog.html">Catalog</a> to view them.</p>';
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    enhanceCatalog();
    enhanceCoursePage();
    renderList();
    renderButtons();
  });
  if (typeof window !== 'undefined') window.plaWishlist = { load: load, toggle: toggle, has: has };
})();
