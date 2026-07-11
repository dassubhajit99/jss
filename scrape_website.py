import os
import re
import urllib.request
import urllib.error
from urllib.parse import urljoin, urlparse
import time

BASE_URL = "http://siligurijss.org/"
OUTPUT_DIR = "scraped_site"

PAGES = [
    "index.html", "profile.html", "preface.html", "members.html",
    "governing-body.html", "social-activity.html", "future-plan.html",
    "glimpses.html", "press.html", "donation.html", "durgapuja.html",
    "contact-us.html", "sports.html", "library.html", "health-check-ups.html",
    "durga-puja-glimpses.html",
]

# ASSETS to download (collected from all pages)
ASSETS = [
    "images/slice_01.jpg", "images/slice_02.jpg", "images/slice_03.jpg",
    "images/slice_06.jpg", "images/slice_08.jpg", "images/bg_09.jpg",
    "images/award-14-1.jpg", "images/award-14-2.jpg", "images/award-14-3.jpg",
    "images/award-14-4.jpg", "images/home-ban1.gif", "images/home-pic1.jpg",
    "images/durga-ban.gif", "images/more1.gif", "images/home-pic2.jpg",
    "images/sports.gif", "images/more2.gif", "images/homepic3.jpg",
    "images/social.gif", "images/home-pic4.jpg", "images/health.gif",
    "images/home-pic5.jpg", "images/lib.gif", "images/help-ban.jpg",
    "images/member1.jpg", "images/profile.gif", "images/preface-ban.gif",
    "images/members.gif", "images/g-body.gif", "images/social-activity.gif",
    "images/plantation.jpg", "images/future-plan.gif", "images/p-corner.gif",
    "images/donate.gif", "images/contact-btn.gif", "images/add-ban.gif",
    "images/soprts.gif", "images/lib-ban.gif", "images/check-ups.gif",
    "images/cultural.gif", "images/puja09.jpg", "images/dp8.gif", "images/dp7.gif",
    "images/panel-theme.jpg", "images/bul1.jpg",
    "scripts/style.css", "scripts/contact.php", "scripts/jquery.js",
    "fancybox/jquery.fancybox-1.3.0.css", "fancybox/jquery.fancybox-1.3.0.pack.js",
    "membership-form.pdf",
]

PHOTOGALLERY = [
    "cricket1-big.jpg", "cricket1-small.jpg", "cricket2-big.jpg", "cricket2-small.jpg",
    "cricket3-big.jpg", "cricket3-small.jpg", "cricket4-big.jpg", "cricket4-small.jpg",
    "cultural1-big.jpg", "cultural1-small.jpg", "cultural2-big.jpg", "cultural2-small.jpg",
    "cultural3-big.jpg", "cultural3-small.jpg", "cultural4-big.jpg", "cultural4-small.jpg",
    "social1-big.jpg", "social1-small.jpg", "social2-big.jpg", "social2-small.jpg",
    "social3-big.jpg", "social3-small.jpg", "social4-big.jpg", "social4-small.jpg",
    "road-show1-big.jpg", "road-show1-small.jpg", "road-show2-big.jpg", "road-show2-small.jpg",
    "road-show3-big.jpg", "road-show3-small.jpg", "road-show4-big.jpg", "road-show4-small.jpg",
    "health1-big.jpg", "health1-small.jpg", "health2-big.jpg", "health2-small.jpg",
    "2016-1b.jpg", "2016-s1.jpg", "2016-2b.jpg", "2016-s2.jpg",
    "2016-3b.jpg", "2016-s3.jpg", "2016-4b.jpg", "2016-s4.jpg",
    "2016-5b.jpg", "2016-s5.jpg", "2016-6b.jpg", "2016-s6.jpg",
    "2016-7b.jpg", "2016-s7.jpg", "2016-8b.jpg", "2016-s8.jpg",
    "2016-9b.jpg", "2016-s9.jpg", "2016-10b.jpg", "2016-s10.jpg",
    "2016-11b.jpg", "2016-s11.jpg", "2016-12b.jpg", "2016-s12.jpg",
    "2016-13b.jpg", "2016-s13.jpg", "2016-14b.jpg", "2016-s14.jpg",
    "2016-15b.jpg", "2016-s15.jpg", "2016-16b.jpg", "2016-s16.jpg",
    "2015-b1.jpg", "2015-s1.jpg", "2015-b2.jpg", "2015-s2.jpg",
    "2015-b3.jpg", "2015-s3.jpg", "2015-b4.jpg", "2015-s4.jpg",
    "2015-b5.jpg", "2015-s5.jpg", "2015-b6.jpg", "2015-s6.jpg",
    "2015-b7.jpg", "2015-s7.jpg", "2015-b8.jpg", "2015-s8.jpg",
    "2013-1b.jpg", "2013-1s.jpg", "2013-2b.jpg", "2013-2s.jpg",
    "2013-3b.jpg", "2013-3s.jpg", "2013-4b.jpg", "2013-4s.jpg",
    "2013-5b.jpg", "2013-5s.jpg", "2013-6b.jpg", "2013-6s.jpg",
    "d101.jpg", "d101s.jpg", "d102.jpg", "d102s.jpg",
    "d103.jpg", "d103s.jpg", "d104.jpg", "d104s.jpg",
    "d105.jpg", "d105s.jpg", "d106.jpg", "d106s.jpg",
    "d107.jpg", "d107s.jpg", "d108.jpg", "d108s.jpg",
    "puja09b.jpg", "puja09s.jpg", "puja09b2.jpg", "puja09s2.jpg",
    "puja09b3.jpg", "puja09s3.jpg", "puja09b4.jpg", "puja09s4.jpg",
    "dp8-b.jpg", "dp8-s.jpg", "dp8-b2.jpg", "dp8-s2.jpg",
    "dp8-b3.jpg", "dp8-s3.jpg", "dp8-b4.jpg", "dp8-s4.jpg",
    "dp8-b5.jpg", "dp8-s5.jpg", "dp8-b6.jpg", "dp8-s6.jpg",
    "dp8-b7.jpg", "dp8-s7.jpg", "dp8-b8.jpg", "dp8-s8.jpg",
    "durga-puja1-big.jpg", "durga-puja1-small.jpg",
    "durga-puja2-big.jpg", "durga-puja2-small.jpg",
    "durga-puja3-big.jpg", "durga-puja3-small.jpg",
]

def download_file(url, output_path):
    if os.path.exists(output_path):
        print(f"  [SKIP] {output_path}")
        return
    try:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=60) as response:
            data = response.read()
            with open(output_path, "wb") as f:
                f.write(data)
        print(f"  [OK] {url.split('/')[-1]}")
    except Exception as e:
        print(f"  [FAIL] {url.split('/')[-1]}: {e}")


def extract_text(page_name, html):
    name = page_name.replace(".html", "").replace("-", " ").title()
    lines = [f"# {name}", f"", f"Source: {urljoin(BASE_URL, page_name)}", f""]
    content_match = re.search(r'<!-- InstanceBeginEditable name="content" -->(.*?)<!-- InstanceEndEditable -->', html, re.DOTALL)
    text = content_match.group(1) if content_match else html
    text = re.sub(r'<script[^>]*>.*?</script>', '', text, flags=re.DOTALL)
    text = re.sub(r'<style[^>]*>.*?</style>', '', text, flags=re.DOTALL)
    text = re.sub(r'<[^>]+>', ' ', text)
    for ent, ch in [("&nbsp;"," "),("&amp;","&"),("&lt;","<"),("&gt;",">"),("&quot;",'"'),("&rsquo;","'"),("&lsquo;","'"),("&ndash;","-")]:
        text = text.replace(ent, ch)
    text = re.sub(r'\s+', ' ', text).strip()
    lines.append(text)
    return "\n".join(lines)


print("=== Downloading HTML pages ===")
for page in PAGES:
    url = urljoin(BASE_URL, page)
    path = os.path.join(OUTPUT_DIR, "html", page)
    download_file(url, path)

print("\n=== Downloading assets ===")
for asset in ASSETS:
    url = urljoin(BASE_URL, asset)
    path = os.path.join(OUTPUT_DIR, asset)
    download_file(url, path)

print("\n=== Downloading photogallery ===")
for photo in PHOTOGALLERY:
    url = urljoin(BASE_URL, f"photogallery/{photo}")
    path = os.path.join(OUTPUT_DIR, f"photogallery/{photo}")
    download_file(url, path)

print("\n=== Generating markdown content ===")
md_dir = os.path.join(OUTPUT_DIR, "content")
os.makedirs(md_dir, exist_ok=True)
for page in PAGES:
    html_path = os.path.join(OUTPUT_DIR, "html", page)
    if not os.path.exists(html_path):
        continue
    with open(html_path, "r", encoding="utf-8", errors="ignore") as f:
        html = f.read()
    md = extract_text(page, html)
    md_path = os.path.join(md_dir, page.replace(".html", ".md"))
    with open(md_path, "w", encoding="utf-8") as f:
        f.write(md)
    print(f"  [OK] {page.replace('.html', '.md')}")

print("\n=== DONE ===")
print(f"Output: {OUTPUT_DIR}/")
