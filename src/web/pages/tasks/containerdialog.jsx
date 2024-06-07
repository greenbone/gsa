/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import {YES_VALUE} from 'gmp/parser';

import PropTypes from 'web/utils/proptypes';

import SaveDialog from 'web/components/dialog/savedialog';

import FormGroup from 'web/components/form/formgroup';
import TextField from 'web/components/form/textfield';

import Layout from 'web/components/layout/layout';

import AddResultsToAssetsGroup from './addresultstoassetsgroup';

const ContainerTaskDialog = ({
  comment = '',
  in_assets = YES_VALUE,
  name = '',
  task,
  title = _('New Container Task'),
  onClose,
  onSave,
}) => {
  const isEdit = isDefined(task);

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
          <Layout flex="column">
            <FormGroup title={_('Name')}>
              <TextField
                name="name"
                grow="1"
                value={state.name}
                size="30"
                onChange={onValueChange}
              />
            </FormGroup>
            <FormGroup title={_('Comment')}>
              <TextField
                name="comment"
                value={state.comment}
                grow="1"
                size="30"
                onChange={onValueChange}
              />
            </FormGroup>

            {isEdit && (
              <AddResultsToAssetsGroup
                inAssets={state.in_assets}
                onChange={onValueChange}
              />
            )}
          </Layout>
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
