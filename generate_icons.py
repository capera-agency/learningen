#!/usr/bin/env python3
"""
Script per generare icone PWA di test
Richiede: pip install Pillow
"""

from PIL import Image, ImageDraw, ImageFont
import os

# Colori
BG_COLOR = "#2c3e50"  # Colore primario
TEXT_COLOR = "#ffffff"
ACCENT_COLOR = "#667eea"

# Dimensioni icone richieste
SIZES = [72, 96, 128, 144, 152, 192, 384, 512]

def create_icon(size):
    """Crea un'icona con testo 'LM' centrato"""
    # Crea immagine con sfondo
    img = Image.new('RGB', (size, size), BG_COLOR)
    draw = ImageDraw.Draw(img)
    
    # Disegna un cerchio/ellisse come sfondo decorativo
    margin = size // 8
    draw.ellipse(
        [margin, margin, size - margin, size - margin],
        fill=ACCENT_COLOR,
        outline=TEXT_COLOR,
        width=max(2, size // 64)
    )
    
    # Testo "LM" o icona libro
    try:
        # Prova a usare un font di sistema
        font_size = size // 2
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
        except:
            try:
                font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
            except:
                font = ImageFont.load_default()
    except:
        font = ImageFont.load_default()
    
    # Disegna testo "LM" (emoji non sempre supportati, usiamo testo)
    text = "LM"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    # Posiziona testo al centro
    x = (size - text_width) // 2
    y = (size - text_height) // 2 - bbox[1]
    
    draw.text((x, y), text, fill=TEXT_COLOR, font=font)
    
    return img

def main():
    """Genera tutte le icone richieste"""
    # Crea directory se non esiste
    icons_dir = 'static/icons'
    os.makedirs(icons_dir, exist_ok=True)
    
    print("Generazione icone PWA...")
    
    for size in SIZES:
        icon = create_icon(size)
        filename = f'{icons_dir}/icon-{size}x{size}.png'
        icon.save(filename, 'PNG')
        print(f"✓ Creata: {filename} ({size}x{size})")
    
    print(f"\n✅ Tutte le icone sono state create in {icons_dir}/")
    print("Nota: Le icone sono di test. Per produzione, usa icone professionali.")

if __name__ == '__main__':
    main()

