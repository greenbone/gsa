/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {connect} from 'react-redux';

import {withRouter} from 'web/utils/withRouter';

import Filter from 'gmp/models/filter';

import {isDefined} from 'gmp/utils/identity';

import withDownload from 'web/components/form/withDownload';

import withDialogNotification from 'web/components/notification/withDialogNotifiaction'; // eslint-disable-line max-len

import {renewSessionTimeout} from 'web/store/usersettings/actions';

import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';

import EntityContainer from './container';
import Reload, {
  NO_RELOAD,
  USE_DEFAULT_RELOAD_INTERVAL,
} from 'web/components/loading/reload';

const defaultEntityReloadIntervalFunc = ({entity}) =>
  isDefined(entity) ? USE_DEFAULT_RELOAD_INTERVAL : NO_RELOAD;

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

const withEntityContainer =
  (
    entityType,
    {
      load,
      entitySelector,
      mapStateToProps: componentMapStateToProps,
      reloadInterval = defaultEntityReloadIntervalFunc,
    },
  ) =>
  Component => {
    const EntityContainerWrapper = props => (
      <Reload
        reloadInterval={() => reloadInterval(props)}
        reload={(id = props.id) => props.load(id)}
        name={entityType}
      >
        {({reload}) => (
          <EntityContainer {...props} entityType={entityType} reload={reload}>
            {cprops => <Component {...cprops} />}
          </EntityContainer>
        )}
      </Reload>
    );

    EntityContainerWrapper.propTypes = {
      id: PropTypes.id.isRequired,
      load: PropTypes.func.isRequired,
    };

    const mapDispatchToProps = (dispatch, {gmp}) => ({
      onInteraction: () => dispatch(renewSessionTimeout(gmp)()),
      load: id => dispatch(load(gmp)(id)),
    });

    const mapStateToProps = (rootState, {gmp, id, params, ...props}) => {
      if (!isDefined(id)) {
        id = decodeURIComponent(params.id); // decodeURIComponent needs to be done for CPE IDs
      }
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
      connect(mapStateToProps, mapDispatchToProps),
    )(EntityContainerWrapper);
  };

export default withEntityContainer;

// vim: set ts=2 sw=2 tw=80:
