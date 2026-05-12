"""
GitHub Team Analytics — Miner
Collects data from the GitHub API, computes metrics, and saves JSON output.
"""

import os
import json
import sys

from github_client import GitHubClient
from analytics import AnalyticsEngine


def main():
    token = os.getenv("GITHUB_TOKEN")
    repo_full = os.getenv("REPO", "unb-mds/2026-1-Squad4-Dito_e_Feito")
    branch = os.getenv("BRANCH", "main")

    owner, repo = repo_full.split("/")

    print(f"[Miner] Starting collection for {repo_full} (branch: {branch})")

    client = GitHubClient(token)

    # 1 ── commits ──────────────────────────────────────────────
    print("[Miner] Fetching commits...")
    commits = client.get_commits(owner, repo, branch)
    print(f"[Miner] Found {len(commits)} commits")

    # 2 ── commit details (max 50 to save rate-limit budget) ───
    print("[Miner] Fetching commit details...")
    commit_details = []
    limit = min(len(commits), 50)
    for i, c in enumerate(commits[:limit]):
        try:
            detail = client.get_commit_detail(owner, repo, c["sha"])
            commit_details.append(detail)
            if (i + 1) % 10 == 0:
                print(f"[Miner]   {i + 1}/{limit} details fetched")
        except Exception as e:
            print(f"[Miner]   Warning: {c['sha'][:7]} — {e}")

    # 3 ── issues ───────────────────────────────────────────────
    print("[Miner] Fetching issues...")
    issues = client.get_issues(owner, repo)
    print(f"[Miner] Found {len(issues)} issues")

    # 4 ── pull requests ────────────────────────────────────────
    print("[Miner] Fetching pull requests...")
    pulls = client.get_pulls(owner, repo)
    print(f"[Miner] Found {len(pulls)} pull requests")

    # 5 ── save raw data ────────────────────────────────────────
    raw_dir = os.path.join(os.path.dirname(__file__), "..", "data", "raw")
    os.makedirs(raw_dir, exist_ok=True)

    for name, payload in [
        ("commits.json", commits),
        ("commit_details.json", commit_details),
        ("issues.json", issues),
        ("pulls.json", pulls),
    ]:
        with open(os.path.join(raw_dir, name), "w") as f:
            json.dump(payload, f, indent=2)

    print("[Miner] Raw data saved")

    # 6 ── analytics ────────────────────────────────────────────
    print("[Analytics] Processing metrics...")
    engine = AnalyticsEngine(commits, commit_details, issues, pulls)
    metrics = engine.compute_all()

    processed_dir = os.path.join(os.path.dirname(__file__), "..", "data", "processed")
    os.makedirs(processed_dir, exist_ok=True)

    output = os.path.join(processed_dir, "team_metrics.json")
    with open(output, "w") as f:
        json.dump(metrics, f, indent=2)

    print(f"[Analytics] Saved → {output}")
    print(f"[Analytics] Commits: {metrics['team']['total_commits']}")
    print(f"[Analytics] Contributors: {metrics['team']['total_contributors']}")
    print(f"[Analytics] Weekly velocity: {metrics['team']['weekly_velocity']}")
    print("[Done] Pipeline complete!")


if __name__ == "__main__":
    main()
