import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, debounceTime, switchMap, first } from 'rxjs/operators';
import { ProductService } from '../../core/services/product.service';

@Injectable({ providedIn: 'root' })
export class ProductNameValidator {
  constructor(private productService: ProductService) {}

  uniqueName(excludeId?: number): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      return new Observable(observer => {
        setTimeout(() => {
          this.productService.checkNameExists(control.value, excludeId).subscribe(exists => {
            observer.next(exists ? { nameTaken: true } : null);
            observer.complete();
          });
        }, 400);
      });
    };
  }
}
