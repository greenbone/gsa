/* Copyright (C) 2019-2020 Greenbone Networks GmbH
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
import {storiesOf} from '@storybook/react';

import styled from 'styled-components';

import SnackbarCreator from '../web/components/snackbar/snackbar';
import Button from '../web/components/form/button';
import Theme from 'web/utils/theme';

const BackgroundElement = styled.div`
  position: fixed;
  bottom: 0;
  right: 0;
  left: 0;
  height: 100px;
  margin: 5px 50px;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  background-color: ${Theme.green};
`;

class DeleteButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      message: undefined,
    };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(value, name) {
    this.setState({
      message: {text: name},
    });
  }

  render() {
    return (
      <div>
        <Button name="Delete" title="Delete" onClick={this.handleClick} />
        <SnackbarCreator message={this.state.message} />
      </div>
    );
  }
}

class TestButtons extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      message: undefined,
    };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(value, name) {
    this.setState({
      message: {text: name},
    });
  }

  render() {
    return (
      <div>
        <Button name="Delete" title="Delete" onClick={this.handleClick} />
        <Button name="Trashcan" title="Trashcan" onClick={this.handleClick} />
        <Button name="Clone" title="Clone" onClick={this.handleClick} />

        <SnackbarCreator message={this.state.message} />
      </div>
    );
  }
}

storiesOf('Snackbar', module)
  .add('with button', () => <DeleteButton />)
  .add('with multiple buttons', () => <TestButtons />)
  .add('with background element', () => (
    <span>
      <BackgroundElement>
        <Button title="Test" />
      </BackgroundElement>
      <DeleteButton />
    </span>
  ));
