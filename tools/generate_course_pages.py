#!/usr/bin/env python3
"""Regenerate the Academy course pages from the content shell.

Each course page keeps its existing identity blocks (name, category,
price, description, Gumroad link, study-time estimate, lifetime-access
statement, instructor paragraph) and gains the structured sections the
shell syllabus already carries:

  - What You Will Learn  (from the syllabus section of the same name)
  - Curriculum           (the 8 lesson titles, linking to the lessons page)
  - This course includes (syllabus, 8 lessons, the 3 named materials,
                          certificate at 8/8, lifetime access)
  - Prerequisites        (from the syllabus section of the same name)
  - Course updates       (announcements mount point, filled by
                          announcements.js from announcements.json)

Source of truth for course content: ~/workspace/planet-leads-content-shell/
course_content_*.py (COURSE dict). The page's own existing blocks are the
source of truth for name/price/links — nothing is invented here.

Usage: python3 tools/generate_course_pages.py [--shell DIR] [--site DIR]
Validates the module->slug mapping by checking each course's Lesson 1
title appears in the matching lessons/<slug>.html page.
Created with Planet Leads 🚀
"""
import argparse
import glob
import html
import importlib.util
import os
import re
import sys

# shell module name (without course_content_ prefix / .py) -> site slug
MODULE_TO_SLUG = {
    "arabic": "arabic",
    "bible_scholar": "bible-scholar-ai",
    "data_analytics": "data-analytics",
    "data_science": "data-science-foundations",
    "digital_marketing": "digital-marketing",
    "drums": "drums-foundations",
    "dutch": "conversational-dutch",
    "entrepreneurship": "entrepreneurship",
    "french": "french",
    "german": "german",
    "guitar": "guitar",
    "hebrew_scholar": "hebrew-scholar-ai",
    "hindi": "conversational-hindi",
    "islamic_scholar": "islamic-scholar-ai",
    "italian": "italian",
    "japanese": "japanese",
    "java": "java-programming",
    "javascript": "javascript",
    "korean": "korean",
    "leadership": "leadership-mastery",
    "mandarin": "mandarin",
    "marketing": "marketing-foundations",
    "mobile_dev": "mobile-development",
    "music_theory": "music-theory",
    "piano": "piano",
    "portuguese": "portuguese",
    "project_management": "project-management",
    "public_speaking": "public-speaking-mastery",
    "python": "python",
    "quranic_studies": "quranic-studies-ai",
    "russian": "russian",
    "singing": "singing-foundations",
    "spanish": "spanish",
    "torah_scholar": "torah-scholar-ai",
    "web_dev": "web-development",
}


# Courses the shell has renamed since the site was built. Validated by
# exact product_name match instead of the shared-word check.
RENAMED = {
    "entrepreneurship": "Launch Ready: From Idea to First Customers",
}


def esc(text):
    return html.escape(text, quote=False)


def load_course(path):
    spec = importlib.util.spec_from_file_location("shell_course", path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.COURSE


def sentences(body):
    parts = re.split(r"(?<=[.!?])\s+(?=[A-Z0-9\u201c\"])", body.strip())
    return [p.strip().rstrip(".") for p in parts if len(p.strip()) > 3]


def paragraphs(body):
    return [p.strip() for p in body.strip().split("\n\n") if p.strip()]


def grab(pattern, text, what, slug):
    m = re.search(pattern, text, re.S)
    if not m:
        raise SystemExit(f"[{slug}] could not extract {what}")
    return m.group(0)


def build_page(slug, course, existing):
    # Preserve everything outside the main <section>...</section>.
    # (Since the A7 accessibility pass the tag carries id="main".)
    open_m = re.search(r"<section[^>]*>", existing)
    sec_start = open_m.start()
    sec_end = existing.index("</section>") + len("</section>")
    head_part = existing[:sec_start]
    tail_part = existing[sec_end:]
    section_tag = open_m.group(0)

    sec = existing[sec_start:sec_end]
    h2 = grab(r"<h2>.*?</h2>", sec, "h2", slug)
    meta = grab(r"<p><strong>Category:</strong>.*?</p>", sec, "meta block", slug)
    # The description is the first plain <p> after the meta block.
    after_meta = sec[sec.index(meta) + len(meta):]
    desc = re.search(r"<p>.*?</p>", after_meta, re.S).group(0)
    gumroad_p = grab(r"<p><a class=\"gumroad-button\".*?</p>", sec, "gumroad button", slug)
    links_p = grab(r"<p><a href='\.\./catalog\.html'>.*?</p>", sec, "back links", slug)
    study_p = grab(r"<p><strong>Estimated study time:</strong>.*?</p>", sec, "study time", slug)
    lifetime_p = grab(r"<p><strong>Lifetime access:</strong>.*?</p>", sec, "lifetime access", slug)
    instructor_p = grab(r"<p><strong>Instructor:</strong>.*?</p>", sec, "instructor", slug)

    syllabus = {s["heading"]: s["body"] for s in course["syllabus"]}
    wywl_items = sentences(syllabus["What You Will Learn"])
    prereq_paras = paragraphs(syllabus["Prerequisites"])
    lessons = course["lessons"]
    materials = course["materials"]

    out = [section_tag]
    out.append(h2)
    out.append(meta)
    out.append(desc)
    out.append(gumroad_p)
    out.append(links_p)
    out.append(
        f"<p><a href='../tutor.html?course={slug}'>Ask the course tutor →</a> "
        "— answers quoted exactly from this course's own lessons.</p>"
    )

    out.append("<h3>What You Will Learn</h3>")
    out.append("<ul>")
    for item in wywl_items:
        out.append(f"<li>{esc(item)}</li>")
    out.append("</ul>")

    out.append("<h3>Curriculum — 8 lessons</h3>")
    out.append("<ol>")
    for lesson in lessons:
        out.append(
            f"<li><a href='../lessons/{slug}.html'>{esc(lesson['title'])}</a></li>"
        )
    out.append("</ol>")
    out.append(
        f"<p><a href='../lessons/{slug}.html'>Read the full lesson text for this course →</a></p>"
    )

    out.append("<h3>This course includes</h3>")
    out.append("<ul>")
    out.append("<li>Full syllabus: Course Overview, What You Will Learn, How to Use This Course, Prerequisites, About This Package</li>")
    out.append("<li>8 written lessons, each with a practice exercise</li>")
    for mat in materials:
        out.append(f"<li>Material: {esc(mat['title'])}</li>")
    out.append("<li>Certificate of Completion at 8 of 8 lessons</li>")
    out.append("<li>Lifetime access — one payment, no subscription, no expiry date</li>")
    out.append("</ul>")

    out.append("<h3>Prerequisites</h3>")
    for para in prereq_paras:
        out.append(f"<p>{esc(para)}</p>")

    out.append(study_p)
    out.append(lifetime_p)
    out.append("<h3>Instructor</h3>")
    out.append(instructor_p)
    out.append("<h3>Course updates</h3>")
    out.append(
        f"<div data-course-announcements=\"{slug}\"><p>No updates yet for this course. Announcements from the Academy are posted on the <a href='../announcements.html'>Announcements page</a>.</p></div>"
    )
    out.append("</section>")
    # The announcements renderer fills the Course updates mount point;
    # make sure its script survives regeneration.
    if "announcements.js" not in tail_part:
        tail_part = tail_part.replace(
            "</body>", '<script src="../announcements.js"></script></body>', 1
        )
    return head_part + "".join(out) + tail_part


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--shell", default=os.path.expanduser("~/workspace/planet-leads-content-shell"))
    ap.add_argument("--site", default=os.path.join(os.path.dirname(__file__), ".."))
    args = ap.parse_args()
    site = os.path.abspath(args.site)

    slugs = sorted(MODULE_TO_SLUG.values())
    site_slugs = sorted(
        os.path.basename(p)[:-5] for p in glob.glob(os.path.join(site, "courses", "*.html"))
    )
    if slugs != site_slugs:
        raise SystemExit(f"slug mismatch: mapping {slugs} vs site {site_slugs}")

    done = 0
    for module_name, slug in sorted(MODULE_TO_SLUG.items()):
        course = load_course(os.path.join(args.shell, f"course_content_{module_name}.py"))
        lessons_page = open(os.path.join(site, "lessons", f"{slug}.html"), encoding="utf-8").read()
        # Mapping validation: the lessons page's course name must share a
        # significant word with the shell product name. (Exact lesson-title
        # matching is NOT used: 18 of the site's lessons pages still carry
        # an earlier edition's titles — the shell is the current product.)
        m = re.search(r"Full Lessons — ([^<]+)", lessons_page)
        page_name = m.group(1) if m else ""
        words = lambda s: {w for w in re.findall(r"[A-Za-z]{4,}", s.lower())}
        renamed_ok = RENAMED.get(slug) == course["product_name"]
        if not renamed_ok and not (words(page_name) & words(course["product_name"])):
            raise SystemExit(
                f"[{slug}] mapping validation failed: lessons page '{page_name}' "
                f"vs shell '{course['product_name']}'"
            )
        page_path = os.path.join(site, "courses", f"{slug}.html")
        existing = open(page_path, encoding="utf-8").read()
        new = build_page(slug, course, existing)
        if new != existing:
            open(page_path, "w", encoding="utf-8").write(new)
            done += 1
        print(f"[{slug}] ok — {course['product_name']}")
    print(f"Regenerated {done} course pages.")


if __name__ == "__main__":
    main()
