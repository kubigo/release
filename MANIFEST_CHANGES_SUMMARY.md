# Kubigo Release Action - Manifests Feature

## Summary of Changes
- Introduced an optional `manifests` parameter in `action.yml`. This parameter accepts a comma-separated or newline-separated list of file paths pointing to YAML manifests.
- Modified `src/index.js` to extract and parse the `manifests` input.
  - Added the `fs` module to read the contents of the given file paths.
  - Throws an error if any specified manifest file does not exist.
  - Collects each valid manifest's path and its content into an array of objects (`{ path, content }`).
  - Merged this array into the `payload` sent to the Kubigo API backend under the key `manifests`.
- Updated `README.md` to document the new `manifests` parameter, adding it to the Inputs table.
- Added a new configuration snippet in `README.md` demonstrating the usage of the `manifests` input alongside the `images` input for clarity.
- Ran `npm install` and `npm run build` to generate the updated `dist/` compilation artifacts containing the code changes.