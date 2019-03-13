/* Copyright (C) 2018 Greenbone Networks GmbH
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

import {withRouter} from 'react-router-dom';

import {_, _l} from 'gmp/locale/lang';

// import {TASKS_FILTER_FILTER} from 'gmp/models/filter';

import PropTypes from 'web/utils/proptypes';
import compose from 'web/utils/compose';

import BpmChart from 'web/components/chart/bpm';

import Display from 'web/components/dashboard/display/display';
// import createDisplay from 'web/components/dashboard/display/createDisplay';
import {registerDisplay} from 'web/components/dashboard/registry';

// import {TasksHighResultsLoader} from './loaders';

export class BpmDisplay extends React.Component {
  constructor(...args) {
    super(...args);

    this.handleDataClick = this.handleDataClick.bind(this);
  }

  handleDataClick(data) {
    const {history} = this.props;

    history.push(`/task/${data.id}`);
  }

  render() {
    const {filter, width = '100%', height, ...props} = this.props;
    return (
      // <TasksHighResultsLoader
      //   filter={filter}
      // >
      //   {loaderProps => (
      <Display
        {...props}
        // {...loaderProps}
        filter={filter}
        // dataTransform={transformHighResultsData}
        title={_('Business Process Resilience')}
        showToggleLegend={false}
      >
        {/* {({width, height, data: tdata, svgRef}) => ( */}
        <BpmChart
          width={width}
          height={height}
          // data={tdata}
          // svgRef={svgRef}
          // onDataClick={this.handleDataClick}
        />
        {/* )} */}
      </Display>
      //   )}
      // </TasksHighResultsLoader>
    );
  }
}

BpmDisplay.propTypes = {
  filter: PropTypes.filter,
  history: PropTypes.object.isRequired,
};

BpmDisplay = compose(withRouter)(BpmDisplay);

BpmDisplay.displayId = 'hosts-bpm';

registerDisplay(BpmDisplay.displayId, BpmDisplay, {
  title: _l('Chart: Business Process Resilience'),
});

// vim: set ts=2 sw=2 tw=80:
