import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { LibraryComponent } from './library/library.component';
import { CollectionsComponent } from './collections/collections.component';
import { EditMangaComponent } from './modals/edit-manga/edit-manga.component';
import { UploadMangaComponent } from './modals/upload-manga/upload-manga.component';
import { ReadComponent } from './read/read.component';
import { CollectionFactoryComponent } from './modals/collection-factory/collection-factory.component';
import { CollectionCardComponent } from './components/collection-card/collection-card.component';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatMenuModule} from '@angular/material/menu';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { BookCardComponent } from './components/book-card/book-card.component';





@NgModule({
  declarations: [
    AppComponent,
    LibraryComponent,
    CollectionsComponent,
    EditMangaComponent,
    UploadMangaComponent,
    ReadComponent,
    CollectionFactoryComponent,
    CollectionCardComponent,
    BookCardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    HttpClientModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatCardModule,
    MatGridListModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatMenuModule,
    MatCheckboxModule
  ],
  providers: [
    LibraryComponent,
    CollectionsComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
