/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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

import glamorous from 'glamorous';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from '../../utils/proptypes.js';

import Icon from '../icon/icon.js';

import Layout from '../layout/layout.js';
import IconDivider from '../layout/icondivider.js';

const PaginationText = glamorous.span({
  margin: '0 3px',
});

const PaginationLayout = glamorous(Layout)(
  'pagination',
  {
    margin: '2px 3px',
  }
);

const NavigationIcon = glamorous(Icon)({
  '@media print': {
    display: 'none',
  },
});

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
      {counts.hasPrevious() ?
        <IconDivider>
          <NavigationIcon
            img="first.svg"
            title={_('First')}
            onClick={onFirstClick}
          />
          <NavigationIcon
            img="previous.svg"
            title={_('Previous')}
            onClick={onPreviousClick}
          />
        </IconDivider> :
        <IconDivider>
          <NavigationIcon img="first_inactive.svg" title={_('First')}/>
          <NavigationIcon img="previous_inactive.svg" title={_('Previous')}/>
        </IconDivider>
      }
      <PaginationText>
        {_('{{first}} - {{last}} of {{filtered}}', counts)}
      </PaginationText>
      {counts.hasNext() ?
        <IconDivider>
          <NavigationIcon
            img="next.svg"
            title={_('Next')}
            onClick={onNextClick}
          />
          <NavigationIcon
            img="last.svg"
            title={_('Last')}
            onClick={onLastClick}
          />
        </IconDivider> :
        <IconDivider>
          <NavigationIcon img="next_inactive.svg" title={_('Next')}/>
          <NavigationIcon img="last_inactive.svg" title={_('Last')}/>
        </IconDivider>
      }
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
