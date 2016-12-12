/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 Greenbone Networks GmbH
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

import {extend} from '../../utils.js';
import {translate as _} from '../../locale.js';

import Dialog from '../dialog.js';
import Layout from '../layout.js';

import FormGroup from '../form/formgroup.js';
import FormItem from '../form/formitem.js';
import TextField from '../form/textfield.js';
import FileField from '../form/filefield.js';
import {RadioFormItem} from '../form/radio.js';

export class PortListsDialog extends Dialog {

  defaultState() {
    return extend(super.defaultState(), {
      width: 800,
      comment: '',
      from_file: 0,
      port_range: 'T:1-5,7,9,U:1-3,5,7,9',
    });
  }

  show() {
    this.setState({
      name: _('unnamed'),
      visible: true,
    });
  }

  save() {
    let {gmp} = this.context;
    return gmp.portlist.create(this.state).then(portlist => {
      this.close();
      return portlist;
    }, xhr => {
      this.showErrorMessage(xhr.action_result.message);
      throw new Error('PortList creation failed. Reason: ' +
        xhr.action_result.message);
    });
  }

  renderContent() {
    let {name, comment, from_file, port_range} = this.state;

    return (
      <Layout float className="form-horizontal">

        <FormGroup title={_('Name')}>
          <TextField name="name"
            value={name} size="30"
            onChange={this.onValueChange}
            maxLength="80"/>
        </FormGroup>

        <FormGroup title={_('Comment')}>
          <TextField name="comment" value={comment}
            size="30" maxLength="400"
            onChange={this.onValueChange}/>
        </FormGroup>

        <FormGroup title={_('Port Ranges')}>
          <RadioFormItem title={_('Manual')}
            value="0"
            name="from_file"
            onChange={this.onValueChange}
            checked={from_file !== 1}>
            <FormItem>
              <TextField value={port_range} onChange={this.onValueChange}
                name="port_range"
                size="30" maxLength="400"/>
            </FormItem>
          </RadioFormItem>

          <RadioFormItem title={_('From file')}
            value="1"
            name="from_file"
            onChange={this.onValueChange}
            checked={from_file === 1}>
            <FormItem>
              <FileField name="file" onChange={this.onValueChange}/>
            </FormItem>
          </RadioFormItem>
        </FormGroup>
      </Layout>
    );
  }
}

PortListsDialog.contextTypes = {
  gmp: React.PropTypes.object.isRequired,
};

export default PortListsDialog;

// vim: set ts=2 sw=2 tw=80:
