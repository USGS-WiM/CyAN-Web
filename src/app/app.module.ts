import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreComponent } from './core/core.component';
import { MapComponent } from './core/map/map.component';
import { MapOptionsComponent } from './core/map-options/map-options.component';
import { GraphOptionsComponent } from './core/graph-options/graph-options.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatAutocompleteModule, } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AboutComponent } from './core/about/about.component';
import { HomeComponent } from './core/home/home.component';
import { MatSliderModule } from '@angular/material/slider';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FileUploadComponent } from './core/file-upload/file-upload.component';
import { IntroComponent } from './core/intro/intro.component';
import { ConfirmFlagsComponent } from './core/confirm-flags/confirm-flags.component';

@NgModule({
  declarations: [
    AppComponent,
    CoreComponent,
    MapComponent,
    MapOptionsComponent,
    GraphOptionsComponent,
    AboutComponent,
    HomeComponent,
    FileUploadComponent,
    IntroComponent,
    ConfirmFlagsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatIconModule,
    MatSliderModule,
    NgxSliderModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTooltipModule,
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatInputModule,
    MatRadioModule,
    MatAutocompleteModule,
    MatChipsModule,
    ScrollingModule,
    HttpClientModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
  providers: [MatSnackBar],
  bootstrap: [AppComponent],
})
export class AppModule {}
