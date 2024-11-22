import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialPrestamoComponent } from './historial-prestamo.component';

describe('HistorialPrestamoComponent', () => {
  let component: HistorialPrestamoComponent;
  let fixture: ComponentFixture<HistorialPrestamoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialPrestamoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistorialPrestamoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
