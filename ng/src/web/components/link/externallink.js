/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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

import _ from 'gmp/locale.js';

import LinkConfirmationDialog from '../dialog/linkconfirmationdialog.js';

import PropTypes from '../../utils/proptypes.js';

import {withTextOnly} from './link.js';

class ExternalLink extends React.Component {
  constructor() {
    super();

    this.state = {
      dialogvisible: false,
    };

    this.handleClick = this.handleClick.bind(this);
    this.handleCloseDialog = this.handleCloseDialog.bind(this);
    this.handleOpenLink = this.handleOpenLink.bind(this);
  }

  handleClick(event) {
    event.preventDefault();
    this.setState({
      dialogvisible: true,
    });
  }

  handleCloseDialog() {
    this.setState({
      dialogvisible: false,
    });
  }

  handleOpenLink() {
    const url = this.props.to;
    window.open(url, '_blank', 'noopener, scrollbars=1, resizable=1');
  }

  render() {
    const {
      dialogvisible,
    } = this.state;

    const {
      children,
      to,
      ...props
    } = this.props;

    const dialogtitle = _('You are leaving GSA');
    const dialogtext = _('This dialog will open a new window for {{- to}} ' +
      'if you click on "follow link". Following this link is on your own ' +
      'responsibility. Greenbone does not endorse the content you will ' +
      'see there.', {to});
    return (
      <span>
        <a
          {...props}
          href={to}
          onClick={this.handleClick}
        >
          {children}
        </a>
        <LinkConfirmationDialog
          visible={dialogvisible}
          onClose={this.handleCloseDialog}
          onResumeClick={this.handleOpenLink}
          text={dialogtext}
          title={dialogtitle}
          to={to}
          width="500px"
        />
      </span>
    );
  };
}

ExternalLink.propTypes = {
  to: PropTypes.string.isRequired,
};

export default withTextOnly(ExternalLink);

// vim: set ts=2 sw=2 tw=80:
