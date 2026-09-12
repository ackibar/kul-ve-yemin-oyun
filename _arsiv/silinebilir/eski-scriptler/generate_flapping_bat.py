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
    "A 2D pixel art sprite sheet strip of a flying bat with exactly 4 sequential animation frames arranged horizontally from left to right. "
    "Flapping wing animation cycle: "
    "Frame 1: Wings fully spread wide open pointing upwards. "
    "Frame 2: Wings fully folded down and closed against the body. "
    "Frame 3: Wings fully spread wide open pointing upwards. "
    "Frame 4: Wings fully folded down and closed against the body. "
    "CRITICAL: The bat's body and overall scale must be IDENTICAL in size across all 4 frames. None of the frames should be smaller or zoomed out. "
    "Top-down retro 16-bit RPG pixel art style matching reference palette (dark purple body, crimson red wings, glowing yellow eyes). "
    "Background: Flat solid neon green (#00FF00) with no shadows, no noise."
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
                    
                    raw_path = os.path.join(out_dir, 'bat_flapping_raw.png')
                    img.save(raw_path, "PNG")
                    print(f"Saved raw image: {raw_path}")
                    
                    # Clean chroma key
                    pixels = img.load()
                    w, h = img.size
                    for y in range(h):
                        for x in range(w):
                            r, g, b, a = pixels[x, y]
                            if g > 120 and g > r * 1.25 and g > b * 1.25:
                                pixels[x, y] = (0, 0, 0, 0)
                            elif g > 190 and r < 120 and b < 120:
                                pixels[x, y] = (0, 0, 0, 0)
                                
                    # 4 equal slices
                    frame_w = w // 4
                    frames = []
                    
                    # Find maximum dimension among frames to normalize size uniformly
                    crops = []
                    max_w = 0
                    max_h = 0
                    for i in range(4):
                        box = (i * frame_w, 0, (i + 1) * frame_w, h)
                        fc = img.crop(box)
                        bb = fc.getbbox()
                        if bb:
                            sub = fc.crop(bb)
                            crops.append(sub)
                            max_w = max(max_w, sub.width)
                            max_h = max(max_h, sub.height)
                        else:
                            crops.append(None)
                            
                    # Uniform scale factor for all 4 frames so body scale remains 100% constant!
                    uniform_scale = min(28.0 / max_w, 26.0 / max_h)
                    
                    for sub in crops:
                        f32 = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
                        if sub:
                            nw = max(1, int(sub.width * uniform_scale))
                            nh = max(1, int(sub.height * uniform_scale))
                            res = sub.resize((nw, nh), Image.NEAREST)
                            px = (32 - nw) // 2
                            py = (32 - nh) // 2
                            f32.paste(res, (px, py), res)
                        frames.append(f32)
                        
                    strip = Image.new("RGBA", (128, 32), (0, 0, 0, 0))
                    for i, f in enumerate(frames):
                        strip.paste(f, (i * 32, 0), f)
                        
                    out_path = os.path.join(out_dir, 'bat_flapping_32x32_strip.png')
                    strip.save(out_path, "PNG")
                    
                    # 4x magnified preview for easy user inspection
                    prev_path = os.path.join(out_dir, 'bat_flapping_preview.png')
                    brain_path = '/Users/can/.gemini/antigravity/brain/169a1b06-a9ee-415b-a106-6b0fb184b6e9/bat_preview.png'
                    magnified = strip.resize((512, 128), Image.NEAREST)
                    magnified.save(prev_path, "PNG")
                    magnified.save(brain_path, "PNG")
                    print("Successfully generated and saved uniform flapping bat preview!")

except Exception as e:
    print("Error generating flapping bat:", e)

