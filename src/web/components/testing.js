/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {PointerEventsCheckLevel} from '@testing-library/user-event';
import {isDefined} from 'gmp/utils/identity';
import {expect} from 'vitest';
import {
  userEvent,
  fireEvent,
  queryByRole,
  getByRole,
  getByTestId,
  queryAllByTestId,
  queryAllByRole,
  screen,
} from 'web/utils/Testing';

/**
 * Returns the provided element if it is defined, otherwise returns the document body.
 *
 * @param {HTMLElement} [element] - The element to check.
 * @returns {HTMLElement} The provided element if defined, otherwise the document body.
 */
export const getElementOrReturnDocument = element =>
  isDefined(element) ? element : document.body;

/**
 * Get all the radio inputs within the specified element.
 *
 * @param {HTMLElement|Document} [element] - The optional parent element or document to search within.
 * @returns {NodeListOf<Element>} A NodeList of radio input elements.
 */
export const getRadioInputs = element => {
  element = getElementOrReturnDocument(element);
  return element.querySelectorAll('.mantine-Radio-radio');
};

/**
 * Get all the items of a Select component
 *
 * @param {Element|Document} [element] - The optional root element or document to search within.
 * @returns {NodeList} A NodeList of select item elements
 */
export const getSelectItemElements = element => {
  element = getElementOrReturnDocument(element);
  return element.querySelectorAll("[role='option']");
};

/**
 * Retrieves the selectable item elements for a given select element.
 *
 * @param {HTMLElement} [element] - The optional select element to retrieve items for. If not provided, a default select element will be used.
 * @returns {Promise<NodeList>} A promise that resolves to a NodeList of the selectable item elements.
 */
export const getSelectItemElementsForSelect = async element => {
  element = isDefined(element) ? element : getSelectElement();
  await openSelectElement(element);
  const selectItemsId = element.getAttribute('aria-controls');
  const itemsContainer = document.body.querySelector('#' + selectItemsId);
  return getSelectItemElements(itemsContainer);
};

/**
 * Get the input box of a Select component
 *
 * This function first attempts to find an element with the test ID 'form-select'.
 * If no such element is found, it falls back to finding an element with the role 'textbox'.
 *
 * @param {HTMLElement} [element] - The optional element to search within.
 * @returns {HTMLElement} The found select element
 */
export const getSelectElement = element => {
  element = getElementOrReturnDocument(element);
  const select = getByTestId(element, 'form-select');
  if (select) {
    return select;
  }
  return getByRole(element, 'textbox');
};

/**
 * Get all select components
 *
 * @param {HTMLElement} [element] - The root element to query within. If not provided, the document will be used.
 * @returns {NodeListOf<HTMLElement>} A list of select elements
 */
export const queryAllSelectElements = element => {
  element = getElementOrReturnDocument(element);
  return queryAllByTestId(element, 'form-select');
};

/**
 * Open a select element (MultiSelect, Select, etc.)
 *
 * @param {HTMLElement} [select] - An optional select element to open. If not provided, it defaults to the result of getSelectElement().
 * @returns {Promise<void>} A promise that resolves when the select element has been opened.
 */
export const openSelectElement = async select => {
  select = select || getSelectElement();
  await clickElement(select);
};

/**
 * Clicks on the given element/item/node using userEvent.
 *
 * @param {HTMLElement} element - The element to be clicked.
 * @returns {Promise<void>} A promise that resolves when the click action is complete.
 */
export const clickElement = async element => {
  await userEvent.click(element, {
    pointerEventsCheck: PointerEventsCheckLevel.Never,
  });
};

/**
 * Get all multi select (root) elements
 *
 * @param {Element} [element] - An optional element to search within. If not provided, the document will be used.
 * @returns {NodeList} A NodeList of multi select elements.
 */
export const getMultiSelectElements = element => {
  element = getElementOrReturnDocument(element);
  return element.querySelectorAll('.mantine-MultiSelect-inputField');
};

/**
 * Retrieves the multi select (root) element from the given element.
 *
 * @param {HTMLElement} element - The element to search within.
 * @returns {HTMLElement} The found multi select element.
 */
export const getMultiSelectElement = element => {
  return element.getByRole('textbox');
};

/**
 * Open a MultiSelect component for displaying item selection
 *
 * @param {HTMLElement} [element] - The multi-select element to open. If not defined, it will use a default multi-select element.
 * @returns {Promise<void>} A promise that resolves when the input element has been clicked.
 */
export const openMultiSelectElement = async element => {
  element = isDefined(element) ? element : getMultiSelectElement();
  const input = getSelectElement(element);
  return await clickElement(input);
};

/**
 * Get current selected items of a MultiSelect component
 *
 * @param {HTMLElement} element - The document object to query.
 * @returns {NodeList} A NodeList of selected items.
 */
export const getSelectedItems = element => {
  return element.querySelectorAll('.mantine-MultiSelect-pill');
};

/**
 * Get all the selectable items of a MultiSelect component from screen.
 *
 * @returns {HTMLElement[]} An array of select item elements.
 */
export const getSelectItemElementsForMultiSelect = () => {
  return screen.getAllByRole('option');
};

/**
 * Changes the value of an input element like Select or TestField component and triggers the blur event.
 *
 * @param {HTMLElement} element - The input element whose value is to be changed.
 * @param {string|number} value - The new value to be set for the input element.
 */
export const changeInputValue = (element, value) => {
  fireEvent.change(element, {target: {value}});
  fireEvent.blur(element);
};

/**
 * Changes the value of a select input element.
 *
 * @param {string} value - The new value to set for the select input.
 * @param {HTMLSelectElement} [input] - The select input element to change. If not provided, a default select element will be used.
 */
export const changeSelectInput = (value, input) => {
  if (!isDefined(input)) {
    input = getSelectElement();
  }
  changeInputValue(input, value);
};

/**
 * Queries all dialog elements within the specified element or document.
 *
 * @param {HTMLElement} [element] - The element or document to query within. If not provided, the document will be used.
 * @returns {NodeListOf<HTMLElement>} A list of dialogs.
 */
export const queryDialogs = element => {
  element = getElementOrReturnDocument(element);
  return queryAllByRole(element, 'dialog');
};

/**
 * Queries if a dialog is present
 *
 * @param {HTMLElement} [element] - The element to query within. If not provided, the document will be used.
 * @returns {HTMLElement|null} The dialog element if found, otherwise null.
 */
export const queryDialog = element => {
  element = getElementOrReturnDocument(element);
  return queryByRole(element, 'dialog');
};

/**
 * Retrieves the dialog
 *
 * @param {HTMLElement} [element] - The element to search within. If not provided, the document will be used.
 * @returns {HTMLElement} The dialog element found within the specified element or document.
 */
export const getDialog = element => {
  element = getElementOrReturnDocument(element);
  return getByRole(element, 'dialog');
};

/**
 * Retrieves the content of a dialog.
 *
 * @param {HTMLElement} [dialog] - The dialog element. If not defined, a default dialog is retrieved.
 * @returns {HTMLElement|null} The content element of the dialog, or null if not found.
 */
export const queryDialogContent = dialog => {
  dialog = isDefined(dialog) ? dialog : getDialog();
  return dialog.querySelector('.mantine-Modal-body');
};

/**
 * Retrieves the title element from a dialog.
 *
 * @param {HTMLElement} [dialog] - The dialog element. If not provided, a default dialog is retrieved using the getDialog function.
 * @returns {HTMLElement|null} The title element of the dialog, or null if not found.
 */
export const queryDialogTitle = dialog => {
  dialog = isDefined(dialog) ? dialog : getDialog();
  return dialog.querySelector('.mantine-Modal-title');
};

/**
 * Retrieves the save button of a dialog (in the footer)
 *
 * @param {HTMLElement} dialog - The dialog element. If not provided, the default dialog will be used.
 * @returns {HTMLElement} The save button element within the dialog.
 */
export const getDialogSaveButton = dialog => {
  dialog = isDefined(dialog) ? dialog : getDialog();
  return getByTestId(dialog, 'dialog-save-button');
};

/**
 * Retrieves the close button of a dialog (in the footer).
 *
 * @param {HTMLElement} [dialog] - The dialog element. If not provided, the default dialog will be used.
 * @returns {HTMLElement} The close button element within the dialog.
 */
export const getDialogCloseButton = dialog => {
  dialog = isDefined(dialog) ? dialog : getDialog();
  return getByTestId(dialog, 'dialog-close-button');
};

/**
 * Closes a dialog by clicking its close (X) button.
 *
 * @param {HTMLElement} [dialog] - The dialog element to close. If not provided, it defaults to the result of getDialog().
 */
export const closeDialog = dialog => {
  dialog = isDefined(dialog) ? dialog : getDialog();
  const closeButton = dialog.querySelector('.mantine-CloseButton-root');
  fireEvent.click(closeButton);
};

/**
 * Get the element containing the powerfilter
 *
 * @param {HTMLElement} [element] - The element to search within. If not provided, the document will be used.
 * @returns {HTMLElement|null} The powerfilter element, or null if not found.
 */
export const queryPowerFilter = element => {
  element = getElementOrReturnDocument(element);
  return element.querySelector('.powerfilter');
};

/**
 * Get text inputs
 *
 * @param {HTMLElement} [element] - The element to search within. If not provided, the document will be used.
 * @returns {NodeListOf<Element>} A NodeList of text input elements
 */
export const queryTextInputs = element => {
  element = getElementOrReturnDocument(element);
  return element.querySelectorAll('.mantine-TextInput-input');
};

/**
 * Queries the table element
 *
 * @param {HTMLElement} [element] - The element to search within. If not provided, the document will be used.
 * @returns {HTMLTableElement|null} The first table element found within the given element, or null if no table is found.
 */
export const queryTable = element => {
  element = getElementOrReturnDocument(element);
  return element.querySelector('table');
};

/**
 * Queries the table body element
 *
 * @param {HTMLElement} [element] - The element to search within. If not provided, the document will be used.
 * @returns {HTMLTableSectionElement|null} The <tbody> element if found, otherwise null.
 */
export const queryTableBody = element => {
  element = getElementOrReturnDocument(element);
  return element.querySelector('tbody');
};

/**
 * Queries the table footer element.
 *
 * @param {HTMLElement} [element] - The element to search within. If not provided, the document will be used.
 * @returns {HTMLElement|null} The `<tfoot>` element if found, otherwise `null`.
 */
export const queryTableFooter = element => {
  element = getElementOrReturnDocument(element);
  return element.querySelector('tfoot');
};

/**
 * Queries the table header element.
 *
 * @param {HTMLElement} [element] - The element to search within. If not provided, the document will be used.
 * @returns {HTMLElement|null} The <thead> element of the table, or null if not found.
 */
export const queryTableHeader = element => {
  element = getElementOrReturnDocument(element);
  return element.querySelector('thead');
};

/**
 * Queries and returns all checkbox input elements
 *
 * @param {HTMLElement} [element] - The element to search within. If not provided, the document will be used.
 * @returns {NodeList} A NodeList of all checkbox input elements found within the specified element.
 */
export const queryCheckBoxes = element => {
  element = getElementOrReturnDocument(element);
  return element.querySelectorAll('.mantine-Checkbox-input');
};

/**
 * Queries and returns all file input elements
 *
 * @param {HTMLElement} element - The element to search within. If not provided, the document will be used.
 * @returns {NodeList} A NodeList of file input elements
 */
export const queryFileInputs = element => {
  element = getElementOrReturnDocument(element);
  return element.querySelectorAll('.mantine-FileInput-input');
};

export const testBulkTrashcanDialog = (screen, dialogAction) => {
  const dialog = screen.getByRole('dialog');
  expect(dialog).toBeVisible();

  const moveToTrashcanButton = screen.getByText('Move to Trashcan');
  fireEvent.click(moveToTrashcanButton);

  expect(dialogAction).toHaveBeenCalled();
};

export const testBulkDeleteDialog = (screen, dialogAction) => {
  const dialog = screen.getByTestId('confirmation-dialog');
  expect(dialog).toBeVisible();

  const title = screen.getByText('Confirm Deletion');

  expect(title).toBeVisible();

  const deleteButton = screen.getByText('Delete');
  fireEvent.click(deleteButton);

  expect(dialogAction).toHaveBeenCalled();
};
