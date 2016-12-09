$( function () {

    /**
     * @constructor
     */
    var SettleGeoInput = function( element ) {
        this.$element = $(element);
        this.$codeInput = undefined;
        this.geoType = this.$element.data('geo-type');
        
        this.stateElement = undefined;
        if( this.$element.data('state-input-name') ) {
            var stateInput = $( '#' + this.$element.data('state-input-name') );
            this.stateElement = stateInput.parent();
        }
        
        this.cityElement = undefined;
        if( this.$element.data('city-input-name') ) {
            var cityInput = $( '#' + this.$element.data('city-input-name') );
            this.cityElement = cityInput.parent();
        }

        this.categoryElement = undefined;
        if( this.$element.data('category-input-name') ) {
			this.categoryElement = $('select[name="' + this.$element.data('category-input-name') + '"]' );
        }
        
        this.init();
    };

    SettleGeoInput.prototype.init = function() {

        if( this.categoryElement ) {
            this.categoryElement.on('change', $.proxy( this.updateCategoryState, this ));
        }

        this.updateCategoryState();

        if( this.$element.data('hidden-input') ) {
            this.$codeInput = $('input[name="' + this.$element.data('hidden-input') + '"]');
        }

        this.$element.find('select').on('change', $.proxy( this.onChange, this ));

        var stateSelected = this.$element.data('selected-item');
        if( stateSelected != undefined && this.$element.find('select').val() && this.$element.find('select').val().length ) {
            if( this.$codeInput ) {
                this.$codeInput.val( this.$element.find('option:selected').data('geo-id') );
            }
        }

        if( this.geoType == 'country' ) {
            this.preloadSelectedValuesStates();
        }

    };

    SettleGeoInput.prototype.updateCategoryState = function() {

        if( !this.categoryElement || this.categoryElement == 'undefined' ) {
            return true;
		}

		// Restore all states first
		this.changeState( false );

		// Disable & clear input if there are no category selected
		if( !this.categoryElement.val() || !this.categoryElement.val().length ) {
            this.changeState( true );
            return true;
        }

        // Match inputs to the category scope
		var scope = this.categoryElement.find('option:selected').data('scope');
        switch (scope) {
			case 0: // Country
				if( this.geoType != 'country' ) {
					this.changeState( true ); // disable
				}
				break;
			case 1: // State
				// Skip city for state scope
				if( this.geoType == 'city' ) {
					this.changeState( true ); // disable
				}
				break;
			case 2: // City
				// Allow all inputs if its City scope
				break;
		}

    };

    SettleGeoInput.prototype.changeState = function(state) {
    	if( state ) {
    		this.$element.find('select').val('').trigger('change');
			if( this.$codeInput ) {
				this.$codeInput.val('');
			}
			this.$element.find('select').attr('disabled', 'disabled');
		}else{
			this.$element.find('select').attr('disabled', false);
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
							this.cityElement.find('select').html('<option></option>');
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

            this.changeCodeValue( this.$element, selectValue );

        }else{

            if( this.geoType == 'country' ) {
                if (this.stateElement != undefined) {
                    this.stateElement.find('select').html('<option></option>');
                    this.changeCodeValue( this.stateElement, '' );
                }

                if (this.cityElement != undefined) {
                    this.cityElement.find('select').html('<option></option>');
                    this.changeCodeValue( this.cityElement, '' );
                }
            }

            if( this.geoType == 'state' ) {
                if (this.cityElement != undefined) {
                    this.cityElement.find('select').html('<option></option>');
                    this.changeCodeValue( this.cityElement, '' );
                }
            }

            this.changeCodeValue( this.$element, selectValue );
        }

    };

    SettleGeoInput.prototype.changeCodeValue = function( element, value ) {
        if ( $(element).data('hidden-input') != undefined ) {
            var hiddenInput = $( 'input[name="' + $(element).data('hidden-input') + '"]' );
            if( hiddenInput ) {
                hiddenInput.val( value );
            }
        }
    };

    SettleGeoInput.prototype.loadValues = function( element, type, parent, preselect ) {

    	var wasDisabled = false;
		if( element.find('select').is(':disabled') ) {
			wasDisabled = true;
		}

        var apiUrl = mw.config.get('wgServer') + mw.config.get('wgScriptPath')
            + '/api.php?format=json&action=settlegeotaxonomy&type=' + type + '&parent=' + parent;

        var elementSelect = $(element).find('select');
        elementSelect.html('');

        // We only modify disabled state when select was not disabled intentionally
        if( !wasDisabled ) {
			elementSelect.prop('disabled', true);
		}

        var self = this;

        $.get( apiUrl, function( data ){
            var items = data.settlegeotaxonomy.items;

			elementSelect.append( $('<option></option>') );

            if (!items.length) {
            	// Create fake option for City select when there are no cities in selected state
                if( type == 'city' && ( self.geoType == 'state' || self.geoType == 'country' ) ) {

                    var sourceElement;
                    if( self.geoType == 'state' ) {
                        sourceElement = self.$element;
                    }
                    if( self.geoType == 'country' && self.stateElement ) {
                        sourceElement = self.stateElement;
                    }

                    var opt = $('<option/>');
                    opt.prop('value', sourceElement.find('select').val());
                    opt.text(sourceElement.find('select').val());
                    //opt.prop('selected', true);
                    //opt.prepend( $('<option selected></option>') );
                    elementSelect.append( opt );
                }

                if( !wasDisabled ) {
					elementSelect.prop('disabled', false);
				}

                return false;
            }

            $(items).each(function(i, item){
                var option = $('<option />');
                option.prop('value', item.name);
                option.text(item.name);
                option.data('geo-id', item.geonamesCode);
                if( preselect != undefined ) {
                    if( preselect == item.name ) {
                        option.prop('selected', true);
                        var hiddenInput = $(element).data('hidden-input');
                        if( hiddenInput != undefined ) {
                            hiddenInput = $("input[name='"+ $(element).data('hidden-input') +"']");
                            hiddenInput.val( item.geonamesCode );
                        }
                    }
                }
                elementSelect.append( option );
            });

            if( !wasDisabled ) {
				elementSelect.prop('disabled', false);
			}

            if( element.data('geo-type') == 'state' ) {
                self.preloadSelectedValuesCities();
            }

        });
    };

    mw.settlegeoforminput = SettleGeoInput;

});