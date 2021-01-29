/* Copyright (C) 2016-2021 Greenbone Networks GmbH
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

import {connect} from 'react-redux';

import {onLanguageChange} from 'gmp/locale/lang';

import {isDefined} from 'gmp/utils/identity';

import {setLocale} from 'web/store/usersettings/actions';

import PropTypes from 'web/utils/proptypes';

class LocaleObserver extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {};

    this.handleLanguageChange = this.handleLanguageChange.bind(this);
  }

  componentDidMount() {
    this.unsubscribeFromLanguageChange = onLanguageChange(
      this.handleLanguageChange,
    );
  }

  componentWillUnmount() {
    if (isDefined(this.unsubscribeFromLanguageChange)) {
      this.unsubscribeFromLanguageChange();
    }
  }

  handleLanguageChange(locale) {
    this.props.setLocale(locale);

    this.setState({locale});
  }

  render() {
    const {children} = this.props;
    const {locale} = this.state;

    if (!isDefined(locale)) {
      // don't render if no locale has been detected yet
      return null;
    }

    return <React.Fragment key={locale}>{children}</React.Fragment>;
  }
}

LocaleObserver.propTypes = {
  setLocale: PropTypes.func.isRequired,
};

export default connect(undefined, {
  setLocale,
})(LocaleObserver);
