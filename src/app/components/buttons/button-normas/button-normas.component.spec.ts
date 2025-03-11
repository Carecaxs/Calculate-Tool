import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonNormasComponent } from './button-normas.component';

describe('ButtonNormasComponent', () => {
  let component: ButtonNormasComponent;
  let fixture: ComponentFixture<ButtonNormasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonNormasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ButtonNormasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
