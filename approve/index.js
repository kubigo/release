const core = require('@actions/core');
const axios = require('axios');

async function run() {
  try {
    // Get inputs
    const apiUrl = core.getInput('api-url', { required: true });
    const apiKey = core.getInput('api-key', { required: true });
    const releaseId = core.getInput('release-id', { required: true });
    const comment = core.getInput('comment') || '';

    core.info(`✅ Approving release ${releaseId}...`);

    // Build request payload
    const payload = {
      comment: comment
    };

    // Call approve endpoint
    const response = await axios.post(
      `${apiUrl}/api/v2/release-management/releases/${releaseId}/approve`,
      payload,
      {
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const result = response.data;

    // Set outputs
    core.setOutput('status', result.status);
    core.setOutput('approved-at', result.approvals?.[result.approvals.length - 1]?.approvedAt || '');
    core.setOutput('success', 'true');

    core.info(`✅ Release approved successfully!`);
    core.info(`📦 Status: ${result.status}`);
    if (comment) {
      core.info(`💬 Comment: ${comment}`);
    }

  } catch (error) {
    core.setOutput('success', 'false');
    
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      if (status === 401) {
        core.setFailed('❌ Authentication failed. Please check your API key.');
      } else if (status === 404) {
        core.setFailed('❌ Release not found. Please verify the release ID.');
      } else if (status === 400) {
        core.setFailed(`❌ Approval failed: ${data.error || JSON.stringify(data)}`);
      } else {
        core.setFailed(`❌ API Error (${status}): ${JSON.stringify(data)}`);
      }
    } else if (error.request) {
      core.setFailed(`❌ Network error: Could not reach Kubigo API`);
    } else {
      core.setFailed(`❌ Error: ${error.message}`);
    }
  }
}

run();
