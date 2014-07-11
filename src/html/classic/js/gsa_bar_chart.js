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
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 2,
 * or, at your option, any later version as published by the Free
 * Software Foundation
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

/* Bar styler functions */

function default_bar_style (d) {
  return ("");
}

function severity_bar_style (field, max_low, max_medium) {
  var func = function (d)
             {
                if (Number(d[field]) > max_medium)
                  return ("fill: #D80000");
                else if (Number(d[field]) >= max_low)
                  return ("fill: orange");
                else if (Number(d[field]) > 0.0)
                  return ("fill: skyblue");
                else
                  return ("fill: silver");
             };
  func.max_low = max_low;
  func.max_medium = max_medium;
  func.field = field;
  return func;
}

/* Title generator functions */

function title_static (loading_text, loaded_text)
{
  return function (data)
    {
      if (typeof data === 'undefined')
        return loading_text;
      else
        return loaded_text;
    }
}

function title_total (loading_text, prefix, suffix, count_field)
{
  return function (data)
    {
      if (typeof data === 'undefined')
        return loading_text;

      var total = 0;
      for (i = 0; i < data.length; i++)
        total = Number(total) + Number(data[i][count_field]);
      return (prefix + String(total) + suffix);
    }
}

/* Data transformation functions */

function data_raw (data)
{
  return data;
}

function data_severity_histogram (raw_data, x_field, y_field)
{
  var bins = ["N/A", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

  var bin_func = function (val)
                  {
                    if (val !== "" && Number (val) <= 0.0)
                      return 1;
                    else if (Number (val) >= 10.0)
                      return 11;
                    else if (Number (val) > 0.0)
                      return Math.ceil (Number (val)) + 1;
                    else
                      return 0;
                  };

  var data = bins.map (function (d)
                        {
                          record = {};
                          record [x_field] = d;
                          record [y_field] = 0;
                          return record;
                        });

  for (var i in raw_data)
    {
      data[bin_func (raw_data [i][x_field])][y_field]
                     = Number(data[bin_func (raw_data [i][x_field])][y_field])
                       + Number(raw_data[i][y_field]);
    };

  return data;
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
  var data;
  var x_data;
  var y_data;

  var x_label = "";
  var y_label = "";

  var x_field = "value";
  var y_field = "count";

  var csv_data;
  var csv_blob;
  var csv_url;

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

  my.generate = function (xml_data, display, data_src, gen_params)
    {
      var update = (display.last_generator () == my);

      // Extract records
      switch (data_src.command ())
        {
          case "get_aggregate":
            records = extract_simple_records (xml_data,
                                              "aggregate group");
            data = data_transform (records, x_field, y_field);
            break;
          default:
            console.error ("Unsupported command:" + data_src.command ());
            return;
        }
      display.header ().text (title (data));
      x_data = data.map (function (d) { return d [x_field]; });
      y_data = data.map (function (d) { return d [y_field]; });

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
            .offset([-10, 0])
            .html(function(d) {
              if (y_label != "")
                return "<strong>" + y_label + ":</strong> " + d [y_field] + "";
              else
                return d [y_field];
            });

        }

      // Add new bars
      svg.selectAll(".bar")
          .data(data)
            .enter().insert("rect", ".x.axis")
              .attr("class", "bar")
              .attr("y", function(d) { return y_scale(0); })
              .attr("height", function(d) { return my.height() - y_scale(0); })
              .on("mouseover", my.tip.show)
              .on("mouseout", my.tip.hide)

      // Update bar widths and x axis
      svg.selectAll(".bar")
          .data(data)
            .transition().delay (0).duration (250).ease("sin-in-out")
              .attr("x", function(d) { return x_scale(d [x_field]); })
              .attr("width", x_scale.rangeBand())
      x_axis_elem.transition().delay (0).duration (250).ease("sin-in-out").call (x_axis);

      // Update heights and y axis
      svg.selectAll(".bar")
          .data(data)
            .transition().delay (250).duration (250).ease("sin-in-out")
              .attr("y", function(d) { return y_scale(d [y_field]); })
              .attr("height", function(d) { return my.height() - y_scale(d [y_field]); })
              .attr("style", bar_style);

      y_axis_elem.transition().delay (250).duration (125).ease("sin-in-out").call (y_axis);

      // Fade out and remove unused bars
      svg.selectAll(".bar")
          .data(data)
            .exit ()
              .transition().delay(0).duration(250).ease("sin-in-out")
                .style("opacity", 0)
                .remove ();

      svg.call(my.tip);

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

                    display.create_or_get_menu_item ("svg_dl")
                               .attr("href", svg_url)
                               .attr("download", "gsa_bar_chart-" + new Date().getTime() + ".svg")
                               .text("Download SVG");
                  }, 600);

      display.update_gen_data (my, gen_params);
    };

  return my;

}