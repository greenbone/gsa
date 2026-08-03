/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type {ComponentType} from 'react';
import Logger from 'gmp/log';
import {type ToString} from 'gmp/types';
import {isDefined} from 'gmp/utils/identity';

export interface RegisteredDisplay {
  component: ComponentType;
  title: ToString;
  displayId: string;
}

const log = Logger.getLogger('web.components.dashboard.registry');
const registry: Record<string, RegisteredDisplay> = {};

export const registerDisplay = (
  displayId: string,
  component: ComponentType,
  {title}: {title?: ToString} = {},
) => {
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

export const getDisplay = (displayId: string): RegisteredDisplay | undefined =>
  registry[displayId];
