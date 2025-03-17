import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonComponentPorcentajeMedias } from './button-porcentajes-medias.component';

describe('ButtonComponent', () => {
  let component: ButtonComponentPorcentajeMedias;
  let fixture: ComponentFixture<ButtonComponentPorcentajeMedias>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponentPorcentajeMedias],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponentPorcentajeMedias);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
