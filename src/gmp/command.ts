/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type HttpCommand from 'gmp/commands/http';

const COMMANDS: Record<string, typeof HttpCommand> = {};

const registerCommand = (name: string, clazz: typeof HttpCommand) => {
  COMMANDS[name] = clazz;
};

export const getCommands = () => COMMANDS;

export default registerCommand;
