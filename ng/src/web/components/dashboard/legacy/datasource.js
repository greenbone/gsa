/* Greenbone Security Assistant
 *
 * Authors:
 * Timo Pollmeier <timo.pollmeier@greenbone.net>
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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
import d3 from 'd3';

import _ from 'gmp/locale.js';
import logger from 'gmp/log.js';
import {is_defined} from 'gmp/utils.js';
import {Cache} from 'gmp/cache.js';

import {xml2json} from 'gmp/http/transform/x2js.js';

import {filter_type_name, create_uri} from './helper.js';

import EventNode from './eventnode.js';

const LOGIN_PAGE = '/ng/login';

const log = logger.getLogger('web.dashboard.legacy.datasource');

class DataSource extends EventNode {

  constructor(name, token, options = {}) {
    super();

    if (!is_defined(token)) {
      throw new Error('Undefined token');
    }

    this.name = name;

    this.options = options;
    this.prefix = '/omp?';

    this.requesting_controllers = {};
    this.active_requests = {};
    this.column_info = {};
    this.data = {};

    this.params = {
      xml: 1,
    };

    this.token = is_defined(token) ? token : token;

    this.init();
  }

  /**
   * Initializes a data source.
   */
  init() {
    this.cache = is_defined(this.options.cache) ?
      this.options.cache : new Cache();

    if (is_defined(this.options.filter)) {
      this._setFilter(this.options.filter);
    }
    if (is_defined(this.options.filt_id)) {
      this.params.filt_id = this.options.filt_id;
    }
    if (this.options.type === 'task' || this.options.type === 'tasks') {
      this.command = 'get_tasks';
      this.filter_type = 'Task';
      this.params.ignore_pagination = 1;
      this.params.no_filter_history = 1;
      this.params.schedules_only = 1;
    }
    else if (this.options.type === 'host') {
      this.command = 'get_assets';
      this.filter_type = 'Asset';
      this.params.asset_type = 'host';
      this.params.no_filter_history = 1;
      this.params.ignore_pagination = 1;
    }
    else {
      this.command = 'get_aggregate';
      this.filter_type = filter_type_name(this.options.aggregate_type);
      this.params.aggregate_type = this.options.aggregate_type;
      this.params.data_column = is_defined(this.options.data_column) ?
        this.options.data_column : '';
      this.params.group_column = is_defined(this.options.group_column) ?
        this.options.group_column : '';
      this.params.subgroup_column =
        is_defined(this.options.subgroup_column) ?
          this.options.subgroup_column :
          '';
      if (this.options.data_columns) {
        this.params.data_columns = this.options.data_columns;
      }
      else {
        this.params.data_columns = [];
      }
      if (this.options.text_columns) {
        this.params.text_columns = this.options.text_columns;
      }
      else {
        this.params.text_columns = [];
      }
      if (this.options.sort_fields) {
        this.params.sort_fields = this.options.sort_fields;
      }
      else {
        this.params.sort_fields = [];
      }
      if (this.options.sort_orders) {
        this.params.sort_orders = this.options.sort_orders;
      }
      else {
        this.params.sort_orders = [];
      }
      if (this.options.sort_stats) {
        this.params.sort_stats = this.options.sort_stats;
      }
      else {
        this.params.sort_stats = [];
      }
      if (this.options.first_group) {
        this.params.first_group = this.options.first_group;
      }
      if (this.options.max_groups) {
        this.params.max_groups = this.options.max_groups;
      }
      if (this.options.aggregate_mode) {
        this.params.aggregate_mode = this.options.aggregate_mode;
      }
    }
  }

  setFilter(filter) {
    const cur_filter = this.getFilter();
    if (cur_filter !== filter) {
      this._setFilter(filter);
      this._trigger('changed');
    }
  }

  _setFilter(filter) {
    this.params.filter = filter;
  }

  getFilter() {
    return this.params.filter;
  }

  /**
   * Adds a request from a controller to a data source.
   *
   * @param {Controller} controller   The controller requesting the data.
   * @param {String}     filter       The requested filter.
   * @param {Object}     gen_params   Generator params for the request.
   * @param {Boolean}    force_reload Force to reload data
   *
   * @returns {DataSource} this datasource
   */
  addRequest(controller, filter, gen_params, force_reload) {
    const uri = create_uri(this.command, this.token, filter, this.params,
      this.prefix, false);

    if (!is_defined(this.requesting_controllers[uri])) {
      this.requesting_controllers[uri] = {};
    }

    this.requesting_controllers[uri][controller.id] = {
      active: true,
      controller: controller,
      filter: filter,
      gen_params: gen_params,
    };

    if (force_reload !== true) {
      const data = this.getData(uri);
      if (data) {
        this.dataLoaded(data, uri);
        return this;
      }
    }

    this.addNewXmlRequest(uri);
    return this;
  }

  /**
   * Removes a request of a controller from a data source.
   *
   * @param {Controller} controller The controller cancelling the request.
   * @param {String}     uri        URI of the request
   */
  removeRequest(controller, uri) {
    const controllers = this.requesting_controllers[uri];

    if (controllers && controllers[controller.id]) {
      delete controllers[controller.id];
      const requesting_count = Object.keys(controllers).length;
      if (requesting_count === 0) {
        if (this.active_requests[uri]) {
          this.active_requests[uri].abort();
          delete this.active_requests[uri];
          log.debug('Aborted request for ' + controller.id + ' and uri "' +
            uri + '"');
        }
      }
    }
  }

  addNewXmlRequest(uri) {
    if (this.active_requests[uri]) {
      // we already have an request
      return this;
    }

    const d3_request = d3.xml(uri, 'application/xml');
    d3_request.on('beforesend', request => {
      request.withCredentials = true;
    });

    this.active_requests[uri] = d3_request;

    d3_request.get((error, xml) => {
      const ctrls = this.requesting_controllers[uri];

      let omp_status;
      let omp_status_text;
      if (error) {
        if (error instanceof XMLHttpRequest) {
          if (error.status === 0) {
            this.outputError(ctrls, _('Loading aborted'));
            return;
          }
          if (error.status === 401) {
            // not authorized (anymore)
            // reload page to show login dialog
            window.location.replace(LOGIN_PAGE); // FIXME
            return;
          }

          this.outputError(ctrls, _('HTTP error {{error}}',
            {error: error.status}),
            _('Error: HTTP request returned status {{status}} for URL: ' +
            '{{url}}', {
              status: error.status,
              url: this.data_uri,
            }));
          return;
        }

        this.outputError(ctrls, _('Error reading XML'),
          _('Error reading XML from URL {{url}}: {{error}}', {
            url: this.data_uri,
            error: error,
          }));
        return;
      }

      const xml_select = d3.select(xml.documentElement);
      if (xml.documentElement.localName === 'parsererror') {
        this.outputError(ctrls, _('Error parsing XML data'),
          _('Error parsing XML data. Details: {{details}}',
            {details: xml.documentElement.textContent}));
        return;
      }

      if (this.command === 'get_aggregate') {
        omp_status = xml_select.select('get_aggregate get_aggregates_response')
          .attr('status');
        omp_status_text = xml_select
          .select('get_aggregate get_aggregates_response')
          .attr('status_text');
      }
      else if (this.command === 'get_tasks') {
        omp_status = xml_select.select('get_tasks get_tasks_response')
          .attr('status');
        omp_status_text = xml_select.select('get_tasks get_tasks_response')
          .attr('status_text');
      }
      else if (this.command === 'get_assets') {
        omp_status = xml_select.select('get_assets get_assets_response')
          .attr('status');
        omp_status_text = xml_select.select('get_assets get_assets_response')
          .attr('status_text');
      }
      else {
        this.outputError(ctrls, _('Internal error: Invalid request'),
          _('Invalid request command: "{{command}}', {command: this.command}));
        return;
      }

      if (omp_status !== '200') {
        this.outputError(ctrls, _('Error {{omp_status}}: {{omp_status_text}}', {
            omp_status,
            omp_status_text,
          }),
          _('GMP Error {{omp_status}}: {{omp_status_text}}', {
            omp_status,
            omp_status_text,
          })
        );
        return;
      }
      const data = xml2json(xml_select.node());
      this.addData(data, uri);
      this.dataLoaded(data, uri);

      delete this.active_requests[uri];
    });
    return this;
  }

  getParam(param_name) {
    return this.params[param_name];
  }

  /**
   * Notify all controllers about available data
   *
   * @param {Object} data Data to notify the requesting controllers about
   * @param {String} uri  URI of the request
   *
   * @return This data source
   */
  dataLoaded(data, uri) {
    const ctrls = this.requesting_controllers[uri];
    for (const controller_id in ctrls) {
      const ctrl = ctrls[controller_id];
      if (ctrl.active) {
        ctrl.active = false;
        ctrl.controller.dataLoaded(data);
      }
    }
    delete this.requesting_controllers[uri];
    return this;
  }

  /**
   * Store request data in the local cache
   *
   * This data will delivered to each requesting chart using the filter id
   * afterwards.
   *
   * @param {Object} data  Data to use for requesting charts
   * @param {String} uri   URI of the request
   *
   * @return This data source
   */
  addData(data, uri) {
    this.cache.set(uri, data);
    return this;
  }

  /**
   * Get request data from the local cache
   *
   * @param {String} uri URI to get data for
   *
   * @return The cached data or undefined of not available
   */
  getData(uri) {
    return this.cache.getValue(uri);
  }

  /**
   * Prints an error to the console and shows it on the display of a chart.
   *
   * @param {Object} controllers       Controller of the chart where the error occurred.
   * @param {String} display_message   Short message to show on the display.
   * @param {String} console_message   Longer message shown on the console.
   * @param {String} console_extra     Extra debug info shown on the console.
   */
  outputError(controllers, display_message, console_message, console_extra) {
    if (is_defined(console_message)) {
      log.error(console_message);
    }

    if (is_defined(console_extra)) {
      log.debug(console_extra);
    }

    for (const id in controllers) {
      const controller = controllers[id];
      controller.controller.showError(display_message);
    }
  }
}

export default DataSource;

// vim: set ts=2 sw=2 tw=80:
