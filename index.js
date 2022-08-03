const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios').default;

async function run() {
  try {
    const serverUrl = core.getInput('serverUrl');
    const projectToken = core.getInput('projectToken');
    const buildName = core.getInput('buildName');
    const github_token = core.getInput('githubToken');
    const pr_number = core.getInput('pr_number');

    const context = github.context;

    const pull_number = parseInt(pr_number) || context.payload.pull_request?.number;

    if (!pull_number) {
      return;
    }

    console.log(`About to get information for build: ${buildName}`);
    if(!github_token){
      core.setFailed('`Github TOKEN is not set');
      return;
    }

    const response = await axios.get(`${serverUrl}/${projectToken}/stats?name=${buildName}`);

    const summary = response.data.operations;
    console.log(JSON.stringify(summary, null, 2));
    
    const octokit = new github.getOctokit(github_token);

    await octokit.rest.issues.createComment({
      ...context.repo,
      issue_number: pull_number,
      body: `#### Reqover report
Full: ${summary.operations.full}
Missing: ${summary.operations.missing}
Partial: ${summary.operations.partial}
Skipped: ${summary.operations.skipped}
      `,
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

run()