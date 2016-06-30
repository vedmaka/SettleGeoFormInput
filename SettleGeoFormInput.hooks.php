<?php

/**
 * Hooks for SettleGeoFormInput extension
 *
 * @file
 * @ingroup Extensions
 */
class SettleGeoFormInputHooks
{

	public static function onExtensionLoad()
	{
		
	}

	/**
	 * @param SFFormPrinter $printer
	 */
	public static function onsfFormPrinterSetup( $printer )
	{
		$printer->registerInputType( 'SettleGeoFormInput' );
	}

}
