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

import _ from '../../../locale.js';
import {is_defined} from '../../../utils.js';

import PropTypes from '../../utils/proptypes.js';

import Icon from '../icon/icon.js';

import Layout from '../layout/layout.js';
import IconDivider from '../layout/icondivider.js';

const PaginationText = glamorous.span({
  margin: '0 3px;'
});

const PaginationLayout = glamorous(Layout)(
  'pagination',
  {
    margin: '2px 3px',
  }
);

const Pagination = ({
    counts,
    onFirstClick,
    onLastClick,
    onNextClick,
    onPreviousClick,
  }) => {

  if (!is_defined(counts)) {
    return null;
  }

  return (
    <PaginationLayout
      flex
      align={['end', 'center']}>
      {counts.hasPrevious() ?
        <IconDivider>
          <Icon img="first.svg" title={_('First')}
            onClick={onFirstClick}/>
          <Icon img="previous.svg" title={_('Previous')}
            onClick={onPreviousClick}/>
        </IconDivider> :
        <IconDivider>
          <Icon img="first_inactive.svg" title={_('First')}/>
          <Icon img="previous_inactive.svg" title={_('Previous')}/>
        </IconDivider>
      }
      <PaginationText>
        {_('{{first}} - {{last}} of {{filtered}}', counts)}
      </PaginationText>
      {counts.hasNext() ?
        <IconDivider>
          <Icon img="next.svg" title={_('Next')}
            onClick={onNextClick}/>
          <Icon img="last.svg" title={_('Last')}
            onClick={onLastClick}/>
        </IconDivider> :
        <IconDivider>
          <Icon img="next_inactive.svg" title={_('Next')}/>
          <Icon img="last_inactive.svg" title={_('Last')}/>
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
