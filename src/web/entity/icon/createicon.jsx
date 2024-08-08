/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import {getEntityType, typeName} from 'gmp/utils/entitytype';
import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

import CreateIcon from 'web/components/icon/newicon';

const EntityCreateIcon = ({
  capabilities,
  display = false,
  displayName,
  entity,
  mayCreate = true,
  name,
  title,
  onClick,
  ...props
}) => {
  if (!isDefined(name)) {
    name = getEntityType(entity);
  }

  const active = mayCreate && capabilities.mayCreate(name);
  if (!display && !active) {
    return null;
  }

  if (!isDefined(displayName)) {
    displayName = typeName(name);
  }

  if (!isDefined(title)) {
    if (active) {
      title = _('Create new {{entity}}', {entity: displayName});
      // eslint-disable-next-line no-negated-condition
    } else if (!mayCreate) {
      title = _('{{entity}} may not be created', {entity: displayName});
    } else {
      title = _('Permission to create {{entity}} denied', {
        entity: displayName,
      });
    }
  }
  return (
    <CreateIcon
      {...props}
      title={title}
      active={active}
      onClick={active ? onClick : undefined}
    />
  );
};

EntityCreateIcon.propTypes = {
  capabilities: PropTypes.capabilities.isRequired,
  display: PropTypes.bool,
  displayName: PropTypes.string,
  entity: PropTypes.model.isRequired,
  mayCreate: PropTypes.bool,
  name: PropTypes.string,
  title: PropTypes.string,
  onClick: PropTypes.func,
};

export default withCapabilities(EntityCreateIcon);

// vim: set ts=2 sw=2 tw=80:
