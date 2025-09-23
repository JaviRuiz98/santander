import { Routes } from '@angular/router';
import { CandidatePageComponent } from './pages/candidate-form/candidate-form.component';
import { CandidatesRegisterComponent } from './pages/candidates-register/candidates-register.component';

export const routes: Routes = [
    { path: '', component: CandidatePageComponent },
    { path: 'candidates-register', component: CandidatesRegisterComponent }
];