/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import _ from 'gmp/locale';
import {getEntityType, typeName} from 'gmp/utils/entitytype';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import DeleteIcon from 'web/components/icon/deleteicon';
import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

const EntityDeleteIcon = ({
  capabilities,
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

  const mayDelete =
    capabilities.mayDelete(name) && entity.userCapabilities.mayDelete(name);

  const active = mayDelete && entity.isWritable() && !entity.isInUse();
  if (!isDefined(title)) {
    if (active) {
      title = _('Delete {{entity}}', {entity: displayName});
    } else if (!entity.isWritable()) {
      title = _('{{entity}} is not writable', {entity: displayName});
    } else if (entity.isInUse()) {
      title = _('{{entity}} is still in use', {entity: displayName});
       
    } else if (!mayDelete) {
      title = _('Permission to delete {{entity}} denied', {
        entity: displayName,
      });
    } else {
      title = _('Cannot delete {{entity}}', {entity: displayName});
    }
  }
  return (
    <DeleteIcon
      {...props}
      active={active}
      title={title}
      value={entity}
      onClick={active ? onClick : undefined}
    />
  );
};

EntityDeleteIcon.propTypes = {
  capabilities: PropTypes.capabilities.isRequired,
  displayName: PropTypes.string,
  entity: PropTypes.model.isRequired,
  name: PropTypes.string,
  title: PropTypes.string,
  onClick: PropTypes.func,
};

export default withCapabilities(EntityDeleteIcon);

// vim: set ts=2 sw=2 tw=80:
