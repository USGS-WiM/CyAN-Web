import { Injectable } from '@angular/core';

@Injectable()
export class APP_SETTINGS {
  public static get wqPoints() {
    return 'http://127.0.0.1:5006/pcode_by_loci/';
  }
}
