/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import type Filter from 'gmp/models/filter';
import type FilterType from 'gmp/models/filter/filter-type';
import {isDefined} from 'gmp/utils/identity';
import SaveDialog from 'web/components/dialog/SaveDialog';
import FormGroup from 'web/components/form/FormGroup';
import Select from 'web/components/form/Select';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import {loadEntities, selector} from 'web/store/entities/filters';
import {
  type RenderSelectItemProps,
  renderSelectItems,
  UNSET_VALUE,
} from 'web/utils/Render';

interface FilterSelectionRenderProps {
  filter?: Filter;
  selectFilter: () => void;
}

interface FilterSelectionProps {
  children: (props: FilterSelectionRenderProps) => React.ReactNode;
  filterId?: string;
  filtersFilter: FilterType;
  onFilterIdChanged?: (filterId?: string) => void;
}

const FilterSelection = ({
  children,
  filterId,
  filtersFilter,
  onFilterIdChanged,
}: FilterSelectionProps) => {
  const [_] = useTranslation();
  const gmp = useGmp();
  const dispatch = useDispatch();
  const [showDialog, setShowDialog] = useState(false);

  const filters = useSelector<unknown, Filter[]>(state => {
    if (!isDefined(filtersFilter)) {
      return [];
    }
    return selector(state).getEntities(filtersFilter) ?? [];
  });

  useEffect(() => {
    // @ts-expect-error redux thunk action
    dispatch(loadEntities(gmp)(filtersFilter));
  }, [dispatch, filtersFilter, gmp]);

  const closeDialog = () => {
    setShowDialog(false);
  };

  const handleSaveDialog = ({filterId = UNSET_VALUE}: {filterId?: string}) => {
    closeDialog();

    if (isDefined(onFilterIdChanged)) {
      onFilterIdChanged(filterId === UNSET_VALUE ? undefined : filterId);
    }
  };

  const filter = isDefined(filterId)
    ? filters.find(f => f.id === filterId)
    : undefined;

  return (
    <>
      {children({
        filter,
        selectFilter: () => setShowDialog(true),
      })}
      {showDialog && (
        <SaveDialog
          buttonTitle={_('Select')}
          defaultValues={{
            filterId: isDefined(filterId) ? filterId : UNSET_VALUE,
          }}
          title={_('Select Filter')}
          width="500px"
          onClose={closeDialog}
          onSave={handleSaveDialog}
        >
          {({values, onValueChange}) => (
            <FormGroup title={_('Filter')}>
              <Select
                items={renderSelectItems(
                  filters as RenderSelectItemProps[],
                  UNSET_VALUE,
                )}
                name="filterId"
                value={values.filterId}
                onChange={onValueChange}
              />
            </FormGroup>
          )}
        </SaveDialog>
      )}
    </>
  );
};

export default FilterSelection;
