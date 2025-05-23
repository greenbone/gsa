/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export type ClickEvent = React.MouseEvent<HTMLButtonElement | HTMLInputElement>;

const eventValue = (event: ClickEvent): string => event.currentTarget.value;
const eventName = (event: ClickEvent): string => event.currentTarget.name;
const noopConvert = <TValue>(value: TValue) => value;

export interface ClickHandlerParams<
  TProps extends {},
  TEvent = ClickEvent,
  TValue = string,
  TConvert = string,
> {
  convert?: (value: TValue) => TConvert;
  valueFunc?: (event: TEvent, props: TProps) => TValue;
  nameFunc?: (event: TEvent, props: TProps) => string | undefined;
  onClick?: (value: TConvert, name?: string) => void;
}

/**
 * Custom hook to create a click handler function.
 *
 * @param params - The parameters for the click handler.
 * @param params.convert - A function to convert the value before passing it to onClick.
 * @param params.valueFunc - A function to extract the value from the event and props.
 * @param params.nameFunc - A function to extract the name from the event and props.
 * @param params.onClick - The click handler function to be called.
 * @param params.props - Additional props to be passed to valueFunc, nameFunc and onClick.
 * @returns The click handler function.
 */
const useClickHandler = <
  TProps extends {},
  TEvent = ClickEvent,
  TValue = string,
  TConvert = string,
>({
  // @ts-expect-error
  convert = noopConvert,
  // @ts-expect-error
  valueFunc = eventValue,
  // @ts-expect-error
  nameFunc = eventName,
  onClick,
  ...props
}: ClickHandlerParams<TProps, TEvent, TValue, TConvert> & TProps) => {
  const handleClick = (event: TEvent) => {
    if (onClick) {
      onClick(
        convert(valueFunc(event, props as TProps)),
        nameFunc(event, props as TProps),
      );
    }
  };
  return handleClick;
};

export default useClickHandler;
