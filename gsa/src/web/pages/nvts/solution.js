/* Copyright (C) 2017-2021 Greenbone Networks GmbH
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

import SolutionTypeIcon from 'web/components/icon/solutiontypeicon';

import IconDivider from 'web/components/layout/icondivider';

import DetailsBlock from 'web/entity/block';

import PropTypes from 'web/utils/proptypes';

import Pre from './preformatted';

const Solution = ({solutionDescription, solutionType}) => {
  const hasSolution = isDefined(solutionDescription) || isDefined(solutionType);

  if (!hasSolution) {
    return null;
  }

  return (
    <DetailsBlock title={_('Solution')}>
      <IconDivider>
        <b>{_('Solution Type: ')}</b>
        <SolutionTypeIcon displayTitleText type={solutionType} />
      </IconDivider>
      <Pre>{solutionDescription}</Pre>
    </DetailsBlock>
  );
};

Solution.propTypes = {
  solutionDescription: PropTypes.string,
  solutionType: PropTypes.string,
};

export default Solution;

// vim: set ts=2 sw=2 tw=80:
