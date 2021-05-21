import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';

import { CollectionFactoryComponent } from '../modals/collection-factory/collection-factory.component';
import { CommonAPIResult } from '../database/api.interfaces';
import { DatabaseService } from '../database/database.service';


@Component({
  selector: 'app-collections',
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.scss']
})
export class CollectionsComponent implements OnInit {

  public collections: Array<any>;

  constructor(
    private db: DatabaseService,
    private dialog: MatDialog,
    private router: Router,
    private _snackBar: MatSnackBar,
  ) {
    this.getCollections();
  }

  async ngOnInit(): Promise<void> {
  }

  public openCollectionFactory() {
    const dialogRef = this.dialog.open(CollectionFactoryComponent, {
      width: '500px',
    });

    dialogRef.afterClosed().subscribe( async () => {
      console.log('The Collection Factory was closed');
      this.getCollections();
    });
  }

  //Get the collection list from the database.
  public getCollections() {
    this.db.getCollections().subscribe(
      data => {
        this.collections = data.body;
        this.setCovers();
      },
      err => {
        console.log(`List failed to get \n Error: ${err.error}`)
        this.collections = [];
      }
    );
  }

  //Fetches the cover images for each manga in every collection.
  private setCovers() {
    for(let i=0; i<this.collections.length; i++) {
      for(let k=0; k<this.collections[i].mangas.length; k++) {
        this.db.getManga(this.collections[i].mangas[k].title).subscribe(
          data => {
            let d = data.body;
            this.collections[i].mangas[k].cover = d.data.cover;
          }
        );
      }
    }
  }

  //Delete a collection by ID.
  public deleteCol(id: string) {
    let r: CommonAPIResult;
    this.db.deleteCollection(id).subscribe(
      data => {
        r = data.body;
        if (r.status == 'success'){
          this.openSnackBar('Collection has been deleted', 'Great');
          this.getCollections();
        }
        else
          this.openSnackBar('Collection failed to delete', 'Damn.');
      },
      err => {
        r = err.error;
        if (r.status != 'success')
          this.openSnackBar(r.message, 'Damn.');
        else
          console.log(`err caught but status was declared as ${r.status}`)
      }
    )
  }

  private openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
    });
  }

}

/*
  Todo for collection page:
    - List out collections better
*/
