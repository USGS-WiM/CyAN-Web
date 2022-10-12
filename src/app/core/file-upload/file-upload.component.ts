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
  userFlags: any;

  constructor(
    private graphSelectionsService: GraphSelectionsService,
    public snackBar: MatSnackBar
  ) {}

  //Check uploaded json against user-selected flags
  //A way to avoid this check would be to force user to upload flags before designating new flags
  checkDuplicates(uploadedFlags, userFlags) {
    for (let i = 0; i < uploadedFlags.length; i++) {
      for (let j = 0; j < userFlags.length; j++) {
        let uploaded = uploadedFlags[i];
        let user = userFlags[j];
        if (
          uploaded.rcode == user.rcode &&
          uploaded.pcode == user.pcode &&
          uploaded.mcode == user.mcode
        ) {
          userFlags.splice(j, 1);
        }
      }
    }
  }

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
      console.log('file is a csv');
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
      ///if file extension is not a csv, show warning message
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

    let numLines = lines.length;
    let numHeaders = headers.length;
    for (let i = 1; i < numLines; i++) {
      let obj = {};
      let currentLine = lines[i].split(',');
      for (let j = 0; j < numHeaders; j++) {
        obj[headers[j]] = currentLine[j];
      }
      uploadedFlags.push(obj);
    }
    return uploadedFlags;
  }

  uploadOneFile() {
    //user cannot select multiple files at the same time
    this.snackBar.open('Upload one file at a time.', 'OK', {
      duration: 4000,
      verticalPosition: 'bottom',
    });
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
      'flagType',
      'annotation',
    ];
    //get uploaded headers
    let uploadedHeaders = Object.keys(uploadedFlags[0]);
    let lenHeaders = uploadedHeaders.length;

    //If user opens csv and saves in Excel, there's an extra character added onto the last field name
    //Get the last field name
    let lastItem = uploadedHeaders[lenHeaders - 1];
    let lastItemLen = lastItem.length;
    //Get new field name to replace the uploaded one, if the initial check fails
    let formattedLastEntry = lastItem.slice(0, lastItemLen - 1);
    let matchingHeaders = true;

    //Ensure that the uploaded file has headers
    if (!uploadedHeaders) {
      matchingHeaders = false;
    }
    for (let i = 0; i < uploadedHeaders.length; i++) {
      if (uploadedHeaders[i] !== expectedHeaders[i]) {
        //If the header doesn't match the expected header, check if it matches after using the header formatted to account for Excel error
        if (formattedLastEntry == expectedHeaders[i]) {
          uploadedHeaders[i] = formattedLastEntry;
        } else {
          matchingHeaders = false;
        }
      }
    }
    return matchingHeaders;
  }

  combineFlags(uploadedFlags) {
    //get existing flags
    this.graphSelectionsService.flagsSubject.subscribe((flags) => {
      if (flags) {
        this.userFlags = flags;
      }
    });
    let allFlags;
    //combine new flags with uploaded flags into one json
    if (this.userFlags) {
      this.checkDuplicates(uploadedFlags, this.userFlags);
      //if user has created new flags before uploading file, combine them
      allFlags = uploadedFlags.concat(this.userFlags);
    } else {
      //if user has not created new flags before uploading file, only use uploaded flags
      allFlags = uploadedFlags;
    }
    //update flag json in service so it can be used next time graph is generated
    this.graphSelectionsService.flagsSubject.next(allFlags);
    return allFlags;
  }
}
