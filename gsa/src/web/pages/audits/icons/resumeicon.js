/* Copyright (C) 2019-2020 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

import ResumeIcon from 'web/components/icon/resumeicon';

const AuditResumeIcon = ({capabilities, audit, onClick}) => {
  if (isDefined(audit.schedule)) {
    return (
      <ResumeIcon
        active={false}
        alt={_('Resume')}
        title={_('Audit is scheduled')}
      />
    );
  }

  if (audit.isStopped() || audit.isInterrupted()) {
    if (capabilities.mayOp('resume_task')) {
      return <ResumeIcon title={_('Resume')} value={audit} onClick={onClick} />;
    }
    return (
      <ResumeIcon
        active={false}
        alt={_('Resume')}
        title={_('Permission to resume audit denied')}
      />
    );
  }

  return (
    <ResumeIcon
      active={false}
      alt={_('Resume')}
      title={_('Audit is not stopped')}
    />
  );
};

AuditResumeIcon.propTypes = {
  audit: PropTypes.model.isRequired,
  capabilities: PropTypes.capabilities.isRequired,
  onClick: PropTypes.func,
};

export default withCapabilities(AuditResumeIcon);

// vim: set ts=2 sw=2 tw=80:
