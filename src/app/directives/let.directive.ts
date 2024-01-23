import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  EmbeddedViewRef
} from '@angular/core';

/**
 * Custom Directive to dynamicly assign calculated value to a static value context
 */
@Directive({ selector: '[ngLet]' })
export class NgLetDirective<T = unknown> {
  private _context: NgLetContext<T> = new NgLetContext<T>();
  private _thenTemplateRef: TemplateRef<NgLetContext<T>> | null = null;
  private _thenViewRef: EmbeddedViewRef<NgLetContext<T>> | null = null;

  constructor(
    private _viewContainer: ViewContainerRef,
    templateRef: TemplateRef<NgLetContext<T>>
  ) {
    this._thenTemplateRef = templateRef;
  }

  /**
   * The Boolean expression to evaluate as the condition for showing a template.
   */
  @Input()
  set ngLet(condition: T) {
    this._context.$implicit = this._context.ngLet = condition;
    this._updateView();
  }

  /**
   * A template to show if the condition expression evaluates to true.
   */
  @Input()
  set ngLetThen(templateRef: TemplateRef<NgLetContext<T>> | null) {
    this._thenTemplateRef = templateRef;
    this._thenViewRef = null; // clear previous view if any.
    this._updateView();
  }

  private _updateView() {
    if (!this._thenViewRef) {
      this._viewContainer.clear();
      if (this._thenTemplateRef) {
        this._thenViewRef = this._viewContainer.createEmbeddedView(
          this._thenTemplateRef,
          this._context
        );
      }
    }
  }

  public static ngLetUseIfTypeGuard: void;

  static ngTemplateGuard_ngLet: 'binding';

  static ngTemplateContextGuard<T>(
    dir: NgLetDirective<T>,
    ctx: any
  ): ctx is NgLetContext<Exclude<T, false | 0 | '' | null | undefined>> {
    return true;
  }
}

/**
 * @publicApi
 */
export class NgLetContext<T = unknown> {
  public $implicit: T = null!;
  public ngLet: T = null!;
}
