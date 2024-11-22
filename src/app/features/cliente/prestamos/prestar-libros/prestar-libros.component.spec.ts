import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrestarLibrosComponent } from './prestar-libros.component';

describe('PrestarLibrosComponent', () => {
  let component: PrestarLibrosComponent;
  let fixture: ComponentFixture<PrestarLibrosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrestarLibrosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrestarLibrosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
