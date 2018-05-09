
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
import d3cloud from 'd3-cloud';

import _ from 'gmp/locale.js';

import {
  column_label,
  csv_from_records,
  data_raw,
  goto_list_page,
  html_table_from_records,
  title_static,
} from '../helper.js';

import {register_chart_generator} from '../controller.js';

import AggregateChartGenerator from './aggregate.js';

class CloudChartGenerator extends AggregateChartGenerator {

  constructor() {
    super('cloud');
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
    this.x_field = 'value';
    this.y_field = 'count';
    this.show_stat_type = true;
    this.setDataTransformFunc(data_raw);
    this.setColorScale(d3.scale.category10());
    this.setTitleGenerator(title_static(_('Loading word cloud ...'),
      _('Word Cloud')));
  }

  evaluateParams(gen_params) {
    super.evaluateParams(gen_params);

    if (gen_params.x_field) {
      this.x_field = gen_params.x_field;
    }
    if (gen_params.y_fields && gen_params.y_fields[0]) {
      this.y_field = gen_params.y_fields[0];
    }
    if (gen_params.extra.show_stat_type) {
      this.show_stat_type = !!JSON.parse(gen_params.extra.show_stat_type);
    }
  }

  generate(svg, data) {
    const {records, column_info, filter_info} = data;

    const cloud = d3cloud();

    // Setup display parameters
    const height = svg.attr('height') - this.margin.top -
      this.margin.bottom;
    const width = svg.attr('width') - this.margin.left -
      this.margin.right;

    svg.text('');

    this.svg = svg.append('g');

    svg.on('mousemove', null);
    svg.on('mouseleave', null);

    this.svg.attr('transform',
      'translate(' + this.margin.left + ',' + this.margin.top + ')');

    // generate cloud
    cloud.stop();
    this.svg.selectAll('*').remove();

    let x;
    let y;
    let max_y = 1;

    for (const record of records) {
      x = record[this.x_field];
      y = record[this.y_field];
      if (y > max_y && x !== '') {
        max_y = y;
      }
    }

    const words = [];
    const max_y_scaled = Math.log(max_y);

    for (const record of records) {
      x = record[this.x_field];
      y = record[this.y_field];

      const y_scaled = Math.log(y) / max_y_scaled * 20;
      if (y_scaled >= 8.0 && x !== '') {
        words.push({text: x, size: y_scaled});
      }
    }

    this.color_scale.domain(words);

    const handler = this.createGenerateLinkFunc(column_info.group_column,
      column_info.columns[this.x_field].type, filter_info);

    const self = this;
    cloud
      .size([width, height])
      .fontSize(d => d.size)
      .rotate(0)
      .font('Sans')
      .words(words)
      .on('end', wrds => {
        self.svg.selectAll('text')
          .data(wrds)
          .enter()
            .append('a')
              .on('click', handler)
              .append('text')
                .style('font-size', d => d.size + 'px')
                .style('font-family', d => d.font)
                .style('font-weight', d => d.weight)
                .style('fill', d => self.scaleColor(d.text))
                .attr('text-anchor', 'middle')
                .attr('transform', d => {
                  return 'translate(' + [d.x + width / 2 + this.margin.left,
                    d.y + height / 2 + this.margin.top] +
                    ')rotate(' + d.rotate + ')';
                })
                .text(d => d.text);
      })
      .start();
  }

  generateCsvData(controller, data) {
    const cols = data.column_info.columns;
    return csv_from_records(
      data.records,
      data.column_info,
      [this.x_field, this.y_field],
      [
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
    const value = d.text;
    return goto_list_page(type, column, value, filter_info, '~');
  }
}

register_chart_generator('cloud', CloudChartGenerator);

// vim: set ts=2 sw=2 tw=80:

