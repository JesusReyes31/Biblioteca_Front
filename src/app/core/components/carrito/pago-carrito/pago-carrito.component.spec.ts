import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagoCarritoComponent } from './pago-carrito.component';

describe('PagoCarritoComponent', () => {
  let component: PagoCarritoComponent;
  let fixture: ComponentFixture<PagoCarritoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagoCarritoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PagoCarritoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
