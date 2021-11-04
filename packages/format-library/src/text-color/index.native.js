/**
 * External dependencies
 */
import { isEmpty } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useCallback, useMemo, useState } from '@wordpress/element';
import { BlockControls, useSetting } from '@wordpress/block-editor';
import { ToolbarGroup, ToolbarButton } from '@wordpress/components';
import { Icon, textColor as textColorIcon } from '@wordpress/icons';
import { removeFormat } from '@wordpress/rich-text';

/**
 * Internal dependencies
 */
import { getActiveColors } from './inline.js';
import { default as InlineColorUI } from './inline';

const name = 'core/text-color';
const title = __( 'Text color' );

const EMPTY_ARRAY = [];

function getComputedStyleProperty( element, property ) {
	const {
		props: { style = {} },
	} = element;

	if ( property === 'background-color' ) {
		const { backgroundColor, baseColors } = style;

		if ( backgroundColor !== 'transparent' ) {
			return backgroundColor;
		} else if ( baseColors && baseColors?.color?.background ) {
			return baseColors?.color?.background;
		}
	}
}

function fillComputedColors( element, { color, backgroundColor } ) {
	if ( ! color && ! backgroundColor ) {
		return;
	}

	return {
		color: color || getComputedStyleProperty( element, 'color' ),
		backgroundColor:
			backgroundColor.replace( / /g, '' ) === 'rgba(0,0,0,0)'
				? getComputedStyleProperty( element, 'background-color' )
				: 'transparent',
	};
}

function TextColorEdit( {
	value,
	onChange,
	isActive,
	activeAttributes,
	contentRef,
} ) {
	const allowCustomControl = useSetting( 'color.custom' );
	const colors = useSetting( 'color.palette' ) || EMPTY_ARRAY;
	const [ isAddingColor, setIsAddingColor ] = useState( false );
	const enableIsAddingColor = useCallback( () => setIsAddingColor( true ), [
		setIsAddingColor,
	] );
	const disableIsAddingColor = useCallback( () => setIsAddingColor( false ), [
		setIsAddingColor,
	] );
	const colorIndicatorStyle = useMemo(
		() =>
			fillComputedColors(
				contentRef,
				getActiveColors( value, name, colors )
			),
		[ value, colors ]
	);

	const hasColorsToChoose = ! isEmpty( colors ) || ! allowCustomControl;
	if ( ! hasColorsToChoose && ! isActive ) {
		return null;
	}

	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						name="text-color"
						className="format-library-text-color-button"
						isActive={ isActive }
						icon={
							<Icon
								icon={ textColorIcon }
								style={
									colorIndicatorStyle?.color && {
										color: colorIndicatorStyle?.color,
									}
								}
							/>
						}
						title={ title }
						extraProps={ { isActiveStyle: colorIndicatorStyle } }
						// If has no colors to choose but a color is active remove the color onClick
						onClick={
							hasColorsToChoose
								? enableIsAddingColor
								: () => onChange( removeFormat( value, name ) )
						}
					/>
				</ToolbarGroup>
			</BlockControls>
			{ isAddingColor && (
				<InlineColorUI
					name={ name }
					onClose={ disableIsAddingColor }
					activeAttributes={ activeAttributes }
					value={ value }
					onChange={ onChange }
					contentRef={ contentRef }
				/>
			) }
		</>
	);
}

export const textColor = {
	name,
	title,
	tagName: 'mark',
	className: 'has-inline-color',
	attributes: {
		style: 'style',
		class: 'class',
	},
	/*
	 * Since this format relies on the <mark> tag, it's important to
	 * prevent the default yellow background color applied by most
	 * browsers. The solution is to detect when this format is used with a
	 * text color but no background color, and in such cases to override
	 * the default styling with a transparent background.
	 *
	 * @see https://github.com/WordPress/gutenberg/pull/35516
	 */
	__unstableFilterAttributeValue( key, value ) {
		if ( key !== 'style' ) return value;
		// We should not add a background-color if it's already set
		if ( value && value.includes( 'background-color' ) ) return value;
		const addedCSS = [ 'background-color', 'rgba(0, 0, 0, 0)' ].join( ':' );
		// Prepend `addedCSS` to avoid a double `;;` as any the existing CSS
		// rules will already include a `;`.
		return value ? [ addedCSS, value ].join( ';' ) : addedCSS;
	},
	edit: TextColorEdit,
};
