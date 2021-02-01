/* Copyright (C) 2017-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';

import _ from 'gmp/locale';

import {map} from 'gmp/utils/array';
import {isDefined, isArray, hasValue} from 'gmp/utils/identity';

import SaveDialog from 'web/components/dialog/savedialog';

import FileField from 'web/components/form/filefield';
import FormGroup from 'web/components/form/formgroup';
import Spinner from 'web/components/form/spinner';
import TextArea from 'web/components/form/textarea';
import TextField from 'web/components/form/textfield';
import MultiSelect from 'web/components/form/multiselect';
import Select from 'web/components/form/select';
import YesNoRadio from 'web/components/form/yesnoradio';

import Layout from 'web/components/layout/layout';

import Table from 'web/components/table/table';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableHeader from 'web/components/table/header';
import TableHead from 'web/components/table/head';
import TableRow from 'web/components/table/row';

import PropTypes from 'web/utils/proptypes';

const ReportFormatListParam = ({formats, idList, name, onValueChange}) => {
  const formatOptions = map(formats, format => ({
    label: format.name,
    value: format.id,
  }));

  return (
    <TableRow>
      <TableData>{name}</TableData>
      <TableData>
        <MultiSelect
          name={name}
          items={formatOptions}
          value={idList}
          onChange={onValueChange}
        />
      </TableData>
    </TableRow>
  );
};

ReportFormatListParam.propTypes = {
  formats: PropTypes.array.isRequired,
  idList: PropTypes.array.isRequired,
  name: PropTypes.string.isRequired,
  onValueChange: PropTypes.func.isRequired,
};

const Param = ({data, value, onPrefChange}) => {
  const {name, type, min, max} = value;
  const field_value = data[name];

  let field;
  if (type === 'boolean') {
    field = (
      <YesNoRadio name={name} value={field_value} onChange={onPrefChange} />
    );
  } else if (type === 'integer') {
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
  } else if (type === 'string') {
    field = (
      <TextField
        name={name}
        maxLength={max}
        value={field_value}
        onChange={onPrefChange}
      />
    );
  } else if (type === 'selection') {
    const typeOptions = map(value.options, opt => ({
      label: opt.name,
      value: opt.value,
    }));

    field = (
      <Select
        name={name}
        items={typeOptions}
        value={isArray(field_value) ? field_value : [field_value]}
        onChange={onPrefChange}
      />
    );
  } else {
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
      <TableData>{name}</TableData>
      <TableData>{field}</TableData>
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
    const {preferences, onValueChange} = this.props;

    preferences[name] = value;

    if (onValueChange) {
      onValueChange(preferences, 'preferences');
    }
  }

  handleIdListsChange(value, name) {
    const {id_lists, onValueChange} = this.props;

    if (!hasValue(value)) {
      value = [];
    }

    id_lists[name] = value;

    if (onValueChange) {
      onValueChange(id_lists, 'id_lists');
    }
  }

  render() {
    const {
      formats,
      id_lists,
      preferences,
      reportformat,
      title = _('Import Report Format'),
      onClose,
      onSave,
    } = this.props;

    if (isDefined(reportformat)) {
      return (
        <SaveDialog
          title={title}
          onClose={onClose}
          onSave={onSave}
          defaultValues={reportformat}
        >
          {({values: state, onValueChange}) => {
            return (
              <Layout flex="column">
                <FormGroup title={_('Name')}>
                  <TextField
                    grow="1"
                    name="name"
                    value={state.name}
                    onChange={onValueChange}
                  />
                </FormGroup>

                <FormGroup title={_('Summary')}>
                  <TextField
                    grow="1"
                    name="summary"
                    value={state.summary}
                    onChange={onValueChange}
                  />
                </FormGroup>

                <FormGroup title={_('Active')}>
                  <YesNoRadio
                    name="active"
                    value={state.active}
                    onChange={onValueChange}
                  />
                </FormGroup>

                {reportformat.params.length > 0 && <h2>Parameters</h2>}
                {reportformat.params.length > 0 && (
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
                )}
              </Layout>
            );
          }}
        </SaveDialog>
      );
    }
    return (
      <SaveDialog title={title} onClose={onClose} onSave={onSave}>
        {({values: state, onValueChange}) => {
          return (
            <Layout flex="column">
              <FormGroup title={_('Import XML Report Format')} titleSize="3">
                <FileField name="xml_file" onChange={onValueChange} />
              </FormGroup>
            </Layout>
          );
        }}
      </SaveDialog>
    );
  }
}

Dialog.propTypes = {
  active: PropTypes.yesno,
  formats: PropTypes.array,
  id_lists: PropTypes.object,
  name: PropTypes.string,
  preferences: PropTypes.object,
  reportformat: PropTypes.model,
  summary: PropTypes.string,
  title: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onValueChange: PropTypes.func,
};

export default Dialog;

// vim: set ts=2 sw=2 tw=80:
