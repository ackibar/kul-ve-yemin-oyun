from PIL import Image
import os

# Create pixel-perfect 32x32 frames based on the original character sprite
orig_dir = '/Users/can/Desktop/Kul-ve-Yemin/public/assets/characters/1'

for dir_prefix in ['D', 'U', 'S']:
    idle_path = os.path.join(orig_dir, f'{dir_prefix}_Idle.png')
    attack_path = os.path.join(orig_dir, f'{dir_prefix}_Attack.png')
    
    if os.path.exists(attack_path):
        base_im = Image.open(attack_path).convert("RGBA")
    else:
        base_im = Image.open(idle_path).convert("RGBA")
        
    # Copy base animation strip
    bow_im = base_im.copy()
    
    # Draw pixel-art bow and string directly on the character frames in alpha channel
    w, h = bow_im.size
    num_frames = w // 32
    
    pixels = bow_im.load()
    
    for f in range(num_frames):
        off_x = f * 32
        # Center of character frame: roughly (off_x + 16, 16)
        # Add bow pixels
        if dir_prefix == 'D':
            # Bow held downward/forward
            bow_color = (199, 141, 76, 255) # Wooden brown
            string_color = (232, 232, 232, 255) # String white
            
            # Bow arc pixels
            for py in range(12, 21):
                pixels[off_x + 22, py] = bow_color
            pixels[off_x + 21, 11] = bow_color
            pixels[off_x + 21, 21] = bow_color
            # Bow string
            for py in range(12, 21):
                pixels[off_x + 20, py] = string_color
                
        elif dir_prefix == 'U':
            # Bow held upward
            bow_color = (199, 141, 76, 255)
            string_color = (232, 232, 232, 255)
            for px in range(12, 21):
                pixels[px + off_x, 8] = bow_color
            pixels[off_x + 11, 9] = bow_color
            pixels[off_x + 21, 9] = bow_color
            for px in range(12, 21):
                pixels[px + off_x, 10] = string_color
                
        elif dir_prefix == 'S':
            # Bow held to side
            bow_color = (199, 141, 76, 255)
            string_color = (232, 232, 232, 255)
            for py in range(12, 21):
                pixels[off_x + 22, py] = bow_color
            pixels[off_x + 21, 11] = bow_color
            pixels[off_x + 21, 21] = bow_color
            for py in range(12, 21):
                pixels[off_x + 20, py] = string_color

    out_1 = os.path.join(orig_dir, f'{dir_prefix}_Bow_Attack.png')
    out_2 = out_1.replace('/Kul-ve-Yemin/', '/Kul-ve-Yemin 2/')
    bow_im.save(out_1, "PNG")
    bow_im.save(out_2, "PNG")
    print(f"Created pixel-perfect bow attack sprite: {out_1}")

