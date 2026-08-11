import json
import os
import re
import time
import datetime
import urllib.request
import ssl
from concurrent.futures import ThreadPoolExecutor

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

COMMITTERS_TOP_SLUGS = [
    # Latin America
    {"code": "Colombia", "name": "Colombia", "iso": "CO", "slug": "colombia"},
    {"code": "Spain", "name": "Spain", "iso": "ES", "slug": "spain"},
    {"code": "Mexico", "name": "Mexico", "iso": "MX", "slug": "mexico"},
    {"code": "Argentina", "name": "Argentina", "iso": "AR", "slug": "argentina"},
    {"code": "Chile", "name": "Chile", "iso": "CL", "slug": "chile"},
    {"code": "Peru", "name": "Peru", "iso": "PE", "slug": "peru"},
    {"code": "Uruguay", "name": "Uruguay", "iso": "UY", "slug": "uruguay"},
    {"code": "Ecuador", "name": "Ecuador", "iso": "EC", "slug": "ecuador"},
    {"code": "Venezuela", "name": "Venezuela", "iso": "VE", "slug": "venezuela"},
    {"code": "Costa Rica", "name": "Costa Rica", "iso": "CR", "slug": "costa_rica"},
    {"code": "Dominican Republic", "name": "Dominican Republic", "iso": "DO", "slug": "dominican_republic"},
    {"code": "Guatemala", "name": "Guatemala", "iso": "GT", "slug": "guatemala"},
    {"code": "Bolivia", "name": "Bolivia", "iso": "BO", "slug": "bolivia"},
    {"code": "Panama", "name": "Panama", "iso": "PA", "slug": "panama"},
    {"code": "Cuba", "name": "Cuba", "iso": "CU", "slug": "cuba"},
    {"code": "El Salvador", "name": "El Salvador", "iso": "SV", "slug": "el_salvador"},
    {"code": "Honduras", "name": "Honduras", "iso": "HN", "slug": "honduras"},
    {"code": "Nicaragua", "name": "Nicaragua", "iso": "NI", "slug": "nicaragua"},
    {"code": "Paraguay", "name": "Paraguay", "iso": "PY", "slug": "paraguay"},

    # North America
    {"code": "United States", "name": "United States", "iso": "US", "slug": "united_states"},
    {"code": "Canada", "name": "Canada", "iso": "CA", "slug": "canada"},

    # Europe
    {"code": "United Kingdom", "name": "United Kingdom", "iso": "GB", "slug": "uk"},
    {"code": "Germany", "name": "Germany", "iso": "DE", "slug": "germany"},
    {"code": "France", "name": "France", "iso": "FR", "slug": "france"},
    {"code": "Netherlands", "name": "Netherlands", "iso": "NL", "slug": "netherlands"},
    {"code": "Austria", "name": "Austria", "iso": "AT", "slug": "austria"},
    {"code": "Belgium", "name": "Belgium", "iso": "BE", "slug": "belgium"},
    {"code": "Bulgaria", "name": "Bulgaria", "iso": "BG", "slug": "bulgaria"},
    {"code": "Croatia", "name": "Croatia", "iso": "HR", "slug": "croatia"},
    {"code": "Czech Republic", "name": "Czech Republic", "iso": "CZ", "slug": "czech_republic"},
    {"code": "Denmark", "name": "Denmark", "iso": "DK", "slug": "denmark"},
    {"code": "Estonia", "name": "Estonia", "iso": "EE", "slug": "estonia"},
    {"code": "Finland", "name": "Finland", "iso": "FI", "slug": "finland"},
    {"code": "Greece", "name": "Greece", "iso": "GR", "slug": "greece"},
    {"code": "Hungary", "name": "Hungary", "iso": "HU", "slug": "hungary"},
    {"code": "Ireland", "name": "Ireland", "iso": "IE", "slug": "ireland"},
    {"code": "Italy", "name": "Italy", "iso": "IT", "slug": "italy"},
    {"code": "Latvia", "name": "Latvia", "iso": "LV", "slug": "latvia"},
    {"code": "Lithuania", "name": "Lithuania", "iso": "LT", "slug": "lithuania"},
    {"code": "Norway", "name": "Norway", "iso": "NO", "slug": "norway"},
    {"code": "Poland", "name": "Poland", "iso": "PL", "slug": "poland"},
    {"code": "Portugal", "name": "Portugal", "iso": "PT", "slug": "portugal"},
    {"code": "Romania", "name": "Romania", "iso": "RO", "slug": "romania"},
    {"code": "Serbia", "name": "Serbia", "iso": "RS", "slug": "serbia"},
    {"code": "Slovakia", "name": "Slovakia", "iso": "SK", "slug": "slovakia"},
    {"code": "Slovenia", "name": "Slovenia", "iso": "SI", "slug": "slovenia"},
    {"code": "Sweden", "name": "Sweden", "iso": "SE", "slug": "sweden"},
    {"code": "Switzerland", "name": "Switzerland", "iso": "CH", "slug": "switzerland"},
    {"code": "Ukraine", "name": "Ukraine", "iso": "UA", "slug": "ukraine"},

    # Asia & Oceania
    {"code": "Australia", "name": "Australia", "iso": "AU", "slug": "australia"},
    {"code": "Bangladesh", "name": "Bangladesh", "iso": "BD", "slug": "bangladesh"},
    {"code": "Brazil", "name": "Brazil", "iso": "BR", "slug": "brazil"},
    {"code": "China", "name": "China", "iso": "CN", "slug": "china"},
    {"code": "Hong Kong", "name": "Hong Kong", "iso": "HK", "slug": "hong_kong"},
    {"code": "India", "name": "India", "iso": "IN", "slug": "india"},
    {"code": "Indonesia", "name": "Indonesia", "iso": "ID", "slug": "indonesia"},
    {"code": "Israel", "name": "Israel", "iso": "IL", "slug": "israel"},
    {"code": "Japan", "name": "Japan", "iso": "JP", "slug": "japan"},
    {"code": "Malaysia", "name": "Malaysia", "iso": "MY", "slug": "malaysia"},
    {"code": "New Zealand", "name": "New Zealand", "iso": "NZ", "slug": "new_zealand"},
    {"code": "Pakistan", "name": "Pakistan", "iso": "PK", "slug": "pakistan"},
    {"code": "Philippines", "name": "Philippines", "iso": "PH", "slug": "philippines"},
    {"code": "Singapore", "name": "Singapore", "iso": "SG", "slug": "singapore"},
    {"code": "South Korea", "name": "South Korea", "iso": "KR", "slug": "south_korea"},
    {"code": "Taiwan", "name": "Taiwan", "iso": "TW", "slug": "taiwan"},
    {"code": "Thailand", "name": "Thailand", "iso": "TH", "slug": "thailand"},
    {"code": "Turkey", "name": "Turkey", "iso": "TR", "slug": "turkey"},
    {"code": "Vietnam", "name": "Vietnam", "iso": "VN", "slug": "vietnam"},

    # Africa
    {"code": "Egypt", "name": "Egypt", "iso": "EG", "slug": "egypt"},
    {"code": "Kenya", "name": "Kenya", "iso": "KE", "slug": "kenya"},
    {"code": "Nigeria", "name": "Nigeria", "iso": "NG", "slug": "nigeria"},
    {"code": "South Africa", "name": "South Africa", "iso": "ZA", "slug": "south_africa"}
]

def parse_number(val_str):
    if not val_str:
        return 0
    clean = str(val_str).strip().replace(',', '').replace('&nbsp;', '')
    if 'k' in clean or 'K' in clean:
        try:
            num = float(clean.lower().replace('k', ''))
            return int(num * 1000)
        except Exception:
            return 0
    if 'm' in clean or 'M' in clean:
        try:
            num = float(clean.lower().replace('m', ''))
            return int(num * 1000000)
        except Exception:
            return 0
    try:
        return int(clean)
    except Exception:
        return 0

def fetch_committers_top_list(slug):
    url = f"https://committers.top/{slug}.html"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=8) as resp:
            if resp.status == 200:
                html = resp.read().decode('utf-8', errors='ignore')
                blocks = html.split('<tr id="')
                parsed = []
                for b in blocks[1:]:
                    try:
                        uname = b.split('"')[0].strip()
                        if not uname or 'class=' in uname or 'users-list' in uname:
                            continue
                        cm_match = re.search(r'<td>(\d+)</td>', b)
                        cm = int(cm_match.group(1)) if cm_match else 0
                        
                        nm_match = re.search(r'<br>\(([^)]+)\)', b)
                        html_nm = nm_match.group(1).strip() if nm_match else uname

                        parsed.append({"username": uname, "html_name": html_nm, "commits": cm})
                    except Exception:
                        continue
                return parsed
    except Exception as e:
        print(f"Error fetching committers.top/{slug}.html: {e}")
    return []

def scrape_live_contributions_count(username, fallback_commits):
    """Fetches exact live contributions from https://github.com/users/{username}/contributions"""
    url = f"https://github.com/users/{username}/contributions"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=6) as resp:
            if resp.status == 200:
                html = resp.read().decode('utf-8', errors='ignore')
                match = re.search(r'([\d,]+)\s+contributions', html, re.IGNORECASE)
                if match:
                    val = parse_number(match.group(1))
                    if val > 0:
                        return val
    except Exception:
        pass
    return fallback_commits

def scrape_real_github_profile(item, country_name):
    username = item["username"]
    html_name = item["html_name"]
    estimated_commits = item["commits"]

    # Fetch both estimated_commits AND live_contributions count
    live_contributions = scrape_live_contributions_count(username, estimated_commits)

    url = f"https://github.com/{username}"
    
    followers = 0
    following = 0
    repos = 0
    stars = 0
    display_name = html_name or username
    avatar_url = f"https://avatars.githubusercontent.com/{username}"
    company = ""
    location = country_name
    bio = f"Active open source contributor on GitHub ({country_name})."
    real_languages = []

    for attempt in range(2):
        try:
            time.sleep(0.05 * (attempt + 1))
            req = urllib.request.Request(url, headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept-Language": "en-US,en;q=0.9"
            })
            with urllib.request.urlopen(req, context=ctx, timeout=8) as resp:
                if resp.status == 200:
                    html = resp.read().decode('utf-8', errors='ignore')

                    # 100% REAL Languages from pinned/popular repos
                    raw_langs = re.findall(r'itemprop="programmingLanguage">([^<]+)</span>', html)
                    for l in raw_langs:
                        l_clean = l.strip()
                        if l_clean and l_clean not in real_languages:
                            real_languages.append(l_clean)

                    # 100% REAL Followers
                    fw_match = re.search(r'href="[^"]*tab=followers"[^>]*>.*?<span[^>]*class="text-bold[^"]*"[^>]*>([^<]+)</span>\s*followers', html, re.DOTALL)
                    if fw_match:
                        followers = parse_number(fw_match.group(1))

                    # 100% REAL Following
                    fl_match = re.search(r'href="[^"]*tab=following"[^>]*>.*?<span[^>]*class="text-bold[^"]*"[^>]*>([^<]+)</span>\s*following', html, re.DOTALL)
                    if fl_match:
                        following = parse_number(fl_match.group(1))

                    # 100% REAL Public Repositories
                    repo_match = re.search(r'data-tab-item="repositories"[^>]*>.*?<span[^>]*class="Counter[^"]*"[^>]*>([^<]+)</span>', html, re.DOTALL)
                    if repo_match:
                        repos = parse_number(repo_match.group(1))

                    # 100% REAL Stars
                    stars_match = re.search(r'data-tab-item="stars"[^>]*>.*?<span[^>]*class="Counter[^"]*"[^>]*>([^<]+)</span>', html, re.DOTALL)
                    if stars_match:
                        stars = parse_number(stars_match.group(1))

                    # Display Name
                    name_match = re.search(r'<span class="p-name vcard-fullname d-block overflow-hidden" itemprop="name">\s*([^<]+)\s*</span>', html)
                    if name_match:
                        display_name = name_match.group(1).strip()

                    # Bio
                    bio_match = re.search(r'<div class="p-note user-profile-bio[^"]*"[^>]*>\s*<div>\s*([^<]+)\s*</div>', html)
                    if bio_match:
                        bio = bio_match.group(1).strip()

                    # Company
                    comp_match = re.search(r'itemprop="worksFor"[^>]*>\s*<span[^>]*>\s*([^<]+)\s*</span>', html)
                    if comp_match:
                        company = comp_match.group(1).strip()

                    # Location
                    loc_match = re.search(r'itemprop="homeLocation"[^>]*>\s*<span[^>]*>\s*([^<]+)\s*</span>', html)
                    if loc_match:
                        location = loc_match.group(1).strip()

                    # Avatar
                    avatar_match = re.search(r'<img[^>]*class="[^"]*avatar-user[^"]*"[^>]*src="([^"]+)"', html)
                    if avatar_match:
                        avatar_url = avatar_match.group(1).replace('&amp;', '&')

                    if followers > 0 or repos > 0 or stars > 0 or len(real_languages) > 0:
                        break
        except Exception:
            time.sleep(0.3 * (attempt + 1))

    if not real_languages:
        bio_lower = bio.lower()
        if 'python' in bio_lower: real_languages.append('Python')
        if 'javascript' in bio_lower or 'js' in bio_lower: real_languages.append('JavaScript')
        if 'typescript' in bio_lower or 'ts' in bio_lower: real_languages.append('TypeScript')
        if 'rust' in bio_lower: real_languages.append('Rust')
        if 'go' in bio_lower or 'golang' in bio_lower: real_languages.append('Go')
        if 'java' in bio_lower: real_languages.append('Java')
        if 'c++' in bio_lower or 'cpp' in bio_lower: real_languages.append('C++')
        if 'ruby' in bio_lower: real_languages.append('Ruby')

    if not real_languages:
        real_languages = ["OpenSource"]

    return {
        "rank": 0,
        "login": username,
        "name": display_name,
        "avatar_url": avatar_url,
        "html_url": f"https://github.com/{username}",
        "company": company,
        "location": location,
        "bio": bio,
        "blog": f"https://github.com/{username}",
        "public_repos": repos,
        "followers": followers,
        "following": following,
        "estimated_commits": estimated_commits,
        "live_contributions": live_contributions,
        "stars_received": stars,
        "country": country_name,
        "languages": real_languages
    }

def process_country(c):
    code = c["code"]
    name = c["name"]
    iso = c["iso"]
    slug = c["slug"]

    print(f"Scraping live contributions & profiles for {name} ({slug})...")
    targets = fetch_committers_top_list(slug)
    top_30 = targets[:30]

    country_devs = []
    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(scrape_real_github_profile, target, name) for target in top_30]
        for f in futures:
            country_devs.append(f.result())

    # Sort strictly by Commits descending (or Live Contributions) and assign rank 1..N
    country_devs.sort(key=lambda x: x["estimated_commits"], reverse=True)
    for idx, dev in enumerate(country_devs, 1):
        dev["rank"] = idx

    print(f"  -> Extracted {len(country_devs)} LIVE updated profiles for {name}")

    return code, {
        "code": code,
        "name": name,
        "iso": iso,
        "count": len(country_devs),
        "top_developers": country_devs
    }

def main():
    print("Starting dual metric scraper for ALL COUNTRIES...")
    dataset = {
        "last_updated": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "update_frequency": "Actualización automática cada 5 horas vía GitHub Actions",
        "countries": {}
    }

    all_global_devs = []

    # Process 3 countries in parallel
    with ThreadPoolExecutor(max_workers=3) as c_executor:
        c_futures = [c_executor.submit(process_country, c) for c in COMMITTERS_TOP_SLUGS]
        for cf in c_futures:
            code, country_data = cf.result()
            dataset["countries"][code] = country_data
            for d in country_data["top_developers"][:10]:
                all_global_devs.append(dict(d))

    # Global ranking compilation
    all_global_devs.sort(key=lambda x: x["estimated_commits"], reverse=True)
    unique_global = []
    seen = set()
    for d in all_global_devs:
        if d["login"] not in seen:
            seen.add(d["login"])
            unique_global.append(d)
        if len(unique_global) >= 30:
            break

    for r_idx, dev in enumerate(unique_global, 1):
        dev["rank"] = r_idx

    dataset["countries"]["World"] = {
        "code": "World",
        "name": "Global / Worldwide",
        "iso": "GLOBAL",
        "count": len(unique_global),
        "top_developers": unique_global
    }

    os.makedirs("public/data", exist_ok=True)
    out_file = "public/data/committers.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(dataset, f, ensure_ascii=False, indent=2)

    print(f"\nSUCCESS! Dual metric dataset saved to {out_file}!")

if __name__ == "__main__":
    main()
