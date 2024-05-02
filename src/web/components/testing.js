/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';

import {screen, userEvent, act, fireEvent} from 'web/utils/testing';

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
export const getSelectItemElements = () => {
  return screen.queryAllByRole('option');
};

/**
 * Get the input box of a Select component
 */
export const getSelectElement = () => {
  const select = screen.queryByRole('searchbox');
  if (select) {
    return select;
  }
  return screen.getByRole('textbox');
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
 * Get selected items of a MultiSelect component
 */
export const getSelectedItems = element => {
  element = getElementOrDocument(element);
  return element.querySelectorAll('.mantine-MultiSelect-value');
};

/**
 * Change the input of a Select component
 */
export const changeSelectInput = (value, input) => {
  if (!isDefined(input)) {
    input = getSelectElement();
  }
  fireEvent.change(input, {target: {value}});
};

/**
 * Query if a dialog is present
 */
export const queryDialog = () => screen.queryByRole('dialog');

/**
 * Get a dialog
 */
export const getDialog = () => screen.getByRole('dialog');

/**
 * Get the dialog content
 */
export const getDialogContent = () => {
  const dialog = getDialog();
  return dialog.querySelector('.mantine-Modal-body');
};

/**
 * Get the dialog title
 */
export const getDialogTitle = () => {
  const dialog = getDialog();
  return dialog.querySelector('.mantine-Modal-title');
};

export const closeDialog = () => {
  const dialog = getDialog();
  const closeButton = dialog.querySelector('.mantine-CloseButton-root');
  fireEvent.click(closeButton);
};
