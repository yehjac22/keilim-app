#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ANDROID_DIR="$ROOT_DIR/android/keilim-kiosk"
OUTPUT_DIR="$ROOT_DIR/public/downloads"
APK_NAME="keilim-kiosk.apk"

if [[ -n "${KIOSK_URL:-}" ]]; then
  TARGET_URL="$KIOSK_URL"
else
  LAN_IP="$(ipconfig getifaddr en0 2>/dev/null || true)"
  if [[ -z "$LAN_IP" ]]; then
    LAN_IP="$(ipconfig getifaddr en1 2>/dev/null || true)"
  fi
  if [[ -z "$LAN_IP" ]]; then
    TARGET_URL="http://10.0.2.2:3001"
  else
    TARGET_URL="http://$LAN_IP:3001"
  fi
fi

export PATH="/opt/homebrew/opt/openjdk@21/bin:$PATH"
export ANDROID_SDK_ROOT="/opt/homebrew/share/android-commandlinetools"
export ANDROID_HOME="$ANDROID_SDK_ROOT"

VERSION_CODE="$(date +%s)"
VERSION_NAME="1.$(date +%Y%m%d%H%M)"

echo "Building Android APK with kiosk URL: $TARGET_URL"
echo "APK versionCode: $VERSION_CODE"
echo "APK versionName: $VERSION_NAME"
cd "$ANDROID_DIR"

gradle clean :app:assembleDebug \
  -PkioskUrl="$TARGET_URL" \
  -PversionCode="$VERSION_CODE" \
  -PversionName="$VERSION_NAME"

mkdir -p "$OUTPUT_DIR"
cp "$ANDROID_DIR/app/build/outputs/apk/debug/app-debug.apk" "$OUTPUT_DIR/$APK_NAME"

echo "APK ready at: $OUTPUT_DIR/$APK_NAME"
