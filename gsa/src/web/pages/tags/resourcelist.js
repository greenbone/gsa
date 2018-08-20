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
import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';

import ListIcon from 'web/components/icon/listicon';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';
import DetailsLink from 'web/components/link/detailslink';
import Loading from 'web/components/loading/loading';

import {MAX_RESOURCES} from 'web/pages/tags/component';

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

    this.state = {
      isLoading: true,
      res: [],
    };
  }

  componentDidMount() {
    const {gmp, entity} = this.props;
    if (isDefined(entity)) {
      const {id, resourceType} = entity;
      const filter = 'tag_id="' + id + '" rows=' + MAX_RESOURCES;
      gmp[pluralizeType(resourceType)].get({filter})
        .then(resources =>
          this.setState({
            isLoading: false,
            res: resources.data,
          })
        );
    }
  }

  render() {
    const {entity} = this.props;
    const {id, resourceCount, resourceType} = entity;
    const {isLoading, res} = this.state;
    const showNotification = resourceCount > MAX_RESOURCES;

    return (
      <React.Fragment>
        {isLoading ?
          <Loading/> :
          <Layout flex="column">
            {showNotification &&
              <Notification
                id={id}
                resourceType={resourceType}
              />
            }
            <Spacer/>
            <ul>
              {res.map(resource =>
                (<li key={resource.id}>
                  <DetailsLink
                    id={resource.id}
                    type={resourceType}
                  >
                    {resource.name}
                  </DetailsLink>
                </li>)
              )}
            </ul>
          </Layout>
        }
      </React.Fragment>
    );
  };
}

ResourceList.propTypes = {
  entity: PropTypes.object,
  gmp: PropTypes.gmp.isRequired,
};

export default withGmp(ResourceList);

// vim: set ts=2 sw=2 tw=80:
