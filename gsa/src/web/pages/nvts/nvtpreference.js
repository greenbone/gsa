/* Copyright (C) 2017-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React from 'react';

import _ from 'gmp/locale';

import {isEmpty} from 'gmp/utils/string';
import {map} from 'gmp/utils/array';

import PropTypes from 'web/utils/proptypes';

import Checkbox from 'web/components/form/checkbox';
import FileField from 'web/components/form/filefield';
import PasswordField from 'web/components/form/passwordfield';
import Radio from 'web/components/form/radio';
import TextField from 'web/components/form/textfield';
import YesNoRadio from 'web/components/form/yesnoradio';
import {noop_convert} from 'web/components/form/withChangeHandler';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

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
    onChange({value, type: preference.type}, preference.name);
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
    const {preference, value} = this.props;

    const {checked} = this.state;
    const {type} = preference;

    let input;

    if (type === 'checkbox') {
      input = (
        <YesNoRadio
          yesValue="yes"
          noValue="no"
          value={value}
          convert={noop_convert}
          onChange={this.onPreferenceChange}
        />
      );
    } else if (type === 'password') {
      input = (
        <Divider>
          <Checkbox
            title={_('Replace existing password with')}
            checked={checked}
            onChange={this.onCheckedChange}
          />
          <PasswordField
            disabled={!checked}
            value={value}
            onChange={this.onPreferenceChange}
          />
        </Divider>
      );
    } else if (type === 'file') {
      input = (
        <Divider>
          <Checkbox
            title={
              isEmpty(preference.value)
                ? _('Upload file')
                : _('Replace existing file')
            }
            checked={checked}
            onChange={this.onCheckedChange}
          />
          <FileField disabled={!checked} onChange={this.onPreferenceChange} />
        </Divider>
      );
    } else if (type === 'radio') {
      input = (
        <Layout flex="column">
          <Radio
            title={preference.value}
            value={preference.value}
            checked={value === preference.value}
            onChange={this.onPreferenceChange}
          />
          {map(preference.alt, alt => {
            return (
              <Radio
                title={alt}
                value={alt}
                key={alt}
                checked={value === alt}
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
  preference: PropTypes.object.isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
};

export default NvtPreference;

// vim: set ts=2 sw=2 tw=80:
