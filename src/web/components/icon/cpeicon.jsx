/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import Cpe from 'web/utils/cpe';

import Img from 'web/components/img/img';

const CpeIcon = ({name, ...props}) => {
  const cpe = Cpe.find(name);

  const icon = isDefined(cpe) ? cpe.icon : 'cpe/other.svg';

  return <Img {...props} width="16px" src={icon} data-testid="cpe-icon"/>;
};

CpeIcon.propTypes = {
  name: PropTypes.string,
};

export default CpeIcon;

// vim: set ts=2 sw=2 tw=80:
