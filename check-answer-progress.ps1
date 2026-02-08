# Check Answer Generation Progress
# Usage: .\check-answer-progress.ps1 [testId]

param(
    [string]$TestId = "",
    [string]$ServerUrl = "https://exambc.alaotach.com"
)

function Show-AllProgress {
    Write-Host "`n📊 Checking all answer generation tasks..." -ForegroundColor Cyan
    
    # Get all test IDs from ai_generated_answers directory (in progress)
    $answersDir = "./ai_generated_answers"
    if (Test-Path $answersDir) {
        $completedFiles = Get-ChildItem -Path $answersDir -Filter "*.json*" | Select-Object -First 5
        
        if ($completedFiles) {
            Write-Host "`n✅ Recently completed answers:" -ForegroundColor Green
            foreach ($file in $completedFiles) {
                $id = $file.BaseName -replace '\.json.*$', ''
                Write-Host "   - $id ($($file.Name))" -ForegroundColor Gray
            }
        }
    }
    
    # Check queue status from server logs (requires PM2 access)
    Write-Host "`n💡 Tip: To see live generation progress on VM, run:" -ForegroundColor Yellow
    Write-Host "   pm2 logs exam-ai-server --lines 100 | grep 'Answer Gen'" -ForegroundColor Gray
    Write-Host "`n   Or check specific test ID status:" -ForegroundColor Yellow
    Write-Host "   .\check-answer-progress.ps1 -TestId YOUR_TEST_ID" -ForegroundColor Gray
}

function Show-TestProgress {
    param([string]$Id, [string]$Url)
    
    Write-Host "`n🔍 Checking progress for test: $Id" -ForegroundColor Cyan
    
    try {
        $response = Invoke-RestMethod -Uri "$Url/api/answers/status/$Id" -Method Get -ErrorAction Stop
        
        Write-Host "`n📋 Status:" -ForegroundColor White
        Write-Host "   Test ID: $($response.testId)" -ForegroundColor Gray
        
        $statusEmoji = switch ($response.status) {
            'completed' { '✅' }
            'in-progress' { '⏳' }
            'pending' { '⌛' }
            'failed' { '❌' }
            default { '❓' }
        }
        
        Write-Host "   Status: $statusEmoji $($response.status)" -ForegroundColor $(
            switch ($response.status) {
                'completed' { 'Green' }
                'in-progress' { 'Yellow' }
                'pending' { 'Cyan' }
                'failed' { 'Red' }
                default { 'Gray' }
            }
        )
        
        if ($response.progress) {
            $progressBar = "█" * [Math]::Floor($response.progress / 10) + "░" * [Math]::Floor((100 - $response.progress) / 10)
            Write-Host "   Progress: [$progressBar] $($response.progress)%" -ForegroundColor Cyan
        }
        
        if ($response.answersAvailable) {
            Write-Host "   ✅ Answers Available: Yes" -ForegroundColor Green
        }
        
        if ($response.error) {
            Write-Host "   ❌ Error: $($response.error)" -ForegroundColor Red
        }
        
        if ($response.startedAt) {
            Write-Host "   Started: $($response.startedAt)" -ForegroundColor Gray
        }
        
        if ($response.completedAt) {
            Write-Host "   Completed: $($response.completedAt)" -ForegroundColor Gray
        }
        
    } catch {
        if ($_.Exception.Response.StatusCode -eq 404) {
            Write-Host "`n❓ Test not found or generation not started" -ForegroundColor Yellow
        } else {
            Write-Host "`n❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# Main execution
Clear-Host
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   AI Answer Generation Progress Checker" -ForegroundColor White
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan

if ($TestId) {
    Show-TestProgress -Id $TestId -Url $ServerUrl
} else {
    Show-AllProgress
}

Write-Host "`n"
