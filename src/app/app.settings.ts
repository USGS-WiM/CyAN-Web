import { Injectable } from '@angular/core';

@Injectable()
export class APP_SETTINGS {
  public static get wqDataURL() {
    return 'https://cyan.wim.usgs.gov/json_query_map';
  }
  public static get pcodeShortnameURL() {
    return 'https://cyan.wim.usgs.gov/get_pcode_shortname/';
  }
  public static get mcodeShortnameURL() {
    return 'https://cyan.wim.usgs.gov/get_mcode_shortname/';
  }
  public static get pcodeToMcodeURL() {
    return 'https://cyan.wim.usgs.gov/pcode_to_mcode/';
  }
  public static get regionListURL() {
    return 'https://cyan.wim.usgs.gov/region_list/';
  }
}
