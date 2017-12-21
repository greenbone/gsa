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
import d3tip from 'd3-tip';

import _ from 'gmp/locale.js';
import {is_defined, is_date} from 'gmp/utils.js';

import {get_severity_levels} from '../../../../utils/render.js';

import {
  array_sum,
  csv_from_records,
  datetime_format,
  severity_bar_style,
  quantile_bar_style,
  column_label,
  goto_details_page,
  goto_list_page,
  html_table_from_records,
  severity_level,
  title_static,
} from '../helper.js';

import {register_chart_generator} from '../controller.js';

import AggregateChartGenerator from './aggregate.js';

const default_bar_style = () => '';

class BarChartGenerator extends AggregateChartGenerator {

  constructor() {
    super('bar');
  }

  init() {
    this.margin = {
      top: 40,
      right: 20,
      bottom: 40,
      left: 60,
    };

    this.x_scale = d3.scale.ordinal();
    this.y_scale = d3.scale.linear();
    this.x_axis = d3.svg.axis().scale(this.x_scale).orient('bottom');
    this.y_axis = d3.svg.axis().scale(this.y_scale).orient('left');
    this.x_label = '';
    this.y_label = '';
    this.x_field = 'value';
    this.y_field = 'count';
    this.show_stat_type = true;

    this.setBarStyle(default_bar_style);
    this.setTitleGenerator(title_static(_('Loading bar chart ...'),
      _('Bar Chart')));
  }

  evaluateParams(gen_params) {
    super.evaluateParams(gen_params);

    const severity_levels = get_severity_levels();

    if (gen_params.chart_template === 'info_by_cvss' ||
      gen_params.chart_template === 'recent_info_by_cvss') {
      this.setBarStyle(severity_bar_style('value', severity_levels.max_log,
        severity_levels.max_low, severity_levels.max_medium));
    }
    else if (gen_params.chart_template === 'quantile_histogram') {
      this.setBarStyle(quantile_bar_style('min_value_quantile'));
    }
    if (gen_params.x_field) {
      this.x_field = gen_params.x_field;
    }
    if (gen_params.y_fields && gen_params.y_fields[0]) {
      this.y_field = gen_params.y_fields[0];
    }

    if (is_defined(gen_params.extra)) {
      if (is_defined(gen_params.extra.show_stat_type)) {
        this.show_stat_type = !!JSON.parse(gen_params.extra.show_stat_type);
      }
      if (is_defined(gen_params.extra) &&
        is_defined(gen_params.extra.extra_tooltip_field_1)) {
        let index = 1;
        this.tooltips = [];
        while (is_defined(gen_params.extra['extra_tooltip_field_' + index])) {
          const field = gen_params.extra['extra_tooltip_field_' + index];
          const label = gen_params.extra['extra_tooltip_label_' + index];
          this.tooltips.push({field: field, label: label});
          index++;
        }
      }
    }
  }

  generate(svg, data) {
    const {records} = data;
    const x_data = records.map(d => d[this.x_field]);
    const y_data = records.map(d => d[this.y_field]);
    const y_sum = array_sum(y_data);
    const y_max = Math.max.apply(null, y_data);

    // Setup display parameters
    const height = svg.attr('height') - this.margin.top -
      this.margin.bottom;
    const width = svg.attr('width') - this.margin.left -
      this.margin.right;

    this.x_scale.rangeRoundBands([0, width], 0.125);
    this.y_scale.range([height, 0]);
    this.x_scale.domain(x_data);
    this.y_scale.domain([0, y_max]).nice(10);

    svg.text('');

    this.svg = svg.append('g');

    svg.on('mousemove', null);
    svg.on('mouseleave', null);

    this.svg.attr('transform', 'translate(' + this.margin.left + ',' +
      this.margin.top + ')');

    this.x_axis_elem = this.svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(this.x_axis);

    this.y_axis_elem = this.svg.append('g')
      .attr('class', 'y axis')
      .call(this.y_axis);

    this.tip = d3tip()
      .attr('class', 'd3-tip')
      .style('font-weight', 'normal')
      .offset([-10, 0])
      .html(d => {
        let x = d[this.x_field + '~long'];
        if (!is_defined(x)) {
          x = d[this.x_field];
        }

        let extra = '';

        /* TODO this is unused for bar chart. Remove? */
        if (is_defined(this.tooltips)) {
          for (const tooltip in this.tooltips) {
            if (this.tooltips[tooltip].label) {
              extra += '<br/><strong>' + this.tooltips[tooltip].label +
                ':</strong> ';
            }
            else {
              extra += '<br/>';
            }

            if (is_date(d[this.tooltips[tooltip].field])) {
              extra += datetime_format(d[this.tooltips[tooltip].field]);
            }
            else {
              extra += d[this.tooltips[tooltip].field];
            }
          }
        }

        if (this.y_field === 'count') {
          if (this.y_label === '') {
            return '<strong>' + x + ':</strong><br/> ' + d[this.y_field] +
              ' (' + (100 * d[this.y_field] / y_sum).toFixed(1) + '%)' +
              extra;
          }
          return '<strong>' + this.y_label + ' (' + x +
            '):</strong><br/> ' + d[this.y_field] + ' (' +
            (100 * d[this.y_field] / y_sum).toFixed(1) + '%)' +
            extra;
        }
        else if (this.y_field.indexOf('severity') === -1) {
          if (this.y_label === '') {
            return '<strong>' + x + ':</strong><br/> ' + d[this.y_field] +
              ' (' + (100 * d[this.y_field] / y_max).toFixed(1) + '%)' +
              extra;
          }
          return '<strong>' + this.y_label + ' (' + x +
            '):</strong><br/> ' + d[this.y_field] + ' (' +
            (100 * d[this.y_field] / y_max).toFixed(1) + '%)' +
            extra;
        }
        if (this.y_label === '') {
          return '<strong>' + x + ':</strong><br/> ' +
            d[this.y_field].toFixed(1) +
            ' (' + severity_level(d[this.y_field]) + ')' +
            extra;
        }
        return '<strong>' + this.y_label + ' (' + x +
          '):</strong><br/> ' + d[this.y_field].toFixed(1) +
          ' (' + severity_level(d[this.y_field]) + ')' +
          extra;
      });

    const handler = this.createGenerateLinkFunc(
      data.column_info.columns.value.column,
      data.column_info.columns.value.type,
      data.filter_info
    );

    // Add new bars
    this.svg.selectAll('.bar')
      .data(records).enter().insert('a')
      .attr('class', 'bar')
      .insert('rect', '.x.axis')
      .attr('x', d => this.x_scale(d[this.x_field]))
      .attr('y', d => this.y_scale(0))
      .attr('width', d => this.x_scale.rangeBand())
      .attr('height', d => height - this.y_scale(0))
      .on('click', handler)
      .on('mouseover', d => this.tip.show(d, d3.event.target))
      .on('mouseout', this.tip.hide);

    // Update bar widths and x axis
    this.svg.selectAll('.bar rect')
      .data(records)
      .transition().delay(0).duration(250).ease('sin-in-out')
      .attr('x', d => this.x_scale(d[this.x_field]))
      .attr('width', this.x_scale.rangeBand());

    this.x_axis_elem.transition().delay(0).duration(250).ease('sin-in-out')
      .call(this.x_axis).delay(250).duration(125)
      .attr('transform', 'translate(0,' + height + ')');

    // Update heights and y axis
    this.svg.selectAll('.bar rect')
      .data(records)
      .transition().delay(250).duration(250).ease('sin-in-out')
      .attr('y', d => this.y_scale(d[this.y_field]))
      .attr('height', d => height - this.y_scale(d[this.y_field]))
      .attr('style', this.bar_style);

    this.y_axis_elem.transition().delay(250).duration(125).ease('sin-in-out')
      .call(this.y_axis);

    // Fade out and remove unused bars
    this.svg.selectAll('.bar rect')
      .data(records)
      .exit()
      .transition().delay(0).duration(250).ease('sin-in-out')
      .style('opacity', 0)
      .remove();

    this.svg.call(this.tip);
  }

  generateCsvData(controller, data) {
    const cols = data.column_info.columns;
    return csv_from_records(
      data.records,
      data.column_info,
      [this.x_field, this.y_field], [
        column_label(cols[this.x_field], true, false, this.show_stat_type),
        column_label(cols[this.y_field], true, false, this.show_stat_type),
      ],
      controller.display.getTitle()
    );
  }

  generateHtmlTableData(controller, data) {
    const cols = data.column_info.columns;
    return html_table_from_records(
      data.records,
      data.column_info,
      [this.x_field, this.y_field],
      [
        column_label(cols[this.x_field], true, false, this.show_stat_type),
        column_label(cols[this.y_field], true, false, this.show_stat_type),
      ],
      controller.display.getTitle(),
      controller.data_src.getParam('filter')
    );
  }

  generateLink(d, i, column, type, filter_info) {
    const {value} = d;
    if (column === 'uuid') {
      return goto_details_page(type, value);
    }
    return goto_list_page(type, column, value, filter_info);
  }
}

register_chart_generator('bar', BarChartGenerator);

export default BarChartGenerator;

// vim: set ts=2 sw=2 tw=80:
