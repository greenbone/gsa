/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import {parseInt} from 'gmp/parser';

import PropTypes from 'web/utils/proptypes';

import SaveDialog from 'web/components/dialog/savedialog';

import FormGroup from 'web/components/form/formgroup';
import Radio from 'web/components/form/radio';
import TextField from 'web/components/form/textfield';

import Layout from 'web/components/layout/layout';

const convertPort = value => (value === '' ? value : parseInt(value));

const PortRangeDialog = ({
  id,
  port_type = 'tcp',
  title = _('New Port Range'),
  onClose,
  onSave,
}) => {
  const data = {
    id,
    port_range_start: '',
    port_range_end: '',
    port_type,
  };

  return (
    <SaveDialog
      title={title}
      onClose={onClose}
      onSave={onSave}
      defaultValues={data}
    >
      {({values: state, onValueChange}) => {
        return (
          <Layout flex="column">
            <FormGroup title={_('Start')}>
              <TextField
                name="port_range_start"
                value={state.port_range_start}
                grow="1"
                size="30"
                convert={convertPort}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('End')}>
              <TextField
                name="port_range_end"
                value={state.port_range_end}
                grow="1"
                size="30"
                convert={convertPort}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Protocol')}>
              <Radio
                title={_('TCP')}
                name="port_type"
                value="tcp"
                onChange={onValueChange}
                checked={state.port_type === 'tcp'}
              />
              <Radio
                title={_('UDP')}
                name="port_type"
                value="udp"
                onChange={onValueChange}
                checked={state.port_type === 'udp'}
              />
            </FormGroup>
          </Layout>
        );
      }}
    </SaveDialog>
  );
};

PortRangeDialog.propTypes = {
  id: PropTypes.id.isRequired,
  port_list: PropTypes.model,
  port_type: PropTypes.string,
  title: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default PortRangeDialog;

// vim: set ts=2 sw=2 tw=80:
