import json
import os
import re
import time
import datetime
import urllib.request
import urllib.error
import urllib.parse
import ssl
import http.client
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, as_completed

ctx = ssl.create_default_context()
GITHUB_API_URL = "https://api.github.com"
GITHUB_GRAPHQL_URL = "https://api.github.com/graphql"
MAX_TRANSIENT_RETRIES = 3
MAX_REPOSITORY_PAGES = 1

REPOSITORIES_QUERY = """
query($login: String!, $cursor: String) {
  user(login: $login) {
    repositories(
      first: 100
      after: $cursor
      ownerAffiliations: OWNER
      privacy: PUBLIC
      orderBy: {field: UPDATED_AT, direction: DESC}
    ) {
      nodes {
        isFork
        stargazerCount
        primaryLanguage { name }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  rateLimit {
    remaining
    resetAt
  }
}
"""

COUNTRY_ROTATION_LANES = (
    (
        "United States", "Brazil", "Canada", "Mexico", "Colombia", "Argentina",
        "Chile", "Peru", "Venezuela", "Ecuador", "Uruguay", "Costa Rica",
        "Dominican Republic", "Guatemala", "Panama", "Bolivia", "Paraguay",
        "El Salvador", "Honduras", "Nicaragua", "Cuba",
    ),
    (
        "China", "India", "South Korea", "Philippines", "Japan", "Indonesia",
        "Australia", "Singapore", "Vietnam", "Taiwan", "Hong Kong", "Pakistan",
        "Bangladesh", "Malaysia", "Thailand", "Israel", "Turkey", "New Zealand",
    ),
    (
        "United Kingdom", "Germany", "France", "Spain", "Netherlands", "Italy",
        "Poland", "Sweden", "Switzerland", "Ukraine", "Portugal", "Belgium",
        "Austria", "Denmark", "Finland", "Norway", "Ireland", "Czech Republic",
        "Romania", "Hungary", "Greece", "Bulgaria", "Croatia", "Serbia",
        "Slovakia", "Slovenia", "Estonia", "Latvia", "Lithuania",
    ),
    ("Nigeria", "South Africa", "Egypt", "Kenya"),
)

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
    for attempt in range(3):
        req = urllib.request.Request(url, headers={"User-Agent": "GitTop-Rankings"})
        try:
            with urllib.request.urlopen(req, context=ctx, timeout=20) as resp:
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
                except (ValueError, IndexError):
                    continue
            if len(parsed) >= 30:
                return parsed
        except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError) as exc:
            if attempt == 2:
                raise RuntimeError(f"Failed to fetch committers.top/{slug}.html: {exc}") from exc
        time.sleep(2 ** attempt)
    raise RuntimeError(f"committers.top/{slug}.html returned fewer than 30 valid profiles")

def github_api_get(path, params=None):
    token = os.environ.get("GIT_TOKEN")
    if not token:
        raise RuntimeError("GIT_TOKEN is required for reliable GitHub metrics")

    url = f"{GITHUB_API_URL}{path}"
    if params:
        url += "?" + urllib.parse.urlencode(params)
    for attempt in range(MAX_TRANSIENT_RETRIES):
        req = urllib.request.Request(url, headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "GitTop-Rankings"
        })
        try:
            with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
                body = resp.read()
                headers = resp.headers
            return json.loads(body), headers
        except urllib.error.HTTPError as exc:
            if exc.code == 403 and exc.headers.get("X-RateLimit-Remaining") == "0":
                reset_at = int(exc.headers.get("X-RateLimit-Reset", time.time() + 60))
                reset_time = datetime.datetime.fromtimestamp(
                    reset_at, tz=datetime.timezone.utc
                ).isoformat()
                raise RuntimeError(
                    "GitHub REST rate limit reached; aborting without waiting for "
                    f"the reset at {reset_time}"
                ) from exc
            if exc.code in (403, 429):
                raise RuntimeError(
                    "GitHub REST request throttled; aborting without retrying. "
                    "Run the workflow after the API quota recovers."
                ) from exc
            if exc.code not in (500, 502, 503, 504) or attempt == MAX_TRANSIENT_RETRIES - 1:
                details = exc.read().decode("utf-8", errors="replace")
                raise RuntimeError(f"GitHub REST HTTP {exc.code}: {details}") from exc
        except (
            urllib.error.URLError,
            TimeoutError,
            http.client.IncompleteRead,
            http.client.RemoteDisconnected,
            json.JSONDecodeError
        ) as exc:
            if attempt == MAX_TRANSIENT_RETRIES - 1:
                raise RuntimeError(f"GitHub REST request failed: {exc}") from exc
        time.sleep(2 ** attempt)


def github_graphql(query, variables):
    token = os.environ.get("GIT_TOKEN")
    if not token:
        raise RuntimeError("GIT_TOKEN is required for reliable GitHub metrics")

    body = json.dumps({"query": query, "variables": variables}).encode("utf-8")
    for attempt in range(MAX_TRANSIENT_RETRIES):
        req = urllib.request.Request(GITHUB_GRAPHQL_URL, data=body, headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "Content-Type": "application/json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "GitTop-Rankings"
        })
        try:
            with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
                result = json.loads(resp.read())
            if result.get("errors"):
                error_types = {error.get("type") for error in result["errors"]}
                if "RATE_LIMITED" in error_types:
                    reset_at = (result.get("data") or {}).get("rateLimit", {}).get("resetAt", "unknown")
                    raise RuntimeError(
                        "GitHub GraphQL rate limit reached; aborting without waiting "
                        f"for the reset at {reset_at}"
                    )
                messages = "; ".join(error.get("message", "Unknown error") for error in result["errors"])
                raise RuntimeError(f"GitHub GraphQL error: {messages}")
            return result["data"]
        except urllib.error.HTTPError as exc:
            if exc.code == 403 and exc.headers.get("X-RateLimit-Remaining") == "0":
                raise RuntimeError(
                    "GitHub GraphQL rate limit reached; aborting without waiting for reset"
                ) from exc
            if exc.code in (403, 429):
                raise RuntimeError(
                    "GitHub GraphQL request throttled; aborting without retrying. "
                    "Run the workflow after the API quota recovers."
                ) from exc
            if exc.code not in (500, 502, 503, 504) or attempt == MAX_TRANSIENT_RETRIES - 1:
                details = exc.read().decode("utf-8", errors="replace")
                raise RuntimeError(f"GitHub GraphQL HTTP {exc.code}: {details}") from exc
        except (
            urllib.error.URLError,
            TimeoutError,
            http.client.IncompleteRead,
            http.client.RemoteDisconnected,
            json.JSONDecodeError
        ) as exc:
            if attempt == MAX_TRANSIENT_RETRIES - 1:
                raise RuntimeError(f"GitHub GraphQL request failed: {exc}") from exc
        time.sleep(2 ** attempt)


def scrape_live_contributions_count(username, fallback_commits):
    url = f"https://github.com/users/{urllib.parse.quote(username)}/contributions"
    req = urllib.request.Request(url, headers={"User-Agent": "GitTop-Rankings"})
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=20) as resp:
            html = resp.read().decode("utf-8", errors="ignore")
        match = re.search(r'([\d,]+)\s+contributions', html, re.IGNORECASE)
        if match:
            return parse_number(match.group(1))
    except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError):
        pass
    return fallback_commits


def fetch_github_repositories(username):
    repositories = []
    cursor = None
    for _ in range(MAX_REPOSITORY_PAGES):
        data = github_graphql(REPOSITORIES_QUERY, {
            "login": username,
            "cursor": cursor
        })
        user = data.get("user")
        if not user:
            raise RuntimeError(f"GitHub GraphQL user not found: {username}")
        connection = user["repositories"]
        repositories.extend({
            "fork": repository["isFork"],
            "stargazers_count": repository["stargazerCount"],
            "language": (
                repository["primaryLanguage"]["name"]
                if repository.get("primaryLanguage") else None
            )
        } for repository in connection["nodes"])
        if not connection["pageInfo"]["hasNextPage"]:
            break
        cursor = connection["pageInfo"]["endCursor"]
    return repositories


def fetch_github_profile(item, country_name):
    username = item["username"]
    if not re.fullmatch(r"[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?", username):
        raise RuntimeError(f"Invalid GitHub username from committers.top: {username!r}")

    profile, _ = github_api_get(f"/users/{urllib.parse.quote(username)}")
    repositories = fetch_github_repositories(profile["login"])
    live_contributions = scrape_live_contributions_count(profile["login"], item["commits"])

    language_counts = Counter(
        repo.get("language")
        for repo in repositories
        if repo.get("language")
    )
    languages = [name for name, _ in language_counts.most_common(3)] or ["OpenSource"]

    return {
        "rank": 0,
        "login": profile["login"],
        "name": profile["name"] or item["html_name"] or profile["login"],
        "avatar_url": profile["avatar_url"],
        "html_url": profile["html_url"],
        "company": profile["company"] or "",
        "location": profile["location"] or country_name,
        "bio": profile["bio"] or "",
        "blog": profile["blog"] or profile["html_url"],
        "public_repos": profile["public_repos"],
        "followers": profile["followers"],
        "following": profile["following"],
        "estimated_commits": item["commits"],
        "live_contributions": live_contributions,
        "stars_received": sum(repo["stargazers_count"] for repo in repositories if not repo["fork"]),
        "country": country_name,
        "languages": languages
    }


def fetch_github_profiles(items, country_name):
    if not items:
        raise RuntimeError(f"No GitHub profiles found for {country_name}")
    with ThreadPoolExecutor(max_workers=5) as executor:
        return list(executor.map(
            lambda item: fetch_github_profile(item, country_name),
            items
        ))


def validate_dataset(dataset):
    required_metrics = (
        "public_repos", "followers", "following", "estimated_commits",
        "live_contributions", "stars_received"
    )
    expected_countries = {country["code"] for country in COMMITTERS_TOP_SLUGS} | {"World"}
    if set(dataset["countries"]) != expected_countries:
        raise RuntimeError("Dataset does not contain the complete country list")

    for country_code, country in dataset["countries"].items():
        developers = country["top_developers"]
        if len(developers) != 30 or country["count"] != 30:
            raise RuntimeError(f"{country_code} has {len(developers)} profiles instead of 30")
        if len({developer["login"].lower() for developer in developers}) != 30:
            raise RuntimeError(f"{country_code} contains duplicate profiles")
        for expected_rank, developer in enumerate(developers, 1):
            if developer["rank"] != expected_rank:
                raise RuntimeError(f"{country_code} has an invalid rank for {developer['login']}")
            for metric in required_metrics:
                value = developer.get(metric)
                if not isinstance(value, int) or value < 0:
                    raise RuntimeError(f"{country_code}/{developer['login']} has invalid {metric}: {value!r}")


def get_country_rotation():
    rotation = []
    for index in range(max(map(len, COUNTRY_ROTATION_LANES))):
        rotation.extend(lane[index] for lane in COUNTRY_ROTATION_LANES if index < len(lane))

    expected = {country["code"] for country in COMMITTERS_TOP_SLUGS}
    if len(rotation) != len(expected) or set(rotation) != expected:
        raise RuntimeError("Country rotation must contain every configured country exactly once")
    return rotation


def select_country_batch(next_country=None, batch_size=20):
    rotation = get_country_rotation()
    try:
        start = rotation.index(next_country) if next_country else 0
    except ValueError:
        start = 0
    end = min(start + batch_size, len(rotation))
    selected_codes = rotation[start:end]
    next_code = rotation[end] if end < len(rotation) else rotation[0]
    return selected_codes, next_code, end == len(rotation)


def build_global_country(countries):
    candidates = []
    for code, country in countries.items():
        if code != "World":
            candidates.extend(dict(developer) for developer in country["top_developers"][:10])

    candidates.sort(key=lambda developer: developer["estimated_commits"], reverse=True)
    unique_global = []
    seen = set()
    for developer in candidates:
        login = developer["login"].lower()
        if login not in seen:
            seen.add(login)
            unique_global.append(developer)
        if len(unique_global) >= 30:
            break

    for rank, developer in enumerate(unique_global, 1):
        developer["rank"] = rank

    return {
        "code": "World",
        "name": "Global / Worldwide",
        "iso": "GLOBAL",
        "count": len(unique_global),
        "top_developers": unique_global
    }

def process_country(c):
    code = c["code"]
    name = c["name"]
    iso = c["iso"]
    slug = c["slug"]

    print(f"Scraping live contributions & profiles for {name} ({slug})...", flush=True)
    targets = fetch_committers_top_list(slug)
    top_30 = targets[:30]

    country_devs = fetch_github_profiles(top_30, name)

    # Sort strictly by Commits descending (or Live Contributions) and assign rank 1..N
    country_devs.sort(key=lambda x: x["estimated_commits"], reverse=True)
    for idx, dev in enumerate(country_devs, 1):
        dev["rank"] = idx

    print(f"  -> Extracted {len(country_devs)} LIVE updated profiles for {name}", flush=True)

    return code, {
        "code": code,
        "name": name,
        "iso": iso,
        "count": len(country_devs),
        "last_updated": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "top_developers": country_devs
    }

def main():
    mode = os.environ.get("SCRAPE_MODE", "batch").lower()
    if mode not in ("batch", "full"):
        raise RuntimeError("SCRAPE_MODE must be 'batch' or 'full'")

    out_file = "public/data/committers.json"
    existing_dataset = {}
    if os.path.exists(out_file):
        with open(out_file, encoding="utf-8") as existing_file:
            existing_dataset = json.load(existing_file)

    existing_countries = existing_dataset.get("countries", {})
    if mode == "batch" and not existing_countries:
        raise RuntimeError("Batch mode requires an existing complete dataset; run full mode once")

    rotation = get_country_rotation()
    previous_sync = existing_dataset.get("sync_state", {})
    if mode == "batch":
        batch_size = int(os.environ.get("COUNTRY_BATCH_SIZE", "20"))
        if batch_size < 1:
            raise RuntimeError("COUNTRY_BATCH_SIZE must be greater than zero")
        selected_codes, next_country, cycle_completed = select_country_batch(
            previous_sync.get("next_country"), batch_size
        )
    else:
        selected_codes = rotation
        next_country = rotation[0]
        cycle_completed = True

    countries_by_code = {country["code"]: country for country in COMMITTERS_TOP_SLUGS}
    selected_countries = [countries_by_code[code] for code in selected_codes]
    print(
        f"Starting {mode} scraper for {len(selected_countries)} countries: "
        + ", ".join(selected_codes),
        flush=True
    )

    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    dataset = {
        "last_updated": now,
        "update_frequency": "20 países por corrida, rotación automática cada 12 horas",
        "sync_state": {
            "mode": mode,
            "batch_size": len(selected_codes),
            "updated_countries": selected_codes,
            "next_country": next_country,
            "cycle": previous_sync.get("cycle", 0) + int(cycle_completed),
            "cycle_completed": cycle_completed,
        },
        "countries": {
            code: country for code, country in existing_countries.items() if code != "World"
        }
    }

    # Process 3 countries in parallel and keep prior data when one country fails.
    with ThreadPoolExecutor(max_workers=3) as c_executor:
        future_countries = {
            c_executor.submit(process_country, country): country
            for country in selected_countries
        }
        for cf in as_completed(future_countries):
            country = future_countries[cf]
            try:
                code, country_data = cf.result()
            except Exception as exc:
                print(
                    f"WARNING: {country['name']} failed; retaining previous data: {exc}",
                    flush=True,
                )
                continue
            dataset["countries"][code] = country_data
            print(f"Completed {code}: {country_data['count']} profiles", flush=True)

    dataset["countries"]["World"] = build_global_country(dataset["countries"])

    validate_dataset(dataset)

    os.makedirs("public/data", exist_ok=True)
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(dataset, f, ensure_ascii=False, indent=2)

    print(f"\nSUCCESS! Dual metric dataset saved to {out_file}!", flush=True)

if __name__ == "__main__":
    main()
