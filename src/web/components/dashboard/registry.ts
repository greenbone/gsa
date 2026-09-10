/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type {ComponentType} from 'react';
import Logger from 'gmp/log';
import {type ToString} from 'gmp/types';
import {isDefined} from 'gmp/utils/identity';
import {
  type DisplayProps,
  type DisplayState,
} from 'web/components/dashboard/display';

export type DisplayComponent<
  TProps extends object = DisplayProps<DisplayState>,
> = ComponentType<TProps> & {
  displayId: string;
};

export interface RegisteredDisplay<
  TProps extends object = DisplayProps<DisplayState>,
> {
  component: DisplayComponent<TProps>;
  title: ToString;
}

export type DisplayRegistry<
  TProps extends object = DisplayProps<DisplayState>,
> = Record<string, RegisteredDisplay<TProps>>;

const log = Logger.getLogger('web.components.dashboard.registry');
const registry: DisplayRegistry = {};

export const registerDisplay = <
  TProps extends object = DisplayProps<DisplayState>,
>(
  component: DisplayComponent<TProps>,
  title: ToString,
  targetRegistry: DisplayRegistry<TProps> = registry as DisplayRegistry<TProps>,
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

export const getDisplay = <TProps extends object = DisplayProps<DisplayState>>(
  displayId: string,
  targetRegistry: DisplayRegistry<TProps> = registry as DisplayRegistry<TProps>,
): RegisteredDisplay<TProps> | undefined => targetRegistry[displayId];
