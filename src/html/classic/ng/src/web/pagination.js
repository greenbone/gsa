/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 Greenbone Networks GmbH
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

import _ from '../locale.js';
import {is_defined} from '../utils.js';

import Icon from './icon.js';
import Layout from './layout.js';

import './css/pagination.css';

export const Pagination = props => {
  let {counts} = props;

  if (!is_defined(counts)) {
    return null;
  }

  return (
    <Layout flex align={['end', 'center']} className="pagination">
      {counts.hasPrevious() ?
        <span className="pagination-left">
          <Icon img="first.svg" title={_('First')}
            onClick={props.onFirstClick}/>
          <Icon img="previous.svg" title={_('Previous')}
            onClick={props.onPreviousClick}/>
        </span> :
          <span className="pagination-left">
            <Icon img="first_inactive.svg" title={_('First')}/>
            <Icon img="previous_inactive.svg" title={_('Previous')}/>
          </span>
      }
      <span className="pagination-text">
        {_('{{first}} - {{last}} of {{filtered}}', counts)}
      </span>
      {counts.hasNext() ?
        <span className="pagination-right">
          <Icon img="next.svg" title={_('Next')}
            onClick={props.onNextClick}/>
          <Icon img="last.svg" title={_('Last')}
            onClick={props.onLastClick}/>
        </span> :
          <span className="pagination-right">
            <Icon img="next_inactive.svg" title={_('Next')}/>
            <Icon img="last_inactive.svg" title={_('Last')}/>
          </span>
      }
    </Layout>
  );
};

Pagination.propTypes = {
  counts: React.PropTypes.object,
  onFirstClick: React.PropTypes.func,
  onLastClick: React.PropTypes.func,
  onPreviousClick: React.PropTypes.func,
  onNextClick: React.PropTypes.func,
};

export default Pagination;

// vim: set ts=2 sw=2 tw=80:
