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
  public static flagTypes() {
    let flagTypes = [
      {
        short_name: 'Central tendency',
        description:
          'Deviation from central tendency or expected relation relative to balance of data by other methods',
      },
      { short_name: 'Outlier', description: 'Potential Individual outlier' },
      {
        short_name: 'Matrix or recovery problem',
        description: 'Potential matrix interference or recovery problem',
      },
      {
        short_name: 'Dissolved result > Total',
        description:
          'Dissolved result is greater than Total results with consideration of precision and accuracy for the method',
      },
      {
        short_name: 'Phytoplankton vs Chl',
        description:
          'Phytoplankton concentration is not in proper proportion to Chlorophyll-a or Total Chlorophyll',
      },
      { short_name: 'Unknown', description: 'Unknown issues' },
    ];
    return flagTypes;
  }
  public static sampleFlags() {
    let sampleFlags = [
      {
        rcode: 'DELETE_THIS_ROW_R15e',
        pcode: 'EXAMPLE_P12',
        date_time_group: 'EXAMPLE_1439470800000',
        sid: 'EXAMPLE_S1c1',
        latitude: 41.8292,
        longitude: -83.3739,
        result: 2.66,
        units: 'micrograms per liter',
        region: 'Lake Erie',
        flagType: 'Central tendency; Outlier',
        annotation: 'type custom annotation here',
      },
    ];
    return sampleFlags;
  }
  public static resultsKey() {
    let resultsKey = [
      {
        attribute: 'rcode',
        explanation: 'result code',
      },
      {
        attribute: 'pcode',
        explanation: 'parameter code',
      },
      {
        attribute: 'mcode',
        explanation: 'method code',
      },
      {
        attribute: 'date_time_group',
        explanation: 'date time group',
      },
      {
        attribute: 'sid',
        explanation: 'site ID',
      },
      {
        attribute: 'latitude',
        explanation: 'latitude at sample site',
      },
      {
        attribute: 'longitude',
        explanation: 'longitude at sample site',
      },
      {
        attribute: 'result',
        explanation: 'result',
      },
      {
        attribute: 'units',
        explanation: 'units',
      },
      {
        attribute: 'region',
        explanation: 'region',
      },
      {
        attribute: 'parameterName',
        explanation: 'abbreviated parameter name',
      },
      {
        attribute: 'methodName',
        explanation: 'abbreviated method name',
      },
      {
        attribute: 'date_formatted',
        explanation: 'date_time_group converted to mm/dd/yyyy HH:mm:ss',
      },
    ];
    return resultsKey;
  }
}
