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

import glamorous from 'glamorous';

import _ from 'gmp/locale.js';

import PropTypes from '../utils/proptypes.js';

import SaveDialog from '../components/dialog/savedialog.js';

import TextField from '../components/form/textfield.js';

import NewIcon from '../components/icon/newicon.js';

import Img from '../components/img/img.js';

import Layout from '../components/layout/layout.js';

export const Wizardess = glamorous.div({
  '& > img': {
    height: '300px',
  },
});

export const WizardContent = glamorous.div({
  '& > p img': {
    marginLeft: '5px',
    marginRight: '50px',
  },
});

const TaskWizard = ({
    hosts,
    title,
    visible,
    onClose,
    onNewClick,
    onSave,
  }) => {
  return (
    <SaveDialog
      buttonTitle={_('Start Scan')}
      visible={visible}
      title={title}
      onClose={onClose}
      onSave={onSave}
      initialData={hosts}
    >
      {({
        data: state,
        onValueChange,
      }) => {
        return (
          <Layout flex>
            <Wizardess>
              <Img src="enchantress.svg"/>
            </Wizardess>
            <WizardContent>
              <p>
                <b>{_('Quick start: Immediately scan an IP address')}</b>
              </p>
              <div>
                {_('IP address or hostname:')}
                <TextField
                  value={state.hosts}
                  name="hosts"
                  size="40"
                  maxLength="2000"
                  onChange={onValueChange}/>
              </div>
              <div>
                {_('The default address is either your computer' +
                  ' or your network gateway.')}
              </div>
              <div>
                {_('As a short-cut I will do the following for you:')}
                <ol>
                  <li>{_('Create a new Target')}</li>
                  <li>{_('Create a new Task')}</li>
                  <li>{_('Start this scan task right away')}</li>
                  <li>
                    {_('Switch the view to reload every 30 seconds so you can' +
                      ' lean back and watch the scan progress')}
                  </li>
                </ol>
              </div>
              <p>
                {_('In fact, you must not lean back. As soon as the scan ' +
                  'progress is beyond 1%, you can already jump into the scan ' +
                  'report via the link in the Reports Total column and ' +
                  'review the results collected so far.')}
              </p>
              <p>
                {_('When creating the Target and Task I will use the defaults' +
                  ' as configured in "My Settings".')}
              </p>
              <p>
                {_('By clicking the New Task icon')}
                <NewIcon
                  title={_('New Task')}
                  onClick={onNewClick}/>
                {_('you can create a new Task yourself.')}
              </p>
            </WizardContent>
          </Layout>
        );
      }}
    </SaveDialog>
  );
};

TaskWizard.propTypes = {
  hosts: PropTypes.string,
  title: PropTypes.string,
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onNewClick: PropTypes.func,
  onSave: PropTypes.func.isRequired,
};

export default TaskWizard;

// vim: set ts=2 sw=2 tw=80:
