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
 * @class Koala.view.form.LayerFilterController
 */
Ext.define('Koala.view.form.LayerFilterController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-form-layerfilter',

    requires: [
        'Koala.util.Date',
        'Koala.util.Filter',
        'Koala.util.Layer'
    ],

    /**
     * This is the handler if we want to update the filters of an
     * existing layer.
     */
    changeFilterForLayer: function() {
        var me = this;
        var LayerUtil = Koala.util.Layer;
        var view = me.getView();
        var existingLayer = view.getLayer();
        // view.getMetadata() might be tainted, i.e. changed in place
        var metadata = LayerUtil.getOriginalMetadata(existingLayer);
        var filters = view.getFilters();
        filters = me.updateFiltersFromForm(filters);
        metadata.filters = filters;

        // Create a complete new layer to get its source…
        var newLayer = LayerUtil.layerFromMetadata(metadata);
        // … this is the trick to update the filter but reuse all the
        // utility logic.
        existingLayer.setSource(newLayer.getSource());

        me.updateMetadataLegendTree(existingLayer, metadata);
        me.deselectThemeTreeItems();
        LayerUtil.repaintLayerFilterIndication();
        view.up('window').close();
    },

    /**
     * This is the actual handler when the 'Add to map' button is clicked. It
     * will create a layer (via Koala.util.Layer#layerFromMetadata) with the
     * currently displayed filters applied and add that layer to the map (via
     * Koala.util.Layer#addOlLayerToMap)
     */
    submitFilter: function() {
        var me = this;
        var LayerUtil = Koala.util.Layer;
        var view = me.getView();
        var metadata = view.getMetadata();
        var metadataClone = Ext.clone(metadata);
        var filters = view.getFilters();
        filters = me.updateFiltersFromForm(filters);
        metadata.filters = filters;
        var layer = LayerUtil.layerFromMetadata(metadata);
        LayerUtil.setOriginalMetadata(layer, metadataClone);
        LayerUtil.addOlLayerToMap(layer);
        me.deselectThemeTreeItems();
        view.up('window').close();
    },

    /**
     * Given the set of original filters (from metadata), this method
     * queries the complete filter form and tries to gather values from
     * its elements. Will return a changed filter where the filter
     * conditions match those of the form.
     *
     * @param {Array<Object>} filters The filters.
     * @return {Array<Object>} The updated filters.
     */
    updateFiltersFromForm: function(filters) {
        var me = this;
        var FilterUtil = Koala.util.Filter;
        var view = me.getView();
        // Iterate over all filters…
        Ext.each(filters, function(filter, idx) {
            // … grab the associated fieldset by attribute
            var selector = '[filterIdx=\'' + idx +'\']';
            var fieldset = view.down(selector);
            if (fieldset) {
                var fields = fieldset.query('field, multiselect');
                var keyVals = {};
                Ext.each(fields, function(field) {
                    var key = field.getName();
                    if (!Ext.Array.contains(view.ignoreFields, key)) {
                        // Request the value as moment object.
                        var val = field.getValue(true);
                        if (moment.isMoment(val)) {
                            // We have to add hours & minutes, the date field
                            // has precision DAY:
                            val = FilterUtil.setHoursAndMinutes(val, field);
                        }
                        keyVals[key] = val;
                    }
                });
                filters = me.updateFilterValues(filters, idx, keyVals);
            }
        });
        return filters;
    },

    /**
     * Called during the update of a filter of an existing layer, this
     * method will upodate the metadata of the layer everywhere it might
     * be used.
     *
     * @param {ol.layer.Layer} layer The layer whose metadata (filter)
     *     has changed.
     * @param {Object} metadata The new metadata of the layer.
     */
    updateMetadataLegendTree: function(layer, metadata) {
        layer.metadata = metadata;
        // find all legendpanels:
        var legends = Ext.ComponentQuery.query('k-panel-routing-legendtree');
        Ext.each(legends, function(legend) {
            // find the correct record for the given layer
            legend.getStore().each(function(rec) {
                var layerInTree = rec.getOlLayer && rec.getOlLayer();
                if (layerInTree && layerInTree === layer) {
                    rec.set('metadata', metadata);
                    layerInTree.metadata = metadata;
                }
            });
        });
    },

    /**
     * This method handles the adding of layers without any filters. It is bound
     * as handler for a button that is only visible when the filter form was
     * created for a layer without filters.
     */
    submitNoFilter: function() {
        var LayerUtil = Koala.util.Layer;
        var view = this.getView();
        var metadata = view.getMetadata();
        var metadataClone = Ext.clone(metadata);
        var layer = LayerUtil.layerFromMetadata(metadata);
        LayerUtil.setOriginalMetadata(layer, metadataClone);
        LayerUtil.addOlLayerToMap(layer);
        this.deselectThemeTreeItems();
        view.up('window').close();
    },

    /**
     * Unselects all items after a layer was added to the map.
     */
    deselectThemeTreeItems: function() {
        var tree = Ext.ComponentQuery.query('k-panel-themetree')[0];
        var treeSelModel = tree && tree.getSelectionModel();
        var selection = treeSelModel && treeSelModel.getSelection();
        if (!Ext.isEmpty(selection)) {
            treeSelModel.deselectAll();
        }
    },

    /**
     *
     */
    updateFilterValues: function(filters, idx, keyVals) {
        var FilterUtil = Koala.util.Filter;
        var filter = filters[idx];
        var filterType = (filter.type || '').toLowerCase();
        var param = filter.param;
        if (filterType === 'timerange') {
            var keys = FilterUtil.startAndEndFieldnamesFromMetadataParam(param);
            filter.effectivemindatetime = keyVals[keys.startName];
            filter.effectivemaxdatetime = keyVals[keys.endName];
        } else if (filterType === 'pointintime') {
            filter.effectivedatetime = keyVals[param];
        } else if (filterType === 'value') {
            filter.effectivevalue = keyVals[param];
        }
        filters[idx] = filter;
        return filters;
    },

    /**
     * Bound as handler for the beforerender event, this method registers the
     * listener to react on any UTC-button changes.
     */
    onBeforeRenderLayerFilterForm: function() {
        var utcBtns = Ext.ComponentQuery.query('k-button-timereference');
        Ext.each(utcBtns, function(utcBtn) {
            utcBtn.disable();
        });
    },

    /**
     * Bound as handler in the destroy sequence, this method unregisters the
     * listener to react on any UTC-button changes.
     */
    onBeforeDestroyLayerFilterForm: function() {
        var me = this;
        var utcBtns = Ext.ComponentQuery.query('k-button-timereference');
        Ext.each(utcBtns, function(utcBtn) {
            utcBtn.enable();
        });

        //deselect ThemeTreeItems
        me.deselectThemeTreeItems();
    }
});
