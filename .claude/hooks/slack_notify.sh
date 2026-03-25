#!/usr/bin/env bash
# Claude Code Slack 알림 훅 스크립트
# jq 없이 sed/grep으로 stdin JSON 파싱, curl로 Slack 웹훅 전송
# 사용: bash .claude/hooks/slack_notify.sh [notification|stop]

# 한글 깨짐 방지: UTF-8 인코딩 강제 설정
export LANG=C.UTF-8
export LC_ALL=C.UTF-8

WEBHOOK_URL="${SLACK_WEBHOOK_URL}"
HOOK_TYPE="${1:-unknown}"

# Claude Code가 stdin으로 전달하는 JSON 읽기
INPUT=$(cat)

# JSON에서 특정 키의 값을 추출하는 함수 (jq 없이 sed 사용)
# 사용법: extract_json_value "키이름" "JSON문자열"
extract_json_value() {
    local key="$1"
    local json="$2"
    # "key": "value" 패턴에서 value 추출 (따옴표 제거)
    echo "$json" | grep -o "\"${key}\"[[:space:]]*:[[:space:]]*\"[^\"]*\"" \
        | sed "s/\"${key}\"[[:space:]]*:[[:space:]]*\"\([^\"]*\)\"/\1/"
}

# JSON에서 boolean/숫자 값을 추출하는 함수
extract_json_bool() {
    local key="$1"
    local json="$2"
    # "key": true/false 패턴에서 값 추출
    echo "$json" | grep -o "\"${key}\"[[:space:]]*:[[:space:]]*[^,}]*" \
        | sed "s/\"${key}\"[[:space:]]*:[[:space:]]*//" \
        | tr -d ' '
}

# curl로 JSON 페이로드를 Slack에 전송하는 함수
# 텍스트 내 특수문자(", \)를 이스케이프 처리
send_slack() {
    local text="$1"
    # JSON 문자열 안에 들어갈 수 있도록 특수문자 이스케이프
    local escaped
    escaped=$(echo "$text" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g')

    curl -s -o /dev/null \
        -X POST \
        -H "Content-Type: application/json; charset=utf-8" \
        -d "{\"username\": \"Claude Code\", \"icon_emoji\": \":robot_face:\", \"text\": \"${escaped}\"}" \
        "$WEBHOOK_URL"
}

if [ "$HOOK_TYPE" = "notification" ]; then
    # notification 이벤트: Claude가 권한 요청 / 입력 대기 중
    MESSAGE=$(extract_json_value "message" "$INPUT")
    # message가 없으면 기본 메시지 사용
    [ -z "$MESSAGE" ] && MESSAGE="알림이 있습니다"

    TEXT="🔔 *Claude Code - 권한 요청*\n*내용:* ${MESSAGE}\n👆 터미널에서 응답해주세요"
    send_slack "$TEXT"

elif [ "$HOOK_TYPE" = "stop" ]; then
    # stop 이벤트: Claude 작업 완료
    # stop_hook_active=true 이면 이미 훅 실행 중 → 무한루프 방지
    STOP_ACTIVE=$(extract_json_bool "stop_hook_active" "$INPUT")
    [ "$STOP_ACTIVE" = "true" ] && exit 0

    TEXT="✅ *Claude Code - 작업 완료*\nClaude Code가 작업을 마쳤습니다! 🎉"
    send_slack "$TEXT"

else
    # 알 수 없는 훅 타입은 무시
    exit 0
fi

exit 0
