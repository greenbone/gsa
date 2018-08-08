/* Greenbone Security Assistant
 *
 * Authors:
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
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

import _ from 'gmp/locale';

import styled from 'styled-components';

import Filter from 'gmp/models/filter';
import {pluralizeType, normalizeType} from 'gmp/utils/entitytype';

import PropTypes from 'web/utils/proptypes.js';
import withGmp from 'web/utils/withGmp';

import ListIcon from 'web/components/icon/listicon.js';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';
import DetailsLink from 'web/components/link/detailslink';

const MAX_RESOURCES = 40;

const Spacer = styled.div`
  height: 12px,
`;

const Notification = ({id, resourceType}) => {
  const filter = Filter.fromString('tag_id=' + id);
  return (
    <Divider>
      <span>
        {_('Listing only the first {{num}} items. ', {num: MAX_RESOURCES})}
        {_('To see all assigned resources click here:')}
      </span>
      <ListIcon
        title={_('List Items')}
        filter={filter}
        page={pluralizeType(normalizeType(resourceType))}
      />
    </Divider>
  );
};

Notification.propTypes = {
  id: PropTypes.string.isRequired,
  resourceType: PropTypes.string.isRequired,
};

class ResourceList extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {res: []};
  }

  componentDidMount() {
    const {gmp, entity} = this.props;
    const {id, resource_type} = entity || {};
    const filter = 'tag_id="' + id + '" rows=' + MAX_RESOURCES;
    gmp[pluralizeType(normalizeType(resource_type))].get({filter})
    .then(resources => this.setState({res: resources.data}));
  }

  render() {
    const {entity} = this.props;
    const {id, resource_count, resource_type} = entity;
    const {res} = this.state;
    const showNotification = resource_count > MAX_RESOURCES;

    return (
      <Layout flex="column">
        {showNotification &&
          <Notification
            id={id}
            resourceType={resource_type}
          />
        }
        <Spacer/>
        <ul>
          {res.map(resource =>
            (<li key={resource.id}>
              <DetailsLink
                id={resource.id}
                type={normalizeType(resource_type)}
              >
                {resource.name}
              </DetailsLink>
            </li>)
          )}
        </ul>
      </Layout>
    );
  };
}

ResourceList.propTypes = {
  entity: PropTypes.object,
  gmp: PropTypes.gmp.isRequired,
};

export default withGmp(ResourceList);

// vim: set ts=2 sw=2 tw=80:
