/**
 * External dependencies
 */
import { act, fireEvent, initializeEditor, getEditorHtml } from 'test/helpers';
import { Image } from 'react-native';

/**
 * WordPress dependencies
 */
import { getBlockTypes, unregisterBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { registerCoreBlocks } from '../..';

beforeAll( () => {
	registerCoreBlocks();

	// Mock Image.getSize to avoid failed attempt to size non-existant image
	const getSizeSpy = jest.spyOn( Image, 'getSize' );
	getSizeSpy.mockImplementation( ( _url, callback ) => callback( 300, 200 ) );
} );

afterAll( () => {
	getBlockTypes().forEach( ( { name } ) => {
		unregisterBlockType( name );
	} );

	// Restore mocks
	Image.getSize.mockRestore();
} );

describe( 'Image Block', () => {
	it( 'sets link target', async () => {
		const initialHtml = `
		<!-- wp:image {"id":1,"sizeSlug":"large","linkDestination":"custom","className":"is-style-default"} -->
		<figure class="wp-block-image size-large is-style-default">
			<a href="https://wordpress.org">
				<img src="https://cldup.com/cXyG__fTLN.jpg" alt="" class="wp-image-1"/>
			</a>
		<figcaption>Mountain</figcaption></figure>
		<!-- /wp:image -->`;
		const screen = await initializeEditor( { initialHtml } );

		const imageBlock = screen.getByA11yLabel( /Image Block/ );
		fireEvent.press( imageBlock );

		const settingsButton = screen.getByA11yLabel( 'Open Settings' );
		await act( () => fireEvent.press( settingsButton ) );

		const linkTargetButton = screen.getByText( 'Open in new tab' );
		fireEvent.press( linkTargetButton );

		const expectedHtml = `<!-- wp:image {"id":1,"sizeSlug":"large","linkDestination":"custom","className":"is-style-default"} -->
<figure class="wp-block-image size-large is-style-default"><a href="https://wordpress.org" target="_blank" rel="noreferrer noopener"><img src="https://cldup.com/cXyG__fTLN.jpg" alt="" class="wp-image-1"/></a><figcaption>Mountain</figcaption></figure>
<!-- /wp:image -->`;
		expect( getEditorHtml() ).toBe( expectedHtml );
	} );

	it( 'unset link target', async () => {
		const initialHtml = `
		<!-- wp:image {"id":1,"sizeSlug":"large","linkDestination":"custom","className":"is-style-default"} -->
		<figure class="wp-block-image size-large is-style-default">
			<a href="https://wordpress.org" target="_blank" rel="noreferrer noopener">
				<img src="https://cldup.com/cXyG__fTLN.jpg" alt="" class="wp-image-1"/>
			</a>
			<figcaption>Mountain</figcaption>
		</figure>
		<!-- /wp:image -->`;
		const screen = await initializeEditor( { initialHtml } );

		const imageBlock = screen.getByA11yLabel( /Image Block/ );
		fireEvent.press( imageBlock );

		const settingsButton = screen.getByA11yLabel( 'Open Settings' );
		await act( () => fireEvent.press( settingsButton ) );

		const linkTargetButton = screen.getByText( 'Open in new tab' );
		fireEvent.press( linkTargetButton );

		const expectedHtml = `<!-- wp:image {"id":1,"sizeSlug":"large","linkDestination":"custom","className":"is-style-default"} -->
<figure class="wp-block-image size-large is-style-default"><a href="https://wordpress.org"><img src="https://cldup.com/cXyG__fTLN.jpg" alt="" class="wp-image-1"/></a><figcaption>Mountain</figcaption></figure>
<!-- /wp:image -->`;
		expect( getEditorHtml() ).toBe( expectedHtml );
	} );
} );
