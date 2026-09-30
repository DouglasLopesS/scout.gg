import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, shareReplay, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import type { MatchDetails } from '../models/match-details.model';
import type { RiotPlatform, RiotRegion } from '../shared/riot-routing';

@Injectable({ providedIn: 'root' })
export class MatchDetailsService {
  private readonly http = inject(HttpClient);
  private readonly cache = new Map<string, Observable<MatchDetails>>();

  findById(matchId: string, platform: RiotPlatform, region: RiotRegion): Observable<MatchDetails> {
    const key = `${platform}:${region}:${matchId}`;
    const cached = this.cache.get(key);
    if (cached) return cached;

    const request = this.http.get<MatchDetails>(
      `${environment.apiUrl}/matches/${encodeURIComponent(matchId)}`,
      { params: { platform } }
    ).pipe(
      catchError((error: unknown) => {
        this.cache.delete(key);
        return throwError(() => error);
      }),
      shareReplay({ bufferSize: 1, refCount: false })
    );

    this.cache.set(key, request);
    return request;
  }
}
