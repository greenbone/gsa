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
