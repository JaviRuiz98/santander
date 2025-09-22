import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators, ValidatorFn } from '@angular/forms';
import { FormSchema } from '../../interface/component/form/form.interface';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})

export class FormComponent implements OnChanges {
  @Input() form: FormSchema[][] = [];
  @Output() onSubmitEmitter = new EventEmitter<FormData>();

  registerForm: FormGroup;
  file: File | null = null;

  constructor(private fb: FormBuilder) {
    this.registerForm = this.fb.group({});
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['form']) this.buildFormFromSchema(); 
  }

  private buildFormFromSchema(): void {
    const group: { [key: string]: FormControl } = {};

    for (const row of this.form) {
      for (const item of row) {
        item.fields.forEach((fieldName, i) => {
          const type = item.type?.[i] ?? item.type?.[0];
          if (!fieldName || type === 'header' || type === 'button') return;

          const validators: ValidatorFn[] = [];
          if (item.validators?.[i]) validators.push(Validators.required);
          group[fieldName] = new FormControl<string | null>('', validators);
        });
      }
    }
    this.registerForm = this.fb.group(group);
  }

  getGridStyle(row: any[]): { [key: string]: string } {
    const totalColumns = row.reduce((sum, item) => sum + this.getItemSpan(item), 0);
    return {
      display: 'grid',
      'grid-template-columns': `repeat(${totalColumns}, 1fr)`,
      gap: '1rem'
    };
  }

  getItemSpan(item: any): number {
    return item.span || item.fields?.length || 1;
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const f = input.files?.[0] ?? null;

    if (f && !/\.(xlsx|xls)$/i.test(f.name)) {
      this.file = null;
      alert('El archivo debe ser .xlsx o .xls');
      return;
    }

    this.file = f;
  }

  onSubmit() {
    if (this.registerForm.valid) this.onSubmitEmitter.emit(this.registerForm.value);
  }
}
