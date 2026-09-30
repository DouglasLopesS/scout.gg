import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, timeout } from 'rxjs';
import { environment } from '../../environments/environment';
import type { Player, PlayerMatchesPage } from '../models/player.model';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private readonly http = inject(HttpClient);

  findByRiotId(gameName: string, tagLine: string): Observable<Player> {
    const name = encodeURIComponent(gameName.trim());
    const tag = encodeURIComponent(tagLine.trim());
    const url = `${environment.apiUrl}/player/${name}/${tag}`;
    return this.http.get<Player>(url).pipe(
      timeout(75_000)
    );
  }

  findMatches(puuid: string, start: number, count = 10): Observable<PlayerMatchesPage> {
    const id = encodeURIComponent(puuid);
    const url = `${environment.apiUrl}/player/${id}/matches`;
    return this.http.get<PlayerMatchesPage>(url, { params: { start, count } }).pipe(
      timeout(60_000)
    );
  }
}
