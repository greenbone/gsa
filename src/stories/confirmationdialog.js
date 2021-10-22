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
import Button from '../web/components/form/button';
import ConfirmationDialog from '../web/components/dialog/confirmationdialog';

class TestButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: 'Light Switch',
      notification: 'Light off',
      dialog: false,
    };
    this.handleClick = this.handleClick.bind(this);
    this.handleResumeClick = this.handleResumeClick.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  handleClick(value, name) {
    this.setState({
      dialog: true,
    });

    if (this.state.notification === 'Light off') {
      this.setState({
        notification: 'Light on',
      });
    } else {
      this.setState({
        notification: 'Light off',
      });
    }
  }

  handleResumeClick(value, name) {
    this.setState({
      dialog: false,
    });
  }

  handleClose(value, name) {
    this.setState({
      dialog: false,
    });
    if (this.state.notification === 'Light off') {
      this.setState({
        notification: 'Light on',
      });
    } else {
      this.setState({
        notification: 'Light off',
      });
    }
  }

  render() {
    let dialog;
    if (this.state.dialog && this.state.notification === 'Light on') {
      dialog = (
        <ConfirmationDialog
          content="The light will be switched on!"
          title="Light Switch Alarm"
          onResumeClick={this.handleResumeClick}
          onClose={this.handleClose}
        />
      );
    } else if (this.state.dialog && this.state.notification === 'Light off') {
      dialog = (
        <ConfirmationDialog
          content="The light will be switched off!"
          title="Light Switch Alarm"
          onResumeClick={this.handleResumeClick}
          onClose={this.handleClose}
        />
      );
    } else {
      dialog = '';
    }
    return (
      <div>
        <Button title={this.state.title} onClick={this.handleClick} />
        <h3>{this.state.notification}</h3>
        {dialog}
      </div>
    );
  }
}

storiesOf('ConfirmationDialog', module).add('default', () => <TestButton />);
