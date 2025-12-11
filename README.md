# Kubigo Release Action

[![GitHub Marketplace](https://img.shields.io/badge/Marketplace-Kubigo%20Release-blue.svg?colorA=24292e&colorB=0366d6&style=flat&longCache=true&logo=github)](https://github.com/marketplace/actions/kubigo-release)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Automatically create releases in Kubigo after successful builds. This action integrates seamlessly with your CI/CD pipeline to deploy to multiple environments with approval workflows. Supports multi-container deployments.

## ✨ Features

- ✅ **Auto-detects** repository, branch, and commit from GitHub context
- 🚀 **Auto-deploys** to environments without approval requirements
- 📊 **Rich outputs** for downstream workflow steps
- 🔒 **Secure** API key authentication
- 📝 **Detailed logging** with release status
- 🎯 **Multi-environment** support (dev, staging, production)
- 🐳 **Multi-container** support for microservices
- ⚡ **Fast** - typically completes in < 2 seconds

## 🚀 Quick Start

### Prerequisites

1. **Kubigo Account** - Sign up at [kubigo.com](https://kubigo.com)
2. **API Key** - Generate in Kubigo: Settings → Integrations → API Keys
3. **Service Configured** - Create a service in Kubigo matching your repository

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
      
      - name: Build Docker Image
        run: |
          docker build -t myrepo/myapp:${{ github.sha }} .
          docker push myrepo/myapp:${{ github.sha }}
      
      - name: Create Release in Kubigo
        uses: kubigo/release@v1
        with:
          api-key: ${{ secrets.KUBIGO_API_KEY }}
          service: api-service
          images: myrepo/myapp:${{ github.sha }}
```

**That's it!** Just 3 inputs:
1. `api-key` - Your Kubigo API key
2. `service` - Service name (e.g., "api-service", "frontend-app")
3. `images` - Docker images to deploy

**Platform-agnostic design** - works with GitHub, GitLab, Azure DevOps, Jenkins, and any CI/CD platform!

## 📖 Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `api-key` | ✅ Yes | - | Kubigo API Key (store in GitHub Secrets) |
| `service` | ✅ Yes | - | Service name or ID (e.g., `api-service`, `frontend-app`) |
| `images` | ✅ Yes | - | Docker images (comma or newline-separated) |
| `target` | ❌ No | All targets | Specific target environment (e.g., `development`, `staging`, `production`) |
| `kubigo-url` | ❌ No | `https://api.kubigo.com` | Kubigo API URL (only needed for self-hosted) |
| `triggered-by` | ❌ No | `github-actions` | Who/what triggered this release |
| `repository-url` | ❌ No | Auto-detected | Repository URL (for audit/tracking only) |
| `branch` | ❌ No | Auto-detected | Git branch name (for audit/tracking only) |
| `commit-sha` | ❌ No | Auto-detected | Git commit SHA (for audit/tracking only) |

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
  uses: kubigo/release@v1
  with:
    api-key: ${{ secrets.KUBIGO_API_KEY }}
    service: api-service
    images: myrepo/myapp:${{ github.sha }}

- name: Check Results
  run: |
    echo "✅ Releases created: ${{ steps.kubigo.outputs.releases-created }}"
    echo "🚀 Auto-deployed: ${{ steps.kubigo.outputs.releases-auto-deployed }}"
    echo "📦 Service: ${{ steps.kubigo.outputs.service-name }}"
```

### Multi-Container Deployment

```yaml
- name: Build and Push Multiple Images
  run: |
    docker build -t myrepo/frontend:${{ github.sha }} ./frontend
    docker push myrepo/frontend:${{ github.sha }}
    
    docker build -t myrepo/backend:${{ github.sha }} ./backend
    docker push myrepo/backend:${{ github.sha }}
    
    docker build -t myrepo/worker:${{ github.sha }} ./worker
    docker push myrepo/worker:${{ github.sha }}

- name: Create Release
  uses: kubigo/release@v1
  with:
    api-key: ${{ secrets.KUBIGO_API_KEY }}
    service: microservices-app
    # Multiple images using YAML multiline (cleaner!)
    images: |
      myrepo/frontend:${{ github.sha }}
      myrepo/backend:${{ github.sha }}
      myrepo/worker:${{ github.sha }}
```

**Alternative (comma-separated):**
```yaml
- name: Create Release
  uses: kubigo/release@v1
  with:
    api-key: ${{ secrets.KUBIGO_API_KEY }}
    service: microservices-app
    images: myrepo/frontend:${{ github.sha }}, myrepo/backend:${{ github.sha }}, myrepo/worker:${{ github.sha }}
```

### With Specific Service ID

```yaml
- name: Create Release in Kubigo
  uses: kubigo/release@v1
  with:
    api-key: ${{ secrets.KUBIGO_API_KEY }}
    service: '123e4567-e89b-12d3-a456-426614174000'  # Can use GUID directly
    images: myrepo/myapp:${{ github.sha }}
```

### Multi-Environment Deployment

```yaml
- name: Build and Push
  run: |
    docker build -t myrepo/myapp:${{ github.sha }} .
    docker push myrepo/myapp:${{ github.sha }}

- name: Create Releases
  uses: kubigo/release@v1
  with:
    api-key: ${{ secrets.KUBIGO_API_KEY }}
    service: api-service
    images: myrepo/myapp:${{ github.sha }}
  # This will create releases for ALL configured targets:
  # - Development (auto-deploys)
  # - Staging (requires approval)
  # - Production (requires approval)
```

### With Custom Metadata

```yaml
- name: Create Release
  uses: kubigo/release@v1
  with:
    api-key: ${{ secrets.KUBIGO_API_KEY }}
    service: api-service
    images: myrepo/myapp:${{ github.sha }}
    triggered-by: ${{ github.actor }}
```

### Deploy to Specific Target

```yaml
- name: Deploy to Staging Only
  uses: kubigo/release@v1
  with:
    api-key: ${{ secrets.KUBIGO_API_KEY }}
    service: api-service
    images: myrepo/myapp:${{ github.sha }}
    target: staging  # Only creates release for staging environment
```

### Conditional Deployment

```yaml
- name: Create Release (Production Only)
  if: github.ref == 'refs/heads/main'
  uses: kubigo/release@v1
  with:
    api-key: ${{ secrets.KUBIGO_API_KEY }}
    service: api-service
    images: myrepo/myapp:${{ github.sha }}
    target: production
```

## 🔧 Setup Guide

### 1. Generate API Key

1. Log in to Kubigo
2. Navigate to **Settings → Integrations → API Keys**
3. Click **"Generate New API Key"**
4. Give it a descriptive name (e.g., "GitHub Actions - MyApp")
5. **Copy the key immediately** - it won't be shown again!

### 2. Add Secret to GitHub

1. Go to your repository on GitHub
2. Navigate to **Settings → Secrets and variables → Actions**
3. Click **"New repository secret"**
4. Add secret:
   - **Name**: `KUBIGO_API_KEY`
   - **Value**: The API key you generated

**Note**: No need to add `KUBIGO_URL` - it defaults to `https://api.kubigo.com`!

### 3. Configure Service in Kubigo

1. Create a **Service** in Kubigo
2. Give it a unique **Name** (e.g., `api-service`, `frontend-app`)
   - This name is what you'll use in the `service` input
   - Must be unique per company
3. Optionally set **Repository URL** and **Branch** (for reference only)
4. Add **Targets** (environments):
   - Development (no approval required)
   - Staging (approval required)
   - Production (approval required)

**Important**: The service name is the primary identifier - no coupling to git repo/branch!

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
- Check `kubigo-url` is correct
- Verify Kubigo API is accessible
- Check for firewall/proxy issues

### Enable Debug Logging

Add this to your workflow for detailed logs:

```yaml
- name: Create Release in Kubigo
  uses: kubigo/release@v1
  with:
    kubigo-url: ${{ secrets.KUBIGO_URL }}
    api-key: ${{ secrets.KUBIGO_API_KEY }}
    images: myrepo/myapp:${{ github.sha }}
  env:
    ACTIONS_STEP_DEBUG: true
```

## 🔗 Related Actions

This repository includes multiple actions:

- **Main Action** (`kubigo/release@v1`) - Create releases from CI/CD
- **Deploy Action** (`kubigo/release/deploy@v1`) - Deploy a specific release
- **Approve Action** (`kubigo/release/approve@v1`) - Approve pending releases
- **Rollback Action** (`kubigo/release/rollback@v1`) - Rollback to previous release

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 💬 Support

- 📧 Email: support@kubigo.com
- 💬 Discord: [Join our community](https://discord.gg/kubigo)
- 📚 Docs: [docs.kubigo.com](https://docs.kubigo.com)
- 🐛 Issues: [GitHub Issues](https://github.com/kubigo/release/issues)

## ⭐ Show Your Support

If this action helps you, please give it a ⭐ on GitHub!

---

Made with ❤️ by [Kubigo](https://kubigo.com)
