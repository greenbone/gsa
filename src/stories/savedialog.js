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
import SaveDialog from '../web/components/dialog/savedialog';
import Button from '../web/components/form/button';
import TextField from '../web/components/form/textfield';

class SaveButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: 'Save',
      dialog: false,
      error: '',
      result: '',
      input: '',
      dialogValue: '',
    };
    this.handleClick = this.handleClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleError = this.handleError.bind(this);
    this.handleErrorClose = this.handleErrorClose.bind(this);
  }

  handleClick(value, name) {
    this.setState({
      dialog: true,
    });
  }

  handleChange(value, name) {
    this.setState({
      input: value,
    });
  }

  handleSave(data) {
    if (data.input === '') {
      this.setState({
        error: 'Error! No Input!',
      });
    } else {
      this.setState({
        dialog: false,
        result: data.input,
        input: '',
      });
    }
  }

  handleClose(value, name) {
    this.setState({
      dialog: false,
      error: '',
    });
  }

  handleError(value, name) {
    this.setState({
      dialog: false,
    });
  }

  handleErrorClose(value, name) {
    this.setState({
      error: '',
    });
  }

  render() {
    return (
      <div>
        <TextField value={this.state.input} onChange={this.handleChange} />
        <Button title={this.state.title} onClick={this.handleClick} />
        <p>{this.state.result}</p>
        {this.state.dialog && (
          <SaveDialog
            values={{input: this.state.input}}
            defaultValues={{input: this.state.input, input2: 'foo'}}
            error={this.state.error}
            minHeight="100px"
            minWidth="400px"
            title="Save"
            width="400px"
            onSave={this.handleSave}
            onClose={this.handleClose}
            onError={this.handleError}
            onErrorClose={this.handleErrorClose}
          >
            {({values, onValueChange}) => {
              return (
                <div>
                  Do you want to save the changes?
                  <TextField
                    value={values.input}
                    onChange={this.handleChange}
                  />
                </div>
              );
            }}
          </SaveDialog>
        )}
      </div>
    );
  }
}

storiesOf('SaveDialog', module).add('default', () => <SaveButton />);
