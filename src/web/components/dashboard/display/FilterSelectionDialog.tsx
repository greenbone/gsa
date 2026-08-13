/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Filter from 'gmp/models/filter';
import {isDefined} from 'gmp/utils/identity';
import SaveDialog from 'web/components/dialog/SaveDialog';
import FormGroup from 'web/components/form/FormGroup';
import Select from 'web/components/form/Select';
import useTranslation from 'web/hooks/useTranslation';
import {
  type RenderSelectItemProps,
  renderSelectItems,
  UNSET_VALUE,
} from 'web/utils/Render';

export interface FilterSelectionDialogValues {
  filterId?: string;
}

interface FilterSelectionDialogProps {
  filterId?: string;
  filters: Filter[];
  onClose: () => void;
  onSave: (values: FilterSelectionDialogValues) => void;
}

const FilterSelectionDialog = ({
  filterId,
  filters,
  onClose,
  onSave,
}: FilterSelectionDialogProps) => {
  const [_] = useTranslation();

  return (
    <SaveDialog<{}, FilterSelectionDialogValues>
      buttonTitle={_('Select')}
      defaultValues={{
        filterId: isDefined(filterId) ? filterId : UNSET_VALUE,
      }}
      title={_('Select Filter')}
      width="500px"
      onClose={onClose}
      onSave={onSave}
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
  );
};

export default FilterSelectionDialog;
