#!/usr/bin/env bash
set -euo pipefail

usage() {
  printf '%s\n' 'Usage : npm run android:bundle -- VERSION_NAME VERSION_CODE'
}

fail() {
  printf '%s\n' "$1" >&2
  exit 1
}

if [[ ${1:-} == --help ]]; then
  usage
  exit 0
fi
if [[ $# != 2 ]]; then
  usage >&2
  exit 1
fi

version_name=$1
version_code=$2
[[ $version_name =~ ^[0-9A-Za-z][0-9A-Za-z._+-]{0,63}$ ]] || fail 'versionName invalide.'
[[ $version_code =~ ^[1-9][0-9]{0,9}$ ]] && [[ $version_code -le 2100000000 ]] || fail 'versionCode invalide.'

cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.."
[[ -s src/environments/keep.ts ]] || fail 'Le fichier local src/environments/keep.ts est requis.'
if grep -Eq "^[[:space:]]*export const OPENWHEATHER_API_KEY[[:space:]]*=[[:space:]]*(''|\"\")[[:space:]]*;?[[:space:]]*$" src/environments/keep.ts; then
  fail 'Renseigner OPENWHEATHER_API_KEY dans le fichier local keep.ts.'
fi

: "${JAVA_HOME:?Définir JAVA_HOME sur le JDK 21}"
java_bin="$JAVA_HOME/bin"
[[ $("$java_bin/java" -version 2>&1) =~ version\ \"21\. ]] || fail 'JAVA_HOME doit pointer vers un JDK 21.'

: "${AURORA_ANDROID_KEYSTORE_PATH:?Indiquer le chemin du keystore d’envoi Play}"
: "${AURORA_ANDROID_KEY_ALIAS:?Indiquer l’alias de la clé d’envoi Play}"
: "${AURORA_ANDROID_STORE_PASSWORD:?Charger le mot de passe du keystore dans l’environnement}"
: "${AURORA_ANDROID_UPLOAD_SHA256:?Indiquer l’empreinte SHA-256 du certificat d’envoi affichée dans Play Console}"
[[ -r $AURORA_ANDROID_KEYSTORE_PATH ]] || fail 'Keystore illisible.'

store_args=(-keystore "$AURORA_ANDROID_KEYSTORE_PATH" -storepass:env AURORA_ANDROID_STORE_PASSWORD)
expected_sha=$(printf '%s' "$AURORA_ANDROID_UPLOAD_SHA256" | tr -d ':[:space:]' | tr '[:upper:]' '[:lower:]')
[[ $expected_sha =~ ^[0-9a-f]{64}$ ]] || fail 'Empreinte SHA-256 invalide.'
actual_sha=$("$java_bin/keytool" -exportcert "${store_args[@]}" -alias "$AURORA_ANDROID_KEY_ALIAS" | shasum -a 256 | cut -d ' ' -f 1)
[[ $actual_sha == "$expected_sha" ]] || fail 'Le certificat du keystore diffère du certificat d’envoi Play.'

output_dir=android/app/build/outputs/bundle/release
artifact="$output_dir/aurorapp-$version_code-$version_name.aab"
lock_dir=.versions/android-bundle.lock
temporary_dir=

mkdir -p .versions
mkdir "$lock_dir" 2>/dev/null || fail 'La préparation d’un bundle Android est déjà verrouillée.'
cleanup() {
  if [[ -n $temporary_dir ]]; then
    rm -f -- "$temporary_dir/bundle.aab"
    rmdir -- "$temporary_dir"
  fi
  rmdir -- "$lock_dir"
}
trap cleanup EXIT

(
  unset AURORA_ANDROID_STORE_PASSWORD AURORA_ANDROID_KEY_PASSWORD
  npm run deploy
  cd android
  ./gradlew :app:bundleRelease "-PauroraVersionCode=$version_code" "-PauroraVersionName=$version_name"
)

temporary_dir=$(mktemp -d "$output_dir/.aurora-sign.XXXXXXXX")
keypass_args=()
if [[ -n ${AURORA_ANDROID_KEY_PASSWORD:-} ]]; then
  keypass_args=(-keypass:env AURORA_ANDROID_KEY_PASSWORD)
fi

"$java_bin/jarsigner" "${store_args[@]}" ${keypass_args[@]+"${keypass_args[@]}"} \
  -signedjar "$temporary_dir/bundle.aab" "$output_dir/app-release.aab" "$AURORA_ANDROID_KEY_ALIAS"
"$java_bin/jarsigner" -verify "$temporary_dir/bundle.aab"
signed_certificate=$(LC_ALL=C "$java_bin/keytool" -J-Duser.language=en -J-Duser.country=US -printcert -jarfile "$temporary_dir/bundle.aab")
signed_sha=$(printf '%s\n' "$signed_certificate" | awk '/SHA256:/ { print $2; exit }' | tr -d ':' | tr '[:upper:]' '[:lower:]')
[[ $signed_sha == "$expected_sha" ]] || fail 'Le certificat du bundle diffère du certificat d’envoi Play.'
mv -- "$temporary_dir/bundle.aab" "$artifact"
shasum -a 256 "$artifact"
