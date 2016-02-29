/* Copyright (c) 2015 	Marco Pochert, Bundesamt fuer Strahlenschutz
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * @class Koala.view.window.HelpModel
 */
Ext.define('Koala.view.window.HelpModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.k-window-help',
    
    formulas: {
    	selectionHtml: function(get) {
		        var selection = get('treelist.selection'),
		        content;
		    if (selection) {
		        content = selection.getPath('content', '-sep-');
		        content = content.replace(/-sep--sep-|-sep-/g, '');
		        return content;
		    } else {
		        return 'No node selected';
		    }
		}
    },
    stores: {
        navItems: {
        	type: 'tree',        	
        	root: {
        		children: [
        		    {
        		    id: 'select',
    		    	text: '{preface.title}',
    		    	content: '{preface.html}',
    		    	leaf: true,
    		    	rootVisible: true
	        		}, {
	        		text: '{quickRef.title}',
	        		content: '{quickRef.html}',
	        		leaf: true
	        		}, {
	        		text: '{profileSelection.title}',
	        		content: '{profileSelection.html}',
	        		leaf: true
	        		}, {
	        		text: '{map.title}',
	        		content: '{map.html}',
	        		children: [{
	        			text: '{map.overview.title}',
	        			content: '{map.overview.html}',
	        			leaf: true
	        		}, {
	        			text: '{map.geoObjects.title}',
	        			content: '{map.geoObjects.html}',
	        			leaf: true
	        		}]
	        		}, {
					text: '{tools.title}',
					content: '{tools.html}',
					children: [{
	    				text: '{tools.wms.title}',
	    				content: '{tools.wms.html}',
	    				leaf: true
					}, {					
	    				text: '{tools.print.title}',
	    				content: '{tools.print.html}',
	    				leaf: true				
	    			}]
	        		}, {
					text: '{layerSelection.title}',
					content: '{layerSelection.html}',
					leaf: true
	        		}, {
	        		text: '{searchField.title}',
	        		content: '{searchField.html}',
	        		leaf: true
	        		}, {
	        		text: '{settings.title}',
	        		content: '{settings.html}',
	        		children: [{
	        			text: '{settings.fullScreen.title}',
	        			content: '{settings.fullScreen.html}',
	        			leaf: true
	        		}, {
	        			text: '{settings.timeRef.title}',
	        			content: '{settings.timeRef.html}',
	        			leaf: true
	        		}, {
	        			text: '{settings.help.title}',
	        			content: '{settings.help.html}',
	        			leaf: true
	        		}, {
	        			text: '{settings.language.title}',
	        			content: '{settings.language.html}',
	        			leaf: true
	        		}]
	        		}, {	        			
					text: '{mapNavigation.title}',
					content: '{mapNavigation.html}',
					children: [{
						text: '{mapNavigation.zoomIn.title}',
						content: '{mapNavigation.zoomIn.html}',
						leaf: true
					}, {
						text: '{mapNavigation.zoomOut.title}',
						content: '{mapNavigation.zoomOut.html}',
						leaf: true
					}, {
						text: '{mapNavigation.initMapView.title}',
						content: '{mapNavigation.initMapView.html}',
						leaf: true
					}, {
						text: '{mapNavigation.openLegend.title}',
						content: '{mapNavigation.openLegend.html}',
						leaf: true
					}]
	        		}, {
	        		text: '{legend.title}',
	        		content: '{legend.html}',
		        	leaf: true	
	        		}, {
	        		text: '{geographicOverview.title}',
	        		content: '{geographicOverview.html}',
	        		leaf: true
	        		}]
		    }
	    }
    }
});
