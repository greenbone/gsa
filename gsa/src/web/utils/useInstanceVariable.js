/* Copyright (C) 2020-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import {useRef} from 'react';

/**
 * A hook to store an instance variable for a function component.
 *
 * This variable is persistent during render phases and changes to the variable
 * don't cause re-renders like useState does. It is comparable to storing a
 * variable to this in a class component.
 *
 * https://reactjs.org/docs/hooks-faq.html#is-there-something-like-instance-variables
 *
 * @param {*} initialValue Initial value of the variable. Can be any kind of
 *                         object. Most of the time it should be initialized
 *                         with an empty object.
 */
const useInstanceVariable = initialValue => {
  const ref = useRef(initialValue);
  return ref.current;
};

export default useInstanceVariable;
