/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {isDefined} from 'gmp/utils/identity';

import {YES_VALUE} from 'gmp/parser';

import PropTypes from 'web/utils/proptypes';

import SaveDialog from 'web/components/dialog/savedialog';

import FormGroup from 'web/components/form/formgroup';
import TextField from 'web/components/form/textfield';

import useTranslation from 'web/hooks/useTranslation';

import AddResultsToAssetsGroup from './addresultstoassetsgroup';

const ContainerTaskDialog = ({
  comment = '',
  in_assets = YES_VALUE,
  name = '',
  task,
  title,
  onClose,
  onSave,
}) => {
  const [_] = useTranslation();
  const isEdit = isDefined(task);

  title = title || _('New Container Task');

  const data = {
    comment,
    in_assets,
    name,
    id: isEdit ? task.id : undefined,
  };

  return (
    <SaveDialog
      title={title}
      defaultValues={data}
      onClose={onClose}
      onSave={onSave}
    >
      {({values: state, onValueChange}) => {
        return (
          <>
            <FormGroup title={_('Name')}>
              <TextField
                name="name"
                value={state.name}
                onChange={onValueChange}
              />
            </FormGroup>
            <FormGroup title={_('Comment')}>
              <TextField
                name="comment"
                value={state.comment}
                onChange={onValueChange}
              />
            </FormGroup>

            {isEdit && (
              <AddResultsToAssetsGroup
                inAssets={state.in_assets}
                onChange={onValueChange}
              />
            )}
          </>
        );
      }}
    </SaveDialog>
  );
};

ContainerTaskDialog.propTypes = {
  auto_delete: PropTypes.oneOf(['keep', 'no']),
  auto_delete_data: PropTypes.number,
  comment: PropTypes.string,
  in_assets: PropTypes.yesno,
  name: PropTypes.string,
  task: PropTypes.model,
  title: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default ContainerTaskDialog;

// vim: set ts=2 sw=2 tw=80:
