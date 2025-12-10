const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios');

async function run() {
  try {
    // Get inputs
    const apiUrl = core.getInput('api-url', { required: true });
    const apiKey = core.getInput('api-key', { required: true });
    const imageTag = core.getInput('image-tag', { required: true });
    const serviceId = core.getInput('service-id');
    const triggeredBy = core.getInput('triggered-by') || 'github-actions';
    
    // Auto-detect from GitHub context or use provided values
    const repositoryUrl = core.getInput('repository-url') || 
      `${github.context.serverUrl}/${github.context.repo.owner}/${github.context.repo.repo}`;
    const branch = core.getInput('branch') || 
      (github.context.ref.startsWith('refs/heads/') ? github.context.ref.replace('refs/heads/', '') : github.context.ref);
    const commitSha = core.getInput('commit-sha') || github.context.sha;

    // Build webhook payload
    const payload = {
      repositoryUrl,
      branch,
      commitSha,
      imageTag,
      triggeredBy,
      metadata: {
        buildNumber: github.context.runNumber.toString(),
        buildUrl: `${github.context.serverUrl}/${github.context.repo.owner}/${github.context.repo.repo}/actions/runs/${github.context.runId}`,
        author: github.context.actor,
        commitMessage: github.context.payload.head_commit?.message || '',
        provider: 'github-actions',
        workflow: github.context.workflow,
        job: github.context.job,
        eventName: github.context.eventName
      }
    };

    if (serviceId) {
      payload.serviceId = serviceId;
    }

    core.info(`🚀 Creating releases for ${repositoryUrl}/${branch}`);
    core.info(`📦 Image: ${imageTag}`);
    core.info(`📝 Commit: ${commitSha.substring(0, 7)}`);
    core.debug(`Full payload: ${JSON.stringify(payload, null, 2)}`);

    // Call webhook
    const response = await axios.post(
      `${apiUrl}/api/v2/release-management/releases/webhook`,
      payload,
      {
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      }
    );

    const result = response.data;

    if (!result.success) {
      core.setFailed(`❌ Failed to create releases: ${result.message}`);
      core.setOutput('success', 'false');
      return;
    }

    // Set outputs
    core.setOutput('releases-created', result.releasesCreated.toString());
    core.setOutput('releases-auto-deployed', result.releasesAutoDeployed.toString());
    core.setOutput('service-id', result.serviceId || '');
    core.setOutput('service-name', result.serviceName || '');
    core.setOutput('success', 'true');

    // Log results
    core.info(`✅ ${result.message}`);
    core.info(`📦 Releases created: ${result.releasesCreated}`);
    core.info(`🚀 Auto-deployed: ${result.releasesAutoDeployed}`);
    
    if (result.releases && result.releases.length > 0) {
      core.startGroup('📋 Release Details');
      result.releases.forEach(release => {
        const emoji = release.autoDeployed ? '✅' : '⏸️';
        const status = release.requiresApproval ? '(requires approval)' : '';
        core.info(`${emoji} ${release.targetName}: ${release.status} ${status}`);
      });
      core.endGroup();
    }

    core.info('🎉 Release creation completed successfully!');

  } catch (error) {
    core.setOutput('success', 'false');
    
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      if (status === 401) {
        core.setFailed('❌ Authentication failed. Please check your API key.');
      } else if (status === 404) {
        core.setFailed('❌ Service not found. Verify repository URL and branch match your Kubigo service configuration.');
      } else {
        core.setFailed(`❌ API Error (${status}): ${JSON.stringify(data)}`);
      }
      
      core.debug(`Response status: ${status}`);
      core.debug(`Response data: ${JSON.stringify(data, null, 2)}`);
    } else if (error.request) {
      core.setFailed(`❌ Network error: Could not reach Kubigo API at ${core.getInput('api-url')}`);
      core.debug(`Request error: ${error.message}`);
    } else {
      core.setFailed(`❌ Error: ${error.message}`);
      core.debug(`Stack trace: ${error.stack}`);
    }
  }
}

run();
