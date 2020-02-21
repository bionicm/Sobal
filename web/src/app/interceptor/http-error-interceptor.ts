import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { retryWhen, flatMap, delay } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
    // retry count does not include the first try.
    private readonly retryCount = 3;
    private readonly retryStatusCodes = [504];
    private readonly retryWait = 1000; // ms

    constructor() { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const request = req.clone();
        if (request.url.match(environment.apiUrl)) {
            return next.handle(request).pipe(
                retryWhen(errors => this.retryStrategy(errors))
            );
        } else {
            // assets.
            return next.handle(request);
        }
    }

    private retryStrategy(errors: Observable<any>) {
        return errors.pipe(
            flatMap((res, i) => {
                if (this.retryStatusCodes.findIndex(n => n === res.status) >= 0 ) {
                    if (i < this.retryCount) {
                        return of(res);
                    }
                }
                return throwError(res);
            }),
            delay(this.retryWait)
        );
    }
}
