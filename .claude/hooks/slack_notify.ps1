# Claude Code Slack Notification Hook (PowerShell)
# Usage: powershell -File .claude/hooks/slack_notify.ps1 [notification|stop]
# Korean strings are built from char codes at runtime to avoid file encoding issues.

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# 프로세스 환경변수에 없으면 사용자 환경변수에서 직접 읽기
$WEBHOOK_URL = $env:SLACK_WEBHOOK_URL
if (-not $WEBHOOK_URL) {
    $WEBHOOK_URL = [System.Environment]::GetEnvironmentVariable('SLACK_WEBHOOK_URL', 'User')
}
$HOOK_TYPE = if ($args.Count -gt 0) { $args[0] } else { 'unknown' }

# Claude Code stdin JSON
$rawJson = ([Console]::In.ReadToEnd()).Trim()
$inputData = $null
if ($rawJson) {
    try { $inputData = $rawJson | ConvertFrom-Json } catch { $inputData = $null }
}

function Send-Slack {
    param([string]$Text)
    $bodyObj = @{ username = 'Claude Code'; icon_emoji = ':robot_face:'; text = $Text }
    $bodyJson = $bodyObj | ConvertTo-Json -Compress
    $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($bodyJson)
    try {
        Invoke-WebRequest -Uri $WEBHOOK_URL -Method POST -Body $bodyBytes `
            -ContentType 'application/json; charset=utf-8' -UseBasicParsing | Out-Null
    } catch { exit 0 }
}

# Emoji (surrogate pair for characters outside BMP)
$bell  = [char]::ConvertFromUtf32(0x1F514)  # 🔔
$point = [char]::ConvertFromUtf32(0x1F446)  # 👆
$check = [char]0x2705                        # ✅
$party = [char]::ConvertFromUtf32(0x1F389)  # 🎉

# Korean strings built from Unicode code points (no encoding dependency)
$krAuth  = "$([char]0xAD8C)$([char]0xD55C) $([char]0xC694)$([char]0xCCAD)"           # 권한 요청
$krBody  = "$([char]0xB0B4)$([char]0xC6A9)"                                            # 내용
$krReply = "$([char]0xD130)$([char]0xBBF8)$([char]0xB110)$([char]0xC5D0)$([char]0xC11C) $([char]0xC751)$([char]0xB2F5)$([char]0xD574)$([char]0xC8FC)$([char]0xC138)$([char]0xC694)"  # 터미널에서 응답해주세요
$krNotif = "$([char]0xC54C)$([char]0xB9BC)$([char]0xC774) $([char]0xC788)$([char]0xC2B5)$([char]0xB2C8)$([char]0xB2E4)"   # 알림이 있습니다
$krDone  = "$([char]0xC791)$([char]0xC5C5) $([char]0xC644)$([char]0xB8CC)"           # 작업 완료
$krFinsh = "$([char]0xC791)$([char]0xC5C5)$([char]0xC744) $([char]0xB9C8)$([char]0xCCD0)$([char]0xC2B5)$([char]0xB2C8)$([char]0xB2E4)"  # 작업을 마쳤습니다
$krClaude = "$([char]0xAD6C)$([char]0xB85C)$([char]0xB4DC) $([char]0xCF54)$([char]0xB4DC)$([char]0xAC00)"  # 클로드 코드가

if ($HOOK_TYPE -eq 'notification') {
    $message = if ($inputData -and $inputData.message) { $inputData.message } else { $krNotif }
    $text = "$bell *Claude Code - ${krAuth}*`n*${krBody}:* $message`n$point $krReply"
    Send-Slack $text

} elseif ($HOOK_TYPE -eq 'stop') {
    if ($inputData -and $inputData.stop_hook_active -eq $true) { exit 0 }
    $text = "$check *Claude Code - ${krDone}*`nClaude Code $krFinsh! $party"
    Send-Slack $text

} else { exit 0 }
exit 0
