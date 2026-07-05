"""Write a 96px JPEG thumbnail. Usage: python scripts/gen-cascade-thumb.py IN OUT"""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image


def main() -> None:
    src, dest = Path(sys.argv[1]), Path(sys.argv[2])
    dest.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(src) as img:
        img = img.convert("RGB")
        img.thumbnail((96, 96))
        img.save(dest, format="JPEG", quality=85)


if __name__ == "__main__":
    main()
