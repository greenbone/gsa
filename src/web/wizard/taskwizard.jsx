/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import styled from 'styled-components';

import _ from 'gmp/locale';

import PropTypes from 'web/utils/proptypes';

import SaveDialog from 'web/components/dialog/savedialog';

import TextField from 'web/components/form/textfield';

import {default as WizIcon} from 'web/components/icon/wizardicon';
import NewIcon from 'web/components/icon/newicon';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

export const WizardContent = styled.div`
  margin: 0 20px;
`;

const IconContainer = styled.div`
  align-self: flex-start;
`;

export const WizardIcon = () => (
  <IconContainer>
    <WizIcon size="large" />
  </IconContainer>
);

const TaskWizard = ({
  hosts,
  title = _('Task Wizard'),
  onClose,
  onNewClick,
  onSave,
}) => (
  <SaveDialog
    buttonTitle={_('Start Scan')}
    title={title}
    onClose={onClose}
    onSave={onSave}
    defaultValues={{hosts}}
  >
    {({values: state, onValueChange}) => (
      <Layout>
        <WizardIcon />
        <WizardContent>
          <Divider flex="column">
            <p>
              <b>{_('Quick start: Immediately scan an IP address')}</b>
            </p>
            <Divider>
              <span>{_('IP address or hostname:')}</span>
              <TextField
                value={state.hosts}
                name="hosts"
                size="30"
                maxLength="2000"
                onChange={onValueChange}
              />
            </Divider>
            <div>
              {_(
                'The default address is either your computer' +
                  ' or your network gateway.',
              )}
            </div>
            <Layout flex="column">
              {_('As a short-cut the following steps will be done for you:')}
              <ol>
                <li>{_('Create a new Target')}</li>
                <li>{_('Create a new Task')}</li>
                <li>{_('Start this scan task right away')}</li>
              </ol>
            </Layout>
            <p>
              {_(
                'As soon as the scan progress is beyond 1%, you can already ' +
                  'jump to the scan report by clicking on the progress bar in ' +
                  'the "Status" column and review the results collected so far.',
              )}
            </p>
            <p>
              {_(
                'The Target and Task will be created using the defaults' +
                  ' as configured in "My Settings".',
              )}
            </p>
            <Divider>
              <span>{_('By clicking the New Task icon')}</span>
              <NewIcon title={_('New Task')} onClick={onNewClick} />
              <span>{_('you can create a new Task yourself.')}</span>
            </Divider>
          </Divider>
        </WizardContent>
      </Layout>
    )}
  </SaveDialog>
);

TaskWizard.propTypes = {
  hosts: PropTypes.string,
  title: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onNewClick: PropTypes.func,
  onSave: PropTypes.func.isRequired,
};

export default TaskWizard;

// vim: set ts=2 sw=2 tw=80:
