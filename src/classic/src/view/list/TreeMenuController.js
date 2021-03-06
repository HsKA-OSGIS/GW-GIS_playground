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
 * This class is the controller for the TreeMenu view class.
 *
 *
 * @class Koala.view.list.TreeMenuController
 */
Ext.define('Koala.view.list.TreeMenuController', {
    extend: 'Ext.app.ViewController',

    requires: [
        'Koala.view.window.AddWMSWindow',
        'Koala.view.window.ImportLocalDataWindow',
        'Koala.view.window.Print',
        'Koala.view.window.PermalinkWindow',
        'Koala.view.window.ImprintWindow',
        'Koala.view.window.HelpWindow',
        'Koala.view.window.AboutWindow'
    ],

    alias: 'controller.k-list-treemenu',

    onItemClick: function(sender, info) {
        var view = this.getView();
        var viewModel = this.getViewModel();
        var node = info.node;
        var isLeaf = node.isLeaf();
        var mapContainer = Ext.ComponentQuery
            .query('basigx-panel-mapcontainer')[0];
        var measureTools = Ext.ComponentQuery.query('k-container-redliningtoolscontainer')[0];
        var drawTools = Ext.ComponentQuery.query('k-container-drawtoolscontainer')[0];
        var selectFeaturesButton = Ext.ComponentQuery.query('k-button-selectfeatures')[0];
        var top = '6px';
        var right = ((mapContainer.getWidth()/2) - 150) + 'px';

        if (isLeaf) {
            // Currently throws errors due to hover issues with ExtJS
            // if an over item is set, so we deselect it here
            sender.setOverItem(null);
            var key = node.get('key');
            switch (key) {
                case 'menu':
                    var isMicro = viewModel.get('micro');
                    viewModel.set('micro', !isMicro);
                    // Just ExtJS things
                    window.setTimeout(function() {
                        view.up('app-main').updateLayout();
                    }, 100);
                    break;
                case 'themes':
                    var themeTree = Ext.ComponentQuery.query('k-panel-themetree')[0];
                    var layersetchooser = Ext.ComponentQuery.query('k-panel-layersetchooser')[0];
                    if (themeTree.isVisible()) {
                        themeTree.hide();
                        layersetchooser.hide();
                        viewModel.set('themeTreeVisible', false);
                    } else {
                        themeTree.show();
                        viewModel.set('themeTreeVisible', true);
                    }
                    break;
                case 'wmsimport':
                    this.showWindow('k-window-addwms', 'Koala.view.window.AddWMSWindow');
                    break;
                case 'vectorimport':
                    this.showWindow('k-window-importlocaldata', 'Koala.view.window.ImportLocalDataWindow');
                    break;
                case 'print':
                    this.showWindow('k-window-print', 'Koala.view.window.Print');
                    break;
                case 'measure':
                    viewModel.set('drawToolsActive', false);
                    viewModel.set('selectFeaturesActive', false);
                    selectFeaturesButton.setPressed(false);
                    if (drawTools) {
                        mapContainer.remove(drawTools);
                    }
                    if (measureTools) {
                        mapContainer.remove(measureTools);
                        viewModel.set('measureToolsActive', false);
                    } else {
                        measureTools = Ext.create('Koala.view.container.RedliningToolsContainer', {
                            style: {
                                top: top,
                                right: right
                            }
                        });
                        mapContainer.add(measureTools);
                        viewModel.set('measureToolsActive', true);
                    }
                    break;
                case 'draw':
                    viewModel.set('measureToolsActive', false);
                    viewModel.set('selectFeaturesActive', false);
                    selectFeaturesButton.setPressed(false);
                    if (measureTools) {
                        mapContainer.remove(measureTools);
                    }
                    if (drawTools) {
                        mapContainer.remove(drawTools);
                        viewModel.set('drawToolsActive', false);
                    } else {
                        drawTools = Ext.create('Koala.view.container.DrawToolsContainer', {
                            style: {
                                top: top,
                                right: right
                            }
                        });
                        mapContainer.add(drawTools);
                        viewModel.set('drawToolsActive', true);
                    }
                    break;
                case 'selectfeatures':
                    viewModel.set('drawToolsActive', false);
                    viewModel.set('measureToolsActive', false);
                    if (measureTools) {
                        mapContainer.remove(measureTools);
                    }
                    if (drawTools) {
                        mapContainer.remove(drawTools);
                    }
                    selectFeaturesButton.toggle();
                    viewModel.set('selectFeaturesActive', selectFeaturesButton.pressed);
                    break;
                case 'createvectorlayer':
                    var selected = Ext.ComponentQuery.query('k-panel-routing-legendtree')[0].getSelection();
                    var layer;
                    if (selected.length > 0) {
                        layer = selected[0];
                        var allowClone = layer.get('allowClone') || false;
                        if (!allowClone) {
                            layer = undefined;
                        }
                    }
                    Ext.create({
                        xtype: 'k-window-clone',
                        sourceLayer: layer
                    });
                    break;
                case 'permalink':
                    this.showWindow('k-window-permalink', 'Koala.view.window.PermalinkWindow');
                    break;
                case 'timereference':
                    var timereferenceButton = Ext.ComponentQuery
                        .query('k-button-timereference')[0];
                    timereferenceButton.toggle();
                    viewModel.set('timereferenceValue', timereferenceButton.getCurrent());
                    viewModel.set('settingsExpanded', true);
                    break;
                case 'fullscreen':
                    Koala.util.Fullscreen.toggleFullscreen();
                    break;
                case 'imprint':
                    this.showWindow('k-window-imprint', 'Koala.view.window.ImprintWindow');
                    break;
                case 'privacy':
                    window.open(viewModel.get('privacyUrl'), '_blank').focus();
                    break;
                case 'about':
                    this.showWindow('k-window-about', 'Koala.view.window.AboutWindow');
                    break;
                case 'help':
                    this.showWindow('k-window-help', 'Koala.view.window.HelpWindow');
                    break;
                case 'showhelp':
                    var showHelp = viewModel.get('showHelp');
                    Koala.util.LocalStorage.updateHideHelpWindowOnStartup(!showHelp);
                    viewModel.set('showHelp', !showHelp);
                    break;
                case 'showlayersetchooser':
                    var showChooser = viewModel.get('showLayersetChooser');
                    Koala.util.LocalStorage.updateHideLayersetChooserWindowOnStartup(!showChooser);
                    viewModel.set('showLayersetChooser', !showChooser);
                    break;
                default:
                    break;
            }
        }
    },

    showWindow: function(xtype, className) {
        var win = Ext.ComponentQuery.query(xtype)[0];
        if (!win) {
            Ext.create(className).show();
        } else {
            BasiGX.util.Animate.shake(win);
        }
    }

});
