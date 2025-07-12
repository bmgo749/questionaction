# GitHub Actions Environment Variable Fix

## Problem
GitHub Actions deployment failing dengan error:
```
Error! Project not found ({"VERCEL_PROJECT_ID":"prj_TMoYORqMmQ1mKMYh04qSWo3griMF","VERCEL_ORG_ID":"team_m9qh00IACWJhdRUEimwit93n"})
```

## Root Cause
GitHub Actions menggunakan environment variable yang di-set di repository settings, bukan dari workflow file.

## Solution
### Step 1: Remove Repository Environment Variables
1. Go to GitHub repository: https://github.com/bmgo749/queit
2. Go to **Settings** → **Secrets and variables** → **Actions**
3. Go to **Variables** tab
4. **DELETE** these environment variables:
   - `VERCEL_PROJECT_ID`
   - `VERCEL_ORG_ID`
   - Any other VERCEL_* variables

### Step 2: Verify Workflow File
The workflow file `.github/workflows/deploy.yml` already has correct hardcoded values:
- `vercel-org-id: team_m9qh00IACWJhdRUEimwit93n`
- `vercel-project-id: prj_sPnN4A76B6NnWF8DaUmahsQimNX7`

### Step 3: Push New Commit
After removing repository variables, push a new commit to trigger deployment:
```bash
git add .
git commit -m "Fix: Remove repository environment variables"
git push origin main
```

## Why This Happens
GitHub Actions prioritizes environment variables in this order:
1. Repository/Organization environment variables (HIGHEST PRIORITY)
2. Workflow file hardcoded values (LOWER PRIORITY)

## Verification
After fix, deployment should succeed with new project ID: `prj_sPnN4A76B6NnWF8DaUmahsQimNX7`

## Alternative: Update Repository Variables
If you prefer to keep repository variables:
1. Go to GitHub repository settings
2. Update `VERCEL_PROJECT_ID` to: `prj_sPnN4A76B6NnWF8DaUmahsQimNX7`
3. Keep `VERCEL_ORG_ID` as: `team_m9qh00IACWJhdRUEimwit93n`