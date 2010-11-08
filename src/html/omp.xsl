<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
    version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:str="http://exslt.org/strings"
    extension-element-prefixes="str">
    <xsl:output
      method="html"
      doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"
      doctype-public="-//W3C//DTD XHTML 1.0 Transitional//EN"
      encoding="UTF-8"/>

<!--
Greenbone Security Assistant
$Id$
Description: OpenVAS Manager Protocol (OMP) stylesheet

Authors:
Matthew Mundell <matthew.mundell@greenbone.net>
Jan-Oliver Wagner <jan-oliver.wagner@greenbone.net>
Michael Wiegand <michael.wiegand@greenbone.net>

Copyright:
Copyright (C) 2009 Greenbone Networks GmbH

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

<!-- NAMED TEMPLATES -->

<!-- This is called within a PRE. -->
<xsl:template name="wrap">
  <xsl:param name="string"></xsl:param>

  <xsl:for-each select="str:tokenize($string, '&#10;')">
    <xsl:call-template name="wrap-line">
      <xsl:with-param name="string"><xsl:value-of select="."/></xsl:with-param>
    </xsl:call-template>
    <xsl:text>
</xsl:text>
  </xsl:for-each>
</xsl:template>

<!-- This is called within a PRE. -->
<xsl:template name="wrap-line">
  <xsl:param name="string"></xsl:param>

  <xsl:variable name="to-next-newline">
    <xsl:value-of select="substring-before($string, '&#10;')"/>
  </xsl:variable>

  <xsl:choose>
    <xsl:when test="string-length($string) = 0">
      <!-- The string is empty. -->
    </xsl:when>
    <xsl:when test="(string-length($to-next-newline) = 0) and (substring($string, 1, 1) != '&#10;')">
      <!-- A single line missing a newline, output up to the edge. -->
<xsl:value-of select="substring($string, 1, 90)"/>
      <xsl:if test="string-length($string) &gt; 90">&#8629;
<xsl:call-template name="wrap-line">
  <xsl:with-param name="string"><xsl:value-of select="substring($string, 91, string-length($string))"/></xsl:with-param>
</xsl:call-template>
      </xsl:if>
    </xsl:when>
    <xsl:when test="(string-length($to-next-newline) + 1 &lt; string-length($string)) and (string-length($to-next-newline) &lt; 90)">
      <!-- There's a newline before the edge, so output the line. -->
<xsl:value-of select="substring($string, 1, string-length($to-next-newline) + 1)"/>
<xsl:call-template name="wrap-line">
  <xsl:with-param name="string"><xsl:value-of select="substring($string, string-length($to-next-newline) + 2, string-length($string))"/></xsl:with-param>
</xsl:call-template>
    </xsl:when>
    <xsl:otherwise>
      <!-- Any newline comes after the edge, so output up to the edge. -->
<xsl:value-of select="substring($string, 1, 90)"/>
      <xsl:if test="string-length($string) &gt; 90">&#8629;
<xsl:call-template name="wrap-line">
  <xsl:with-param name="string"><xsl:value-of select="substring($string, 91, string-length($string))"/></xsl:with-param>
</xsl:call-template>
      </xsl:if>
    </xsl:otherwise>
  </xsl:choose>

</xsl:template>

<xsl:template match="sort">
</xsl:template>

<xsl:template match="apply_overrides">
</xsl:template>

<xsl:template name="html-task-table">
  <xsl:variable name="apply-overrides" select="apply_overrides"/>
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">Tasks
      <a href="/help/tasks.html" title="Help: Tasks">
        <img src="/img/help.png" border="0"/>
      </a>
      <a href="/omp?cmd=new_task&amp;overrides={$apply-overrides}"
         title="New Task">
        <img src="/img/new.png" border="0" style="margin-left:3px;"/>
      </a>
      <div id="small_inline_form" style="margin-left:40px; display: inline">
        <form method="get" action="">
          <input type="hidden" name="cmd" value="get_tasks"/>
          <input type="hidden" name="overrides" value="{$apply-overrides}"/>
          <select style="margin-bottom: 0px;" name="refresh_interval" size="1">
            <xsl:choose>
              <xsl:when test="/envelope/autorefresh/@interval='0'">
                <option value="0" selected="1">&#8730;No auto-refresh</option>
              </xsl:when>
              <xsl:otherwise>
                <option value="0">No auto-refresh</option>
              </xsl:otherwise>
            </xsl:choose>
            <xsl:choose>
              <xsl:when test="/envelope/autorefresh/@interval='10'">
                <option value="10" selected="1">&#8730;Refresh every 10 Sec.</option>
              </xsl:when>
              <xsl:otherwise>
                <option value="10">Refresh every 10 Sec.</option>
              </xsl:otherwise>
            </xsl:choose>
            <xsl:choose>
              <xsl:when test="/envelope/autorefresh/@interval='30'">
                <option value="30" selected="1">&#8730;Refresh every 30 Sec.</option>
              </xsl:when>
              <xsl:otherwise>
                <option value="30">Refresh every 30 Sec.</option>
              </xsl:otherwise>
            </xsl:choose>
            <xsl:choose>
              <xsl:when test="/envelope/autorefresh/@interval='60'">
                <option value="60" selected="1">&#8730;Refresh every 60 Sec.</option>
              </xsl:when>
              <xsl:otherwise>
                <option value="60">Refresh every 60 Sec.</option>
              </xsl:otherwise>
            </xsl:choose>
          </select>
          <select style="margin-bottom: 0px;" name="overrides" size="1">
            <xsl:choose>
              <xsl:when test="$apply-overrides = 0">
                <option value="0" selected="1">&#8730;No overrides</option>
                <option value="1" >Apply overrides</option>
              </xsl:when>
              <xsl:otherwise>
                <option value="0">No overrides</option>
                <option value="1" selected="1">&#8730;Apply overrides</option>
              </xsl:otherwise>
            </xsl:choose>
          </select>
          <input type="image"
                 name="Update"
                 src="/img/refresh.png"
                 alt="Update" style="margin-left:3px;margin-right:3px;"/>
        </form>
      </div>
    </div>
    <div class="gb_window_part_content_no_pad">
      <div id="tasks">
        <table class="gbntable" cellspacing="2" cellpadding="4" border="0">
          <tr class="gbntablehead2">
            <td rowspan="2">
              Task
              <xsl:choose>
                <xsl:when test="sort/field/text()='name'">
                  <xsl:choose>
                    <xsl:when test="sort/field/order/text()='ascending'">
                      <img src="/img/ascending_inactive.png"
                           border="0"
                           style="margin-left:3px;"/>
                      <a href="/omp?cmd=get_tasks&amp;sort_field=name&amp;sort_order=descending"
                         title="Sort Descending">
                        <img src="/img/descending.png"
                             border="0"
                             style="margin-left:3px;"/>
                      </a>
                    </xsl:when>
                    <xsl:otherwise>
                      <a href="/omp?cmd=get_tasks&amp;sort_field=name&amp;sort_order=ascending"
                         title="Sort Ascending">
                        <img src="/img/ascending.png"
                             border="0"
                             style="margin-left:3px;"/>
                      </a>
                      <img src="/img/descending_inactive.png" border="0" style="margin-left:3px;"/>
                    </xsl:otherwise>
                  </xsl:choose>
                </xsl:when>
                <xsl:otherwise>
                  <a href="/omp?cmd=get_tasks&amp;sort_field=name&amp;sort_order=ascending"
                     title="Sort Ascending">
                    <img src="/img/ascending.png"
                         border="0"
                         style="margin-left:3px;"/>
                  </a>
                  <a href="/omp?cmd=get_tasks&amp;sort_field=name&amp;sort_order=descending"
                     title="Sort Descending">
                    <img src="/img/descending.png"
                         border="0"
                         style="margin-left:3px;"/>
                  </a>
                </xsl:otherwise>
              </xsl:choose>
            </td>
            <td width="1" rowspan="2">
              Status
              <xsl:choose>
                <xsl:when test="sort/field/text()='run_status'">
                  <xsl:choose>
                    <xsl:when test="sort/field/order/text()='ascending'">
                      <img src="/img/ascending_inactive.png"
                           border="0"
                           style="margin-left:3px;"/>
                      <a href="/omp?cmd=get_tasks&amp;sort_field=run_status&amp;sort_order=descending"
                         title="Sort Descending">
                        <img src="/img/descending.png"
                             border="0"
                             style="margin-left:3px;"/>
                      </a>
                    </xsl:when>
                    <xsl:otherwise>
                      <a href="/omp?cmd=get_tasks&amp;sort_field=run_status&amp;sort_order=ascending"
                         title="Sort Ascending">
                        <img src="/img/ascending.png"
                             border="0"
                             style="margin-left:3px;"/>
                      </a>
                      <img src="/img/descending_inactive.png"
                           border="0"
                           style="margin-left:3px;"/>
                    </xsl:otherwise>
                  </xsl:choose>
                </xsl:when>
                <xsl:otherwise>
                  <a href="/omp?cmd=get_tasks&amp;sort_field=run_status&amp;sort_order=ascending"
                     title="Sort Ascending">
                    <img src="/img/ascending.png"
                         border="0"
                         style="margin-left:3px;"/>
                  </a>
                  <a href="/omp?cmd=get_tasks&amp;sort_field=run_status&amp;sort_order=descending"
                     title="Sort Descending">
                    <img src="/img/descending.png"
                         border="0"
                         style="margin-left:3px;"/>
                  </a>
                </xsl:otherwise>
              </xsl:choose>
            </td>
            <td colspan="3">Reports</td>
            <td rowspan="2">Threat</td>
            <td rowspan="2">Trend</td>
            <td width="115" rowspan="2">Actions</td>
          </tr>
          <tr class="gbntablehead2">
            <td width="1" style="font-size:10px;">Total</td>
            <td  style="font-size:10px;">First</td>
            <td  style="font-size:10px;">Last</td>
          </tr>
          <xsl:apply-templates/>
        </table>
      </div>
    </div>
  </div>
</xsl:template>

<xsl:template name="build-levels">
  <xsl:param name="filters"></xsl:param>
  <xsl:for-each select="$filters">
    <xsl:choose>
      <xsl:when test="text()='High'">h</xsl:when>
      <xsl:when test="text()='Medium'">m</xsl:when>
      <xsl:when test="text()='Low'">l</xsl:when>
      <xsl:when test="text()='Log'">g</xsl:when>
      <xsl:when test="text()='False Positive'">f</xsl:when>
    </xsl:choose>
  </xsl:for-each>
</xsl:template>

<xsl:template match="all">
</xsl:template>

<xsl:template name="html-report-details">
  <xsl:variable name="levels"
                select="report/filters/text()"/>
  <xsl:variable name="apply-overrides"
                select="report/filters/apply_overrides"/>
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">
      Report Summary
      <a href="/help/view_report.html#viewreport"
         title="Help: View Report (View Report)">
        <img src="/img/help.png"/>
      </a>
      <div id="small_inline_form" style="display: inline; margin-left: 40px; font-weight: normal;">
        <form action="" method="get">
          <input type="hidden" name="cmd" value="get_report"/>
          <input type="hidden" name="report_id" value="{report/@id}"/>
          <input type="hidden" name="first_result" value="{report/results/@start}"/>
          <input type="hidden" name="levels" value="{$levels}"/>
          <input type="hidden"
                 name="search_phrase"
                 value="{report/filters/phrase}"/>
          <input type="hidden"
                 name="apply_min_cvss_base"
                 value="{string-length(report/filters/min_cvss_base) &gt; 0}"/>
          <input type="hidden"
                 name="min_cvss_base"
                 value="{report/filters/min_cvss_base}"/>
          <input type="hidden"
                 name="sort_field"
                 value="{report/sort/field/text()}"/>
          <input type="hidden"
                 name="sort_order"
                 value="{report/sort/field/order}"/>
          <input type="hidden" name="notes" value="{report/filters/notes}"/>
          <input type="hidden"
                 name="result_hosts_only"
                 value="{report/filters/result_hosts_only}"/>
          <input type="hidden" name="task_id" value="{task/@id}"/>
          <select style="margin-bottom: 0px;" name="overrides" size="1">
            <xsl:choose>
              <xsl:when test="$apply-overrides = 0">
                <option value="0" selected="1">&#8730;No overrides</option>
                <option value="1" >Apply overrides</option>
              </xsl:when>
              <xsl:otherwise>
                <option value="0">No overrides</option>
                <option value="1" selected="1">&#8730;Apply overrides</option>
              </xsl:otherwise>
            </xsl:choose>
          </select>
          <input type="image"
                 name="Update"
                 src="/img/refresh.png"
                 alt="Update" style="margin-left:3px;margin-right:3px;"/>
        </form>
      </div>
    </div>
    <div class="gb_window_part_content">
      <div class="float_right">
        <a href="?cmd=get_tasks&amp;task_id={report/task/@id}">Back to Task</a>
      </div>

      <a name="summary"/>
      <table border="0" cellspacing="0" cellpadding="3">
        <tr>
          <td><b>Result of Task:</b></td>
          <td><b><xsl:value-of select="report/task/name"/></b></td>
        </tr>
        <tr>
          <td>Order of results:</td>
          <td>by host</td>
        </tr>
        <tr>
          <td><b>Scan started:</b></td>
          <td><b><xsl:value-of select="report/scan_start"/></b></td>
        </tr>
        <tr>
          <td>Scan ended:</td>
          <td><xsl:value-of select="report/scan_end"/></td>
        </tr>
        <tr>
          <td>Scan status:</td>
          <td>
            <xsl:call-template name="status_bar">
              <xsl:with-param name="status">
                <xsl:value-of select="report/scan_run_status"/>
              </xsl:with-param>
              <xsl:with-param name="progress">
                <xsl:value-of select="../../get_tasks_response/task/progress/text()"/>
              </xsl:with-param>
            </xsl:call-template>
          </td>
        </tr>
      </table>
      <br/>
      <table class="gbntable" cellspacing="2" cellpadding="4">
        <tr class="gbntablehead2">
          <td></td>
          <td><img src="/img/high.png" alt="High" title="High"/></td>
          <td><img src="/img/medium.png" alt="Medium" title="Medium"/></td>
          <td><img src="/img/low.png" alt="Low" title="Low"/></td>
          <td><img src="/img/log.png" alt="Log" title="Log"/></td>
          <td><img src="/img/false_positive.png" alt="False Positive" title="False Positive"/></td>
          <td>Total</td>
        </tr>
        <tr>
          <td>Threat Counts:</td>
          <td>
            <xsl:value-of select="report/result_count/hole"/>
          </td>
          <td>
            <xsl:value-of select="report/result_count/warning"/>
          </td>
          <td>
            <xsl:value-of select="report/result_count/info"/>
          </td>
          <td>
            <xsl:value-of select="report/result_count/log"/>
          </td>
          <td>
            <xsl:value-of select="report/result_count/false_positive"/>
          </td>
          <td>
            <xsl:value-of select="report/result_count/hole + report/result_count/warning + report/result_count/info + report/result_count/log + report/result_count/false_positive"/>
          </td>
        </tr>
      </table>
    </div>
  </div>
  <br/>
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">
      Result Filtering
      <!--
      <a href="/help/view_report.html#viewreport"
         title="Help: View Report (Result Filtering)">
        <img src="/img/help.png"/>
      </a>
      -->
    </div>
    <div class="gb_window_part_content">
      <div style="float:left;">
        <xsl:choose>
          <xsl:when test="count(report/results/result) &gt; 0">
            <!-- This must match the max value in exec_omp_get in gsad.c. -->
            <xsl:variable name="increment">1000</xsl:variable>
            <xsl:variable name="last" select="report/results/@start + count(report/results/result) - 1"/>
            <xsl:if test = "report/results/@start &gt; 1">
              <a href="?cmd=get_report&amp;report_id={report/@id}&amp;first_result={report/results/@start - $increment}&amp;levels={$levels}&amp;sort_field={report/sort/field/text()}&amp;sort_order={report/sort/field/order}&amp;notes={report/filters/notes}&amp;overrides={report/filters/overrides}&amp;result_hosts_only={report/filters/result_hosts_only}">&lt;&lt;</a>
            </xsl:if>
            Results <xsl:value-of select="report/results/@start"/> -
            <xsl:value-of select="$last"/>
            of <xsl:value-of select="report/result_count/filtered"/>
            <xsl:if test = "$last &lt; report/result_count/filtered">
              <a href="?cmd=get_report&amp;report_id={report/@id}&amp;first_result={report/results/@start + $increment}&amp;levels={$levels}&amp;sort_field={report/sort/field/text()}&amp;sort_order={report/sort/field/order}&amp;notes={report/filters/notes}&amp;overrides={report/filters/overrides}&amp;result_hosts_only={report/filters/result_hosts_only}">&gt;&gt;</a>
            </xsl:if>
          </xsl:when>
          <xsl:otherwise>
          </xsl:otherwise>
        </xsl:choose>
      </div>
      <div id="small_form" class="float_right">
        <form action="" method="get">
          This report as:
          <input type="hidden" name="cmd" value="get_report"/>
          <input type="hidden" name="report_id" value="{report/@id}"/>
          <input type="hidden" name="first_result" value="{report/results/@start}"/>
          <input type="hidden" name="levels" value="{$levels}"/>
          <input type="hidden"
                 name="search_phrase"
                 value="{report/filters/phrase}"/>
          <input type="hidden"
                 name="apply_min_cvss_base"
                 value="{string-length(report/filters/min_cvss_base) &gt; 0}"/>
          <input type="hidden"
                 name="min_cvss_base"
                 value="{report/filters/min_cvss_base}"/>
          <input type="hidden"
                 name="sort_field"
                 value="{report/sort/field/text()}"/>
          <input type="hidden"
                 name="sort_order"
                 value="{report/sort/field/order}"/>
          <input type="hidden" name="notes" value="{report/filters/notes}"/>
          <input type="hidden"
                 name="overrides"
                 value="{$apply-overrides}"/>
          <input type="hidden"
                 name="result_hosts_only"
                 value="{report/filters/result_hosts_only}"/>
          <select name="report_format_id" title="Download Format">
            <xsl:for-each select="../../get_report_formats_response/report_format[active=1]">
              <xsl:choose>
                <xsl:when test="@id='1a60a67e-97d0-4cbf-bc77-f71b08e7043d'">
                  <option value="{@id}" selected="1"><xsl:value-of select="name"/></option>
                </xsl:when>
                <xsl:otherwise>
                  <option value="{@id}"><xsl:value-of select="name"/></option>
                </xsl:otherwise>
              </xsl:choose>
            </xsl:for-each>
          </select>
          <input type="image"
                 name="submit"
                 value="Download"
                 title="Download"
                 src="/img/download.png"
                 border="0"
                 style="margin-left:3px;"
                 alt="Download"/>
        </form>
      </div>

      <!-- TODO: Move to template. -->
      <br/>
      <p><table border="0" cellspacing="0" cellpadding="3" width="100%">
        <tr>
          <td>
            Sorting:
          </td>
          <td>
            <xsl:choose>
              <xsl:when test="report/sort/field/text()='port' and report/sort/field/order='ascending'">
                port ascending
              </xsl:when>
              <xsl:otherwise>
                <a href="/omp?cmd=get_report&amp;report_id={report/@id}&amp;sort_field=port&amp;sort_order=ascending&amp;levels={$levels}&amp;notes={report/filters/notes}&amp;overrides={report/filters/overrides}&amp;result_hosts_only={report/filters/result_hosts_only}">port ascending</a>
              </xsl:otherwise>
            </xsl:choose>
            |
            <xsl:choose>
              <xsl:when test="report/sort/field/text()='port' and report/sort/field/order='descending'">
                port descending
              </xsl:when>
              <xsl:otherwise>
                <a href="/omp?cmd=get_report&amp;report_id={report/@id}&amp;sort_field=port&amp;sort_order=descending&amp;levels={$levels}&amp;notes={report/filters/notes}&amp;overrides={report/filters/overrides}&amp;result_hosts_only={report/filters/result_hosts_only}">port descending</a>
              </xsl:otherwise>
            </xsl:choose>
            |
            <xsl:choose>
              <xsl:when test="report/sort/field/text()='type' and report/sort/field/order='ascending'">
                threat ascending
              </xsl:when>
              <xsl:otherwise>
                <a href="/omp?cmd=get_report&amp;report_id={report/@id}&amp;sort_field=type&amp;sort_order=ascending&amp;levels={$levels}&amp;notes={report/filters/notes}&amp;overrides={report/filters/overrides}&amp;result_hosts_only={report/filters/result_hosts_only}">threat ascending</a>
              </xsl:otherwise>
            </xsl:choose>
            |
            <xsl:choose>
              <xsl:when test="report/sort/field/text()='type' and report/sort/field/order='descending'">
                threat descending
              </xsl:when>
              <xsl:otherwise>
                <a href="/omp?cmd=get_report&amp;report_id={report/@id}&amp;sort_field=type&amp;sort_order=descending&amp;levels={$levels}&amp;notes={report/filters/notes}&amp;overrides={report/filters/overrides}&amp;result_hosts_only={report/filters/result_hosts_only}">threat descending</a>
              </xsl:otherwise>
            </xsl:choose>
          </td>
        </tr>
      </table></p>
      <br/>
      <table class="odd" width="100%">
        <xsl:variable name="sort_field">
          <xsl:value-of select="report/sort/field/text()"/>
        </xsl:variable>
        <xsl:variable name="sort_order">
          <xsl:value-of select="report/sort/field/order"/>
        </xsl:variable>
        <div id="small_form">
          <form action="" method="get">
            <input type="hidden" name="cmd" value="get_report"/>
            <input type="hidden" name="report_id" value="{report/@id}"/>
            <input type="hidden" name="sort_field" value="{$sort_field}"/>
            <input type="hidden" name="sort_order" value="{$sort_order}"/>
            <input type="hidden"
                   name="overrides"
                   value="{report/filters/apply_overrides}"/>
            <tr>
              <td colspan="3">
                <xsl:choose>
                  <xsl:when test="report/filters/notes = 0">
                    <input type="checkbox" name="notes" value="1"/>
                  </xsl:when>
                  <xsl:otherwise>
                    <input type="checkbox" name="notes" value="1" checked="1"/>
                  </xsl:otherwise>
                </xsl:choose>
                Show notes
              </td>
            </tr>
            <tr>
              <td colspan="3">
                <xsl:choose>
                  <xsl:when test="report/filters/result_hosts_only = 0">
                    <input type="checkbox" name="result_hosts_only" value="1"/>
                  </xsl:when>
                  <xsl:otherwise>
                    <input type="checkbox" name="result_hosts_only" value="1" checked="1"/>
                  </xsl:otherwise>
                </xsl:choose>
                Only show hosts that have results
              </td>
            </tr>
            <tr>
              <td colspan="3">
                <xsl:choose>
                  <xsl:when test="report/filters/min_cvss_base = ''">
                    <input type="checkbox" name="apply_min_cvss_base" value="1"/>
                  </xsl:when>
                  <xsl:otherwise>
                    <input type="checkbox" name="apply_min_cvss_base" value="1"
                           checked="1"/>
                  </xsl:otherwise>
                </xsl:choose>
                CVSS &gt;=
                <select name="min_cvss_base">
                  <xsl:call-template name="opt">
                    <xsl:with-param name="value" select="'10.0'"/>
                    <xsl:with-param name="select-value" select="report/filters/min_cvss_base"/>
                  </xsl:call-template>
                  <xsl:call-template name="opt">
                    <xsl:with-param name="value" select="'9.0'"/>
                    <xsl:with-param name="select-value" select="report/filters/min_cvss_base"/>
                  </xsl:call-template>
                  <xsl:choose>
                    <xsl:when test="report/filters/min_cvss_base = ''">
                      <xsl:call-template name="opt">
                        <xsl:with-param name="value" select="'8.0'"/>
                        <xsl:with-param name="select-value" select="'8.0'"/>
                      </xsl:call-template>
                    </xsl:when>
                    <xsl:otherwise>
                      <xsl:call-template name="opt">
                        <xsl:with-param name="value" select="'8.0'"/>
                        <xsl:with-param name="select-value" select="report/filters/min_cvss_base"/>
                      </xsl:call-template>
                    </xsl:otherwise>
                  </xsl:choose>
                  <xsl:call-template name="opt">
                    <xsl:with-param name="value" select="'7.0'"/>
                    <xsl:with-param name="select-value" select="report/filters/min_cvss_base"/>
                  </xsl:call-template>
                  <xsl:call-template name="opt">
                    <xsl:with-param name="value" select="'6.0'"/>
                    <xsl:with-param name="select-value" select="report/filters/min_cvss_base"/>
                  </xsl:call-template>
                  <xsl:call-template name="opt">
                    <xsl:with-param name="value" select="'5.0'"/>
                    <xsl:with-param name="select-value" select="report/filters/min_cvss_base"/>
                  </xsl:call-template>
                  <xsl:call-template name="opt">
                    <xsl:with-param name="value" select="'4.0'"/>
                    <xsl:with-param name="select-value" select="report/filters/min_cvss_base"/>
                  </xsl:call-template>
                  <xsl:call-template name="opt">
                    <xsl:with-param name="value" select="'3.0'"/>
                    <xsl:with-param name="select-value" select="report/filters/min_cvss_base"/>
                  </xsl:call-template>
                  <xsl:call-template name="opt">
                    <xsl:with-param name="value" select="'2.0'"/>
                    <xsl:with-param name="select-value" select="report/filters/min_cvss_base"/>
                  </xsl:call-template>
                  <xsl:call-template name="opt">
                    <xsl:with-param name="value" select="'1.0'"/>
                    <xsl:with-param name="select-value" select="report/filters/min_cvss_base"/>
                  </xsl:call-template>
                  <xsl:call-template name="opt">
                    <xsl:with-param name="value" select="'0.0'"/>
                    <xsl:with-param name="select-value" select="report/filters/min_cvss_base"/>
                  </xsl:call-template>
                </select>
              </td>
            </tr>
            <tr>
              <td>
                Text phrase:
              </td>
              <td>
                <input type="text" name="search_phrase" size="50"
                       value="{report/filters/phrase}"
                       maxlength="400"/>
              </td>
              <td></td>
            </tr>
            <tr>
              <td>Threat:</td>
              <td>
                <table>
                  <tr>
                    <td class="threat_info_table_h">
                      <xsl:choose>
                        <xsl:when test="report/filters/filter[text()='High']">
                          <input type="checkbox" name="level_high" value="1"
                                 checked="1"/>
                        </xsl:when>
                        <xsl:otherwise>
                          <input type="checkbox" name="level_high" value="1"/>
                        </xsl:otherwise>
                      </xsl:choose>
                      <img src="/img/high.png" alt="High" title="High"/>
                    </td>
                    <td class="threat_info_table_h">
                      <xsl:choose>
                        <xsl:when test="report/filters/filter[text()='Medium']">
                          <input type="checkbox" name="level_medium" value="1"
                                 checked="1"/>
                        </xsl:when>
                        <xsl:otherwise>
                          <input type="checkbox" name="level_medium" value="1"/>
                        </xsl:otherwise>
                      </xsl:choose>
                      <img src="/img/medium.png" alt="Medium" title="Medium"/>
                    </td>
                    <td class="threat_info_table_h">
                      <xsl:choose>
                        <xsl:when test="report/filters/filter[text()='Low']">
                          <input type="checkbox" name="level_low" value="1"
                                 checked="1"/>
                        </xsl:when>
                        <xsl:otherwise>
                          <input type="checkbox" name="level_low" value="1"/>
                        </xsl:otherwise>
                      </xsl:choose>
                      <img src="/img/low.png" alt="Low" title="Low"/>
                    </td>
                    <td class="threat_info_table_h">
                      <xsl:choose>
                        <xsl:when test="report/filters/filter[text()='Log']">
                          <input type="checkbox" name="level_log" value="1"
                                 checked="1"/>
                        </xsl:when>
                        <xsl:otherwise>
                          <input type="checkbox" name="level_log" value="1"/>
                        </xsl:otherwise>
                      </xsl:choose>
                      <img src="/img/log.png" alt="Log" title="Log"/>
                    </td>
                    <td class="threat_info_table_h">
                      <xsl:choose>
                        <xsl:when test="report/filters/filter[text()='False Positive']">
                          <input type="checkbox"
                                 name="level_false_positive"
                                 value="1"
                                 checked="1"/>
                        </xsl:when>
                        <xsl:otherwise>
                          <input type="checkbox"
                                 name="level_false_positive"
                                 value="1"/>
                        </xsl:otherwise>
                      </xsl:choose>
                      <img src="/img/false_positive.png" alt="False Positive" title="False Positive"/>
                    </td>
                  </tr>
                </table>
              </td>
              <td>
                <input type="submit" value="Apply" title="Apply"/>
              </td>
            </tr>
          </form>
        </div>
      </table>
    </div>
  </div>
  <br/>
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">
      Filtered Results
      <!--
      <a href="/help/view_report.html#viewreport"
         title="Help: View Report (Results per Host)">
        <img src="/img/help.png"/>
      </a>
      -->
    </div>
    <div class="gb_window_part_content">
      <xsl:choose>
        <xsl:when test="count(report/results/result) &gt; 0">
          <xsl:apply-templates select="report" mode="overview"/>

          <xsl:apply-templates select="report" mode="details"/>
        </xsl:when>
        <xsl:otherwise>
          0 results
        </xsl:otherwise>
      </xsl:choose>
    </div>
  </div>
</xsl:template>

<xsl:template name="html-report-table">
  <xsl:variable name="apply-overrides" select="../../apply_overrides"/>
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">Task Summary
      <a href="/help/reports.html#tasksummary"
         title="Help: Reports (Task Summary)">
        <img src="/img/help.png"/>
      </a>
      <a href="/omp?cmd=get_tasks&amp;task_id={task/@id}&amp;overrides={$apply-overrides}" title="Refresh">
        <img src="/img/refresh.png" border="0" style="margin-left:3px;"/>
      </a>
      <div id="small_inline_form" style="display: inline; margin-left: 40px; font-weight: normal;">
        <xsl:choose>
          <xsl:when test="string-length(task/schedule/@id) &gt; 0">
            <a href="/omp?cmd=get_schedule&amp;schedule_id={task/schedule/@id}"
               title="Schedule Details">
              <img src="/img/scheduled.png" border="0" alt="Schedule Details"/>
            </a>
          </xsl:when>
          <xsl:when test="task/status='Running'">
            <a href="/omp?cmd=pause_task&amp;task_id={task/@id}&amp;overrides={apply_overrides}&amp;next=get_task"
               title="Pause Task">
              <img src="/img/pause.png" border="0" alt="Pause"/>
            </a>
          </xsl:when>
          <xsl:when test="task/status='Stop Requested' or task/status='Delete Requested' or task/status='Pause Requested' or task/status = 'Paused' or task/status='Resume Requested' or task/status='Requested'">
            <img src="/img/start_inactive.png" border="0" alt="Start"/>
          </xsl:when>
          <xsl:otherwise>
            <a href="/omp?cmd=start_task&amp;task_id={task/@id}&amp;overrides={apply_overrides}&amp;next=get_task"
               title="Start Task">
              <img src="/img/start.png" border="0" alt="Start"/>
            </a>
          </xsl:otherwise>
        </xsl:choose>
        <xsl:choose>
          <xsl:when test="string-length(task/schedule/@id) &gt; 0">
            <img src="/img/resume_inactive.png" border="0" alt="Resume"
                 style="margin-left:3px;"/>
          </xsl:when>
          <xsl:when test="task/status='Stopped'">
            <a href="/omp?cmd=resume_stopped_task&amp;task_id={task/@id}&amp;overrides={apply_overrides}&amp;next=get_task"
               title="Resume Task">
              <img src="/img/resume.png"
                   border="0"
                   alt="Resume"
                   style="margin-left:3px;"/>
            </a>
          </xsl:when>
          <xsl:when test="task/status='Paused'">
            <a href="/omp?cmd=resume_paused_task&amp;task_id={task/@id}&amp;overrides={apply_overrides}&amp;next=get_task"
               title="Resume Task">
              <img src="/img/resume.png"
                   border="0"
                   alt="Resume"
                   style="margin-left:3px;"/>
            </a>
          </xsl:when>
          <xsl:otherwise>
            <img src="/img/resume_inactive.png" border="0" alt="Resume"
                 style="margin-left:3px;"/>
          </xsl:otherwise>
        </xsl:choose>
        <xsl:choose>
          <xsl:when test="string-length(task/schedule/@id) &gt; 0">
            <img src="/img/stop_inactive.png" border="0"
                 alt="Stop"
                 style="margin-left:3px;"/>
          </xsl:when>
          <xsl:when test="task/status='New' or task/status='Requested' or task/status='Done' or task/status='Stopped' or task/status='Internal Error' or task/status='Pause Requested' or task/status='Stop Requested' or task/status='Resume Requested'">
            <img src="/img/stop_inactive.png" border="0"
                 alt="Stop"
                 style="margin-left:3px;"/>
          </xsl:when>
          <xsl:otherwise>
            <a href="/omp?cmd=stop_task&amp;task_id={task/@id}&amp;overrides={apply_overrides}&amp;next=get_task"
               title="Stop Task">
              <img src="/img/stop.png"
                   border="0"
                   alt="Stop"
                   style="margin-left:3px;"/>
            </a>
          </xsl:otherwise>
        </xsl:choose>
        <xsl:choose>
          <xsl:when test="task/status='Running' or task/status='Requested' or task/status='Pause Requested' or task/status='Stop Requested' or task/status='Resume Requested'">
            <img src="/img/delete_inactive.png"
                 border="0"
                 alt="Delete"
                 style="margin-left:3px;"/>
          </xsl:when>
          <xsl:otherwise>
            <a href="/omp?cmd=delete_task&amp;task_id={task/@id}&amp;overrides={apply_overrides}&amp;next=get_tasks"
               title="Delete Task"
               style="margin-left:3px;">
              <img src="/img/delete.png"
                   border="0"
                   alt="Delete"/>
            </a>
          </xsl:otherwise>
        </xsl:choose>
        <a href="/omp?cmd=edit_task&amp;task_id={task/@id}&amp;next=get_task&amp;refresh_interval={/envelope/autorefresh/@interval}&amp;sort_order={sort/field/order}&amp;sort_field={sort/field/text()}&amp;overrides={apply_overrides}"
           title="Edit Task"
           style="margin-left:3px;">
          <img src="/img/edit.png" border="0" alt="Edit"/>
        </a>
      </div>
    </div>
    <div class="gb_window_part_content">
      <div class="float_right">
        <a href="/omp?cmd=get_tasks">Back to Tasks</a>
      </div>
      <table>
        <tr>
          <td><b>Name:</b></td>
          <td><b><xsl:value-of select="task/name"/></b></td>
        </tr>
        <tr>
          <td>Comment:</td>
          <td><xsl:value-of select="task/comment"/></td>
        </tr>
        <tr>
          <td>Config:</td>
          <td>
            <a href="/omp?cmd=get_config&amp;config_id={task/config/@id}">
              <xsl:value-of select="task/config/name"/>
            </a>
          </td>
        </tr>
        <tr>
          <td>Escalator:</td>
          <td>
            <xsl:if test="task/escalator">
              <a href="/omp?cmd=get_escalator&amp;escalator_id={task/escalator/@id}">
                <xsl:value-of select="task/escalator/name"/>
              </a>
            </xsl:if>
          </td>
        </tr>
        <tr>
          <td>Schedule:</td>
          <td>
            <xsl:if test="task/schedule">
              <a href="/omp?cmd=get_schedule&amp;schedule_id={task/schedule/@id}">
                <xsl:value-of select="task/schedule/name"/>
              </a>
              <xsl:choose>
                <xsl:when test="task/schedule/next_time = 0">
                  (Next due: over)
                </xsl:when>
                <xsl:otherwise>
                  (Next due: <xsl:value-of select="task/schedule/next_time"/>)
                </xsl:otherwise>
              </xsl:choose>
            </xsl:if>
          </td>
        </tr>
        <tr>
          <td>Target:</td>
          <td>
            <a href="/omp?cmd=get_target&amp;target_id={task/target/@id}">
              <xsl:value-of select="task/target/name"/>
            </a>
          </td>
        </tr>
        <tr>
          <td>Slave:</td>
          <td>
            <a href="/omp?cmd=get_slave&amp;slave_id={task/slave/@id}">
              <xsl:value-of select="task/slave/name"/>
            </a>
          </td>
        </tr>
        <tr>
          <td>Status:</td>
          <td>
            <xsl:call-template name="status_bar">
              <xsl:with-param name="status">
                <xsl:value-of select="task/status"/>
              </xsl:with-param>
              <xsl:with-param name="progress">
                <xsl:value-of select="task/progress/text()"/>
              </xsl:with-param>
            </xsl:call-template>
          </td>
        </tr>
        <tr>
          <td>Reports:</td>
          <td>
            <xsl:value-of select="task/report_count/text()"/>
            (Finished: <xsl:value-of select="task/report_count/finished"/>)
          </td>
        </tr>
      </table>
    </div>
  </div>
  <br/>
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">
      Reports for "<xsl:value-of select="task/name"/>"
      <a href="/help/reports.html#reports" title="Help: Reports (Reports)">
        <img src="/img/help.png"/>
      </a>
      <div id="small_inline_form" style="display: inline; margin-left: 40px; font-weight: normal;">
        <form action="" method="get">
          <input type="hidden" name="cmd" value="get_tasks"/>
          <input type="hidden" name="task_id" value="{task/@id}"/>
          <select style="margin-bottom: 0px;" name="overrides" size="1">
            <xsl:choose>
              <xsl:when test="$apply-overrides = 0">
                <option value="0" selected="1">&#8730;No overrides</option>
                <option value="1" >Apply overrides</option>
              </xsl:when>
              <xsl:otherwise>
                <option value="0">No overrides</option>
                <option value="1" selected="1">&#8730;Apply overrides</option>
              </xsl:otherwise>
            </xsl:choose>
          </select>
          <input type="image"
                 name="Update"
                 src="/img/refresh.png"
                 alt="Update" style="margin-left:3px;margin-right:3px;"/>
        </form>
      </div>
    </div>
    <div class="gb_window_part_content_no_pad">
      <div id="reports">
        <table class="gbntable" cellspacing="2" cellpadding="4">
          <tr class="gbntablehead2">
            <td rowspan="2">Report</td>
            <td rowspan="2">Threat</td>
            <td colspan="5">Scan Results</td>
            <td rowspan="2">Download</td>
            <td rowspan="2">Actions</td>
          </tr>
          <tr class="gbntablehead2">
            <td class="threat_info_table_h">
              <img src="/img/high.png" alt="High" title="High"/>
            </td>
            <td class="threat_info_table_h">
              <img src="/img/medium.png" alt="Medium" title="Medium"/>
            </td>
            <td class="threat_info_table_h">
              <img src="/img/low.png" alt="Low" title="Low"/>
            </td>
            <td class="threat_info_table_h">
              <img src="/img/log.png" alt="Log" title="Log"/>
            </td>
            <td class="threat_info_table_h">
              <img src="/img/false_positive.png" alt="False Positive" title="False Positive"/>
            </td>
          </tr>
          <xsl:apply-templates select="task/reports/report"/>
        </table>
      </div>
    </div>
  </div>
  <br/>
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">
      Notes on Results of "<xsl:value-of select="task/name"/>"
      <a href="/help/reports.html#notes" title="Help: Reports (Notes)">
        <img src="/img/help.png"/>
      </a>
      <a href="/omp?cmd=get_tasks&amp;task_id={task/@id}&amp;overrides={$apply-overrides}"
         title="Refresh">
        <img src="/img/refresh.png" border="0" style="margin-left:3px;"/>
      </a>
    </div>
    <div class="gb_window_part_content_no_pad">
      <div id="notes">
        <table class="gbntable" cellspacing="2" cellpadding="4" border="0">
          <tr class="gbntablehead2">
            <td>NVT</td>
            <td>Text</td>
            <td width="100">Actions</td>
          </tr>
          <xsl:variable name="task_id"><xsl:value-of select="task/@id"/></xsl:variable>
          <xsl:for-each select="../get_notes_response/note">
            <xsl:call-template name="note">
              <xsl:with-param name="next">get_tasks&amp;task_id=<xsl:value-of select="$task_id"/>&amp;overrides=<xsl:value-of select="$apply-overrides"/></xsl:with-param>
            </xsl:call-template>
          </xsl:for-each>
        </table>
      </div>
    </div>
  </div>
  <br/>
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">
      Overrides on Results of "<xsl:value-of select="task/name"/>"
      <a href="/help/reports.html#overrides" title="Help: Reports (Overrides)">
        <img src="/img/help.png"/>
      </a>
      <a href="/omp?cmd=get_tasks&amp;task_id={task/@id}&amp;overrides={$apply-overrides}"
         title="Refresh">
        <img src="/img/refresh.png" border="0" style="margin-left:3px;"/>
      </a>
    </div>
    <div class="gb_window_part_content_no_pad">
      <div id="overrides">
        <table class="gbntable" cellspacing="2" cellpadding="4" border="0">
          <tr class="gbntablehead2">
            <td>NVT</td>
            <td>From</td>
            <td>To</td>
            <td>Text</td>
            <td width="100">Actions</td>
          </tr>
          <xsl:variable name="task_id"><xsl:value-of select="task/@id"/></xsl:variable>
          <xsl:for-each select="../get_overrides_response/override">
            <xsl:call-template name="override">
              <xsl:with-param name="next">get_tasks&amp;task_id=<xsl:value-of select="$task_id"/>&amp;overrides=<xsl:value-of select="$apply-overrides"/>
</xsl:with-param>
            </xsl:call-template>
          </xsl:for-each>
        </table>
      </div>
    </div>
  </div>
</xsl:template>

<xsl:template name="short_timestamp_first">
  <xsl:value-of select="substring(first_report/report/timestamp,5,6)"/>
  <xsl:value-of select="substring(first_report/report/timestamp,20,21)"/>
</xsl:template>

<xsl:template name="short_timestamp_last">
  <xsl:value-of select="substring(last_report/report/timestamp,5,6)"/>
  <xsl:value-of select="substring(last_report/report/timestamp,20,21)"/>
</xsl:template>

<xsl:template name="short_timestamp_second_last">
  <xsl:value-of select="substring(second_last_report/report/timestamp,5,6)"/>
  <xsl:value-of select="substring(second_last_report/report/timestamp,20,21)"/>
</xsl:template>

<!-- TREND METER -->
<xsl:template name="trend_meter">
  <xsl:choose>
    <xsl:when test="trend = 'up'">
      <img src="/img/trend_up.png" alt="Threat level increased"
           title="Threat level increased"/>
    </xsl:when>
    <xsl:when test="trend = 'down'">
      <img src="/img/trend_down.png" alt="Threat level decreased"
           title="Threat level decreased"/>
    </xsl:when>
    <xsl:when test="trend = 'more'">
      <img src="/img/trend_more.png" alt="Threat count increased"
           title="Threat count increased"/>
    </xsl:when>
    <xsl:when test="trend = 'less'">
      <img src="/img/trend_less.png" alt="Threat count decreased"
           title="Threat count decreased"/>
    </xsl:when>
    <xsl:when test="trend = 'same'">
      <img src="/img/trend_nochange.png" alt="Threat did not change"
           title="The threat did not change"/>
    </xsl:when>
    <xsl:otherwise>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template match="target" mode="newtask">
  <option value="{@id}"><xsl:value-of select="name"/></option>
</xsl:template>

<xsl:template match="config" mode="newtask">
  <option value="{@id}"><xsl:value-of select="name"/></option>
</xsl:template>

<xsl:template match="escalator" mode="newtask">
  <option value="{@id}"><xsl:value-of select="name"/></option>
</xsl:template>

<xsl:template match="schedule" mode="newtask">
  <option value="{@id}"><xsl:value-of select="name"/></option>
</xsl:template>

<xsl:template match="slave" mode="newtask">
  <option value="{@id}"><xsl:value-of select="name"/></option>
</xsl:template>

<xsl:template name="status_bar">
  <xsl:param name="status">(Unknown)</xsl:param>
  <xsl:param name="progress">(Unknown)</xsl:param>
  <xsl:choose>
    <xsl:when test="$status='Running'">
      <div class="progressbar_box" title="{$status}">
        <div class="progressbar_bar" style="width:{$progress}px;"></div>
        <div class="progressbar_text">
          <xsl:value-of select="$progress"/> %
        </div>
      </div>
    </xsl:when>
    <xsl:when test="$status='New'">
      <div class="progressbar_box" title="{$status}">
        <div class="progressbar_bar_new" style="width:100px;"></div>
        <div class="progressbar_text">
          <i><b><xsl:value-of select="$status"/></b></i>
        </div>
      </div>
    </xsl:when>
    <xsl:when test="$status='Requested'">
      <div class="progressbar_box" title="{$status}">
        <div class="progressbar_bar_request" style="width:100px;"></div>
        <div class="progressbar_text"><xsl:value-of select="$status"/></div>
      </div>
    </xsl:when>
    <xsl:when test="$status='Delete Requested'">
      <div class="progressbar_box" title="{$status}">
        <div class="progressbar_bar_request" style="width:100px;"></div>
        <div class="progressbar_text"><xsl:value-of select="$status"/></div>
      </div>
    </xsl:when>
    <xsl:when test="$status='Pause Requested'">
      <div class="progressbar_box" title="{$status}">
        <div class="progressbar_bar_request" style="width:100px;"></div>
        <div class="progressbar_text"><xsl:value-of select="$status"/></div>
      </div>
    </xsl:when>
    <xsl:when test="$status='Paused'">
      <div class="progressbar_box" title="{$status}">
        <div class="progressbar_bar_request" style="width:{$progress}px;"></div>
        <div class="progressbar_text">
          <xsl:value-of select="$status"/>
          <xsl:if test="$progress &gt;= 0">
            at <xsl:value-of select="$progress"/> %
          </xsl:if>
        </div>
      </div>
    </xsl:when>
    <xsl:when test="$status='Resume Requested'">
      <div class="progressbar_box" title="{$status}">
        <div class="progressbar_bar_request" style="width:100px;"></div>
        <div class="progressbar_text"><xsl:value-of select="$status"/></div>
      </div>
    </xsl:when>
    <xsl:when test="$status='Stop Requested'">
      <div class="progressbar_box" title="{$status}">
        <div class="progressbar_bar_request" style="width:100px;"></div>
        <div class="progressbar_text"><xsl:value-of select="$status"/></div>
      </div>
    </xsl:when>
    <xsl:when test="$status='Stopped'">
      <div class="progressbar_box" title="{$status}">
        <div class="progressbar_bar_request" style="width:{$progress}px;"></div>
        <div class="progressbar_text">
          <xsl:value-of select="$status"/>
          <xsl:if test="$progress &gt;= 0">
            at <xsl:value-of select="$progress"/> %
          </xsl:if>
        </div>
      </div>
    </xsl:when>
    <xsl:when test="$status='Internal Error'">
      <div class="progressbar_box" title="{$status}">
        <div class="progressbar_bar_error" style="width:100px;"></div>
        <div class="progressbar_text"><xsl:value-of select="$status"/></div>
      </div>
    </xsl:when>
    <xsl:when test="$status='Done'">
      <div class="progressbar_box" title="{$status}">
        <div class="progressbar_bar_done" style="width:100px;"></div>
        <div class="progressbar_text"><xsl:value-of select="$status"/></div>
      </div>
    </xsl:when>
    <xsl:otherwise>
      <xsl:value-of select="$status"/>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<!-- END NAMED TEMPLATES -->

<xsl:template match="message">
  <div class="message">
    <xsl:apply-templates/>
  </div>
</xsl:template>

<xsl:template match="error">
  <div class="error">
    <xsl:apply-templates/>
  </div>
</xsl:template>

<xsl:template match="status">
</xsl:template>

<xsl:template match="hole">
  H=<xsl:apply-templates/>
</xsl:template>

<xsl:template match="warning">
  W=<xsl:apply-templates/>
</xsl:template>

<xsl:template match="info">
  I=<xsl:apply-templates/>
</xsl:template>

<xsl:template match="debug">
  D=<xsl:apply-templates/>
</xsl:template>

<xsl:template match="log">
  L=<xsl:apply-templates/>
</xsl:template>

<xsl:template match="false_positive">
  F=<xsl:apply-templates/>
</xsl:template>

<xsl:template match="result_count">
  <div>
    <xsl:apply-templates/>
  </div>
</xsl:template>

<xsl:template match="gsad_msg">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">
      <xsl:value-of select="@operation"/>
    </xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
    <xsl:with-param name="details">
      <xsl:value-of select="text()"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<xsl:template match="create_task_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">Create Task</xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<xsl:template match="delete_task_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">Delete Task</xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<xsl:template match="delete_report_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">Delete Report</xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<xsl:template match="start_task_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">Start Task</xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<xsl:template match="stop_task_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">Stop Task</xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<xsl:template match="pause_task_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">Pause Task</xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<xsl:template match="resume_paused_task_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">Resume Task</xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<xsl:template match="resume_stopped_task_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">Resume Stopped Task</xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<xsl:template match="task_count">
</xsl:template>

<!-- LAST_REPORT -->

<xsl:template match="last_report">
  <xsl:apply-templates/>
</xsl:template>

<!-- REPORT -->
<xsl:template match="report">
  <xsl:variable name="class">
    <xsl:choose>
      <xsl:when test="position() mod 2 = 0">even</xsl:when>
      <xsl:otherwise>odd</xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <tr class="{$class}">
    <td>
      <b><xsl:value-of select="timestamp"/></b><br/>
      <xsl:value-of select="scan_run_status"/>
    </td>
    <td>
      <xsl:choose>
        <xsl:when test="result_count/hole &gt; 0">
          <img src="/img/high_big.png"
               title="High={result_count/hole} Medium={result_count/warning} Low={result_count/info} FP={result_count/false_positive}"
               alt="High"/>
        </xsl:when>
        <xsl:when test="result_count/warning &gt; 0">
          <img src="/img/medium_big.png"
               title="High={result_count/hole} Medium={result_count/warning} Low={result_count/info} FP={result_count/false_positive}"
               alt="Medium"/>
        </xsl:when>
        <xsl:when test="result_count/info &gt; 0">
          <img src="/img/low_big.png"
               title="High={result_count/hole} Medium={result_count/warning} Low={result_count/info} FP={result_count/false_positive}"
               alt="Low"/>
        </xsl:when>
        <xsl:otherwise>
          <img src="/img/none_big.png"
               title="High={result_count/hole} Medium={result_count/warning} Low={result_count/info} FP={result_count/false_positive}"
               alt="None"/>
        </xsl:otherwise>
      </xsl:choose>
    </td>
    <td class="threat_info_table">
      <xsl:value-of select="result_count/hole"/>
    </td>
    <td class="threat_info_table">
      <xsl:value-of select="result_count/warning"/>
    </td>
    <td class="threat_info_table">
      <xsl:value-of select="result_count/info"/>
    </td>
    <td class="threat_info_table">
      <xsl:value-of select="result_count/log"/>
    </td>
    <td class="threat_info_table">
      <xsl:value-of select="result_count/false_positive"/>
    </td>
    <td>
      <div id="small_form" style="float:right;">
        <form action="" method="get">
          <input type="hidden" name="report_id" value="{@id}"/>
          <input type="hidden" name="cmd" value="get_report"/>
          <input type="hidden" name="notes" value="1"/>
          <input type="hidden" name="overrides" value="1"/>
          <input type="hidden" name="result_hosts_only" value="1"/>
          <input type="hidden" name="levels" value="hmlg"/>
          <select name="report_format_id"
                  title="Download Format">
            <xsl:for-each select="../../../../get_report_formats_response/report_format[active=1]">
              <xsl:choose>
                <xsl:when test="@id='1a60a67e-97d0-4cbf-bc77-f71b08e7043d'">
                  <option value="{@id}" selected="1"><xsl:value-of select="name"/></option>
                </xsl:when>
                <xsl:otherwise>
                  <option value="{@id}"><xsl:value-of select="name"/></option>
                </xsl:otherwise>
              </xsl:choose>
            </xsl:for-each>
          </select>
          <input type="image"
                 name="submit"
                 value="Download"
                 title="Download"
                 src="/img/download.png"
                 border="0"
                 style="margin-left:3px;"
                 alt="Download"/>
        </form>
      </div>
    </td>
    <td>
      <a href="/omp?cmd=get_report&amp;report_id={@id}&amp;notes=1&amp;overrides=1&amp;result_hosts_only=1"
         title="Details"
         style="margin-left:3px;">
        <img src="/img/details.png" border="0" alt="Details"/>
      </a>
      <xsl:choose>
        <xsl:when test="scan_run_status='Running' or scan_run_status='Requested' or scan_run_status='Pause Requested' or scan_run_status='Stop Requested' or scan_run_status='Resume Requested' or scan_run_status='Paused'">
          <img src="/img/delete_inactive.png"
               border="0"
               alt="Delete"
               style="margin-left:3px;"/>
        </xsl:when>
        <xsl:otherwise>
          <a href="/omp?cmd=delete_report&amp;report_id={@id}&amp;task_id={../../@id}"
             title="Delete"
             style="margin-left:3px;">
            <img src="/img/delete.png" border="0" alt="Delete"/>
          </a>
        </xsl:otherwise>
      </xsl:choose>
    </td>
  </tr>
</xsl:template>

<!-- LAST_REPORT -->
<xsl:template match="last_report">
  <xsl:choose>
    <xsl:when test="report/result_count/hole &gt; 0">
      <img src="/img/high_big.png"
           title="High={report/result_count/hole} Medium={report/result_count/warning} Low={report/result_count/info} FP={report/result_count/false_positive}"
           alt="High"/>
    </xsl:when>
    <xsl:when test="report/result_count/warning &gt; 0">
      <img src="/img/medium_big.png"
           title="High={report/result_count/hole} Medium={report/result_count/warning} Low={report/result_count/info} FP={report/result_count/false_positive}"
           alt="Medium"/>
    </xsl:when>
    <xsl:when test="report/result_count/info &gt; 0">
      <img src="/img/low_big.png"
           title="High={report/result_count/hole} Medium={report/result_count/warning} Low={report/result_count/info} FP={report/result_count/false_positive}"
           alt="Low"/>
    </xsl:when>
    <xsl:otherwise>
      <xsl:choose>
        <xsl:when test="../status!='Running'">
          <img src="/img/none_big.png"
               title="High={report/result_count/hole} Medium={report/result_count/warning} Low={report/result_count/info} FP={report/result_count/false_positive}"
               alt="None"/>
        </xsl:when>
      </xsl:choose>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template name="html-edit-task-form">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">Edit Task
      <a href="/help/tasks.html#edit_task" title="Help: Edit Task">
        <img src="/img/help.png"/>
      </a>
    </div>
    <div class="gb_window_part_content">
      <form action="" method="get">
        <input type="hidden" name="cmd" value="save_task"/>
        <input type="hidden"
               name="task_id"
               value="{commands_response/get_tasks_response/task/@id}"/>
        <input type="hidden"
               name="refresh_interval"
               value="{refresh_interval}"/>
        <input type="hidden" name="next" value="{next}"/>
        <input type="hidden" name="sort_field" value="{sort_field}"/>
        <input type="hidden" name="sort_order" value="{sort_order}"/>
        <input type="hidden" name="overrides" value="{apply_overrides}"/>
        <table border="0" cellspacing="0" cellpadding="3" width="100%">
          <tr>
           <td valign="top" width="165">Name</td>
           <td>
             <input type="text"
                    name="name"
                    value="{commands_response/get_tasks_response/task/name}"
                    size="30"
                    maxlength="80"/>
           </td>
          </tr>
          <tr>
            <td valign="top">Comment (optional)</td>
            <td>
              <input type="text" name="comment" size="30" maxlength="400"
                     value="{commands_response/get_tasks_response/task/comment}"/>
            </td>
          </tr>
          <tr>
            <td valign="top">Scan Config (immutable)</td>
            <td>
              <select name="scanconfig" disabled="1">
                <xsl:choose>
                  <xsl:when
                    test="string-length (commands_response/get_tasks_response/task/config/name) &gt; 0">
                    <xsl:apply-templates
                      select="commands_response/get_tasks_response/task/config"
                      mode="newtask"/>
                  </xsl:when>
                  <xsl:otherwise>
                    <option value="--">--</option>
                  </xsl:otherwise>
                </xsl:choose>
              </select>
            </td>
          </tr>
          <tr>
            <td>Scan Targets (immutable)</td>
            <td>
              <select name="target_id" disabled="1">
                <xsl:choose>
                  <xsl:when
                    test="string-length (commands_response/get_tasks_response/task/target/name) &gt; 0">
                    <xsl:apply-templates
                      select="commands_response/get_tasks_response/task/target"
                      mode="newtask"/>
                  </xsl:when>
                  <xsl:otherwise>
                    <option value="--">--</option>
                  </xsl:otherwise>
                </xsl:choose>
              </select>
            </td>
          </tr>
          <tr>
            <td>Escalator (optional)</td>
            <td>
              <select name="escalator_id">
                <xsl:variable name="escalator_id">
                  <xsl:value-of select="commands_response/get_tasks_response/task/escalator/@id"/>
                </xsl:variable>
                <xsl:choose>
                  <xsl:when test="string-length ($escalator_id) &gt; 0">
                    <option value="0">--</option>
                  </xsl:when>
                  <xsl:otherwise>
                    <option value="0" selected="1">--</option>
                  </xsl:otherwise>
                </xsl:choose>
                <xsl:for-each select="commands_response/get_escalators_response/escalator">
                  <xsl:choose>
                    <xsl:when test="@id = $escalator_id">
                      <option value="{@id}" selected="1"><xsl:value-of select="name"/></option>
                    </xsl:when>
                    <xsl:otherwise>
                      <option value="{@id}"><xsl:value-of select="name"/></option>
                    </xsl:otherwise>
                  </xsl:choose>
                </xsl:for-each>
              </select>
            </td>
          </tr>
          <tr>
            <td>Schedule (optional)</td>
            <td>
              <select name="schedule_id">
                <xsl:variable name="schedule_id">
                  <xsl:value-of select="commands_response/get_tasks_response/task/schedule/@id"/>
                </xsl:variable>
                <xsl:choose>
                  <xsl:when test="string-length ($schedule_id) &gt; 0">
                    <option value="0">--</option>
                  </xsl:when>
                  <xsl:otherwise>
                    <option value="0" selected="1">--</option>
                  </xsl:otherwise>
                </xsl:choose>
                <xsl:for-each select="commands_response/get_schedules_response/schedule">
                  <xsl:choose>
                    <xsl:when test="@id = $schedule_id">
                      <option value="{@id}" selected="1"><xsl:value-of select="name"/></option>
                    </xsl:when>
                    <xsl:otherwise>
                      <option value="{@id}"><xsl:value-of select="name"/></option>
                    </xsl:otherwise>
                  </xsl:choose>
                </xsl:for-each>
              </select>
            </td>
          </tr>
          <tr>
            <td>Slave (optional)</td>
            <td>
              <select name="slave_id">
                <xsl:variable name="slave_id">
                  <xsl:value-of select="commands_response/get_tasks_response/task/slave/@id"/>
                </xsl:variable>
                <xsl:choose>
                  <xsl:when test="string-length ($slave_id) &gt; 0">
                    <option value="0">--</option>
                  </xsl:when>
                  <xsl:otherwise>
                    <option value="0" selected="1">--</option>
                  </xsl:otherwise>
                </xsl:choose>
                <xsl:for-each select="commands_response/get_slaves_response/slave">
                  <xsl:choose>
                    <xsl:when test="@id = $slave_id">
                      <option value="{@id}" selected="1"><xsl:value-of select="name"/></option>
                    </xsl:when>
                    <xsl:otherwise>
                      <option value="{@id}"><xsl:value-of select="name"/></option>
                    </xsl:otherwise>
                  </xsl:choose>
                </xsl:for-each>
              </select>
            </td>
          </tr>
          <tr>
            <td colspan="2" style="text-align:right;">
              <input type="submit" name="submit" value="Save Task"/>
            </td>
          </tr>
        </table>
        <br/>
      </form>
    </div>
  </div>
</xsl:template>

<xsl:template match="edit_task">
  <xsl:apply-templates select="gsad_msg"/>
  <xsl:call-template name="html-edit-task-form"/>
</xsl:template>

<xsl:template match="modify_task_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">Save Task</xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<!-- TASK -->

<xsl:template match="task">
  <xsl:choose>
    <xsl:when test="report">
      <xsl:variable name="class">
        <xsl:choose>
          <xsl:when test="position() mod 2 = 0">even</xsl:when>
          <xsl:otherwise>odd</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>
      <xsl:apply-templates select="report"/>
    </xsl:when>
    <xsl:otherwise>
      <xsl:variable name="class">
        <xsl:choose>
          <xsl:when test="position() mod 2 = 0">even</xsl:when>
          <xsl:otherwise>odd</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>
      <tr class="{$class}">
        <td>
          <b><xsl:value-of select="name"/></b>
          <xsl:choose>
            <xsl:when test="comment != ''">
              <br/>(<xsl:value-of select="comment"/>)
            </xsl:when>
            <xsl:otherwise></xsl:otherwise>
          </xsl:choose>
        </td>
        <td>
          <xsl:call-template name="status_bar">
            <xsl:with-param name="status">
              <xsl:value-of select="status"/>
            </xsl:with-param>
            <xsl:with-param name="progress">
              <xsl:value-of select="progress/text()"/>
            </xsl:with-param>
          </xsl:call-template>
        </td>
        <td style="text-align:right;font-size:10px;">
          <xsl:choose>
            <xsl:when test="report_count &gt; 0">
              <a href="/omp?cmd=get_tasks&amp;task_id={@id}&amp;overrides={../apply_overrides}">
                <xsl:value-of select="report_count/finished"/>
              </a>
            </xsl:when>
            <xsl:otherwise>
            </xsl:otherwise>
          </xsl:choose>
        </td>
        <td style="font-size:10px;">
          <xsl:choose>
            <xsl:when test="last_report/report/@id = first_report/report/@id">
            </xsl:when>
            <xsl:otherwise>
              <a href="/omp?cmd=get_report&amp;report_id={first_report/report/@id}&amp;notes=1&amp;overrides={../apply_overrides}&amp;result_hosts_only=1">
                <xsl:call-template name="short_timestamp_first"/>
              </a>
            </xsl:otherwise>
          </xsl:choose>
        </td>
        <td style="font-size:10px;">
          <a href="/omp?cmd=get_report&amp;report_id={last_report/report/@id}&amp;notes=1&amp;overrides={../apply_overrides}&amp;result_hosts_only=1">
            <xsl:call-template name="short_timestamp_last"/>
          </a>
        </td>
        <td style="text-align:center;">
          <xsl:choose>
            <xsl:when test="last_report">
              <xsl:apply-templates select="last_report"/>
            </xsl:when>
          </xsl:choose>
        </td>
        <td style="text-align:center;">
          <!-- Trend -->
          <xsl:call-template name="trend_meter"/>
        </td>
        <td>
          <xsl:choose>
            <xsl:when test="string-length(schedule/@id) &gt; 0">
              <a href="/omp?cmd=get_schedule&amp;schedule_id={schedule/@id}"
                 title="Schedule Details">
                <img src="/img/scheduled.png" border="0" alt="Schedule Details"/>
              </a>
            </xsl:when>
            <xsl:when test="status='Running'">
              <a href="/omp?cmd=pause_task&amp;task_id={@id}&amp;overrides={../apply_overrides}&amp;next=get_tasks"
                 title="Pause Task">
                <img src="/img/pause.png" border="0" alt="Pause"/>
              </a>
            </xsl:when>
            <xsl:when test="status='Stop Requested' or status='Delete Requested' or status='Pause Requested' or status = 'Paused' or status='Resume Requested' or status='Requested'">
              <img src="/img/start_inactive.png" border="0" alt="Start"/>
            </xsl:when>
            <xsl:otherwise>
              <a href="/omp?cmd=start_task&amp;task_id={@id}&amp;overrides={../apply_overrides}&amp;next=get_tasks"
                 title="Start Task">
                <img src="/img/start.png" border="0" alt="Start"/>
              </a>
            </xsl:otherwise>
          </xsl:choose>
          <xsl:choose>
            <xsl:when test="string-length(schedule/@id) &gt; 0">
              <img src="/img/resume_inactive.png" border="0" alt="Resume"
                   style="margin-left:3px;"/>
            </xsl:when>
            <xsl:when test="status='Stopped'">
              <a href="/omp?cmd=resume_stopped_task&amp;task_id={@id}&amp;overrides={../apply_overrides}&amp;next=get_tasks"
                 title="Resume Task">
                <img src="/img/resume.png"
                     border="0"
                     alt="Resume"
                     style="margin-left:3px;"/>
              </a>
            </xsl:when>
            <xsl:when test="status='Paused'">
              <a href="/omp?cmd=resume_paused_task&amp;task_id={@id}&amp;overrides={../apply_overrides}&amp;next=get_tasks"
                 title="Resume Task">
                <img src="/img/resume.png"
                     border="0"
                     alt="Resume"
                     style="margin-left:3px;"/>
              </a>
            </xsl:when>
            <xsl:otherwise>
              <img src="/img/resume_inactive.png" border="0" alt="Resume"
                   style="margin-left:3px;"/>
            </xsl:otherwise>
          </xsl:choose>
          <xsl:choose>
            <xsl:when test="string-length(schedule/@id) &gt; 0">
              <img src="/img/stop_inactive.png" border="0"
                   alt="Stop"
                   style="margin-left:3px;"/>
            </xsl:when>
            <xsl:when test="status='New' or status='Requested' or status='Done' or status='Stopped' or status='Internal Error' or status='Pause Requested' or status='Stop Requested' or status='Resume Requested'">
              <img src="/img/stop_inactive.png" border="0"
                   alt="Stop"
                   style="margin-left:3px;"/>
            </xsl:when>
            <xsl:otherwise>
              <a href="/omp?cmd=stop_task&amp;task_id={@id}&amp;overrides={../apply_overrides}&amp;next=get_tasks"
                 title="Stop Task">
                <img src="/img/stop.png"
                     border="0"
                     alt="Stop"
                     style="margin-left:3px;"/>
              </a>
            </xsl:otherwise>
          </xsl:choose>
          <xsl:choose>
            <xsl:when test="status='Running' or status='Requested' or status='Pause Requested' or status='Stop Requested' or status='Resume Requested'">
              <img src="/img/delete_inactive.png"
                   border="0"
                   alt="Delete"
                   style="margin-left:3px;"/>
            </xsl:when>
            <xsl:otherwise>
              <a href="/omp?cmd=delete_task&amp;task_id={@id}&amp;overrides={../apply_overrides}&amp;next=get_tasks"
                 title="Delete Task"
                 style="margin-left:3px;">
                <img src="/img/delete.png"
                     border="0"
                     alt="Delete"/>
              </a>
            </xsl:otherwise>
          </xsl:choose>
          <a href="/omp?cmd=get_tasks&amp;task_id={@id}&amp;overrides={../apply_overrides}"
             title="Details">
            <img src="/img/details.png"
                 border="0"
                 alt="Details"
                 style="margin-left:3px;"/>
          </a>
          <a href="/omp?cmd=edit_task&amp;task_id={@id}&amp;next=get_tasks&amp;refresh_interval={/envelope/autorefresh/@interval}&amp;sort_order={../sort/field/order}&amp;sort_field={../sort/field/text()}&amp;overrides={../apply_overrides}"
             title="Edit Task"
             style="margin-left:3px;">
            <img src="/img/edit.png" border="0" alt="Edit"/>
          </a>
        </td>
      </tr>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<!-- GET_TASKS_RESPONSE -->

<xsl:template match="get_tasks_response">
  <xsl:choose>
    <xsl:when test="substring(@status, 1, 1) = '4' or substring(@status, 1, 1) = '5'">
      <xsl:call-template name="command_result_dialog">
        <xsl:with-param name="operation">Get Tasks</xsl:with-param>
        <xsl:with-param name="status">
          <xsl:value-of select="@status"/>
        </xsl:with-param>
        <xsl:with-param name="msg">
          <xsl:value-of select="@status_text"/>
        </xsl:with-param>
      </xsl:call-template>
    </xsl:when>
    <xsl:when test="task/reports">
      <xsl:call-template name="html-report-table"/>
    </xsl:when>
    <xsl:otherwise>
      <xsl:call-template name="html-task-table"/>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<!-- GET_TASKS -->

<xsl:template match="get_tasks">
  <xsl:apply-templates select="get_tasks_response"/>
  <xsl:apply-templates select="commands_response"/>
</xsl:template>

<!-- BEGIN LSC_CREDENTIALS MANAGEMENT -->

<xsl:template name="html-create-lsc-credential-form">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">
      New Credential for Local Security Checks
      <a href="/help/configure_credentials.html#new_lsc_credential"
         title="Help: Configure Credentials (New Credential)">
        <img src="/img/help.png"/>
      </a>
    </div>
    <div class="gb_window_part_content">
      <form action="/omp" method="post" enctype="multipart/form-data">
        <input type="hidden" name="cmd" value="create_lsc_credential"/>
        <table border="0" cellspacing="0" cellpadding="3" width="100%">
          <tr>
            <td valign="top" width="125">Name</td>
            <td>
              <input type="text" name="name" value="unnamed" size="30"
                     maxlength="80"/>
            </td>
          </tr>
          <tr>
            <td valign="top" width="125">Login</td>
            <td>
              <input type="text" name="credential_login" value="" size="30"
                     maxlength="80"/>
            </td>
          </tr>
          <tr>
            <td valign="top" width="125">Comment (optional)</td>
            <td>
              <input type="text" name="comment" value="" size="30"
                     maxlength="400"/>
            </td>
          </tr>
          <tr>
            <td></td>
            <td>
              <table>
                <tr>
                  <td colspan="2">
                    <input type="radio" name="base" value="gen"/>
                    Autogenerate credential
                  </td>
                </tr>
                <tr>
                  <td>
                    <input type="radio" name="base" value="pass" checked="1"/>
                    Password
                  </td>
                  <td>
                    <input type="password" name="password" value="" size="30"
                           maxlength="40"/>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td colspan="2" style="text-align:right;">
              <input type="submit" name="submit" value="Create Credential"/>
            </td>
          </tr>
        </table>
      </form>
    </div>
  </div>
</xsl:template>

<xsl:template name="html-lsc-credentials-table">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">
      Credentials for Local Security Checks
      <a href="/help/configure_credentials.html#credentials"
         title="Help: Configure Credentials (Credentials)">
        <img src="/img/help.png"/>
      </a>
    </div>
    <div class="gb_window_part_content_no_pad">
      <div id="tasks">
        <table class="gbntable" cellspacing="2" cellpadding="4" border="0">
          <tr class="gbntablehead2">
            <td>Name</td>
            <td>Login</td>
            <td>Comment</td>
            <td width="135">Actions</td>
          </tr>
          <xsl:apply-templates select="lsc_credential"/>
        </table>
      </div>
    </div>
  </div>
</xsl:template>

<!--     CREATE_LSC_CREDENTIAL_RESPONSE -->

<xsl:template match="create_lsc_credential_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">Create Credential</xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<!--     DELETE_LSC_CREDENTIAL_RESPONSE -->

<xsl:template match="delete_lsc_credential_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">
      Delete Credential
    </xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<!--     EDITING LSC CREDENTIALS -->

<xsl:template name="html-edit-lsc-credential-form">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">Edit Credential
      <a href="/help/lsc_credentials.html#edit_lsc_credential"
         title="Help: Edit Credential">
        <img src="/img/help.png"/>
      </a>
    </div>
    <div class="gb_window_part_content">
      <form action="" method="post">
        <input type="hidden" name="cmd" value="save_lsc_credential"/>
        <input type="hidden"
               name="lsc_credential_id"
               value="{commands_response/get_lsc_credentials_response/lsc_credential/@id}"/>
        <input type="hidden" name="next" value="{next}"/>
        <input type="hidden" name="sort_field" value="{sort_field}"/>
        <input type="hidden" name="sort_order" value="{sort_order}"/>
        <table border="0" cellspacing="0" cellpadding="3" width="100%">
          <tr>
            <td valign="top" width="165">Name</td>
            <td>
              <input type="text"
                     name="name"
                     value="{commands_response/get_lsc_credentials_response/lsc_credential/name}"
                     size="30"
                     maxlength="80"/>
            </td>
          </tr>
          <tr>
            <td valign="top">Comment</td>
            <td>
              <input type="text" name="comment" size="30" maxlength="400"
                     value="{commands_response/get_lsc_credentials_response/lsc_credential/comment}"/>
            </td>
          </tr>
          <tr>
            <td valign="top">Login</td>
            <td>
              <xsl:choose>
                <xsl:when test="commands_response/get_lsc_credentials_response/lsc_credential/type = 'gen'">
                  <input type="text" name="credential_login_off" size="30" maxlength="400"
                         disabled="1"
                         value="{commands_response/get_lsc_credentials_response/lsc_credential/login}"/>
                </xsl:when>
                <xsl:otherwise>
                  <input type="text" name="credential_login" size="30" maxlength="400"
                         value="{commands_response/get_lsc_credentials_response/lsc_credential/login}"/>
                </xsl:otherwise>
              </xsl:choose>
            </td>
          </tr>
          <tr>
            <td valign="top">Password</td>
            <td>
              <xsl:choose>
                <xsl:when test="commands_response/get_lsc_credentials_response/lsc_credential/type = 'gen'">
                  <input type="checkbox" name="enable_off" value="yes"
                         disabled="1"/>
                  Replace existing value with:
                  <br/>
                  <input type="text" name="login" size="30" maxlength="400"
                         disabled="1" value=""/>
                </xsl:when>
                <xsl:otherwise>
                  <input type="checkbox" name="enable" value="yes"/>
                  Replace existing value with:
                  <br/>
                  <input type="password" name="password" size="30" maxlength="400"
                         value=""/>
                </xsl:otherwise>
              </xsl:choose>
            </td>
          </tr>
          <tr>
            <td colspan="2" style="text-align:right;">
              <input type="submit" name="submit" value="Save Credential"/>
            </td>
          </tr>
        </table>
        <br/>
      </form>
    </div>
  </div>
</xsl:template>

<xsl:template match="edit_lsc_credential">
  <xsl:apply-templates select="gsad_msg"/>
  <xsl:call-template name="html-edit-lsc-credential-form"/>
</xsl:template>

<xsl:template match="modify_lsc_credential_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">Save Credential</xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<!--     LSC_CREDENTIAL -->

<xsl:template match="lsc_credential">
  <xsl:variable name="class">
    <xsl:choose>
      <xsl:when test="position() mod 2 = 0">even</xsl:when>
      <xsl:otherwise>odd</xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <tr class="{$class}">
    <td>
      <b><xsl:value-of select="name"/></b>
    </td>
    <td>
      <xsl:value-of select="login"/>
    </td>
    <td>
      <xsl:value-of select="comment"/>
    </td>
    <td>
      <xsl:choose>
        <xsl:when test="in_use='0'">
          <a href="/omp?cmd=delete_lsc_credential&amp;lsc_credential_id={@id}"
             title="Delete Credential" style="margin-left:3px;">
            <img src="/img/delete.png" border="0" alt="Delete"/>
          </a>
        </xsl:when>
        <xsl:otherwise>
          <img src="/img/delete_inactive.png" border="0" alt="Delete"
               style="margin-left:3px;"/>
        </xsl:otherwise>
      </xsl:choose>
      <a href="/omp?cmd=get_lsc_credential&amp;lsc_credential_id={@id}"
         title="Credential Details" style="margin-left:3px;">
        <img src="/img/details.png" border="0" alt="Details"/>
      </a>
      <a href="/omp?cmd=edit_lsc_credential&amp;lsc_credential_id={@id}&amp;next=get_lsc_credentials"
         title="Edit Credential" style="margin-left:3px;">
        <img src="/img/edit.png" border="0" alt="Edit"/>
      </a>
      <xsl:if test="type='gen'">
        <a href="/omp?cmd=get_lsc_credentials&amp;lsc_credential_id={@id}&amp;package_format=rpm"
           title="Download RPM package" style="margin-left:3px;">
          <img src="/img/rpm.png" border="0" alt="Download RPM"/>
        </a>
        <a href="/omp?cmd=get_lsc_credentials&amp;lsc_credential_id={@id}&amp;package_format=deb"
           title="Download Debian package" style="margin-left:3px;">
          <img src="/img/deb.png" border="0" alt="Download Deb"/>
        </a>
        <a href="/omp?cmd=get_lsc_credentials&amp;lsc_credential_id={@id}&amp;package_format=exe"
           title="Download Exe package" style="margin-left:3px;">
          <img src="/img/exe.png" border="0" alt="Download Exe"/>
        </a>
        <a href="/omp?cmd=get_lsc_credentials&amp;lsc_credential_id={@id}&amp;package_format=key"
           title="Download Public Key" style="margin-left:3px;">
          <img src="/img/key.png" border="0" alt="Download Public Key"/>
        </a>
      </xsl:if>
    </td>
  </tr>
</xsl:template>

<xsl:template match="lsc_credential" mode="details">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">
      Credential Details
      <a href="/help/configure_credentials.html#credentialdetails"
         title="Help: Configure Agents (Credential Details)">
        <img src="/img/help.png"/>
      </a>
      <a href="/omp?cmd=edit_lsc_credential&amp;lsc_credential_id={@id}&amp;next=get_lsc_credential&amp;sort_order=ascending&amp;sort_field=name"
         title="Edit Credential"
         style="margin-left:3px;">
        <img src="/img/edit.png"/>
      </a>
    </div>
    <div class="gb_window_part_content">
      <div class="float_right">
        <a href="?cmd=get_lsc_credentials">Back to Credentials</a>
      </div>
      <table>
        <tr>
          <td><b>Name:</b></td>
          <td><b><xsl:value-of select="name"/></b></td>
        </tr>
        <tr>
          <td>Comment:</td>
          <td><xsl:value-of select="comment"/></td>
        </tr>
        <tr>
          <td>Login:</td>
          <td><xsl:value-of select="login"/></td>
        </tr>
      </table>

      <xsl:choose>
        <xsl:when test="count(targets/target) = 0">
          <h1>Targets using this Credential: None</h1>
        </xsl:when>
        <xsl:otherwise>
          <h1>Targets using this Credential</h1>
          <table class="gbntable" cellspacing="2" cellpadding="4">
            <tr class="gbntablehead2">
              <td>Name</td>
              <td>Actions</td>
            </tr>
            <xsl:for-each select="targets/target">
              <xsl:variable name="class">
                <xsl:choose>
                  <xsl:when test="position() mod 2 = 0">even</xsl:when>
                  <xsl:otherwise>odd</xsl:otherwise>
                </xsl:choose>
              </xsl:variable>
              <tr class="{$class}">
                <td><xsl:value-of select="name"/></td>
                <td width="100">
                  <a href="/omp?cmd=get_target&amp;target_id={@id}"
                     title="Target Details">
                    <img src="/img/details.png"
                         border="0"
                         alt="Details"
                         style="margin-left:3px;"/>
                  </a>
                </td>
              </tr>
            </xsl:for-each>
          </table>
        </xsl:otherwise>
      </xsl:choose>
    </div>
  </div>
</xsl:template>

<!--     GET_LSC_CREDENTIAL -->

<xsl:template match="get_lsc_credential">
  <xsl:apply-templates select="gsad_msg"/>
  <xsl:apply-templates select="commands_response/delete_lsc_credential_response"/>
  <xsl:apply-templates select="commands_response/modify_lsc_credential_response"/>
  <xsl:apply-templates select="commands_response/get_lsc_credentials_response/lsc_credential"
                       mode="details"/>
</xsl:template>

<!--     GET_LSC_CREDENTIALS_RESPONSE -->

<xsl:template match="get_lsc_credentials_response">
  <xsl:call-template name="html-create-lsc-credential-form"/>
  <xsl:call-template name="html-lsc-credentials-table"/>
</xsl:template>

<xsl:template match="lsc_credential" mode="select">
  <option value="{@id}"><xsl:value-of select="name"/></option>
</xsl:template>

<xsl:template match="lsc_credentials_response" mode="select">
  <xsl:apply-templates select="lsc_credential" mode="select"/>
</xsl:template>

<!-- END LSC_CREDENTIALS MANAGEMENT -->

<!-- BEGIN AGENTS MANAGEMENT -->

<xsl:template name="html-create-agent-form">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">
      New Agent
      <a href="/help/configure_agents.html#new_agent"
         title="Help: Configure Agents (New Agent)">
        <img src="/img/help.png"/>
      </a>
    </div>
    <div class="gb_window_part_content">
      <form action="/omp" method="post" enctype="multipart/form-data">
        <input type="hidden" name="cmd" value="create_agent"/>
        <table border="0" cellspacing="0" cellpadding="3" width="100%">
          <tr>
            <td valign="top" width="125">Name</td>
            <td>
              <input type="text" name="name" value="unnamed" size="30"
                     maxlength="80"/>
            </td>
          </tr>
          <tr>
            <td valign="top" width="125">Comment (optional)</td>
            <td>
              <input type="text" name="comment" size="30" maxlength="400"/>
            </td>
          </tr>
          <tr>
            <td valign="top" width="125">Installer</td>
            <td><input type="file" name="installer" size="30"/></td>
          </tr>
          <tr>
            <td valign="top" width="125">Installer signature (optional)</td>
            <td><input type="file" name="installer_sig" size="30"/></td>
          </tr>
          <!--
          <tr>
            <td valign="top" width="125">Howto Install</td>
            <td><input type="file" name="howto_install" size="30"/></td>
          </tr>
          <tr>
            <td valign="top" width="125">Howto Use</td>
            <td><input type="file" name="howto_use" size="30"/></td>
          </tr>
          -->
          <tr>
            <td colspan="2" style="text-align:right;">
              <input type="submit" name="submit" value="Create Agent"/>
            </td>
          </tr>
        </table>
      </form>
    </div>
  </div>
</xsl:template>

<xsl:template name="html-agents-table">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">
      Agents
      <a href="/help/configure_agents.html#agents"
         title="Help: Configure Agents (Agents)">
        <img src="/img/help.png"/>
      </a>
    </div>
    <div class="gb_window_part_content_no_pad">
      <div id="tasks">
        <table class="gbntable" cellspacing="2" cellpadding="4" border="0">
          <tr class="gbntablehead2">
            <td>Name</td>
            <td>Comment</td>
            <td>Trust</td>
            <td width="100">Actions</td>
          </tr>
          <xsl:apply-templates select="agent"/>
        </table>
      </div>
    </div>
  </div>
</xsl:template>

<!--     CREATE_AGENT_RESPONSE -->

<xsl:template match="create_agent_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">Create Agent</xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<!--     DELETE_AGENT_RESPONSE -->

<xsl:template match="delete_agent_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">
      Delete Agent
    </xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<!--     AGENT -->

<xsl:template match="agent">
  <xsl:variable name="class">
    <xsl:choose>
      <xsl:when test="position() mod 2 = 0">even</xsl:when>
      <xsl:otherwise>odd</xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <tr class="{$class}">
    <td>
      <b><xsl:value-of select="name"/></b>
    </td>
    <td>
      <xsl:value-of select="comment"/>
    </td>
    <td>
      <xsl:value-of select="installer/trust/text()"/>
      <xsl:choose>
        <xsl:when test="installer/trust/time != ''">
          <br/>(<xsl:value-of select="substring(installer/trust/time,5,6)"/>
                <xsl:value-of select="substring(installer/trust/time,20,5)"/>)
        </xsl:when>
        <xsl:otherwise></xsl:otherwise>
      </xsl:choose>
    </td>
    <td>
      <xsl:choose>
        <xsl:when test="in_use='0'">
          <a href="/omp?cmd=delete_agent&amp;agent_id={@id}"
             title="Delete Agent" style="margin-left:3px;">
            <img src="/img/delete.png" border="0" alt="Delete"/>
          </a>
        </xsl:when>
        <xsl:otherwise>
          <img src="/img/delete_inactive.png" border="0" alt="Delete"
               style="margin-left:3px;"/>
        </xsl:otherwise>
      </xsl:choose>
      <a href="/omp?cmd=get_agents&amp;agent_id={@id}&amp;agent_format=installer"
         title="Download installer package" style="margin-left:3px;">
        <img src="/img/agent.png" border="0" alt="Download Installer"/>
      </a>
      <a href="/omp?cmd=verify_agent&amp;agent_id={@id}"
         title="Verify Agent"
         style="margin-left:3px;">
        <img src="/img/new.png" border="0" alt="Verify Agent"/>
      </a>
    </td>
  </tr>
</xsl:template>

<!--     GET_AGENTS_RESPONSE -->

<xsl:template match="get_agents_response">
  <xsl:call-template name="html-create-agent-form"/>
  <xsl:call-template name="html-agents-table"/>
</xsl:template>

<xsl:template match="agent" mode="select">
  <option value="{name}"><xsl:value-of select="name"/></option>
</xsl:template>

<xsl:template match="agents_response" mode="select">
  <xsl:apply-templates select="agent" mode="select"/>
</xsl:template>

<!-- END AGENTS MANAGEMENT -->

<!-- BEGIN ESCALATORS MANAGEMENT -->

<xsl:template name="html-create-escalator-form">
  <xsl:param name="lsc-credentials"></xsl:param>
  <xsl:param name="report-formats"></xsl:param>
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">New Escalator
      <a href="/help/configure_escalators.html#newescalator"
         title="Help: Configure Escalators (New Escalator)">
        <img src="/img/help.png"/>
      </a>
    </div>
    <div class="gb_window_part_content">
      <form action="/omp" method="post" enctype="multipart/form-data">
        <input type="hidden" name="cmd" value="create_escalator"/>
        <table border="0" cellspacing="0" cellpadding="3" width="100%">
          <tr class="odd">
            <td valign="top" width="125">Name</td>
            <td>
              <input type="text" name="name" value="unnamed" size="30"
                     maxlength="80"/>
            </td>
          </tr>
          <tr class="even">
            <td valign="top" width="125">Comment (optional)</td>
            <td>
              <input type="text" name="comment" size="30" maxlength="400"/>
            </td>
          </tr>
          <tr class="odd">
            <td valign="top" width="125">Event</td>
            <td colspan="2">
              <table border="0" width="100%">
                <tr>
                  <td colspan="2" valign="top">
                    <input type="radio" name="event" value="Task run status changed" checked="1"/>
                    Task run status changed to
                    <select name="event_data:status">
                      <option value="Delete Requested">Delete Requested</option>
                      <option value="Done" selected="1">Done</option>
                      <option value="New">New</option>
                      <option value="Requested">Requested</option>
                      <option value="Running">Running</option>
                      <option value="Stop Requested">Stop Requested</option>
                      <option value="Stopped">Stopped</option>
                    </select>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr class="even">
            <td valign="top" width="125">Condition</td>
            <td colspan="2">
              <table border="0" width="100%">
                <tr>
                  <td colspan="2" valign="top">
                    <input type="radio" name="condition" value="Always" checked="1"/>
                    Always
                  </td>
                </tr>
                <tr>
                  <td colspan="2" valign="top">
                    <input type="radio" name="condition" value="Threat level at least"/>
                    Threat level is at least
                    <select name="condition_data:level">
                      <option value="High" selected="1">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                      <option value="Log">Log</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" valign="top">
                    <input type="radio" name="condition" value="Threat level changed"/>
                    Threat level
                    <select name="condition_data:direction">
                      <option value="changed" selected="1">changed</option>
                      <option value="increased">increased</option>
                      <option value="decreased">decreased</option>
                    </select>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr class="odd">
            <td valign="top" width="125">Method</td>
            <td colspan="2">
              <table border="0" width="100%">
                <tr>
                  <td colspan="3" valign="top">
                    <input type="radio" name="method" value="Email" checked="1"/>
                    Email
                  </td>
                </tr>
                <tr>
                  <td width="45"></td>
                  <td width="100">To Address</td>
                  <td>
                    <input type="text" name="method_data:to_address" size="30" maxlength="301"/>
                  </td>
                </tr>
                <tr>
                  <td width="45"></td>
                  <td width="100">From Address</td>
                  <td>
                    <input type="text" name="method_data:from_address" size="30" maxlength="301"/>
                  </td>
                </tr>
                <tr>
                  <td width="45"></td>
                  <td width="100">Content</td>
                  <td>
                    <table>
                      <tr>
                        <td colspan="3" valign="top">
                          <input type="radio" name="method_data:notice" value="1" checked="1"/>
                          Simple notice
                        </td>
                      </tr>
                      <tr>
                        <td colspan="3" valign="top">
                          <input type="radio" name="method_data:notice" value="0"/>
                          Include report
                          <select name="method_data:notice_report_format">
                            <xsl:for-each select="$report-formats/report_format">
                              <xsl:if test="substring(content_type, 1, 5) = 'text/'">
                                <xsl:choose>
                                  <xsl:when test="@id='19f6f1b3-7128-4433-888c-ccc764fe6ed5'">
                                    <option value="{@id}" selected="1">
                                      <xsl:value-of select="name"/>
                                    </option>
                                  </xsl:when>
                                  <xsl:otherwise>
                                    <option value="{@id}">
                                      <xsl:value-of select="name"/>
                                    </option>
                                  </xsl:otherwise>
                                </xsl:choose>
                              </xsl:if>
                            </xsl:for-each>
                          </select>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr class="odd">
            <td valign="top" width="125"></td>
            <td colspan="2">
              <table border="0" width="100%">
                <tr>
                  <td colspan="3" valign="top">
                    <input type="radio" name="method" value="syslog syslog"/>
                    System Logger (Syslog)
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr class="odd">
            <td valign="top" width="125"></td>
            <td colspan="2">
              <table border="0" width="100%">
                <tr>
                  <td colspan="3" valign="top">
                    <input type="radio" name="method" value="syslog SNMP"/>
                    SNMP
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr class="odd">
            <td valign="top" width="125"></td>
            <td colspan="2">
              <table border="0" width="100%">
                <tr>
                  <td colspan="3" valign="top">
                    <input type="radio" name="method" value="HTTP Get"/>
                    HTTP Get
                  </td>
                </tr>
                <tr>
                  <td width="45"></td>
                  <td width="100">URL</td>
                  <td>
                    <input type="text" name="method_data:URL" size="30" maxlength="301"/>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr class="even">
            <td colspan="2" style="text-align:right;">
              <input type="submit" name="submit" value="Create Escalator"/>
            </td>
          </tr>
        </table>
      </form>
    </div>
  </div>
</xsl:template>

<xsl:template name="html-escalators-table">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">Escalators
      <a href="/help/configure_escalators.html#escalators"
         title="Help: Configure Escalators (Escalators)">
        <img src="/img/help.png"/>
      </a>
    </div>
    <div class="gb_window_part_content_no_pad">
      <div id="tasks">
        <table class="gbntable" cellspacing="2" cellpadding="4" border="0">
          <tr class="gbntablehead2">
            <td>Name</td>
            <td>Event</td>
            <td>Condition</td>
            <td>Method</td>
            <td width="100">Actions</td>
          </tr>
          <xsl:apply-templates select="escalator"/>
        </table>
      </div>
    </div>
  </div>
</xsl:template>

<!--     CREATE_ESCALATOR_RESPONSE -->

<xsl:template match="create_escalator_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">Create Escalator</xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<!--     DELETE_ESCALATOR_RESPONSE -->

<xsl:template match="delete_escalator_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">
      Delete Escalator
    </xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<!--     TEST_ESCALATOR_RESPONSE -->

<xsl:template match="test_escalator_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">Test Escalator</xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<!--     ESCALATOR -->

<xsl:template match="escalator">
  <xsl:variable name="class">
    <xsl:choose>
      <xsl:when test="position() mod 2 = 0">even</xsl:when>
      <xsl:otherwise>odd</xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <tr class="{$class}">
    <td>
      <b><xsl:value-of select="name"/></b>
      <xsl:choose>
        <xsl:when test="comment != ''">
          <br/>(<xsl:value-of select="comment"/>)
        </xsl:when>
        <xsl:otherwise></xsl:otherwise>
      </xsl:choose>
    </td>
    <td>
      <xsl:value-of select="event/text()"/>
      <xsl:choose>
        <xsl:when test="event/text()='Task run status changed' and string-length(event/data[name='status']/text()) &gt; 0">
          <br/>(to <xsl:value-of select=" event/data[name='status']/text()"/>)
        </xsl:when>
      </xsl:choose>
    </td>
    <td>
      <xsl:value-of select="condition/text()"/>
      <xsl:choose>
        <xsl:when test="condition/text()='Threat level at least' and string-length(condition/data[name='level']/text()) &gt; 0">
          <br/>(<xsl:value-of select="condition/data[name='level']/text()"/>)
        </xsl:when>
        <xsl:when test="condition/text()='Threat level changed' and string-length(condition/data[name='direction']/text()) &gt; 0">
          <br/>(<xsl:value-of select="condition/data[name='direction']/text()"/>)
        </xsl:when>
      </xsl:choose>
    </td>
    <td>
      <xsl:choose>
        <xsl:when test="method/text()='Syslog' and method/data[name='submethod']/text() = 'SNMP'">
          SNMP
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="method/text()"/>
          <xsl:choose>
            <xsl:when test="method/text()='Email' and string-length(method/data[name='to_address']/text()) &gt; 0">
              <br/>(To <xsl:value-of select="method/data[name='to_address']/text()"/>)
            </xsl:when>
          </xsl:choose>
        </xsl:otherwise>
      </xsl:choose>
    </td>
    <td>
      <xsl:choose>
        <xsl:when test="in_use='0'">
          <a href="/omp?cmd=delete_escalator&amp;escalator_id={@id}"
             title="Delete Escalator" style="margin-left:3px;">
            <img src="/img/delete.png" border="0" alt="Delete"/>
          </a>
        </xsl:when>
        <xsl:otherwise>
          <img src="/img/delete_inactive.png"
               border="0"
               alt="Delete"
               style="margin-left:3px;"/>
        </xsl:otherwise>
      </xsl:choose>
      <a href="/omp?cmd=get_escalator&amp;escalator_id={@id}"
         title="Escalator Details" style="margin-left:3px;">
        <img src="/img/details.png" border="0" alt="Details"/>
      </a>
      <a href="/omp?cmd=test_escalator&amp;escalator_id={@id}"
         title="Test Escalator" style="margin-left:3px;">
        <img src="/img/start.png" border="0" alt="Test"/>
      </a>
    </td>
  </tr>
</xsl:template>

<xsl:template match="escalator" mode="details">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">
      Escalator Details
      <a href="/help/configure_escalators.html#escalatordetails"
         title="Help: Configure Escalators (Escalator Details)">
        <img src="/img/help.png"/>
      </a>
    </div>
    <div class="gb_window_part_content">
      <div class="float_right">
        <a href="?cmd=get_escalators">Back to Escalators</a>
      </div>
      <table>
        <tr>
          <td><b>Name:</b></td>
          <td><b><xsl:value-of select="name"/></b></td>
        </tr>
        <tr>
          <td>Comment:</td>
          <td><xsl:value-of select="comment"/></td>
        </tr>
        <tr>
          <td>Condition:</td>
          <td>
            <xsl:value-of select="condition/text()"/>
            <xsl:choose>
              <xsl:when test="condition/text()='Threat level at least' and string-length(condition/data[name='level']/text()) &gt; 0">
                (<xsl:value-of select="condition/data[name='level']/text()"/>)
              </xsl:when>
              <xsl:when test="condition/text()='Threat level changed' and string-length(condition/data[name='direction']/text()) &gt; 0">
                (<xsl:value-of select="condition/data[name='direction']/text()"/>)
              </xsl:when>
            </xsl:choose>
          </td>
        </tr>
        <tr>
          <td>Event:</td>
          <td>
            <xsl:value-of select="event/text()"/>
            <xsl:choose>
              <xsl:when test="event/text()='Task run status changed' and string-length(event/data[name='status']/text()) &gt; 0">
                (to <xsl:value-of select=" event/data[name='status']/text()"/>)
              </xsl:when>
            </xsl:choose>
          </td>
        </tr>
        <tr>
          <td valign="top">Method:</td>
          <td>
            <table>
              <tr>
                <td colspan="3">
                  <xsl:choose>
                    <xsl:when test="method/text()='Syslog' and method/data[name='submethod']/text() = 'SNMP'">
                      SNMP
                    </xsl:when>
                    <xsl:otherwise>
                      <xsl:value-of select="method/text()"/>
                    </xsl:otherwise>
                  </xsl:choose>
                </td>
              </tr>
              <xsl:choose>
                <xsl:when test="method/text()='Email'">
                  <tr>
                    <td width="45"></td>
                    <td>To address:</td>
                    <td>
                      <xsl:choose>
                        <xsl:when test="string-length(method/data[name='to_address']/text()) &gt; 0">
                          <xsl:value-of select="method/data[name='to_address']/text()"/>
                        </xsl:when>
                      </xsl:choose>
                    </td>
                  </tr>
                  <tr>
                    <td width="45"></td>
                    <td>From address:</td>
                    <td>
                      <xsl:choose>
                        <xsl:when test="string-length(method/data[name='from_address']/text()) &gt; 0">
                          <xsl:value-of select="method/data[name='from_address']/text()"/>
                        </xsl:when>
                      </xsl:choose>
                    </td>
                  </tr>
                  <tr>
                    <td width="45"></td>
                    <td>Content:</td>
                    <td>
                      <xsl:choose>
                        <xsl:when test="method/data[name='notice']/text() = '0'">
                          Include report
                          <xsl:variable name="id"
                                        select="method/data[name='notice_report_format']/text()"/>
                          <xsl:value-of select="../../get_report_formats_response/report_format[@id=$id]/name"/>
                        </xsl:when>
                        <xsl:otherwise>
                          Simple notice
                        </xsl:otherwise>
                      </xsl:choose>
                    </td>
                  </tr>
                </xsl:when>
                <xsl:when test="method/text()='HTTP Get'">
                  <tr>
                    <td width="45"></td>
                    <td>URL:</td>
                    <td>
                      <xsl:choose>
                        <xsl:when test="string-length(method/data[name='URL']/text()) &gt; 0">
                          <xsl:value-of select="method/data[name='URL']/text()"/>
                        </xsl:when>
                      </xsl:choose>
                    </td>
                  </tr>
                </xsl:when>
              </xsl:choose>
            </table>
          </td>
        </tr>
      </table>

      <xsl:choose>
        <xsl:when test="count(tasks/task) = 0">
          <h1>Tasks using this Escalator: None</h1>
        </xsl:when>
        <xsl:otherwise>
          <h1>Tasks using this Escalator</h1>
          <table class="gbntable" cellspacing="2" cellpadding="4">
            <tr class="gbntablehead2">
              <td>Name</td>
              <td>Actions</td>
            </tr>
            <xsl:for-each select="tasks/task">
              <xsl:variable name="class">
                <xsl:choose>
                  <xsl:when test="position() mod 2 = 0">even</xsl:when>
                  <xsl:otherwise>odd</xsl:otherwise>
                </xsl:choose>
              </xsl:variable>
              <tr class="{$class}">
                <td><xsl:value-of select="name"/></td>
                <td width="100">
                  <a href="/omp?cmd=get_tasks&amp;task_id={@id}" title="Details">
                    <img src="/img/details.png"
                         border="0"
                         alt="Details"
                         style="margin-left:3px;"/>
                  </a>
                </td>
              </tr>
            </xsl:for-each>
          </table>
        </xsl:otherwise>
      </xsl:choose>
    </div>
  </div>
</xsl:template>

<!--     GET_ESCALATOR -->

<xsl:template match="get_escalator">
  <xsl:apply-templates select="gsad_msg"/>
  <xsl:apply-templates select="commands_response/delete_escalator_response"/>
  <xsl:apply-templates select="get_escalators_response/escalator" mode="details"/>
</xsl:template>

<!--     GET_ESCALATORS_RESPONSE -->

<xsl:template match="get_escalators">
  <xsl:apply-templates select="gsad_msg"/>
  <xsl:apply-templates select="commands_response/delete_escalator_response"/>
  <xsl:apply-templates select="create_escalator_response"/>
  <xsl:apply-templates select="test_escalator_response"/>
  <xsl:call-template name="html-create-escalator-form">
    <xsl:with-param
      name="lsc-credentials"
      select="get_lsc_credentials_response | commands_response/get_lsc_credentials_response"/>
    <xsl:with-param
      name="report-formats"
      select="get_report_formats_response | commands_response/get_report_formats_response"/>
  </xsl:call-template>
  <!-- The for-each makes the get_escalators_response the current node. -->
  <xsl:for-each select="get_escalators_response | commands_response/get_escalators_response">
    <xsl:call-template name="html-escalators-table"/>
  </xsl:for-each>
</xsl:template>

<!-- END ESCALATORS MANAGEMENT -->

<!-- BEGIN TARGET LOCATORS MANAGEMENT -->

<xsl:template match="target_locator" mode="select">
  <option value="{name}"><xsl:value-of select="name"/></option>
</xsl:template>

<!-- END TARGET LOCATORS MANAGEMENT -->

<!-- BEGIN TARGETS MANAGEMENT -->

<xsl:template name="html-create-target-form">
  <xsl:param name="lsc-credentials"></xsl:param>
  <xsl:param name="target-sources"></xsl:param>
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">New Target
      <a href="/help/configure_targets.html#newtarget"
         title="Help: Configure Targets (New Target)">
        <img src="/img/help.png"/>
      </a>
    </div>
    <div class="gb_window_part_content">
      <form action="/omp" method="post" enctype="multipart/form-data">
        <input type="hidden" name="cmd" value="create_target"/>
        <table border="0" cellspacing="0" cellpadding="3" width="100%">
          <tr>
            <td valign="top" width="125">Name
            </td>
            <td>
              <input type="text" name="name" value="unnamed" size="30"
                     maxlength="80"/>
            </td>
          </tr>
          <tr>
          <td valign="top" width="125">Hosts</td>
          <xsl:choose>
            <xsl:when test="not ($target-sources/target_locator)">
              <!-- No target locator(s) given. -->
              <td>
                <input type="hidden" name="target_source" value="manual"/>
                <input type="text" name="hosts" value="localhost" size="30"
                        maxlength="2000"/>
              </td>
            </xsl:when>
            <xsl:otherwise>
              <!-- Target locator(s) given. -->
              <td>
               <xsl:value-of select="$target-sources"/>
                <table>
                  <tr>
                    <td>
                      <input type="radio" name="target_source" value="manual"
                             checked="1"/>
                      Manual
                    </td>
                    <td>
                      <input type="text" name="hosts" value="localhost" size="30"
                             maxlength="80"/>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <input type="radio" name="target_source" value="import"/>
                      Import
                    </td>
                    <td>
                      <select name="target_locator">
                        <option value="--">--</option>
                        <xsl:apply-templates select="$target-sources" mode="select"/>
                      </select>
                    </td>
                  </tr>
                  <tr>
                    <td></td>
                    <td>
                      Import Authentication
                    </td>
                  </tr>
                  <tr>
                    <td></td>
                    <td>
                      <table>
                      <tr>
                        <td>Username</td>
                        <td>
                          <input type="text" name="login" value="" size="15"
                                maxlength="80"/>
                        </td>
                      </tr>
                      <tr>
                        <td>Password</td>
                        <td>
                          <input type="password" name="password" value="" size="15"
                                maxlength="80"/>
                        </td>
                      </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </xsl:otherwise>
          </xsl:choose>
          </tr>
          <tr>
            <td valign="top" width="125">Comment (optional)</td>
            <td>
              <input type="text" name="comment" size="30" maxlength="400"/>
            </td>
          </tr>
          <tr>
            <td valign="top" width="125">Credential (optional)</td>
            <td>
              <select name="lsc_credential_id">
                <option value="--">--</option>
                <xsl:apply-templates select="$lsc-credentials" mode="select"/>
              </select>
            </td>
          </tr>
          <tr>
            <td colspan="2" style="text-align:right;">
              <input type="submit" name="submit" value="Create Target"/>
            </td>
          </tr>
        </table>
      </form>
    </div>
  </div>
</xsl:template>

<xsl:template name="html-targets-table">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">Targets
      <a href="/help/configure_targets.html#targets"
         title="Help: Configure Targets (Targets)">
        <img src="/img/help.png"/>
      </a>
    </div>
    <div class="gb_window_part_content_no_pad">
      <div id="tasks">
        <table class="gbntable" cellspacing="2" cellpadding="4" border="0">
          <tr class="gbntablehead2">
            <td>Name</td>
            <td>Hosts</td>
            <td>IPs</td>
            <td>Credential</td>
            <td width="100">Actions</td>
          </tr>
          <xsl:apply-templates select="target"/>
        </table>
      </div>
    </div>
  </div>
</xsl:template>

<!--     CREATE_TARGET_RESPONSE -->

<xsl:template match="create_target_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">Create Target</xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<!--     DELETE_TARGET_RESPONSE -->

<xsl:template match="delete_target_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">
      Delete Target
    </xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<!--     TARGET -->

<xsl:template match="target">
  <xsl:variable name="class">
    <xsl:choose>
      <xsl:when test="position() mod 2 = 0">even</xsl:when>
      <xsl:otherwise>odd</xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <tr class="{$class}">
    <td>
      <b><xsl:value-of select="name"/></b>
      <xsl:choose>
        <xsl:when test="comment != ''">
          <br/>(<xsl:value-of select="comment"/>)
        </xsl:when>
        <xsl:otherwise></xsl:otherwise>
      </xsl:choose>
    </td>
    <td><xsl:value-of select="hosts"/></td>
    <td><xsl:value-of select="max_hosts"/></td>
    <td>
      <a href="/omp?cmd=get_lsc_credential&amp;lsc_credential_id={lsc_credential/@id}">
        <xsl:value-of select="lsc_credential/name"/>
      </a>
    </td>
    <td>
      <xsl:choose>
        <xsl:when test="in_use='0'">
          <a href="/omp?cmd=delete_target&amp;target_id={@id}"
             title="Delete Target" style="margin-left:3px;">
            <img src="/img/delete.png" border="0" alt="Delete"/>
          </a>
        </xsl:when>
        <xsl:otherwise>
          <img src="/img/delete_inactive.png"
               border="0"
               alt="Delete"
               style="margin-left:3px;"/>
        </xsl:otherwise>
      </xsl:choose>
      <a href="/omp?cmd=get_target&amp;target_id={@id}"
         title="Target Details" style="margin-left:3px;">
        <img src="/img/details.png" border="0" alt="Details"/>
      </a>
    </td>
  </tr>
</xsl:template>

<xsl:template match="target" mode="details">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">
       Target Details
       <a href="/help/configure_targets.html#targetdetails"
         title="Help: Configure Targets (Target Details)">
         <img src="/img/help.png"/>
       </a>
    </div>
    <div class="gb_window_part_content">
      <div class="float_right">
        <a href="?cmd=get_targets">Back to Targets</a>
      </div>
      <table>
        <tr>
          <td><b>Name:</b></td>
          <td><b><xsl:value-of select="name"/></b></td>
        </tr>
        <tr>
          <td>Comment:</td>
          <td><xsl:value-of select="comment"/></td>
        </tr>
        <tr>
          <td>Hosts:</td>
          <td><xsl:value-of select="hosts"/></td>
        </tr>
        <tr>
          <td>Maximum number of hosts:</td>
          <td><xsl:value-of select="max_hosts"/></td>
        </tr>
        <tr>
          <td>Credential:</td>
          <td>
            <a href="/omp?cmd=get_lsc_credential&amp;lsc_credential_id={lsc_credential/@id}">
              <xsl:value-of select="lsc_credential/name"/>
            </a>
          </td>
        </tr>
      </table>

      <xsl:choose>
        <xsl:when test="count(tasks/task) = 0">
          <h1>Tasks using this Target: None</h1>
        </xsl:when>
        <xsl:otherwise>
          <h1>Tasks using this Target</h1>
          <table class="gbntable" cellspacing="2" cellpadding="4">
            <tr class="gbntablehead2">
              <td>Name</td>
              <td>Actions</td>
            </tr>
            <xsl:for-each select="tasks/task">
              <xsl:variable name="class">
                <xsl:choose>
                  <xsl:when test="position() mod 2 = 0">even</xsl:when>
                  <xsl:otherwise>odd</xsl:otherwise>
                </xsl:choose>
              </xsl:variable>
              <tr class="{$class}">
                <td><xsl:value-of select="name"/></td>
                <td width="100">
                  <a href="/omp?cmd=get_tasks&amp;task_id={@id}" title="Details">
                    <img src="/img/details.png"
                         border="0"
                         alt="Details"
                         style="margin-left:3px;"/>
                  </a>
                </td>
              </tr>
            </xsl:for-each>
          </table>
        </xsl:otherwise>
      </xsl:choose>
    </div>
  </div>
</xsl:template>

<!--     GET_TARGET -->

<xsl:template match="get_target">
  <xsl:apply-templates select="gsad_msg"/>
  <xsl:apply-templates select="commands_response/delete_target_response"/>
  <xsl:apply-templates select="get_targets_response/target" mode="details"/>
</xsl:template>

<!--     GET_TARGETS -->

<xsl:template match="get_targets">
  <xsl:apply-templates select="gsad_msg"/>
  <xsl:apply-templates select="commands_response/delete_target_response"/>
  <xsl:apply-templates select="create_target_response"/>
  <xsl:call-template name="html-create-target-form">
    <xsl:with-param
      name="lsc-credentials"
      select="get_lsc_credentials_response | commands_response/get_lsc_credentials_response"/>
    <xsl:with-param
      name="target-sources"
      select="get_target_locators_response | commands_response/get_target_locators_response"/>
  </xsl:call-template>
  <!-- The for-each makes the get_targets_response the current node. -->
  <xsl:for-each select="get_targets_response | commands_response/get_targets_response">
    <xsl:call-template name="html-targets-table"/>
  </xsl:for-each>
</xsl:template>

<!-- END TARGETS MANAGEMENT -->

<!-- BEGIN CONFIGS MANAGEMENT -->

<xsl:template name="html-create-config-form">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">
      New Scan Config
      <a href="/help/configure_scanconfigs.html#newconfig"
         title="Help: Configure Scan Configs (New Scan Config)">
        <img src="/img/help.png"/>
      </a>
    </div>
    <div class="gb_window_part_content">
      <form action="/omp" method="post" enctype="multipart/form-data">
        <input type="hidden" name="cmd" value="create_config"/>
        <table border="0" cellspacing="0" cellpadding="3" width="100%">
          <tr>
            <td valign="top" width="125">Name</td>
            <td>
              <input type="text" name="name" value="unnamed" size="30"
                     maxlength="80"/>
            </td>
          </tr>
          <tr>
            <td valign="top">Comment (optional)</td>
            <td>
              <input type="text" name="comment" size="30" maxlength="400"/>
            </td>
          </tr>
          <tr>
            <td>Base</td>
            <td>
              <table>
                <tr>
                  <td colspan="2">
                    <input type="radio" name="base"
                           value="085569ce-73ed-11df-83c3-002264764cea"
                           checked="1"/>
                    Empty, static and fast
                  </td>
                </tr>
                <tr>
                  <td colspan="2">
                    <input type="radio" name="base"
                           value="daba56c8-73ec-11df-a475-002264764cea"/>
                    Full and fast
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td colspan="2" style="text-align:right;">
              <input type="submit" name="submit" value="Create Scan Config"/>
            </td>
          </tr>
        </table>
        <br/>
      </form>
    </div>
  </div>
</xsl:template>

<xsl:template name="html-import-config-form">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">
      Import Scan Config
      <a href="/help/configure_scanconfigs.html#importconfig"
         title="Help: Configure Scan Configs (Import Scan Config)">
        <img src="/img/help.png"/>
      </a>
    </div>
    <div class="gb_window_part_content">
      <form action="/omp" method="post" enctype="multipart/form-data">
        <input type="hidden" name="cmd" value="import_config"/>
        <table border="0" cellspacing="0" cellpadding="3" width="100%">
          <tr>
            <td valign="top" width="125">
              Import XML config
            </td>
            <td><input type="file" name="xml_file" size="30"/></td>
          </tr>
          <tr>
            <td colspan="2" style="text-align:right;">
              <input type="submit" name="submit" value="Import Scan Config"/>
            </td>
          </tr>
        </table>
        <br/>
      </form>
    </div>
  </div>
</xsl:template>

<xsl:template match="risk_factor">
  <xsl:choose>
    <xsl:when test="text() = 'Critical'">Crit</xsl:when>
    <xsl:when test="text() = 'Medium'">Med</xsl:when>
    <xsl:otherwise><xsl:value-of select="text()"/></xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template name="html-config-family-table">
 <div class="gb_window">
  <div class="gb_window_part_left"></div>
  <div class="gb_window_part_right"></div>
  <div class="gb_window_part_center">
    <xsl:choose>
      <xsl:when test="edit">
        Edit Scan Config Family Details
        <a href="/help/scanconfig_editor_nvt_families.html"
           title="Help: Configure Scan Configs (Edit Scan Config Family Details)">
          <img src="/img/help.png"/>
        </a>
      </xsl:when>
      <xsl:otherwise>
        Scan Config Family Details
        <a href="/help/scanconfig_family_details.html"
           title="Help: Configure Scan Configs (Scan Config Family Details)">
          <img src="/img/help.png"/>
        </a>
      </xsl:otherwise>
    </xsl:choose>
  </div>
  <div class="gb_window_part_content">
    <div class="float_right">
      <xsl:choose>
        <xsl:when test="edit">
          <a href="?cmd=edit_config&amp;config_id={config/@id}">
            Back to Config Details
          </a>
        </xsl:when>
        <xsl:otherwise>
          <a href="?cmd=get_config&amp;config_id={config/@id}">
            Back to Config Details
          </a>
        </xsl:otherwise>
      </xsl:choose>
    </div>
    <br/>

    <xsl:variable name="config_id" select="config/@id"/>
    <xsl:variable name="config_name" select="config/name"/>
    <xsl:variable name="family" select="config/family"/>

    <table>
    <tr><td>Config:</td><td><xsl:value-of select="$config_name"/></td></tr>
    <tr><td>Family:</td><td><xsl:value-of select="$family"/></td></tr>
    </table>

    <xsl:choose>
      <xsl:when test="edit">
        <h1>Edit Network Vulnerability Tests</h1>
      </xsl:when>
      <xsl:otherwise>
        <h1>Network Vulnerability Tests</h1>
      </xsl:otherwise>
    </xsl:choose>

    <table class="gbntable" cellspacing="2" cellpadding="4">
      <tr class="gbntablehead2">
        <td>Name</td>
        <td>OID</td>
        <td>Risk</td>
        <td style="text-align:right;">CVSS</td>
        <td>Timeout</td>
        <td>Prefs</td>
        <xsl:if test="edit">
          <td>Selected</td>
        </xsl:if>
        <td>Action</td>
      </tr>
      <xsl:choose>
        <xsl:when test="edit">
          <form action="" method="post" enctype="multipart/form-data">
            <input type="hidden" name="cmd" value="save_config_family"/>
            <input type="hidden" name="config_id" value="{$config_id}"/>
            <input type="hidden" name="name" value="{$config_name}"/>
            <input type="hidden" name="family" value="{$family}"/>
            <xsl:for-each select="all/get_nvts_response/nvt" >
              <xsl:variable name="current_name" select="name/text()"/>
              <xsl:variable name="id" select="@oid"/>
              <xsl:variable name="class">
                <xsl:choose>
                  <xsl:when test="position() mod 2 = 0">even</xsl:when>
                  <xsl:otherwise>odd</xsl:otherwise>
                </xsl:choose>
              </xsl:variable>
              <tr class="{$class}">
                <td><xsl:value-of select="$current_name"/></td>
                <td>
                  <xsl:value-of select="@oid"/>
                </td>
                <td>
                  <xsl:apply-templates select="risk_factor"/>
                </td>
                <td style="text-align:right;">
                  <xsl:value-of select="cvss_base"/>
                </td>
                <td>
                  <xsl:variable
                    name="timeout"
                    select="../../../get_nvts_response/nvt[@oid=$id]/timeout"/>
                  <xsl:choose>
                    <xsl:when test="string-length($timeout) &gt; 0">
                      <xsl:value-of select="$timeout"/>
                    </xsl:when>
                    <xsl:otherwise>
                      default
                    </xsl:otherwise>
                  </xsl:choose>
                </td>
                <td style="text-align:center;">
                  <xsl:choose>
                    <xsl:when test="preference_count&gt;0">
                      <xsl:value-of select="preference_count"/>
                    </xsl:when>
                    <xsl:otherwise>
                    </xsl:otherwise>
                  </xsl:choose>
                </td>
                <td style="text-align:center;">
                  <xsl:choose>
                    <xsl:when test="../../../get_nvts_response/nvt[@oid=$id]">
                      <input type="checkbox" name="nvt:{@oid}" value="1"
                             checked="1"/>
                    </xsl:when>
                    <xsl:otherwise>
                      <input type="checkbox" name="nvt:{@oid}" value="1"/>
                    </xsl:otherwise>
                  </xsl:choose>
                </td>
                <td>
                  <a href="/omp?cmd=get_config_nvt&amp;oid={@oid}&amp;config_id={$config_id}&amp;name={$config_name}&amp;family={$family}"
                     title="NVT Details" style="margin-left:3px;">
                    <img src="/img/details.png" border="0" alt="Details"/>
                  </a>
                  <a href="/omp?cmd=edit_config_nvt&amp;oid={@oid}&amp;config_id={$config_id}&amp;name={$config_name}&amp;family={$family}"
                     title="Select and Edit NVT Details"
                     style="margin-left:3px;">
                    <img src="/img/edit.png" border="0" alt="Edit"/>
                  </a>
                </td>
              </tr>
            </xsl:for-each>
            <tr>
              <td>
                Total:
                <xsl:value-of select="count(all/get_nvts_response/nvt)"/>
              </td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td>
                Total:
                <xsl:value-of select="count(get_nvts_response/nvt)"/>
              </td>
              <td></td>
            </tr>
            <tr>
              <td colspan="8" style="text-align:right;">
                <input type="submit"
                       name="submit"
                       value="Save Config"
                       title="Save Config"/>
              </td>
            </tr>
          </form>
        </xsl:when>
        <xsl:otherwise>
          <xsl:for-each select="get_nvts_response/nvt" >
            <xsl:variable name="current_name" select="name/text()"/>
            <xsl:variable name="class">
              <xsl:choose>
                <xsl:when test="position() mod 2 = 0">even</xsl:when>
                <xsl:otherwise>odd</xsl:otherwise>
              </xsl:choose>
            </xsl:variable>
            <tr class="{$class}">
              <td><xsl:value-of select="$current_name"/></td>
              <td>
                <xsl:value-of select="@oid"/>
              </td>
              <td>
                <xsl:apply-templates select="risk_factor"/>
              </td>
              <td style="text-align:right;">
                <xsl:value-of select="cvss_base"/>
              </td>
              <td>
                <xsl:choose>
                  <xsl:when test="string-length(timeout) &gt; 0">
                    <xsl:value-of select="timeout"/>
                  </xsl:when>
                  <xsl:otherwise>
                    default
                  </xsl:otherwise>
                </xsl:choose>
              </td>
              <td style="text-align:center;">
                <xsl:choose>
                  <xsl:when test="preference_count&gt;0">
                    <xsl:value-of select="preference_count"/>
                  </xsl:when>
                  <xsl:otherwise>
                  </xsl:otherwise>
                </xsl:choose>
              </td>
              <td>
                <a href="/omp?cmd=get_config_nvt&amp;oid={@oid}&amp;config_id={$config_id}&amp;name={$config_name}&amp;family={$family}"
                   title="NVT Details" style="margin-left:3px;">
                  <img src="/img/details.png" border="0" alt="Details"/>
                </a>
              </td>
            </tr>
          </xsl:for-each>
          <tr>
            <td>
              Total:
              <xsl:value-of select="count(get_nvts_response/nvt)"/>
            </td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        </xsl:otherwise>
      </xsl:choose>
    </table>
  </div>
 </div>
</xsl:template>

<!--     CONFIG PREFERENCES -->

<xsl:template name="preference" match="preference">
  <xsl:param name="config_id"></xsl:param>
  <xsl:param name="config_name"></xsl:param>
  <xsl:param name="edit"></xsl:param>
  <xsl:variable name="class">
    <xsl:choose>
      <xsl:when test="position() mod 2 = 0">even</xsl:when>
      <xsl:otherwise>odd</xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <tr class="{$class}">
    <td><xsl:value-of select="nvt/name"/></td>
    <td><xsl:value-of select="name"/></td>
    <td>
      <xsl:choose>
        <xsl:when test="type='file' and string-length(value) &gt; 0">
          <i>File attached.</i>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="value"/>
        </xsl:otherwise>
      </xsl:choose>
    </td>
    <td>
      <xsl:if test="string-length($config_id) &gt; 0">
        <a href="/omp?cmd=get_config_nvt&amp;oid={nvt/@oid}&amp;config_id={$config_id}&amp;name={$config_name}&amp;family={nvt/family}"
           title="Scan Config NVT Details" style="margin-left:3px;">
          <img src="/img/details.png" border="0" alt="Details"/>
        </a>
      </xsl:if>
      <xsl:if test="string-length($edit) &gt; 0">
        <a href="/omp?cmd=edit_config_nvt&amp;oid={nvt/@oid}&amp;config_id={$config_id}&amp;name={$config_name}&amp;family={nvt/family}"
           title="Edit Scan Config NVT Details" style="margin-left:3px;">
          <img src="/img/edit.png" border="0" alt="Edit"/>
        </a>
      </xsl:if>
      <xsl:if test="type='file' and string-length(value) &gt; 0">
        <a href="/omp?cmd=export_preference_file&amp;config_id={$config_id}&amp;oid={nvt/@oid}&amp;preference_name={name}"
           title="Export File"
           style="margin-left:3px;">
          <img src="/img/download.png" border="0" alt="Export File"/>
        </a>
      </xsl:if>
    </td>
  </tr>
</xsl:template>

<xsl:template name="preference-details" match="preference" mode="details">
  <xsl:param name="config"></xsl:param>
  <xsl:variable name="class">
    <xsl:choose>
      <xsl:when test="position() mod 2 = 0">even</xsl:when>
      <xsl:otherwise>odd</xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <tr class="{$class}">
    <td><xsl:value-of select="name"/></td>
    <td>
      <xsl:choose>
        <xsl:when test="type='file' and string-length(value) &gt; 0">
          <i>File attached.</i>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="value"/>
        </xsl:otherwise>
      </xsl:choose>
    </td>
    <td>
      <xsl:if test="type='file' and string-length(value) &gt; 0">
        <a href="/omp?cmd=export_preference_file&amp;config_id={$config/@id}&amp;oid={nvt/@oid}&amp;preference_name={name}"
           title="Export File"
           style="margin-left:3px;">
          <img src="/img/download.png" border="0" alt="Export File"/>
        </a>
      </xsl:if>
    </td>
  </tr>
</xsl:template>

<xsl:template match="preference"
              name="edit-config-preference"
              mode="edit-details">
  <xsl:param name="config"></xsl:param>
  <xsl:param name="for_config_details"></xsl:param>
  <xsl:param name="family"></xsl:param>
  <xsl:param name="nvt"></xsl:param>
  <xsl:variable name="class">
    <xsl:choose>
      <xsl:when test="position() mod 2 = 0">even</xsl:when>
      <xsl:otherwise>odd</xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <tr class="{$class}">
    <xsl:if test="$for_config_details">
      <td><xsl:value-of select="nvt/name"/></td>
    </xsl:if>
    <td><xsl:value-of select="name"/></td>
    <td>
      <!-- TODO: Is name enough to make the preference unique, or is
           type required too? -->
      <xsl:choose>
        <xsl:when test="type='checkbox'">
          <xsl:choose>
            <xsl:when test="value='yes'">
              <input type="radio" name="preference:{nvt/name}[checkbox]:{name}"
                     value="yes" checked="1"/>
              yes
              <input type="radio" name="preference:{nvt/name}[checkbox]:{name}"
                     value="no"/>
              no
            </xsl:when>
            <xsl:otherwise>
              <input type="radio" name="preference:{nvt/name}[checkbox]:{name}"
                     value="yes"/>
              yes
              <input type="radio" name="preference:{nvt/name}[checkbox]:{name}"
                     value="no" checked="1"/>
              no
            </xsl:otherwise>
          </xsl:choose>
        </xsl:when>
        <xsl:when test="type='password'">
          <input type="checkbox" name="password:{nvt/name}[password]:{name}"
                 value="yes"/>
          Replace existing value with:
          <br/>
          <input type="password" name="preference:{nvt/name}[password]:{name}"
                 value="{value}" size="30" maxlength="40"/>
        </xsl:when>
        <xsl:when test="type='file'">
          <input type="checkbox" name="file:{nvt/name}[file]:{name}"
                 value="yes"/>
          <xsl:choose>
            <xsl:when test="string-length(value) &gt; 0">
              Replace existing file with:
            </xsl:when>
            <xsl:otherwise>
              Upload file:
            </xsl:otherwise>
          </xsl:choose>
          <br/>
          <input type="file" name="preference:{nvt/name}[file]:{name}" size="30"/>
        </xsl:when>
        <xsl:when test="type='entry'">
          <input type="text" name="preference:{nvt/name}[entry]:{name}"
                 value="{value}" size="30" maxlength="400"/>
        </xsl:when>
        <xsl:when test="type='radio'">
          <input type="radio" name="preference:{nvt/name}[radio]:{name}"
                 value="{value}" checked="1"/>
          <xsl:value-of select="value"/>
          <xsl:for-each select="alt">
            <br/>
            <input type="radio"
                   name="preference:{../nvt/name}[radio]:{../name}"
                   value="{text()}"/>
            <xsl:value-of select="."/>
          </xsl:for-each>
        </xsl:when>
        <xsl:when test="type=''">
          <xsl:choose>
            <xsl:when test="name='ping_hosts' or name='reverse_lookup' or name='unscanned_closed' or name='nasl_no_signature_check' or name='ping_hosts' or name='reverse_lookup' or name='unscanned_closed' or name='auto_enable_dependencies' or name='kb_dont_replay_attacks' or name='kb_dont_replay_denials' or name='kb_dont_replay_info_gathering' or name='kb_dont_replay_scanners' or name='kb_restore' or name='log_whole_attack' or name='only_test_hosts_whose_kb_we_dont_have' or name='only_test_hosts_whose_kb_we_have' or name='optimize_test' or name='safe_checks' or name='save_knowledge_base' or name='silent_dependencies' or name='slice_network_addresses' or name='use_mac_addr' or name='drop_privileges'">
              <xsl:choose>
                <xsl:when test="value='yes'">
                  <input type="radio" name="preference:scanner[scanner]:{name}"
                         value="yes" checked="1"/>
                  yes
                  <input type="radio" name="preference:scanner[scanner]:{name}"
                         value="no"/>
                  no
                </xsl:when>
                <xsl:otherwise>
                  <input type="radio" name="preference:scanner[scanner]:{name}"
                         value="yes"/>
                  yes
                  <input type="radio" name="preference:scanner[scanner]:{name}"
                         value="no" checked="1"/>
                  no
                </xsl:otherwise>
              </xsl:choose>
            </xsl:when>
            <xsl:otherwise>
              <input type="text"
                     name="preference:scanner[scanner]:{name}"
                     value="{value}"
                     size="30"
                     maxlength="400"/>
            </xsl:otherwise>
          </xsl:choose>
        </xsl:when>
        <xsl:otherwise>
          <input type="text"
                 name="preference:{nvt/name}[{type}]:{name}"
                 value="{value}"
                 size="30"
                 maxlength="400"/>
        </xsl:otherwise>
      </xsl:choose>
    </td>
    <td>
      <xsl:if test="$for_config_details">
        <a href="/omp?cmd=edit_config_nvt&amp;oid={nvt/@oid}&amp;config_id={$config/@id}&amp;family={$family}"
           title="Edit NVT Details" style="margin-left:3px;">
          <img src="/img/edit.png" border="0" alt="Edit"/>
        </a>
      </xsl:if>
      <xsl:choose>
        <xsl:when test="$config and type='file' and (string-length(value) &gt; 0)">
          <a href="/omp?cmd=export_preference_file&amp;config_id={$config/@id}&amp;oid={nvt/@oid}&amp;preference_name={name}"
             title="Export File"
             style="margin-left:3px;">
            <img src="/img/download.png" border="0" alt="Export File"/>
          </a>
        </xsl:when>
        <xsl:otherwise>
        </xsl:otherwise>
      </xsl:choose>
    </td>
  </tr>
</xsl:template>

<xsl:template match="preferences" name="preferences">
  <xsl:param name="config_id"></xsl:param>
  <xsl:param name="config_name"></xsl:param>
  <xsl:param name="edit"></xsl:param>
  <div id="preferences">
    <table class="gbntable" cellspacing="2" cellpadding="4">
      <tr class="gbntablehead2">
        <td>NVT</td>
        <td>Name</td>
        <td>Value</td>
        <td width="60">Actions</td>
      </tr>
      <xsl:for-each select="preference[string-length(./nvt)&gt;0]">
        <xsl:call-template name="preference">
          <xsl:with-param name="config_id" select="$config_id"/>
          <xsl:with-param name="config_name" select="$config_name"/>
          <xsl:with-param name="edit" select="$edit"/>
        </xsl:call-template>
      </xsl:for-each>
    </table>
  </div>
</xsl:template>

<xsl:template name="preferences-details" match="preferences" mode="details">
  <xsl:param name="config"></xsl:param>
  <div id="preferences">
    <table class="gbntable" cellspacing="2" cellpadding="4">
      <tr class="gbntablehead2">
        <td>Name</td>
        <td>Value</td>
        <td>Actions</td>
      </tr>

      <!-- Special case the NVT timeout. -->
      <tr class="even">
        <td>Timeout</td>
        <td>
          <xsl:choose>
            <xsl:when test="string-length(timeout) &gt; 0">
              <xsl:value-of select="timeout"/>
            </xsl:when>
            <xsl:otherwise>
              default
            </xsl:otherwise>
          </xsl:choose>
        </td>
        <td></td>
      </tr>

      <xsl:for-each select="preference">
        <xsl:call-template name="preference-details">
          <xsl:with-param name="config" select="$config"/>
        </xsl:call-template>
      </xsl:for-each>
    </table>
  </div>
</xsl:template>

<xsl:template name="preferences-edit-details">
  <xsl:param name="config"></xsl:param>
  <div id="preferences">
    <table class="gbntable" cellspacing="2" cellpadding="4">
      <tr class="gbntablehead2">
        <td>Name</td>
        <td>Value</td>
        <td>Actions</td>
      </tr>

      <!-- Special case the NVT timeout. -->
      <tr class="even">
        <td>Timeout</td>
        <td>
          <xsl:choose>
            <xsl:when test="string-length(timeout) &gt; 0">
              <input type="radio"
                     name="timeout"
                     value="0"/>
            </xsl:when>
            <xsl:otherwise>
              <input type="radio"
                     name="timeout"
                     value="0"
                     checked="1"/>
            </xsl:otherwise>
          </xsl:choose>
          Apply default timeout
          <br/>
          <xsl:choose>
            <xsl:when test="string-length(timeout) &gt; 0">
              <input type="radio"
                     name="timeout"
                     value="1"
                     checked="1"/>
            </xsl:when>
            <xsl:otherwise>
              <input type="radio"
                     name="timeout"
                     value="1"/>
            </xsl:otherwise>
          </xsl:choose>
          <input type="text"
                 name="preference:scanner[scanner]:timeout.{../@oid}"
                 value="{timeout}"
                 size="30"
                 maxlength="400"/>
          <br/>
        </td>
        <td></td>
      </tr>

      <xsl:for-each select="preference">
        <xsl:call-template name="edit-config-preference">
          <xsl:with-param name="config" select="$config"/>
        </xsl:call-template>
      </xsl:for-each>

      <tr>
        <td colspan="3" style="text-align:right;">
          <input type="submit"
                 name="submit"
                 value="Save Config"
                 title="Save Config"/>
        </td>
      </tr>
    </table>
  </div>
</xsl:template>

<xsl:template match="preferences" mode="scanner">
  <div id="preferences">
    <table class="gbntable" cellspacing="2" cellpadding="4">
      <tr class="gbntablehead2">
        <td>Name</td>
        <td>Value</td>
        <td>Actions</td>
      </tr>
      <xsl:apply-templates
        select="preference[string-length(nvt)=0]"
        mode="details"/>
    </table>
  </div>
</xsl:template>

<xsl:template match="preferences" mode="edit-scanner-details">
  <div id="preferences">
    <table class="gbntable" cellspacing="2" cellpadding="4">
      <tr class="gbntablehead2">
        <td>Name</td>
        <td>Value</td>
        <td>Actions</td>
      </tr>
      <xsl:apply-templates
        select="preference[string-length(nvt)=0]"
        mode="edit-details"/>
      <tr>
        <td colspan="3" style="text-align:right;">
          <input type="submit"
                 name="submit"
                 value="Save Config"
                 title="Save Config"/>
        </td>
      </tr>
    </table>
  </div>
</xsl:template>

<!--     CONFIG NVTS -->

<xsl:template name="html-config-nvt-table">
 <div class="gb_window">
  <div class="gb_window_part_left"></div>
  <div class="gb_window_part_right"></div>
  <div class="gb_window_part_center">
    <xsl:choose>
      <xsl:when test="edit">
        Edit Scan Config NVT Details
        <a href="/help/scanconfig_editor_nvt.html"
           title="Help: Configure Scan Configs (Edit Scan Config NVT Details)">
          <img src="/img/help.png"/>
        </a>
      </xsl:when>
      <xsl:otherwise>
        Scan Config NVT Details
        <a href="/help/scanconfig_nvt_details.html"
           title="Help: Configure Scan Configs (Scan Config NVT Details)">
          <img src="/img/help.png"/>
        </a>
      </xsl:otherwise>
    </xsl:choose>
  </div>
  <div class="gb_window_part_content">
    <xsl:variable name="family">
      <xsl:value-of select="get_nvts_response/nvt/family"/>
    </xsl:variable>
    <div class="float_right">
      <xsl:choose>
        <xsl:when test="edit">
          <a href="?cmd=edit_config_family&amp;config_id={config/@id}&amp;name={config/name}&amp;family={$family}">
            Back to Config Family Details
          </a>
        </xsl:when>
        <xsl:otherwise>
          <a href="?cmd=get_config_family&amp;config_id={config/@id}&amp;name={config/name}&amp;family={$family}">
            Back to Config Family Details
          </a>
        </xsl:otherwise>
      </xsl:choose>
    </div>
    <br/>

    <table>
    <tr><td>Config:</td><td><xsl:value-of select="config/name"/></td></tr>
    <tr><td>Family:</td><td><xsl:value-of select="$family"/></td></tr>
    </table>

    <xsl:choose>
      <xsl:when test="edit">
        <h1>Edit Network Vulnerability Test</h1>
      </xsl:when>
      <xsl:otherwise>
        <h1>Network Vulnerability Test</h1>
      </xsl:otherwise>
    </xsl:choose>

    <h2>Details</h2>
    <xsl:apply-templates select="get_nvts_response/nvt"/>

    <h2>Preferences</h2>
    <xsl:variable name="config" select="config"/>
    <xsl:choose>
      <xsl:when test="edit">
        <form action="" method="post" enctype="multipart/form-data">
          <input type="hidden" name="cmd" value="save_config_nvt"/>
          <input type="hidden" name="config_id" value="{config/@id}"/>
          <input type="hidden" name="name" value="{config/name}"/>
          <input type="hidden" name="family" value="{$family}"/>
          <input type="hidden"
                 name="oid"
                 value="{get_nvts_response/nvt/@oid}"/>
          <xsl:for-each select="get_nvts_response/nvt/preferences">
            <xsl:call-template name="preferences-edit-details">
              <xsl:with-param name="config" select="$config"/>
            </xsl:call-template>
          </xsl:for-each>
        </form>
      </xsl:when>
      <xsl:otherwise>
        <xsl:for-each select="get_nvts_response/nvt/preferences">
          <xsl:call-template name="preferences-details">
            <xsl:with-param name="config" select="$config"/>
          </xsl:call-template>
        </xsl:for-each>
      </xsl:otherwise>
    </xsl:choose>
  </div>
 </div>
</xsl:template>

<!--     CONFIG FAMILIES -->

<xsl:template name="edit-families-family">
  <xsl:param name="config"></xsl:param>
  <xsl:param name="config-family"></xsl:param>
  <xsl:variable name="current_name" select="name/text()"/>
  <xsl:choose>
    <xsl:when test="name=''">
    </xsl:when>
    <xsl:otherwise>
      <xsl:variable name="class">
        <xsl:choose>
          <xsl:when test="position() mod 2 = 0">even</xsl:when>
          <xsl:otherwise>odd</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>
      <tr class="{$class}">
        <td><xsl:value-of select="$current_name"/></td>
        <td>
          <xsl:choose>
            <xsl:when test="$config-family">
              <xsl:choose>
                <xsl:when test="$config-family/nvt_count='-1'">
                  N
                </xsl:when>
                <xsl:otherwise>
                  <xsl:value-of select="$config-family/nvt_count"/>
                </xsl:otherwise>
              </xsl:choose>
            </xsl:when>
            <xsl:otherwise>
              0
            </xsl:otherwise>
          </xsl:choose>
          <xsl:choose>
            <xsl:when test="max_nvt_count='-1'">
            </xsl:when>
            <xsl:otherwise>
              of <xsl:value-of select="max_nvt_count"/>
            </xsl:otherwise>
          </xsl:choose>
        </td>
        <td style="text-align:center;">
          <xsl:choose>
            <xsl:when test="$config-family">
              <xsl:choose>
                <xsl:when test="$config-family/growing=1">
                  <input type="radio" name="trend:{$current_name}" value="1"
                         checked="1"/>
                </xsl:when>
                <xsl:otherwise>
                  <input type="radio" name="trend:{$current_name}" value="1"/>
                </xsl:otherwise>
              </xsl:choose>
            </xsl:when>
            <xsl:otherwise>
              <input type="radio" name="trend:{$current_name}" value="1"/>
            </xsl:otherwise>
          </xsl:choose>
          <img src="/img/trend_more.png"
               alt="Grows"
               title="The NVT selection is DYNAMIC. New NVT's will automatically be added and considered."/>
          <xsl:choose>
            <xsl:when test="$config-family">
              <xsl:choose>
                <xsl:when test="$config-family/growing=0">
                  <input type="radio" name="trend:{$current_name}" value="0"
                         checked="1"/>
                </xsl:when>
                <xsl:otherwise>
                  <input type="radio" name="trend:{$current_name}" value="0"/>
                </xsl:otherwise>
              </xsl:choose>
            </xsl:when>
            <xsl:otherwise>
              <input type="radio" name="trend:{$current_name}" value="0"
                     checked="1"/>
            </xsl:otherwise>
          </xsl:choose>
          <img src="/img/trend_nochange.png"
               alt="Static"
               title="The NVT selection is STATIC. New NVT's will NOT automatically be added or considered."/>
        </td>
        <td style="text-align:center;">
          <xsl:choose>
            <xsl:when test="$config-family and ($config-family/nvt_count = max_nvt_count)">
              <input type="checkbox" name="select:{$current_name}"
                     value="1" checked="1"/>
            </xsl:when>
            <xsl:otherwise>
              <input type="checkbox" name="select:{$current_name}"
                     value="0"/>
            </xsl:otherwise>
          </xsl:choose>
        </td>
        <td>
          <a href="/omp?cmd=edit_config_family&amp;config_id={$config/@id}&amp;name={$config/name}&amp;family={$current_name}"
             title="Edit Scan Config Family" style="margin-left:3px;">
            <img src="/img/edit.png" border="0" alt="Edit"/>
          </a>
        </td>
      </tr>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template match="family">
  <xsl:variable name="current_name" select="name/text()"/>
  <xsl:choose>
    <xsl:when test="name=''">
    </xsl:when>
    <xsl:otherwise>
      <xsl:variable name="class">
        <xsl:choose>
          <xsl:when test="position() mod 2 = 0">even</xsl:when>
          <xsl:otherwise>odd</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>
      <tr class="{$class}">
        <td><xsl:value-of select="$current_name"/></td>
        <td>
          <xsl:choose>
            <xsl:when test="nvt_count='-1'">
              N
            </xsl:when>
            <xsl:otherwise>
              <xsl:value-of select="nvt_count"/>
            </xsl:otherwise>
          </xsl:choose>
          <xsl:choose>
            <xsl:when test="max_nvt_count='-1'">
            </xsl:when>
            <xsl:otherwise>
              of <xsl:value-of select="max_nvt_count"/>
            </xsl:otherwise>
          </xsl:choose>
        </td>
        <td>
          <xsl:choose>
            <xsl:when test="growing='1'">
              <img src="/img/trend_more.png"
                   alt="Grows"
                   title="The NVT selection is DYNAMIC. New NVT's will automatically be added and considered."/>
            </xsl:when>
            <xsl:when test="growing='0'">
              <img src="/img/trend_nochange.png"
                   alt="Static"
                   title="The NVT selection is STATIC. New NVT's will NOT automatically be added or considered."/>
            </xsl:when>
            <xsl:otherwise>
              N/A
            </xsl:otherwise>
          </xsl:choose>
        </td>
        <td>
          <a href="/omp?cmd=get_config_family&amp;config_id={../../@id}&amp;name={../../name}&amp;family={$current_name}"
             title="Scan Config Family Details" style="margin-left:3px;">
            <img src="/img/details.png" border="0" alt="Details"/>
          </a>
        </td>
      </tr>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template match="config" mode="families">
  <div id="families">
    <table class="gbntable" cellspacing="2" cellpadding="4">
      <tr class="gbntablehead2">
        <td>
          Family
          <xsl:choose>
            <xsl:when test="family_count/growing='1'">
              <img src="/img/trend_more.png"
                   alt="Grows"
                   title="The family selection is DYNAMIC. New families will automatically be added and considered."/>
            </xsl:when>
            <xsl:when test="family_count/growing='0'">
              <img src="/img/trend_nochange.png"
                   alt="Static"
                   title="The family selection is STATIC. New families will NOT automatically be added or considered."/>
            </xsl:when>
            <xsl:otherwise>
              N/A
            </xsl:otherwise>
          </xsl:choose>
        </td>
        <td>NVT's selected</td>
        <td>Trend</td>
        <td>Action</td>
      </tr>
      <xsl:apply-templates select="families/family"/>
      <tr>
        <td>Total: <xsl:value-of select="count(families/family)"/></td>
        <td>
          <xsl:value-of select="known_nvt_count/text()"/>
          of <xsl:value-of select="max_nvt_count/text()"/>
        </td>
        <td>
          <xsl:choose>
            <xsl:when test="nvt_count/growing='1'">
              <img src="/img/trend_more.png"
                   alt="Grows"
                   title="The NVT selection is DYNAMIC. New NVT's will automatically be added and considered."/>
            </xsl:when>
            <xsl:when test="nvt_count/growing='0'">
              <img src="/img/trend_nochange.png"
                   alt="Static"
                   title="The NVT selection is STATIC. New NVT's will NOT automatically be added or considered."/>
            </xsl:when>
            <xsl:otherwise>
              N/A
            </xsl:otherwise>
          </xsl:choose>
        </td>
        <td></td>
      </tr>
    </table>
  </div>
</xsl:template>

<xsl:template name="edit-families">
  <xsl:param name="config"></xsl:param>
  <xsl:param name="families"></xsl:param>
  <div id="families">
    <table class="gbntable" cellspacing="2" cellpadding="4">
      <tr class="gbntablehead2">
        <td>
          Family
          <xsl:choose>
            <xsl:when test="$config/family_count/growing=1">
              <input type="radio" name="trend:" value="1" checked="1"/>
              <img src="/img/trend_more.png"
                   alt="Grows"
                   title="The family selection is DYNAMIC. New families will automatically be added and considered."/>
              <input type="radio" name="trend:" value="0"/>
              <img src="/img/trend_nochange.png"
                   alt="Static"
                   title="The family selection is STATIC. New families will NOT automatically be added or considered."/>
            </xsl:when>
            <xsl:otherwise>
              <input type="radio" name="trend:" value="1"/>
              <img src="/img/trend_more.png"
                   alt="Grows"
                   title="The family selection is DYNAMIC. New families will automatically be added and considered."/>
              <input type="radio" name="trend:" value="0" checked="0"/>
              <img src="/img/trend_nochange.png"
                   alt="Static"
                   title="The family selection is STATIC. New families will NOT automatically be added or considered."/>
            </xsl:otherwise>
          </xsl:choose>
        </td>
        <td>NVT's selected</td>
        <td>Trend</td>
        <td>Select all NVT's</td>
        <td>Action</td>
      </tr>
      <xsl:for-each select="$families/family">
        <xsl:variable name="family_name">
          <xsl:value-of select="name"/>
        </xsl:variable>
        <xsl:call-template name="edit-families-family">
          <xsl:with-param
            name="config-family"
            select="$config/families/family[name=$family_name]"/>
          <xsl:with-param name="config" select="$config"/>
        </xsl:call-template>
      </xsl:for-each>
      <tr>
        <td>
          Total: <xsl:value-of select="count($config/families/family)"/>
        </td>
        <td>
          <xsl:value-of select="$config/known_nvt_count/text()"/>
          of <xsl:value-of select="$config/max_nvt_count/text()"/>
        </td>
        <td>
          <xsl:choose>
            <xsl:when test="$config/nvt_count/growing='1'">
              <img src="/img/trend_more.png"
                   alt="Grows"
                   title="The NVT selection is DYNAMIC. New NVT's will automatically be added and considered."/>
            </xsl:when>
            <xsl:when test="$config/nvt_count/growing='0'">
              <img src="/img/trend_nochange.png"
                   alt="Static"
                   title="The NVT selection is STATIC. New NVT's will NOT automatically be added or considered."/>
            </xsl:when>
            <xsl:otherwise>
              N/A
            </xsl:otherwise>
          </xsl:choose>
        </td>
        <td></td>
        <td></td>
      </tr>
      <tr>
        <td colspan="5" style="text-align:right;">
          <input type="submit"
                 name="submit"
                 value="Save Config"
                 title="Save Config"/>
        </td>
      </tr>
    </table>
  </div>
</xsl:template>

<!--     CONFIG OVERVIEW -->

<xsl:template name="html-config-table">
 <div class="gb_window">
  <div class="gb_window_part_left"></div>
  <div class="gb_window_part_right"></div>
  <div class="gb_window_part_center">
  <xsl:choose>
    <xsl:when test="edit">
      Edit Scan Config Details
      <a href="/help/scanconfig_editor.html"
         title="Help: Edit Scan Configs Details (Scan Configs)">
        <img src="/img/help.png"/>
      </a>
    </xsl:when>
    <xsl:otherwise>
      Scan Config Details
      <a href="/help/scanconfig_details.html"
         title="Help: Scan Configs Details (Scan Configs)">
        <img src="/img/help.png"/>
      </a>
    </xsl:otherwise>
  </xsl:choose>
  </div>
  <div class="gb_window_part_content">
    <xsl:variable name="config" select="get_configs_response/config"/>
    <div class="float_right">
      <a href="?cmd=get_configs">Back to Configs</a>
    </div>
    <br/>

    <table>
      <tr>
        <td><b>Name:</b></td>
        <td><b><xsl:value-of select="$config/name"/></b></td>
      </tr>
      <tr>
        <td>Comment:</td><td><xsl:value-of select="$config/comment"/></td>
      </tr>
    </table>

    <xsl:choose>
      <xsl:when test="edit">
        <form action="" method="post">
          <input type="hidden" name="cmd" value="save_config"/>
          <input type="hidden" name="config_id" value="{$config/@id}"/>
          <input type="hidden" name="name" value="{$config/name}"/>

          <h1>Edit Network Vulnerability Test Families</h1>

          <xsl:call-template name="edit-families">
            <xsl:with-param name="config" select="$config"/>
            <xsl:with-param
              name="families"
              select="get_nvt_families_response/families"/>
          </xsl:call-template>

          <xsl:choose>
            <xsl:when test="count($config/preferences/preference[string-length(nvt)=0]) = 0">
              <h1>Edit Scanner Preferences: None</h1>
              <h1>Network Vulnerability Test Preferences: None</h1>
            </xsl:when>
            <xsl:otherwise>
              <h1>Edit Scanner Preferences</h1>

              <xsl:apply-templates
                select="$config/preferences"
                mode="edit-scanner-details"/>

              <h1>Network Vulnerability Test Preferences</h1>
              <xsl:for-each select="$config/preferences">
                <xsl:call-template name="preferences">
                  <xsl:with-param name="config_id" select="$config/@id"/>
                  <xsl:with-param name="config_name" select="$config/name"/>
                  <xsl:with-param name="edit">yes</xsl:with-param>
                </xsl:call-template>
              </xsl:for-each>
            </xsl:otherwise>
          </xsl:choose>

        </form>
      </xsl:when>
      <xsl:otherwise>
        <h1>Network Vulnerability Test Families</h1>

        <xsl:apply-templates select="$config" mode="families"/>

        <xsl:choose>
          <xsl:when test="count($config/preferences/preference[string-length(nvt)=0]) = 0">
            <h1>Scanner Preferences: None</h1>
            <h1>Network Vulnerability Test Preferences: None</h1>
          </xsl:when>
          <xsl:otherwise>
            <h1>Scanner Preferences</h1>
            <xsl:apply-templates select="$config/preferences" mode="scanner"/>

            <h1>Network Vulnerability Test Preferences</h1>
            <xsl:for-each select="$config/preferences">
              <xsl:call-template name="preferences">
                <xsl:with-param name="config_id" select="$config/@id"/>
                <xsl:with-param name="config_name" select="$config/name"/>
              </xsl:call-template>
            </xsl:for-each>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:otherwise>
    </xsl:choose>

    <xsl:choose>
      <xsl:when test="count($config/tasks/task) = 0">
        <h1>Tasks using this Config: None</h1>
      </xsl:when>
      <xsl:otherwise>
        <h1>Tasks using this Config</h1>
        <table class="gbntable" cellspacing="2" cellpadding="4">
          <tr class="gbntablehead2">
            <td>Name</td>
            <td>Actions</td>
          </tr>
          <xsl:for-each select="$config/tasks/task">
            <xsl:variable name="class">
              <xsl:choose>
                <xsl:when test="position() mod 2 = 0">even</xsl:when>
                <xsl:otherwise>odd</xsl:otherwise>
              </xsl:choose>
            </xsl:variable>
            <tr class="{$class}">
              <td><xsl:value-of select="name"/></td>
              <td width="100">
                <a href="/omp?cmd=get_tasks&amp;task_id={@id}" title="Details">
                  <img src="/img/details.png"
                       border="0"
                       alt="Details"
                       style="margin-left:3px;"/>
                </a>
              </td>
            </tr>
          </xsl:for-each>
        </table>
      </xsl:otherwise>
    </xsl:choose>
  </div>
 </div>
</xsl:template>

<xsl:template name="html-configs-table">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">Scan Configs
      <a href="/help/configure_scanconfigs.html#scanconfigs"
         title="Help: Configure Scan Configs (Scan Configs)">
        <img src="/img/help.png"/>
      </a>
    </div>

    <div class="gb_window_part_content_no_pad">
      <div id="tasks">
        <table class="gbntable" cellspacing="2" cellpadding="4" border="0">
          <tr class="gbntablehead2">
            <td rowspan="2">Name</td>
            <td colspan="2">Families</td>
            <td colspan="2">NVTs</td>
            <td width="100" rowspan="2">Actions</td>
          </tr>
          <tr class="gbntablehead2">
            <td width="1" style="font-size:10px;">Total</td>
            <td width="1" style="font-size:10px;">Trend</td>
            <td width="1" style="font-size:10px;">Total</td>
            <td width="1" style="font-size:10px;">Trend</td>
          </tr>
          <xsl:apply-templates select="config"/>
        </table>
      </div>
    </div>
  </div>
</xsl:template>

<!--     CREATE_CONFIG_RESPONSE -->

<xsl:template match="create_config_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">Create Config</xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
    <xsl:with-param name="details">
      <xsl:if test="@status = '201' and config/name">
        Name of new config is '<xsl:value-of select="config/name"/>'.
      </xsl:if>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<!--     DELETE_CONFIG_RESPONSE -->

<xsl:template match="delete_config_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">Delete Config</xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<!-- CONFIG -->

<xsl:template match="config">
  <xsl:variable name="class">
    <xsl:choose>
      <xsl:when test="position() mod 2 = 0">even</xsl:when>
      <xsl:otherwise>odd</xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <tr class="{$class}">
    <td>
      <b><xsl:value-of select="name"/></b>
      <xsl:choose>
        <xsl:when test="comment != ''">
          <br/>(<xsl:value-of select="comment"/>)
        </xsl:when>
        <xsl:otherwise>
        </xsl:otherwise>
      </xsl:choose>
    </td>
    <td>
      <xsl:choose>
        <xsl:when test="family_count/text()='-1'">
          N/A
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="family_count/text()"/>
        </xsl:otherwise>
      </xsl:choose>
    </td>
    <td style="text-align:center;">
      <xsl:choose>
        <xsl:when test="family_count/growing='1'">
          <img src="/img/trend_more.png"
               alt="Grows"
               title="The family selection is DYNAMIC. New families will automatically be added and considered."/>
        </xsl:when>
        <xsl:when test="family_count/growing='0'">
          <img src="/img/trend_nochange.png"
               alt="Static"
               title="The family selection is STATIC. New families will NOT automatically be added or considered."/>
        </xsl:when>
        <xsl:otherwise>
          N/A
        </xsl:otherwise>
      </xsl:choose>
    </td>
    <td>
      <xsl:choose>
        <xsl:when test="nvt_count/text()='-1'">
          N/A
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="nvt_count/text()"/>
        </xsl:otherwise>
      </xsl:choose>
    </td>
    <td style="text-align:center;">
      <xsl:choose>
        <xsl:when test="nvt_count/growing='1'">
          <img src="/img/trend_more.png"
               alt="Dynamic"
               title="The NVT selection is DYNAMIC. New NVTs of selected families will automatically be added and considered."/>
        </xsl:when>
        <xsl:when test="nvt_count/growing='0'">
          <img src="/img/trend_nochange.png"
               alt="Static"
               title="The NVT selection is STATIC. New NVTs will NOT automatically be added or considered."/>
        </xsl:when>
        <xsl:otherwise>
          N/A
        </xsl:otherwise>
      </xsl:choose>
    </td>
    <td>
      <xsl:choose>
        <xsl:when test="in_use='0'">
          <a href="/omp?cmd=delete_config&amp;config_id={@id}"
             title="Delete Scan Config" style="margin-left:3px;">
            <img src="/img/delete.png" border="0" alt="Delete"/>
          </a>
        </xsl:when>
        <xsl:otherwise>
          <img src="/img/delete_inactive.png" border="0" alt="Delete"
               style="margin-left:3px;"/>
        </xsl:otherwise>
      </xsl:choose>
      <a href="/omp?cmd=get_config&amp;config_id={@id}"
         title="Scan Config Details"
         style="margin-left:3px;">
        <img src="/img/details.png" border="0" alt="Details"/>
      </a>
      <xsl:choose>
        <xsl:when test="in_use='0'">
          <a href="/omp?cmd=edit_config&amp;config_id={@id}"
             title="Edit Scan Config"
             style="margin-left:3px;">
            <img src="/img/edit.png" border="0" alt="Edit"/>
          </a>
        </xsl:when>
        <xsl:otherwise>
          <img src="/img/edit_inactive.png" border="0" alt="Edit"
               style="margin-left:3px;"/>
        </xsl:otherwise>
      </xsl:choose>
      <a href="/omp?cmd=export_config&amp;config_id={@id}"
         title="Export Scan Config XML"
         style="margin-left:3px;">
        <img src="/img/download.png" border="0" alt="Export XML"/>
      </a>
    </td>
  </tr>
</xsl:template>

<!-- GET_CONFIGS_RESPONSE -->

<xsl:template match="get_configs_response">
  <xsl:call-template name="html-create-config-form"/>
  <xsl:call-template name="html-import-config-form"/>
  <xsl:call-template name="html-configs-table"/>
</xsl:template>

<!-- GET_CONFIG_RESPONSE -->

<xsl:template match="get_config_response">
  <xsl:call-template name="html-config-table"/>
</xsl:template>

<!-- GET_CONFIG_FAMILY_RESPONSE -->

<xsl:template match="get_config_family_response">
  <xsl:call-template name="html-config-family-table"/>
</xsl:template>

<!-- GET_CONFIG_NVT_RESPONSE -->

<xsl:template match="get_config_nvt_response">
  <xsl:call-template name="html-config-nvt-table"/>
</xsl:template>

<!-- END CONFIGS MANAGEMENT -->

<!-- BEGIN SCHEDULES MANAGEMENT -->

<xsl:template name="opt">
  <xsl:param name="value"></xsl:param>
  <xsl:param name="content"><xsl:value-of select="$value"/></xsl:param>
  <xsl:param name="select-value"></xsl:param>
  <xsl:choose>
    <xsl:when test="$value = $select-value">
      <option value="{$value}" selected="1"><xsl:value-of select="$content"/></option>
    </xsl:when>
    <xsl:otherwise>
      <option value="{$value}"><xsl:value-of select="$content"/></option>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template name="html-create-schedule-form">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">New Schedule
      <a href="/help/configure_schedules.html#newschedule"
         title="Help: Configure Schedules (New Schedule)">
        <img src="/img/help.png"/>
      </a>
    </div>
    <div class="gb_window_part_content">
      <form action="/omp" method="post" enctype="multipart/form-data">
        <input type="hidden" name="cmd" value="create_schedule"/>
        <table border="0" cellspacing="0" cellpadding="3" width="100%">
          <tr class="odd">
            <td valign="top" width="125">Name</td>
            <td>
              <input type="text" name="name" value="unnamed" size="30"
                     maxlength="80"/>
            </td>
          </tr>
          <tr class="even">
            <td valign="top" width="125">Comment (optional)</td>
            <td>
              <input type="text" name="comment" size="30" maxlength="400"/>
            </td>
          </tr>
          <tr class="odd">
            <td valign="top" width="125">First Time</td>
            <td>
              <select name="hour">
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'00'"/>
                  <xsl:with-param name="select-value" select="time/hour"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'01'"/>
                  <xsl:with-param name="select-value" select="time/hour"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'02'"/>
                  <xsl:with-param name="select-value" select="time/hour"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'03'"/>
                  <xsl:with-param name="select-value" select="time/hour"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'04'"/>
                  <xsl:with-param name="select-value" select="time/hour"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'05'"/>
                  <xsl:with-param name="select-value" select="time/hour"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'06'"/>
                  <xsl:with-param name="select-value" select="time/hour"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'07'"/>
                  <xsl:with-param name="select-value" select="time/hour"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'08'"/>
                  <xsl:with-param name="select-value" select="time/hour"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'09'"/>
                  <xsl:with-param name="select-value" select="time/hour"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'10'"/>
                  <xsl:with-param name="select-value" select="time/hour"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'11'"/>
                  <xsl:with-param name="select-value" select="time/hour"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'12'"/>
                  <xsl:with-param name="select-value" select="time/hour"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'13'"/>
                  <xsl:with-param name="select-value" select="time/hour"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'14'"/>
                  <xsl:with-param name="select-value" select="time/hour"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'15'"/>
                  <xsl:with-param name="select-value" select="time/hour"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'16'"/>
                  <xsl:with-param name="select-value" select="time/hour"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'17'"/>
                  <xsl:with-param name="select-value" select="time/hour"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'18'"/>
                  <xsl:with-param name="select-value" select="time/hour"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'19'"/>
                  <xsl:with-param name="select-value" select="time/hour"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'20'"/>
                  <xsl:with-param name="select-value" select="time/hour"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'21'"/>
                  <xsl:with-param name="select-value" select="time/hour"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'22'"/>
                  <xsl:with-param name="select-value" select="time/hour"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'23'"/>
                  <xsl:with-param name="select-value" select="time/hour"/>
                </xsl:call-template>
              </select>
              h
              <select name="minute">
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'00'"/>
                  <xsl:with-param name="select-value" select="time/minute - (time/minute mod 5)"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'05'"/>
                  <xsl:with-param name="select-value" select="time/minute - (time/minute mod 5)"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'10'"/>
                  <xsl:with-param name="select-value" select="time/minute - (time/minute mod 5)"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'15'"/>
                  <xsl:with-param name="select-value" select="time/minute - (time/minute mod 5)"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'20'"/>
                  <xsl:with-param name="select-value" select="time/minute - (time/minute mod 5)"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'25'"/>
                  <xsl:with-param name="select-value" select="time/minute - (time/minute mod 5)"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'30'"/>
                  <xsl:with-param name="select-value" select="time/minute - (time/minute mod 5)"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'35'"/>
                  <xsl:with-param name="select-value" select="time/minute - (time/minute mod 5)"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'40'"/>
                  <xsl:with-param name="select-value" select="time/minute - (time/minute mod 5)"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'45'"/>
                  <xsl:with-param name="select-value" select="time/minute - (time/minute mod 5)"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'50'"/>
                  <xsl:with-param name="select-value" select="time/minute - (time/minute mod 5)"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'55'"/>
                  <xsl:with-param name="select-value" select="time/minute - (time/minute mod 5)"/>
                </xsl:call-template>
              </select>
              ,
              <select name="day_of_month">
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'01'"/>
                  <xsl:with-param name="select-value" select="time/day_of_month"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'02'"/>
                  <xsl:with-param name="select-value" select="time/day_of_month"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'03'"/>
                  <xsl:with-param name="select-value" select="time/day_of_month"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'04'"/>
                  <xsl:with-param name="select-value" select="time/day_of_month"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'05'"/>
                  <xsl:with-param name="select-value" select="time/day_of_month"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'06'"/>
                  <xsl:with-param name="select-value" select="time/day_of_month"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'07'"/>
                  <xsl:with-param name="select-value" select="time/day_of_month"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'08'"/>
                  <xsl:with-param name="select-value" select="time/day_of_month"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'09'"/>
                  <xsl:with-param name="select-value" select="time/day_of_month"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'10'"/>
                  <xsl:with-param name="select-value" select="time/day_of_month"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'11'"/>
                  <xsl:with-param name="select-value" select="time/day_of_month"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'12'"/>
                  <xsl:with-param name="select-value" select="time/day_of_month"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'13'"/>
                  <xsl:with-param name="select-value" select="time/day_of_month"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'14'"/>
                  <xsl:with-param name="select-value" select="time/day_of_month"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'15'"/>
                  <xsl:with-param name="select-value" select="time/day_of_month"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'16'"/>
                  <xsl:with-param name="select-value" select="time/day_of_month"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'17'"/>
                  <xsl:with-param name="select-value" select="time/day_of_month"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'18'"/>
                  <xsl:with-param name="select-value" select="time/day_of_month"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'19'"/>
                  <xsl:with-param name="select-value" select="time/day_of_month"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'20'"/>
                  <xsl:with-param name="select-value" select="time/day_of_month"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'21'"/>
                  <xsl:with-param name="select-value" select="time/day_of_month"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'22'"/>
                  <xsl:with-param name="select-value" select="time/day_of_month"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'23'"/>
                  <xsl:with-param name="select-value" select="time/day_of_month"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'24'"/>
                  <xsl:with-param name="select-value" select="time/day_of_month"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'25'"/>
                  <xsl:with-param name="select-value" select="time/day_of_month"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'26'"/>
                  <xsl:with-param name="select-value" select="time/day_of_month"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'27'"/>
                  <xsl:with-param name="select-value" select="time/day_of_month"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'28'"/>
                  <xsl:with-param name="select-value" select="time/day_of_month"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'29'"/>
                  <xsl:with-param name="select-value" select="time/day_of_month"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'30'"/>
                  <xsl:with-param name="select-value" select="time/day_of_month"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'31'"/>
                  <xsl:with-param name="select-value" select="time/day_of_month"/>
                </xsl:call-template>
              </select>
              <select name="month">
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'01'"/>
                  <xsl:with-param name="content" select="'Jan'"/>
                  <xsl:with-param name="select-value" select="time/month"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'02'"/>
                  <xsl:with-param name="content" select="'Feb'"/>
                  <xsl:with-param name="select-value" select="time/month"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'03'"/>
                  <xsl:with-param name="content" select="'Mar'"/>
                  <xsl:with-param name="select-value" select="time/month"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'04'"/>
                  <xsl:with-param name="content" select="'Apr'"/>
                  <xsl:with-param name="select-value" select="time/month"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'05'"/>
                  <xsl:with-param name="content" select="'May'"/>
                  <xsl:with-param name="select-value" select="time/month"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'06'"/>
                  <xsl:with-param name="content" select="'Jun'"/>
                  <xsl:with-param name="select-value" select="time/month"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'07'"/>
                  <xsl:with-param name="content" select="'Jul'"/>
                  <xsl:with-param name="select-value" select="time/month"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'08'"/>
                  <xsl:with-param name="content" select="'Aug'"/>
                  <xsl:with-param name="select-value" select="time/month"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'09'"/>
                  <xsl:with-param name="content" select="'Sep'"/>
                  <xsl:with-param name="select-value" select="time/month"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'10'"/>
                  <xsl:with-param name="content" select="'Oct'"/>
                  <xsl:with-param name="select-value" select="time/month"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'11'"/>
                  <xsl:with-param name="content" select="'Nov'"/>
                  <xsl:with-param name="select-value" select="time/month"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'12'"/>
                  <xsl:with-param name="content" select="'Dec'"/>
                  <xsl:with-param name="select-value" select="time/month"/>
                </xsl:call-template>
              </select>
              <select name="year">
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'2010'"/>
                  <xsl:with-param name="select-value" select="time/year"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'2011'"/>
                  <xsl:with-param name="select-value" select="time/year"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'2012'"/>
                  <xsl:with-param name="select-value" select="time/year"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'2013'"/>
                  <xsl:with-param name="select-value" select="time/year"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'2014'"/>
                  <xsl:with-param name="select-value" select="time/year"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'2015'"/>
                  <xsl:with-param name="select-value" select="time/year"/>
                </xsl:call-template>
              </select>
              (UTC)
            </td>
          </tr>
          <tr class="even">
            <td valign="top" width="125">Period (optional)</td>
            <td>
              <select name="period">
                <option value="00" selected="1">00</option>
                <option value="01">01</option>
                <option value="02">02</option>
                <option value="03">03</option>
                <option value="04">04</option>
                <option value="05">05</option>
                <option value="06">06</option>
                <option value="07">07</option>
                <option value="08">08</option>
                <option value="09">09</option>
                <option value="10">10</option>
                <option value="11">11</option>
                <option value="12">12</option>
                <option value="13">13</option>
                <option value="14">14</option>
                <option value="15">15</option>
                <option value="16">16</option>
                <option value="17">17</option>
                <option value="18">18</option>
                <option value="19">19</option>
                <option value="20">20</option>
                <option value="21">21</option>
                <option value="22">22</option>
                <option value="23">23</option>
                <option value="24">24</option>
              </select>
              <select name="period_unit">
                <option value="hour" selected="1">hour(s)</option>
                <option value="day">day(s)</option>
                <option value="week">week(s)</option>
                <option value="month">month(s)</option>
              </select>
            </td>
          </tr>
          <tr class="odd">
            <td valign="top" width="125">Duration (optional)</td>
            <td>
              <select name="duration">
                <option value="00" selected="1">00</option>
                <option value="01">01</option>
                <option value="02">02</option>
                <option value="03">03</option>
                <option value="04">04</option>
                <option value="05">05</option>
                <option value="06">06</option>
                <option value="07">07</option>
                <option value="08">08</option>
                <option value="09">09</option>
                <option value="10">10</option>
                <option value="11">11</option>
                <option value="12">12</option>
                <option value="13">13</option>
                <option value="14">14</option>
                <option value="15">15</option>
                <option value="16">16</option>
                <option value="17">17</option>
                <option value="18">18</option>
                <option value="19">19</option>
                <option value="20">20</option>
                <option value="21">21</option>
                <option value="22">22</option>
                <option value="23">23</option>
                <option value="24">24</option>
              </select>
              <select name="duration_unit">
                <option value="hour" selected="1">hour(s)</option>
                <option value="day">day(s)</option>
                <option value="week">week(s)</option>
              </select>
            </td>
          </tr>
          <tr class="even">
            <td colspan="2" style="text-align:right;">
              <input type="submit" name="submit" value="Create Schedule"/>
            </td>
          </tr>
        </table>
      </form>
    </div>
  </div>
</xsl:template>

<xsl:template name="html-schedules-table">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">Schedules
      <a href="/help/configure_schedules.html#schedules"
         title="Help: Configure Schedules (Schedules)">
        <img src="/img/help.png"/>
      </a>
    </div>
    <div class="gb_window_part_content_no_pad">
      <div id="tasks">
        <table class="gbntable" cellspacing="2" cellpadding="4" border="0">
          <tr class="gbntablehead2">
            <td>Name</td>
            <td>First Run</td>
            <td>Next Run</td>
            <td>Period</td>
            <td>Duration (s)</td>
            <td width="100">Actions</td>
          </tr>
          <xsl:apply-templates select="schedule"/>
        </table>
      </div>
    </div>
  </div>
</xsl:template>

<!--     CREATE_SCHEDULE_RESPONSE -->

<xsl:template match="create_schedule_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">Create Schedule</xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<!--     DELETE_SCHEDULE_RESPONSE -->

<xsl:template match="delete_schedule_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">
      Delete Schedule
    </xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<!--     SCHEDULE -->

<xsl:template name="interval-with-unit">
  <xsl:param name="interval">0</xsl:param>
  <xsl:choose>
    <xsl:when test="$interval mod (60 * 60 * 24 * 7) = 0">
      <xsl:value-of select="$interval div (60 * 60 * 24 * 7)"/>
      <xsl:choose>
        <xsl:when test="$interval = (60 * 60 * 24 * 7)">
          week
        </xsl:when>
        <xsl:otherwise>
          weeks
        </xsl:otherwise>
      </xsl:choose>
    </xsl:when>
    <xsl:when test="$interval mod (60 * 60 * 24) = 0">
      <xsl:value-of select="$interval div (60 * 60 * 24)"/>
      <xsl:choose>
        <xsl:when test="$interval = (60 * 60 * 24)">
          day
        </xsl:when>
        <xsl:otherwise>
          days
        </xsl:otherwise>
      </xsl:choose>
    </xsl:when>
    <xsl:when test="$interval mod (60 * 60) = 0">
      <xsl:value-of select="$interval div (60 * 60)"/>
      <xsl:choose>
        <xsl:when test="$interval = (60 * 60)">
          hour
        </xsl:when>
        <xsl:otherwise>
          hours
        </xsl:otherwise>
      </xsl:choose>
    </xsl:when>
    <xsl:when test="$interval mod (60) = 0">
      <xsl:value-of select="$interval div (60)"/>
      <xsl:choose>
        <xsl:when test="$interval = 60">
          min
        </xsl:when>
        <xsl:otherwise>
          mins
        </xsl:otherwise>
      </xsl:choose>
    </xsl:when>
    <xsl:when test="$interval = 1">
      <xsl:value-of select="$interval"/> sec
    </xsl:when>
    <xsl:otherwise>
      <xsl:value-of select="$interval"/> secs
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template match="schedule">
  <xsl:variable name="class">
    <xsl:choose>
      <xsl:when test="position() mod 2 = 0">even</xsl:when>
      <xsl:otherwise>odd</xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <tr class="{$class}">
    <td>
      <b><xsl:value-of select="name"/></b>
      <xsl:choose>
        <xsl:when test="comment != ''">
          <br/>(<xsl:value-of select="comment"/>)
        </xsl:when>
        <xsl:otherwise></xsl:otherwise>
      </xsl:choose>
    </td>
    <td>
      <xsl:value-of select="first_time"/>
    </td>
    <td>
      <xsl:choose>
        <xsl:when test="next_time &gt; 0">
          <xsl:value-of select="next_time"/>
        </xsl:when>
        <xsl:otherwise>-</xsl:otherwise>
      </xsl:choose>
    </td>
    <td>
      <xsl:choose>
        <xsl:when test="period = 0 and period_months = 0">
          Once
        </xsl:when>
        <xsl:when test="period = 0 and period_months = 1">
          1 month
        </xsl:when>
        <xsl:when test="period = 0">
          <xsl:value-of select="period_months"/> months
        </xsl:when>
        <xsl:otherwise>
          <xsl:call-template name="interval-with-unit">
            <xsl:with-param name="interval">
              <xsl:value-of select="period"/>
            </xsl:with-param>
          </xsl:call-template>
        </xsl:otherwise>
      </xsl:choose>
    </td>
    <td>
      <xsl:choose>
        <xsl:when test="duration = 0">
          Entire Operation
        </xsl:when>
        <xsl:otherwise>
          <xsl:call-template name="interval-with-unit">
            <xsl:with-param name="interval">
              <xsl:value-of select="duration"/>
            </xsl:with-param>
          </xsl:call-template>
        </xsl:otherwise>
      </xsl:choose>
    </td>
    <td>
      <xsl:choose>
        <xsl:when test="in_use='0'">
          <a href="/omp?cmd=delete_schedule&amp;schedule_id={@id}"
             title="Delete Schedule" style="margin-left:3px;">
            <img src="/img/delete.png" border="0" alt="Delete"/>
          </a>
        </xsl:when>
        <xsl:otherwise>
          <img src="/img/delete_inactive.png"
               border="0"
               alt="Delete"
               style="margin-left:3px;"/>
        </xsl:otherwise>
      </xsl:choose>
      <a href="/omp?cmd=get_schedule&amp;schedule_id={@id}"
         title="Schedule Details" style="margin-left:3px;">
        <img src="/img/details.png" border="0" alt="Details"/>
      </a>
    </td>
  </tr>
</xsl:template>

<xsl:template match="schedule" mode="details">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">
       Schedule Details
       <a href="/help/configure_schedules.html#scheduledetails"
         title="Help: Configure Schedules (Schedule Details)">
         <img src="/img/help.png"/>
       </a>
    </div>
    <div class="gb_window_part_content">
      <div class="float_right">
        <a href="?cmd=get_schedules">Back to Schedules</a>
      </div>
      <table>
        <tr>
          <td><b>Name:</b></td>
          <td><b><xsl:value-of select="name"/></b></td>
        </tr>
        <tr>
          <td>Comment:</td>
          <td><xsl:value-of select="comment"/></td>
        </tr>
        <tr>
          <td>First time:</td>
          <td><xsl:value-of select="first_time"/></td>
        </tr>
        <tr>
          <td>Next time:</td>
          <td><xsl:value-of select="next_time"/></td>
        </tr>
        <tr>
          <td>Period:</td>
          <td>
            <xsl:choose>
              <xsl:when test="period = 0 and period_months = 0">
                Once
              </xsl:when>
              <xsl:when test="period = 0 and period_months = 1">
                1 month
              </xsl:when>
              <xsl:when test="period = 0">
                <xsl:value-of select="period_months"/> months
              </xsl:when>
              <xsl:otherwise>
                <xsl:call-template name="interval-with-unit">
                  <xsl:with-param name="interval">
                    <xsl:value-of select="period"/>
                  </xsl:with-param>
                </xsl:call-template>
              </xsl:otherwise>
            </xsl:choose>
          </td>
        </tr>
        <tr>
          <td>Duration:</td>
          <td>
            <xsl:choose>
              <xsl:when test="duration = 0">
                Entire Operation
              </xsl:when>
              <xsl:otherwise>
                <xsl:call-template name="interval-with-unit">
                  <xsl:with-param name="interval">
                    <xsl:value-of select="duration"/>
                  </xsl:with-param>
                </xsl:call-template>
              </xsl:otherwise>
            </xsl:choose>
          </td>
        </tr>
      </table>

      <xsl:choose>
        <xsl:when test="count(tasks/task) = 0">
          <h1>Tasks using this Schedule: None</h1>
        </xsl:when>
        <xsl:otherwise>
          <h1>Tasks using this Schedule</h1>
          <table class="gbntable" cellspacing="2" cellpadding="4">
            <tr class="gbntablehead2">
              <td>Name</td>
              <td>Actions</td>
            </tr>
            <xsl:for-each select="tasks/task">
              <xsl:variable name="class">
                <xsl:choose>
                  <xsl:when test="position() mod 2 = 0">even</xsl:when>
                  <xsl:otherwise>odd</xsl:otherwise>
                </xsl:choose>
              </xsl:variable>
              <tr class="{$class}">
                <td><xsl:value-of select="name"/></td>
                <td width="100">
                  <a href="/omp?cmd=get_tasks&amp;task_id={@id}" title="Details">
                    <img src="/img/details.png"
                         border="0"
                         alt="Details"
                         style="margin-left:3px;"/>
                  </a>
                </td>
              </tr>
            </xsl:for-each>
          </table>
        </xsl:otherwise>
      </xsl:choose>
    </div>
  </div>
</xsl:template>

<!--     GET_SCHEDULE -->

<xsl:template match="get_schedule">
  <xsl:apply-templates select="gsad_msg"/>
  <xsl:apply-templates select="commands_response/delete_schedule_response"/>
  <xsl:apply-templates select="get_schedules_response/schedule" mode="details"/>
</xsl:template>

<!--     GET_SCHEDULES -->

<xsl:template match="get_schedules">
  <xsl:apply-templates select="gsad_msg"/>
  <xsl:apply-templates select="commands_response/delete_schedule_response"/>
  <xsl:apply-templates select="create_schedule_response"/>
  <xsl:call-template name="html-create-schedule-form"/>
  <!-- The for-each makes the get_schedules_response the current node. -->
  <xsl:for-each select="get_schedules_response | commands_response/get_schedules_response">
    <xsl:call-template name="html-schedules-table"/>
  </xsl:for-each>
</xsl:template>

<!-- END SCHEDULES MANAGEMENT -->

<!-- BEGIN SLAVES MANAGEMENT -->

<xsl:template name="html-create-slave-form">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">New Slave
      <a href="/help/configure_slaves.html#newslave"
         title="Help: Configure Slaves (New Slave)">
        <img src="/img/help.png"/>
      </a>
    </div>
    <div class="gb_window_part_content">
      <form action="/omp" method="post" enctype="multipart/form-data">
        <input type="hidden" name="cmd" value="create_slave"/>
        <table border="0" cellspacing="0" cellpadding="3" width="100%">
          <tr>
            <td valign="top" width="125">Name
            </td>
            <td>
              <input type="text" name="name" value="unnamed" size="30"
                     maxlength="80"/>
            </td>
          </tr>
          <tr>
            <td valign="top" width="125">Comment (optional)</td>
            <td>
              <input type="text" name="comment" size="30" maxlength="400"/>
            </td>
          </tr>
          <tr>
            <td valign="top" width="125">Host</td>
            <td>
              <input type="text" name="host" value="localhost" size="30"
                      maxlength="80"/>
            </td>
          </tr>
          <tr>
            <td valign="top" width="125">Port</td>
            <td>
              <input type="text" name="port" value="9390" size="30"
                     maxlength="80"/>
            </td>
          </tr>
          <tr>
            <td valign="top" width="125">Login</td>
            <td>
              <input type="text" name="login" value="" size="30"
                     maxlength="80"/>
            </td>
          </tr>
          <tr>
            <td valign="top" width="125">Password</td>
            <td>
              <input type="password" name="password" value="" size="30"
                     maxlength="40"/>
            </td>
          </tr>
          <tr>
            <td colspan="2" style="text-align:right;">
              <input type="submit" name="submit" value="Create Slave"/>
            </td>
          </tr>
        </table>
      </form>
    </div>
  </div>
</xsl:template>

<xsl:template name="html-slaves-table">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">Slaves
      <a href="/help/configure_slaves.html#slaves"
         title="Help: Configure Slaves (Slaves)">
        <img src="/img/help.png"/>
      </a>
    </div>
    <div class="gb_window_part_content_no_pad">
      <div id="tasks">
        <table class="gbntable" cellspacing="2" cellpadding="4" border="0">
          <tr class="gbntablehead2">
            <td>Name</td>
            <td>Host</td>
            <td>Port</td>
            <td>Login</td>
            <td width="100">Actions</td>
          </tr>
          <xsl:apply-templates select="slave"/>
        </table>
      </div>
    </div>
  </div>
</xsl:template>

<!--     CREATE_SLAVE_RESPONSE -->

<xsl:template match="create_slave_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">Create Slave</xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<!--     DELETE_SLAVE_RESPONSE -->

<xsl:template match="delete_slave_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">
      Delete Slave
    </xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<!--     SLAVE -->

<xsl:template match="slave">
  <xsl:variable name="class">
    <xsl:choose>
      <xsl:when test="position() mod 2 = 0">even</xsl:when>
      <xsl:otherwise>odd</xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <tr class="{$class}">
    <td>
      <b><xsl:value-of select="name"/></b>
      <xsl:choose>
        <xsl:when test="comment != ''">
          <br/>(<xsl:value-of select="comment"/>)
        </xsl:when>
        <xsl:otherwise></xsl:otherwise>
      </xsl:choose>
    </td>
    <td><xsl:value-of select="host"/></td>
    <td><xsl:value-of select="port"/></td>
    <td><xsl:value-of select="login"/></td>
    <td>
      <xsl:choose>
        <xsl:when test="in_use='0'">
          <a href="/omp?cmd=delete_slave&amp;slave_id={@id}"
             title="Delete Slave" style="margin-left:3px;">
            <img src="/img/delete.png" border="0" alt="Delete"/>
          </a>
        </xsl:when>
        <xsl:otherwise>
          <img src="/img/delete_inactive.png"
               border="0"
               alt="Delete"
               style="margin-left:3px;"/>
        </xsl:otherwise>
      </xsl:choose>
      <a href="/omp?cmd=get_slave&amp;slave_id={@id}"
         title="Slave Details" style="margin-left:3px;">
        <img src="/img/details.png" border="0" alt="Details"/>
      </a>
    </td>
  </tr>
</xsl:template>

<xsl:template match="slave" mode="details">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">
       Slave Details
       <a href="/help/configure_slaves.html#slavedetails"
         title="Help: Configure Slaves (Slave Details)">
         <img src="/img/help.png"/>
       </a>
    </div>
    <div class="gb_window_part_content">
      <div class="float_right">
        <a href="?cmd=get_slaves">Back to Slaves</a>
      </div>
      <table>
        <tr>
          <td><b>Name:</b></td>
          <td><b><xsl:value-of select="name"/></b></td>
        </tr>
        <tr>
          <td>Comment:</td>
          <td><xsl:value-of select="comment"/></td>
        </tr>
        <tr>
          <td>Host:</td>
          <td><xsl:value-of select="host"/></td>
        </tr>
        <tr>
          <td>Port:</td>
          <td><xsl:value-of select="port"/></td>
        </tr>
        <tr>
          <td>Login:</td>
          <td><xsl:value-of select="login"/></td>
        </tr>
      </table>

      <xsl:choose>
        <xsl:when test="count(tasks/task) = 0">
          <h1>Tasks using this Slave: None</h1>
        </xsl:when>
        <xsl:otherwise>
          <h1>Tasks using this Slave</h1>
          <table class="gbntable" cellspacing="2" cellpadding="4">
            <tr class="gbntablehead2">
              <td>Name</td>
              <td>Actions</td>
            </tr>
            <xsl:for-each select="tasks/task">
              <xsl:variable name="class">
                <xsl:choose>
                  <xsl:when test="position() mod 2 = 0">even</xsl:when>
                  <xsl:otherwise>odd</xsl:otherwise>
                </xsl:choose>
              </xsl:variable>
              <tr class="{$class}">
                <td><xsl:value-of select="name"/></td>
                <td width="100">
                  <a href="/omp?cmd=get_tasks&amp;task_id={@id}" title="Details">
                    <img src="/img/details.png"
                         border="0"
                         alt="Details"
                         style="margin-left:3px;"/>
                  </a>
                </td>
              </tr>
            </xsl:for-each>
          </table>
        </xsl:otherwise>
      </xsl:choose>
    </div>
  </div>
</xsl:template>

<!--     GET_SLAVE -->

<xsl:template match="get_slave">
  <xsl:apply-templates select="gsad_msg"/>
  <xsl:apply-templates select="commands_response/delete_slave_response"/>
  <xsl:apply-templates select="get_slaves_response/slave" mode="details"/>
</xsl:template>

<!--     GET_SLAVES -->

<xsl:template match="get_slaves">
  <xsl:apply-templates select="gsad_msg"/>
  <xsl:apply-templates select="commands_response/delete_slave_response"/>
  <xsl:apply-templates select="create_slave_response"/>
  <xsl:call-template name="html-create-slave-form"/>
  <!-- The for-each makes the get_slaves_response the current node. -->
  <xsl:for-each select="get_slaves_response | commands_response/get_slaves_response">
    <xsl:call-template name="html-slaves-table"/>
  </xsl:for-each>
</xsl:template>

<!-- END SLAVES MANAGEMENT -->

<!-- BEGIN NVT DETAILS -->

<xsl:template match="nvt">
  <table>
    <tr><td><b>Name:</b></td><td><b><xsl:value-of select="name"/></b></td></tr>
    <tr><td>Summary:</td><td><xsl:value-of select="summary"/></td></tr>
    <tr><td>Family:</td><td><xsl:value-of select="family"/></td></tr>
    <tr><td>OID:</td><td><xsl:value-of select="@oid"/></td></tr>
    <tr>
      <td>CVE:</td>
      <td>
        <!-- "NOCVE" means no CVE ID, skip. -->
        <xsl:choose>
          <xsl:when test="cve_id = 'NOCVE'">
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="cve_id"/>
          </xsl:otherwise>
        </xsl:choose>
      </td>
    </tr>
    <tr>
      <td>Bugtraq ID:</td>
      <td>
        <!-- "NOBID" means no Bugtraq ID, skip. -->
        <xsl:choose>
          <xsl:when test="bugtraq_id = 'NOBID'">
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="bugtraq_id"/>
          </xsl:otherwise>
        </xsl:choose>
      </td>
    </tr>
    <tr>
      <td>Other references:</td>
      <td>
        <!-- "NOXREF" means no xrefs, skip. -->
        <xsl:choose>
          <xsl:when test="xrefs = 'NOXREF'">
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="xrefs"/>
          </xsl:otherwise>
        </xsl:choose>
      </td>
    </tr>
    <tr>
      <td>Tags:</td>
      <td>
        <!-- "NOTAG" means no tags, skip. -->
        <xsl:choose>
          <xsl:when test="tags = 'NOTAG'">
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="tags"/>
          </xsl:otherwise>
        </xsl:choose>
      </td>
    </tr>
    <tr>
      <td>CVSS base:</td>
      <td><xsl:value-of select="cvss_base"/></td>
    </tr>
    <tr>
      <td>Risk factor:</td>
      <td><xsl:value-of select="risk_factor"/></td>
    </tr>
  </table>

  <h1>Description</h1>
  <pre><xsl:value-of select="description"/></pre>
</xsl:template>

<xsl:template match="get_notes_response">
</xsl:template>

<xsl:template match="get_overrides_response">
</xsl:template>

<xsl:template match="get_nvts">
  <xsl:apply-templates select="gsad_msg"/>
  <xsl:apply-templates select="commands_response/delete_note_response"/>
  <xsl:apply-templates select="commands_response/delete_override_response"/>
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">NVT Details
      <a href="/help/nvts.html#nvtdetails"
         title="Help: NVTS (NVT Details)">
        <img src="/img/help.png"/>
      </a>
    </div>
    <div class="gb_window_part_content">
      <xsl:apply-templates
        select="commands_response/get_nvts_response/nvt"/>
      <xsl:choose>
        <xsl:when test="count(commands_response/get_notes_response/note) = 0">
          <h1>Notes: None</h1>
        </xsl:when>
        <xsl:otherwise>
          <h1>Notes</h1>
          <table class="gbntable" cellspacing="2" cellpadding="4" border="0">
            <tr class="gbntablehead2">
              <td>Text</td>
              <td width="100">Actions</td>
            </tr>
            <xsl:apply-templates select="commands_response/get_notes_response/note"
                                 mode="nvt-details"/>
          </table>
        </xsl:otherwise>
      </xsl:choose>
      <xsl:choose>
        <xsl:when test="count(commands_response/get_overrides_response/override) = 0">
          <h1>Overrides: None</h1>
        </xsl:when>
        <xsl:otherwise>
          <h1>Overrides</h1>
          <table class="gbntable" cellspacing="2" cellpadding="4" border="0">
            <tr class="gbntablehead2">
              <td>New Threat</td>
              <td>Text</td>
              <td width="100">Actions</td>
            </tr>
            <xsl:apply-templates
              select="commands_response/get_overrides_response/override"
              mode="nvt-details"/>
          </table>
        </xsl:otherwise>
      </xsl:choose>
    </div>
  </div>
</xsl:template>

<!-- END NVT DETAILS -->

<!-- BEGIN NOTES MANAGEMENT -->

<xsl:template name="html-create-note-form">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">New Note
      <a href="/help/notes.html#newnote"
         title="Help: Notes (New Note)">
        <img src="/img/help.png"/>
      </a>
    </div>
    <div class="gb_window_part_content">
      <form action="/omp#result-{result/@id}"
            method="post"
            enctype="multipart/form-data">
        <input type="hidden" name="cmd" value="create_note"/>
        <input type="hidden" name="oid" value="{nvt/@id}"/>
        <input type="hidden" name="report_id" value="{report/@id}"/>
        <input type="hidden" name="first_result" value="{first_result}"/>
        <input type="hidden" name="sort_field" value="{sort_field}"/>
        <input type="hidden" name="sort_order" value="{sort_order}"/>
        <input type="hidden" name="levels" value="{levels}"/>
        <input type="hidden" name="search_phrase" value="{search_phrase}"/>
        <input type="hidden" name="min_cvss_base" value="{min_cvss_base}"/>
        <input type="hidden" name="apply_min_cvss_base" value="{string-length (min_cvss_base) &gt; 0}"/>
        <input type="hidden" name="notes" value="{notes}"/>
        <input type="hidden" name="overrides" value="{overrides}"/>
        <input type="hidden" name="result_hosts_only" value="{result_hosts_only}"/>
        <table border="0" cellspacing="0" cellpadding="3" width="100%">
          <tr>
            <td valign="top" width="125">
              Hosts
            </td>
            <td>
              <input type="radio" name="hosts" value=""/>
              Any
              <input type="radio" name="hosts" value="{hosts}" checked="1"/>
              <xsl:value-of select="hosts"/>
            </td>
          </tr>
          <tr>
            <td valign="top" width="125">
              Port
            </td>
            <td>
              <input type="radio" name="port" value=""/>
              Any
              <input type="radio" name="port" value="{port}" checked="1"/>
              <xsl:value-of select="port"/>
            </td>
          </tr>
          <tr>
            <td valign="top" width="125">
              Threat
            </td>
            <td>
              <input type="radio" name="threat" value=""/>
              Any
              <input type="radio" name="threat" value="{threat}" checked="1"/>
              <xsl:value-of select="threat"/>
            </td>
          </tr>
          <tr>
            <td valign="top" width="125">
              Task
            </td>
            <td>
              <input type="radio" name="task_id" value=""/>
              Any
              <input type="radio" name="task_id" value="{task/@id}"
                     checked="1"/>
              <xsl:value-of select="task/name"/>
            </td>
          </tr>
          <tr>
            <td valign="top" width="125">
              Result
            </td>
            <td>
              <input type="radio" name="result_id" value="" checked="1"/>
              Any
              <input type="radio" name="result_id" value="{result/@id}"/>
              <xsl:value-of select="result/@id"/>
            </td>
          </tr>
          <tr>
            <td valign="top" width="125">Text</td>
            <td>
              <textarea name="text" rows="10" cols="60"/>
            </td>
          </tr>
          <tr>
            <td colspan="2" style="text-align:right;">
              <input type="submit" name="submit" value="Create Note"/>
            </td>
          </tr>
        </table>
      </form>
      <h3>
        Associated Result
      </h3>
      <xsl:for-each select="get_results_response/results/result">
        <xsl:call-template name="result-detailed">
          <xsl:with-param name="override-buttons">0</xsl:with-param>
          <xsl:with-param name="note-buttons">0</xsl:with-param>
        </xsl:call-template>
      </xsl:for-each>
    </div>
  </div>
</xsl:template>

<xsl:template match="new_note">
  <xsl:apply-templates select="gsad_msg"/>
  <xsl:call-template name="html-create-note-form"/>
</xsl:template>

<xsl:template name="html-edit-note-form">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">Edit Note
      <a href="/help/notes.html#editnote"
         title="Help: Notes (Edit Note)">
        <img src="/img/help.png"/>
      </a>
      <a href="/omp?cmd=get_note&amp;note_id={get_notes_response/note/@id}"
         title="Note Details"
         style="margin-left:3px;">
        <img src="/img/details.png"/>
      </a>
    </div>
    <div class="gb_window_part_content">
      <form action="" method="get">
        <input type="hidden" name="cmd" value="save_note"/>
        <input type="hidden" name="note_id"
               value="{get_notes_response/note/@id}"/>

        <input type="hidden" name="next" value="{next}"/>

        <!-- get_report params. -->
        <input type="hidden" name="report_id" value="{report/@id}"/>
        <input type="hidden" name="first_result" value="{first_result}"/>
        <input type="hidden" name="sort_field" value="{sort_field}"/>
        <input type="hidden" name="sort_order" value="{sort_order}"/>
        <input type="hidden" name="levels" value="{levels}"/>
        <input type="hidden" name="notes" value="{notes}"/>
        <input type="hidden" name="overrides" value="{overrides}"/>
        <input type="hidden" name="result_hosts_only" value="{result_hosts_only}"/>
        <input type="hidden" name="search_phrase" value="{search_phrase}"/>
        <input type="hidden" name="min_cvss_base" value="{min_cvss_base}"/>
        <input type="hidden" name="apply_min_cvss_base" value="{string-length (min_cvss_base) &gt; 0}"/>

        <!-- get_nvts param. -->
        <input type="hidden" name="oid" value="{nvt/@id}"/>

        <!-- get_tasks param. -->
        <input type="hidden" name="task_id" value="{task/@id}"/>

        <table border="0" cellspacing="0" cellpadding="3" width="100%">
          <tr>
            <td><b>NVT Name</b></td>
            <td>
              <xsl:variable name="nvt" select="get_notes_response/note/nvt"/>
              <a href="?cmd=get_nvts&amp;oid={$nvt/@oid}">
                <xsl:variable name="max" select="70"/>
                <xsl:choose>
                  <xsl:when test="string-length($nvt/name) &gt; $max">
                    <xsl:value-of select="substring($nvt/name, 0, $max)"/>...
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:value-of select="$nvt/name"/>
                  </xsl:otherwise>
                </xsl:choose>
              </a>
            </td>
          </tr>
          <tr>
            <td valign="top" width="125">
              Hosts
            </td>
            <td>
              <xsl:choose>
                <xsl:when test="string-length (get_notes_response/note/hosts) = 0">
                  <input type="radio" name="hosts" value="" checked="1"
                         readonly="1"/>
                  Any
                </xsl:when>
                <xsl:otherwise>
                  <input type="radio" name="hosts" value=""/>
                  Any
                  <input type="radio" name="hosts" value="{get_notes_response/note/hosts}"
                         checked="1"/>
                  <xsl:value-of select="get_notes_response/note/hosts"/>
                </xsl:otherwise>
              </xsl:choose>
            </td>
          </tr>
          <tr>
            <td valign="top" width="125">
              Port
            </td>
            <td>
              <xsl:choose>
                <xsl:when test="string-length (get_notes_response/note/port) = 0">
                  <input type="radio" name="port" value="" checked="1"
                         readonly="1"/>
                  Any
                </xsl:when>
                <xsl:otherwise>
                  <input type="radio" name="port" value=""/>
                  Any
                  <input type="radio" name="port" value="{get_notes_response/note/port}" checked="1"/>
                  <xsl:value-of select="get_notes_response/note/port"/>
                </xsl:otherwise>
              </xsl:choose>
            </td>
          </tr>
          <tr>
            <td valign="top" width="125">
              Threat
            </td>
            <td>
              <xsl:choose>
                <xsl:when test="string-length (get_notes_response/note/threat) = 0">
                  <input type="radio" name="threat" value="" checked="1"
                         readonly="1"/>
                  Any
                </xsl:when>
                <xsl:otherwise>
                  <input type="radio" name="threat" value=""/>
                  Any
                  <input type="radio" name="threat" value="{get_notes_response/note/threat}"
                         checked="1"/>
                  <xsl:value-of select="get_notes_response/note/threat"/>
                </xsl:otherwise>
              </xsl:choose>
            </td>
          </tr>
          <tr>
            <td valign="top" width="125">
              Task
            </td>
            <td>
              <xsl:choose>
                <xsl:when test="string-length (get_notes_response/note/task/@id) = 0">
                  <input type="radio" name="note_task_id" value="" checked="1"
                         readonly="1"/>
                  Any
                </xsl:when>
                <xsl:otherwise>
                  <input type="radio" name="note_task_id" value=""/>
                  Any
                  <input type="radio" name="note_task_id" value="{get_notes_response/note/task/@id}"
                         checked="1"/>
                  <xsl:value-of select="get_notes_response/note/task/name"/>
                </xsl:otherwise>
              </xsl:choose>
            </td>
          </tr>
          <tr>
            <td valign="top" width="125">
              Result
            </td>
            <td>
              <xsl:choose>
                <xsl:when test="string-length (get_notes_response/note/result/@id) = 0">
                  <input type="radio" name="note_result_id" value="" checked="1"
                         readonly="1"/>
                  Any
                </xsl:when>
                <xsl:otherwise>
                  <input type="radio" name="note_result_id" value=""/>
                  Any
                  <input type="radio" name="note_result_id"
                         value="{get_notes_response/note/result/@id}" checked="1"/>
                  <xsl:value-of select="get_notes_response/note/result/@id"/>
                </xsl:otherwise>
              </xsl:choose>
            </td>
          </tr>
          <tr>
            <td valign="top" width="125">Text</td>
            <td>
              <textarea name="text" rows="10" cols="60"><xsl:value-of select="get_notes_response/note/text"/></textarea>
            </td>
          </tr>
          <tr>
            <td colspan="2" style="text-align:right;">
              <input type="submit" name="submit" value="Save Note"/>
            </td>
          </tr>
        </table>
      </form>
      <xsl:choose>
        <xsl:when test="string-length(get_notes_response/note/result/@id) = 0">
          <h3>Associated Result: Any</h3>
        </xsl:when>
        <xsl:otherwise>
          <h3>
            Associated Result
          </h3>
          <xsl:for-each select="get_notes_response/note/result">
            <xsl:call-template name="result-detailed">
              <xsl:with-param name="note-buttons">0</xsl:with-param>
              <xsl:with-param name="override-buttons">0</xsl:with-param>
            </xsl:call-template>
          </xsl:for-each>
        </xsl:otherwise>
      </xsl:choose>
    </div>
  </div>
</xsl:template>

<xsl:template match="edit_note">
  <xsl:apply-templates select="gsad_msg"/>
  <xsl:call-template name="html-edit-note-form"/>
</xsl:template>

<xsl:template match="modify_note_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">Save Note</xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<xsl:template name="note" match="note">
  <xsl:param name="next">get_notes</xsl:param>
  <xsl:variable name="class">
    <xsl:choose>
      <xsl:when test="position() mod 2 = 0">even</xsl:when>
      <xsl:otherwise>odd</xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <tr class="{$class}">
    <td>
      <xsl:variable name="max" select="35"/>
      <xsl:choose>
        <xsl:when test="string-length(nvt/name) &gt; $max">
          <xsl:value-of select="substring(nvt/name, 0, $max)"/>...
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="nvt/name"/>
        </xsl:otherwise>
      </xsl:choose>
    </td>
    <td>
      <xsl:if test="orphan = 1"><b>Orphan</b><br/></xsl:if>
      <xsl:choose>
        <xsl:when test="text/@excerpt = 1">
          <xsl:value-of select="text/text()"/>...
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="text/text()"/>
        </xsl:otherwise>
      </xsl:choose>
    </td>
    <td>
      <a href="/omp?cmd=delete_note&amp;note_id={@id}&amp;next={$next}"
         title="Delete Note" style="margin-left:3px;">
        <img src="/img/delete.png" border="0" alt="Delete"/>
      </a>
      <a href="/omp?cmd=get_note&amp;note_id={@id}"
         title="Note Details" style="margin-left:3px;">
        <img src="/img/details.png" border="0" alt="Details"/>
      </a>
      <a href="/omp?cmd=edit_note&amp;note_id={@id}&amp;next={$next}"
         title="Edit Note"
         style="margin-left:3px;">
        <img src="/img/edit.png" border="0" alt="Edit"/>
      </a>
    </td>
  </tr>
</xsl:template>

<xsl:template match="note" mode="nvt-details">
  <xsl:variable name="class">
    <xsl:choose>
      <xsl:when test="position() mod 2 = 0">even</xsl:when>
      <xsl:otherwise>odd</xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <tr class="{$class}">
    <td>
      <xsl:if test="orphan = 1"><b>Orphan</b><br/></xsl:if>
      <xsl:choose>
        <xsl:when test="text/@excerpt = 1">
          <xsl:value-of select="text/text()"/>...
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="text/text()"/>
        </xsl:otherwise>
      </xsl:choose>
    </td>
    <td>
      <a href="/omp?cmd=delete_note&amp;note_id={@id}&amp;next=get_nvts&amp;oid={../../get_nvts_response/nvt/@oid}"
         title="Delete Note" style="margin-left:3px;">
        <img src="/img/delete.png" border="0" alt="Delete"/>
      </a>
      <a href="/omp?cmd=get_note&amp;note_id={@id}"
         title="Note Details" style="margin-left:3px;">
        <img src="/img/details.png" border="0" alt="Details"/>
      </a>
      <a href="/omp?cmd=edit_note&amp;note_id={@id}&amp;next=get_nvts&amp;oid={../../get_nvts_response/nvt/@oid}"
         title="Edit Note"
         style="margin-left:3px;">
        <img src="/img/edit.png" border="0" alt="Edit"/>
      </a>
    </td>
  </tr>
</xsl:template>

<xsl:template match="note" mode="details">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">
      Note Details
      <a href="/help/notes.html#notedetails"
        title="Help: Notes (Note Details)">
        <img src="/img/help.png"/>
      </a>
      <a href="/omp?cmd=edit_note&amp;note_id={@id}&amp;next=get_note"
         title="Edit Note"
         style="margin-left:3px;">
        <img src="/img/edit.png"/>
      </a>
    </div>
    <div class="gb_window_part_content">
      <div class="float_right">
        <a href="?cmd=get_notes">Back to Notes</a>
      </div>
      <table>
        <tr>
          <td><b>NVT Name:</b></td>
          <td>
            <a href="?cmd=get_nvts&amp;oid={nvt/@oid}">
              <xsl:variable name="max" select="70"/>
              <xsl:choose>
                <xsl:when test="string-length(nvt/name) &gt; $max">
                  <xsl:value-of select="substring(nvt/name, 0, $max)"/>...
                </xsl:when>
                <xsl:otherwise>
                  <xsl:value-of select="nvt/name"/>
                </xsl:otherwise>
              </xsl:choose>
            </a>
          </td>
        </tr>
        <tr>
          <td>NVT OID:</td>
          <td><xsl:value-of select="nvt/@oid"/></td>
        </tr>
        <tr>
          <td>Created:</td>
          <td><xsl:value-of select="creation_time"/></td>
        </tr>
        <tr>
          <td>Last Modified:</td>
          <td><xsl:value-of select="modification_time"/></td>
        </tr>
      </table>

      <h1>Application</h1>
      <table>
        <tr>
          <td>Hosts:</td>
          <td>
            <xsl:choose>
              <xsl:when test="string-length(hosts) &gt; 0">
                <xsl:value-of select="hosts"/>
              </xsl:when>
              <xsl:otherwise>
                Any
              </xsl:otherwise>
            </xsl:choose>
          </td>
        </tr>
        <tr>
          <td>Port:</td>
          <td>
            <xsl:choose>
              <xsl:when test="string-length(port) &gt; 0">
                <xsl:value-of select="port"/>
              </xsl:when>
              <xsl:otherwise>
                Any
              </xsl:otherwise>
            </xsl:choose>
          </td>
        </tr>
        <tr>
          <td>Threat:</td>
          <td>
            <xsl:choose>
              <xsl:when test="string-length(threat) &gt; 0">
                <xsl:value-of select="threat"/>
              </xsl:when>
              <xsl:otherwise>
                Any
              </xsl:otherwise>
            </xsl:choose>
          </td>
        </tr>
        <tr>
          <td>Task:</td>
          <td>
            <xsl:choose>
              <xsl:when test="orphan != 0">
                <b>Orphan</b>
              </xsl:when>
              <xsl:when test="task and string-length(task/@id) &gt; 0">
                <a href="?cmd=get_tasks&amp;task_id={task/@id}">
                  <xsl:value-of select="task/name"/>
                </a>
              </xsl:when>
              <xsl:otherwise>
                Any
              </xsl:otherwise>
            </xsl:choose>
          </td>
        </tr>
        <tr>
          <td>Result:</td>
          <td>
            <xsl:choose>
              <xsl:when test="orphan != 0">
                <b>Orphan</b>
              </xsl:when>
              <xsl:when test="string-length(result/@id) &gt; 0">
                <xsl:value-of select="result/@id"/>
              </xsl:when>
              <xsl:otherwise>
                Any
              </xsl:otherwise>
            </xsl:choose>
          </td>
        </tr>
      </table>

      <h1>Appearance</h1>
      <div class="note_top_line"></div>
      <xsl:call-template name="note-detailed">
        <xsl:with-param name="note-buttons">0</xsl:with-param>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template name="html-notes-table">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">Notes
      <a href="/help/notes.html"
         title="Help: Notes">
        <img src="/img/help.png"/>
      </a>
    </div>
    <div class="gb_window_part_content_no_pad">
      <div id="notes">
        <table class="gbntable" cellspacing="2" cellpadding="4" border="0">
          <tr class="gbntablehead2">
            <td>NVT</td>
            <td>Text</td>
            <td width="100">Actions</td>
          </tr>
          <xsl:apply-templates select="note"/>
        </table>
      </div>
    </div>
  </div>
</xsl:template>

<xsl:template match="get_note">
  <xsl:apply-templates select="gsad_msg"/>
  <xsl:choose>
    <xsl:when test="commands_reponse/get_notes_response/@status = '500'">
      <xsl:call-template name="command_result_dialog">
        <xsl:with-param name="operation">
          Get Note
        </xsl:with-param>
        <xsl:with-param name="status">
          <xsl:value-of select="500"/>
        </xsl:with-param>
        <xsl:with-param name="msg">
          <xsl:value-of select="commands_response/get_notes_response/@status_text"/>
        </xsl:with-param>
      </xsl:call-template>
    </xsl:when>
    <xsl:otherwise>
      <xsl:apply-templates select="commands_response/get_notes_response/note" mode="details"/>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template match="modify_note_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">
      Modify Note
    </xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<xsl:template match="get_notes">
  <xsl:apply-templates select="gsad_msg"/>
  <xsl:apply-templates select="commands_response/delete_note_response"/>
  <xsl:apply-templates select="commands_response/modify_note_response"/>
  <xsl:choose>
    <xsl:when test="commands_response/get_notes_response/@status = '500'">
      <xsl:call-template name="command_result_dialog">
        <xsl:with-param name="operation">
          Get Notes
        </xsl:with-param>
        <xsl:with-param name="status">
          <xsl:value-of select="500"/>
        </xsl:with-param>
        <xsl:with-param name="msg">
          <xsl:value-of select="commands_response/get_notes_response/@status_text"/>
        </xsl:with-param>
      </xsl:call-template>
    </xsl:when>
    <xsl:otherwise>
      <!-- The for-each makes the get_notes_response the current node. -->
      <xsl:for-each select="commands_response/get_notes_response">
        <xsl:call-template name="html-notes-table"/>
      </xsl:for-each>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<!-- END NOTES MANAGEMENT -->

<!-- BEGIN OVERRIDES MANAGEMENT -->

<xsl:template name="html-create-override-form">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">New Override
      <a href="/help/overrides.html#newoverride"
         title="Help: Overrides (New Override)">
        <img src="/img/help.png"/>
      </a>
    </div>
    <div class="gb_window_part_content">
      <form action="/omp#result-{result/@id}"
            method="post"
            enctype="multipart/form-data">
        <input type="hidden" name="cmd" value="create_override"/>
        <input type="hidden" name="oid" value="{nvt/@id}"/>
        <input type="hidden" name="report_id" value="{report/@id}"/>
        <input type="hidden" name="first_result" value="{first_result}"/>
        <input type="hidden" name="sort_field" value="{sort_field}"/>
        <input type="hidden" name="sort_order" value="{sort_order}"/>
        <input type="hidden" name="levels" value="{levels}"/>
        <input type="hidden" name="search_phrase" value="{search_phrase}"/>
        <input type="hidden" name="min_cvss_base" value="{min_cvss_base}"/>
        <input type="hidden" name="apply_min_cvss_base" value="{string-length (min_cvss_base) &gt; 0}"/>
        <input type="hidden" name="notes" value="{notes}"/>
        <input type="hidden" name="overrides" value="{overrides}"/>
        <input type="hidden" name="result_hosts_only" value="{result_hosts_only}"/>
        <table border="0" cellspacing="0" cellpadding="3" width="100%">
          <tr>
            <td valign="top" width="125">
              Hosts
            </td>
            <td>
              <input type="radio" name="hosts" value=""/>
              Any
              <input type="radio" name="hosts" value="{hosts}" checked="1"/>
              <xsl:value-of select="hosts"/>
            </td>
          </tr>
          <tr>
            <td valign="top" width="125">
              Port
            </td>
            <td>
              <input type="radio" name="port" value=""/>
              Any
              <input type="radio" name="port" value="{port}" checked="1"/>
              <xsl:value-of select="port"/>
            </td>
          </tr>
          <tr>
            <td valign="top" width="125">
              Threat
            </td>
            <td>
              <input type="radio" name="threat" value=""/>
              Any
              <input type="radio" name="threat" value="{threat}" checked="1"/>
              <xsl:value-of select="threat"/>
            </td>
          </tr>
          <tr>
            <td valign="top" width="125">
              <b>New Threat</b>
            </td>
            <td>
              <select name="new_threat">
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
                <option value="Log">Log</option>
                <option value="False Positive" selected="1">False Positive</option>
              </select>
            </td>
          </tr>
          <tr>
            <td valign="top" width="125">
              Task
            </td>
            <td>
              <input type="radio" name="task_id" value=""/>
              Any
              <input type="radio" name="task_id" value="{task/@id}"
                     checked="1"/>
              <xsl:value-of select="task/name"/>
            </td>
          </tr>
          <tr>
            <td valign="top" width="125">
              Result
            </td>
            <td>
              <input type="radio" name="result_id" value="" checked="1"/>
              Any
              <input type="radio" name="result_id" value="{result/@id}"/>
              <xsl:value-of select="result/@id"/>
            </td>
          </tr>
          <tr>
            <td valign="top" width="125">Text</td>
            <td>
              <textarea name="text" rows="10" cols="60"/>
            </td>
          </tr>
          <tr>
            <td colspan="2" style="text-align:right;">
              <input type="submit" name="submit" value="Create Override"/>
            </td>
          </tr>
        </table>
      </form>
      <h3>
        Associated Result
      </h3>
      <xsl:for-each select="get_results_response/results/result">
        <xsl:call-template name="result-detailed">
          <xsl:with-param name="override-buttons">0</xsl:with-param>
          <xsl:with-param name="note-buttons">0</xsl:with-param>
        </xsl:call-template>
      </xsl:for-each>
    </div>
  </div>
</xsl:template>

<xsl:template match="new_override">
  <xsl:apply-templates select="gsad_msg"/>
  <xsl:call-template name="html-create-override-form"/>
</xsl:template>

<xsl:template name="html-edit-override-form">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">Edit Override
      <a href="/help/overrides.html#editoverride"
         title="Help: Overrides (Edit Override)">
        <img src="/img/help.png"/>
      </a>
      <a href="/omp?cmd=get_override&amp;override_id={get_overrides_response/override/@id}"
         title="Override Details"
         style="margin-left:3px;">
        <img src="/img/details.png"/>
      </a>
    </div>
    <div class="gb_window_part_content">
      <form action="" method="get">
        <input type="hidden" name="cmd" value="save_override"/>
        <input type="hidden" name="override_id"
               value="{get_overrides_response/override/@id}"/>

        <input type="hidden" name="next" value="{next}"/>

        <!-- get_report params. -->
        <input type="hidden" name="report_id" value="{report/@id}"/>
        <input type="hidden" name="first_result" value="{first_result}"/>
        <input type="hidden" name="sort_field" value="{sort_field}"/>
        <input type="hidden" name="sort_order" value="{sort_order}"/>
        <input type="hidden" name="levels" value="{levels}"/>
        <input type="hidden" name="notes" value="{notes}"/>
        <input type="hidden" name="overrides" value="{overrides}"/>
        <input type="hidden" name="result_hosts_only" value="{result_hosts_only}"/>
        <input type="hidden" name="search_phrase" value="{search_phrase}"/>
        <input type="hidden" name="min_cvss_base" value="{min_cvss_base}"/>
        <input type="hidden" name="apply_min_cvss_base" value="{string-length (min_cvss_base) &gt; 0}"/>

        <!-- get_nvts param. -->
        <input type="hidden" name="oid" value="{nvt/@id}"/>

        <!-- get_tasks param. -->
        <input type="hidden" name="task_id" value="{task/@id}"/>

        <table border="0" cellspacing="0" cellpadding="3" width="100%">
          <tr>
            <td><b>NVT Name</b></td>
            <td>
              <xsl:variable name="nvt" select="get_overrides_response/override/nvt"/>
              <a href="?cmd=get_nvts&amp;oid={$nvt/@oid}">
                <xsl:variable name="max" select="70"/>
                <xsl:choose>
                  <xsl:when test="string-length($nvt/name) &gt; $max">
                    <xsl:value-of select="substring($nvt/name, 0, $max)"/>...
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:value-of select="$nvt/name"/>
                  </xsl:otherwise>
                </xsl:choose>
              </a>
            </td>
          </tr>
          <tr>
            <td valign="top" width="125">
              Hosts
            </td>
            <td>
              <xsl:choose>
                <xsl:when test="string-length (get_overrides_response/override/hosts) = 0">
                  <input type="radio" name="hosts" value="" checked="1"
                         readonly="1"/>
                  Any
                </xsl:when>
                <xsl:otherwise>
                  <input type="radio" name="hosts" value=""/>
                  Any
                  <input type="radio" name="hosts" value="{get_overrides_response/override/hosts}"
                         checked="1"/>
                  <xsl:value-of select="get_overrides_response/override/hosts"/>
                </xsl:otherwise>
              </xsl:choose>
            </td>
          </tr>
          <tr>
            <td valign="top" width="125">
              Port
            </td>
            <td>
              <xsl:choose>
                <xsl:when test="string-length (get_overrides_response/override/port) = 0">
                  <input type="radio" name="port" value="" checked="1"
                         readonly="1"/>
                  Any
                </xsl:when>
                <xsl:otherwise>
                  <input type="radio" name="port" value=""/>
                  Any
                  <input type="radio" name="port" value="{get_overrides_response/override/port}" checked="1"/>
                  <xsl:value-of select="get_overrides_response/override/port"/>
                </xsl:otherwise>
              </xsl:choose>
            </td>
          </tr>
          <tr>
            <td valign="top" width="125">
              Threat
            </td>
            <td>
              <xsl:choose>
                <xsl:when test="string-length (get_overrides_response/override/threat) = 0">
                  <input type="radio" name="threat" value="" checked="1"
                         readonly="1"/>
                  Any
                </xsl:when>
                <xsl:otherwise>
                  <input type="radio" name="threat" value=""/>
                  Any
                  <input type="radio" name="threat" value="{get_overrides_response/override/threat}"
                         checked="1"/>
                  <xsl:value-of select="get_overrides_response/override/threat"/>
                </xsl:otherwise>
              </xsl:choose>
            </td>
          </tr>
          <tr>
            <td valign="top" width="125">
              <b>New Threat</b>
            </td>
            <td>
              <select name="new_threat">
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'High'"/>
                  <xsl:with-param
                    name="select-value"
                    select="get_overrides_response/override/new_threat"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'Medium'"/>
                  <xsl:with-param
                    name="select-value"
                    select="get_overrides_response/override/new_threat"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'Low'"/>
                  <xsl:with-param
                    name="select-value"
                    select="get_overrides_response/override/new_threat"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'Log'"/>
                  <xsl:with-param
                    name="select-value"
                    select="get_overrides_response/override/new_threat"/>
                </xsl:call-template>
                <xsl:call-template name="opt">
                  <xsl:with-param name="value" select="'False Positive'"/>
                  <xsl:with-param
                    name="select-value"
                    select="get_overrides_response/override/new_threat"/>
                </xsl:call-template>
              </select>
            </td>
          </tr>
          <tr>
            <td valign="top" width="125">
              Task
            </td>
            <td>
              <xsl:choose>
                <xsl:when test="string-length (get_overrides_response/override/task/@id) = 0">
                  <input type="radio" name="override_task_id" value="" checked="1"
                         readonly="1"/>
                  Any
                </xsl:when>
                <xsl:otherwise>
                  <input type="radio" name="override_task_id" value=""/>
                  Any
                  <input type="radio" name="override_task_id" value="{get_overrides_response/override/task/@id}"
                         checked="1"/>
                  <xsl:value-of select="get_overrides_response/override/task/name"/>
                </xsl:otherwise>
              </xsl:choose>
            </td>
          </tr>
          <tr>
            <td valign="top" width="125">
              Result
            </td>
            <td>
              <xsl:choose>
                <xsl:when test="string-length (get_overrides_response/override/result/@id) = 0">
                  <input type="radio" name="override_result_id" value="" checked="1"
                         readonly="1"/>
                  Any
                </xsl:when>
                <xsl:otherwise>
                  <input type="radio" name="override_result_id" value=""/>
                  Any
                  <input type="radio" name="override_result_id"
                         value="{get_overrides_response/override/result/@id}" checked="1"/>
                  <xsl:value-of select="get_overrides_response/override/result/@id"/>
                </xsl:otherwise>
              </xsl:choose>
            </td>
          </tr>
          <tr>
            <td valign="top" width="125">Text</td>
            <td>
              <textarea name="text" rows="10" cols="60"><xsl:value-of select="get_overrides_response/override/text"/></textarea>
            </td>
          </tr>
          <tr>
            <td colspan="2" style="text-align:right;">
              <input type="submit" name="submit" value="Save Override"/>
            </td>
          </tr>
        </table>
      </form>
      <xsl:choose>
        <xsl:when test="string-length(get_overrides_response/override/result/@id) = 0">
          <h3>Associated Result: Any</h3>
        </xsl:when>
        <xsl:otherwise>
          <h3>
            Associated Result
          </h3>
          <xsl:for-each select="get_overrides_response/override/result">
            <xsl:call-template name="result-detailed">
              <xsl:with-param name="override-buttons">0</xsl:with-param>
              <xsl:with-param name="note-buttons">0</xsl:with-param>
            </xsl:call-template>
          </xsl:for-each>
        </xsl:otherwise>
      </xsl:choose>
    </div>
  </div>
</xsl:template>

<xsl:template match="edit_override">
  <xsl:apply-templates select="gsad_msg"/>
  <xsl:call-template name="html-edit-override-form"/>
</xsl:template>

<xsl:template match="modify_override_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">Save Override</xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<xsl:template name="override" match="override">
  <xsl:param name="next">get_overrides</xsl:param>
  <xsl:variable name="class">
    <xsl:choose>
      <xsl:when test="position() mod 2 = 0">even</xsl:when>
      <xsl:otherwise>odd</xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <tr class="{$class}">
    <td>
      <xsl:variable name="max" select="35"/>
      <xsl:choose>
        <xsl:when test="string-length(nvt/name) &gt; $max">
          <xsl:value-of select="substring(nvt/name, 0, $max)"/>...
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="nvt/name"/>
        </xsl:otherwise>
      </xsl:choose>
    </td>
    <td>
      <xsl:choose>
        <xsl:when test="string-length(threat) = 0">
          Any
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="threat"/>
        </xsl:otherwise>
      </xsl:choose>
    </td>
    <td>
      <xsl:value-of select="new_threat"/>
    </td>
    <td>
      <xsl:if test="orphan = 1"><b>Orphan</b><br/></xsl:if>
      <xsl:choose>
        <xsl:when test="text/@excerpt = 1">
          <xsl:value-of select="text/text()"/>...
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="text/text()"/>
        </xsl:otherwise>
      </xsl:choose>
    </td>
    <td>
      <a href="/omp?cmd=delete_override&amp;override_id={@id}&amp;next={$next}"
         title="Delete Override" style="margin-left:3px;">
        <img src="/img/delete.png" border="0" alt="Delete"/>
      </a>
      <a href="/omp?cmd=get_override&amp;override_id={@id}"
         title="Override Details" style="margin-left:3px;">
        <img src="/img/details.png" border="0" alt="Details"/>
      </a>
      <a href="/omp?cmd=edit_override&amp;override_id={@id}&amp;next={$next}"
         title="Edit Override"
         style="margin-left:3px;">
        <img src="/img/edit.png" border="0" alt="Edit"/>
      </a>
    </td>
  </tr>
</xsl:template>

<xsl:template match="override" mode="nvt-details">
  <xsl:variable name="class">
    <xsl:choose>
      <xsl:when test="position() mod 2 = 0">even</xsl:when>
      <xsl:otherwise>odd</xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <tr class="{$class}">
    <td>
      <xsl:value-of select="new_threat"/>
    </td>
    <td>
      <xsl:if test="orphan = 1"><b>Orphan</b><br/></xsl:if>
      <xsl:choose>
        <xsl:when test="text/@excerpt = 1">
          <xsl:value-of select="text/text()"/>...
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="text/text()"/>
        </xsl:otherwise>
      </xsl:choose>
    </td>
    <td>
      <a href="/omp?cmd=delete_override&amp;override_id={@id}&amp;next=get_nvts&amp;oid={../../get_nvts_response/nvt/@oid}"
         title="Delete Override" style="margin-left:3px;">
        <img src="/img/delete.png" border="0" alt="Delete"/>
      </a>
      <a href="/omp?cmd=get_override&amp;override_id={@id}"
         title="Override Details" style="margin-left:3px;">
        <img src="/img/details.png" border="0" alt="Details"/>
      </a>
      <a href="/omp?cmd=edit_override&amp;override_id={@id}&amp;next=get_nvts&amp;oid={../../get_nvts_response/nvt/@oid}"
         title="Edit Override"
         style="margin-left:3px;">
        <img src="/img/edit.png" border="0" alt="Edit"/>
      </a>
    </td>
  </tr>
</xsl:template>

<xsl:template match="override" mode="details">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">
      Override Details
      <a href="/help/overrides.html#overridedetails"
        title="Help: Overrides (Override Details)">
        <img src="/img/help.png"/>
      </a>
      <a href="/omp?cmd=edit_override&amp;override_id={@id}&amp;next=get_override"
         title="Edit Override"
         style="margin-left:3px;">
        <img src="/img/edit.png"/>
      </a>
    </div>
    <div class="gb_window_part_content">
      <div class="float_right">
        <a href="?cmd=get_overrides">Back to Overrides</a>
      </div>
      <table>
        <tr>
          <td><b>NVT Name:</b></td>
          <td>
            <a href="?cmd=get_nvts&amp;oid={nvt/@oid}">
              <xsl:variable name="max" select="70"/>
              <xsl:choose>
                <xsl:when test="string-length(nvt/name) &gt; $max">
                  <xsl:value-of select="substring(nvt/name, 0, $max)"/>...
                </xsl:when>
                <xsl:otherwise>
                  <xsl:value-of select="nvt/name"/>
                </xsl:otherwise>
              </xsl:choose>
            </a>
          </td>
        </tr>
        <tr>
          <td>NVT OID:</td>
          <td><xsl:value-of select="nvt/@oid"/></td>
        </tr>
        <tr>
          <td>Created:</td>
          <td><xsl:value-of select="creation_time"/></td>
        </tr>
        <tr>
          <td>Last Modified:</td>
          <td><xsl:value-of select="modification_time"/></td>
        </tr>
      </table>

      <h1>Application</h1>
      <table>
        <tr>
          <td>Hosts:</td>
          <td>
            <xsl:choose>
              <xsl:when test="string-length(hosts) &gt; 0">
                <xsl:value-of select="hosts"/>
              </xsl:when>
              <xsl:otherwise>
                Any
              </xsl:otherwise>
            </xsl:choose>
          </td>
        </tr>
        <tr>
          <td>Port:</td>
          <td>
            <xsl:choose>
              <xsl:when test="string-length(port) &gt; 0">
                <xsl:value-of select="port"/>
              </xsl:when>
              <xsl:otherwise>
                Any
              </xsl:otherwise>
            </xsl:choose>
          </td>
        </tr>
        <tr>
          <td>Threat:</td>
          <td>
            <xsl:choose>
              <xsl:when test="string-length(threat) &gt; 0">
                <xsl:value-of select="threat"/>
              </xsl:when>
              <xsl:otherwise>
                Any
              </xsl:otherwise>
            </xsl:choose>
          </td>
        </tr>
        <tr>
          <td><b>New Threat:</b></td>
          <td>
            <xsl:value-of select="new_threat"/>
          </td>
        </tr>
        <tr>
          <td>Task:</td>
          <td>
            <xsl:choose>
              <xsl:when test="orphan != 0">
                <b>Orphan</b>
              </xsl:when>
              <xsl:when test="task and string-length(task/@id) &gt; 0">
                <a href="?cmd=get_tasks&amp;task_id={task/@id}">
                  <xsl:value-of select="task/name"/>
                </a>
              </xsl:when>
              <xsl:otherwise>
                Any
              </xsl:otherwise>
            </xsl:choose>
          </td>
        </tr>
        <tr>
          <td>Result:</td>
          <td>
            <xsl:choose>
              <xsl:when test="orphan != 0">
                <b>Orphan</b>
              </xsl:when>
              <xsl:when test="string-length(result/@id) &gt; 0">
                <xsl:value-of select="result/@id"/>
              </xsl:when>
              <xsl:otherwise>
                Any
              </xsl:otherwise>
            </xsl:choose>
          </td>
        </tr>
      </table>

      <h1>Appearance</h1>
      <div class="override_top_line"></div>
      <xsl:call-template name="override-detailed">
        <xsl:with-param name="override-buttons">0</xsl:with-param>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template name="html-overrides-table">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">Overrides
      <a href="/help/overrides.html"
         title="Help: Overrides">
        <img src="/img/help.png"/>
      </a>
    </div>
    <div class="gb_window_part_content_no_pad">
      <div id="overrides">
        <table class="gbntable" cellspacing="2" cellpadding="4" border="0">
          <tr class="gbntablehead2">
            <td>NVT</td>
            <td>From</td>
            <td>To</td>
            <td>Text</td>
            <td width="100">Actions</td>
          </tr>
          <xsl:apply-templates select="override"/>
        </table>
      </div>
    </div>
  </div>
</xsl:template>

<xsl:template match="get_override">
  <xsl:apply-templates select="gsad_msg"/>
  <xsl:choose>
    <xsl:when test="commands_reponse/get_overrides_response/@status = '500'">
      <xsl:call-template name="command_result_dialog">
        <xsl:with-param name="operation">
          Get Override
        </xsl:with-param>
        <xsl:with-param name="status">
          <xsl:value-of select="500"/>
        </xsl:with-param>
        <xsl:with-param name="msg">
          <xsl:value-of select="commands_response/get_overrides_response/@status_text"/>
        </xsl:with-param>
      </xsl:call-template>
    </xsl:when>
    <xsl:otherwise>
      <xsl:apply-templates select="commands_response/get_overrides_response/override" mode="details"/>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template match="modify_override_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">
      Modify Override
    </xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<xsl:template match="get_overrides">
  <xsl:apply-templates select="gsad_msg"/>
  <xsl:apply-templates select="commands_response/delete_override_response"/>
  <xsl:apply-templates select="commands_response/modify_override_response"/>
  <xsl:choose>
    <xsl:when test="commands_response/get_overrides_response/@status = '500'">
      <xsl:call-template name="command_result_dialog">
        <xsl:with-param name="operation">
          Get Overrides
        </xsl:with-param>
        <xsl:with-param name="status">
          <xsl:value-of select="500"/>
        </xsl:with-param>
        <xsl:with-param name="msg">
          <xsl:value-of select="commands_response/get_overrides_response/@status_text"/>
        </xsl:with-param>
      </xsl:call-template>
    </xsl:when>
    <xsl:otherwise>
      <!-- The for-each makes the get_overrides_response the current node. -->
      <xsl:for-each select="commands_response/get_overrides_response">
        <xsl:call-template name="html-overrides-table"/>
      </xsl:for-each>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<!-- END OVERRIDES MANAGEMENT -->

<!-- BEGIN REPORT FORMATS MANAGEMENT -->

<xsl:template name="html-report-formats-table">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">Report Formats
      <a href="/help/configure_report_formats.html#report_formats"
         title="Help: Configure Report Formats (Report Formats)">
        <img src="/img/help.png"/>
      </a>
    </div>
    <div class="gb_window_part_content_no_pad">
      <div id="tasks">
        <table class="gbntable" cellspacing="2" cellpadding="4" border="0">
          <tr class="gbntablehead2">
            <td>Name</td>
            <td>Extension</td>
            <td>Content Type</td>
            <td>Trust (last verified)</td>
            <td>Active</td>
            <td width="100">Actions</td>
          </tr>
          <xsl:apply-templates select="report_format"/>
        </table>
      </div>
    </div>
  </div>
</xsl:template>

<xsl:template name="html-import-report-format-form">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">
      Import Report Format
      <a href="/help/configure_report_formats.html#import_report_format"
         title="Help: Configure Report Formats (Import Report Formats)">
        <img src="/img/help.png"/>
      </a>
    </div>
    <div class="gb_window_part_content">
      <form action="/omp" method="post" enctype="multipart/form-data">
        <input type="hidden" name="cmd" value="import_report_format"/>
        <table border="0" cellspacing="0" cellpadding="3" width="100%">
          <tr>
            <td valign="top" width="125">
              Import XML report format
            </td>
            <td><input type="file" name="xml_file" size="30"/></td>
          </tr>
          <tr>
            <td colspan="2" style="text-align:right;">
              <input type="submit" name="submit" value="Import Report Format"/>
            </td>
          </tr>
        </table>
        <br/>
      </form>
    </div>
  </div>
</xsl:template>

<xsl:template match="get_report_formats_response">
</xsl:template>

<!--     CREATE_REPORT_FORMAT_RESPONSE -->

<xsl:template match="create_report_format_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">Create Report Format</xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<!--     DELETE_REPORT_FORMAT_RESPONSE -->

<xsl:template match="delete_report_format_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">
      Delete Report Format
    </xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<!--     EDITING REPORT FORMATS -->

<xsl:template name="html-edit-report-format-form">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">Edit Report Format
      <a href="/help/report_formats.html#edit_report_format"
         title="Help: Edit Report Format">
        <img src="/img/help.png"/>
      </a>
    </div>
    <div class="gb_window_part_content">
      <form action="" method="post">
        <input type="hidden" name="cmd" value="save_report_format"/>
        <input type="hidden"
               name="report_format_id"
               value="{commands_response/get_report_formats_response/report_format/@id}"/>
        <input type="hidden" name="next" value="{next}"/>
        <input type="hidden" name="sort_field" value="{sort_field}"/>
        <input type="hidden" name="sort_order" value="{sort_order}"/>
        <table border="0" cellspacing="0" cellpadding="3" width="100%">
          <tr>
           <td valign="top" width="165">Name</td>
           <td>
             <input type="text"
                    name="name"
                    value="{commands_response/get_report_formats_response/report_format/name}"
                    size="30"
                    maxlength="80"/>
           </td>
          </tr>
          <tr>
            <td valign="top">Summary</td>
            <td>
              <input type="text" name="comment" size="30" maxlength="400"
                     value="{commands_response/get_report_formats_response/report_format/summary}"/>
            </td>
          </tr>
          <tr>
            <td valign="top">Active</td>
            <td>
              <xsl:choose>
                <xsl:when test="commands_response/get_report_formats_response/report_format/active='1'">
                  <input type="radio" name="enable" value="1" checked="1"/>
                  yes
                  <input type="radio" name="enable" value="0"/>
                  no
                </xsl:when>
                <xsl:otherwise>
                  <input type="radio" name="enable" value="1"/>
                  yes
                  <input type="radio" name="enable" value="0" checked="1"/>
                  no
                </xsl:otherwise>
              </xsl:choose>
            </td>
          </tr>
          <xsl:for-each select="commands_response/get_report_formats_response/report_format">
            <tr>
              <td valign="top" colspan="2">
                <xsl:choose>
                  <xsl:when test="count(param) = 0">
                    <h1>Parameters: None</h1>
                  </xsl:when>
                  <xsl:otherwise>
                    <h1>Parameters:</h1>
                    <xsl:call-template name="param-edit"/>
                  </xsl:otherwise>
                </xsl:choose>
              </td>
            </tr>
          </xsl:for-each>
          <tr>
            <td colspan="2" style="text-align:right;">
              <input type="submit" name="submit" value="Save Report Format"/>
            </td>
          </tr>
        </table>
        <br/>
      </form>
    </div>
  </div>
</xsl:template>

<xsl:template match="edit_report_format">
  <xsl:apply-templates select="gsad_msg"/>
  <xsl:call-template name="html-edit-report-format-form"/>
</xsl:template>

<xsl:template match="modify_report_format_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">Save Report Format</xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<!--     REPORT_FORMAT -->

<xsl:template match="report_format">
  <xsl:variable name="class">
    <xsl:choose>
      <xsl:when test="position() mod 2 = 0">even</xsl:when>
      <xsl:otherwise>odd</xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <tr class="{$class}">
    <td>
      <b><xsl:value-of select="name"/></b>
      <xsl:choose>
        <xsl:when test="summary != ''">
          <br/>(<xsl:value-of select="summary"/>)
        </xsl:when>
        <xsl:otherwise></xsl:otherwise>
      </xsl:choose>
    </td>
    <td><xsl:value-of select="extension"/></td>
    <td><xsl:value-of select="content_type"/></td>
    <td>
      <xsl:value-of select="trust/text()"/>
      <xsl:choose>
        <xsl:when test="trust/time != ''">
          <br/>(<xsl:value-of select="substring(trust/time,5,6)"/>
                <xsl:value-of select="substring(trust/time,20,5)"/>)
        </xsl:when>
        <xsl:otherwise></xsl:otherwise>
      </xsl:choose>
    </td>
    <td>
      <xsl:choose>
        <xsl:when test="active='0'">
          no
        </xsl:when>
        <xsl:otherwise>
          yes
        </xsl:otherwise>
      </xsl:choose>
    </td>
    <td>
      <xsl:choose>
        <xsl:when test="global='0'">
          <a href="/omp?cmd=delete_report_format&amp;report_format_id={@id}"
             title="Delete Report Format" style="margin-left:3px;">
            <img src="/img/delete.png" border="0" alt="Delete"/>
          </a>
        </xsl:when>
        <xsl:otherwise>
          <img src="/img/delete_inactive.png"
               border="0"
               alt="Delete"
               style="margin-left:3px;"/>
        </xsl:otherwise>
      </xsl:choose>
      <a href="/omp?cmd=get_report_format&amp;report_format_id={@id}"
         title="Report Format Details" style="margin-left:3px;">
        <img src="/img/details.png" border="0" alt="Details"/>
      </a>
      <a href="/omp?cmd=edit_report_format&amp;report_format_id={@id}&amp;next=get_report_formats&amp;sort_order=ascending&amp;sort_field=name"
         title="Edit Report Format" style="margin-left:3px;">
        <img src="/img/edit.png" border="0" alt="Edit"/>
      </a>
      <a href="/omp?cmd=export_report_format&amp;report_format_id={@id}"
         title="Export Report Format XML"
         style="margin-left:3px;">
        <img src="/img/download.png" border="0" alt="Export XML"/>
      </a>
      <a href="/omp?cmd=verify_report_format&amp;report_format_id={@id}"
         title="Verify Report Format"
         style="margin-left:3px;">
        <img src="/img/new.png" border="0" alt="Verify Report Format"/>
      </a>
    </td>
  </tr>
</xsl:template>

<xsl:template name="param-edit" match="params" mode="edit">
  <div>
    <table class="gbntable" cellspacing="2" cellpadding="4">
      <tr class="gbntablehead2">
        <td>Name</td>
        <td>Value</td>
      </tr>
      <xsl:for-each select="param">
        <xsl:variable name="class">
          <xsl:choose>
            <xsl:when test="position() mod 2 = 0">even</xsl:when>
            <xsl:otherwise>odd</xsl:otherwise>
          </xsl:choose>
        </xsl:variable>
        <tr class="{$class}">
          <td>
            <xsl:value-of select="name"/>
          </td>
          <td>
            <xsl:choose>
              <xsl:when test="type/text() = 'selection'">
                <select name="preference:nvt[selection]:{name}">
                  <xsl:variable name="value">
                    <xsl:value-of select="value"/>
                  </xsl:variable>
                  <xsl:for-each select="options/option">
                    <xsl:choose>
                      <xsl:when test=". = $value">
                        <option value="{.}" selected="1"><xsl:value-of select="."/></option>
                      </xsl:when>
                      <xsl:otherwise>
                        <option value="{.}"><xsl:value-of select="."/></option>
                      </xsl:otherwise>
                    </xsl:choose>
                  </xsl:for-each>
                </select>
              </xsl:when>
              <xsl:when test="type/text() = 'boolean'">
                <xsl:choose>
                  <xsl:when test="value='0'">
                    <input type="radio" name="preference:nvt[radio]:{name}" value="1"/>
                    yes
                    <input type="radio" name="preference:nvt[radio]:{name}" value="0" checked="1"/>
                    no
                  </xsl:when>
                  <xsl:otherwise>
                    <input type="radio" name="preference:nvt[radio]:{name}" value="1" checked="1"/>
                    yes
                    <input type="radio" name="preference:nvt[radio]:{name}" value="0"/>
                    no
                  </xsl:otherwise>
                </xsl:choose>
              </xsl:when>
              <xsl:when test="type/text() = 'integer'">
                <input type="text" name="preference:nvt[string]:{name}" value="{value}" size="30"
                       maxlength="80"/>
              </xsl:when>
              <xsl:when test="type/text() = 'string'">
                <xsl:choose>
                  <xsl:when test="string-length (type/max) &gt; 0">
                    <input type="text" name="preference:nvt[string]:{name}" value="{value}"
                           size="30" maxlength="{type/max}"/>
                  </xsl:when>
                  <xsl:otherwise>
                    <input type="text" name="preference:nvt[string]:{name}" value="{value}"
                           size="30"/>
                  </xsl:otherwise>
                </xsl:choose>
              </xsl:when>
              <xsl:otherwise>
                <!-- Presume type "text". -->
                <textarea name="preference:nvt[string]:{name}" value="{value}" rows="5"
                          cols="80">
                  <xsl:value-of select="value"/>
                </textarea>
              </xsl:otherwise>
            </xsl:choose>
          </td>
        </tr>
      </xsl:for-each>
    </table>
  </div>
</xsl:template>

<xsl:template name="param-details" match="params" mode="details">
  <div id="params">
    <table class="gbntable" cellspacing="2" cellpadding="4">
      <tr class="gbntablehead2">
        <td>Name</td>
        <td>Value</td>
        <td>Actions</td>
      </tr>
      <xsl:for-each select="param">
        <xsl:variable name="class">
          <xsl:choose>
            <xsl:when test="position() mod 2 = 0">even</xsl:when>
            <xsl:otherwise>odd</xsl:otherwise>
          </xsl:choose>
        </xsl:variable>
        <tr class="{$class}">
          <td><xsl:value-of select="name"/></td>
          <td>
            <xsl:choose>
              <xsl:when test="type/text() = 'selection'">
                <xsl:value-of select="value"/>
              </xsl:when>
              <xsl:when test="type/text() = 'boolean'">
                <xsl:choose>
                  <xsl:when test="value='0'">
                    no
                  </xsl:when>
                  <xsl:otherwise>
                    yes
                  </xsl:otherwise>
                </xsl:choose>
              </xsl:when>
              <xsl:when test="type/text() = 'integer'">
                <xsl:value-of select="value"/>
              </xsl:when>
              <xsl:when test="type/text() = 'string'">
                <xsl:value-of select="value"/>
              </xsl:when>
              <xsl:otherwise>
                <!-- Presume type "text". -->
                <pre><xsl:value-of select="value"/></pre>
              </xsl:otherwise>
            </xsl:choose>
          </td>
          <td></td>
        </tr>
      </xsl:for-each>
    </table>
  </div>
</xsl:template>

<xsl:template match="report_format" mode="details">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">
       Report Format Details
       <a href="/help/configure_report_formats.html#report_format_details"
         title="Help: Configure Report Formats (Report Format Details)">
         <img src="/img/help.png"/>
       </a>
      <a href="/omp?cmd=edit_report_format&amp;report_format_id={@id}&amp;next=get_report_format&amp;sort_order=ascending&amp;sort_field=name"
         title="Edit Report Format"
         style="margin-left:3px;">
        <img src="/img/edit.png"/>
      </a>
    </div>
    <div class="gb_window_part_content">
      <div class="float_right">
        <a href="?cmd=get_report_formats">Back to Report Formats</a>
      </div>
      <table>
        <tr>
          <td><b>Name:</b></td>
          <td><b><xsl:value-of select="name"/></b></td>
        </tr>
        <tr>
          <td>Extension:</td>
          <td><xsl:value-of select="extension"/></td>
        </tr>
        <tr>
          <td>Content Type:</td>
          <td><xsl:value-of select="content_type"/></td>
        </tr>
        <tr>
          <td>Trust:</td>
          <td><xsl:value-of select="trust/text()"/></td>
        </tr>
        <tr>
          <td>Active:</td>
          <td>
            <xsl:choose>
              <xsl:when test="active='0'">
                no
              </xsl:when>
              <xsl:otherwise>
                yes
              </xsl:otherwise>
            </xsl:choose>
          </td>
        </tr>
        <tr>
          <td>Summary:</td>
          <td><xsl:value-of select="summary"/></td>
        </tr>
      </table>
      <h1>Description:</h1>
      <pre><xsl:value-of select="description"/></pre>
      <xsl:choose>
        <xsl:when test="count(param) = 0">
          <h1>Parameters: None</h1>
        </xsl:when>
        <xsl:otherwise>
          <h1>Parameters:</h1>
          <xsl:call-template name="param-details"/>
        </xsl:otherwise>
      </xsl:choose>
    </div>
  </div>
</xsl:template>

<!--     GET_REPORT_FORMAT -->

<xsl:template match="get_report_format">
  <xsl:apply-templates select="gsad_msg"/>
  <xsl:apply-templates select="commands_response/delete_report_format_response"/>
  <xsl:apply-templates select="commands_response/modify_report_format_response"/>
  <xsl:apply-templates select="modify_report_format_response"/>
  <xsl:apply-templates select="commands_response/get_report_formats_response/report_format"
                       mode="details"/>
</xsl:template>

<!--     GET_REPORT_FORMATS -->

<xsl:template match="get_report_formats">
  <xsl:apply-templates select="gsad_msg"/>
  <xsl:apply-templates select="commands_response/delete_report_format_response"/>
  <xsl:apply-templates select="create_report_format_response"/>
  <xsl:apply-templates select="commands_response/modify_report_format_response"/>
  <xsl:apply-templates select="modify_report_format_response"/>
<!--
  <xsl:call-template name="html-create-report-format-form"/>
-->
  <!-- The for-each makes the get_report_formats_response the current node. -->
  <xsl:for-each select="get_report_formats_response | commands_response/get_report_formats_response">
    <xsl:call-template name="html-import-report-format-form"/>
    <xsl:call-template name="html-report-formats-table"/>
  </xsl:for-each>
</xsl:template>

<!-- END REPORT FORMATS MANAGEMENT -->

<!-- BEGIN REPORT DETAILS -->

<xsl:template match="get_reports_response">
  <xsl:choose>
    <xsl:when test="@status = '400'">
      <xsl:call-template name="command_result_dialog">
        <xsl:with-param name="operation">
          Get Report
        </xsl:with-param>
        <xsl:with-param name="status">
          <xsl:value-of select="@status"/>
        </xsl:with-param>
        <xsl:with-param name="msg">
          <xsl:value-of select="@status_text"/>
        </xsl:with-param>
      </xsl:call-template>
    </xsl:when>
    <xsl:otherwise>
      <xsl:for-each select="report">
        <xsl:call-template name="html-report-details"/>
      </xsl:for-each>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template match="get_report">
  <xsl:apply-templates select="gsad_msg"/>
  <xsl:apply-templates select="get_reports_response"/>
</xsl:template>

<!--     CREATE_NOTE_RESPONSE -->

<xsl:template match="create_note_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">
      Create Note
    </xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<!--     CREATE_OVERRIDE_RESPONSE -->

<xsl:template match="create_override_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">
      Create Override
    </xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<!--     DELETE_NOTE_RESPONSE -->

<xsl:template match="delete_note_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">
      Delete Note
    </xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<!--     DELETE_OVERRIDE_RESPONSE -->

<xsl:template match="delete_override_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">
      Delete Override
    </xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<!--     NOTE -->

<xsl:template name="note-detailed" match="note" mode="detailed">
  <xsl:param name="note-buttons">1</xsl:param>
  <div class="note_box_box">
    <b>Note</b><br/>
    <pre>
      <xsl:call-template name="wrap">
        <xsl:with-param name="string"><xsl:value-of select="text"/></xsl:with-param>
      </xsl:call-template>
    </pre>
    <xsl:if test="$note-buttons = 1">
      <div class="float_right" style="text-align:right">
        <a href="/omp?cmd=delete_note&amp;note_id={@id}&amp;report_id={../../../../@id}&amp;first_result={../../../../results/@start}&amp;levels={../../../../filters/text()}&amp;sort_field={../../../../sort/field/text()}&amp;sort_order={../../../../sort/field/order}&amp;search_phrase={../../../../filters/phrase}&amp;min_cvss_base={../../../../filters/min_cvss_base}&amp;apply_min_cvss_base={string-length (../../../../filters/min_cvss_base) &gt; 0}&amp;notes={../../../../filters/notes}&amp;overrides={../../../../filters/overrides}&amp;result_hosts_only={../../../../filters/result_hosts_only}&amp;next=get_report#result-{../../@id}"
           title="Delete Note" style="margin-left:3px;">
          <img src="/img/delete.png" border="0" alt="Delete"/>
        </a>
        <a href="/omp?cmd=get_note&amp;note_id={@id}"
           title="Note Details" style="margin-left:3px;">
          <img src="/img/details.png" border="0" alt="Details"/>
        </a>
        <a href="/omp?cmd=edit_note&amp;note_id={@id}&amp;next=get_report&amp;report_id={../../../../@id}&amp;first_result={../../../../results/@start}&amp;sort_field={../../../../sort/field/text()}&amp;sort_order={../../../../sort/field/order}&amp;levels={../../../../filters/text()}&amp;notes=1&amp;overrides={../../../../filters/overrides}&amp;result_hosts_only={../../../../filters/result_hosts_only}&amp;search_phrase={../../../../filters/phrase}&amp;min_cvss_base={../../../../filters/min_cvss_base}&amp;apply_min_cvss_base={string-length (../../../../filters/min_cvss_base) &gt; 0}"
           title="Edit Note"
           style="margin-left:3px;">
          <img src="/img/edit.png" border="0" alt="Edit"/>
        </a>
      </div>
    </xsl:if>
    Last modified: <xsl:value-of select="modification_time"/>.
  </div>
</xsl:template>

<!--     OVERRIDE -->

<xsl:template name="override-detailed" match="override" mode="detailed">
  <xsl:param name="override-buttons">1</xsl:param>
  <div class="override_box_box">
    <b>
      Override from
      <xsl:choose>
        <xsl:when test="string-length(threat) = 0">
          Any
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="threat"/>
        </xsl:otherwise>
      </xsl:choose>
      to <xsl:value-of select="new_threat"/></b><br/>
    <pre>
      <xsl:call-template name="wrap">
        <xsl:with-param name="string"><xsl:value-of select="text"/></xsl:with-param>
      </xsl:call-template>
    </pre>
    <xsl:if test="$override-buttons = 1">
      <div class="float_right" style="text-align:right">
        <a href="/omp?cmd=delete_override&amp;override_id={@id}&amp;report_id={../../../../@id}&amp;first_result={../../../../results/@start}&amp;levels={../../../../filters/text()}&amp;sort_field={../../../../sort/field/text()}&amp;sort_order={../../../../sort/field/order}&amp;search_phrase={../../../../filters/phrase}&amp;min_cvss_base={../../../../filters/min_cvss_base}&amp;apply_min_cvss_base={string-length (../../../../filters/min_cvss_base) &gt; 0}&amp;notes={../../../../filters/notes}&amp;overrides={../../../../filters/overrides}&amp;result_hosts_only={../../../../filters/result_hosts_only}&amp;next=get_report#result-{../../@id}"
           title="Delete Override" style="margin-left:3px;">
          <img src="/img/delete.png" border="0" alt="Delete"/>
        </a>
        <a href="/omp?cmd=get_override&amp;override_id={@id}"
           title="Override Details" style="margin-left:3px;">
          <img src="/img/details.png" border="0" alt="Details"/>
        </a>
        <a href="/omp?cmd=edit_override&amp;override_id={@id}&amp;next=get_report&amp;report_id={../../../../@id}&amp;first_result={../../../../results/@start}&amp;sort_field={../../../../sort/field/text()}&amp;sort_order={../../../../sort/field/order}&amp;levels={../../../../filters/text()}&amp;notes={../../../../filters/notes}&amp;overrides=1&amp;result_hosts_only={../../../../filters/result_hosts_only}&amp;search_phrase={../../../../filters/phrase}&amp;min_cvss_base={../../../../filters/min_cvss_base}&amp;apply_min_cvss_base={string-length (../../../../filters/min_cvss_base) &gt; 0}"
           title="Edit Override"
           style="margin-left:3px;">
          <img src="/img/edit.png" border="0" alt="Edit"/>
        </a>
      </div>
    </xsl:if>
    Last modified: <xsl:value-of select="modification_time"/>.
  </div>
</xsl:template>

<!--     RESULT -->

<xsl:template match="result" mode="overview">
  <xsl:variable name="class">
    <xsl:choose>
      <xsl:when test="position() mod 2 = 0">even</xsl:when>
      <xsl:otherwise>odd</xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <tr class="{$class}">
    <td><xsl:value-of select="port"/></td>
    <td><xsl:value-of select="threat"/></td>
  </tr>
</xsl:template>

<xsl:template name="result-detailed" match="result" mode="detailed">
  <xsl:param name="note-buttons">1</xsl:param>
  <xsl:param name="override-buttons">1</xsl:param>
  <xsl:variable name="style">
    <xsl:choose>
       <xsl:when test="threat='Low'">background:#539dcb</xsl:when>
       <xsl:when test="threat='Medium'">background:#f99f31</xsl:when>
       <xsl:when test="threat='High'">background:#cb1d17</xsl:when>
    </xsl:choose>
  </xsl:variable>
  <a class="anchor" name="result-{@id}"/>
  <div class="issue_box_head" style="{$style}">
    <div class="float_right" style="text-align:right">
      <xsl:value-of select="port"/>
    </div>
    <b><xsl:value-of select="threat"/></b>
    <xsl:choose>
      <xsl:when test="original_threat">
        <xsl:choose>
          <xsl:when test="threat = original_threat">
            <xsl:if test="string-length(nvt/cvss_base) &gt; 0">
              (CVSS: <xsl:value-of select="nvt/cvss_base"/>)
            </xsl:if>
          </xsl:when>
          <xsl:otherwise>
            (Overridden from <b><xsl:value-of select="original_threat"/></b>)
          </xsl:otherwise>
        </xsl:choose>
      </xsl:when>
      <xsl:otherwise>
        <xsl:if test="string-length(nvt/cvss_base) &gt; 0">
          (CVSS: <xsl:value-of select="nvt/cvss_base"/>)
        </xsl:if>
      </xsl:otherwise>
    </xsl:choose>
    <div>
      <xsl:choose>
        <xsl:when test="nvt/@oid = 0">
        </xsl:when>
        <xsl:otherwise>
          NVT:
          <xsl:variable name="max" select="80"/>
          <a href="?cmd=get_nvts&amp;oid={nvt/@oid}">
            <xsl:choose>
              <xsl:when test="string-length(nvt/name) &gt; $max">
                <xsl:value-of select="substring(nvt/name, 0, $max)"/>...
              </xsl:when>
              <xsl:otherwise>
                <xsl:value-of select="nvt/name"/>
              </xsl:otherwise>
            </xsl:choose>
          </a>
          (OID:
           <a href="?cmd=get_nvts&amp;oid={nvt/@oid}">
             <xsl:value-of select="nvt/@oid"/>
           </a>)
        </xsl:otherwise>
      </xsl:choose>
    </div>
  </div>
  <div class="issue_box_box">
    <xsl:if test="$note-buttons = 1">
      <div class="float_right" style="text-align:right">
        <xsl:if test="count(notes/note) &gt; 0">
          <a href="#notes-{@id}"
             title="Notes" style="margin-left:3px;">
            <img src="/img/note.png" border="0" alt="Notes"/>
          </a>
        </xsl:if>
        <xsl:choose>
          <xsl:when test="original_threat and string-length (original_threat)">
            <a href="/omp?cmd=new_note&amp;result_id={@id}&amp;oid={nvt/@oid}&amp;task_id={../../task/@id}&amp;name={../../task/name}&amp;report_id={../../@id}&amp;first_result={../../results/@start}&amp;levels={../../filters/text()}&amp;sort_field={../../sort/field/text()}&amp;sort_order={../../sort/field/order}&amp;search_phrase={../../filters/phrase}&amp;min_cvss_base={../../filters/min_cvss_base}&amp;apply_min_cvss_base={string-length (../../filters/min_cvss_base) &gt; 0}&amp;threat={original_threat}&amp;port={port}&amp;hosts={host/text()}&amp;notes={../../filters/notes}&amp;overrides={../../filters/overrides}&amp;result_hosts_only={../../filters/result_hosts_only}"
               title="Add Note" style="margin-left:3px;">
              <img src="/img/new_note.png" border="0" alt="Add Note"/>
            </a>
          </xsl:when>
          <xsl:otherwise>
            <a href="/omp?cmd=new_note&amp;result_id={@id}&amp;oid={nvt/@oid}&amp;task_id={../../task/@id}&amp;name={../../task/name}&amp;report_id={../../@id}&amp;first_result={../../results/@start}&amp;levels={../../filters/text()}&amp;sort_field={../../sort/field/text()}&amp;sort_order={../../sort/field/order}&amp;search_phrase={../../filters/phrase}&amp;min_cvss_base={../../filters/min_cvss_base}&amp;apply_min_cvss_base={string-length (../../filters/min_cvss_base) &gt; 0}&amp;threat={threat}&amp;port={port}&amp;hosts={host/text()}&amp;notes={../../filters/notes}&amp;overrides={../../filters/overrides}&amp;result_hosts_only={../../filters/result_hosts_only}"
               title="Add Note" style="margin-left:3px;">
              <img src="/img/new_note.png" border="0" alt="Add Note"/>
            </a>
          </xsl:otherwise>
        </xsl:choose>
      </div>
    </xsl:if>
    <xsl:if test="$override-buttons = 1">
      <div class="float_right" style="text-align:right">
        <xsl:if test="count(overrides/override) &gt; 0">
          <a href="#overrides-{@id}"
             title="Overrides" style="margin-left:3px;">
            <img src="/img/override.png" border="0" alt="Overrides"/>
          </a>
        </xsl:if>
        <xsl:choose>
          <xsl:when test="original_threat and string-length (original_threat)">
            <a href="/omp?cmd=new_override&amp;result_id={@id}&amp;oid={nvt/@oid}&amp;task_id={../../task/@id}&amp;name={../../task/name}&amp;report_id={../../@id}&amp;first_result={../../results/@start}&amp;levels={../../filters/text()}&amp;sort_field={../../sort/field/text()}&amp;sort_order={../../sort/field/order}&amp;search_phrase={../../filters/phrase}&amp;min_cvss_base={../../filters/min_cvss_base}&amp;apply_min_cvss_base={string-length (../../filters/min_cvss_base) &gt; 0}&amp;threat={original_threat}&amp;port={port}&amp;hosts={host/text()}&amp;notes={../../filters/notes}&amp;overrides={../../filters/overrides}&amp;result_hosts_only={../../filters/result_hosts_only}"
               title="Add Override" style="margin-left:3px;">
              <img src="/img/new_override.png" border="0" alt="Add Override"/>
            </a>
          </xsl:when>
          <xsl:otherwise>
            <a href="/omp?cmd=new_override&amp;result_id={@id}&amp;oid={nvt/@oid}&amp;task_id={../../task/@id}&amp;name={../../task/name}&amp;report_id={../../@id}&amp;first_result={../../results/@start}&amp;levels={../../filters/text()}&amp;sort_field={../../sort/field/text()}&amp;sort_order={../../sort/field/order}&amp;search_phrase={../../filters/phrase}&amp;min_cvss_base={../../filters/min_cvss_base}&amp;apply_min_cvss_base={string-length (../../filters/min_cvss_base) &gt; 0}&amp;threat={threat}&amp;port={port}&amp;hosts={host/text()}&amp;notes={../../filters/notes}&amp;overrides={../../filters/overrides}&amp;result_hosts_only={../../filters/result_hosts_only}"
               title="Add Override" style="margin-left:3px;">
              <img src="/img/new_override.png" border="0" alt="Add Override"/>
            </a>
          </xsl:otherwise>
        </xsl:choose>
      </div>
    </xsl:if>
    <pre>
      <xsl:call-template name="wrap">
        <xsl:with-param name="string"><xsl:value-of select="description"/></xsl:with-param>
      </xsl:call-template>
    </pre>
  </div>
  <a class="anchor" name="notes-{@id}"/>
  <xsl:for-each select="notes/note">
    <xsl:call-template name="note-detailed">
      <xsl:with-param name="note-buttons">
        <xsl:value-of select="$note-buttons"/>
      </xsl:with-param>
    </xsl:call-template>
  </xsl:for-each>
  <xsl:choose>
    <xsl:when test="../../filters/apply_overrides = 1">
      <a class="anchor" name="overrides-{@id}"/>
      <xsl:for-each select="overrides/override">
        <xsl:call-template name="override-detailed">
          <xsl:with-param name="override-buttons">
            <xsl:value-of select="$override-buttons"/>
          </xsl:with-param>
        </xsl:call-template>
      </xsl:for-each>
    </xsl:when>
    <xsl:otherwise>
    </xsl:otherwise>
  </xsl:choose>
  <br/>
</xsl:template>

<xsl:template match="get_reports_response/report/report" mode="overview">
  <table class="gbntable" cellspacing="2" cellpadding="4">
    <tr class="gbntablehead2">
      <td>Host</td>
      <td>Start</td>
      <td>End</td>
      <td><img src="/img/high.png" alt="High" title="High"/></td>
      <td><img src="/img/medium.png" alt="Medium" title="Medium"/></td>
      <td><img src="/img/low.png" alt="Low" title="Low"/></td>
      <td><img src="/img/log.png" alt="Log" title="Log"/></td>
      <td><img src="/img/false_positive.png" alt="False Positive" title="False Positive"/></td>
      <td>Total</td>
    </tr>
    <xsl:for-each select="host_start" >
      <xsl:variable name="current_host" select="host/text()"/>
      <tr>
        <td>
          <a href="#{$current_host}"><xsl:value-of select="$current_host"/></a>
        </td>
        <td>
          <xsl:value-of select="substring(text(),5,6)"/>, <xsl:value-of select="substring(text(),12,8)"/>
        </td>
        <td>
          <xsl:choose>
            <xsl:when test="../host_end[host=$current_host]/text() != ''">
              <xsl:value-of select="substring(../host_end[host=$current_host]/text(),5,6)"/>, <xsl:value-of select="substring(../host_end[host=$current_host]/text(),12,8)"/>
            </xsl:when>
            <xsl:otherwise>(not finished)</xsl:otherwise>
          </xsl:choose>
        </td>
        <td>
          <xsl:value-of select="count(../results/result[host/text() = $current_host][threat/text() = 'High'])"/>
        </td>
        <td>
          <xsl:value-of select="count(../results/result[host/text() = $current_host][threat/text() = 'Medium'])"/>
        </td>
        <td>
          <xsl:value-of select="count(../results/result[host/text() = $current_host][threat/text() = 'Low'])"/>
        </td>
        <td>
          <xsl:value-of select="count(../results/result[host/text() = $current_host][threat/text() = 'Log'])"/>
        </td>
        <td>
          <xsl:value-of select="count(../results/result[host/text() = $current_host][threat/text() = 'False Positive'])"/>
        </td>
        <td>
          <xsl:value-of select="count(../results/result[host/text() = $current_host])"/>
        </td>
      </tr>
    </xsl:for-each>
    <tr>
      <td>Total: <xsl:value-of select="count(host_start)"/></td>
      <td></td>
      <td></td>
      <td>
        <xsl:value-of select="count(results/result[threat/text() = 'High'])"/>
      </td>
      <td>
        <xsl:value-of select="count(results/result[threat/text() = 'Medium'])"/>
      </td>
      <td>
        <xsl:value-of select="count(results/result[threat/text() = 'Low'])"/>
      </td>
      <td>
        <xsl:value-of select="count(results/result[threat/text() = 'Log'])"/>
      </td>
      <td>
        <xsl:value-of select="count(results/result[threat/text() = 'False Positive'])"/>
      </td>
      <td>
        <xsl:value-of select="count(results/result)"/>
      </td>
    </tr>
  </table>
</xsl:template>

<xsl:template match="port">
  <xsl:variable name="class">
    <xsl:choose>
      <xsl:when test="position() mod 2 = 0">even</xsl:when>
      <xsl:otherwise>odd</xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <tr class="{$class}">
    <td><xsl:value-of select="text()"/></td>
    <td><xsl:value-of select="threat"/></td>
  </tr>
</xsl:template>

<xsl:template match="get_reports_response/report/report" mode="details">
  <xsl:for-each select="host_start" >
    <xsl:variable name="current_host" select="host/text()"/>
    <a name="{$current_host}"></a>
    <h2>
      Port summary for host &quot;<xsl:value-of select="$current_host"/>&quot;
    </h2>
    <table class="gbntable" cellspacing="2" cellpadding="4">
      <tr class="gbntablehead2">
        <td>Service (Port)</td>
        <td>Threat</td>
      </tr>
      <xsl:apply-templates select="../ports/port[host/text() = $current_host]"/>
    </table>
    <a name="{$current_host}"/>
    <h3>
      Security Issues reported for <xsl:value-of select="$current_host"/>
    </h3>
    <xsl:apply-templates
      select="../results/result[host/text() = $current_host]"
      mode="detailed"/>
    <a href="#summary">Back to summary</a>
  </xsl:for-each>
</xsl:template>

<!-- END REPORT DETAILS -->

<!-- BEGIN SYSTEM REPORTS MANAGEMENT -->

<xsl:template match="system_report">
  <tr>
    <td>
      <h1><xsl:value-of select="title"/></h1>
    </td>
  </tr>
  <tr>
    <td>
      <img src="/system_report/{name}/report.png?duration={../../duration}&amp;slave_id={../../slave/@id}"/>
    </td>
  </tr>
</xsl:template>

<xsl:template match="get_system_reports_response">
  <xsl:variable name="duration" select="../duration"/>
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">Performance
      <a href="/help/performance.html"
         title="Help: Performance">
        <img src="/img/help.png"/>
      </a>
    </div>
    <div class="gb_window_part_content_no_pad">
      <table>
        <tr>
          <td>
            Reports span the last:
          </td>
          <td>
            <xsl:choose>
              <xsl:when test="$duration='3600'">
                hour
              </xsl:when>
              <xsl:otherwise>
                <a href="/omp?cmd=get_system_reports&amp;duration={3600}">hour</a>
              </xsl:otherwise>
            </xsl:choose>
            |
            <xsl:choose>
              <xsl:when test="$duration='86400'">
                day
              </xsl:when>
              <xsl:otherwise>
                <a href="/omp?cmd=get_system_reports&amp;duration={86400}">day</a>
              </xsl:otherwise>
            </xsl:choose>
            |
            <xsl:choose>
              <xsl:when test="$duration='604800'">
                week
              </xsl:when>
              <xsl:otherwise>
                <a href="/omp?cmd=get_system_reports&amp;duration={604800}">week</a>
              </xsl:otherwise>
            </xsl:choose>
            |
            <xsl:choose>
              <xsl:when test="$duration='2592000'">
                month
              </xsl:when>
              <xsl:otherwise>
                <a href="/omp?cmd=get_system_reports&amp;duration={2592000}">month</a>
              </xsl:otherwise>
            </xsl:choose>
            |
            <xsl:choose>
              <xsl:when test="$duration='31536000'">
                year
              </xsl:when>
              <xsl:otherwise>
                <a href="/omp?cmd=get_system_reports&amp;duration={31536000}">year</a>
              </xsl:otherwise>
            </xsl:choose>
          </td>
        </tr>
        <tr>
          <td>
            Reports for slave:
          </td>
          <td>
            <div id="small_form" style="float:left;">
              <form action="" method="get">
                <input type="hidden" name="cmd" value="get_system_reports"/>
                <input type="hidden" name="duration" value="{$duration}"/>
                <select name="slave_id">
                  <xsl:variable name="slave_id">
                    <xsl:value-of select="../slave/@id"/>
                  </xsl:variable>
                  <xsl:choose>
                    <xsl:when test="string-length ($slave_id) &gt; 0">
                      <option value="0">--</option>
                    </xsl:when>
                    <xsl:otherwise>
                      <option value="0" selected="1">--</option>
                    </xsl:otherwise>
                  </xsl:choose>
                  <xsl:for-each select="../get_slaves_response/slave">
                    <xsl:choose>
                      <xsl:when test="@id = $slave_id">
                        <option value="{@id}" selected="1"><xsl:value-of select="name"/></option>
                      </xsl:when>
                      <xsl:otherwise>
                        <option value="{@id}"><xsl:value-of select="name"/></option>
                      </xsl:otherwise>
                    </xsl:choose>
                  </xsl:for-each>
                </select>
                <input type="image"
                       name="Update"
                       src="/img/refresh.png"
                       alt="Update" style="margin-left:3px;margin-right:3px;"/>
              </form>
            </div>
          </td>
        </tr>
      </table>
      <table>
        <xsl:apply-templates select="system_report"/>
      </table>
    </div>
  </div>
</xsl:template>

<!--     GET_SYSTEM_REPORTS -->

<xsl:template match="get_system_reports">
  <xsl:apply-templates select="gsad_msg"/>
  <xsl:choose>
    <xsl:when test="get_system_reports_response/@status = '500'">
      <xsl:call-template name="command_result_dialog">
        <xsl:with-param name="operation">
          Get System Reports
        </xsl:with-param>
        <xsl:with-param name="status">
          <xsl:value-of select="500"/>
        </xsl:with-param>
        <xsl:with-param name="msg">
          <xsl:value-of select="get_system_reports_response/@status_text"/>
        </xsl:with-param>
        <xsl:with-param name="details">
          There was an error getting the performance results.  Please ensure that
          there is a system reporting program installed with the Manager, and that
          this program is configured correctly.
        </xsl:with-param>
      </xsl:call-template>
    </xsl:when>
    <xsl:otherwise>
      <xsl:apply-templates select="get_system_reports_response"/>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<!-- END SYSTEM REPORTS MANAGEMENT -->

<!-- GSAD_RESPONSE -->

<xsl:template match="gsad_response">
  <xsl:call-template name="error_dialog">
    <xsl:with-param name="title">
      <xsl:value-of select="title"/>
    </xsl:with-param>
    <xsl:with-param name="message">
      <xsl:value-of select="message"/>
    </xsl:with-param>
    <xsl:with-param name="backurl">
      <xsl:value-of select="backurl"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<!-- NEW_TASK -->

<xsl:template match="new_task">
  <xsl:apply-templates select="gsad_msg"/>

  <div class="gb_window_part_left"></div>
  <div class="gb_window_part_right"></div>
  <div class="gb_window_part_center">New Task
    <a href="/help/new_task.html#newtask" title="Help: New Task">
      <img src="/img/help.png"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <form action="/omp" method="post" enctype="multipart/form-data">
      <input type="hidden" name="cmd" value="create_task"/>
      <input type="hidden" name="overrides" value="{apply_overrides}"/>
      <table border="0" cellspacing="0" cellpadding="3" width="100%">
        <tr>
         <td valign="top" width="125">Name</td>
         <td>
           <input type="text" name="name" value="unnamed" size="30"
                  maxlength="80"/>
         </td>
        </tr>
        <tr>
          <td valign="top" width="125">Comment (optional)</td>
          <td>
            <input type="text" name="comment" size="30" maxlength="400"/>
          </td>
        </tr>
        <tr>
          <td valign="top">Scan Config</td>
          <td>
            <select name="config_id">
              <xsl:apply-templates select="get_configs_response/config"
                                   mode="newtask"/>
            </select>
          </td>
        </tr>
        <tr>
          <td>Scan Targets</td>
          <td>
            <select name="target_id">
              <xsl:apply-templates select="get_targets_response/target"
                                   mode="newtask"/>
            </select>
          </td>
        </tr>
        <tr>
          <td>Escalator (optional)</td>
          <td>
            <select name="escalator_id">
              <option value="--">--</option>
              <xsl:apply-templates select="get_escalators_response/escalator"
                                   mode="newtask"/>
            </select>
          </td>
        </tr>
        <tr>
          <td>Schedule (optional)</td>
          <td>
            <select name="schedule_id">
              <option value="--">--</option>
              <xsl:apply-templates select="get_schedules_response/schedule"
                                   mode="newtask"/>
            </select>
          </td>
        </tr>
        <tr>
          <td>Slave (optional)</td>
          <td>
            <select name="slave_id">
              <option value="--">--</option>
              <xsl:apply-templates select="get_slaves_response/slave"
                                   mode="newtask"/>
            </select>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="text-align:right;">
            <input type="submit" name="submit" value="Create Task"/>
          </td>
        </tr>
      </table>
      <br/>
    </form>
  </div>
</xsl:template>

<!-- COMMANDS_RESPONSE -->

<xsl:template match="commands_response">
  <xsl:apply-templates/>
</xsl:template>

</xsl:stylesheet>
