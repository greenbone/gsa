/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type {DisplayContainerProps} from 'web/components/dashboard/display/DisplayContainer';

/**
 * State for a Display component.
 */
export interface DisplayState {
  showLegend?: boolean;
}

/**
 * Function type for updating the state of the Display component.
 */
export type DisplayStateFunc<TState extends DisplayState> = (
  state: TState | undefined,
) => TState;

/**
 * Function type for setting the state of the Display component.
 */
export type DisplaySetStateFunc<TState extends DisplayState> = (
  func: DisplayStateFunc<TState>,
) => void;

/**
 * The minimum set of props required for a Display component.
 */
export interface DisplayProps<
  TState extends DisplayState = DisplayState,
> extends DisplayContainerProps {
  filterId?: string;
  height: number;
  state?: TState;
  width: number;
  setState?: DisplaySetStateFunc<TState>;
  onFilterIdChanged?: (filterId?: string) => void;
}
