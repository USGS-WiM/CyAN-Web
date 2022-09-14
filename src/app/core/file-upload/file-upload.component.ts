import { Component } from '@angular/core';
import { GraphSelectionsService } from 'src/app/shared/services/graph-selections.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-file-upload',
  templateUrl: 'file-upload.component.html',
  styleUrls: ['./../core.component.scss'],
})
export class FileUploadComponent {
  file: any;

  constructor(
    private graphSelectionsService: GraphSelectionsService,
    public snackBar: MatSnackBar
  ) {}

  // this code is adapted from: https://stackoverflow.com/questions/27979002/convert-csv-data-into-json-format-using-javascript
  //get the uploaded data
  uploadedFlags(e) {
    this.file = e.target.files[0];
    let fileReader = new FileReader();
    fileReader.onload = (e) => {
      let csv = fileReader.result;
      this.checkFile(csv);
    };
    fileReader.readAsText(this.file);
  }

  //ensure that the uploaded file matches the flag csv format
  checkFile(file) {
    //check file extension
    let filetype = this.file.type;
    if (filetype == 'text/csv') {
      //if file is a csv, check headers
      //if everything is good, process the flags
      let uploadedFlags = this.csvJSON(file);
      let correctHeaders = this.checkHeaders(uploadedFlags);
      if (correctHeaders == true) {
        this.snackBar.open('Upload successful!', 'OK', {
          duration: 4000,
          verticalPosition: 'top',
        });
        this.combineFlags(uploadedFlags);
      } else {
        //if headers aren't correct, show error message
        this.incorrectFileMessage();
      }
    }
    if (filetype !== 'text/csv') {
      //if file extension is not a csv, show warning message
      this.incorrectFileMessage();
    }
  }

  incorrectFileMessage() {
    //you must upload a correctly formatted csv
    this.snackBar.open(
      'Upload failed. Either your file is not a CSV or it does not have the correct headers.',
      'OK',
      {
        duration: 4000,
        verticalPosition: 'top',
      }
    );
  }

  //make the csv a json
  csvJSON(csv) {
    let lines = csv.split('\n');
    let uploadedFlags = [];
    let headers = lines[0].split(',');

    for (let i = 1; i < lines.length; i++) {
      let obj = {};
      let currentline = lines[i].split(',');
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentline[j];
      }
      uploadedFlags.push(obj);
    }
    return uploadedFlags;
  }

  checkHeaders(uploadedFlags) {
    //expected headers
    let expectedHeaders = [
      'rcode',
      'pcode',
      'mcode',
      'date_time_group',
      'sid',
      'latitude',
      'longitude',
      'result',
      'units',
      'region',
    ];
    //get uploaded headers
    let uploadedHeaders = Object.keys(uploadedFlags[0]);
    let matchingHeaders = true;
    if (!uploadedHeaders) {
      matchingHeaders = false;
    }
    for (let i = 0; i < uploadedHeaders.length; i++) {
      if (uploadedHeaders[i] !== expectedHeaders[i]) {
        matchingHeaders = false;
      }
    }
    return matchingHeaders;
  }

  combineFlags(uploadedFlags) {
    let userFlags;
    //get existing flags
    this.graphSelectionsService.flagsSubject.subscribe((flags) => {
      if (flags) {
        userFlags = flags;
      }
    });
    let allFlags;
    //combine new flags with uploaded flags into one json
    if (userFlags) {
      //if user has created new flags before uploading file, combine them
      allFlags = uploadedFlags.concat(userFlags);
    } else {
      //if user has not created new flags before uploading file, only use uploaded flags
      allFlags = uploadedFlags;
    }
    //update flag json in service so it can be used next time graph is generated
    this.graphSelectionsService.flagsSubject.next(allFlags);
    return allFlags;
  }
}
