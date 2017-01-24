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

import _, {datetime} from '../../locale.js';
import {extend, is_defined, is_empty} from '../../utils.js';

import Dialog from '../dialog.js';
import Layout from '../layout.js';
import {render_options, result_cvss_risk_factor, render_nvt_name,
} from '../render.js';

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
      note: this.props.note,
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

    if (this.state.note) {
      // request all note details which haven't been included in get_notes
      // response
      gmp.note.get(this.props.note).then(note => {
        let active = '0';
        if (note.isActive()) {
          if (is_empty(note.end_time)) {
            active = '-1';
          }
          else {
            active = '-2';
          }
        }
        this.setState({
          active,
          hosts: note.hosts,
          port: note.port,
          note,
          note_id: note.id,
          note_task_id: note.task ? note.task.id : undefined,
          note_result_id: note.result ? note.result.id : undefined,
          severity: note.severity,
          text: note.text,
          visible: true,
        });
      });
    }
    gmp.tasks.get().then(tasks => this.setState({tasks, visible: true}));
  }

  save() {
    let {note} = this.state;
    let {gmp} = this.context;
    let promise;

    if (note) {
      promise = gmp.note.save(this.state);
    }
    else {
      promise = gmp.note.create(this.state);
    }

    return promise.then(() => {
      this.close();
    }, root => {
      this.showErrorMessage(root.action_result.message);
      throw new Error('Saving note failed. Reason: ' +
        root.action_result.message);
    });
  }

  renderContent() {
    let {active, days, oid, hosts, hosts_manual, text, port, port_manual,
      severity, note_result_id, note_result_uuid, note_task_id, note_task_uuid,
      tasks, note,
    } = this.state;

    let is_edit = is_defined(note);

    return (
      <Layout flex="column">
        {is_edit ?
          <FormGroup title={_('NVT Name')}>
            {render_nvt_name(note.nvt)}
          </FormGroup> :
            <FormGroup title={_('NVT OID')}>
              <TextField name="oid"
                value={oid}
                onChange={this.onValueChange}/>
            </FormGroup>
        }
        <FormGroup title={_('Active')} flex="column">
          <Radio name="active"
            value="-1"
            checked={active === '-1'}
            title={_('yes, always')}
            onChange={this.onValueChange}/>
          {is_edit && note.isActive() && !is_empty(note.end_time) &&
            <Layout flex box>
              <Radio name="active"
                value="-2"
                checked={active === '-2'}
                title={_('yes, until')}
                onChange={this.onValueChange}/>
              <Text>{datetime(note.end_time)}</Text>
            </Layout>
          }
          <Layout flex box>
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
          {is_edit && !is_empty(note.hosts) &&
            <Layout flex box>
              <Radio name="hosts"
                value={note.hosts}
                checked={!is_empty(hosts)}
                onChange={this.onValueChange}>
              </Radio>
              <TextField name="hosts"
                disabled={is_empty(hosts)}
                value={hosts}
                onChange={this.onValueChange}/>
            </Layout>
          }
          {!is_edit &&
            <Layout flex box>
              <Radio name="hosts"
                value="--"
                checked={hosts === '--'}
                onChange={this.onValueChange}>
              </Radio>
              <TextField name="hosts_manual"
                disabled={hosts !== '--'}
                value={hosts_manual}
                onChange={this.onValueChange}/>
            </Layout>
          }
        </FormGroup>
        <FormGroup title={_('Location')}>
          <Radio name="port"
            value=""
            title={_('Any')}
            checked={port === ''}
            onChange={this.onValueChange}>
          </Radio>
          {is_edit && !is_empty(note.port) &&
            <Layout flex box>
              <Radio name="port"
                value={note.port}
                checked={!is_empty(port)}
                onChange={this.onValueChange}>
              </Radio>
              <TextField name="port"
                value={port}
                disabled={is_empty(port)}
                onChange={this.onValueChange}/>
            </Layout>
          }
          {!is_edit &&
            <Layout flex box>
              <Radio name="port"
                value="--"
                checked={port === '--'}
                onChange={this.onValueChange}>
              </Radio>
              <TextField name="port_manual"
                value={port_manual}
                disabled={port !== '--'}
                onChange={this.onValueChange}/>
            </Layout>
          }
        </FormGroup>
        <FormGroup title={_('Severity')}>
          <Radio name="severity"
            value=""
            title={_('Any')}
            checked={is_empty(severity)}
            onChange={this.onValueChange}>
          </Radio>
          {is_edit && note.severity > 0.0 &&
            <Radio name="severity"
              value={0.1}
              title={_('> 0.0')}
              checked={!is_empty(severity) && severity > 0.0}
              onChange={this.onValueChange}>
            </Radio>
          }
          {is_edit && note.severity <= 0.0 &&
            <Radio name="severity"
              value={note.severity}
              title={result_cvss_risk_factor(note.severity)}
              checked={!is_empty(severity) && severity <= 0.0}
              onChange={this.onValueChange}>
            </Radio>
          }
          {!is_edit &&
            <Layout flex box>
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
            </Layout>
          }
        </FormGroup>
        <FormGroup title={_('Task')}>
          <Radio name="note_task_id"
            value=""
            title={_('Any')}
            checked={note_task_id === ''}
            onChange={this.onValueChange}/>
          {is_edit && note.task && !is_empty(note.task.id) &&
            <Layout flex box>
              <Radio name="note_task_id"
                value={note.task.id}
                checked={!is_empty(note_task_id)}
                onChange={this.onValueChange}/>
              <Select2 name="note_task_id"
                value={note_task_id}
                disabled={is_empty(note_task_id)}
                onChange={this.onValueChange}>
                {render_options(tasks)}
              </Select2>
            </Layout>
          }
          {!is_edit &&
            <Layout flex box>
              <Radio name="note_task_id"
                value="0"
                checked={note_task_id === '0'}
                onChange={this.onValueChange}/>
              <Select2 name="note_task_uuid"
                value={note_task_uuid}
                disabled={note_task_id !== '0'}
                onChange={this.onValueChange}>
                {render_options(tasks)}
              </Select2>
            </Layout>
          }
        </FormGroup>
        <FormGroup title={_('Result')}>
          <Radio name="note_result_id"
            value=""
            title={_('Any')}
            checked={note_result_id === ''}
            onChange={this.onValueChange}/>
          {is_edit && note.result && !is_empty(note.result.id) &&
            <Layout flex box>
              <Radio name="note_result_id"
                value={note.result.id}
                checked={!is_empty(note_result_id)}
                onChange={this.onValueChange}/>
              <TextField name="note_result_id"
                value={note_result_id}
                size="34"
                disabled={is_empty(note_result_id)}
                onChange={this.onValueChange}/>
            </Layout>
          }
          {!is_edit &&
            <Layout flex box>
              <Radio name="note_result_id"
                value="0"
                title={_('UUID')}
                checked={note_result_id === '0'}
                onChange={this.onValueChange}/>
              <TextField name="note_result_uuid"
                value={note_result_uuid}
                size="34"
                disabled={note_result_id !== '0'}
                onChange={this.onValueChange}/>
            </Layout>
          }
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
