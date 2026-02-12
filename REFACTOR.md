# Refactor Documentation: Simplified 3-Parameter API

## Overview

This document describes the refactor from a multi-parameter API to a simplified 3-parameter API for the Kubigo Release Action.

## Changes Summary

### Before (4 Required Parameters)

```yaml
- uses: kubigo/release@v1
  with:
    api-key: ${{ secrets.KUBIGO_API_KEY }}
    service: api-service
    target: production
    images: myrepo/myapp:v1.0.0
```

**Issues:**
- Multiple parameters needed to identify deployment target
- Ambiguous whether to use service ID or name
- Target name could conflict across projects
- More cognitive load for users

### After (3 Required Parameters)

```yaml
- uses: kubigo/release@v1
  with:
    api-key: ${{ secrets.KUBIGO_API_KEY }}
    target-id: my-team/api-service/production
    images: myrepo/myapp:v1.0.0
```

**Benefits:**
- Single `target-id` unambiguously identifies the deployment destination
- Atomic identifier - no partial matches or ambiguity
- Follows Git path convention (`project/service/target`)
- Easier to document and understand
- Reduces API surface area

## Files Changed

### 1. action.yml

**Removed:**
- `service` input (replaced by target-id)
- `target` input (replaced by target-id)

**Added:**
- `target-id` input - single identifier in format `project/service/target`

**Updated:**
- `releases-created` → `release-id` (single release per call)
- `releases-auto-deployed` → `release-status`
- `service-name` removed (not needed with explicit target-id)

### 2. src/index.js

**Key Changes:**
- Input parsing now uses `targetId` instead of `service` + `target`
- Payload structure simplified:
  ```javascript
  // Before
  {
    service: service,
    target: target,
    imageTags: imageTags,
    // ...
  }

  // After
  {
    targetId: targetId,  // Contains project/service/target
    imageTags: imageTags,
    // ...
  }
  ```
- Validation updated for 3 required fields
- Error messages updated to reference target-id
- Outputs updated to match new API

### 3. README.md

**Completely rewritten** with:
- New quick start example using 3-parameter API
- Updated inputs table
- New examples showing target-id format
- Simplified troubleshooting section
- Removed multi-environment batch deployment examples (now each target is explicit)

## API Payload Changes

### Old Webhook Payload

```json
{
  "service": "api-service",
  "target": "production",
  "imageTags": ["myrepo/myapp:v1.0.0"],
  "commitSha": "abc123",
  "repositoryUrl": "https://github.com/myorg/myrepo",
  "branch": "main",
  "triggeredBy": "github-actions",
  "metadata": { ... }
}
```

### New Webhook Payload

```json
{
  "targetId": "my-team/api-service/production",
  "imageTags": ["myrepo/myapp:v1.0.0"],
  "commitSha": "abc123",
  "repositoryUrl": "https://github.com/myorg/myrepo",
  "branch": "main",
  "triggeredBy": "github-actions",
  "metadata": { ... }
}
```

## Backend Requirements

The Kubigo API `/api/v2/release-management/releases/webhook` endpoint needs to:

1. **Parse targetId** - Split by `/` to extract project, service, and target
2. **Resolve IDs** - Convert names to internal UUIDs
3. **Validate access** - Ensure API key has access to the specified project
4. **Create release** - Proceed with release creation for the resolved target

## Migration Notes

Since this is a fresh project with no existing users, no migration path is needed. All documentation and examples use the new 3-parameter format.

## Testing Checklist

- [ ] action.yml validates correctly
- [ ] Required inputs are enforced
- [ ] target-id format is validated
- [ ] Images are parsed correctly (comma and newline separation)
- [ ] Payload is constructed correctly
- [ ] All outputs are set correctly
- [ ] Error handling works for 401, 404, 400 errors
- [ ] README examples are valid YAML

## Future Considerations

1. **Validation**: Could add client-side validation for target-id format
2. **Completion**: Could add wait-for-deployment option
3. **Outputs**: Could add deployment URL output once API supports it
