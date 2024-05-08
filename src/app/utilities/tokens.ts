import { HttpContextToken } from '@angular/common/http';

export const INTERNAL_REQUEST = new HttpContextToken(() => false);
