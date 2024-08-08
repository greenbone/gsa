/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import _ from 'gmp/locale';
import {isDefined} from 'gmp/utils/identity';
import {getEntityType, typeName} from 'gmp/utils/entitytype';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

import EditIcon from 'web/components/icon/editicon';

const EntityEditIcon = ({
  capabilities,
  disabled,
  displayName,
  entity,
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

  const mayEdit =
    capabilities.mayEdit(name) && entity.userCapabilities.mayEdit(name);

  const active = mayEdit && entity.isWritable() && !disabled;

  if (!isDefined(title)) {
    if (active) {
      title = _('Edit {{entity}}', {entity: displayName});
    } else if (!entity.isWritable()) {
      title = _('{{entity}} is not writable', {entity: displayName});
      // eslint-disable-next-line no-negated-condition
    } else if (!mayEdit) {
      title = _('Permission to edit {{entity}} denied', {entity: displayName});
    } else {
      title = _('Cannot modify {{entity}}', {entity: displayName});
    }
  }
  return (
    <EditIcon
      {...props}
      title={title}
      value={entity}
      active={active}
      onClick={active ? onClick : undefined}
    />
  );
};

EntityEditIcon.propTypes = {
  capabilities: PropTypes.capabilities.isRequired,
  disabled: PropTypes.bool,
  displayName: PropTypes.string,
  entity: PropTypes.model.isRequired,
  name: PropTypes.string,
  title: PropTypes.string,
  onClick: PropTypes.func,
};

export default withCapabilities(EntityEditIcon);

// vim: set ts=2 sw=2 tw=80:
