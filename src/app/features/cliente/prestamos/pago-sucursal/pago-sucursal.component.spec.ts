import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagoSucursalComponent } from './pago-sucursal.component';

describe('PagoSucursalComponent', () => {
  let component: PagoSucursalComponent;
  let fixture: ComponentFixture<PagoSucursalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagoSucursalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PagoSucursalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
