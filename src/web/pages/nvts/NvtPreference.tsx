/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import styled from 'styled-components';
import {
  type ScanConfigPreference,
  type ScanConfigPreferenceValue,
} from 'gmp/models/scan-config';
import {map} from 'gmp/utils/array';
import {isEmpty} from 'gmp/utils/string';
import Checkbox from 'web/components/form/Checkbox';
import FileField from 'web/components/form/FileField';
import PasswordField from 'web/components/form/PasswordField';
import Radio from 'web/components/form/Radio';
import TextField from 'web/components/form/TextField';
import YesNoRadio from 'web/components/form/YesNoRadio';
import Column from 'web/components/layout/Column';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import useTranslation from 'web/hooks/useTranslation';

interface NvtPreferenceChange {
  type: 'setValue';
  newState: {
    name: string;
    value: ScanConfigPreferenceValue | undefined;
  };
}

interface NvtPreferenceProps {
  preference: ScanConfigPreference;
  value?: ScanConfigPreferenceValue;
  onChange: (change: NvtPreferenceChange) => void;
}

const StyledTableData = styled(TableData)`
  overflow-wrap: break-word;
  white-space: normal;
  word-break: break-word;
`;

const noopConvert = <TValue,>(value: TValue): TValue => value;

const NvtPreference = ({
  preference,
  value = '',
  onChange,
}: NvtPreferenceProps) => {
  const [_] = useTranslation();
  const [checked, setChecked] = useState(false);

  const onPreferenceChange = (
    nextValue: ScanConfigPreferenceValue | undefined,
  ) => {
    onChange({
      type: 'setValue',
      newState: {name: preference.name as string, value: nextValue},
    });
  };

  const onCheckedChange = (nextChecked: boolean) => {
    if (nextChecked) {
      onPreferenceChange('');
    } else {
      onPreferenceChange(undefined);
    }
    setChecked(nextChecked);
  };

  const {type} = preference;

  let input: React.ReactNode;

  if (type === 'checkbox') {
    input = (
      <YesNoRadio
        convert={noopConvert}
        noValue="no"
        value={value}
        yesValue="yes"
        onChange={onPreferenceChange}
      />
    );
  } else if (type === 'password') {
    input = (
      <Column>
        <Checkbox
          checked={checked}
          title={_('Replace existing password with')}
          onChange={onCheckedChange}
        />
        <PasswordField
          disabled={!checked}
          value={value as string}
          onChange={onPreferenceChange}
        />
      </Column>
    );
  } else if (type === 'file') {
    input = (
      <Column>
        <Checkbox
          checked={checked}
          title={
            isEmpty(preference.value)
              ? _('Upload file')
              : _('Replace existing file')
          }
          onChange={onCheckedChange}
        />
        <FileField
          disabled={!checked}
          // @ts-expect-error
          value={value}
          // @ts-expect-error
          onChange={onPreferenceChange}
        />
      </Column>
    );
  } else if (type === 'radio') {
    input = (
      <Column>
        <Radio
          checked={value === preference.value}
          title={String(preference.value)}
          value={preference.value as ScanConfigPreferenceValue}
          onChange={() => onPreferenceChange(preference.value)}
        />
        {map(preference.alt, alt => {
          return (
            <Radio
              key={String(alt)}
              checked={value === alt}
              title={String(alt)}
              value={alt}
              onChange={() => onPreferenceChange(alt)}
            />
          );
        })}
      </Column>
    );
  } else {
    input = (
      <TextField
        name={preference.name}
        value={value}
        onChange={onPreferenceChange}
      />
    );
  }

  return (
    <TableRow>
      <TableData>{preference.hr_name}</TableData>
      <TableData>{input}</TableData>
      <StyledTableData>{preference.default}</StyledTableData>
    </TableRow>
  );
};

export default NvtPreference;
