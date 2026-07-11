import os
import urllib.request
from urllib.parse import urljoin

BASE_URL = "http://siligurijss.org/"
OUTPUT_DIR = "scraped_site"

MISSING_ASSETS = [
    "show1.swf",
    "images/slice_02.jpg",
    "images/slice_06.jpg",
    "images/bg_09.jpg",
    "images/bul1.jpg",
    "scripts/jquery.js",
    "scripts/contact.php",
]

MISSING_PHOTOGALLERY = [
    "cricket1-big.jpg", "cricket1-small.jpg",
    "cricket2-big.jpg", "cricket2-small.jpg",
    "cricket3-big.jpg", "cricket3-small.jpg",
    "cricket4-big.jpg", "cricket4-small.jpg",
    "cultural1-big.jpg", "cultural1-small.jpg",
    "cultural2-big.jpg", "cultural2-small.jpg",
    "cultural3-big.jpg", "cultural3-small.jpg",
    "cultural4-big.jpg", "cultural4-small.jpg",
    "social1-big.jpg", "social1-small.jpg",
    "social2-big.jpg", "social2-small.jpg",
    "social3-big.jpg", "social3-small.jpg",
    "social4-big.jpg", "social4-small.jpg",
    "road-show1-big.jpg", "road-show1-small.jpg",
    "road-show2-big.jpg", "road-show2-small.jpg",
    "road-show3-big.jpg", "road-show3-small.jpg",
    "road-show4-big.jpg", "road-show4-small.jpg",
    "health1-big.jpg", "health1-small.jpg",
    "health2-big.jpg", "health2-small.jpg",
    "2016-s1.jpg", "2016-s2.jpg", "2016-s3.jpg", "2016-s4.jpg",
    "2016-s5.jpg", "2016-s6.jpg", "2016-s7.jpg", "2016-s8.jpg",
    "2016-s9.jpg", "2016-s10.jpg", "2016-s11.jpg", "2016-s12.jpg",
    "2016-s13.jpg", "2016-s14.jpg", "2016-s15.jpg", "2016-s16.jpg",
    "2016-7b.jpg", "2016-8b.jpg", "2016-9b.jpg",
    "2016-10b.jpg", "2016-11b.jpg", "2016-12b.jpg",
    "2016-13b.jpg", "2016-14b.jpg", "2016-15b.jpg", "2016-16b.jpg",
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

def download(url, path):
    if os.path.exists(path):
        return
    try:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=30) as r:
            with open(path, "wb") as f:
                f.write(r.read())
        print(f"  [OK] {url.split('/')[-1]}")
    except Exception as e:
        print(f"  [FAIL] {url.split('/')[-1]}: {e}")

print("Checking server availability...")
try:
    req = urllib.request.Request(BASE_URL, headers={"User-Agent": "Mozilla/5.0"})
    urllib.request.urlopen(req, timeout=10)
    print("Server is UP. Starting download...\n")
except Exception:
    print("Server is DOWN. Try again later.\n")
    exit(1)

print("=== Missing assets ===")
for a in MISSING_ASSETS:
    download(urljoin(BASE_URL, a), os.path.join(OUTPUT_DIR, a))

print("\n=== Missing photogallery ===")
for p in MISSING_PHOTOGALLERY:
    download(urljoin(BASE_URL, f"photogallery/{p}"), os.path.join(OUTPUT_DIR, f"photogallery/{p}"))

print("\nDone!")
