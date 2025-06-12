/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState, useCallback} from 'react';
import {isDefined} from 'gmp/utils/identity';
import SelectionType from 'web/utils/SelectionType';

type SelectionTypeType = (typeof SelectionType)[keyof typeof SelectionType];

/**
 * Hook to manage selection of entities
 *
 * @param initialSelectionType The initial selection type to be used.
 *    Default is SelectionType.SELECTION_PAGE_CONTENTS
 * @returns Object selected, selectionType, select, deselect, changeSelectionType
 */
const useSelection = <TSelect = {}>(
  initialSelectionType: SelectionTypeType = SelectionType.SELECTION_PAGE_CONTENTS,
) => {
  const [selected, setSelected] = useState<Array<TSelect>>([]);
  const [selectionType, setSelectionType] = useState(initialSelectionType);

  const select = useCallback((obj: TSelect) => {
    // ensure the using component gets re-rendered by creating new array
    setSelected(prevSelected =>
      isDefined(prevSelected) && !prevSelected.includes(obj)
        ? [...prevSelected, obj]
        : [],
    );
  }, []);

  const deselect = useCallback((obj: TSelect) => {
    // ensure the using component gets re-rendered by creating new array
    setSelected(prevSelected => {
      if (isDefined(prevSelected) && prevSelected.includes(obj)) {
        return prevSelected.filter(o => o !== obj);
      }
      return [];
    });
  }, []);

  const changeSelectionType = useCallback(
    (newSelectionType: SelectionTypeType) => {
      setSelected([]);
      setSelectionType(newSelectionType);
    },
    [],
  );
  return {selected, selectionType, select, deselect, changeSelectionType};
};

export default useSelection;
