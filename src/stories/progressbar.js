/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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
import {storiesOf} from '@storybook/react';
import ProgressBar from '../web/components/bar/progressbar';

class DynamicBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      background: 'run',
      progress: 0,
      title: 'Example',
      children: 'Description',
      interval: 10,
    };
  }

  componentDidMount() {
    this.timerID = setInterval(() => this.periodicUpdate(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  periodicUpdate() {
    this.setState(state => ({
      progress: state.progress + state.interval,
    }));
  }

  render() {
    return (
      <div>
        <ProgressBar
          progress={this.state.progress}
          title={this.state.title}
          children={this.state.children}
          background={this.state.background}
        />
      </div>
    );
  }
}

storiesOf('ProgressBar', module)
  .add('default', () => <ProgressBar />)
  .add('warn', () => (
    <ProgressBar progress="50" background="warn" title="title" />
  ))
  .add('with desc', () => (
    <ProgressBar
      progress="50"
      background="warn"
      title="title"
      children="description"
    />
  ))
  .add('new', () => (
    <ProgressBar
      progress="70"
      background="new"
      title="title"
      children="description"
    />
  ))
  .add('dynamic', () => <DynamicBar />);
