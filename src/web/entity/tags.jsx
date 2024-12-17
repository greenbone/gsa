/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */




import _ from 'gmp/locale';
import {typeName, getEntityType} from 'gmp/utils/entitytype';
import React from 'react';
import styled from 'styled-components';
import DeleteIcon from 'web/components/icon/deleteicon';
import DisableIcon from 'web/components/icon/disableicon';
import EditIcon from 'web/components/icon/editicon';
import ManualIcon from 'web/components/icon/manualicon';
import NewIcon from 'web/components/icon/newicon';
import Divider from 'web/components/layout/divider';
import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';
import DetailsLink from 'web/components/link/detailslink';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableHead from 'web/components/table/head';
import TableHeader from 'web/components/table/header';
import TableRow from 'web/components/table/row';
import Table from 'web/components/table/stripedtable';
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
            anchor="tags"
            page="web-interface"
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
    const {userTags} = entity;
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
                <TableHead align="center" width="8%">
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
                      <IconDivider grow align="center">
                        <DisableIcon
                          title={_('Disable Tag')}
                          value={tag}
                          onClick={onTagDisableClick}
                        />
                        <DeleteIcon
                          title={_('Remove Tag from {{type}}', {
                            type: typeName(entityType),
                          })}
                          value={tag}
                          onClick={() => onTagRemoveClick(tag.id, entity)}
                        />
                        <EditIcon
                          title={_('Edit Tag')}
                          value={tag}
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
    onAddError={onError}
    onAdded={onChanged}
    onCreateError={onError}
    onCreated={onChanged}
    onDeleteError={onError}
    onDeleted={onChanged}
    onDisableError={onError}
    onDisabled={onChanged}
    onEnableError={onError}
    onEnabled={onChanged}
    onInteraction={onInteraction}
    onRemoveError={onError}
    onRemoved={onChanged}
    onSaveError={onError}
    onSaved={onChanged}
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
