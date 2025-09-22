import { Component, OnInit } from '@angular/core';
import { FormComponent } from '../../component/form/form.component';
import { FormSchema } from '../../interface/component/form/form.interface';
import { FORM_CANDIDATE_INPUTS } from '../../config/candidate-form/candidate-form.config';

@Component({
  selector: 'app-candidate-form',
  imports: [FormComponent],
  templateUrl: './candidate-form.component.html',
  styleUrl: './candidate-form.component.css',
  standalone: true,
})

export class CandidatePageComponent implements OnInit{

  formSchema: FormSchema[][] = FORM_CANDIDATE_INPUTS;
  
  constructor(){}
  ngOnInit(): void {}
}
