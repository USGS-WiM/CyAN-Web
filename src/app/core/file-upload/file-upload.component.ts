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

  fileChanged(e) {
    this.file = e.target.files[0];
    let fileReader = new FileReader();
    fileReader.onload = (e) => {
      console.log(fileReader.result);
    };
    console.log(fileReader.readAsText(this.file));
  }
}
