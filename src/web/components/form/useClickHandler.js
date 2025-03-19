/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const eventValue = event => event.target.value;
const eventName = event => event.target.name;
const noopConvert = value => value;

/**
 * Custom hook to create a click handler function.
 *
 * @param {Object} params - The parameters for the click handler.
 * @param {Function} [params.convert=noopConvert] - A function to convert the value before passing it to onClick.
 * @param {Function} [params.valueFunc=eventValue] - A function to extract the value from the event and props.
 * @param {Function} [params.nameFunc=eventName] - A function to extract the name from the event and props.
 * @param {Function} params.onClick - The click handler function to be called.
 * @param {...Object} params.props - Additional props to be passed to valueFunc, nameFunc and onClick.
 * @returns {Function} - The click handler function.
 */
const useClickHandler = ({
  convert = noopConvert,
  valueFunc = eventValue,
  nameFunc = eventName,
  onClick,
  ...props
}) => {
  const handleClick = event => {
    if (onClick) {
      onClick(convert(valueFunc(event, props), props), nameFunc(event, props));
    }
  };
  return handleClick;
};

export default useClickHandler;
