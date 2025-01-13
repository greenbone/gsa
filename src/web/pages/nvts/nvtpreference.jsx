/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {map} from 'gmp/utils/array';
import {isEmpty} from 'gmp/utils/string';
import React from 'react';
import Checkbox from 'web/components/form/checkbox';
import FileField from 'web/components/form/filefield';
import PasswordField from 'web/components/form/passwordfield';
import Radio from 'web/components/form/radio';
import TextField from 'web/components/form/textfield';
import YesNoRadio from 'web/components/form/yesnoradio';
import Column from 'web/components/layout/column';
import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';
import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';
import PropTypes from 'web/utils/proptypes';

const noop_convert = value => value;

class NvtPreference extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      checked: false,
    };

    this.onCheckedChange = this.onCheckedChange.bind(this);
    this.onPreferenceChange = this.onPreferenceChange.bind(this);
  }

  onPreferenceChange(value) {
    const {onChange, preference} = this.props;
    onChange({type: 'setValue', newState: {name: preference.name, value}});
  }

  onCheckedChange(value) {
    if (value) {
      this.onPreferenceChange('');
    } else {
      this.onPreferenceChange(undefined);
    }
    this.setState({checked: value});
  }

  render() {
    const {preference, value = ''} = this.props;

    const {checked} = this.state;
    const {type} = preference;

    let input;

    if (type === 'checkbox') {
      input = (
        <YesNoRadio
          convert={noop_convert}
          noValue="no"
          value={value}
          yesValue="yes"
          onChange={this.onPreferenceChange}
        />
      );
    } else if (type === 'password') {
      input = (
        <Column>
          <Checkbox
            checked={checked}
            title={_('Replace existing password with')}
            onChange={this.onCheckedChange}
          />
          <PasswordField
            aria-label="Password"
            disabled={!checked}
            value={value}
            onChange={this.onPreferenceChange}
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
            onChange={this.onCheckedChange}
          />
          <FileField
            aria-label="File"
            disabled={!checked}
            onChange={this.onPreferenceChange}
          />
        </Divider>
      );
    } else if (type === 'radio') {
      input = (
        <Layout flex="column">
          <Radio
            checked={value === preference.value}
            title={preference.value}
            value={preference.value}
            onChange={this.onPreferenceChange}
          />
          {map(preference.alt, alt => {
            return (
              <Radio
                key={alt}
                checked={value === alt}
                title={alt}
                value={alt}
                onChange={this.onPreferenceChange}
              />
            );
          })}
        </Layout>
      );
    } else {
      input = (
        <TextField
          name={preference.name}
          value={value}
          onChange={this.onPreferenceChange}
        />
      );
    }
    return (
      <TableRow>
        <TableData>{preference.hr_name}</TableData>
        <TableData>{input}</TableData>
        <TableData>{preference.default}</TableData>
      </TableRow>
    );
  }
}

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
