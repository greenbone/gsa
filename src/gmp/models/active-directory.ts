/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type DirectoryGraph} from 'gmp/models/directory-graph';

export interface DirectoryReference {
  id: string;
  name: string;
}

export interface DirectoryTarget extends DirectoryReference {
  tasks?: (DirectoryReference & {config?: DirectoryReference})[];
}

interface DirectoryObject {
  /** Distinguished name. Identity is scoped to the selected credential. */
  id: string;
  name: string;
  parentDn: string;
  /** First AD description value; absent when the returned value is empty. */
  description?: string;
}

export interface DirectoryComputer extends DirectoryObject {
  kind: 'computer';
  hostname?: string;
  disabled: boolean;
  operatingSystem?: string;
  operatingSystemVersion?: string;
  servicePrincipalNames?: string[];
  matchedTargets?: DirectoryTarget[];
}

export interface DirectoryBranch extends DirectoryObject {
  kind: 'ou' | 'container' | 'group';
}

export type DirectoryNode = DirectoryBranch | DirectoryComputer;

export interface DirectoryOverview {
  roots: DirectoryNode[];
  truncated: boolean;
  counts: {
    found: number;
    unresolvable?: number;
    disabled?: number;
    captured?: number;
    available?: number;
  };
}

/** Complete branch snapshots learned by an explicit recursive selection. */
export interface DirectoryResolution {
  computers: DirectoryComputer[];
  graph: DirectoryGraph;
}
