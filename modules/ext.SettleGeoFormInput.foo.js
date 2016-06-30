$( function () {

    /**
     * @constructor
     */
    var SettleGeoInput = function( element ) {
        this.$element = $(element);
        this.geoType = this.$element.data('geo-type');
        this.init();
    };

    SettleGeoInput.prototype.init = function() {
        this.$element.find('select').on('change', $.proxy( this.onChange, this ));

        if( this.geoType == 'country' ) {
            this.preloadSelectedValuesStates();
        }

    };

    SettleGeoInput.prototype.preloadSelectedValuesStates = function() {

        var stateElement = $('[data-geo-type="state"]');

        if( stateElement.length && !stateElement.data('geo-loaded') ) {

            var selectValue = this.$element.find('option:selected').data('geo-id');

            if( selectValue == undefined || !selectValue ) {
                return false;
            }

            var stateSelected = stateElement.data('selected-item');
            if( stateSelected != undefined ) {
                this.loadValues( stateElement, 'state', selectValue, stateSelected );
            }else{
                this.loadValues( stateElement, 'state', selectValue );
            }
        }

    };

    SettleGeoInput.prototype.preloadSelectedValuesCities = function() {

        var cityElement = $('[data-geo-type="city"]');
        var stateElement = $('[data-geo-type="state"]');

        if( stateElement.length && cityElement.length && !cityElement.data('geo-loaded') ) {

            cityElement.data('geo-loaded', true);

            var selectValue = stateElement.find('option:selected').data('geo-id');

            if( selectValue == undefined || !selectValue ) {
                return false;
            }

            var citySelected = cityElement.data('selected-item');
            if( citySelected != undefined ) {
                this.loadValues( cityElement, 'city', selectValue, citySelected );
            }else{
                this.loadValues( cityElement, 'city', selectValue );
            }
        }

    };

    SettleGeoInput.prototype.onChange = function( event ) {

        var select = event.target;
        var selectValue = $(select).find('option:selected').data('geo-id');
        var stateElement = $('[data-geo-type="state"]');
        var cityElement = $('[data-geo-type="city"]');

        if( selectValue != undefined ) {

            switch (this.geoType) {
                case 'country':
                    if (stateElement.length) {
                        this.loadValues(stateElement, 'state', selectValue);
                    }
                    if (cityElement.length) {
                        cityElement.find('select').html('');
                    }
                    break;
                case 'state':
                    if (cityElement.length) {
                        this.loadValues(cityElement, 'city', selectValue);
                    }
                    break;
                case 'city':
                    // Do nothing
                    break;
            }

        }else{
            if( this.geoType == 'country' ) {
                if (stateElement.length) {
                    stateElement.find('select').html('');
                }
                if (cityElement.length) {
                    cityElement.find('select').html('');
                }
            }
            if( this.geoType == 'state' ) {
                if (cityElement.length) {
                    cityElement.find('select').html('');
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