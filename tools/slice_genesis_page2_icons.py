from pathlib import Path
from PIL import Image, ImageEnhance

SOURCE = Path(r"C:\Users\max74\.codex\generated_images\019f6396-a126-74a1-9012-ca192d0c1d85\exec-41b8ab05-0e3a-4540-8bb7-d58afb62218b.png")
OUT = Path(__file__).resolve().parents[1] / "assets" / "icons" / "genesis"
NAMES = [
    "relic-eye.png",
    "relic-blood.png",
    "relic-scale.png",
    "relic-bone.png",
    "relic-fang.png",
    "relic-heart.png",
    "relic-flesh.png",
    "relic-claw.png",
]

OUT.mkdir(parents=True, exist_ok=True)
atlas = Image.open(SOURCE).convert("RGB")
atlas.save(OUT / "page2-relic-atlas.png", optimize=True)

cell_w = atlas.width // 4
cell_h = atlas.height // 2
for index, name in enumerate(NAMES):
    col, row = index % 4, index // 4
    left, top = col * cell_w, row * cell_h
    side = min(cell_w, cell_h)
    top += (cell_h - side) // 2
    icon = atlas.crop((left, top, left + side, top + side))
    icon = ImageEnhance.Contrast(icon).enhance(1.04)
    icon = icon.resize((160, 160), Image.Resampling.LANCZOS)
    icon.save(OUT / name, optimize=True)

print(f"created {len(NAMES)} icons in {OUT}")
