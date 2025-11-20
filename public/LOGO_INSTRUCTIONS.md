# Logo Setup Instructions

## Required File

Save the My Future Capacity logo as:
- **Location:** `public/mfc-logo.png`
- **Format:** PNG with transparent background
- **Recommended Size:** 400x400px (or similar square aspect ratio)
- **File Name:** `mfc-logo.png` (exactly)

## Logo Details

The logo features:
- "PATHWAYS TO SUCCESS" text in purple curve at top
- Colorful circles (orange, blue, purple, green)
- Three stylized people figures in orange, green, and blue
- "MY FUTURE CAPACITY" text in green at bottom

## Where the Logo Appears

1. **Email Header**
   - Size: 200px wide (auto height)
   - Location: Top of confirmation email
   - URL: `https://frolicking-horse-f44773.netlify.app/mfc-logo.png`

2. **PDF Header**  
   - Size: 60px height (auto width)
   - Location: Top left of PDF document
   - Positioned next to "MY FUTURE CAPACITY" text

## Setup Steps

1. Save the logo PNG file to this directory
2. Name it exactly: `mfc-logo.png`
3. Commit and push to GitHub
4. Netlify will automatically deploy it

## Testing

After deployment, verify:
- Email: Logo appears at top of confirmation email
- PDF: Logo appears in blue header bar next to company name
- URL: `https://[your-site].netlify.app/mfc-logo.png` loads

## Fallback Behavior

If logo file is missing:
- PDF: Uses text-only header (current behavior)
- Email: Will show broken image icon (fix: add logo file)
