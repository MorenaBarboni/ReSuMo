import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CsvViewerComponent } from './csv-viewer.component';

describe('CsvViewerComponent', () => {
  let component: CsvViewerComponent;
  let fixture: ComponentFixture<CsvViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CsvViewerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CsvViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
