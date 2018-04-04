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
import $ from 'jquery';

import {browserHistory as history} from 'react-router';

import _ from 'gmp/locale.js';
import {for_each, has_value, is_array, is_defined, is_string} from 'gmp/utils';

import {parse_float, parse_int} from 'gmp/parser.js';

import Logger from 'gmp/log.js';

import {getSeverityLevels} from '../../../utils/severity';

const log = Logger.getLogger('web.dashboard.legacy.helper');

const severity_levels = getSeverityLevels();

const DATE_REGEX = /^\d{4}-(0\d|1[0-2])-([0-2]\d|3[01])T([0-1]\d|2[0-3]):[0-5]\d(:[0-5]\d)?([+-](0\d|1[0-4]):[0-5]\d|Z|)$/; // eslint-disable-line max-len

export const EMPTY_FILTER = {
  id: '',
  name: '--',
  term: '',
  type: undefined,
};

export const is_float_string = (value, f_value) => {
  if (!is_defined(f_value)) {
    f_value = parse_float(value);
  }
  return is_defined(f_value) && isFinite(value);
};

/**
 * Creates a title generator that returns a static title.
 *
 * @param {String} loading_text  Text to show while loading.
 * @param {String} loaded_text   Text to show once the data is loaded.
 *
 * @return {Function} The title generator function.
 */
export function title_static(loading_text, loaded_text) {
  return function(data) {
    let title = is_defined(data) ? loaded_text : loading_text;

    if (data && data.filter_info && data.filter_info.name !== '') {
      title = title + ' : ' + data.filter_info.name;
    }

    return title;
  };
};

/**
 * Creates a title generator returning a title with the total resource count.
 *
 * @param {String} title         The basic title to show.
 * @param {String} count_field   The field containing the count.
 *
 * @return {Function} The title generator function
 */
export function title_total(title, count_field) {
  return function(data) {
    let filter_text = '';

    if (data && data.filter_info && data.filter_info.name !== '') {
      filter_text = ': ' + data.filter_info.name;
    }

    if (!is_defined(data)) {
      return _('{{title}} (Loading...)', {title: title});
    }

    let total = 0;
    for (const record of data.records) {
      total = total + parse_int(record[count_field]);
    }
    return _('{{title}} {{filter_text}} (Total: {{count}})', {
      title: title,
      filter_text: filter_text,
      count: '' + total,
    });
  };
};

/**
 * Creates a title generator function.
 *
 * @param {String} title_text  Title to display
 * @param {String} count_field Name of the field for counts
 *
 * @returns {Function} A title generator function
 */
export function get_title_generator(title_text, count_field) {

  if (title_text) {
    if (is_defined(count_field)) {
      return title_total(title_text, count_field);
    }
    return title_static(_('{{title_text}} (Loading...)',
        {title_text: title_text}), title_text);
  }

  log.error('Chart title not set. Please add a data-chart-title attribute');
  return title_static(_('Unknown chart'));
}

export function create_hostname() {
  const {config = {}} = window;
  let protocol;

  if (is_defined(config.protocol)) {
    protocol = config.protocol;
    if (protocol.indexOf(':', protocol.length - 1) === -1) {
      protocol += ':';
    }
  }
  else {
    protocol = window.location.protocol;
  }

  const server = is_defined(config.server) ? config.server :
    window.location.host;

  return protocol + '//' + server;
}

/*
  * Creates a GSA request URI from a command name, parameters array and prefix.
  *
  */
export function create_uri(command, token, filter, params, prefix, no_xml) {
  const url = create_hostname();
  let params_str = prefix + 'cmd=' + encodeURIComponent(command);

  for (const prop_name in params) {
    if ((!no_xml || prop_name !== 'xml') &&
        (!is_defined(filter) || !is_defined(filter.type) ||
            (prop_name !== 'filter' && prop_name !== 'filt_id'))) {
      if (is_array(params[prop_name])) {
        for (let i = 0; i < params[prop_name].length; i++) {
          params_str = params_str + '&' +
            encodeURIComponent(prop_name) + ':' + i + '=' +
            encodeURIComponent(params[prop_name][i]);
        }
      }
      else {
        params_str = params_str + '&' +
          encodeURIComponent(prop_name) + '=' +
          encodeURIComponent(params[prop_name]);
      }
    }
  }

  if (has_value(filter) && filter.id && filter.id !== '') {
    params_str = params_str + '&filt_id=' + encodeURIComponent(filter.id);
  }

  params_str = params_str + '&token=' + encodeURIComponent(token);

  return url + params_str;
}

/*
  * Time formatter objects
  */
// Default date and time formats
export const date_format = d3.time.format.utc('%Y-%m-%d');
export const datetime_format = d3.time.format.utc('%Y-%m-%d %H:%M');
export const iso_time_format = d3.time.format.utc('%Y-%m-%dT%H:%M');

/*
  * Generic chart styling helpers
  */

/* Color scales */

/**
 * Gets a d3 color scale for values of a specific column and resource type.
 *
 * @param {String} type    The resource type.
 * @param {String} column  The column,
 *
 * @return  The color scale function for the column and type.
 */
export const field_color_scale = (type, column) => {
  let scale = d3.scale.ordinal();

  const red = d3.interpolateHcl('#d62728', '#ff9896');
  const green = d3.interpolateHcl('#2ca02c', '#98df8a');
  const blue = d3.interpolateHcl('#aec7e8', '#1f77b4');
  const orange = d3.interpolateHcl('#ff7f0e', '#ffbb78');
  const yellow = d3.interpolateHcl('#ad9e39', '#ffff99');
  const red_yellow = d3.interpolateHcl('#d62728', '#ffff8e');

  switch (column) {
    case 'class':
      scale.domain([
          'compliance',
          'inventory',
          'miscellaneous',
          'patch',
          'vulnerability',
          'N/A',
      ]);
      scale.range([
          blue(0),
          blue(1),
          green(0),
          green(1),
          orange(0),
          'silver',
      ]);
      break;
    case 'qod':
      scale = d3.scale.linear();
      scale.domain([0, 30, 60, 70, 80, 95, 100]);
      scale.range([
          d3.hsl('#881100'),
          d3.hsl('#ff7f0e'),
          d3.hsl('#ffff0e'),
          d3.hsl('#f8f8f8'),
          d3.hsl('#22cc22'),
          d3.hsl('#22ddff'),
          d3.hsl('#000044'),
      ]);
      break;
    case 'qod_type':
      scale.domain([
          'Exploit',
          'Remote vulnerability',
          'Remote Active',
          'Remote analysis',
          'Remote App',
          'Remote Banner',
          'Remote probe',
          'Package check',
          'Registry check',
          'Executable version',
          'Unreliable rem. banner',
          'Unreliable exec. version',
          'General Note',
          'None',
      ]);
      scale.range([
          red(0),
          orange(0),
          green(0),
          green(0.5),
          green(0.25),
          green(0.75),
          green(1.0),
          blue(1.0),
          blue(0.5),
          blue(0.0),
          yellow(0.5),
          yellow(1.0),
          'grey',
          'silver',
      ]);
      break;
    case 'severity_level':
    case 'threat':
      scale.domain([
          'Error',
          'Debug',
          'False Positive',
          'Log',
          'Low',
          'Medium',
          'High',
          'N/A',
      ]);
      scale.range([
        '#800000',
        '#008080',
        '#808080',
        '#DDDDDD',
        'skyblue',
        'orange',
        '#D80000',
        'silver',
      ]);
      break;
    case 'solution_type':
      scale.domain([
          'Mitigation',
          'NoneAvailable',
          'VendorFix',
          'WillNotFix',
          'Workaround',
          'N/A',
      ]);
      scale.range([
          green(0.5),
          red_yellow(0.5),
          blue(1),
          red_yellow(0),
          red_yellow(0.75),
          'silver',
      ]);
      break;
    case 'status':
      scale.domain([
          'Delete Requested',
          'Ultimate Delete Requested',
          'Internal Error',
          'New', 'Requested',
          'Running',
          'Stop Requested',
          'Stopped',
          'Done',
          'N/A',
      ]);
      scale.range([
          red(1.0),
          red(0.5),
          red(0.0),
          green(1.0),
          green(0.5),
          green(0.0),
          orange(1.0),
          orange(0.0),
          blue(0.5),
          'silver',
      ]);
      break;
    case 'type':
      scale.domain([
          'NVTs',
          'CVEs',
          'CPEs',
          'OVAL definitions',
          'CERT-Bund Advisories',
          'DFN-CERT Advisories',
          'N/A']);
      scale.range([
          orange(0.0),
          blue(0.0),
          blue(0.5),
          blue(1.0),
          green(0.0),
          green(1.0),
          'silver',
      ]);
      break;
    default:
      return d3.scale.category20();
  }
  return scale;
};

/*
  * Color scale for SecInfo severity levels
  */
export const severity_level_color_scale = field_color_scale(
  undefined, 'severity_level');

/*
  * Severity gradient.
  */
export const severity_colors_gradient = () => {
  return d3.scale.linear()
    .domain([-1.0,
      severity_levels.max_log,
      severity_levels.min_low,
      (severity_levels.min_low +
        severity_levels.max_low) / 2,
      severity_levels.max_low,
      severity_levels.min_medium,
      (severity_levels.min_medium +
        severity_levels.max_medium) / 2,
      severity_levels.max_medium,
      severity_levels.min_high,
      (severity_levels.min_high + 10.0) / 2,
      10.0])
    .range([
      d3.hcl('grey'),    // False Positive
      d3.hcl('silver'),  // Log
      d3.hcl('#b1cee9'), // minimum Low
      d3.hcl('#87CEEB'), // middle Low
      d3.hcl('#a5e59d'), // maximum Low
      d3.hcl('#ffde00'), // minimum Medium
      d3.hcl('#FFA500'), // middle Medium
      d3.hcl('#f57b00'), // maximum Medium
      d3.hcl('#eb5200'), // minimum High
      d3.hcl('#D80000'), // middle High
      d3.hcl('#ff0000'), // maximum High
    ]);
};

/*
  * Quantiles gradient.
  */
export const quantiles_colors_gradient =
  d3.scale.linear()
    .domain([0, 0.05, 0.25, 0.50, 0.75, 0.95, 1.00])
    .range([
      d3.hsl('#008644'), // 0.00
      d3.hsl('#55B200'), // 0.05
      d3.hsl('#94D800'), // 0.25
      d3.hsl('#E6E600'), // 0.50
      d3.hsl('#EDBA00'), // 0.75
      d3.hsl('#EC6E00'), // 0.95
      d3.hsl('#D63900'), // 1.00
     ]);

/* Bar CSS styles */

/**
 * Creates a severity bar chart style.
 *
 * @param {String} field       Name of the field containing the severity.
 * @param {Number} max_log     Maximum CVSS score for "Log" severity.
 * @param {Number} max_low     Maximum CVSS score for "Low" severity.
 * @param {Number} max_medium  Maximum CVSS score for "Medium" severity.
 *
 * @return Function returning the CSS style for a CVSS score.
 */
export const severity_bar_style = (field, max_log, max_low,
    max_medium) => {
  const medium_high_color = d3.interpolateHcl('#D80000', 'orange')(0.5);
  const low_medium_color = d3.interpolateHcl('orange', 'skyblue')(0.5);
  const log_low_color = d3.interpolateHcl('skyblue', 'silver')(0.5);

  function func(d) {
    const value = parse_float(d[field]);
    if (value > Math.ceil(max_medium)) {
      return 'fill: #D80000';
    }
    else if (value > max_medium) {
      return 'fill: ' + medium_high_color;
    }
    else if (value > Math.ceil(max_low)) {
      return 'fill: orange';
    }
    else if (value > max_low) {
      return 'fill: ' + low_medium_color;
    }
    else if (value > Math.ceil(max_log)) {
      return 'fill: skyblue';
    }
    else if (value > max_log) {
      return 'fill: ' + log_low_color;
    }

    return 'fill: silver';
  };

  func.max_low = max_low;
  func.max_medium = max_medium;
  func.field = field;
  return func;
};

/**
 * Creates a quantile bar chart style.
 *
 * @param {String} field Name of the field containing the severity.
 *
 * @return Function returning the CSS style for a CVSS score.
 */
export const quantile_bar_style = field => {
  const color_scale = quantiles_colors_gradient;

  function func(d) {
    const value = d[field];

    if (!is_defined(value)) {
      return undefined;
    }

    return 'fill: ' + color_scale(value);
  };

  return func;
};

/*
  * Data Source Helper functions
  */

export const extract_simple_records_json = data => {
  const records = [];

  function get_date(value) {
    return new Date(value.substr(0, 19) + 'Z');
  }

  function set_record_value(record, field_name, value) {
    const f_value = parse_float(value);

    if (is_float_string(value, f_value)) {
      record[field_name] = f_value;
    }
    else {
      set_text_record_value(record, field_name, value);
    }
  }

  function set_text_record_value(record, field_name, value) {
    if (is_string(value) && value.match(DATE_REGEX)) {
      record[field_name] = get_date(value);
    }
    else {
      record[field_name] = value;
    }
  }

  function set_values(record, group, subgroup_value) {
    const fields = ['value', 'count', 'c_count'];

    fields.forEach(name => {
      const value = group[name];

      if (is_defined(value)) {
        const field_name = is_defined(subgroup_value) ?
          name + '[' + subgroup_value + ']' : name;

        set_record_value(record, field_name, value);
      }
    });

    for_each(group.subgroup, subgroup => {
      set_values(record, subgroup, subgroup.value);
    });

    for_each(group.text, text => {
      set_text_record_value(record, text._column, text.__text);
    });

    for_each(group.stats, stats => {
      const col_name = stats._column;
      for (const child in stats) {
        if (child[0] === '_') {
          continue;
        }

        const fname = col_name + '_' + child;
        const field_name = is_defined(subgroup_value) ?
          fname + '[' + subgroup_value + ']' : fname;
        set_record_value(record, field_name, stats[child]);
      }
    });
  }

  for_each(data, group => {
    const record = {};

    set_values(record, group);

    records.push(record);
  });

  return records;
};

/**
 * Extracts column info from JSON.
 *
 * @param {Object} data        The root aggregate object
 * @param {Object} gen_params  Generator parameters.
 *
 * @return  A column_info object as used by chart generators.
 */
export const extract_column_info_json = (data, gen_params) => {
  const column_info = {
    group_column: undefined,
    subgroup_column: undefined,
    data_columns: [],
    text_columns: [],
    columns: {},
    subgroups: [],
  };

  function add_missing_column(field) {
    if (field.indexOf('[') !== -1 && field.lastIndexOf(']') !== -1) {
      const base = field.substr(0, field.indexOf('['));
      const subgroup = field.substr(field.indexOf('[') + 1,
          field.lastIndexOf(']') - field.indexOf('[') - 1);
      const base_column = column_info.columns[base];

      if (is_defined(base_column)) {
        const column_copy = {};
        const copy_name = base + '[' + subgroup + ']';
        for (const prop in base_column) {
          column_copy[prop] = base_column[prop];
        }
        column_copy.name = copy_name;
        column_copy.subgroup_value = subgroup;
        column_info.columns[copy_name] = column_copy;
      }
      else {
        log.warn('Could not find base column info "', base,
          '" for "', field, '"');
      }
    }
  }

  if (is_defined(data.subgroups)) {
    for_each(data.subgroups.value, function(value) {
      column_info.subgroups.push(value);
    });
  }

  column_info.group_column = data.group_column;

  column_info.subgroup_column = data.subgroup_column;

  for_each(data.data_column, value => {
    column_info.data_columns.push(value);
  });

  for_each(data.text_column, value => {
    column_info.text_columns.push(value);
  });

  for_each(data.column_info.aggregate_column, entry => {
    const column = {};

    for (const name in entry) {
      let value = entry[name];
      const f_value = parse_float(value);
      if (is_float_string(value, f_value)) {
        value = f_value;
      }
      column[name] = value;
    }

    column_info.columns[column.name] = column;
    if (column.name !== 'value' && column.name !== 'subgroup_value') {
      column_info.subgroups.forEach(function(subgroup) {
        // Create copies of columns for subgroups
        const column_copy = {};
        const copy_name = column.name + '[' + subgroup + ']';
        for (const prop in column) {
          column_copy[prop] = column[prop];
        }
        column_copy.name = copy_name;
        column_copy.subgroup_value = subgroup;
        column_info.columns[copy_name] = column_copy;
      });
    }
  });

  if (gen_params) {
    for_each(['y_fields', 'z_fields'], name => {
      const fields = gen_params[name];
      for_each(fields, function(field) {
        if (!is_defined(column_info.columns[field])) {
          add_missing_column(field);
        }
      });
    });
  }
  return column_info;
};

/**
 * Extracts filter info from json data.
 *
 * @param {Object} data  The root object to extract from.
 *
 * @return A filter_info object as used by chart generators.
 */
export const extract_filter_info_json = data => {
  const filter_info = {
    id: data._id,
    term: data.term,
    name: is_defined(data.name) ? data.name : '',
    keywords: [],
    criteria_str: '',
    extra_options_str: '',
    criteria: [],
    extra_options: [],
  };

  if (is_defined(data.keywords)) {
    for_each(data.keywords.keyword, function(keyword) {
      const current_keyword = {
        column: keyword.column,
        relation: keyword.relation,
        value: keyword.value,
      };

      if (current_keyword.column === '') {
        // boolean operators and search phrase
        if (filter_info.criteria.length) {
          filter_info.criteria_str += ' ';
        }

        filter_info.criteria.push(current_keyword);

        if (current_keyword.relation === '=') {
          filter_info.criteria_str += '=' + current_keyword.value;
        }
        else {
          filter_info.criteria_str += current_keyword.value;
        }
      }
      else if (current_keyword.column === 'apply_overrides' ||
          current_keyword.column === 'autofp' ||
          current_keyword.column === 'rows' ||
          current_keyword.column === 'first' ||
          current_keyword.column === 'sort' ||
          current_keyword.column === 'sort-reverse' ||
          current_keyword.column === 'notes' ||
          current_keyword.column === 'overrides' ||
          current_keyword.column === 'timezone' ||
          current_keyword.column === 'result_hosts_only' ||
          current_keyword.column === 'levels' ||
          current_keyword.column === 'min_cvss_base' ||
          current_keyword.column === 'min_qod' ||
          current_keyword.column === 'delta_states') {
        // special options
        if (filter_info.extra_options.length !== '') {
          filter_info.extra_options_str += ' ';
        }
        filter_info.extra_options.push(current_keyword);
        filter_info.extra_options_str += current_keyword.column +
          current_keyword.relation + current_keyword.value;
      }
      else {
        // normal column criteria
        if (filter_info.criteria.length) {
          filter_info.criteria_str += ' ';
        }
        filter_info.criteria.push(current_keyword);
        filter_info.criteria_str += current_keyword.column +
          current_keyword.relation + current_keyword.value;
      }
    });
  }

  return filter_info;
};

/*
  * Helpers for processing extracted data
  */

/**
 * Gets capitalized resource and attribute names.
 *
 * @param {String} str The name to capitalize.
 *
 * @return The capitalized name.
 */
const capitalize = str => {
  switch (str.toLowerCase()) {
    case 'nvt':
    case 'cve':
    case 'cpe':
      return str.toUpperCase();
    default:
      const split_str = str.split('_');
      return split_str.map(val =>
        val.charAt(0).toUpperCase() + val.slice(1)
      ).join(' ');
  }
};

/**
 * Gets the severity level name for a numeric cvss value.
 *
 * @param {Number}  value The numeric value to convert.
 *
 * @return {string} The severity level name.
 */
export const severity_level = value => {
  if (value >= severity_levels.min_high) {
    return _('High');
  }
  else if (value >= severity_levels.min_medium) {
    return _('Medium');
  }
  else if (value >= severity_levels.min_low) {
    return _('Low');
  }
  else if (value >= 0.0) {
    return _('Log');
  }
  else if (value === -1.0) {
    return _('False Positive');
  }
  else if (value === -2.0) {
    return _('Debug');
  }
  else if (value === -3.0) {
    return _('Error');
  }

  return _('N/A');
};

/*
  * Gets the full name of a resource type.
  *
  * @param type  The type name as used in omp requests.
  *
  * @return  The full name.
  */
export const resource_type_name = type => {
  switch (type.toLowerCase()) {
    case 'os':
      return _('Operating System');
    case 'ovaldef':
      return _('OVAL definition');
    case 'cert_bund_adv':
      return _('CERT-Bund Advisory');
    case 'dfn_cert_adv':
      return _('DFN-CERT Advisory');
    case 'allinfo':
      return _('SecInfo Item');
    default:
      return capitalize(type);
  }
};

/**
 * Gets the plural form of the full name of a resource type.
 *
 * @param {String} type  The type name as used in omp requests.
 *
 * @return The full name plural.
 */
export const resource_type_name_plural = type => {
  switch (type.toLowerCase()) {
    case 'dfn_cert_adv':
      return _('DFN-CERT Advisories');
    case 'cert_bund_adv':
      return _('CERT-Bund Advisories');
    default:
      return resource_type_name(type) + 's';
  }
};

/**
 * Gets the Filter type name of a resource type.
 *
 * @param {String} type  The type name as used in omp requests.
 *
 * @return The filter name.
 */
export const filter_type_name = type => {
  switch (type.toLowerCase()) {
    case 'asset':
    case 'os':
    case 'host':
      return 'Asset';
    case 'info':
    case 'nvt':
    case 'cve':
    case 'cpe':
    case 'ovaldef':
    case 'cert_bund_adv':
    case 'dfn_cert_adv':
    case 'allinfo':
      return 'SecInfo';
    default:
      return capitalize(type);
  }
};

/**
 * Gets the full form of an aggregate field name.
 *
 * @param {String} field The name of the field as used in GMP requests.
 * @param {String} type  The resource type as used in GMP requests.
 *
 * @return  The full field name.
 */
export const field_name = (field, type) => {
  switch (field.toLowerCase()) {
    case 'c_count':
      return _('total {{resource_type_plural}}',
          {
            resource_type_plural: resource_type_name_plural(type),
            interpolation: {escape: false},
          });
    case 'count':
      return resource_type_name_plural(type);
    case 'created':
      return _('creation time');
    case 'modified':
      return _('modification time');
    case 'qod':
      return _('QoD');
    case 'qod_type':
      return _('QoD type');
    case 'high':
      return _('High');
    case 'high_per_host':
      return _('High / host');
    default:
      if (is_string(field)) {
        return field.replace('_', ' ');
      }
      return field;
  }
};

/**
 * Generates a label from a column info object.
 *
 * @param {Object}  info              The column_info object.
 * @param {Boolean} capitalize_label  Whether to capitalize the label.
 * @param {Boolean} include_type      Whether to include the resource type.
 * @param {Boolean} include_stat      Whether to include the statistic (min, max, etc.).
 *
 * @return The generated label.
 */
export const column_label = (info, capitalize_label,
  include_type, include_stat) => {

  if (info.label_generator) {
    return info.label_generator(info, capitalize_label,
                                include_type, include_stat);
  }

  return default_column_label(info, capitalize_label,
    include_type, include_stat);
};

/**
 * Generates a label in the default format from a column info object.
 *
 * @param {Object}  info              The column_info object.
 * @param {Boolean} capitalize_label  Whether to capitalize the label.
 * @param {Boolean} include_type      Whether to include the resource type.
 * @param {Boolean} include_stat      Whether to include the statistic (min, max, etc.).
 *
 * @return  The generated label.
 */
export const default_column_label = (info, capitalize_label,
  include_type, include_stat) => {
  let label = '';

  if (include_stat) {
    switch (info.stat) {
      case 'min':
        label = label + 'min. ';
        break;
      case 'max':
        label = label + 'max. ';
        break;
      case 'mean':
        label = label + 'average ';
        break;
      case 'sum':
        label = label + 'summed ';
        break;
      default:
        break;
    }
  }

  label = label + field_name(info.column ? info.column : info.stat,
    info.type);

  if (include_type && info.stat !== 'count' && info.stat !== 'c_count') {
    label = label + ' (' + resource_type_name(info.type) + ')';
  }
  if (capitalize_label) {
    label = capitalize(label);
  }

  if (is_defined(info.subgroup_value) && info.subgroup_value !== '') {
    label += ' (' + info.subgroup_value + ')';
  }

  return label;
};

/**
 * Generates a string representation of a data value using the column info.
 *
 * @param {Any}    value           The value to get the string representation for.
 * @param {Object} col_info_item   The column_info item to use.
 *
 * @return  The value as a string.
 */
export const format_data = (value, col_info_item) => {
  if (col_info_item && col_info_item.data_formatter) {
    return col_info_item.data_formatter(value, col_info_item);
  }
  return format_data_default(value, col_info_item);
};

/**
 * Generates a default string representation of a data value using column info.
 *
 * @param {Any}    value
 * @param {Object} col_info_item
 *
 * @return Default string representation
 */
export const format_data_default = (value, col_info_item) => {
  if (!has_value(value)) {
    return value;
  }

  if (col_info_item) {
    switch (col_info_item.data_type) {
      case 'js_date':
        return date_format(value);
      case 'js_datetime':
        return datetime_format(value);
      case 'unix_time':
        return datetime_format(new Date(value * 1000));
      case 'cvss':
        return value.toFixed(1);
      case 'decimal':
        return value.toFixed(3).replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/,
            '$1');
      default:
        return '' + value;
    }
  }
  else {
    return '' + value;
  }
};

/*
  * Record set transformation functions
  */

/**
 * Dummy function returning the raw, unmodified data.
 *
 * @param {Object} data The data.
 *
 * @return The unmodified data.
 */
export const data_raw = data => data;

/**
 * Get quantiles and related data for a given value and count field:
 *  - Minimum and maximum value
 *  - Total count
 *  - values at each quantile
 *  - quantiles for each record index
 *
 * @param {Object} records
 * @param {String} count_field
 * @param {String} value_field
 *
 * @returns Info for quantiles
 */
export const data_quantile_info = (records, count_field, value_field) => {
  if (!is_defined(count_field)) {
    count_field = 'count';
  }
  if (!is_defined(value_field)) {
    value_field = 'value';
  }

  const q_info = {
    count_field: count_field,
    value_field: value_field,
    min_value: +Infinity,
    max_value: -Infinity,
    total_count: 0,
    quantiles: [0.05, 0.25, 0.50, 0.75, 0.95],
    quantile_values: [],
    record_quantiles: [],
  };

  for_each(records, record => {
    if (record[value_field] < q_info.min_value) {
      q_info.min_value = record[value_field];
    }

    if (record[value_field] > q_info.max_value) {
      q_info.max_value = record[value_field];
    }

    q_info.total_count += record[count_field];
  });

  let temp_total = 0;
  let min_q_index = 0;

  for (let record_index = 0; record_index < records.length; record_index++) {
    const record = records[record_index];
    temp_total += record[count_field];
    for (let q_index = min_q_index; q_index < q_info.quantiles.length;
      q_index++) {
      const nq = q_info.total_count * q_info.quantiles[q_index];
      if (nq < temp_total && !is_defined(q_info.quantile_values[q_index])) {
        min_q_index = q_index + 1;
        q_info.quantile_values[q_index] = record[value_field];
      }
    }
  }

  for (let record_index = 0; record_index < records.length; record_index++) {
    const record = records[record_index];
    const value = record[value_field];

    for (let q_index = q_info.quantiles.length - 1; q_index >= 0; q_index--) {
      if (Number(q_info.quantile_values[q_index]) >= Number(value)) {
        q_info.record_quantiles[record_index] = q_info.quantiles[q_index];
      }
    }
    if (!is_defined(q_info.record_quantiles[record_index])) {
      q_info.record_quantiles[record_index] = 1.0;
    }
  }

  return q_info;
};

/**
 * Transforms data into a quantile histogram.
 *
 * @param {Object} old_data  The original data.
 * @param {Object} params    The generator parameters.
 *
 * @return The data transformed into a quantile histogram.
 */
export const data_quantile_histogram = (old_data, params) => {
  let count_field = 'count';
  let value_field = 'value';

  if (params) {
    if (params.value_field) {
      value_field = params.value_field;
    }
    if (params.count_field) {
      count_field = params.count_field;
    }
  }

  // Get quantile values
  const q_info = data_quantile_info(old_data.records, count_field,
    value_field);
  const {total_count, max_value, min_value} = q_info;

  let n_bins = Math.ceil(Math.log2(total_count)) + 1;
  let bin_width = Math.round((max_value - min_value) / n_bins);
  if (bin_width <= 0) {
    bin_width = 1;
  }
  n_bins = Math.floor((max_value - min_value) / bin_width) + 1;

  const bins = [];
  const bins_long = [];

  for (let bin_index = 0; bin_index < n_bins; bin_index++) {
    const bin_min = min_value + (bin_index * bin_width);
    const bin_max = min_value + ((bin_index + 1) * bin_width) - 1;
    if (bin_min === bin_max) {
      bins[bin_index] = bin_min;
      bins_long[bin_index] = bin_min;
    }
    else {
      bins[bin_index] = bin_max;
      bins_long[bin_index] = bin_min + ' - ' + bin_max;
    }
  }

  const column_info = {
    group_column: value_field,
    data_columns: [count_field],
    columns: {},
  };

  function bin_func(val) {
    let index = Math.floor((val - min_value) / bin_width);
    if (index >= n_bins) {
      index = n_bins - 1;
    }
    return index;
  }

  const records = bins.map(function(d) {
    const record = {};
    record[value_field] = d;
    record[count_field] = 0;
    return record;
  });

  column_info.columns[value_field] = {
    name: value_field,
    type: old_data.column_info.columns[value_field].type,
    column: old_data.column_info.columns[value_field].column,
    stat: old_data.column_info.columns[value_field].stat,
    data_type: 'text',
  };

  column_info.columns['min_' + value_field + '_quantile'] = {
    name: 'min_' + value_field + '_quantile',
    type: old_data.column_info.columns[value_field].type,
    column: old_data.column_info.columns[value_field].column,
    stat: 'quantile',
    data_type: 'decimal',
  };

  column_info.columns['max_' + value_field + '_quantile'] = {
    name: 'max_' + value_field + '_quantile',
    type: old_data.column_info.columns[value_field].type,
    column: old_data.column_info.columns[value_field].column,
    stat: 'quantile',
    data_type: 'decimal',
  };

  column_info.columns[count_field] = {
    name: count_field,
    type: old_data.column_info.columns[count_field].type,
    column: '',
    stat: 'count',
    data_type: 'integer',
  };

  for (const record_index in old_data.records) {
    const new_record_index = bin_func(
      old_data.records[record_index][value_field]);
    const new_record = records[new_record_index];
    const old_record = old_data.records[record_index];

    new_record[count_field] = Number(new_record[count_field]) +
      Number(old_record[count_field]);

    if (!is_defined(new_record['min_' + value_field + '_quantile'])) {
      new_record['min_' + value_field + '_quantile'] =
        q_info.record_quantiles[record_index];
    }
    new_record['max_' + value_field + '_quantile'] =
      q_info.record_quantiles[record_index];
  }

  for (const record_index in records) {
    records[record_index][value_field + '~long'] = bins_long[record_index];
  }

  return {
    records: records,
    column_info: column_info,
    filter_info: old_data.filter_info,
  };
};

/**
 * Transforms data into a severity histogram.
 *
 * @param {Object} old_data  The original data.
 * @param {Object} params    The generator parameters.
 *
 * @return The data transformed into a severity histogram.
 */
export const data_severity_histogram = (old_data, params) => {
  const bins = ['N/A', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  const bins_long = ['N/A', '0.0', '0.1 - 1.0', '1.1 - 2.0', '2.1 - 3.0',
    '3.1 - 4.0', '4.1 - 5.0', '5.1 - 6.0', '6.1 - 7.0',
    '7.1 - 8.0', '8.1 - 9.0', '9.1 - 10.0'];

  let severity_field = 'value';
  let count_field = 'count';

  if (params) {
    if (params.severity_field) {
      severity_field = params.severity_field;
    }
    if (params.count_field) {
      count_field = params.count_field;
    }
  }

  const column_info = {
    group_column: severity_field,
    data_columns: [count_field],
    columns: {},
  };

  function bin_func(val) {
    if (val !== '' && Number(val) <= 0.0) {
      return 1;
    }
    else if (Number(val) >= 10.0) {
      return 11;
    }
    else if (Number(val) > 0.0) {
      return Math.ceil(Number(val)) + 1;
    }
    return 0;
  };

  const records = bins.map(d => {
    const record = {};
    record[severity_field] = d;
    record[count_field] = 0;
    return record;
  });

  column_info.columns[severity_field] = {
    name: severity_field,
    type: old_data.column_info.columns[severity_field].type,
    column: old_data.column_info.columns[severity_field].column,
    stat: old_data.column_info.columns[severity_field].stat,
    data_type: 'text',
  };

  column_info.columns[count_field] = {
    name: count_field,
    type: old_data.column_info.columns[count_field].type,
    column: '',
    stat: 'count',
    data_type: 'integer',
  };

  for (const record of old_data.records) {
    const bin = bin_func(record[severity_field]);
    records[bin][count_field] = Number(records[bin][count_field]) +
      Number(record[count_field]);
  }

  for (const i in records) {
    records[i][severity_field + '~long'] = bins_long[i];
  }

  return {
    records: records,
    column_info: column_info,
    filter_info: old_data.filter_info,
  };
};

/**
 * Gets the counts of severity levels from records containing the counts
 *  for each numeric CVSS score.
 *
 * @param {Object} old_data  The original data.
 * @param {Object} params    The generator parameters.
 *
 * @return The data transformed into severity classes.
 */
export const data_severity_level_counts = (old_data, params) => {
  const NA = 'N/A';
  const LOG = 'Log';
  const LOW = 'Low';
  const MEDIUM = 'Medium';
  const HIGH = 'High';

  const levels = [NA, LOG, LOW, MEDIUM, HIGH];

  const levels_long = {
    [NA]: 'N/A',
    [LOG]: 'Log (0.0 - ' + severity_levels.max_log.toFixed(1) + ')',
    [LOW]: 'Low (' + severity_levels.min_low.toFixed(1) +
      ' - ' + severity_levels.max_low.toFixed(1) + ')',
    [MEDIUM]: 'Medium (' + severity_levels.min_medium.toFixed(1) +
      ' - ' + severity_levels.max_medium.toFixed(1) + ')',
    [HIGH]: 'High (' + severity_levels.min_high.toFixed(1) +
      ' - ' + severity_levels.max_high.toFixed(1) + ')',
  };

  let severity_field = 'value';
  let count_field = 'count';
  let ascending = false;

  if (is_defined(params)) {
    if (is_defined(params.severity_field)) {
      severity_field = params.severity_field;
    }
    if (is_defined(params.count_field)) {
      count_field = params.count_field;
    }
    if (is_defined(params.ascending)) {
      ascending = params.ascending;
    }
  }

  const column_info = {
    group_column: severity_field,
    data_columns: [count_field],
    columns: {},
  };

  column_info.columns[severity_field] = {
    name: severity_field,
    type: old_data.column_info.columns[severity_field].type,
    column: old_data.column_info.columns[severity_field].column,
    stat: old_data.column_info.columns[severity_field].stat,
    data_type: 'text',
  };

  column_info.columns[count_field] = {
    name: count_field,
    type: old_data.column_info.columns[count_field].type,
    column: '',
    stat: 'count',
    data_type: 'integer',
  };

  const counts = {};
  for (const level of levels) {
    counts[level] = 0;
  }

  for (const record of old_data.records) {
    const val = record[severity_field];
    const count = record[count_field];

    if (val !== '' && parse_float(val) <= severity_levels.max_log) {
      counts[LOG] += count;
    }
    else if (parse_float(val) >= severity_levels.min_low &&
        parse_float(val) <= severity_levels.max_low) {
      counts[LOW] += count;
    }
    else if (parse_float(val) >= severity_levels.min_medium &&
        parse_float(val) <= severity_levels.max_medium) {
      counts[MEDIUM] += count;
    }
    else if (parse_float(val) >= severity_levels.min_high) {
      counts[HIGH] += count;
    }
    else {
      counts[NA] += count;
    }
  }

  if (severity_levels.min_high === severity_levels.max_medium) {
    delete counts[HIGH];
  }

  if (severity_levels.min_medium === severity_levels.max_low) {
    delete counts[MEDIUM];
  }

  if (severity_levels.min_low === severity_levels.max_log) {
    delete counts[LOW];
  }

  // create records
  const records = levels
    .filter(level => {
      // filter levels without counts
      const count = counts[level];
      return is_defined(count) && count > 0;
    })
    .map(level => ({
      [severity_field]: level,
      [severity_field + '~long']: levels_long[level],
      [count_field]: counts[level],
    }));

  return {
    records: ascending ? records : records.reverse(),
    column_info: column_info,
    filter_info: old_data.filter_info,
  };
};

/**
 * Get counts by resource type, using the full type name for the x field.
 *
 * @param {Object} old_data  The original data.
 * @param {Object} params    The generator parameters.
 *
 * @return The data with transformed type names.
 */
export const resource_type_counts = (old_data, params) => {
  const new_column_info = {
    group_column: old_data.column_info.group_column,
    subgroup_column: old_data.column_info.subgroup_column,
    data_columns: old_data.column_info.data_columns,
    text_columns: old_data.column_info.text_columns,
    columns: {},
  };

  for (const col in old_data.column_info.columns) {
    new_column_info.columns[col] = old_data.column_info.columns[col];
  }

  const new_data = {
    records: [],
    column_info: new_column_info,
    filter_info: old_data.filter_info,
  };

  const type_field = is_defined(params) && is_defined(params.type_field) ?
    params.type_field : 'value';

  if (is_defined(old_data.column_info.columns[type_field + '~original'])) {
    new_column_info.columns[type_field + '~original'] =
      old_data.column_info.columns[type_field + '~original'];
  }
  else {
    new_column_info.columns[type_field + '~original'] =
      old_data.column_info.columns[type_field];
  }

  for (const record of old_data.records) {
    const new_record = {};
    for (const field in record) {
      if (field === type_field) {
        if (is_defined(new_record[field + '~original'])) {
          new_record[field + '~original'] = record[field + '~original'];
        }
        else {
          new_record[field + '~original'] = record[field];
        }
        new_record[field] = resource_type_name_plural(record[field]);
      }
      else {
        new_record[field] = record[field];
      }
    }
    new_data.records.push(new_record);
  }

  return new_data;
};

/**
 * Get counts by qod type, using the full type name for the x field.
 *
 * @param {Object} old_data  The original data.
 * @param {Object} params    The generator parameters.
 *
 * @return The data with transformed QoD type names.
 */
export const qod_type_counts = (old_data, params) => {
  const new_column_info = {
    group_column: old_data.column_info.group_column,
    subgroup_column: old_data.column_info.subgroup_column,
    data_columns: old_data.column_info.data_columns,
    text_columns: old_data.column_info.text_columns,
    columns: {},
  };

  for (const col in old_data.column_info.columns) {
    new_column_info.columns[col] = old_data.column_info.columns[col];
  }

  const new_data = {
    records: [],
    column_info: new_column_info,
    filter_info: old_data.filter_info,
  };

  const type_field = is_defined(params) && is_defined(params.type_field) ?
    params.type_field : 'value';

  if (is_defined(old_data.column_info.columns[type_field + '~original'])) {
    new_column_info.columns[type_field + '~original'] =
      old_data.column_info.columns[type_field + '~original'];
  }
  else {
    new_column_info.columns[type_field + '~original'] =
      old_data.column_info.columns[type_field];
  }

  for (const record of old_data.records) {
    const new_record = {};
    for (const field in record) {
      if (field === type_field) {
        if (is_defined(new_record[field + '~original'])) {
          new_record[field + '~original'] =
            record[field + '~original'];
        }
        else {
          new_record[field + '~original'] = record[field];
        }
        switch (record[field]) {
          case '':
            new_record[field] = _('None');
            break;
          case 'exploit':
            new_record[field] = _('Exploit');
            break;
          case 'remote_vul':
            new_record[field] = _('Remote vulnerability');
            break;
          case 'package':
            new_record[field] = _('Package check');
            break;
          case 'registry':
            new_record[field] = _('Registry check');
            break;
          case 'executable_version':
            new_record[field] = _('Executable version');
            break;
          case 'remote_analysis':
            new_record[field] = _('Remote analysis');
            break;
          case 'remote_probe':
            new_record[field] = _('Remote probe');
            break;
          case 'remote_banner_unreliable':
            new_record[field] = _('Unreliable rem. banner');
            break;
          case 'executable_version_unreliable':
            new_record[field] = _('Unreliable exec. version');
            break;
          default:
            new_record[field] = resource_type_name(
              record[field]
            );
        }
      }
      else {
        new_record[field] = record[field];
      }
    }
    new_data.records.push(new_record);
  }

  new_data.records.sort((a, b) => b.count - a.count);

  return new_data;
};

/**
 * Adds percent signs to the "value" column values.
 *
 * @param {Object} old_data  The original data.
 * @param {Object} params    The generator parameters.
 *
 * @return The data with transformed values.
 */
export const percentage_counts = (old_data, params) => {
  const new_column_info = {
    group_column: old_data.column_info.group_column,
    subgroup_column: old_data.column_info.subgroup_column,
    data_columns: old_data.column_info.data_columns,
    text_columns: old_data.column_info.text_columns,
    columns: {},
  };

  for (const col in old_data.column_info.columns) {
    new_column_info.columns[col] = old_data.column_info.columns[col];
  }

  const new_data = {
    records: [],
    column_info: new_column_info,
    filter_info: old_data.filter_info,
  };

  const type_field = is_defined(params) && is_defined(params.type_field) ?
    params.type_field : 'value';

  if (is_defined(old_data.column_info.columns[type_field + '~original'])) {
    new_column_info.columns[type_field + '~original'] =
      old_data.column_info.columns[type_field + '~original'];
  }
  else {
    new_column_info.columns[type_field + '~original'] =
      old_data.column_info.columns[type_field];
  }

  for (const record in old_data.records) {
    const new_record = {};
    for (const field in old_data.records[record]) {
      new_record[field] = old_data.records[record][field];
    }
    new_data.records.push(new_record);
  }

  new_data.records.sort((a, b) => b[type_field] - a[type_field]);

  for (const record of new_data.records) {
    if (is_defined(old_data.column_info.columns[type_field + '~original'])) {
      record[type_field + '~original'] = record[type_field + '~original'];
    }
    else {
      record[type_field + '~original'] = record[type_field];
    }
    record[type_field] = record[type_field] + '%';
  }

  return new_data;
};

/**
 * Fills in empty fields in a data set.
 *
 * @param {Object} old_data  The original data.
 * @param {Object} params    The generator parameters.
 *
 * @return The data with missing values filled in.
 */
export const fill_empty_fields = (old_data, params) => {
  const new_data = {
    records: [],
    column_info: old_data.column_info,
    filter_info: old_data.filter_info,
  };

  const empty_x_records = [];

  const x_field = is_defined(params) && is_defined(params.type_field) ?
    params.type_field : 'value';

  for (const record of old_data.records) {
    const new_record = {};
    let empty_x = false;
    for (const field in record) {
      if (record[field] || record[field] === 0) {
        new_record[field] = record[field];
      }
      else if (field.lastIndexOf('~original') !== (field.length - 9)) { // eslint-disable-line no-negated-condition
        switch (old_data.column_info.columns[field].data_type) {
          case 'integer':
          case 'decimal':
          case 'cvss':
          case 'unix_time':
            new_record[field] = 0;
            break;
          case 'js_time':
            new_record[field] = new Date(0);
            break;
          default:
            new_record[field] = 'N/A';
        }

        new_record[field + '~original'] = '';

        if (field === x_field) {
          empty_x = true;
        }
      }
      else {
        new_record[field] = '';
      }
    }

    if (empty_x) {
      empty_x_records.push(new_record);
    }
    else {
      new_data.records.push(new_record);
    }
  }

  new_data.records = new_data.records.concat(empty_x_records);

  return new_data;
};

/**
 * Fills in empty records in a data set where the x field contains numbers
 *  that can be increased in fixed steps (e.g. integers in ascending order).
 *
 * @param {Object} old_data  The original data.
 * @param {Object} params    The generator parameters.
 *
 * @return The data with missing values filled in.
 */
export const fill_in_numbered_records = (old_data, params) => {
  const new_data = {
    records: [],
    column_info: old_data.column_info,
    filter_info: old_data.filter_info,
  };

  if (!old_data.records || old_data.records.length === 0) {
    return new_data;
  }

  const x_field = params && params.x_field ? params.x_field : 'value';

  const step = 1;
  const [first_record] = old_data.records;
  let old_index = 0;
  let value = parse_float(first_record[x_field]);
  let prev_record;

  while (old_index < old_data.records.length) {
    const record = old_data.records[old_index];

    if (parse_float(record[x_field]) <= value) {
      new_data.records.push(record);
      prev_record = record;
      old_index++;
    }
    else {
      const new_record = {};
      new_record[x_field] = value;

      for (const field in old_data.column_info.columns) {
        const col_info = old_data.column_info.columns[field];

        if (field === x_field) {
          continue;
        }

        if (col_info.stat === 'c_count') {
          new_record[field] = prev_record[field] ? prev_record[field] : 0;
        }
        else if (col_info.stat === 'count') {
          new_record[field] = 0;
        }
        else {
          new_record[field] = null;
        }
      }

      new_data.records.push(new_record);
    }
    value += step;
  }

  return new_data;
};

/*
  * In-chart link generator functions
  */

/**
 * @summary Helper function to get the list page name for a type
 *
 * @param {String} type  Resource type or subtype
 *
 * @return {String} The resource type as used in cmd=get_[...].
 */
const list_page_name = type => {
  switch (type) {
    case 'allinfo':
      return 'secinfos';
    case 'dfn_cert_adv':
      return 'dfncertadvs';
    case 'cert_bund_adv':
      return 'certbundadvs';
    case 'os':
      return 'operatingsystems';
    case 'vuln':
      return 'vulnerabilities';
    default:
      return type + 's';
  }
};

/**
 * @summary Changes location to a list page
 *
 * @param {string}  type         Resource type or subtype
 * @param {string}  column       Column name
 * @param {string}  value        Column value
 * @param {Object}  filter_info  filter_info from generator
 * @param {string}  relation     The relation to use
 */
export const goto_list_page = (type, column, value, filter_info, relation) => {
  if (!is_defined(relation)) {
    relation = '=';
  }

  // Get "real" type and plural
  const page = list_page_name(type);

  let result = '/ng/' + page + '?filter=';

  // Create new column filter keyword(s)
  let criteria_addition = '';
  if (relation === '=') {
    if (column === 'severity') {
      switch (value) {
        case 'High':
          criteria_addition += 'severity>' + severity_levels.max_medium;
          break;
        case 'Medium':
          criteria_addition += 'severity>' + severity_levels.max_low +
          ' and severity<' + severity_levels.min_high;
          break;
        case 'Low':
          criteria_addition += 'severity>' + severity_levels.max_log +
          ' and severity<' + severity_levels.min_medium;
          break;
        case 'Log':
          if (severity_levels.max_log === 0.0) {
            criteria_addition += 'severity=0';
          }
          else {
            criteria_addition += 'severity>-1 and severity<' +
              severity_levels.min_low;
          }
          break;
        case '':
        case 'N/A':
          criteria_addition += 'severity=""';
          break;
        case '0':
          criteria_addition += 'severity=0';
          break;
        default:
          const severity = parse_float(value);
          if (!is_defined(severity)) {
            criteria_addition += 'severity=' + value;
          }
          else if (severity >= 10.0) {
            criteria_addition += 'severity>9.0';
          }
          else {
            criteria_addition += 'severity>' + (severity - 1.0).toFixed(1) +
              ' and severity<' + (severity + 0.1).toFixed(1);
          }
      }
    }
    else {
      criteria_addition += column + '="' + value + '"';
    }
  }
  else if (relation === 'range') {
    criteria_addition = column + '>' + value[0] +
        ' and ' + column + '<' + value[1];
  }
  else {
    criteria_addition += column + relation + '"' + value + '"';
  }

  // Add other criteria
  let new_criteria = '';
  for (const i in filter_info.criteria) {
    const current_keyword = filter_info.criteria[i];
    if (i > 0) {
      new_criteria += ' ';
    }

    if (current_keyword.column === '') {
      if (current_keyword.relation === '=') {
        new_criteria += '=' + current_keyword.value;
      }
      else {
        new_criteria += current_keyword.value;
      }
    }
    else {
      new_criteria += current_keyword.column + current_keyword.relation +
        current_keyword.value;
    }

    if (current_keyword.value !== 'and' && current_keyword.value !== 'or' &&
        current_keyword.value !== 'not' &&
        // last keyword was not an "and" operator
        (i <= 0 || filter_info.criteria[i - 1].value !== 'and' ||
          filter_info.criteria[i - 1].column !== '')) {
      new_criteria += ' and ' + criteria_addition;
    }
  }

  if (is_defined(filter_info.criteria) && filter_info.criteria.length === 0) {
    new_criteria = criteria_addition;
  }

  result += new_criteria;

  history.push(result);
};

/**
 * @summary Helper function to get the details page name for a type
 *
 * @param {String}  type         Resource type or subtype
 *
 * @return {String} The resource type as used in cmd=get_[...].
 */
const details_page_name = type => {
  switch (type) {
    case 'dfn_cert_adv':
      return 'dfncertadv';
    case 'cert_bund_adv':
      return 'certbundadv';
    case 'os':
      return 'operatingsystem';
    default:
      return type;
  }
};

/**
 * @summary Changes location to a details page
 *
 * @param {String} type Resource type or subtype
 * @param {String} id   id of the resource to get
 */
export const goto_details_page = (type, id) => {
  const page = details_page_name(type);

  history.push('/ng/' + page + '/' + id);
};

/*
  * Generic display helper functions
  */

/**
 * Opens a popup window for a detached chart.
 *
 * @param {String} url  URL of the detached chart.
 *
 * @returns false
 */
export const open_detached = url => {
  const new_window = window.open(url, '', 'width=460, height=340');
  new_window.fit_window = true;
  return false;
};

/**
 * Creates a listener that resizes a chart display to fill the whole window.
 *
 * @param {Dashboard} dashboard   The dashboard this applies to.
 *
 * @returns {Function}
 */
export const detached_chart_resize_listener = dashboard => {
  return function() {
    const height = window.innerHeight -
      Number(d3.select('.gsa-footer').property('clientHeight')) +
      Number(d3.select('#applied_filter').property('clientHeight')) - 20;
    dashboard.resize(height, undefined, true);
  };
};

/**
 * Wraps SVG text at a given width.
 *
 * @param {D3Selection} text_selection  A d3 selection of the text.
 * @param {Number}      width           The maximum width to wrap the text at.
 */
export const wrap_text = (text_selection, width) => {
  /*
    * Test if the node is not in the document yet because this would cause an
    *  error in Internet Explorer when calling getComputedTextLength.
    */
  if (!document.body.contains(text_selection.node())) {
    return;
  }

  text_selection.each(function() {
    const text = d3.select(this);
    const words = text.text().match(/[^\s-]+[\s-]*/g).reverse();
    const line_height = 1.2; // em
    const x = text.attr('x');
    const y = text.attr('y');

    let tspan = text.text(null).append('tspan')
      .attr('x', x)
      .attr('y', y);

    let line_number = 0;
    let line = [];
    for (let word = words.pop(); is_defined(word); word = words.pop()) {
      line.push(word);
      tspan.text(line.join(''));

      if (tspan.node().getComputedTextLength() > width) {
        if (line.length > 1) {
          line.pop();
          tspan.text(line.join(''));
          line = [word];
        }
        else {
          tspan.text(line.join(''));
          line.pop();
        }

        tspan = text.append('tspan')
          .attr('x', x)
          .attr('y', y)
          .attr('dy', ++line_number * line_height + 'em')
          .text(line.join(''));
      }
    }
  });
};

/*
  * Data export helpers
  */

/**
 * Generates CSV data from simple records.
 *
 * @param {Array}  records       The records from the data set.
 * @param {Object} column_info   The column_info from the data set.
 * @param {Array}  columns       The columns to output.
 * @param {Object} headers       Column headers to output.
 * @param {String} title         The title
 *
 * @return  A string containing the data in CSV format.
 */
export const csv_from_records = (records, column_info, columns, headers,
    title) => {
  let csv_data = '';

  if (is_defined(title)) {
    csv_data += title + '\r\n';
  }

  if (is_defined(headers)) {
    for (const col_i in headers) {
      csv_data += '"' + String(headers[col_i]).replace('"', '""') + '"';
      if (col_i < columns.length - 1) {
        csv_data += ',';
      }
    }
    csv_data += '\r\n';
  }

  for (const record of records) {
    for (const col_i in columns) {
      const col = columns[col_i];
      const value = record[col];

      if (has_value(value)) {
        if (is_defined(column_info)) {
          csv_data += '"' + format_data(value, column_info.columns[col])
            .replace('"', '""') + '"';
        }
        else {
          csv_data += '"' + value.replace('"', '""') + '"';
        }
      }
      else {
        csv_data += '""';
      }

      if (col_i < columns.length - 1) {
        csv_data += ',';
      }
    }
    csv_data += '\r\n';
  }

  return csv_data;
};

/**
 * Generates HTML data from simple records.
 *
 * @param {Array}  records       The records from the data set.
 * @param {Object} column_info   The column_info from the data set.
 * @param {Array}  columns       The columns to output.
 * @param {Object} headers       Column headers to output.
 * @param {String} title         A title for the whole table.
 * @param {String} filter        The filter term to be shown in the table footer.
 *
 * @return  A string containing the data in as a HTML table.
 */
export const html_table_from_records = (records, column_info, columns,
    headers, title, filter) => {
  const doc = document.implementation.createDocument(
    'http://www.w3.org/1999/xhtml', 'html', null);
  const head_s = d3.select(doc.documentElement).append('head');
  const body_s = d3.select(doc.documentElement).append('body');

  let row_class = 'odd';

  let href;
  for (let sheet_i = 0; sheet_i < document.styleSheets.length; sheet_i++) {
    href = document.styleSheets[sheet_i].href;

    if (!has_value(href)) {
      continue;
    }

    if (href.match(/\/main\.[0-9a-z]*\.css$/) ||
        href.match(/\/gsa-style.css$/)) {
      break;
    }
  }

  head_s.append('title')
    .text(_('Greenbone Security Assistant - Chart data table'));

  head_s.append('link')
    .attr('href', href)
    .attr('type', 'text/css')
    .attr('rel', 'stylesheet');

  body_s.style('padding', '10px');

  const table_s = body_s.append('table')
    .attr('cellspacing', '2')
    .attr('cellpadding', '4')
    .attr('border', '0')
    .attr('class', 'gbntable');

  table_s.append('tr')
    .attr('class', 'gbntablehead1')
    .append('td')
      .attr('colspan', headers.length)
      .text(title);

  if (is_defined(headers)) {
    const tr_s = table_s.append('tr')
      .attr('class', 'gbntablehead2');
    for (const col_i in headers) {
      tr_s.append('td').text(headers[col_i]);
    }
  }

  for (const record of records) {
    const tr_s = table_s.append('tr')
      .attr('class', row_class);

    for (const col_i in columns) {
      const col = columns[col_i];

      if (is_defined(column_info)) {
        tr_s.append('td')
          .text(format_data(record[col], column_info.columns[col]));
      }
      else {
        tr_s.append('td').text(record[col]);
      }
    }

    row_class = row_class === 'odd' ? 'even' : 'odd';
  }

  if (is_defined(filter)) {
    body_s.append('p')
      .attr('class', 'footnote')
      .text(_('Applied filter: {{filter}}', {filter}));
  }

  return doc.documentElement.outerHTML;
};

/**
 * Clone an SVG element with some modifications for export like replacing
 *  "a" elements and removing elements with the class "remove_on_static".
 *
 * @param {DOMElement} elem  The element to clone.
 *
 * @return A clone of the svg element.
 */
export const clone_svg = elem => {
  if ($(elem).hasClass('remove_on_static')) {
    return undefined;
  }

  // replace "a" elems with "g"
  // Use createElementNS to ensure correct capitalization of tagName.
  const clone = elem.tagName === 'a' ?
    $(document.createElementNS('http://www.w3.org/2000/svg', 'g')) :
    $(document.createElementNS('http://www.w3.org/2000/svg', elem.tagName));

  for (let attr_index = 0; attr_index < elem.attributes.length; attr_index++) {
    const attribute = elem.attributes[attr_index];
    if (attribute.name !== 'href' || elem.tagName !== 'a') {
      let prefix;

      if (attribute.prefix) {
        prefix = attribute.prefix;
      }
      else if (attribute.name === 'href') {
        prefix = 'xlink'; // Workaround for missing attribute prefix
      }

      // Remove quotes from "url(...)" styles.
      const value = attribute.value.replace(/"/g, '');

      clone.attr(is_defined(prefix) ? prefix + ':' + attribute.name :
        attribute.name, value);
    }
  }

  for (let child_index = 0; child_index < elem.childNodes.length;
      child_index++) {

    const child = elem.childNodes[child_index];
    switch (child.nodeType) {
      case Node.ELEMENT_NODE:
        clone.append(clone_svg(child));
        break;
      default:
        clone.append(child.cloneNode());
    }
  }
  return clone[0];
};

/**
 * Convert SVG element to export format.
 *
 * @param {SVGElement} svg_elem  The svg element.
 * @param {String}     title     The title of the chart added at the top.
 *
 * @return The svg element as text.
 */
export const svg_from_elem = (svg_elem, title) => {
  /*
    * FIXME: Consider moving chart styles to extra CSS file to reduce SVG size.
    *        Axes are only shown correctly in programs more "dedicated" to SVG
    *         like browsers and Inkscape: Lines with ticks become black boxes
    *         elsewhere. Workaround: Save copy as "plain SVG" in Inkscape.
    */
  const width = parse_int(svg_elem.attr('width'));
  const height = parse_int(svg_elem.attr('height'));

  let stylesheet;
  let css_text = '';
  for (let sheet_i = 0; !is_defined(stylesheet) &&
      sheet_i < document.styleSheets.length; sheet_i++) {
    const sheet_url = document.styleSheets[sheet_i].href;

    if (!has_value(sheet_url)) {
      continue;
    }

    if (sheet_url.match(/\/main\.[0-9a-z]*\.css$/) ||
        sheet_url.match(/\/gsa-style.css$/)) {
      stylesheet = document.styleSheets[sheet_i];

      for (let i = 0; i < stylesheet.cssRules.length; i++) {
        css_text += stylesheet.cssRules[i].cssText;
      }
    }
  }

  let title_xml = '';
  if (is_defined(title) && title !== '') {
    title_xml += '<text x="' + (width / 2) + '" y="0"' +
      ' text-anchor="middle"' +
      ' style="font-weight: bold; font-size: 12px">' +
      title +
      '</text>';
  }

  const svg_clone = d3.select(clone_svg(svg_elem.node()));

  let defs = svg_clone.selectAll('defs');
  if (defs.empty()) {
    defs = svg_clone.insert('defs', ':first-child');
  }

  defs.insert('style')
    .attr('type', 'text/css')
    .html(css_text);

  // create SVG
  const svg_data = '<?xml version="1.0" encoding="UTF-8"?>' +
    '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.0//EN" ' +
    '"http://www.w3.org/TR/SVG/DTD/svg10.dtd"> ' +
    '<svg xmlns="http://www.w3.org/2000/svg"' +
    ' xmlns:xlink="http://www.w3.org/1999/xlink"' +
    ' viewBox="0 ' + (is_defined(title) ? '0' : '-14') + ' ' + width + ' ' +
    height + '"' +
    ' width="' + width + '"' +
    ' height="' + (height + (is_defined(title) ? 0 : 14)) + '">' +
    svg_clone.html() + title_xml +
    '</svg>';
  return svg_data;
};

/**
 * Shows a blob URL inside an img element in a new window.
 *
 * @param {String} blob_url  The blob URL to show.
 */
export const blob_img_window = blob_url => {
  const new_window = window.open('', '_blank');

  d3.select(new_window.document)
      .select('body')
        .insert('img')
          .attr('src', blob_url);
  return;
};

export const array_sum = array => {
  if (!is_array(array) || array.length === 0) {
    return 0;
  }

  if (Array.prototype.reduce) {
    return array.reduce(function(a, b) {
      return a + b;
    });
  }

  let sum = 0;
  for (const val of array) {
    sum += val;
  }
  return sum;
};

// vim: set ts=2 sw=2 tw=80:
