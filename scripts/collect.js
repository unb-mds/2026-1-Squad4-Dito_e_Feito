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

  generateHTML();
}

function generateHTML() {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Repo Metrics</title>

  <style>
    body {
      font-family: Arial;
      padding: 40px;
      background: #111;
      color: white;
    }

    .card {
      background: #1e1e1e;
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 20px;
    }
  </style>
</head>

<body>
  <h1>Repo Productivity</h1>

  <div id="app"></div>

  <script>
    fetch('./metrics.json')
      .then(async r => {
  const text = await r.text();

  console.log(text);

  return JSON.parse(text);
})
      .then(data => {
        const app = document.getElementById('app');

        app.innerHTML = \`
          <div class="card">
            <h2>Total commits</h2>
            <p>\${data.totalCommits}</p>
          </div>

          <div class="card">
            <h2>Average commit interval</h2>
            <p>\${data.avgCommitIntervalHours.toFixed(2)} hours</p>
          </div>

          <div class="card">
            <h2>Total issues</h2>
            <p>\${data.totalIssues}</p>
          </div>

          <div class="card">
            <h2>Average issue close time</h2>
            <p>\${data.avgIssueCloseHours.toFixed(2)} hours</p>
          </div>

          <div class="card">
            <h2>Commits per author</h2>
            <pre>\${JSON.stringify(data.commitsPerAuthor, null, 2)}</pre>
          </div>
        \`;
      });
  </script>
</body>
</html>
`;

  fs.writeFileSync("index.html", html);
}

main();