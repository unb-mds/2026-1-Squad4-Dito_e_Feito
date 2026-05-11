const fs = require("fs");
const axios = require("axios");

const token = process.env.GITHUB_TOKEN;
const repo = process.env.REPO;
const branch = process.env.BRANCH;

const headers = {
  Authorization: `Bearer ${token}`,
};

async function getCommits() {
  const url = `https://api.github.com/repos/${repo}/commits?sha=${branch}&per_page=100`;

  const res = await axios.get(url, { headers });

  return res.data;
}

async function getIssues() {
  const url = `https://api.github.com/repos/${repo}/issues?state=all&per_page=100`;

  const res = await axios.get(url, { headers });

  return res.data.filter(i => !i.pull_request);
}

function averageTimeBetweenCommits(commits) {
  if (commits.length < 2) return 0;

  let total = 0;

  for (let i = 1; i < commits.length; i++) {
    const current = new Date(commits[i - 1].commit.author.date);
    const next = new Date(commits[i].commit.author.date);

    total += current - next;
  }

  return total / (commits.length - 1);
}

function issueCloseTime(issues) {
  const closed = issues.filter(i => i.closed_at);

  if (!closed.length) return 0;

  let total = 0;

  for (const issue of closed) {
    total +=
      new Date(issue.closed_at) - new Date(issue.created_at);
  }

  return total / closed.length;
}

async function main() {
  const commits = await getCommits();
  const issues = await getIssues();

  const commitsPerAuthor = {};

  commits.forEach(c => {
    const name = c.commit.author.name;

    commitsPerAuthor[name] =
      (commitsPerAuthor[name] || 0) + 1;
  });

  const data = {
    generatedAt: new Date().toISOString(),
    totalCommits: commits.length,
    commitsPerAuthor,
    avgCommitIntervalHours:
      averageTimeBetweenCommits(commits) / 1000 / 60 / 60,

    totalIssues: issues.length,

    avgIssueCloseHours:
      issueCloseTime(issues) / 1000 / 60 / 60,
  };

  fs.writeFileSync(
    "metrics.json",
    JSON.stringify(data, null, 2)
  );
}

main();