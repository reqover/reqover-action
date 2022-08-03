const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios').default;

async function run() {
  try {
    const serverUrl = core.getInput('server-url');
    const buildId = core.getInput('build-id');
    const github_token = core.getInput('GITHUB_TOKEN');
    const pr_number = core.getInput('pr_number');

    const context = github.context;

    const pull_number = parseInt(pr_number) || context.payload.pull_request?.number;

    if (!pull_number) {
      core.setFailed('No pull request in input neither in current context.');
      return;
    }

    console.log(`Issue number: ${pull_number}`);
    console.log(`About to get information for build: ${buildId}!`);
    if(github_token){
      console.log(`TOKEN is set`)
    }

    const response = await axios.get(`${serverUrl}/builds/${buildId}`);
    console.log(JSON.stringify(response.data.report.result.summary, null, 2));
    
    const octokit = new github.getOctokit(github_token);

    const { data: comment } = await octokit.issues.createComment({
      ...context.repo,
      issue_number: pull_number,
      body: '👋 Thanks for reporting!',
    });

    console.log(`Comment ${comment.id} was added`)
  } catch (error) {
    core.setFailed(error.message);
  }
}

run()