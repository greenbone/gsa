/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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
import logger from 'gmp/log.js';

import {first, is_defined} from 'gmp/utils.js';

import {RESULTS_FILTER_FILTER} from 'gmp/models/filter.js';

import PropTypes from '../../utils/proptypes.js';

import NoticeDialog from '../../components/dialog/noticedialog.js';

import withDownload from '../../components/form/withDownload.js';

import Wrapper from '../../components/layout/wrapper.js';

import Page from './detailscontent.js';
import FilterDialog from './detailsfilterdialog.js';

const log = logger.getLogger('web.pages.report.details');

class ReportDetails extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {
      activeTab: 1,
      filters: [],
    };

    this.handleActivateTab = this.handleActivateTab.bind(this);
    this.handleAddToAssets = this.handleAddToAssets.bind(this);
    this.handleChanged = this.handleChanged.bind(this);
    this.handleError = this.handleError.bind(this);
    this.handleFilterAddLogLevel = this.handleFilterAddLogLevel.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleFilterDecreaseMinQoD =
      this.handleFilterDecreaseMinQoD.bind(this);
    this.handleFilterCreated = this.handleFilterCreated.bind(this);
    this.handleFilterEditClick = this.handleFilterEditClick.bind(this);
    this.handleFilterRemoveSeverity =
      this.handleFilterRemoveSeverity.bind(this);
    this.handleFilterResetClick = this.handleFilterResetClick.bind(this);
    this.handleRemoveFromAssets = this.handleRemoveFromAssets.bind(this);
    this.handleReportDownload = this.handleReportDownload.bind(this);
    this.handleReportFormatChange = this.handleReportFormatChange.bind(this);
    this.handleTimer = this.handleTimer.bind(this);
  }

  componentDidMount() {
    const {id} = this.props.params;
    const {filter} = this.props.location.query;

    this.load(id, filter);
    this.loadFilters();
    this.loadReportFormats();
  }

  componentWillUnmount() {
    this.clearTimer();
  }

  componentWillReceiveProps(next) {
    const {id: old_id} = this.props.params;
    const {id: next_id} = next.params;

    let next_filter;
    let old_filter;

    if (is_defined(next.location) && is_defined(next.location.query)) {
      next_filter = next.location.query.filter;
    }

    if (is_defined(this.props.location) &&
      is_defined(this.props.location.query)) {
      old_filter = this.props.location.query.filter;
    }

    if (old_id !== next_id || old_filter !== next_filter) {
      this.load(next_filter, next_filter);
    }
  }

  load(id, filter) {
    log.debug('Loading report', id);
    const {gmp} = this.context;

    return gmp.report.get({id}, {
      filter,
      extra_params: {
        ignore_pagination: '1',
      },
    }).then(response => {

      const {data: entity, meta} = response;
      const {report} = entity;
      const {filter: loaded_filter} = report;

      if (is_defined(filter)) {
        filter = filter.mergeExtraKeywords(loaded_filter);
      }
      else {
        filter = loaded_filter;
      }

      log.debug('Loaded report', entity);

      this.setState({
        entity,
        filter,
        id,
        loading: false,
      });

      if (meta.fromcache && meta.dirty) {
        log.debug('Forcing reload of report', meta.dirty);
        this.startTimer(1);
      }
      else {
        this.startTimer();
      }
    })
    .catch(err => {
      const rej = this.handleError(err);
      this.setState({entity: undefined});
      return rej;
    });
  }

  loadReportFormats() {
    const {gmp} = this.context;

    gmp.reportformats.getAll().then(report_formats => {
      report_formats = report_formats.filter(format => {
        return format.isActive() &&
          (format.isTrusted() || format.isPredefined());
      });
      const report_format_id = first(report_formats).id;
      this.setState({
        report_formats,
        report_format_id,
      });
    });
  }

  loadFilters() {
    const {gmp} = this.context;

    gmp.filters.getAll({filter: RESULTS_FILTER_FILTER}).then(filters => {
      this.setState({filters});
    });
  }

  reload() {
    const {id, filter} = this.state;
    this.load(id, filter);
  }

  startTimer(refresh) {
    const {gmp} = this.context;

    refresh = is_defined(refresh) ? refresh : gmp.autorefresh;

    if (refresh && refresh >= 0) {
      this.timer = window.setTimeout(this.handleTimer, refresh * 1000);
      log.debug('Started reload timer with id', this.timer, 'and interval',
        refresh);
    }
  }

  clearTimer() {
    if (is_defined(this.timer)) {
      log.debug('Clearing reload timer with id', this.timer);
      window.clearTimeout(this.timer);
    }
  }

  handleTimer() {
    log.debug('Timer', this.timer, 'finished. Reloading data.');

    this.timer = undefined;
    this.reload();
  }

  handleChanged() {
    this.reload();
  }

  handleError(error) {
    log.error(error);
    this.handleShowError(error.message);
    return Promise.reject(error);
  }

  handleShowError(message) {
    this.notice_dialog.show({
      message,
    }, {
      title: _('Error'),
    });
  }

  handleShowSuccess(message) {
    this.notice_dialog.show({
      message,
    }, {
      title: _('Success'),
    });
  }

  handleFilterChange(filter) {
    const {id} = this.state;
    this.load(id, filter);
  }

  handleFilterResetClick(filter) {
    this.handleFilterChange();
  }

  handleActivateTab(index) {
    this.setState({activeTab: index});
  }

  handleReportFormatChange(value) {
    this.setState({report_format_id: value});
  }

  handleAddToAssets() {
    const {gmp} = this.context;
    const {entity, filter} = this.state;

    gmp.report.addAssets(entity, {filter}).then(response => {
      this.handleShowSuccess(
        _('Report content added to Assets with QoD>=70% and Overrides enabled.')
      );
    }, this.handleError);
  }

  handleRemoveFromAssets() {
    const {gmp} = this.context;
    const {entity, filter} = this.state;

    gmp.report.removeAssets(entity, {filter}).then(response => {
      this.handleShowSuccess(
        _('Report content removed from Assets.')
      );
    }, this.handleError);
  }

  handleFilterEditClick() {
    if (this.filter_dialog) {
      this.filter_dialog.show();
    }
  }

  handleReportDownload() {
    const {gmp} = this.context;
    const {onDownload} = this.props;
    const {
      entity,
      filter,
      report_format_id,
      report_formats,
    } = this.state;

    const report_format = report_formats.find(
      format => report_format_id === format.id);

    const extension = is_defined(report_format) ? report_format.extension :
      'unknown'; // unknown should never happen but we should be save here

    gmp.report.download(entity, {
      report_format_id,
      filter,
    }).then(response => {
      const {data} = response;
      const filename = 'report-' + entity.id + '.' + extension;
      onDownload({filename, data});
    }, this.handleError);
  }

  handleFilterCreated(filter) {
    const {id} = this.state;

    this.load(id, filter);
    this.loadFilters();
  }

  handleFilterAddLogLevel() {
    const {id, filter} = this.state;
    let levels = filter.get('levels', '');

    if (!levels.includes('g')) {
      levels += 'g';
      const lfilter = filter.copy();
      lfilter.set('levels', levels);
      this.load(id, lfilter);
    }
  }

  handleFilterRemoveSeverity() {
    const {id, filter} = this.state;

    if (filter.has('severity')) {
      const lfilter = filter.copy();
      lfilter.delete('severity');
      this.load(id, lfilter);
    }
  }

  handleFilterDecreaseMinQoD() {
    const {id, filter} = this.state;

    if (filter.has('min_qod')) {
      const lfilter = filter.copy();
      lfilter.set('min_qod', 30);
      this.load(id, lfilter);
    }
  }

  render() {
    const {...props} = this.props;
    const {filter} = this.state;
    return (
      <Wrapper>
        <Page
          {...props}
          {...this.state}
          onActivateTab={this.handleActivateTab}
          onAddToAssetsClick={this.handleAddToAssets}
          onError={this.handleError}
          onFilterAddLogLevelClick={this.handleFilterAddLogLevel}
          onFilterDecreaseMinQoDClick={this.handleFilterDecreaseMinQoD}
          onFilterChanged={this.handleFilterChange}
          onFilterCreated={this.handleFilterCreated}
          onFilterEditClick={this.handleFilterEditClick}
          onFilterRemoveSeverityClick={this.handleFilterRemoveSeverity}
          onFilterResetClick={this.handleFilterResetClick}
          onRemoveFromAssetsClick={this.handleRemoveFromAssets}
          onReportDownloadClick={this.handleReportDownload}
          onReportFormatChange={this.handleReportFormatChange}
          onTagSuccess={this.handleChanged}
        />
        <NoticeDialog
          width="400px"
          ref={ref => this.notice_dialog = ref}
        />
        <FilterDialog
          filter={filter}
          ref={ref => this.filter_dialog = ref}
          onFilterChanged={this.handleFilterChange}
        />
      </Wrapper>
    );
  }
}

ReportDetails.contextTypes = {
  gmp: PropTypes.gmp.isRequired,
};

ReportDetails.propTypes = {
  onDownload: PropTypes.func.isRequired,
};

export default withDownload(ReportDetails);

// vim: set ts=2 sw=2 tw=80:
