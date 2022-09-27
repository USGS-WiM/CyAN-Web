# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased](https://github.com/USGS-WiM/stnweb2/tree/dev)

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

### Changed

- Removes extra modebar buttons

### Fixed

- User can now upload a second flag file with no errors
- Graph no longer loses visual flags when browser window is resized
