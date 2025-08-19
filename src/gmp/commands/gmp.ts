/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import HttpCommand from 'gmp/commands/http';

export const BULK_SELECT_BY_IDS = 1;
export const BULK_SELECT_BY_FILTER = 0;

class GmpCommand extends HttpCommand {}

export default GmpCommand;
