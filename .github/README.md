# CI/CD Pipeline Documentation

This directory contains the GitHub Actions workflows for the Coupon Management Platform.

## Workflows

### CI Workflow (`ci.yml`)

Runs on every push and pull request to `main` and `develop` branches.

**Jobs:**

1. **Lint and Type Check**
   - Runs ESLint on all packages
   - Runs TypeScript type checking
   - Checks code formatting with Prettier
   - Fails if any issues found

2. **Build**
   - Builds all packages and apps
   - Uses dummy environment variables for build
   - Uploads build artifacts
   - Depends on lint and type check passing

3. **Test**
   - Runs all test suites
   - Includes unit tests and property-based tests
   - Depends on lint and type check passing

4. **Security Audit**
   - Runs `pnpm audit` to check for vulnerabilities
   - Continues on error (doesn't fail the build)
   - Alerts team to security issues

5. **Bundle Analysis** (PR only)
   - Analyzes bundle size on pull requests
   - Helps catch bundle size regressions
   - Comments on PR with results (if configured)

6. **Notify Success**
   - Runs only on main branch
   - Notifies team of successful deployment readiness

## Setup Instructions

### 1. Enable GitHub Actions

GitHub Actions should be enabled by default. Verify in:
- Repository Settings → Actions → General
- Ensure "Allow all actions and reusable workflows" is selected

### 2. Configure Secrets (Optional)

If you want to run tests that require environment variables:

1. Go to Repository Settings → Secrets and variables → Actions
2. Add the following secrets:
   - `SUPABASE_URL` (for integration tests)
   - `SUPABASE_ANON_KEY` (for integration tests)
   - `OPENAI_API_KEY` (for AI extraction tests)

**Note:** These are optional. The CI pipeline uses dummy values for builds.

### 3. Branch Protection Rules

Recommended branch protection for `main`:

1. Go to Repository Settings → Branches
2. Add rule for `main` branch:
   - ✅ Require a pull request before merging
   - ✅ Require approvals: 1
   - ✅ Require status checks to pass before merging
     - Select: `Lint and Type Check`, `Build`, `Test`
   - ✅ Require branches to be up to date before merging
   - ✅ Do not allow bypassing the above settings

### 4. Vercel Integration

Vercel automatically deploys on:
- **Production**: Pushes to `main` branch
- **Preview**: Pull requests and pushes to other branches

**Setup:**
1. Connect repository to Vercel
2. Configure build settings (see `DEPLOYMENT.md`)
3. Add environment variables in Vercel dashboard
4. Enable automatic deployments

## Workflow Triggers

### Push to Main/Develop
```yaml
on:
  push:
    branches: [main, develop]
```

Runs full CI pipeline including:
- Lint and type check
- Build
- Test
- Security audit

### Pull Request
```yaml
on:
  pull_request:
    branches: [main, develop]
```

Runs full CI pipeline plus:
- Bundle size analysis
- Preview deployment (via Vercel)

## Caching Strategy

The workflow uses pnpm caching to speed up builds:

```yaml
- name: Setup pnpm cache
  uses: actions/cache@v3
  with:
    path: ${{ steps.pnpm-cache.outputs.STORE_PATH }}
    key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
```

**Benefits:**
- Faster dependency installation
- Reduced GitHub Actions minutes usage
- Consistent builds

## Environment Variables

### Build-Time Variables

The CI pipeline uses dummy values for build:

```yaml
env:
  NEXT_PUBLIC_SUPABASE_URL: https://example.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: BExampleVapidPublicKey
```

These allow the build to complete without real credentials.

### Runtime Variables

Runtime variables are configured in Vercel and not needed for CI builds.

## Troubleshooting

### Build Fails on CI but Works Locally

**Possible causes:**
1. Missing dependencies in `package.json`
2. Environment-specific code
3. Different Node.js versions

**Solutions:**
1. Ensure all dependencies are listed in `package.json`
2. Use `process.env.NODE_ENV` checks for environment-specific code
3. Match Node.js version in workflow with local version

### Tests Fail on CI but Pass Locally

**Possible causes:**
1. Missing environment variables
2. Timezone differences
3. Race conditions in tests

**Solutions:**
1. Add required secrets to GitHub Actions
2. Use UTC for all date comparisons
3. Add proper test isolation and cleanup

### Workflow Takes Too Long

**Optimization strategies:**
1. Use caching (already implemented)
2. Run jobs in parallel (already implemented)
3. Skip unnecessary steps on certain branches
4. Use self-hosted runners (advanced)

### Security Audit Fails

**What to do:**
1. Review the audit report
2. Update vulnerable dependencies: `pnpm update`
3. Check for breaking changes
4. Test thoroughly after updates
5. If no fix available, document the risk

## Monitoring

### GitHub Actions Dashboard

View workflow runs:
1. Go to repository → Actions tab
2. See all workflow runs and their status
3. Click on a run to see detailed logs

### Notifications

Configure notifications:
1. Go to GitHub Settings → Notifications
2. Enable "Actions" notifications
3. Choose email or web notifications

### Metrics

Track CI/CD metrics:
- Build success rate
- Average build time
- Test pass rate
- Deployment frequency

## Best Practices

### 1. Keep Workflows Fast

- Use caching
- Run jobs in parallel
- Skip unnecessary steps
- Optimize test suites

### 2. Fail Fast

- Run quick checks first (lint, type check)
- Run expensive checks later (build, test)
- Stop on first failure

### 3. Secure Secrets

- Never log secrets
- Use GitHub Secrets for sensitive data
- Rotate secrets regularly
- Limit secret access

### 4. Maintain Workflows

- Review and update dependencies
- Keep actions up to date
- Remove unused workflows
- Document changes

## Advanced Configuration

### Custom Workflow

Create custom workflows for specific needs:

```yaml
name: Custom Workflow

on:
  workflow_dispatch:  # Manual trigger
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday

jobs:
  custom-job:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Custom step
        run: echo "Custom workflow"
```

### Matrix Builds

Test across multiple Node.js versions:

```yaml
strategy:
  matrix:
    node-version: [18, 20]

steps:
  - uses: actions/setup-node@v4
    with:
      node-version: ${{ matrix.node-version }}
```

### Conditional Steps

Run steps based on conditions:

```yaml
- name: Deploy to staging
  if: github.ref == 'refs/heads/develop'
  run: pnpm deploy:staging
```

## Related Documentation

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Deployment Guide](../DEPLOYMENT.md)
- [Environment Variables](../ENVIRONMENT_VARIABLES.md)
- [Production Readiness](../PRODUCTION_READINESS.md)

## Support

For CI/CD issues:
- Check workflow logs in GitHub Actions tab
- Review this documentation
- Contact DevOps team
- Open an issue in the repository
