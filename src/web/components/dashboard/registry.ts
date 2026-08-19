/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type {ComponentType} from 'react';
import Logger from 'gmp/log';
import {type ToString} from 'gmp/types';
import {isDefined} from 'gmp/utils/identity';
import {type DisplayProps as BaseDisplayProps} from 'web/components/dashboard/display/Display';

export interface DisplayState {
  showLegend?: boolean;
  show3d?: boolean;
}

type DisplayStateFunc = (state: DisplayState | undefined) => DisplayState;
type DisplaySetStateFunc = (stateFunc: DisplayStateFunc) => void;

export interface DisplayProps extends BaseDisplayProps {
  height: number;
  id: string;
  width: number;
  state: DisplayState | undefined;
  setState: DisplaySetStateFunc;
  onFilterIdChanged: (filterId: string) => void;
}

export type DisplayComponent<TProps = DisplayProps> = ComponentType<TProps> & {
  displayId: string;
};

export interface RegisteredDisplay<TProps = DisplayProps> {
  component: DisplayComponent<TProps>;
  title: ToString;
}

export type DisplayRegistry<TProps = DisplayProps> = Record<
  string,
  RegisteredDisplay<TProps>
>;

const log = Logger.getLogger('web.components.dashboard.registry');
const registry: DisplayRegistry = {};

export const registerDisplay = <TProps = DisplayProps>(
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

export const getDisplay = <TProps = DisplayProps>(
  displayId: string,
  targetRegistry: DisplayRegistry<TProps> = registry as DisplayRegistry<TProps>,
): RegisteredDisplay<TProps> | undefined => targetRegistry[displayId];
