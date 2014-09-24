/*
 * Greenbone Security Assistant
 * $Id$
 * Description: JavaScript for line charts in GSA.
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

/* Main chart generator */
function LineChartGenerator ()
{
  function my () {};

  var svg;
  var height;
  var width;
  var margin = {top: 15, right: 25, bottom: 25, left: 55};

  var x_scale = d3.time.scale.utc ();
  var y_scale = d3.scale.linear ();

  var x_axis;
  var y_axis;

  var data_transform = data_raw;
  var color_scale = d3.scale.category20 ();
  var title = title_static ("Loading line chart ...", "Bubble Chart");

  var records;
  var data;

  var x_data;
  var y_data;

  var x_label = "";
  var y_label = "";

  var x_field = "value";
  var y_field = "count";

  var line = d3.svg.line()
    .x(function(d) { return x_scale (d [x_field]); })
    .y(function(d) { return y_scale (d [y_field]); });

  var csv_data;
  var csv_blob;
  var csv_url;

  var svg_data;
  var svg_blob;
  var svg_url;

  var x_min, x_max;
  var y_min, y_max;

  function time_line (data, aggregate)
  {
    var t_min = new Date (data[0][x_field] * 1000)
    var t_max = new Date (data[data.length-1][x_field] * 1000)
    var interval_days = (t_max.getTime() - t_min.getTime()) / 86400000
    var times;
    var t_index = 0;
    var data_index = 0;
    var new_data = [];
    if (aggregate == null)
      aggregate = "sum"

    if (interval_days <= 100)
      {
        times = d3.time.day.range.utc (d3.time.day.utc.floor (t_min),
                                       t_max)
      }
    else if (interval_days <= 750)
      {
        times = d3.time.week.range.utc (d3.time.week.utc.floor (t_min),
                                        t_max)
      }
    else if (interval_days <= 1500)
      {
        times = d3.time.month.range.utc (d3.time.month.utc.floor (t_min),
                                         t_max)
      }
    else
      {
        times = d3.time.month.range.utc (d3.time.year.utc.floor (t_min),
                                         t_max, 3)
      }

    var y_value;
    if (aggregate == "min")
      y_value = Infinity;
    else if (aggregate == "max")
      y_value = -Infinity;
    else
      y_value = 0;

    for (t_index in times)
      {
        var new_record = {};
        var t = times[t_index];
        new_record[x_field] = t;

        new_record[y_field] = 0;
        while (data_index < data.length
               && (t_index >= times.length - 1
                   || data [data_index][x_field] * 1000 < times[Number(t_index)+1].getTime()))
          {
            if (aggregate == "sum" || aggregate == "cumulative_sum")
              {
                y_value += Number(data [data_index][y_field])
              }
            else if (aggregate == "min")
              {
                y_value = Math.min (y_value, Number(data [data_index][y_field]))
              }
            else if (aggregate == "max")
              {
                y_value = Math.max (y_value, Number(data [data_index][y_field]))
              }
            data_index ++;
          }
        new_record[y_field] = y_value;
        if (aggregate == "min")
          y_value = Infinity;
        else if (aggregate == "max")
          y_value = -Infinity;
        else if (aggregate != "cumulative_sum")
          y_value = 0;
        new_data.push (new_record);
      }
    return (new_data);
  }

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

  my.color_scale = function (value)
    {
      if (!arguments.length)
        return color_scale;
      color_scale = value;
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

  my.generate = function (xml_data, chart, gen_params)
    {
      var display = chart.display ();
      var data_src = chart.data_src ();
      var update = (display.last_generator () == my);

      // Extract records
      switch (data_src.command ())
        {
          case "get_aggregate":
            records = extract_simple_records (xml_data,
                                              "aggregate group");
            data = data_transform (records, x_field, y_field);
            data = time_line (data, "sum");
            break;
          default:
            console.error ("Unsupported command:" + data_src.command ());
            return;
        }
      display.header ().text (title (data));

      x_data = data.map (function (d) { return d [x_field]; });
      y_data = data.map (function (d) { return d [y_field]; });
      x_min = Math.min.apply (null, x_data)
      x_max = Math.max.apply (null, x_data)
      y_min = Math.min.apply (null, y_data)
      y_max = Math.max.apply (null, y_data)

      // Setup display parameters
      height = display.svg ().attr ("height") - margin.top - margin.bottom;
      width = display.svg ().attr ("width") - margin.left - margin.right;

      if (!update)
        {
          display.svg ().text ("");
          svg = display.svg ().append ("g");

          svg.attr ("transform",
                    "translate(" + margin.left + "," + margin.top + ")");

          x_axis = d3.svg.axis ()
                          .scale(x_scale)
                          .orient("bottom")
                          .ticks (6);


          y_axis = d3.svg.axis ()
                    .scale (y_scale)
                    .orient ("left");
        }

      x_scale.range ([0, width]);
      y_scale.range ([height, 0]);

      x_scale.domain ([x_min, x_max]).nice(12);
      y_scale.domain ([0, y_max]).nice(10);

      if (!update)
        {
          display.svg ().text ("");
          svg = display.svg ().append ("g");

          svg.attr ("transform",
                    "translate(" + margin.left + "," + margin.top + ")");

          x_axis_elem = svg.append("g")
                            .attr("class", "x axis")
                            .attr("transform", "translate(0," + height + ")")
                            .call(x_axis);

          y_axis_elem = svg.append("g")
                            .attr("class", "y axis")
                            .call(y_axis);

          svg.append("path")
              .attr ("id", "line_y")
              .datum(data)
              .style("fill", "transparent")
              .style("stroke", "1px")
              .style("stroke", "green")
              .attr("d", line);

        }

      x_axis_elem
        .call (x_axis)
        .attr("transform", "translate(0," + height + ")")
      y_axis_elem.call (y_axis);

      svg.select ("#line_y")
        .datum(data)
        .attr ("d", line);

      // Create detach menu item
      display.create_or_get_menu_item ("detach")
               .attr("href", "javascript:void(0);")
               .attr("onclick", "javascript:open_detached (\"" + chart.detached_url () + "\")")
               .text("Show detached chart window");

      // Generate CSV
      csv_data = csv_from_records (data,
                                   [x_field, y_field],
                                   ["Severity", "Count"],
                                   display.header(). text ());
      if (csv_url != null)
        URL.revokeObjectURL (csv_url);
      csv_blob = new Blob([csv_data], { type: "text/csv" });
      csv_url = URL.createObjectURL(csv_blob);

      display.create_or_get_menu_item ("csv_dl")
               .attr("href", csv_url)
               .attr("download", "gsa_bar_chart-" + new Date().getTime() + ".csv")
               .text("Download CSV");

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

                    display.create_or_get_menu_item ("svg_dl")
                               .attr("href", svg_url)
                               .attr("download", "gsa_line_chart-" + new Date().getTime() + ".svg")
                               .text("Download SVG");
                  }, 600);

      display.update_gen_data (my, gen_params);
    };

  return my;

}