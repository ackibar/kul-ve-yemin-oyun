import os, sys
from PIL import Image

def remove_background(filepath, is_white_bg=True):
    if not os.path.exists(filepath):
        return
    im = Image.open(filepath).convert("RGBA")
    datas = im.getdata()
    
    new_data = []
    for item in datas:
        # Check for white / near-white background or checkerboard gray
        r, g, b, a = item
        # White background tolerance
        if r > 225 and g > 225 and b > 225:
            new_data.append((0, 0, 0, 0))
        # Checkerboard gray tolerance (e.g. 200..225 equal r,g,b)
        elif abs(r - g) < 8 and abs(g - b) < 8 and r > 180 and g > 180 and b > 180:
            new_data.append((0, 0, 0, 0))
        else:
            new_data.append(item)
            
    im.putdata(new_data)
    im.save(filepath, "PNG")
    print(f"Processed transparency for {filepath}")

dirs = [
    '/Users/can/Desktop/Kul-ve-Yemin/public/assets/enemies/5',
    '/Users/can/Desktop/Kul-ve-Yemin/public/assets/characters/1'
]

for d in dirs:
    for f in os.listdir(d):
        if 'Bow_Attack' in f or d.endswith('5'):
            remove_background(os.path.join(d, f))
            # Sync to Kul-ve-Yemin 2
            target_2 = os.path.join(d.replace('/Kul-ve-Yemin/', '/Kul-ve-Yemin 2/'), f)
            remove_background(target_2)

