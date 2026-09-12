import base64, json, os, urllib.request
from PIL import Image
import io

ref_img_path = '/Users/can/.gemini/antigravity/brain/169a1b06-a9ee-415b-a106-6b0fb184b6e9/.user_uploaded/media_1789116322360.jpg'
with open(ref_img_path, 'rb') as f:
    ref_b64 = base64.b64encode(f.read()).decode('utf-8')

key = ''
with open('/Users/can/Desktop/Kul-ve-Yemin/.env.local') as f:
    for line in f:
        if line.startswith('GEMINI_API_KEY='):
            key = line.strip().split('=', 1)[1]

url = f'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key={key}'

prompt = (
    "Using the provided pixel-art game screenshot as artistic, palette, and style reference, "
    "generate a 2D pixel-art sprite sheet strip of a Bat enemy with 4 frames of flying animation. "
    "Top-down 16-bit retro RPG style, dark purple body with crimson-tinted wings, yellow eyes. "
    "CRITICAL REQUIREMENT: Solid, flat, pure neon green background (#00FF00) behind the bat sprites, "
    "no shadows on the background, completely flat color background for chroma-key extraction."
)

body = {
    'contents': [{
        'parts': [
            {'inlineData': {'mimeType': 'image/jpeg', 'data': ref_b64}},
            {'text': prompt}
        ]
    }]
}

out_dir = '/Users/can/Desktop/Kul-ve-Yemin/generated_assets_review'
os.makedirs(out_dir, exist_ok=True)

req = urllib.request.Request(url, data=json.dumps(body).encode('utf-8'), headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        for cand in res.get('candidates', []):
            for part in cand.get('content', {}).get('parts', []):
                if 'inlineData' in part:
                    raw_data = base64.b64decode(part['inlineData']['data'])
                    img = Image.open(io.BytesIO(raw_data)).convert("RGBA")
                    
                    # Save raw 1k generated image
                    raw_path = os.path.join(out_dir, 'bat_raw_1k.png')
                    img.save(raw_path, "PNG")
                    print(f"Saved raw image: {raw_path}")
                    
                    # Chroma key neon green removal
                    pixels = img.load()
                    w, h = img.size
                    for y in range(h):
                        for x in range(w):
                            r, g, b, a = pixels[x, y]
                            # Detect neon green or close greens
                            if g > 150 and g > r * 1.3 and g > b * 1.3:
                                pixels[x, y] = (0, 0, 0, 0)
                            elif r > 230 and g > 230 and b > 230: # White corners if any
                                pixels[x, y] = (0, 0, 0, 0)
                                
                    # Resize to crisp 128x32 (4 frames of 32x32) using Nearest Neighbor
                    clean_sheet = img.resize((128, 32), Image.NEAREST)
                    clean_path = os.path.join(out_dir, 'bat_transparent_32x32_strip.png')
                    clean_sheet.save(clean_path, "PNG")
                    print(f"Saved clean transparent sprite sheet: {clean_path}")
                    
                    # Also save a 4x magnified version for clear viewing / review
                    preview_path = os.path.join(out_dir, 'bat_preview_magnified.png')
                    clean_sheet.resize((512, 128), Image.NEAREST).save(preview_path, "PNG")
                    print(f"Saved magnified preview: {preview_path}")

except Exception as e:
    print("Error:", e)

