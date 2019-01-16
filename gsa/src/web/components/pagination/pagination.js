/* Copyright (C) 2016-2019 Greenbone Networks GmbH
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

import styled from 'styled-components';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import Icon from 'web/components/icon/icon';

import Layout from 'web/components/layout/layout';
import IconDivider from 'web/components/layout/icondivider';

const PaginationText = styled.span`
  margin: 0 3px;
`;

const PaginationLayout = styled(Layout)`
  margin: 2px 3px;
`;

const NavigationIcon = styled(Icon)`
  @media print {
    display: none;
  };
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
    <PaginationLayout
      flex
      align={['end', 'center']}
    >
      <IconDivider>
        <NavigationIcon
          active={counts.hasPrevious()}
          img="first.svg"
          title={_('First')}
          onClick={onFirstClick}
        />
        <NavigationIcon
          active={counts.hasPrevious()}
          img="previous.svg"
          title={_('Previous')}
          onClick={onPreviousClick}
        />
      </IconDivider>
      <PaginationText>
        {_('{{first}} - {{last}} of {{filtered}}', counts)}
      </PaginationText>
      <IconDivider>
        <NavigationIcon
          active={counts.hasNext()}
          img="next.svg"
          title={_('Next')}
          onClick={onNextClick}
        />
        <NavigationIcon
          active={counts.hasNext()}
          img="last.svg"
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
