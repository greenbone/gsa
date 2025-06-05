/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {parseYesNo, YES_VALUE, NO_VALUE, YesNo} from 'gmp/parser';
import Radio from 'web/components/form/Radio';
import Row from 'web/components/layout/Row';
import useTranslation from 'web/hooks/useTranslation';

interface YesNoRadioProps<TValue> {
  convert?: (value?: string) => TValue;
  disabled?: boolean;
  name?: string;
  noValue?: TValue;
  value?: TValue;
  yesValue?: TValue;
  onChange?: (value: TValue, name?: string) => void;
}

const YesNoRadio = <TValue = YesNo,>({
  convert = parseYesNo as (value?: string) => TValue,
  disabled,
  value,
  name,
  yesValue = YES_VALUE as TValue,
  noValue = NO_VALUE as TValue,
  onChange,
}: YesNoRadioProps<TValue>) => {
  const [_] = useTranslation();

  return (
    <Row>
      <Radio<TValue>
        checked={value === yesValue}
        convert={convert}
        data-testid="radio-yes"
        disabled={disabled}
        name={name}
        title={_('Yes')}
        value={yesValue}
        onChange={onChange}
      />
      <Radio<TValue>
        checked={value === noValue}
        convert={convert}
        data-testid="radio-no"
        disabled={disabled}
        name={name}
        title={_('No')}
        value={noValue}
        onChange={onChange}
      />
    </Row>
  );
};

export default YesNoRadio;
