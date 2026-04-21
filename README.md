# WebScreen

The simplest way to share your iPad screen to any computer. 

## 🚀 Deployment to GitHub Pages

If you are seeing this README instead of the application on your GitHub Pages site, please follow these steps:

1.  **Configure GitHub Pages Source:**
    *   Go to your repository **Settings** on GitHub.
    *   Select **Pages** from the left sidebar.
    *   Under **Build and deployment > Source**, select **GitHub Actions** from the dropdown.

2.  **Trigger the Deployment:**
    *   Once you've changed the source, the GitHub Action in `.github/workflows/deploy.yml` will handle the build and deployment automatically whenever you push to `main`.
    *   You can manually trigger it from the **Actions** tab by selecting "Deploy Next.js site to Pages" and clicking "Run workflow".

## 🛠 Features

- **P2P Streaming:** Uses WebRTC (via PeerJS) for low-latency, direct screen sharing.
- **Privacy:** Optional password protection for sessions.
- **No Install:** Works entirely in the browser using `getDisplayMedia`.
- **Full Screen:** Viewer can toggle full screen mode for a clear view.

## 💻 Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build static version
npm run build
```
