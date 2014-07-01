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

/* Main chart generator */
function DonutChartGenerator ()
{
  function my () {};

  var svg;
  var height;
  var width;
  var margin = {top: 20, right: 20, bottom: 20, left: 20};
  var legend_width = 120;

  var data_transform = data_raw;
  var color_scale = d3.scale.category20 ();
  var title = title_static ("Loading donut chart ...", "Donut Chart");

  var records;
  var data;
  var slice_f;

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

      slice_f = d3.layout.pie()
                           .value (function(d) { return d[y_field]; })
                           .sort (null)

      var slices = slice_f (data);

      // Setup display parameters
      height = display.svg ().attr ("height") - margin.top - margin.bottom;
      width = display.svg ().attr ("width") - margin.left - margin.right - legend_width;

      if (!update)
        {
          display.svg ().text ("");
          svg = display.svg ().append ("g");

          svg.attr ("transform",
                    "translate(" + margin.left + "," + margin.top + ")");

        }

      var h  = Math.min(height, width)/8,
          cx = width/2,
          cy = height/2 - h/2,
          rx = width/2,
          ry = Math.min(height/2, width/2) - h/2,
          ri = 1.0/2.0

      // Remove legend
      svg.selectAll (".legend")
            .remove ();

      // Draw legend
      var legend = svg.insert ("g")
                        .attr ("class", "legend")
                        .attr ("transform", "translate(" + (width + 10.5) + ", 0)")

      for (var i = 0; i < x_data.length; i++)
        {
          legend.insert ("rect")
              .attr ("height", "15")
              .attr ("width", "15")
              .attr ("x", 0.5)
              .attr ("y", 20 * i + 0.5)
              .attr ("fill", color_scale (x_data[i]))
              .attr ("stroke", "black")
              .attr ("stroke-width", "0.25")
              .style ("shape-rendering", "geometricPrecision")

          legend.insert ("text")
              .attr ("x", 22)
              .attr ("y", 20 * i + 12)
              .text (x_data[i])
        }

      legend.attr ("opacity", 0)
              .transition (500)
                .attr ("opacity", 1)

      // Remove old donut
      svg.selectAll (".donut")
            .remove ();

      // Add new donut
      var donut = svg.insert ("g")
                      .attr ("class", "donut")
                      .attr ("transform",
                             "translate(" + cx + "," + cy + ")");

      donut.selectAll(".slice_inner")
            .data (slices)
              .enter()
                .insert("path")
                  .attr ("class", "slice_inner")
                  .style ("shape-rendering", "geometricPrecision")
//                  .attr ("stroke", "black")
//                  .attr ("stroke-width", "0.25")
                  .attr("d", function (d, i)
                          {
                            return DonutChartGenerator.donut_inner_path_d
                                    (d.startAngle,
                                      d.endAngle,
                                      rx, ry, ri, h)
                          })
                  .attr ("fill", function (d, i) { return d3.lab (color_scale (d[x_field])).darker (); } )

      donut.selectAll(".slice_top")
            .data (slices)
              .enter()
                .insert("path")
                  .attr ("class", "slice_top")
                  .style ("shape-rendering", "geometricPrecision")
//                  .attr ("stroke", "black")
//                  .attr ("stroke-width", "0.25")
                  .attr("d", function (d, i)
                          {
                            return DonutChartGenerator.donut_top_path_d
                                     (d.startAngle,
                                      d.endAngle,
                                      rx, ry, ri, h)
                          })
                  .attr ("fill", function (d, i) { return color_scale (d[x_field]); } )
                  .attr ("title", function (d, i) { return d.data [x_field] + ": " + (100 * (d.endAngle - d.startAngle) / (2 * Math.PI)).toFixed (1) + "% (" + d.data [y_field] + ")" })

      donut.selectAll(".slice_outer")
            .data (slices)
              .enter()
                .insert("path")
                  .attr ("class", "slice_outer")
                  .style ("shape-rendering", "geometricPrecision")
//                  .attr ("stroke", "black")
//                 .attr ("stroke-width", "0.25")
                  .attr("d", function (d, i)
                          {
                            return DonutChartGenerator.donut_outer_path_d
                                     (d.startAngle,
                                      d.endAngle,
                                      rx, ry, ri, h)
                          })
                  .attr ("fill", function (d, i) { return d3.lab (color_scale (d[x_field])).darker (); } )

      donut.selectAll(".slice_label")
            .data (slices)
              .enter()
                .insert ("text")
                  .text (function (d, i)
                          {
                            if (d.endAngle - d.startAngle >= 0.02)
                              return (d.data[y_field])
                            else
                              return ""
                          })
                  .attr ("x", function (d, i) { return  Math.sin ((d.startAngle + d.endAngle) / 2) * rx * ((1 + ri) / 2)})
                  .attr ("y", function (d, i) { return -Math.cos ((d.startAngle + d.endAngle) / 2) * ry * ((1 + ri) / 2)})
                  .attr ("text-anchor", "middle")
                  .style ("font-weight", "bold")
                  .style ("font-size", "7pt");

      donut.attr("opacity", "0")
            .transition (500)
              .attr ("opacity", "1");

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
                    svg_data = svg_from_elem (display.svg ());
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


/*
 * Gets the path data for the inner side of a donut
 */
DonutChartGenerator.donut_inner_path_d = function (sa, ea, rx, ry, ri, h)
{
  if (   (sa > 0.5 * Math.PI) && (ea > 0.5 * Math.PI)
      && (sa < 1.5 * Math.PI) && (ea < 1.5 * Math.PI))
    return "M 0 0";

  var result = [];

  if (sa <= (0.5 * Math.PI))
    {
      var sa_trunc = sa;
      var ea_trunc = (ea < 0.5 * Math.PI ? ea : 0.5 * Math.PI);

      var sx = +Math.sin (sa_trunc) * rx * ri,
          sy = -Math.cos (sa_trunc) * ry * ri,
          ex = +Math.sin (ea_trunc) * rx * ri,
          ey = -Math.cos (ea_trunc) * ry * ri;

      result.push ("M", sx, sy,
                   "A", rx * ri, ry * ri, "0 0 1", ex, ey,
                   "l 0", h,
                   "A", rx * ri, ry * ri, "0 0 0", sx, sy + h,
                   "z");
    }

  if (ea >= (1.5 * Math.PI))
    {
      var sa_trunc = (sa > (1.5 * Math.PI) ? sa : 1.5 * Math.PI);
      var ea_trunc = ea;

      var sx = +Math.sin (sa_trunc) * rx * ri,
          sy = -Math.cos (sa_trunc) * ry * ri,
          ex = +Math.sin (ea_trunc) * rx * ri,
          ey = -Math.cos (ea_trunc) * ry * ri;

      result.push ("M", sx, sy,
                   "A", rx * ri, ry * ri, "1 0 1", ex, ey,
                   "l 0", h,
                   "A", rx * ri, ry * ri, "1 0 0", sx, sy + h,
                   "z");
    }

  return result.join(" ");
}

/*
 * Gets the path data for top of a donut
 */
DonutChartGenerator.donut_top_path_d = function (sa, ea, rx, ry, ri, h)
{
  var result = []

  var sx =  Math.sin (sa) * rx,
      sy = -Math.cos (sa) * ry,
      ex =  Math.sin (ea) * rx,
      ey = -Math.cos (ea) * ry;

  result.push ("M", sx, sy,
               "A", rx, ry, "0", (ea - sa > Math.PI ? 1 : 0), "1", ex, ey,
               "L", ri * ex, ri * ey,
               "A", rx * ri, ry * ri, "0", (ea - sa > Math.PI ? 1 : 0), "0", (sx * ri), (sy * ri),
               "z");

  return result.join(" ");
}

/*
 * Gets the path data for the outer side of a donut
 */
DonutChartGenerator.donut_outer_path_d = function (sa, ea, rx, ry, ri, h)
{
  if (   (sa < (0.5 * Math.PI) && (ea < (0.5 * Math.PI)))
      || (sa > (1.5 * Math.Pi) && (ea > (1.5 * Math.Pi))))
    return "M 0 0";

  var result = []

  var sa_trunc = (sa > (1.5 * Math.PI) ? (1.5 * Math.PI) : (sa < (0.5 * Math.PI) ? (0.5 * Math.PI) : sa));
  var ea_trunc = (ea > (1.5 * Math.PI) ? (1.5 * Math.PI) : (ea < (0.5 * Math.PI) ? (0.5 * Math.PI) : ea));

  var sx = +Math.sin (sa_trunc) * rx,
      sy = -Math.cos (sa_trunc) * ry,
      ex = +Math.sin (ea_trunc) * rx,
      ey = -Math.cos (ea_trunc) * ry;

  result.push ("M", sx, sy,
               "A", rx, ry, "0", (ea_trunc - sa_trunc > Math.PI ? 1 : 0), "1", ex, ey,
               "l", "0", h,
               "A", rx, ry, "0", (ea_trunc - sa_trunc > Math.PI ? 1 : 0), "0", sx, sy + h,
               "z");

  return result.join(" ");
}

/*
 * Gets the counts of severity levels from records containing the counts
 * the counts for each numeric CVSS score.
 */
function data_severity_level_counts (raw_data, x_field, y_field)
{
  var bins = ["N/A", "None", "Low", "Medium", "High"]

  var data = bins.map (function (d)
                        {
                          record = {};
                          record [x_field] = d;
                          record [y_field] = 0;
                          return record;
                        });

  for (var i in raw_data)
    {
      var val = raw_data [i][x_field];
      var count = raw_data [i][y_field];

      if (val !== "" && Number (val) <= 0.0)
        data[1][y_field] += count;
      else if (Number (val) >= severity_levels.min_high)
        data[4][y_field] += count;
      else if (Number (val) >= severity_levels.min_medium)
        data[3][y_field] += count;
      else if (Number (val) >= severity_levels.min_low)
        data[2][y_field] += count;
      else
        data[0][y_field] += count;
    };

  return data;
}

/*
 * Color scale for SecInfo severity levels
 */
severity_level_color_scale = d3.scale.ordinal ()
                                      .range (["silver", "#DDDDDD", "skyblue", "orange", "#D80000"])
                                      .domain (["N/A", "None", "Low", "Medium", "High"]);