/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import styled from 'styled-components';

import _ from 'gmp/locale';

import {renderSelectItems} from 'web/utils/render';

import PropTypes from 'web/utils/proptypes';

import SaveDialog from 'web/components/dialog/savedialog';

import FormGroup from 'web/components/form/formgroup';
import Select from 'web/components/form/select';

import NewIcon from 'web/components/icon/newicon';

import Layout from 'web/components/layout/layout';

const ENTITIES_THRESHOLD = 50000;

const Notification = styled(Layout)`
  justify-content: center;
`;

const TagsDialog = ({
  comment = '',
  entitiesCount,
  error,
  tagId: id,
  name,
  tags,
  title = _('Add Tag'),
  value = '',
  onClose,
  onErrorClose,
  onNewTagClick,
  onTagChanged,
  onSave,
}) => (
  <SaveDialog
    buttonTitle="Add Tag"
    error={error}
    title={title}
    width="650px"
    values={{
      comment,
      id,
      name,
      value,
    }}
    onClose={onClose}
    onErrorClose={onErrorClose}
    onSave={onSave}
  >
    <FormGroup title={_('Choose Tag')} direction="row">
      <Select
        grow="1"
        name="name"
        value={id}
        items={renderSelectItems(tags)}
        onChange={onTagChanged}
      />
      <NewIcon
        value={'tag'}
        title={_('Create a new Tag')}
        onClick={onNewTagClick}
      />
    </FormGroup>
    <FormGroup title={_('Value')}>{value}</FormGroup>
    <FormGroup title={_('Comment')}>{comment}</FormGroup>
    {entitiesCount >= ENTITIES_THRESHOLD && (
      <Notification>
        {_(
          'Please note that assigning a tag to {{count}} ' +
            'items may take several minutes.',
          {count: entitiesCount},
        )}
      </Notification>
    )}
  </SaveDialog>
);

TagsDialog.propTypes = {
  comment: PropTypes.string,
  entitiesCount: PropTypes.number.isRequired,
  error: PropTypes.string,
  filter: PropTypes.filter,
  name: PropTypes.string,
  tagId: PropTypes.id,
  tags: PropTypes.array,
  title: PropTypes.string,
  value: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onErrorClose: PropTypes.func,
  onNewTagClick: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onTagChanged: PropTypes.func.isRequired,
};

export default TagsDialog;
