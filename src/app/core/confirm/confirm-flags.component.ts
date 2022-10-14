import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { GraphSelectionsService } from '../../shared/services/graph-selections.service';

@Component({
  selector: 'app-confirm-flags',
  templateUrl: './confirm-flags.component.html',
  styleUrls: ['./confirm-flags.component.scss']
})
export class ConfirmFlagsComponent implements OnInit {


  constructor(
    private graphSelectionsService: GraphSelectionsService,
  ) { }

  ngOnInit() {
  }

  clearFlags() {
    localStorage.removeItem('cyanFlags');
    localStorage.removeItem("tempP_X");
    localStorage.removeItem("tempP_Y");
    localStorage.removeItem("tempM_X");
    localStorage.removeItem("tempM_Y");
  }

  repopulateGraphFlags(){
    this.graphSelectionsService.sendFlagConfirmClickEvent();
  }

}
