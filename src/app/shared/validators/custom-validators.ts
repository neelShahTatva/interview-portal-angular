import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  
  /**
   * Validates that a FormArray contains a minimum number of items.
   * @param min The minimum required length of the array.
   */
  static minLengthArray(min: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      // If it's an array and the length is less than the minimum, return an error
      if (control.value instanceof Array && control.value.length < min) {
        return { minLengthArray: { requiredLength: min, actualLength: control.value.length } };
      }
      return null; // Valid!
    };
  }
  
}