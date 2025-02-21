/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import Img from 'web/components/img/Img';
import Cpe from 'web/utils/Cpe';
import PropTypes from 'web/utils/PropTypes';

const CpeIcon = ({name, ...props}) => {
  const cpe = Cpe.find(name);

  const icon = isDefined(cpe) ? cpe.icon : 'cpe/other.svg';

  return <Img {...props} data-testid="cpe-icon" src={icon} width="16px" />;
};

CpeIcon.propTypes = {
  name: PropTypes.string,
};

export default CpeIcon;
