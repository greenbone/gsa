#!/bin/sh

if [ -n "${MOUNT_PATH}" ]; then
  setup-gsa
fi


if command -v gosu > /dev/null 2>&1; then
  exec gosu gsad "$@"
else
  exec "$@"
fi
