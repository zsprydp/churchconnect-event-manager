# Auto-commit script for ChurchConnect Event Manager
# This script automatically commits changes to git after every update

param(
    [string]$CommitMessage = "Auto-commit: Updated ChurchConnect Event Manager"
)

Write-Host "Auto-commit script starting..." -ForegroundColor Yellow

# Check if there are any changes to commit
$status = git status --porcelain

if ($status) {
    Write-Host "Changes detected, committing..." -ForegroundColor Green
    
    # Add all changes
    git add .
    
    # Commit with timestamp
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $fullMessage = "$CommitMessage - $timestamp"
    
    git commit -m $fullMessage
    
    Write-Host "Changes committed successfully!" -ForegroundColor Green
    Write-Host "Commit message: $fullMessage" -ForegroundColor Cyan
    
    # Check if remote repository is configured
    $remote = git remote get-url origin 2>$null
    if ($remote) {
        Write-Host "Pushing to remote repository..." -ForegroundColor Yellow
        git push origin master
        Write-Host "Pushed to remote successfully!" -ForegroundColor Green
    } else {
        Write-Host "No remote repository configured. To set up GitHub:" -ForegroundColor Yellow
        Write-Host "   1. Create a repository on GitHub" -ForegroundColor White
        Write-Host "   2. Run: git remote add origin YOUR_GITHUB_URL" -ForegroundColor White
        Write-Host "   3. Run: git push -u origin master" -ForegroundColor White
    }
} else {
    Write-Host "No changes to commit" -ForegroundColor Blue
}

Write-Host "Auto-commit script completed!" -ForegroundColor Green
