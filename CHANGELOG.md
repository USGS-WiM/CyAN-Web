# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased](https://github.com/USGS-WiM/CyAN-Web/tree/dev)

### Added

- Text to graph stating exlcuded count
- Text to generating graph section of userguide
- Adds accessibility features: tab in About modal and high contrast mode
- Adds format date to csv downloads
- Adds CSV download for interpreting results column headers
- Adds lat/lng coordinates on cursor move
- Adds database selection
- Adds formatting for new mcode and pcode fields
- Adds additional links to the FAQ
- Adds option for accessible forms
- Adds version number
- Adds support for keyboard navigation

### Changed

- Changes autotick to true for log scale
- Replace pcode with short name in map popups
- Removes null checkbox and related code
- Layout edits
- Prevents map data with `minimum_reporting_value` of < from being mapped

### Fixed

- Prevents user from switching flag selection while flag model is open
- Formats database name in metadata download; removes console error on graph clear
- Populates method list in map correctly when parameter has multiple methods
- Fixes mean value in map pop-up

## [v1.0.0](https://github.com/USGS-WiM/CyAN-Web/releases/tag/v1.0.0-beta) - 2022-11-02

### Added

- Example graph
- Placeholders for graph options
- Template to put map layers later
- Placeholders for map filter options
- About template
- Landing view
- Map options
- Graph options
- Map marker clusters
- WIM favicon
- Disable graph options while graph is loading
- Disable flag/download buttons when there are no data to download
- Simple popup on clustermarker click
- Auto-deploy to test site on push to `dev` branch
- Autocomplete and chiplist to Map parameters input
- Autocomplete to Graph X,Y parameter inputs
- Plotly lasso select tools works to create flags
- Includes option for user to designate flag types
- CSV download of points plotted on map
- CSV download of flag types added to metadata download
- Ability to add annotation in flag option modal
- Checkbox to use map option min/max years in graph options
- USGS header and footer
- Filler landing page that corresponds with the CyAN button
- Ability to select/deselect x-axis flag types for y-axis
- Auto-checks flag types and annotations
- Option for users to auto-fill y-axis flag types with their x-axis selections
- 'Next' button in flag modal is disabled when neither axis is selected
- Graph legend
- USGS disclaimer & FAQ
- User's Guide
- Metadata section with CSV downloads in user's guide
- Stores flag data in local storage which gives user option to use them after closing tab
- Browser warning when refreshing or closing tab on graph tab
- Guidance/changes related to accessibility
- Clear Filters button for Graph
- Clear Map button for Map
- Tooltips to Clear Filters and Download Flags buttons on graph page
- Inline Ability to clear X and Y parameters on graph page

### Changed

- Removes extra modebar buttons
- Moves flag buttons into modebar
- New colors for nav buttons; selected btn changes color
- Responsive resizing to account for top bars
- Prevents user interaction with graph when Flag Options modal is open
- Separates x and y axes in flag modal
- Clears previous graph each time 'Create Graph' is clicked regardless of whether or no data are returned
- Flag modal resizing
- Lasso works to click on a single point
- Changes look of landing page and About modal buttons
- Changes size and transparency of unflagged points to help identify overlapping points
- Put units on second line in graph axis titles

### Fixed

- User can now upload a second flag file with no errors
- Graph no longer loses visual flags when browser window is resized
- Flag all button now uses same data flow as all the other flagging options
- Fixes metadata pcode
- Resets unflag status
- Removes old home layout from html
- USWDS broken images in deployments
- Fixes ability to interact with map
- Map disabled on all views except Map
- CSV upload works when user saves file in Excel
- Waits to rescale plot until after flag selections are submitted
- In flag modal, 'Next' button changes to 'Submit' when both axes are unchecked
- Reset point size and border arrays when new graph is generated
- Horizontal scroll bar appearing and scrolling to white space
- Submit button appears on lasso select before x/y checkboxes are selected
- Mat-chips going outside of sidebar
- Corrected axis label
