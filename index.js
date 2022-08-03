const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios').default;

try {
  const serverUrl = core.getInput('server-url');
  const buildId = core.getInput('build-id');
  const ghToken = core.getInput('github-token');

  const issueNumber = github.context.issue.number;
  console.log(`Issue number ${issueNumber}`);
  console.log(`About to get information for ${buildId}!`);

  axios.get(`${serverUrl}/builds/${buildId}`)
  .then(function (response) {
    console.log(JSON.stringify(response.data.report.result.summary, null, 2));
    github.issues.createComment({
      issue_number: context.issue.number,
      owner: context.repo.owner,
      repo: context.repo.repo,
      body: '👋 Thanks for reporting!'
    })
  })
  .catch(function (error) {
    console.log(error);
  });
  
  // Get the JSON webhook payload for the event that triggered the workflow
  // const payload = JSON.stringify(github.context.payload, undefined, 2)
  // console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}