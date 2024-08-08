/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';
import {getEntityType, typeName} from 'gmp/utils/entitytype';

import PropTypes from 'web/utils/proptypes';

import CloneIcon from 'web/components/icon/cloneicon';
import withCapabilities from 'web/utils/withCapabilities';

const EntityCloneIcon = ({
  capabilities,
  displayName,
  entity,
  mayClone = true,
  name,
  title,
  onClick,
  ...props
}) => {
  if (!isDefined(name)) {
    name = getEntityType(entity);
  }

  if (!isDefined(displayName)) {
    displayName = typeName(name);
  }

  const active =
    mayClone &&
    capabilities.mayClone(name) &&
    entity.userCapabilities.mayAccess(name);
  if (!isDefined(title)) {
    if (active) {
      title = _('Clone {{entity}}', {entity: displayName});
      // eslint-disable-next-line no-negated-condition
    } else if (!mayClone) {
      title = _('{{entity}} may not be cloned', {entity: displayName});
    } else {
      title = _('Permission to clone {{entity}} denied', {entity: displayName});
    }
  }
  return (
    <CloneIcon
      {...props}
      title={title}
      value={entity}
      active={active}
      onClick={active ? onClick : undefined}
    />
  );
};

EntityCloneIcon.propTypes = {
  capabilities: PropTypes.capabilities.isRequired,
  displayName: PropTypes.string,
  entity: PropTypes.model.isRequired,
  mayClone: PropTypes.bool,
  name: PropTypes.string,
  title: PropTypes.string,
  onClick: PropTypes.func,
};

export default withCapabilities(EntityCloneIcon);

// vim: set ts=2 sw=2 tw=80:
