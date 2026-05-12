from datetime import datetime
from collections import defaultdict


class AnalyticsEngine:
    """Processes raw GitHub data into team productivity metrics."""

    def __init__(self, commits, commit_details, issues, pulls):
        self.commits = commits
        self.commit_details = commit_details
        self.issues = [i for i in issues if "pull_request" not in i]
        self.pulls = pulls

    # ── public ─────────────────────────────────────────────────
    def compute_all(self):
        return {
            "generated_at": datetime.utcnow().isoformat() + "Z",
            "repository": "unb-mds/2026-1-Squad4-Dito_e_Feito",
            "team": self._team_metrics(),
            "contributors": self._contributor_metrics(),
            "temporal": self._temporal_metrics(),
            "recent_commits": self._recent_commits(),
            "issues_summary": self._issues_summary(),
            "collaboration": self._collaboration_metrics(),
        }

    # ── helpers ────────────────────────────────────────────────
    @staticmethod
    def _author_name(commit):
        if commit.get("author") and commit["author"].get("login"):
            return commit["author"]["login"]
        return commit["commit"]["author"]["name"]

    # ── team ───────────────────────────────────────────────────
    def _team_metrics(self):
        total_add = sum(
            d.get("stats", {}).get("additions", 0) for d in self.commit_details
        )
        total_del = sum(
            d.get("stats", {}).get("deletions", 0) for d in self.commit_details
        )
        total_files = sum(len(d.get("files", [])) for d in self.commit_details)

        # weekly velocity
        if self.commits:
            dates = [
                datetime.strptime(c["commit"]["author"]["date"], "%Y-%m-%dT%H:%M:%SZ")
                for c in self.commits
            ]
            span = max((max(dates) - min(dates)).days, 1) if len(dates) >= 2 else 1
            weekly_vel = round(len(self.commits) * 7 / span, 1)
        else:
            weekly_vel = 0

        counts = defaultdict(int)
        for c in self.commits:
            counts[self._author_name(c)] += 1

        most_active = max(counts, key=counts.get) if counts else "N/A"

        return {
            "total_commits": len(self.commits),
            "total_additions": total_add,
            "total_deletions": total_del,
            "total_files_changed": total_files,
            "weekly_velocity": weekly_vel,
            "most_active": most_active,
            "total_contributors": len(set(counts.keys())),
        }

    # ── contributors ───────────────────────────────────────────
    def _contributor_metrics(self):
        buckets = defaultdict(
            lambda: {
                "commits": 0,
                "additions": 0,
                "deletions": 0,
                "files_changed": 0,
                "hours": [],
                "days": [],
            }
        )

        for c in self.commits:
            author = self._author_name(c)
            dt = datetime.strptime(c["commit"]["author"]["date"], "%Y-%m-%dT%H:%M:%SZ")
            buckets[author]["commits"] += 1
            buckets[author]["hours"].append(dt.hour)
            buckets[author]["days"].append(dt.strftime("%Y-%m-%d"))

        detail_map = {d["sha"]: d for d in self.commit_details}
        for c in self.commits:
            author = self._author_name(c)
            det = detail_map.get(c["sha"])
            if det:
                buckets[author]["additions"] += det.get("stats", {}).get("additions", 0)
                buckets[author]["deletions"] += det.get("stats", {}).get("deletions", 0)
                buckets[author]["files_changed"] += len(det.get("files", []))

        result = []
        for name, d in sorted(
            buckets.items(), key=lambda x: x[1]["commits"], reverse=True
        ):
            avg_h = round(sum(d["hours"]) / len(d["hours"]), 1) if d["hours"] else 0
            fav_h = max(set(d["hours"]), key=d["hours"].count) if d["hours"] else 0
            uniq = sorted(set(d["days"]))
            streak = self._calc_streak(uniq)
            score = round(
                d["commits"] * 10
                + d["additions"] * 0.5
                + d["deletions"] * 0.3
                + d["files_changed"] * 2,
                1,
            )
            result.append(
                {
                    "name": name,
                    "commits": d["commits"],
                    "additions": d["additions"],
                    "deletions": d["deletions"],
                    "files_changed": d["files_changed"],
                    "avg_commit_hour": avg_h,
                    "favorite_hour": fav_h,
                    "active_days": len(uniq),
                    "current_streak": streak,
                    "score": score,
                }
            )
        return result

    @staticmethod
    def _calc_streak(sorted_days):
        if not sorted_days:
            return 0
        streak = 1
        best = 1
        for i in range(1, len(sorted_days)):
            d1 = datetime.strptime(sorted_days[i - 1], "%Y-%m-%d")
            d2 = datetime.strptime(sorted_days[i], "%Y-%m-%d")
            if (d2 - d1).days == 1:
                streak += 1
                best = max(best, streak)
            else:
                streak = 1
        return best

    # ── temporal ───────────────────────────────────────────────
    def _temporal_metrics(self):
        by_hour = [0] * 24
        by_day = [0] * 7
        daily = defaultdict(int)

        for c in self.commits:
            dt = datetime.strptime(c["commit"]["author"]["date"], "%Y-%m-%dT%H:%M:%SZ")
            by_hour[dt.hour] += 1
            by_day[dt.weekday()] += 1
            daily[dt.strftime("%Y-%m-%d")] += 1

        days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        return {
            "commits_by_hour": [{"hour": h, "commits": by_hour[h]} for h in range(24)],
            "commits_by_day": [
                {"day": days[d], "commits": by_day[d]} for d in range(7)
            ],
            "daily_activity": [
                {"date": k, "commits": v} for k, v in sorted(daily.items())
            ],
        }

    # ── recent commits ─────────────────────────────────────────
    def _recent_commits(self):
        return [
            {
                "sha": c["sha"][:7],
                "message": c["commit"]["message"].split("\n")[0][:80],
                "author": self._author_name(c),
                "date": c["commit"]["author"]["date"],
                "verified": c["commit"]
                .get("verification", {})
                .get("verified", False),
            }
            for c in self.commits[:20]
        ]

    # ── issues ─────────────────────────────────────────────────
    def _issues_summary(self):
        opened = [i for i in self.issues if i["state"] == "open"]
        closed = [i for i in self.issues if i["state"] == "closed"]
        avg = 0
        if closed:
            total = 0
            for i in closed:
                cr = datetime.strptime(i["created_at"], "%Y-%m-%dT%H:%M:%SZ")
                cl = datetime.strptime(i["closed_at"], "%Y-%m-%dT%H:%M:%SZ")
                total += (cl - cr).total_seconds() / 3600
            avg = round(total / len(closed), 1)
        return {
            "total": len(self.issues),
            "open": len(opened),
            "closed": len(closed),
            "avg_close_hours": avg,
        }

    # ── collaboration ──────────────────────────────────────────
    def _collaboration_metrics(self):
        merged = [p for p in self.pulls if p.get("merged_at")]
        opened = [p for p in self.pulls if p["state"] == "open"]
        rate = round(len(merged) / len(self.pulls) * 100, 1) if self.pulls else 0
        return {
            "total_prs": len(self.pulls),
            "merged_prs": len(merged),
            "open_prs": len(opened),
            "merge_rate": rate,
        }
