import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonMediasComponent } from './button-medias.component';

describe('ButtonMediasComponent', () => {
  let component: ButtonMediasComponent;
  let fixture: ComponentFixture<ButtonMediasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonMediasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ButtonMediasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
