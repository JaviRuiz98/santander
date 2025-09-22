import { FormSchema } from "../../interface/component/form/form.interface";

export const FORM_CANDIDATE_INPUTS:  FormSchema[][] = [
  [{
    type: ['cabecera'],
    headers: ['Datos del candidato'],
    fields: [''],
    options: [],
    parameters: [],
    validators: []
  }],
  [{
    type: ['text'],
    headers: ['Nombre'],
    fields: ['name'],
    options: [],
    parameters: [],
    validators: [true]
  }],
  [{
    type: ['text'],
    headers: ['Apellidos'],
    fields: ['surname'],
    options: [],
    parameters: [],
    validators: [true]
  }],
  [{
    type: ['file'],
    headers: ['Excel'],
    fields: ['file'],
    options: [],
    parameters: [{
      columns: [
        { key: 'seniority', label: 'Seniority', type: 'enum', allowed: ['junior', 'senior'], required: true },
        { key: 'years', label: 'Años de experiencia', type: 'number', required: true },
        { key: 'availability', label: 'Disponibilidad', type: 'boolean', required: true }
      ]
    }],
    validators: [true]
  }],
  [{
    type: ['button'],
    headers: ['Guardar'],
    fields: ['button'],
    options: [],
    parameters: [],
    validators: []
  }]
];
