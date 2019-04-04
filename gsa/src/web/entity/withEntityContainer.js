/* Copyright (C) 2018-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

import {connect} from 'react-redux';

import {withRouter} from 'react-router-dom';

import Filter from 'gmp/models/filter';

import {isDefined} from 'gmp/utils/identity';

import withDownload from 'web/components/form/withDownload';

import withDialogNotification from 'web/components/notification/withDialogNotifiaction'; // eslint-disable-line max-len

import {renewSessionTimeout} from 'web/store/usersettings/actions';

import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';

import EntityContainer from './container';

// get permissions assigned to the entity as resource
export const permissionsResourceFilter = id =>
  Filter.fromString('resource_uuid=' + id).all();

export const permissionsSubjectFilter = id =>
  Filter.fromString(
    'subject_uuid=' +
      id +
      ' and not resource_uuid=""' +
      ' or resource_uuid=' +
      id,
  ).all();

const withEntityContainer = (
  entityType,
  {
    load,
    entitySelector,
    mapStateToProps: componentMapStateToProps,
    reloadInterval,
  },
) => Component => {
  const EntityContainerWrapper = ({id, ...props}) => (
    <EntityContainer
      {...props}
      id={id}
      entityType={entityType}
      reloadInterval={reloadInterval}
    >
      {cprops => <Component {...cprops} />}
    </EntityContainer>
  );

  EntityContainerWrapper.propTypes = {
    id: PropTypes.id.isRequired,
  };

  const mapDispatchToProps = (dispatch, {gmp}) => ({
    onInteraction: () => dispatch(renewSessionTimeout(gmp)()),
    load: id => dispatch(load(gmp)(id)),
  });

  const mapStateToProps = (rootState, {gmp, match, ...props}) => {
    let {id} = match.params;
    id = decodeURIComponent(id); // needs to be done for CPE IDs
    const entitySel = entitySelector(rootState);
    const otherProps = isDefined(componentMapStateToProps)
      ? componentMapStateToProps(rootState, {
          gmp,
          id,
          ...props,
        })
      : undefined;
    return {
      isLoading: entitySel.isLoadingEntity(id),
      defaultReloadInterval: gmp.reloadInterval,
      ...otherProps,
      id,
      entity: entitySel.getEntity(id),
      entityError: entitySel.getEntityError(id),
    };
  };

  return compose(
    withGmp,
    withRouter,
    withDialogNotification,
    withDownload,
    connect(
      mapStateToProps,
      mapDispatchToProps,
    ),
  )(EntityContainerWrapper);
};

export default withEntityContainer;

// vim: set ts=2 sw=2 tw=80:
