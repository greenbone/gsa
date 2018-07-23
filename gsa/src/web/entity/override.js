/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import React from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from '../utils/proptypes.js';
import {
  LOG_VALUE,
  translatedResultSeverityRiskFactor,
} from '../utils/severity';

import EntityBox from '../entity/box.js';

import IconDivider from '../components/layout/icondivider.js';

import Icon from '../components/icon/icon.js';

import DetailsLink from '../components/link/detailslink.js';

const OverrideBox = ({
  override,
  detailsLink = true,
}) => {
  let severity;
  let new_severity = '';
  if (!isDefined(override.severity)) {
    severity = _('Any');
  }
  else if (override.severity > LOG_VALUE) {
    severity = _('Severity > 0.0');
  }
  else {
    severity = translatedResultSeverityRiskFactor(override.severity);
  }

  if (override.new_severity > LOG_VALUE) {
    new_severity = override.new_severity + ': ';
  }
  new_severity += translatedResultSeverityRiskFactor(override.new_severity);

  const toolbox = detailsLink ? (
    <IconDivider>
      <DetailsLink
        id={override.id}
        type="override"
        title={_('Override Details')}
      >
        <Icon img="details.svg"/>
      </DetailsLink>
    </IconDivider>
  ) : undefined;
  return (
    <EntityBox
      title={_('Override from {{- severity}} to {{- new_severity}}',
        {severity, new_severity})}
      text={override.text}
      end={override.endTime}
      toolbox={toolbox}
      modified={override.modificationTime}
    />
  );
};

OverrideBox.propTypes = {
  className: PropTypes.string,
  detailsLink: PropTypes.bool,
  override: PropTypes.model.isRequired,
};

export default OverrideBox;
