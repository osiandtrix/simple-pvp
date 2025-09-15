# Electron App Icons

This directory contains the app icons for different platforms.

## Required Files

### Windows
- `icon.ico` - Windows app icon (contains multiple sizes: 16x16, 32x32, 48x48, 256x256)
- `icon.png` - Fallback PNG icon (512x512 recommended)

### macOS (if you plan to support Mac)
- `icon.icns` - macOS app icon (contains multiple sizes)

### Linux (if you plan to support Linux)
- `icon.png` - Linux app icon (512x512 recommended)

## How to Create Icons from Your PNG

1. **For Windows (.ico):**
   - Use online converters like favicon.io or convertio.co
   - Upload your 500x500 PNG
   - Download the .ico file with multiple sizes

2. **For macOS (.icns):**
   - Use online converters or macOS tools
   - Upload your 500x500 PNG
   - Download the .icns file

3. **For Linux (.png):**
   - Just use your original PNG file (rename to icon.png)

## Current Setup

Place your icon files here and electron-builder will automatically use them:
- `assets/icon.ico` (Windows)
- `assets/icon.icns` (macOS) 
- `assets/icon.png` (Linux/fallback)
