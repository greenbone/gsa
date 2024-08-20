/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React, {useCallback} from 'react';

import {isDefined, isArray, hasValue} from 'gmp/utils/identity';
import {map} from 'gmp/utils/array';

import PropTypes from 'web/utils/proptypes';

import SaveDialog from 'web/components/dialog/savedialog';

import FileField from 'web/components/form/filefield';
import FormGroup from 'web/components/form/formgroup';
import TextField from 'web/components/form/textfield';
import YesNoRadio from 'web/components/form/yesnoradio';
import MultiSelect from 'web/components/form/multiselect';
import Spinner from 'web/components/form/spinner';
import Select from 'web/components/form/select';
import TextArea from 'web/components/form/textarea';

import Table from 'web/components/table/table';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableHeader from 'web/components/table/header';
import TableHead from 'web/components/table/head';
import TableRow from 'web/components/table/row';

import useTranslation from 'web/hooks/useTranslation';

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
        minRows="5"
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

const Dialog = ({
  formats,
  id_lists,
  preferences,
  reportformat: reportFormat,
  title,
  onClose,
  onSave,
  onValueChange,
}) => {
  const [_] = useTranslation();

  title = title || _('Import Report Format');

  const handlePrefChange = useCallback(
    (value, name) => {
      preferences[name] = value;

      if (onValueChange) {
        onValueChange(preferences, 'preferences');
      }
    },
    [onValueChange, preferences],
  );

  const handleIdListChange = useCallback(
    (value, name) => {
      if (!hasValue(value)) {
        value = [];
      }

      id_lists[name] = value;

      if (onValueChange) {
        onValueChange(id_lists, 'id_lists');
      }
    },
    [onValueChange, id_lists],
  );

  if (isDefined(reportFormat)) {
    return (
      <SaveDialog
        title={title}
        onClose={onClose}
        onSave={onSave}
        defaultValues={reportFormat}
      >
        {
          // eslint-disable-next-line no-shadow
          ({values: state, onValueChange}) => {
            return (
              <>
                <FormGroup title={_('Name')}>
                  <TextField
                    name="name"
                    value={state.name}
                    onChange={onValueChange}
                  />
                </FormGroup>

                <FormGroup title={_('Summary')}>
                  <TextField
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

                {reportFormat.params.length > 0 && <h2>Parameters</h2>}
                {reportFormat.params.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead width="25%">{_('Name')}</TableHead>
                        <TableHead width="75%">{_('Value')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportFormat.params.map(param => {
                        if (param.type === 'report_format_list') {
                          return (
                            <ReportFormatListParam
                              key={param.name}
                              formats={formats}
                              idList={id_lists[param.name]}
                              name={param.name}
                              onValueChange={handleIdListChange}
                            />
                          );
                        }
                        return (
                          <Param
                            key={param.name}
                            value={param}
                            data={preferences}
                            onPrefChange={handlePrefChange}
                          />
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </>
            );
          }
        }
      </SaveDialog>
    );
  }
  return (
    <SaveDialog title={title} onClose={onClose} onSave={onSave}>
      {
        // eslint-disable-next-line no-shadow
        ({values: state, onValueChange}) => {
          return (
            <>
              <FormGroup title={_('Import XML Report Format')}>
                <FileField name="xml_file" onChange={onValueChange} />
              </FormGroup>
            </>
          );
        }
      }
    </SaveDialog>
  );
};

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
