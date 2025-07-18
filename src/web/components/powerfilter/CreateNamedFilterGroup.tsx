/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Checkbox from 'web/components/form/Checkbox';
import TextField from 'web/components/form/TextField';
import Row from 'web/components/layout/Row';
import useTranslation from 'web/hooks/useTranslation';

interface CreateNamedFilterGroupProps {
  filterName?: string;
  saveNamedFilter?: boolean;
  onValueChange?: (value: string | boolean, name: string) => void;
}

const CreateNamedFilterGroup = ({
  filterName = '',
  saveNamedFilter = false,
  onValueChange,
}: CreateNamedFilterGroupProps) => {
  const [_] = useTranslation();
  return (
    <Row>
      <Checkbox
        checked={saveNamedFilter}
        checkedValue={true}
        data-testid="createnamedfiltergroup-checkbox"
        name="saveNamedFilter"
        title={_('Store filter as: ')}
        unCheckedValue={false}
        onChange={onValueChange as (value: boolean, name?: string) => void}
      />
      <TextField
        data-testid="createnamedfiltergroup-textfield"
        disabled={!saveNamedFilter}
        grow="1"
        name="filterName"
        placeholder={_('Filter Name')}
        value={filterName}
        onChange={
          onValueChange as ((value: string, name?: string) => void) | undefined
        }
      />
    </Row>
  );
};

export default CreateNamedFilterGroup;
