/*
 * Greenbone Security Assistant
 * $Id$
 * Description: JavaScript for word cloud charts in GSA.
 *
 * Authors:
 * Timo Pollmeier <timo.pollmeier@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2014 Greenbone Networks GmbH
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

(function(global, window, d3, console, gsa) {
  'use strict';

  gsa.register_chart_generator('cloud', CloudChartGenerator);

  function CloudChartGenerator() {
    gsa.BaseChartGenerator.call(this, 'cloud');
  }

  CloudChartGenerator.prototype = Object.create(
    gsa.BaseChartGenerator.prototype);
  CloudChartGenerator.prototype.constructor = CloudChartGenerator;

  CloudChartGenerator.prototype.init = function() {
    this.margin = {top: 5, right: 5, bottom: 5, left: 5};

    this.x_label = '';
    this.y_label = '';

    this.x_field = 'value';
    this.y_field = 'count';

    this.show_stat_type = true;

    this.setDataTransformFunc(gsa.data_raw);
    this.setColorScale(d3.scale.category10());
    this.setTitleGenerator(gsa.title_static(gsa._('Loading word cloud ...'),
          gsa._('Word Cloud')));

  };

  CloudChartGenerator.prototype.generateData = function(controller,
      original_data, gen_params) {

    var cmd = controller.data_src().command();
    if (cmd === 'get_aggregate') {
      return this.transformData(original_data, gen_params);
    }
    else {
      console.error('Unsupported command:' + cmd);
      return null;
    }
  };

  CloudChartGenerator.prototype.evaluateParams = function(gen_params) {
    if (gen_params.x_field) {
      this.x_field = gen_params.x_field;
    }

    if (gen_params.y_fields && gen_params.y_fields[0]) {
      this.y_field = gen_params.y_fields[0];
    }

    if (gen_params.extra.show_stat_type) {
      this.show_stat_type = !!JSON.parse(gen_params.extra.show_stat_type);
    }
  };

  CloudChartGenerator.prototype.generate = function(controller, data) {
    var self = this;

    var display = controller.display();
    var update = this.mustUpdate(display);

    this.noChartLinks = controller.display().dashboard().noChartLinks();

    // evaluate options set by gen_params
    var records = data.records;
    display.setTitle(this.title_generator(data));

    var cloud = d3.layout.cloud();

    // Setup display parameters
    var height = display.svg().attr('height') - this.margin.top -
      this.margin.bottom;
    var width = display.svg().attr('width') - this.margin.left -
      this.margin.right;

    if (!update) {
      display.svg().text('');
      this.svg = display.svg().append('g');

      display.svg().on('mousemove', null);
      display.svg().on('mouseleave', null);

      this.svg.attr('transform',
        'translate(' + this.margin.left + ',' + this.margin.top + ')');
    }

    // generate cloud
    cloud.stop();
    this.svg.html('');

    var i;
    var x;
    var y;
    var max_y = 1;
    for (i in records) {
      x = records[i][this.x_field];
      y = records[i][this.y_field];
      if (y > max_y && x !== '') {
        max_y = y;
      }
    }

    var words = [];
    var scale_domain = [];
    var max_y_scaled = Math.log(max_y);
    for (i in records) {
      x = records[i][this.x_field];
      y = records[i][this.y_field];
      var y_scaled = Math.log(y) / max_y_scaled * 20;
      if (y_scaled >= 8.0 && x !== '') {
        words.push({text: x, size: y_scaled});
        scale_domain.push(x);
      }
    }

    this.color_scale.domain(words);

    function generate_link(d, i) {
      if (self.noChartLinks) {
        return null;
      }
      var type = data.column_info.columns[self.x_field].type;
      var column = data.column_info.group_columns[0];
      var value = d.text;

      return gsa.filtered_list_url(type, column, value, data.filter_info, '~');
    }

    cloud
      .size([width, height])
      .fontSize(function(d) { return d.size; })
      .rotate(0)
      .font('Sans')
      .words(words)
      .on('end', function(words) {
        self.svg.selectAll('text')
          .data(words)
          .enter().append('a')
            .attr('xlink:href', generate_link)
            .append('text')
              .style('font-size', function(d) { return d.size + 'px'; })
              .style('font-family', function(d) { return d.font; })
              .style('font-weight', function(d) { return d.weight; })
              .style('fill', function(d, i) { return self.scaleColor(d.text); })
              .attr('text-anchor', 'middle')
              .attr('transform', function(d) {
                return 'translate(' + [d.x + width / 2 + self.margin.left,
                    d.y + height / 2 + self.margin.top] +
                    ')rotate(' + d.rotate + ')';
              })
              .text(function(d) { return d.text; });
      })
      .start();
  };

  CloudChartGenerator.prototype.generateCsvData = function(controller, data) {
    var cols = data.column_info.columns;
    return gsa.csv_from_records(data.records, data.column_info,
        [this.x_field, this.y_field],
        [gsa.column_label(cols[this.x_field], true, false, this.show_stat_type),
        gsa.column_label(cols[this.y_field], true, false, this.show_stat_type)],
        controller.display().header().text());
  };

  CloudChartGenerator.prototype.generateHtmlTableData = function(controller,
      data) {
    var cols = data.column_info.columns;
    return gsa.html_table_from_records(data.records, data.column_info,
        [this.x_field, this.y_field],
        [gsa.column_label(cols[this.x_field], true, false, this.show_stat_type),
        gsa.column_label(cols[this.y_field], true, false, this.show_stat_type)],
        controller.display().header().text(),
        controller.data_src().param('filter'));
  };

})(window, window, window.d3, window.console, window.gsa);

// vim: set ts=2 sw=2 tw=80:
