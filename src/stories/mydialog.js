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

/* eslint-disable react/prop-types */
import React from 'react';
import {storiesOf} from '@storybook/react';

import Dialog from 'web/components/dialog/dialog';
import DialogContent from 'web/components/dialog/content';
import ScrollableContent from 'web/components/dialog/scrollablecontent';
import DialogTitle from 'web/components/dialog/title';
import DialogButton from 'web/components/dialog/button';

import Button from '../web/components/form/button';
import styled from 'styled-components';

const StyledDiv = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 10px 20px 10px 20px;
  flex-grow;
`;

const RightDiv = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100px;
  margin-top: 15px;
  padding: 10px 20px 10px 20px;
  flex-shrink;
`;

const LeftDiv = styled.div`
  display: flex;
  justify-content: center;
  margin: auto;
  flex-shrink;
  width: 300px;
`;

const ButtonDiv = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px 20px 10px 20px;
  flex-shrink;
`;

const DEFAULT_DIALOG_WIDTH = '400px';

class MyDialogContent extends React.Component {
  constructor(...args) {
    super(...args);

    this.handleResume = this.handleResume.bind(this);
  }

  handleResume() {
    const {onResumeClick} = this.props;

    if (onResumeClick) {
      onResumeClick();
    }
  }

  render() {
    return (
      <DialogContent onResumeClick={this.props.onResumeClick}>
        <DialogTitle title={this.props.title} onCloseClick={this.props.close} />
        <ScrollableContent>
          <StyledDiv>
            <LeftDiv>{this.props.text}</LeftDiv>
            <RightDiv>
              <ButtonDiv>
                <DialogButton title="Yes" onClick={this.handleResume} />
              </ButtonDiv>
              <ButtonDiv>
                <DialogButton title="No" onClick={this.props.close} />
              </ButtonDiv>
            </RightDiv>
          </StyledDiv>
        </ScrollableContent>
      </DialogContent>
    );
  }
}

const MyDialog = ({
  width = DEFAULT_DIALOG_WIDTH,
  text,
  title,
  onClose,
  onResumeClick,
}) => {
  return (
    <Dialog width={width} onClose={onClose} resizable={false}>
      {({close, moveProps}) => (
        <MyDialogContent
          close={close}
          moveprops={moveProps}
          text={text}
          title={title}
          onResumeClick={onResumeClick}
        />
      )}
    </Dialog>
  );
};

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
    return (
      <div>
        <Button title={this.state.title} onClick={this.handleClick} />
        <h3>{this.state.notification}</h3>
        {this.state.dialog && (
          <MyDialog
            title="Light Switch Alarm"
            onResumeClick={this.handleResumeClick}
            onClose={this.handleClose}
            text={
              this.state.notification === 'Light on'
                ? 'Are you sure you want to turn on the light?'
                : 'Are you sure you want to turn off the light?'
            }
          />
        )}
      </div>
    );
  }
}

storiesOf('MyDialog', module).add('default', () => <TestButton />);
