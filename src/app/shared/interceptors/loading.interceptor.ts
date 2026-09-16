import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
} from '@angular/common/http';

import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoaderService } from '@shared/services';

export const loadingInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const loader = inject(LoaderService);

  loader.show();

  return next(req).pipe(
    finalize(() => {
      loader.hide();
    })
  );
};
