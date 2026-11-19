#!/usr/bin/env python3
"""Regenerate the Academy lessons pages from the content shell (item A2).

For every course this builds:
  lessons/<slug>.html            the player index: lesson list with the
                                 Lesson 1 "Free preview" badge, a Continue
                                 (resume) link, and progress summary —
                                 wired by ../player.js
  lessons/<slug>/lesson-N.html   one page per lesson (N = 1..8) with the
                                 lesson nav, previous/next links, the
                                 lesson text, and a Mark complete button

Source of truth for lesson titles and text: the content shell
(~/workspace/planet-leads-content-shell/course_content_*.py) — the same
text buyers receive in the course ZIP. This regeneration also fixes the
drift Wave 1 found: 16 of the site's lessons pages carried an earlier
edition's lessons in full, and several more had single-lesson diffs.

The gate is NOT in these pages: player.js holds the single PLA_GATE_OPEN
flag (owner decision 2026-11-18 — Lesson 1 free preview, Lessons 2–8
gate behind enrollment when the student system flips live at Phase 8;
until then everything stays readable). Lesson pages carry the gate
notice element player.js reveals when the flag is off.

Page chrome (head/header/footer) is reused from the existing
lessons/<slug>.html so branding, nav, and the accessibility pass carry
over unchanged. Prices and Gumroad links live on the course pages, not
here, and are not touched.

Usage: python3 tools/generate_lessons.py [--shell DIR] [--site DIR]
Created with Planet Leads 🚀
"""
import argparse
import html
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from generate_course_pages import MODULE_TO_SLUG, RENAMED, load_course  # noqa: E402


def esc(text):
    return html.escape(text, quote=False)


def body_paragraphs(body):
    """Shell lesson body -> HTML paragraphs (verbatim text; single
    newlines inside a paragraph become line breaks)."""
    out = []
    for chunk in body.strip().split("\n\n"):
        chunk = chunk.strip()
        if not chunk:
            continue
        out.append("<p>" + esc(chunk).replace("\n", "<br>") + "</p>")
    return "".join(out)


def split_template(existing):
    """(prefix, section_tag, suffix) from an existing lessons page."""
    open_m = re.search(r"<section[^>]*>", existing)
    sec_start = open_m.start()
    sec_end = existing.index("</section>") + len("</section>")
    return existing[:sec_start], open_m.group(0), existing[sec_end:]


def page_chrome(existing, depth, title=None):
    """Chrome for a page `depth` levels below lessons/ (0 = the index)."""
    prefix, section_tag, suffix = split_template(existing)
    if title is not None:
        prefix = re.sub(r"<title>.*?</title>", f"<title>{esc(title)}</title>",
                        prefix, count=1, flags=re.S)
    if depth:
        up = "../" * (depth + 1)
        prefix = prefix.replace('="../', f'="{up}').replace("='../", f"='{up}")
        suffix = suffix.replace('="../', f'="{up}').replace("='../", f"='{up}")
    return prefix, section_tag, suffix


def with_script(suffix, src):
    if src in suffix:
        return suffix
    return suffix.replace("</body>", f'<script src="{src}"></script></body>', 1)


def lesson_list_items(slug, lessons, current=None, prefix=""):
    items = []
    for i, lesson in enumerate(lessons, start=1):
        href = f"{prefix}lesson-{i}.html" if current is not None else f"{slug}/lesson-{i}.html"
        cur = ' aria-current="page"' if current == i else ""
        badge = ' <span class="badge-free">Free preview</span>' if i == 1 else ""
        items.append(
            f'<li><a href="{href}" data-lesson-link="{i}"{cur}>'
            f"{esc(lesson['title'])}</a>{badge} "
            f'<span class="done-mark" data-done-mark="{i}" hidden>✓ Complete</span></li>'
        )
    return "".join(items)


def build_index(slug, course, existing):
    prefix, section_tag, suffix = page_chrome(existing, 0)
    sec = existing[existing.index(section_tag):]
    h2 = re.search(r"<h2>.*?</h2>", sec, re.S).group(0)
    after_h2 = sec[sec.index(h2) + len(h2):]
    intros = re.findall(r"<p>.*?</p>", after_h2, re.S)[:2]
    lessons = course["lessons"]

    out = [section_tag, h2]
    out.extend(intros)
    out.append(f'<div class="player" data-player-course="{slug}">')
    out.append(
        f'<p class="player-continue"><a class="player-continue-link" '
        f'href="{slug}/lesson-1.html" data-continue-link>Start with Lesson 1 →</a></p>'
    )
    out.append('<p data-progress-summary></p>')
    out.append('<ol class="lesson-list">')
    out.append(lesson_list_items(slug, lessons))
    out.append("</ol>")
    out.append(
        '<p class="player-note">Lesson 1 is a free preview. Your place and '
        "your completed lessons are kept in this browser; if you sign in "
        "with a verified enrollment, progress is also recorded on your "
        "student account. While the Academy's student system is being "
        "finished, every lesson is open to read — when the system goes "
        "live, Lessons 2–8 will be for enrolled students.</p>"
    )
    out.append(
        f'<p>Questions about the material? <a href="../tutor.html?course={slug}">'
        "Ask the course tutor</a> — it answers with exact excerpts from "
        "these lessons.</p>"
    )
    out.append(f'<p><a href="../courses/{slug}.html">← Back to the course page</a></p>')
    out.append("</div>")
    out.append("</section>")
    return prefix + "".join(out) + with_script(suffix, "../player.js")


def build_lesson(slug, course, existing, number):
    lessons = course["lessons"]
    lesson = lessons[number - 1]
    display = re.search(r"Full Lessons — ([^<]+)", existing).group(1)
    title = f"{lesson['title']} — {display} — Planet Leads Academy"
    prefix, section_tag, suffix = page_chrome(existing, 1, title=title)

    out = [section_tag]
    out.append(
        f'<p class="crumbs"><a href="../../courses/{slug}.html">{esc(display)} course page</a>'
        f' · <a href="../{slug}.html">All 8 lessons</a></p>'
    )
    out.append(f"<h2>{esc(lesson['title'])}</h2>")
    if number == 1:
        out.append('<p><span class="badge-free">Free preview</span></p>')
    out.append(
        f'<div class="player" data-player-course="{slug}" data-player-lesson="{number}">'
    )
    out.append('<nav class="lesson-nav" aria-label="Lessons in this course"><ol>')
    out.append(lesson_list_items(slug, lessons, current=number))
    out.append("</ol></nav>")
    out.append(
        '<div class="gate-notice" data-gate-notice hidden>'
        "<p><strong>This lesson is part of the full course.</strong> "
        "Lesson 1 is a free preview; the full course unlocks with "
        "enrollment. If you bought this course, "
        '<a href="../../login.html">sign in</a> and enter your purchase '
        "code, then come back to this lesson. If you have not bought it "
        f'yet, <a href="../../courses/{slug}.html">see the course page</a> '
        "for prices and how to enroll.</p></div>"
    )
    out.append('<div class="lesson-body" data-lesson-body>')
    out.append(body_paragraphs(lesson["body"]))
    out.append("</div>")
    out.append(
        f'<p class="player-actions"><button type="button" class="mark-btn" '
        f'data-mark-complete aria-pressed="false">Mark Lesson {number} complete</button></p>'
    )
    out.append('<p class="progress-note" data-progress-note role="status"></p>')
    prev_link = (
        f'<a href="lesson-{number - 1}.html">← Lesson {number - 1}</a>'
        if number > 1 else f'<a href="../{slug}.html">← All lessons</a>'
    )
    next_link = (
        f'<a href="lesson-{number + 1}.html">Lesson {number + 1} →</a>'
        if number < 8 else f'<a href="../{slug}.html">All lessons →</a>'
    )
    out.append(
        f'<nav class="prev-next" aria-label="Previous and next lesson">'
        f"<span>{prev_link}</span><span>{next_link}</span></nav>"
    )
    out.append(
        f'<p>Questions about this lesson? <a href="../../tutor.html?course={slug}">'
        "Ask the course tutor</a> — it answers with exact excerpts from "
        "the lessons.</p>"
    )
    out.append("</div>")
    out.append("</section>")
    return prefix + "".join(out) + with_script(suffix, "../../player.js")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--shell", default=os.path.expanduser(
        "~/workspace/planet-leads-content-shell"))
    ap.add_argument("--site", default=os.path.join(
        os.path.dirname(os.path.abspath(__file__)), ".."))
    args = ap.parse_args()
    site = os.path.abspath(args.site)

    done = 0
    for module_name, slug in sorted(MODULE_TO_SLUG.items()):
        course = load_course(os.path.join(
            args.shell, f"course_content_{module_name}.py"))
        index_path = os.path.join(site, "lessons", f"{slug}.html")
        existing = open(index_path, encoding="utf-8").read()
        # Mapping validation (same rule as the course-page generator).
        m = re.search(r"Full Lessons — ([^<]+)", existing)
        page_name = m.group(1) if m else ""
        words = lambda s: {w for w in re.findall(r"[A-Za-z]{4,}", s.lower())}  # noqa: E731
        renamed_ok = RENAMED.get(slug) == course["product_name"]
        if not renamed_ok and not (words(page_name) & words(course["product_name"])):
            raise SystemExit(
                f"[{slug}] mapping validation failed: lessons page "
                f"'{page_name}' vs shell '{course['product_name']}'")

        new_index = build_index(slug, course, existing)
        if new_index != existing:
            open(index_path, "w", encoding="utf-8").write(new_index)
            done += 1
        lesson_dir = os.path.join(site, "lessons", slug)
        os.makedirs(lesson_dir, exist_ok=True)
        for number in range(1, 9):
            page = build_lesson(slug, course, existing, number)
            path = os.path.join(lesson_dir, f"lesson-{number}.html")
            old = open(path, encoding="utf-8").read() if os.path.exists(path) else None
            if page != old:
                open(path, "w", encoding="utf-8").write(page)
                done += 1
        print(f"[{slug}] ok — {course['product_name']}")
    print(f"Wrote {done} changed pages (35 indexes + up to 280 lesson pages).")


if __name__ == "__main__":
    main()
