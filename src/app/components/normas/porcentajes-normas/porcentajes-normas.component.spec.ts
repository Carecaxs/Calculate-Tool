import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PorcentajesNormasComponent } from './porcentajes-normas.component';

describe('PorcentajesNormasComponent', () => {
  let component: PorcentajesNormasComponent;
  let fixture: ComponentFixture<PorcentajesNormasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PorcentajesNormasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PorcentajesNormasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
