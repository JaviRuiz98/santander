export type Seniority = 'junior' | 'senior';

export interface Candidate {
  name: string;
  surname: string;
  seniority: Seniority;
  years: number;
  availability: boolean;
}