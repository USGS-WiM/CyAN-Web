import { Component } from '@angular/core';
import { GraphSelectionsService } from 'src/app/shared/services/graph-selections.service';

@Component({
  selector: 'app-file-upload',
  templateUrl: 'file-upload.component.html',
  styleUrls: ['./../core.component.scss'],
})
export class FileUploadComponent {
  file: any;

  constructor(private graphSelectionsService: GraphSelectionsService) {}

  // this code is adapted from: https://stackoverflow.com/questions/27979002/convert-csv-data-into-json-format-using-javascript
  //get the uploaded data
  uploadedFlags(e) {
    this.file = e.target.files[0];
    let fileReader = new FileReader();
    fileReader.onload = (e) => {
      let csv = fileReader.result;
      this.csvJSON(csv);
    };
    fileReader.readAsText(this.file);
  }

  //make the csv a json
  csvJSON(csv) {
    var lines = csv.split('\n');
    var uploadedFlags = [];
    var headers = lines[0].split(',');

    for (var i = 1; i < lines.length; i++) {
      var obj = {};
      var currentline = lines[i].split(',');
      for (var j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentline[j];
      }
      uploadedFlags.push(obj);
    }
    let userFlags;
    //get existing flags
    this.graphSelectionsService.flagsSubject.subscribe((flags) => {
      if (flags) {
        userFlags = flags;
      }
    });

    //combine new flags with uploaded flags into one json
    let allFlags = uploadedFlags.concat(userFlags);
    //update flag json in service so it can be used next time graph is generated
    this.graphSelectionsService.flagsSubject.next(allFlags);
    return allFlags;
  }
}
