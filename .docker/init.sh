#!/bin/sh

set -e

[ -z "${STORAGE_PATH}" ] && STORAGE_PATH="/usr/local/share/gvm/gsad/web/"
[ -z "${STATE_FILE}" ] && STATE_FILE="/run/gsa/copying.done"

rm -f "${STATE_FILE}"

if [ -n "${MOUNT_PATH}" ]; then
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

  STATE_DIR=$(dirname ${STATE_FILE})
  mkdir -p "${STATE_DIR}"
  touch "${STATE_FILE}"

  if [ -n "${KEEP_ALIVE}" ]; then
      sleep infinity
  fi
else
  start-gsad
fi
