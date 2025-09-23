import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { FormComponent } from '../../component/form/form.component';
import { FormSchema } from '../../interface/component/form/form.interface';
import { FORM_CANDIDATE_INPUTS } from '../../config/candidate-form/candidate-form.config';
import { CandidateService } from '../../service/cadidate-form.service';
import { IGenericResponse } from '../../interface/generic/IGenericResponse.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-candidate-form',
  imports: [FormComponent, CommonModule],
  templateUrl: './candidate-form.component.html',
  styleUrl: './candidate-form.component.css',
  standalone: true,
})

export class CandidatePageComponent implements OnInit {
  
  formSchema: FormSchema[][] = FORM_CANDIDATE_INPUTS;

  loading: boolean = false;
  showThanks: boolean = false;

  thanksText: string = '';

  constructor(private CandidateService: CandidateService) {}

  ngOnInit(): void {}

  onSubmit(event: FormData) {
    this.loading = true;
    this.CandidateService.newCandidate(event).pipe(finalize(() => (this.loading = false))).subscribe({
      next: (response: IGenericResponse & { name?: string; surname?: string }) => {
        this.thanksText = `¡Gracias, ${response.name}! Hemos recibido tu candidatura.`
        this.showThanks = true;
        setTimeout(() => (this.showThanks = false), 4000);
      },
      error: (error) => {
        console.error('Error', error);
      },
    });
  }
}