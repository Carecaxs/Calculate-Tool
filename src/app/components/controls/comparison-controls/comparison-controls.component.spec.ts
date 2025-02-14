import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComparisonControlsComponent } from './comparison-controls.component';

describe('ComparisonControlsComponent', () => {
  let component: ComparisonControlsComponent;
  let fixture: ComponentFixture<ComparisonControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComparisonControlsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComparisonControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
