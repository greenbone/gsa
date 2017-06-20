/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import React from 'react';

import _ from '../../locale.js';

import Section from '../section.js';
import PropTypes from '../proptypes.js';

import Icon from '../icons/icon.js';

import DetailsLink from '../link/detailslink.js';

import Table from '../table/stripped.js';
import TableBody from '../table/body.js';
import TableData from '../table/data.js';
import TableHeader from '../table/header.js';
import TableHead from '../table/head.js';
import TableRow from '../table/row.js';

const TagIcon = props => {
  return (
    <Icon {...props} img="tag.svg" size="small" />
  );
};

const EntityTags = ({
  entity,
  foldable = true,
}) => {
  return (
    <Section
      foldable={foldable}
      img={<TagIcon/>}
      title={_('User Tags ({{count}})', {count: entity.user_tags.length})}
    >
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
            <TableHead>
              {_('Actions')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {
            entity.user_tags.map(tag => {
              return (
                <TableRow
                  key={tag.id}>
                  <TableData>
                    <DetailsLink
                      legacy
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
                  </TableData>
                </TableRow>
              );
            })
          }
        </TableBody>
      </Table>
    </Section>
  );
};

EntityTags.propTypes = {
  entity: PropTypes.model.isRequired,
  foldable: PropTypes.bool,
};

export default EntityTags;

// vim: set ts=2 sw=2 tw=80:
