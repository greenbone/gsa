<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
      version="1.0"
      xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
     <xsl:output
      method="html"
      doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"
      doctype-public="-//W3C//DTD XHTML 1.0 Transitional//EN"
      encoding="UTF-8"/>

<!--
Greenbone Security Assistant
$Id$
Description: Non-OMP dialog pages for GSA.

Authors:
Henri Doreau <henri.doreau@greenbone.net>

Copyright:
Copyright (C) 2011 Greenbone Networks GmbH

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

<xsl:template match="dialog">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
       <xsl:apply-templates mode="dialog"/>
  </div>
</xsl:template>

<xsl:template mode="dialog" match="*">
  <div class="gb_window_part_center">Page Not Found</div>
  <div class="gb_window_part_content">
    <div style="text-align:left">
      <h1>Page Not Found</h1>

      <p>
        We apologize for any inconvenience.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="dialog" match="browse_infosec.html">
  <div class="gb_window_part_center">Security Information Management</div>
  <div class="gb_window_part_content">
    <div style="text-align:left">
      <h1>Security Information browser</h1>
      <table>
        <tr>
          <td>
            <h2>CVE Lookup</h2>
          </td>
        </tr>
        <tr>
          <td>
            <form name="input"
                  action="/omp"
                  method="get">
              <input type="text" name="info_name" value="CVE-"/>
              <input type="hidden" name="cmd" value="get_info"/>
              <input type="hidden" name="info_type" value="CVE"/>
              <input type="hidden" name="token" value="{/envelope/token}"/>
              <input type="submit" value="Search"/>
            </form> 
          </td>
        </tr>
        <tr>
          <td>
            <h2>CPE Lookup</h2>
          </td>
        </tr>
        <tr>
          <td>
            <form name="input"
                  action="/omp"
                  method="get">
              <input type="text" name="info_name" value="cpe:/a:"/>
              <input type="hidden" name="cmd" value="get_info"/>
              <input type="hidden" name="info_type" value="CPE"/>
              <input type="hidden" name="token" value="{/envelope/token}"/>
              <input type="submit" value="Search"/>
            </form> 
          </td>
        </tr>
      </table>
    </div>
  </div>
</xsl:template>

</xsl:stylesheet>
