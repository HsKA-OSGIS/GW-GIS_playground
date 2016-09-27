Ext.define('Koala.view.container.styler.SymbolizerController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.container.styler.symbolizer',
    requires: [
        'GeoExt.component.FeatureRenderer',
        'BasiGX.util.Color',

        "Koala.view.container.styler.StyleEditor",
        "Koala.util.Style"
    ],

    /**
     *
     */
    onBoxReady: function(){
        var me = this;
        var view = me.getView();
        var viewModel = me.getViewModel();
        var styleUtil = Koala.util.Style;
        var layer = viewModel.get('layer');
        var symbolType = styleUtil.symbolTypeFromVectorLayer(layer);
        var symbolizerFromRule = viewModel.get('rule').getSymbolizer();

        viewModel.set('symbolizer', symbolizerFromRule);

        // Check if we get a real symbolizer or just a blank one
        if(!symbolizerFromRule.get('symbolType')){
            symbolizerFromRule.set('olStyle', layer.getStyle());
            symbolizerFromRule.set('symbolType', symbolType);
        }

        view.add({
            xtype: 'fieldset',
            bind:{
                title: '{title}',
                html: '{symbolizerFieldSetHtml}'
            },
            height: 140,
            name: 'symbolizer-fieldset',
            layout: 'center',
            items: [{
                xtype: 'gx_renderer',
                symbolizers: symbolizerFromRule.get('olStyle'),
                symbolType: symbolType,
                minWidth: 80,
                minHeight: 80,
                listeners: {
                    click: {
                        element: 'el',
                        fn: me.symbolizerClicked,
                        scope: me
                    }
                }
            }]
        });
    },

    /**
     *
     */
    symbolizerClicked: function(){
        var me = this;
        var viewModel = this.getViewModel();
        var symbolType = viewModel.get('symbolizer.symbolType');
        var olStyle = viewModel.get('symbolizer.olStyle');

        var win = Ext.ComponentQuery.query('[name=symbolizer-edit-window]')[0];

        var redlinePointStyle = symbolType.toUpperCase() === 'POINT' ? olStyle : undefined;
        var redlineLineStringStyle = symbolType.toUpperCase() === 'LINESTRING' ? olStyle : undefined;
        var redlinePolygonStyle = symbolType.toUpperCase() === 'POLYGON' ? olStyle : undefined;

        var styleEditor = {
            xtype: 'k_container_styler_styleditor',
            redlinePointStyle: redlinePointStyle,
            redlineLineStringStyle: redlineLineStringStyle,
            redlinePolygonStyle: redlinePolygonStyle
        };

        switch(symbolType) {
        case "Point":
            styleEditor.redlinePointStyle = Ext.isArray(olStyle) ?
                    olStyle[0] : olStyle;
            break;
        case "Line":
            styleEditor.redlineLineStringStyle = Ext.isArray(olStyle) ?
                    olStyle[0] : olStyle;
            break;
        case "Polygon":
            styleEditor.redlinePolygonStyle = Ext.isArray(olStyle) ?
                    olStyle[0] : olStyle;
            break;
        default:
            break;
        }

        if(!win){
            Ext.create('Ext.window.Window', {
                name: 'symbolizer-edit-window',
                title: me.getViewModel().get('windowTitle'),
                layout: 'fit',
                modal: true,
                items: [styleEditor],
                bbar: [{
                    text: 'Cancel',
                    handler: function(btn){
                        btn.up('[name=symbolizer-edit-window]').close();
                    }
                },{
                    text: 'Apply',
                    handler: me.applyStyle,
                    scope: me
                }]
            }).show();
        } else {
            BasiGX.util.Animate.shake(win);
        }
    },

    applyStyle:function(btn){
        var view = this.getView();
        var viewModel = this.getViewModel();

        var symbolizerRenderer = view.down('gx_renderer');
        var win = btn.up('[name=symbolizer-edit-window]');
        var editorRenderer = win.down('gx_renderer');

        viewModel.set('symbolizer.olStyle', editorRenderer.getSymbolizers());

        symbolizerRenderer.update({
            symbolizers: viewModel.get('symbolizer.olStyle')
        });

        view.fireEvent('olstylechanged', viewModel.get('symbolizer.olStyle'));
        win.close();
    }
});
