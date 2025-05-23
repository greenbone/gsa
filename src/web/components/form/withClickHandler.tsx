/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import useClickHandler, {
  ClickEvent,
  ClickHandlerParams,
} from 'web/components/form/useClickHandler';

interface ClickHandlerProps<TEvent = ClickEvent> {
  onClick?: (value: TEvent, name?: string) => void;
}

export interface WithClickHandlerProps<TValue> {
  name?: string;
  value: TValue;
}

const valueFromProps = <TEvent, TValue>(
  event: TEvent,
  props: WithClickHandlerProps<TValue>,
) => props.value;

const nameFromProps = <TEvent, TValue>(
  event: TEvent,
  props: WithClickHandlerProps<TValue>,
) => props.name;

const withClickHandler =
  <
    TValue = string,
    TConvert = string,
    TCurrentProps extends
      WithClickHandlerProps<TValue> = WithClickHandlerProps<TValue>,
    TEvent = ClickEvent,
  >() =>
  (Component: React.ComponentType<ClickHandlerProps<TEvent>>) =>
  ({
    onClick,
    convert,
    valueFunc = valueFromProps<TEvent, TValue>,
    nameFunc = nameFromProps<TEvent, TValue>,
    ...props
  }: ClickHandlerParams<TCurrentProps, TEvent, TValue, TConvert> &
    TCurrentProps) => {
    const handleClick = useClickHandler<
      TCurrentProps,
      TEvent,
      TValue,
      TConvert
    >({
      onClick,
      convert,
      valueFunc,
      nameFunc,
      ...props,
    } as ClickHandlerParams<TCurrentProps, TEvent, TValue, TConvert> &
      TCurrentProps);
    return <Component {...props} onClick={handleClick} />;
  };

export default withClickHandler;
