import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LibrosReservadosComponent } from './libros-reservados.component';

describe('LibrosReservadosComponent', () => {
  let component: LibrosReservadosComponent;
  let fixture: ComponentFixture<LibrosReservadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LibrosReservadosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LibrosReservadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
