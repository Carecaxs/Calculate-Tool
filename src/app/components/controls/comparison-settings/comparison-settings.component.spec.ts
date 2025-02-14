import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComparisonSettingsComponent } from './comparison-settings.component';

describe('ComparisonSettingsComponent', () => {
  let component: ComparisonSettingsComponent;
  let fixture: ComponentFixture<ComparisonSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComparisonSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComparisonSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
