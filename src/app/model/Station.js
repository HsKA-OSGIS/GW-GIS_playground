/* Copyright (c) 2015-2016 terrestris GmbH & Co. KG
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * @class Koala.model.Station
 */
Ext.define('Koala.model.Station', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'geo_id',
        mapping: function(dataRec) {
            return dataRec.properties.geo_id;
        }
    },{
        name: 'locality_name',
        mapping: function(dataRec) {
            return dataRec.properties.locality_name;
        }
    }]
});
