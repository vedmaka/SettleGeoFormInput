$( function () {

    /**
     * @constructor
     */
    var SettleGeoInput = function( element ) {
        this.$element = $(element);
        this.geoType = this.$element.data('geo-type');
        
        this.stateElement = undefined;
        if( this.$element.data('state-input-name') ) {
            var stateInput = $( '[name="' + this.$element.data('state-input-name') + '"]' );
            this.stateElement = stateInput.parent();
        }
        
        this.cityElement = undefined;
        if( this.$element.data('city-input-name') ) {
            var cityInput = $( '[name="' + this.$element.data('city-input-name') + '"]' );
            this.cityElement = cityInput.parent();
        }
        
        this.init();
    };

    SettleGeoInput.prototype.init = function() {
        this.$element.find('select').on('change', $.proxy( this.onChange, this ));

        if( this.geoType == 'country' ) {
            this.preloadSelectedValuesStates();
        }

    };

    SettleGeoInput.prototype.preloadSelectedValuesStates = function() {

        if( this.stateElement != undefined && !this.stateElement.data('geo-loaded') ) {

            var selectValue = this.$element.find('option:selected').data('geo-id');

            if( selectValue == undefined || !selectValue ) {
                return false;
            }

            var stateSelected = this.stateElement.data('selected-item');
            if( stateSelected != undefined ) {
                this.loadValues( this.stateElement, 'state', selectValue, stateSelected );
            }else{
                this.loadValues( this.stateElement, 'state', selectValue );
            }
        }

    };

    SettleGeoInput.prototype.preloadSelectedValuesCities = function() {

        if( this.stateElement != undefined && this.cityElement != undefined && !this.cityElement.data('geo-loaded') ) {

            this.cityElement.data('geo-loaded', true);

            var selectValue = this.stateElement.find('option:selected').data('geo-id');

            if( selectValue == undefined || !selectValue ) {
                return false;
            }

            var citySelected = this.cityElement.data('selected-item');
            if( citySelected != undefined ) {
                this.loadValues( this.cityElement, 'city', selectValue, citySelected );
            }else{
                this.loadValues( this.cityElement, 'city', selectValue );
            }
        }

    };

    SettleGeoInput.prototype.onChange = function( event ) {

        var select = event.target;
        var selectValue = $(select).find('option:selected').data('geo-id');

        if( selectValue != undefined ) {

            switch (this.geoType) {
                case 'country':
                    if (this.stateElement != undefined) {
                        this.loadValues(this.stateElement, 'state', selectValue);
                    }
                    if (this.cityElement != undefined) {
                        this.cityElement.find('select').html('');
                    }
                    break;
                case 'state':
                    if (this.cityElement != undefined) {
                        this.loadValues(this.cityElement, 'city', selectValue);
                    }
                    break;
                case 'city':
                    // Do nothing
                    break;
            }

        }else{
            if( this.geoType == 'country' ) {
                if (this.stateElement != undefined) {
                    this.stateElement.find('select').html('');
                }
                if (this.cityElement != undefined) {
                    this.cityElement.find('select').html('');
                }
            }
            if( this.geoType == 'state' ) {
                if (this.cityElement != undefined) {
                    this.cityElement.find('select').html('');
                }
            }
        }
    };

    SettleGeoInput.prototype.loadValues = function( element, type, parent, preselect ) {

        var apiUrl = mw.config.get('wgServer') + mw.config.get('wgScriptPath')
            + '/api.php?format=json&action=settlegeotaxonomy&type=' + type + '&parent=' + parent;

        var elementSelect = $(element).find('select');
        elementSelect.html('');
        elementSelect.prop('disabled', true);

        var self = this;

        $.get( apiUrl, function( data ){
            var items = data.settlegeotaxonomy.items;

            if (!items.length) {
                return false;
            }

            elementSelect.append( $('<option></option>') );

            $(items).each(function(i, item){
                var option = $('<option />');
                option.prop('value', item.name);
                option.text(item.name);
                option.data('geo-id', item.id);
                if( preselect != undefined ) {
                    if( preselect == item.name ) {
                        option.prop('selected', true);
                    }
                }
                elementSelect.append( option );
            });

            elementSelect.prop('disabled', false);

            if( element.data('geo-type') == 'state' ) {
                self.preloadSelectedValuesCities();
            }

        });
    };

    mw.settlegeoforminput = SettleGeoInput;

});