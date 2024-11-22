import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevolverLibrosComponent } from './devolver-libros.component';

describe('DevolverLibrosComponent', () => {
  let component: DevolverLibrosComponent;
  let fixture: ComponentFixture<DevolverLibrosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DevolverLibrosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DevolverLibrosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
