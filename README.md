# Kubigo Release Action

[![GitHub Marketplace](https://img.shields.io/badge/Marketplace-Kubigo%20Release%20Action-blue.svg?colorA=24292e&colorB=0366d6&style=flat&longCache=true&logo=github)](https://github.com/marketplace/actions/kubigo-release-action)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Automatically create releases in Kubigo after successful builds. This action integrates seamlessly with your CI/CD pipeline to deploy to multiple environments with approval workflows.

## ✨ Features

- ✅ **Auto-detects** repository, branch, and commit from GitHub context
- 🚀 **Auto-deploys** to environments without approval requirements
- 📊 **Rich outputs** for downstream workflow steps
- 🔒 **Secure** API key authentication
- 📝 **Detailed logging** with release status
- 🎯 **Multi-environment** support (dev, staging, production)
- ⚡ **Fast** - typically completes in < 2 seconds

## 🚀 Quick Start

### Prerequisites

1. **Kubigo Account** - Sign up at [kubigo.com](https://kubigo.com)
2. **API Key** - Generate in Kubigo: Settings → Integrations → API Keys
3. **Service Configured** - Create a service in Kubigo matching your repository

### Basic Usage

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Build Docker Image
        run: |
          docker build -t myrepo/myapp:${{ github.sha }} .
          docker push myrepo/myapp:${{ github.sha }}
      
      - name: Create Release in Kubigo
        uses: kubigo/kubigo-release-action@v1
        with:
          api-url: ${{ secrets.KUBIGO_API_URL }}
          api-key: ${{ secrets.KUBIGO_API_KEY }}
          image-tag: myrepo/myapp:${{ github.sha }}
```

## 📖 Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `api-url` | ✅ Yes | - | Kubigo API URL (e.g., `https://api.kubigo.com`) |
| `api-key` | ✅ Yes | - | Kubigo API Key (store in GitHub Secrets) |
| `image-tag` | ✅ Yes | - | Docker image tag to deploy |
| `service-id` | ❌ No | - | Specific service ID (overrides repository matching) |
| `triggered-by` | ❌ No | `github-actions` | Who/what triggered this release |
| `repository-url` | ❌ No | Auto-detected | Repository URL |
| `branch` | ❌ No | Auto-detected | Git branch name |
| `commit-sha` | ❌ No | Auto-detected | Git commit SHA |

## 📤 Outputs

| Output | Description | Example |
|--------|-------------|---------|
| `releases-created` | Number of releases created | `3` |
| `releases-auto-deployed` | Number of releases auto-deployed | `1` |
| `service-id` | ID of the matched service | `123e4567-e89b-12d3-...` |
| `service-name` | Name of the matched service | `API Service` |
| `success` | Whether the operation was successful | `true` |

## 🎯 Advanced Examples

### With Outputs

```yaml
- name: Create Release in Kubigo
  id: kubigo
  uses: kubigo/kubigo-release-action@v1
  with:
    api-url: ${{ secrets.KUBIGO_API_URL }}
    api-key: ${{ secrets.KUBIGO_API_KEY }}
    image-tag: myrepo/myapp:${{ github.sha }}

- name: Check Results
  run: |
    echo "✅ Releases created: ${{ steps.kubigo.outputs.releases-created }}"
    echo "🚀 Auto-deployed: ${{ steps.kubigo.outputs.releases-auto-deployed }}"
    echo "📦 Service: ${{ steps.kubigo.outputs.service-name }}"
```

### With Specific Service ID

```yaml
- name: Create Release in Kubigo
  uses: kubigo/kubigo-release-action@v1
  with:
    api-url: ${{ secrets.KUBIGO_API_URL }}
    api-key: ${{ secrets.KUBIGO_API_KEY }}
    image-tag: myrepo/myapp:${{ github.sha }}
    service-id: '123e4567-e89b-12d3-a456-426614174000'
```

### Multi-Environment Deployment

```yaml
- name: Build and Push
  run: |
    docker build -t myrepo/myapp:${{ github.sha }} .
    docker push myrepo/myapp:${{ github.sha }}

- name: Create Releases
  uses: kubigo/kubigo-release-action@v1
  with:
    api-url: ${{ secrets.KUBIGO_API_URL }}
    api-key: ${{ secrets.KUBIGO_API_KEY }}
    image-tag: myrepo/myapp:${{ github.sha }}
  # This will create releases for ALL configured targets:
  # - Development (auto-deploys)
  # - Staging (requires approval)
  # - Production (requires approval)
```

### With Custom Metadata

```yaml
- name: Create Release
  uses: kubigo/kubigo-release-action@v1
  with:
    api-url: ${{ secrets.KUBIGO_API_URL }}
    api-key: ${{ secrets.KUBIGO_API_KEY }}
    image-tag: myrepo/myapp:${{ github.sha }}
    triggered-by: ${{ github.actor }}
```

### Conditional Deployment

```yaml
- name: Create Release (Production Only)
  if: github.ref == 'refs/heads/main'
  uses: kubigo/kubigo-release-action@v1
  with:
    api-url: ${{ secrets.KUBIGO_API_URL }}
    api-key: ${{ secrets.KUBIGO_API_KEY }}
    image-tag: myrepo/myapp:${{ github.sha }}
```

## 🔧 Setup Guide

### 1. Generate API Key

1. Log in to Kubigo
2. Navigate to **Settings → Integrations → API Keys**
3. Click **"Generate New API Key"**
4. Give it a descriptive name (e.g., "GitHub Actions - MyApp")
5. **Copy the key immediately** - it won't be shown again!

### 2. Add Secrets to GitHub

1. Go to your repository on GitHub
2. Navigate to **Settings → Secrets and variables → Actions**
3. Click **"New repository secret"**
4. Add two secrets:
   - `KUBIGO_API_URL`: Your Kubigo API URL (e.g., `https://api.kubigo.com`)
   - `KUBIGO_API_KEY`: The API key you generated

### 3. Configure Service in Kubigo

1. Create a **Service** in Kubigo
2. Set the **Repository URL** to match your GitHub repo (e.g., `https://github.com/user/repo`)
3. Set the **Branch** (e.g., `main`)
4. Add **Targets** (environments):
   - Development (no approval required)
   - Staging (approval required)
   - Production (approval required)

### 4. Add Workflow

Create `.github/workflows/deploy.yml` in your repository with the example above.

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
│  Action (this)      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Kubigo API         │
│  - Validates key    │
│  - Finds service    │
│  - Creates releases │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────┐
│  Releases Created:              │
│  ✅ Dev (auto-deployed)         │
│  ⏸️  Staging (pending approval) │
│  ⏸️  Prod (pending approval)    │
└─────────────────────────────────┘
```

## 🐛 Troubleshooting

### "Authentication failed"
- Verify your API key is correct
- Check the key hasn't been revoked
- Ensure the key hasn't expired

### "Service not found"
- Verify repository URL matches exactly
- Check branch name is correct
- Ensure service is active in Kubigo

### "Network error"
- Check `api-url` is correct
- Verify Kubigo API is accessible
- Check for firewall/proxy issues

### Enable Debug Logging

Add this to your workflow for detailed logs:

```yaml
- name: Create Release in Kubigo
  uses: kubigo/kubigo-release-action@v1
  with:
    api-url: ${{ secrets.KUBIGO_API_URL }}
    api-key: ${{ secrets.KUBIGO_API_KEY }}
    image-tag: myrepo/myapp:${{ github.sha }}
  env:
    ACTIONS_STEP_DEBUG: true
```

## 🔗 Related Actions

- [kubigo-deploy-action](https://github.com/kubigo/kubigo-deploy-action) - Deploy a specific release
- [kubigo-approve-action](https://github.com/kubigo/kubigo-approve-action) - Approve pending releases
- [kubigo-rollback-action](https://github.com/kubigo/kubigo-rollback-action) - Rollback to previous release

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 💬 Support

- 📧 Email: support@kubigo.com
- 💬 Discord: [Join our community](https://discord.gg/kubigo)
- 📚 Docs: [docs.kubigo.com](https://docs.kubigo.com)
- 🐛 Issues: [GitHub Issues](https://github.com/kubigo/kubigo-release-action/issues)

## ⭐ Show Your Support

If this action helps you, please give it a ⭐ on GitHub!

---

Made with ❤️ by [Kubigo](https://kubigo.com)
