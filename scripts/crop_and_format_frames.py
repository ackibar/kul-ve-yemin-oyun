from PIL import Image
import os

raw_path = '/Users/can/Desktop/Kul-ve-Yemin/generated_assets_review/bat_raw_1k.png'
im = Image.open(raw_path).convert("RGBA")
pixels = im.load()
w, h = im.size

# 1. Clean Chroma Key
for y in range(h):
    for x in range(w):
        r, g, b, a = pixels[x, y]
        if g > 120 and g > r * 1.25 and g > b * 1.25:
            pixels[x, y] = (0, 0, 0, 0)
        elif g > 200 and r < 100 and b < 100:
            pixels[x, y] = (0, 0, 0, 0)

# 2. Divide into 4 equal vertical zones (4 frames)
frame_w = w // 4
frames = []

for i in range(4):
    box = (i * frame_w, 0, (i + 1) * frame_w, h)
    frame_crop = im.crop(box)
    
    # Get bounding box of non-transparent content
    bbox = frame_crop.getbbox()
    if bbox:
        cropped_subject = frame_crop.crop(bbox)
        # Scale preserving aspect ratio to fit within 28x28 (inside 32x32)
        sw, sh = cropped_subject.size
        scale = min(28.0 / sw, 28.0 / sh)
        new_w = max(1, int(sw * scale))
        new_h = max(1, int(sh * scale))
        resized_sub = cropped_subject.resize((new_w, new_h), Image.NEAREST)
        
        # Center inside a 32x32 transparent canvas
        frame_32 = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
        paste_x = (32 - new_w) // 2
        paste_y = (32 - new_h) // 2
        frame_32.paste(resized_sub, (paste_x, paste_y), resized_sub)
        frames.append(frame_32)
    else:
        frames.append(Image.new("RGBA", (32, 32), (0, 0, 0, 0)))

# 3. Assemble the 128x32 strip
final_strip = Image.new("RGBA", (128, 32), (0, 0, 0, 0))
for i, f in enumerate(frames):
    final_strip.paste(f, (i * 32, 0), f)

out_dir = '/Users/can/Desktop/Kul-ve-Yemin/generated_assets_review'
final_strip.save(os.path.join(out_dir, 'bat_perfect_32x32_strip.png'), "PNG")
final_strip.resize((512, 128), Image.NEAREST).save(os.path.join(out_dir, 'bat_perfect_preview_512x128.png'), "PNG")
print("Saved perfect cropped & centered bat frames!")

