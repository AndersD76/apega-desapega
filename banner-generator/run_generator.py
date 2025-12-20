"""
Quick script to install dependencies and run all banner generators
"""

import subprocess
import sys
import os

def install_dependencies():
    """Install required packages"""
    print("📦 Installing dependencies...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "html2image", "Pillow"])
    print("✅ Dependencies installed!")

def main():
    # Change to script directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    # Install dependencies
    install_dependencies()

    # Import and run generators
    print("\n" + "=" * 60)
    print("🎨 APEGA DESAPEGA - Professional Banner Generator")
    print("=" * 60)

    from banner_generator import generate_all_banners
    from advanced_templates import generate_advanced_banners

    generate_all_banners()
    print("\n")
    generate_advanced_banners()

    print("\n" + "=" * 60)
    print("🎉 ALL BANNERS GENERATED SUCCESSFULLY!")
    print("=" * 60)
    print("\n📁 Check the 'output' folder for your banners")
    print("💡 You can customize colors and text in the Python files")
    print("\n")

if __name__ == "__main__":
    main()
