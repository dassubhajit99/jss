import os
import re
from urllib.parse import urljoin
import urllib.request

BASE_URL = "http://siligurijss.org/"
OUTPUT_DIR = "scraped_site"

PAGES = [
    "index.html", "profile.html", "preface.html", "members.html",
    "governing-body.html", "social-activity.html", "future-plan.html",
    "glimpses.html", "press.html", "donation.html", "durgapuja.html",
    "contact-us.html", "sports.html", "library.html", "health-check-ups.html",
    "durga-puja-glimpses.html",
]

# Assets still missing to download
MISSING_ASSETS = [
    "scripts/style.css",
    "images/bul1.jpg",
    "images/slice_02.jpg",
    "images/slice_06.jpg",
    "images/bg_09.jpg",
]

MISSING_PHOTOS = [
    "2016-s1.jpg", "2016-s2.jpg", "2016-s3.jpg", "2016-s4.jpg",
    "2016-s5.jpg", "2016-s6.jpg", "2016-s7.jpg", "2016-s8.jpg",
    "2016-s9.jpg", "2016-s10.jpg", "2016-s11.jpg", "2016-s12.jpg",
    "2016-s13.jpg", "2016-s14.jpg", "2016-s15.jpg", "2016-s16.jpg",
    "cricket1-big.jpg", "cricket1-small.jpg", "cricket2-big.jpg", "cricket2-small.jpg",
    "cricket3-big.jpg", "cricket3-small.jpg", "cricket4-big.jpg", "cricket4-small.jpg",
    "cultural1-big.jpg", "cultural1-small.jpg", "cultural2-big.jpg", "cultural2-small.jpg",
    "cultural3-big.jpg", "cultural3-small.jpg", "cultural4-big.jpg", "cultural4-small.jpg",
    "social1-big.jpg", "social1-small.jpg", "social2-big.jpg", "social2-small.jpg",
    "social3-big.jpg", "social3-small.jpg", "social4-big.jpg", "social4-small.jpg",
    "road-show1-big.jpg", "road-show1-small.jpg", "road-show2-big.jpg", "road-show2-small.jpg",
    "road-show3-big.jpg", "road-show3-small.jpg", "road-show4-big.jpg", "road-show4-small.jpg",
    "health1-big.jpg", "health1-small.jpg", "health2-big.jpg", "health2-small.jpg",
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
        return False
    try:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=60) as response:
            with open(output_path, "wb") as f:
                f.write(response.read())
        print(f"  [OK] {url.split('/')[-1]}")
        return True
    except Exception as e:
        print(f"  [FAIL] {url.split('/')[-1]}: {e}")
        return False

print("=== Downloading remaining assets ===")
for asset in MISSING_ASSETS:
    url = urljoin(BASE_URL, asset)
    path = os.path.join(OUTPUT_DIR, asset)
    download_file(url, path)

print("\n=== Downloading remaining photogallery images ===")
import time
for i, photo in enumerate(MISSING_PHOTOS):
    url = urljoin(BASE_URL, f"photogallery/{photo}")
    path = os.path.join(OUTPUT_DIR, f"photogallery/{photo}")
    download_file(url, path)
    if i % 10 == 9:
        time.sleep(0.5)
