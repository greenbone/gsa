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
import {extend} from '../../utils.js';

import Dialog from '../dialog.js';
import Layout from '../layout.js';
import {render_options} from '../render.js';

import FormGroup from '../form/formgroup.js';
import Text from '../form/text.js';
import TextArea from '../form/textarea.js';
import TextField from '../form/textfield.js';
import Radio from '../form/radio.js';
import Select2 from '../form/select2.js';
import Spinner from '../form/spinner.js';

export class NoteDialog extends Dialog {

  defaultState() {
    return extend(super.defaultState(), {
      active: '-1',
      days: 30,
      oid: '1.3.6.1.4.1.25623.1.0.',
      hosts: '',
      hosts_manual: '',
      note_result_id: '',
      note_result_uuid: '',
      note_task_id: '',
      note_task_uuid: '',
      port: '',
      port_manual: '',
      severity: '',
      text: '',
      width: 800,
      tasks: [],
    });
  }

  loadData() {
    let {gmp} = this.context;
    gmp.tasks.get().then(tasks => this.setState({tasks, visible: true}));
  }

  save() {
    let {gmp} = this.context;
    let promise = gmp.note.create(this.state);

    return promise.then(() => {
      this.close();
    }, xhr => {
      this.showErrorMessage(xhr.action_result.message);
      throw new Error('Saving note failed. Reason: ' +
        xhr.action_result.message);
    });
  }

  renderContent() {
    let {active, days, oid, hosts, hosts_manual, text, port, port_manual,
      severity, note_result_id, note_result_uuid, note_task_id, note_task_uuid,
      tasks,
    } = this.state;

    return (
      <Layout flex="column">
        <FormGroup title={_('NVT OID')}>
          <TextField name="oid"
            value={oid}
            onChange={this.onValueChange}/>
        </FormGroup>
        <FormGroup title={_('Active')} flex="column">
          <Radio name="active"
            value="-1"
            checked={active === '-1'}
            title={_('yes, always')}
            onChange={this.onValueChange}/>
          <Layout flex>
            <Radio name="active"
              value="1"
              checked={active === '1'}
              title={_('yes, for the next')}
              onChange={this.onValueChange}>
            </Radio>
            <Spinner name="days" value={days} size="4"
              onChange={this.onValueChange}
              disabled={active !== '1'} type="int" min="1"/>
            <Text>{_('days')}</Text>
          </Layout>
          <Radio name="active"
            value="0"
            checked={active === '0'}
            title={_('no')}
            onChange={this.onValueChange}/>
        </FormGroup>
        <FormGroup title={_('Hosts')}>
          <Radio name="hosts"
            value=""
            title={_('Any')}
            checked={hosts === ''}
            onChange={this.onValueChange}>
          </Radio>
          <Radio name="hosts"
            value="--"
            checked={hosts === '--'}
            onChange={this.onValueChange}>
          </Radio>
          <TextField name="hosts_manual"
            value={hosts_manual}
            onChange={this.onValueChange}/>
        </FormGroup>
        <FormGroup title={_('Location')}>
          <Radio name="port"
            value=""
            title={_('Any')}
            checked={port === ''}
            onChange={this.onValueChange}>
          </Radio>
          <Radio name="port"
            value="--"
            checked={port === '--'}
            onChange={this.onValueChange}>
          </Radio>
          <TextField name="port_manual"
            value={port_manual}
            onChange={this.onValueChange}/>
        </FormGroup>
        <FormGroup title={_('Severity')}>
          <Radio name="severity"
            value=""
            title={_('Any')}
            checked={severity === ''}
            onChange={this.onValueChange}>
          </Radio>
          <Radio name="severity"
            value="0.1"
            title={_('> 0.0')}
            checked={severity === '0.1'}
            onChange={this.onValueChange}>
          </Radio>
          <Radio name="severity"
            value="0.0"
            title={_('Log')}
            checked={severity === '0.0'}
            onChange={this.onValueChange}>
          </Radio>
        </FormGroup>
        <FormGroup title={_('Task')}>
          <Radio name="note_task_id"
            value=""
            title={_('Any')}
            checked={note_task_id === ''}
            onChange={this.onValueChange}/>
          <Layout flex box>
            <Radio name="note_task_id"
              value="0"
              checked={note_task_id === '0'}
              onChange={this.onValueChange}/>
            <Select2 name="note_task_uuid"
              value={note_task_uuid}
              onChange={this.onValueChange}>
              {render_options(tasks)}
            </Select2>
          </Layout>
        </FormGroup>
        <FormGroup title={_('Result')}>
          <Radio name="note_result_id"
            value=""
            title={_('Any')}
            checked={note_result_id === ''}
            onChange={this.onValueChange}/>
          <Layout flex box>
            <Radio name="note_result_id"
              value="0"
              title={_('UUID')}
              checked={note_result_id === '0'}
              onChange={this.onValueChange}/>
            <TextField name="note_result_uuid"
              value={note_result_uuid}
              onChange={this.onValueChange}/>
          </Layout>
        </FormGroup>
        <FormGroup title={_('Text')}>
          <TextArea name="text"
            grow="1"
            rows="10" cols="60"
            value={text}
            onChange={this.onValueChange}/>
        </FormGroup>
      </Layout>
    );
  }
}

NoteDialog.propTypes = {
  note: React.PropTypes.object,
};

export default NoteDialog;

// vim: set ts=2 sw=2 tw=80:
