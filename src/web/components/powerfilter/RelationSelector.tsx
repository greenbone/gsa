/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Select from 'web/components/form/Select';
import useTranslation from 'web/hooks/useTranslation';
import {UNSET_LABEL, UNSET_VALUE} from 'web/utils/Render';

interface RelationSelectorProps {
  relation?: string;
  onChange?: (value: string) => void;
}

const RelationSelector = ({relation, onChange}: RelationSelectorProps) => {
  const [_] = useTranslation();
  return (
    <Select
      data-testid="relation-selector"
      items={[
        {label: UNSET_LABEL, value: UNSET_VALUE},
        {label: _('is equal to'), value: '='},
        {label: _('is greater than'), value: '>'},
        {label: _('is less than'), value: '<'},
      ]}
      value={relation}
      onChange={onChange}
    />
  );
};

export default RelationSelector;
