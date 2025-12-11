# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2025-01-11

### 🎉 Initial Release

First public release of Kubigo Release Action.

### ✨ Features

- **Automatic Release Creation**: Create releases in Kubigo from CI/CD pipelines
- **Multi-Container Support**: Deploy multiple Docker images in a single release
- **Auto-Detection**: Automatically detects repository, branch, and commit from GitHub context
- **Auto-Deployment**: Automatically deploys to environments without approval requirements
- **Multi-Environment**: Support for multiple targets (dev, staging, production)
- **Rich Outputs**: Provides detailed outputs for downstream workflow steps
- **Secure Authentication**: API key-based authentication with SHA256 hashing

### 📦 Actions Included

- **Main Action** (`kubigo/release@v1`) - Create releases from CI/CD
- **Deploy Action** (`kubigo/release/deploy@v1`) - Deploy specific releases
- **Approve Action** (`kubigo/release/approve@v1`) - Approve pending releases
- **Rollback Action** (`kubigo/release/rollback@v1`) - Rollback to previous releases

### 🔧 Configuration

**Inputs:**
- `kubigo-url` - Kubigo API URL (required)
- `api-key` - Kubigo API Key (required)
- `image-tags` - Docker image tags, comma-separated for multi-container (required)
- `service-id` - Optional service ID override
- `triggered-by` - Who/what triggered the release (default: "github-actions")
- `repository-url` - Repository URL (auto-detected)
- `branch` - Git branch (auto-detected)
- `commit-sha` - Git commit SHA (auto-detected)

**Outputs:**
- `releases-created` - Number of releases created
- `releases-auto-deployed` - Number of releases auto-deployed
- `service-id` - ID of the matched service
- `service-name` - Name of the matched service
- `success` - Whether the operation was successful

### 📚 Documentation

- Comprehensive README with examples
- Quick start guide (5 minutes)
- Marketplace publishing guide
- Multi-container deployment examples
- Troubleshooting guide

### 🔐 Security

- API key authentication
- Secure key storage with SHA256 hashing
- Company-level isolation
- Usage tracking and auditing

---

## Migration Notes

### From kubigo-release-action to kubigo/release

If you were using an earlier version, update your workflows:

**Before:**
```yaml
- uses: kubigo/kubigo-release-action@v1
  with:
    api-url: ${{ secrets.KUBIGO_API_URL }}
    api-key: ${{ secrets.KUBIGO_API_KEY }}
    image-tag: myrepo/myapp:${{ github.sha }}
```

**After:**
```yaml
- uses: kubigo/release@v1
  with:
    kubigo-url: ${{ secrets.KUBIGO_URL }}
    api-key: ${{ secrets.KUBIGO_API_KEY }}
    image-tags: myrepo/myapp:${{ github.sha }}
```

**Changes:**
1. Repository renamed: `kubigo/kubigo-release-action` → `kubigo/release`
2. Input renamed: `api-url` → `kubigo-url`
3. Input renamed: `image-tag` → `image-tags` (now supports multiple)
4. Secret renamed: `KUBIGO_API_URL` → `KUBIGO_URL`

### Multi-Container Support

You can now deploy multiple containers in a single release:

```yaml
- uses: kubigo/release@v1
  with:
    kubigo-url: ${{ secrets.KUBIGO_URL }}
    api-key: ${{ secrets.KUBIGO_API_KEY }}
    # Multiple images separated by commas
    image-tags: myrepo/frontend:${{ github.sha }}, myrepo/backend:${{ github.sha }}, myrepo/worker:${{ github.sha }}
```

---

## Links

- [GitHub Repository](https://github.com/kubigo/release)
- [GitHub Marketplace](https://github.com/marketplace/actions/kubigo-release)
- [Documentation](https://github.com/kubigo/release#readme)
- [Report Issues](https://github.com/kubigo/release/issues)
