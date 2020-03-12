/* Copyright (C) 2019-2020 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

import StartIcon from 'web/components/icon/starticon';

const AuditStartIcon = ({capabilities, audit, onClick}) => {
  if (audit.isRunning()) {
    return null;
  }

  if (!capabilities.mayOp('start_task')) {
    return (
      <StartIcon active={false} title={_('Permission to start Audit denied')} />
    );
  }

  if (!audit.isActive()) {
    return <StartIcon title={_('Start')} value={audit} onClick={onClick} />;
  }
  return <StartIcon active={false} title={_('Audit is already active')} />;
};

AuditStartIcon.propTypes = {
  audit: PropTypes.model.isRequired,
  capabilities: PropTypes.capabilities.isRequired,
  onClick: PropTypes.func,
};

export default withCapabilities(AuditStartIcon);

// vim: set ts=2 sw=2 tw=80:
