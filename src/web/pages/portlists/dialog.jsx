/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import {NO_VALUE, YES_VALUE, parseYesNo} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import SaveDialog from 'web/components/dialog/savedialog';
import FileField from 'web/components/form/filefield';
import FormGroup from 'web/components/form/formgroup';
import Radio from 'web/components/form/radio';
import TextField from 'web/components/form/textfield';
import NewIcon from 'web/components/icon/newicon';
import Row from 'web/components/layout/row';
import Section from 'web/components/section/section';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/proptypes';

import PortRangesTable from './portrangestable';

const FROM_FILE = YES_VALUE;
const NOT_FROM_FILE = NO_VALUE;

const PortListsDialog = ({
  comment = '',
  from_file = NO_VALUE,
  id,
  name,
  port_list,
  port_range = 'T:1-5,7,9,U:1-3,5,7,9',
  port_ranges = [],
  title,
  onClose,
  onNewPortRangeClick,
  onTmpDeletePortRange,
  onSave,
}) => {
  const [_] = useTranslation();
  const isEdit = isDefined(port_list);
  name = name || _('Unnamed');
  title = title || _('New Port List');

  const newRangeIcon = (
    <div>
      <NewIcon
        title={_('Add Port Range')}
        value={port_list}
        onClick={onNewPortRangeClick}
      />
    </div>
  );

  const data = {
    id,
    comment,
    from_file,
    name,
    port_range,
  };

  return (
    <SaveDialog
      defaultValues={data}
      title={title}
      values={{port_ranges}}
      onClose={onClose}
      onSave={onSave}
    >
      {({values: state, onValueChange}) => {
        return (
          <>
            <TextField
              name="name"
              title={_('Name')}
              value={state.name}
              onChange={onValueChange}
            />

            <TextField
              name="comment"
              title={_('Comment')}
              value={state.comment}
              onChange={onValueChange}
            />

            {!isEdit && (
              <FormGroup title={_('Port Ranges')}>
                <Row>
                  <Radio
                    checked={parseYesNo(state.from_file) !== FROM_FILE}
                    name="from_file"
                    title={_('Manual')}
                    value={NOT_FROM_FILE}
                    onChange={onValueChange}
                  />
                  <TextField
                    disabled={parseYesNo(state.from_file) === FROM_FILE}
                    grow="1"
                    name="port_range"
                    value={state.port_range}
                    onChange={onValueChange}
                  />
                </Row>
                <Row>
                  <Radio
                    checked={parseYesNo(state.from_file) === FROM_FILE}
                    name="from_file"
                    title={_('From file')}
                    value={FROM_FILE}
                    onChange={onValueChange}
                  />
                  <FileField
                    disabled={parseYesNo(state.from_file) !== FROM_FILE}
                    grow="1"
                    name="file"
                    onChange={onValueChange}
                  />
                </Row>
              </FormGroup>
            )}
            {isEdit && (
              <Section extra={newRangeIcon} title={_('Port Ranges')}>
                {isDefined(port_list) && (
                  <PortRangesTable
                    portRanges={state.port_ranges}
                    onDeleteClick={onTmpDeletePortRange}
                  />
                )}
              </Section>
            )}
          </>
        );
      }}
    </SaveDialog>
  );
};

PortListsDialog.propTypes = {
  comment: PropTypes.string,
  from_file: PropTypes.yesno,
  id: PropTypes.string,
  name: PropTypes.string,
  port_list: PropTypes.model,
  port_range: PropTypes.string,
  port_ranges: PropTypes.array,
  title: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onDeletePortRangeClick: PropTypes.func,
  onNewPortRangeClick: PropTypes.func,
  onSave: PropTypes.func.isRequired,
  onTmpDeletePortRange: PropTypes.func.isRequired,
};

export default PortListsDialog;

// vim: set ts=2 sw=2 tw=80:
