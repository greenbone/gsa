/*
 * Greenbone Security Assistant
 * $Id$
 * Description: JavaScript helper functions for charts in GSA.
 *
 * Authors:
 * Timo Pollmeier <timo.pollmeier@greenbone.net>
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2014 - 2016 Greenbone Networks GmbH
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

(function(global, window, document, gsa, d3, $, console, X2JS) {
  'use strict';

  if (!gsa.is_defined(gsa.charts)) {
    gsa.charts = {};
  }
  var gch = gsa.charts;

  /*
   * Global lists
   */

  // Global list of chart generator classes
  if (!gsa.is_defined(gch.chart_generators)) {
    gch.chart_generators = {};
  }

  /*
   * Time formatter objects
   */
  // Default date and time formats
  gch.date_format = d3.time.format.utc('%Y-%m-%d');
  gch.datetime_format = d3.time.format.utc('%Y-%m-%d %H:%M');
  gch.iso_time_format = d3.time.format.utc('%Y-%m-%dT%H:%M');

  /*
   * Generic chart styling helpers
   */

  /* Color scales */

  /**
   * Gets a d3 color scale for values of a specific column and resource type.
   *
   * @param type    The resource type.
   * @param column  The column,
   *
   * @return  The color scale function for the column and type.
   */
  gch.field_color_scale = function field_color_scale(type, column) {
    var scale = d3.scale.ordinal();

    var red = d3.interpolateHcl('#d62728', '#ff9896');
    var green = d3.interpolateHcl('#2ca02c', '#98df8a');
    var blue = d3.interpolateHcl('#aec7e8', '#1f77b4');
    var orange = d3.interpolateHcl('#ff7f0e', '#ffbb78');
    var yellow = d3.interpolateHcl('#ad9e39', '#ffff99');
    var red_yellow = d3.interpolateHcl('#d62728', '#ffff8e');

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
  gch.severity_level_color_scale =
    gch.field_color_scale(undefined, 'severity_level');

  /**
   * Create a color scales for a color for each field name. If alt_color_limit
   *  is defined, the fields starting at that index will use alternate (lighter
   *  or darker) colors.
   *
   * @param {array}  y_fields         An array containing the field names.
   * @param {object} column_info      The column info object of the dataset
   * @param {number} alt_color_limit  Index at which alternate colors are used
   *
   * A d3 color scale for the field names given
   */
  gch.field_name_colors = function field_name_colors(y_fields, column_info,
                                      alt_color_limit) {
    var range = [];
    var scale = d3.scale.ordinal();
    var subgroup_scale;

    if (column_info.group_columns && column_info.group_columns[1]) {
      var type = column_info.columns.subgroup_value.type;
      var column = column_info.group_columns[1];
      subgroup_scale = gch.field_color_scale(type, column);
    }

    for (var index in y_fields) {
      var field_info = column_info.columns[y_fields[index]];
      var color = 'green';

      if (gsa.is_defined(field_info.subgroup_value)) {
        color = subgroup_scale(field_info.subgroup_value);
      }
      else if ((y_fields.length <= 1 && !gsa.is_defined(alt_color_limit)) ||
               y_fields.length - alt_color_limit <= 1) {
        color = 'green';
      }
      else if (gsa.is_defined(field_info.stat)) {
        if (field_info.stat === 'max') {
          color = '#ff7f0e';
        }
        else if (field_info.stat === 'min') {
          color = '#9467bd';
        }
        else if (field_info.stat === 'sum') {
          color = '#7f7f7f';
        }
      }

      if (!gsa.is_defined(alt_color_limit) || index < alt_color_limit) {
        range.push(color);
      }
      else if (d3.lab(color).l >= 70) {
        range.push(d3.rgb(color).darker().toString());
      }
      else {
        range.push(d3.rgb(color).brighter().toString());
      }
    }

    scale.domain(y_fields);
    scale.range(range);

    return scale;
  };

  /*
   * Severity gradient.
   */
  gch.severity_colors_gradient = function severity_colors_gradient() {
    return d3.scale.linear()
              .domain([-1.0,
                        gsa.severity_levels.max_log,
                        gsa.severity_levels.min_low,
                        (gsa.severity_levels.min_low +
                         gsa.severity_levels.max_low) / 2,
                        gsa.severity_levels.max_low,
                        gsa.severity_levels.min_medium,
                        (gsa.severity_levels.min_medium +
                         gsa.severity_levels.max_medium) / 2,
                        gsa.severity_levels.max_medium,
                        gsa.severity_levels.min_high,
                        (gsa.severity_levels.min_high + 10.0) / 2,
                        10.0])
              .range([d3.hcl('grey'),       // False Positive
                      d3.hcl('silver'),     // Log
                      d3.hcl('#b1cee9'),    // minimum Low
                      d3.hcl('#87CEEB'),    // middle Low
                      d3.hcl('#a5e59d'),    // maximum Low
                      d3.hcl('#ffde00'),    // minimum Medium
                      d3.hcl('#FFA500'),    // middle Medium
                      d3.hcl('#f57b00'),    // maximum Medium
                      d3.hcl('#eb5200'),    // minimum High
                      d3.hcl('#D80000'),    // middle High
                      d3.hcl('#ff0000')]);  // maximum High);
  };

  /* Bar CSS styles */

  /**
   * Creates a severity bar chart style.
   *
   * @param       Name of the field containing the severity.
   * @max_log     Maximum CVSS score for "Log" severity.
   * @max_low     Maximum CVSS score for "Low" severity.
   * @max_medium  Maximum CVSS score for "Medium" severity.
   *
   * @return  Function returning the CSS style for a CVSS score.
   */
  gch.severity_bar_style = function severity_bar_style(field, max_log, max_low,
                                        max_medium) {
    var medium_high_color = d3.interpolateHcl('#D80000', 'orange')(0.5);
    var low_medium_color = d3.interpolateHcl('orange', 'skyblue')(0.5);
    var log_low_color = d3.interpolateHcl('skyblue', 'silver')(0.5);

    var func = function(d) {
      if (Number(d[field]) > Math.ceil(max_medium)) {
        return ('fill: #D80000');
      }
      else if (Number(d[field]) > max_medium) {
        return ('fill: ' + medium_high_color);
      }
      else if (Number(d[field]) > Math.ceil(max_low)) {
        return ('fill: orange');
      }
      else if (Number(d[field]) > max_low) {
        return ('fill: ' + low_medium_color);
      }
      else if (Number(d[field]) > Math.ceil(max_log)) {
        return ('fill: skyblue');
      }
      else if (Number(d[field]) > max_log) {
        return ('fill: ' + log_low_color);
      }
      else {
        return ('fill: silver');
      }
    };
    func.max_low = max_low;
    func.max_medium = max_medium;
    func.field = field;
    return func;
  };

  /*
   * Data Source Helper functions
   */

  /**
   * Extracts records from XML
   *
   * @param data  The root node of the XML to extract the data from.
   *
   * @return  An array of records as used by chart generators.
   */
  gch.extract_simple_records = function(data) {
    var date_regex = /^\d{4}-(0\d|1[0-2])-([0-2]\d|3[01])T([0-1]\d|2[0-3]):[0-5]\d(:[0-5]\d)?([+-](0\d|1[0-4]):[0-5]\d|Z|)$/;
    var records = [];

    function get_date(elem) {
      return new Date(elem.text().substr(0, 19) + 'Z');
    }

    function get_float(elem) {
      return parseFloat(elem.text());
    }

    function set_record_value(record, field_name, elem) {
      if (!isNaN(get_float(elem)) && isFinite(elem.text())) {
        record[field_name] = get_float(elem);
      }
      else {
        set_text_record_value(record, field_name, elem);
      }
    }

    function set_text_record_value(record, field_name, elem) {
      if (elem.text().match(date_regex)) {
        record[field_name] = get_date(elem);
      }
      else {
        record[field_name] = elem.text();
      }
    }

    data.each(function() {
      var record = {};
      d3.select(this)
        .selectAll('value, count, c_count, stats, text')
        .each(function() {
          var elem = d3.select(this);
          var in_subgroup = (this.parentNode.localName === 'subgroup');
          var subgroup_value;

          if (in_subgroup) {
            subgroup_value = d3.select(this.parentNode).select('value').text();
          }
          if (this.localName === 'stats') {
            var col_name = elem.attr('column');

            elem.selectAll('*').each(function() {
              var child = d3.select(this);
              var field_name = col_name + '_' + this.localName;

              if (in_subgroup) {
                field_name = field_name + '[' + subgroup_value + ']';
              }

              set_record_value(record, field_name, child);
            });
          }
          else if (this.localName === 'text') {
            set_text_record_value(record, elem.attr('column'), elem);
          }
          else {
            var field_name = this.localName;
            if (in_subgroup) {
              field_name = field_name + '[' + subgroup_value + ']';
            }

            set_record_value(record, field_name, elem);
          }
        });
      records.push(record);
    });
    return records;
  };

  gch.extract_simple_records_json = function(data) {
    var date_regex = /^\d{4}-(0\d|1[0-2])-([0-2]\d|3[01])T([0-1]\d|2[0-3]):[0-5]\d(:[0-5]\d)?([+-](0\d|1[0-4]):[0-5]\d|Z|)$/;
    var records = [];

    function get_date(value) {
      return new Date(value.substr(0, 19) + 'Z');
    }

    function set_record_value(record, field_name, value) {
      var f_value = gsa.parse_float(value);
      if (gsa.is_float_string(value, f_value)) {
        record[field_name] = f_value;
      }
      else {
        set_text_record_value(record, field_name, value);
      }
    }

    function set_text_record_value(record, field_name, value) {
      if (gsa.is_string(value) && value.match(date_regex)) {
        record[field_name] = get_date(value);
      }
      else {
        record[field_name] = value;
      }
    }

    function set_values(record, group, subgroup_value) {
      var field_name;
      var name;
      var fields = ['value', 'count', 'c_count'];

      fields.forEach(function(name) {
        var value = group[name];

        if (gsa.is_defined(value)) {
          field_name = gsa.is_defined(subgroup_value) ?
            name + '[' + subgroup_value + ']' : name;

          set_record_value(record, field_name, value);
        }
      });

      gsa.for_each(group.subgroup, function(subgroup) {
        set_values(record, subgroup, subgroup.value);
      });

      gsa.for_each(group.text, function(text) {
        set_text_record_value(record, text._column, text.__text);
      });

      gsa.for_each(group.stats, function(stats) {
        var col_name = stats._column;
        for (var child in stats) {
          if (child[0] === '_') {
            continue;
          }

          name = col_name + '_' + child;
          field_name = gsa.is_defined(subgroup_value) ?
            name + '[' + subgroup_value + ']' : name;
          set_record_value(record, field_name, stats[child]);
        }
      });
    }

    gsa.for_each(data, function(group) {
      var record = {};

      set_values(record, group);

      records.push(record);
    });

    return records;
  };

  /**
   * Extracts column info from XML.
   *
   * @param xml_data    The root node of the XML to extract the data from.
   * @param gen_params  Generator parameters.
   *
   * @return  A column_info object as used by chart generators.
   */
  gch.extract_column_info = function(xml_data, gen_params) {
    var column_info = {
      group_columns: [],
      subgroup_columns: [],
      data_columns: [],
      text_columns: [],
      columns: {},
      subgroups: [],
    };

    xml_data.selectAll('aggregate subgroups value').each(function() {
      column_info.subgroups.push(d3.select(this).text());
    });

    xml_data.selectAll(
        'aggregate column_info aggregate_column').each(function() {
      var column = {};
      d3.select(this)
        .selectAll('*')
        .each(function() {
          if (!isNaN(parseFloat(d3.select(this).text())) &&
              isFinite(d3.select(this).text())) {
            column[this.localName] =
              parseFloat(d3.select(this).text());
          }
          else {
            column[this.localName] =
              d3.select(this).text();
          }
        });
      column_info.columns[column.name] = column;
      for (var i = 0; i < column_info.subgroups.length; i++) {
        // Create copies of columns for subgroups
        if (column.name !== 'value' && column.name !== 'subgroup_value') {
          var column_copy = {};
          var copy_name = column.name + '[' + column_info.subgroups[i] + ']';
          for (var prop in column) {
            column_copy[prop] = column[prop];
          }
          column_copy.name = copy_name;
          column_copy.subgroup_value = column_info.subgroups[i];
          column_info.columns[copy_name] = column_copy;
        }
      }
    });

    for (var i = 0; i < column_info.subgroups.length; i++) {
      // Create copies of subgroup_value column for individual subgroups
      var column_copy = {};
      var copy_name = 'value[' + column_info.subgroups[i] + ']';
      for (var prop in column_info.columns.subgroup_value) {
        column_copy[prop] = column_info.columns.subgroup_value[prop];
      }
      column_copy.name = copy_name;
      column_copy.subgroup_value = column_info.subgroups[i];
      column_info.columns[copy_name] = column_copy;
    }

    xml_data.selectAll('aggregate group_column').each(function() {
      column_info.group_columns.push(d3.select(this).text());
    });

    xml_data.selectAll('aggregate subgroup_column').each(function() {
      column_info.group_columns.push(d3.select(this).text());
    });

    xml_data.selectAll('aggregate data_column').each(function() {
      column_info.data_columns.push(d3.select(this).text());
    });

    xml_data.selectAll('aggregate text_column').each(function() {
      column_info.text_columns.push(d3.select(this).text());
    });

    if (gen_params) {
      var add_missing_column = function(field) {
        if (gsa.is_defined(column_info.columns[field])) {
          return;
        }

        if (field.indexOf('[') !== -1 && field.lastIndexOf(']') !== -1) {
          var base = field.substr(0, field.indexOf('['));
          var subgroup = field.substr(field.indexOf('[') + 1,
              field.lastIndexOf(']') - field.indexOf('[') - 1);
          var base_column = column_info.columns[base];

          if (gsa.is_defined(base_column)) {
            var column_copy = {};
            var copy_name = base + '[' + subgroup + ']';
            for (var prop in base_column) {
              column_copy[prop] = base_column[prop];
            }
            column_copy.name = copy_name;
            column_copy.subgroup_value = subgroup;
            column_info.columns[copy_name] = column_copy;
          }
          else {
            console.warn('Could not find base column info "' + base +
                '" for "' + field + '"');
          }
        }
      };

      var index;
      var field;

      if (gen_params.y_fields) {
        for (index = 0; index < gen_params.y_fields.length; index++) {
          field = gen_params.y_fields[index];
          if (!gsa.is_defined(column_info.columns[field])) {
            add_missing_column(field);
          }
        }
      }

      if (gen_params.z_fields) {
        for (index = 0; index < gen_params.z_fields.length; index++) {
          field = gen_params.z_fields[index];
          if (!gsa.is_defined(column_info.columns[field])) {
            add_missing_column(field);
          }
        }
      }

    }
    return column_info;
  };

  /**
   * Extracts column info from JSON.
   *
   * @param data        The root aggregate object
   * @param gen_params  Generator parameters.
   *
   * @return  A column_info object as used by chart generators.
   */
  gch.extract_column_info_json = function(data, gen_params) {
    var column_info = {
      group_columns: [],
      subgroup_columns: [],
      data_columns: [],
      text_columns: [],
      columns: {},
      subgroups: [],
    };

    function add_missing_column(field) {
      if (field.indexOf('[') !== -1 && field.lastIndexOf(']') !== -1) {
        var base = field.substr(0, field.indexOf('['));
        var subgroup = field.substr(field.indexOf('[') + 1,
            field.lastIndexOf(']') - field.indexOf('[') - 1);
        var base_column = column_info.columns[base];

        if (gsa.is_defined(base_column)) {
          var column_copy = {};
          var copy_name = base + '[' + subgroup + ']';
          for (var prop in base_column) {
            column_copy[prop] = base_column[prop];
          }
          column_copy.name = copy_name;
          column_copy.subgroup_value = subgroup;
          column_info.columns[copy_name] = column_copy;
        }
        else {
          console.warn('Could not find base column info "' + base +
              '" for "' + field + '"');
        }
      }
    }

    if (gsa.is_defined(data.subgroups)) {
      gsa.for_each(data.subgroups.value, function(value) {
        column_info.subgroups.push(value);
      });
    }

    gsa.for_each(data.group_column, function(value) {
      column_info.group_columns.push(value);
    });

    gsa.for_each(data.subgroup_column, function(value) {
      column_info.group_columns.push(value);
    });

    gsa.for_each(data.data_column, function(value) {
      column_info.data_columns.push(value);
    });

    gsa.for_each(data.text_column, function(value) {
      column_info.text_columns.push(value);
    });

    gsa.for_each(data.column_info.aggregate_column, function(entry) {
      var column = {};

      for (var name in entry) {
        var value = entry[name];
        var f_value = gsa.parse_float(value);
        if (gsa.is_float_string(value, f_value)) {
          value = f_value;
        }
        column[name] = value;
      }

      column_info.columns[column.name] = column;
      if (column.name !== 'value' && column.name !== 'subgroup_value') {
        column_info.subgroups.forEach(function(subgroup) {
          // Create copies of columns for subgroups
          var column_copy = {};
          var copy_name = column.name + '[' + subgroup + ']';
          for (var prop in column) {
            column_copy[prop] = column[prop];
          }
          column_copy.name = copy_name;
          column_copy.subgroup_value = subgroup;
          column_info.columns[copy_name] = column_copy;
        });
      }
    });

    if (gen_params) {
      gsa.for_each(['y_fields', 'z_fields'], function(name) {
        var fields = gen_params[name];
        gsa.for_each(fields, function(field) {
          if (!gsa.is_defined(column_info.columns[field])) {
            add_missing_column(field);
          }
        });
      });
    }
    return column_info;
  };

  /**
   * Prepares column info for get_tasks.
   *
   * @return  A column_info object as used by chart generators.
   */
  gch.tasks_column_info = function() {
    return {
      columns: {
        id: {
          name: 'id',
          stat: 'value',
          type: 'task',
          column: 'id',
          data_type: 'uuid'
        },
        name: {
          name: 'name',
          stat: 'value',
          type: 'task',
          column: 'name',
          data_type: 'text'
        },
        schedule_id: {
          name: 'schedule_id',
          stat: 'value',
          type: 'task',
          column: 'schedule_id',
          data_type: 'uuid'
        },
        schedule_name: {
          name: 'schedule_name',
          stat: 'value',
          type: 'task',
          column: 'schedule_name',
          data_type: 'text'
        },
        schedule_next_time: {
          name: 'schedule_next_time',
          stat: 'value',
          type: 'task',
          column: 'schedule_next_time',
          data_type: 'iso_time'
        },
        schedule_trash: {
          name: 'schedule_trash',
          stat: 'value',
          type: 'task',
          column: 'schedule_trash',
          data_type: 'integer'
        },
        schedule_first_time: {
          name: 'schedule_first_time',
          stat: 'value',
          type: 'task',
          column: 'schedule_first_time',
          data_type: 'iso_time'
        },
        schedule_period: {
          name: 'schedule_period',
          stat: 'value',
          type: 'task',
          column: 'schedule_period',
          data_type: 'integer'
        },
        schedule_period_months: {
          name: 'schedule_period_months',
          stat: 'value',
          type: 'task',
          column: 'schedule_period_months',
          data_type: 'integer'
        },
        schedule_duration: {
          name: 'schedule_duration',
          stat: 'value',
          type: 'task',
          column: 'schedule_duration',
          data_type: 'integer'
        },
        schedule_periods: {
          name: 'schedule_periods',
          stat: 'value',
          type: 'task',
          column: 'schedule_periods',
          data_type: 'integer'
        }
      }
    };
  };

  /**
   * Extracts host topology data from XML.
   *
   * @param xml_data  The root node of the XML to extract the data from.
   *
   * @return  An array of records as used by chart generators.
   */
  gch.extract_host_topology_data = function(xml_data) {
    var nodes = [];
    var nodes_by_link_id = {};
    var links = [];
    var data = {
      nodes: nodes,
      nodes_by_link_id: nodes_by_link_id,
      links: links
    };
    var assets = xml_data.selectAll('get_assets_response asset');

    // Create nodes for each host
    assets.each(function() {
      var asset_elem = d3.select(this);
      var new_host = {};
      new_host.type = 'host';
      new_host.hostname = null;
      new_host.os = null;
      new_host.os_cpe = null;
      new_host.traceroute = null;
      new_host.link_id = asset_elem.select('asset>name').text();
      new_host.name = asset_elem.select('asset>name').text();
      new_host.id = asset_elem.attr('id');
      new_host.severity = Number(asset_elem.select('severity>value').text());
      new_host.is_scanner = false;
      new_host.in_links = [];
      new_host.out_links = [];

      var identifiers = asset_elem.selectAll('identifiers>identifier');
      identifiers.each(function() {
        var identfier = d3.select(this);
        switch (identfier.select('name').text()) {
          case 'hostname':
            if (new_host.hostname === null) {
              new_host.hostname = identfier.select('value').text();
            }
            break;
        }
      });

      var host_details = asset_elem.selectAll('host detail');
      host_details.each(function() {
        var detail = d3.select(this);
        switch (detail.select('name').text()) {
          case 'traceroute':
            if (new_host.traceroute === null) {
              new_host.traceroute = detail.select('value').text();
            }
            break;
          case 'best_os_txt':
            if (new_host.os === null) {
              new_host.os = detail.select('value').text();
            }
            break;
          case 'best_os_cpe':
            if (new_host.os_cpe === null) {
              new_host.os_cpe = detail.select('value').text();
            }
            break;
        }
      });
      nodes.push(new_host);
      nodes_by_link_id[new_host.link_id] = new_host;
    });

    // Create links between host;
    for (var node_index = 0; node_index < nodes.length; node_index++) {
      var host = nodes[node_index];

      if (host.traceroute !== null) {
        var route_split = host.traceroute.split(',');
        for (var hop_index = 0; hop_index < route_split.length - 1;
            hop_index++) {
          var new_link = {};
          var source_ip = route_split[hop_index];
          var target_ip = route_split[hop_index + 1];
          var new_host;

          // Create source node if its IP address is not in the list.
          if (!gsa.is_defined(nodes_by_link_id[source_ip])) {
            new_host = {};
            new_host.type = 'host';
            new_host.hostname = null;
            new_host.os = null;
            new_host.os_cpe = null;
            new_host.traceroute = null;
            new_host.link_id = source_ip;
            new_host.name = source_ip;
            new_host.id = null;
            new_host.severity = null;
            new_host.in_links = [];
            new_host.out_links = [];
            nodes.push(new_host);
            nodes_by_link_id[new_host.link_id] = new_host;
          }

          // Create target node if its IP address is not in the list.
          if (!gsa.is_defined(nodes_by_link_id[target_ip])) {
            new_host = {};
            new_host.type = 'host';
            new_host.hostname = null;
            new_host.os = null;
            new_host.os_cpe = null;
            new_host.traceroute = null;
            new_host.link_id = target_ip;
            new_host.name = target_ip;
            new_host.id = null;
            new_host.severity = null;
            new_host.in_links = [];
            new_host.out_links = [];
            nodes.push(new_host);
            nodes_by_link_id[new_host.link_id] = new_host;
          }

          new_link.source = nodes_by_link_id[source_ip];
          new_link.target = nodes_by_link_id[target_ip];

          links.push(new_link);
          new_link.target.in_links.push (new_link);
          new_link.source.out_links.push (new_link);
        }

        // Mark first node in route as scanner
        if (gsa.is_defined(nodes_by_link_id[route_split[0]])) {
          nodes_by_link_id[route_split[0]].is_scanner = true;
        }
      }
    }

    return data;
  };

  /**
   * Extracts host topology data from assets response data
   *
   * @param data  The assets response object
   *
   * @return  An array of records as used by chart generators.
   */
  gch.extract_host_topology_data_json = function(data) {
    var nodes = [];
    var nodes_by_link_id = {};
    var links = [];
    var links_by_link_ids = {};
    var records = {
      nodes: nodes,
      nodes_by_link_id: nodes_by_link_id,
      links: links,
      links_by_link_ids: links_by_link_ids,
    };

    gsa.for_each(data.asset, function(asset) {
      var new_host = {
        type: 'host',
        hostname: null,
        os: null,
        os_cpe: null,
        traceroute: null,
        link_id: asset.name,
        name: asset.name,
        id: asset._id,
        severity: asset.host.severity.value,
        is_scanner: false,
        in_links: [],
        out_links: [],
      };

      var identifiers = asset.identifiers.identifier;
      gsa.for_each(identifiers, function(identifier) {
        switch (identifier.name) {
          case 'hostname':
            if (new_host.hostname === null) {
              new_host.hostname = identifier.value;
            }
            break;
        }
      });

      var host_details = asset.host.detail;
      gsa.for_each(host_details, function(detail) {
        switch (detail.name) {
          case 'traceroute':
            if (new_host.traceroute === null) {
              new_host.traceroute = detail.value;
            }
            break;
          case 'best_os_txt':
            if (new_host.os === null) {
              new_host.os = detail.value;
            }
            break;
          case 'best_os_cpe':
            if (new_host.os_cpe === null) {
              new_host.os_cpe = detail.value;
            }
            break;
        }
      });

      nodes.push(new_host);
      nodes_by_link_id[new_host.link_id] = new_host;
    });

    // Create links between host;
    for (var node_index = 0; node_index < nodes.length; node_index++) {
      var host = nodes[node_index];

      if (host.traceroute !== null) {
        var route_split = host.traceroute.split(',');
        for (var hop_index = 0; hop_index < route_split.length - 1;
            hop_index++) {
          var source_ip = route_split[hop_index];
          var target_ip = route_split[hop_index + 1];
          var link_ips = source_ip + ">" + target_ip;

          if (gsa.is_defined (links_by_link_ids [link_ips]))
            continue;

          var new_link = {};
          var new_host;

          // Create source node if its IP address is not in the list.
          if (!gsa.is_defined(nodes_by_link_id[source_ip])) {
            new_host = {};
            new_host.type = 'host';
            new_host.hostname = null;
            new_host.os = null;
            new_host.os_cpe = null;
            new_host.traceroute = null;
            new_host.link_id = source_ip;
            new_host.name = source_ip;
            new_host.id = null;
            new_host.severity = null;
            new_host.in_links = [];
            new_host.out_links = [];
            nodes.push(new_host);
            nodes_by_link_id[new_host.link_id] = new_host;
          }

          // Create target node if its IP address is not in the list.
          if (!gsa.is_defined(nodes_by_link_id[target_ip])) {
            new_host = {};
            new_host.type = 'host';
            new_host.hostname = null;
            new_host.os = null;
            new_host.os_cpe = null;
            new_host.traceroute = null;
            new_host.link_id = target_ip;
            new_host.name = target_ip;
            new_host.id = null;
            new_host.severity = null;
            new_host.in_links = [];
            new_host.out_links = [];
            nodes.push(new_host);
            nodes_by_link_id[new_host.link_id] = new_host;
          }

          new_link.source = nodes_by_link_id[source_ip];
          new_link.target = nodes_by_link_id[target_ip];

          links.push(new_link);
          links_by_link_ids [link_ips] = new_link;
          new_link.target.in_links.push (new_link);
          new_link.source.out_links.push (new_link);
        }

        // Mark first node in route as scanner
        if (gsa.is_defined(nodes_by_link_id[route_split[0]])) {
          nodes_by_link_id[route_split[0]].is_scanner = true;
        }
      }
    }

    return records;
  };

  /**
   * Extracts filter info from XML.
   *
   * @param xml_data  The root element of the XML to extract from.
   *
   * @return  A filter_info object as used by chart generators.
   */
  gch.extract_filter_info = function(xml_data) {
    var filter_info = {};
    var keyword_elems;

    filter_info.id =  xml_data.selectAll('filters').attr('id');
    filter_info.term =  xml_data.selectAll('filters term').text();

    if (!xml_data.selectAll('filters name').empty()) {
      filter_info.name = xml_data.selectAll('filters name').text();
    }
    else {
      filter_info.name = '';
    }

    filter_info.keywords = [];
    filter_info.criteria_str = '';
    filter_info.extra_options_str = '';
    filter_info.criteria = [];
    filter_info.extra_options = [];

    keyword_elems = xml_data.selectAll('filters keywords keyword');
    keyword_elems.each(function() {
      var elem = d3.select(this);
      var column = elem.select('column').text();
      var current_keyword = {
        column: column,
        relation: elem.select('relation').text(),
        value: elem.select('value').text(),
      };

      // Create term split into criteria and extra options
      if (current_keyword.column === '') {
        // boolean operators and search phrase
        if (filter_info.criteria.length) {
          filter_info.criteria_str += ' ';
        }
        filter_info.criteria.push(current_keyword);
        if (current_keyword.relation === '=') {
          filter_info.criteria_str += '=' + current_keyword.value;
        } else {
          filter_info.criteria_str += current_keyword.value;
        }
      } else if (current_keyword.column === 'apply_overrides' ||
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
      } else {
        // normal column criteria
        if (filter_info.criteria.length) {
          filter_info.criteria_str += ' ';
        }
        filter_info.criteria.push(current_keyword);
        filter_info.criteria_str += current_keyword.column +
          current_keyword.relation + current_keyword.value;
      }
    });

    return filter_info;
  };

  /**
   * Extracts filter info from json data.
   *
   * @param data  The root object to extract from.
   *
   * @return  A filter_info object as used by chart generators.
   */
  gch.extract_filter_info_json = function(data) {
    var filter_info = {
      id: data._id,
      term: data.term,
      name: gsa.is_defined(data.name) ? data.name : '',
      keywords: [],
      criteria_str: '',
      extra_options_str: '',
      criteria: [],
      extra_options: [],
    };

    if (gsa.is_defined(data.keywords)) {
      gsa.for_each(data.keywords.keyword, function(keyword) {
        var current_keyword = {
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
          } else {
            filter_info.criteria_str += current_keyword.value;
          }
        } else if (current_keyword.column === 'apply_overrides' ||
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
        } else {
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

  /**
   * Extracts schedule records from tasks
   *
   * @param data  The response object
   *
   * @return  An array of records as used by chart generators.
   */
  gch.extract_task_records_json = function(data) {
    var records = [];

    gsa.for_each(data.task, function(task) {
      var record = {
        id: task._id,
        name: task.name,
      };

      if (gsa.is_defined(task.schedule)) {
        record.schedule_id = task.schedule._id;
      }

      for (var name in task.schedule) {
        if (name[0] === '_') { // skip former xml attributes
          continue;
        }
        record['schedule_' + name] = task.schedule[name];
      }

      if (gsa.is_defined(task.schedule_periods)) {
        record.schedule_periods = task.schedule_periods;
      }

      records.push(record);
    });

    return records;
  };

  /**
   * Extracts records from XML
   *
   * @param xml_data  The root node of the XML to extract the data from.
   *
   * @return  An array of records as used by chart generators.
   */
  gch.extract_task_records = function(xml_data) {
    var records = [];
    xml_data.selectAll('task').each(function() {
      var task = d3.select(this);
      var schedule = task.select('schedule');
      var periods = task.select('schedule_periods');

      var record = {
        id: task.attr('id'),
        name: task.select('name').text()
      };
      record.schedule_id = schedule.attr('id');
      schedule.selectAll('*')
        .each(function() {
          record['schedule_' + this.localName] =
            this.textContent;
        });

      if (periods.node()) {
        record.schedule_periods = periods.text();
      }

      records.push(record);
    });

    return records;
  };

  /*
   * Helpers for processing extracted data
   */

  /**
   * Gets capitalized resource and attribute names.
   *
   * @param str The name to capitalize.
   *
   * @return The capitalized name.
   */
  gch.capitalize = function(str) {
    switch (str.toLowerCase()) {
      case 'nvt':
      case 'cve':
      case 'cpe':
        return str.toUpperCase();
      default:
        var split_str = str.split('_');
        for (var i in split_str) {
          split_str[i] = split_str[i].charAt(0).toUpperCase() +
            split_str[i].slice(1);
        }
        return split_str.join(' ');
    }
  };

  /**
   * Gets the severity level name for a numeric cvss value.
   *
   * @param {number}  value The numeric value to convert.
   *
   * @return {string} The severity level name.
   */
  gch.severity_level = function(value) {
    if (value >= gsa.severity_levels.min_high) {
      return gsa._('High');
    }
    else if (value >= gsa.severity_levels.min_medium) {
      return gsa._('Medium');
    }
    else if (value >= gsa.severity_levels.min_low) {
      return gsa._('Low');
    }
    else if (value >= 0.0) {
      return gsa._('Log');
    }
    else if (value === -1.0) {
      return gsa._('False Positive');
    }
    else if (value === -2.0) {
      return gsa._('Debug');
    }
    else if (value === -3.0) {
      return gsa._('Error');
    }
    else {
      return gsa._('N/A');
    }
  };

  /*
   * Gets the full name of a resource type.
   *
   * @param type  The type name as used in omp requests.
   *
   * @return  The full name.
   */
  gch.resource_type_name = function(type) {
    switch (type.toLowerCase()) {
      case 'os':
        return gsa._('Operating System');
      case 'ovaldef':
        return gsa._('OVAL definition');
      case 'cert_bund_adv':
        return gsa._('CERT-Bund Advisory');
      case 'dfn_cert_adv':
        return gsa._('DFN-CERT Advisory');
      case 'allinfo':
        return gsa._('SecInfo Item');
      default:
        return gch.capitalize(type);
    }
  };

  /**
   * Gets the plural form of the full name of a resource type.
   *
   * @param type  The type name as used in omp requests.
   *
   * @return  The full name plural.
   */
  gch.resource_type_name_plural = function(type) {
    switch (type.toLowerCase()) {
      case 'dfn_cert_adv':
        return gsa._('DFN-CERT Advisories');
      case 'cert_bund_adv':
        return gsa._('CERT-Bund Advisories');
      default:
        return gch.resource_type_name(type) + 's';
    }
  };

  /**
   * Gets the Filter type name of a resource type.
   *
   * @param type  The type name as used in omp requests.
   *
   * @return  The filter name.
   */
  gch.filter_type_name = function(type) {
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
        return gch.capitalize(type);
    }
  };

  /**
   * Gets the full form of an aggregate field name.
   *
   * @param field   The name of the field as used in OMP requests.
   * @param type    The resource type as used in OMP requests.
   *
   * @return  The full field name.
   */
  gch.field_name = function(field, type) {
    switch (field.toLowerCase()) {
      case 'c_count':
        return gsa._('total {{- resource_type_plural}}',
            {
              resource_type_plural: gch.resource_type_name_plural(type),
            });
      case 'count':
        return gch.resource_type_name_plural(type);
      case 'created':
        return gsa._('creation time');
      case 'duration':
        return gsa._('duration');
      case 'modified':
        return gsa._('modification time');
      case 'qod':
        return gsa._('QoD');
      case 'qod_type':
        return gsa._('QoD type');
      case 'high':
        return gsa._('High');
      case 'high_per_host':
        return gsa._('High / host');
      case 'duration_per_host':
        return gsa._('Duration / host')
      default:
        if (gsa.is_string(field)) {
          return field.replace('_', ' ');
        }
        return field;
    }
  };

  /**
   * Generates a label from a column info object.
   *
   * @param info              The column_info object.
   * @param capitalize_label  Whether to capitalize the label.
   * @param include_type      Whether to include the resource type.
   * @param include_stat      Whether to include the statistic (min, max, etc.).
   *
   * @return  The generated label.
   */
  gch.column_label = function(info, capitalize_label,
                        include_type, include_stat) {
    if (info.label_generator) {
      return info.label_generator(info, capitalize_label,
                                  include_type, include_stat);
    }
    else {
      return gch.default_column_label(info, capitalize_label,
                                      include_type, include_stat);
    }
  };

  /**
   * Generates a label in the default format from a column info object.
   *
   * @param info              The column_info object.
   * @param capitalize_label  Whether to capitalize the label.
   * @param include_type      Whether to include the resource type.
   * @param include_stat      Whether to include the statistic (min, max, etc.).
   *
   * @return  The generated label.
   */
  gch.default_column_label = function(info, capitalize_label,
                                  include_type, include_stat) {
    var label = '';
    var field_name
          = label + gch.field_name(info.column ? info.column : info.stat,
                                   info.type);

    if (include_stat) {
      switch (info.stat) {
        case 'min':
          label = label + gsa._('min. {{- field_name}}',
                                {field_name: field_name});
          break;
        case 'max':
          label = label + gsa._('max. {{- field_name}}',
                                {field_name: field_name});
          break;
        case 'mean':
          label = label + gsa._('average {{- field_name}}',
                                {field_name: field_name});
          break;
        case 'sum':
          label = label + gsa._('summed {{- field_name}}',
                                {field_name: field_name});
          break;
      }
    }
    else {
      label = label + field_name;
    }

    if (include_type && info.stat !== 'count' && info.stat !== 'c_count') {
      label = label + ' (' + gch.resource_type_name(info.type) + ')';
    }
    if (capitalize_label) {
      label = gch.capitalize(label);
    }

    if (gsa.is_defined(info.subgroup_value) && info.subgroup_value !== '') {
      label += ' (' + info.subgroup_value + ')';
    }

    return label;
  };

  /**
   * Generates a string representation of a data value using the column info.
   *
   * @param value           The value to get the string representation for.
   * @param col_info_item   The column_info item to use.
   *
   * @return  The value as a string.
   */
  gch.format_data = function(value, col_info_item) {
    if (col_info_item && col_info_item.data_formatter) {
      col_info_item.data_formatter(value, col_info_item);
    }
    else {
      return gch.format_data_default(value, col_info_item);
    }
  };

  /**
   * Generates a default string representation of a data value
   *  using column info.
   */
  gch.format_data_default = function(value, col_info_item) {
    if (!gsa.has_value(value)) {
      return value;
    }

    if (col_info_item) {
      switch (col_info_item.data_type) {
        case 'js_date':
          return gch.date_format(value);
        case 'js_datetime':
          return gch.datetime_format(value);
        case 'unix_time':
          return gch.datetime_format(new Date(value * 1000));
        case 'cvss':
          return value.toFixed(1);
        case 'decimal':
          return value.toFixed(3).replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/,
              '$1');
        default:
          return String(value);
      }
    }
    else {
      return String(value);
    }
  };

  /*
   * Record set transformation functions
   */

  /**
   * Dummy function returning the raw, unmodified data.
   *
   * @param data The data.
   *
   * @return The unmodified data.
   */
  gch.data_raw = function(data) {
    return data;
  };

  /**
   * Transforms data into a severity histogram.
   *
   * @param old_data  The original data.
   * @param params    The generator parameters.
   *
   * @return The data transformed into a severity histogram.
   */
  gch.data_severity_histogram = function(old_data, params) {
    var bins = ['N/A', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
    var bins_long = ['N/A', '0.0', '0.1 - 1.0', '1.1 - 2.0', '2.1 - 3.0',
                    '3.1 - 4.0', '4.1 - 5.0', '5.1 - 6.0', '6.1 - 7.0',
                    '7.1 - 8.0', '8.1 - 9.0', '9.1 - 10.0'];
    var severity_field = 'value';
    var count_field = 'count';

    if (params) {
      if (params.severity_field) {
        severity_field = params.severity_field;
      }
      if (params.count_field) {
        count_field = params.count_field;
      }
    }

    var column_info = {
      group_columns: [severity_field],
      data_columns: [count_field],
      columns: {}
    };

    var bin_func = function(val) {
      if (val !== '' && Number(val) <= 0.0) {
        return 1;
      }
      else if (Number(val) >= 10.0) {
        return 11;
      }
      else if (Number(val) > 0.0) {
        return Math.ceil(Number(val)) + 1;
      }
      else {
        return 0;
      }
    };

    var records = bins.map(function(d) {
      var record = {};
      record [severity_field] = d;
      record [count_field] = 0;
      return record;
    });

    column_info.columns[severity_field] =
      {
          name: severity_field,
          type: old_data.column_info.columns[severity_field].type,
          column: old_data.column_info.columns [severity_field].column,
          stat: old_data.column_info.columns[severity_field].stat,
          data_type: 'text'
        };

    column_info.columns[count_field] =
      {
          name: count_field,
          type: old_data.column_info.columns [count_field].type,
          column: '',
          stat: 'count',
          data_type: 'integer'
        };

    var i;
    for (i in old_data.records) {
      records[bin_func(old_data.records[i][severity_field])][count_field] =
        Number(records[
            bin_func(old_data.records[i][severity_field])
        ][count_field]) + Number(old_data.records[i][count_field]);
    }

    for (i in records) {
      records[i][severity_field + '~long'] = bins_long[i];
    }

    var data = {
      records: records,
      column_info: column_info,
      filter_info: old_data.filter_info
    };

    return data;
  };

  /**
   * Gets the counts of severity levels from records containing the counts
   *  for each numeric CVSS score.
   *
   * @param old_data  The original data.
   * @param params    The generator parameters.
   *
   * @return The data transformed into severity classes.
   */
  gch.data_severity_level_counts = function(old_data, params) {
    var bins = ['N/A', 'Log', 'Low', 'Medium', 'High'];
    var bins_long = ['N/A',
                    'Log (0.0 - ' +
                    gsa.severity_levels.max_log.toFixed(1) + ')',
                    'Low (' +
                    gsa.severity_levels.min_low.toFixed(1) +
                    ' - ' + gsa.severity_levels.max_low.toFixed(1) + ')',
                    'Medium (' +
                    gsa.severity_levels.min_medium.toFixed(1) +
                    ' - ' + gsa.severity_levels.max_medium.toFixed(1) + ')',
                    'High (' +
                    gsa.severity_levels.min_high.toFixed(1) +
                    ' - ' + gsa.severity_levels.max_high.toFixed(1) + ')'];
    var severity_field = 'value';
    var count_field = 'count';
    var ascending = false;

    if (params) {
      if (params.severity_field) {
        severity_field = params.severity_field;
      }
      if (params.count_field) {
        count_field = params.count_field;
      }
      if (gsa.is_defined(params.ascending)) {
        ascending = params.ascending;
      }
    }

    var records = bins.map(function(d) {
      var record = {};
      record[severity_field] = d;
      record[count_field] = 0;
      return record;
    });

    var column_info = {
      group_columns: [severity_field],
      data_columns: [count_field],
      columns: {}
    };

    column_info.columns[severity_field] = {
      name: severity_field,
      type: old_data.column_info.columns[severity_field].type,
      column: old_data.column_info.columns[severity_field].column,
      stat: old_data.column_info.columns[severity_field].stat,
      data_type: 'text'
    };

    column_info.columns[count_field] = {
      name: count_field,
      type: old_data.column_info.columns[count_field].type,
      column: '',
      stat: 'count',
      data_type: 'integer'
    };

    var i;
    for (i in old_data.records) {
      var val = old_data.records[i][severity_field];
      var count = old_data.records[i][count_field];

      if (val !== '' && Number(val) <= gsa.severity_levels.max_log) {
        records[1][count_field] += count;
      }
      else if (Number(val) >= gsa.severity_levels.min_low &&
          Number(val) <= gsa.severity_levels.max_low) {
        records[2][count_field] += count;
      }
      else if (Number(val) >= gsa.severity_levels.min_medium &&
          Number(val) <= gsa.severity_levels.max_medium) {
        records[3][count_field] += count;
      }
      else if (Number(val) >= gsa.severity_levels.min_high) {
        records[4][count_field] += count;
      }
      else {
        records[0][count_field] += count;
      }
    }

    for (i in records) {
      records[i][severity_field + '~long'] = bins_long [i];
    }

    if (gsa.severity_levels.min_high === gsa.severity_levels.max_medium) {
      delete records[4];
    }
    if (gsa.severity_levels.min_medium === gsa.severity_levels.max_low) {
      delete records[3];
    }
    if (gsa.severity_levels.min_low === gsa.severity_levels.max_log) {
      delete records[2];
    }

    for (i in records) {
      if (records[i][count_field] === 0) {
        delete records[i];
      }
    }

    var data = {
      records: ascending ? records : records.reverse(),
      column_info: column_info,
      filter_info: old_data.filter_info
    };

    return data;
  };

  /**
   * Get counts by resource type, using the full type name for the x field.
   *
   * @param old_data  The original data.
   * @param params    The generator parameters.
   *
   * @return The data with transformed type names.
   */
  gch.resource_type_counts = function(old_data, params) {
    var new_column_info = {
      group_columns: old_data.column_info.group_columns,
      data_columns: old_data.column_info.data_columns,
      text_columns: old_data.column_info.text_columns,
      columns: {}
    };
    for (var col in old_data.column_info.columns) {
      new_column_info.columns[col] = old_data.column_info.columns[col];
    }

    var new_data = {
      records: [],
      column_info: new_column_info,
      filter_info: old_data.filter_info
    };

    var type_field = 'value';
    if (params) {
      if (params.type_field) {
        type_field = params.type_field;
      }
    }

    if (gsa.is_defined(
          old_data.column_info.columns[type_field + '~original'])) {
      new_column_info.columns[type_field + '~original'] =
        old_data.column_info.columns[type_field + '~original'];
    } else {
      new_column_info.columns[type_field + '~original'] =
        old_data.column_info.columns[type_field];
    }

    for (var record in old_data.records) {
      var new_record = {};
      for (var field in old_data.records[record]) {
        if (field === type_field) {
          if (gsa.is_defined(new_record[field + '~original'])) {
            new_record[field + '~original'] =
              old_data.records[record][field + '~original'];
          } else {
            new_record[field + '~original'] = old_data.records[record][field];
          }
          new_record[field] = gch.resource_type_name_plural(
              old_data.records[record][field]);
        }
        else {
          new_record[field] = old_data.records[record][field];
        }
      }
      new_data.records.push(new_record);
    }
    return new_data;
  };

  /**
   * Get counts by qod type, using the full type name for the x field.
   *
   * @param old_data  The original data.
   * @param params    The generator parameters.
   *
   * @return The data with transformed QoD type names.
   */
  gch.qod_type_counts = function(old_data, params) {
    var new_column_info = {
      group_columns: old_data.column_info.group_columns,
      data_columns: old_data.column_info.data_columns,
      text_columns: old_data.column_info.text_columns,
      columns: {}
    };
    for (var col in old_data.column_info.columns) {
      new_column_info.columns[col] = old_data.column_info.columns[col];
    }

    var new_data = {
      records: [],
      column_info: new_column_info,
      filter_info: old_data.filter_info
    };

    var type_field = 'value';
    if (params) {
      if (params.type_field) {
        type_field = params.type_field;
      }
    }

    if (gsa.is_defined(
          old_data.column_info.columns[type_field + '~original'])) {
      new_column_info.columns[type_field + '~original'] =
        old_data.column_info.columns[type_field + '~original'];
    } else {
      new_column_info.columns[type_field + '~original'] =
        old_data.column_info.columns[type_field];
    }

    for (var record in old_data.records) {
      var new_record = {};
      for (var field in old_data.records[record]) {
        if (field === type_field) {
          if (gsa.is_defined(new_record[field + '~original'])) {
            new_record[field + '~original'] =
              old_data.records[record][field + '~original'];
          } else {
            new_record[field + '~original'] = old_data.records[record][field];
          }
          switch (old_data.records[record][field]) {
            case (''):
              new_record[field] = gsa._('None');
              break;
            case ('exploit'):
              new_record[field] = gsa._('Exploit');
              break;
            case ('remote_vul'):
              new_record[field] = gsa._('Remote vulnerability');
              break;
            case ('package'):
              new_record[field] = gsa._('Package check');
              break;
            case ('registry'):
              new_record[field] = gsa._('Registry check');
              break;
            case ('executable_version'):
              new_record[field] = gsa._('Executable version');
              break;
            case ('remote_analysis'):
              new_record[field] = gsa._('Remote analysis');
              break;
            case ('remote_probe'):
              new_record[field] = gsa._('Remote probe');
              break;
            case ('remote_banner_unreliable'):
              new_record[field] = gsa._('Unreliable rem. banner');
              break;
            case ('executable_version_unreliable'):
              new_record[field] = gsa._('Unreliable exec. version');
              break;
            default:
              new_record[field] = gch.resource_type_name(
                  old_data.records[record][field]);
          }
        }
        else {
          new_record[field] = old_data.records[record][field];
        }
      }
      new_data.records.push(new_record);
    }

    var sort_func = function(a, b) {
      return b.count - a.count;
    };

    new_data.records.sort(sort_func);
    return new_data;
  };

  /**
   * Adds percent signs to the "value" column values.
   *
   * @param old_data  The original data.
   * @param params    The generator parameters.
   *
   * @return The data with transformed values.
   */
  gch.percentage_counts = function(old_data, params) {
    var new_column_info = {
      group_columns: old_data.column_info.group_columns,
      data_columns: old_data.column_info.data_columns,
      text_columns: old_data.column_info.text_columns,
      columns: {}
    };
    for (var col in old_data.column_info.columns) {
      new_column_info.columns[col] = old_data.column_info.columns[col];
    }

    var new_data = {
      records: [],
      column_info: new_column_info,
      filter_info: old_data.filter_info,
    };

    var type_field = 'value';
    if (params) {
      if (params.type_field) {
        type_field = params.type_field;
      }
    }

    if (gsa.is_defined(
          old_data.column_info.columns[type_field + '~original'])) {
      new_column_info.columns[type_field + '~original'] =
        old_data.column_info.columns[type_field + '~original'];
    } else {
      new_column_info.columns[type_field + '~original'] =
        old_data.column_info.columns[type_field];
    }

    var record;
    for (record in old_data.records) {
      var new_record = {};
      for (var field in old_data.records[record]) {
        new_record[field] = old_data.records[record][field];
      }
      new_data.records.push(new_record);
    }

    var sort_func = function(a, b) {
      return b[type_field] - a[type_field];
    };
    new_data.records.sort(sort_func);

    for (record in new_data.records) {
      if (gsa.is_defined(
            old_data.column_info.columns[type_field + '~original'])) {
        new_data.records[record][type_field + '~original'] =
          new_data.records[record][type_field + '~original'];
      } else {
        new_data.records[record][type_field + '~original'] =
          new_data.records[record][type_field];
      }
      new_data.records[record][type_field] =
        new_data.records[record][type_field] + '%';
    }

    return new_data;
  };

  /**
   * Fills in empty fields in a data set.
   *
   * @param old_data  The original data.
   * @param params    The generator parameters.
   *
   * @return The data with missing values filled in.
   */
  gch.fill_empty_fields = function(old_data, params) {
    var new_data = {
      records: [],
      column_info: old_data.column_info,
      filter_info: old_data.filter_info
    };

    var empty_x_records = [];

    var x_field = 'value';
    if (params) {
      if (params.type_field) {
        x_field = params.type_field;
      }
    }

    var record;
    for (record in old_data.records) {
      var new_record = {};
      var empty_x = false;
      for (var field in old_data.records [record]) {
        if (old_data.records[record][field] ||
            old_data.records[record][field] === 0) {
          new_record[field] = old_data.records [record][field];
        }
        else if (field.lastIndexOf('~original') !== (field.length - 9)) {
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

    for (record in empty_x_records) {
      new_data.records.push(empty_x_records[record]);
    }

    return new_data;
  };

  /*
   * In-chart link generator functions
   */

  /**
   * @summary Helper function to get the type as used in cmd=get_[...].
   *
   * @param {string}  type         Resource type or subtype
   *
   * @return {string} The resource type as used in cmd=get_[...].
   */
  gch.cmd_type = function(type) {
    var get_type;
    if (type === 'host' || type === 'os') {
      get_type = 'asset';
    }
    else if (type === 'allinfo' || type === 'nvt' || type === 'cve' ||
        type === 'cpe' || type === 'ovaldef' || type === 'cert_bund_adv' ||
        type === 'dfn_cert_adv') {
      get_type = 'info';
    }
    else {
      get_type = type;
    }
    return get_type;
  };

  /**
   * @summary Generates a filtered list page URL
   *
   * @param {string}  type         Resource type or subtype
   * @param {string}  column       Column name
   * @param {string}  value        Column value
   * @param {Object}  filter_info  filter_info from generator
   * @param {string}  relation     The relation to use
   *
   * @return {string} The page URL.
   */
  gch.filtered_list_url = function(type, column, value, filter_info, relation) {
    var result = '/omp?';
    var get_type;
    var get_type_plural;

    if (!gsa.is_defined(relation)) {
      relation = '=';
    }

    // Get "real" type and plural
    get_type = gch.cmd_type(type);

    if (get_type === 'info') {
      get_type_plural = get_type;
    }
    else {
      get_type_plural = get_type + 's';
    }

    // Add command and (if needed) subtype
    result += ('cmd=get_' + get_type_plural);

    if (get_type !== type) {
      result += ('&' + get_type + '_type=' + type);
    }

    // Add existing extra options from filter
    result += '&filter=' + filter_info.extra_options_str + ' ';

    // Create new column filter keyword(s)
    var criteria_addition = '';
    if (relation === '=') {
      if (column === 'severity') {
        switch (value) {
          case ('High'):
            criteria_addition += 'severity>' + gsa.severity_levels.max_medium;
            break;
          case ('Medium'):
            criteria_addition += 'severity>' + gsa.severity_levels.max_low +
            ' and severity<' + gsa.severity_levels.min_high;
            break;
          case ('Low'):
            criteria_addition += 'severity>' + gsa.severity_levels.max_log +
            ' and severity<' + gsa.severity_levels.min_medium;
            break;
          case ('Log'):
            if (gsa.severity_levels.max_log === 0.0) {
              criteria_addition += 'severity=0';
            }
            else {
              criteria_addition += 'severity>-1 and severity<' +
                gsa.severity_levels.min_low;
            }
            break;
          case (''):
          case ('N/A'):
            criteria_addition += 'severity=""';
            break;
          case ('0'):
            criteria_addition += 'severity=0';
            break;
          default:
            var severity = parseFloat(value);
            if (severity.isNaN) {
              criteria_addition += 'severity=' + value;
            } else if (severity >= 10.0) {
              criteria_addition += 'severity>9.0';
            } else {
              criteria_addition += 'severity>' + (severity - 1.0).toFixed(1) +
                ' and severity<' + (severity + 0.1).toFixed(1);
            }
        }
      }
      else {
        criteria_addition += column + '="' + value + '"';
      }
    } else if (relation === 'range') {
      criteria_addition = (column + '>' + value[0] +
          ' and ' + column + '<' + value[1]);
    } else {
      criteria_addition += column + relation + '"' + value + '"';
    }

    // Add other criteria
    var new_criteria = '';
    for (var i in filter_info.criteria) {
      var current_keyword = filter_info.criteria[i];
      if (i > 0) {
        new_criteria += ' ';
      }

      if (current_keyword.column === '') {
        if (current_keyword.relation === '=') {
          new_criteria += '=' + current_keyword.value;
        } else {
          new_criteria += current_keyword.value;
        }
      } else {
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
    if (gsa.is_defined(filter_info.criteria) &&
        filter_info.criteria.length === 0) {
      new_criteria = criteria_addition;
    }

    result += new_criteria;

    // Add token
    result += '&token=' + gsa.gsa_token;

    return result;
  };

  /**
   * @summary Generates a details page URL
   *
   * @param {string}  type         Resource type or subtype
   * @param {string}  id           id of the resource to get
   * @param {Object}  filter_info  filter_info from generator
   * @param {string}  relation     The relation to use
   *
   * @return {string} the page URL
   */
  gch.details_page_url = function(type, id, filter_info) {
    var result = '/omp?';
    var get_type = gch.cmd_type(type);

    // Add command and (if needed) subtype
    result += ('cmd=get_' + get_type);

    if (get_type !== type) {
      result += ('&' + get_type + '_type=' + type);
    }

    // Add resource id
    result += ('&' + get_type + '_id=' + id);

    // Add filter
    result += ('&filter=' + filter_info.term);
    result += ('&filt_id=' + filter_info.id);

    // Add token
    result += ('&token=' + gsa.gsa_token);

    return result;
  };

  /*
   * Generic display helper functions
   */

  /**
   * Opens a popup window for a detached chart.
   *
   * @param url  URL of the detached chart.
   */
  gch.open_detached = function(url) {
    var new_window = window.open(url, '', 'width=460, height=340');
    new_window.fit_window = true;
    return false;
  };

  /**
   * Creates a listener that resizes a chart display to fill the whole window.
   *
   * @param dashboard   The dashboard this applies to.
   */
  gch.detached_chart_resize_listener = function(dashboard) {
    return function() {
      var height = window.innerHeight -
        Number(d3.select('.gsa-footer').property('clientHeight')) +
        Number(d3.select('#applied_filter').property('clientHeight')) - 20;
      dashboard.resize(height, undefined, true);
    };
  };

  /**
   * Wraps SVG text at a given width.
   *
   * @param text_selection  A d3 selection of the text.
   * @param width           The maximum width to wrap the text at.
   */
  gch.wrap_text = function(text_selection, width) {
    /*
     * Test if the node is not in the document yet because this would cause an
     *  error in Internet Explorer when calling getComputedTextLength.
     */
    if (! document.body.contains(text_selection.node()))
      return;

    text_selection.each(function() {
      var text = d3.select(this);
      var words = text.text()
                        .match(/[^\s-]+[\s-]*/g)
                          .reverse();
      var line = [];
      var line_number = 0;
      var line_height = 1.2; //em
      var x = text.attr('x');
      var y = text.attr('y');
      var tspan = text.text(null)
                      .append('tspan')
                        .attr('x', x)
                        .attr('y', y);
      var word;
      while ((word = words.pop())) {
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
   * Generic chart title generators
   */

  /**
   * Creates a title generator that returns a static title.
   *
   * @param loading_text  Text to show while loading.
   * @param loaded_text   Text to show once the data is loaded.
   *
   * @return  The title generator function.
   */
  gch.title_static = function(loading_text, loaded_text) {
    return function(data) {
      var title;

      if (!gsa.is_defined(data)) {
        title = loading_text;
      }
      else {
        title = loaded_text;
      }

      if (data && data.filter_info && data.filter_info.name !== '') {
        title = title + ' : ' + data.filter_info.name;
      }

      return title;
    };
  };

  /**
   * Creates a title generator returning a title with the total resource count.
   *
   * @param title         The basic title to show.
   * @param count_field   The field containing the count.
   *
   * @return  The title generator function
   */
  gch.title_total = function(title, count_field) {
    return function(data) {
      var filter_text = '';

      if (data && data.filter_info && data.filter_info.name !== '') {
        filter_text = ': ' + data.filter_info.name;
      }

      if (!gsa.is_defined(data)) {
        return gsa._('{{title}} (Loading...)', {title: title});
      }

      var total = 0;
      for (var i = 0; i < data.records.length; i++) {
        total = Number(total) + Number(data.records[i][count_field]);
      }
      return gsa._('{{title}} {{filter_text}} (Total: {{count}})',
          {title: title, filter_text: filter_text, count: '' + total});
    };
  };

  /*
   * Data export helpers
   */

  /**
   * Generates CSV data from simple records.
   *
   * @param records       The records from the data set.
   * @param column_info   The column_info from the data set.
   * @param columns       The columns to output.
   * @param headers       Column headers to output.
   *
   * @return  A string containing the data in CSV format.
   */
  gch.csv_from_records = function(records, column_info, columns, headers,
      title) {
    var csv_data = '';

    if (gsa.is_defined(title)) {
      csv_data += (title + '\r\n');
    }

    var col_i;
    if (gsa.is_defined(headers)) {
      for (col_i in headers) {
        csv_data += '"' + String(headers[col_i]).replace('"', '""') + '"';
        if (col_i < columns.length - 1) {
          csv_data += ',';
        }
      }
      csv_data += '\r\n';
    }

    for (var row in records) {
      for (col_i in columns) {
        var col = columns [col_i];
        var record = records[row][col];
        if (gsa.has_value(record)) {
          if (gsa.is_defined(column_info)) {
            csv_data += '"' + gch.format_data(record, column_info.columns[col])
              .replace('"', '""') + '"';
          }
          else {
            csv_data += '"' + record.replace('"', '""') + '"';
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
   * @param records       The records from the data set.
   * @param column_info   The column_info from the data set.
   * @param columns       The columns to output.
   * @param headers       Column headers to output.
   * @param title         A title for the whole table.
   * @param filter        The filter term to be shown in the table footer.
   *
   * @return  A string containing the data in as a HTML table.
   */
  gch.html_table_from_records = function(records, column_info, columns,
      headers, title, filter) {
    var doc = document.implementation.createDocument(
        'http://www.w3.org/1999/xhtml', 'html', null);
    var head_s = d3.select(doc.documentElement).append('head');
    var body_s = d3.select(doc.documentElement).append('body');
    var table_s;
    var row_class = 'odd';

    var stylesheet;
    for (var sheet_i = 0; !gsa.is_defined(stylesheet) &&
        sheet_i < document.styleSheets.length; sheet_i++) {
      if (document.styleSheets[sheet_i].href.indexOf(
            '/gsa-style.css', document.styleSheets[sheet_i].href.length -
            '/gsa-style.css'.length) !== -1) {
        stylesheet = document.styleSheets[sheet_i];
      }
    }

    head_s.append('title')
            .text(gsa._('Greenbone Security Assistant - Chart data table'));

    head_s.append('link')
            .attr('href', stylesheet.href)
            .attr('type', 'text/css')
            .attr('rel', 'stylesheet');

    body_s.style('padding', '10px');

    table_s = body_s.append('table')
                      .attr('cellspacing', '2')
                      .attr('cellpadding', '4')
                      .attr('border', '0')
                      .attr('class', 'gbntable');

    table_s.append('tr')
            .attr('class', 'gbntablehead1')
            .append('td')
              .attr('colspan', headers.length)
              .text(title);

    var col_i;
    var tr_s;
    if (gsa.is_defined(headers)) {
      tr_s = table_s.append('tr')
                          .attr('class', 'gbntablehead2');
      for (col_i in headers) {
        tr_s.append('td')
              .text(headers[col_i]);
      }
    }

    for (var row in records) {
      tr_s = table_s.append('tr')
        .attr('class', row_class);
      for (col_i in columns) {
        var col = columns[col_i];
        if (gsa.is_defined(column_info)) {
          tr_s.append('td')
                .text(gch.format_data(records[row][col],
                                      column_info.columns[col]));
        }
        else {
          tr_s.append('td').text(records[row][col]);
        }
      }
      row_class = (row_class === 'odd') ? 'even' : 'odd';
    }

    if (filter) {
      body_s.append('p')
              .attr('class', 'footnote')
              .text(gsa._('Applied filter: {{filter}}', {filter: filter}));
    }

    return doc.documentElement.outerHTML;
  };

  /**
   * Clone an SVG element with some modifications for export like replacing
   *  "a" elements and removing elements with the class "remove_on_static".
   *
   * @param elem  The element to clone.
   *
   * @return A clone of the svg element.
   */
  gch.clone_svg = function(elem) {
    var clone;
    if ($(elem).hasClass('remove_on_static')) {
      return null;
    }
    else {
      // replace "a" elems with "g"
      if (elem.tagName === 'a') {
        clone = $('<g/>');
      }
      else {
        clone = $('<' + elem.tagName + '/>');
      }

      for (var attr_index = 0;
           attr_index < elem.attributes.length;
           attr_index++) {
        var attribute = elem.attributes[attr_index];
        // remove href attributes
        if (attribute.name !== 'href') {
          clone.attr(attribute.prefix ?
              attribute.prefix + ':' + attribute.name :
              attribute.name,
              attribute.value);
        }
      }

      for (var child_index = 0; child_index < elem.childNodes.length;
          child_index++) {
        var child = elem.childNodes[child_index];
        switch (child.nodeType) {
          case Node.ELEMENT_NODE:
            clone.append(gch.clone_svg(child));
            break;
          default:
            clone.append(child.cloneNode());
        }
      }
      return clone[0];
    }
  };

  /**
   * Convert SVG element to export format.
   *
   * @param svg_elem  The svg element.
   * @param title     The title of the chart added at the top.
   *
   * @return The svg element as text.
   */
  gch.svg_from_elem = function(svg_elem, title) {
    var css_text = '';
    // find stylesheet
    /*
     * FIXME: Consider moving chart styles to extra CSS file to reduce SVG size.
     *        Axes are only shown correctly in programs more "dedicated" to SVG
     *         like browsers and Inkscape: Lines with ticks become black boxes
     *         elsewhere. Workaround: Save copy as "plain SVG" in Inkscape.
     */
    var stylesheet;

    var width = Number(svg_elem.attr('width'));
    var height = Number(svg_elem.attr('height'));

    for (var sheet_i = 0; !gsa.is_defined(stylesheet)  &&
        sheet_i < document.styleSheets.length; sheet_i++) {
      if (document.styleSheets[sheet_i].href.indexOf('/gsa-style.css',
            document.styleSheets[sheet_i]
            .href.length - '/gsa-style.css'.length) !== -1) {
        stylesheet = document.styleSheets[sheet_i];
      }
    }
    // get stylesheet text
    for (var i = 0; i < stylesheet.cssRules.length; i++) {
      css_text += stylesheet.cssRules[i].cssText;
    }

    var title_xml;
    if (title && title !== '') {
      title_xml = '<text x="' + (width / 2) + '" y="0"' +
                  ' text-anchor="middle"' +
                  ' style="font-weight: bold; font-size: 12px">' +
                  title +
                  '</text>';
    }
    else {
      title_xml = '';
    }

    var svg_clone = d3.select(gch.clone_svg(svg_elem.node()));

    var defs = svg_clone.selectAll('defs');
    if (defs.empty()) {
      defs = svg_clone.insert('defs', ':first-child');
    }

    defs.insert('style')
          .attr('type', 'text/css')
          .html(css_text);

    // create SVG
    var svg_data =  '<?xml version="1.0" encoding="UTF-8"?>' +
      '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.0//EN" ' +
      '"http://www.w3.org/TR/SVG/DTD/svg10.dtd"> ' +
      '<svg xmlns="http://www.w3.org/2000/svg"' +
      ' viewBox="0 ' + (title !== null ? '-14' : '0') + ' ' + width + ' ' +
      height + '"' +
      ' width="' + width + '"' +
      ' height="' + (height + (title !== null ? 14 : 0)) + '">' +
      svg_clone.html() +
      title_xml +
      '</svg>';
    return svg_data;
  };

  /**
   * Shows a blob URL inside an img element in a new window.
   *
   * @param blob_url  The blob URL to show.
   */
  gch.blob_img_window = function(blob_url) {
    var new_window = window.open('', '_blank');

    d3.select(new_window.document)
        .select('body')
          .insert('img')
            .attr('src', blob_url);
    return;
  };

  /**
   * Creates a new chart generator of a given type,
   *
   * @param chart_type  The chart type.
   */
  gch.new_chart_generator = function(chart_type) {
    var Generator = gch.get_chart_generator(chart_type);
    if (gsa.is_function(Generator)) {
      return new Generator();
    }
    return Generator;
  };

  /**
   * Gets a chart generator of a given type.
   *
   * @param chart_type  The chart type.
   */
  gch.get_chart_generator = function(chart_type) {
    var Generator = gch.chart_generators[chart_type];
    if (!gsa.has_value(Generator)) {
      console.warn('Could not find chart generator for', chart_type);
      return null;
    }
    return Generator;
  };

  /**
   * Registers a chart generator class for a given type.
   *
   * @param chart_type  The chart type.
   * @param generator   The generator constructor.
   */
  gch.register_chart_generator = function(chart_type, generator) {
    gch.chart_generators[chart_type] = generator;
  };

  /**
   * XML to JSON conversion
   */

  var x2js = new X2JS();
  gch.xml2json = x2js.xml2json.bind(x2js);

})(window, window, window.document, window.gsa, window.d3, window.$,
  window.console, window.X2JS);
