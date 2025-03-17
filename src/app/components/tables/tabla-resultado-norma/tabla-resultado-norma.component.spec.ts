import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablaResultadoNormaComponent } from './tabla-resultado-norma.component';

describe('TablaResultadoNormaComponent', () => {
  let component: TablaResultadoNormaComponent;
  let fixture: ComponentFixture<TablaResultadoNormaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TablaResultadoNormaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TablaResultadoNormaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
