/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import 'core-js/fn/array/from';
import 'core-js/fn/set';

import React from 'react';

import glamorous from 'glamorous';

import _ from 'gmp/locale';

import {is_defined} from 'gmp/utils/identity';
import {typeName, getEntityType} from 'gmp/utils/entitytype';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

import EditIcon from 'web/components/icon/editicon.js';
import ManualIcon from 'web/components/icon/manualicon.js';
import Icon from 'web/components/icon/icon.js';
import NewIcon from 'web/components/icon/newicon.js';
import DeleteIcon from 'web/components/icon/deleteicon.js';

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

const SectionElementDivider = glamorous(Divider)({
  marginBottom: '3px',
});

const SectionElements = withCapabilities(({
  capabilities,
  entity,
  onTagCreateClick,
}) => (
  <Layout grow align="end">
    <SectionElementDivider margin="10px">
      <IconDivider>
        {capabilities.mayCreate('tag') &&
          <NewIcon
            title={_('New Tag')}
            value={entity}
            onClick={onTagCreateClick}
          />
        }
        <ManualIcon
          page="gui_introduction"
          anchor="tags"
          title={_('Help: User Tags')}
        />
      </IconDivider>
    </SectionElementDivider>
  </Layout>
));

SectionElements.propTypes = {
  entity: PropTypes.model.isRequired,
  onTagCreateClick: PropTypes.func.isRequired,
};

const EntityTags = ({
  entity,
  onTagDisableClick,
  onTagEditClick,
  onTagCreateClick,
  onTagRemoveClick,
}) => {
  const extra = (
    <SectionElements
      entity={entity}
      onTagCreateClick={onTagCreateClick}
    />
  );
  const tags = entity.user_tags;
  const has_tags = is_defined(tags);
  const count = has_tags ? tags.length : 0;
  const entityType = getEntityType(entity);
  return (
    <Layout
      flex="column"
      title={_('User Tags ({{count}})', {count})}
    >
      {extra}
      {tags.length === 0 &&
        _('No user tags available')
      }
      {tags.length > 0 &&
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                {_('Name')}
              </TableHead>
              <TableHead>
                {_('Value')}
              </TableHead>
              <TableHead>
                {_('Comment')}
              </TableHead>
              <TableHead width="5em">
                {_('Actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {
              tags.map(tag => {
                return (
                  <TableRow
                    key={tag.id}>
                    <TableData>
                      <DetailsLink
                        id={tag.id}
                        type="tag">
                        {tag.name}
                      </DetailsLink>
                    </TableData>
                    <TableData>
                      {tag.value}
                    </TableData>
                    <TableData>
                      {tag.comment}
                    </TableData>
                    <TableData>
                      <IconDivider>
                        <Icon
                          img="disable.svg"
                          value={tag}
                          title={_('Disable Tag')}
                          onClick={onTagDisableClick}
                        />
                        <DeleteIcon
                          value={tag}
                          title={_('Remove Tag from {{type}}',
                            {type: typeName(entityType)})}
                          onClick={() => onTagRemoveClick(tag.id, entity)}
                        />
                        <EditIcon
                          value={tag}
                          title={_('Edit Tag')}
                          onClick={onTagEditClick}
                        />
                      </IconDivider>
                    </TableData>
                  </TableRow>
                );
              })
            }
          </TableBody>
        </Table>
      }
    </Layout>
  );
};

EntityTags.propTypes = {
  entity: PropTypes.model.isRequired,
  onTagCreateClick: PropTypes.func.isRequired,
  onTagDisableClick: PropTypes.func.isRequired,
  onTagEditClick: PropTypes.func.isRequired,
  onTagRemoveClick: PropTypes.func.isRequired,
};

export default EntityTags;

// vim: set ts=2 sw=2 tw=80:
