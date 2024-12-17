/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import _ from 'gmp/locale';
import {getEntityType, typeName} from 'gmp/utils/entitytype';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import EditIcon from 'web/components/icon/editicon';
import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

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
       
    } else if (!mayEdit) {
      title = _('Permission to edit {{entity}} denied', {entity: displayName});
    } else {
      title = _('Cannot modify {{entity}}', {entity: displayName});
    }
  }
  return (
    <EditIcon
      {...props}
      active={active}
      title={title}
      value={entity}
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
