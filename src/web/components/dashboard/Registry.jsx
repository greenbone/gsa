/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Logger from 'gmp/log';
import {isDefined} from 'gmp/utils/identity';

const log = Logger.getLogger('web.components.dashboard.registry');
const registry = {};

export const registerDisplay = (displayId, component, {title}) => {
  if (!isDefined(displayId)) {
    log.error('Undefined id passed while registering display');
    return;
  }

  if (!isDefined(component)) {
    log.error(
      'Undefined component passed while registering display',
      displayId,
    );
    return;
  }

  if (!isDefined(title)) {
    log.error('Undefined title passed while registering display', displayId);
    return;
  }

  registry[displayId] = {
    component,
    title,
    displayId,
  };

  log.debug('Registered display', displayId);
};

export const getDisplay = displayId => registry[displayId];
