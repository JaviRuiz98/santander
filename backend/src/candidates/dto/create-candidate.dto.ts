import { IsString, MinLength } from 'class-validator';

export class CreateCandidateDto {
  @IsString() @MinLength(1)
  name!: string;

  @IsString() @MinLength(1)
  surname!: string;
}

export type Seniority = 'junior' | 'senior';

export interface Candidate {
  id: string;
  name: string;
  surname: string;
  seniority: Seniority;
  years: number;
  availability: boolean;
}
