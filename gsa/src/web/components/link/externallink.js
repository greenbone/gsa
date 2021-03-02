/* Copyright (C) 2017-2021 Greenbone Networks GmbH
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

import _ from 'gmp/locale';

import ConfirmationDialog from 'web/components/dialog/confirmationdialog';

import PropTypes from 'web/utils/proptypes';

import {withTextOnly} from './link';

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
    this.handleCloseDialog();
  }

  render() {
    const {dialogvisible} = this.state;

    const {children, to, ...props} = this.props;

    const dialogtitle = _('You are leaving GSA');
    const dialogtext = _(
      'This dialog will open a new window for {{- to}} ' +
        'if you click on "follow link". Following this link is on your own ' +
        'responsibility. Greenbone does not endorse the content you will ' +
        'see there.',
      {to},
    );
    return (
      <React.Fragment>
        <a {...props} href={to} onClick={this.handleClick}>
          {children}
        </a>
        {dialogvisible && (
          <ConfirmationDialog
            onClose={this.handleCloseDialog}
            onResumeClick={this.handleOpenLink}
            content={dialogtext}
            title={dialogtitle}
            rightButtonTitle={_('Follow Link')}
            to={to}
            width="500px"
          />
        )}
      </React.Fragment>
    );
  }
}

ExternalLink.propTypes = {
  to: PropTypes.string.isRequired,
};

export default withTextOnly(ExternalLink);

// vim: set ts=2 sw=2 tw=80:
