const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios').default;

async function run() {
  try {
    const serverUrl = core.getInput('server-url');
    const buildId = core.getInput('build-id');
    const github_token = core.getInput('github-token');

    const context = github.context;
    if (context.payload.pull_request == null) {
        core.setFailed('No pull request found.');
        return;
    }

    const issueNumber = github.context.issue.number;
    console.log(`Issue number ${issueNumber}`);
    console.log(`About to get information for ${buildId}!`);

    const response = await axios.get(`${serverUrl}/builds/${buildId}`);
    console.log(JSON.stringify(response.data.report.result.summary, null, 2));
    
    const octokit = new github.getOctokit(github_token);
    await octokit.rest.issues.createComment({
          ...context.repo,
          issue_number: pull_request_number,
          body: '👋 Thanks for reporting!'
    });
    
    // Get the JSON webhook payload for the event that triggered the workflow
    // const payload = JSON.stringify(github.context.payload, undefined, 2)
    // console.log(`The event payload: ${payload}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run()