<?php
/**
 * Enqueue Script and Styles
 *
 */

function wpdocs_theme_scripts() {
	wp_enqueue_style( 'font-Montserrat', 'https://fonts.googleapis.com/css?family=Montserrat:300,400,600' );
	wp_enqueue_style( 'style-css', get_stylesheet_directory_uri() . '/css/style.min.css' );
}
add_action( 'wp_enqueue_scripts', 'wpdocs_theme_scripts', 99 );


/**
 * Get Year today for CopyRight
 *
 */
function get_year_func(){
	return date('Y'); 
}
add_shortcode( 'year', 'get_year_func' );