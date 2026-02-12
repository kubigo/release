# Kubigo Release Action

[![GitHub Marketplace](https://img.shields.io/badge/Marketplace-Kubigo%20Release-blue.svg?colorA=24292e&colorB=0366d6&style=flat&longCache=true&logo=github)](https://github.com/marketplace/actions/kubigo-release)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Deploy container images to Kubigo environments with a simple, 3-parameter configuration.

## ✨ Features

- **Ultra-simple**: Just 3 required inputs
- **Atomic targeting**: Single `target-id` identifies exactly where to deploy
- **Multi-container**: Deploy multiple images in one action
- **Git context**: Auto-captures commit, branch, and repository metadata
- **Fast**: Typically completes in < 2 seconds

## 🚀 Quick Start

### Prerequisites

1. **Kubigo Account** - Sign up at [kubigo.com](https://kubigo.com)
2. **API Key** - Generate in Kubigo: Settings → Integrations → API Keys
3. **Target ID** - Create a service with targets in Kubigo, copy the target ID

### Basic Usage

```yaml
name: Deploy to Kubigo

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build and Push Docker Image
        run: |
          docker build -t myrepo/myapp:${{ github.sha }} .
          docker push myrepo/myapp:${{ github.sha }}

      - name: Deploy to Kubigo
        uses: kubigo/release@v1
        with:
          api-key: ${{ secrets.KUBIGO_API_KEY }}
          target-id: my-team/api-service/production
          images: myrepo/myapp:${{ github.sha }}
```

**That's it!** Just 3 inputs:
1. `api-key` - Your Kubigo API key
2. `target-id` - Where to deploy (format: `project/service/target`)
3. `images` - Docker images to deploy

## 📖 Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `api-key` | ✅ Yes | - | Kubigo API Key (store in GitHub Secrets) |
| `target-id` | ✅ Yes | - | Target ID (UUID or database ID, e.g., `433453`) |
| `images` | ✅ Yes | - | Docker images (comma or newline-separated) |
| `kubigo-url` | ❌ No | `https://app.kubigo.cloud` | Kubigo API URL (self-hosted only) |
| `triggered-by` | ❌ No | `github-actions` | Who/what triggered this release |
| `repository-url` | ❌ No | Auto-detected | Repository URL (audit/tracking) |
| `branch` | ❌ No | Auto-detected | Git branch (audit/tracking) |
| `commit-sha` | ❌ No | Auto-detected | Git commit SHA (audit/tracking) |

### Target ID Format

The `target-id` is the unique database identifier for your deployment target.

Examples:
- `550e8400-e29b-41d4-a716-446655440000` (UUID)
- `433453` (numeric ID)

Get your target ID from the Kubigo dashboard: Service → Target → Copy ID

## 📤 Outputs

| Output | Description |
|--------|-------------|
| `release-id` | ID of the created release |
| `release-status` | Status (pending, deployed, failed) |
| `target-id` | Resolved target ID |
| `service-id` | Resolved service ID |
| `success` | Whether the operation succeeded |

## 📝 Examples

### With Outputs

```yaml
- name: Deploy to Kubigo
  id: deploy
  uses: kubigo/release@v1
  with:
    api-key: ${{ secrets.KUBIGO_API_KEY }}
    target-id: my-team/api-service/production
    images: myrepo/myapp:${{ github.sha }}

- name: Check Deployment
  run: |
    echo "✅ Release ID: ${{ steps.deploy.outputs.release-id }}"
    echo "📊 Status: ${{ steps.deploy.outputs.release-status }}"
```

### Multi-Container Deployment

```yaml
- name: Deploy Multiple Images
  uses: kubigo/release@v1
  with:
    api-key: ${{ secrets.KUBIGO_API_KEY }}
    target-id: my-team/microservices/production
    images: |
      myrepo/frontend:${{ github.sha }}
      myrepo/backend:${{ github.sha }}
      myrepo/worker:${{ github.sha }}
```

### Deploy to Staging

```yaml
- name: Deploy to Staging
  uses: kubigo/release@v1
  with:
    api-key: ${{ secrets.KUBIGO_API_KEY }}
    target-id: my-team/api-service/staging
    images: myrepo/myapp:${{ github.sha }}
```

### Conditional Production Deployment

```yaml
- name: Deploy to Production
  if: github.ref == 'refs/heads/main'
  uses: kubigo/release@v1
  with:
    api-key: ${{ secrets.KUBIGO_API_KEY }}
    target-id: my-team/api-service/production
    images: myrepo/myapp:${{ github.sha }}
```

### Matrix Deployment

```yaml
strategy:
  matrix:
    target: [staging, production]

steps:
  - name: Deploy to ${{ matrix.target }}
    uses: kubigo/release@v1
    with:
      api-key: ${{ secrets.KUBIGO_API_KEY }}
      target-id: my-team/api-service/${{ matrix.target }}
      images: myrepo/myapp:${{ github.sha }}
```

## 🔧 Setup Guide

### 1. Get Your Target ID

1. Log in to Kubigo
2. Navigate to your **Service**
3. Select the **Target** environment
4. Copy the **Target ID** shown (format: `project/service/target`)

### 2. Add API Key to GitHub

1. Go to your repository → **Settings → Secrets and variables → Actions**
2. Click **"New repository secret"**
3. Add:
   - **Name**: `KUBIGO_API_KEY`
   - **Value**: Your API key from Kubigo

### 3. Create Workflow

Create `.github/workflows/deploy.yml` using the examples above.

## 🔍 How It Works

```
┌─────────────────────┐
│  GitHub Push Event  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Build & Push      │
│   Docker Image      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Kubigo Release     │
│  Action             │
│  - target-id: p/s/t  │
│  - images: tag      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Kubigo API         │
│  - Validates key    │
│  - Resolves target  │
│  - Creates release  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Release Created    │
│  Status: deployed   │
└─────────────────────┘
```

## 🐛 Troubleshooting

### "Target not found"
-1. **Validate target-id** - Verify it's a valid target UUID/database ID
2. **Lookup target** - Fetch target details from database
3. **Validate access** - Ensure API key has access to the target's project
4. **Create release** - Proceed with release creation for the resolved target

### "Authentication failed"
- Verify your API key is correct
- Check the key hasn't been revoked

### "At least one image must be provided"
- Ensure `images` input is not empty
- Check image tags are valid

### Enable Debug Logging

```yaml
- name: Deploy to Kubigo
  uses: kubigo/release@v1
  with:
    api-key: ${{ secrets.KUBIGO_API_KEY }}
    target-id: my-team/api-service/production
    images: myrepo/myapp:${{ github.sha }}
  env:
    ACTIONS_STEP_DEBUG: true
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 💬 Support

- 📧 Email: support@kubigo.com
- 📚 Docs: [docs.kubigo.com](https://docs.kubigo.com)
- 🐛 Issues: [GitHub Issues](https://github.com/kubigo/release/issues)

---

Made with ❤️ by [Kubigo](https://kubigo.com)
