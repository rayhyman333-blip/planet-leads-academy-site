#!/usr/bin/env python3
"""Build the on-site tutor corpus (tutor-corpus.json) — parity item A4.

The on-site tutor (tutor.html + tutor.js) runs the same extractive
method as the Cynthia MCP server's ask_tutor, over the same corpus.
This script regenerates the site's copy of that corpus from the MCP-side
build in ~/workspace/cynthia-tutor-build (whose build_corpus.py reads
the content shell — the source of truth) and adds each course's site
slug so answers can link to the lesson pages on this site.

Run the MCP-side builder first when the shell changes:
    cd ~/workspace/cynthia-tutor-build && python3 build_corpus.py
then:
    python3 tools/build_tutor_corpus.py

Created with Planet Leads 🚀
"""
import argparse
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from generate_course_pages import MODULE_TO_SLUG  # noqa: E402


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--corpus", default=os.path.expanduser(
        "~/workspace/cynthia-tutor-build/corpus.json"))
    ap.add_argument("--out", default=os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "..", "tutor-corpus.json"))
    args = ap.parse_args()

    with open(args.corpus, encoding="utf-8") as fh:
        corpus = json.load(fh)
    for course in corpus["courses"]:
        module_slug = course["slug"]
        if module_slug not in MODULE_TO_SLUG:
            raise SystemExit(f"no site slug mapping for corpus course {module_slug!r}")
        course["site_slug"] = MODULE_TO_SLUG[module_slug]
    with open(args.out, "w", encoding="utf-8") as fh:
        json.dump(corpus, fh, ensure_ascii=False, separators=(",", ":"))
    print(f"Wrote {args.out}: {len(corpus['courses'])} courses, "
          f"{sum(len(c['lessons']) for c in corpus['courses'])} lessons.")


if __name__ == "__main__":
    main()
