/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const COMMANDS = {};

const registerCommand = (name, clazz) => {
  COMMANDS[name] = clazz;
};

export const getCommands = () => COMMANDS;

export default registerCommand;
