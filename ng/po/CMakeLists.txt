# Greenbone Security Assistant
# $Id$
# Description: CMakefile for GSAD sources.
#
# Authors:
# Timo Pollmeier <timo.pollmeier@greenbone.net>
# Björn Ricks <bjoern.ricks@greenbone.net>
#
# Copyright:
# Copyright (C) 2015 - 2018 Greenbone Networks GmbH
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation; either version 2
# of the License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.

include (FindGettext)
include (FindPythonInterp)
include (FindPythonModule)

find_python_module(polib)

# Create targets for a language _LANG
macro (MAKE_TRANSLATION _LANG)
  file (MAKE_DIRECTORY ${CMAKE_CURRENT_BINARY_DIR}/${_LANG})

  # Files for installation
  # .json for JS
  add_custom_command (OUTPUT ${CMAKE_CURRENT_BINARY_DIR}/gsad-${_LANG}.json
                      DEPENDS ${CMAKE_CURRENT_SOURCE_DIR}/gsad_js-${_LANG}.po
                      COMMAND ${PYTHON_EXECUTABLE} "${CMAKE_SOURCE_DIR}/tools/po2json"
                      ARGS ${CMAKE_CURRENT_SOURCE_DIR}/gsad_js-${_LANG}.po
                      ${CMAKE_CURRENT_BINARY_DIR}/gsad-${_LANG}.json)
  install (FILES ${CMAKE_CURRENT_BINARY_DIR}/gsad-${_LANG}.json
          DESTINATION ${GSA_DATA_DIR}/classic/locales)

  add_custom_command (OUTPUT ${CMAKE_CURRENT_BINARY_DIR}/gsad_js-${_LANG}-merged.po
                      DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/gsad_js.pot
                      COMMAND ${GETTEXT_MSGMERGE_EXECUTABLE}
                      ARGS ${CMAKE_CURRENT_SOURCE_DIR}/gsad_js-${_LANG}.po
                      ${CMAKE_CURRENT_BINARY_DIR}/gsad_js.pot
                      -o ${CMAKE_CURRENT_BINARY_DIR}/gsad_js-${_LANG}-merged.po)
endmacro ()

if (GETTEXT_FOUND)
  if (PY_POLIB_FOUND)
    MAKE_TRANSLATION (ar)
    MAKE_TRANSLATION (de)
    MAKE_TRANSLATION (fr)
    MAKE_TRANSLATION (pt_BR)
    MAKE_TRANSLATION (ru)
    MAKE_TRANSLATION (tr)
    MAKE_TRANSLATION (zh_CN)

    # Installed files
    add_custom_target (gettext-json
                       ALL
                       DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/gsad-ar.json
                       DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/gsad-de.json
                       DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/gsad-fr.json
                       DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/gsad-pt_BR.json
                       DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/gsad-ru.json
                       DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/gsad-tr.json
                       DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/gsad-zh_CN.json
                       COMMENT "Created translation .json files")

    # Merged .po files
    add_custom_target (gettext-merge
                       DEPENDS gettext-js-merge
                       COMMENT "Merged translation .po files")

    add_custom_target (gettext-js-merge
                       DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/gsad_js.pot
                       DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/gsad_js-ar-merged.po
                       DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/gsad_js-de-merged.po
                       DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/gsad_js-fr-merged.po
                       DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/gsad_js-pt_BR-merged.po
                       DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/gsad_js-ru-merged.po
                       DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/gsad_js-tr-merged.po
                       DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/gsad_js-zh_CN-merged.po
                       COMMENT "Merged translation .po files for JS")

    # Template (.pot) files
    # All template files
    add_custom_target (gettext-pot
                       DEPENDS gettext-js-pot)

    # JS template files
    add_custom_target (gettext-js-pot
                       DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/gsad_js.pot)

    add_custom_command (OUTPUT  ${CMAKE_CURRENT_BINARY_DIR}/gsad_js.pot
                        COMMAND "${CMAKE_SOURCE_DIR}/tools/js2pot"
                        ARGS    "${CMAKE_SOURCE_DIR}"
                                "${CMAKE_CURRENT_BINARY_DIR}/gsad_js.pot"
                                "${CMAKE_SOURCE_DIR}/ng"
                        DEPENDS ${NG_JS_SRC_FILES}
                        COMMENT "Creating translation template (.pot) file from JS")

  else (PY_POLIB_FOUND)
    message (WARNING "Could not build translation files: Python interpreter or polib Python module not found.")
  endif (PY_POLIB_FOUND)

else (GETTEXT_FOUND)
  message (WARNING "Could not build translation files: gettext not found.")
endif (GETTEXT_FOUND)
