/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {ChangeEvent} from 'react';

export type ClickEvent = React.MouseEvent<HTMLButtonElement | HTMLInputElement>;

interface UseClickEvent {
  currentTarget: {
    value: string;
    name: string;
  };
}

export interface UseClickHandlerParams<
  TProps = {},
  TValue = string,
  TEvent = ClickEvent,
> {
  valueFunc: (event: TEvent, props: TProps) => TValue;
  nameFunc: (event: TEvent, props: TProps) => string | undefined;
  onClick?: (value: TValue, name?: string) => void;
  props?: TProps;
}

export const valueFromEvent = (event: UseClickEvent): string =>
  event.currentTarget.value;

export const nameFromEvent = (event: UseClickEvent): string =>
  event.currentTarget.name;

/**
 * Custom hook to create a click handler function.
 *
 * @param params - The parameters for the click handler.
 * @param params.valueFunc - A function to extract the value from the event and props.
 * @param params.nameFunc - A function to extract the name from the event and props.
 * @param params.onClick - The click handler function to be called.
 * @param params.props - Additional props to be passed to valueFunc, nameFunc and onClick.
 * @returns The click handler function.
 */
const useClickHandler = <TProps = {}, TValue = string, TEvent = ChangeEvent>({
  valueFunc,
  nameFunc,
  onClick,
  props,
}: UseClickHandlerParams<TProps, TValue, TEvent>) => {
  const handleClick = (event: TEvent) => {
    if (onClick) {
      onClick(
        valueFunc(event, props as TProps),
        nameFunc(event, props as TProps),
      );
    }
  };
  return handleClick;
};

export default useClickHandler;
