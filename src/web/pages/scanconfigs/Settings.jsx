/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {getEntityType, typeName} from 'gmp/utils/entitytype';
import {isDefined} from 'gmp/utils/identity';
import {Settings2Icon} from 'web/components/icon';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';

const EntitySettingsIcon = ({
  disabled,
  displayName,
  entity,
  name,
  title,
  onClick,
  ...props
}) => {
  const capabilities = useCapabilities();
  const [_] = useTranslation();

  if (!isDefined(name)) {
    name = getEntityType(entity);
  }

  if (!isDefined(displayName)) {
    displayName = typeName(name);
  }

  const mayEditSettings =
    capabilities.mayEdit(name) && entity.userCapabilities.mayEdit(name);

  const active = mayEditSettings && entity.isWritable() && !disabled;

  if (!isDefined(title)) {
    if (active) {
      title = _('Edit {{entity}} settings', {entity: displayName});
    } else if (!entity.isWritable()) {
      title = _('{{entity}} settings is not writable', {entity: displayName});
    } else if (!mayEditSettings) {
      title = _('Permission to edit {{entity}} settings denied', {
        entity: displayName,
      });
    } else {
      title = _('Cannot modify {{entity}} settings', {entity: displayName});
    }
  }
  return (
    <Settings2Icon
      {...props}
      active={active}
      title={title}
      value={entity}
      onClick={active ? onClick : undefined}
    />
  );
};

EntitySettingsIcon.propTypes = {
  disabled: PropTypes.bool,
  displayName: PropTypes.string,
  entity: PropTypes.model.isRequired,
  name: PropTypes.string,
  title: PropTypes.string,
  onClick: PropTypes.func,
};

export default EntitySettingsIcon;
