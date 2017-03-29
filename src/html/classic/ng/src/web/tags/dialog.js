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

import Layout from '../layout.js';
import PropTypes from '../proptypes.js';

import {withDialog} from '../dialog/dialog.js';

import FormGroup from '../form/formgroup.js';
import TextField from '../form/textfield.js';
import Select2 from '../form/select2.js';
import YesNoRadio from '../form/yesnoradio.js';

const TagDialog = ({
    active,
    comment,
    name,
    resource_id,
    resource_type,
    value,
    onValueChange,
  }, {capabilities}) => {
  return (
    <Layout flex="column">

      <FormGroup title={_('Name')}>
        <TextField
          name="name"
          grow="1"
          value={name}
          size="30"
          onChange={onValueChange}
          maxLength="80"/>
      </FormGroup>

      <FormGroup title={_('Comment')}>
        <TextField
          name="comment"
          value={comment}
          grow="1"
          size="30"
          maxLength="400"
          onChange={onValueChange}/>
      </FormGroup>

      <FormGroup title={_('Value')}>
        <TextField
          name="value"
          value={value}
          grow="1"
          onChange={onValueChange}/>
      </FormGroup>

      <FormGroup title={_('Resource Type')}>
        <Select2
          name="resource_type"
          value={resource_type}
          onChange={onValueChange}>
          {capabilities.mayAccess('agents') &&
            <option value="agent">{_('Agent')}</option>
          }
          {capabilities.mayAccess('alerts') &&
            <option value="alert">{_('Alert')}</option>
          }
          {capabilities.mayAccess('assets') &&
            <option value="host">{_('Host')}</option>
          }
          {capabilities.mayAccess('assets') &&
            <option value="os">{_('Operating System')}</option>
          }
          {capabilities.mayAccess('info') &&
            <option value="cpe">{_('CPE')}</option>
          }
          {capabilities.mayAccess('credentials') &&
            <option value="credential">{_('Credential')}</option>
          }
          {capabilities.mayAccess('info') &&
            <option value="cve">{_('CVE')}</option>
          }
          {capabilities.mayAccess('info') &&
            <option value="cert_bund_adv">{_('CERT-Bund Advisory')}</option>
          }
          {capabilities.mayAccess('info') &&
            <option value="dfn_cert_adv">{_('DFN-CERT Advisory')}</option>
          }
          {capabilities.mayAccess('filters') &&
            <option value="filter">{_('Filter')}</option>
          }
          {capabilities.mayAccess('groups') &&
            <option value="group">{_('Group')}</option>
          }
          {capabilities.mayAccess('notes') &&
            <option value="note">{_('Note')}</option>
          }
          {capabilities.mayAccess('info') &&
            <option value="nvt">{_('NVT')}</option>
          }
          {capabilities.mayAccess('info') &&
            <option value="ovaldef">{_('OVAL Definition')}</option>
          }
          {capabilities.mayAccess('overrides') &&
            <option value="override">{_('Override')}</option>
          }
          {capabilities.mayAccess('permissions') &&
            <option value="Permission">{_('Permission')}</option>
          }
          {capabilities.mayAccess('port_lists') &&
            <option value="port_list">{_('Port Lists')}</option>
          }
          {capabilities.mayAccess('reports') &&
            <option value="report">{_('Report')}</option>
          }
          {capabilities.mayAccess('report_formats') &&
            <option value="report_format">{_('Report Format')}</option>
          }
          {capabilities.mayAccess('results') &&
            <option value="result">{_('Result')}</option>
          }
          {capabilities.mayAccess('roles') &&
            <option value="role">{_('Role')}</option>
          }
          {capabilities.mayAccess('configs') &&
            <option value="config">{_('Scan Config')}</option>
          }
          {capabilities.mayAccess('schedules') &&
            <option value="schedule">{_('Schedule')}</option>
          }
          {capabilities.mayAccess('targets') &&
            <option value="target">{_('Target')}</option>
          }
          {capabilities.mayAccess('tasks') &&
            <option value="task">{_('Task')}</option>
          }
          {capabilities.mayAccess('users') &&
            <option value="user">{_('User')}</option>
          }
        </Select2>
      </FormGroup>

      <FormGroup title={_('Resource ID')}>
        <TextField
          name="resource_id"
          value={resource_id}
          grow="1"
          onChange={onValueChange}/>
      </FormGroup>

      <FormGroup title={_('Active')}>
        <YesNoRadio
          name="active"
          value={active}
          onChange={onValueChange}
        />
      </FormGroup>

    </Layout>
  );
};

TagDialog.propTypes = {
  active: PropTypes.yesno,
  comment: React.PropTypes.string,
  name: React.PropTypes.string,
  resource_id: PropTypes.id,
  resource_type: React.PropTypes.string,
  tag: PropTypes.model,
  value: React.PropTypes.string,
  onValueChange: React.PropTypes.func,
};

TagDialog.contextTypes = {
  capabilities: PropTypes.capabilities,
};

export default withDialog(TagDialog, {
  title: _('New Tag'),
  footer: _('Save'),
  defaultState: {
    active: '1',
    comment: '',
    name: _('default:unnamed'),
    value: '',
    resource_type: 'agent',
    resource_id: '',
  },
});

// vim: set ts=2 sw=2 tw=80:
