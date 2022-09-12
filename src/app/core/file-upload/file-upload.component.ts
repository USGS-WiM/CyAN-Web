import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/compiler/src/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-file-upload',
  templateUrl: 'file-upload.component.html',
  styleUrls: ['./../core.component.scss'],
})
export class FileUploadComponent {
  file: any;

  constructor(private http: HttpClient) {}

  uploadedFlags(e) {
    this.file = e.target.files[0];
    let fileReader = new FileReader();
    fileReader.onload = (e) => {
      let csv = fileReader.result;
      this.csvJSON(csv);
    };
  }

  csvJSON(csv) {
    console.log('csv', csv);
    var lines = csv.split('\n');

    var result = [];

    // NOTE: If your columns contain commas in their values, you'll need
    // to deal with those before doing the next step
    // (you might convert them to &&& or something, then covert them back later)
    // jsfiddle showing the issue https://jsfiddle.net/
    var headers = lines[0].split(',');

    for (var i = 1; i < lines.length; i++) {
      var obj = {};
      var currentline = lines[i].split(',');

      for (var j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentline[j];
      }

      result.push(obj);
    }

    //return result; //JavaScript object
    return JSON.stringify(result); //JSON
  }
}
