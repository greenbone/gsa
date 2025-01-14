/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {map} from 'gmp/utils/array';
import {isEmpty} from 'gmp/utils/string';
import {useState} from 'react';
import styled from 'styled-components';
import Checkbox from 'web/components/form/checkbox';
import FileField from 'web/components/form/filefield';
import PasswordField from 'web/components/form/passwordfield';
import Radio from 'web/components/form/radio';
import TextField from 'web/components/form/textfield';
import YesNoRadio from 'web/components/form/yesnoradio';
import Column from 'web/components/layout/column';
import Divider from 'web/components/layout/divider';
import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';
import PropTypes from 'web/utils/proptypes';

const StyledTableData = styled(TableData)`
  overflow-wrap: break-word;
  white-space: normal;
  word-break: break-word;
`;

const noopConvert = value => value;

const NvtPreference = ({preference, value = '', onChange}) => {
  const [checked, setChecked] = useState(false);

  const onPreferenceChange = value => {
    onChange({type: 'setValue', newState: {name: preference.name, value}});
  };

  const onCheckedChange = value => {
    if (value) {
      onPreferenceChange('');
    } else {
      onPreferenceChange(undefined);
    }
    setChecked(value);
  };
  const {type} = preference;

  let input;

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
          value={value}
          onChange={onPreferenceChange}
        />
      </Column>
    );
  } else if (type === 'file') {
    input = (
      <Divider>
        <Checkbox
          checked={checked}
          title={
            isEmpty(preference.value)
              ? _('Upload file')
              : _('Replace existing file')
          }
          onChange={onCheckedChange}
        />
        <FileField disabled={!checked} onChange={onPreferenceChange} />
      </Divider>
    );
  } else if (type === 'radio') {
    input = (
      <Column>
        <Radio
          checked={value === preference.value}
          title={String(preference.value)}
          value={preference.value}
          onChange={() => onPreferenceChange(preference.value)}
        />
        {map(preference.alt, alt => {
          return (
            <Radio
              key={alt}
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

NvtPreference.propTypes = {
  preference: PropTypes.shape({
    default: PropTypes.any,
    hr_name: PropTypes.string,
    name: PropTypes.string.isRequired,
    value: PropTypes.any,
    alt: PropTypes.array,
    type: PropTypes.string,
  }).isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
};

export default NvtPreference;
