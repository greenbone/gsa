/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {YES_VALUE} from 'gmp/parser';

import SaveDialog from 'web/components/dialog/savedialog';

import FileField from 'web/components/form/filefield';
import FormGroup from 'web/components/form/formgroup';
import Select from 'web/components/form/select';
import YesNoRadio from 'web/components/form/yesnoradio';

import NewIcon from 'web/components/icon/newicon';

import PropTypes from 'web/utils/proptypes';
import {renderSelectItems} from 'web/utils/render';

import useTranslation from 'web/hooks/useTranslation';

const ImportDialog = ({
  in_assets = YES_VALUE,
  newContainerTask = true,
  task_id,
  tasks,
  onClose,
  onNewContainerTaskClick,
  onSave,
  onTaskChange,
}) => {
  const [_] = useTranslation();
  return (
    <SaveDialog
      buttonTitle={_('Import')}
      title={_('Import Report')}
      onClose={onClose}
      onSave={onSave}
      values={{task_id}}
      defaultValues={{in_assets}}
    >
      {({values, onValueChange}) => (
        <>
          <FormGroup title={_('Report')}>
            <FileField grow="1" name="xml_file" onChange={onValueChange} />
          </FormGroup>
          <FormGroup title={_('Container Task')} direction="row">
            <Select
              grow="1"
              name="task_id"
              value={values.task_id}
              items={renderSelectItems(tasks)}
              onChange={onTaskChange}
            />
            {newContainerTask && (
              <NewIcon
                title={_('Create new Container Task')}
                onClick={onNewContainerTaskClick}
              />
            )}
          </FormGroup>
          <FormGroup title={_('Add to Assets')}>
            <span>
              {_('Add to Assets with QoD >= 70% and Overrides enabled')}
            </span>
            <YesNoRadio
              value={values.in_assets}
              name="in_assets"
              onChange={onValueChange}
            />
          </FormGroup>
        </>
      )}
    </SaveDialog>
  );
};

ImportDialog.propTypes = {
  in_assets: PropTypes.yesno,
  newContainerTask: PropTypes.bool,
  task_id: PropTypes.id,
  tasks: PropTypes.array,
  title: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onNewContainerTaskClick: PropTypes.func,
  onSave: PropTypes.func.isRequired,
  onTaskChange: PropTypes.func,
};

export default ImportDialog;

// vim: set ts=2 sw=2 tw=80:
