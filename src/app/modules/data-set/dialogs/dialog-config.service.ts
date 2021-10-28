import { Injectable } from "@angular/core";
import { MatDialogConfig } from "@angular/material/dialog";

@Injectable({
providedIn: 'root'
})
export class DialogConfigService {
    public static setDialogConfig(height: string, width: string, data?: any): MatDialogConfig<any> {
        let dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.height = height;
        dialogConfig.width = width;
        dialogConfig.data = data;
        return dialogConfig;
      }
}