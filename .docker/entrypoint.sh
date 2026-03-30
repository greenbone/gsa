#!/bin/bash

if [ -n "${MOUNT_PATH}" ]; then
  setup-gsa
fi

exec gosu gsad "$@"
