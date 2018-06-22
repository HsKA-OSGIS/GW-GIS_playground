/* Copyright (c) 2015-present terrestris GmbH & Co. KG
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
 * @class Koala.view.button.BackgroundLayersModelController
 */
Ext.define('Koala.view.button.BackgroundLayersModelController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-button-backgroundlayers',

    requires: [
        'Koala.util.Help'
    ],

    /**
     * onClick - This function renders the windows with the background layers checkbox list
     */
    onClick: function() {
        var win = Ext.ComponentQuery.query('[name=backgroundLayers-window]')[0];
        if (!win) {
            Ext.create('Ext.window.Window', {
                name: 'backgroundLayers-window',
                title: this.getViewModel().get('windowTitle'),
                bodyPadding: 10,
                layout: 'fit',
                constrain: true,
                maxWidth: Ext.getBody().getViewSize().width,
                tools: [{
                    type: 'help',
                    bind: {
                        tooltip: '{helpTooltip}'
                    },
                    callback: function() {
                        Koala.util.Help.showHelpWindow('mapNavigationBackgroundLayers', 'mapNavigation');
                    }
                }],
                items: [{
                    xtype: 'k-panel-backgroundLayers'
                }
                ]
            }).show();
        } else {
            BasiGX.util.Animate.shake(win);
        }
    }

});