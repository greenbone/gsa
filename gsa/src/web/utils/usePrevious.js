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

import {useEffect, useRef} from 'react';

/**
 * React custom hook to store the value of the previous rendering
 *
 * It allows for checking if a value has changed since last render.
 *
 * Code Snippet
 *
 * ```
 * const [value, setValue] = useState(initialValue);
 * const previousValue = usePrevious(value);
 *
 * if (value !== previousValue) { // value has changed
 *     doSomething()
 * }
 * ```
 *
 * https://reactjs.org/docs/hooks-faq.html#how-to-get-the-previous-props-or-state
 * https://medium.com/@rossbulat/react-using-refs-with-the-useref-hook-884ed25b5c29
 */
const usePrevious = value => {
  const ref = useRef(value); // set value in initial rendering

  useEffect(() => {
    // will be called AFTER the calling component has rendered
    ref.current = value;
  });

  return ref.current;
};

export default usePrevious;
