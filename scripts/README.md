# 🔧 BookMyBlock Scripts

This folder contains utility scripts for development, deployment, and maintenance.

## 📋 Script Index

### 🚀 Deployment Scripts
- **[deploy-all-contracts.sh](deploy-all-contracts.sh)** - Deploy all UserAuth contracts to Ganache
- **[clean-deploy.sh](clean-deploy.sh)** - Clean deployment (removes duplicates)
- **[cleanup-ganache.sh](cleanup-ganache.sh)** - Interactive cleanup utility
- **[verify-truffle-setup.sh](verify-truffle-setup.sh)** - Verify Truffle configuration and files

### 🛠️ Development Scripts  
- **[restart-dev.sh](restart-dev.sh)** - Clean restart all development servers
- **[test-env.js](test-env.js)** - Test environment variable configuration
- **[check-privy-config.js](check-privy-config.js)** - Check Privy configuration status

### 🌐 Network Scripts
- **[proxy-server.js](proxy-server.js)** - Proxy server for single-port development (alternative setup)

## 🎯 Quick Usage

### Deploy Smart Contracts
```bash
# Make sure Ganache is running first
ganache-cli -p 7545

# Deploy all contracts
./scripts/deploy-all-contracts.sh
```

### Verify Setup
```bash
# Check if all files are properly configured
./scripts/verify-truffle-setup.sh
```

### Clean Restart
```bash
# Clean cache and restart all services
./scripts/restart-dev.sh
```

### Test Configuration
```bash
# Test environment variables
node scripts/test-env.js

# Check Privy setup
node scripts/check-privy-config.js
```

## 📖 Script Details

### deploy-all-contracts.sh
**Purpose**: Deploy UserAuth contracts for all three dashboards to Ganache
**Requirements**: Ganache running on port 7545
**Output**: Contract addresses and updated .env files

```bash
# Usage
./scripts/deploy-all-contracts.sh

# What it does:
# 1. Checks Ganache connection
# 2. Deploys User contract
# 3. Deploys Admin contract  
# 4. Deploys Owner contract
# 5. Updates .env files with addresses
# 6. Shows deployment summary
```

### verify-truffle-setup.sh
**Purpose**: Verify all Truffle files and configuration are correct
**Requirements**: None
**Output**: Setup verification report

```bash
# Usage
./scripts/verify-truffle-setup.sh

# What it checks:
# 1. Contract files exist
# 2. Migration files exist
# 3. Test files exist
# 4. Configuration files exist
# 5. Dependencies installed
```

### restart-dev.sh
**Purpose**: Clean restart development environment
**Requirements**: None
**Output**: Clean cache and restart servers

```bash
# Usage
./scripts/restart-dev.sh

# What it does:
# 1. Clears build artifacts
# 2. Clears Vite cache
# 3. Restarts all dev servers
# 4. Shows server URLs
```

### test-env.js
**Purpose**: Test environment variable configuration
**Requirements**: Node.js
**Output**: Environment variable status report

```bash
# Usage
node scripts/test-env.js

# What it checks:
# 1. .env files exist
# 2. Required variables present
# 3. Privy App IDs configured
# 4. API URLs configured
```

### check-privy-config.js
**Purpose**: Check Privy configuration and troubleshoot issues
**Requirements**: Node.js
**Output**: Privy configuration status and troubleshooting tips

```bash
# Usage
node scripts/check-privy-config.js

# What it shows:
# 1. Current Privy App IDs
# 2. Dashboard port mapping
# 3. Common issues and solutions
# 4. Next steps for fixing problems
```

### proxy-server.js
**Purpose**: Alternative single-port development setup
**Requirements**: Node.js, http-proxy-middleware
**Output**: Proxy server on port 3000

```bash
# Usage (alternative to multi-port setup)
node scripts/proxy-server.js

# What it provides:
# 1. User dashboard: localhost:3000/user
# 2. Admin dashboard: localhost:3000/admin
# 3. Owner dashboard: localhost:3000/owner
```

## 🔧 Making Scripts Executable

All shell scripts need execute permissions:

```bash
# Make all scripts executable
chmod +x scripts/*.sh

# Or individually
chmod +x scripts/deploy-all-contracts.sh
chmod +x scripts/verify-truffle-setup.sh
chmod +x scripts/restart-dev.sh
```

## 🐛 Troubleshooting Scripts

### If deploy-all-contracts.sh fails:
1. Check Ganache is running: `curl http://127.0.0.1:7545`
2. Verify contracts compile: `cd User/packages/contracts && npm run compile`
3. Check migration files exist: `./scripts/verify-truffle-setup.sh`

### If verify-truffle-setup.sh shows missing files:
1. Check if Truffle is installed: `npm list truffle`
2. Verify file paths are correct
3. Re-run Truffle init if needed: `npx truffle init`

### If restart-dev.sh doesn't work:
1. Manually stop all processes: `pkill -f "npm run dev"`
2. Clear cache manually: `rm -rf */packages/*/node_modules/.vite`
3. Restart individual services

## 📝 Adding New Scripts

When adding new scripts:

1. **Create the script** in the `scripts/` folder
2. **Make it executable**: `chmod +x scripts/your-script.sh`
3. **Add documentation** to this README
4. **Test thoroughly** before committing
5. **Update main README** if it's a commonly used script

## 🎯 Best Practices

### Shell Scripts
- Use `#!/bin/bash` shebang
- Add error checking with `set -e`
- Provide clear output messages
- Handle edge cases gracefully

### Node.js Scripts
- Use clear console output
- Handle errors properly
- Provide helpful error messages
- Keep dependencies minimal

### Documentation
- Explain what the script does
- List requirements
- Show example usage
- Include troubleshooting tips

---

**Need help with a script? Check the main [README](../README.md) or the [docs](../docs/) folder!**