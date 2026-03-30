#!/bin/sh

set -e

[ -z "${STORAGE_PATH}" ] && STORAGE_PATH="/usr/local/share/gvm/gsad/web/"
[ -z "${STATE_FILE}" ] && STATE_FILE="/run/gsa/copying.done"
[ -z "${GSA_CONFIG_FILE}" ] && GSA_CONFIG_FILE="${STORAGE_PATH}/config.js"

rm -f "${STATE_FILE}"

if [ ! -f "${GSA_CONFIG_FILE}" ] && [ -w "${STORAGE_PATH}" ]; then
  echo "Creating Config"
  echo "config = {" > "${GSA_CONFIG_FILE}"
  [ -n "$GSA_VENDOR_LABEL" ] && echo "  vendorLabel: '${GSA_VENDOR_LABEL}'," >> "${GSA_CONFIG_FILE}"
  [ -n "$GSA_VENDOR_TITLE" ] && echo "  vendorTitle: '${GSA_VENDOR_TITLE}'," >> "${GSA_CONFIG_FILE}"
  [ -n "$GSA_VENDOR_VERSION" ] && echo "  vendorVersion: '${GSA_VENDOR_VERSION}'," >> "${GSA_CONFIG_FILE}"
  [ -n "$GSA_API_SERVER" ] && echo "  apiServer: '${GSA_API_SERVER}'," >> "${GSA_CONFIG_FILE}"
  [ -n "$GSA_API_PROTOCOL" ] && echo "  apiProtocol: '${GSA_API_PROTOCOL}'," >> "${GSA_CONFIG_FILE}"
  [ -n "$GSA_ENABLE_ASSET_MANAGEMENT" ] && echo "  enableAssetManagement: ${GSA_ENABLE_ASSET_MANAGEMENT}," >> "${GSA_CONFIG_FILE}"
  [ -n "$GSA_ENABLE_EPSS" ] && echo "  enableEPSS: ${GSA_ENABLE_EPSS}," >> "${GSA_CONFIG_FILE}"
  [ -n "$GSA_ENABLE_KRB5" ] && echo "  enableKrb5: ${GSA_ENABLE_KRB5}," >> "${GSA_CONFIG_FILE}"
  echo "}" >> "${GSA_CONFIG_FILE}"
fi

if ! [ -d "${MOUNT_PATH}" ]; then
  echo "'${MOUNT_PATH}' is not a directory or does not exist."
  exit 1
fi

echo "Copying GSA data... "

rm -rf "${MOUNT_PATH:?}/"*
cp -v -r "${STORAGE_PATH}"* "${MOUNT_PATH}"

echo "done."

if [ "$(id -u)" = "0" ]; then
    if [ -n "${USER_ID}" ]; then
        chown -R "${USER_ID}" "${MOUNT_PATH}"
        echo "changed user permissions to ${USER_ID}"
    fi

    if [ -n "${GROUP_ID}" ]; then
        chgrp -R "${GROUP_ID}" "${MOUNT_PATH}"
        echo "changed group permissions to ${GROUP_ID}"
    fi
fi

STATE_DIR=$(dirname "${STATE_FILE}")
mkdir -p "${STATE_DIR}"
touch "${STATE_FILE}"
