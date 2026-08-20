import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";

@Injectable({
  providedIn: "root",
})
export class SnackBarService {
  constructor(private _snackBar: MatSnackBar) { }

  Success(message: string, duration: number = 2000) {
    this._snackBar.open(message, "Close", {
      duration: duration,
      panelClass: "success-snackbar",
      horizontalPosition: "end",
      verticalPosition: "top",
    });
  }

  Error(message: string, duration: number = 2000) {
    this._snackBar.open(message, "Close", {
      duration: duration,
      panelClass: "error-snackbar",
      horizontalPosition: "end",
      verticalPosition: "top",
    });
  }

  Info(message: string, duration: number = 2000) {
    this._snackBar.open(message, "Close", {
      duration: duration,
      panelClass: "info-snackbar",
      horizontalPosition: "end",
      verticalPosition: "top",
    });
  }

  Warning(message: string, duration: number = 2000) {
    this._snackBar.open(message, "Close", {
      duration: duration,
      panelClass: "warning-snackbar",
      horizontalPosition: "end",
      verticalPosition: "top",
    });
  }
}

