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
 * @class Koala.view.button.SelectFeaturesController
 */
Ext.define('Koala.view.button.SelectFeaturesController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-button-selectfeatures',
    requires: [
        'BasiGX.util.Map',
        'BasiGX.util.WFS',
        'BasiGX.util.SLD',
        'Koala.util.Object',
        'Koala.util.Layer'
    ],

    /** i18n */
    error: '',
    couldNotLoad: '',
    couldNotParse: '',
    noSingleActiveLayerFound: '',
    /** i18n end */

    isActive: false,
    mapComponent: null,
    dragBoxInteraction: null,
    singleClickListener: null,
    selectionLayer: null,
    legendTree: null,
    layerToSelectOn: null,
    clearKeyListener: null,
    shiftSelectKeyListener: null,
    shiftKeyPressed: false,
    ctrlKeyPressed: false,

    /**
     * Handler when the select features button is toggled
     * @param {object} btn The button that has been pressed
     */
    onClick: function(btn) {
        this.isActive = btn.pressed;
        if (this.isActive) {
            this.enableSelectControl();
        } else {
            this.disableSelectControl();
        }
    },

    /**
     * Handles the activation of interactions to select features
     */
    enableSelectControl: function() {
        if (!this.legendTree) {
            this.legendTree = Ext.ComponentQuery.query(
                'k-panel-routing-legendtree, k-panel-mobilelegend > treelist')[0];
        }

        var selection = this.legendTree.getSelection();
        if (selection.length !== 1) {
            Ext.Msg.alert(this.error, this.noSingleActiveLayerFound);
            this.getView().setPressed(false);
            return;
        }

        if (!this.mapComponent) {
            this.mapComponent = BasiGX.util.Map.getMapComponent('k-component-map');
        }

        if (!this.selectionLayer) {
            this.selectionLayer = new ol.layer.Vector({
                'DISPLAY_IN_LEGENDTREE': false,
                source: new ol.source.Vector,
                style: new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: [255, 0, 0, 0.5]
                    }),
                    stroke: new ol.style.Stroke({
                        color: [255, 0, 0, 0.5],
                        width: 3
                    }),
                    image: new ol.style.Circle({
                        radius: 7,
                        fill: new ol.style.Fill({
                            color: [255, 0, 0, 0.5]
                        })
                    })
                })
            });
            this.mapComponent.map.addLayer(this.selectionLayer);
            var mainVm = Ext.ComponentQuery.query('app-main')[0].getViewModel();
            mainVm.set('selectedFeaturesLayer', this.selectionLayer);
        }

        if (!this.dragBoxInteraction) {
            this.dragBoxInteraction = new ol.interaction.DragBox({
                condition: function() {
                    return this.ctrlKeyPressed;
                }.bind(this)
            });
            this.mapComponent.map.addInteraction(this.dragBoxInteraction);
        }
        if (!this.singleClickListener) {
            this.singleClickListener = this.mapComponent.map.on(
                'click', this.singleSelect.bind(this));
        }
        this.dragBoxInteraction.setActive(true);
        this.dragBoxInteraction.on('boxend', this.boxEnd, this);
        this.dragBoxInteraction.on('boxstart', this.boxStart, this);

        // disable maps dragzoom control (shift + mousedrag) and double click zoom
        this.mapComponent.map.getInteractions().forEach(function(interaction) {
            if (interaction instanceof ol.interaction.DoubleClickZoom ||
                interaction instanceof ol.interaction.DragZoom) {
                interaction.setActive(false);
            }
        });

        // disable the hover plugin as it interferes with selections
        var hoverPlugin = this.mapComponent.getPlugin('hoverBfS');
        if (hoverPlugin) {
            hoverPlugin.getCmp().setPointerRest(false);
        }

        // register the cleanup key listener
        window.addEventListener('keydown', this.keydownHandler, true);
        window.addEventListener('keyup', this.keyupHandler, true);
    },

    /**
     * Handles the deactivation and reactivation of interactions
     * and clears the selected features
     */
    disableSelectControl: function() {
        if (this.dragBoxInteraction) {
            this.dragBoxInteraction.setActive(false);
        }
        if (this.singleClickListener) {
            this.mapComponent.map.un('click', this.singleSelect);
        }
        if (this.selectionLayer) {
            this.selectionLayer.getSource().clear();
        }
        // enable maps dragzoom control (shift + mousedrag) and double click zoom
        this.mapComponent.map.getInteractions().forEach(function(interaction) {
            if (interaction instanceof ol.interaction.DoubleClickZoom ||
                interaction instanceof ol.interaction.DragZoom) {
                interaction.setActive(true);
            }
        });

        // reenable the hover plugin
        var hoverPlugin = this.mapComponent.getPlugin('hoverBfS');
        if (hoverPlugin) {
            hoverPlugin.getCmp().setPointerRest(true);
        }

        // disable keylistener
        window.removeEventListener('keydown', this.keydownHandler, true);
        window.removeEventListener('keyup', this.keyupHandler, true);
        // clear the select layers selections
        this.selectionLayer.getSource().clear();
    },

    /**
     * Handler called for keydown events to check for shift selections
     * and cleanupKey
     * @param {Event} event The browser event
     */
    keydownHandler: function(event) {
        var me = Ext.ComponentQuery.query(
            'k-button-selectfeatures')[0].getController();
        var key = event.key.toLowerCase();
        if (key === 'escape') {
            me.selectionLayer.getSource().clear();
        } else if (key === 'shift') {
            me.shiftKeyPressed = true;
        } else if (key === 'control') {
            me.ctrlKeyPressed = true;
        }
    },

    /**
     * Handler called for keyup events to check for shift selections
     * @param {Event} event The browser event
     */
    keyupHandler: function(event) {
        var me = Ext.ComponentQuery.query(
            'k-button-selectfeatures')[0].getController();
        var key = event.key.toLowerCase();
        if (key === 'shift') {
            me.shiftKeyPressed = false;
        } else if (key === 'control') {
            me.ctrlKeyPressed = false;
        }
    },

    /**
     * Handler called when features get selected by single click
     */
    singleSelect: function(e) {
        this.mapComponent.setLoading(true);
        this.determineLayerToSelectOn();
        // mockup a bbox with a resolution dependent buffer
        var buffer = this.mapComponent.map.getView().getResolution() * 10;
        var extent = [];
        extent.push(
            e.coordinate[0],
            e.coordinate[1],
            e.coordinate[0],
            e.coordinate[1]
        );
        extent[0] = extent[0] - buffer;
        extent[1] = extent[1] - buffer;
        extent[2] = extent[2] + buffer;
        extent[3] = extent[3] + buffer;

        if (this.layerToSelectOn instanceof ol.layer.Vector) {
            this.getFeaturesFromVectorLayer(extent);
        } else {
            this.getFeaturesFromWmsLayer(extent);
        }
    },

    /**
     * Handler after a box drawing has been finished
     */
    boxEnd: function() {
        this.mapComponent.setLoading(true);
        var extent = this.dragBoxInteraction.getGeometry().getExtent();
        if (this.layerToSelectOn instanceof ol.layer.Vector) {
            this.getFeaturesFromVectorLayer(extent);
        } else {
            this.getFeaturesFromWmsLayer(extent);
        }

    },

    /**
     * Method sets the currently selected layer from the tree as the candidate
     * on which selection shall happen
     */
    determineLayerToSelectOn: function() {
        var selection = this.legendTree.getSelection();
        if (selection.length !== 1) {
            Ext.Msg.alert(this.error, this.noSingleActiveLayerFound);
            this.getView().setPressed(false);
            this.mapComponent.setLoading(false);
            return;
        }
        this.layerToSelectOn = selection[0].getOlLayer();
    },

    /**
     * Handler when a box drawing starts
     */
    boxStart: function() {
        this.determineLayerToSelectOn();
    },

    /**
     * Adds the given features to the vectorlayer, if they do not exist in its
     * source already. Features that do already exist will get removed.
     * Feature removal will only work if the key `featureIdentifyField` has been
     * set on the layer in GNOS to a unique and existing field
     * @param {array} features The array of features that should be handled
     */
    addOrRemoveSelectedFeatures: function(features) {
        var me = this;
        var exisitingFeatures = me.selectionLayer.getSource().getFeatures();
        var featureIdentifyField = Koala.util.Object.getPathStrOr(
            me.layerToSelectOn.metadata, 'layerConfig/olProperties/featureIdentifyField');
        var featureType = Koala.util.Object.getPathStrOr(
            me.layerToSelectOn.metadata, 'layerConfig/wms/layers');
        Ext.each(features, function(feature) {
            var alreadyExistingFeature;
            Ext.each(exisitingFeatures, function(exisitingFeature) {
                if (featureIdentifyField && featureType) {
                    if (exisitingFeature.__featureType__ && exisitingFeature.__featureType__ === featureType) {
                        // comparing a feature from the same featuretype, lets check for the id
                        var existingId = exisitingFeature.getProperties()[featureIdentifyField];
                        var newId = feature.getProperties()[featureIdentifyField];
                        if (existingId && newId && existingId === newId) {
                            alreadyExistingFeature = exisitingFeature;
                            return false;
                        }
                    }
                }
            });
            if (alreadyExistingFeature) {
                me.selectionLayer.getSource().removeFeature(alreadyExistingFeature);
            } else {
                // save the featuretype for later comparisons
                feature.__featureType__ = featureType;
                me.selectionLayer.getSource().addFeatures([feature]);
            }
        });
    },

    /**
     * Retrieves features from an existing VectorLayer by the given extent
     * @param {array} extent The extent array to retrieve features in
     */
    getFeaturesFromVectorLayer: function(extent) {
        var me = this;
        me.layerToSelectOn.getSource().forEachFeatureIntersectingExtent(
            extent, function(feature) {
                var clone = Ext.clone(feature);
                me.addOrRemoveSelectedFeatures([clone]);
            }
        );
        me.mapComponent.setLoading(false);
    },

    /**
     * Retrieves features from an WMSLayer by the given extent
     * @param {array} extent The extent array to retrieve features in
     */
    getFeaturesFromWmsLayer: function(extent) {
        var me = this;
        Koala.util.Layer.getGeometryFieldNameForLayer(
            me.layerToSelectOn,
            function() {
                var field = this.toString();
                me.getDescribeFeatureSuccess(extent, field);
            },
            me.getDescribeFeatureFail.bind(this)
        );
    },

    /**
     * Callback to issue a GetFeature request with all required filters
     * @param {array} extent The extent array to retrieve features in
     * @param {string} geometryField The name of the field containing the geometry
     */
    getDescribeFeatureSuccess: function(extent, geometryField) {
        var me = this;
        var layer = this.layerToSelectOn;
        if (Ext.isEmpty(geometryField)) {
            Ext.log.error('Could not determine geometryfield for layer ', layer);
            return;
        }
        var wmsUrl = Koala.util.Object.getPathStrOr(layer.metadata,
            'layerConfig/wms/url');
        var wfsUrl = Koala.util.Object.getPathStrOr(layer.metadata,
            'layerConfig/wfs/url');
        var name = Koala.util.Object.getPathStrOr(
            layer.metadata, 'layerConfig/wms/layers');
        var filters = Koala.util.Object.getPathStrOr(
            layer.metadata, 'filters');
        var cqlFilter = Koala.util.Object.getPathStrOr(
            layer.metadata, 'layerConfig/olProperties/param_cql_filter');
        var mapComponent = BasiGX.util.Map.getMapComponent();
        var srs = mapComponent.map.getView().getProjection().getCode();
        var sldFilters;
        var dimensionAttribute = 'end_measure';
        if (filters && filters[0]) {
            dimensionAttribute = filters[0].param;
        }

        var successCb = function(response) {
            var sld = response.responseText;
            var sldObject = BasiGX.util.SLD.toSldObject(sld);
            var rules = BasiGX.util.SLD.rulesFromSldObject(sldObject);
            if (!Ext.isEmpty(rules)) {
                // get all sld filters
                sldFilters = BasiGX.util.SLD.getFilterEncodingFromSldRules(
                    rules
                );
            }

            var filter = BasiGX.util.WFS.getTimeAndSldCompliantFilter(
                layer,
                dimensionAttribute,
                sldFilters,
                me.mapComponent.map,
                geometryField,
                extent
            );

            if (cqlFilter) {
                var ogcCqlFilter = BasiGX.util.WFS.getOgcFromCqlFilter(cqlFilter);
                filter = BasiGX.util.WFS.combineFilters([ogcCqlFilter, filter]);
            }

            BasiGX.util.WFS.executeWfsGetFeature(
                wfsUrl,
                layer,
                srs,
                [],
                geometryField,
                filter,
                me.getFeatureSuccess.bind(me)
            );
        };

        var errorCb = function() {
            Ext.log.error('Could not get the SLD for layer');
            me.mapComponent.setLoading(false);
        };
        BasiGX.util.SLD.getSldFromGeoserver(wmsUrl, name, successCb, errorCb);
    },

    /**
     * Callback on DescribeFeatureType failure
     */
    getDescribeFeatureFail: function() {
        Ext.log.error('Could not determine geometryfield for layer');
        this.mapComponent.setLoading(false);
    },

    /**
     * Callback on GetFeatures success
     * @param {object} response The response containing the features
     */
    getFeatureSuccess: function(response) {
        var format = new ol.format.GeoJSON();
        try {
            var features = format.readFeatures(response.responseText);
            if (!this.shiftKeyPressed) {
                // always remove all selections when user does not select with
                // the shift key
                this.selectionLayer.getSource().clear();
            }
            this.addOrRemoveSelectedFeatures(features);
        } catch (e) {
            Ext.Msg.alert(this.error, this.couldNotParse);
        }
        this.mapComponent.setLoading(false);
    },

    /**
     * The failure callback when features could not be loaded.
     */
    getFeatureFail: function() {
        this.mapComponent.setLoading(false);
        Ext.Msg.alert(this.error, this.couldNotLoad);
    }
});
