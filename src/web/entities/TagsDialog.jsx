/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import SaveDialog from 'web/components/dialog/SaveDialog';
import FormGroup from 'web/components/form/FormGroup';
import Select from 'web/components/form/Select';
import {NewIcon} from 'web/components/icon';
import Layout from 'web/components/layout/Layout';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';
import {renderSelectItems} from 'web/utils/Render';
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
  title = 'Add Tag',
  value = '',
  onClose,
  onErrorClose,
  onNewTagClick,
  onTagChanged,
  onSave,
}) => {
  const [_] = useTranslation();
  title = _(title);

  return (
    <SaveDialog
      buttonTitle="Add Tag"
      data-testid="dialog-title-bar"
      error={error}
      title={title}
      values={{
        comment,
        id,
        name,
        value,
      }}
      width="650px"
      onClose={onClose}
      onErrorClose={onErrorClose}
      onSave={onSave}
    >
      <FormGroup direction="row" title={_('Choose Tag')}>
        <Select
          grow="1"
          items={renderSelectItems(tags)}
          name="name"
          value={id}
          onChange={onTagChanged}
        />
        <NewIcon
          title={_('Create a new Tag')}
          value={'tag'}
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
};

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
