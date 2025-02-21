/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {parseInt} from 'gmp/parser';
import React from 'react';
import SaveDialog from 'web/components/dialog/SaveDialog';
import FormGroup from 'web/components/form/FormGroup';
import Radio from 'web/components/form/Radio';
import TextField from 'web/components/form/TextField';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';

const convertPort = value => (value === '' ? value : parseInt(value));

const PortRangeDialog = ({id, port_type = 'tcp', title, onClose, onSave}) => {
  const [_] = useTranslation();

  title = title || _('New Port Range');

  const data = {
    id,
    port_range_start: '',
    port_range_end: '',
    port_type,
  };

  return (
    <SaveDialog
      defaultValues={data}
      title={title}
      onClose={onClose}
      onSave={onSave}
    >
      {({values: state, onValueChange}) => {
        return (
          <>
            <FormGroup title={_('Start')}>
              <TextField
                convert={convertPort}
                name="port_range_start"
                value={state.port_range_start}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('End')}>
              <TextField
                convert={convertPort}
                name="port_range_end"
                value={state.port_range_end}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup direction="row" title={_('Protocol')}>
              <Radio
                checked={state.port_type === 'tcp'}
                name="port_type"
                title={_('TCP')}
                value="tcp"
                onChange={onValueChange}
              />
              <Radio
                checked={state.port_type === 'udp'}
                name="port_type"
                title={_('UDP')}
                value="udp"
                onChange={onValueChange}
              />
            </FormGroup>
          </>
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
