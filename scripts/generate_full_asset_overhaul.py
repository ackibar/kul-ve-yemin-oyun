import base64, json, os, urllib.request
from PIL import Image
import io

ref_img_path = '/Users/can/.gemini/antigravity/brain/169a1b06-a9ee-415b-a106-6b0fb184b6e9/.user_uploaded/media_1789115205693.jpg'
with open(ref_img_path, 'rb') as f:
    ref_b64 = base64.b64encode(f.read()).decode('utf-8')

key = ''
with open('/Users/can/Desktop/Kul-ve-Yemin/.env.local') as f:
    for line in f:
        if line.startswith('GEMINI_API_KEY='):
            key = line.strip().split('=', 1)[1]

url = f'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key={key}'

def generate_and_fit(prompt, target_file, target_w, target_h):
    print(f"Generating for {target_file} ({target_w}x{target_h})...")
    body = {
        'contents': [{
            'parts': [
                {'inlineData': {'mimeType': 'image/jpeg', 'data': ref_b64}},
                {'text': prompt}
            ]
        }]
    }
    req = urllib.request.Request(url, data=json.dumps(body).encode('utf-8'), headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as resp:
            res = json.loads(resp.read().decode('utf-8'))
            for cand in res.get('candidates', []):
                for part in cand.get('content', {}).get('parts', []):
                    if 'inlineData' in part:
                        raw_data = base64.b64decode(part['inlineData']['data'])
                        img = Image.open(io.BytesIO(raw_data)).convert("RGBA")
                        
                        # Process & resize with crisp nearest-neighbor interpolation to preserve pixel art
                        resized = img.resize((target_w, target_h), Image.NEAREST)
                        
                        dirs = [
                            os.path.dirname(target_file),
                            os.path.dirname(target_file).replace('/Kul-ve-Yemin/', '/Kul-ve-Yemin 2/')
                        ]
                        for d in dirs:
                            os.makedirs(d, exist_ok=True)
                        
                        f1 = target_file
                        f2 = target_file.replace('/Kul-ve-Yemin/', '/Kul-ve-Yemin 2/')
                        
                        resized.save(f1, "PNG")
                        resized.save(f2, "PNG")
                        print(f"SUCCESS: Saved {target_file} and synced to Kul-ve-Yemin 2")
                        return True
            print(f"FAIL: No inlineData returned for {target_file}")
    except Exception as e:
        print(f"ERROR generating {target_file}:", e)
    return False

# 1. Bat enemy assets (enemies/5)
bat_prompts = [
    ("2D pixel art bat sprite sheet strip, 4 frames of flying bat with purple wings, top-down 16-bit RPG style, matching reference screenshot palette.", "public/assets/enemies/5/D_Idle.png", 128, 32),
    ("2D pixel art bat sprite sheet strip, 6 frames of fast flying bat moving forward, top-down 16-bit RPG style, matching reference palette.", "public/assets/enemies/5/D_Walk.png", 192, 32),
    ("2D pixel art bat sprite sheet strip, 4 frames of bat biting swoop attack, top-down 16-bit RPG style, matching reference palette.", "public/assets/enemies/5/D_Attack.png", 128, 32),
    ("2D pixel art bat sprite sheet strip, 2 frames of hurt bat taking damage, top-down 16-bit RPG style.", "public/assets/enemies/5/D_Hurt.png", 64, 32),
    ("2D pixel art bat sprite sheet strip, 8 frames of bat falling and dissolving into dust upon defeat, top-down RPG style.", "public/assets/enemies/5/D_Death.png", 256, 32),
    # Up and Side directions for Bat
    ("2D pixel art bat sprite sheet strip facing up, 4 frames of flying bat, top-down RPG style.", "public/assets/enemies/5/U_Idle.png", 128, 32),
    ("2D pixel art bat sprite sheet strip facing up, 6 frames of flying bat, top-down RPG style.", "public/assets/enemies/5/U_Walk.png", 192, 32),
    ("2D pixel art bat sprite sheet strip facing up, 4 frames of bat attack, top-down RPG style.", "public/assets/enemies/5/U_Attack.png", 128, 32),
    ("2D pixel art bat sprite sheet strip facing side, 4 frames of flying bat, top-down RPG style.", "public/assets/enemies/5/S_Idle.png", 128, 32),
    ("2D pixel art bat sprite sheet strip facing side, 6 frames of flying bat, top-down RPG style.", "public/assets/enemies/5/S_Walk.png", 192, 32),
    ("2D pixel art bat sprite sheet strip facing side, 4 frames of bat attack, top-down RPG style.", "public/assets/enemies/5/S_Attack.png", 128, 32),
]

# 2. Hero Bow Attack animations (characters/1 distinct bow attack frames)
hero_bow_prompts = [
    ("2D pixel art hero adventurer sprite sheet strip, 4 frames drawing a wooden bow and firing an arrow downwards, green tunic brown boots matching reference hero.", "public/assets/characters/1/D_Bow_Attack.png", 128, 32),
    ("2D pixel art hero adventurer sprite sheet strip, 4 frames drawing a wooden bow and firing an arrow upwards, green tunic brown boots matching reference hero.", "public/assets/characters/1/U_Bow_Attack.png", 128, 32),
    ("2D pixel art hero adventurer sprite sheet strip, 4 frames drawing a wooden bow and firing an arrow sideways, green tunic brown boots matching reference hero.", "public/assets/characters/1/S_Bow_Attack.png", 128, 32),
]

def main():
    base_dir = "/Users/can/Desktop/Kul-ve-Yemin"
    for prompt, rel_path, w, h in bat_prompts + hero_bow_prompts:
        target = os.path.join(base_dir, rel_path)
        generate_and_fit(prompt, target, w, h)

if __name__ == '__main__':
    main()
