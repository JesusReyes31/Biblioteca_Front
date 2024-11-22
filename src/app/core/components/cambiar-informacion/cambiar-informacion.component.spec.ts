import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CambiarInformacionComponent } from './cambiar-informacion.component';

describe('CambiarInformacionComponent', () => {
  let component: CambiarInformacionComponent;
  let fixture: ComponentFixture<CambiarInformacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CambiarInformacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CambiarInformacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
