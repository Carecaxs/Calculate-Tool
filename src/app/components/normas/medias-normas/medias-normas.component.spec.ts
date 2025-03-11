import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediasNormasComponent } from './medias-normas.component';

describe('MediasNormasComponent', () => {
  let component: MediasNormasComponent;
  let fixture: ComponentFixture<MediasNormasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MediasNormasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MediasNormasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
