/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import ViewOtherIcon from 'web/components/icon/ViewOtherIcon';
import PropTypes from 'web/utils/PropTypes';

const ObserverIcon = ({
  entity,
  userName,
  displayName = _('Entity'),
  ['data-testid']: dataTestId = 'observer-icon',
}) => {
  const owner = isDefined(entity.owner) ? entity.owner.name : undefined;

  if (owner === userName) {
    return null;
  }

  let title;
  if (isDefined(owner)) {
    title = _('{{type}} owned by {{owner}}', {type: displayName, owner});
  } else {
    title = _('Global {{type}}', {type: displayName});
  }
  return <ViewOtherIcon alt={title} data-testid={dataTestId} title={title} />;
};

ObserverIcon.propTypes = {
  displayName: PropTypes.string,
  entity: PropTypes.model.isRequired,
  userName: PropTypes.string.isRequired,
  'data-testid': PropTypes.string,
};

export default ObserverIcon;
