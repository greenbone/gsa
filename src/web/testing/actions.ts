/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {PointerEventsCheckLevel} from '@testing-library/user-event';
import {isDefined} from 'gmp/utils/identity';
import {
  getDialogXButton,
  getMultiSelectElement,
  getSelectElement,
  getSelectItemElements,
} from 'web/testing/customQueries';
import {userEvent, fireEvent} from 'web/utils/Testing';

/**
 * Retrieves the selectable item elements for a given select element.
 *
 * @param element - The optional select element to retrieve items for. If not provided, a default select element will be used.
 * @returns A promise that resolves to a NodeList of the selectable item elements.
 */
export const getSelectItemElementsForSelect = async (
  element?: HTMLSelectElement,
) => {
  element = isDefined(element) ? element : getSelectElement();
  await openSelectElement(element);
  const selectItemsId = element.getAttribute('aria-controls');
  const itemsContainer =
    document.body.querySelector<HTMLElement>('#' + selectItemsId) || undefined;
  return getSelectItemElements(itemsContainer);
};

/**
 * Open a select element (MultiSelect, Select, etc.)
 *
 * @param select - An optional select element to open. If not provided, it defaults to the result of getSelectElement().
 * @returns A promise that resolves when the select element has been opened.
 */
export const openSelectElement = async (select?: HTMLSelectElement) => {
  select = select || getSelectElement();
  await clickElement(select);
};

/**
 * Clicks on the given element/item/node using userEvent.
 *
 * @param element - The element to be clicked.
 * @returns A promise that resolves when the click action is complete.
 */
export const clickElement = async (element: Element) => {
  await userEvent.click(element, {
    pointerEventsCheck: PointerEventsCheckLevel.Never,
  });
};

/**
 * Open a MultiSelect component for displaying item selection
 *
 * @param element - The multi-select element to open. If not defined, it will use a default multi-select element.
 * @returns A promise that resolves when the input element has been clicked.
 */
export const openMultiSelectElement = async (element?: HTMLElement) => {
  element = getMultiSelectElement(element);
  const input = getSelectElement(element);
  return await clickElement(input);
};

/**
 * Changes the value of an input element like Select or TestField component and triggers the blur event.
 *
 * @param element - The input element whose value is to be changed.
 * @param value - The new value to be set for the input element.
 */
export const changeInputValue = (
  element: Document | Element | Window | Node,
  value: string,
) => {
  fireEvent.change(element, {target: {value}});
  fireEvent.blur(element);
};

/**
 * Changes the value of a select input element.
 *
 * @param value - The new value to set for the select input.
 * @param input - The select input element to change. If not provided, a default select element will be used.
 */
export const changeSelectInput = (value: string, input?: HTMLSelectElement) => {
  if (!isDefined(input)) {
    input = getSelectElement();
  }
  changeInputValue(input, value);
};

/**
 * Closes a dialog by clicking its close (X) button.
 *
 * @param dialog - The dialog element to close. If not provided, it defaults to the result of getDialog().
 */
export const closeDialog = (dialog?: HTMLElement) => {
  const closeButton = getDialogXButton(dialog) as HTMLElement;
  fireEvent.click(closeButton);
};
