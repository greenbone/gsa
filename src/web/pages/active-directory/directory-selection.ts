/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type DirectoryComputer} from 'gmp/models/active-directory';

export const getBranchSelectionSummary = (
  members: DirectoryComputer[] | undefined,
  selected: DirectoryComputer[],
  showDisabled: boolean,
) => {
  const eligible = members?.filter(
    computer => computer.hostname && (showDisabled || !computer.disabled),
  );
  const selectedIds = new Set(selected.map(computer => computer.id));
  const count =
    eligible?.filter(computer => selectedIds.has(computer.id)).length ?? 0;
  return {
    total: eligible?.length,
    selectedCount: count,
    checked:
      eligible !== undefined &&
      eligible.length > 0 &&
      count === eligible.length,
    indeterminate: count > 0 && count < (eligible?.length ?? 0),
  };
};

export const mergeSelection = (
  selected: DirectoryComputer[],
  added: DirectoryComputer[],
  showDisabled: boolean,
) =>
  Array.from(
    new Map(
      [...selected, ...added]
        .filter(
          computer => computer.hostname && (showDisabled || !computer.disabled),
        )
        .map(computer => [computer.id, computer]),
    ).values(),
  );

export const selectedHostnames = (selected: DirectoryComputer[]) =>
  Array.from(
    new Set(
      selected.flatMap(computer =>
        computer.hostname ? [computer.hostname.toLowerCase()] : [],
      ),
    ),
  );
