/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import logger from 'gmp/log';
import {trace} from 'gmp/utils/trace';

const log = logger.getLogger('gmp.commands.utils');

/**
 * Convert boolean true/false to API 1/0 values
 *
 * It converts true to int 1 and false to 0. Converting other values returns
 * undefined.
 */
export const convertBoolean = value => {
  if (value === true) {
    return 1;
  }
  if (value === false) {
    return 0;
  }
  if (value === 1 || value === 0) {
    log.warn('Passed 1 or 0 instead of a true or false', trace());
    return value;
  }
  return undefined;
};
