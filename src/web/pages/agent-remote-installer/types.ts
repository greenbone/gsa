/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export const SectionType = {
  HEADING: 'heading',
  PARAGRAPH: 'paragraph',
  OS_COMMAND: 'os-command',
  WARNING: 'warning',
  COLLAPSIBLE: 'collapsible',
  TABLE: 'table',
  ORDERED_LIST: 'ordered-list',
  UNORDERED_LIST: 'unordered-list',
  CHECKSUM: 'checksum',
} as const;

export const SectionId = {
  QUICK_INSTALL: 'quick-install',
  QUICK_INSTALL_LINUX: 'quick-install-linux',
  QUICK_INSTALL_LINUX_DESC: 'quick-install-linux-desc',
  QUICK_INSTALL_LINUX_CMD: 'quick-install-linux-cmd',
  QUICK_INSTALL_WINDOWS: 'quick-install-windows',
  QUICK_INSTALL_WINDOWS_DESC: 'quick-install-windows-desc',
  QUICK_INSTALL_WINDOWS_CMD: 'quick-install-windows-cmd',
  SELF_SIGNED: 'self-signed',
  SELF_SIGNED_WARNING: 'self-signed-warning',
  SELF_SIGNED_LINUX: 'self-signed-linux',
  SELF_SIGNED_LINUX_CMD: 'self-signed-linux-cmd',
  SELF_SIGNED_WINDOWS: 'self-signed-windows',
  SELF_SIGNED_WINDOWS_CMD: 'self-signed-windows-cmd',
  VERIFIED_INSTALL: 'verified-install',
  VERIFIED_NOTE: 'verified-note',
  VERIFIED_LINUX: 'verified-linux',
  VERIFIED_LINUX_CMD: 'verified-linux-cmd',
  VERIFIED_WINDOWS: 'verified-windows',
  VERIFIED_WINDOWS_CMD: 'verified-windows-cmd',
  SCRIPT_CHECKSUMS: 'script-checksums',
  CHECKSUM_NOTE: 'checksum-note',
  CHECKSUM_LINUX: 'checksum-linux',
  CHECKSUM_LINUX_VAL: 'checksum-linux-val',
  CHECKSUM_LINUX_VERIFY: 'checksum-linux-verify',
  CHECKSUM_LINUX_CMD: 'checksum-linux-cmd',
  CHECKSUM_WINDOWS: 'checksum-windows',
  CHECKSUM_WINDOWS_VAL: 'checksum-windows-val',
  CHECKSUM_WINDOWS_VERIFY: 'checksum-windows-verify',
  CHECKSUM_WINDOWS_CMD: 'checksum-windows-cmd',
  CONFIGURATION: 'configuration',
  CONFIG_NOTE: 'config-note',
  CONFIG_TABLE: 'config-table',
  ENDPOINT_NOTE: 'endpoint-note',
  PACKAGES: 'packages',
  PACKAGES_TABLE: 'packages-table',
  WHAT_SCRIPTS_DO: 'what-scripts-do',
  STEPS: 'steps',
  REQUIREMENTS: 'requirements',
  REQUIREMENTS_LINUX: 'requirements-linux',
  REQUIREMENTS_LINUX_LIST: 'requirements-linux-list',
  REQUIREMENTS_WINDOWS: 'requirements-windows',
  REQUIREMENTS_WINDOWS_LIST: 'requirements-windows-list',
} as const;

export interface InstructionsHeading {
  id: string;
  type: typeof SectionType.HEADING;
  level: 2 | 3 | 4;
  text: string;
}

export interface InstructionsParagraph {
  id: string;
  type: typeof SectionType.PARAGRAPH;
  text: string;
}

export interface InstructionsOsCommand {
  id: string;
  type: typeof SectionType.OS_COMMAND;
  os: 'linux' | 'windows';
  command: string;
  download?: {
    url: string;
    filename: string;
    label: string;
  };
}

export interface InstructionsWarning {
  id: string;
  type: typeof SectionType.WARNING;
  text: string;
}

export interface InstructionsCollapsible {
  id: string;
  type: typeof SectionType.COLLAPSIBLE;
  summary: string;
  children: InstructionsSection[];
}

export interface InstructionsTable {
  id: string;
  type: typeof SectionType.TABLE;
  headers: string[];
  rows: string[][];
}

export interface InstructionsOrderedList {
  id: string;
  type: typeof SectionType.ORDERED_LIST;
  items: string[];
}

export interface InstructionsUnorderedList {
  id: string;
  type: typeof SectionType.UNORDERED_LIST;
  items: string[];
}

export interface InstructionsChecksum {
  id: string;
  type: typeof SectionType.CHECKSUM;
  label: string;
  value: string;
}

export type InstructionsSection =
  | InstructionsHeading
  | InstructionsParagraph
  | InstructionsOsCommand
  | InstructionsWarning
  | InstructionsCollapsible
  | InstructionsTable
  | InstructionsOrderedList
  | InstructionsUnorderedList
  | InstructionsChecksum;

export interface InstallInstructionsData {
  _version: string;
  lang: string;
  title: string;
  sections: InstructionsSection[];
}
