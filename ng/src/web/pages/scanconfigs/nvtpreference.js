/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import _ from 'gmp/locale.js';
import {is_empty, map} from 'gmp/utils';

import PropTypes from '../../utils/proptypes.js';

import Checkbox from '../../components/form/checkbox.js';
import FileField from '../../components/form/filefield.js';
import {noop_convert} from '../../components/form/form.js';
import PasswordField from '../../components/form/passwordfield.js';
import Radio from '../../components/form/radio.js';
import TextField from '../../components/form/textfield.js';
import YesNoRadio from '../../components/form/yesnoradio.js';

import Layout from '../../components/layout/layout.js';

import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

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
    }
    else {
      this.onPreferenceChange(undefined);
    }
    this.setState({checked: value});
  }

  render() {
    const {
      preference,
      value,
    } = this.props;

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
    }
    else if (type === 'password') {
      input = (
        <Layout flex>
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
        </Layout>
      );
    }
    else if (type === 'file') {
      input = (
        <Layout flex>
          <Checkbox
            title={
              is_empty(preference.value) ?
                _('Upload file') :
                _('Replace existing file')
            }
            checked={checked}
            onChange={this.onCheckedChange}
          />
          <FileField
            disabled={!checked}
            onChange={this.onPreferenceChange}
          />
        </Layout>
      );
    }
    else if (type === 'radio') {
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
          })
          }
        </Layout>
      );
    }
    else {
      input = (
        <TextField
          name={preference.name}
          value={value}
          maxLength="400"
          onChange={this.onPreferenceChange}
        />
      );
    }
    return (
      <TableRow>
        <TableData>
          {preference.hr_name}
        </TableData>
        <TableData>
          {input}
        </TableData>
        <TableData>
          {preference.default}
        </TableData>
        <TableData>
        </TableData>
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
