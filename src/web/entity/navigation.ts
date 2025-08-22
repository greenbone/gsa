/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined, isFunction} from 'gmp/utils/identity';

export type NavigateFunc = (path: string) => void;

export interface NavigateObj {
  navigate: NavigateFunc;
}

export type Navigate = NavigateFunc | NavigateObj;

export interface GotoDetailsObj {
  data: {
    id: string;
  };
}

export type GotoDetailsFunc = ({data}: GotoDetailsObj) => void;
export type GotoListFunc = () => void;

/**
 * Navigates to the details page of a given type and data.
 *
 * @param {string} type - The type of the entity to navigate to.
 * @param {Navigate} navigate - The navigation function or an object containing the navigate function.
 * @returns {GotoDetailsFunc} - A function that takes an object with a data property and navigates to the details page.
 * @throws {Error} - Throws an error if the navigate function is not defined.
 */
export const goToDetails = (
  type: string,
  navigate: Navigate,
): GotoDetailsFunc => {
  if (!isDefined(navigate)) {
    throw new Error('navigate function is required for goToDetails');
  }
  if (!isFunction(navigate)) {
    // we expect an object with a navigate function
    navigate = navigate.navigate;

    if (!isFunction(navigate)) {
      throw new Error('navigate function is required for goToDetails');
    }
  }
  return ({data}) => navigate('/' + type + '/' + data.id);
};

/**
 * Navigates to a list page based on the provided type.
 *
 * @param {string} type - The type of list to navigate to.
 * @param {Navigate} navigate - The navigation function or an object containing the navigate function.
 * @returns {GotoListFunc} A function that, when called, navigates to the specified list page.
 * @throws {Error} If the navigate function is not provided.
 */
export const goToList = (type: string, navigate: Navigate): GotoListFunc => {
  if (!isDefined(navigate)) {
    throw new Error('navigate function is required for goToList');
  }
  if (!isFunction(navigate)) {
    // we expect an object with a navigate function
    navigate = navigate.navigate;

    if (!isFunction(navigate)) {
      throw new Error('navigate function is required for goToList');
    }
  }
  return () => navigate('/' + type);
};
