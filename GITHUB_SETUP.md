# GitHub Integration Setup Guide

## 🚀 Quick Setup for Automatic GitHub Commits

### What's Already Done ✅

1. **Git Repository Initialized** - Your project is now a git repository
2. **Auto-commit Script Created** - `auto-commit.ps1` will automatically commit changes
3. **Batch File Created** - `commit.bat` for easy execution
4. **Initial Commit Made** - All current files are committed

### Step 1: Create GitHub Repository

1. Go to [GitHub.com](https://github.com)
2. Click "New repository"
3. Name it `churchconnect-event-manager`
4. Make it **Public** or **Private** (your choice)
5. **Don't** initialize with README (we already have one)
6. Click "Create repository"

### Step 2: Connect to GitHub

After creating the repository, GitHub will show you commands. Run these in your project folder:

```bash
git remote add origin https://github.com/YOUR_USERNAME/churchconnect-event-manager.git
git branch -M main
git push -u origin main
```

### Step 3: Test Auto-commit

1. Make a small change to any file
2. Run the auto-commit script:
   ```bash
   .\commit.bat
   ```
   or
   ```bash
   powershell -ExecutionPolicy Bypass -File "auto-commit.ps1"
   ```

### Step 4: Set Up Automatic Commits

#### Option A: Manual (Recommended for now)
- After making changes, run `.\commit.bat`
- This gives you control over when to commit

#### Option B: Automatic (Advanced)
- Set up a file watcher or IDE integration
- Configure your editor to run the script on save

## 🔧 How to Use

### Making Changes and Committing

1. **Edit your files** (App.js, etc.)
2. **Test your changes** (`npm start`)
3. **Run auto-commit:**
   ```bash
   .\commit.bat
   ```
4. **Check GitHub** - Your changes will be pushed automatically

### Custom Commit Messages

```bash
.\commit.bat "Added new email feature"
```

### Checking Status

```bash
git status
```

## 📋 What Gets Committed

The auto-commit script will commit:
- ✅ All source code changes
- ✅ Configuration files
- ✅ Documentation updates
- ✅ Package dependencies
- ✅ Build files (if any)

## 🛠️ Troubleshooting

### Issue: "Permission denied"
**Solution:**
```bash
powershell -ExecutionPolicy Bypass -File "auto-commit.ps1"
```

### Issue: "Remote not found"
**Solution:**
1. Make sure you've added the remote:
   ```bash
   git remote add origin YOUR_GITHUB_URL
   ```
2. Check your remote:
   ```bash
   git remote -v
   ```

### Issue: "Authentication failed"
**Solution:**
1. Use GitHub CLI: `gh auth login`
2. Or set up SSH keys
3. Or use Personal Access Token

## 📊 Benefits

- **Version Control** - Track all changes
- **Backup** - Your code is safely stored on GitHub
- **Collaboration** - Share with team members
- **History** - See what changed and when
- **Rollback** - Revert to previous versions if needed

## 🎯 Next Steps

1. **Set up GitHub repository** (if not done)
2. **Test the auto-commit script**
3. **Make your first real commit**
4. **Share the repository** with your team
5. **Set up branch protection** (optional)

## 📝 Commit History

Your commits will look like:
```
Auto-commit: Updated ChurchConnect Event Manager - 2024-01-15 14:30:25
Auto-commit: Added email functionality - 2024-01-15 14:35:10
Auto-commit: Fixed volunteer assignment bug - 2024-01-15 14:40:15
```

## 🔒 Security Notes

- Never commit sensitive data (API keys, passwords)
- Use environment variables for secrets
- Review commits before pushing
- Consider using `.gitignore` for sensitive files

Your ChurchConnect Event Manager is now ready for automatic GitHub commits! 🎉
