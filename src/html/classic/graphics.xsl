<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
      version="1.0"
      xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
      xmlns:gsa="http://openvas.org"
      xmlns:str="http://exslt.org/strings"
      extension-element-prefixes="gsa str">
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
  <xsl:param name="container_id"/>
  <xsl:param name="width" select="435"/>
  <xsl:param name="height" select="250"/>

  create_chart_box ("<xsl:value-of select="$parent_id"/>",
                    "<xsl:value-of select="$container_id"/>",
                    <xsl:value-of select="$width"/>,
                    <xsl:value-of select="$height"/>)
</xsl:template>

<xsl:template name="js-severity-chart">
  <xsl:param name="type" />
  <xsl:param name="id" select="'severity_chart'"/>
  <xsl:param name="filter" />
  <xsl:param name="title_prefix">
    <xsl:choose>
      <xsl:when test="$filter">
        <xsl:value-of select="concat(gsa:type-name-plural ($type), ' by severity (Total: ')"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="concat('All ', gsa:type-name-plural ($type), ' by severity (Total: ')"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:param>
  <xsl:param name="title_suffix" select="')'"/>
  <xsl:param name="title_loading">
    <xsl:choose>
      <xsl:when test="$filter">
        <xsl:value-of  select="concat(gsa:type-name-plural ($type), ' by severity (loading...)')"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="concat('All ', gsa:type-name-plural ($type),' by severity (loading...)')"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:param>
  <xsl:param name="chart_name"/>
  <xsl:param name="chart_label" select="'Severity bar chart'"/>
  <xsl:param name="display_name" select="concat ($chart_name, '_display')"/>
  <xsl:param name="generator_name" select="concat ($chart_name, '_gen')"/>
  <xsl:param name="data_source_name" select="concat ($chart_name, '_src')"/>
  <xsl:param name="add_to_display" select="1"/>
  <xsl:param name="auto_load" select="0"/>

  if (displays ["<xsl:value-of select="$display_name"/>"] == undefined)
    {
      console.error ("Display not found: <xsl:value-of select="$display_name"/>");
    }

  if (data_sources ["<xsl:value-of select="$data_source_name"/>"] == undefined)
    {
      data_sources ["<xsl:value-of select="$data_source_name"/>"]
        = DataSource ("get_aggregate",
                      {xml:1,
                       aggregate_type:"<xsl:value-of select="$type"/>",
                       group_column:"severity",
                       filter:"<xsl:value-of select="str:replace ($filter, '&quot;', '\&quot;')"/>"});
    }

  if (generators ["<xsl:value-of select="$generator_name"/>"] == undefined)
    {
      generators ["<xsl:value-of select="$generator_name"/>"]
        = BarChartGenerator (data_sources ["<xsl:value-of select="$data_source_name"/>"])
            .bar_style (severity_bar_style ("value",
                                            severity_levels.max_low,
                                            severity_levels.max_medium))
            .data_transform (data_severity_histogram)
            .title (title_total ("<xsl:value-of select="$title_loading"/>",
                                 "<xsl:value-of select="$title_prefix"/>",
                                 "<xsl:value-of select="$title_suffix"/>",
                                 "count"))
    }

  charts ["<xsl:value-of select="$chart_name"/>"] =
    Chart (data_sources ["<xsl:value-of select="$data_source_name"/>"],
           generators ["<xsl:value-of select="$generator_name"/>"],
           displays ["<xsl:value-of select="$display_name"/>"],
           "<xsl:value-of select="$chart_label"/>",
           "/img/charts/severity-bar-chart.png",
           <xsl:value-of select="$add_to_display"/>);

  <xsl:if test="$auto_load">
    charts ["<xsl:value-of select="$chart_name"/>"].request_data ();
  </xsl:if>
</xsl:template>

<xsl:template name="js-counts-chart">
  <xsl:param name="type" />
  <xsl:param name="id" select="'counts_chart'"/>
  <xsl:param name="filter" />
  <xsl:param name="group_column" />
  <xsl:param name="group_label" select="$group_column" />
  <xsl:param name="title_prefix">
    <xsl:choose>
      <xsl:when test="$filter">
        <xsl:value-of select="concat(gsa:type-name-plural ($type), ' by ', $group_label,' (Total: ')"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="concat('All ', gsa:type-name-plural ($type), ' by ', $group_label,' (Total: ')"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:param>
  <xsl:param name="title_suffix" select="')'"/>
  <xsl:param name="title_loading">
    <xsl:choose>
      <xsl:when test="$filter">
        <xsl:value-of  select="concat(gsa:type-name-plural ($type), ' by ', $group_label,' (loading...)')"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="concat('All ', gsa:type-name-plural ($type),' by ', $group_label, ' (loading...)')"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:param>

  <xsl:param name="chart_name"/>
  <xsl:param name="chart_label" select="concat (gsa:type-name ($type),' counts by ', $group_label)"/>
  <xsl:param name="display_name" select="concat ($chart_name, '_display')"/>
  <xsl:param name="generator_name" select="concat ($chart_name, '_gen')"/>
  <xsl:param name="data_source_name" select="concat ($chart_name, '_src')"/>
  <xsl:param name="add_to_display" select="1"/>
  <xsl:param name="auto_load" select="0"/>

  if (displays ["<xsl:value-of select="$display_name"/>"] == undefined)
    {
      console.error ("Display not found: <xsl:value-of select="$display_name"/>");
    }

  if (data_sources ["<xsl:value-of select="$data_source_name"/>"] == undefined)
    {
      data_sources ["<xsl:value-of select="$data_source_name"/>"]
        = DataSource ("get_aggregate",
                      {xml:1,
                       aggregate_type:"<xsl:value-of select="$type"/>",
                       group_column:"<xsl:value-of select="$group_column"/>",
                       filter:"<xsl:value-of select="str:replace ($filter, '&quot;', '\&quot;')"/>"});
    }

  if (generators ["<xsl:value-of select="$generator_name"/>"] == undefined)
    {
      generators ["<xsl:value-of select="$generator_name"/>"]
        = BarChartGenerator (data_sources ["<xsl:value-of select="$data_source_name"/>"])
            .title (title_total ("<xsl:value-of select="$title_loading"/>",
                                 "<xsl:value-of select="$title_prefix"/>",
                                 "<xsl:value-of select="$title_suffix"/>",
                                 "count"))
    }

  charts ["<xsl:value-of select="$chart_name"/>"] =
    Chart (data_sources ["<xsl:value-of select="$data_source_name"/>"],
           generators ["<xsl:value-of select="$generator_name"/>"],
           displays ["<xsl:value-of select="$display_name"/>"],
           "<xsl:value-of select="$chart_label"/>",
           "/img/charts/severity-bar-chart.png",
           <xsl:value-of select="$add_to_display"/>);

  <xsl:if test="$auto_load">
    charts ["<xsl:value-of select="$chart_name"/>"].request_data ();
  </xsl:if>
</xsl:template>

<xsl:template name="js-secinfo-top-visualization">
  <xsl:param name="type" select="'nvt'"/>
  <xsl:param name="extra_charts" select="''"/>
  <xsl:param name="auto_load_left" select="0"/>
  <xsl:param name="auto_load_right" select="1"/>

  <script type="text/javascript">
    <xsl:call-template name="js-create-chart-box">
      <xsl:with-param name="container_id" select="'top-visualization-left'"/>
    </xsl:call-template>
    <xsl:call-template name="js-create-chart-box">
      <xsl:with-param name="container_id" select="'top-visualization-right'"/>
    </xsl:call-template>

    <xsl:call-template name="js-severity-chart">
      <xsl:with-param name="type" select="$type"/>
      <xsl:with-param name="filter" select="filters/term"/>
      <xsl:with-param name="chart_name" select="'severity_bar_chart_filtered_left'"/>
      <xsl:with-param name="display_name" select="'top-visualization-left'"/>
      <xsl:with-param name="generator_name" select="'severity_bar_chart_filtered'"/>
      <xsl:with-param name="data_source_name" select="'severity_filtered'"/>
      <xsl:with-param name="chart_label" select="'Severity bar chart'"/>
    </xsl:call-template>
    <xsl:call-template name="js-severity-chart">
      <xsl:with-param name="type" select="$type"/>
      <xsl:with-param name="filter" select="filters/term"/>
      <xsl:with-param name="chart_name" select="'severity_bar_chart_filtered_right'"/>
      <xsl:with-param name="display_name" select="'top-visualization-right'"/>
      <xsl:with-param name="generator_name" select="'severity_bar_chart_filtered'"/>
      <xsl:with-param name="data_source_name" select="'severity_filtered'"/>
      <xsl:with-param name="chart_label" select="'Severity bar chart'"/>
    </xsl:call-template>

    <xsl:call-template name="js-severity-chart">
      <xsl:with-param name="type" select="$type"/>
      <xsl:with-param name="chart_name" select="'severity_bar_chart_all_left'"/>
      <xsl:with-param name="display_name" select="'top-visualization-left'"/>
      <xsl:with-param name="generator_name" select="'severity_bar_chart_all'"/>
      <xsl:with-param name="data_source_name" select="'severity_all'"/>
      <xsl:with-param name="chart_label" select="'Severity bar chart (all)'"/>
    </xsl:call-template>
    <xsl:call-template name="js-severity-chart">
      <xsl:with-param name="type" select="$type"/>
      <xsl:with-param name="chart_name" select="'severity_bar_chart_all_right'"/>
      <xsl:with-param name="display_name" select="'top-visualization-right'"/>
      <xsl:with-param name="generator_name" select="'severity_bar_chart_all'"/>
      <xsl:with-param name="data_source_name" select="'severity_all'"/>
      <xsl:with-param name="chart_label" select="'Severity bar chart (all)'"/>
    </xsl:call-template>

    <xsl:copy-of select="$extra_charts"/>

    displays ["top-visualization-left"].create_chart_selector ();
    displays ["top-visualization-right"].create_chart_selector ();

    <xsl:if test="$auto_load_left != ''">
    displays ["top-visualization-left"].select_chart (<xsl:value-of select="$auto_load_left"/>);
    </xsl:if>
    <xsl:if test="$auto_load_left != ''">
    displays ["top-visualization-right"].select_chart (<xsl:value-of select="$auto_load_right"/>);
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
  <xsl:variable name="filter_days" select="7"/>
  <xsl:variable name="filter" select="concat ('modified&gt;-', $filter_days, 'd sort-reverse=severity')"/>

  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">
      <xsl:value-of select="'SecInfo Dashboard'"/>
    </div>
    <div class="gb_window_part_content">
      <center>
        <xsl:call-template name="init-d3charts"/>
        <a href="/omp?cmd=get_info&amp;info_type=nvt&amp;token={/envelope/token}" id="nvt_severity_chart"></a>
        <a href="/omp?cmd=get_info&amp;info_type=nvt&amp;filter={$filter}&amp;token={/envelope/token}" id="nvt_severity_chart_2"></a>

        <a href="/omp?cmd=get_info&amp;info_type=cve&amp;token={/envelope/token}" id="cve_severity_chart"></a>
        <a href="/omp?cmd=get_info&amp;info_type=cve&amp;filter={$filter}&amp;token={/envelope/token}" id="cve_severity_chart_2"></a>

        <a href="/omp?cmd=get_info&amp;info_type=cpe&amp;token={/envelope/token}" id="cpe_severity_chart"></a>
        <a href="/omp?cmd=get_info&amp;info_type=cpe&amp;filter={$filter}&amp;token={/envelope/token}" id="cpe_severity_chart_2"></a>

        <a href="/omp?cmd=get_info&amp;info_type=ovaldef&amp;token={/envelope/token}" id="ovaldef_severity_chart"></a>
        <a href="/omp?cmd=get_info&amp;info_type=ovaldef&amp;filter={$filter}&amp;token={/envelope/token}" id="ovaldef_severity_chart_2"></a>

        <a href="/omp?cmd=get_info&amp;info_type=dfn_cert_adv&amp;token={/envelope/token}" id="dfn_cert_adv_severity_chart"></a>
        <a href="/omp?cmd=get_info&amp;info_type=dfn_cert_adv&amp;filter={$filter}&amp;token={/envelope/token}" id="dfn_cert_adv_severity_chart_2"></a>

        <script>
          <xsl:call-template name="js-create-chart-box">
            <xsl:with-param name="container_id" select="'nvt_severity_chart_display'"/>
            <xsl:with-param name="parent_id" select="'nvt_severity_chart'"/>
          </xsl:call-template>
          <xsl:call-template name="js-severity-chart">
            <xsl:with-param name="type" select="'nvt'"/>
            <xsl:with-param name="id" select="'nvt_severity_chart'"/>
            <xsl:with-param name="chart_name" select="'nvt_severity_chart'"/>
            <xsl:with-param name="display_name" select="'nvt_severity_chart_display'"/>
            <xsl:with-param name="auto_load" select="1"/>
          </xsl:call-template>

          <xsl:call-template name="js-create-chart-box">
            <xsl:with-param name="container_id" select="'nvt_severity_chart_2_display'"/>
            <xsl:with-param name="parent_id" select="'nvt_severity_chart_2'"/>
          </xsl:call-template>
          <xsl:call-template name="js-severity-chart">
            <xsl:with-param name="type" select="'nvt'"/>
            <xsl:with-param name="id" select="'nvt_severity_chart_2'"/>
            <xsl:with-param name="chart_name" select="'nvt_severity_chart_2'"/>
            <xsl:with-param name="display_name" select="'nvt_severity_chart_2_display'"/>
            <xsl:with-param name="filter" select="$filter"/>
            <xsl:with-param name="title_prefix" select="concat ('NVTs of the last ', $filter_days, ' days (Total: ')"/>
            <xsl:with-param name="title_loading" select="concat ('NVTs of the last ', $filter_days, ' days (loading ...) ')"/>
            <xsl:with-param name="auto_load" select="1"/>
          </xsl:call-template>


          <xsl:call-template name="js-create-chart-box">
            <xsl:with-param name="container_id" select="'cve_severity_chart_display'"/>
            <xsl:with-param name="parent_id" select="'cve_severity_chart'"/>
          </xsl:call-template>
          <xsl:call-template name="js-severity-chart">
            <xsl:with-param name="type" select="'cve'"/>
            <xsl:with-param name="id" select="'cve_severity_chart'"/>
            <xsl:with-param name="chart_name" select="'cve_severity_chart'"/>
            <xsl:with-param name="display_name" select="'cve_severity_chart_display'"/>
            <xsl:with-param name="auto_load" select="1"/>
          </xsl:call-template>

          <xsl:call-template name="js-create-chart-box">
            <xsl:with-param name="container_id" select="'cve_severity_chart_2_display'"/>
            <xsl:with-param name="parent_id" select="'cve_severity_chart_2'"/>
          </xsl:call-template>
          <xsl:call-template name="js-severity-chart">
            <xsl:with-param name="type" select="'cve'"/>
            <xsl:with-param name="id" select="'cve_severity_chart_2'"/>
            <xsl:with-param name="chart_name" select="'cve_severity_chart_2'"/>
            <xsl:with-param name="display_name" select="'cve_severity_chart_2_display'"/>
            <xsl:with-param name="filter" select="$filter"/>
            <xsl:with-param name="title_prefix" select="concat ('CVEs of the last ', $filter_days, ' days (Total: ')"/>
            <xsl:with-param name="title_loading" select="concat ('CVEs of the last ', $filter_days, ' days (loading ...) ')"/>
            <xsl:with-param name="auto_load" select="1"/>
          </xsl:call-template>


          <xsl:call-template name="js-create-chart-box">
            <xsl:with-param name="container_id" select="'cpe_severity_chart_display'"/>
            <xsl:with-param name="parent_id" select="'cpe_severity_chart'"/>
          </xsl:call-template>
          <xsl:call-template name="js-severity-chart">
            <xsl:with-param name="type" select="'cpe'"/>
            <xsl:with-param name="id" select="'cpe_severity_chart'"/>
            <xsl:with-param name="chart_name" select="'cpe_severity_chart'"/>
            <xsl:with-param name="display_name" select="'cpe_severity_chart_display'"/>
            <xsl:with-param name="auto_load" select="1"/>
          </xsl:call-template>

          <xsl:call-template name="js-create-chart-box">
            <xsl:with-param name="container_id" select="'cpe_severity_chart_2_display'"/>
            <xsl:with-param name="parent_id" select="'cpe_severity_chart_2'"/>
          </xsl:call-template>
          <xsl:call-template name="js-severity-chart">
            <xsl:with-param name="type" select="'cpe'"/>
            <xsl:with-param name="id" select="'cpe_severity_chart_2'"/>
            <xsl:with-param name="chart_name" select="'cpe_severity_chart_2'"/>
            <xsl:with-param name="display_name" select="'cpe_severity_chart_2_display'"/>
            <xsl:with-param name="filter" select="$filter"/>
            <xsl:with-param name="title_prefix" select="concat ('CPEs of the last ', $filter_days, ' days (Total: ')"/>
            <xsl:with-param name="title_loading" select="concat ('CPEs of the last ', $filter_days, ' days (loading ...) ')"/>
            <xsl:with-param name="auto_load" select="1"/>
          </xsl:call-template>


          <xsl:call-template name="js-create-chart-box">
            <xsl:with-param name="container_id" select="'ovaldef_severity_chart_display'"/>
            <xsl:with-param name="parent_id" select="'ovaldef_severity_chart'"/>
          </xsl:call-template>
          <xsl:call-template name="js-severity-chart">
            <xsl:with-param name="type" select="'ovaldef'"/>
            <xsl:with-param name="id" select="'ovaldef_severity_chart'"/>
            <xsl:with-param name="chart_name" select="'ovaldef_severity_chart'"/>
            <xsl:with-param name="display_name" select="'ovaldef_severity_chart_display'"/>
            <xsl:with-param name="auto_load" select="1"/>
          </xsl:call-template>

          <xsl:call-template name="js-create-chart-box">
            <xsl:with-param name="container_id" select="'ovaldef_severity_chart_2_display'"/>
            <xsl:with-param name="parent_id" select="'ovaldef_severity_chart_2'"/>
          </xsl:call-template>
          <xsl:call-template name="js-severity-chart">
            <xsl:with-param name="type" select="'ovaldef'"/>
            <xsl:with-param name="id" select="'ovaldef_severity_chart_2'"/>
            <xsl:with-param name="chart_name" select="'ovaldef_severity_chart_2'"/>
            <xsl:with-param name="display_name" select="'ovaldef_severity_chart_2_display'"/>
            <xsl:with-param name="filter" select="$filter"/>
            <xsl:with-param name="title_prefix" select="concat ('OVAL definitions of the last ', $filter_days, ' days (Total: ')"/>
            <xsl:with-param name="title_loading" select="concat ('OVAL definitions of the last ', $filter_days, ' days (loading ...) ')"/>
            <xsl:with-param name="auto_load" select="1"/>
          </xsl:call-template>


          <xsl:call-template name="js-create-chart-box">
            <xsl:with-param name="container_id" select="'dfn_cert_adv_severity_chart_display'"/>
            <xsl:with-param name="parent_id" select="'dfn_cert_adv_severity_chart'"/>
          </xsl:call-template>
          <xsl:call-template name="js-severity-chart">
            <xsl:with-param name="type" select="'dfn_cert_adv'"/>
            <xsl:with-param name="id" select="'dfn_cert_adv_severity_chart'"/>
            <xsl:with-param name="chart_name" select="'dfn_cert_adv_severity_chart'"/>
            <xsl:with-param name="display_name" select="'dfn_cert_adv_severity_chart_display'"/>
            <xsl:with-param name="auto_load" select="1"/>
          </xsl:call-template>

          <xsl:call-template name="js-create-chart-box">
            <xsl:with-param name="container_id" select="'dfn_cert_adv_severity_chart_2_display'"/>
            <xsl:with-param name="parent_id" select="'dfn_cert_adv_severity_chart_2'"/>
          </xsl:call-template>
          <xsl:call-template name="js-severity-chart">
            <xsl:with-param name="type" select="'dfn_cert_adv'"/>
            <xsl:with-param name="id" select="'dfn_cert_adv_severity_chart_2'"/>
            <xsl:with-param name="chart_name" select="'dfn_cert_adv_severity_chart_2'"/>
            <xsl:with-param name="display_name" select="'dfn_cert_adv_severity_chart_2_display'"/>
            <xsl:with-param name="filter" select="$filter"/>
            <xsl:with-param name="title_prefix" select="concat ('DFN-CERT advisories of the last ', $filter_days, ' days (Total: ')"/>
            <xsl:with-param name="title_loading" select="concat ('DFN-CERT advisories of the last ', $filter_days, ' days (loading ...) ')"/>
            <xsl:with-param name="auto_load" select="1"/>
          </xsl:call-template>
        </script>
      </center>
    </div>
  </div>
</xsl:template>

</xsl:stylesheet>
