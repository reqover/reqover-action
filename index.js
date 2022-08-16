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
    const branch = parseInt(pr_number) || context.ref;

    console.log(`Project: ${projectToken}`);
    
    if (!pull_number) {
      return;
    }

    console.log(`About to get information for build: ${buildName}`);
    if(!github_token){
      core.setFailed('`Github TOKEN is not set');
      return;
    }

    const response = await waitForBuildCompleted(serverUrl, projectToken, buildName, 5000);

    const summary = response.data.operations;
    console.log(`Result:\n ${JSON.stringify(summary, null, 2)}`);
    
    const octokit = new github.getOctokit(github_token);

    await octokit.rest.issues.createComment({
      ...context.repo,
      issue_number: pull_number,
      body: `#### Reqover report

Operations coverage result:
- Full: ${summary.full}
- Missing: ${summary.missing}
- Partial: ${summary.partial}
- Skipped: ${summary.skipped}

**_values are represented in %_
      `,
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

async function getBuildInfo (serverUrl, projectToken, buildName) {
  return axios.get(`${serverUrl}/${projectToken}/stats?name=${buildName}`);
}

const waitForBuildCompleted = async (serverUrl, projectToken, buildName, timeoutMs) => {
  const timeWas = new Date();
  let response = await getBuildInfo(serverUrl, projectToken, buildName);
  let completed = response.data.completed;
  while(!completed) {
    if(new Date() - timeWas > timeoutMs){
      throw new Error(`Timeout of ${timeoutMs} ms is exceeded`)
    }
    completed = response.data.completed;
    console.log(`Wait for build to be completed. Current status: ${completed}`)
    response = await getBuildInfo(serverUrl, projectToken, buildName);
  }

  return response;
}

run()