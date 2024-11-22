import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrestamosGeneralesComponent } from './prestamos-generales.component';

describe('PrestamosGeneralesComponent', () => {
  let component: PrestamosGeneralesComponent;
  let fixture: ComponentFixture<PrestamosGeneralesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrestamosGeneralesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrestamosGeneralesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
