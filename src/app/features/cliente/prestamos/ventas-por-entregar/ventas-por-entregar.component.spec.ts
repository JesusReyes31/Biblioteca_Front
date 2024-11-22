import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VentasPorEntregarComponent } from './ventas-por-entregar.component';

describe('VentasPorEntregarComponent', () => {
  let component: VentasPorEntregarComponent;
  let fixture: ComponentFixture<VentasPorEntregarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VentasPorEntregarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VentasPorEntregarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
