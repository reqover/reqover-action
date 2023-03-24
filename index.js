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

    const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY;
    const run_id = process.env.GITHUB_RUN_ID;

    const repo = GITHUB_REPOSITORY.split("/")[1];
    const owner = GITHUB_REPOSITORY.split("/")[0];

    const runUsage = await octokit.rest.actions.getWorkflowRunUsage({
      owner,
      repo,
      run_id,
    });

    console.log(JSON.stringify(runUsage, null, 2))
    
  } catch (error) {
    core.setFailed(error.message);
  }
}


function getBody(coverage) {

  let missingText = "";
  for(const [key, value] of Object.entries(coverage.missing.items)) {
    for(const item of value){
      missingText += `- ${item.method} ${item.path}\n`
    }
  }

  return `#### Reqover report

  Operations coverage result:
  - Full: ${coverage.full.size}
  - Missing: ${coverage.missing.size}
  - Partial: ${coverage.partial.size}

  ##### Missing:
  ${missingText}
  `
}

run()