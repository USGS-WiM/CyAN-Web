import { Injectable } from '@angular/core';
import { Observable, pipe ,  Observer } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { CanDeactivate,
         ActivatedRouteSnapshot,
         RouterStateSnapshot } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmFlagsComponent } from '../confirm/confirm-flags.component';
import { GraphOptionsComponent } from '../graph-options/graph-options.component';


@Injectable({
  providedIn: 'root',
})
export class CanDeactivateGuard implements CanDeactivate<GraphOptionsComponent> {

  confirmDialogRef: MatDialogRef<ConfirmFlagsComponent>;
  constructor(public publicDialog: MatDialog) { }

  canDeactivate(
    component: GraphOptionsComponent,
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean | Promise<boolean> | boolean {

    // Get the current URL
    console.log(state.url);

    // Allow synchronous navigation (`true`) if no crisis or the crisis is unchanged
    if (!component.axisFlagForm.touched) {

      return true;
    }
    // observable which resolves to true or false when the user decides
    // below commented out return is alternate method using a dialog service to create a window notification
    // return component.dialogService.confirm('Discard changes?');
    return Observable.create((observer: Observer<boolean>) => {
      this.confirmDialogRef = this.publicDialog.open(ConfirmFlagsComponent, {
        data: {
          title: 'Are you sure you want to leave?',
          message: 'Any data entered into the form will be lost.',
          showCancelButton: true,
          confirmButtonText: 'Leave this page',
        }
      });

      // resets the boolean observable for the dialog after closing
      this.confirmDialogRef.afterClosed().subscribe(result => {
        observer.next(result);
        observer.complete();
      }, (error) => {
        observer.next(false);
        observer.complete();
      });
    });
  }
}
