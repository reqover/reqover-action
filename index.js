const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios').default;

try {
  const serverUrl = core.getInput('server-url');
  const buildId = core.getInput('build-id');
  console.log(`About to get information for ${buildId}!`);
  
  axios.get(`${serverUrl}/builds/${buildId}`)
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });
  
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}