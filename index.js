const core = require('@actions/core');
const github = require('@actions/github');

try {
  const serverUrl = core.getInput('server-url');
  const buildId = core.getInput('build-id');
  console.log(`About to get information for ${buildId}!`);
  
  const response = await fetch(`${serverUrl}/builds/${buildId}`)
  
  const body = await response.json()   
  
  console.log(body.report);  

  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}