# 현재 PC의 로컬 IP 자동 추출 (192.168.* 대역)
$ip = (Get-NetIPAddress -AddressFamily IPv4 `
      | Where-Object { $_.IPAddress -like "192.168.*" -and $_.PrefixOrigin -eq "Dhcp" } `
      | Select-Object -First 1 -ExpandProperty IPAddress)

if (-not $ip) {
    Write-Host "로컬 IP를 찾을 수 없습니다. Wi-Fi 연결을 확인하세요."
    exit 1
}

Write-Host "EXPO_DEV_SERVER_HOST: $ip"

# 환경변수 설정 후 EAS 빌드 실행
$env:EXPO_DEV_SERVER_HOST = $ip
eas build --profile development --platform android 