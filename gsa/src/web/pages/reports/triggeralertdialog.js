/* Copyright (C) 2018 Greenbone Networks GmbH
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
import {connect} from 'react-redux';

import styled from 'styled-components';

import _ from 'gmp/locale';

import {ALL_FILTER} from 'gmp/models/filter';

import {NO_VALUE, YES_VALUE} from 'gmp/parser';

import {first} from 'gmp/utils/array';
import compose from 'web/utils/compose';
import {isDefined, isString} from 'gmp/utils/identity';
import PropTypes from 'web/utils/proptypes';
import {renderSelectItems} from 'web/utils/render';
import withGmp from 'web/utils/withGmp';

import ComposerContent, {COMPOSER_CONTENT_DEFAULTS} from 'web/components/dialog/composercontent'; /* eslint-disable-line max-len */
import SaveDialog from 'web/components/dialog/savedialog';

import CheckBox from 'web/components/form/checkbox';
import FormGroup from 'web/components/form/formgroup';
import Select from 'web/components/form/select';

import NewIcon from 'web/components/icon/newicon';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

import {
  loadEntities as loadAlerts,
  selector as alertsSelector,
} from 'web/store/entities/alerts';

const StyledDiv = styled.div`
  text-align: end;
`;

class TriggerAlertDialog extends React.Component {

  constructor(...props) {
    super(...props);

    this.state = {alerts: []};
  }

  componentDidMount() {
    this.props.loadAlerts().then(response => {
      const {alertId, alerts} = this.props;
      const setAlertId = isDefined(alertId) ? alertId : first(alerts).id;
      this.setState({
        alerts,
        alertId: setAlertId,
      });
    });
  };

  render() {
    const {
      alerts,
      applyOverrides = COMPOSER_CONTENT_DEFAULTS.applyOverrides,
      filter = {},
      includeNotes = COMPOSER_CONTENT_DEFAULTS.includeNotes,
      includeOverrides = COMPOSER_CONTENT_DEFAULTS.includeOverrides,
      storeAsDefault,
      onAlertChange,
      onClose,
      onNewAlertClick,
      onSave,
    } = this.props;

    let {alertId} = this.props;
    if (!isDefined(alertId)) {
      alertId = this.state.alertId;
    }

    const filterString = isString(filter) ?
      filter : filter.toFilterCriteriaString();

    const unControlledValues = {
      alertId,
      applyOverrides,
      includeNotes,
      includeOverrides,
      storeAsDefault,
    };

    const controlledValues = {
      alertId,
    };

    return (
      <SaveDialog
        buttonTitle={_('OK')}
        title={_('Trigger Alert for Scan Report')}
        defaultValues={unControlledValues}
        values={controlledValues}
        onClose={onClose}
        onSave={onSave}
      >
        {({
          values,
          onValueChange,
        }) => (
          <Layout flex="column">
            <ComposerContent
              applyOverrides={values.applyOverrides}
              filterString={filterString}
              includeNotes={values.includeNotes}
              includeOverrides={values.includeOverrides}
              onValueChange={onValueChange}
            />
            <FormGroup title={_('Select Alert')} titleSize="3">
              <Divider>
                <Select
                  name="alertId"
                  value={values.alertId}
                  items={renderSelectItems(alerts)}
                  onChange={onAlertChange}
                />
                <NewIcon
                  onClick={onNewAlertClick}
                />
              </Divider>
            </FormGroup>
            <StyledDiv>
              <CheckBox
                name="storeAsDefault"
                checked={storeAsDefault}
                checkedValue={YES_VALUE}
                unCheckedValue={NO_VALUE}
                title={_('Store as default')}
                onChange={onValueChange}
              />
            </StyledDiv>
          </Layout>
        )}
      </SaveDialog>
    );
  };
};

TriggerAlertDialog.propTypes = {
  alertId: PropTypes.id,
  alerts: PropTypes.array,
  applyOverrides: PropTypes.numberOrNumberString,
  filter: PropTypes.filter.isRequired,
  includeNotes: PropTypes.number,
  includeOverrides: PropTypes.number,
  loadAlerts: PropTypes.func.isRequired,
  storeAsDefault: PropTypes.bool,
  onAlertChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onNewAlertClick: PropTypes.func,
  onSave: PropTypes.func.isRequired,
  onValueChange: PropTypes.func.isRequired,
};

const mapStateToProps = rootState => {
  const alertsSel = alertsSelector(rootState);
  return {
    alerts: alertsSel.getEntities(ALL_FILTER),
  };
};

const mapDispatchToProps = (dispatch, {gmp}) => ({
  loadAlerts: () => dispatch(loadAlerts(gmp)(ALL_FILTER)),
});

export default compose(
  withGmp,
  connect(mapStateToProps, mapDispatchToProps),
)(TriggerAlertDialog);

// vim: set ts=2 sw=2 tw=80:
