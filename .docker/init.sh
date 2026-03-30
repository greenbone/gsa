#!/bin/sh

set -e

if [ -n "${MOUNT_PATH}" ]; then
  if [ -n "${KEEP_ALIVE}" ]; then
      sleep infinity
  fi
else
  start-gsad
fi
