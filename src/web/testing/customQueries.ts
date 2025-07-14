/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  getAllByRole,
  getByRole,
  getByTestId,
  getElementError,
  queryAllByAttribute,
  queryAllByRole,
  queryAllByTestId,
  queryByRole,
} from '@testing-library/react';
import {isDefined} from 'gmp/utils/identity';

/**
 * Returns the provided element if it is defined, otherwise returns the document body.
 *
 * @param element - The element to check.
 * @returns The provided element if defined, otherwise the document body.
 */
export const getElementOrReturnDocument = (element?: HTMLElement) =>
  isDefined(element) ? element : document.body;

/**
 * Get all the radio inputs within the specified element.
 *
 * @param element - The optional parent element or document to search within.
 * @returns A NodeList of radio input elements.
 */
export const getRadioInputs = (element?: HTMLElement) => {
  element = getElementOrReturnDocument(element);
  return Array.from(
    element.querySelectorAll<HTMLElement>('.mantine-Radio-radio'),
  );
};

/**
 * Get all the items of a Select component
 *
 * @param element - The optional root element or document to search within.
 * @returns A NodeList of select item elements
 */
export const getSelectItemElements = (element?: HTMLElement) => {
  element = getElementOrReturnDocument(element);
  return Array.from(element.querySelectorAll<HTMLElement>("[role='option']"));
};

/**
 * Get the input box of a Select component
 *
 * This function first attempts to find an element with the test ID 'form-select'.
 * If no such element is found, it falls back to finding an element with the role 'textbox'.
 *
 * @param element - The optional element to search within.
 * @returns The found select element
 */
export const getSelectElement = (element?: HTMLElement) => {
  element = getElementOrReturnDocument(element);
  const select = getByTestId(element, 'form-select');
  if (select) {
    return select as HTMLSelectElement;
  }
  return getByRole(element, 'textbox') as HTMLSelectElement;
};

/**
 * Get all select components
 *
 * @param element - The root element to query within. If not provided, the document will be used.
 * @returns A list of select elements
 */
export const queryAllSelectElements = (element?: HTMLElement) => {
  element = getElementOrReturnDocument(element);
  return queryAllByTestId(element, 'form-select') as HTMLSelectElement[];
};

/**
 * Get all multi select (root) elements
 *
 * @param element - An optional element to search within. If not provided, the document will be used.
 * @returns A NodeList of multi select elements.
 */
export const getMultiSelectElements = (element?: HTMLElement) => {
  element = getElementOrReturnDocument(element);
  return Array.from(
    element.querySelectorAll<HTMLElement>('.mantine-MultiSelect-inputField'),
  );
};

/**
 * Retrieves the multi select (root) element from the given element.
 *
 * @returns The found multi select element.
 */
export const getMultiSelectElement = (element?: HTMLElement) => {
  element = getElementOrReturnDocument(element);
  return getByRole(element, 'textbox');
};

/**
 * Get current selected items of a MultiSelect component
 *
 * @param element - The document object to query.
 * @returns A NodeList of selected items.
 */
export const getSelectedItems = (element: ParentNode) => {
  return Array.from(
    element.querySelectorAll<HTMLElement>('.mantine-MultiSelect-pill'),
  );
};

/**
 * Get all the selectable items of a MultiSelect component from screen.
 *
 * @returns An array of select item elements.
 */
export const getSelectItemElementsForMultiSelect = (element?: HTMLElement) => {
  element = getElementOrReturnDocument(element);
  return getAllByRole(element, 'option');
};

/**
 * Queries all dialog elements within the specified element or document.
 *
 * @param element - The element or document to query within. If not provided, the document will be used.
 * @returns A list of dialogs.
 */
export const queryDialogs = (element?: HTMLElement) => {
  element = getElementOrReturnDocument(element);
  return queryAllByRole(element, 'dialog');
};

/**
 * Queries if a dialog is present
 *
 * @param element - The element to query within. If not provided, the document will be used.
 * @returns The dialog element if found, otherwise null.
 */
export const queryDialog = (element?: HTMLElement) => {
  element = getElementOrReturnDocument(element);
  return queryByRole(element, 'dialog');
};

/**
 * Retrieves the dialog
 *
 * @param element - The element to search within. If not provided, the document will be used.
 * @returns The dialog element found within the specified element or document.
 */
export const getDialog = (element?: HTMLElement) => {
  element = getElementOrReturnDocument(element);
  return getByRole(element, 'dialog');
};

/**
 * Retrieves the content of a dialog.
 *
 * @param dialog - The dialog element. If not defined, a default dialog is retrieved.
 * @returns The content element of the dialog, or null if not found.
 */
export const queryDialogContent = (dialog?: HTMLElement) => {
  dialog = isDefined(dialog) ? dialog : getDialog();
  return dialog.querySelector<HTMLElement>('.mantine-Modal-body');
};

/**
 * Retrieves the content of a dialog element.
 *
 * This function attempts to locate the content of a dialog element using the `queryDialogContent` function.
 * If the dialog content cannot be found, it throws an error indicating the failure.
 *
 * @param dialog - An optional `HTMLElement` representing the dialog element to query.
 *                 If not provided, the function will attempt to query the dialog content globally.
 * @returns The dialog content as an `HTMLElement`.
 * @throws Will throw an error if the dialog content cannot be found.
 */
export const getDialogContent = (dialog?: HTMLElement) => {
  const queryDialog = queryDialogContent(dialog);
  if (!queryDialog) {
    throw getElementError('Unable to find dialog content.', document.body);
  }
  return queryDialog;
};

/**
 * Retrieves the title element from a dialog.
 *
 * @param dialog - The dialog element. If not provided, a default dialog is retrieved using the getDialog function.
 * @returns The title element of the dialog, or null if not found.
 */
export const queryDialogTitle = (dialog?: HTMLElement) => {
  dialog = isDefined(dialog) ? dialog : getDialog();
  return dialog.querySelector<HTMLElement>('.mantine-Modal-title');
};

/**
 * Retrieves the title element of a given dialog.
 *
 * @param dialog - The dialog element to search for the title. If undefined, the function will attempt to query the title globally.
 * @returns The dialog title element if found.
 * @throws Throws an error if the dialog title cannot be found.
 */
export const getDialogTitle = (dialog?: HTMLElement) => {
  const dialogTitle = queryDialogTitle(dialog);
  if (!dialogTitle) {
    throw getElementError('Unable to find dialog title.', document.body);
  }
  return dialogTitle;
};

/**
 * Retrieves the save button of a dialog (in the footer)
 *
 * @param dialog - The dialog element. If not provided, the default dialog will be used.
 * @returns The save button element within the dialog.
 */
export const getDialogSaveButton = (dialog?: HTMLElement) => {
  dialog = isDefined(dialog) ? dialog : getDialog();
  return getByTestId(dialog, 'dialog-save-button');
};

/**
 * Retrieves the close button of a dialog (in the footer).
 *
 * @param dialog - The dialog element. If not provided, the default dialog will be used.
 * @returns The close button element within the dialog.
 */
export const getDialogCloseButton = (dialog?: HTMLElement) => {
  dialog = isDefined(dialog) ? dialog : getDialog();
  return getByTestId(dialog, 'dialog-close-button');
};

/**
 * Retrieves the dialog  X button to close it.
 *
 * @param dialog - The dialog element. If not provided, the default dialog will be used.
 * @returns The X button element within the dialog.
 */
export const getDialogXButton = (dialog?: HTMLElement) => {
  dialog = isDefined(dialog) ? dialog : getDialog();
  const button = dialog.querySelector<HTMLElement>('.mantine-CloseButton-root');
  if (!button) {
    throw getElementError('Unable to find dialog X button.', dialog);
  }
  return button;
};

/**
 * Get the element containing the powerfilter
 *
 * @param element - The element to search within. If not provided, the document will be used.
 * @returns The powerfilter element, or null if not found.
 */
export const queryPowerFilter = (element?: HTMLElement) => {
  element = getElementOrReturnDocument(element);
  return element.querySelector<HTMLElement>('.powerfilter');
};

/**
 * Get text inputs
 *
 * @param element - The element to search within. If not provided, the document will be used.
 * @returns A NodeList of text input elements
 */
export const queryTextInputs = (element?: HTMLElement) => {
  element = getElementOrReturnDocument(element);
  return Array.from(
    element.querySelectorAll<HTMLElement>('.mantine-TextInput-input'),
  );
};

/**
 * Queries the table element
 *
 * @param element - The element to search within. If not provided, the document will be used.
 * @returns The first table element found within the given element, or null if no table is found.
 */
export const queryTable = (element?: HTMLElement) => {
  element = getElementOrReturnDocument(element);
  return element.querySelector('table');
};

/**
 * Queries the table body element
 *
 * @param element - The element to search within. If not provided, the document will be used.
 * @returns The <tbody> element if found, otherwise null.
 */
export const queryTableBody = (element?: HTMLElement) => {
  element = getElementOrReturnDocument(element);
  return element.querySelector('tbody');
};

/**
 * Queries the table footer element.
 *
 * @param element - The element to search within. If not provided, the document will be used.
 * @returns The `<tfoot>` element if found, otherwise `null`.
 */
export const queryTableFooter = (element?: HTMLElement) => {
  element = getElementOrReturnDocument(element);
  return element.querySelector('tfoot');
};

/**
 * Queries the table header element.
 *
 * @param element - The element to search within. If not provided, the document will be used.
 * @returns The <thead> element of the table, or null if not found.
 */
export const queryTableHeader = (element?: HTMLElement) => {
  element = getElementOrReturnDocument(element);
  return element.querySelector('thead');
};

/**
 * Queries and returns all checkbox input elements
 *
 * @param element - The element to search within. If not provided, the document will be used.
 * @returns A NodeList of all checkbox input elements found within the specified element.
 */
export const queryCheckBoxes = (element?: HTMLElement) => {
  element = getElementOrReturnDocument(element);
  return Array.from(
    element.querySelectorAll<HTMLElement>('.mantine-Checkbox-input'),
  );
};

/**
 * Retrieves all checkbox elements within a specified container.
 * Throws an error if no checkboxes are found.
 *
 * @param container - The HTML element that serves as the container to search for checkboxes.
 * @returns An array of checkbox elements found within the container.
 * @throws Will throw an error if no checkboxes are found within the container.
 */
export const getAllCheckBoxes = (container: HTMLElement) => {
  const elements = queryCheckBoxes(container);
  if (!elements.length) {
    throw getElementError(
      `Unable to find checkboxes within: ${container}.`,
      container,
    );
  }
  return elements;
};

/**
 * Queries and returns all file input elements
 *
 * @param element - The element to search within. If not provided, the document will be used.
 * @returns A NodeList of file input elements
 */
export const queryFileInputs = (element?: HTMLElement) => {
  element = getElementOrReturnDocument(element);
  return Array.from(
    element.querySelectorAll<HTMLElement>('.mantine-FileInput-input'),
  );
};

/**
 * Queries all elements within a given container that have the specified `name` attribute.
 *
 * @param container - The HTML container element to search within.
 * @param name - The value of the `name` attribute to match.
 * @returns An array of elements that match the specified `name` attribute.
 */
export const queryAllByName = (container: HTMLElement, name: string) =>
  queryAllByAttribute('name', container, name);

/**
 * Queries the given container for elements matching the specified name and returns the first matching element.
 * If no elements are found, returns `null`.
 *
 * @param container - The HTML container element to search within.
 * @param name - The name attribute or identifier to match elements against.
 * @returns The first matching HTMLElement, or `null` if no matches are found.
 */
export const queryByName = (container: HTMLElement, name: string) => {
  const elements = queryAllByName(container, name);
  if (!elements.length) {
    return null;
  }
  return elements[0];
};

/**
 * Retrieves all elements within a given container that match the specified name.
 * Throws an error if no matching elements are found.
 *
 * @param container - The HTML container element to search within.
 * @param name - The name attribute value to match against.
 * @returns An array of elements that match the specified name.
 * @throws Will throw an error if no elements with the specified name are found.
 */
export const getAllByName = (container: HTMLElement, name: string) => {
  const elements = queryAllByName(container, name);
  if (!elements.length) {
    throw getElementError(
      `Unable to find an element with the name: ${name}.`,
      container,
    );
  }
  return elements;
};

/**
 * Retrieves the first element within a container that matches the specified name.
 *
 * @param container - The HTML container element to search within.
 * @param name - The name attribute value to match.
 * @returns The first matching HTMLElement, or undefined if no matches are found.
 */
export const getByName = (container: HTMLElement, name: string) => {
  const elements = getAllByName(container, name);
  return elements[0];
};
