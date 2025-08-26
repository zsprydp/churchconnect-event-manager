# Troubleshooting Guide - ChurchConnect Event Manager

## Quick Fix Commands

If you're having issues with the React app not starting, run these commands in order:

```bash
# Windows (Command Prompt)
npm run fresh-start
npm start

# If that doesn't work, try:
npm run fix:install
npm start
```

## Common Issues & Solutions

### 1. 'react-scripts' is not recognized as an internal or external command

**Symptoms:**
- Error message: `'react-scripts' is not recognized`
- Only ~30 packages install instead of 1000+

**Solution:**
```cmd
# Force install react-scripts
npm install react-scripts@5.0.1 --save-dev --force

# Then reinstall all dependencies
npm install

# Start the app
npm start
```

### 2. Module not found errors / ESLint config errors

**Symptoms:**
- `Failed to load config "react-app" to extend from`
- Various module resolution errors

**Solution:**
```cmd
# Clean install with legacy peer deps
npm run clean
npm install --legacy-peer-deps
```

### 3. React version incompatibility

**Symptoms:**
- Installation only completes with ~30 packages
- Peer dependency warnings about React versions

**Solution:**
```cmd
# Ensure React 18 (not 19) is installed
npm install react@18.2.0 react-dom@18.2.0 --save
npm install react-scripts@5.0.1 --force
npm install
```

### 4. Global vs Local react-scripts conflict

**Symptoms:**
- Webpack errors pointing to AppData/Roaming/npm folders
- Module resolution errors with global paths

**Solution:**
```cmd
# Remove global react-scripts
npm uninstall -g react-scripts

# Install locally
npm install react-scripts@5.0.1 --save
```

## Complete Reset Process

If nothing else works, follow these steps:

### Step 1: Clean Everything
```cmd
# Windows Command Prompt
rmdir /s /q node_modules
del package-lock.json
del .npmrc
npm cache clean --force
```

### Step 2: Check Configuration
```cmd
# Verify npm registry
npm get registry
# Should show: https://registry.npmjs.org/

# Check npm version
npm --version
# Should be 6.x or higher

# Check Node version  
node --version
# Should be 14.x or higher
```

### Step 3: Install Dependencies
```cmd
# Install React 18 (compatible with react-scripts 5.0.1)
npm install react@18.2.0 react-dom@18.2.0 --save

# Force install react-scripts
npm install react-scripts@5.0.1 --force

# Install remaining dependencies
npm install
```

### Step 4: Verify Installation
```cmd
# Check installed packages
npm list --depth=0

# Should see react-scripts@5.0.1 in the list
# Should have 1000+ total packages installed
```

### Step 5: Start Application
```cmd
npm start
```

## NPM Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run clean` | Remove node_modules and package-lock.json |
| `npm run clean:cache` | Clear npm cache |
| `npm run reinstall` | Clean and reinstall all dependencies |
| `npm run fix:install` | Force reinstall with react-scripts |
| `npm run fresh-start` | Complete reset with React 18 and forced react-scripts |
| `npm run fix:audit` | Fix security vulnerabilities |

## Environment Requirements

- **Node.js:** Version 14.x or higher
- **npm:** Version 6.x or higher
- **OS:** Windows 10/11 (scripts are Windows-specific)
- **React:** Version 18.x (React 19 not yet supported by react-scripts 5.0.1)

## Still Having Issues?

1. Check if you're in the correct directory
2. Ensure no antivirus is blocking npm
3. Try running Command Prompt as Administrator
4. Check if corporate proxy/firewall is blocking npm registry
5. Create a fresh React app to test if npm works:
   ```cmd
   npx create-react-app test-app
   cd test-app
   npm start
   ```

## Security Vulnerabilities

After successful installation, you might see vulnerability warnings. To address them:

```cmd
# Check what vulnerabilities exist
npm audit

# Auto-fix safe vulnerabilities
npm audit fix

# DO NOT use --force unless you know what you're doing
# npm audit fix --force can break dependencies
```

## Key Indicators of Success

✅ **Good Signs:**
- 1000+ packages installed (not just 30-40)
- `npm list` shows react-scripts@5.0.1
- App starts on http://localhost:3000
- Hot reload works when editing files

❌ **Bad Signs:**
- Only 30-50 packages installed
- react-scripts missing from npm list
- Errors about missing modules
- Webpack configuration errors

## Prevention Tips

1. Always use local react-scripts (never install globally)
2. Keep React at version 18.x until react-scripts supports 19
3. Commit package-lock.json to version control
4. Document Node/npm versions in README
5. Use `npm ci` instead of `npm install` in production/CI environments

---

Last Updated: August 2025
Tested with: Node v22.18.0, npm 10.9.3, React 18.2.0, react-scripts 5.0.1