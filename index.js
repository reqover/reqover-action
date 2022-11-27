const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');

async function run() {
  try {
    const filePath = core.getInput('filePath');
    const github_token = core.getInput('githubToken');
    const pr_number = core.getInput('pr_number');

    const context = github.context;

    const pull_number = parseInt(pr_number) || context.payload.pull_request?.number;
    
    if (!pull_number) {
      return;
    }

    if(!github_token){
      core.setFailed('`Github TOKEN is not set');
      return;
    }

    const rawData = fs.readFileSync(filePath);
    const coverage = JSON.parse(rawData);

    console.log(`Result:\n ${JSON.stringify(coverage, null, 2)}`);
    
    const octokit = new github.getOctokit(github_token);

    await octokit.rest.issues.createComment({
      ...context.repo,
      issue_number: pull_number,
      body: getBody(coverage),
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

function getBody(coverage) {

  let missingText = "";
  for(const [key, value] of Object.entries(coverage.missing.items)) {
    for(const item of value){
      missingText += `- ##### ${item.method} ${item.path}\n`
    }
  }

  let partialText = "";
  for(const [key, value] of Object.entries(coverage.partial.items)) {
    for(const item of value){
      partialText += `- ##### ${item.method} ${item.path}\n`
    }
  }

  let fullText = "";
  for(const [key, value] of Object.entries(coverage.full.items)) {
    for(const item of value){
      fullText += `- ##### ${item.method} ${item.path}\n`
    }
  }

  return `#### Reqover report

  Operations coverage result (%):
  - Full: ${coverage.summary.operations.full}
  - Missing: ${coverage.summary.operations.missing}
  - Partial: ${coverage.summary.operations.partial}
  - Skipped: ${coverage.summary.operations.skipped}

  **Missing (${coverage.missing.size}):**
  ${missingText}

  **Partial (${coverage.partial.size}):**
  ${partialText}

  **Full (${coverage.full.size}):**
  ${fullText}
  `
}

run()