const core = require('@actions/core');
const axios = require('axios');

async function run() {
  try {
    // Get inputs
    const apiUrl = core.getInput('api-url', { required: true });
    const apiKey = core.getInput('api-key', { required: true });
    const targetId = core.getInput('target-id', { required: true });
    const reason = core.getInput('reason') || 'Rollback initiated from GitHub Actions';

    core.info(`⏪ Rolling back target ${targetId}...`);

    // Build request payload
    const payload = {
      reason: reason
    };

    // Call rollback endpoint
    const response = await axios.post(
      `${apiUrl}/api/v2/release-management/releases/${targetId}/rollback`,
      payload,
      {
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json'
        },
        timeout: 60000 // 60 second timeout for rollback
      }
    );

    const result = response.data;

    // Set outputs
    core.setOutput('release-id', result.id);
    core.setOutput('status', result.status);
    core.setOutput('success', 'true');

    core.info(`✅ Rollback completed successfully!`);
    core.info(`📦 New release ID: ${result.id}`);
    core.info(`📊 Status: ${result.status}`);
    core.info(`💬 Reason: ${reason}`);

  } catch (error) {
    core.setOutput('success', 'false');
    
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      if (status === 401) {
        core.setFailed('❌ Authentication failed. Please check your API key.');
      } else if (status === 404) {
        core.setFailed('❌ Target not found. Please verify the target ID.');
      } else if (status === 400) {
        core.setFailed(`❌ Rollback failed: ${data.error || JSON.stringify(data)}`);
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
