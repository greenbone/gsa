/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {YES_VALUE} from 'gmp/parser';
import React from 'react';
import SaveDialog from 'web/components/dialog/savedialog';
import FileField from 'web/components/form/filefield';
import FormGroup from 'web/components/form/formgroup';
import Select from 'web/components/form/select';
import YesNoRadio from 'web/components/form/yesnoradio';
import NewIcon from 'web/components/icon/newicon';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/proptypes';
import {renderSelectItems} from 'web/utils/render';

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
      defaultValues={{in_assets}}
      title={_('Import Report')}
      values={{task_id}}
      onClose={onClose}
      onSave={onSave}
    >
      {({values, onValueChange}) => (
        <>
          <FormGroup title={_('Report')}>
            <FileField grow="1" name="xml_file" onChange={onValueChange} />
          </FormGroup>
          <FormGroup direction="row" title={_('Container Task')}>
            <Select
              grow="1"
              items={renderSelectItems(tasks)}
              name="task_id"
              value={values.task_id}
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
              name="in_assets"
              value={values.in_assets}
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
