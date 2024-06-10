/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {connect} from 'react-redux';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import EntityComponent from 'web/entity/component';

import {getTimezone} from 'web/store/usersettings/selectors';

import PropTypes from 'web/utils/proptypes';

import ScheduleDialog from './dialog';

class ScheduleComponent extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {dialogVisible: false};

    this.handleCloseScheduleDialog = this.handleCloseScheduleDialog.bind(this);
    this.openScheduleDialog = this.openScheduleDialog.bind(this);
  }

  openScheduleDialog(schedule) {
    const {timezone} = this.props;

    if (isDefined(schedule)) {
      const {event} = schedule;
      const {startDate, recurrence = {}, duration, durationInSeconds} = event;

      const {interval, freq, monthdays, weekdays} = recurrence;

      this.setState({
        comment: schedule.comment,
        startDate,
        dialogVisible: true,
        duration: durationInSeconds > 0 ? duration : undefined,
        freq,
        id: schedule.id,
        interval,
        monthdays,
        name: schedule.name,
        title: _('Edit Schedule {{name}}', {name: schedule.name}),
        timezone: schedule.timezone,
        weekdays,
      });
    } else {
      this.setState({
        comment: undefined,
        dialogVisible: true,
        duration: undefined,
        freq: undefined,
        id: undefined,
        interval: undefined,
        monthdays: undefined,
        name: undefined,
        startDate: undefined,
        timezone,
        title: undefined,
        weekdays: undefined,
      });
    }

    this.handleInteraction();
  }

  closeScheduleDialog() {
    this.setState({dialogVisible: false});
  }

  handleCloseScheduleDialog() {
    this.closeScheduleDialog();
    this.handleInteraction();
  }

  handleInteraction() {
    const {onInteraction} = this.props;
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  }

  render() {
    const {
      children,
      onCloned,
      onCloneError,
      onCreated,
      onCreateError,
      onDeleted,
      onDeleteError,
      onDownloaded,
      onDownloadError,
      onInteraction,
      onSaved,
      onSaveError,
    } = this.props;

    const {dialogVisible, ...dialogProps} = this.state;

    return (
      <EntityComponent
        name="schedule"
        onCreated={onCreated}
        onCreateError={onCreateError}
        onCloned={onCloned}
        onCloneError={onCloneError}
        onDeleted={onDeleted}
        onDeleteError={onDeleteError}
        onDownloaded={onDownloaded}
        onDownloadError={onDownloadError}
        onInteraction={onInteraction}
        onSaved={onSaved}
        onSaveError={onSaveError}
      >
        {({save, ...other}) => (
          <React.Fragment>
            {children({
              ...other,
              create: this.openScheduleDialog,
              edit: this.openScheduleDialog,
            })}
            {dialogVisible && (
              <ScheduleDialog
                {...dialogProps}
                onClose={this.handleCloseScheduleDialog}
                onSave={d => {
                  this.handleInteraction();
                  return save(d).then(() => this.closeScheduleDialog());
                }}
              />
            )}
          </React.Fragment>
        )}
      </EntityComponent>
    );
  }
}

ScheduleComponent.propTypes = {
  children: PropTypes.func.isRequired,
  timezone: PropTypes.string.isRequired,
  onCloneError: PropTypes.func,
  onCloned: PropTypes.func,
  onCreateError: PropTypes.func,
  onCreated: PropTypes.func,
  onDeleteError: PropTypes.func,
  onDeleted: PropTypes.func,
  onDownloadError: PropTypes.func,
  onDownloaded: PropTypes.func,
  onInteraction: PropTypes.func.isRequired,
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
};

export default connect(rootState => ({
  timezone: getTimezone(rootState),
}))(ScheduleComponent);

// vim: set ts=2 sw=2 tw=80:
