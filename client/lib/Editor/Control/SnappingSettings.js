/**
 * @copyright  2011 geOps
 * @license    https://github.com/geops/ole/blob/master/license.txt
 * @link       https://github.com/geops/ole
 */

/**
 * Class: OpenLayers.Editor.Control.SnappingSettings
 * ...
 *
 * Inherits from:
 *  - <OpenLayers.Control.Button>
 */
OpenLayers.Editor.Control.SnappingSettings = OpenLayers.Class(OpenLayers.Control.Button, {

    title: OpenLayers.i18n('oleSnappingSettings'),

    layer: null,

    snapping: new OpenLayers.Control.Snapping(),

    tolerance: 10,

    snappingLayers: [],

    /**
     * Layer that displays guide lines and snapping points
     * @var OpenLayers.Editor.Layer.Snapping
     */
    snappingGuideLayer: null,

    layerListDiv: null,

    toleranceInput: null,

    initialize: function(layer, options) {

        this.layer = layer;

        OpenLayers.Control.Button.prototype.initialize.apply(this, [options]);
        
        this.trigger = OpenLayers.Function.bind(this.openSnappingDialog, this);

        this.events.register("deactivate", this, this.onDeactivate);

        this.title = OpenLayers.i18n('oleSnappingSettings');
    },

    onDeactivate: function() {
        if(this.snapping.active) {
            this.activate();
        }
    },

    openSnappingDialog: function() {

        var content, toleranceHeader, layerHeader;

        this.activate();

        this.layerListDiv = document.createElement('div');
        
        content = document.createElement('div');

        toleranceHeader = document.createElement('h4');
        toleranceHeader.innerHTML = OpenLayers.i18n('oleSnappingSettingsTolerance');
        content.appendChild(toleranceHeader);

        this.toleranceInput = document.createElement('input');
        this.toleranceInput.type = 'text';
        this.toleranceInput.size = 4;
        this.toleranceInput.value = this.tolerance;
        content.appendChild(this.toleranceInput);

        layerHeader = document.createElement('h4');
        layerHeader.innerHTML = OpenLayers.i18n('oleSnappingSettingsLayer');
        content.appendChild(layerHeader);

        content.appendChild(this.layerListDiv);

        this.map.editor.dialog.show({
            content: content,
            title: OpenLayers.i18n('oleSnappingSettings'),
            close: OpenLayers.Function.bind(this.changeSnapping, this)
        });

        this.redraw();
    },

    redraw: function() {

        var layer, element, content;

        this.layerListDiv.innerHTML = '';

        for (var i = 0; i <  this.map.layers.length; i++) {
            
            layer = this.map.layers[i];

            if(!(layer instanceof OpenLayers.Layer.Vector.RootContainer) &&
                 layer instanceof OpenLayers.Layer.Vector &&
                 layer.name.search(/OpenLayers.Handler.+/) == -1) {

                content = document.createElement('div');

                element = document.createElement('input');
                element.type = 'checkbox';
                element.name = 'snappingLayer';
                element.id = 'Snapping.'+layer.id;
                element.value = 'true';
                if(this.snappingLayers.indexOf('Snapping.'+layer.id) >= 0) {
                    element.checked = 'checked';
                    element.defaultChecked = 'selected'; // IE7 hack
                }
                content.appendChild(element);
                OpenLayers.Event.observe(element, 'click',
                    OpenLayers.Function.bind(this.addSnappingLayer, this));

                element = document.createElement('label');
                element.setAttribute('for', 'Snapping.'+layer.id);
                element.innerHTML = layer.name;
                content.appendChild(element);

                this.layerListDiv.appendChild(content);
            }
        }
    },

    addSnappingLayer: function(event) {
        if(this.snappingLayers.indexOf(event.currentTarget.id) >= 0) {
            this.snappingLayers.splice(this.snappingLayers.indexOf(event.currentTarget.id), 1);
        } else {
            this.snappingLayers.push(event.currentTarget.id);
        }
        this.redraw();
    },

    changeSnapping: function() {

        this.tolerance = parseInt(this.toleranceInput.value);

        if(this.snappingLayers.length > 0) {

            this.snapping.deactivate();
            var targets = [];
            for (var i = 0; i <  this.snappingLayers.length; i++) {
                targets.push({
                    layer:this.map.getLayersBy('id',this.snappingLayers[i].substr(9))[0],
                    tolerance: this.tolerance
                });
            }
            this.snapping = new OpenLayers.Control.Snapping({
                layer: this.layer,
                targets: targets
            });
            for (var i = 0; i <  targets.length; i++) {
                targets[i].layer.redraw();
                targets[i].layer.setVisibility(true);
            }
            this.snapping.activate();
        } else {
            if (this.snapping.active) {
                this.snapping.deactivate();
                this.snapping.targets = null;
            }
        }
        if (!this.snapping.active) this.deactivate();
    },

    setMap: function(map){
        OpenLayers.Control.Button.prototype.setMap.apply(this, arguments);

        if(this.snappingGuideLayer===null){
            this.snappingGuideLayer = this.createSnappingGuideLayer();
        }
    },

    /**
     * Adds a layer for guidelines to the map
     * @return {OpenLayers.Editor.Layer.Snapping}
     */
    createSnappingGuideLayer: function(){
        var snappingGuideLayer = new OpenLayers.Editor.Layer.Snapping(OpenLayers.i18n('Snapping Layer'), {
            visibility: false
        });
        this.map.addLayer(snappingGuideLayer);
        
        return snappingGuideLayer;
    },

    CLASS_NAME: "OpenLayers.Editor.Control.SnappingSettings"
});