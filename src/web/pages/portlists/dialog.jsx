/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import {NO_VALUE, YES_VALUE, parseYesNo} from 'gmp/parser';

import {isDefined} from 'gmp/utils/identity';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

import PropTypes from 'web/utils/proptypes';

import SaveDialog from 'web/components/dialog/savedialog';

import FileField from 'web/components/form/filefield';
import FormGroup from 'web/components/form/formgroup';
import Radio from 'web/components/form/radio';
import TextField from 'web/components/form/textfield';

import NewIcon from 'web/components/icon/newicon';

import Section from 'web/components/section/section';

import PortRangesTable from './portrangestable';

const FROM_FILE = YES_VALUE;
const NOT_FROM_FILE = NO_VALUE;

const PortListsDialog = ({
  comment = '',
  from_file = NO_VALUE,
  id,
  name = _('Unnamed'),
  port_list,
  port_range = 'T:1-5,7,9,U:1-3,5,7,9',
  port_ranges = [],
  title = _('New Port List'),
  onClose,
  onNewPortRangeClick,
  onTmpDeletePortRange,
  onSave,
}) => {
  const is_edit = isDefined(port_list);

  const newrangeicon = (
    <div>
      <NewIcon
        value={port_list}
        title={_('Add Port Range')}
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
      title={title}
      onClose={onClose}
      onSave={onSave}
      defaultValues={data}
      values={{port_ranges}}
    >
      {({values: state, onValueChange}) => {
        return (
          <Layout flex="column">
            <FormGroup title={_('Name')}>
              <TextField
                name="name"
                value={state.name}
                grow="1"
                size="30"
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Comment')}>
              <TextField
                name="comment"
                value={state.comment}
                grow="1"
                size="30"
                onChange={onValueChange}
              />
            </FormGroup>

            {!is_edit && (
              <FormGroup title={_('Port Ranges')} flex="column">
                <Divider flex="column">
                  <Divider>
                    <Radio
                      title={_('Manual')}
                      name="from_file"
                      value={NOT_FROM_FILE}
                      onChange={onValueChange}
                      checked={parseYesNo(state.from_file) !== FROM_FILE}
                    />
                    <TextField
                      grow="1"
                      name="port_range"
                      value={state.port_range}
                      disabled={parseYesNo(state.from_file) === FROM_FILE}
                      onChange={onValueChange}
                      size="30"
                    />
                  </Divider>
                  <Divider>
                    <Radio
                      title={_('From file')}
                      name="from_file"
                      value={FROM_FILE}
                      onChange={onValueChange}
                      checked={parseYesNo(state.from_file) === FROM_FILE}
                    />
                    <FileField
                      name="file"
                      disabled={parseYesNo(state.from_file) !== FROM_FILE}
                      onChange={onValueChange}
                    />
                  </Divider>
                </Divider>
              </FormGroup>
            )}
            {is_edit && (
              <Section title={_('Port Ranges')} extra={newrangeicon}>
                {isDefined(port_list) && (
                  <PortRangesTable
                    portRanges={state.port_ranges}
                    onDeleteClick={onTmpDeletePortRange}
                  />
                )}
              </Section>
            )}
          </Layout>
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
