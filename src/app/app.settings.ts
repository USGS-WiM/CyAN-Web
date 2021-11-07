import { Injectable } from '@angular/core';

@Injectable()
export class APP_SETTINGS {
  public static get wqDataURL() {
    return 'http://127.0.0.1:5005/json_query';
  }
  public static get pcodeShortnameURL() {
    return 'http://127.0.0.1:5005/get_pcode_shortname/';
  }
  public static get mcodeShortnameURL() {
    return 'http://127.0.0.1:5005/get_mcode_shortname/';
  }
  public static get pcodeToMcodeURL() {
    return 'http://127.0.0.1:5005/pcode_to_mcode/';
  }
  public static get regionListURL() {
    return 'http://127.0.0.1:5005/region_list/';
  }
}
