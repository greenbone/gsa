/*
 * Greenbone Security Assistant
 * $Id$
 * Description: Horizontal bar chart in GSA.
 *
 * Authors:
 * Timo Pollmeier <timo.pollmeier@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2015 Greenbone Networks GmbH
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
import {
  has_value,
  is_array,
  is_date,
  is_defined,
  is_string,
} from 'gmp/utils.js';

import {get_severity_levels} from '../../../../utils/render.js';

import {
  array_sum,
  datetime_format,
  resource_type_name,
  title_static,
  severity_bar_style,
  severity_level,
} from '../helper.js';

import {register_chart_generator} from '../controller.js';

import BarChartGenerator from './bar.js';

const default_bar_style = d => '';

/*
* Transform data into a top 10 list.
*/
const data_top_list = (old_data, params) => {
  const new_data = {
    records: [],
    column_info: old_data.column_info,
    filter_info: old_data.filter_info,
  };

  const y_field = is_defined(params.y_fields) &&
      has_value(params.y_fields[0]) ?
    params.y_fields[0] :
    'count';

  // Take only top 10 records with non-zero y field
  let top_count = 10;
  for (const i in old_data.records) {
    if (top_count) {
      if (old_data.records[i][y_field] > 0) {
        top_count--;
        new_data.records.push(old_data.records[i]);
      }
    }
    else {
      break;
    }
  }

  return new_data;
};

class HorizontalBarChartGenerator extends BarChartGenerator {

  constructor() {
    super('h_bar');
  }

  init() {
    this.margin = {
      top: 40,
      right: 30,
      bottom: 40,
      left: 175,
    };
    this.x_label = '';
    this.y_label = '';
    this.x_field = 'value';
    this.y_field = 'count'; // == size_field
    this.show_stat_type = true;

    this.x_scale = d3.scale.ordinal();
    this.y_scale = d3.scale.linear(); // == size_scale
    this.x_axis = d3.svg.axis()
      .scale(this.x_scale)
      .tickSize(0)
      .orient('left');

    this.y_axis = d3.svg.axis() // == size_axis
      .scale(this.y_scale)
      .ticks(5)
      .orient('bottom');

    this.setDataTransformFunc(data_top_list);
    this.setBarStyle(default_bar_style);
    this.setTitleGenerator(title_static(_('Loading horizontal bar chart ...'),
      _('Horizontal Bar Chart')));
  }

  evaluateParams(gen_params) {
    super.evaluateParams(gen_params);

    if (is_defined(gen_params.extra)) {
      this.empty_text = gen_params.extra.empty_text;
      this.score_severity = gen_params.extra.score_severity;
      this.score_assets = gen_params.extra.score_assets;
      this.score_asset_type = gen_params.extra.score_asset_type;
    }

    this.z_fields = gen_params.z_fields;

    const severity_levels = get_severity_levels();

    if (!has_value(gen_params.chart_template) ||
      gen_params.chart_template === '') {
      if (is_array(this.z_fields) && is_string(this.z_fields[0])) {
        if (this.z_fields[0].indexOf('severity') !== -1) {
          this.setBarStyle(severity_bar_style(
            this.z_fields[0],
            severity_levels.max_log,
            severity_levels.max_low,
            severity_levels.max_medium,
          ));
        }
      }
      else if (is_string(this.y_field) &&
        this.y_field.indexOf('severity') !== -1) {
        this.setBarStyle(severity_bar_style(
          this.y_field,
          severity_levels.max_log,
          severity_levels.max_low,
          severity_levels.max_medium,
        ));
      }
    }
  }

  generate(svg, data, update) {
    if (!is_defined(this.empty_text)) {
      this.empty_text = _('No matching {{resource_type}}', {
        resource_type: resource_type_name(
          data.column_info.columns[this.x_field].type),
      });
    }

    const {records} = data;
    const x_data = records.map(d => d[this.x_field]);
    const y_data = records.map(d => d[this.y_field]);

    const y_sum = array_sum(y_data);
    const y_max = Math.max.apply(null, y_data); // == size_max

    // Adjust margin to labels
    let max_len = 0;
    for (const i in x_data) {
      const len = x_data[i].toString().length;
      if (len > max_len) {
        max_len = len;
      }
    }

    this.margin.left = this.margin.right + Math.min(25, max_len) * 6.5;

    // Setup display parameters
    const height = svg.attr('height') - this.margin.top -
      this.margin.bottom;
    const width = svg.attr('width') - this.margin.left -
      this.margin.right;

    this.x_scale.rangeRoundBands([0, height], 0.125);
    this.y_scale.range([0, width]);
    this.x_axis.tickFormat(d => {
      const text = d.toString();
      if (text.length > 25) {
        if (text.slice(0, 4) === 'cpe:') {
          return '…' + text.slice(Math.max(4, text.length - 25), text.length);
        }
        return text.slice(0, 25) + '…';
      }
      return text;
    });

    this.x_scale.domain(x_data);
    this.y_scale.domain([0, y_max]).nice(10);

    if (update) {
      svg.text('');

      this.svg = svg.append('g');

      svg.on('mousemove', null);
      svg.on('mouseleave', null);

      this.x_axis_elem = this.svg.append('g')
        .attr('class', 'x axis')
        .call(this.x_axis);

      this.y_axis_elem = this.svg.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(this.y_axis);

      this.tip = d3tip()
        .attr('class', 'd3-tip')
        .style('font-weight', 'normal')
        .offset([-10, 0])
        .html(d => {
          let x;
          if (d[this.x_field + '~long']) {
            x = d[this.x_field + '~long'];
          }
          else {
            x = d[this.x_field];
          }

          let extra = '';
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
          else if (this.y_field.indexOf('severity_score') !== -1) {
            if (is_defined(this.score_severity) &&
              is_defined(this.score_assets) &&
              is_defined(this.score_asset_type)) {

              let breakdown_extra;
              if (this.score_asset_type === 'hosts') {
                breakdown_extra = _('<br/>({{assets}} Host(s) with ' +
                  'average severity {{severity}})', {
                    assets: d[this.score_assets],
                    severity: d[this.score_severity],
                  });
              }
              else {
                breakdown_extra = '';
              }

              if (this.y_label === '') {
                return '<strong>' + x + ':</strong><br/> ' +
                  d[this.y_field].toFixed(2) +
                  breakdown_extra + extra;
              }
              return '<strong>' + this.y_label + ' (' + x +
                '):</strong><br/> ' + d[this.y_field].toFixed(2) +
                breakdown_extra + extra;
            }

            if (this.y_label === '') {
              return '<strong>' + x + ':</strong><br/> ' +
                d[this.y_field].toFixed(2) +
                extra;
            }
            return '<strong>' + this.y_label + ' (' + x +
              '):</strong><br/> ' + d[this.y_field].toFixed(2) +
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
    }

    this.svg.attr('transform',
      'translate(' + this.margin.left + ',' + this.margin.top + ')');

    // Add a text if records list is empty
    const dummy_data = [];
    if (records.length === 0) {
      dummy_data.push('dummy');
    }

    // Text if record set is empty
    this.svg.selectAll('.empty_text')
      .data(dummy_data)
      .enter().insert('text')
      .attr('class', 'empty_text')
      .style('dominant-baseline', 'middle')
      .style('text-anchor', 'middle')
      .text(this.empty_text);

    this.svg.selectAll('.empty_text')
      .data(dummy_data)
      .exit()
      .remove();

    this.svg.selectAll('.empty_text')
      .data(dummy_data)
      .attr('x', width / 2)
      .attr('y', height / 2);

    const handler = this.createGenerateLinkFunc(
      data.column_info.columns.value.column,
      data.column_info.columns.value.type,
      data.filter_info,
    );

    // Fade out and remove unused bars
    this.svg.selectAll('.bar')
      .data(records)
      .exit()
      .transition().delay(0).duration(250).ease('sin-in-out')
      .style('opacity', 0)
      .remove();

    // Add new bars
    this.svg.selectAll('.bar')
      .data(records).enter().insert('a')
      .attr('class', 'bar')
      .on('click', handler)
      .insert('rect', '.x.axis')
      .attr('class', 'bar-rect')
      .attr('x', this.y_scale(0))
      .attr('y', d => this.x_scale(d[this.x_field]))
      .attr('width', 0)
      .attr('height', d => this.x_scale.rangeBand())
      .on('mouseover', d => this.tip.show(d, d3.event.target))
      .on('mouseout', this.tip.hide);

    // Update bar heights and x axis
    this.svg.selectAll('.bar rect')
      .data(records)
      .transition().delay(0).duration(250).ease('sin-in-out')
      .attr('y', d => this.x_scale(d[this.x_field]))
      .attr('height', this.x_scale.rangeBand());

    this.x_axis_elem
      .transition()
      .delay(0)
      .duration(125)
      .ease('sin-in-out')
      .call(this.x_axis);

    // Update widths and size axis
    this.svg.selectAll('.bar rect')
      .data(records)
      .transition().delay(500).duration(250).ease('sin-in-out')
      .attr('width', d => this.y_scale(d[this.y_field]))
      .attr('style', this.bar_style);

    this.y_axis_elem
      .attr('transform', 'translate(0,' + height + ')')
      .transition()
      .delay(0)
      .duration(125)
      .ease('sin-in-out')
      .call(this.y_axis);

    this.svg.call(this.tip);
  }
}

register_chart_generator('horizontal_bar', HorizontalBarChartGenerator);

// vim: set ts=2 sw=2 tw=80:
