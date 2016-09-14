<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
    version="1.0">

<!--
Greenbone Security Assistant
$Id$
Description: Dummy stylesheet for dynamic strings in other stylesheets.

Authors:
Timo Pollmeier <timo.pollmeier@greenbone.net>

Copyright:
Copyright (C) 2015 Greenbone Networks GmbH

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
-->

<!--
  This stylesheet is a helper file for generating translation template (pot)
  files and contains commonly used strings that cannot be extracted literally
  from the other stylesheets as they are passed to the i18n function
  as variables or function return values.

  This file is not used for any actual transformations.
-->

<!--
  Messages generated internally
-->

<!-- Login page messages generated internally -->
<xsl:template name="login-msgs">
  <xsl:value-of select="gsa:i18n ('Successfully logged out.')"/>
  <xsl:value-of select="gsa:i18n ('Already logged out.')"/>
  <xsl:value-of select="gsa:i18n ('Logged out. OMP service is down.')"/>
  <xsl:value-of select="gsa:i18n ('Login failed.')"/>
  <xsl:value-of select="gsa:i18n ('Login failed.  OMP service is down.')"/>
  <xsl:value-of select="gsa:i18n ('Login failed.  Error during authentication.')"/>
  <xsl:value-of select="gsa:i18n ('Session has expired.  Please login again.')"/>
  <xsl:value-of select="gsa:i18n ('Cookie missing or bad.  Please login again.')"/>
  <xsl:value-of select="gsa:i18n ('Token missing or bad.  Please login again.')"/>
</xsl:template>


<!--
  Strings where resource types are inserted
-->

<!-- A singular resource type name like "Task" -->
<xsl:template name="type-name">
  <xsl:value-of select="gsa:i18n ('Task')"/>
  <xsl:value-of select="gsa:i18n ('Note')"/>
  <xsl:value-of select="gsa:i18n ('Override')"/>
  <xsl:value-of select="gsa:i18n ('NVT')"/>
  <xsl:value-of select="gsa:i18n ('CVE')"/>
  <xsl:value-of select="gsa:i18n ('CPE')"/>
  <xsl:value-of select="gsa:i18n ('OVAL Definition')"/>
  <xsl:value-of select="gsa:i18n ('CERT-Bund Advisory')"/>
  <xsl:value-of select="gsa:i18n ('DFN-CERT Advisory')"/>
  <xsl:value-of select="gsa:i18n ('Target')"/>
  <xsl:value-of select="gsa:i18n ('Port List')"/>
  <xsl:value-of select="gsa:i18n ('Credential')"/>
  <xsl:value-of select="gsa:i18n ('Config')"/>
  <xsl:value-of select="gsa:i18n ('Scan Config')"/>
  <xsl:value-of select="gsa:i18n ('Scan Configuration')"/>
  <xsl:value-of select="gsa:i18n ('Alert')"/>
  <xsl:value-of select="gsa:i18n ('Schedule')"/>
  <xsl:value-of select="gsa:i18n ('Report Format')"/>
  <xsl:value-of select="gsa:i18n ('Slave')"/>
  <xsl:value-of select="gsa:i18n ('Agent')"/>
  <xsl:value-of select="gsa:i18n ('Scanner')"/>
  <xsl:value-of select="gsa:i18n ('Filter')"/>
  <xsl:value-of select="gsa:i18n ('Tag')"/>
  <xsl:value-of select="gsa:i18n ('Permission')"/>
  <xsl:value-of select="gsa:i18n ('User')"/>
  <xsl:value-of select="gsa:i18n ('Group')"/>
  <xsl:value-of select="gsa:i18n ('Role')"/>
</xsl:template>

<!-- A plural resource type name like "Tasks" -->
<xsl:template name="type-name-plural">
  <xsl:value-of select="gsa:i18n ('Tasks')"/>
  <xsl:value-of select="gsa:i18n ('Notes')"/>
  <xsl:value-of select="gsa:i18n ('Overrides')"/>
  <xsl:value-of select="gsa:i18n ('NVTs')"/>
  <xsl:value-of select="gsa:i18n ('CVEs')"/>
  <xsl:value-of select="gsa:i18n ('CPEs')"/>
  <xsl:value-of select="gsa:i18n ('OVAL Definitions')"/>
  <xsl:value-of select="gsa:i18n ('CERT-Bund Advisories')"/>
  <xsl:value-of select="gsa:i18n ('DFN-CERT Advisories')"/>
  <xsl:value-of select="gsa:i18n ('All SecInfo Information')"/>
  <xsl:value-of select="gsa:i18n ('Targets')"/>
  <xsl:value-of select="gsa:i18n ('Port Lists')"/>
  <xsl:value-of select="gsa:i18n ('Credentials')"/>
  <xsl:value-of select="gsa:i18n ('Configs')"/>
  <xsl:value-of select="gsa:i18n ('Scan Configs')"/>
  <xsl:value-of select="gsa:i18n ('Scan Configurations')"/>
  <xsl:value-of select="gsa:i18n ('Alerts')"/>
  <xsl:value-of select="gsa:i18n ('Schedules')"/>
  <xsl:value-of select="gsa:i18n ('Report Formats')"/>
  <xsl:value-of select="gsa:i18n ('Slaves')"/>
  <xsl:value-of select="gsa:i18n ('Agents')"/>
  <xsl:value-of select="gsa:i18n ('Scanners')"/>
  <xsl:value-of select="gsa:i18n ('Filters')"/>
  <xsl:value-of select="gsa:i18n ('Tags')"/>
  <xsl:value-of select="gsa:i18n ('Permissions')"/>
  <xsl:value-of select="gsa:i18n ('Users')"/>
  <xsl:value-of select="gsa:i18n ('Groups')"/>
  <xsl:value-of select="gsa:i18n ('Roles')"/>
</xsl:template>

<!-- A resource type global label like "Global Task" -->
<xsl:template name="type-global">
  <xsl:value-of select="gsa:i18n ('Global Task')"/>
  <xsl:value-of select="gsa:i18n ('Global Note')"/>
  <xsl:value-of select="gsa:i18n ('Global Override')"/>
  <xsl:value-of select="gsa:i18n ('Global Target')"/>
  <xsl:value-of select="gsa:i18n ('Global Port List')"/>
  <xsl:value-of select="gsa:i18n ('Global Credential')"/>
  <xsl:value-of select="gsa:i18n ('Global Config')"/>
  <xsl:value-of select="gsa:i18n ('Global Scan Config')"/>
  <xsl:value-of select="gsa:i18n ('Global Scan Configuration')"/>
  <xsl:value-of select="gsa:i18n ('Global Alert')"/>
  <xsl:value-of select="gsa:i18n ('Global Schedule')"/>
  <xsl:value-of select="gsa:i18n ('Global Report Format')"/>
  <xsl:value-of select="gsa:i18n ('Global Slave')"/>
  <xsl:value-of select="gsa:i18n ('Global Agent')"/>
  <xsl:value-of select="gsa:i18n ('Global Scanner')"/>
  <xsl:value-of select="gsa:i18n ('Global Filter')"/>
  <xsl:value-of select="gsa:i18n ('Global Tag')"/>
  <xsl:value-of select="gsa:i18n ('Global Permission')"/>
  <xsl:value-of select="gsa:i18n ('Global User')"/>
  <xsl:value-of select="gsa:i18n ('Global Group')"/>
  <xsl:value-of select="gsa:i18n ('Global Role')"/>
</xsl:template>

<!-- A resource type "owned by" label like "Task owned by User123" -->
<xsl:template name="type-owned">
  <xsl:value-of select="gsa:i18n ('Task owned by %1')"/>
  <xsl:value-of select="gsa:i18n ('Report owned by %1')"/>
  <xsl:value-of select="gsa:i18n ('Result owned by %1')"/>
  <xsl:value-of select="gsa:i18n ('Note owned by %1')"/>
  <xsl:value-of select="gsa:i18n ('Override owned by %1')"/>
  <xsl:value-of select="gsa:i18n ('Target owned by %1')"/>
  <xsl:value-of select="gsa:i18n ('Port List owned by %1')"/>
  <xsl:value-of select="gsa:i18n ('Credential owned by %1')"/>
  <xsl:value-of select="gsa:i18n ('Scan Config owned by %1')"/>
  <xsl:value-of select="gsa:i18n ('Alert owned by %1')"/>
  <xsl:value-of select="gsa:i18n ('Schedule owned by %1')"/>
  <xsl:value-of select="gsa:i18n ('Report Format owned by %1')"/>
  <xsl:value-of select="gsa:i18n ('Slave owned by %1')"/>
  <xsl:value-of select="gsa:i18n ('Agent owned by %1')"/>
  <xsl:value-of select="gsa:i18n ('Scanner owned by %1')"/>
  <xsl:value-of select="gsa:i18n ('Filter owned by %1')"/>
  <xsl:value-of select="gsa:i18n ('Tag owned by %1')"/>
  <xsl:value-of select="gsa:i18n ('Permission owned by %1')"/>
  <xsl:value-of select="gsa:i18n ('User owned by %1')"/>
  <xsl:value-of select="gsa:i18n ('Group owned by %1')"/>
  <xsl:value-of select="gsa:i18n ('Role owned by %1')"/>
</xsl:template>

<!-- A details label like "Task Details" -->
<xsl:template name="type-details">
  <xsl:value-of select="gsa:i18n ('Task Details')"/>
  <xsl:value-of select="gsa:i18n ('Report Details')"/>
  <xsl:value-of select="gsa:i18n ('Host Details')"/>
  <xsl:value-of select="gsa:i18n ('Result Details')"/>
  <xsl:value-of select="gsa:i18n ('Note Details')"/>
  <xsl:value-of select="gsa:i18n ('Override Details')"/>
  <xsl:value-of select="gsa:i18n ('NVT Details')"/>
  <xsl:value-of select="gsa:i18n ('CVE Details')"/>
  <xsl:value-of select="gsa:i18n ('CPE Details')"/>
  <xsl:value-of select="gsa:i18n ('OVAL Definition Details')"/>
  <xsl:value-of select="gsa:i18n ('CERT-Bund Advisory Details')"/>
  <xsl:value-of select="gsa:i18n ('DFN-CERT Advisory Details')"/>
  <xsl:value-of select="gsa:i18n ('Target Details')"/>
  <xsl:value-of select="gsa:i18n ('Port List Details')"/>
  <xsl:value-of select="gsa:i18n ('Credential Details')"/>
  <xsl:value-of select="gsa:i18n ('Scan Config Details')"/>
  <xsl:value-of select="gsa:i18n ('Alert Details')"/>
  <xsl:value-of select="gsa:i18n ('Schedule Details')"/>
  <xsl:value-of select="gsa:i18n ('Report Format Details')"/>
  <xsl:value-of select="gsa:i18n ('Slave Details')"/>
  <xsl:value-of select="gsa:i18n ('Agent Details')"/>
  <xsl:value-of select="gsa:i18n ('Scanner Details')"/>
  <xsl:value-of select="gsa:i18n ('Filter Details')"/>
  <xsl:value-of select="gsa:i18n ('Tag Details')"/>
  <xsl:value-of select="gsa:i18n ('Permission Details')"/>
  <xsl:value-of select="gsa:i18n ('User Details')"/>
  <xsl:value-of select="gsa:i18n ('Group Details')"/>
  <xsl:value-of select="gsa:i18n ('Role Details')"/>
</xsl:template>

<!-- A long details label like "View details of Task SomeTask" -->
<xsl:template name="type-details-long">
  <xsl:value-of select="gsa:i18n ('View details of Task %1')"/>
  <xsl:value-of select="gsa:i18n ('View details of Report %1')"/>
  <xsl:value-of select="gsa:i18n ('View details of Host %1')"/>
  <xsl:value-of select="gsa:i18n ('View details of Result %1')"/>
  <xsl:value-of select="gsa:i18n ('View details of Note %1')"/>
  <xsl:value-of select="gsa:i18n ('View details of Override %1')"/>
  <xsl:value-of select="gsa:i18n ('View details of NVT %1')"/>
  <xsl:value-of select="gsa:i18n ('View details of CVE %1')"/>
  <xsl:value-of select="gsa:i18n ('View details of CPE %1')"/>
  <xsl:value-of select="gsa:i18n ('View details of OVAL Definition %1')"/>
  <xsl:value-of select="gsa:i18n ('View details of CERT-Bund Advisory %1')"/>
  <xsl:value-of select="gsa:i18n ('View details of DFN-CERT Advisory %1')"/>
  <xsl:value-of select="gsa:i18n ('View details of Target %1')"/>
  <xsl:value-of select="gsa:i18n ('View details of Port List %1')"/>
  <xsl:value-of select="gsa:i18n ('View details of Credential %1')"/>
  <xsl:value-of select="gsa:i18n ('View details of Scan Config %1')"/>
  <xsl:value-of select="gsa:i18n ('View details of Alert %1')"/>
  <xsl:value-of select="gsa:i18n ('View details of Schedule %1')"/>
  <xsl:value-of select="gsa:i18n ('View details of Report Format %1')"/>
  <xsl:value-of select="gsa:i18n ('View details of Slave %1')"/>
  <xsl:value-of select="gsa:i18n ('View details of Agent %1')"/>
  <xsl:value-of select="gsa:i18n ('View details of Scanner %1')"/>
  <xsl:value-of select="gsa:i18n ('View details of Filter %1')"/>
  <xsl:value-of select="gsa:i18n ('View details of Tag %1')"/>
  <xsl:value-of select="gsa:i18n ('View details of Permission %1')"/>
  <xsl:value-of select="gsa:i18n ('View details of User %1')"/>
  <xsl:value-of select="gsa:i18n ('View details of Group %1')"/>
  <xsl:value-of select="gsa:i18n ('View details of Role %1')"/>
</xsl:template>

<!--  A single resource export like "Export Task" -->
<xsl:template name="type-export">
  <xsl:value-of select="gsa:i18n ('Export Task')"/>
  <xsl:value-of select="gsa:i18n ('Export Note')"/>
  <xsl:value-of select="gsa:i18n ('Export Override')"/>
  <xsl:value-of select="gsa:i18n ('Export Target')"/>
  <xsl:value-of select="gsa:i18n ('Export Port List')"/>
  <xsl:value-of select="gsa:i18n ('Export Credential')"/>
  <xsl:value-of select="gsa:i18n ('Export Scan Config')"/>
  <xsl:value-of select="gsa:i18n ('Export Alert')"/>
  <xsl:value-of select="gsa:i18n ('Export Schedule')"/>
  <xsl:value-of select="gsa:i18n ('Export Report Format')"/>
  <xsl:value-of select="gsa:i18n ('Export Slave')"/>
  <xsl:value-of select="gsa:i18n ('Export Agent')"/>
  <xsl:value-of select="gsa:i18n ('Export Scanner')"/>
  <xsl:value-of select="gsa:i18n ('Export Filter')"/>
  <xsl:value-of select="gsa:i18n ('Export Tag')"/>
  <xsl:value-of select="gsa:i18n ('Export Permission')"/>
  <xsl:value-of select="gsa:i18n ('Export User')"/>
  <xsl:value-of select="gsa:i18n ('Export Group')"/>
  <xsl:value-of select="gsa:i18n ('Export Role')"/>
</xsl:template>

<!--  A single resource export like "Export Task as XML" -->
<xsl:template name="type-export-xml">
  <xsl:value-of select="gsa:i18n ('Export Task as XML')"/>
  <xsl:value-of select="gsa:i18n ('Export Note as XML')"/>
  <xsl:value-of select="gsa:i18n ('Export Override as XML')"/>
  <xsl:value-of select="gsa:i18n ('Export Target as XML')"/>
  <xsl:value-of select="gsa:i18n ('Export Port List as XML')"/>
  <xsl:value-of select="gsa:i18n ('Export Credential as XML')"/>
  <xsl:value-of select="gsa:i18n ('Export Scan Config as XML')"/>
  <xsl:value-of select="gsa:i18n ('Export Alert as XML')"/>
  <xsl:value-of select="gsa:i18n ('Export Schedule as XML')"/>
  <xsl:value-of select="gsa:i18n ('Export Report Format as XML')"/>
  <xsl:value-of select="gsa:i18n ('Export Slave as XML')"/>
  <xsl:value-of select="gsa:i18n ('Export Agent as XML')"/>
  <xsl:value-of select="gsa:i18n ('Export Scanner as XML')"/>
  <xsl:value-of select="gsa:i18n ('Export Filter as XML')"/>
  <xsl:value-of select="gsa:i18n ('Export Tag as XML')"/>
  <xsl:value-of select="gsa:i18n ('Export Permission as XML')"/>
  <xsl:value-of select="gsa:i18n ('Export User as XML')"/>
  <xsl:value-of select="gsa:i18n ('Export Group as XML')"/>
  <xsl:value-of select="gsa:i18n ('Export Role as XML')"/>
</xsl:template>

<!-- A multiple resource export like "Export 10 filtered Tasks as XML" -->
<xsl:template name="type-export-multiple-filtered-xml">
  <xsl:value-of select="gsa:n-i18n ('Export %1 filtered Task as XML', 'Export %1 filtered Tasks as XML', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('Export %1 filtered Note as XML', 'Export %1 filtered Notes as XML', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('Export %1 filtered Override as XML', 'Export %1 filtered Overrides as XML', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('Export %1 filtered Target as XML', 'Export %1 filtered Targets as XML', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('Export %1 filtered Port List as XML', 'Export %1 filtered Port Lists as XML', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('Export %1 filtered Credential as XML', 'Export %1 filtered Credentials as XML', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('Export %1 filtered Scan Config as XML', 'Export %1 filtered Scan Configs as XML', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('Export %1 filtered Alert as XML', 'Export %1 filtered Alerts as XML', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('Export %1 filtered Schedule as XML', 'Export %1 filtered Schedules as XML', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('Export %1 filtered Report Format as XML', 'Export %1 filtered Report Formats as XML', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('Export %1 filtered Slave as XML', 'Export %1 filtered Slaves as XML', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('Export %1 filtered Agent as XML', 'Export %1 filtered Agents as XML', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('Export %1 filtered Scanner as XML', 'Export %1 filtered Scanners as XML', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('Export %1 filtered Filter as XML', 'Export %1 filtered Filters as XML', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('Export %1 filtered Tag as XML', 'Export %1 filtered Tags as XML', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('Export %1 filtered Permission as XML', 'Export %1 filtered Permissions as XML', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('Export %1 filtered User as XML', 'Export %1 filtered Users as XML', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('Export %1 filtered Group as XML', 'Export %1 filtered Groups as XML', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('Export %1 filtered Role as XML', 'Export %1 filtered Roles as XML', 0)"/>
</xsl:template>

<!-- A filter label like "Task Filter" -->
<xsl:template name="type-filter">
  <xsl:value-of select="gsa:i18n ('Task Filter')"/>
  <xsl:value-of select="gsa:i18n ('Report Filter')"/>
  <xsl:value-of select="gsa:i18n ('Result Filter')"/>
  <xsl:value-of select="gsa:i18n ('Note Filter')"/>
  <xsl:value-of select="gsa:i18n ('Override Filter')"/>
  <xsl:value-of select="gsa:i18n ('NVT Filter')"/>
  <xsl:value-of select="gsa:i18n ('CVE Filter')"/>
  <xsl:value-of select="gsa:i18n ('CPE Filter')"/>
  <xsl:value-of select="gsa:i18n ('OVAL Filter')"/>
  <xsl:value-of select="gsa:i18n ('CERT-Bund Filter')"/>
  <xsl:value-of select="gsa:i18n ('DFN-CERT Filter')"/>
  <xsl:value-of select="gsa:i18n ('Info Filter')"/>
  <xsl:value-of select="gsa:i18n ('All SecInfo Filter')"/>
  <xsl:value-of select="gsa:i18n ('Target Filter')"/>
  <xsl:value-of select="gsa:i18n ('Port List Filter')"/>
  <xsl:value-of select="gsa:i18n ('Credential Filter')"/>
  <xsl:value-of select="gsa:i18n ('Scan Config Filter')"/>
  <xsl:value-of select="gsa:i18n ('Alert Filter')"/>
  <xsl:value-of select="gsa:i18n ('Schedule Filter')"/>
  <xsl:value-of select="gsa:i18n ('Report Format Filter')"/>
  <xsl:value-of select="gsa:i18n ('Slave Filter')"/>
  <xsl:value-of select="gsa:i18n ('Agent Filter')"/>
  <xsl:value-of select="gsa:i18n ('Scanner Filter')"/>
  <xsl:value-of select="gsa:i18n ('Filter Filter')"/>
  <xsl:value-of select="gsa:i18n ('Tag Filter')"/>
  <xsl:value-of select="gsa:i18n ('Permission Filter')"/>
  <xsl:value-of select="gsa:i18n ('User Filter')"/>
  <xsl:value-of select="gsa:i18n ('Group Filter')"/>
  <xsl:value-of select="gsa:i18n ('Role Filter')"/>
</xsl:template>

<!-- A resource permissions label like "Permissions for Task" -->
<xsl:template name="type-permissions">
  <xsl:value-of select="gsa:i18n ('Permissions for Task &quot;%1&quot;')"/>
  <xsl:value-of select="gsa:i18n ('Permissions for Target &quot;%1&quot;')"/>
  <xsl:value-of select="gsa:i18n ('Permissions for Port List &quot;%1&quot;')"/>
  <xsl:value-of select="gsa:i18n ('Permissions for Credential &quot;%1&quot;')"/>
  <xsl:value-of select="gsa:i18n ('Permissions for Scan Config &quot;%1&quot;')"/>
  <xsl:value-of select="gsa:i18n ('Permissions for Alert &quot;%1&quot;')"/>
  <xsl:value-of select="gsa:i18n ('Permissions for Schedule &quot;%1&quot;')"/>
  <xsl:value-of select="gsa:i18n ('Permissions for Report Format &quot;%1&quot;')"/>
  <xsl:value-of select="gsa:i18n ('Permissions for Slave &quot;%1&quot;')"/>
  <xsl:value-of select="gsa:i18n ('Permissions for Agent &quot;%1&quot;')"/>
  <xsl:value-of select="gsa:i18n ('Permissions for Scanner &quot;%1&quot;')"/>
  <xsl:value-of select="gsa:i18n ('Permissions for Filter &quot;%1&quot;')"/>
  <xsl:value-of select="gsa:i18n ('Permissions for Tag &quot;%1&quot;')"/>
  <xsl:value-of select="gsa:i18n ('Permissions for Permission &quot;%1&quot;')"/>
  <xsl:value-of select="gsa:i18n ('Permissions for User &quot;%1&quot;')"/>
  <xsl:value-of select="gsa:i18n ('Permissions for Group &quot;%1&quot;')"/>
  <xsl:value-of select="gsa:i18n ('Permissions for Role &quot;%1&quot;')"/>
</xsl:template>

<!-- A new filter label like "New Task Filter from current term" -->
<xsl:template name="type-new-filter">
  <xsl:value-of select="gsa:i18n ('New Task Filter from current term')"/>
  <xsl:value-of select="gsa:i18n ('New Report Filter from current term')"/>
  <xsl:value-of select="gsa:i18n ('New Result Filter from current term')"/>
  <xsl:value-of select="gsa:i18n ('New Note Filter from current term')"/>
  <xsl:value-of select="gsa:i18n ('New Override Filter from current term')"/>
  <xsl:value-of select="gsa:i18n ('New Info Filter from current term')"/>
  <xsl:value-of select="gsa:i18n ('New All SecInfo Filter from current term')"/>
  <xsl:value-of select="gsa:i18n ('New Target Filter from current term')"/>
  <xsl:value-of select="gsa:i18n ('New Port List Filter from current term')"/>
  <xsl:value-of select="gsa:i18n ('New Credential Filter from current term')"/>
  <xsl:value-of select="gsa:i18n ('New Scan Config Filter from current term')"/>
  <xsl:value-of select="gsa:i18n ('New Alert Filter from current term')"/>
  <xsl:value-of select="gsa:i18n ('New Schedule Filter from current term')"/>
  <xsl:value-of select="gsa:i18n ('New Report Format Filter from current term')"/>
  <xsl:value-of select="gsa:i18n ('New Slave Filter from current term')"/>
  <xsl:value-of select="gsa:i18n ('New Agent Filter from current term')"/>
  <xsl:value-of select="gsa:i18n ('New Scanner Filter from current term')"/>
  <xsl:value-of select="gsa:i18n ('New Filter Filter from current term')"/>
  <xsl:value-of select="gsa:i18n ('New Tag Filter from current term')"/>
  <xsl:value-of select="gsa:i18n ('New Permission Filter from current term')"/>
  <xsl:value-of select="gsa:i18n ('New User Filter from current term')"/>
  <xsl:value-of select="gsa:i18n ('New Group Filter from current term')"/>
  <xsl:value-of select="gsa:i18n ('New Role Filter from current term')"/>
</xsl:template>

<!-- "New ..." label like "New Task" -->
<xsl:template name="type-new">
  <xsl:value-of select="gsa:i18n ('New Task')"/>
  <xsl:value-of select="gsa:i18n ('New Note')"/>
  <xsl:value-of select="gsa:i18n ('New Override')"/>
  <xsl:value-of select="gsa:i18n ('New Target')"/>
  <xsl:value-of select="gsa:i18n ('New Port List')"/>
  <xsl:value-of select="gsa:i18n ('New Credential')"/>
  <xsl:value-of select="gsa:i18n ('New Scan Config')"/>
  <xsl:value-of select="gsa:i18n ('New Alert')"/>
  <xsl:value-of select="gsa:i18n ('New Schedule')"/>
  <xsl:value-of select="gsa:i18n ('New Report Format')"/>
  <xsl:value-of select="gsa:i18n ('New Slave')"/>
  <xsl:value-of select="gsa:i18n ('New Agent')"/>
  <xsl:value-of select="gsa:i18n ('New Scanner')"/>
  <xsl:value-of select="gsa:i18n ('New Filter')"/>
  <xsl:value-of select="gsa:i18n ('New Tag')"/>
  <xsl:value-of select="gsa:i18n ('New Permission')"/>
  <xsl:value-of select="gsa:i18n ('New User')"/>
  <xsl:value-of select="gsa:i18n ('New Group')"/>
  <xsl:value-of select="gsa:i18n ('New Role')"/>
</xsl:template>

<!-- General text for denied actions like "Permission to delete Task denied" -->
<xsl:template name="type-action-denied">
  <xsl:value-of select="gsa:i18n ('Task is still in use')"/>
  <xsl:value-of select="gsa:i18n ('Note is still in use')"/>
  <xsl:value-of select="gsa:i18n ('Override is still in use')"/>
  <xsl:value-of select="gsa:i18n ('Target is still in use')"/>
  <xsl:value-of select="gsa:i18n ('Port List is still in use')"/>
  <xsl:value-of select="gsa:i18n ('Credential is still in use')"/>
  <xsl:value-of select="gsa:i18n ('Scan Config is still in use')"/>
  <xsl:value-of select="gsa:i18n ('Alert is still in use')"/>
  <xsl:value-of select="gsa:i18n ('Schedule is still in use')"/>
  <xsl:value-of select="gsa:i18n ('Report Format is still in use')"/>
  <xsl:value-of select="gsa:i18n ('Slave is still in use')"/>
  <xsl:value-of select="gsa:i18n ('Agent is still in use')"/>
  <xsl:value-of select="gsa:i18n ('Scanner is still in use')"/>
  <xsl:value-of select="gsa:i18n ('Filter is still in use')"/>
  <xsl:value-of select="gsa:i18n ('Tag is still in use')"/>
  <xsl:value-of select="gsa:i18n ('Permission is still in use')"/>
  <xsl:value-of select="gsa:i18n ('User is still in use')"/>
  <xsl:value-of select="gsa:i18n ('Group is still in use')"/>
  <xsl:value-of select="gsa:i18n ('Role is still in use')"/>

  <xsl:value-of select="gsa:i18n ('Task is not writable')"/>
  <xsl:value-of select="gsa:i18n ('Note is not writable')"/>
  <xsl:value-of select="gsa:i18n ('Override is not writable')"/>
  <xsl:value-of select="gsa:i18n ('Target is not writable')"/>
  <xsl:value-of select="gsa:i18n ('Port List is not writable')"/>
  <xsl:value-of select="gsa:i18n ('Credential is not writable')"/>
  <xsl:value-of select="gsa:i18n ('Scan Config is not writable')"/>
  <xsl:value-of select="gsa:i18n ('Alert is not writable')"/>
  <xsl:value-of select="gsa:i18n ('Schedule is not writable')"/>
  <xsl:value-of select="gsa:i18n ('Report Format is not writable')"/>
  <xsl:value-of select="gsa:i18n ('Slave is not writable')"/>
  <xsl:value-of select="gsa:i18n ('Agent is not writable')"/>
  <xsl:value-of select="gsa:i18n ('Scanner is not writable')"/>
  <xsl:value-of select="gsa:i18n ('Filter is not writable')"/>
  <xsl:value-of select="gsa:i18n ('Tag is not writable')"/>
  <xsl:value-of select="gsa:i18n ('Permission is not writable')"/>
  <xsl:value-of select="gsa:i18n ('User is not writable')"/>
  <xsl:value-of select="gsa:i18n ('Group is not writable')"/>
  <xsl:value-of select="gsa:i18n ('Role is not writable')"/>

  <xsl:value-of select="gsa:i18n ('Task cannot be deleted')"/>
  <xsl:value-of select="gsa:i18n ('Report cannot be deleted')"/>
  <xsl:value-of select="gsa:i18n ('Note cannot be deleted')"/>
  <xsl:value-of select="gsa:i18n ('Override cannot be deleted')"/>
  <xsl:value-of select="gsa:i18n ('Target cannot be deleted')"/>
  <xsl:value-of select="gsa:i18n ('Port List cannot be deleted')"/>
  <xsl:value-of select="gsa:i18n ('Credential cannot be deleted')"/>
  <xsl:value-of select="gsa:i18n ('Scan Config cannot be deleted')"/>
  <xsl:value-of select="gsa:i18n ('Alert cannot be deleted')"/>
  <xsl:value-of select="gsa:i18n ('Schedule cannot be deleted')"/>
  <xsl:value-of select="gsa:i18n ('Report Format cannot be deleted')"/>
  <xsl:value-of select="gsa:i18n ('Slave cannot be deleted')"/>
  <xsl:value-of select="gsa:i18n ('Agent cannot be deleted')"/>
  <xsl:value-of select="gsa:i18n ('Scanner cannot be deleted')"/>
  <xsl:value-of select="gsa:i18n ('Filter cannot be deleted')"/>
  <xsl:value-of select="gsa:i18n ('Tag cannot be deleted')"/>
  <xsl:value-of select="gsa:i18n ('Permission cannot be deleted')"/>
  <xsl:value-of select="gsa:i18n ('User cannot be deleted')"/>
  <xsl:value-of select="gsa:i18n ('Group cannot be deleted')"/>
  <xsl:value-of select="gsa:i18n ('Role cannot be deleted')"/>

  <xsl:value-of select="gsa:i18n ('Task cannot be moved to the trashcan')"/>
  <xsl:value-of select="gsa:i18n ('Report cannot be moved to the trashcan')"/>
  <xsl:value-of select="gsa:i18n ('Note cannot be moved to the trashcan')"/>
  <xsl:value-of select="gsa:i18n ('Override cannot be moved to the trashcan')"/>
  <xsl:value-of select="gsa:i18n ('Target cannot be moved to the trashcan')"/>
  <xsl:value-of select="gsa:i18n ('Port List cannot be moved to the trashcan')"/>
  <xsl:value-of select="gsa:i18n ('Credential cannot be moved to the trashcan')"/>
  <xsl:value-of select="gsa:i18n ('Scan Config cannot be moved to the trashcan')"/>
  <xsl:value-of select="gsa:i18n ('Alert cannot be moved to the trashcan')"/>
  <xsl:value-of select="gsa:i18n ('Schedule cannot be moved to the trashcan')"/>
  <xsl:value-of select="gsa:i18n ('Report Format cannot be moved to the trashcan')"/>
  <xsl:value-of select="gsa:i18n ('Slave cannot be moved to the trashcan')"/>
  <xsl:value-of select="gsa:i18n ('Agent cannot be moved to the trashcan')"/>
  <xsl:value-of select="gsa:i18n ('Scanner cannot be moved to the trashcan')"/>
  <xsl:value-of select="gsa:i18n ('Filter cannot be moved to the trashcan')"/>
  <xsl:value-of select="gsa:i18n ('Tag cannot be moved to the trashcan')"/>
  <xsl:value-of select="gsa:i18n ('Permission cannot be moved to the trashcan')"/>
  <xsl:value-of select="gsa:i18n ('User cannot be moved to the trashcan')"/>
  <xsl:value-of select="gsa:i18n ('Group cannot be moved to the trashcan')"/>
  <xsl:value-of select="gsa:i18n ('Role cannot be moved to the trashcan')"/>

  <xsl:value-of select="gsa:i18n ('Permission to move Task to trashcan denied')"/>
  <xsl:value-of select="gsa:i18n ('Permission to move Report to trashcan denied')"/>
  <xsl:value-of select="gsa:i18n ('Permission to move Note to trashcan denied')"/>
  <xsl:value-of select="gsa:i18n ('Permission to move Override to trashcan denied')"/>
  <xsl:value-of select="gsa:i18n ('Permission to move Target to trashcan denied')"/>
  <xsl:value-of select="gsa:i18n ('Permission to move Port List to trashcan denied')"/>
  <xsl:value-of select="gsa:i18n ('Permission to move Credential to trashcan denied')"/>
  <xsl:value-of select="gsa:i18n ('Permission to move Scan Config to trashcan denied')"/>
  <xsl:value-of select="gsa:i18n ('Permission to move Alert to trashcan denied')"/>
  <xsl:value-of select="gsa:i18n ('Permission to move Schedule to trashcan denied')"/>
  <xsl:value-of select="gsa:i18n ('Permission to move Report Format to trashcan denied')"/>
  <xsl:value-of select="gsa:i18n ('Permission to move Slave to trashcan denied')"/>
  <xsl:value-of select="gsa:i18n ('Permission to move Agent to trashcan denied')"/>
  <xsl:value-of select="gsa:i18n ('Permission to move Scanner to trashcan denied')"/>
  <xsl:value-of select="gsa:i18n ('Permission to move Filter to trashcan denied')"/>
  <xsl:value-of select="gsa:i18n ('Permission to move Tag to trashcan denied')"/>
  <xsl:value-of select="gsa:i18n ('Permission to move Permission to trashcan denied')"/>
  <xsl:value-of select="gsa:i18n ('Permission to move User to trashcan denied')"/>
  <xsl:value-of select="gsa:i18n ('Permission to move Group to trashcan denied')"/>
  <xsl:value-of select="gsa:i18n ('Permission to move Role to trashcan denied')"/>

  <xsl:value-of select="gsa:i18n ('Permission to edit Task denied')"/>
  <xsl:value-of select="gsa:i18n ('Permission to edit Report denied')"/>
  <xsl:value-of select="gsa:i18n ('Permission to edit Note denied')"/>
  <xsl:value-of select="gsa:i18n ('Permission to edit Override denied')"/>
  <xsl:value-of select="gsa:i18n ('Permission to edit Target denied')"/>
  <xsl:value-of select="gsa:i18n ('Permission to edit Port List denied')"/>
  <xsl:value-of select="gsa:i18n ('Permission to edit Credential denied')"/>
  <xsl:value-of select="gsa:i18n ('Permission to edit Scan Config denied')"/>
  <xsl:value-of select="gsa:i18n ('Permission to edit Alert denied')"/>
  <xsl:value-of select="gsa:i18n ('Permission to edit Schedule denied')"/>
  <xsl:value-of select="gsa:i18n ('Permission to edit Report Format denied')"/>
  <xsl:value-of select="gsa:i18n ('Permission to edit Slave denied')"/>
  <xsl:value-of select="gsa:i18n ('Permission to edit Agent denied')"/>
  <xsl:value-of select="gsa:i18n ('Permission to edit Scanner denied')"/>
  <xsl:value-of select="gsa:i18n ('Permission to edit Filter denied')"/>
  <xsl:value-of select="gsa:i18n ('Permission to edit Tag denied')"/>
  <xsl:value-of select="gsa:i18n ('Permission to edit Permission denied')"/>
  <xsl:value-of select="gsa:i18n ('Permission to edit User denied')"/>
  <xsl:value-of select="gsa:i18n ('Permission to edit Group denied')"/>
  <xsl:value-of select="gsa:i18n ('Permission to edit Role denied')"/>

  <xsl:value-of select="gsa:i18n ('Cannot modify Task')"/>
  <xsl:value-of select="gsa:i18n ('Cannot modify Report')"/>
  <xsl:value-of select="gsa:i18n ('Cannot modify Note')"/>
  <xsl:value-of select="gsa:i18n ('Cannot modify Override')"/>
  <xsl:value-of select="gsa:i18n ('Cannot modify Target')"/>
  <xsl:value-of select="gsa:i18n ('Cannot modify Port List')"/>
  <xsl:value-of select="gsa:i18n ('Cannot modify Credential')"/>
  <xsl:value-of select="gsa:i18n ('Cannot modify Scan Config')"/>
  <xsl:value-of select="gsa:i18n ('Cannot modify Alert')"/>
  <xsl:value-of select="gsa:i18n ('Cannot modify Schedule')"/>
  <xsl:value-of select="gsa:i18n ('Cannot modify Report Format')"/>
  <xsl:value-of select="gsa:i18n ('Cannot modify Slave')"/>
  <xsl:value-of select="gsa:i18n ('Cannot modify Agent')"/>
  <xsl:value-of select="gsa:i18n ('Cannot modify Scanner')"/>
  <xsl:value-of select="gsa:i18n ('Cannot modify Filter')"/>
  <xsl:value-of select="gsa:i18n ('Cannot modify Tag')"/>
  <xsl:value-of select="gsa:i18n ('Cannot modify Permission')"/>
  <xsl:value-of select="gsa:i18n ('Cannot modify User')"/>
  <xsl:value-of select="gsa:i18n ('Cannot modify Group')"/>
  <xsl:value-of select="gsa:i18n ('Cannot modify Role')"/>

  <xsl:value-of select="gsa:i18n ('Task may not be cloned')"/>
  <xsl:value-of select="gsa:i18n ('Report may not be cloned')"/>
  <xsl:value-of select="gsa:i18n ('Note may not be cloned')"/>
  <xsl:value-of select="gsa:i18n ('Override may not be cloned')"/>
  <xsl:value-of select="gsa:i18n ('Target may not be cloned')"/>
  <xsl:value-of select="gsa:i18n ('Port List may not be cloned')"/>
  <xsl:value-of select="gsa:i18n ('Credential may not be cloned')"/>
  <xsl:value-of select="gsa:i18n ('Scan Config may not be cloned')"/>
  <xsl:value-of select="gsa:i18n ('Alert may not be cloned')"/>
  <xsl:value-of select="gsa:i18n ('Schedule may not be cloned')"/>
  <xsl:value-of select="gsa:i18n ('Report Format may not be cloned')"/>
  <xsl:value-of select="gsa:i18n ('Slave may not be cloned')"/>
  <xsl:value-of select="gsa:i18n ('Agent may not be cloned')"/>
  <xsl:value-of select="gsa:i18n ('Scanner may not be cloned')"/>
  <xsl:value-of select="gsa:i18n ('Filter may not be cloned')"/>
  <xsl:value-of select="gsa:i18n ('Tag may not be cloned')"/>
  <xsl:value-of select="gsa:i18n ('Permission may not be cloned')"/>
  <xsl:value-of select="gsa:i18n ('User may not be cloned')"/>
  <xsl:value-of select="gsa:i18n ('Group may not be cloned')"/>
  <xsl:value-of select="gsa:i18n ('Role may not be cloned')"/>

  <xsl:value-of select="gsa:i18n ('Task must be owned or global')"/>
  <xsl:value-of select="gsa:i18n ('Report must be owned or global')"/>
  <xsl:value-of select="gsa:i18n ('Note must be owned or global')"/>
  <xsl:value-of select="gsa:i18n ('Override must be owned or global')"/>
  <xsl:value-of select="gsa:i18n ('Target must be owned or global')"/>
  <xsl:value-of select="gsa:i18n ('Port List must be owned or global')"/>
  <xsl:value-of select="gsa:i18n ('Credential must be owned or global')"/>
  <xsl:value-of select="gsa:i18n ('Scan Config must be owned or global')"/>
  <xsl:value-of select="gsa:i18n ('Alert must be owned or global')"/>
  <xsl:value-of select="gsa:i18n ('Schedule must be owned or global')"/>
  <xsl:value-of select="gsa:i18n ('Report Format must be owned or global')"/>
  <xsl:value-of select="gsa:i18n ('Slave must be owned or global')"/>
  <xsl:value-of select="gsa:i18n ('Agent must be owned or global')"/>
  <xsl:value-of select="gsa:i18n ('Scanner must be owned or global')"/>
  <xsl:value-of select="gsa:i18n ('Filter must be owned or global')"/>
  <xsl:value-of select="gsa:i18n ('Tag must be owned or global')"/>
  <xsl:value-of select="gsa:i18n ('Permission must be owned or global')"/>
  <xsl:value-of select="gsa:i18n ('User must be owned or global')"/>
  <xsl:value-of select="gsa:i18n ('Group must be owned or global')"/>
  <xsl:value-of select="gsa:i18n ('Role must be owned or global')"/>
</xsl:template>

<!-- "Edit ..." label like "Edit Task" -->
<xsl:template name="type-edit">
  <xsl:value-of select="gsa:i18n ('Edit Task')"/>
  <xsl:value-of select="gsa:i18n ('Edit Note')"/>
  <xsl:value-of select="gsa:i18n ('Edit Override')"/>
  <xsl:value-of select="gsa:i18n ('Edit Target')"/>
  <xsl:value-of select="gsa:i18n ('Edit Port List')"/>
  <xsl:value-of select="gsa:i18n ('Edit Credential')"/>
  <xsl:value-of select="gsa:i18n ('Edit Scan Config')"/>
  <xsl:value-of select="gsa:i18n ('Edit Alert')"/>
  <xsl:value-of select="gsa:i18n ('Edit Schedule')"/>
  <xsl:value-of select="gsa:i18n ('Edit Report Format')"/>
  <xsl:value-of select="gsa:i18n ('Edit Slave')"/>
  <xsl:value-of select="gsa:i18n ('Edit Agent')"/>
  <xsl:value-of select="gsa:i18n ('Edit Scanner')"/>
  <xsl:value-of select="gsa:i18n ('Edit Filter')"/>
  <xsl:value-of select="gsa:i18n ('Edit Tag')"/>
  <xsl:value-of select="gsa:i18n ('Edit Permission')"/>
  <xsl:value-of select="gsa:i18n ('Edit User')"/>
  <xsl:value-of select="gsa:i18n ('Edit Group')"/>
  <xsl:value-of select="gsa:i18n ('Edit Role')"/>
</xsl:template>


<!--
  Permission Descriptions
-->
<xsl:template name="permission-descriptions">
  <!-- super -->
  <xsl:value-of select="gsa:i18n ('has super access')"/>
  <!-- authenticate -->
  <xsl:value-of select="gsa:i18n ('may login')"/>
  <!-- commands -->
  <xsl:value-of select="gsa:i18n ('may run multiple OMP commands as one')"/>

  <!-- create_... -->
  <xsl:value-of select="gsa:i18n ('may create a new agent')"/>
  <xsl:value-of select="gsa:i18n ('may create a new alert')"/>
  <xsl:value-of select="gsa:i18n ('may create a new scan config')"/>
  <xsl:value-of select="gsa:i18n ('may create a new filter')"/>
  <xsl:value-of select="gsa:i18n ('may create a new group')"/>
  <xsl:value-of select="gsa:i18n ('may create a new credential')"/>
  <xsl:value-of select="gsa:i18n ('may create a new note')"/>
  <xsl:value-of select="gsa:i18n ('may create a new override')"/>
  <xsl:value-of select="gsa:i18n ('may create a new permission')"/>
  <xsl:value-of select="gsa:i18n ('may create a new port list')"/>
  <xsl:value-of select="gsa:i18n ('may create a new port range')"/>
  <xsl:value-of select="gsa:i18n ('may create a new report')"/>
  <xsl:value-of select="gsa:i18n ('may create a new report format')"/>
  <xsl:value-of select="gsa:i18n ('may create a new role')"/>
  <xsl:value-of select="gsa:i18n ('may create a new scanner')"/>
  <xsl:value-of select="gsa:i18n ('may create a new schedule')"/>
  <xsl:value-of select="gsa:i18n ('may create a new slave')"/>
  <xsl:value-of select="gsa:i18n ('may create a new tag')"/>
  <xsl:value-of select="gsa:i18n ('may create a new target')"/>
  <xsl:value-of select="gsa:i18n ('may create a new task')"/>
  <xsl:value-of select="gsa:i18n ('may create a new user')"/>

  <!-- delete_... -->
  <xsl:value-of select="gsa:i18n ('may delete agent %1')"/>
  <xsl:value-of select="gsa:i18n ('may delete alert %1')"/>
  <xsl:value-of select="gsa:i18n ('may delete scan config %1')"/>
  <xsl:value-of select="gsa:i18n ('may delete filter %1')"/>
  <xsl:value-of select="gsa:i18n ('may delete group %1')"/>
  <xsl:value-of select="gsa:i18n ('may delete credential %1')"/>
  <xsl:value-of select="gsa:i18n ('may delete note %1')"/>
  <xsl:value-of select="gsa:i18n ('may delete override %1')"/>
  <xsl:value-of select="gsa:i18n ('may delete permission %1')"/>
  <xsl:value-of select="gsa:i18n ('may delete port list %1')"/>
  <xsl:value-of select="gsa:i18n ('may delete port range %1')"/>
  <xsl:value-of select="gsa:i18n ('may delete report %1')"/>
  <xsl:value-of select="gsa:i18n ('may delete report format %1')"/>
  <xsl:value-of select="gsa:i18n ('may delete role %1')"/>
  <xsl:value-of select="gsa:i18n ('may delete scanner %1')"/>
  <xsl:value-of select="gsa:i18n ('may delete schedule %1')"/>
  <xsl:value-of select="gsa:i18n ('may delete slave %1')"/>
  <xsl:value-of select="gsa:i18n ('may delete tag %1')"/>
  <xsl:value-of select="gsa:i18n ('may delete target %1')"/>
  <xsl:value-of select="gsa:i18n ('may delete task %1')"/>
  <xsl:value-of select="gsa:i18n ('may delete user %1')"/>

  <xsl:value-of select="gsa:i18n ('may delete an existing agent')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing alert')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing scan config')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing filter')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing group')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing credential')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing note')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing override')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing permission')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing port list')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing port range')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing report')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing report format')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing role')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing scanner')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing schedule')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing slave')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing tag')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing target')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing task')"/>
  <xsl:value-of select="gsa:i18n ('may delete an existing user')"/>

  <!-- describe_... -->
  <xsl:value-of select="gsa:i18n ('may get details about the authentication configuration')"/>

  <!-- empty_trashcan -->
  <xsl:value-of select="gsa:i18n ('may empty the trashcan')"/>

  <!-- get_... -->
  <xsl:value-of select="gsa:i18n ('has read access to agent %1')"/>
  <xsl:value-of select="gsa:i18n ('has read access to alert %1')"/>
  <xsl:value-of select="gsa:i18n ('has read access to scan config %1')"/>
  <xsl:value-of select="gsa:i18n ('has read access to filter %1')"/>
  <xsl:value-of select="gsa:i18n ('has read access to group %1')"/>
  <xsl:value-of select="gsa:i18n ('has read access to credential %1')"/>
  <xsl:value-of select="gsa:i18n ('has read access to note %1')"/>
  <xsl:value-of select="gsa:i18n ('has read access to NVT %1')"/>
  <xsl:value-of select="gsa:i18n ('has read access to override %1')"/>
  <xsl:value-of select="gsa:i18n ('has read access to permission %1')"/>
  <xsl:value-of select="gsa:i18n ('has read access to port list %1')"/>
  <xsl:value-of select="gsa:i18n ('has read access to port range %1')"/>
  <xsl:value-of select="gsa:i18n ('has read access to report %1')"/>
  <xsl:value-of select="gsa:i18n ('has read access to report format %1')"/>
  <xsl:value-of select="gsa:i18n ('has read access to role %1')"/>
  <xsl:value-of select="gsa:i18n ('has read access to scanner %1')"/>
  <xsl:value-of select="gsa:i18n ('has read access to schedule %1')"/>
  <xsl:value-of select="gsa:i18n ('has read access to slave %1')"/>
  <xsl:value-of select="gsa:i18n ('has read access to system report %1')"/>
  <xsl:value-of select="gsa:i18n ('has read access to tag %1')"/>
  <xsl:value-of select="gsa:i18n ('has read access to target %1')"/>
  <xsl:value-of select="gsa:i18n ('has read access to task %1')"/>
  <xsl:value-of select="gsa:i18n ('has read access to user %1')"/>

  <xsl:value-of select="gsa:i18n ('has read access to agents')"/>
  <xsl:value-of select="gsa:i18n ('has read access to alerts')"/>
  <xsl:value-of select="gsa:i18n ('has read access to scan configs')"/>
  <xsl:value-of select="gsa:i18n ('has read access to feeds')"/>
  <xsl:value-of select="gsa:i18n ('has read access to filters')"/>
  <xsl:value-of select="gsa:i18n ('has read access to groups')"/>
  <xsl:value-of select="gsa:i18n ('has read access to SecInfo')"/>
  <xsl:value-of select="gsa:i18n ('has read access to credentials')"/>
  <xsl:value-of select="gsa:i18n ('has read access to notes')"/>
  <xsl:value-of select="gsa:i18n ('has read access to NVTs')"/>
  <xsl:value-of select="gsa:i18n ('has read access to NVT families')"/>
  <xsl:value-of select="gsa:i18n ('may get NVT feed version information')"/>
  <xsl:value-of select="gsa:i18n ('has read access to overrides')"/>
  <xsl:value-of select="gsa:i18n ('has read access to permissions')"/>
  <xsl:value-of select="gsa:i18n ('has read access to port lists')"/>
  <xsl:value-of select="gsa:i18n ('has read access to port ranges')"/>
  <xsl:value-of select="gsa:i18n ('has read access to reports')"/>
  <xsl:value-of select="gsa:i18n ('has read access to report formats')"/>
  <xsl:value-of select="gsa:i18n ('has read access to roles')"/>
  <xsl:value-of select="gsa:i18n ('has read access to scanners')"/>
  <xsl:value-of select="gsa:i18n ('has read access to schedules')"/>
  <xsl:value-of select="gsa:i18n ('has read access to slaves')"/>
  <xsl:value-of select="gsa:i18n ('has read access to system reports')"/>
  <xsl:value-of select="gsa:i18n ('has read access to tags')"/>
  <xsl:value-of select="gsa:i18n ('has read access to targets')"/>
  <xsl:value-of select="gsa:i18n ('has read access to tasks')"/>
  <xsl:value-of select="gsa:i18n ('has read access to users')"/>

  <!-- help -->
  <xsl:value-of select="gsa:i18n ('may get the help text')"/>

  <!-- modify_... -->
  <xsl:value-of select="gsa:i18n ('has write access to agent %1')"/>
  <xsl:value-of select="gsa:i18n ('has write access to alert %1')"/>
  <xsl:value-of select="gsa:i18n ('has write access to scan config %1')"/>
  <xsl:value-of select="gsa:i18n ('has write access to filter %1')"/>
  <xsl:value-of select="gsa:i18n ('has write access to group %1')"/>
  <xsl:value-of select="gsa:i18n ('has write access to credential %1')"/>
  <xsl:value-of select="gsa:i18n ('has write access to note %1')"/>
  <xsl:value-of select="gsa:i18n ('has write access to override %1')"/>
  <xsl:value-of select="gsa:i18n ('has write access to permission %1')"/>
  <xsl:value-of select="gsa:i18n ('has write access to port list %1')"/>
  <xsl:value-of select="gsa:i18n ('has write access to port range %1')"/>
  <xsl:value-of select="gsa:i18n ('has write access to report %1')"/>
  <xsl:value-of select="gsa:i18n ('has write access to report format %1')"/>
  <xsl:value-of select="gsa:i18n ('has write access to role %1')"/>
  <xsl:value-of select="gsa:i18n ('has write access to scanner %1')"/>
  <xsl:value-of select="gsa:i18n ('has write access to schedule %1')"/>
  <xsl:value-of select="gsa:i18n ('has write access to slave %1')"/>
  <xsl:value-of select="gsa:i18n ('has write access to system report %1')"/>
  <xsl:value-of select="gsa:i18n ('has write access to tag %1')"/>
  <xsl:value-of select="gsa:i18n ('has write access to target %1')"/>
  <xsl:value-of select="gsa:i18n ('has write access to task %1')"/>
  <xsl:value-of select="gsa:i18n ('has write access to user %1')"/>

  <xsl:value-of select="gsa:i18n ('has write access to agents')"/>
  <xsl:value-of select="gsa:i18n ('has write access to alerts')"/>
  <xsl:value-of select="gsa:i18n ('has write access to the authentication configuration')"/>
  <xsl:value-of select="gsa:i18n ('has write access to scan configs')"/>
  <xsl:value-of select="gsa:i18n ('has write access to filters')"/>
  <xsl:value-of select="gsa:i18n ('has write access to groups')"/>
  <xsl:value-of select="gsa:i18n ('has write access to credentials')"/>
  <xsl:value-of select="gsa:i18n ('has write access to notes')"/>
  <xsl:value-of select="gsa:i18n ('has write access to overrides')"/>
  <xsl:value-of select="gsa:i18n ('has write access to permissions')"/>
  <xsl:value-of select="gsa:i18n ('has write access to port lists')"/>
  <xsl:value-of select="gsa:i18n ('has write access to port ranges')"/>
  <xsl:value-of select="gsa:i18n ('has write access to reports')"/>
  <xsl:value-of select="gsa:i18n ('has write access to report formats')"/>
  <xsl:value-of select="gsa:i18n ('has write access to roles')"/>
  <xsl:value-of select="gsa:i18n ('has write access to scanners')"/>
  <xsl:value-of select="gsa:i18n ('has write access to schedules')"/>
  <xsl:value-of select="gsa:i18n ('has write access to slaves')"/>
  <xsl:value-of select="gsa:i18n ('has write access to system reports')"/>
  <xsl:value-of select="gsa:i18n ('has write access to tags')"/>
  <xsl:value-of select="gsa:i18n ('has write access to targets')"/>
  <xsl:value-of select="gsa:i18n ('has write access to tasks')"/>
  <xsl:value-of select="gsa:i18n ('has write access to users')"/>

  <!-- restore -->
  <xsl:value-of select="gsa:i18n ('may restore items from the trashcan')"/>

  <!-- resume_task -->
  <xsl:value-of select="gsa:i18n ('may resume tasks')"/>

  <!-- run_wizard -->
  <xsl:value-of select="gsa:i18n ('may run wizards')"/>

  <!-- start_task -->
  <xsl:value-of select="gsa:i18n ('may start tasks')"/>

  <!-- stop_task -->
  <xsl:value-of select="gsa:i18n ('may stop tasks')"/>

  <!-- sync_... -->
  <xsl:value-of select="gsa:i18n ('may sync the CERT feed')"/>
  <xsl:value-of select="gsa:i18n ('may sync the NVT feed')"/>
  <xsl:value-of select="gsa:i18n ('may sync the SCAP feed')"/>
  <xsl:value-of select="gsa:i18n ('may sync %1')"/>

  <!-- test_alert -->
  <xsl:value-of select="gsa:i18n ('may test alerts')"/>

  <!-- verify_... -->
  <xsl:value-of select="gsa:i18n ('may verify agents')"/>
  <xsl:value-of select="gsa:i18n ('may verify report formats')"/>
  <xsl:value-of select="gsa:i18n ('may verify scanners')"/>
  <xsl:value-of select="gsa:i18n ('may verify %1')"/>

</xsl:template>

<!-- A bulk delete confirmation message like "3 Tasks will be deleted" -->
<xsl:template name="type-bulk-delete-confirm">
  <xsl:value-of select="gsa:n-i18n ('%1 Task will be deleted', '%1 Tasks will be deleted', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Report will be deleted', '%1 Reports will be deleted', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Note will be deleted', '%1 Notes will be deleted', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Override will be deleted', '%1 Overrides will be deleted', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Target will be deleted', '%1 Targets will be deleted', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Port List will be deleted', '%1 Port Lists will be deleted', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Credential will be deleted', '%1 Credentials will be deleted', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Scan Config will be deleted', '%1 Scan Configs will be deleted', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Alert will be deleted', '%1 Alerts will be deleted', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Schedule will be deleted', '%1 Schedules will be deleted', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Report Format will be deleted', '%1 Report Formats will be deleted', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Slave will be deleted', '%1 Slaves will be deleted', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Agent will be deleted', '%1 Agents will be deleted', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Scanner will be deleted', '%1 Scanners will be deleted', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Filter will be deleted', '%1 Filters will be deleted', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Tag will be deleted', '%1 Tags will be deleted', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Permission will be deleted', '%1 Permissions will be deleted', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('%1 User will be deleted', '%1 Users will be deleted', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Group will be deleted', '%1 Groups will be deleted', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Role will be deleted', '%1 Roles will be deleted', 0)"/>
</xsl:template>

<!-- A bulk trash confirmation message like "3 Tasks will be moved to the trashcan" -->
<xsl:template name="type-bulk-trash-confirm">
  <xsl:value-of select="gsa:n-i18n ('%1 Task will be moved to the trashcan', '%1 Tasks will be moved to the trashcan', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Report will be moved to the trashcan', '%1 Report will be moved to the trashcan', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Note will be moved to the trashcan', '%1 Notes will be moved to the trashcan', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Override will be moved to the trashcan', '%1 Overrides will be moved to the trashcan', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Target will be moved to the trashcan', '%1 Targets will be moved to the trashcan', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Port List will be moved to the trashcan', '%1 Port Lists will be moved to the trashcan', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Credential will be moved to the trashcan', '%1 Credentials will be moved to the trashcan', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Scan Config will be moved to the trashcan', '%1 Scan Configs will be moved to the trashcan', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Alert will be moved to the trashcan', '%1 Alerts will be moved to the trashcan', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Schedule will be moved to the trashcan', '%1 Schedules will be moved to the trashcan', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Report Format will be moved to the trashcan', '%1 Report Formats will be moved to the trashcan', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Slave will be moved to the trashcan', '%1 Slaves will be moved to the trashcan', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Agent will be moved to the trashcan', '%1 Agents will be moved to the trashcan', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Scanner will be moved to the trashcan', '%1 Scanners will be moved to the trashcan', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Filter will be moved to the trashcan', '%1 Filters will be moved to the trashcan', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Tag will be moved to the trashcan', '%1 Tags will be moved to the trashcan', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Permission will be moved to the trashcan', '%1 Permissions will be moved to the trashcan', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('%1 User will be moved to the trashcan', '%1 Users will be moved to the trashcan', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Group will be moved to the trashcan', '%1 Groups will be moved to the trashcan', 0)"/>
  <xsl:value-of select="gsa:n-i18n ('%1 Role will be moved to the trashcan', '%1 Roles will be moved to the trashcan', 0)"/>
</xsl:template>

<!-- Bulk action names -->
<xsl:template name="bulk-actions">
  <xsl:value-of select="gsa:i18n ('Move selection to trashcan')"/>
  <xsl:value-of select="gsa:i18n ('Move all filtered to trashcan')"/>
  <xsl:value-of select="gsa:i18n ('Move page contents to trashcan')"/>

  <xsl:value-of select="gsa:i18n ('Delete selection')"/>
  <xsl:value-of select="gsa:i18n ('Delete all filtered')"/>
  <xsl:value-of select="gsa:i18n ('Delete page contents')"/>

  <xsl:value-of select="gsa:i18n ('Export selection')"/>
  <xsl:value-of select="gsa:i18n ('Export all filtered')"/>
  <xsl:value-of select="gsa:i18n ('Export page contents')"/>
</xsl:template>

<!-- Scan status names -->
<xsl:template name="status">
  <xsl:value-of select="gsa:i18n ('Uploading', 'Status')"/>
  <xsl:value-of select="gsa:i18n ('Container', 'Status')"/>
  <xsl:value-of select="gsa:i18n ('Delete Requested', 'Status')"/>
  <xsl:value-of select="gsa:i18n ('Ultimate Delete Requested', 'Status')"/>
  <xsl:value-of select="gsa:i18n ('Done', 'Status')"/>
  <xsl:value-of select="gsa:i18n ('New', 'Status')"/>
  <xsl:value-of select="gsa:i18n ('Running', 'Status')"/>
  <xsl:value-of select="gsa:i18n ('Stopped', 'Status')"/>
  <xsl:value-of select="gsa:i18n ('Internal Error', 'Status')"/>
</xsl:template>

<!-- Trust status -->
<xsl:template name="trust">
  <xsl:value-of select="gsa:i18n ('unknown', 'Trust')"/>
  <xsl:value-of select="gsa:i18n ('yes', 'Trust')"/>
  <xsl:value-of select="gsa:i18n ('no', 'Trust')"/>
</xsl:template>

</xsl:stylesheet>
