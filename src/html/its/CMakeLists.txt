# Greenbone Security Assistant
# $Id$
# Description: CMakefile for IT Schwachstellenampel sources.
#
# Authors:
# Timo Pollmeier <timo.pollmeier@greenbone.net>
#
# Copyright:
# Copyright (C) 2014 Greenbone Networks GmbH
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License version 2,
# or, at your option, any later version as published by the Free
# Software Foundation
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.

## Install

install (FILES favicon.gif gsad.xsl gsa-style.css
               help.xsl omp.xsl
         DESTINATION ${GSA_DATA_DIR}/its)

install (FILES login/login.html
               gsa-style.css
               favicon.gif
         DESTINATION ${GSA_DATA_DIR}/its/login)

install (FILES img/its_logo.png
         DESTINATION ${GSA_DATA_DIR}/its/login/img)

install (FILES img/acs_logo.png
               img/bsi_logo.png
               img/its_logo.png
               img/OpenVAS-logo.png
               img/greenbone-logo.png
               img/callout_blue.gif
               img/details.png
               img/info_big.png
               img/info.png
               img/printer.png
               img/datensicherheit_big.png
               img/datensicherheit.png
               img/shutdown.png
               img/tl_flash_flash_flash.gif
               img/tl_flash_off_off.gif
               img/tl_flash_on_off.gif
               img/tl_off_off_off.png
               img/tl_off_off_on.png
               img/tl_off_on_off.png
               img/tl_on_off_off.png
         DESTINATION ${GSA_DATA_DIR}/its/img)

## Static analysis

## Very superficial check if stylesheets are fine

if (PATH_TO_XSLTPROC)
  add_custom_target (its-omp-xsl-syntax ALL
                                        COMMENT "Checking syntax of omp.xsl (IT Schwachstellenampel)"
                                        COMMAND xsltproc ${CMAKE_CURRENT_SOURCE_DIR}/omp.xsl
                                        DEPENDS ${CMAKE_CURRENT_SOURCE_DIR}/omp.xsl)
  add_custom_target (its-gsad-xsl-syntax ALL
                                         COMMENT "Checking syntax of gsad.xsl (IT Schwachstellenampel)"
                                         COMMAND xsltproc ${CMAKE_CURRENT_SOURCE_DIR}/gsad.xsl
                                         DEPENDS ${CMAKE_CURRENT_SOURCE_DIR}/gsad.xsl)
  add_custom_target (its-help-xsl-syntax ALL
                                         COMMENT "Checking syntax of help.xsl (IT Schwachstellenampel)"
                                         COMMAND xsltproc ${CMAKE_CURRENT_SOURCE_DIR}/help.xsl
                                         DEPENDS ${CMAKE_CURRENT_SOURCE_DIR}/help.xsl)
else (PATH_TO_XSLTPROC)
  message ("Not performing simple stylesheet tests -- xsltproc not found.")
endif (PATH_TO_XSLTPROC)

## End
