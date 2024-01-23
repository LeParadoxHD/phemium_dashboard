import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Store } from '@ngxs/store';
import { BehaviorSubject, Subscription } from 'rxjs';
import { AddEdit } from 'src/app/interfaces';
import { ApiService } from 'src/app/services/api.service';
import { EnvironmentActions } from 'src/app/state/actions';
import { IEnvironment } from 'src/app/state/interfaces';
import { EnvironmentsState } from 'src/app/state/store';
import { slugify } from 'src/app/utilities';

@Component({
  selector: 'app-add-edit-environment',
  templateUrl: './add-edit-environment.component.html',
  styleUrls: ['./add-edit-environment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddEditEnvironmentComponent implements OnChanges, OnInit, OnDestroy {
  @Input() mode: AddEdit = 'add';
  @Input() data: Partial<IEnvironment> = null;

  @Output() close = new EventEmitter<void>();

  form: FormGroup;

  constructor(private _fb: FormBuilder, private _store: Store, private _api: ApiService) {
    this.form = this._fb.group(
      {
        env: ['', Validators.required],
        name: ['', Validators.compose([Validators.required, Validators.pattern(/^[a-zA-Z0-9_-\s]+$/)])],
        token_expiration: [0, Validators.required],
        login_user: ['', Validators.required],
        login_password: ['', Validators.required]
      },
      { validators: this.environmentValidator() }
    );
  }

  formSub: Subscription;
  ngOnInit() {
    this.formSub = this.form.valueChanges.subscribe((_) => this.connectionTest$.next(null));
  }

  environmentValidator(): ValidatorFn {
    return (group: FormGroup): ValidationErrors => {
      const name = (group.get('name').value as string).toLowerCase();
      const login_user = (group.get('login_user').value as string).toLowerCase();
      const envType = group.get('env').value;
      if ((name || login_user) && envType) {
        const environments = this._store.selectSnapshot(EnvironmentsState)[envType] as IEnvironment[];
        if (Array.isArray(environments)) {
          if (name && environments.find((env) => env.name.toLowerCase() === name && this.mode === 'add')) {
            group.get('name').setErrors({ name: true });
          } else {
            group.get('name').setErrors(null);
          }
          const env = environments.find((env) => env.login_user.toLowerCase() === login_user);
          if (env && (this.mode === 'add' || (this.mode === 'edit' && env.name !== this.data.name))) {
            group.get('login_user').setErrors({ login_user: true });
          } else {
            group.get('login_user').setErrors(null);
          }
        } else {
          group.get('name').setErrors(null);
          group.get('login_user').setErrors(null);
        }
      } else {
        group.get('name').setErrors(null);
        group.get('login_user').setErrors(null);
      }
      return null;
    };
  }

  ngOnDestroy() {
    this.formSub?.unsubscribe?.();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['mode']?.previousValue === 'edit' && changes['mode']?.currentValue === 'add') {
      this.form.patchValue({
        env: '',
        name: '',
        token_expiration: 0,
        login_user: '',
        login_password: ''
      });
    }
    if (this.mode === 'edit') {
      this.form.get('name').disable();
    } else {
      this.form.get('name').enable();
    }
    if (this.mode && this.data && typeof this.data === 'object' && this.form) {
      this.form.patchValue(this.data);
    }
    this.form.updateValueAndValidity();
    this.connectionTest$.next(null);
  }

  connectionTest$ = new BehaviorSubject<{ success: boolean; error?: string }>(null);
  connectionTestLoading$ = new BehaviorSubject<boolean>(false);

  add(test: boolean) {
    if (test) {
      this.connectionTestLoading$.next(true);
    }
    const values = this.form.getRawValue();
    values.slug = slugify(values.env) + '|' + slugify(values.name);
    const { login_user, login_password, token_expiration } = values;

    if (test) {
      this._api.request('login', 'login_customer', [login_user, login_password, token_expiration], values.env).subscribe((response) => {
        if (response.ok && response.body) {
          if (typeof response.body === 'string') {
            // Token retrieved
            this.connectionTest$.next({ success: true });
          } else if (typeof response.body === 'object') {
            const json = response.body as any;
            if (json.error) {
              this.connectionTest$.next({ success: false, error: json.message });
            }
          }
        }
        this.connectionTestLoading$.next(false);
      });
    } else {
      this._store.dispatch(new EnvironmentActions.AddEnvironment(values));
    }
  }

  edit() {
    const values = this.form.getRawValue();
    this._store.dispatch(
      new EnvironmentActions.EditEnvironment({
        ...values,
        slug: this.data.slug
      })
    );
  }
}
