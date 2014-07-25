<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
      version="1.0"
      xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
      xmlns:gsa="http://openvas.org"
      xmlns:exslt="http://exslt.org/common"
      xmlns:str="http://exslt.org/strings"
      extension-element-prefixes="gsa exslt str">
     <xsl:output
      method="html"
      doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"
      doctype-public="-//W3C//DTD XHTML 1.0 Transitional//EN"
      encoding="UTF-8"/>

<!--
Greenbone Security Assistant
$Id$
Description: Graphics for GSA.

Authors:
Jan-Oliver Wagner <jan-oliver.wagner@greenbone.net>
Timo Pollmeier <timo.pollmeier@greenbone.net>

Copyright:
Copyright (C) 2013-2014 Greenbone Networks GmbH

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License version 2,
or, at your option, any later version as published by the Free
Software Foundation

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
-->

<xsl:template name="init-d3charts">
  <script src="/js/d3.v3.min.js"></script>
  <script src="/js/d3.tip.min.js"></script>
  <script src="/js/gsa_graphics_base.js"></script>
  <script src="/js/gsa_bar_chart.js"></script>
  <script src="/js/gsa_donut_chart.js"></script>
  <script type="text/javascript">
    var gsa_token = "<xsl:value-of select="/envelope/token"/>";
    var data_sources = {};
    var generators = {};
    var displays = {};
    var charts = {};
    var chart_selections = [];

    var severity_levels =
      {max_high : 10.0,
       min_high : <xsl:value-of select="gsa:risk-factor-max-cvss ('medium') + 0.1"/>,
       max_medium : <xsl:value-of select="gsa:risk-factor-max-cvss ('medium')"/>,
       min_medium : <xsl:value-of select="gsa:risk-factor-max-cvss ('low') + 0.1"/>,
       max_low : <xsl:value-of select="gsa:risk-factor-max-cvss ('low') + 0.1"/>,
       min_low : 0.1};
  </script>
</xsl:template>

<xsl:template name="js-create-chart-box">
  <xsl:param name="parent_id" select="'top-visualization'"/>
  <xsl:param name="container_id" select="'chart-box'"/>
  <xsl:param name="width" select="435"/>
  <xsl:param name="height" select="250"/>
  <xsl:param name="select_pref_name"/>
  <xsl:param name="filter_pref_name"/>
  create_chart_box ("<xsl:value-of select="$parent_id"/>",
                    "<xsl:value-of select="$container_id"/>",
                    <xsl:value-of select="$width"/>,
                    <xsl:value-of select="$height"/>,
                    "<xsl:value-of select="$select_pref_name"/>",
                    "<xsl:value-of select="$filter_pref_name"/>")
</xsl:template>

<xsl:template name="js-aggregate-data-source">
  <xsl:param name="data_source_name" select="'aggregate-source'"/>

  <xsl:param name="aggregate_type"/>
  <xsl:param name="group_column"/>
  <xsl:param name="data_column"/>
  <xsl:param name="filter"/>

  <xsl:param name="chart_template" select="/envelope/params/chart_template"/>

  if (data_sources ["<xsl:value-of select="$data_source_name"/>"] == undefined)
    {
      data_sources ["<xsl:value-of select="$data_source_name"/>"]
        =
        <xsl:choose>
          <xsl:when test="$chart_template = 'info_by_cvss' or $chart_template = 'info_by_class'">
            DataSource ("get_aggregate",
                        {xml:1,
                         aggregate_type:"<xsl:value-of select="$aggregate_type"/>",
                         group_column:"severity",
                         filter:"<xsl:value-of select="gsa:escape-js ($filter)"/>"});
          </xsl:when>
          <xsl:otherwise>
            DataSource ("get_aggregate",
                        {xml:1,
                         aggregate_type:"<xsl:value-of select="$aggregate_type"/>",
                         group_column:"<xsl:value-of select="$group_column"/>",
                         filter:"<xsl:value-of select="gsa:escape-js ($filter)"/>"});
          </xsl:otherwise>
        </xsl:choose>
    }
</xsl:template>

<xsl:template name="js-aggregate-chart">
  <xsl:param name="chart_name" select="'aggregate-chart'"/>
  <xsl:param name="data_source_name" select="concat($chart_name, '-source')"/>
  <xsl:param name="generator_name" select="concat($chart_name, '-generator')"/>
  <xsl:param name="display_name" select="'chart-box'"/>

  <xsl:param name="aggregate_type"/>
  <xsl:param name="group_column"/>
  <xsl:param name="data_column"/>
  <xsl:param name="filter"/>

  <xsl:param name="chart_type"/>
  <xsl:param name="chart_template"/>
  <xsl:param name="auto_load" select="0"/>
  <xsl:param name="create_data_source" select="0"/>

  if (displays ["<xsl:value-of select="$display_name"/>"] == undefined)
    {
      console.error ("Display not found: <xsl:value-of select="$display_name"/>");
    }

  <!-- Optionally create data source -->
  <xsl:choose>
    <xsl:when test="$create_data_source">
      <xsl:call-template name="js-aggregate-data-source">
        <xsl:with-param name="data_source_name" select="$data_source_name"/>
        <xsl:with-param name="aggregate_type" select="$aggregate_type"/>
        <xsl:with-param name="group_column" select="$group_column"/>
        <xsl:with-param name="data_column" select="$data_column"/>
        <xsl:with-param name="filter" select="$filter"/>
        <xsl:with-param name="chart_template" select="$chart_template"/>
      </xsl:call-template>
    </xsl:when>
    <xsl:otherwise>
      if (data_sources ["<xsl:value-of select="$data_source_name"/>"] == undefined)
        {
          console.error ("Data source not found: <xsl:value-of select="$data_source_name"/>");
        }
    </xsl:otherwise>
  </xsl:choose>

  <!-- Select selector label -->
  <xsl:variable name="selector_label">
    <xsl:choose>
      <xsl:when test="$chart_template = 'info_by_class' or $chart_template = 'recent_info_by_class'">
        <xsl:value-of select="concat (gsa:type-name-plural ($aggregate_type), ' by Severity Class')"/>
      </xsl:when>
      <xsl:when test="$chart_template = 'info_by_cvss' or $chart_template = 'recent_info_by_cvss'">
        <xsl:value-of select="concat (gsa:type-name-plural ($aggregate_type), ' by CVSS')"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="concat (gsa:type-name-plural ($aggregate_type), ' by ', $group_column)"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <!-- Select title generator -->
  <xsl:variable name="title_generator">
    <xsl:choose>
      <xsl:when test="$chart_template = 'info_by_class' or $chart_template = 'info_by_cvss'">
        title_total ("<xsl:value-of select="concat(gsa:type-name-plural ($aggregate_type), ' by severity (Loading...)')"/>",
                     "<xsl:value-of select="concat(gsa:type-name-plural ($aggregate_type), ' by severity (Total: ')"/>",
                     ")",
                     "count")
      </xsl:when>
      <xsl:otherwise>
        title_total ("<xsl:value-of select="concat(gsa:type-name-plural ($aggregate_type), ' by ', $group_column, ' (Loading...)')"/>",
                     "<xsl:value-of select="concat(gsa:type-name-plural ($aggregate_type), ' by ', $group_column, ' (Total: ')"/>",
                     ")",
                     "count")
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <!-- Create chart generator -->
  <xsl:choose>
    <xsl:when test="$chart_type = 'donut'">
      generators ["<xsl:value-of select="$generator_name"/>"]
        = DonutChartGenerator (data_sources ["<xsl:value-of select="$data_source_name"/>"])
            .title (<xsl:value-of select="$title_generator"/>)
    </xsl:when>
    <xsl:otherwise>
      generators ["<xsl:value-of select="$generator_name"/>"]
        = BarChartGenerator (data_sources ["<xsl:value-of select="$data_source_name"/>"])
            .title (<xsl:value-of select="$title_generator"/>)
    </xsl:otherwise>
  </xsl:choose>

  <!-- Create basic chart -->
  charts ["<xsl:value-of select="$chart_name"/>"] =
    Chart (data_sources ["<xsl:value-of select="$data_source_name"/>"],
            generators ["<xsl:value-of select="$generator_name"/>"],
            displays ["<xsl:value-of select="$display_name"/>"],
            "<xsl:value-of select="$chart_name"/>",
            "<xsl:value-of select="$selector_label"/>",
            "/img/charts/severity-bar-chart.png",
            1,
            "<xsl:value-of select="$chart_type"/>",
            "<xsl:value-of select="$chart_template"/>");

  <!-- Data modifiers and stylers -->
  <xsl:choose>
    <xsl:when test="$chart_template = 'info_by_class' or $chart_template = 'recent_info_by_class'">
      generators ["<xsl:value-of select="$generator_name"/>"]
        .data_transform (data_severity_level_counts)
      <xsl:choose>
        <xsl:when test="$chart_type = 'donut'">
          .color_scale (severity_level_color_scale)
        </xsl:when>
        <xsl:otherwise>

        </xsl:otherwise>
      </xsl:choose>
    </xsl:when>
    <xsl:when test="$chart_template = 'info_by_cvss' or $chart_template = 'recent_info_by_cvss'">
      generators ["<xsl:value-of select="$generator_name"/>"]
        .data_transform (data_severity_histogram)
      <xsl:choose>
        <xsl:when test="$chart_type = 'donut'">

        </xsl:when>
        <xsl:otherwise>
          .bar_style (severity_bar_style ("value",
                                          severity_levels.max_low,
                                          severity_levels.max_medium))
        </xsl:otherwise>
      </xsl:choose>
    </xsl:when>
    <xsl:otherwise/>
  </xsl:choose>

  <xsl:if test="$auto_load">
    charts ["<xsl:value-of select="$chart_name"/>"].request_data ();
  </xsl:if>

</xsl:template>

<xsl:template name="js-secinfo-top-visualization">
  <xsl:param name="type" select="'nvt'"/>
  <xsl:param name="auto_load_left_pref_name" select="concat ($type, '-select-left')"/>
  <xsl:param name="auto_load_right_pref_name" select="concat ($type, '-select-right')"/>
  <xsl:param name="auto_load_left_default" select="'left-by-cvss'"/>
  <xsl:param name="auto_load_right_default" select="'right-by-class'"/>

  <xsl:variable name="auto_load_left">
    <xsl:choose>
      <xsl:when test="/envelope/chart_preferences/chart_preference[name = $auto_load_left_pref_name]">
        <xsl:value-of select="/envelope/chart_preferences/chart_preference[name = $auto_load_left_pref_name]/value"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$auto_load_left_default"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <xsl:variable name="auto_load_right">
    <xsl:choose>
      <xsl:when test="/envelope/chart_preferences/chart_preference[name = $auto_load_right_pref_name]">
        <xsl:value-of select="/envelope/chart_preferences/chart_preference[name = $auto_load_right_pref_name]/value"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$auto_load_right_default"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <xsl:variable name="filter" select="/envelope/get_info/get_info_response/filters/term"/>

  <script type="text/javascript">
    <xsl:call-template name="js-create-chart-box">
      <xsl:with-param name="container_id" select="'top-visualization-left'"/>
      <xsl:with-param name="select_pref_name" select="concat ($type, '-select-left')"/>
    </xsl:call-template>
    <xsl:call-template name="js-create-chart-box">
      <xsl:with-param name="container_id" select="'top-visualization-right'"/>
      <xsl:with-param name="select_pref_name" select="concat ($type, '-select-right')"/>
    </xsl:call-template>

    <xsl:call-template name="js-aggregate-data-source">
      <xsl:with-param name="data_source_name" select="'severity-count-source'"/>
      <xsl:with-param name="aggregate_type" select="$type"/>
      <xsl:with-param name="group_column" select="'severity'"/>
      <xsl:with-param name="data_column" select="''"/>
      <xsl:with-param name="filter" select="$filter"/>
      <xsl:with-param name="chart_template" select="'info_by_cvss'"/>
    </xsl:call-template>

    <xsl:call-template name="js-aggregate-chart">
      <xsl:with-param name="chart_name" select="'left-by-cvss'"/>
      <xsl:with-param name="data_source_name" select="'severity-count-source'"/>
      <xsl:with-param name="aggregate_type" select="$type"/>
      <xsl:with-param name="display_name" select="'top-visualization-left'"/>
      <xsl:with-param name="chart_type" select="'bar'"/>
      <xsl:with-param name="chart_template" select="'info_by_cvss'"/>
    </xsl:call-template>
    <xsl:call-template name="js-aggregate-chart">
      <xsl:with-param name="chart_name" select="'right-by-cvss'"/>
      <xsl:with-param name="data_source_name" select="'severity-count-source'"/>
      <xsl:with-param name="aggregate_type" select="$type"/>
      <xsl:with-param name="display_name" select="'top-visualization-right'"/>
      <xsl:with-param name="chart_type" select="'bar'"/>
      <xsl:with-param name="chart_template" select="'info_by_cvss'"/>
    </xsl:call-template>

    <xsl:call-template name="js-aggregate-chart">
      <xsl:with-param name="chart_name" select="'left-by-class'"/>
      <xsl:with-param name="data_source_name" select="'severity-count-source'"/>
      <xsl:with-param name="aggregate_type" select="$type"/>
      <xsl:with-param name="display_name" select="'top-visualization-left'"/>
      <xsl:with-param name="chart_type" select="'donut'"/>
      <xsl:with-param name="chart_template" select="'info_by_class'"/>
    </xsl:call-template>
    <xsl:call-template name="js-aggregate-chart">
      <xsl:with-param name="chart_name" select="'right-by-class'"/>
      <xsl:with-param name="data_source_name" select="'severity-count-source'"/>
      <xsl:with-param name="aggregate_type" select="$type"/>
      <xsl:with-param name="display_name" select="'top-visualization-right'"/>
      <xsl:with-param name="chart_type" select="'donut'"/>
      <xsl:with-param name="chart_template" select="'info_by_class'"/>
    </xsl:call-template>

    <xsl:if test="$type = 'ovaldef'">
      <xsl:call-template name="js-aggregate-data-source">
        <xsl:with-param name="data_source_name" select="'ovaldef-by-class-source'"/>
        <xsl:with-param name="aggregate_type" select="$type"/>
        <xsl:with-param name="group_column" select="'class'"/>
        <xsl:with-param name="data_column" select="''"/>
        <xsl:with-param name="filter" select="$filter"/>
        <xsl:with-param name="chart_template" select="''"/>
      </xsl:call-template>

      <xsl:call-template name="js-aggregate-chart">
        <xsl:with-param name="chart_name" select="'left-by-oval-class'"/>
        <xsl:with-param name="data_source_name" select="'ovaldef-by-class-source'"/>
        <xsl:with-param name="aggregate_type" select="$type"/>
        <xsl:with-param name="group_column" select="'class'"/>
        <xsl:with-param name="data_column" select="''"/>
        <xsl:with-param name="display_name" select="'top-visualization-left'"/>
        <xsl:with-param name="chart_type" select="'donut'"/>
        <xsl:with-param name="chart_template" select="''"/>
      </xsl:call-template>
      <xsl:call-template name="js-aggregate-chart">
        <xsl:with-param name="chart_name" select="'right-by-oval-class'"/>
        <xsl:with-param name="data_source_name" select="'ovaldef-by-class-source'"/>
        <xsl:with-param name="aggregate_type" select="$type"/>
        <xsl:with-param name="group_column" select="'class'"/>
        <xsl:with-param name="data_column" select="''"/>
        <xsl:with-param name="display_name" select="'top-visualization-right'"/>
        <xsl:with-param name="chart_type" select="'donut'"/>
        <xsl:with-param name="chart_template" select="''"/>
      </xsl:call-template>
    </xsl:if>

    displays ["top-visualization-left"].create_chart_selector ();
    displays ["top-visualization-right"].create_chart_selector ();

    <xsl:if test="$auto_load_left != ''">
    displays ["top-visualization-left"].select_chart ("<xsl:value-of select="$auto_load_left"/>", false, true);
    </xsl:if>
    <xsl:if test="$auto_load_right != ''">
    displays ["top-visualization-right"].select_chart ("<xsl:value-of select="$auto_load_right"/>", false, true);
    </xsl:if>
  </script>
</xsl:template>

<xsl:template match="dashboard">
  <noscript>
    <div class="gb_window">
      <div class="gb_window_part_left_error"></div>
      <div class="gb_window_part_right_error"></div>
      <div class="gb_window_part_center_error">
        <xsl:value-of select="'JavaScript required'"/>
      </div>
      <div class="gb_window_part_content">
        <xsl:value-of select="'The Dashboard requires JavaScript. Please make sure JavaScript is supported by your browser and enabled.'"/>
      </div>
    </div>
  </noscript>
  <xsl:choose>
    <xsl:when test="name='' or name='secinfo'">
      <xsl:apply-templates select="." mode="secinfo"/>
    </xsl:when>
    <xsl:otherwise>
      <div class="gb_window">
        <div class="gb_window_part_left_error"></div>
        <div class="gb_window_part_right_error"></div>
        <div class="gb_window_part_center_error">
          <xsl:value-of select="'Dashboard not found'"/>
        </div>
        <div class="gb_window_part_content">
          <xsl:value-of select="concat('No dashboard named &quot;', name,'&quot; was found')"/>
        </div>
      </div>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template match="dashboard" mode="secinfo">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">
      <xsl:value-of select="'SecInfo Dashboard'"/>
    </div>
    <div class="gb_window_part_content">
      <center id="dashboard">
        <xsl:call-template name="init-d3charts"/>
        <div id="nvt_severity_chart"></div>

        <xsl:variable name="envelope" select="/envelope"/>
        <xsl:variable name="chart_defaults">
          <chart auto_load="secinfo_1_nvt_bar_chart">secinfo_1</chart>
          <chart auto_load="secinfo_2_nvt_donut_chart">secinfo_2</chart>
          <chart auto_load="secinfo_3_cve_bar_chart">secinfo_3</chart>
          <chart auto_load="secinfo_4_cve_donut_chart">secinfo_4</chart>
        </xsl:variable>

        <xsl:variable name="filters" select="get_filters_response/filter[type='SecInfo']"/>

        <script>
          <xsl:for-each select="exslt:node-set ($chart_defaults)/chart">
            <xsl:variable name="display_name" select="concat (text(), '_display')"/>
            <xsl:variable name="auto_load_pref_name" select="concat (text (), '-select')"/>
            <xsl:variable name="auto_load">
              <xsl:choose>
                <xsl:when test="$envelope/chart_preferences/chart_preference[name = $auto_load_pref_name]">
                  <xsl:value-of select="$envelope/chart_preferences/chart_preference[name = $auto_load_pref_name]/value"/>
                </xsl:when>
                <xsl:otherwise>
                  <xsl:value-of select="@auto_load"/>
                </xsl:otherwise>
              </xsl:choose>
            </xsl:variable>
            <xsl:variable name="auto_filter_pref_name" select="concat (text (), '-filter')"/>
            <xsl:variable name="auto_filter">
              <xsl:choose>
                <xsl:when test="$envelope/chart_preferences/chart_preference[name = $auto_filter_pref_name]">
                  <xsl:value-of select="$envelope/chart_preferences/chart_preference[name = $auto_filter_pref_name]/value"/>
                </xsl:when>
                <xsl:otherwise>
                  <xsl:value-of select="''"/>
                </xsl:otherwise>
              </xsl:choose>
            </xsl:variable>

            <xsl:call-template name="js-create-chart-box">
              <xsl:with-param name="container_id" select="$display_name"/>
              <xsl:with-param name="parent_id" select="'dashboard'"/>
              <xsl:with-param name="select_pref_name" select="$auto_load_pref_name"/>
              <xsl:with-param name="filter_pref_name" select="$auto_filter_pref_name"/>
            </xsl:call-template>

            <xsl:call-template name="js-aggregate-chart">
              <xsl:with-param name="chart_name" select="concat(text(), '_nvt_bar_chart')"/>
              <xsl:with-param name="data_source_name" select="concat(text(), '_nvt_severity_src')"/>
              <xsl:with-param name="aggregate_type" select="'nvt'"/>
              <xsl:with-param name="display_name" select="$display_name"/>
              <xsl:with-param name="chart_type" select="'bar'"/>
              <xsl:with-param name="chart_template" select="'info_by_cvss'"/>
              <xsl:with-param name="auto_load" select="''"/>
              <xsl:with-param name="create_data_source" select="1"/>
            </xsl:call-template>
            <xsl:call-template name="js-aggregate-chart">
              <xsl:with-param name="chart_name" select="concat(text(), '_nvt_donut_chart')"/>
              <xsl:with-param name="data_source_name" select="concat(text(), '_nvt_severity_src')"/>
              <xsl:with-param name="aggregate_type" select="'nvt'"/>
              <xsl:with-param name="display_name" select="$display_name"/>
              <xsl:with-param name="chart_type" select="'donut'"/>
              <xsl:with-param name="chart_template" select="'info_by_class'"/>
              <xsl:with-param name="auto_load" select="0"/>
              <xsl:with-param name="create_data_source" select="0"/>
            </xsl:call-template>

            <xsl:call-template name="js-aggregate-chart">
              <xsl:with-param name="chart_name" select="concat(text(), '_cve_bar_chart')"/>
              <xsl:with-param name="data_source_name" select="concat(text(), '_cve_severity_src')"/>
              <xsl:with-param name="aggregate_type" select="'cve'"/>
              <xsl:with-param name="display_name" select="$display_name"/>
              <xsl:with-param name="chart_type" select="'bar'"/>
              <xsl:with-param name="chart_template" select="'info_by_cvss'"/>
              <xsl:with-param name="auto_load" select="''"/>
              <xsl:with-param name="create_data_source" select="1"/>
            </xsl:call-template>
            <xsl:call-template name="js-aggregate-chart">
              <xsl:with-param name="chart_name" select="concat(text(), '_cve_donut_chart')"/>
              <xsl:with-param name="data_source_name" select="concat(text(), '_cve_severity_src')"/>
              <xsl:with-param name="aggregate_type" select="'cve'"/>
              <xsl:with-param name="display_name" select="$display_name"/>
              <xsl:with-param name="chart_type" select="'donut'"/>
              <xsl:with-param name="chart_template" select="'info_by_class'"/>
              <xsl:with-param name="auto_load" select="0"/>
              <xsl:with-param name="create_data_source" select="0"/>
            </xsl:call-template>

            <xsl:call-template name="js-aggregate-chart">
              <xsl:with-param name="chart_name" select="concat(text(), '_cpe_bar_chart')"/>
              <xsl:with-param name="data_source_name" select="concat(text(), '_cpe_severity_src')"/>
              <xsl:with-param name="aggregate_type" select="'cpe'"/>
              <xsl:with-param name="display_name" select="$display_name"/>
              <xsl:with-param name="chart_type" select="'bar'"/>
              <xsl:with-param name="chart_template" select="'info_by_cvss'"/>
              <xsl:with-param name="auto_load" select="''"/>
              <xsl:with-param name="create_data_source" select="1"/>
            </xsl:call-template>
            <xsl:call-template name="js-aggregate-chart">
              <xsl:with-param name="chart_name" select="concat(text(), '_cpe_donut_chart')"/>
              <xsl:with-param name="data_source_name" select="concat(text(), '_cpe_severity_src')"/>
              <xsl:with-param name="aggregate_type" select="'cpe'"/>
              <xsl:with-param name="display_name" select="$display_name"/>
              <xsl:with-param name="chart_type" select="'donut'"/>
              <xsl:with-param name="chart_template" select="'info_by_class'"/>
              <xsl:with-param name="auto_load" select="0"/>
              <xsl:with-param name="create_data_source" select="0"/>
            </xsl:call-template>

            <xsl:call-template name="js-aggregate-chart">
              <xsl:with-param name="chart_name" select="concat(text(), '_ovaldef_bar_chart')"/>
              <xsl:with-param name="data_source_name" select="concat(text(), '_ovaldef_severity_src')"/>
              <xsl:with-param name="aggregate_type" select="'ovaldef'"/>
              <xsl:with-param name="display_name" select="$display_name"/>
              <xsl:with-param name="chart_type" select="'bar'"/>
              <xsl:with-param name="chart_template" select="'info_by_cvss'"/>
              <xsl:with-param name="create_data_source" select="1"/>
            </xsl:call-template>
            <xsl:call-template name="js-aggregate-chart">
              <xsl:with-param name="chart_name" select="concat(text(), '_ovaldef_donut_chart')"/>
              <xsl:with-param name="data_source_name" select="concat(text(), '_ovaldef_severity_src')"/>
              <xsl:with-param name="aggregate_type" select="'ovaldef'"/>
              <xsl:with-param name="display_name" select="$display_name"/>
              <xsl:with-param name="chart_type" select="'donut'"/>
              <xsl:with-param name="chart_template" select="'info_by_class'"/>
              <xsl:with-param name="create_data_source" select="0"/>
            </xsl:call-template>
            <xsl:call-template name="js-aggregate-chart">
              <xsl:with-param name="chart_name" select="concat(text(), '_ovaldef_class_donut_chart')"/>
              <xsl:with-param name="data_source_name" select="concat(text(), '_ovaldef_class_src')"/>
              <xsl:with-param name="aggregate_type" select="'ovaldef'"/>
              <xsl:with-param name="group_column" select="'class'"/>
              <xsl:with-param name="display_name" select="$display_name"/>
              <xsl:with-param name="chart_type" select="'donut'"/>
              <xsl:with-param name="create_data_source" select="1"/>
            </xsl:call-template>

            <xsl:call-template name="js-aggregate-chart">
              <xsl:with-param name="chart_name" select="concat(text(), '_dfn_cert_adv_bar_chart')"/>
              <xsl:with-param name="data_source_name" select="concat(text(), '_dfn_cert_adv_severity_src')"/>
              <xsl:with-param name="aggregate_type" select="'dfn_cert_adv'"/>
              <xsl:with-param name="display_name" select="$display_name"/>
              <xsl:with-param name="chart_type" select="'bar'"/>
              <xsl:with-param name="chart_template" select="'info_by_cvss'"/>
              <xsl:with-param name="create_data_source" select="1"/>
            </xsl:call-template>
            <xsl:call-template name="js-aggregate-chart">
              <xsl:with-param name="chart_name" select="concat(text(), '_dfn_cert_adv_donut_chart')"/>
              <xsl:with-param name="data_source_name" select="concat(text(), '_dfn_cert_adv_severity_src')"/>
              <xsl:with-param name="aggregate_type" select="'dfn_cert_adv'"/>
              <xsl:with-param name="display_name" select="$display_name"/>
              <xsl:with-param name="chart_type" select="'donut'"/>
              <xsl:with-param name="chart_template" select="'info_by_class'"/>
              <xsl:with-param name="create_data_source" select="0"/>
            </xsl:call-template>

            <xsl:call-template name="js-aggregate-chart">
              <xsl:with-param name="chart_name" select="concat(text(), '_allinfo_chart')"/>
              <xsl:with-param name="data_source_name" select="concat(text(), '_allinfo_severity_src')"/>
              <xsl:with-param name="aggregate_type" select="'allinfo'"/>
              <xsl:with-param name="display_name" select="$display_name"/>
              <xsl:with-param name="chart_type" select="'bar'"/>
              <xsl:with-param name="chart_template" select="'info_by_cvss'"/>
              <xsl:with-param name="create_data_source" select="1"/>
            </xsl:call-template>
            <xsl:call-template name="js-aggregate-chart">
              <xsl:with-param name="chart_name" select="concat(text(), '_allinfo_donut_chart')"/>
              <xsl:with-param name="data_source_name" select="concat(text(), '_allinfo_severity_src')"/>
              <xsl:with-param name="aggregate_type" select="'allinfo'"/>
              <xsl:with-param name="display_name" select="$display_name"/>
              <xsl:with-param name="chart_type" select="'donut'"/>
              <xsl:with-param name="chart_template" select="'info_by_class'"/>
              <xsl:with-param name="create_data_source" select="0"/>
            </xsl:call-template>

            displays ["<xsl:value-of select="$display_name"/>"].create_chart_selector ();
            <xsl:if test="$filters">
              displays ["<xsl:value-of select="$display_name"/>"].create_filter_selector ();

              <xsl:for-each select="$filters">
                displays ["<xsl:value-of select="$display_name"/>"].add_filter ("<xsl:value-of select="@id"/>", "<xsl:value-of select="gsa:escape-js (name)"/>", "<xsl:value-of select="gsa:escape-js (term)"/>");
              </xsl:for-each>
              displays ["<xsl:value-of select="$display_name"/>"].select_filter ("<xsl:value-of select="$auto_filter"/>", false);
            </xsl:if>

            displays ["<xsl:value-of select="$display_name"/>"].select_chart ("<xsl:value-of select="$auto_load"/>", false, true);
          </xsl:for-each>
        </script>
      </center>
    </div>
  </div>
</xsl:template>

</xsl:stylesheet>
