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

async function getContributorStats() {
  const url = `https://api.github.com/repos/${repo}/stats/contributors`;
  try {
    const res = await axios.get(url, { headers });
    // GitHub API pode retornar 202 se os dados estiverem sendo cacheados
    if (res.status === 202 || !res.data) {
      console.log("GitHub API retornou 202 (processando status). Algumas métricas reais podem faltar na primeira run.");
      return [];
    }
    return res.data;
  } catch (error) {
    console.warn("Aviso: Não foi possível buscar as estatísticas de contribuidores:", error.message);
    return [];
  }
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
    const stats = await getContributorStats();

    const commitsPerAuthor = {};
    const detailedContributors = {};
    let weeklyVelocity = 0;

    // Encontrar o timestamp da semana mais recente nos status para calcular velocidade real
    let latestWeekTS = 0;
    stats.forEach(contributor => {
      if (contributor.weeks && contributor.weeks.length > 0) {
        const lastWeek = contributor.weeks[contributor.weeks.length - 1].w;
        if (lastWeek > latestWeekTS) latestWeekTS = lastWeek;
      }
    });

    // Processar status avançados (adições, deleções)
    stats.forEach(contributor => {
      const login = contributor.author ? contributor.author.login : 'Desconhecido';
      let additions = 0;
      let deletions = 0;
      
      contributor.weeks.forEach(week => {
        additions += week.a;
        deletions += week.d;
        // Somar commits da última semana para a métrica de "Velocidade (Semana)"
        if (week.w === latestWeekTS) {
          weeklyVelocity += week.c;
        }
      });
      
      detailedContributors[login] = {
        commits: contributor.total,
        additions,
        deletions
      };
    });

    const commitsByHour = Array.from({ length: 24 }, (_, i) => ({ hour: i, commits: 0 }));
    const daysMap = { 0: 'Dom', 1: 'Seg', 2: 'Ter', 3: 'Qua', 4: 'Qui', 5: 'Sex', 6: 'Sáb' };
    const commitsByDay = Object.values(daysMap).map(d => ({ day: d, commits: 0 }));

    const issuesByWeekMap = {};
    issues.forEach(issue => {
      const d = new Date(issue.created_at);
      const day = d.getDay() || 7; 
      d.setHours(-24 * (day - 1)); // Start of the week (Monday)
      const weekStr = d.toISOString().split('T')[0];
      issuesByWeekMap[weekStr] = (issuesByWeekMap[weekStr] || 0) + 1;
    });

    const issuesByWeek = Object.entries(issuesByWeekMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, count]) => ({ week, count }));

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
      team: {
        weekly_velocity: weeklyVelocity || "N/A"
      },
      totalCommits: commits.length,
      commitsPerAuthor,
      detailedContributors,
      avgCommitIntervalHours: averageTimeBetweenCommits(commits) / 1000 / 60 / 60,
      totalIssues: issues.length,
      avgIssueCloseHours: issueCloseTime(issues) / 1000 / 60 / 60,
      totalPRs: prs.length,
      recent_commits: recentCommits,
      temporal: {
        commits_by_hour: commitsByHour,
        commits_by_day: commitsByDay,
        issues_by_week: issuesByWeek
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