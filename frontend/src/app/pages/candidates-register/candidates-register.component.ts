import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { finalize } from 'rxjs/operators';

import { CandidatesRegisterService } from '../../service/candidates-register.service';
import { Candidate } from '../../interface/pages/candidate/candidate.interface';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-candidates-register',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
  ],
  templateUrl: './candidates-register.component.html',
  styleUrl: './candidates-register.component.css'
})
export class CandidatesRegisterComponent implements OnInit {

  candidates: Candidate[] = [];
  loading = false;
  error: string | null = null;
  displayedColumns = ['name','surname','seniority','years','availability'];

  constructor(private CandidatesRegisterService: CandidatesRegisterService){}

  ngOnInit(): void {
    this.loadCandidates();
  }

  loadCandidates(): void {
    this.loading = true;
    this.error = null;

    this.CandidatesRegisterService.getCandidates()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (response: Candidate[]) => {
          this.candidates = response;
        },
        error: (err) => {
          this.error = err?.error?.message || 'Error obteniendo candidatos';
        }
      });
  }

  chipColor(s: any) { return s === 'senior' ? 'var(--chip-senior)' : 'var(--chip-junior)'; }

}
