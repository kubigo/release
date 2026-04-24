const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios');

async function run() {
  try {
    // Get required inputs
    const apiKey = core.getInput('api-key', { required: true });
    const targetId = core.getInput('target-id', { required: true });
    const imagesInput = core.getInput('images', { required: true });

    // Get optional inputs
    const kubigoUrl = core.getInput('kubigo-url') || 'https://app.kubigo.cloud';
    const triggeredBy = core.getInput('triggered-by') || 'github-actions';
    const changelogInput = core.getInput('changelog');
    const changelog = changelogInput ? changelogInput.replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t').replace(/\\"/g, '"').replace(/\\\\/g, '\\') : undefined;

    // Validate required fields
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('Input "api-key" is required but was not provided');
    }
    if (!targetId || targetId.trim() === '') {
      throw new Error('Input "target-id" is required but was not provided');
    }
    if (!imagesInput || imagesInput.trim() === '') {
      throw new Error('Input "images" is required but was not provided');
    }

    // Parse images - supports both comma-separated and newline-separated
    const imageTags = imagesInput
      .split(/[\n,]/)  // Split by newline or comma
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);  // Remove empty lines

    if (imageTags.length === 0) {
      throw new Error('At least one image must be provided');
    }

    // Auto-detect git metadata from GitHub context or use provided values
    const repositoryUrl = core.getInput('repository-url') ||
      `${github.context.serverUrl}/${github.context.repo.owner}/${github.context.repo.repo}`;
    const branch = core.getInput('branch') ||
      (github.context.ref.startsWith('refs/heads/') ? github.context.ref.replace('refs/heads/', '') : github.context.ref);
    const commitSha = core.getInput('commit-sha') || github.context.sha;

    // Build webhook payload
    const payload = {
      targetId: targetId,         // REQUIRED: Target identifier (project/service/target)
      imageTags: imageTags,       // REQUIRED: Images to deploy
      commitSha: commitSha,       // OPTIONAL: For audit/tracking
      repositoryUrl: repositoryUrl, // OPTIONAL: For audit/tracking
      branch: branch,             // OPTIONAL: For audit/tracking
      triggeredBy: triggeredBy,   // OPTIONAL: Who triggered
      ...(changelog && { changelog: changelog }), // OPTIONAL: Changelog
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

    core.info(`🚀 Deploying to target: ${targetId}`);
    core.info(`📦 Images (${imageTags.length}):`);
    imageTags.forEach(tag => core.info(`   - ${tag}`));
    core.info(`📝 Commit: ${commitSha.substring(0, 7)}`);
    core.info(`🌐 Platform: GitHub Actions`);
    core.debug(`Full payload: ${JSON.stringify(payload, null, 2)}`);

    // Call webhook
    const response = await axios.post(
      `${kubigoUrl}/api/v2/release-management/releases/webhook`,
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
      core.setFailed(`❌ Failed to create release: ${result.message}`);
      core.setOutput('success', 'false');
      return;
    }

    // Set outputs
    core.setOutput('release-id', result.releaseId || '');
    core.setOutput('release-status', result.status || '');
    core.setOutput('target-id', result.targetId || '');
    core.setOutput('service-id', result.serviceId || '');
    core.setOutput('success', 'true');

    // Log results
    core.info(`✅ ${result.message}`);
    core.info(`🆔 Release ID: ${result.releaseId}`);
    core.info(`� Status: ${result.status}`);

    core.info('🎉 Deployment completed successfully!');

  } catch (error) {
    core.setOutput('success', 'false');

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      if (status === 401) {
        core.setFailed('❌ Authentication failed. Please check your API key.');
      } else if (status === 404) {
        core.setFailed('❌ Target not found. Please verify the targetid is correct.');
      } else if (status === 400) {
        core.setFailed(`❌ Bad request: ${data.message || 'Invalid parameters'}`);
      } else {
        core.setFailed(`❌ API Error (${status}): ${JSON.stringify(data)}`);
      }

      core.debug(`Response status: ${status}`);
      core.debug(`Response data: ${JSON.stringify(data, null, 2)}`);
    } else if (error.request) {
      core.setFailed(`❌ Network error: Could not reach Kubigo API at ${core.getInput('kubigo-url')}`);
      core.debug(`Request error: ${error.message}`);
    } else {
      core.setFailed(`❌ Error: ${error.message}`);
      core.debug(`Stack trace: ${error.stack}`);
    }
  }
}

run();
