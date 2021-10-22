/* Copyright (C) 2020-2021 Greenbone Networks GmbH
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

import {_} from 'gmp/locale/lang';

import PropTypes from 'web/utils/proptypes';

export const createTag = ({name, gmp}) => {
  return gmp.tag
    .create({
      active: '1',
      name,
      resource_type: 'host',
    })
    .then(response => {
      const {data = {}} = response;
      return data.id;
    });
};

export const editTag = ({action = 'add', name, hostIds, tagId, gmp}) => {
  return gmp.tag.save({
    active: '1',
    name,
    id: tagId,
    resource_ids: hostIds,
    resource_type: 'host',
    resources_action: action, // this always needs to be sent, even without
    // adding new resources in order to prevent
    // emptying the list when only changing the name
  });
};

export const deleteTag = ({tagId, gmp}) => {
  return gmp.tag.delete({
    id: tagId,
  });
};

const ToolTipContent = styled.div`
  font-weight: normal;
  text-align: center;
  line-height: 1.2em;
`;

export const createToolTipContent = ({severity}) => {
  return (
    <ToolTipContent>
      {severity < 0 ? (
        _('No original severity value available')
      ) : (
        <span>
          {_('Original severity: ')}
          <b>{severity}</b>
        </span>
      )}
    </ToolTipContent>
  );
};

createToolTipContent.propTypes = {
  severity: PropTypes.number,
};

// vim: set ts=2 sw=2 tw=80:
