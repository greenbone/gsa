/* Copyright (C) 2017-2019 Greenbone Networks GmbH
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

import {isDefined} from 'gmp/utils/identity';

import {TAG_NA} from 'gmp/models/nvt';

import PropTypes from '../../utils/proptypes.js';
import DetailsBlock from '../../entity/block.js';

import SolutionTypeIcon from '../../components/icon/solutiontypeicon.js';

import IconDivider from '../../components/layout/icondivider.js';

import Pre from './preformatted';

const Solution = ({solution, solutionType}) => {
  const has_solution = isDefined(solution) && solution !== TAG_NA;

  if (!has_solution) {
    return null;
  }

  return (
    <DetailsBlock title={_('Solution')}>
      <IconDivider>
        <b>{_('Solution Type: ')}</b>
        <SolutionTypeIcon displayTitleText type={solutionType} />
      </IconDivider>
      <Pre>{solution}</Pre>
    </DetailsBlock>
  );
};

Solution.propTypes = {
  solution: PropTypes.string,
  solutionType: PropTypes.string,
};

export default Solution;

// vim: set ts=2 sw=2 tw=80:
