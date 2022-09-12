import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/compiler/src/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-file-upload',
  templateUrl: 'file-upload.component.html',
  styleUrls: ['./../core.component.scss'],
})
export class FileUploadComponent {
  fileName = '';

  constructor(private http: HttpClient) {}

  onFileSelected(event) {
    //Commenting out for now; need to get a way to get data from uploaded file
    /* const file: File = event.target.files[0];

    if (file) {
      this.fileName = file.name;

      const formData = new FormData();

      formData.append('thumbnail', file);

      const upload$ = this.http.post('/api/thumbnail-upload', formData);

      upload$.subscribe();
    } */
  }
}
