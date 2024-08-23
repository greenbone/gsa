/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState, useCallback} from 'react';

import {isDefined} from 'gmp/utils/identity';

import SelectionType from 'web/utils/selectiontype';

/**
 * Hook to manage selection of entities
 *
 * @param {int} initialSelectionType The initial selection type to be used.
 *    Default is SelectionType.SELECTION_PAGE_CONTENTS
 * @returns {Object} selected, selectionType, select, deselect, changeSelectionType
 */
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
