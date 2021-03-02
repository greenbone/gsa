/* Copyright (C) 2018-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import styled from 'styled-components';

import _ from 'gmp/locale';

import SaveDialog from 'web/components/dialog/savedialog';

import FormGroup from 'web/components/form/formgroup';
import Select from 'web/components/form/select';

import NewIcon from 'web/components/icon/newicon';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

import PropTypes from 'web/utils/proptypes';
import {renderSelectItems} from 'web/utils/render';

const ENTITIES_THRESHOLD = 50000;

const Notification = styled(Layout)`
  justify-content: center;
`;

const TagsDialog = ({
  comment = '',
  entitiesCount,
  tagId: id,
  name,
  tags,
  title = _('Add Tag'),
  value = '',
  onClose,
  onNewTagClick,
  onTagChanged,
  onSave,
}) => (
  <SaveDialog
    buttonTitle="Add Tag"
    title={title}
    width="650px"
    values={{
      comment,
      id,
      name,
      value,
    }}
    onClose={onClose}
    onSave={onSave}
  >
    {() => (
      <Layout flex="column">
        <FormGroup title={_('Choose Tag')} titleSize="4">
          <Divider>
            <Select
              menuPosition="adjust"
              name="name"
              value={id}
              width="230px"
              items={renderSelectItems(tags)}
              onChange={onTagChanged}
            />
            <NewIcon
              value={'tag'}
              title={_('Create a new Tag')}
              onClick={onNewTagClick}
            />
          </Divider>
        </FormGroup>
        <FormGroup title={_('Value')} titleSize="4">
          {value}
        </FormGroup>
        <FormGroup title={_('Comment')} titleSize="4">
          {comment}
        </FormGroup>
        {entitiesCount >= ENTITIES_THRESHOLD && (
          <Notification>
            {_(
              'Please note that assigning a tag to {{count}} ' +
                'items may take several minutes.',
              {count: entitiesCount},
            )}
          </Notification>
        )}
      </Layout>
    )}
  </SaveDialog>
);

TagsDialog.propTypes = {
  comment: PropTypes.string,
  entitiesCount: PropTypes.number.isRequired,
  filter: PropTypes.filter,
  name: PropTypes.string,
  tagId: PropTypes.id,
  tags: PropTypes.array,
  title: PropTypes.string,
  value: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onNewTagClick: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onTagChanged: PropTypes.func.isRequired,
};

export default TagsDialog;

// vim: set ts=2 sw=2 tw=80:
