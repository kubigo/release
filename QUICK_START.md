# Quick Start Guide

Get up and running with Kubigo Release Action in 5 minutes! ⚡

## 1️⃣ Generate API Key (2 min)

1. Log in to Kubigo
2. Go to **Settings → Integrations → API Keys**
3. Click **"Generate New API Key"**
4. Name it: `GitHub Actions - [Your App Name]`
5. **Copy the key** (starts with `kb_live_`)

## 2️⃣ Add GitHub Secrets (1 min)

1. Go to your GitHub repository
2. **Settings → Secrets and variables → Actions**
3. Click **"New repository secret"**
4. Add these two secrets:

| Name | Value |
|------|-------|
| `KUBIGO_API_URL` | `https://api.kubigo.com` (or your instance URL) |
| `KUBIGO_API_KEY` | The key you copied above |

## 3️⃣ Create Workflow (2 min)

Create `.github/workflows/deploy.yml`:

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
      
      # Your existing build steps
      - name: Build Docker Image
        run: |
          docker build -t myrepo/myapp:${{ github.sha }} .
          docker push myrepo/myapp:${{ github.sha }}
      
      # Add this step
      - name: Create Release in Kubigo
        uses: kubigo/kubigo-release-action@v1
        with:
          api-url: ${{ secrets.KUBIGO_API_URL }}
          api-key: ${{ secrets.KUBIGO_API_KEY }}
          image-tag: myrepo/myapp:${{ github.sha }}
```

## 4️⃣ Push and Watch! 🎉

```bash
git add .github/workflows/deploy.yml
git commit -m "Add Kubigo deployment"
git push origin main
```

**That's it!** Check your Kubigo dashboard to see releases being created automatically.

---

## What Happens Next?

When you push code:

1. ✅ GitHub Actions builds your Docker image
2. ✅ Kubigo Release Action creates releases for ALL your targets
3. ✅ Development environment auto-deploys
4. ⏸️ Staging/Production wait for your approval

---

## Need Help?

- 📚 [Full Documentation](README.md)
- 🐛 [Report Issues](https://github.com/kubigo/kubigo-release-action/issues)
- 💬 [Get Support](mailto:support@kubigo.com)

---

**Happy Deploying!** 🚀
