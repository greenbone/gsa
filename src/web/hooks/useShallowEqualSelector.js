/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useSelector, shallowEqual} from 'react-redux';

/**
 * A hook to use a redux selector with shallow equality check
 *
 * By default useSelector uses a strict equality check `===` to determine if the
 * state has changed. This hook uses a shallow equality check to determine if the
 * state has changed.
 *
 * @param {*} selector A redux selector
 * @returns {*} The selected state
 */
const useShallowEqualSelector = selector => useSelector(selector, shallowEqual);

export default useShallowEqualSelector;
