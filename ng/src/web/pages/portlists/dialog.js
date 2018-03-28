/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
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
import {NO_VALUE} from 'gmp/parser';
import {is_defined} from 'gmp/utils';

import Divider from '../../components/layout/divider.js';
import Layout from '../../components/layout/layout.js';

import PropTypes from '../../utils/proptypes.js';

import SaveDialog from '../../components/dialog/savedialog.js';

import FileField from '../../components/form/filefield.js';
import FormGroup from '../../components/form/formgroup.js';
import Radio from '../../components/form/radio.js';
import TextField from '../../components/form/textfield.js';

import NewIcon from '../../components/icon/newicon.js';

import Section from '../../components/section/section.js';

import PortRangesTable from './portrangestable.js';

const PortListsDialog = ({
  comment = '',
  from_file = NO_VALUE,
  name = _('Unnamed'),
  port_list,
  port_range = 'T:1-5,7,9,U:1-3,5,7,9',
  title = _('New Port List'),
  visible = true,
  onClose,
  onDeletePortRangeClick,
  onNewPortRangeClick,
  onSave,
}) => {

  const is_edit = is_defined(port_list);

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
    ...port_list,
    comment,
    from_file,
    name,
    port_range,
  };

  return (
    <SaveDialog
      visible={visible}
      title={title}
      onClose={onClose}
      onSave={onSave}
      defaultValues={data}
    >
      {({
        values: state,
        onValueChange,
      }) => {
        return (
          <Layout flex="column">

            <FormGroup title={_('Name')}>
              <TextField
                name="name"
                value={state.name}
                grow="1"
                size="30"
                onChange={onValueChange}
                maxLength="80"
              />
            </FormGroup>

            <FormGroup title={_('Comment')}>
              <TextField
                name="comment"
                value={state.comment}
                grow="1"
                size="30"
                maxLength="400"
                onChange={onValueChange}
              />
            </FormGroup>

            {!is_edit &&
              <FormGroup title={_('Port Ranges')} flex="column">
                <Divider flex="column">
                  <Divider>
                    <Radio
                      title={_('Manual')}
                      name="from_file"
                      value="0"
                      onChange={onValueChange}
                      checked={from_file !== '1'}
                    />
                    <TextField
                      grow="1"
                      name="port_range"
                      value={state.port_range}
                      disabled={from_file === '1'}
                      onChange={onValueChange}
                      size="30"
                      maxLength="400"
                    />
                  </Divider>
                  <Divider>
                    <Radio
                      title={_('From file')}
                      name="from_file"
                      value="1"
                      onChange={onValueChange}
                      checked={from_file === '1'}
                    />
                    <FileField
                      name="file"
                      onChange={onValueChange}
                    />
                  </Divider>
                </Divider>
              </FormGroup>
            }
            {is_edit &&
              <Section title={_('Port Ranges')} extra={newrangeicon}>
                {is_defined(port_list) &&
                  <PortRangesTable
                    portRanges={port_list.port_ranges}
                    onDeleteClick={onDeletePortRangeClick}
                  />
                }
              </Section>
            }
          </Layout>
        );
      }}
    </SaveDialog>
  );
};


PortListsDialog.propTypes = {
  comment: PropTypes.string,
  from_file: PropTypes.yesno,
  name: PropTypes.string,
  port_list: PropTypes.model,
  port_range: PropTypes.string,
  title: PropTypes.string,
  visible: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onDeletePortRangeClick: PropTypes.func,
  onNewPortRangeClick: PropTypes.func,
  onSave: PropTypes.func.isRequired,
};


export default PortListsDialog;

// vim: set ts=2 sw=2 tw=80:
