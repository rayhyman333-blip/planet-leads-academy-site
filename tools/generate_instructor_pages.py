#!/usr/bin/env python3
"""Generate instructor profile pages (parity item A10).

One public page per instructor at instructors/<slug>.html, built from
the student backend's attribution data (GET /api/courses — the same
live data the A11 instructor system serves: every course carries its
instructor of record, and the response lists every instructor). The
template is data-driven: a future instructor appears by being added to
the backend's attribution, and this generator produces their page with
no code change — their bio falls back to a plain factual template
until a fuller bio is added to PROFILES below.

Usage: python3 tools/generate_instructor_pages.py [--api-url URL]
       python3 tools/generate_instructor_pages.py --from-file courses.json
Created with Planet Leads 🚀
"""
import argparse
import html
import json
import os
import urllib.request

API_URL = "https://planet-leads-academy-backend.onrender.com/api/courses"

# Fuller bios for instructors we know. Keyed by instructor slug (the
# backend's attribution slug). Anything not listed gets the factual
# fallback in build_page() — name, role, and their course list only.
PROFILES = {
    "ramel-hyman": {
        "role": "Founder, Planet Leads Academy",
        "bio": [
            "Ramel Hyman is the founder of Planet Leads Academy and of "
            "Planet Leads — the tech and software company that builds "
            "systems that make life easier. He is the instructor of "
            "record for the Academy's courses: he owns the curriculum, "
            "verifies enrollments, reviews refunds, and decides what "
            "the school teaches next.",
            "Day-to-day teaching is done by Cynthia, the Academy's AI "
            "instructor and tutor, who teaches from the written lessons "
            "and answers student questions with exact excerpts from "
            "them. Cynthia is an AI, not a human teacher, and claims no "
            "human credentials — Ramel is the human accountable for the "
            "school and its courses.",
            "Reach him for price and enrollment matters at "
            "rayhyman333@gmail.com.",
        ],
    },
}


def esc(text):
    return html.escape(text, quote=False)


def load_api(api_url, from_file):
    if from_file:
        with open(from_file, encoding="utf-8") as fh:
            return json.load(fh)
    req = urllib.request.Request(api_url, headers={"User-Agent": "pla-site-generator"})
    with urllib.request.urlopen(req, timeout=120) as resp:
        return json.load(resp)


def build_page(instructor, courses):
    slug = instructor["slug"]
    name = instructor["name"]
    display = instructor["display_name"]
    profile = PROFILES.get(slug)
    role = profile["role"] if profile else "Instructor, Planet Leads Academy"
    if profile:
        bio = profile["bio"]
    else:
        bio = [
            f"{name} teaches at Planet Leads Academy. Their courses are "
            "listed below. Academy courses are written, self-paced "
            "courses; Cynthia, the Academy's AI tutor, answers student "
            "questions with exact excerpts from the lessons."
        ]
    out = []
    out.append("<!DOCTYPE html>\n")
    out.append(
        '<html lang="en"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1">'
        f"<title>{esc(name)} — Instructor — Planet Leads Academy</title>"
        '<link rel="icon" type="image/png" href="../images/planet-leads-academy-icon.png">'
        '<link rel="apple-touch-icon" href="../images/planet-leads-academy-icon.png">'
        '<link rel="stylesheet" href="../school.css"></head><body>'
        '<a class="skip-link" href="#main">Skip to main content</a>'
        '<header class="site-header"><div class="bar">'
        '<a class="brand" href="../index.html">Planet Leads Academy 🚀'
        "<small>Created by Ramel Hyman, Planet Leads</small></a>"
        '<nav class="main-nav"><a href="../index.html">Home</a>'
        '<a href="../catalog.html">Courses</a>'
        '<a href="../tutor.html">Course Tutor</a>'
        '<a href="../admissions.html">Admissions</a>'
        '<a href="../tuition.html">Tuition</a>'
        '<a href="../bundles.html">Bundles</a>'
        '<a href="../faculty.html">Faculty</a>'
        '<a href="../about.html">About</a>'
        '<a href="../contact.html">Contact</a>'
        '<a class="login-btn" href="../login.html">Student Login</a>'
        "</nav></div></header>"
    )
    out.append('<section id="main" tabindex="-1">')
    out.append(f"<h2>{esc(name)}</h2>")
    out.append(f'<p class="profile-role">{esc(display)}</p>')
    for para in bio:
        out.append(f"<p>{esc(para)}</p>")
    out.append(f"<h3>Courses by this instructor ({len(courses)})</h3>")
    out.append('<ul class="profile-courses">')
    for course in courses:
        out.append(
            f'<li><a href="../courses/{course["slug"]}.html">{esc(course["name"])}</a>'
            f' — {esc(course["category"])} · {esc(course["price"])}</li>'
        )
    out.append("</ul>")
    out.append('<p><a href="../faculty.html">← Back to Faculty</a></p>')
    out.append("</section>")
    out.append(
        '<footer class="site-footer"><div class="foot"><nav class="foot-nav">'
        '<a href="../my-courses.html">My Courses</a>'
        '<a href="../cynthia.html">Talk to Cynthia</a>'
        '<a href="../help.html">Help</a><a href="../faq.html">FAQ</a>'
        '<a href="../policies.html">Policies</a>'
        '<a href="../student-system.html">Student System</a>'
        '<a href="../certificate.html">Certificates</a></nav>'
        "<p>Planet Leads Academy 🚀 — Planet Leads 🚀, created by Ramel Hyman. "
        'Support: <a href="mailto:planetleads1@gmail.com">planetleads1@gmail.com</a> · '
        'Owner: <a href="mailto:rayhyman333@gmail.com">rayhyman333@gmail.com</a></p>'
        '<p class="fine">Not accredited. No degrees claimed. Certificates '
        "certify completion of 8 written lessons in a course only. No "
        "outcome, job, income, or fluency promise is made. Prices in US "
        "dollars. Pay in full upfront.</p></div></footer>"
    )
    out.append("</body></html>")
    return "".join(out)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--api-url", default=API_URL)
    ap.add_argument("--from-file", default=None)
    ap.add_argument("--site", default=os.path.join(
        os.path.dirname(os.path.abspath(__file__)), ".."))
    args = ap.parse_args()
    site = os.path.abspath(args.site)

    data = load_api(args.api_url, args.from_file)
    instructors = data.get("instructors") or []
    if not instructors:
        raise SystemExit("the backend returned no instructors — refusing to guess")
    by_instructor = {}
    for course in data["courses"]:
        inst = course.get("instructor")
        if inst:
            by_instructor.setdefault(inst["slug"], []).append(course)

    out_dir = os.path.join(site, "instructors")
    os.makedirs(out_dir, exist_ok=True)
    for instructor in instructors:
        slug = instructor["slug"]
        courses = sorted(by_instructor.get(slug, []), key=lambda c: c["name"])
        page = build_page(instructor, courses)
        path = os.path.join(out_dir, f"{slug}.html")
        old = open(path, encoding="utf-8").read() if os.path.exists(path) else None
        if page != old:
            open(path, "w", encoding="utf-8").write(page)
        print(f"[{slug}] {instructor['name']} — {len(courses)} courses")


if __name__ == "__main__":
    main()
