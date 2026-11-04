# Experimental multi-target scan UI

When `enableCredentialAwareTasks` is enabled in `config.js`, task creation
includes a multi-target mode. The dialog previews the expanded hosts and
number of child scans, then creates one logical task through `/credential-api`.
Task lists and details show that one logical entry, child statuses, and a
combined report link. This tier has no asset credential override editor and
sends no override request. Use it with the multi-target-only companion
controller and GSAD-authenticated proxy from the matching fork branches.

Six explicit hosts across two source targets produce two child scans. The
backend owns that scheduling decision; this UI only displays the returned
plan. The current implementation is an experimental controller-backed flow,
not native gvmd multi-target task persistence or launch.
