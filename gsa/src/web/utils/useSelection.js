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

import {useState, useCallback} from 'react';

import SelectionType from './selectiontype';
import {isDefined} from 'gmp/utils/identity';

const useSelection = (
  initialSelectionType = SelectionType.SELECTION_PAGE_CONTENTS,
) => {
  const [selected, setSelected] = useState(
    initialSelectionType === SelectionType.SELECTION_USER ? [] : undefined,
  );
  const [selectionType, setSelectionType] = useState(initialSelectionType);

  const select = useCallback(obj => {
    // ensure the using component gets re-rendered by creating new array
    setSelected(prevSelected =>
      isDefined(prevSelected) && !prevSelected.includes(obj)
        ? [...prevSelected, obj]
        : undefined,
    );
  }, []);

  const deselect = useCallback(obj => {
    // ensure the using component gets re-rendered by creating new array
    setSelected(prevSelected => {
      if (isDefined(prevSelected) && prevSelected.includes(obj)) {
        return prevSelected.filter(o => o !== obj);
      }
      return undefined;
    });
  }, []);

  const changeSelectionType = useCallback(newSelectionType => {
    if (newSelectionType === SelectionType.SELECTION_USER) {
      setSelected([]);
    } else {
      setSelected();
    }

    setSelectionType(newSelectionType);
  }, []);
  return {selected, selectionType, select, deselect, changeSelectionType};
};

export default useSelection;
