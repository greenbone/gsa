/*
 * Greenbone Security Assistant
 * $Id$
 * Description: JavaScript for donut charts in GSA.
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

  gsa.register_chart_generator('donut', DonutChartGenerator);

  /* Main chart generator */
  function DonutChartGenerator() {
    // call super constructor
    gsa.BaseChartGenerator.call(this, 'donut');
  }

  DonutChartGenerator.prototype = Object.create(
      gsa.BaseChartGenerator.prototype);
  DonutChartGenerator.prototype.constructor = DonutChartGenerator;

  DonutChartGenerator.prototype.init = function() {
    this.margin = {top: 20, right: 20, bottom: 20, left: 20};

    this.x_label = '';
    this.y_label = '';

    this.x_field = 'value';
    this.y_field = 'count';

    this.setDataTransformFunc(gsa.data_raw);
    this.setColorScale(d3.scale.category20());
    this.setTitleGenerator(
      gsa.title_static(gsa._('Loading donut chart ...'), gsa._('Donut Chart')));
  };

  DonutChartGenerator.prototype.generateData = function(controller,
      original_data, gen_params) {
    var cmd = controller.data_src().command();
    var data;
    if (cmd === 'get_aggregate') {
      data = this.transformData(original_data, gen_params);
      return gsa.fill_empty_fields(data);
    }
    else {
      console.error('Unsupported command:' + cmd);
      return null;
    }
  };

  DonutChartGenerator.prototype.generate = function(controller, data,
      gen_params) {
    var display = controller.display();
    var update = this.mustUpdate(display);

    var self = this;

    // evaluate options set by gen_params
    if (gen_params.x_field) {
      this.x_field = gen_params.x_field;
    }

    if (gen_params.y_fields && gen_params.y_fields[0]) {
      this.y_field = gen_params.y_fields[0];
    }

    if (gen_params.extra.show_stat_type) {
      this.show_stat_type = !!JSON.parse(gen_params.extra.show_stat_type);
    }

    var records = data.records;
    display.setTitle(this.title_generator(data));

    var x_data = records.map(function(d) { return d[self.x_field]; });
    var y_data = records.map(function(d) { return d[self.y_field]; });

    var y_sum = 0;
    for (var i in y_data) {
      y_sum += y_data[i];
    }

    var slice_f = d3.layout.pie()
      .value(function(d) { return d[self.y_field]; })
      .sort(null);

    var slices = slice_f(records).filter(function(elem) {
      return !isNaN(elem.endAngle);
    });

    var legend_width = Math.min(240, Math.max(120,
          display.svg().attr('width') / 5));

    // Setup display parameters
    var height = display.svg().attr('height') - this.margin.top -
      this.margin.bottom;
    var width = display.svg().attr('width') - this.margin.left -
      this.margin.right - legend_width;

    if (!update) {
      display.svg().text('');
      this.svg = display.svg().append('g');

      display.svg().on('mousemove', null);
      display.svg().on('mouseleave', null);

      this.svg.attr('transform',
          'translate(' + this.margin.left + ',' + this.margin.top + ')');
    }

    var h  = Math.min(height, width) / 8;
    var cx = width / 2;
    var cy = height / 2 - h / 2;
    var rx = width / 2;
    var ry = Math.min(height / 2, width / 2) - h / 2;
    var ri = 1.0 / 2.0;

    // Remove legend
    this.svg.selectAll('.legend')
      .remove();

    // Draw legend
    var legend = this.svg.insert('g')
      .attr('class', 'legend')
      .attr('transform', 'translate(' + (width + 10.5) + ', 0)');

    var legend_y = 0;
    for (i = 0; i < slices.length; i++) {
      var d = slices[i];
      var x;
      if (d.data[this.x_field + '~long']) {
        x = d.data[this.x_field + '~long'];
      }
      else {
        x = d.data[this.x_field];
      }

      legend.insert('rect')
        .attr('height', '15')
        .attr('width', '15')
        .attr('x', 0.5)
        .attr('y', legend_y + 0.5)
        .attr('fill', this.scaleColor(x_data[i]))
        .attr('stroke', 'black')
        .attr('stroke-width', '0.25')
        .style('shape-rendering', 'geometricPrecision')
        .attr('title',
            x + ': ' + (100 * d.data[this.y_field] / y_sum).toFixed(1) +
            '% (' + d.data[this.y_field] + ')');

      var new_text = legend.insert('text')
        .attr('x', 22)
        .attr('y', legend_y + 12)
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .text(x_data[i])
        .attr('title',
            x + ': ' + (100 * d.data[this.y_field] / y_sum).toFixed(1) +
            '% (' + d.data[this.y_field] + ')');

      gsa.wrap_text(new_text, legend_width - 25);

      legend_y += Math.max(20, new_text.node().getBBox().height + 5);
    }

    legend.attr('opacity', 0)
      .transition(500)
      .attr('opacity', 1);

    // Remove old donut
    this.svg.selectAll('.donut')
      .remove();

    // Add new donut
    var donut = this.svg.insert('g')
      .attr('class', 'donut')
      .attr('transform',
          'translate(' + cx + ',' + cy + ')');

    donut.selectAll('.slice_inner')
      .data(slices)
      .enter()
      .insert('path')
      .attr('class', 'slice_inner')
      .style('shape-rendering', 'geometricPrecision')
      //                  .attr ('stroke', 'black')
      //                  .attr ('stroke-width', '0.25')
      .attr('d', function(d, i) {
        return donut_inner_path_d(d.startAngle, d.endAngle, rx, ry, ri, h);
      })
      .attr('fill', function(d, i) {
        return d3.lab(self.scaleColor(d.data[self.x_field])).darker();
      })
      .attr('title', function(d, i) {
        var x;
        if (d.data[self.x_field + '~long']) {
          x = d.data[self.x_field + '~long'];
        }
        else {
          x = d.data[self.x_field];
        }
        return x + ': ' + (100 * d.data[self.y_field] / y_sum).toFixed(1) +
          '% (' + d.data[self.y_field] + ')';
      });

    donut.selectAll('.slice_top')
      .data(slices)
      .enter()
      .insert('path')
      .attr('class', 'slice_top')
      .style('shape-rendering', 'geometricPrecision')
      //                  .attr ('stroke', 'black')
      //                  .attr ('stroke-width', '0.25')
      .attr('d', function(d, i) {
        if (d.value !== 0 &&
            (slices.length <= 1 ||
             (d.startAngle === 0 && 2 * Math.PI - d.endAngle < 1e-12))) {

          return donut_full_top_path_d(d.startAngle, d.endAngle, rx, ry, ri, h);
        }
        else {
          return donut_top_path_d(d.startAngle, d.endAngle, rx, ry, ri, h);
        }
      })
      .attr('fill', function(d, i) {
        return self.scaleColor(d.data[self.x_field]);
      })
      .attr('title', function(d, i) {
        var x;
        if (d.data[self.x_field + '~long']) {
          x = d.data[self.x_field + '~long'];
        }
        else {
          x = d.data[self.x_field];
        }
        return x + ': ' + (100 * d.data[self.y_field] / y_sum).toFixed(1) +
          '% (' + d.data[self.y_field] + ')';
      });

    donut.selectAll('.slice_outer')
      .data(slices)
      .enter()
      .insert('path')
      .attr('class', 'slice_outer')
      .style('shape-rendering', 'geometricPrecision')
      //                  .attr ('stroke', 'black')
      //                 .attr ('stroke-width', '0.25')
      .attr('d', function(d, i) {
        return donut_outer_path_d(d.startAngle, d.endAngle, rx, ry, ri, h);
      })
      .attr('fill', function(d, i) {
        return d3.lab(self.scaleColor(d.data[self.x_field])).darker();
      })
      .attr('title', function(d, i) {
        var x;
        if (d.data[self.x_field + '~long']) {
          x = d.data[self.x_field + '~long'];
        }
        else {
          x = d.data[self.x_field];
        }
        return x + ': ' + (100 * d.data[self.y_field] / y_sum).toFixed(1) +
          '% (' + d.data[self.y_field] + ')';
      });

    donut.selectAll('.slice_label')
      .data(slices)
      .enter()
      .insert('text')
      .attr('class', 'slice_label')
      .text(function(d, i) {
        if (d.endAngle - d.startAngle >= 0.02) {
          return d.data[self.y_field];
        }
        else {
          return '';
        }
      })
      .attr('x', function(d, i) {
        return Math.sin((d.startAngle + d.endAngle) / 2) * rx *
          ((1 + ri) / 2);
      })
      .attr('y', function(d, i) {
        return -Math.cos((d.startAngle + d.endAngle) / 2) * ry *
          ((1 + ri) / 2);
      })
      .attr('text-anchor', 'middle')
      .style('font-weight', 'bold')
      .style('font-size', '7pt')
      .attr('title', function(d, i) {
        var x;
        if (d.data[self.x_field + '~long']) {
          x = d.data[self.x_field + '~long'];
        }
        else {
          x = d.data[self.x_field];
        }
        return x + ': ' + (100 * d.data[self.y_field] / y_sum).toFixed(1) +
          '% (' + d.data[self.y_field] + ')';
      });

    // In case of missing data, draw a transparent grey donut
    if (slices.length === 0) {
      donut.insert('path')
        .attr('class', 'slice_inner')
        .attr('title', 'No data')
        .style('shape-rendering', 'geometricPrecision')
        .attr('d', donut_inner_path_d(0, 2 * Math.PI, rx, ry, ri, h))
        .style('fill', d3.lab('silver').darker());

      donut.insert('path')
        .attr('class', 'slice_top')
        .attr('title', 'No data')
        .style('shape-rendering', 'geometricPrecision')
        .attr('d', donut_full_top_path_d(0, 2 * Math.PI, rx, ry, ri, h))
        .style('fill', 'silver');

      donut.insert('path')
        .attr('class', 'slice_outer')
        .attr('title', 'No data')
        .style('shape-rendering', 'geometricPrecision')
        .attr('d', donut_outer_path_d(0, 2 * Math.PI, rx, ry, ri, h))
        .style('fill', d3.lab('silver').darker());
    }

    donut.attr('opacity', 0)
      .transition(500)
      .attr('opacity', (slices.length !== 0) ? 1 : 0.25);

    function relax_labels() {
      // adjust labels to not having overlapping texts
      // for details see
      // https://www.safaribooksonline.com/blog/2014/03/11/solving-d3-label-placement-constraint-relaxing/

      var elem_a, elem_b;
      var sel_a, sel_b;
      var x_a, x_b;
      var y_a, y_b;
      var width_a, width_b;
      var again = false;
      var labels = self.svg.selectAll('.slice_label');
      var label_spacing = 10;
      var delta_y;

      labels.each(function(d, i) {
        elem_a = this;

        width_a = elem_a.getComputedTextLength();
        if (width_a === 0) {
          return;
        }

        sel_a = d3.select(elem_a);
        x_a = sel_a.attr('x');
        y_a = sel_a.attr('y');

        labels.each(function(d, j) {
          elem_b = this;
          if (elem_a === elem_b) {
            return;
          }

          width_b = elem_b.getComputedTextLength();
          if (width_b === 0) {
            return;
          }

          sel_b = d3.select(elem_b);
          x_b = sel_b.attr('x');
          y_b = sel_b.attr('y');

          if (Math.abs(x_a - x_b) * 2 > (width_a + width_b)) {
            return;
          }

          delta_y = y_a - y_b;

          if (Math.abs(delta_y) > label_spacing) {
            return;
          }

          again = true;
          var adjust = (delta_y > 0 ? 1 : -1) * 1;
          sel_a.attr('y', +y_a + adjust);
          sel_b.attr('y', +y_b - adjust);
        });
      });

      if (again) {
        global.setTimeout(relax_labels, 1);
      }
    }

    relax_labels();
  };

  DonutChartGenerator.prototype.generateCsvData = function(controller, data) {
    var cols = data.column_info.columns;
    return gsa.csv_from_records(data.records,
        data.column_info,
        [this.x_field, this.y_field],
        [gsa.column_label(cols[this.x_field], true, false, this.show_stat_type),
        gsa.column_label(cols[this.y_field], true, false, this.show_stat_type)],
        controller.display().header().text());
  };

  DonutChartGenerator.prototype.generateHtmlTableData = function(controller,
      data) {
    var cols = data.column_info.columns;
    return gsa.html_table_from_records(data.records,
        data.column_info,
        [this.x_field, this.y_field],
        [gsa.column_label(cols[this.x_field], true, false, this.show_stat_type),
        gsa.column_label(cols[this.y_field], true, false, this.show_stat_type)],
        controller.display().header().text(),
        controller.data_src().param('filter'));
  };

  /*
  * Gets the path data for the inner side of a donut
  */
  function donut_inner_path_d(sa, ea, rx, ry, ri, h) {
    if ((sa > 0.5 * Math.PI) && (ea > 0.5 * Math.PI) &&
        (sa < 1.5 * Math.PI) && (ea < 1.5 * Math.PI)) {
      return 'M 0 0';
    }

    var result = [];
    var sa_trunc;
    var ea_trunc;
    var sx;
    var sy;
    var ex;
    var ey;

    if (sa <= (0.5 * Math.PI)) {
      sa_trunc = sa;
      ea_trunc = (ea < 0.5 * Math.PI ? ea : 0.5 * Math.PI);

      sx = +Math.sin(sa_trunc) * rx * ri;
      sy = -Math.cos(sa_trunc) * ry * ri;
      ex = +Math.sin(ea_trunc) * rx * ri;
      ey = -Math.cos(ea_trunc) * ry * ri;

      result.push('M', sx, sy,
                  'A', rx * ri, ry * ri, '0 0 1', ex, ey,
                  'l 0', h,
                  'A', rx * ri, ry * ri, '0 0 0', sx, sy + h,
                  'z');
    }

    if (ea >= (1.5 * Math.PI)) {
      sa_trunc = (sa > (1.5 * Math.PI) ? sa : 1.5 * Math.PI);
      ea_trunc = ea;

      sx = +Math.sin(sa_trunc) * rx * ri;
      sy = -Math.cos(sa_trunc) * ry * ri;
      ex = +Math.sin(ea_trunc) * rx * ri;
      ey = -Math.cos(ea_trunc) * ry * ri;

      result.push('M', sx, sy,
                  'A', rx * ri, ry * ri, '1 0 1', ex, ey,
                  'l 0', h,
                  'A', rx * ri, ry * ri, '1 0 0', sx, sy + h,
                  'z');
    }

    return result.join(' ');
  }

  /*
  * Gets the path data for top of a donut
  */
  function donut_top_path_d(sa, ea, rx, ry, ri, h) {
    var result = [];

    var sx =  Math.sin(sa) * rx;
    var sy = -Math.cos(sa) * ry;
    var ex =  Math.sin(ea) * rx;
    var ey = -Math.cos(ea) * ry;

    result.push('M', sx, sy,
                'A', rx, ry, '0', (ea - sa > Math.PI ? 1 : 0), '1', ex, ey,
                'L', ri * ex, ri * ey,
                'A', rx * ri, ry * ri, '0',
                  (ea - sa > Math.PI ? 1 : 0), '0', (sx * ri), (sy * ri),
                'z');

    return result.join(' ');
  }

  /*
  * Gets the path data for the top of a whole donut.
  *
  * This is needed because start and end points being the same could be
  *  interpreted as an empty / nonexistent slice by some renderers.
  */
  function donut_full_top_path_d(sa, ea, rx, ry, ri, h) {
    var result = [];

    result.push('M', 0, -ry,
                'A', rx, ry, '0', '1', '1', 0, +ry,
                'A', rx, ry, '0', '1', '1', 0, -ry,
                'M', 0, -ry * ri,
                'A', rx * ri, ry * ri, '0', '0', '0', 0, +ry * ri,
                'A', rx * ri, ry * ri, '0', '0', '0', 0, -ry * ri);

    return result.join(' ');
  }

  /*
  * Gets the path data for the outer side of a donut
  */
  function donut_outer_path_d(sa, ea, rx, ry, ri, h) {
    if ((sa < (0.5 * Math.PI) && (ea < (0.5 * Math.PI))) ||
        (sa > (1.5 * Math.Pi) && (ea > (1.5 * Math.Pi)))) {
      return 'M 0 0';
    }

    var result = [];

    var sa_trunc = (sa > (1.5 * Math.PI) ? (1.5 * Math.PI) :
        (sa < (0.5 * Math.PI) ? (0.5 * Math.PI) : sa));
    var ea_trunc = (ea > (1.5 * Math.PI) ? (1.5 * Math.PI) :
        (ea < (0.5 * Math.PI) ? (0.5 * Math.PI) : ea));

    var sx = +Math.sin(sa_trunc) * rx;
    var sy = -Math.cos(sa_trunc) * ry;
    var ex = +Math.sin(ea_trunc) * rx;
    var ey = -Math.cos(ea_trunc) * ry;

    result.push('M', sx, sy,
                'A', rx, ry, '0', (ea_trunc - sa_trunc > Math.PI ? 1 : 0),
                '1', ex, ey,
                'l', '0', h,
                'A', rx, ry, '0', (ea_trunc - sa_trunc > Math.PI ? 1 : 0),
                '0', sx, sy + h,
                'z');

    return result.join(' ');
  }
})(window, window, window.d3, window.console, window.gsa);

// vim: set ts=2 sw=2 tw=80:
