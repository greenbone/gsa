/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import ViewOtherIcon from 'web/components/icon/viewothericon';

const ObserverIcon = ({entity, userName, displayName = _('Entity')}) => {
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
  return <ViewOtherIcon alt={title} title={title} />;
};

ObserverIcon.propTypes = {
  displayName: PropTypes.string,
  entity: PropTypes.model.isRequired,
  userName: PropTypes.string.isRequired,
};

export default ObserverIcon;

// vim: set ts=2 sw=2 tw=80:
