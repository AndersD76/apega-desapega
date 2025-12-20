"""
Apega Desapega - Professional Banner Generator
Uses HTML/CSS to create beautiful, designer-quality banners
"""

import os
from html2image import Html2Image
from pathlib import Path
import json

# Configuration
OUTPUT_DIR = Path(__file__).parent / "output"
ASSETS_DIR = Path(__file__).parent / "assets"
OUTPUT_DIR.mkdir(exist_ok=True)
ASSETS_DIR.mkdir(exist_ok=True)

# Brand Colors (matching app theme)
COLORS = {
    "primary": "#D4A574",
    "primaryDark": "#C49660",
    "secondary": "#8B7355",
    "accent": "#E8D5C4",
    "background": "#FAF8F5",
    "white": "#FFFFFF",
    "black": "#1A1A1A",
    "textPrimary": "#2D2D2D",
    "textSecondary": "#6B6B6B",
    "success": "#4CAF50",
    "error": "#E53935",
    "gold": "#FFD700",
    "rose": "#E8B4B8",
    "sage": "#9CAF88",
    "lavender": "#B8A9C9",
}

# Initialize html2image
hti = Html2Image(output_path=str(OUTPUT_DIR), size=(800, 400))


def generate_hero_banner(
    title: str,
    subtitle: str,
    cta_text: str = "VER AGORA",
    image_url: str = None,
    gradient_colors: tuple = ("#D4A574", "#8B7355"),
    filename: str = "hero_banner.png"
):
    """Generate a hero banner for the main carousel"""

    bg_image = f'url({image_url})' if image_url else 'none'

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    </head>
    <body style="margin:0; padding:0;">
        <div style="
            width: 800px;
            height: 400px;
            background: linear-gradient(135deg, {gradient_colors[0]} 0%, {gradient_colors[1]} 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
        ">
            <!-- Decorative circles -->
            <div style="
                position: absolute;
                width: 300px;
                height: 300px;
                border-radius: 50%;
                background: rgba(255,255,255,0.1);
                top: -100px;
                right: -50px;
            "></div>
            <div style="
                position: absolute;
                width: 200px;
                height: 200px;
                border-radius: 50%;
                background: rgba(255,255,255,0.08);
                bottom: -80px;
                left: -40px;
            "></div>

            <!-- Content -->
            <div style="
                text-align: center;
                z-index: 10;
                padding: 40px;
            ">
                <h1 style="
                    font-family: 'Playfair Display', serif;
                    font-size: 48px;
                    font-weight: 700;
                    color: white;
                    margin: 0 0 16px 0;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    letter-spacing: 1px;
                ">{title}</h1>
                <p style="
                    font-family: 'Inter', sans-serif;
                    font-size: 18px;
                    color: rgba(255,255,255,0.9);
                    margin: 0 0 32px 0;
                    max-width: 500px;
                ">{subtitle}</p>
                <button style="
                    font-family: 'Inter', sans-serif;
                    font-size: 14px;
                    font-weight: 600;
                    color: {gradient_colors[0]};
                    background: white;
                    border: none;
                    padding: 16px 40px;
                    border-radius: 30px;
                    cursor: pointer;
                    letter-spacing: 2px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                ">{cta_text}</button>
            </div>
        </div>
    </body>
    </html>
    """

    hti.screenshot(html_str=html, save_as=filename)
    print(f"Generated: {OUTPUT_DIR / filename}")
    return str(OUTPUT_DIR / filename)


def generate_promo_banner(
    discount: str,
    title: str,
    subtitle: str = "",
    badge_text: str = "OFERTA ESPECIAL",
    bg_color: str = "#1A1A1A",
    accent_color: str = "#D4A574",
    filename: str = "promo_banner.png"
):
    """Generate a promotional discount banner"""

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    </head>
    <body style="margin:0; padding:0;">
        <div style="
            width: 800px;
            height: 400px;
            background: {bg_color};
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
        ">
            <!-- Diagonal stripes decoration -->
            <div style="
                position: absolute;
                width: 100%;
                height: 100%;
                background: repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 35px,
                    rgba(255,255,255,0.02) 35px,
                    rgba(255,255,255,0.02) 70px
                );
            "></div>

            <!-- Accent circles -->
            <div style="
                position: absolute;
                width: 400px;
                height: 400px;
                border-radius: 50%;
                border: 1px solid {accent_color}20;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            "></div>
            <div style="
                position: absolute;
                width: 500px;
                height: 500px;
                border-radius: 50%;
                border: 1px solid {accent_color}10;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            "></div>

            <!-- Content -->
            <div style="
                text-align: center;
                z-index: 10;
            ">
                <!-- Badge -->
                <div style="
                    display: inline-block;
                    background: {accent_color};
                    color: white;
                    font-family: 'Inter', sans-serif;
                    font-size: 12px;
                    font-weight: 600;
                    padding: 8px 20px;
                    border-radius: 20px;
                    letter-spacing: 2px;
                    margin-bottom: 20px;
                ">{badge_text}</div>

                <!-- Discount -->
                <h1 style="
                    font-family: 'Playfair Display', serif;
                    font-size: 120px;
                    font-weight: 700;
                    color: {accent_color};
                    margin: 0;
                    line-height: 1;
                    text-shadow: 0 4px 20px rgba(212, 165, 116, 0.3);
                ">{discount}</h1>

                <!-- Title -->
                <h2 style="
                    font-family: 'Inter', sans-serif;
                    font-size: 24px;
                    font-weight: 600;
                    color: white;
                    margin: 16px 0 8px 0;
                    letter-spacing: 3px;
                ">{title}</h2>

                <!-- Subtitle -->
                <p style="
                    font-family: 'Inter', sans-serif;
                    font-size: 14px;
                    color: rgba(255,255,255,0.6);
                    margin: 0;
                ">{subtitle}</p>
            </div>
        </div>
    </body>
    </html>
    """

    hti.screenshot(html_str=html, save_as=filename)
    print(f"Generated: {OUTPUT_DIR / filename}")
    return str(OUTPUT_DIR / filename)


def generate_category_card(
    category: str,
    item_count: int,
    icon: str = "👗",
    gradient_colors: tuple = ("#E8D5C4", "#D4A574"),
    filename: str = "category_card.png"
):
    """Generate a category card"""

    hti_small = Html2Image(output_path=str(OUTPUT_DIR), size=(300, 200))

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700&display=swap" rel="stylesheet">
    </head>
    <body style="margin:0; padding:0;">
        <div style="
            width: 300px;
            height: 200px;
            background: linear-gradient(135deg, {gradient_colors[0]} 0%, {gradient_colors[1]} 100%);
            border-radius: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
        ">
            <!-- Decorative element -->
            <div style="
                position: absolute;
                width: 150px;
                height: 150px;
                border-radius: 50%;
                background: rgba(255,255,255,0.15);
                top: -50px;
                right: -30px;
            "></div>

            <!-- Icon -->
            <div style="
                font-size: 48px;
                margin-bottom: 12px;
            ">{icon}</div>

            <!-- Category name -->
            <h3 style="
                font-family: 'Inter', sans-serif;
                font-size: 20px;
                font-weight: 700;
                color: white;
                margin: 0 0 4px 0;
                text-transform: uppercase;
                letter-spacing: 1px;
            ">{category}</h3>

            <!-- Item count -->
            <p style="
                font-family: 'Inter', sans-serif;
                font-size: 14px;
                color: rgba(255,255,255,0.8);
                margin: 0;
            ">{item_count} peças</p>
        </div>
    </body>
    </html>
    """

    hti_small.screenshot(html_str=html, save_as=filename)
    print(f"Generated: {OUTPUT_DIR / filename}")
    return str(OUTPUT_DIR / filename)


def generate_feature_banner(
    icon: str,
    title: str,
    description: str,
    bg_color: str = "#FAF8F5",
    accent_color: str = "#D4A574",
    filename: str = "feature_banner.png"
):
    """Generate a feature/benefit banner"""

    hti_feature = Html2Image(output_path=str(OUTPUT_DIR), size=(400, 300))

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    </head>
    <body style="margin:0; padding:0;">
        <div style="
            width: 400px;
            height: 300px;
            background: {bg_color};
            border-radius: 24px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 32px;
            box-sizing: border-box;
            border: 1px solid rgba(0,0,0,0.05);
        ">
            <!-- Icon circle -->
            <div style="
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, {accent_color}20 0%, {accent_color}40 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 36px;
                margin-bottom: 20px;
            ">{icon}</div>

            <!-- Title -->
            <h3 style="
                font-family: 'Inter', sans-serif;
                font-size: 22px;
                font-weight: 700;
                color: #2D2D2D;
                margin: 0 0 12px 0;
                text-align: center;
            ">{title}</h3>

            <!-- Description -->
            <p style="
                font-family: 'Inter', sans-serif;
                font-size: 15px;
                color: #6B6B6B;
                margin: 0;
                text-align: center;
                line-height: 1.6;
                max-width: 300px;
            ">{description}</p>
        </div>
    </body>
    </html>
    """

    hti_feature.screenshot(html_str=html, save_as=filename)
    print(f"Generated: {OUTPUT_DIR / filename}")
    return str(OUTPUT_DIR / filename)


def generate_cashback_banner(
    percentage: str = "5%",
    title: str = "CASHBACK EM TODAS AS COMPRAS",
    subtitle: str = "Ganhe de volta em cada compra",
    filename: str = "cashback_banner.png"
):
    """Generate a cashback promotional banner"""

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    </head>
    <body style="margin:0; padding:0;">
        <div style="
            width: 800px;
            height: 400px;
            background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: relative;
            overflow: hidden;
            padding: 0 60px;
            box-sizing: border-box;
        ">
            <!-- Decorative coins -->
            <div style="
                position: absolute;
                width: 200px;
                height: 200px;
                border-radius: 50%;
                background: rgba(255,255,255,0.1);
                top: -60px;
                right: 100px;
            "></div>
            <div style="
                position: absolute;
                width: 100px;
                height: 100px;
                border-radius: 50%;
                background: rgba(255,255,255,0.08);
                bottom: 40px;
                right: 200px;
            "></div>

            <!-- Left content -->
            <div style="z-index: 10;">
                <div style="
                    display: inline-block;
                    background: rgba(255,255,255,0.2);
                    color: white;
                    font-family: 'Inter', sans-serif;
                    font-size: 12px;
                    font-weight: 600;
                    padding: 8px 16px;
                    border-radius: 20px;
                    letter-spacing: 1px;
                    margin-bottom: 16px;
                ">💰 CASHBACK</div>

                <h1 style="
                    font-family: 'Inter', sans-serif;
                    font-size: 32px;
                    font-weight: 700;
                    color: white;
                    margin: 0 0 8px 0;
                    letter-spacing: 2px;
                ">{title}</h1>

                <p style="
                    font-family: 'Inter', sans-serif;
                    font-size: 16px;
                    color: rgba(255,255,255,0.8);
                    margin: 0;
                ">{subtitle}</p>
            </div>

            <!-- Right - Percentage -->
            <div style="
                z-index: 10;
                text-align: center;
            ">
                <div style="
                    font-family: 'Playfair Display', serif;
                    font-size: 100px;
                    font-weight: 700;
                    color: white;
                    text-shadow: 0 4px 20px rgba(0,0,0,0.2);
                    line-height: 1;
                ">{percentage}</div>
                <div style="
                    font-family: 'Inter', sans-serif;
                    font-size: 14px;
                    color: rgba(255,255,255,0.8);
                    letter-spacing: 3px;
                    margin-top: 8px;
                ">DE VOLTA</div>
            </div>
        </div>
    </body>
    </html>
    """

    hti.screenshot(html_str=html, save_as=filename)
    print(f"Generated: {OUTPUT_DIR / filename}")
    return str(OUTPUT_DIR / filename)


def generate_brand_highlight(
    brand_name: str,
    tagline: str = "Peças selecionadas",
    logo_url: str = None,
    bg_color: str = "#FFFFFF",
    text_color: str = "#2D2D2D",
    filename: str = "brand_highlight.png"
):
    """Generate a brand highlight card"""

    hti_brand = Html2Image(output_path=str(OUTPUT_DIR), size=(350, 200))

    logo_html = f'<img src="{logo_url}" style="width: 60px; height: 60px; object-fit: contain; margin-bottom: 16px;" />' if logo_url else f'''
        <div style="
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #D4A574 0%, #8B7355 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 16px;
            font-family: 'Inter', sans-serif;
            font-size: 24px;
            font-weight: 700;
            color: white;
        ">{brand_name[0]}</div>
    '''

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    </head>
    <body style="margin:0; padding:0;">
        <div style="
            width: 350px;
            height: 200px;
            background: {bg_color};
            border-radius: 16px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border: 1px solid rgba(0,0,0,0.08);
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        ">
            {logo_html}

            <h3 style="
                font-family: 'Inter', sans-serif;
                font-size: 20px;
                font-weight: 700;
                color: {text_color};
                margin: 0 0 4px 0;
            ">{brand_name}</h3>

            <p style="
                font-family: 'Inter', sans-serif;
                font-size: 13px;
                color: #6B6B6B;
                margin: 0;
            ">{tagline}</p>
        </div>
    </body>
    </html>
    """

    hti_brand.screenshot(html_str=html, save_as=filename)
    print(f"Generated: {OUTPUT_DIR / filename}")
    return str(OUTPUT_DIR / filename)


def generate_sustainability_banner(
    stat_number: str = "500+",
    stat_label: str = "peças reutilizadas",
    title: str = "Moda Sustentável",
    subtitle: str = "Cada peça comprada é uma escolha consciente",
    filename: str = "sustainability_banner.png"
):
    """Generate a sustainability/impact banner"""

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    </head>
    <body style="margin:0; padding:0;">
        <div style="
            width: 800px;
            height: 400px;
            background: linear-gradient(135deg, #9CAF88 0%, #6B8E5C 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
        ">
            <!-- Leaf decorations -->
            <div style="
                position: absolute;
                font-size: 120px;
                opacity: 0.1;
                top: 20px;
                left: 40px;
                transform: rotate(-15deg);
            ">🌿</div>
            <div style="
                position: absolute;
                font-size: 80px;
                opacity: 0.1;
                bottom: 30px;
                right: 60px;
                transform: rotate(15deg);
            ">🌱</div>

            <!-- Content -->
            <div style="
                text-align: center;
                z-index: 10;
                padding: 40px;
            ">
                <!-- Stat circle -->
                <div style="
                    width: 140px;
                    height: 140px;
                    background: rgba(255,255,255,0.2);
                    border-radius: 50%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 24px auto;
                    border: 2px solid rgba(255,255,255,0.3);
                ">
                    <span style="
                        font-family: 'Playfair Display', serif;
                        font-size: 42px;
                        font-weight: 600;
                        color: white;
                    ">{stat_number}</span>
                    <span style="
                        font-family: 'Inter', sans-serif;
                        font-size: 12px;
                        color: rgba(255,255,255,0.8);
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    ">{stat_label}</span>
                </div>

                <h1 style="
                    font-family: 'Playfair Display', serif;
                    font-size: 40px;
                    font-weight: 600;
                    color: white;
                    margin: 0 0 12px 0;
                ">{title}</h1>

                <p style="
                    font-family: 'Inter', sans-serif;
                    font-size: 16px;
                    color: rgba(255,255,255,0.9);
                    margin: 0;
                    max-width: 400px;
                ">{subtitle}</p>
            </div>
        </div>
    </body>
    </html>
    """

    hti.screenshot(html_str=html, save_as=filename)
    print(f"Generated: {OUTPUT_DIR / filename}")
    return str(OUTPUT_DIR / filename)


def generate_all_banners():
    """Generate all banners for the app"""

    print("=" * 50)
    print("[*] APEGA DESAPEGA - Banner Generator")
    print("=" * 50)

    # Hero banners
    print("\n[+] Generating Hero Banners...")
    generate_hero_banner(
        title="Moda Circular",
        subtitle="Renove seu guarda-roupa com peças únicas e sustentáveis",
        cta_text="EXPLORAR",
        gradient_colors=("#D4A574", "#8B7355"),
        filename="hero_moda_circular.png"
    )

    generate_hero_banner(
        title="Novidades da Semana",
        subtitle="Descubra as peças mais desejadas que acabaram de chegar",
        cta_text="VER NOVIDADES",
        gradient_colors=("#B8A9C9", "#8E7BA8"),
        filename="hero_novidades.png"
    )

    generate_hero_banner(
        title="Peças Premium",
        subtitle="Seleção especial de marcas renomadas com até 70% off",
        cta_text="CONFERIR",
        gradient_colors=("#1A1A1A", "#3D3D3D"),
        filename="hero_premium.png"
    )

    # Promo banners
    print("\n[+] Generating Promo Banners...")
    generate_promo_banner(
        discount="50%",
        title="BLACK FRIDAY",
        subtitle="Em peças selecionadas",
        badge_text="OFERTA LIMITADA",
        filename="promo_black_friday.png"
    )

    generate_promo_banner(
        discount="30%",
        title="PRIMEIRA COMPRA",
        subtitle="Use o cupom BEMVINDA",
        badge_text="EXCLUSIVO",
        accent_color="#E8B4B8",
        filename="promo_primeira_compra.png"
    )

    # Cashback banner
    print("\n[+] Generating Cashback Banner...")
    generate_cashback_banner()

    # Category cards
    print("\n[+] Generating Category Cards...")
    categories = [
        ("Vestidos", 234, "👗", ("#E8D5C4", "#D4A574")),
        ("Blusas", 456, "👚", ("#E8B4B8", "#D4A574")),
        ("Calças", 189, "👖", ("#B8A9C9", "#8E7BA8")),
        ("Bolsas", 127, "👜", ("#9CAF88", "#6B8E5C")),
        ("Sapatos", 298, "👠", ("#F5D0C5", "#E8B4B8")),
        ("Acessórios", 167, "💍", ("#FFE4B5", "#D4A574")),
    ]

    for cat, count, icon, colors in categories:
        generate_category_card(
            category=cat,
            item_count=count,
            icon=icon,
            gradient_colors=colors,
            filename=f"category_{cat.lower()}.png"
        )

    # Feature banners
    print("\n[+] Generating Feature Banners...")
    features = [
        ("🔒", "Compra Segura", "Pagamento protegido e garantia de entrega"),
        ("🚚", "Frete Grátis", "Em compras acima de R$ 150"),
        ("💚", "Sustentável", "Moda consciente que faz a diferença"),
        ("✨", "Curadoria Premium", "Peças selecionadas com qualidade garantida"),
    ]

    for i, (icon, title, desc) in enumerate(features):
        generate_feature_banner(
            icon=icon,
            title=title,
            description=desc,
            filename=f"feature_{i+1}.png"
        )

    # Brand highlights
    print("\n[+] Generating Brand Highlights...")
    brands = ["Farm", "Zara", "Amaro", "Animale", "Le Lis"]
    for brand in brands:
        generate_brand_highlight(
            brand_name=brand,
            tagline="Peças selecionadas",
            filename=f"brand_{brand.lower()}.png"
        )

    # Sustainability banner
    print("\n[+] Generating Sustainability Banner...")
    generate_sustainability_banner()

    print("\n" + "=" * 50)
    print("[OK] All banners generated successfully!")
    print(f"[>] Output folder: {OUTPUT_DIR}")
    print("=" * 50)


if __name__ == "__main__":
    generate_all_banners()
