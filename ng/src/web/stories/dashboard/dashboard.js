/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
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

import {Provider, connect} from 'react-redux';

import {storiesOf} from '@storybook/react';

import configureStore from 'web/store';

import Dashboard from 'web/components/dashboard2/dashboard';
import Display, {
  DISPLAY_HEADER_HEIGHT,
} from 'web/components/dashboard2/display';
import * as fromDashboardData from 'web/components/dashboard2/data/selectors';
import loader from 'web/components/dashboard2/data/loader';

import compose from '../../utils/compose';
import withGmp from '../../utils/withGmp';
import {withComponentDefaults} from '../../utils/withComponentDefaults';

import LineChart from '../../components/chart/line';
import Loading from '../../components/loading/loading';

let Chart = ({
  isLoading,
  data,
  height,
  width,
  id,
  onRemoveClick,
}) => (
  <Display
    title={isLoading ? 'Loading' : 'Fake Data (' + id + ')'}
    onRemoveClick={onRemoveClick}
  >
    {isLoading ?
      <Loading/> :
      <LineChart
        width={width}
        height={height - DISPLAY_HEADER_HEIGHT}
        data={data}
        yAxisLabel="Tomatoes"
        y2AxisLabel="Apples"
        lineData={{
          y: [{
            color: 'red',
            label: 'Tomatoes',
          }, {
            color: 'yellow',
            label: 'Bananas',
          }, {
            color: 'silver',
            label: 'Pears',
            dashArray: '3,5',
          }],
          y2: [{
            color: 'green',
            label: 'Apples',
            dashArray: '3,1',
          }],
        }}
      />
    }

  </Display>
);

const mapStateToProps = (rootState, {dataId}) => {
  const state = fromDashboardData.getDashboardDataById(rootState, dataId);
  return {
    data: fromDashboardData.getData(state),
    isLoading: fromDashboardData.getIsLoading(state),
  };
};

Chart = compose(
  withComponentDefaults({
    dataId: 'test-data',
  }),
  withGmp,
  connect(
    mapStateToProps,
  ),
)(Chart);

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const data = [{
  label: 'Foo',
  x: 1,
  y: [3, 5, 1],
  y2: [5],
}, {
  label: 'Ipsum',
  x: 2,
  y: [2, 5, 4],
  y2: [4],
}, {
  label: 'Bar',
  x: 2.4,
  y: [1, 2, 5],
  y2: [4],
}, {
  label: 'Lorem',
  x: 3,
  y: [5, 1, 7],
  y2: [7],
},
];

const fakeLoader = loader('test-data', () => delay(500).then(() => data));

storiesOf('Dashboard/Dashboard2', module)
  .add('default', () => {
    return (
      <Provider store={configureStore()}>
        <Dashboard
          loaders={[
            fakeLoader,
          ]}
          components={{
            'fake-chart-1': Chart,
          }}
          defaultContent={[
            [
              'fake-chart-1',
              'fake-chart-1',
            ],
            [
              'fake-chart-1',
            ],
          ]}
        />
      </Provider>
    );
  });

// vim: set ts=2 sw=2 tw=80:
