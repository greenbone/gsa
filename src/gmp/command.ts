/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import GmpCommand from 'gmp/commands/gmp';

const COMMANDS: Record<string, typeof GmpCommand> = {};

const registerCommand = (name: string, clazz: typeof GmpCommand) => {
  COMMANDS[name] = clazz;
};

export const getCommands = () => COMMANDS;

export default registerCommand;
