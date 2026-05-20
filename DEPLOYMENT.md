# Deployment Guide - Integration Under Constraint

## GitHub Pages Setup

### Step 1: Push to GitHub

If you haven't yet pushed the local repo to GitHub:

```bash
cd /home/claude/integration-under-constraint

# Add GitHub remote
git remote add origin https://github.com/RobbieD75/integration-under-constraint.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 2: Enable GitHub Pages

1. Go to your repo on GitHub
2. Settings → Pages
3. Source: Deploy from branch
4. Branch: `main`
5. Folder: `/public` (or `/` if renaming public to root)
6. Save

Your site will be live at: `https://robbied75.github.io/integration-under-constraint/`

### Step 3: File Structure for GitHub Pages

For GitHub Pages to serve correctly, move files to the root or adjust paths:

**Option A: Use /public as root (current)**
- Files in `/public` are served from root
- Make sure data.js can fetch from `../data/passages-complete.json`
- GitHub will need repo structure: `/data/` and `/public/`

**Option B: Move everything to root (simpler)**
```bash
# Flatten structure
mv public/* .
mv data/* .
# Delete empty folders
rmdir public data
```

Then adjust paths in data.js:
```javascript
const response = await fetch('./passages-complete.json');
```

### Step 4: Verify Deployment

Once pushed:
- Check GitHub → Actions (should see workflow)
- Visit `https://robbied75.github.io/integration-under-constraint/`
- Open browser console (F12) for any errors

### Troubleshooting

**Passages not loading?**
- Check browser console (F12 → Console tab)
- Verify `passages-complete.json` is in correct folder
- Check file paths in `data.js`

**Styles not applying?**
- Clear browser cache (Ctrl+Shift+Delete)
- Check CSS file path in index.html

**localStorage not working?**
- GitHub Pages uses secure context (HTTPS)
- localStorage should work fine
- Check browser Privacy settings

## Development (Local)

To test locally before pushing:

1. Start a simple HTTP server:
```bash
cd /home/claude/integration-under-constraint
python3 -m http.server 8000
```

2. Visit: `http://localhost:8000/public/`

3. Check console for errors (F12)

## Future Updates

To update passages or code:

```bash
# Make changes to any files
# Commit and push
git add .
git commit -m "Update passages / fix bug / add feature"
git push origin main

# GitHub automatically deploys within seconds
```

## Using Google Sheet Instead (Optional)

Currently, passages are in `/data/passages-complete.json`. To use Google Sheets instead:

1. Update `data.js` to fetch from Google Sheets API
2. Install n8n workflow to auto-sync Sheet → JSON
3. Re-export JSON to `/data/passages-complete.json` on update

This is Phase 3 (optional enhancement).
