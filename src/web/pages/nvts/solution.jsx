/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';
import DetailsBlock from 'web/entity/block';

import SolutionTypeIcon from 'web/components/icon/solutiontypeicon';

import IconDivider from 'web/components/layout/icondivider';

import Pre from './preformatted';

const Solution = ({solutionDescription, solutionType}) => {
  const hasSolution = isDefined(solutionDescription) || isDefined(solutionType);

  if (!hasSolution) {
    return null;
  }

  return (
    <DetailsBlock title={_('Solution')}>
      {isDefined(solutionType) && (
        <IconDivider>
          <b>{_('Solution Type: ')}</b>
          <SolutionTypeIcon displayTitleText type={solutionType} />
        </IconDivider>
      )}
      {isDefined(solutionDescription) && <Pre>{solutionDescription}</Pre>}
    </DetailsBlock>
  );
};

Solution.propTypes = {
  solutionDescription: PropTypes.string,
  solutionType: PropTypes.string,
};

export default Solution;

// vim: set ts=2 sw=2 tw=80:
