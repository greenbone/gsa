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
import {is_defined} from 'gmp/utils';

import {
  column_label,
  csv_from_records,
  goto_list_page,
  goto_details_page,
  html_table_from_records,
  format_data,
  resource_type_name,
  severity_colors_gradient,
  title_static,
} from '../helper.js';

import {register_chart_generator} from '../controller.js';

import AggregateChartGenerator from './aggregate.js';

const create_bubble = (selection, data, no_chart_links) => {

  const new_node_a = selection.append('g')
    .attr('class', 'node')
    .attr('transform', d => 'translate(' + d.x + ',' + d.y + ')')
    .append('a');

  new_node_a.on('click', d => {
    if (no_chart_links === true) {
      return null;
    }

    const group_col_info = data.column_info.columns.group_value;
    if (group_col_info.column === 'uuid') {
      return goto_details_page(group_col_info.type, d.group_value);
    }

    return goto_list_page(
      group_col_info.type,
      group_col_info.column,
      d.group_value,
      data.filter_info,
    );
  });

  new_node_a
    .append('circle')
    .attr('r', d => d.r)
    .style('fill', 'green');

  new_node_a
    .append('text')
    .attr('class', 'node-label')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .style('font-weight', 'normal')
    .style('font-size', '10px')
    .text('X');
};

const simple_bubble_data = (old_data, params) => {
  const label_field = params && params.x_field ? params.x_field : 'value';
  const size_field = params && params.y_fields && params.y_fields[0] ?
    params.y_fields[0] : 'count';
  const color_field = params && params.z_fields && params.z_fields[0] ?
    params.z_fields[0] : old_data.column_info.data_columns[0] + '_mean';
  const group_field = 'value';

  const column_info = {
    group_column: 'group_value',
    data_columns: ['size_value', 'color_value'],
    text_columns: ['label_value'],
    columns: {},
  };

  column_info.columns.label_value = {
    name: 'label_value',
    type: old_data.column_info.columns[label_field].type,
    column: old_data.column_info.columns[label_field].column,
    stat: old_data.column_info.columns[label_field].stat,
    data_type: old_data.column_info.columns[label_field].data_type,
  };

  column_info.columns.size_value = {
    name: 'size_value',
    type: old_data.column_info.columns[size_field].type,
    column: old_data.column_info.columns[size_field].column,
    stat: old_data.column_info.columns[size_field].stat,
    data_type: old_data.column_info.columns[size_field].data_type,
  };

  column_info.columns.color_value = {
    name: 'color_value',
    type: old_data.column_info.columns[color_field].type,
    column: old_data.column_info.columns[color_field].column,
    stat: old_data.column_info.columns[color_field].stat,
    data_type: old_data.column_info.columns[color_field].data_type,
  };

  column_info.columns.group_value = {
    name: 'group_value',
    type: old_data.column_info.columns[group_field].type,
    column: old_data.column_info.columns[group_field].column,
    stat: old_data.column_info.columns[group_field].stat,
    data_type: old_data.column_info.columns[group_field].data_type,
  };

  const bubble_data = [];

  for (const d in old_data.records) {
    const new_record = {};

    new_record.label_value = old_data.records[d][label_field];
    new_record.size_value = old_data.records[d][size_field];

    if (color_field) {
      new_record.color_value = old_data.records[d][color_field];
    }
    else {
      new_record.color_value = null;
    }

    new_record.group_value = old_data.records[d][group_field];

    bubble_data.push(new_record);
  }

  return {
    column_info: column_info,
    records: bubble_data,
    filter_info: old_data.filter_info,
  };
};

class BubbleChartGenerator extends AggregateChartGenerator {

  constructor() {
    super('bubble');
  }

  init() {
    this.margin = {
      top: 5,
      right: 5,
      bottom: 5,
      left: 5,
    };
    this.x_label = '';
    this.y_label = '';
    this.color_label = '';
    this.x_field = 'value';
    this.y_field = 'count';
    this.color_field = 'mean';

    this.setDataTransformFunc(simple_bubble_data);
    this.setColorScale(severity_colors_gradient());
    this.setTitleGenerator(title_static(_('Loading bubble chart ...'),
      _('Bubble Chart')));
  }

  generateData(original_data, gen_params) {
    return this.transformData(original_data, gen_params);
  }

  evaluateParams(gen_params) {
    super.evaluateParams(gen_params);

    if (gen_params.x_field) {
      this.x_field = gen_params.x_field;
    }

    if (gen_params.y_fields && gen_params.y_fields[0]) {
      this.y_field = gen_params.y_fields[0];
    }

    if (gen_params.z_fields && gen_params.z_fields[0]) {
      this.color_field = gen_params.z_fields[0];
    }

    if (is_defined(gen_params.extra)) {
      if (gen_params.extra.show_stat_type) {
        this.show_stat_type = !!JSON.parse(gen_params.extra.show_stat_type);
      }
      if (gen_params.extra.empty_text) {
        this.empty_text = gen_params.extra.empty_text;
      }
    }
  }

  generate(svg, data, update) {
    const {records, column_info} = data;

    this.color_label = column_label(
      column_info.columns.color_value,
      false,
      false,
      this.show_stat_type
    );

    if (!is_defined(this.empty_text)) {
      this.empty_text = _('No matching {{resource_type}}', {
        resource_type: resource_type_name(column_info.columns.label_value.type),
        interpolation: {escape: false},
      });
    }

    // Setup display parameters
    const height = svg.attr('height') - this.margin.top - this.margin.bottom;
    const width = svg.attr('width') - this.margin.left - this.margin.right;

    if (update) {
      svg.text('');
      this.svg = svg.append('g');

      svg.on('mousemove', null);
      svg.on('mouseleave', null);

      this.svg.attr('transform',
        'translate(' + this.margin.left + ',' + this.margin.top + ')');
    }

    // Create bubbles
    const bubbles = d3.layout.pack()
      .sort(null)
      .size([width, height])
      .value(d => d.size_value)
      .padding(1.5);

    const filtered_records = [];
    for (const i in records) {
      if (records[i].size_value !== 0) {
        filtered_records.push(records[i]);
      }
    }

    let records_empty;
    if (filtered_records.length === 0) {
      records_empty = true;
      const dummy = {
        color_value: 0,
        size_value: 1,
        label_value: '* ' + this.empty_text + ' *',
      };
      filtered_records.push(dummy);
    }
    else {
      records_empty = false;
    }

    const tooltip_func = d => {
      if (records_empty) {
        return this.empty_text;
      }

      const label_value = format_data(
        d.label_value,
        data.column_info.columns.label_value
      );
      const size_value = format_data(
        d.size_value,
        data.column_info.columns.size_value,
      );
      const color_value = format_data(
        d.color_value,
        data.column_info.columns.color_value
      );
      return label_value + ': ' + size_value +
        ' (' + this.color_label + ': ' + color_value + ')';
    };

    const tooltip = d3tip()
      .attr('class', 'd3-tip')
      .style('font-weight', 'bold')
      .offset([-10, 0])
      .html(d => tooltip_func(d));

    const nodes = bubbles.nodes({children: filtered_records})
      .filter(d => d.depth !== 0);

    this.svg.selectAll('.node')
      .data(nodes)
      .enter()
      .call(selection =>
         create_bubble(selection, data, this.no_chart_links)
      );

    // Remove unused bubbles
    this.svg.selectAll('.node')
      .data(nodes)
      .exit()
      .remove();

    // Update bubbles
    this.svg.selectAll('.node')
      .attr('transform', d => 'translate(' + d.x + ',' + d.y + ')'
      )
      .on('mouseover', function(d) {
        // always show tooltip obove the label
        const target = d3.select(this).select('.node-label').node();
        tooltip.show(d, target);
      })
      .on('mouseout', tooltip.hide)
      .select('circle')
      .attr('r', d => d.r)
      .attr('title', tooltip_func)
      .style('fill', d => this.scaleColor(d.color_value));

    this.svg.selectAll('.node')
      .select('text')
      .attr('title', tooltip_func)
      .text(d => d.label_value.substring(0, d.r / 3));

    this.svg.call(tooltip);
  }

  generateCsvData(controller, data) {
    const cols = data.column_info.columns;
    return csv_from_records(
      data.records,
      data.column_info,
      ['label_value', 'size_value', 'color_value'],
      [
        column_label(cols.label_value, true, false, this.show_stat_type),
        column_label(cols.size_value, true, false, this.show_stat_type),
        column_label(cols.color_value, true, false, this.show_stat_type),
      ],
      controller.display.getTitle()
    );
  }

  generateHtmlTableData(controller, data) {
    const cols = data.column_info.columns;
    return html_table_from_records(
      data.records,
      data.column_info,
      ['label_value', 'size_value', 'color_value'],
      [
        column_label(cols.label_value, true, false, this.show_stat_type),
        column_label(cols.size_value, true, false, this.show_stat_type),
        column_label(cols.color_value, true, false, this.show_stat_type),
      ],
      controller.display.getTitle(),
      controller.data_src.getParam('filter')
    );
  }
}

register_chart_generator('bubbles', BubbleChartGenerator);

// vim: set ts=2 sw=2 tw=80:
