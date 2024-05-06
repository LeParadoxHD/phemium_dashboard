import { animate, style, transition, trigger } from '@angular/animations';

export const ErrorAnimation = trigger('error', [
  transition(':enter', [
    style({ 'max-height': 0, opacity: 0 }),
    animate('.2s ease-in-out', style({ 'max-height': '25px', opacity: 1 }))
  ]),
  transition(':leave', [
    style({ 'max-height': '25px', opacity: 1 }),
    animate('.2s ease-in-out', style({ 'max-height': 0, opacity: 0 }))
  ])
]);
