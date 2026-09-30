import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, timeout } from 'rxjs';
import { environment } from '../../environments/environment';
import type { Player, PlayerMatchesPage } from '../models/player.model';
import type { RiotPlatform } from '../shared/riot-routing';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private readonly http = inject(HttpClient);

  findByRiotId(gameName: string, tagLine: string, platform: RiotPlatform): Observable<Player> {
    const name = encodeURIComponent(gameName.trim());
    const tag = encodeURIComponent(tagLine.trim());
    const url = `${environment.apiUrl}/player/${name}/${tag}`;
    return this.http.get<Player>(url, { params: { platform } }).pipe(
      timeout(75_000)
    );
  }

  findMatches(puuid: string, start: number, platform: RiotPlatform, count = 10): Observable<PlayerMatchesPage> {
    const id = encodeURIComponent(puuid);
    const url = `${environment.apiUrl}/player/${id}/matches`;
    return this.http.get<PlayerMatchesPage>(url, { params: { start, count, platform } }).pipe(
      timeout(60_000)
    );
  }
}
