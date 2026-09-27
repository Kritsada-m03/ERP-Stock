import { Directive, forwardRef, input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { CustomerField, customerFieldError } from './customer-validation';

@Directive({
  selector: '[appCustomerField]',
  providers: [{ provide: NG_VALIDATORS, useExisting: forwardRef(() => CustomerFieldDirective), multi: true }],
})
export class CustomerFieldDirective implements Validator {
  readonly appCustomerField = input.required<CustomerField>();
  validate(control: AbstractControl): ValidationErrors | null {
    const message = customerFieldError(this.appCustomerField(), control.value);
    return message ? { customer: message } : null;
  }
}
