/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';

import {
  userEvent,
  act,
  fireEvent,
  queryAllByRole,
  queryByRole,
  getByRole,
  getAllByTestId,
  getByTestId,
} from 'web/utils/testing';

export const getElementOrDocument = element =>
  isDefined(element) ? element : document.body;

/**
 * Get all the radio inputs
 */
export const getRadioInputs = element => {
  element = getElementOrDocument(element);
  return element.querySelectorAll('.mantine-Radio-radio');
};

/**
 * Get all the items of a Select component
 */
export const getSelectItemElements = element => {
  element = getElementOrDocument(element);
  return element.querySelectorAll("[role='option']");
};

/**
 * Get the items that are selectable of a Select component
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
 */
export const getSelectElement = element => {
  element = getElementOrDocument(element);
  const select = queryByRole(element, 'searchbox');
  if (select) {
    return select;
  }
  return getByRole(element, 'textbox');
};

/**
 * Get all select components
 */
export const getSelectElements = element => {
  element = getElementOrDocument(element);
  return queryAllByRole(element, 'searchbox');
};

/**
 * Open a select element (MultiSelect, Select, etc.)
 */
export const openSelectElement = async select => {
  await act(async () => {
    select = select || getSelectElement();
    await userEvent.click(select);
  });
};

/**
 * Click on an element/item/node
 */
export const clickElement = async element => {
  await act(async () => {
    await userEvent.click(element);
  });
};

/**
 * Get all multi select (root) elements
 */
export const getMultiSelectElements = element => {
  element = getElementOrDocument(element);
  return element.querySelectorAll('.mantine-MultiSelect-root');
};

/**
 * Get all multi select (root) element
 */
export const getMultiSelectElement = element => {
  element = getElementOrDocument(element);
  return element.querySelector('.mantine-MultiSelect-root');
};

/**
 * Open a MultiSelect component for displaying item selection
 */
export const openMultiSelectElement = async element => {
  element = isDefined(element) ? element : getMultiSelectElement();
  const input = getSelectElement(element);
  return await clickElement(input);
};

/**
 * Get current selected items of a MultiSelect component
 */
export const getSelectedItems = element => {
  element = getElementOrDocument(element);
  return element.querySelectorAll('.mantine-MultiSelect-value');
};

/**
 * Get all the selectable items of a MultiSelect component
 */
export const getSelectItemElementsForMultiSelect = async element => {
  element = isDefined(element) ? element : getMultiSelectElement();
  await openMultiSelectElement(element);
  const controlElement = element.querySelector('.mantine-MultiSelect-wrapper');
  const selectItemsId = controlElement.getAttribute('aria-controls');
  const itemsContainer = document.body.querySelector(
    '#' + selectItemsId + '-items',
  );
  return getSelectItemElements(itemsContainer);
};

/**
 * Change the value of an input element like Select or TestField component
 */
export const changeInputValue = (element, value) => {
  fireEvent.change(element, {target: {value}});
};

/**
 * Change the input of a Select component
 */
export const changeSelectInput = (value, input) => {
  if (!isDefined(input)) {
    input = getSelectElement();
  }
  changeInputValue(input, value);
};

/**
 * Query if a dialog is present
 */
export const queryDialog = element => {
  element = getElementOrDocument(element);
  return queryByRole(element, 'dialog');
};

/**
 * Get a dialog
 */
export const getDialog = element => {
  element = getElementOrDocument(element);
  return getByRole(element, 'dialog');
};

/**
 * Get the dialog content
 */
export const getDialogContent = dialog => {
  dialog = isDefined(dialog) ? dialog : getDialog();
  return dialog.querySelector('.mantine-Modal-body');
};

/**
 * Get the dialog title
 */
export const getDialogTitle = dialog => {
  dialog = isDefined(dialog) ? dialog : getDialog();
  return dialog.querySelector('.mantine-Modal-title');
};

/**
 * Get the save button of a dialog
 */
export const getDialogSaveButton = dialog => {
  dialog = isDefined(dialog) ? dialog : getDialog();
  return getByTestId(dialog, 'dialog-save-button');
};

/**
 * Get the close button of a dialog (in the footer)
 */
export const getDialogCloseButton = dialog => {
  dialog = isDefined(dialog) ? dialog : getDialog();
  return getByTestId(dialog, 'dialog-close-button');
};

/**
 * Close a dialog
 */
export const closeDialog = dialog => {
  dialog = isDefined(dialog) ? dialog : getDialog();
  const closeButton = dialog.querySelector('.mantine-CloseButton-root');
  fireEvent.click(closeButton);
};

/**
 * Get the element containing the powerfilter
 */
export const getPowerFilter = element => {
  element = getElementOrDocument(element);
  return element.querySelector('.powerfilter');
};

/**
 * Get text inputs
 */
export const getTextInputs = element => {
  element = getElementOrDocument(element);
  return element.querySelectorAll('.mantine-TextInput-input');
};

/**
 * Get the table element
 */
export const getTable = element => {
  element = getElementOrDocument(element);
  return element.querySelector('table');
};

/**
 * Get the table body element
 */
export const getTableBody = element => {
  element = getElementOrDocument(element);
  return element.querySelector('tbody');
};

/**
 * Get the table footer element
 */
export const getTableFooter = element => {
  element = getElementOrDocument(element);
  return element.querySelector('tfoot');
};

/**
 * Get the table header element
 */
export const getTableHeader = element => {
  element = getElementOrDocument(element);
  return element.querySelector('thead');
};

/**
 * Get action items
 */
export const getActionItems = element => {
  element = getElementOrDocument(element);
  return getAllByTestId(element, 'svg-icon');
};

/**
 * Get the bulk action items of a page
 */
export const getBulkActionItems = element => {
  const tableFooter = getTableFooter(element);
  return getActionItems(tableFooter);
};

/**
 * Get the check boxes
 */
export const getCheckBoxes = element => {
  element = getElementOrDocument(element);
  return element.querySelectorAll('.mantine-Checkbox-input');
};
