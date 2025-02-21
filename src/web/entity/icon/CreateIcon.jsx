/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {getEntityType, typeName} from 'gmp/utils/entitytype';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import CreateIcon from 'web/components/icon/NewIcon';
import PropTypes from 'web/utils/PropTypes';
import withCapabilities from 'web/utils/withCapabilities';

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
      active={active}
      title={title}
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
