import { Injectable } from '@angular/core';

@Injectable()
export class APP_SETTINGS {
  public static get wqPoints() {
    let latLngData = [
      {
        sid: 'S1',
        latitude: 41.8292,
        longitude: -83.3739,
        date_time_group: '2014-08-04 15:30:00+00:00',
      },
      {
        sid: 'S2',
        latitude: 41.8292,
        longitude: -83.3739,
        date_time_group: '2015-08-04 15:30:00+00:00',
      },
      {
        sid: 'S3',
        latitude: 41.8793,
        longitude: -83.317,
        date_time_group: '1990-08-04 15:30:00+00:00',
      },
      {
        sid: 'S4',
        latitude: 41.8793,
        longitude: -83.317,
        date_time_group: '1970-08-04 15:30:00+00:00',
      },
      {
        sid: 'S5',
        latitude: 41.9145,
        longitude: -83.2743,
        date_time_group: '2010-08-04 15:30:00+00:00',
      },
      {
        sid: 'S6',
        latitude: 41.9145,
        longitude: -83.2743,
        date_time_group: '2013-08-04 15:30:00+00:00',
      },
      {
        sid: 'S7',
        latitude: 41.9518,
        longitude: -83.2146,
        date_time_group: '2014-08-04 15:30:00+00:00',
      },
    ];
    return latLngData;
  }
  public static get wqPoints2() {
    return 'http://127.0.0.1:5005/pcode_by_loci/';
  }
}
