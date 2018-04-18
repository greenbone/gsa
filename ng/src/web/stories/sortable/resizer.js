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

import {Div} from 'glamorous';

import {storiesOf} from '@storybook/react';

import Resizer from 'web/components/sortable/resizer';

class ResizeContainer extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {
      height: '100px',
    };

    this.handleResize = this.handleResize.bind(this);
  }

  handleResize(diffY) {
    const box = this.div.getBoundingClientRect();
    const height = box.height + diffY;

    if (height > 20) {
      this.setState({height});
    }
  }

  render() {
    const {height} = this.state;
    return (
      <div>
        <Div
          display="flex"
          width="400px"
          backgroundColor="blue"
          height={height}
          innerRef={ref => this.div = ref}
        />
        <Resizer
          onResize={this.handleResize}
        />
      </div>
    );
  }
}

storiesOf('Sortable/Resizer', module)
  .add('default', () => (
    <ResizeContainer />
  ));
// vim: set ts=2 sw=2 tw=80: