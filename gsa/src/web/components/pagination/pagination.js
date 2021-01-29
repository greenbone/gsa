/* Copyright (C) 2016-2021 Greenbone Networks GmbH
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

import styled from 'styled-components';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import FirstIcon from 'web/components/icon/firsticon';
import LastIcon from 'web/components/icon/lasticon';
import NextIcon from 'web/components/icon/nexticon';
import PreviousIcon from 'web/components/icon/previousicon';

import Layout from 'web/components/layout/layout';
import IconDivider from 'web/components/layout/icondivider';

import PropTypes from 'web/utils/proptypes';

const PaginationText = styled.span`
  margin: 0 3px;
`;

const PaginationLayout = styled(Layout)`
  margin: 2px 3px;

  @media print {
    svg {
      display: none;
    }
  }
`;

const Pagination = ({
  counts,
  onFirstClick,
  onLastClick,
  onNextClick,
  onPreviousClick,
}) => {
  if (!isDefined(counts)) {
    return null;
  }

  return (
    <PaginationLayout flex align={['end', 'center']}>
      <IconDivider>
        <FirstIcon
          disabled={!counts.hasPrevious()}
          title={_('First')}
          onClick={onFirstClick}
        />
        <PreviousIcon
          disabled={!counts.hasPrevious()}
          title={_('Previous')}
          onClick={onPreviousClick}
        />
      </IconDivider>
      <PaginationText>
        {_('{{first}} - {{last}} of {{filtered}}', counts)}
      </PaginationText>
      <IconDivider>
        <NextIcon
          disabled={!counts.hasNext()}
          title={_('Next')}
          onClick={onNextClick}
        />
        <LastIcon
          disabled={!counts.hasNext()}
          title={_('Last')}
          onClick={onLastClick}
        />
      </IconDivider>
    </PaginationLayout>
  );
};

Pagination.propTypes = {
  counts: PropTypes.object,
  onFirstClick: PropTypes.func,
  onLastClick: PropTypes.func,
  onNextClick: PropTypes.func,
  onPreviousClick: PropTypes.func,
};

export default Pagination;

// vim: set ts=2 sw=2 tw=80:
