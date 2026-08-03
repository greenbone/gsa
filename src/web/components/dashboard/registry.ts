/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type {ComponentType} from 'react';
import Logger from 'gmp/log';
import {type ToString} from 'gmp/types';
import {isDefined} from 'gmp/utils/identity';

export type DisplayComponent = ComponentType & {
  displayId: string;
};

export interface RegisteredDisplay {
  component: DisplayComponent;
  title: ToString;
}

export type DisplayRegistry = Record<string, RegisteredDisplay>;

const log = Logger.getLogger('web.components.dashboard.registry');
const registry: DisplayRegistry = {};

export const registerDisplay = (
  component: DisplayComponent,
  title: ToString,
  targetRegistry: DisplayRegistry = registry,
) => {
  const displayId = component?.displayId;

  if (!isDefined(component)) {
    log.error(
      'Undefined component passed while registering display',
      displayId,
    );
    return;
  }

  if (!isDefined(displayId)) {
    log.error('Undefined id passed while registering display');
    return;
  }

  if (!isDefined(title)) {
    log.error('Undefined title passed while registering display', displayId);
    return;
  }

  targetRegistry[displayId] = {
    component,
    title,
  };

  log.debug('Registered display', displayId);
};

export const getDisplay = (
  displayId: string,
  targetRegistry: DisplayRegistry = registry,
): RegisteredDisplay | undefined => targetRegistry[displayId];
