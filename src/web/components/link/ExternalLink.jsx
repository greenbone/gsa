/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import React from 'react';
import PropTypes from 'web/utils/PropTypes';

import {withTextOnly} from './Link';
import ConfirmationDialog from '../dialog/ConfirmationDialog';

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
            content={dialogtext}
            rightButtonTitle={_('Follow Link')}
            title={dialogtitle}
            to={to}
            width="500px"
            onClose={this.handleCloseDialog}
            onResumeClick={this.handleOpenLink}
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
