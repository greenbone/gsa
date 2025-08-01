/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';
import SaveDialog from 'web/components/dialog/SaveDialog';
import TextField from 'web/components/form/TextField';
import {NewIcon, WizardIcon as WizIcon} from 'web/components/icon';
import Column from 'web/components/layout/Column';
import Row from 'web/components/layout/Row';
import useTranslation from 'web/hooks/useTranslation';

interface TaskWizardState {
  hosts: string;
}

interface TaskWizardProps {
  hosts?: string;
  title?: string;
  onClose: () => void;
  onNewClick?: () => void;
  onSave: (values: TaskWizardState) => void;
}

export const WizardContent = styled.div`
  margin: 0 20px;
`;

const IconContainer = styled.div`
  align-self: flex-start;
`;

export const WizardIcon = () => {
  return (
    <IconContainer>
      <WizIcon size="large" />
    </IconContainer>
  );
};

const TaskWizard = ({
  hosts = '',
  title,
  onClose,
  onNewClick,
  onSave,
}: TaskWizardProps) => {
  const [_] = useTranslation();
  title = title || _('Task Wizard');

  return (
    <SaveDialog<{}, TaskWizardState>
      buttonTitle={_('Start Scan')}
      defaultValues={{hosts}}
      title={title}
      onClose={onClose}
      onSave={onSave}
    >
      {({values: state, onValueChange}) => (
        <Row>
          <WizardIcon />
          <WizardContent>
            <Column>
              <p>
                <b>{_('Quick start: Immediately scan an IP address')}</b>
              </p>
              <Row>
                <span>{_('IP address or hostname:')}</span>
                <TextField
                  grow="1"
                  maxLength={2000}
                  name="hosts"
                  value={state.hosts}
                  onChange={onValueChange}
                />
              </Row>
              <div>
                {_(
                  'The default address is either your computer' +
                    ' or your network gateway.',
                )}
              </div>
              {_('As a short-cut the following steps will be done for you:')}
              <ol>
                <li>{_('Create a new Target')}</li>
                <li>{_('Create a new Task')}</li>
                <li>{_('Start this scan task right away')}</li>
              </ol>
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
              <Row>
                <span>{_('By clicking the New Task icon')}</span>
                <NewIcon title={_('New Task')} onClick={onNewClick} />
                <span>{_('you can create a new Task yourself.')}</span>
              </Row>
            </Column>
          </WizardContent>
        </Row>
      )}
    </SaveDialog>
  );
};

export default TaskWizard;
