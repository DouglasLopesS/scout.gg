import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, shareReplay, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import type { MatchDetails } from '../models/match-details.model';

@Injectable({ providedIn: 'root' })
export class MatchDetailsService {
  private readonly http = inject(HttpClient);
  private readonly cache = new Map<string, Observable<MatchDetails>>();

  findById(matchId: string): Observable<MatchDetails> {
    const cached = this.cache.get(matchId);
    if (cached) return cached;

    const request = this.http.get<MatchDetails>(
      `${environment.apiUrl}/matches/${encodeURIComponent(matchId)}`
    ).pipe(
      catchError((error: unknown) => {
        this.cache.delete(matchId);
        return throwError(() => error);
      }),
      shareReplay({ bufferSize: 1, refCount: false })
    );

    this.cache.set(matchId, request);
    return request;
  }
}
