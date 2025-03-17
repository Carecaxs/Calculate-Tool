import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablaComparacionComponent } from './tabla-resultado-porcetajes-medias.component';

describe('TablaComparacionComponent', () => {
  let component: TablaComparacionComponent;
  let fixture: ComponentFixture<TablaComparacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TablaComparacionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TablaComparacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
