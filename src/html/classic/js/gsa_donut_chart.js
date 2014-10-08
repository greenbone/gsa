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

/* Main chart generator */
function DonutChartGenerator ()
{
  function my () {};

  var svg;
  var height;
  var width;
  var margin = {top: 20, right: 20, bottom: 20, left: 20};
  var legend_width = 120;
  var label_spacing = 10;

  var data_transform = data_raw;
  var color_scale = d3.scale.category20 ();
  var title = title_static ("Loading donut chart ...", "Donut Chart");

  var records;
  var column_info;
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
            column_info = data_src.column_info ();
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

      var slices = slice_f (data).filter (function (elem) { return !isNaN (elem.endAngle)} );

      legend_width = Math.min (240, Math.max (120, display.svg ().attr ("width") / 5))

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

      var legend_y = 0;
      for (var i = 0; i < x_data.length; i++)
        {
          legend.insert ("rect")
              .attr ("height", "15")
              .attr ("width", "15")
              .attr ("x", 0.5)
              .attr ("y", legend_y + 0.5)
              .attr ("fill", color_scale (x_data[i]))
              .attr ("stroke", "black")
              .attr ("stroke-width", "0.25")
              .style ("shape-rendering", "geometricPrecision")

          var new_text = legend.insert ("text")
                                .attr ("x", 22)
                                .attr ("y", legend_y + 12)
                                .style ("font-size", "12px")
                                .style ("font-weight", "bold")
                                .text (x_data[i])
          wrap_text (new_text, legend_width - 25);

          legend_y += Math.max (20, new_text.node ().getBBox ().height + 5);
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
                  .attr ("fill", function (d, i) { return d3.lab (color_scale (d.data [x_field])).darker (); } )

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
                            if (d.value != 0 && d.startAngle == d.endAngle)
                              return DonutChartGenerator.donut_full_top_path_d
                                      (d.startAngle,
                                       d.endAngle,
                                       rx, ry, ri, h)
                            else
                              return DonutChartGenerator.donut_top_path_d
                                      (d.startAngle,
                                       d.endAngle,
                                       rx, ry, ri, h)
                          })
                  .attr ("fill", function (d, i) { return color_scale (d.data [x_field]); } )
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
                  .attr ("fill", function (d, i) { return d3.lab (color_scale (d.data [x_field])).darker (); } )

      donut.selectAll(".slice_label")
            .data (slices)
              .enter()
                .insert ("text")
                  .attr ("class", "slice_label")
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

      // In case of missing data, draw a transparent grey donut
      if (slices.length == 0)
        {
          donut.insert("path")
                  .attr ("class", "slice_inner")
                  .attr ("title", "No data")
                  .style ("shape-rendering", "geometricPrecision")
                  .attr ("d", DonutChartGenerator.donut_inner_path_d (0, 2 * Math.PI, rx, ry, ri, h))
                  .style ("fill", d3.lab("silver").darker ())
          donut.insert("path")
                  .attr ("class", "slice_top")
                  .attr ("title", "No data")
                  .style ("shape-rendering", "geometricPrecision")
                  .attr ("d", DonutChartGenerator.donut_full_top_path_d (0, 2 * Math.PI, rx, ry, ri, h))
                  .style ("fill", "silver");
          donut.insert("path")
                  .attr ("class", "slice_outer")
                  .attr ("title", "No data")
                  .style ("shape-rendering", "geometricPrecision")
                  .attr ("d", DonutChartGenerator.donut_outer_path_d (0, 2 * Math.PI, rx, ry, ri, h))
                  .style ("fill", d3.lab("silver").darker ());
        }

      donut.attr("opacity", 0)
            .transition (500)
              .attr ("opacity", (slices.length != 0) ? 1 : 0.25);

      relax_labels ();

      // Create detach menu item
      display.create_or_get_menu_item ("detach")
               .attr("href", "javascript:void(0);")
               .attr("onclick", "javascript:open_detached (\"" + chart.detached_url () + "\")")
               .text("Show detached chart window");

      // Generate CSV
      csv_data = csv_from_records (data,
                                   [x_field, y_field],
                                   [column_label (column_info.columns [x_field], true, false, true),
                                    column_label (column_info.columns [y_field], true, false, true)],
                                   display.header(). text ());
      if (csv_url != null)
        URL.revokeObjectURL (csv_url);
      csv_blob = new Blob([csv_data], { type: "text/csv" });
      csv_url = URL.createObjectURL(csv_blob);

      display.create_or_get_menu_item ("csv_dl")
               .attr("href", csv_url)
               .attr("download", "gsa_donut_chart-" + new Date().getTime() + ".csv")
               .text("Download CSV");

      // Generate HTML table
      html_table_data
        = html_table_from_records (data,
                                   [x_field, y_field],
                                   [column_label (column_info.columns [x_field], true, false, true),
                                    column_label (column_info.columns [y_field], true, false, true)],
                                   display.header(). text (),
                                   data_src.param ("filter"));
      if (html_table_url != null)
        URL.revokeObjectURL (html_table_url);
      html_table_blob = new Blob([html_table_data], { type: "text/html" });
      html_table_url = URL.createObjectURL(html_table_blob);

      display.create_or_get_menu_item ("html_table")
                  .attr("href", html_table_url)
                  .attr("target", "_blank")
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

                    display.create_or_get_menu_item ("svg_dl")
                               .attr("href", svg_url)
                               .attr("download", "gsa_donut_chart-" + new Date().getTime() + ".svg")
                               .text("Download SVG");
                  }, 600);

      display.update_gen_data (my, gen_params);
    };

  var relax_labels = function (labels)
    {
      var elem_a, elem_b;
      var sel_a, sel_b;
      var x_a, x_b;
      var y_a, y_b;
      var width_a, width_b;
      var word;
      var again = false;
      var labels = svg.selectAll (".slice_label")

      labels.each (function (d, i)
        {
          elem_a = this;

          width_a = elem_a.getComputedTextLength ()
          if (width_a == 0)
            return;

          sel_a = d3.select (elem_a);
          x_a = sel_a.attr ("x");
          y_a = sel_a.attr ("y");


          labels.each (function (d, j)
            {
              elem_b = this;
              if (elem_a == elem_b)
                return;

              width_b = elem_b.getComputedTextLength ()
              if (width_b == 0)
                return;

              sel_b = d3.select(elem_b);
              x_b = sel_b.attr("x");
              y_b = sel_b.attr("y");

              if (Math.abs (x_a - x_b) * 2 > (width_a + width_b))
                return;

              delta_y = y_a - y_b;

              if (Math.abs(delta_y) > label_spacing)
                return;

              again = true;
              var adjust = (delta_y > 0 ? 1 : -1) * 1;
              sel_a.attr ("y", +y_a + adjust);
              sel_b.attr ("y", +y_b - adjust);
            });
        });

      if (again)
        {
          setTimeout (relax_labels, 1)
        }
    }

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
 * Gets the path data for the top of a whole donut.
 *
 * This is needed because start and end points being the same could be
 *  interpreted as an empty / nonexistent slice by some renderers.
 */
DonutChartGenerator.donut_full_top_path_d = function (sa, ea, rx, ry, ri, h)
{
  var result = []

  result.push ("M", 0, -ry,
               "A", rx, ry, "0", "1", "1", 0, +ry,
               "A", rx, ry, "0", "1", "1", 0, -ry,
               "M", 0, -ry * ri,
               "A", rx * ri, ry * ri, "0", "0", "0", 0, +ry * ri,
               "A", rx * ri, ry * ri, "0", "0", "0", 0, -ry * ri);

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