import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CusAppointmentComponent } from './cus-appointment.component';

describe('CusAppointmentComponent', () => {
  let component: CusAppointmentComponent;
  let fixture: ComponentFixture<CusAppointmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CusAppointmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CusAppointmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
