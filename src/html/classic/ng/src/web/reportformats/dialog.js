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

import _ from '../../locale.js';
import {is_defined, is_array, has_value, map} from '../../utils.js';

import PropTypes from '../utils/proptypes.js';

import {withDialog} from '../components/dialog/dialog.js';

import FileField from '../components/form/filefield.js';
import FormGroup from '../components/form/formgroup.js';
import Spinner from '../components/form/spinner.js';
import TextArea from '../components/form/textarea.js';
import TextField from '../components/form/textfield.js';
import Select2 from '../components/form/select2.js';
import YesNoRadio from '../components/form/yesnoradio.js';

import Layout from '../components/layout/layout.js';

import Table from '../components/table/table.js';
import TableBody from '../components/table/body.js';
import TableData from '../components/table/data.js';
import TableHeader from '../components/table/header.js';
import TableHead from '../components/table/head.js';
import TableRow from '../components/table/row.js';

const ReportFormatListParam = ({
    formats,
    idList,
    name,
    onValueChange,
  }) => {
  return (
    <TableRow>
      <TableData>
        {name}
      </TableData>
      <TableData>
        <Select2
          multiple
          name={name}
          value={idList}
          onChange={onValueChange}
        >
          {map(formats, format => {
            return (
              <option
                key={format.id}
                value={format.id}>
                {format.name}
              </option>
            );
          })}
        </Select2>
      </TableData>
    </TableRow>
  );
};

ReportFormatListParam.propTypes = {
  formats: PropTypes.arrayLike.isRequired,
  idList: PropTypes.array.isRequired,
  name: PropTypes.string.isRequired,
  onValueChange: PropTypes.func.isRequired,
};

const Param = ({
    data,
    value,
    onPrefChange,
  }) => {
  let {name, type, min, max} = value;
  let field_value = data[name];

  let field;
  if (type === 'boolean') {
    field = (
      <YesNoRadio
        name={name}
        value={field_value}
        onChange={onPrefChange}
      />
    );
  }
  else if (type === 'integer') {
    field = (
      <Spinner
        type="int"
        name={name}
        min={min}
        max={max}
        value={field_value}
        onChange={onPrefChange}
      />
    );
  }
  else if (type === 'string') {
    field = (
      <TextField
        name={name}
        maxLength={max}
        value={field_value}
        onChange={onPrefChange}
      />
    );
  }
  else if (type === 'selection') {
    field = (
      <Select2
        name={name}
        value={is_array(field_value) ? field_value : [field_value]}
        onChange={onPrefChange}
      >
        {
          value.options.map(opt => (
            <option
              key={opt.value}
              value={opt.value}>
              {opt.name}
            </option>
          ))
        }
      </Select2>
    );
  }
  else {
    field = (
      <TextArea
        cols="80"
        rows="5"
        name={name}
        value={field_value}
        onChange={onPrefChange}
      />
    );
  }
  return (
    <TableRow>
      <TableData>
        {name}
      </TableData>
      <TableData>
        {field}
      </TableData>
    </TableRow>
  );
};

Param.propTypes = {
  data: PropTypes.object.isRequired,
  value: PropTypes.object.isRequired,
  onPrefChange: PropTypes.func.isRequired,
};

class Dialog extends React.Component {

  constructor(...args) {
    super(...args);

    this.handlePrefChange = this.handlePrefChange.bind(this);
    this.handleIdListChange = this.handleIdListsChange.bind(this);
  }

  handlePrefChange(value, name) {
    let {preferences, onValueChange} = this.props;

    preferences[name] = value;

    if (onValueChange) {
      onValueChange(preferences, 'preferences');
    }
  }

  handleIdListsChange(value, name) {
    let {id_lists, onValueChange} = this.props;

    if (!has_value(value)) {
      value = [];
    }

    id_lists[name] = value;

    if (onValueChange) {
      onValueChange(id_lists, 'is_lists');
    }
  }

  render() {
    const {
      active,
      formats,
      id_lists,
      name,
      preferences,
      reportformat,
      summary,
      onValueChange,
    } = this.props;

    if (is_defined(reportformat)) {
      return (
        <Layout flex="column">
          <FormGroup title={_('Name')}>
            <TextField
              grow="1"
              name="name"
              value={name}
              maxLength="80"
              onChange={onValueChange}
            />
          </FormGroup>

          <FormGroup title={_('Summary')}>
            <TextField
              grow="1"
              name="summary"
              value={summary}
              maxLength="400"
              onChange={onValueChange}
            />
          </FormGroup>

          <FormGroup title={_('Active')}>
            <YesNoRadio
              name="active"
              value={active}
              onChange={onValueChange}
            />
          </FormGroup>

          {reportformat.params.length > 0 &&
            <h2>Parameters</h2>
          }
          {reportformat.params.length > 0 &&
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead width="25%">{_('Name')}</TableHead>
                  <TableHead width="75%">{_('Value')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportformat.params.map(param => {
                  if (param.type === 'report_format_list') {
                    return (
                      <ReportFormatListParam
                        key={param.name}
                        formats={formats}
                        idList={id_lists[param.name]}
                        name={param.name}
                        onValueChange={this.handleIdListChange}
                      />
                    );
                  }
                  return (
                    <Param
                      key={param.name}
                      value={param}
                      data={preferences}
                      onPrefChange={this.handlePrefChange}
                    />
                  );
                })}
              </TableBody>
            </Table>
          }
        </Layout>
      );
    }

    return (
      <Layout flex="column">
        <FormGroup title={_('Import XML Report Format')}>
          <FileField
            name="xml_file"
            onChange={onValueChange}/>
        </FormGroup>
      </Layout>
    );
  }
}

Dialog.propTypes = {
  active: PropTypes.yesno,
  formats: PropTypes.arrayLike,
  id_lists: PropTypes.object,
  name: PropTypes.string,
  preferences: PropTypes.object,
  reportformat: PropTypes.model,
  summary: PropTypes.string,
  onValueChange: PropTypes.func,
};

export default withDialog(Dialog, {
  title: _('New Report Format'),
  footer: _('Save'),
  defaultState: {
  },
});

// vim: set ts=2 sw=2 tw=80:
