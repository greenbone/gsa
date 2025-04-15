/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import useTranslation from 'src/web/hooks/useTranslation';
import SolutionTypeIcon from 'web/components/icon/SolutionTypeIcon';
import IconDivider from 'web/components/layout/IconDivider';
import DetailsBlock from 'web/entity/Block';
import Pre from 'web/pages/nvts/Preformatted';
import PropTypes from 'web/utils/PropTypes';
const Solution = ({solutionDescription, solutionType}) => {
  const [_] = useTranslation();
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
