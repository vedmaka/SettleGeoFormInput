<?php

/**
 * Class for SettleGeoFormInput extension
 *
 * @file
 * @ingroup Extensions
 */
class SettleGeoFormInput extends SFDropdownInput
{

	public static function getName() {
		return 'settle_geo_form';
	}

	public static function getHTML( $cur_value, $input_name, $is_mandatory, $is_disabled, $other_args ) {
		global $sfgTabIndex, $sfgFieldNum, $wgOut;

		if( !array_key_exists('geo_type', $other_args) ) {
			return "Error: please specify geo_type attribute for this input.";
		}

		if( !class_exists('SettleGeoTaxonomy') ) {
			return "Error: extension SettleGeoTaxonomy is required.";
		}

		if( !in_array( '', $wgOut->getModules()) ) {
			$wgOut->addModules( 'ext.settlegeoforminput.foo' );
		}

		$geoType = $other_args['geo_type'];

		$preload = false;
		if( array_key_exists('geo_preload', $other_args) ) {
			$preload = true;
		}

		$spanClass = 'inputSpan';
		$spanAttrs = array( 'class' => $spanClass . ' settle-geo-input', 'data-geo-type' => $geoType );
		
		if( in_array('state_input', $other_args) ) {
			$spanAttrs['data-state-input-name'] = $other_args['state_input'];
		}
		
		if( in_array('city_input', $other_args) ) {
			$spanAttrs['data-city-input-name'] = $other_args['city_input'];
		}

		// Standardize $cur_value
		if ( is_null( $cur_value ) ) { $cur_value = ''; }

		$className = ( $is_mandatory ) ? 'mandatoryField' : 'createboxInput';
		$input_id = "input_$sfgFieldNum";

		$innerDropdown = '';
		// Add a blank value at the beginning, unless this is a
		// mandatory field and there's a current value in place
		// (either through a default value or because we're editing
		// an existing page).
		//if ( $cur_value === '' ) {
			$innerDropdown .= "	<option value=\"\"></option>\n";
		//}

		if( $cur_value !== '' ) {
			$spanAttrs['data-selected-item'] = $cur_value;
		}

		$possible_values = array();

		if( $preload ) {
			switch ( $geoType ) {
				case 'country':
					$possible_values = SettleGeoTaxonomy::getInstance()->getEntities( SettleGeoTaxonomy::TYPE_COUNTRY, null, false );
					break;
				case 'state':
					$possible_values = SettleGeoTaxonomy::getInstance()->getEntities( SettleGeoTaxonomy::TYPE_STATE, null, false );
					break;
				case 'city':
					$possible_values = SettleGeoTaxonomy::getInstance()->getEntities( SettleGeoTaxonomy::TYPE_CITY, null, false );
					break;
			}
		}

		foreach ( $possible_values as $possible_value ) {
			$optionAttrs = array( 'value' => $possible_value['name'], 'data-geo-id' => $possible_value['id'] );
			if ( $possible_value['name'] == $cur_value ) {
				$optionAttrs['selected'] = "selected";
			}
			$label = $possible_value['name'];
			$innerDropdown .= Html::element( 'option', $optionAttrs, $label );
		}

		$selectAttrs = array(
			'id' => $input_id,
			'tabindex' => $sfgTabIndex,
			'name' => $input_name,
			'class' => $className
		);

		if ( $is_disabled ) {
			$selectAttrs['disabled'] = 'disabled';
		}

		$text = Html::rawElement( 'select', $selectAttrs, $innerDropdown );
		if ( $is_mandatory ) {
			$spanClass .= ' mandatoryFieldSpan';
		}
		$text = Html::rawElement( 'span', $spanAttrs, $text );
		return $text;
	}

	/**
	 * Returns the HTML code to be included in the output page for this input.
	 */
	public function getHtmlText() {
		return self::getHTML(
			$this->mCurrentValue,
			$this->mInputName,
			$this->mIsMandatory,
			$this->mIsDisabled,
			$this->mOtherArgs
		);
	}

}
