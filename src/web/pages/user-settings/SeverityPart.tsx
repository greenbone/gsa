/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {YES_VALUE, NO_VALUE, YesNo} from 'gmp/parser';
import Checkbox from 'web/components/form/Checkbox';
import FormGroup from 'web/components/form/FormGroup';
import Spinner from 'web/components/form/Spinner';
import useTranslation from 'web/hooks/useTranslation';

interface SeverityPartProps {
  defaultSeverity?: number;
  dynamicSeverity?: YesNo;
  onChange: (value: number, name?: string) => void;
}

const SeverityPart = ({
  defaultSeverity,
  dynamicSeverity,
  onChange,
}: SeverityPartProps) => {
  const [_] = useTranslation();
  return (
    <>
      <Checkbox<YesNo>
        checked={dynamicSeverity === YES_VALUE}
        checkedValue={YES_VALUE}
        name="dynamicSeverity"
        title={_('Dynamic Severity')}
        unCheckedValue={NO_VALUE}
        onChange={onChange}
      />
      <FormGroup title={_('Default Severity')}>
        <Spinner
          max={10}
          min={0}
          name="defaultSeverity"
          precision={1}
          step={0.1}
          type="float"
          value={defaultSeverity}
          onChange={onChange}
        />
      </FormGroup>
    </>
  );
};

export default SeverityPart;
