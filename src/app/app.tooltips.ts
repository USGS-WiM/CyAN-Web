import { Injectable } from '@angular/core';

@Injectable()
export class TOOLTIPS {

    // Tooltip config template:
    // public static get Tooltip(): string { return ''; }
    // The characters \n\n can be used to add a breakline to the tooltip
    
    // Graph Options Tooltips
    public static get disabledFlagButtonTooltip(): string { return 'No flags are currently selected. Create a graph and select flags to download them.'; }
    public static get clearFiltersTooltip(): string { return 'Clears graph and selected graph options. Any selected flags will remain selected.'; }
    
}