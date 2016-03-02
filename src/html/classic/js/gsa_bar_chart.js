/*
 * Greenbone Security Assistant
 * $Id$
 * Description: Base JavaScript for graphics in GSA.
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

(function(global, window, d3, console) {
  'use strict';
  /* Bar styler functions */

  function default_bar_style (d) {
    return ("");
  }

  /* Main chart generator */
  function BarChartGenerator ()
  {
    function my () {};

    var svg;
    var height;
    var width;
    var margin = {top: 40, right: 20, bottom: 40, left: 60};

    var x_scale = d3.scale.ordinal ();
    var y_scale = d3.scale.linear ();

    var x_axis = d3.svg.axis ()
                        .scale(x_scale)
                        .orient("bottom");

    var y_axis = d3.svg.axis ()
                  .scale (y_scale)
                  .orient ("left");

    var x_axis_elem;
    var y_axis_elem;

    var data_transform = data_raw;
    var bar_style = default_bar_style;
    var title = title_static ("Loading bar chart ...", "Bar Chart");

    var records;
    var column_info;
    var data;
    var x_data;
    var y_data;

    var x_label = "";
    var y_label = "";

    var x_field = "value";
    var y_field = "count";

    var show_stat_type = true;

    var csv_data;
    var csv_blob;
    var csv_url;

    var html_table_data;
    var html_table_blob;
    var html_table_url;

    var svg_data;
    var svg_blob;
    var svg_url;

    my.height = function ()
      {
        return height;
      }

    my.width = function ()
      {
        return width;
      }

    my.x_field = function (value)
      {
        if (!arguments.length)
          return x_field;
        x_field = value;
        return my;
      }

    my.y_field = function (value)
      {
        if (!arguments.length)
          return y_field;
        y_field = value;
        return my;
      }

    my.x_label = function (value)
      {
        if (!arguments.length)
          return x_label;
        x_label = value;
        return my;
      }

    my.y_label = function (value)
      {
        if (!arguments.length)
          return y_label;
        y_label = value;
        return my;
      }

    my.bar_style = function (value)
      {
        if (!arguments.length)
          return bar_style;
        bar_style = value;
        return my;
      }

    my.data_transform = function (value)
      {
        if (!arguments.length)
          return data_transform;
        data_transform = value;
        return my;
      }

    my.title = function (value)
      {
        if (!arguments.length)
          return title;
        title = value;
        return my;
      }

    my.show_loading = function (display)
      {
        display.header ().text (title ());
      }

    my.generate = function (original_data, chart, gen_params)
      {
        var display = chart.display ();
        var data_src = chart.data_src ();
        var update = (display.last_generator () == my);

        // evaluate options set by gen_params
        if (gen_params.x_field)
          x_field = gen_params.x_field;

        if (gen_params.y_fields && gen_params.y_fields[0])
          y_field = gen_params.y_fields[0];

        if (gen_params.extra.show_stat_type)
          show_stat_type = !!JSON.parse (gen_params.extra.show_stat_type)

        // Extract records and column info
        switch (data_src.command ())
          {
            case "get_aggregate":
              data = data_transform (original_data, gen_params);
              records = data.records;
              column_info = data.column_info;
              break;
            default:
              console.error ("Unsupported command:" + data_src.command ());
              return;
          }
        display.header ().text (title (data));
        x_data = records.map (function (d) { return d [x_field]; });
        y_data = records.map (function (d) { return d [y_field]; });

        var y_sum = 0;
        for (var i in y_data)
          {
            y_sum += y_data[i];
          }

        // Setup display parameters
        height = display.svg ().attr ("height") - margin.top - margin.bottom;
        width = display.svg ().attr ("width") - margin.left - margin.right;

        x_scale.rangeRoundBands ([0, width], 0.125);
        y_scale.range ([height, 0]);

        x_scale.domain (x_data);
        y_scale.domain ([0, Math.max.apply( null, y_data)]).nice(10);

        if (!update)
          {
            display.svg ().text ("");
            svg = display.svg ().append ("g");

            display.svg ().on ("mousemove", null)
            display.svg ().on ("mouseleave", null)

            svg.attr ("transform",
                      "translate(" + margin.left + "," + margin.top + ")");

            x_axis_elem = svg.append("g")
                              .attr("class", "x axis")
                              .attr("transform", "translate(0," + height + ")")
                              .call(x_axis);

            y_axis_elem = svg.append("g")
                              .attr("class", "y axis")
                              .call(y_axis);

            my.tip = d3.tip()
              .attr('class', 'd3-tip')
              .style ("font-weight", "normal")
              .offset([-10, 0])
              .html(function(d) {
                var x;
                if (d [x_field + "~long"])
                  x = d [x_field + "~long"];
                else
                  x = d [x_field]

                if (y_field == "count")
                  {
                    if (y_label != "")
                      return "<strong>" + y_label + " (" + x + "):</strong><br/> "
                              + d [y_field]
                              + " (" + (100 * d [y_field] / y_sum).toFixed (1) + "%)";
                    else
                      return "<strong>" + x + ":</strong><br/> " + d [y_field]
                              + " (" + (100 * d [y_field] / y_sum).toFixed (1) + "%)";
                  }
                else
                  {
                    if (y_label != "")
                      return "<strong>" + y_label + " (" + x + "):</strong><br/> "
                              + d [size_field]
                              + " (" + (100 * d [y_field] / y_max).toFixed (1) + "%)";
                    else
                      return "<strong>" + x + ":</strong><br/> " + d [y_field]
                              + " (" + (100 * d [y_field] / y_max).toFixed (1) + "%)";
                  }
              });

          }

        // Add new bars
        svg.selectAll(".bar")
            .data(records)
              .enter().insert("rect", ".x.axis")
                .attr("class", "bar")
                .attr("x", function(d) { return x_scale (d [x_field])})
                .attr("y", function(d) { return y_scale(0); })
                .attr("width", function(d) { return x_scale.rangeBand() })
                .attr("height", function(d) { return my.height() - y_scale(0); })
                .on("mouseover", my.tip.show)
                .on("mouseout", my.tip.hide)

        // Update bar widths and x axis
        svg.selectAll(".bar")
            .data(records)
              .transition().delay (0).duration (250).ease("sin-in-out")
                .attr("x", function(d) { return x_scale(d [x_field]); })
                .attr("width", x_scale.rangeBand())
        x_axis_elem.transition().delay (0).duration (250).ease("sin-in-out").call (x_axis)
                                .delay (250).duration (125).attr("transform", "translate(0," + height + ")");

        // Update heights and y axis
        svg.selectAll(".bar")
            .data(records)
              .transition().delay (250).duration (250).ease("sin-in-out")
                .attr("y", function(d) { return y_scale(d [y_field]); })
                .attr("height", function(d) { return my.height() - y_scale(d [y_field]); })
                .attr("style", bar_style);

        y_axis_elem.transition().delay (250).duration (125).ease("sin-in-out").call (y_axis);

        // Fade out and remove unused bars
        svg.selectAll(".bar")
            .data(records)
              .exit ()
                .transition().delay(0).duration(250).ease("sin-in-out")
                  .style("opacity", 0)
                  .remove ();

        svg.call(my.tip);

        // Create detach menu item
        display.create_or_get_menu_item ("detach")
                .attr("href", "javascript:void(0);")
                .attr("onclick", "javascript:open_detached (\"" + chart.detached_url () + "\")")
                .text("Show detached chart window");

        // Generate CSV
        csv_data = csv_from_records (records,
                                    column_info,
                                    [x_field, y_field],
                                    [column_label (column_info.columns [x_field], true, false, show_stat_type),
                                      column_label (column_info.columns [y_field], true, false, show_stat_type)],
                                    display.header(). text ());
        if (csv_url != null)
          URL.revokeObjectURL (csv_url);
        csv_blob = new Blob([csv_data], { type: "text/csv" });
        csv_url = URL.createObjectURL(csv_blob);

        display.create_or_get_menu_item ("csv_dl")
                .attr("href", csv_url)
                .attr("download", "gsa_bar_chart-" + new Date().getTime() + ".csv")
                .text("Download CSV");

        // Generate HTML table
        if (html_table_url != null)
          {
            URL.revokeObjectURL (html_table_url);
            html_table_data = null;
            html_table_url = null;
          }
        var open_html_table = function ()
          {
            if (html_table_url == null)
              {
                html_table_data
                  = html_table_from_records (records,
                                            column_info,
                                            [x_field, y_field],
                                            [column_label (column_info.columns [x_field], true, false, show_stat_type),
                                              column_label (column_info.columns [y_field], true, false, show_stat_type)],
                                            display.header(). text (),
                                            data_src.param ("filter"));
                html_table_blob = new Blob([html_table_data], { type: "text/html" });
                html_table_url = URL.createObjectURL(html_table_blob);
              }
            window.open (html_table_url);
            return true;
          }
        display.create_or_get_menu_item ("html_table")
                    .attr("href", "#")
                    .on("click", open_html_table)
                    .text("Show HTML table");

        // Generate SVG after transition
        setTimeout(function()
                    {
                      svg_data = svg_from_elem (display.svg (),
                                                display.header ().text ());
                      if (svg_url != null)
                        URL.revokeObjectURL (svg_url);
                      svg_blob = new Blob([svg_data], { type: "image/svg+xml" });
                      svg_url = URL.createObjectURL(svg_blob);

                      display.create_or_get_menu_item ("svg_window")
                                .attr("href", "javascript:void(0)")
                                .attr("onclick", "blob_img_window (\"" + svg_url + "\")")
                                .text("Show copyable SVG");

                      display.create_or_get_menu_item ("svg_dl", true /* Last. */)
                                .attr("href", svg_url)
                                .attr("download", "gsa_bar_chart-" + new Date().getTime() + ".svg")
                                .text("Download SVG");
                    }, 600);

        display.update_gen_data (my, gen_params);
      };

    return my;

  }
})(window, window, window.d3, window.console);

// vim: set ts=2 sw=2 tw=80:
