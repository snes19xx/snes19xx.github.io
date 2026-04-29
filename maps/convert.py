#!/usr/bin/env python3
"""
convert_to_webp.py

Recursively converts all PNG / JPG / JPEG / GIF / TIFF / BMP images
to WebP, deletes the originals, and rewrites any .html files in the
tree so their src / href / url() references point to the new .webp files.

Usage:
    python convert_to_webp.py                  # runs in current directory
    python convert_to_webp.py /path/to/folder  # runs in specified directory
    python convert_to_webp.py --quality 90     # set WebP quality (default 85)
    python convert_to_webp.py --dry-run        # preview changes, touch nothing

Requirements:
    pip install Pillow
"""

import argparse
import os
import re
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("ERROR: Pillow is not installed. Run:  pip install Pillow")
    sys.exit(1)

CONVERT_EXTS = {".png", ".jpg", ".jpeg", ".gif", ".tiff", ".tif", ".bmp"}


HTML_REF_RE = re.compile(
    r'(?P<attr>(?:src|href|data-src|data-href)\s*=\s*["\'])(?P<path>[^"\']+)(?P<close>["\'])'
    r'|'
    r'(?P<url_open>url\(["\']?)(?P<url_path>[^)"\'\s]+)(?P<url_close>["\']?\))',
    re.IGNORECASE,
)


def build_rename_map(root: Path, dry_run: bool, quality: int) -> dict[str, str]:
    rename_map: dict[str, str] = {}
    converted = 0
    skipped   = 0
    errors    = 0

    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if not d.startswith('.')]

        for fname in filenames:
            fpath = Path(dirpath) / fname
            if fpath.suffix.lower() not in CONVERT_EXTS:
                continue

            webp_path = fpath.with_suffix('.webp')

            rel_old  = str(fpath.relative_to(root))
            rel_new  = str(webp_path.relative_to(root))
            rename_map[rel_old]  = rel_new
            rename_map[fname]    = webp_path.name  

            if webp_path.exists():
                print(f"  [SKIP]    {rel_old}  (WebP already exists)")
                skipped += 1
                continue

            if dry_run:
                print(f"  [DRY-RUN] Would convert: {rel_old} → {rel_new}")
                converted += 1
                continue

            try:
                with Image.open(fpath) as img:
                    if img.mode in ("RGBA", "LA", "P"):
                        img = img.convert("RGBA")
                    else:
                        img = img.convert("RGB")
                    img.save(webp_path, "WEBP", quality=quality, method=6)

                fpath.unlink()
                print(f"  [OK]      {rel_old} → {rel_new}")
                converted += 1

            except Exception as exc:
                print(f"  [ERROR]   {rel_old}: {exc}")
                errors += 1
                rename_map.pop(rel_old, None)
                rename_map.pop(fname,   None)

    print(f"\nImages: {converted} converted, {skipped} skipped, {errors} errors.")
    return rename_map


def rewrite_html_files(root: Path, rename_map: dict[str, str], dry_run: bool) -> None:
    html_files = list(root.rglob("*.html"))
    if not html_files:
        print("No HTML files found.")
        return

    rewrote = 0

    for html_path in html_files:
        original = html_path.read_text(encoding="utf-8", errors="replace")
        updated  = original

        def replace_ref(m: re.Match) -> str:
            # Handle src="..." / href="..." style
            if m.group("attr"):
                old_path = m.group("path")
                new_path = _swap_ext(old_path, rename_map)
                if new_path != old_path:
                    return m.group("attr") + new_path + m.group("close")
                return m.group(0)
            # Handle url(...) style
            if m.group("url_open"):
                old_path = m.group("url_path")
                new_path = _swap_ext(old_path, rename_map)
                if new_path != old_path:
                    return m.group("url_open") + new_path + m.group("url_close")
                return m.group(0)
            return m.group(0)

        updated = HTML_REF_RE.sub(replace_ref, updated)

        if updated == original:
            continue  # nothing changed

        rel = html_path.relative_to(root)
        if dry_run:
            print(f"  [DRY-RUN] Would rewrite HTML: {rel}")
        else:
            html_path.write_text(updated, encoding="utf-8")
            print(f"  [HTML]    Rewrote: {rel}")
        rewrote += 1

    print(f"\nHTML files rewritten: {rewrote}")


def _swap_ext(path_str: str, rename_map: dict[str, str]) -> str:
    normalised = path_str.replace("\\", "/")
    if normalised in rename_map:
        return rename_map[normalised]
    basename = normalised.split("/")[-1]
    if basename in rename_map:
        new_basename = rename_map[basename]
        return normalised[: -len(basename)] + new_basename
    return path_str


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Convert all images to WebP and update HTML references."
    )
    parser.add_argument(
        "directory",
        nargs="?",
        default=".",
        help="Root directory to process (default: current directory)",
    )
    parser.add_argument(
        "--quality",
        type=int,
        default=85,
        help="WebP quality 1-100 (default: 85). 80-90 is a good balance.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview what would happen without changing any files.",
    )
    args = parser.parse_args()

    root = Path(args.directory).resolve()
    if not root.is_dir():
        print(f"ERROR: '{root}' is not a directory.")
        sys.exit(1)

    print(f"{'[DRY RUN] ' if args.dry_run else ''}Processing: {root}")
    print(f"WebP quality: {args.quality}\n")

    print("=== Step 1: Converting images ===")
    rename_map = build_rename_map(root, dry_run=args.dry_run, quality=args.quality)

    if not rename_map:
        print("No images to convert.")
    else:
        print(f"\n=== Step 2: Rewriting HTML files ===")
        rewrite_html_files(root, rename_map, dry_run=args.dry_run)

    print("\nDone.")


if __name__ == "__main__":
    main()