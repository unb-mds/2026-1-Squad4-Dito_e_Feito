const fs = require("fs");
const axios = require("axios");

const token = process.env.GITHUB_TOKEN;
const repo = process.env.REPO;
const branch = process.env.BRANCH || "main";

const headers = {
  Authorization: `token ${token}`,
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

async function getPullRequests() {
  const url = `https://api.github.com/repos/${repo}/pulls?state=all&per_page=100`;
  const res = await axios.get(url, { headers });
  return res.data;
}

function averageTimeBetweenCommits(commits) {
  if (commits.length < 2) return 0;
  let total = 0;
  for (let i = 1; i < commits.length; i++) {
    const current = new Date(commits[i - 1].commit.author.date);
    const next = new Date(commits[i].commit.author.date);
    total += Math.abs(current - next);
  }
  return total / (commits.length - 1);
}

function issueCloseTime(issues) {
  const closed = issues.filter(i => i.closed_at);
  if (!closed.length) return 0;
  let total = 0;
  for (const issue of closed) {
    total += new Date(issue.closed_at) - new Date(issue.created_at);
  }
  return total / closed.length;
}

async function main() {
  try {
    console.log(`Iniciando coleta para ${repo} na branch ${branch}...`);
    const commits = await getCommits();
    const issues = await getIssues();
    const prs = await getPullRequests();

    const commitsPerAuthor = {};
    const commitsByHour = Array.from({ length: 24 }, (_, i) => ({ hour: i, commits: 0 }));
    const daysMap = { 0: 'Dom', 1: 'Seg', 2: 'Ter', 3: 'Qua', 4: 'Qui', 5: 'Sex', 6: 'Sáb' };
    const commitsByDay = Object.values(daysMap).map(d => ({ day: d, commits: 0 }));

    commits.forEach(c => {
      const name = c.commit.author.name;
      commitsPerAuthor[name] = (commitsPerAuthor[name] || 0) + 1;

      const date = new Date(c.commit.author.date);
      const hour = date.getUTCHours();
      const day = date.getUTCDay();

      commitsByHour[hour].commits++;
      commitsByDay[day].commits++;
    });

    const recentCommits = commits.slice(0, 20).map(c => ({
      sha: c.sha,
      message: c.commit.message,
      author: c.commit.author.name,
      date: c.commit.author.date,
      verified: c.commit.verification?.verified || false
    }));

    const data = {
      generatedAt: new Date().toISOString(),
      totalCommits: commits.length,
      commitsPerAuthor,
      avgCommitIntervalHours: averageTimeBetweenCommits(commits) / 1000 / 60 / 60,
      totalIssues: issues.length,
      avgIssueCloseHours: issueCloseTime(issues) / 1000 / 60 / 60,
      totalPRs: prs.length,
      recent_commits: recentCommits,
      temporal: {
        commits_by_hour: commitsByHour,
        commits_by_day: commitsByDay
      }
    };

    fs.writeFileSync("metrics.json", JSON.stringify(data, null, 2));
    console.log("metrics.json atualizado com sucesso!");
  } catch (error) {
    console.error("Erro ao coletar métricas:", error.message);
    process.exit(1);
  }
}

main();