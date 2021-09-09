import { Injectable } from '@angular/core';
import { MatDialogConfig } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor() { }

  public static setAnnotatorId(annotatorId: number) {
    sessionStorage.setItem('annotatorId', annotatorId.toString());
  }

  public static getAnnotatorId(): number {
    let annotatorId = sessionStorage.getItem('annotatorId');
    return annotatorId ? +annotatorId! : 0;
  }

  public static setDialogConfig(height: string, width: string, data?: any): MatDialogConfig<any> {
    let dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.height = height;
    dialogConfig.width = width;
    dialogConfig.data = data;
    return dialogConfig;
  }

  public static includesNoCase(includes: string, included: string): boolean {
    return includes.toLowerCase().includes(included.toLowerCase());
  }
}
