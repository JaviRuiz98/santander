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
        headers: ['Name'],
        fields: ['name'],
        options: [],
        parameters: [],
        validators: [true]  
    }],
    [{
        type: ['text'],
        headers: ['Surname'],
        fields: ['surname'],
        options: [],
        parameters: [],
        validators: [true]   
    }],
    [{
      type: ['file'],
      headers: ['Excel (1 fila)'],
      fields: ['file'],
      options: [],
      parameters: [],
      validators: [true]
    }],
    [{
      type: ['button'],
      headers: [''],
      fields: ['button'],
      options: [],
      parameters: [],
      validators: []
    }]
  ];