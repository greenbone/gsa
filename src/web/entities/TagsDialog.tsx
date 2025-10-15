/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';
import type Tag from 'gmp/models/tag';
import {isDefined} from 'gmp/utils/identity';
import SaveDialog from 'web/components/dialog/SaveDialog';
import FormGroup from 'web/components/form/FormGroup';
import Select from 'web/components/form/Select';
import {NewIcon} from 'web/components/icon';
import Layout from 'web/components/layout/Layout';
import useTranslation from 'web/hooks/useTranslation';
import {type RenderSelectItemProps, renderSelectItems} from 'web/utils/Render';

export interface TagsDialogData {
  comment?: string;
  id?: string;
  name?: string;
  value?: string;
}

interface TagsDialogProps {
  comment?: string;
  entitiesCount?: number;
  error?: string;
  name?: string;
  tagId?: string;
  tags?: Tag[];
  title?: string;
  value?: string;
  onClose?: () => void;
  onErrorClose?: () => void;
  onNewTagClick?: () => void;
  onSave?: (data: TagsDialogData) => void;
  onTagChanged?: (id: string) => void;
}

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
  title,
  value = '',
  onClose,
  onErrorClose,
  onNewTagClick,
  onTagChanged,
  onSave,
}: TagsDialogProps) => {
  const [_] = useTranslation();
  title = title ?? _('Add Tag');

  return (
    <SaveDialog
      buttonTitle="Add Tag"
      data-testid="bulk-tags-dialog"
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
          items={renderSelectItems(tags as RenderSelectItemProps[])}
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
      {isDefined(entitiesCount) && entitiesCount >= ENTITIES_THRESHOLD && (
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

export default TagsDialog;
