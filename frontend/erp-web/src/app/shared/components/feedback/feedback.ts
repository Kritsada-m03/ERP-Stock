import { Component, input } from '@angular/core';
@Component({
  selector: 'app-feedback',
  template: `@if (error()) { <div class="alert error" role="alert">{{ error() }}</div> } @if (success()) { <div class="alert success" role="status">{{ success() }}</div> }`,
})
export class Feedback {
  readonly error = input('');
  readonly success = input('');
}
