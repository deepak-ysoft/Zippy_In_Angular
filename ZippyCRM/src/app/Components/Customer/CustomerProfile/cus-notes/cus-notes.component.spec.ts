import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CusNotesComponent } from './cus-notes.component';

describe('CusNotesComponent', () => {
  let component: CusNotesComponent;
  let fixture: ComponentFixture<CusNotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CusNotesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CusNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
