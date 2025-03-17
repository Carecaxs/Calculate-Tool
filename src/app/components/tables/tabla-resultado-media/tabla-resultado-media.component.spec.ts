import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablaResultadoMediaComponent } from './tabla-resultado-media.component';

describe('TablaResultadoMediaComponent', () => {
  let component: TablaResultadoMediaComponent;
  let fixture: ComponentFixture<TablaResultadoMediaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TablaResultadoMediaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TablaResultadoMediaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
