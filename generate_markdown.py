import os
import re
from urllib.parse import urljoin

BASE_URL = "http://siligurijss.org/"
OUTPUT_DIR = "scraped_site"

PAGES = [
    "index.html", "profile.html", "preface.html", "members.html",
    "governing-body.html", "social-activity.html", "future-plan.html",
    "glimpses.html", "press.html", "donation.html", "durgapuja.html",
    "contact-us.html", "sports.html", "library.html", "health-check-ups.html",
    "durga-puja-glimpses.html",
]

PAGE_TITLES = {
    "index.html": "Home",
    "profile.html": "Club Profile",
    "preface.html": "Preface",
    "members.html": "Members",
    "governing-body.html": "Committee (Governing Body)",
    "social-activity.html": "Social Activities",
    "future-plan.html": "Future Plan",
    "glimpses.html": "Glimpses (Photo Gallery)",
    "press.html": "Press",
    "donation.html": "Donation",
    "durgapuja.html": "Durga Puja",
    "contact-us.html": "Contact Us",
    "sports.html": "Sports",
    "library.html": "Library",
    "health-check-ups.html": "Health Check-ups",
    "durga-puja-glimpses.html": "Durga Puja Glimpses (Photo Gallery)",
}

def extract_text(page_name, html):
    title = PAGE_TITLES.get(page_name, page_name.replace(".html", "").replace("-", " ").title())
    lines = [f"# {title}", "", f"Source: {urljoin(BASE_URL, page_name)}", ""]

    # Extract the editable content region
    content_match = re.search(r'<!-- InstanceBeginEditable name="content" -->(.*?)<!-- InstanceEndEditable -->', html, re.DOTALL)
    text = content_match.group(1) if content_match else re.sub(r'.*<body[^>]*>(.*)</body>.*', r'\1', html, flags=re.DOTALL)

    # Remove scripts and styles
    text = re.sub(r'<script[^>]*>.*?</script>', '', text, flags=re.DOTALL)
    text = re.sub(r'<style[^>]*>.*?</style>', '', text, flags=re.DOTALL)

    # Remove HTML tags
    text = re.sub(r'<br\s*/?>', '\n', text)
    text = re.sub(r'<p[^>]*>', '\n', text)
    text = re.sub(r'</p>', '\n', text)
    text = re.sub(r'<li[^>]*>', '\n- ', text)
    text = re.sub(r'</li>', '', text)
    text = re.sub(r'<ul[^>]*>', '\n', text)
    text = re.sub(r'</ul>', '', text)
    text = re.sub(r'<tr[^>]*>', '\n', text)
    text = re.sub(r'<td[^>]*>', ' | ', text)
    text = re.sub(r'</td>', '', text)
    text = re.sub(r'</tr>', '', text)
    text = re.sub(r'<[^>]+>', ' ', text)

    # HTML entities
    replacements = [
        ("&nbsp;", " "), ("&amp;", "&"), ("&lt;", "<"), ("&gt;", ">"),
        ("&quot;", '"'), ("&rsquo;", "'"), ("&lsquo;", "'"), ("&ndash;", "-"),
        ("&mdash;", "—"), ("&hellip;", "..."), ("&amp;", "&"),
        ("&raquo;", ">>"), ("&laquo;", "<<"), ("&deg;", "°"),
    ]
    for old, new in replacements:
        text = text.replace(old, new)

    # Clean up whitespace
    text = re.sub(r' +\n', '\n', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r' \| ', ' | ', text)
    text = re.sub(r'\| +', '| ', text)
    text = text.strip()

    lines.append(text)
    return "\n".join(lines)


print("=== Generating markdown content files ===")
md_dir = os.path.join(OUTPUT_DIR, "content")
os.makedirs(md_dir, exist_ok=True)

for page in PAGES:
    html_path = os.path.join(OUTPUT_DIR, "html", page)
    if not os.path.exists(html_path):
        print(f"  [SKIP] HTML not found: {page}")
        continue
    with open(html_path, "r", encoding="utf-8", errors="ignore") as f:
        html = f.read()
    md = extract_text(page, html)
    md_path = os.path.join(md_dir, page.replace(".html", ".md"))
    with open(md_path, "w", encoding="utf-8") as f:
        f.write(md)
    print(f"  [OK] {page.replace('.html', '.md')}")

print("\n=== Generating index/summary file ===")
summary_path = os.path.join(OUTPUT_DIR, "README.md")
with open(summary_path, "w", encoding="utf-8") as f:
    f.write("# Siliguri Jatiya Shakti Sangha - Scraped Website Content\n\n")
    f.write(f"Source: {BASE_URL}\n\n")
    f.write("## Pages\n\n")
    for page in PAGES:
        title = PAGE_TITLES.get(page, page)
        md_file = page.replace(".html", ".md")
        f.write(f"- [{title}](content/{md_file})\n")
    f.write("\n## Assets\n\n")
    f.write("- HTML files: `html/`\n")
    f.write("- Images: `images/`\n")
    f.write("- Photo Gallery: `photogallery/`\n")
    f.write("- CSS: `scripts/style.css`\n")
    f.write("- Membership Form: `membership-form.pdf`\n")
    f.write("- JavaScript: `scripts/`, `fancybox/`\n")

print(f"\n=== DONE ===")
print(f"Markdown files: {md_dir}/")
print(f"Summary: {summary_path}")
