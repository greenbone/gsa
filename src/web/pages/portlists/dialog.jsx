/* Copyright (C) 2016-2022 Greenbone AG
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

import {NO_VALUE, YES_VALUE, parseYesNo} from 'gmp/parser';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import SaveDialog from 'web/components/dialog/savedialog';

import FileField from 'web/components/form/filefield';
import FormGroup from 'web/components/form/formgroup';
import Radio from 'web/components/form/radio';
import TextField from 'web/components/form/textfield';

import NewIcon from 'web/components/icon/newicon';

import Section from 'web/components/section/section';

import Row from 'web/components/layout/row';

import useTranslation from 'web/hooks/useTranslation';

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
                  />
                </Row>
                <Row>
                  <Radio
                    title={_('From file')}
                    name="from_file"
                    value={FROM_FILE}
                    onChange={onValueChange}
                    checked={parseYesNo(state.from_file) === FROM_FILE}
                  />
                  <FileField
                    name="file"
                    grow="1"
                    disabled={parseYesNo(state.from_file) !== FROM_FILE}
                    onChange={onValueChange}
                  />
                </Row>
              </FormGroup>
            )}
            {isEdit && (
              <Section title={_('Port Ranges')} extra={newRangeIcon}>
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
