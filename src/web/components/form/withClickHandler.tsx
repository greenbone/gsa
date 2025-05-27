/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import useClickHandler, {ClickEvent} from 'web/components/form/useClickHandler';

type WrappedComponent<TEvent> = React.ComponentType<{
  onClick?: (event: TEvent) => void;
}>;

export interface WithClickHandlerProps<TValue> {
  children?: React.ReactNode;
  name?: string;
  value: TValue;
  onClick?: (value: TValue, name?: string) => void;
}

interface WithClickHandlerParams<TProps, TValue, TEvent> {
  valueFunc: (event: TEvent, props: TProps) => TValue;
  nameFunc: (event: TEvent, props: TProps) => string | undefined;
}

function withClickHandler<TProps, TValue, TEvent = ClickEvent>({
  valueFunc,
  nameFunc,
}: WithClickHandlerParams<TProps, TValue, TEvent>) {
  return (Component: WrappedComponent<TEvent>) =>
    ({onClick, ...props}: WithClickHandlerProps<TValue> & TProps) => {
      const handleClick = useClickHandler<TProps, TValue, TEvent>({
        onClick,
        valueFunc,
        nameFunc,
        props: props as TProps,
      });
      return <Component {...props} onClick={handleClick} />;
    };
}

export default withClickHandler;
