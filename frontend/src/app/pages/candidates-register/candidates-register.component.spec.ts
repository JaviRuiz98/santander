import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidatesRegisterComponent } from './candidates-register.component';

describe('CandidatesRegisterComponent', () => {
  let component: CandidatesRegisterComponent;
  let fixture: ComponentFixture<CandidatesRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidatesRegisterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CandidatesRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
