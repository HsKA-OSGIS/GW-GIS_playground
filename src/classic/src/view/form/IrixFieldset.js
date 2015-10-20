
Ext.define("Koala.view.form.IrixFieldSet",{
    extend: "Ext.form.FieldSet",

    xtype: "k-form-irixfieldset",

    /**
     * Contains the response of the irixContext.json.
     */
    raw: null,

    title: 'IRIX',
    hidden: true,
    margin: '0 0 0 5px',
    name: 'irix',
    layout: 'anchor',
    defaults: {
        anchor: '100%'
    },

    initComponent: function(){
        var me = this;
        Ext.Ajax.request({
            url: 'resources/irixContext.json',

            success: function(response) {
                var json = Ext.decode(response.responseText);
                me.raw = json;
                me.add(me.createFields(json.data.fields));
            },

            failure: function(response) {
                Ext.raise('server-side failure with status code ' + response.status);
            }
        });
        me.callParent(arguments);
    },

    createFields: function(fieldsconfig){
        var me = this;
        var returnFields = [];

        Ext.each(fieldsconfig, function(fieldconfig){
            switch(fieldconfig.type){
                case 'fieldset':
                    returnFields.push(me.createFieldSet(fieldconfig));
                    break;
                case 'text':
                    returnFields.push(me.createTextField(fieldconfig));
                    break;
                case 'number':
                    returnFields.push(me.createNumberField(fieldconfig));
                    break;
                case 'combo':
                    returnFields.push(me.createCombo(fieldconfig));
                    break;
                case 'datetime':
                    returnFields.push(me.createDateField(fieldconfig));
                    break;
                case 'checkbox':
                    returnFields.push(me.createCheckbox(fieldconfig));
                    break;
                default:
                    break;
            }
        });

        return returnFields;
    },

    createFieldSet: function(config){
        var me = this;
        return Ext.create('Ext.form.FieldSet', {
            layout: 'anchor',
            defaults: {
                anchor: '100%'
            },
            name: config.name,
            title: config.label,
            items: me.createFields(config.fields)
        });
    },

    createTextField: function(config){
        return Ext.create('Ext.form.field.Text', {
            name: config.name,
            fieldLabel: config.label,
            value: config.defaultValue,
            allowBlank: config.allowBlank
        });
    },

    createNumberField: function(config){
        return Ext.create('Ext.form.field.Number', {
            name: config.name,
            fieldLabel: config.label,
            minValue: config.minValue,
            maxValue: config.maxValue,
            value: config.defaultValue,
            allowBlank: config.allowBlank
        });
    },

    createCombo: function(config){
        var combo = Ext.create('Ext.form.field.ComboBox', {
            name: config.name,
            fieldLabel: config.label,
            store: config.values,
            value: config.defaultValue,
            allowBlank: config.allowBlank
        });
        // "field1" and "field2" are created when using an an 2-dimensional
        // array as store for the combo. "field1"=value "field2"=displayValue
        combo.getStore().sort('field2', 'ASC');
        return combo;
    },

    createDateField: function(config){
        return Ext.create('Ext.form.field.Date', {
            name: config.name,
            fieldLabel: config.label,
            value: config.defaultValue
        });
    },

    createCheckbox: function(config){
        return Ext.create('Ext.form.field.Checkbox', {
            name: config.name,
            fieldLabel: config.label,
            checked: config.defaultValue,
            boxLabel: ' '
        });
    }
});