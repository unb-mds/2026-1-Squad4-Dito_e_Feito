import requests
import time
import os


class GitHubClient:
    """Client for GitHub REST API with pagination and rate-limit handling."""

    def __init__(self, token=None):
        self.token = token or os.getenv("GITHUB_TOKEN")
        self.base_url = "https://api.github.com"
        self.session = requests.Session()
        if self.token:
            self.session.headers.update(
                {
                    "Authorization": f"Bearer {self.token}",
                    "Accept": "application/vnd.github.v3+json",
                }
            )

    # ── paginated GET ──────────────────────────────────────────
    def _get_paginated(self, url, params=None, max_pages=10):
        results = []
        params = params or {}
        params["per_page"] = 100

        for page in range(1, max_pages + 1):
            params["page"] = page
            response = self.session.get(url, params=params)
            response.raise_for_status()
            data = response.json()

            if not data:
                break

            results.extend(data)

            if len(data) < 100:
                break

            time.sleep(0.5)

        return results

    # ── public helpers ─────────────────────────────────────────
    def get_commits(self, owner, repo, branch="main"):
        url = f"{self.base_url}/repos/{owner}/{repo}/commits"
        return self._get_paginated(url, params={"sha": branch})

    def get_commit_detail(self, owner, repo, sha):
        url = f"{self.base_url}/repos/{owner}/{repo}/commits/{sha}"
        response = self.session.get(url)
        response.raise_for_status()
        time.sleep(0.3)
        return response.json()

    def get_issues(self, owner, repo):
        url = f"{self.base_url}/repos/{owner}/{repo}/issues"
        return self._get_paginated(url, params={"state": "all"})

    def get_pulls(self, owner, repo):
        url = f"{self.base_url}/repos/{owner}/{repo}/pulls"
        return self._get_paginated(url, params={"state": "all"})
