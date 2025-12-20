"""
Advanced Banner Templates for Apega Desapega
More sophisticated designs for special campaigns
"""

from html2image import Html2Image
from pathlib import Path

OUTPUT_DIR = Path(__file__).parent / "output"
OUTPUT_DIR.mkdir(exist_ok=True)


def generate_product_showcase(
    product_name: str,
    brand: str,
    original_price: str,
    sale_price: str,
    discount_percent: str,
    image_url: str = None,
    filename: str = "product_showcase.png"
):
    """Generate a product showcase banner with before/after pricing"""

    hti = Html2Image(output_path=str(OUTPUT_DIR), size=(800, 500))

    product_img = f'<img src="{image_url}" style="width: 100%; height: 100%; object-fit: cover;" />' if image_url else '''
        <div style="
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #E8D5C4 0%, #D4A574 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 80px;
        ">👗</div>
    '''

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    </head>
    <body style="margin:0; padding:0;">
        <div style="
            width: 800px;
            height: 500px;
            background: #FFFFFF;
            display: flex;
            position: relative;
            overflow: hidden;
        ">
            <!-- Left side - Product image -->
            <div style="
                width: 50%;
                height: 100%;
                position: relative;
            ">
                {product_img}
                <!-- Discount badge -->
                <div style="
                    position: absolute;
                    top: 20px;
                    left: 20px;
                    background: #E53935;
                    color: white;
                    font-family: 'Inter', sans-serif;
                    font-size: 18px;
                    font-weight: 700;
                    padding: 12px 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 15px rgba(229, 57, 53, 0.4);
                ">-{discount_percent}</div>
            </div>

            <!-- Right side - Info -->
            <div style="
                width: 50%;
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: center;
                padding: 40px;
                box-sizing: border-box;
                background: linear-gradient(180deg, #FAF8F5 0%, #FFFFFF 100%);
            ">
                <!-- Brand -->
                <div style="
                    font-family: 'Inter', sans-serif;
                    font-size: 12px;
                    font-weight: 600;
                    color: #D4A574;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    margin-bottom: 8px;
                ">{brand}</div>

                <!-- Product name -->
                <h2 style="
                    font-family: 'Playfair Display', serif;
                    font-size: 32px;
                    font-weight: 600;
                    color: #2D2D2D;
                    margin: 0 0 24px 0;
                    line-height: 1.3;
                ">{product_name}</h2>

                <!-- Pricing -->
                <div style="margin-bottom: 32px;">
                    <div style="
                        font-family: 'Inter', sans-serif;
                        font-size: 16px;
                        color: #999;
                        text-decoration: line-through;
                        margin-bottom: 4px;
                    ">{original_price}</div>
                    <div style="
                        font-family: 'Playfair Display', serif;
                        font-size: 42px;
                        font-weight: 700;
                        color: #D4A574;
                    ">{sale_price}</div>
                </div>

                <!-- CTA Button -->
                <button style="
                    font-family: 'Inter', sans-serif;
                    font-size: 14px;
                    font-weight: 600;
                    color: white;
                    background: linear-gradient(135deg, #D4A574 0%, #C49660 100%);
                    border: none;
                    padding: 18px 40px;
                    border-radius: 30px;
                    cursor: pointer;
                    letter-spacing: 2px;
                    box-shadow: 0 4px 20px rgba(212, 165, 116, 0.4);
                    align-self: flex-start;
                ">COMPRAR AGORA</button>

                <!-- Trust badges -->
                <div style="
                    display: flex;
                    gap: 24px;
                    margin-top: 32px;
                ">
                    <div style="
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        font-family: 'Inter', sans-serif;
                        font-size: 12px;
                        color: #6B6B6B;
                    ">
                        <span style="font-size: 16px;">✓</span> Autenticidade verificada
                    </div>
                    <div style="
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        font-family: 'Inter', sans-serif;
                        font-size: 12px;
                        color: #6B6B6B;
                    ">
                        <span style="font-size: 16px;">🚚</span> Frete grátis
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    """

    hti.screenshot(html_str=html, save_as=filename)
    print(f"Generated: {OUTPUT_DIR / filename}")
    return str(OUTPUT_DIR / filename)


def generate_testimonial_banner(
    quote: str,
    author_name: str,
    author_location: str = "São Paulo, SP",
    rating: int = 5,
    avatar_url: str = None,
    filename: str = "testimonial.png"
):
    """Generate a customer testimonial banner"""

    hti = Html2Image(output_path=str(OUTPUT_DIR), size=(800, 350))

    stars = "⭐" * rating

    avatar = f'<img src="{avatar_url}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />' if avatar_url else f'''
        <div style="
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #D4A574 0%, #8B7355 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Inter', sans-serif;
            font-size: 28px;
            font-weight: 700;
            color: white;
        ">{author_name[0]}</div>
    '''

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    </head>
    <body style="margin:0; padding:0;">
        <div style="
            width: 800px;
            height: 350px;
            background: linear-gradient(135deg, #FAF8F5 0%, #FFFFFF 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            padding: 40px;
            box-sizing: border-box;
        ">
            <!-- Quote marks decoration -->
            <div style="
                position: absolute;
                top: 30px;
                left: 50px;
                font-family: 'Playfair Display', serif;
                font-size: 120px;
                color: #D4A574;
                opacity: 0.15;
                line-height: 1;
            ">"</div>

            <!-- Content -->
            <div style="
                text-align: center;
                z-index: 10;
                max-width: 600px;
            ">
                <!-- Stars -->
                <div style="
                    font-size: 24px;
                    margin-bottom: 20px;
                ">{stars}</div>

                <!-- Quote -->
                <p style="
                    font-family: 'Playfair Display', serif;
                    font-size: 24px;
                    font-style: italic;
                    color: #2D2D2D;
                    margin: 0 0 30px 0;
                    line-height: 1.6;
                ">"{quote}"</p>

                <!-- Author -->
                <div style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 16px;
                ">
                    <!-- Avatar -->
                    <div style="
                        width: 56px;
                        height: 56px;
                        border-radius: 50%;
                        overflow: hidden;
                        border: 3px solid #D4A574;
                    ">
                        {avatar}
                    </div>

                    <!-- Info -->
                    <div style="text-align: left;">
                        <div style="
                            font-family: 'Inter', sans-serif;
                            font-size: 16px;
                            font-weight: 600;
                            color: #2D2D2D;
                        ">{author_name}</div>
                        <div style="
                            font-family: 'Inter', sans-serif;
                            font-size: 13px;
                            color: #6B6B6B;
                        ">{author_location}</div>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    """

    hti.screenshot(html_str=html, save_as=filename)
    print(f"Generated: {OUTPUT_DIR / filename}")
    return str(OUTPUT_DIR / filename)


def generate_collection_banner(
    collection_name: str,
    item_count: int,
    description: str,
    gradient_colors: tuple = ("#2D2D2D", "#4A4A4A"),
    accent_color: str = "#D4A574",
    filename: str = "collection.png"
):
    """Generate a collection showcase banner"""

    hti = Html2Image(output_path=str(OUTPUT_DIR), size=(800, 400))

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
            <!-- Grid pattern -->
            <div style="
                position: absolute;
                width: 100%;
                height: 100%;
                background-image:
                    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
                background-size: 40px 40px;
            "></div>

            <!-- Accent line -->
            <div style="
                position: absolute;
                width: 200px;
                height: 4px;
                background: {accent_color};
                top: 80px;
                left: 80px;
            "></div>

            <!-- Content -->
            <div style="
                z-index: 10;
                padding: 60px 80px;
                width: 100%;
                box-sizing: border-box;
            ">
                <!-- Label -->
                <div style="
                    font-family: 'Inter', sans-serif;
                    font-size: 12px;
                    font-weight: 600;
                    color: {accent_color};
                    letter-spacing: 3px;
                    text-transform: uppercase;
                    margin-bottom: 16px;
                ">COLEÇÃO EXCLUSIVA</div>

                <!-- Collection name -->
                <h1 style="
                    font-family: 'Playfair Display', serif;
                    font-size: 56px;
                    font-weight: 700;
                    color: white;
                    margin: 0 0 16px 0;
                    letter-spacing: 2px;
                ">{collection_name}</h1>

                <!-- Description -->
                <p style="
                    font-family: 'Inter', sans-serif;
                    font-size: 16px;
                    color: rgba(255,255,255,0.7);
                    margin: 0 0 32px 0;
                    max-width: 500px;
                    line-height: 1.6;
                ">{description}</p>

                <!-- Footer -->
                <div style="
                    display: flex;
                    align-items: center;
                    gap: 32px;
                ">
                    <button style="
                        font-family: 'Inter', sans-serif;
                        font-size: 13px;
                        font-weight: 600;
                        color: {gradient_colors[0]};
                        background: white;
                        border: none;
                        padding: 16px 36px;
                        border-radius: 4px;
                        cursor: pointer;
                        letter-spacing: 2px;
                    ">VER COLEÇÃO</button>

                    <div style="
                        font-family: 'Inter', sans-serif;
                        font-size: 14px;
                        color: rgba(255,255,255,0.6);
                    ">{item_count} peças disponíveis</div>
                </div>
            </div>
        </div>
    </body>
    </html>
    """

    hti.screenshot(html_str=html, save_as=filename)
    print(f"Generated: {OUTPUT_DIR / filename}")
    return str(OUTPUT_DIR / filename)


def generate_flash_sale_banner(
    hours: int = 12,
    minutes: int = 34,
    seconds: int = 56,
    discount: str = "ATÉ 70% OFF",
    filename: str = "flash_sale.png"
):
    """Generate a flash sale countdown banner"""

    hti = Html2Image(output_path=str(OUTPUT_DIR), size=(800, 300))

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
    </head>
    <body style="margin:0; padding:0;">
        <div style="
            width: 800px;
            height: 300px;
            background: linear-gradient(135deg, #E53935 0%, #C62828 100%);
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: relative;
            overflow: hidden;
            padding: 0 60px;
            box-sizing: border-box;
        ">
            <!-- Flash decoration -->
            <div style="
                position: absolute;
                font-size: 200px;
                opacity: 0.1;
                right: -20px;
                top: 50%;
                transform: translateY(-50%);
            ">⚡</div>

            <!-- Left content -->
            <div style="z-index: 10;">
                <div style="
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(255,255,255,0.2);
                    padding: 8px 16px;
                    border-radius: 20px;
                    margin-bottom: 16px;
                ">
                    <span style="font-size: 16px;">⚡</span>
                    <span style="
                        font-family: 'Inter', sans-serif;
                        font-size: 12px;
                        font-weight: 700;
                        color: white;
                        letter-spacing: 2px;
                    ">FLASH SALE</span>
                </div>

                <h1 style="
                    font-family: 'Inter', sans-serif;
                    font-size: 48px;
                    font-weight: 800;
                    color: white;
                    margin: 0;
                    letter-spacing: 2px;
                ">{discount}</h1>
            </div>

            <!-- Countdown -->
            <div style="
                display: flex;
                gap: 16px;
                z-index: 10;
            ">
                <div style="text-align: center;">
                    <div style="
                        font-family: 'Inter', sans-serif;
                        font-size: 48px;
                        font-weight: 800;
                        color: white;
                        background: rgba(0,0,0,0.2);
                        padding: 16px 24px;
                        border-radius: 12px;
                        min-width: 60px;
                    ">{hours:02d}</div>
                    <div style="
                        font-family: 'Inter', sans-serif;
                        font-size: 11px;
                        color: rgba(255,255,255,0.8);
                        margin-top: 8px;
                        letter-spacing: 1px;
                    ">HORAS</div>
                </div>
                <div style="
                    font-size: 48px;
                    color: white;
                    padding-top: 16px;
                ">:</div>
                <div style="text-align: center;">
                    <div style="
                        font-family: 'Inter', sans-serif;
                        font-size: 48px;
                        font-weight: 800;
                        color: white;
                        background: rgba(0,0,0,0.2);
                        padding: 16px 24px;
                        border-radius: 12px;
                        min-width: 60px;
                    ">{minutes:02d}</div>
                    <div style="
                        font-family: 'Inter', sans-serif;
                        font-size: 11px;
                        color: rgba(255,255,255,0.8);
                        margin-top: 8px;
                        letter-spacing: 1px;
                    ">MIN</div>
                </div>
                <div style="
                    font-size: 48px;
                    color: white;
                    padding-top: 16px;
                ">:</div>
                <div style="text-align: center;">
                    <div style="
                        font-family: 'Inter', sans-serif;
                        font-size: 48px;
                        font-weight: 800;
                        color: white;
                        background: rgba(0,0,0,0.2);
                        padding: 16px 24px;
                        border-radius: 12px;
                        min-width: 60px;
                    ">{seconds:02d}</div>
                    <div style="
                        font-family: 'Inter', sans-serif;
                        font-size: 11px;
                        color: rgba(255,255,255,0.8);
                        margin-top: 8px;
                        letter-spacing: 1px;
                    ">SEG</div>
                </div>
            </div>
        </div>
    </body>
    </html>
    """

    hti.screenshot(html_str=html, save_as=filename)
    print(f"Generated: {OUTPUT_DIR / filename}")
    return str(OUTPUT_DIR / filename)


def generate_seller_spotlight(
    seller_name: str,
    rating: float = 4.9,
    sales_count: int = 234,
    items_count: int = 45,
    avatar_url: str = None,
    filename: str = "seller_spotlight.png"
):
    """Generate a seller spotlight banner"""

    hti = Html2Image(output_path=str(OUTPUT_DIR), size=(800, 350))

    avatar = f'<img src="{avatar_url}" style="width: 100%; height: 100%; object-fit: cover;" />' if avatar_url else f'''
        <div style="
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #D4A574 0%, #8B7355 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Inter', sans-serif;
            font-size: 48px;
            font-weight: 700;
            color: white;
        ">{seller_name[0]}</div>
    '''

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    </head>
    <body style="margin:0; padding:0;">
        <div style="
            width: 800px;
            height: 350px;
            background: linear-gradient(135deg, #FAF8F5 0%, #F0EBE3 100%);
            display: flex;
            align-items: center;
            padding: 50px 60px;
            box-sizing: border-box;
            position: relative;
        ">
            <!-- Decorative -->
            <div style="
                position: absolute;
                width: 200px;
                height: 200px;
                border-radius: 50%;
                background: rgba(212, 165, 116, 0.1);
                top: -50px;
                right: 100px;
            "></div>

            <!-- Avatar -->
            <div style="
                width: 140px;
                height: 140px;
                border-radius: 50%;
                overflow: hidden;
                border: 4px solid #D4A574;
                margin-right: 40px;
                flex-shrink: 0;
            ">
                {avatar}
            </div>

            <!-- Info -->
            <div style="flex: 1; z-index: 10;">
                <div style="
                    font-family: 'Inter', sans-serif;
                    font-size: 12px;
                    font-weight: 600;
                    color: #D4A574;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    margin-bottom: 8px;
                ">VENDEDORA DESTAQUE</div>

                <h2 style="
                    font-family: 'Playfair Display', serif;
                    font-size: 36px;
                    font-weight: 600;
                    color: #2D2D2D;
                    margin: 0 0 16px 0;
                ">{seller_name}</h2>

                <!-- Stats -->
                <div style="
                    display: flex;
                    gap: 40px;
                    margin-bottom: 24px;
                ">
                    <div>
                        <div style="
                            display: flex;
                            align-items: center;
                            gap: 4px;
                        ">
                            <span style="font-size: 18px;">⭐</span>
                            <span style="
                                font-family: 'Inter', sans-serif;
                                font-size: 24px;
                                font-weight: 700;
                                color: #2D2D2D;
                            ">{rating}</span>
                        </div>
                        <div style="
                            font-family: 'Inter', sans-serif;
                            font-size: 12px;
                            color: #6B6B6B;
                        ">avaliação</div>
                    </div>
                    <div>
                        <div style="
                            font-family: 'Inter', sans-serif;
                            font-size: 24px;
                            font-weight: 700;
                            color: #2D2D2D;
                        ">{sales_count}</div>
                        <div style="
                            font-family: 'Inter', sans-serif;
                            font-size: 12px;
                            color: #6B6B6B;
                        ">vendas</div>
                    </div>
                    <div>
                        <div style="
                            font-family: 'Inter', sans-serif;
                            font-size: 24px;
                            font-weight: 700;
                            color: #2D2D2D;
                        ">{items_count}</div>
                        <div style="
                            font-family: 'Inter', sans-serif;
                            font-size: 12px;
                            color: #6B6B6B;
                        ">peças</div>
                    </div>
                </div>

                <button style="
                    font-family: 'Inter', sans-serif;
                    font-size: 13px;
                    font-weight: 600;
                    color: white;
                    background: #D4A574;
                    border: none;
                    padding: 14px 32px;
                    border-radius: 25px;
                    cursor: pointer;
                    letter-spacing: 1px;
                ">VER LOJA</button>
            </div>
        </div>
    </body>
    </html>
    """

    hti.screenshot(html_str=html, save_as=filename)
    print(f"Generated: {OUTPUT_DIR / filename}")
    return str(OUTPUT_DIR / filename)


def generate_advanced_banners():
    """Generate all advanced banners"""

    print("=" * 50)
    print("[*] Advanced Banner Templates")
    print("=" * 50)

    # Product showcase
    print("\n[+] Generating Product Showcase...")
    generate_product_showcase(
        product_name="Vestido Midi Floral Farm",
        brand="FARM",
        original_price="R$ 489,00",
        sale_price="R$ 195,00",
        discount_percent="60%",
        filename="product_showcase_farm.png"
    )

    # Testimonials
    print("\n[+] Generating Testimonials...")
    testimonials = [
        ("Encontrei peças incríveis que não acharia em nenhuma loja! A qualidade é surpreendente.", "Marina Silva", "São Paulo, SP"),
        ("Vendi minhas roupas que não usava mais e ainda comprei novidades. Amo essa plataforma!", "Ana Carolina", "Rio de Janeiro, RJ"),
        ("Atendimento impecável e peças lindas. Virei cliente fiel!", "Juliana Santos", "Belo Horizonte, MG"),
    ]

    for i, (quote, name, location) in enumerate(testimonials):
        generate_testimonial_banner(
            quote=quote,
            author_name=name,
            author_location=location,
            filename=f"testimonial_{i+1}.png"
        )

    # Collections
    print("\n[+] Generating Collection Banners...")
    collections = [
        ("Inverno 2024", 89, "Peças quentinhas e estilosas para os dias mais frios", ("#2D2D2D", "#4A4A4A")),
        ("Vintage Lovers", 156, "Clássicos atemporais com história e personalidade", ("#8B4513", "#A0522D")),
        ("Festa", 67, "Looks perfeitos para ocasiões especiais", ("#1A1A2E", "#16213E")),
    ]

    for name, count, desc, colors in collections:
        generate_collection_banner(
            collection_name=name,
            item_count=count,
            description=desc,
            gradient_colors=colors,
            filename=f"collection_{name.lower().replace(' ', '_')}.png"
        )

    # Flash sale
    print("\n[+] Generating Flash Sale Banner...")
    generate_flash_sale_banner()

    # Seller spotlight
    print("\n[+] Generating Seller Spotlight...")
    generate_seller_spotlight(
        seller_name="Closet da Lú",
        rating=4.9,
        sales_count=456,
        items_count=89
    )

    print("\n" + "=" * 50)
    print("[OK] Advanced banners generated!")
    print(f"[>] Output folder: {OUTPUT_DIR}")
    print("=" * 50)


if __name__ == "__main__":
    generate_advanced_banners()
