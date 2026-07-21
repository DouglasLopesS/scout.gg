import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, timeout } from 'rxjs';
import { environment } from '../../environments/environment';
import type { Player } from '../models/player.model';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private readonly http = inject(HttpClient);

  findByRiotId(gameName: string, tagLine: string): Observable<Player> {
    const name = encodeURIComponent(gameName.trim());
    const tag = encodeURIComponent(tagLine.trim());
    const url = `${environment.apiUrl}/player/${name}/${tag}`;
    return this.http.get<Player>(url).pipe(
      timeout(20_000)
    );
  }
}
