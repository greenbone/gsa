/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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

import ErrorContainer from 'web/components/error/errorcontainer';

import PropTypes from 'web/utils/proptypes';

const ThresholdMessage = ({threshold}) => (
  <ErrorContainer>
    {_(
      'WARNING: Please be aware that the report has more results than ' +
        'the threshold of {{threshold}}. Therefore, this action can take ' +
        'a really long time to finish. It might even exceed the session ' +
        'timeout!',
      {threshold},
    )}
  </ErrorContainer>
);

ThresholdMessage.propTypes = {
  threshold: PropTypes.number.isRequired,
};

export default ThresholdMessage;

// vim: set ts=2 sw=2 tw=80:
