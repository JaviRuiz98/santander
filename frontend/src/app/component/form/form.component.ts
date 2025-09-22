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
  isDragOver = false;

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
          if (!fieldName || type === 'header' || type === 'button' || type === 'submit' || type === 'action') return;
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
      input.value = '';
      return;
    }
    this.file = f;
  }

  onDragOver(evt: DragEvent) {
    evt.preventDefault(); 
    this.isDragOver = true;
  }
  onDragLeave() {
    this.isDragOver = false;
  }
  onDrop(evt: DragEvent) {
    evt.preventDefault();
    this.isDragOver = false;

    const f = evt.dataTransfer?.files?.[0] ?? null;
    if (!f) return;

    if (!/\.(xlsx|xls)$/i.test(f.name)) {
      this.file = null;
      alert('El archivo debe ser .xlsx o .xls');
      return;
    }
    this.file = f;
  }

  clearFile(input?: HTMLInputElement) {
    this.file = null;
    if (input) input.value = '';
  }

  private slugify(s: string): string {
    return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  private stamp(): string {
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
  }

  onSubmit() {
    if (this.registerForm.invalid) return;
    const fd = new FormData();

    Object.entries(this.registerForm.value).forEach(([k, v]) => {
      if (v !== null && v !== undefined && String(v).trim() !== '') {
        fd.append(k, String(v));
      }
    });

    if (this.file) {
      const name = (this.registerForm.get('name')?.value as string) || '';
      const surname = (this.registerForm.get('surname')?.value as string) || '';
      const customName = `candidate_${this.slugify(name)}_${this.slugify(surname)}_${this.stamp()}.xlsx`;
      const filename = /\.xlsx$/i.test(this.file.name) ? customName : this.file.name;
      fd.append('file', this.file, filename);
    }

    this.onSubmitEmitter.emit(fd);
  }
}
