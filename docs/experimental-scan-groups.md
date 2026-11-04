# Experimental multi-target scan UI with asset credential overrides

When `enableCredentialAwareTasks` is enabled in `config.js`, task creation
includes a multi-target mode. The dialog previews expanded hosts, effective
credentials, and the number of child scans. Task lists and details show one
logical entry, child statuses, and a combined report link. The host details
page can save, pause, resume, and delete per-service credential overrides.
Use this UI with the combined companion controller and GSAD-authenticated
proxy from the matching fork branches.

The backend groups hosts only within the same source target and only when
their full effective credential sets match. Six explicit hosts across two
source targets produce two child scans without overrides, or three when one
host differs. The UI displays the returned plan rather than deciding scan
partitions. The current implementation is an experimental controller-backed
flow, not native gvmd multi-target task persistence or launch.
