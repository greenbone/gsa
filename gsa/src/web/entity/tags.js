/* Copyright (C) 2017-2021 Greenbone Networks GmbH
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

import {typeName, getEntityType} from 'gmp/utils/entitytype';

import DisableIcon from 'web/components/icon/disableicon';
import EditIcon from 'web/components/icon/editicon';
import ManualIcon from 'web/components/icon/manualicon';
import NewIcon from 'web/components/icon/newicon';
import DeleteIcon from 'web/components/icon/deleteicon';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';
import IconDivider from 'web/components/layout/icondivider';

import DetailsLink from 'web/components/link/detailslink';

import Table from 'web/components/table/stripedtable';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableHeader from 'web/components/table/header';
import TableHead from 'web/components/table/head';
import TableRow from 'web/components/table/row';

import TagComponent from 'web/pages/tags/component';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

const SectionElementDivider = styled(Divider)`
  margin-bottom: 3px;
`;

const SectionElements = withCapabilities(
  ({capabilities, entity, onTagCreateClick}) => (
    <Layout grow align="end">
      <SectionElementDivider margin="10px">
        <IconDivider>
          {capabilities.mayCreate('tag') && (
            <NewIcon
              title={_('New Tag')}
              value={entity}
              onClick={onTagCreateClick}
            />
          )}
          <ManualIcon
            page="web-interface"
            anchor="tags"
            title={_('Help: User Tags')}
          />
        </IconDivider>
      </SectionElementDivider>
    </Layout>
  ),
);

SectionElements.propTypes = {
  entity: PropTypes.model.isRequired,
  onTagCreateClick: PropTypes.func.isRequired,
};

class EntityTagsTable extends React.Component {
  constructor(...args) {
    super(...args);

    this.handleCreateTag = this.handleCreateTag.bind(this);
    this.handleEditTag = this.handleEditTag.bind(this);
  }

  handleCreateTag() {
    const {entity, onTagCreateClick} = this.props;

    const entityType = getEntityType(entity);

    onTagCreateClick({
      fixed: true,
      resource_ids: [entity.id],
      resource_type: entityType,
      name: _('{{type}}:unnamed', {type: entityType}),
    });
  }

  handleEditTag(tag) {
    const {onTagEditClick} = this.props;
    onTagEditClick(tag, {fixed: true});
  }

  render() {
    const {entity, onTagDisableClick, onTagRemoveClick} = this.props;
    const {userTags = []} = entity;
    const count = userTags.length;
    const entityType = getEntityType(entity);
    return (
      <Layout flex="column" title={_('User Tags ({{count}})', {count})}>
        <SectionElements
          entity={entity}
          onTagCreateClick={this.handleCreateTag}
        />
        {count === 0 ? (
          _('No user tags available')
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{_('Name')}</TableHead>
                <TableHead>{_('Value')}</TableHead>
                <TableHead>{_('Comment')}</TableHead>
                <TableHead width="8%" align="center">
                  {_('Actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userTags.map(tag => {
                return (
                  <TableRow key={tag.id}>
                    <TableData>
                      <span>
                        <DetailsLink id={tag.id} type="tag">
                          {tag.name}
                        </DetailsLink>
                      </span>
                    </TableData>
                    <TableData>{tag.value}</TableData>
                    <TableData>{tag.comment}</TableData>
                    <TableData>
                      <IconDivider align="center" grow>
                        <DisableIcon
                          value={tag}
                          title={_('Disable Tag')}
                          onClick={onTagDisableClick}
                        />
                        <DeleteIcon
                          value={tag}
                          title={_('Remove Tag from {{type}}', {
                            type: typeName(entityType),
                          })}
                          onClick={() => onTagRemoveClick(tag.id, entity)}
                        />
                        <EditIcon
                          value={tag}
                          title={_('Edit Tag')}
                          onClick={this.handleEditTag}
                        />
                      </IconDivider>
                    </TableData>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Layout>
    );
  }
}

EntityTagsTable.propTypes = {
  entity: PropTypes.model.isRequired,
  onTagCreateClick: PropTypes.func.isRequired,
  onTagDisableClick: PropTypes.func.isRequired,
  onTagEditClick: PropTypes.func.isRequired,
  onTagRemoveClick: PropTypes.func.isRequired,
};

const EntityTags = ({entity, onChanged, onError, onInteraction}) => (
  <TagComponent
    onAdded={onChanged}
    onAddError={onError}
    onCreated={onChanged}
    onCreateError={onError}
    onDeleted={onChanged}
    onDeleteError={onError}
    onDisabled={onChanged}
    onDisableError={onError}
    onEnabled={onChanged}
    onEnableError={onError}
    onInteraction={onInteraction}
    onRemoved={onChanged}
    onRemoveError={onError}
    onSaved={onChanged}
    onSaveError={onError}
  >
    {({create, disable, edit, remove}) => (
      <EntityTagsTable
        entity={entity}
        onTagCreateClick={create}
        onTagDisableClick={disable}
        onTagEditClick={edit}
        onTagRemoveClick={remove}
      />
    )}
  </TagComponent>
);

EntityTags.propTypes = {
  entity: PropTypes.model,
  onChanged: PropTypes.func,
  onError: PropTypes.func,
  onInteraction: PropTypes.func.isRequired,
};

export default EntityTags;

// vim: set ts=2 sw=2 tw=80:
