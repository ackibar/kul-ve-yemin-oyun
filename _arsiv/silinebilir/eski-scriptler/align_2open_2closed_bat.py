from PIL import Image
import os

raw_path = '/Users/can/Desktop/Kul-ve-Yemin/generated_assets_review/bat_flapping_raw.png'
im = Image.open(raw_path).convert("RGBA")
pixels = im.load()
w, h = im.size

# Clean Chroma Key (pure green)
for y in range(h):
    for x in range(w):
        r, g, b, a = pixels[x, y]
        # Neon green removal
        if g > 130 and g > r * 1.3 and g > b * 1.3:
            pixels[x, y] = (0, 0, 0, 0)
        elif g > 180 and r < 140 and b < 140:
            pixels[x, y] = (0, 0, 0, 0)

# Now find the 4 individual bats precisely by horizontal bounding boxes
# In raw image, there are 4 distinct bats along X axis
col_has_content = [False] * w
for x in range(w):
    for y in range(h):
        if pixels[x, y][3] > 0:
            col_has_content[x] = True
            break

# Segment bats
segments = []
in_seg = False
start_x = 0
for x in range(w):
    if col_has_content[x] and not in_seg:
        in_seg = True
        start_x = x
    elif not col_has_content[x] and in_seg:
        in_seg = False
        if x - start_x > 20: # valid bat width
            segments.append((start_x, x))
if in_seg:
    segments.append((start_x, w))

print("Found bat segments:", segments)

bat_crops = []
for sx, ex in segments:
    crop = im.crop((sx, 0, ex, h))
    bbox = crop.getbbox()
    if bbox:
        bat_crops.append(crop.crop(bbox))

print(f"Extracted {len(bat_crops)} distinct bat crops")

# The user asked:
# "ikisinde açık ikisinde kapalı olsun kanatları" (2 open wings, 2 closed wings)
# "hepsi aynı boyutta olmalı" (all bodies must be the exact same size)

# bat_crops[1] is wide open wings
# bat_crops[0] is angled open wings
# bat_crops[3] is closed wings (wings folded down)

open_1 = bat_crops[1]
open_2 = bat_crops[0]
closed_1 = bat_crops[3]

# Create closed_2 by a slight flap variation of closed_1 (e.g. wings tucked 2px closer/up)
closed_2 = closed_1.copy()
# Shift wings slightly for natural second flap phase
c2_pix = closed_2.load()
c1_pix = closed_1.load()
cw, ch = closed_1.size
# Slight flap breath: scale height by 0.96 for slight wing compression
closed_2 = closed_1.resize((cw, int(ch * 0.95)), Image.NEAREST)

# Target: 4 frames = [Open 1, Open 2, Closed 1, Closed 2]
# To ensure body size is 100% identical, measure the body height of the bat!
# In bat_crops, ear-to-foot height is roughly ch for closed_1, which is ~120px in 1k.
# In 32x32 target canvas, the bat body should be 20px tall in all frames!
target_body_h = 20

def fit_to_frame(img, is_closed=False):
    # Scale based on height to maintain consistent body proportion
    scale = target_body_h / img.height if is_closed else 22.0 / img.height
    nw = max(1, int(img.width * scale))
    nh = max(1, int(img.height * scale))
    # Cap max width to 28px so it fits nicely inside 32x32
    if nw > 28:
        scale = 28.0 / img.width
        nw = 28
        nh = max(1, int(img.height * scale))
    res = img.resize((nw, nh), Image.NEAREST)
    
    frame = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
    px = (32 - nw) // 2
    py = (32 - nh) // 2
    frame.paste(res, (px, py), res)
    return frame

frames = [
    fit_to_frame(open_1, False),
    fit_to_frame(open_2, False),
    fit_to_frame(closed_1, True),
    fit_to_frame(closed_2, True)
]

final_strip = Image.new("RGBA", (128, 32), (0, 0, 0, 0))
for i, f in enumerate(frames):
    final_strip.paste(f, (i * 32, 0), f)

out_dir = '/Users/can/Desktop/Kul-ve-Yemin/generated_assets_review'
final_strip.save(os.path.join(out_dir, 'bat_2open_2closed_32x32.png'), "PNG")

preview = final_strip.resize((512, 128), Image.NEAREST)
preview.save(os.path.join(out_dir, 'bat_flapping_preview.png'), "PNG")
preview.save('/Users/can/.gemini/antigravity/brain/169a1b06-a9ee-415b-a106-6b0fb184b6e9/bat_preview.png', "PNG")
print("Saved 2 open + 2 closed uniform bat animation strip!")

