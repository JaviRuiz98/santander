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
  @Output() onSubmitEmitter = new EventEmitter<any>();

  registerForm: FormGroup;
  file: File | null = null;
  isDragOver = false;

  private fileControlNames = new Set<string>();

  constructor(private fb: FormBuilder) {
    this.registerForm = this.fb.group({});
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['form']) this.buildFormFromSchema();
  }

  private buildFormFromSchema(): void {
    const group: { [key: string]: FormControl } = {};
    this.fileControlNames.clear();

    for (const row of this.form) {
      for (const item of row) {
        item.fields.forEach((fieldName, i) => {
          const type = item.type?.[i] ?? item.type?.[0];
          if (!fieldName || type === 'header' || type === 'cabecera' || type === 'button' || type === 'submit' || type === 'action') {
            return;
          }

          const validators: ValidatorFn[] = [];
          if (item.validators?.[i]) validators.push(Validators.required);

          if (type === 'file') {
            group[fieldName] = new FormControl<File | null>(null as any, validators);
            this.fileControlNames.add(fieldName);
            return;
          }
          group[fieldName] = new FormControl<string | null>('', validators);
        });
      }
    }

    this.registerForm = this.fb.group(group);
  }

  getGridStyle(row: any[]): { [key: string]: string } {
    const totalColumns = row.reduce((sum, item) => sum + this.getItemSpan(item), 0);
    return { display: 'grid', 'grid-template-columns': `repeat(${totalColumns}, 1fr)`, gap: '1rem' };
  }
  getItemSpan(item: any): number {
    return item.span || item.fields?.length || 1;
  }

  onFileChange(event: Event, fieldName: string) {
    const input = event.target as HTMLInputElement;
    const f = input.files?.[0] ?? null;

    if (f && !/\.(xlsx|xls)$/i.test(f.name)) {
      this.file = null;
      this.registerForm.get(fieldName)?.setValue(null);
      alert('El archivo debe ser .xlsx o .xls');
      input.value = '';
      return;
    }

    this.file = f;
    this.registerForm.get(fieldName)?.setValue(f);
    this.registerForm.get(fieldName)?.updateValueAndValidity();
  }

  onDragOver(evt: DragEvent) {
    evt.preventDefault();
    this.isDragOver = true;
  }
  onDragLeave() {
    this.isDragOver = false;
  }
  onDrop(evt: DragEvent, fieldName: string) {
    evt.preventDefault();
    this.isDragOver = false;

    const f = evt.dataTransfer?.files?.[0] ?? null;
    if (!f) return;

    if (!/\.(xlsx|xls)$/i.test(f.name)) {
      this.file = null;
      this.registerForm.get(fieldName)?.setValue(null);
      alert('El archivo debe ser .xlsx o .xls');
      return;
    }

    this.file = f;
    this.registerForm.get(fieldName)?.setValue(f);
    this.registerForm.get(fieldName)?.updateValueAndValidity();
  }

  clearFile(fieldName: string, input?: HTMLInputElement) {
    this.file = null;
    this.registerForm.get(fieldName)?.setValue(null);
    this.registerForm.get(fieldName)?.updateValueAndValidity();
    if (input) input.value = '';
  }

  private getExpectedColumns(): string[] {
    for (const row of this.form) {
      for (const item of row) {
        const hasFile = item.type?.some(t => t === 'file');
        if (hasFile) {
          const cols = (item.parameters?.[0] as any)?.columns ?? [];
          return cols.map((c: any) => String(c.key)).filter(Boolean);
        }
      }
    }
    return [];
  }

  private norm(v: any): string {
    return String(v ?? '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .trim().toLowerCase();
  }

  private async findHeaderRow(file: File, keys: string[]): Promise<{ rowIndex: number; colIndexByKey: Record<string, number> } | null> {
    const XLSX = await import('xlsx');
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null, raw: true }) as any[][];

    const expected = keys.map(k => this.norm(k));

    for (let r = 0; r < rows.length; r++) {
      const row = rows[r] ?? [];
      const normalizedCells = row.map(c => this.norm(c));
      const hasAll = expected.every(k => normalizedCells.includes(k));
      if (!hasAll) continue;

      const colIndexByKey: Record<string, number> = {};
      for (const k of expected) colIndexByKey[k] = normalizedCells.indexOf(k);

      return { rowIndex: r, colIndexByKey };
    }
    return null;
  }

  private async extractOneRowFromExcel(file: File, keys: string[]): Promise<Record<string, any>> {
    const XLSX = await import('xlsx');
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null, raw: true }) as any[][];

    const headerInfo = await this.findHeaderRow(file, keys);
    if (!headerInfo) throw new Error(`No se encontraron las columnas requeridas: ${keys.join(', ')}`);

    const dataRow = rows[headerInfo.rowIndex + 1] as any[] | undefined;
    if (!dataRow) throw new Error('No se encontró la fila de datos debajo de las cabeceras.');

    const headersNorm = (rows[headerInfo.rowIndex] as any[]).map(c => this.norm(c));
    const out: Record<string, any> = {};
    for (const k of keys) {
      const nk = this.norm(k);
      const idx = headersNorm.indexOf(nk);
      out[k] = idx >= 0 ? dataRow[idx] : null;
    }
    return out;
  }

  private async buildCombinedObject(): Promise<Record<string, any>> {
    const raw = this.registerForm.getRawValue?.() ?? this.registerForm.value;
    const out: Record<string, any> = {};

    const shouldKeep = (v: any) => (
      v !== null && v !== undefined && !(typeof v === 'string' && v.trim() === '')
    );

    Object.entries(raw).forEach(([k, v]) => {
      if (this.fileControlNames?.has?.(k)) return; 
      if (!shouldKeep(v)) return;
      out[k] = typeof v === 'string' ? v.trim() : v;
    });

    if (this.file) {
      const keys = this.getExpectedColumns();
      if (keys.length) {
        try {
          const dataObj = await this.extractOneRowFromExcel(this.file, keys);
          for (const [k, v] of Object.entries(dataObj)) {
            if (shouldKeep(v)) out[k] = v;
          }
        } catch (e: any) {
          console.warn('Excel inválido:', e?.message || e);
        }
      }
    }

    return out;
  }

  async onSubmit() {
    this.registerForm.markAllAsTouched();
    if (this.registerForm.invalid) return;
    const payload = await this.buildCombinedObject();
    this.onSubmitEmitter.emit(payload)
  }
}
